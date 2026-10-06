/**
 * La publicación de la web (encargo 11.2; decisiones de Antonio del 06/10): lo que `npm run publicar`
 * (web/scripts/publicar.ts) hace con un dist/ ya construido y probado, en piezas que el juez
 * (jueces/publicacion.spec.ts) prueba con un dist/ de prueba y un repositorio de git temporal, sin build ni red.
 *
 *   · La CSP de la web: la del <meta http-equiv> de cada página, que tiene que ser la misma en todas.
 *   · El .htaccess: la plantilla (publicacion/.htaccess.plantilla) con esa CSP en su marca.
 *   · Lo que el .htaccess dice de cada fichero: su grupo de caché, por su nombre.
 *   · La rama `publicacion`: huérfana, con el contenido exacto de dist/ y nada más, escrita en un git worktree aparte, sin
 *     tocar el árbol de trabajo ni la rama en la que se está.
 *
 * Lo que se publica tiene que ser, byte a byte, lo que se probó. git, con core.autocrlf=true (el de esta máquina),
 * pasaría a LF los ficheros de texto con CRLF al añadirlos, y dist/ los lleva: los dos paquetes y las dos licencias de
 * las fuentes, que el checkout de Windows deja en CRLF (visto el 06/10 en el dist/ de 87c80b4). Por eso cada orden de git
 * va con core.autocrlf=false, y al final se compara el árbol del commit con dist/, fichero a fichero, por su id de git
 * sin filtros.
 * [DOC] https://git-scm.com/docs/gitattributes — «If the text attribute is unspecified, Git uses the core.autocrlf
 *    configuration variable to determine if the file should be converted»; con text=auto, «If it is text and the file
 *    was not already in Git with CRLF endings, line endings are converted on checkin».
 * [DOC] https://git-scm.com/docs/git-worktree — add: «Create a worktree at <path> and checkout <commit-ish> into it.
 *    The new worktree is linked to the current repository»; --orphan: «With add, make the new worktree and index empty,
 *    associating the worktree with a new unborn branch named <new-branch>»; «remove refuses to remove an unclean
 *    worktree unless --force is used».
 * [DOC] https://git-scm.com/docs/git-add — --force: «Allow adding otherwise ignored files»: un fichero de dist/ que
 *    casara con un patrón de ignorar global no se queda fuera sin avisar.
 * [DOC] https://git-scm.com/docs/git-hash-object — --no-filters: «Hash the contents as is, ignoring any input filter»;
 *    --stdin-paths: «Read file names from the standard input, one per line».
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

/** La rama que el panel de Hostinger despliega en el directorio del subdominio. */
export const RAMA = 'publicacion';
/** Dónde va la CSP en la plantilla del .htaccess. */
export const MARCA_DE_LA_CSP = '{{CSP}}';

/** git con la conversión de finales de línea apagada (arriba); devuelve lo que imprime, sin el salto final. */
export function git(cwd: string, ...argumentos: string[]): string {
  return execFileSync('git', ['-c', 'core.autocrlf=false', '-c', 'core.safecrlf=false', ...argumentos], { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).replace(/\n$/, '');
}

/** Los ficheros de un directorio, a cualquier profundidad, con su ruta relativa con «/», en orden. */
export function ficherosDe(raiz: string): string[] {
  return readdirSync(raiz, { recursive: true, encoding: 'utf8' })
    .filter((f) => statSync(join(raiz, f)).isFile())
    .map((f) => f.replaceAll('\\', '/'))
    .sort();
}

/** Un fichero de lo que se publica: su ruta, sus bytes y su sha256. */
export interface Fichero {
  ruta: string;
  bytes: number;
  sha256: string;
}

/** Cada fichero de un directorio, con sus bytes y su sha256, y la huella del conjunto: el sha256 de la lista de rutas y huellas. */
export function huellaDe(raiz: string): { ficheros: Fichero[]; total: string } {
  const ficheros = ficherosDe(raiz).map((ruta) => {
    const contenido = readFileSync(join(raiz, ruta));
    return { ruta, bytes: contenido.length, sha256: createHash('sha256').update(contenido).digest('hex') };
  });
  return { ficheros, total: createHash('sha256').update(ficheros.map((f) => `${f.ruta} ${f.sha256}\n`).join('')).digest('hex') };
}

/** Las entidades que escribe Astro al escapar un atributo (las mismas que lee jueces/apoyo.ts). */
const ENTIDADES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodificar(texto: string): string {
  return texto.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entidad, nombre: string) => {
    if (/^#x/i.test(nombre)) return String.fromCodePoint(parseInt(nombre.slice(2), 16));
    if (nombre.startsWith('#')) return String.fromCodePoint(parseInt(nombre.slice(1), 10));
    const caracter = ENTIDADES[nombre];
    if (caracter === undefined) throw new Error(`la CSP lleva una entidad que no sé leer: ${entidad}`);
    return caracter;
  });
}

