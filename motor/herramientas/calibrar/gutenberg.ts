/**
 * Project Gutenberg para la calibración de «narrativa-clasica» (encargo 5.5):
 * el catálogo CSV, las personas de cada libro con su año de muerte, el filtro
 * de libros y los enlaces del harvest. Sin red; lo juzga gutenberg.spec.ts.
 *
 * [DOC] https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv — «An
 *    Excel-compatible CSV spreadsheet of eBook metadata» (páginas de catálogos
 *    sin conexión); columnas Text#, Type, Issued, Title, Language, Authors,
 *    Subjects, LoCC, Bookshelves. «The catalog data are granted to the public
 *    domain» (https://www.gutenberg.org/policy/robot_access.html).
 * [DOC] https://www.rfc-editor.org/rfc/rfc4180 § 2 — comillas, comas y saltos
 *    de línea dentro de un campo; «""» es una comilla.
 * [PROPIO] Authors: personas separadas por «;», cada una «Apellidos, Nombre,
 *    <fechas> [Papel]» (formatos vistos en los libros en español: «1547-1616»,
 *    «1520?-1594», «-1541», «621? BCE-565? BCE», «1955-», «active 16th
 *    century»). El año de muerte es el que sigue al guion; «?» se acepta como
 *    aproximado; BCE, negativo; sin año tras el guion, no hay año de muerte.
 *
 * Filtro (decisiones de Antonio, parada 1 del 5.5; los motivos, en este orden):
 *   · Type «Text»; Language exactamente «es»; «fiction» en Subjects;
 *   · ninguna persona con el papel «Translator» (heurística declarada);
 *   · [PROPIO, a la parada] traducción probable por Subjects: «Translations
 *     into Spanish» o una literatura no hispánica («French fiction», «Greek
 *     literature»…). corpus.md descarta todo lo traducido;
 *   · el año de muerte de TODAS las personas del registro, con cualquier papel:
 *     sin año, fuera (encargo 5.5, suturas); posterior a `ultimoAnio`, fuera.
 */

export interface Persona {
  nombre: string;
  muerte: number | null;
  papel: string | null;
}

export interface Libro {
  id: number;
  tipo: string;
  titulo: string;
  lenguas: string[];
  personas: Persona[];
  autores: string;
  materias: string;
}

/** Un CSV según RFC 4180: filas de campos. */
export function leerCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let entreComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]!;
    if (entreComillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') entreComillas = false;
      else campo += c;
    } else if (c === '"') entreComillas = true;
    else if (c === ',') {
      fila.push(campo);
      campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else campo += c;
  }
  if (campo !== '' || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas;
}

/** Una persona del campo Authors: nombre, año de muerte (null si no consta) y papel. */
export function persona(entrada: string): Persona {
  let resto = entrada.trim();
  let papel: string | null = null;
  const conPapel = /\s*\[([^\]]+)\]\s*$/.exec(resto);
  if (conPapel) {
    papel = conPapel[1]!;
    resto = resto.slice(0, conPapel.index);
  }
  const fechas = /,\s*([^,]*\d[^,]*)$/.exec(resto);
  if (!fechas) return { nombre: resto, muerte: null, papel };
  const muerte = /-\s*(\d{1,4})\??\s*(BCE)?\s*$/.exec(fechas[1]!);
  return {
    nombre: resto.slice(0, fechas.index),
    muerte: muerte ? (muerte[2] ? -Number(muerte[1]) : Number(muerte[1])) : null,
    papel,
  };
}

export function librosDelCatalogo(csv: string): Libro[] {
  const [cabecera, ...filas] = leerCsv(csv);
  if (cabecera === undefined) return [];
  const col = (nombre: string) => {
    const i = cabecera.indexOf(nombre);
    if (i < 0) throw new Error(`catálogo sin la columna ${nombre}`);
    return i;
  };
  const [id, tipo, titulo, lengua, autores, materias] = ['Text#', 'Type', 'Title', 'Language', 'Authors', 'Subjects'].map(col) as [number, number, number, number, number, number];
  return filas
    .filter((f) => f.length > 1)
    .map((f) => ({
      id: Number(f[id]),
      tipo: f[tipo]!,
      titulo: f[titulo]!,
      lenguas: f[lengua]!.split(';').map((l) => l.trim()).filter((l) => l !== ''),
      personas: f[autores]!.split(';').map((a) => a.trim()).filter((a) => a !== '').map(persona),
      autores: f[autores]!,
      materias: f[materias]!,
    }));
}

