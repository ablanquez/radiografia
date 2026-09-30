/**
 * El BOE para la calibración del género «administrativo» (encargo 5.5): los
 * ítems de un sumario, su subgénero (o por qué quedan fuera) y el texto de un
 * documento desde su HTML. Sin red: lo juzga boe.spec.ts.
 *
 * [DOC] https://www.boe.es/datosabiertos/documentos/APIsumarioBOE.pdf (28/06/2024):
 *    GET /datosabiertos/api/boe/sumario/{AAAAMMDD} con «Accept: application/json»;
 *    «status» con «code» y «text»; «data.sumario.diario[].seccion[]» (codigo,
 *    nombre) → «departamento[]» → «epigrafe[]» → «item[]», o «item» directo en
 *    el departamento («Este nodo incluye los datos de la disposición o anuncio,
 *    ya sea dentro del nodo <epígrafe> o dentro del nodo <departamento>»). El
 *    JSON «prescinde de tener que nombrar … las entradas de los documentos
 *    ("item")»: un nodo con una sola entrada llega como objeto y con varias
 *    como lista (visto en el sumario del 10/03/2010); aquí se aceptan las dos.
 *    Cada ítem trae «url_html» (https://www.boe.es/diario_boe/txt.php?id=…).
 * [PROPIO, parada 2 del 5.5] El texto sale de url_html y no de url_xml: el
 *    robots.txt de www.boe.es dice «Disallow: /diario_boe/xml.php?» (leído el
 *    30/09/2026). En la página, el cuerpo del documento es el bloque
 *    `<div id="textoxslt">` … `<!-- #textoxslt -->` (estructura observada, no
 *    documentada), con los mismos `<p>` que el `<texto>` del XML (comprobado
 *    sobre BOE-A-2010-4000).
 *
 * Subgéneros (decisión de Antonio, parada 1 del 5.5): sección 1 → disposición
 * general; 2A, 2B y 3 → resolución; 5A y 5B → anuncio. Fuera: la 4
 * (Administración de Justicia), la 5C (anuncios particulares: no los cubre el
 * art. 13 LPI), el Tribunal Constitucional y cualquier otra; los epígrafes de
 * tratados o acuerdos internacionales y los títulos con «traducción»
 * (corpus.md: excluir tratados y traducciones oficiales).
 *
 * Extracción [PROPIO]: el espacio en blanco del código fuente es espacio (como
 * en la página); cada `<p>`, `<h1>`…`<h6>`, `<dt>`, `<dd>`, `<li>`, `<div>` y
 * cada `<br>` abren línea, como se ven en la página y como quedarían al
 * copiarla; cada fila de tabla es una línea «| celda | celda |» (el
 * segmentador del motor la marca como tabla, no prosa); el aviso del propio BOE
 * `<p class="caja …">Aquí aparecen varias imágenes en el original…</p>` no es
 * texto del documento: fuera, y se cuenta. Las entidades numéricas y las con
 * nombre de la tabla NOMBRADAS se decodifican; una desconocida queda dicha en
 * `problemas`, igual que un bloque sin abrir o sin cerrar.
 */

export type Subgenero = 'disposicion-general' | 'resolucion' | 'anuncio';
export const SUBGENEROS: readonly Subgenero[] = ['disposicion-general', 'resolucion', 'anuncio'];

export interface ItemDelSumario {
  id: string;
  titulo: string;
  seccion: string;
  seccionNombre: string;
  departamento: string;
  epigrafe: string | null;
  urlHtml: string;
  /** AAAAMMDD del sumario. */
  fecha: string;
  paginas: number | null;
}

const lista = <T>(x: T | T[] | undefined | null): T[] => (x === undefined || x === null ? [] : Array.isArray(x) ? x : [x]);

interface ItemCrudo {
  identificador: string;
  titulo: string;
  url_html: string;
  url_pdf?: { pagina_inicial?: string; pagina_final?: string };
}

/** Lo que se lee del JSON; cada nivel puede venir como objeto o como lista (se recorre con `lista`). */
interface SumarioCrudo {
  status?: { code?: string; text?: string };
  data?: { sumario?: { diario?: unknown } };
}

