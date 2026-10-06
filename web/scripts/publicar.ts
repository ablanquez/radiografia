/**
 * `npm run publicar`, en la raíz del repositorio (encargo 11.2; decisiones de Antonio del 06/10): deja la rama
 * `publicacion` lista para que Antonio la empuje, con el contenido exacto de web/dist/ y su .htaccess, y nada más. El
 * panel de Hostinger despliega esa rama en el directorio del subdominio y no ejecuta ningún build.
 * [DOC] https://docs.hostinger.com/websites/git — «Does not run a build step — the files committed to the repo are the
 *    files served»; «Use a dedicated production branch to batch changes and control what ships»; con la app de GitHub,
 *    «You push to the connected branch. GitHub notifies Hostinger via webhook. Hostinger pulls the latest code».
 *
 * No toca el árbol de trabajo (allí node_modules no se puede leer: el cabo del 10.4). Lo que instala, prueba y construye
 * va en un clon temporal, fuera del repositorio, que se borra si todo sale bien; la rama se escribe en un git worktree
 * aparte (web/publicacion/publicacion.ts). Por orden:
 *
 *   1. El árbol, limpio; la rama, main; y main, igual a origin/main después de traer origin (firmado por Antonio el
 *      06/10: el hash de main que lleva el commit de la publicación existe en GitHub).
 *   2. En un clon temporal de ese commit, con la configuración de git de la máquina (la de los clones de verificación):
 *      npm ci, los tipos, los jueces del motor y los de la web, con Chrome.
 *   3. Dos builds, cada uno desde un dist/ vacío: tienen que dar el mismo dist/, fichero a fichero (su huella).
 *   4. El .htaccess, desde web/publicacion/.htaccess.plantilla del mismo commit, con la CSP del <meta> de las páginas (la
 *      misma en todas, o para), escrito en dist/; cada fichero, en un grupo de caché y en uno solo; y las páginas de error
 *      que nombra, en dist/.
 *   5. La rama `publicacion`, con el contenido exacto de dist/, comprobado byte a byte.
 *   6. Lo que va a subir, fichero a fichero, con sus bytes y su sha256, por grupo de caché, con las cabeceras de cada
 *      grupo; y la orden para empujar. El push lo da Antonio.
 *
 * Si algo falla, para, dice dónde y deja el clon temporal para mirarlo.
 *
 * [PROPIO] Astro, con la telemetría apagada (ASTRO_TELEMETRY_DISABLED=1), como en los jueces (jueces/apoyo.ts).
 * [DOC] https://nodejs.org/api/child_process.html — npm es un .cmd en Windows y se lanza con execSync (pasa por la
 *    shell; órdenes fijas).
 */
import { execFileSync, execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  actualizarRama,
  cspDeLaWeb,
  type Fichero,
  git,
  gruposDeCache,
  htaccessDesde,
  huellaDe,
  mensajeDeLaPublicacion,
  paginasDeError,
  RAMA,
  repartir,
} from '../publicacion/publicacion.ts';

const ENTORNO = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };
const INICIO = Date.now();

/** Un motivo para parar: se dice y el script sale con 1. */
class Parada extends Error {}

function decir(texto: string): void {
  const s = Math.round((Date.now() - INICIO) / 1000);
  console.log(`[${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}] ${texto}`);
}

const miles = (n: number): string => n.toLocaleString('es-ES');

/** Una orden en el clon, con su salida (y la de error) en un fichero del temporal; si falla, para con sus últimas líneas. */
function paso(nombre: string, orden: string, cwd: string, registro: string): string {
  decir(`${nombre}: ${orden}`);
  try {
    const salida = execSync(`${orden} 2>&1`, { cwd, env: ENTORNO, encoding: 'utf8', stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 });
    writeFileSync(registro, salida);
    return salida;
  } catch (fallo) {
    const salida = String((fallo as { stdout?: unknown }).stdout ?? fallo);
    writeFileSync(registro, salida);
    throw new Parada(`${nombre} falló. Las últimas líneas (todas, en ${registro}):\n${salida.trimEnd().split('\n').slice(-30).join('\n')}`);
  }
}

