/**
 * El paquete propio (encargo 8.1, b; firmado en la parada 1): lo que pasa
 * entre elegir un JSON en el <input type="file"> y que entre en la lista de
 * paquetes. Sin DOM: la página le pasa el File del input, los paquetes que
 * conoce y el validarPaquete de navegador.ts; el juez, un File de Node.
 *
 * Cuatro comprobaciones, en este orden. La primera que falla corta, y el
 * paquete no entra:
 *   1. El tamaño, antes de leerlo: como mucho 2 MB [PROPIO] (RadiografIA, con
 *      su calibración, pesa 342 KB). Un fichero más grande no se lee.
 *   2. JSON.parse del texto. Si falla, la frase en castellano y, detrás, lo
 *      que dice el navegador, en su idioma y marcado como suyo (firmado).
 *   3. validarPaquete: el esquema con el validador standalone y el paso 2 de
 *      validacion.ts, los mismos que para los incluidos; sus mensajes («regla ·
 *      campo · motivo») van tal cual.
 *   4. El nombre: cabecera.nombre no puede ser el de ningún paquete que la
 *      página conozca, incluido (marcado o no) o propio. El motor también
 *      rechaza dos paquetes con el mismo nombre (encargo 4.3), pero al
 *      analizar y solo entre los que recibe: no vería un incluido desmarcado,
 *      y al volver a marcarlo fallaría el análisis. Su mensaje queda como red
 *      de seguridad (firmado).
 *
 * El texto se lee con File.text(), y el fichero no sale del navegador: nada de
 * esto pide nada a la red.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Blob/text — «The
 *    data is always presumed to be in UTF-8 format»; Baseline, «available
 *    across browsers since April 2021». File hereda de Blob.
 * [DOC] https://encoding.spec.whatwg.org/ — «UTF-8 decode»: «If buffer is
 *    0xEF 0xBB 0xBF, then read three bytes»: un BOM delante no llega a
 *    JSON.parse. Un JSON en otra codificación (latin-1) se lee con caracteres
 *    de sustitución que el esquema no ve: declarado en docs/WEB.md
 *    («Paquetes propios»).
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
 *    — «The accept attribute doesn't validate the types of the selected
 *    files»: por eso JSON.parse y el validador miran siempre.
 */
import type { Paquete, ResultadoDeValidacion } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import { motivoDelFallo } from './fallo.ts';

/** El tamaño máximo de un paquete propio, en MB de 1.024 × 1.024 bytes [PROPIO, firmado en la parada 1]. */
export const LIMITE_EN_MB = 2;
export const LIMITE_EN_BYTES = LIMITE_EN_MB * 1024 * 1024;

/** Lo que el cargador lee de un File: su nombre, su tamaño y su texto. */
export type Fichero = Pick<File, 'name' | 'size' | 'text'>;

/** Por qué no entró: una frase y, si hace falta, la lista de lo que falla. */
export interface ProblemaDePropio {
  titulo: string;
  mensajes: string[];
}

export type LecturaDePropio = { paquete: Paquete; problema: null } | { paquete: null; problema: ProblemaDePropio };

const unDecimal = new Intl.NumberFormat('es', { maximumFractionDigits: 1 });

/** Los bytes en MB con un decimal, redondeados hacia arriba: un byte de más ya no dice «2 MB». */
function megas(bytes: number): string {
  return unDecimal.format(Math.ceil((bytes / 1024 / 1024) * 10) / 10);
}

const rechazo = (titulo: string, mensajes: string[] = []): LecturaDePropio => ({ paquete: null, problema: { titulo, mensajes } });

export async function leerPaquetePropio(
  fichero: Fichero,
  incluidos: readonly Paquete[],
  propios: readonly Paquete[],
  validar: (dato: unknown) => ResultadoDeValidacion,
): Promise<LecturaDePropio> {
  if (fichero.size > LIMITE_EN_BYTES) return rechazo(textos.noSeCargaPorTamano(fichero.name, megas(fichero.size), unDecimal.format(LIMITE_EN_MB)));
  let dato: unknown;
  try {
    dato = JSON.parse(await fichero.text());
  } catch (fallo) {
    return rechazo(textos.noSeCargaPorJson(fichero.name), [textos.elNavegadorDice(motivoDelFallo(fallo))]);
  }
  const { valido, errores } = validar(dato);
  if (!valido) return rechazo(textos.noSeCargaPorEsquema(fichero.name), errores.map((e) => e.texto));
  const paquete = dato as Paquete;
  const nombre = paquete.cabecera.nombre;
  if (incluidos.some((p) => p.cabecera.nombre === nombre)) return rechazo(textos.noSeCargaPorNombreDeIncluido(fichero.name, nombre));
  if (propios.some((p) => p.cabecera.nombre === nombre)) return rechazo(textos.noSeCargaPorNombre(fichero.name, nombre));
  return { paquete, problema: null };
}

/** Los paquetes con que se analiza, en este orden: los incluidos marcados, en el suyo (FICHEROS, cargar.ts), y después los propios, en el de carga. */
export function activos(incluidos: readonly Paquete[], marcados: ReadonlySet<string>, propios: readonly Paquete[]): Paquete[] {
  return [...incluidos.filter((p) => marcados.has(p.cabecera.nombre)), ...propios];
}
