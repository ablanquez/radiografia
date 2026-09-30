/**
 * Descarga el corpus de «narrativa-clasica» para la calibración (encargo 5.5):
 * capítulos de novelas y cuentos en español de Project Gutenberg, de autores
 * en dominio público en España, y deja en motor/corpus/narrativa-clasica/ un
 * texto por capítulo y el manifiesto motor/corpus/narrativa-clasica.manifiesto.json
 * (sin texto). Se ejecuta a mano:
 *
 *   node herramientas/calibrar/descargar-narrativa-clasica.ts [--minutos N]   (desde motor/)
 *
 * Endpoints y su documentación (leída el 30/09/2026):
 * [DOC] https://www.gutenberg.org/policy/robot_access.html — «The Project
 *    Gutenberg website is intended for human users only. Any perceived use of
 *    automated tools to access the Project Gutenberg website will result in a
 *    temporary or permanent block of your IP address. The only exceptions to
 *    this rule are below.» Las excepciones: el harvest, «wget -w 2 -m -H
 *    "https://www.gutenberg.org/robot/harvest?filetypes[]=html&langs[]=de"»
 *    (con los tipos html, txt, epub.images, epub.noimages…), las réplicas y
 *    los datos de catálogo, «granted to the public domain». Aquí solo se piden
 *    el catálogo (https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv),
 *    las páginas del harvest y los ficheros a los que enlaza, con 2 s entre
 *    peticiones (el «-w 2» de la política) y robots.txt consultado antes de
 *    cada una (red.ts). Esta cabecera cita la política; la herramienta no la
 *    vuelve a pedir: sería acceso automático a la web.
 * [PROPIO, hallazgos del 30/09/2026] El harvest de «txt» en español devuelve
 *    dos libros; el de «epub.noimages», 914 en 11 páginas: se usan los EPUB.
 *    Sus enlaces van a https://aleph.gutenberg.org, cuyo certificado TLS es
 *    de aleph.pglaf.org (Node: ERR_TLS_CERT_ALTNAME_INVALID; el wget de la
 *    política también fallaría). Se piden las MISMAS URL por http (su
 *    robots.txt da 404: RFC 9309 § 2.3.1.3) y cada EPUB se comprueba entrada
 *    a entrada por su CRC-32 (zip.ts). Queda en el manifiesto como incidencia.
 * [DOC] Dominio público en España, leído en origen en cada ejecución (si el
 *    literal no está, PARA): TRLPI consolidado (https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930),
 *    art. 26 («toda la vida del autor y setenta años después de su muerte»),
 *    art. 30 (el plazo se computa «desde el día 1 de enero del año siguiente
 *    al de la muerte») y DT 4.ª (autores fallecidos antes del 7 de diciembre
 *    de 1987: «la duración prevista en la Ley de 10 de enero de 1879»); y esa
 *    Ley (https://www.boe.es/buscar/doc.php?id=BOE-A-1879-40001), art. 6:
 *    «por el término de ochenta años». En 2026, dominio público si murió en
 *    1945 o antes (1945 + 80 = 2025); todos los libros del filtro son de
 *    autores muertos antes de 1987.
 *
 * Muestra [PROPIO]: libros del filtro (gutenberg.ts) en el orden de
 * sha256("<semilla>|muestra|<libro>"); de cada libro, sus capítulos (epub.ts)
 * y, como mucho, TOPE_POR_LIBRO de cada tramo (los primeros por huella), para
 * que ninguna novela larga copa un tramo; hasta que cada tramo tenga MINIMO
 * documentos de calibración o se agote el tiempo (30 minutos de descarga EN
 * TOTAL, sumando ejecuciones: fuente/registro.json; lo ya descargado, en
 * caché). Un tramo que no llegue: su celda no existe (calibrar.ts).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { SEMILLA, TRAMOS, huella, medirLongitud, ordenDeMuestra, reparto, type Reparto } from './comun.ts';
import { capitulosDeEpub } from './epub.ts';
import { enlacesDeHarvest, filtrarLibro, lenguasPropias, librosDelCatalogo, type Libro } from './gutenberg.ts';
import { textoPlano } from './html.ts';
import { nombreDeFichero, prepararManifiesto, type DocumentoDelManifiesto, type Manifiesto } from './manifiesto.ts';
import { Cliente, PresupuestoAgotado } from './red.ts';
import { leerZip } from './zip.ts';

const ULTIMO_ANIO_DE_MUERTE = 1945;
const MINIMO = 100;
const TOPE_POR_LIBRO = 5;
const PRESUPUESTO_TOTAL_MS = 30 * 60_000;
const CATALOGO = 'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv';
const HARVEST = 'https://www.gutenberg.org/robot/harvest?filetypes[]=epub.noimages&langs[]=es';
const TRLPI = 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930';
const LEY_1879 = 'https://www.boe.es/buscar/doc.php?id=BOE-A-1879-40001';
const LITERALES_TRLPI = [
  'Los derechos de explotación de la obra durarán toda la vida del autor y setenta años después de su muerte o declaración de fallecimiento.',
  'Los plazos de protección establecidos en esta Ley se computarán desde el día 1 de enero del año siguiente al de la muerte o declaración de fallecimiento del autor',
  'Los derechos de explotación de las obras creadas por autores fallecidos antes del 7 de diciembre de 1987 tendrán la duración prevista en la Ley de 10 de enero de 1879 sobre Propiedad Intelectual.',
];
const LITERAL_1879 = 'por el término de ochenta años';

/** Revisados a mano, capítulo extraído frente al EPUB (30/09/2026). */
const REVISADOS_A_MANO = [
  'pg12457 (El Diablo Cojuelo): entran los diez trancos; fuera la portada, la carta y el soneto preliminares (antes del primer tranco), las dedicatorias, los prólogos, las notas, el índice y la licencia; sin llamadas a nota',
  'piloto de 40 EPUB: fuera los anuncios finales de pg29831 y la «ACLARACIÓN» de pg32364, y el glosario «ABBREVIATIONS» de pg29731 (docs/BITACORA.md, 2026-09-30)',
  'los 127 capítulos de 100-299 de la primera descarga completa, uno a uno: unos 30 no eran narración (portadas con el título del libro, «TASA», «TABLA», «D E D I C A T O R I A», «Codificación», el año «1872» tomado por capítulo, escenas de teatro, duplicados entre libros); corregido en epub.ts y aquí, y revisado de nuevo',
];

