/**
 * Los capítulos de un EPUB de Project Gutenberg (encargo 5.5, género
 * «narrativa-clasica»): documento = capítulo. Sin red; lo juzga epub.spec.ts.
 *
 * [DOC] OPF 2.0.1 (https://idpf.org/epub/20/spec/OPF_2.0.1_draft.htm), § 2.4:
 *    «there must be one and only one spine element»; «The spine element must
 *    include the toc attribute, whose value is the the id attribute value of
 *    the required NCX document declared in manifest»; «The order of the
 *    itemref elements organizes the associated OPS Content Documents into the
 *    linear reading order of the publication». § 2.4.1.2: «navMap is a
 *    required element in the NCX; it provides navigational access to the
 *    major hierarchical structure of the publication». El OPF se encuentra
 *    por META-INF/container.xml (`<rootfile full-path>`).
 * [PROPIO, estructura observada en pg12457, Ebookmaker 0.14.4] El HTML va
 *    troceado por tamaño, no por capítulo; cada capítulo empieza en el
 *    elemento con el id al que apunta su navPoint (`fichero#id`); la cabecera
 *    de Gutenberg es `#pg-header` (hasta `#pg-start-separator`) y el pie,
 *    `#pg-footer`; las llamadas a nota son `a.fnanchor` y los números de
 *    página, `span.pagenum`.
 *
 * Capítulo [PROPIO]: lo que va de una entrada del índice a la siguiente, en el
 *    orden de lectura (entradas anidadas incluidas), cortado en el pie de
 *    Gutenberg; del HTML de cada fichero solo cuenta su `<body>`. Sin sus
 *    títulos (h1-h6), sin llamadas a nota y sin números de página; el resto
 *    pasa por html.ts. Fuera, con su motivo: los paratextos (esParatexto) y la
 *    licencia de Gutenberg.
 */
import { lineasDeHtml, limpiarHtml, textoPlano } from './html.ts';

export interface Capitulo {
  /** Su posición en el índice (1, 2, …), contadas también las entradas que quedan fuera. */
  orden: number;
  etiqueta: string;
  texto: string;
  problemas: string[];
}

export interface CapitulosDeEpub {
  capitulos: Capitulo[];
  fuera: { orden: number; etiqueta: string; motivo: string }[];
}

const PARATEXTO =
  /^\s*(pr[oó]logo|prefacio|pr[eé]face|preface|dedicatoria|introducci[oó]n|introduction|advertencia|aclaraci[oó]n|al lector|nota|notas|notes|footnotes|[ií]ndice|index|contents|contenido|sumario|glosario|vocabulario|vocabulary|abbreviations|exercises|ejercicios|erratas|fe de erratas|colof[oó]n|ap[eé]ndice|bibliograf[ií]a)\b/iu;

/**
 * [PROPIO] El principio de los anuncios del editor al final del libro (visto en
 * pg29831: «OBRAS DEL MISMO AUTOR» y, detrás, un catálogo con precios). Desde la
 * primera entrada así, todo queda fuera.
 */
const FINAL = /^\s*(obras del mismo autor|otras obras|obras de\b|obras publicadas|cat[aá]logo|publicaciones de|de venta en)/iu;

/** Una entrada del índice que no es narración: prólogos, dedicatorias, notas, índices, glosarios. */
export function esParatexto(etiqueta: string): boolean {
  return PARATEXTO.test(etiqueta);
}

/**
 * Una división numerada: «Capítulo…», «Tranco…», «Parte…», «Libro…», «Tratado…»,
 * «Jornada…», «Canto…», o un número romano (en mayúsculas) o arábigo solo o
 * seguido de puntuación («XII», «I. La llegada», «3.»). Un romano de una sola
 * letra solo vale si es I, V o X: «D.» o «M.» son abreviaturas («D. Armando
 * Palacio Valdés», pg32364). [PROPIO] Si el índice tiene alguna, lo que va
 * antes de la primera es preliminar (portada, cartas, poemas de dedicatoria),
 * no narración.
 */
const NUMERADA = /^[\s\-–—]*(?:(?:cap[ií]tulo|tranco|parte|libro|tratado|jornada|canto)\b|(?:[IVXLCDM]{2,}|[IVX])\s*(?:[.:\-–—]|$)|\d+\s*(?:[.:\-–—)]|$))/iu;
const ROMANO_EN_MINUSCULA = /^\s*[ivxlcdm]+\s*(?:[.:\-–—]|$)/u;
export function esDivisionNumerada(etiqueta: string): boolean {
  return NUMERADA.test(etiqueta) && !ROMANO_EN_MINUSCULA.test(etiqueta);
}

const atributo = (etiqueta: string, nombre: string): string | undefined => new RegExp(`\\b${nombre}="([^"]*)"`).exec(etiqueta)?.[1];

function leer(zip: ReadonlyMap<string, Buffer>, ruta: string): string {
  const b = zip.get(ruta);
  if (b === undefined) throw new Error(`epub: falta ${ruta}`);
  return b.toString('utf8');
}

/** Resuelve `href` relativo a la carpeta de `base` (sin «..», que Ebookmaker no usa). */
const junto = (base: string, href: string) => `${base.includes('/') ? base.slice(0, base.lastIndexOf('/') + 1) : ''}${decodeURIComponent(href)}`;

