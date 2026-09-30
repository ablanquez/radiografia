/**
 * El corpus de «academico» (encargo 5.5): el CSIC Spanish Corpus
 * (https://zenodo.org/records/7313126), un fichero de texto de 929 MB con un
 * documento por línea, leído por rangos de bytes sin bajarlo entero. Sin red:
 * lo juzga csic.spec.ts.
 *
 * [DOC] README del registro: «Documents are separated by single new lines».
 * [DOC] RFC 9110 § 14 (https://www.rfc-editor.org/rfc/rfc9110#section-14):
 *    una petición con «Range: bytes=a-b» a un recurso que anuncia
 *    «Accept-Ranges: bytes» se responde con 206 y «Content-Range: bytes
 *    a-b/total».
 * [PROPIO, decisión de Antonio a la parada de narrativa] De cada trozo, solo
 *    las LÍNEAS COMPLETAS entre su primer y su último salto de línea; los
 *    trozos empiezan en bytes elegidos por huella.
 * [PROPIO, parada 1 del 5.5] Los tramos cortos salen de fragmentos: frases
 *    completas seguidas de un documento, marcadas «fragmento»; un documento da
 *    una sola unidad, a un solo tramo.
 */
import { analizarTexto } from '../../src/texto.ts';
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { medirLongitud, uniforme } from './comun.ts';

const SALTO = 0x0a;

/** Dónde empieza el trozo i: por huella, uniforme en [0, total − tamaño]. */
export function inicioDelTrozo(semilla: string, i: number, total: number, tamano: number): number {
  return Math.floor(uniforme(semilla, `trozo|${i}`) * (total - tamano + 1));
}

/**
 * Las unidades completas de un trozo que empieza en el byte `desde` de un
 * fichero de `total` bytes: las que van entre su primer y su último
 * separador («\n»: líneas; «\n\n»: documentos separados por una línea en
 * blanco). Si el trozo empieza en el byte 0, la primera está completa; si
 * acaba al final del fichero, la última. Cada una con el byte donde empieza
 * (su id) y su texto, sin saltos de línea a los lados: se decodifica unidad a
 * unidad, que en UTF-8 es seguro (el byte 0x0A nunca va dentro de un carácter
 * de varios bytes). Sin las vacías.
 */
export function unidadesCompletas(trozo: Buffer, desde: number, total: number, separador: '\n' | '\n\n'): { byte: number; texto: string }[] {
  const sep = Buffer.from(separador);
  const primero = trozo.indexOf(sep);
  const ultimo = trozo.lastIndexOf(sep);
  const a = desde === 0 ? 0 : primero < 0 ? -1 : primero + sep.length;
  const b = desde + trozo.length >= total ? trozo.length : ultimo;
  if (a < 0 || b <= a) return [];
  const unidades: { byte: number; texto: string }[] = [];
  let i = a;
  while (i < b) {
    const j = trozo.indexOf(sep, i);
    const fin = j < 0 || j > b ? b : j;
    let inicio = i;
    while (inicio < fin && trozo[inicio] === SALTO) inicio++;
    const texto = trozo.subarray(inicio, fin).toString('utf8').replace(/\r/g, '').replace(/\n+$/, '');
    if (texto.trim() !== '') unidades.push({ byte: desde + inicio, texto });
    i = fin + sep.length;
  }
  return unidades;
}

const LIMITES: Record<'100-299' | '300-599', [number, number]> = { '100-299': [100, 299], '300-599': [300, 599] };

/**
 * Un fragmento de un documento para un tramo corto: frases completas
 * seguidas, las del segmentador del motor. El largo buscado, elegido por
 * huella dentro del tramo; la primera frase, por huella entre las que dejan
 * detrás palabras suficientes. Se toman frases hasta llegar al largo; si la
 * última saca el fragmento del tramo, se quita. null si no cabe.
 */
export function fragmento(texto: string, id: string, tramo: '100-299' | '300-599', semilla: string): { texto: string; palabrasProsa: number } | null {
  const frases = analizarTexto(texto).parrafos.filter((p) => p.prosa).flatMap((p) => p.frases);
  const [minimo, maximo] = LIMITES[tramo];
  const objetivo = minimo + Math.floor(uniforme(semilla, `${id}|largo`) * (maximo - minimo + 1));
  // Palabras que quedan desde cada frase hasta el final.
  const quedan: number[] = [];
  for (let k = frases.length - 1, suma = 0; k >= 0; k--) quedan[k] = suma += frases[k]!.palabras.length;
  const inicios = frases.map((_, k) => k).filter((k) => quedan[k]! >= objetivo);
  if (inicios.length === 0) return null;
  const desde = inicios[Math.floor(uniforme(semilla, `${id}|inicio`) * inicios.length)]!;
  let hasta = desde;
  for (let suma = frases[desde]!.palabras.length; suma < objetivo; ) suma += frases[++hasta]!.palabras.length;
  for (; hasta >= desde; hasta--) {
    const trozo = texto.slice(frases[desde]!.inicio, frases[hasta]!.fin);
    const { palabrasProsa, tramo: t } = medirLongitud(trozo);
    if (t === tramo) return { texto: trozo, palabrasProsa };
    if (palabrasProsa < minimo) return null;
  }
  return null;
}

/**
 * [PROPIO, hallazgo del 30/09/2026] Una señal de OCR: palabras (lo que va
 * entre espacios con alguna letra) con un símbolo pegado a una letra («ora•»)
 * o una cifra entre letras («informaci6n», «c1usters»), por 1.000 palabras.
 * Es un mínimo: «rn» por «m» o «fi» por «ñ» no se ven. Se mide, no filtra.
 */
const SIMBOLO = /\p{L}[•■♦¬¤]|[•■♦¬¤]\p{L}|\p{L}\d+\p{L}/u;
export function ocrPorMil(texto: string): number {
  const palabras = texto.split(/\s+/).filter((p) => /\p{L}/u.test(p));
  return palabras.length === 0 ? 0 : (1000 * palabras.filter((p) => SIMBOLO.test(p)).length) / palabras.length;
}

/**
 * [PROPIO] Por turnos: un documento de 600+ va al tramo que menos unidades de
 * calibración lleva de los que aún no llegan a su mínimo (a igualdad, el más
 * largo); uno más corto, a su propio tramo, entero. null: ninguno lo necesita.
 */
export function tramoPorTurno(natural: TramoDeCalibracion, cuenta: Readonly<Record<TramoDeCalibracion, number>>, minimo: number): TramoDeCalibracion | null {
  if (natural !== '600+') return cuenta[natural] < minimo ? natural : null;
  const faltan = (['600+', '300-599', '100-299'] as const).filter((t) => cuenta[t] < minimo);
  if (faltan.length === 0) return null;
  return faltan.reduce((mejor, t) => (cuenta[t] < cuenta[mejor] ? t : mejor));
}