/** Las líneas de resumen de node --test (tests, pass, fail…). */
const resumen = (salida: string): string => [...salida.matchAll(/^ℹ (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm)].map((m) => `${m[1]} ${m[2]}`).join(', ');

function publicar(): void {
  // 1. El árbol, la rama y origin.
  const raiz = git(process.cwd(), 'rev-parse', '--show-toplevel');
  if (git(raiz, 'status', '--porcelain') !== '') throw new Parada(`el árbol de trabajo de ${raiz} no está limpio (git status): se publica un commit, no lo que haya sin guardar`);
  const rama = git(raiz, 'branch', '--show-current');
  if (rama !== 'main') throw new Parada(`la rama es «${rama}» y se publica desde main`);
  decir('trayendo origin');
  git(raiz, 'fetch', '--quiet', 'origin');
  const main = git(raiz, 'rev-parse', 'HEAD');
  const remoto = git(raiz, 'rev-parse', 'refs/remotes/origin/main');
  if (main !== remoto) throw new Parada(`main (${main}) no es origin/main (${remoto}): empuja main, o trae lo que falte, antes de publicar`);
  decir(`main = origin/main = ${main}`);

  // 2. El clon temporal, con su instalación, sus tipos y sus jueces.
  const fuera = mkdtempSync(join(realpathSync.native(tmpdir()), 'radiografia-publicar-'));
  const clon = join(fuera, 'clon');
  const registro = (nombre: string): string => join(fuera, `${nombre}.txt`);
  decir(`clon temporal en ${clon}`);
  let bien = false;
  try {
    execFileSync('git', ['clone', '--quiet', raiz, clon], { stdio: 'pipe' });
    execFileSync('git', ['checkout', '--quiet', '--detach', main], { cwd: clon, stdio: 'pipe' });
    paso('instalación', 'npm ci --prefer-offline --no-audit --no-fund', clon, registro('npm-ci'));
    paso('tipos', 'npm run tipos', clon, registro('tipos'));
    decir(`  jueces del motor: ${resumen(paso('jueces del motor', 'npm test --workspace @radiografia/motor', clon, registro('jueces-motor')))}`);
    decir(`  jueces de la web: ${resumen(paso('jueces de la web, con Chrome', 'npm test --workspace @radiografia/web', clon, registro('jueces-web')))}`);

    // 3. Dos builds, el mismo dist/.
    const web = join(clon, 'web');
    const dist = join(web, 'dist');
    const construir = (n: number): ReturnType<typeof huellaDe> => {
      rmSync(dist, { recursive: true, force: true });
      paso(`build ${n}`, 'npm run build', web, registro(`build-${n}`));
      return huellaDe(dist);
    };
    const uno = construir(1);
    const dos = construir(2);
    if (uno.total !== dos.total) {
      const de = (h: ReturnType<typeof huellaDe>): Map<string, string> => new Map(h.ficheros.map((f) => [f.ruta, f.sha256]));
      const [a, b] = [de(uno), de(dos)];
      const distintos = [...new Set([...a.keys(), ...b.keys()])].filter((r) => a.get(r) !== b.get(r));
      throw new Parada(`dos builds, dos dist/ distintos: ${distintos.join(', ')}`);
    }
    decir(`  dos builds, el mismo dist/: ${uno.ficheros.length} ficheros, huella ${uno.total}`);

    // 4. El .htaccess.
    const htaccess = htaccessDesde(readFileSync(join(web, 'publicacion', '.htaccess.plantilla'), 'utf8'), cspDeLaWeb(dist));
    const rutas = uno.ficheros.map((f) => f.ruta);
    const faltan = paginasDeError(htaccess).filter((p) => !rutas.includes(p));
    if (faltan.length > 0) throw new Parada(`el .htaccess nombra páginas de error que dist/ no tiene: ${faltan.join(', ')}`);
    const reparto = repartir(rutas, gruposDeCache(htaccess));
    writeFileSync(join(dist, '.htaccess'), htaccess);
    decir('  .htaccess escrito en dist/, con la CSP del <meta> de las páginas');

    // 5. La rama.
    const commit = actualizarRama(raiz, dist, mensajeDeLaPublicacion(main, new Date()));

    // 6. Lo que va a subir.
    const porRuta = new Map<string, Fichero>(huellaDe(dist).ficheros.map((f) => [f.ruta, f]));
    console.log('');
    console.log(`Lo que va en la rama ${RAMA}: ${miles(porRuta.size)} ficheros, ${miles([...porRuta.values()].reduce((s, f) => s + f.bytes, 0))} bytes.`);
    console.log('');
    console.log('En todas las respuestas, también en la de la página que no existe:');
    for (const [, nombre, valor, condicion] of htaccess.matchAll(/^Header always set (\S+) "([^"]*)"(?: (env=\S+))?$/gm)) console.log(`  ${nombre}: ${valor}${condicion === undefined ? '' : `   (solo con ${condicion})`}`);
    for (const [, tipo, extension] of htaccess.matchAll(/^AddType (\S+) (\S+)$/gm)) console.log(`  Content-Type de ${extension}: ${tipo}`);
    for (const [grupo, ficheros] of reparto) {
      const del = ficheros.map((r) => porRuta.get(r)!);
      console.log('');
      console.log(`Cache-Control: ${grupo.cacheControl}  (FilesMatch "${grupo.patron}"): ${del.length} ficheros, ${miles(del.reduce((s, f) => s + f.bytes, 0))} bytes`);
      for (const f of del) console.log(`  ${f.ruta}  ${miles(f.bytes)}  ${f.sha256}`);
    }
    const htaccessEnDist = porRuta.get('.htaccess')!;
    console.log('');
    console.log(`Y el .htaccess, que el servidor lee y no sirve: ${miles(htaccessEnDist.bytes)} bytes, ${htaccessEnDist.sha256}`);
    console.log('');
    if (commit === null) {
      console.log(`La rama ${RAMA} ya tenía exactamente este dist/: no hay commit nuevo ni nada que subir.`);
    } else {
      console.log(git(raiz, 'log', '-1', '--format=commit %H%nAuthor: %an <%ae>%nDate:   %ad%n%n    %s', RAMA));
      console.log('');
      console.log(`Lista para subir (el push lo da Antonio): git push origin ${RAMA}`);
    }
    bien = true;
  } finally {
    if (bien) {
      try {
        rmSync(fuera, { recursive: true, force: true });
      } catch (fallo) {
        console.warn(`no se pudo borrar el clon temporal ${fuera}: ${String(fallo)}`);
      }
    } else {
      console.error(`El clon temporal se queda para mirarlo: ${fuera}`);
    }
  }
}

try {
  publicar();
} catch (fallo) {
  console.error('');
  // Lo que se esperaba (una Parada) basta con su motivo; lo demás, con su traza.
  console.error(`PARA: ${fallo instanceof Error ? fallo.message : String(fallo)}`);
  if (!(fallo instanceof Parada) && fallo instanceof Error && fallo.stack !== undefined) console.error(fallo.stack);
  process.exitCode = 1;
}