/**
 * Lo que la revisión a mano (30/09/2026) vio que NO es narración y sigue
 * dentro: ninguna regla general lo separa sin ajustarse a un solo libro. Se
 * declara; no se quita a mano sin decisión de Antonio.
 */
const RESIDUOS_CONOCIDOS = [
  '100-299 (tramo sin celda): pg14995-036 («1872»: datos de librería), pg14796-016 y -019 (teatro alegórico y sus notas), pg28281-055 (bibliografía), pg42440-002 (soneto preliminar), pg62691-017 (dedicatoria), pg65685-001 y -002 (portada y arranque de una antología), pg26929-006 y pg49149-022 y -026 (ensayos del autor), pg39444-032 y pg39613-039 (casi el mismo texto en dos antologías)',
  '300-599: pg14311-041 (lista de traducciones de Galdós), pg1619-004 (carta «El auctor» de La Celestina), pg62691-003 (dedicatoria de El criticón); dudoso: pg65689-023',
];

const CORPUS = fileURLToPath(new URL('../../corpus/narrativa-clasica/', import.meta.url));
const FUENTE = `${CORPUS}fuente/`;
const MANIFIESTO = fileURLToPath(new URL('../../corpus/narrativa-clasica.manifiesto.json', import.meta.url));
const REGISTRO = `${FUENTE}registro.json`;

const argMinutos = process.argv.indexOf('--minutos');
const minutos = argMinutos >= 0 ? Number(process.argv[argMinutos + 1]) : Infinity;