export function itemsDelSumario(json: unknown, fecha: string): ItemDelSumario[] {
  const r = json as SumarioCrudo;
  if (r?.status?.code !== '200') throw new Error(`sumario ${fecha}: status ${r?.status?.code ?? 'desconocido'} (${r?.status?.text ?? ''})`);
  const salida: ItemDelSumario[] = [];
  const empujar = (it: ItemCrudo, seccion: { codigo: string; nombre: string }, departamento: string, epigrafe: string | null) => {
    const ini = Number(it.url_pdf?.pagina_inicial);
    const fin = Number(it.url_pdf?.pagina_final);
    salida.push({
      id: it.identificador,
      titulo: it.titulo,
      seccion: seccion.codigo,
      seccionNombre: seccion.nombre,
      departamento,
      epigrafe,
      urlHtml: it.url_html,
      fecha,
      paginas: Number.isFinite(ini) && Number.isFinite(fin) && fin >= ini ? fin - ini + 1 : null,
    });
  };
  for (const diario of lista(r.data?.sumario?.diario as unknown[] | undefined) as { seccion?: unknown }[]) {
    for (const seccion of lista(diario.seccion as unknown[]) as { codigo: string; nombre: string; departamento?: unknown }[]) {
      for (const dep of lista(seccion.departamento as unknown[]) as { nombre: string; epigrafe?: unknown; item?: unknown }[]) {
        for (const ep of lista(dep.epigrafe as unknown[]) as { nombre: string; item?: unknown }[]) {
          for (const it of lista(ep.item as ItemCrudo[])) empujar(it, seccion, dep.nombre, ep.nombre);
        }
        for (const it of lista(dep.item as ItemCrudo[])) empujar(it, seccion, dep.nombre, null);
      }
    }
  }
  return salida;
}

const SUBGENERO_DE_SECCION: Readonly<Record<string, Subgenero>> = {
  '1': 'disposicion-general',
  '2A': 'resolucion',
  '2B': 'resolucion',
  '3': 'resolucion',
  '5A': 'anuncio',
  '5B': 'anuncio',
};

export function clasificar(item: ItemDelSumario): { subgenero: Subgenero } | { fuera: string } {
  const subgenero = SUBGENERO_DE_SECCION[item.seccion];
  if (subgenero === undefined) return { fuera: `sección ${item.seccion} (${item.seccionNombre})` };
  if (item.epigrafe !== null && /(tratados|acuerdos) internacionales/i.test(item.epigrafe)) return { fuera: 'epígrafe de tratados o acuerdos internacionales' };
  if (/traducci[oó]n/i.test(item.titulo)) return { fuera: 'título con «traducción»' };
  return { subgenero };
}

/**
 * El tope de una mezcla (decisión de Antonio tras la parada del piloto, 5.5):
 * ninguna parte pasa de `num/den` del total. Como mucho una parte puede pasar
 * (con num/den ≥ 1/2), y baja a lo más que le deja el resto O:
 * n/(n + O) ≤ num/den ⇔ n ≤ ⌊num·O/(den − num)⌋, en enteros (en coma
 * flotante, 0,6/0,4 da 1,4999…).
 */
export function topeDeMezcla<K extends string>(cuentas: Readonly<Record<K, number>>, [num, den]: readonly [number, number]): Record<K, number> {
  const salida = { ...cuentas } as Record<K, number>;
  const total = (Object.values(cuentas) as number[]).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(cuentas) as K[]) {
    const resto = total - cuentas[k];
    const maximo = Math.floor((num * resto) / (den - num));
    if (cuentas[k] > maximo) salida[k] = maximo;
  }
  return salida;
}

