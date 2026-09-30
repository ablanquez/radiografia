/**
 * De HTML a líneas de texto, para la herramienta de calibración (encargo
 * 5.5): lo usan el BOE (boe.ts, el bloque #textoxslt de txt.php) y los EPUB de
 * Project Gutenberg (epub.ts). Sin red y sin dependencias: lo juzgan
 * html.spec.ts y, a través del BOE, boe.spec.ts.
 *
 * [PROPIO] El espacio en blanco del código fuente es espacio (como en la
 *    página); cada `<p>`, `<h1>`…`<h6>`, `<dt>`, `<dd>`, `<li>`, `<div>` y cada
 *    `<br>` abren línea, como se ven en la página y como quedarían al copiarla;
 *    cada fila de tabla es una línea «| celda | celda |» (el segmentador del
 *    motor la marca como tabla, no prosa). Las entidades numéricas y las con
 *    nombre de la tabla NOMBRADAS se decodifican; una desconocida queda dicha
 *    en `problemas`, igual que un resto de etiqueta o un carácter perdido
 *    (el invariante de conservaElTexto).
 */

/** Las entidades con nombre que se decodifican (HTML 4 / Latin-1 y la tipografía de uso en español). */
const NOMBRADAS: Readonly<Record<string, string>> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '',
  laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', bdquo: '„', sbquo: '‚',
  iexcl: '¡', iquest: '¿', ordf: 'ª', ordm: 'º', deg: '°', middot: '·', ndash: '–', mdash: '—', hellip: '…', bull: '•',
  euro: '€', pound: '£', cent: '¢', yen: '¥', sect: '§', para: '¶', copy: '©', reg: '®', trade: '™',
  sup1: '¹', sup2: '²', sup3: '³', frac12: '½', frac14: '¼', frac34: '¾', times: '×', divide: '÷', plusmn: '±', micro: 'µ', permil: '‰',
  prime: '′', Prime: '″', acute: '´', aring: 'å', Aring: 'Å', szlig: 'ß',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  agrave: 'à', egrave: 'è', igrave: 'ì', ograve: 'ò', ugrave: 'ù', Agrave: 'À', Egrave: 'È', Igrave: 'Ì', Ograve: 'Ò', Ugrave: 'Ù',
  acirc: 'â', ecirc: 'ê', icirc: 'î', ocirc: 'ô', ucirc: 'û', Acirc: 'Â', Ecirc: 'Ê', Icirc: 'Î', Ocirc: 'Ô', Ucirc: 'Û',
  auml: 'ä', euml: 'ë', iuml: 'ï', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Euml: 'Ë', Iuml: 'Ï', Ouml: 'Ö', Uuml: 'Ü',
  ntilde: 'ñ', Ntilde: 'Ñ', ccedil: 'ç', Ccedil: 'Ç', atilde: 'ã', otilde: 'õ', Atilde: 'Ã', Otilde: 'Õ',
};

export function decodificar(s: string): { texto: string; desconocidas: string[] } {
  const desconocidas: string[] = [];
  const texto = s.replace(/&(#\d+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);/g, (entera: string, cuerpo: string) => {
    if (cuerpo.startsWith('#')) {
      const cp = cuerpo[1] === 'x' || cuerpo[1] === 'X' ? Number.parseInt(cuerpo.slice(2), 16) : Number.parseInt(cuerpo.slice(1), 10);
      // Un salto o un tabulador escritos como entidad son espacio en la página, como los del código fuente.
      if (cp === 9 || cp === 10 || cp === 13) return ' ';
      if (cp > 0 && cp <= 0x10ffff) return String.fromCodePoint(cp);
      desconocidas.push(entera);
      return entera;
    }
    const nombrada = NOMBRADAS[cuerpo];
    if (nombrada !== undefined) return nombrada;
    desconocidas.push(entera);
    return entera;
  });
  return { texto, desconocidas };
}

const BLOQUE = /<\/?(?:p|div|h[1-6]|dl|dt|dd|ul|ol|li|table|thead|tbody|tfoot|tr|blockquote|pre|center)\b[^>]*>|<br\s*\/?>/gi;

/** Sin comentarios, scripts ni estilos, y con el espacio en blanco colapsado (como lo pinta la página). */
export function limpiarHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/\s+/g, ' ');
}

/** Las líneas de texto de un fragmento ya limpio (limpiarHtml), y los problemas si los hay. */
export function lineasDeHtml(limpio: string): { texto: string; problemas: string[] } {
  let h = limpio.replace(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi, (_: string, fila: string) => {
    const celdas = [...fila.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => m[1]!.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    return `\n| ${celdas.join(' | ')} |\n`;
  });
  h = h.replace(BLOQUE, '\n').replace(/<[^>]*>/g, '');
  const problemas: string[] = [];
  if (h.includes('<')) problemas.push('restos de etiquetas');
  const { texto, desconocidas } = decodificar(h);
  for (const e of new Set(desconocidas)) problemas.push(`entidad sin decodificar: ${e}`);
  const salida = texto
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l !== '')
    .join('\n');
  if (!conservaElTexto(limpio, salida)) problemas.push('texto perdido en la extracción');
  return { texto: salida, problemas };
}

/** Una página como texto plano de una línea: sin etiquetas, entidades decodificadas y el espacio colapsado (para buscar un literal). */
export function textoPlano(html: string): string {
  return decodificar(html.replace(/<[^>]*>/g, ' ')).texto.replace(/\s+/g, ' ').trim();
}

/**
 * El invariante de la extracción: quitadas las etiquetas y decodificadas las
 * entidades, los caracteres del bloque (sin espacios ni barras «|», que las
 * tablas añaden) son exactamente los del texto extraído. Si no, algo se perdió
 * o se coló por el camino.
 */
export function conservaElTexto(bloqueHtml: string, texto: string): boolean {
  const esencia = (s: string) => s.replace(/[\s|]/g, '');
  return esencia(decodificar(bloqueHtml.replace(/<[^>]*>/g, ' ')).texto) === esencia(texto);
}