interface Registro {
  ejecuciones: { fecha: string; peticiones: number; bytes: number; segundos: number }[];
}
mkdirSync(`${FUENTE}harvest`, { recursive: true });
mkdirSync(`${FUENTE}epub`, { recursive: true });
const registro: Registro = existsSync(REGISTRO) ? (JSON.parse(readFileSync(REGISTRO, 'utf8')) as Registro) : { ejecuciones: [] };
const gastadoMs = registro.ejecuciones.reduce((s, e) => s + e.segundos * 1000, 0);
const cliente = new Cliente({
  agente: 'RadiografIA-calibracion',
  contacto: 'https://github.com/ablanquez/radiografia',
  pausaMs: 2000,
  presupuestoMs: Math.max(0, Math.min(PRESUPUESTO_TOTAL_MS - gastadoMs, minutos * 60_000)),
});
const guardarRegistro = () => {
  registro.ejecuciones.push({ fecha: new Date().toISOString(), peticiones: cliente.peticiones, bytes: cliente.bytes, segundos: Math.round(cliente.transcurridoMs / 1000) });
  writeFileSync(REGISTRO, JSON.stringify(registro, null, 2) + '\n', 'utf8');
};

async function cacheado(ruta: string, url: string): Promise<Buffer> {
  if (existsSync(ruta)) return readFileSync(ruta);
  const r = await cliente.obtener(url);
  if (r.estado !== 200) throw new Error(`${url}: HTTP ${r.estado}`);
  writeFileSync(ruta, r.cuerpo);
  return r.cuerpo;
}
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');

// ── Dominio público, leído en origen ──
const trlpi = await cacheado(`${FUENTE}trlpi.html`, TRLPI);
const ley1879 = await cacheado(`${FUENTE}ley-1879.html`, LEY_1879);
for (const l of LITERALES_TRLPI) if (!textoPlano(trlpi.toString('utf8')).includes(l)) throw new Error(`PARA: «${l.slice(0, 60)}…» no está en el TRLPI`);
if (!textoPlano(ley1879.toString('utf8')).includes(LITERAL_1879)) throw new Error('PARA: la Ley de 1879 no dice «por el término de ochenta años»');

// ── Catálogo, filtro y harvest ──
const catalogo = await cacheado(`${FUENTE}pg_catalog.csv`, CATALOGO);
const libros = librosDelCatalogo(catalogo.toString('utf8'));
const lenguas = lenguasPropias(libros);
const fueraDelFiltro: Record<string, number> = {};
const suma = (r: Record<string, number>, motivo: string, n = 1) => (r[motivo] = (r[motivo] ?? 0) + n);
const elegibles: Libro[] = [];
for (const l of libros.filter((x) => x.lenguas.includes('es'))) {
  const r = filtrarLibro(l, ULTIMO_ANIO_DE_MUERTE, lenguas);
  if ('fuera' in r) suma(fueraDelFiltro, r.fuera.replace(/ \(.*\)$/, ''));
  else elegibles.push(l);
}
const epubDe = new Map<number, string>();
let urlHarvest: string | null = HARVEST;
for (let pagina = 0; urlHarvest !== null; pagina++) {
  const html = (await cacheado(`${FUENTE}harvest/${String(pagina).padStart(3, '0')}.html`, urlHarvest)).toString('utf8');
  const { epubs, siguiente } = enlacesDeHarvest(html);
  for (const [id, url] of epubs) epubDe.set(id, url);
  urlHarvest = siguiente === null ? null : `https://www.gutenberg.org/robot/${siguiente}`;
}
const conEpub = elegibles.filter((l) => epubDe.has(l.id));
suma(fueraDelFiltro, 'sin EPUB en el harvest', elegibles.length - conEpub.length);