export function capitulosDeEpub(zip: ReadonlyMap<string, Buffer>): CapitulosDeEpub {
  const container = leer(zip, 'META-INF/container.xml');
  const rutaOpf = /<rootfile\b[^>]*\bfull-path="([^"]+)"/.exec(container)?.[1];
  if (rutaOpf === undefined) throw new Error('epub: container.xml sin rootfile');
  const opf = leer(zip, rutaOpf);

  const manifiesto = new Map<string, string>();
  for (const [item] of opf.matchAll(/<item\b[^>]*>/g)) {
    const id = atributo(item, 'id');
    const href = atributo(item, 'href');
    if (id !== undefined && href !== undefined) manifiesto.set(id, junto(rutaOpf, href));
  }
  const idToc = atributo(/<spine\b[^>]*>/.exec(opf)?.[0] ?? '', 'toc');
  const rutaNcx = idToc === undefined ? undefined : manifiesto.get(idToc);
  if (rutaNcx === undefined || !zip.has(rutaNcx)) throw new Error('epub: sin índice (toc.ncx) en el spine');
  const lectura = [...opf.matchAll(/<itemref\b[^>]*>/g)].map(([r]) => manifiesto.get(atributo(r, 'idref') ?? '')).filter((r): r is string => r !== undefined && /\.x?html?$/.test(r));

  // El cuerpo de cada fichero, en orden de lectura, y dónde empieza cada uno en el conjunto.
  let conjunto = '';
  const inicioDe = new Map<string, number>();
  for (const ruta of lectura) {
    const html = leer(zip, ruta);
    const a = html.search(/<body\b[^>]*>/);
    const cuerpo = a < 0 ? html : html.slice(html.indexOf('>', a) + 1, html.lastIndexOf('</body>') >= 0 ? html.lastIndexOf('</body>') : undefined);
    inicioDe.set(ruta, conjunto.length);
    conjunto += `${cuerpo}\n`;
  }
  const posicionDelId = (id: string, desde = 0): number => {
    const i = conjunto.indexOf(`id="${id}"`, desde);
    return i < 0 ? -1 : conjunto.lastIndexOf('<', i);
  };
  // Lo que no es del libro: la cabecera y el pie de Gutenberg.
  const cabecera = posicionDelId('pg-header');
  const separador = conjunto.indexOf('id="pg-start-separator"');
  const finCabecera = separador < 0 ? -1 : conjunto.indexOf('</div>', separador) + '</div>'.length;
  if (cabecera >= 0 && finCabecera > cabecera) conjunto = conjunto.slice(0, cabecera) + ' '.repeat(finCabecera - cabecera) + conjunto.slice(finCabecera);
  const pie = posicionDelId('pg-footer');
  const fin = pie >= 0 ? pie : conjunto.length;

  // Las entradas del índice, en el orden del documento (las anidadas también).
  const ncx = leer(zip, rutaNcx);
  const entradas = [...ncx.matchAll(/<navPoint\b[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<content\b[^>]*\bsrc="([^"]+)"/g)].map((m, i) => {
    const [fichero, ancla] = m[2]!.split('#') as [string, string | undefined];
    const ruta = junto(rutaNcx, fichero);
    const base = inicioDe.get(ruta);
    const posicion = base === undefined ? -1 : ancla === undefined ? base : posicionDelId(ancla, base);
    return { orden: i + 1, etiqueta: textoPlano(m[1]!), posicion };
  });

  const salida: CapitulosDeEpub = { capitulos: [], fuera: [] };
  const ordenadas = entradas.filter((e) => e.posicion >= 0).sort((a, b) => a.posicion - b.posicion);
  for (const e of entradas.filter((x) => x.posicion < 0)) salida.fuera.push({ orden: e.orden, etiqueta: e.etiqueta, motivo: 'su ancla no está en el libro' });
  const primeraNumerada = ordenadas.find((e) => esDivisionNumerada(e.etiqueta))?.posicion ?? -1;
  const anunciosFinales = ordenadas.find((e) => FINAL.test(e.etiqueta))?.posicion ?? Infinity;
  ordenadas.forEach((e, i) => {
    if (/project gutenberg/i.test(e.etiqueta) || e.posicion >= fin) {
      salida.fuera.push({ orden: e.orden, etiqueta: e.etiqueta, motivo: 'licencia de Project Gutenberg' });
      return;
    }
    if (e.posicion >= anunciosFinales) {
      salida.fuera.push({ orden: e.orden, etiqueta: e.etiqueta, motivo: 'final: anuncios del editor u obras del autor' });
      return;
    }
    if (esParatexto(e.etiqueta)) {
      salida.fuera.push({ orden: e.orden, etiqueta: e.etiqueta, motivo: 'paratexto' });
      return;
    }
    if (e.posicion < primeraNumerada) {
      salida.fuera.push({ orden: e.orden, etiqueta: e.etiqueta, motivo: 'preliminar: antes de la primera división numerada' });
      return;
    }
    const hasta = Math.min(ordenadas[i + 1]?.posicion ?? fin, fin);
    const fragmento = limpiarHtml(conjunto.slice(e.posicion, hasta))
      .replace(/<(h[1-6])\b[^>]*>[\s\S]*?<\/\1>/gi, '\n')
      .replace(/<a\b[^>]*\bclass="[^"]*\bfnanchor\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<span\b[^>]*\bclass="[^"]*\bpagenum\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');
    const { texto, problemas } = lineasDeHtml(fragmento);
    salida.capitulos.push({ orden: e.orden, etiqueta: e.etiqueta, texto, problemas });
  });
  salida.fuera.sort((a, b) => a.orden - b.orden);
  return salida;
}
