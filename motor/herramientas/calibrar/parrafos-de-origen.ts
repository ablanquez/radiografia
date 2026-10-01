/**
 * Los párrafos del ORIGINAL de un documento (encargo 6.1, parada 1, punto 3):
 * el juez de los textos regenerados (parrafos-de-origen.spec.ts) los compara
 * con los párrafos de prosa que da el motor, para ver que la regeneración
 * (regenerar-textos.ts, html.ts) separa los párrafos donde el original.
 *
 *   · pNoVacios — lo que pidió Antonio: los <p> con texto (fuera los vacíos;
 *     los encabezados no son <p>, y van aparte).
 *   · declarados — [PROPIO, a firmar en la parada 2 del 6.1] lo que de verdad
 *     es un párrafo de PROSA para el motor en el BOE, que no siempre es un <p>:
 *       · el texto que va detrás de cada <p>, <dt> o <dd> de apertura, hasta
 *         la siguiente etiqueta de bloque (los formularios de los anuncios son
 *         <dl>, casi sin <p>; un <dd> que abre otra <dl> no tiene texto propio);
 *       · fuera de las tablas: sus <p> salen como filas «| … |», y el motor
 *         las marca como tabla;
 *       · sin los que empiezan por una marca de lista («1. », «- »…): el motor
 *         los hace viñeta (texto.ts, CommonMark § 5.2).
 *   · encabezados — el texto de los <h1>-<h6>, que el juez saca de los dos
 *     lados (también lo pidió Antonio).
 *
 * `hasta`: deja de contar en el primer párrafo que empieza por ese texto (el
 * final que recortarFinal quita de un capítulo, epub.ts).
 */
import { decodificar } from './html.ts';

const BLOQUE = /(<\/?(?:p|div|h[1-6]|dl|dt|dd|ul|ol|li|table|thead|tbody|tfoot|tr|td|th|blockquote|pre|center)\b[^>]*>)/i;
/** La marca de viñeta de texto.ts (marcaDe): «-», «+», «*», «•» o 1-9 cifras con «.» o «)», y un espacio o tabulador. */
const MARCA = /^(?:[-+*•]|\d{1,9}[.)])[ \t]/;
const plano = (html: string) => decodificar(html.replace(/<[^>]*>/g, ' ')).texto.replace(/\s+/g, ' ').trim();

export interface ParrafosDeOrigen {
  pNoVacios: number;
  declarados: number;
  encabezados: string[];
}

export function parrafosDeOrigen(fragmento: string, hasta?: string): ParrafosDeOrigen {
  let corte = fragmento;
  if (hasta !== undefined) {
    const trozos = fragmento.split(BLOQUE);
    const i = trozos.findIndex((t, k) => k > 0 && BLOQUE.test(trozos[k - 1]!) && plano(t).startsWith(hasta));
    if (i < 0) throw new Error(`parrafosDeOrigen: no está el final «${hasta}»`);
    corte = trozos.slice(0, i - 1).join('');
  }
  const pNoVacios = [...corte.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].filter((m) => plano(m[1]!) !== '').length;
  const trozos = corte.replace(/<table\b[\s\S]*?<\/table>/gi, ' ').split(BLOQUE);
  let declarados = 0;
  trozos.forEach((t, i) => {
    if (!/^<(?:p|dt|dd)\b/i.test(t)) return;
    const texto = plano(trozos[i + 1] ?? '');
    if (texto !== '' && !MARCA.test(texto)) declarados++;
  });
  const encabezados = [...corte.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => plano(m[2]!)).filter((t) => t !== '');
  return { pNoVacios, declarados, encabezados };
}
