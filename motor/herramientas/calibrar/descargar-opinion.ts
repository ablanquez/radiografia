/**
 * Descarga el corpus de «opinion» para la calibración (encargo 5.5): las
 * críticas de cine de usuarios de MuchoCine (www.muchocine.net, hacia
 * 2005-2008), del repositorio de ITALIC-US, y deja en motor/corpus/opinion/
 * un texto por crítica y el manifiesto motor/corpus/opinion.manifiesto.json
 * (sin texto). Se ejecuta a mano:
 *
 *   node herramientas/calibrar/descargar-opinion.ts   (desde motor/)
 *
 * [DOC] Repositorio: https://github.com/ITALIC-US/Spanish-Movie-Reviews,
 *    fijado en el commit COMMIT (refs/heads/main el 30/09/2026). Se clona con
 *    git, sin historia (--depth 1), sin blobs salvo los que se necesitan
 *    (--filter=blob:none) y solo README.md, LICENSE y reviews_*\/xml/*.xml
 *    (sparse-checkout): los .pos y .dep no se bajan. git pide
 *    /<org>/<repo>/info/refs y /<org>/<repo>/git-upload-pack: el robots.txt
 *    de github.com, leído en cada ejecución (robots.ts), no los veta para
 *    «*» (sí «/*.git$» y «/.git/»: la URL va sin «.git»). Si los vetara, PARA.
 * [DOC] Licencia, leída en el propio commit (si el literal no está, PARA):
 *    el README dice que las críticas se usan «under the terms of the Creative
 *    Commons license (http://creativecommons.org/license/by/2.1/es)»; el
 *    LICENSE es MIT y cubre el «Software». La CC BY 2.1 ES la DECLARAN
 *    TERCEROS (los curadores): no se ha verificado en muchocine.net
 *    (corpus.md: «solo cifras, sin muestras»). Nada del texto va a data/.
 * [PROPIO, decisión de Antonio a la parada 1] De cada crítica, solo su
 *    cuerpo (muchocine.ts). Entran TODAS: el tramo de cada una es el suyo.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SEMILLA, TRAMOS, huella, medirLongitud, reparto } from './comun.ts';
import { nombreDeFichero, prepararManifiesto, type DocumentoDelManifiesto, type Manifiesto } from './manifiesto.ts';
import { leerCritica } from './muchocine.ts';
import { Cliente } from './red.ts';
import { permitido, reglasPara } from './robots.ts';

const REPO = 'https://github.com/ITALIC-US/Spanish-Movie-Reviews';
const COMMIT = '4f8efab64a5366ec4fd3a241df1292ab75746464';
const PATRONES = ['/README.md', '/LICENSE', '/reviews_*/xml/*.xml'];
const LITERAL_README = 'The content of the reviews has been extracted from the website www.muchocine.net and used under the terms of the Creative Commons license (http://creativecommons.org/license/by/2.1/es)';
const LITERALES_LICENSE = ['MIT License', 'Copyright (c) 2022 ITALIC-US', 'Permission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software")'];
const CITA = 'Cruz, F. L., Troyano, J. A., Enriquez, F., & Ortega, J. (2008). Clasificación de documentos basada en la opinión: experimentos con un corpus de críticas de cine en español. Procesamiento del lenguaje natural, 41.';

const CORPUS = fileURLToPath(new URL('../../corpus/opinion/', import.meta.url));
const FUENTE = `${CORPUS}fuente/`;
const CLON = `${FUENTE}repo/`;
const MANIFIESTO = fileURLToPath(new URL('../../corpus/opinion.manifiesto.json', import.meta.url));
const REGISTRO = `${FUENTE}registro.json`;

interface Registro {
  ejecuciones: { fecha: string; peticiones: number | null; bytes: number | null; segundos: number; nota?: string }[];
}
mkdirSync(FUENTE, { recursive: true });
const registro: Registro = existsSync(REGISTRO) ? (JSON.parse(readFileSync(REGISTRO, 'utf8')) as Registro) : { ejecuciones: [] };
const inicio = Date.now();
const cliente = new Cliente({ agente: 'RadiografIA-calibracion', contacto: 'https://github.com/ablanquez/radiografia', pausaMs: 1000, presupuestoMs: 30 * 60_000 });
let notaDeRed = '';
let registrada = false;
const guardarRegistro = () => {
  if (registrada) return;
  registrada = true;
  registro.ejecuciones.push({ fecha: new Date().toISOString(), peticiones: cliente.peticiones, bytes: cliente.bytes, segundos: Math.round((Date.now() - inicio) / 1000), ...(notaDeRed === '' ? {} : { nota: notaDeRed }) });
  writeFileSync(REGISTRO, JSON.stringify(registro, null, 2) + '\n', 'utf8');
};
process.once('exit', guardarRegistro);
const git = (...args: string[]) => execFileSync('git', args, { cwd: CLON, encoding: 'utf8', env: { ...process.env, MSYS_NO_PATHCONV: '1' } }).trim();
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');

// ── robots.txt de github.com ──
const robots = await cliente.obtener('https://github.com/robots.txt');
const reglas = reglasPara(robots.cuerpo.toString('utf8'), 'RadiografIA-calibracion');
const rutas = ['/ITALIC-US/Spanish-Movie-Reviews/info/refs', '/ITALIC-US/Spanish-Movie-Reviews/git-upload-pack'];
for (const r of rutas) if (!permitido(reglas, r)) throw new Error(`PARA: el robots.txt de github.com veta ${r}`);

// ── Clon, en caché si ya está en el commit ──
const clonado = existsSync(`${CLON}.git`) && git('rev-parse', 'HEAD') === COMMIT;
if (!clonado) {
  rmSync(CLON, { recursive: true, force: true });
  mkdirSync(CLON, { recursive: true });
  const t0 = Date.now();
  git('init', '-q');
  git('remote', 'add', 'origin', REPO);
  git('fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', COMMIT);
  git('sparse-checkout', 'set', '--no-cone', ...PATRONES);
  git('checkout', '-q', COMMIT);
  notaDeRed = `git: fetch del commit y checkout disperso en ${Math.round((Date.now() - t0) / 1000)} s; peticiones HTTP y bytes de git, NO CONSTA`;
}
if (git('rev-parse', 'HEAD') !== COMMIT) throw new Error(`PARA: el clon no está en ${COMMIT}`);

// ── Licencia, en el commit ──
const readme = readFileSync(`${CLON}README.md`);
const license = readFileSync(`${CLON}LICENSE`);
if (!readme.toString('utf8').replace(/\s+/g, ' ').includes(LITERAL_README)) throw new Error('PARA: el README no dice lo que se esperaba de la licencia');
for (const l of LITERALES_LICENSE) if (!license.toString('utf8').replace(/\r\n/g, '\n').includes(l)) throw new Error(`PARA: el LICENSE no dice «${l.slice(0, 40)}…»`);

// ── Críticas ──
const ficheros = readdirSync(CLON)
  .filter((d) => /^reviews_\d+$/.test(d))
  .flatMap((d) => readdirSync(`${CLON}${d}/xml`).map((f) => ({ carpeta: d, fichero: f })))
  .filter((x) => /^\d+\.xml$/.test(x.fichero));
const descartados: Record<string, number> = {};
const suma = (m: string) => (descartados[m] = (descartados[m] ?? 0) + 1);
const conDesconocidas: string[] = [];
const textos = new Map<string, string>();
const lista: DocumentoDelManifiesto[] = [];
const vistos = new Set<string>();
for (const { carpeta, fichero } of ficheros) {
  const id = `mc-${fichero.replace('.xml', '')}`;
  if (vistos.has(id)) throw new Error(`PARA: ${id} está dos veces`);
  vistos.add(id);
  const c = leerCritica(readFileSync(`${CLON}${carpeta}/xml/${fichero}`));
  if (c.desconocidas.length > 0) conDesconocidas.push(`${id} (${c.desconocidas.join(' ')})`);
  const { palabrasProsa, tramo } = medirLongitud(c.cuerpo);
  if (tramo === null) {
    suma('menos de 100 palabras de prosa');
    continue;
  }
  textos.set(id, c.cuerpo);
  lista.push({ id, sha256: huella(c.cuerpo), palabrasProsa, tramo, nota: c.rango, carpeta });
}
lista.sort((a, b) => Number(a.id.slice(3)) - Number(b.id.slice(3)));
rmSync(`${CORPUS}textos`, { recursive: true, force: true });
mkdirSync(`${CORPUS}textos`, { recursive: true });
for (const [id, t] of textos) writeFileSync(`${CORPUS}textos/${nombreDeFichero(id)}`, t, 'utf8');

guardarRegistro();
const tot = registro.ejecuciones.reduce((a, e) => ({ s: a.s + e.segundos }), { s: 0 });
const porTramo = Object.fromEntries(TRAMOS.map((t) => [t, lista.filter((d) => d.tramo === t).length])) as Manifiesto['n']['porTramo'];
const calibracion = Object.fromEntries(TRAMOS.map((t) => [t, lista.filter((d) => d.tramo === t && reparto(SEMILLA, d.id) === 'calibracion').length]));
const bytesGit = (dir: string): number =>
  readdirSync(dir, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? bytesGit(`${dir}/${e.name}`) : statSync(`${dir}/${e.name}`).size), 0);

const manifiesto = prepararManifiesto(
  {
    genero: 'opinion',
    fuente: {
      nombre: 'MuchoCine: críticas de cine de usuarios (ITALIC-US, Spanish-Movie-Reviews)',
      version: `commit ${COMMIT}`,
      url: REPO,
      ficheros: [
        { nombre: 'README.md', url: `${REPO}/blob/${COMMIT}/README.md`, bytes: readme.length, sha256: sha(readme), blobGit: git('rev-parse', `${COMMIT}:README.md`) },
        { nombre: 'LICENSE', url: `${REPO}/blob/${COMMIT}/LICENSE`, bytes: license.length, sha256: sha(license), blobGit: git('rev-parse', `${COMMIT}:LICENSE`) },
        { nombre: `reviews_*/xml/*.xml (${ficheros.length} ficheros; árbol de Git del commit ${git('rev-parse', `${COMMIT}^{tree}`)})`, url: `${REPO}/tree/${COMMIT}`, bytes: ficheros.reduce((s, f) => s + statSync(`${CLON}${f.carpeta}/xml/${f.fichero}`).size, 0) },
      ],
    },
    licencia: {
      nombre: 'CC BY 2.1 ES',
      literal: [
        `README.md del commit: «${LITERAL_README}»`,
        'LICENSE del commit: «MIT License» «Copyright (c) 2022 ITALIC-US», para «this software and associated documentation files (the "Software")»: no habla de las críticas',
      ],
      url: 'https://creativecommons.org/licenses/by/2.1/es/',
      estado: 'declarada por terceros: los curadores (ITALIC-US) la declaran en su README; NO verificada en muchocine.net; el LICENSE (MIT) es del repositorio, no de las críticas',
      atribucion: `críticas de www.muchocine.net, recogidas por ${CITA}`,
    },
    documentacion: [
      { que: 'repositorio y README (contenido y cita)', url: REPO },
      { que: 'robots.txt de github.com (no veta info/refs ni git-upload-pack para «*»)', url: 'https://github.com/robots.txt' },
      { que: 'clon parcial y disperso de git', url: 'https://git-scm.com/docs/git-sparse-checkout' },
      { que: 'licencia declarada (CC BY 2.1 ES)', url: 'https://creativecommons.org/licenses/by/2.1/es/' },
    ],
    filtros: [
      'todas las críticas del commit (reviews_*/xml/*.xml); de cada una, solo el cuerpo (<body>), no el resumen ni la nota',
      'ISO-8859-1 (comprobado: ninguna es UTF-8 válido y ninguna tiene bytes 0x80-0x9F); entidades decodificadas; lo que parece una entidad y no lo es se queda como texto',
      'fuera las de menos de 100 palabras de prosa; el tramo de cada crítica es el suyo (sin fragmentos ni tope)',
    ],
    unidad: 'crítica de cine de un usuario de MuchoCine (su cuerpo)',
    descarga: {
      fecha: new Date().toISOString().slice(0, 10),
      herramienta: 'motor/herramientas/calibrar/descargar-opinion.ts',
      peticiones: registro.ejecuciones.reduce((s, e) => s + (e.peticiones ?? 0), 0),
      bytes: bytesGit(`${CLON}.git`),
      segundos: tot.s,
      notas: [
        `${registro.ejecuciones.length} ejecuciones (fuente/registro.json); peticiones: las de robots.txt por el cliente; las de git NO CONSTAN; bytes: lo que ocupa .git del clon`,
        ...registro.ejecuciones.flatMap((e) => (e.nota === undefined ? [] : [e.nota])),
        'exploración previa del 30/09/2026, fuera de este registro: README.md, LICENSE y el índice del repositorio (api.github.com y raw.githubusercontent.com), tres peticiones; su tiempo NO CONSTA',
      ],
    },
    verificaciones: [
      { que: 'críticas en el commit; con cuerpo de 100 palabras de prosa o más', resultado: `${ficheros.length}; ${lista.length}` },
      { que: 'cuerpos con algo que parece una entidad y no lo es (se dejan como texto)', resultado: conDesconocidas.join('; ') || 'ninguno' },
      { que: 'de calibración por tramo (sha256("semilla|id") < 0,8)', resultado: TRAMOS.map((t) => `${t}: ${calibracion[t]}`).join('; ') },
    ],
    notas: [
      '«opinion»: críticas de cine de aficionados, España, hacia 2005-2008 (el corpus se publicó en 2008), registro semiformal; no es columna de opinión de prensa.',
      'Licencia DECLARADA POR TERCEROS (los curadores), no verificada en origen: solo se publican cifras, sin muestras de texto (corpus.md).',
      'El repositorio tiene 3.878 críticas; la investigación (corpus.md) hablaba de 3.872.',
    ],
    n: { documentos: lista.length, descartados, porTramo },
    documentos: lista,
  },
  textos,
);
writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n', 'utf8');

console.log(`opinion: ${lista.length} críticas de ${ficheros.length} (commit ${COMMIT.slice(0, 7)})`);
console.log(`  por tramo: ${TRAMOS.map((t) => `${t} ${porTramo[t]} (${calibracion[t]} de calibración)`).join(' · ')}`);
console.log(`  descartados: ${JSON.stringify(descartados)}; con «entidades» que no lo son: ${conDesconocidas.length}`);
for (const t of TRAMOS) if (calibracion[t]! < 100) console.log(`  ⚠️ ${t}: ${calibracion[t]} de calibración, por debajo de 100: la celda no existirá`);
