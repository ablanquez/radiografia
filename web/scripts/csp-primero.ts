/**
 * La CSP, lo primero del <head> (encargo 10.4, Tanda 1; decidido por Antonio
 * el 04/10 en la parada de sutura). Astro escribe el <meta> de la CSP al final
 * del <head>, detrás de lo que escribe la página, y una política en un <meta>
 * no se aplica a lo que va antes: la precarga de fuentes y los enlaces de
 * icono y manifiesto quedaban fuera, y el juez 9 de construccion.spec.ts lo
 * caza. Esta función solo RECOLOCA el <meta> que Astro ya generó, justo detrás
 * de <meta charset>: no toca su contenido ni añade nada a la política. La
 * aplica la integración de astro.config.mjs al terminar el build.
 *
 * [DOC] https://www.w3.org/TR/CSP3/#meta-element — «Authors are strongly
 *    encouraged to place meta elements as early in the document as possible,
 *    because policies in meta elements are not applied to content which
 *    precedes them».
 * [PROPIO] Detrás de <meta charset> y no delante: la declaración de la
 *    codificación sigue siendo lo primero del documento.
 */

const CSP = /<meta http-equiv="content-security-policy" content="([^"]*)">/g;
const CHARSET = /<meta charset="utf-8">/gi;

/** El HTML con el <meta> de la CSP justo detrás de <meta charset>, y el contenido de la política tal cual. Lanza si no hay exactamente uno de cada. */
export function cspDetrasDelCharset(html: string): { html: string; contenido: string } {
  const csp = [...html.matchAll(CSP)];
  const charset = [...html.matchAll(CHARSET)];
  if (csp.length !== 1) throw new Error(`la página tiene ${csp.length} <meta> de CSP y tiene que tener uno`);
  if (charset.length !== 1) throw new Error(`la página tiene ${charset.length} <meta charset="utf-8"> y tiene que tener uno`);
  const etiqueta = csp[0]![0];
  const sinCsp = html.slice(0, csp[0]!.index) + html.slice(csp[0]!.index + etiqueta.length);
  const tras = sinCsp.search(CHARSET) + charset[0]![0].length;
  return { html: sinCsp.slice(0, tras) + etiqueta + sinCsp.slice(tras), contenido: csp[0]![1]! };
}
