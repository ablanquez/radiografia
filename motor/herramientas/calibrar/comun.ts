/**
 * Lo común de la herramienta de calibración (encargo 5.5; plan, punto 5): la
 * semilla, el reparto calibración/validación, el orden de muestra, la huella
 * de un texto, la longitud de un documento y el control de que un manifiesto
 * no lleva texto. Sin red: lo juzga comun.spec.ts.
 *
 * [PROPIO, parada 1 del 5.5] Reparto y muestra SIN generador de números
 *    aleatorios: cada documento recibe un número en [0, 1) que sale de su id y
 *    de la semilla,
 *      u(id) = los 13 primeros dígitos hexadecimales de sha256("<semilla>|<id>") / 16¹³
 *    (13 dígitos = 52 bits: un double los guarda exactos). Con u < 0,8 va a
 *    calibración; si no, a validación (el FPR del 5.6 se mide con esos). El
 *    orden de muestra es el de sha256("<semilla>|muestra|<id>"). Así el
 *    reparto es reproducible, no depende del orden en que se lean los
 *    documentos, y añadir uno no mueve a los demás.
 * [DOC] https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options —
 *    createHash('sha256'); `digest('hex')`.
 */
import { createHash } from 'node:crypto';
import { analizarTexto } from '../../src/texto.ts';
import { evaluarLongitud, tramoDeCalibracion } from '../../src/umbral.ts';
import type { TramoDeCalibracion } from '../../src/paquete.ts';

/** La semilla de la calibración del 5.5, fija; va escrita en cada fichero que sale de ella. */
export const SEMILLA = 'radiografia-calibracion-2026';

/** Qué parte va a calibración; el resto, a validación. */
export const PROPORCION_CALIBRACION = 0.8;

export type Reparto = 'calibracion' | 'validacion';

export const TRAMOS: readonly TramoDeCalibracion[] = ['100-299', '300-599', '600+'];

/** sha256 del texto en UTF-8, en hexadecimal (64 caracteres). */
export function huella(texto: string): string {
  return createHash('sha256').update(texto, 'utf8').digest('hex');
}

/** Un número en [0, 1) que depende solo de la semilla y del id. */
export function uniforme(semilla: string, id: string): number {
  return Number.parseInt(huella(`${semilla}|${id}`).slice(0, 13), 16) / 2 ** 52;
}

export function reparto(semilla: string, id: string): Reparto {
  return uniforme(semilla, id) < PROPORCION_CALIBRACION ? 'calibracion' : 'validacion';
}

/** Los elementos en el orden de sha256("<semilla>|muestra|<id>"): tomar los K primeros es una muestra reproducible. */
export function ordenDeMuestra<T>(semilla: string, elementos: readonly T[], id: (e: T) => string): T[] {
  return elementos
    .map((e) => ({ e, clave: huella(`${semilla}|muestra|${id(e)}`), id: id(e) }))
    .sort((a, b) => (a.clave < b.clave ? -1 : a.clave > b.clave ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(({ e }) => e);
}

/** Palabras de prosa y tramo de calibración, con el segmentador y el umbral del motor (los de un texto de usuario). */
export function medirLongitud(texto: string): { palabrasProsa: number; tramo: TramoDeCalibracion | null } {
  const { palabrasProsa } = evaluarLongitud(analizarTexto(texto));
  return { palabrasProsa, tramo: tramoDeCalibracion(palabrasProsa) };
}

/**
 * Los fragmentos de texto de los documentos que aparecen en algún campo de
 * texto del objeto (un manifiesto). [PROPIO] Se mira el principio de cada
 * párrafo de `largo` caracteres o más (por defecto 50): una firma o una fecha
 * cortas pueden coincidir con un metadato sin que eso sea guardar texto.
 * Devuelve la lista de fragmentos encontrados; vacía si no hay ninguno.
 */
export function comprobarSinTexto(objeto: unknown, textos: readonly string[], largo = 50): string[] {
  const cadenas: string[] = [];
  const recorrer = (v: unknown): void => {
    if (typeof v === 'string') cadenas.push(v);
    else if (Array.isArray(v)) v.forEach(recorrer);
    else if (v !== null && typeof v === 'object') Object.values(v).forEach(recorrer);
  };
  recorrer(objeto);
  // Solo una cadena de `largo` caracteres o más puede contener un trozo de `largo`.
  const largas = cadenas.filter((c) => c.length >= largo);
  const encontrados: string[] = [];
  if (largas.length === 0) return encontrados;
  for (const texto of textos) {
    for (const parrafo of texto.split('\n')) {
      const limpio = parrafo.trim();
      if (limpio.length < largo) continue;
      const trozo = limpio.slice(0, largo);
      if (largas.some((c) => c.includes(trozo))) encontrados.push(trozo);
    }
  }
  return encontrados;
}
