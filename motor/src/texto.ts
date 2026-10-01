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
 *    original. El segmentador trabaja sobre una copia en la que «\r» y «\n»
 *    se cambian por un espacio —misma longitud, así que los índices valen
 *    igual—: un «\r\n» pegado de Windows no crea frases ni palabras de más, y
 *    un salto dentro de un párrafo se segmenta como espacio. Medido (Node
 *    24.19.0, encargo 6.1): Intl.Segmenter parte la frase en cada «\n»
 *    («Esta frase sigue\nen la otra línea.» da dos frases); sin la copia,
 *    cada línea de un texto cortado a mano sería una frase.
 *
 * Párrafos según CommonMark (encargo 6.1, firmado el 01/10; sustituye el
 * [PROPIO] del 4.1 «párrafo = cada línea no vacía»):
 *    [DOC] CommonMark 0.31.2, https://spec.commonmark.org/0.31.2/:
 *      § 4.8 Paragraphs: «A sequence of non-blank lines that cannot be
 *        interpreted as other kinds of blocks forms a paragraph. […] The
 *        paragraph's raw content is formed by concatenating the lines and
 *        removing initial and final spaces or tabs.»
 *      § 6.8 Soft line breaks: «A regular line ending (not in a code span or
 *        HTML tag) that is not preceded by two or more spaces or a backslash
 *        is parsed as a softbreak», que se pinta «either as a line ending or
 *        as a space». Aquí, espacio.
 *      § 5.2 List items, regla 5 (Laziness): las líneas sin sangría que
 *        serían continuación de párrafo siguen dentro del ítem («lazy
 *        continuation lines»). Y la excepción 1 de la regla 1: cuando una
 *        lista interrumpe un párrafo, «the lines Ls must not begin with a
 *        blank line, and (b) if the list item is ordered, the start number
 *        must be 1».
 *    [DOC] RFC 3676 (R. Gellens, 2004), https://www.rfc-editor.org/rfc/rfc3676:
 *      § 3.2, el «embarrassing line wrap» del correo cortado a mano; § 4.1,
 *      «A series of one or more flowed lines followed by one fixed line is
 *      considered a paragraph». Allí una línea «flowed» es la que acaba en
 *      espacio; el texto pegado no trae esa marca. Se cita como respaldo de
 *      la idea (unir las líneas en el párrafo lógico), no de la regla exacta
 *      (parada 1 del 6.1): aquí todo salto simple es espacio, salvo la
 *      excepción web.
 *    Así:
 *      · un párrafo es un tramo [inicio, fin) del ORIGINAL, de la primera a la
 *        última de sus líneas (sin los espacios de los bordes), con los
 *        saltos dentro; acaba en una línea en blanco o en la que empieza otro
 *        bloque. Las líneas en blanco no son párrafo;
 *      · encabezado, valla, línea de código y fila de tabla: cada uno es su
 *        propio bloque de una línea, como en el 4.1. También la regla
 *        horizontal («---», «***», «___»): § 4.1 Thematic breaks, «Thematic
 *        breaks can interrupt a paragraph»; queda con la clase que le daba el
 *        4.1 (prosa sin palabras, o viñeta si es «* * *» o «- - -»);
 *      · viñeta: la línea con marca empieza un ítem (no-prosa), y las
 *        siguientes sin marca ni línea en blanco son continuación del ítem.
 *        Una línea SANGRADA (empieza por espacio o tabulador) sigue en el
 *        ítem siempre, también tras un signo de cierre (§ 5.2, regla 1: las
 *        líneas siguientes del ítem van sangradas; parada 1 del 6.1);
 *      · una marca ordenada que no es 1 no corta un párrafo de prosa (§ 5.2,
 *        excepción 1): «…en el año\n2010. Después…» sigue siendo un párrafo.
 *        Detrás de un ítem, cualquier marca empieza otro ítem.
 * [PROPIO, firmada el 01/10] La excepción web: el texto copiado de una web
 *    trae UN solo salto entre párrafos. Un salto tras un signo de cierre de
 *    frase (. ! ? … » " ”) seguido de una línea que empieza por mayúscula,
 *    «¿», «¡», «—», «« » o comilla (" “ ‘ ') es párrafo nuevo; también detrás
 *    de un ítem de viñeta si la línea no va sangrada (firmado en la parada 1
 *    del 6.1, como la regla del 1, la regla horizontal y las comillas). Los
 *    demás saltos simples son espacio. Coste
 *    conocido: en un texto cortado a mano, una línea que acaba justo en punto
 *    parte el párrafo. Eso no cambia las frases, pero sí qué párrafo es el
 *    último o el primero para las reglas de posición.
 * [PROPIO] No-prosa (no cuenta para el umbral de longitud ni la miran los
 *    detectores). Un bloque es no-prosa si su primera línea, por este orden:
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

/** Regla horizontal (CommonMark § 4.1): tres o más «-», «_» o «*» iguales, con espacios o tabuladores entre ellos. */
const esReglaHorizontal = (linea: string): boolean => /^(?:(?:-[ \t]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})$/.test(linea);

/** El bloque de una sola línea que es la línea (fuera de una valla abierta), si lo es. */
function bloqueDeUnaLinea(linea: string): 'encabezado' | 'tabla' | null {
  if (/^#{1,6}(?:[ \t]|$)/.test(linea)) return 'encabezado';
  if ((linea.match(/\|/g)?.length ?? 0) >= 2) return 'tabla';
  return null;
}

/** La marca de viñeta con la que empieza la línea; `ordenada` con su número. */
function marcaDe(linea: string): { ordenada: boolean; numero: number } | null {
  const m = /^(?:([-+*•])|(\d{1,9})[.)])[ \t]/.exec(linea);
  if (m === null) return null;
  return m[1] !== undefined ? { ordenada: false, numero: 0 } : { ordenada: true, numero: Number(m[2]) };
}

const CIERRES = new Set(['.', '!', '?', '…', '»', '"', '”']);
const APERTURAS = new Set(['¿', '¡', '—', '«', '"', '“', '‘', "'"]);

/** La excepción web: la línea anterior acaba en signo de cierre y la siguiente empieza por mayúscula o por signo de apertura. */
function esSaltoDeParrafo(anterior: string, linea: string): boolean {
  return CIERRES.has(anterior.at(-1) ?? '') && (APERTURAS.has(linea[0] ?? '') || /^\p{Lu}/u.test(linea));
}

/** El bloque que sigue abierto mientras lleguen líneas de continuación: un párrafo de prosa o un ítem de viñeta. */
interface Abierto {
  inicio: number;
  fin: number;
  motivo: 'viñeta' | null;
  /** La última línea, recortada: la excepción web mira su último carácter. */
  ultima: string;
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
  const trabajo = original.replace(/[\r\n]/g, ' ');
  const parrafos: Parrafo[] = [];
  const bloque = (inicio: number, fin: number, motivo: Motivo | null): null => {
    parrafos.push({ texto: original.slice(inicio, fin), inicio, fin, prosa: motivo === null, motivo, frases: frasesDe(original, trabajo, inicio, fin) });
    return null;
  };
  const cerrar = (a: Abierto | null): null => (a === null ? null : bloque(a.inicio, a.fin, a.motivo));
  let abierto: Abierto | null = null;
  let valla: Valla | null = null;
  let desde = 0;
  while (desde <= original.length) {
    const salto = original.indexOf('\n', desde);
    const hasta = salto < 0 ? original.length : salto;
    const [inicio, fin] = recortar(trabajo, desde, hasta);
    const linea = trabajo.slice(inicio, fin);
    if (linea === '') {
      abierto = cerrar(abierto);
    } else if (valla !== null) {
      bloque(inicio, fin, 'código');
      if (vallaDe(linea) === valla) valla = null;
    } else if (vallaDe(linea) !== null) {
      abierto = cerrar(abierto);
      valla = vallaDe(linea);
      bloque(inicio, fin, 'código');
    } else if (esReglaHorizontal(linea)) {
      abierto = cerrar(abierto);
      bloque(inicio, fin, marcaDe(linea) !== null ? 'viñeta' : null);
    } else if (bloqueDeUnaLinea(linea) !== null) {
      abierto = cerrar(abierto);
      bloque(inicio, fin, bloqueDeUnaLinea(linea));
    } else {
      const marca = marcaDe(linea);
      const empiezaItem = marca !== null && (abierto === null || abierto.motivo === 'viñeta' || !marca.ordenada || marca.numero === 1);
      if (empiezaItem) {
        abierto = cerrar(abierto);
        abierto = { inicio, fin, motivo: 'viñeta', ultima: linea };
      } else if (abierto !== null && ((abierto.motivo === 'viñeta' && /^[ \t]/.test(original.slice(desde, hasta))) || !esSaltoDeParrafo(abierto.ultima, linea))) {
        abierto.fin = fin;
        abierto.ultima = linea;
      } else {
        abierto = cerrar(abierto);
        abierto = { inicio, fin, motivo: null, ultima: linea };
      }
    }
    if (salto < 0) break;
    desde = salto + 1;
  }
  cerrar(abierto);
  return { original, parrafos };
}