/** Las entidades con nombre que se decodifican (HTML 4 / Latin-1 y la tipografía de uso en español). */
const NOMBRADAS: Readonly<Record<string, string>> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '',
  laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', bdquo: '„', sbquo: '‚',
  iexcl: '¡', iquest: '¿', ordf: 'ª', ordm: 'º', deg: '°', middot: '·', ndash: '–', mdash: '—', hellip: '…', bull: '•',
  euro: '€', pound: '£', cent: '¢', yen: '¥', sect: '§', para: '¶', copy: '©', reg: '®', trade: '™',
  sup1: '¹', sup2: '²', sup3: '³', frac12: '½', frac14: '¼', frac34: '¾', times: '×', divide: '÷', plusmn: '±', micro: 'µ', permil: '‰',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  agrave: 'à', egrave: 'è', igrave: 'ì', ograve: 'ò', ugrave: 'ù', Agrave: 'À', Egrave: 'È', Igrave: 'Ì', Ograve: 'Ò', Ugrave: 'Ù',
  acirc: 'â', ecirc: 'ê', icirc: 'î', ocirc: 'ô', ucirc: 'û', Acirc: 'Â', Ecirc: 'Ê', Icirc: 'Î', Ocirc: 'Ô', Ucirc: 'Û',
  auml: 'ä', euml: 'ë', iuml: 'ï', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Euml: 'Ë', Iuml: 'Ï', Ouml: 'Ö', Uuml: 'Ü',
  ntilde: 'ñ', Ntilde: 'Ñ', ccedil: 'ç', Ccedil: 'Ç', atilde: 'ã', otilde: 'õ', Atilde: 'Ã', Otilde: 'Õ',
};

function decodificar(s: string): { texto: string; desconocidas: string[] } {
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

const INICIO = '<div id="textoxslt">';
const FIN = '<!-- #textoxslt -->';
const BLOQUE = /<\/?(?:p|div|h[1-6]|dl|dt|dd|ul|ol|li|table|thead|tbody|tfoot|tr|blockquote|pre|center)\b[^>]*>|<br\s*\/?>/gi;

export interface TextoExtraido {
  texto: string;
  problemas: string[];
  /** Avisos del BOE de imágenes que solo están en el PDF (el HTML no trae ese contenido). */
  avisosDeImagen: number;
}

export function textoDelDocumento(html: string): TextoExtraido {
  const a = html.indexOf(INICIO);
  if (a < 0) return { texto: '', problemas: ['sin bloque #textoxslt'], avisosDeImagen: 0 };
  const b = html.indexOf(FIN, a);
  if (b < 0) return { texto: '', problemas: ['sin cierre de #textoxslt'], avisosDeImagen: 0 };
  let h = html
    .slice(a + INICIO.length, b)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/\s+/g, ' ');
  let avisosDeImagen = 0;
  h = h.replace(/<p\b[^>]*\bclass="[^"]*\bcaja\b[^"]*"[^>]*>[\s\S]*?<\/p>/gi, () => {
    avisosDeImagen++;
    return '\n';
  });
  const sinAvisos = h;
  h = h.replace(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi, (_: string, fila: string) => {
    const celdas = [...fila.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => m[1]!.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    return `\n| ${celdas.join(' | ')} |\n`;
  });
  h = h.replace(BLOQUE, '\n').replace(/<[^>]*>/g, '');
  const problemas: string[] = [];
  if (h.includes('<')) problemas.push('restos de etiquetas');
  const { texto, desconocidas } = decodificar(h);
  for (const e of new Set(desconocidas)) problemas.push(`entidad sin decodificar: ${e}`);
  const lineas = texto
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l !== '');
  const salida = lineas.join('\n');
  if (!conservaElTexto(sinAvisos, salida)) problemas.push('texto perdido en la extracción');
  return { texto: salida, problemas, avisosDeImagen };
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

/** Los días de `desde` a `hasta` (AAAA-MM-DD, ambos incluidos), como AAAAMMDD. */
export function fechasDelPeriodo(desde: string, hasta: string): string[] {
  const dia = 86_400_000;
  const salida: string[] = [];
  for (let t = Date.parse(`${desde}T00:00:00Z`); t <= Date.parse(`${hasta}T00:00:00Z`); t += dia) {
    salida.push(new Date(t).toISOString().slice(0, 10).replaceAll('-', ''));
  }
  return salida;
}