const META_DE_LA_CSP = /<meta http-equiv="content-security-policy" content="([^"]*)">/gi;

/** La CSP de una página: el contenido de su único <meta http-equiv="content-security-policy">, con las entidades leídas. */
export function cspDelMeta(html: string): string {
  const metas = [...html.matchAll(META_DE_LA_CSP)];
  if (metas.length !== 1) throw new Error(`la página lleva ${metas.length} <meta> de CSP y tiene que llevar uno`);
  return decodificar(metas[0]![1]!);
}

/**
 * La CSP de la web: la del <meta> de cada página de dist/, que tiene que ser la misma en todas. Si no lo fuera, una
 * cabecera para todo el sitio no podría ser igual al <meta> de cada página, y para (la sutura del encargo: si la CSP por
 * cabecera y la del <meta> pudieran divergir, PARA). Hoy Astro escribe la misma en las 54 (visto el 06/10).
 */
export function cspDeLaWeb(dist: string): string {
  const porCsp = new Map<string, string[]>();
  for (const pagina of ficherosDe(dist).filter((f) => f.endsWith('.html'))) {
    const csp = cspDelMeta(readFileSync(join(dist, pagina), 'utf8'));
    porCsp.set(csp, [...(porCsp.get(csp) ?? []), pagina]);
  }
  if (porCsp.size === 0) throw new Error(`${dist} no tiene ninguna página`);
  if (porCsp.size > 1) throw new Error(`la CSP del <meta> no es la misma en todas las páginas (${porCsp.size} distintas, en ${[...porCsp.values()].map((p) => p[0]).join(', ')}…): una cabecera no podría ser igual a todas`);
  return [...porCsp.keys()][0]!;
}

/**
 * El .htaccess: la plantilla, con saltos \n, y la CSP en su marca. Para si la marca no está una vez, o si la CSP lleva
 * algo que la directiva Header no admite tal cual: comillas, barras invertidas, saltos de línea o «%».
 * [DOC] https://httpd.apache.org/docs/2.4/mod/mod_headers.html#header — «If value contains spaces, it should be
 *    surrounded by double quotes. value may be a character string, a string containing mod_headers specific format
 *    specifiers (and character literals)»: los formatos empiezan por «%».
 */