const TRADUCCION = /translations into spanish|(?<!(?:spanish|latin)\s)\b(?:french|english|american|german|italian|russian|portuguese|greek|latin|scottish|irish|danish|swedish|norwegian|polish|czech|hungarian|dutch|flemish|belgian|chinese|japanese|arabic|persian|catalan|provençal)\s+(?:fiction|literature|drama|poetry|prose literature|wit and humor)\b/i;

/**
 * [PROPIO, a la parada] La lengua propia de cada autor según el catálogo: la
 * lengua en la que tiene más libros SIN traductor (solo «Text» en una sola
 * lengua; solo las personas sin papel, los autores). A igualdad, el español.
 * Un autor cuya lengua propia no es el español firma, en español, una
 * traducción sin traductor declarado (Voltaire, Salgari, Kafka…).
 */
export function lenguasPropias(libros: readonly Libro[]): Map<string, string> {
  const cuentas = new Map<string, Map<string, number>>();
  for (const l of libros) {
    if (l.tipo !== 'Text' || l.lenguas.length !== 1 || l.personas.some((p) => p.papel === 'Translator')) continue;
    for (const p of l.personas) {
      if (p.papel !== null) continue;
      const porLengua = cuentas.get(p.nombre) ?? new Map<string, number>();
      porLengua.set(l.lenguas[0]!, (porLengua.get(l.lenguas[0]!) ?? 0) + 1);
      cuentas.set(p.nombre, porLengua);
    }
  }
  const salida = new Map<string, string>();
  for (const [nombre, porLengua] of cuentas) {
    let mejor = 'es';
    let maximo = porLengua.get('es') ?? 0;
    for (const [lengua, n] of porLengua) {
      if (n > maximo) {
        mejor = lengua;
        maximo = n;
      }
    }
    salida.set(nombre, mejor);
  }
  return salida;
}

export function filtrarLibro(libro: Libro, ultimoAnio: number, lenguas?: ReadonlyMap<string, string>): { dentro: true } | { fuera: string } {
  if (libro.tipo !== 'Text') return { fuera: `no es Text (${libro.tipo})` };
  if (libro.lenguas.length !== 1 || libro.lenguas[0] !== 'es') return { fuera: `no solo en español (${libro.lenguas.join('; ')})` };
  if (!/fiction/i.test(libro.materias)) return { fuera: 'sin «fiction» en Subjects' };
  if (libro.personas.some((p) => p.papel === 'Translator')) return { fuera: 'con traductor' };
  if (TRADUCCION.test(libro.materias)) return { fuera: 'traducción probable por Subjects' };
  const extranjero = libro.personas.find((p) => p.papel === null && (lenguas?.get(p.nombre) ?? 'es') !== 'es');
  if (extranjero) return { fuera: `autor que escribe sobre todo en otra lengua (${extranjero.nombre}: ${lenguas!.get(extranjero.nombre)})` };
  if (libro.personas.length === 0 || libro.personas.some((p) => p.muerte === null)) return { fuera: 'alguien sin año de muerte en el catálogo' };
  if (libro.personas.some((p) => p.muerte! > ultimoAnio)) return { fuera: `murió después de ${ultimoAnio}` };
  return { dentro: true };
}

/** Los EPUB de una página del harvest (número de libro → URL) y la página siguiente, si la hay. */
export function enlacesDeHarvest(html: string): { epubs: [number, string][]; siguiente: string | null } {
  const epubs = [...html.matchAll(/href="([^"]*\/cache\/epub\/(\d+)\/[^"]*\.epub)"/g)].map((m) => [Number(m[2]), m[1]!] as [number, string]);
  const siguiente = /href="(harvest\?[^"]*)"/.exec(html)?.[1]?.replaceAll('&amp;', '&') ?? null;
  return { epubs, siguiente };
}
