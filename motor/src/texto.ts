/**
 * El texto segmentado sobre el que trabajan todos los detectores (encargo 4.1):
 * párrafos, frases y palabras, con desplazamientos [inicio, fin) EXACTOS sobre
 * el texto original tal como llega, y cada párrafo marcado prosa / no-prosa.
 *
 * [DOC] Intl.Segmenter — https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter:
 *    «locale-sensitive text segmentation», Baseline 2024 (navegadores) y
 *    nativo en Node. `granularity: "sentence"` para frases y `"word"` para
 *    palabras; cada segmento trae `segment`, `index` («the code unit index in
 *    the original string») e `isWordLike` (solo en "word"). Locale "es". Sin
 *    librería. El juez de texto.spec.ts comprueba que este Node soporta "es".
 *
 * [PROPIO] Sin normalizar la cadena: todos los desplazamientos son sobre el
 *    original. El segmentador trabaja sobre una copia en la que «\r» se cambia
 *    por un espacio —misma longitud, así que los índices valen igual—: un
 *    «\r\n» pegado de Windows no crea frases ni palabras de más.
 * [PROPIO] Párrafo = cada línea no vacía, sin los espacios de sus bordes: un
 *    textarea pega un solo salto entre párrafos. Las líneas vacías no son
 *    párrafo.
 * [PROPIO] No-prosa (no cuenta para el umbral de longitud ni la miran los
 *    detectores). Una línea es no-prosa si, por este orden:
 *      · es una valla de código (empieza por ``` o por ~~~) o está entre una
 *        valla y la siguiente DEL MISMO TIPO → «código»;
 *      · es un encabezado Markdown: 1 a 6 «#» y un espacio (o nada más) → «encabezado»;
 *      · empieza por viñeta: «-», «+», «*», «•», o un número de 1 a 9 cifras con
 *        «.» o «)», SEGUIDOS de un espacio o tabulador → «viñeta»;
 *      · contiene dos o más «|» → «tabla».
 *    Las marcas son las del encargo 4.1 y, tras su parada intermedia, «+» y
 *    «~~~». De CommonMark 0.31.2 ([DOC] https://spec.commonmark.org/0.31.2/):
 *      § 5.2 «A bullet list marker is a -, +, or * character»; un marcador
 *        ordenado son 1–9 cifras seguidas de «.» o «)»; y «at least one space
 *        or tab is needed between the list marker and any following content»;
 *      § 4.2, los «#» «must be followed by spaces or tabs, or by the end of line»;
 *      § 4.5, «A code fence is a sequence of at least three consecutive
 *        backtick characters (`) or tildes (~)», y la valla de cierre tiene que
 *        ser del mismo carácter que la de apertura.
 *    «•» no es de CommonMark: es del encargo (viñeta pegada de un procesador de
 *    textos). [PROPIO] No se exige que la valla de cierre sea al menos tan
 *    larga como la de apertura (CommonMark sí): basta con el mismo carácter.
 *    Así «1.000 personas», «*Nota*:» o «#etiqueta» siguen siendo prosa.
 * [PROPIO] Frases y palabras se sacan de TODOS los párrafos (también de los de
 *    no-prosa); quien los use decide si mira `prosa`.
 * [PROPIO] Encargo 5.1: `seMira` dice qué párrafos recorre un detector de
 *    patrón o estructural. La prosa siempre; con `sobreNoProsa`, también las
 *    viñetas, los encabezados y las tablas; el código nunca (ahí «**» y «#» son
 *    código). El conteo de palabras no pasa por aquí: sigue siendo de prosa.
 */

export type Motivo = 'código' | 'encabezado' | 'viñeta' | 'tabla';

export interface Palabra {
  texto: string;
  inicio: number;
  fin: number;
}

export interface Frase {
  texto: string;
  inicio: number;
  fin: number;
  palabras: Palabra[];
}