export function htaccessDesde(plantilla: string, csp: string): string {
  const texto = plantilla.replace(/\r\n/g, '\n');
  const veces = texto.split(MARCA_DE_LA_CSP).length - 1;
  if (veces !== 1) throw new Error(`la plantilla lleva la marca ${MARCA_DE_LA_CSP} ${veces} veces y tiene que llevarla una`);
  if (csp.trim() === '') throw new Error('la CSP está vacía');
  if (/["\\%\r\n]/.test(csp)) throw new Error(`la CSP lleva un carácter que la directiva Header no admite tal cual: ${csp}`);
  return texto.replace(MARCA_DE_LA_CSP, () => csp);
}

/** Un grupo de caché del .htaccess: el patrón de su <FilesMatch> y el Cache-Control que pone. */
export interface GrupoDeCache {
  patron: string;
  cacheControl: string;
}

const GRUPO = /^<FilesMatch "([^"]+)">\n {2}Header set Cache-Control "([^"]+)"\n<\/FilesMatch>$/gm;

/** Los grupos de caché de un .htaccess, en su orden. Para si algún <FilesMatch> no tiene esa forma: el reparto no lo vería. */
export function gruposDeCache(htaccess: string): GrupoDeCache[] {
  const texto = htaccess.replace(/\r\n/g, '\n');
  const grupos = [...texto.matchAll(GRUPO)].map((m) => ({ patron: m[1]!, cacheControl: m[2]! }));
  const bloques = (texto.match(/<FilesMatch\b/g) ?? []).length;
  if (grupos.length !== bloques) throw new Error(`el .htaccess lleva ${bloques} <FilesMatch> y ${grupos.length} con la forma de un grupo de caché`);
  return grupos;
}

/**
 * El grupo de caché de cada fichero, por su nombre (FilesMatch mira el nombre, no la ruta). Para si alguno no cae en
 * ninguno o cae en más de uno; y si un grupo inmutable recibe un fichero sin la huella de su contenido en el nombre, en
 * _astro/ (nombre.XXXXXXXX.ext): un cambio suyo no llegaría en un año.
 * [DOC] https://httpd.apache.org/docs/2.4/mod/core.html#filesmatch — «limits the scope of the enclosed directives by
 *    filename, just as the <Files> directive does. However, it accepts a regular expression».
 */
export function repartir(ficheros: readonly string[], grupos: readonly GrupoDeCache[]): Map<GrupoDeCache, string[]> {
  const reparto = new Map(grupos.map((g) => [g, [] as string[]]));
  const mal: string[] = [];
  for (const fichero of ficheros) {
    const suyos = grupos.filter((g) => new RegExp(g.patron).test(basename(fichero)));
    if (suyos.length !== 1) mal.push(`${fichero}: cae en ${suyos.length} grupos`);
    else if (suyos[0]!.cacheControl.includes('immutable') && !/^_astro\/[^/]+\.[A-Za-z0-9_-]{8}\.[a-z0-9]+$/.test(fichero)) mal.push(`${fichero}: inmutable sin la huella en el nombre, en _astro/`);
    else reparto.get(suyos[0]!)!.push(fichero);
  }
  if (mal.length > 0) throw new Error(`cada fichero tiene que caer en un grupo de caché, y en uno solo:\n  ${mal.join('\n  ')}`);
  return reparto;
}

/** Las rutas de las páginas de error que nombra el .htaccess (ErrorDocument con una ruta local), sin la barra de delante. */
export function paginasDeError(htaccess: string): string[] {
  return [...htaccess.matchAll(/^ErrorDocument \d{3} \/(\S+)$/gm)].map((m) => m[1]!);
}

/** Lo que no se publica nunca: los mapas de fuente. dist/ no los lleva hoy; si un día los llevara, para. */
export function comprobarQueNoHayMapas(ficheros: readonly string[]): void {
  const mapas = ficheros.filter((f) => f.endsWith('.map'));
  if (mapas.length > 0) throw new Error(`dist/ lleva mapas de fuente, que no se publican: ${mapas.join(', ')}`);
}

/** Una fecha en hora local, con su desfase: «2026-10-06 18:42:05 +0200». */
export function fechaLocal(fecha: Date): string {
  const dos = (n: number): string => String(n).padStart(2, '0');
  const desfase = -fecha.getTimezoneOffset();
  const signo = desfase >= 0 ? '+' : '-';
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())} ${signo}${dos(Math.floor(Math.abs(desfase) / 60))}${dos(Math.abs(desfase) % 60)}`;
}

/** El mensaje del commit de la rama publicacion: de qué main sale y cuándo. */
export function mensajeDeLaPublicacion(main: string, fecha: Date): string {
  return `publicación: web/dist/ y su .htaccess, de main ${main}, del ${fechaLocal(fecha)}`;
}

/** El commit que apunta una rama, o null si no existe. */
export function puntaDe(repo: string, rama: string): string | null {
  try {
    return git(repo, 'rev-parse', '--verify', '--quiet', `refs/heads/${rama}`);
  } catch {
    return null;
  }
}

/**
 * Pone en la rama `publicacion` del repositorio `repo` el contenido exacto de `dist` (con su .htaccess ya escrito): en un
 * worktree aparte, en el temporal, que se borra al terminar. Si la rama no existe, la crea huérfana; si existe, el commit
 * nuevo va encima del anterior, con lo que sale, lo que entra y lo que cambia. Si no cambia nada, no hace commit y
 * devuelve null. Antes de devolver el commit, comprueba que su árbol es dist/, fichero a fichero y byte a byte.
 */
export function actualizarRama(repo: string, dist: string, mensaje: string): string | null {
  comprobarQueNoHayMapas(ficherosDe(dist));
  if (!existsSync(join(dist, '.htaccess'))) throw new Error(`${dist} no lleva el .htaccess: se escribe antes de publicar`);
  const existia = puntaDe(repo, RAMA) !== null;
  const fuera = mkdtempSync(join(realpathSync.native(tmpdir()), 'radiografia-publicacion-'));
  const arbol = join(fuera, RAMA);
  let creado = false;
  try {
    if (existia) git(repo, 'worktree', 'add', '--quiet', arbol, RAMA);
    else git(repo, 'worktree', 'add', '--quiet', '--orphan', '-b', RAMA, arbol);
    creado = true;
    for (const entrada of readdirSync(arbol)) if (entrada !== '.git') rmSync(join(arbol, entrada), { recursive: true, force: true });
    cpSync(dist, arbol, { recursive: true });
    git(arbol, 'add', '--all', '--force', '.');
    if (git(arbol, 'status', '--porcelain') === '') return null;
    git(arbol, 'commit', '--quiet', '-m', mensaje);
    const commit = git(arbol, 'rev-parse', 'HEAD');
    comprobarArbol(repo, commit, dist);
    return commit;
  } finally {
    if (creado) git(repo, 'worktree', 'remove', '--force', arbol);
    rmSync(fuera, { recursive: true, force: true });
    git(repo, 'worktree', 'prune');
  }
}

/** El árbol del commit es el de dist/, ni más ni menos, y cada fichero con su contenido tal cual (su id de git, sin filtros). */
function comprobarArbol(repo: string, commit: string, dist: string): void {
  const enElCommit = new Map(
    git(repo, 'ls-tree', '-r', '-z', commit)
      .split('\0')
      .filter((l) => l !== '')
      .map((l) => {
        const [meta, ruta] = l.split('\t') as [string, string];
        return [ruta, meta.split(' ')[2]!] as const;
      }),
  );
  const rutas = ficherosDe(dist);
  const ids = execFileSync('git', ['hash-object', '--no-filters', '--stdin-paths'], { cwd: repo, input: rutas.map((r) => join(dist, r)).join('\n') + '\n', encoding: 'utf8' }).trim().split('\n');
  const mal = [
    ...rutas.filter((r, i) => enElCommit.get(r) !== ids[i]).map((r) => `${r}: ${enElCommit.has(r) ? 'otro contenido' : 'no está'} en el commit`),
    ...[...enElCommit.keys()].filter((r) => !rutas.includes(r)).map((r) => `${r}: está en el commit y no en dist/`),
  ];
  if (mal.length > 0) throw new Error(`el commit ${commit} no es dist/:\n  ${mal.join('\n  ')}`);
}