// ── Capítulos, libro a libro ──
interface Hecho {
  id: string;
  libro: number;
  capitulo: string;
  texto: string;
  palabrasProsa: number;
  tramo: TramoDeCalibracion;
  reparto: Reparto;
}
const hechos: Hecho[] = [];
const tomadas = new Set<string>();
const descartados: Record<string, number> = {};
const fueraDelIndice: Record<string, number> = {};
const librosUsados: Libro[] = [];
const cuenta = (t: TramoDeCalibracion) => hechos.filter((h) => h.tramo === t && h.reparto === 'calibracion').length;
let agotado: string | null = null;
let epubsLeidos = 0;
try {
  for (const libro of ordenDeMuestra(SEMILLA, conEpub, (l) => String(l.id))) {
    if (TRAMOS.every((t) => cuenta(t) >= MINIMO)) break;
    // La URL del harvest, por http: el certificado de https://aleph.gutenberg.org no es suyo (ver cabecera).
    const url = epubDe.get(libro.id)!.replace(/^https:\/\/aleph\.gutenberg\.org\//, 'http://aleph.gutenberg.org/');
    const epub = await cacheado(`${FUENTE}epub/pg${libro.id}.epub`, url);
    epubsLeidos++;
    let capitulos;
    try {
      capitulos = capitulosDeEpub(leerZip(epub));
    } catch (e) {
      suma(descartados, `EPUB ilegible: ${(e as Error).message.replace(/ .*$/, '')}`);
      continue;
    }
    for (const f of capitulos.fuera) suma(fueraDelIndice, f.motivo);
    const medidos = capitulos.capitulos.flatMap((c) => {
      if (c.problemas.length > 0) {
        for (const p of c.problemas) suma(descartados, `extracción: ${p}`);
        return [];
      }
      const { palabrasProsa, tramo } = medirLongitud(c.texto);
      if (tramo === null) {
        suma(descartados, 'menos de 100 palabras de prosa');
        return [];
      }
      const id = `pg${libro.id}-${String(c.orden).padStart(3, '0')}`;
      return [{ id, libro: libro.id, capitulo: c.etiqueta, texto: c.texto, palabrasProsa, tramo, reparto: reparto(SEMILLA, id) }];
    });
    let usadoAlguno = false;
    for (const t of TRAMOS) {
      // [PROPIO] Un capítulo idéntico a uno ya tomado de otro libro (tomo suelto y obra completa, antologías) no entra dos veces.
      const nuevos = medidos.filter((m) => m.tramo === t && !tomadas.has(huella(m.texto)));
      suma(descartados, 'idéntico a un capítulo ya tomado de otro libro', medidos.filter((m) => m.tramo === t).length - nuevos.length);
      const delTramo = ordenDeMuestra(SEMILLA, nuevos, (m) => m.id);
      for (const m of delTramo.slice(0, TOPE_POR_LIBRO)) tomadas.add(huella(m.texto));
      hechos.push(...delTramo.slice(0, TOPE_POR_LIBRO));
      if (delTramo.length > 0) usadoAlguno = true;
      suma(descartados, `más de ${TOPE_POR_LIBRO} capítulos del mismo libro en su tramo`, Math.max(0, delTramo.length - TOPE_POR_LIBRO));
    }
    if (usadoAlguno) librosUsados.push(libro);
  }
} catch (e) {
  if (!(e instanceof PresupuestoAgotado)) {
    guardarRegistro();
    throw e;
  }
  agotado = e.message;
}
guardarRegistro();
for (const k of Object.keys(descartados)) if (descartados[k] === 0) delete descartados[k];

// ── Textos y manifiesto ──
rmSync(`${CORPUS}textos`, { recursive: true, force: true });
mkdirSync(`${CORPUS}textos`, { recursive: true });
const textos = new Map<string, string>();
const lista: DocumentoDelManifiesto[] = [];
for (const h of hechos) {
  writeFileSync(`${CORPUS}textos/${nombreDeFichero(h.id)}`, h.texto, 'utf8');
  textos.set(h.id, h.texto);
  lista.push({ id: h.id, sha256: huella(h.texto), palabrasProsa: h.palabrasProsa, tramo: h.tramo, libro: h.libro, capitulo: h.capitulo });
}
const total = registro.ejecuciones.reduce((a, e) => ({ p: a.p + e.peticiones, b: a.b + e.bytes, s: a.s + e.segundos }), { p: 0, b: 0, s: 0 });
const porTramo = Object.fromEntries(TRAMOS.map((t) => [t, lista.filter((d) => d.tramo === t).length])) as Manifiesto['n']['porTramo'];
const autoresUsados = [...new Set(librosUsados.flatMap((l) => l.personas.filter((p) => p.papel === null).map((p) => p.nombre)))].sort();

const manifiesto = prepararManifiesto(
  {
    genero: 'narrativa-clasica',
    fuente: {
      nombre: 'Project Gutenberg: catálogo CSV y EPUB (epub.noimages) del harvest en español',
      url: 'https://www.gutenberg.org/',
      ficheros: [
        { nombre: 'pg_catalog.csv', url: CATALOGO, bytes: catalogo.length, sha256: sha(catalogo) },
        { nombre: 'TRLPI consolidado (arts. 26 y 30, DT 4.ª)', url: TRLPI, bytes: trlpi.length, sha256: sha(trlpi) },
        { nombre: 'Ley de 10 de enero de 1879 (art. 6)', url: LEY_1879, bytes: ley1879.length, sha256: sha(ley1879) },
      ],
    },
    licencia: {
      nombre: 'Dominio público en España',
      literal: [...LITERALES_TRLPI.map((l) => `TRLPI: «${l}»`), `Ley de 10 de enero de 1879, art. 6: «…${LITERAL_1879}…»`],
      url: TRLPI,
      estado: `verificada por libro: todas las personas del registro del catálogo murieron en ${ULTIMO_ANIO_DE_MUERTE} o antes (vida + 80 años desde el 1 de enero siguiente)`,
      atribucion: 'Project Gutenberg (https://www.gutenberg.org); el autor y el título de cada libro, en el manifiesto',
    },
    documentacion: [
      { que: 'política de acceso de robots de Project Gutenberg (harvest, catálogo)', url: 'https://www.gutenberg.org/policy/robot_access.html' },
      { que: 'catálogo CSV', url: CATALOGO },
      { que: 'OPF 2.0.1: spine, toc, orden de lectura', url: 'https://idpf.org/epub/20/spec/OPF_2.0.1_draft.htm' },
      { que: 'ZIP (PKWARE APPNOTE 6.3.10)', url: 'https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT' },
      { que: 'TRLPI consolidado: arts. 26 y 30 y DT 4.ª', url: TRLPI },
      { que: 'Ley de 10 de enero de 1879, art. 6', url: LEY_1879 },
    ],
    filtros: [
      'catálogo: Type «Text», Language exactamente «es», «fiction» en Subjects, sin «[Translator]» (decisiones de la parada 1)',
      'catálogo, a la parada: fuera la traducción probable por Subjects («Translations into Spanish» o literatura no hispánica) y los libros de un autor cuya lengua propia en el catálogo (más libros sin traductor) no es el español',
      `catálogo: todas las personas del registro, con cualquier papel, con año de muerte y ${ULTIMO_ANIO_DE_MUERTE} o antes; sin año, fuera`,
      'documento = capítulo (epub.ts): de una entrada de toc.ncx a la siguiente, sin cabecera ni pie de Gutenberg, sin títulos, llamadas a nota ni números de página; fuera paratextos, preliminares (antes de la primera división numerada) y licencia',
      `libros en el orden de sha256("semilla|muestra|libro"); de cada libro, como mucho ${TOPE_POR_LIBRO} capítulos en cada tramo (los primeros por huella); hasta ${MINIMO} documentos de calibración por tramo`,
      'fuera: capítulos con problemas de extracción y de menos de 100 palabras de prosa',
    ],
    unidad: 'capítulo de un libro (entrada del índice del EPUB)',
    descarga: {
      fecha: new Date().toISOString().slice(0, 10),
      herramienta: 'motor/herramientas/calibrar/descargar-narrativa-clasica.ts',
      peticiones: total.p,
      bytes: total.b,
      segundos: total.s,
      notas: [
        `${registro.ejecuciones.length} ejecuciones; en caché, en motor/corpus/narrativa-clasica/fuente/: ${readdirSync(`${FUENTE}harvest`).length} páginas del harvest y ${readdirSync(`${FUENTE}epub`).length} EPUB`,
        ...(agotado === null ? [] : [`presupuesto de descarga agotado: ${agotado}`]),
        'exploración previa del 30/09/2026, fuera de este registro: 23 peticiones a www.gutenberg.org y aleph.gutenberg.org (robots.txt, catálogo, páginas del harvest de txt, html y epub, y un EPUB de muestra, pg12457, reutilizado); su tiempo NO CONSTA',
      ],
    },
    verificaciones: [
      { que: 'extracción de capítulos revisada a mano', resultado: REVISADOS_A_MANO.join('; ') },
      { que: 'lo que la revisión a mano vio que no es narración y sigue dentro (sin regla general que lo separe)', resultado: RESIDUOS_CONOCIDOS.join('; ') },
      {
        que: 'libros del catálogo con «es» en Language, fuera del filtro por motivo',
        resultado: Object.entries(fueraDelFiltro).map(([m, n]) => `${m}: ${n}`).join('; '),
      },
      { que: 'libros elegibles con EPUB en el harvest; EPUB leídos (en orden de huella) hasta llenar los tramos', resultado: `${conEpub.length} elegibles; ${epubsLeidos} leídos; ${librosUsados.length} con algún capítulo en la muestra` },
      { que: 'entradas del índice fuera, por motivo', resultado: Object.entries(fueraDelIndice).map(([m, n]) => `${m}: ${n}`).join('; ') },
      {
        que: 'capítulos con problemas de extracción',
        resultado:
          Object.entries(descartados)
            .filter(([m]) => m.startsWith('extracción:') || m.startsWith('EPUB'))
            .map(([m, n]) => `${m}: ${n}`)
            .join('; ') || 'ninguno',
      },
      { que: 'autores de los libros de la muestra (para revisar a mano las traducciones que se cuelen)', resultado: autoresUsados.join(' · ') },
    ],
    incidencias: [
      '30/09/2026: el harvest enlaza los EPUB en https://aleph.gutenberg.org, cuyo certificado TLS es de aleph.pglaf.org (ERR_TLS_CERT_ALTNAME_INVALID). Se piden las mismas URL por http; cada EPUB se comprueba por el CRC-32 de sus entradas.',
      '30/09/2026: el harvest de «txt» en español devuelve dos libros; se usa el de «epub.noimages» (914 enlaces en 11 páginas).',
    ],
    notas: [
      `«narrativa-clasica»: capítulos de novelas y cuentos en español de autores muertos en ${ULTIMO_ANIO_DE_MUERTE} o antes (dominio público en España): SESGO DE ÉPOCA (siglos XVI a XX, sobre todo XIX); no es narrativa contemporánea.`,
      'Las traducciones sin traductor declarado se filtran por heurísticas del catálogo (Subjects y lengua propia del autor); puede colarse alguna: los autores de la muestra están en el manifiesto.',
      `Documento = capítulo; como mucho ${TOPE_POR_LIBRO} por libro en cada tramo.`,
      `Revisión a mano: quedan dentro, declarados, unos pocos capítulos que no son narración (${RESIDUOS_CONOCIDOS.join('; ')}).`,
    ],
    libros: librosUsados
      .map((l) => ({ id: l.id, titulo: l.titulo, autores: l.autores, muerte: Math.max(...l.personas.map((p) => p.muerte!)), materias: l.materias }))
      .sort((a, b) => a.id - b.id),
    n: { documentos: lista.length, descartados: { ...descartados, ...Object.fromEntries(Object.entries(fueraDelIndice).map(([m, n]) => [`entrada del índice fuera: ${m}`, n])) }, porTramo },
    documentos: lista,
  },
  textos,
);
writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n', 'utf8');

console.log(`narrativa-clasica: ${lista.length} capítulos de ${librosUsados.length} libros (${epubsLeidos} EPUB leídos de ${conEpub.length} elegibles)`);
console.log(`  calibración por tramo: ${TRAMOS.map((t) => `${t} ${cuenta(t)}`).join(' · ')}; documentos por tramo: ${TRAMOS.map((t) => `${t} ${porTramo[t]}`).join(' · ')}`);
console.log(`  fuera del filtro: ${JSON.stringify(fueraDelFiltro)}`);
console.log(`  entradas del índice fuera: ${JSON.stringify(fueraDelIndice)}`);
console.log(`  descartados: ${JSON.stringify(descartados)}`);
console.log(`  red, esta ejecución: ${cliente.peticiones} peticiones, ${cliente.bytes} bytes, ${Math.round(cliente.transcurridoMs / 1000)} s; en total: ${total.p} peticiones, ${Math.round(total.b / 1e6)} MB, ${total.s} s de ${PRESUPUESTO_TOTAL_MS / 1000}`);
if (agotado !== null) console.log(`  ⚠️ ${agotado}`);
for (const t of TRAMOS) if (cuenta(t) < MINIMO) console.log(`  ⚠️ ${t}: ${cuenta(t)} de calibración, por debajo de ${MINIMO}: la celda no existirá`);