export interface Parrafo {
  texto: string;
  inicio: number;
  fin: number;
  prosa: boolean;
  /** Por qué no es prosa; `null` si lo es. */
  motivo: Motivo | null;
  frases: Frase[];
}

export interface Texto {
  original: string;
  parrafos: Parrafo[];
}

const FRASES = new Intl.Segmenter('es', { granularity: 'sentence' });
const PALABRAS = new Intl.Segmenter('es', { granularity: 'word' });

const esEspacio = (c: string | undefined): boolean => c !== undefined && /\s/.test(c);

/** [inicio, fin) de `trabajo` sin los espacios de los bordes. */
function recortar(trabajo: string, inicio: number, fin: number): [number, number] {
  while (inicio < fin && esEspacio(trabajo[inicio])) inicio++;
  while (fin > inicio && esEspacio(trabajo[fin - 1])) fin--;
  return [inicio, fin];
}

type Valla = '```' | '~~~';

/** La valla de código con la que empieza la línea, si empieza por una. */
function vallaDe(linea: string): Valla | null {
  if (linea.startsWith('```')) return '```';
  if (linea.startsWith('~~~')) return '~~~';
  return null;
}

function motivoDeLinea(linea: string, abierta: Valla | null): Motivo | null {
  if (abierta !== null || vallaDe(linea) !== null) return 'código';
  if (/^#{1,6}(?:[ \t]|$)/.test(linea)) return 'encabezado';
  if (/^(?:[-+*•]|\d{1,9}[.)])[ \t]/.test(linea)) return 'viñeta';
  if ((linea.match(/\|/g)?.length ?? 0) >= 2) return 'tabla';
  return null;
}

function palabrasDe(original: string, trabajo: string, inicio: number, fin: number): Palabra[] {
  const salida: Palabra[] = [];
  for (const { segment, index, isWordLike } of PALABRAS.segment(trabajo.slice(inicio, fin))) {
    if (!isWordLike) continue;
    const a = inicio + index;
    salida.push({ texto: original.slice(a, a + segment.length), inicio: a, fin: a + segment.length });
  }
  return salida;
}

function frasesDe(original: string, trabajo: string, inicio: number, fin: number): Frase[] {
  const salida: Frase[] = [];
  for (const { segment, index } of FRASES.segment(trabajo.slice(inicio, fin))) {
    const [a, b] = recortar(trabajo, inicio + index, inicio + index + segment.length);
    if (a === b) continue;
    salida.push({ texto: original.slice(a, b), inicio: a, fin: b, palabras: palabrasDe(original, trabajo, a, b) });
  }
  return salida;
}

/** Si un detector recorre este párrafo: la prosa siempre; con sobreNoProsa, también viñetas, encabezados y tablas; el código nunca. */
export function seMira(parrafo: Parrafo, sobreNoProsa: boolean): boolean {
  if (parrafo.prosa) return true;
  return sobreNoProsa && parrafo.motivo !== 'código';
}

export function analizarTexto(original: string): Texto {
  const trabajo = original.replaceAll('\r', ' ');
  const parrafos: Parrafo[] = [];
  let abierta: Valla | null = null;
  let desde = 0;
  while (desde <= trabajo.length) {
    const salto = trabajo.indexOf('\n', desde);
    const hasta = salto < 0 ? trabajo.length : salto;
    const [inicio, fin] = recortar(trabajo, desde, hasta);
    if (inicio < fin) {
      const linea = trabajo.slice(inicio, fin);
      const motivo = motivoDeLinea(linea, abierta);
      const valla = vallaDe(linea);
      if (abierta === null && valla !== null) abierta = valla;
      else if (abierta !== null && valla === abierta) abierta = null;
      parrafos.push({
        texto: original.slice(inicio, fin),
        inicio,
        fin,
        prosa: motivo === null,
        motivo,
        frases: frasesDe(original, trabajo, inicio, fin),
      });
    }
    if (salto < 0) break;
    desde = salto + 1;
  }
  return { original, parrafos };
}
