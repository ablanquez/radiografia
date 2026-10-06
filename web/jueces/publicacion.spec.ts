/**
 * El juez de la publicación (encargo 11.2; decisiones de Antonio del 06/10): lo que `npm run publicar` hace con un dist/
 * ya construido (web/publicacion/publicacion.ts), sobre un dist/ de prueba y un repositorio de git temporal, sin build,
 * sin Chrome y sin red. El script entero se prueba en un clon (encargo, § 4), nunca sobre el árbol de trabajo.
 *
 *   1. La CSP de la web es la del <meta> de cada página, con las entidades leídas; si una página lleva otra, para.
 *   2. El .htaccess lleva esa CSP, idéntica, en su cabecera; con otro <meta>, otro .htaccess con la otra; y para con una
 *      CSP que la directiva no admitiría tal cual.
 *   3. La plantilla dice lo que firmó Antonio: cada grupo de caché con su Cache-Control; la CSP, nosniff y
 *      Referrer-Policy en todas las respuestas; HSTS de un año solo por https; la página que no existe; /.git fuera; los
 *      cuatro tipos; y ninguna regla de reescritura ni redirección a https.
 *   4. Cada fichero de un dist/ como el de verdad cae en un grupo de caché y en uno solo, con el Cache-Control firmado;
 *      una extensión sin grupo hace parar, y un JS sin la huella en el nombre, también.
 *   5. La rama: huérfana la primera vez, con exactamente los ficheros de dist/ (ni docs, ni jueces), byte a byte, también
 *      los de texto con CRLF, con core.autocrlf=true en el repositorio (el de esta máquina); la segunda vez, encima de la
 *      primera, con lo que sale, lo que entra y lo que cambia; la tercera, sin cambios, no hace commit. Y main, su árbol
 *      y la lista de worktrees, sin tocar.
 *   6. Un dist/ con un mapa de fuente (.map), o sin el .htaccess, no se publica, y la rama se queda como estaba.
 *   7. El mensaje del commit lleva el hash de main del que sale y la fecha.
 *   8. Desde el 11.2 (firmado por Antonio el 06/10: eol=lf), desde un checkout con core.autocrlf=true, el de Windows,
 *      ningún fichero de texto de los que llegan a dist/ (los de paquetes/ y web/public/ que no son binarios) sale con
 *      CRLF: ni los dos paquetes ni las dos OFL.txt, que hasta entonces salían así. Y esos cuatro, tal cual salen del
 *      checkout, llegan a la rama en LF. Lo mira con lo que haría el checkout, con el .gitattributes del árbol de trabajo
 *      (git cat-file --filters), sin clonar.
 *
 * [DOC] https://git-scm.com/docs/git-cat-file — --filters: «Show the content as converted by the filters configured in
 *    the current working tree for the given <path> (i.e. smudge filters, end-of-line conversion, etc)».
 * [DOC] https://git-scm.com/docs/git-check-attr — --stdin: «Read pathnames from the standard input, one per line».
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  actualizarRama,
  cspDeLaWeb,
  ficherosDe,
  gruposDeCache,
  htaccessDesde,
  mensajeDeLaPublicacion,
  paginasDeError,
  puntaDe,
  RAMA,
  repartir,
} from '../publicacion/publicacion.ts';

const PLANTILLA = readFileSync(new URL('../publicacion/.htaccess.plantilla', import.meta.url), 'utf8');
/** La raíz del repositorio en el que corre el juez (el árbol de trabajo o un clon). */
const RAIZ_DEL_REPO = fileURLToPath(new URL('../../', import.meta.url));
const CSP = "connect-src 'self';form-action 'self'; script-src 'self' 'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw='; style-src 'self' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';";
const META = (csp: string): string => `<meta http-equiv="content-security-policy" content="${csp}">`;
const PAGINA = (meta: string): string => `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">${meta}<title>x</title></head><body></body></html>`;

/** Los ficheros de un dist/ como el de verdad (uno de cada clase), con su contenido; el .htaccess, aparte. */
function ficherosDePrueba(csp: string): Record<string, string | Buffer> {
  return {
    'index.html': PAGINA(META(csp)),
    // La misma política con las comillas escritas como entidad: tiene que leerse igual.
    '404.html': PAGINA(META(csp.replaceAll("'", '&#39;'))),
    'reglas/una-regla/index.html': PAGINA(META(csp)),
    '_astro/index.astro_astro_type_script_index_0_lang.DuWOGULV.js': 'console.log(1);\n',
    '_astro/hoja.D-9100dx.css': 'body{margin:0}\n',
    'fuentes/literata/literata-400.woff2': Buffer.from([0x77, 0x4f, 0x46, 0x32, 0x00, 0x0d, 0x0a, 0x01]),
    'fuentes/literata/literata-400.woff': Buffer.from([0x77, 0x4f, 0x46, 0x46, 0x00, 0x0d, 0x0a, 0x02]),
    'fuentes/literata/OFL.txt': 'Copyright 2017 The Literata Project Authors\r\nSIL OPEN FONT LICENSE\r\n',
    'paquetes/radiografia.json': '{\r\n  "cabecera": {}\r\n}\r\n',
    'ejemplos/antonio.txt': 'Un texto.\n',
    'site.webmanifest': '{"name":"RadiografIA"}\n',
    'icon.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>\n',
    'icon-192.png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    'favicon.ico': Buffer.from([0x00, 0x00, 0x01, 0x00]),
  };
}

const temporales: string[] = [];
function temporal(prefijo: string): string {
  const ruta = mkdtempSync(join(realpathSync.native(tmpdir()), prefijo));
  temporales.push(ruta);
  return ruta;
}
after(() => {
  for (const ruta of temporales) rmSync(ruta, { recursive: true, force: true });
});

/** Escribe un dist/ de prueba con esos ficheros y, si se pide, su .htaccess desde la plantilla de verdad. */
function escribirDist(ficheros: Record<string, string | Buffer>, conHtaccess = true): string {
  const dist = temporal('radiografia-dist-');
  for (const [ruta, contenido] of Object.entries(ficheros)) {
    mkdirSync(dirname(join(dist, ruta)), { recursive: true });
    writeFileSync(join(dist, ruta), contenido);
  }
  if (conHtaccess) writeFileSync(join(dist, '.htaccess'), htaccessDesde(PLANTILLA, cspDeLaWeb(dist)));
  return dist;
}

/** git en el repositorio de prueba, con la configuración de la máquina (core.autocrlf=true, puesto a mano). */
const g = (repo: string, ...argumentos: string[]): string => execFileSync('git', argumentos, { cwd: repo, encoding: 'utf8' }).trim();

/** Un repositorio como el de verdad: main con código, documentos y jueces, y core.autocrlf=true. */
function repositorioDePrueba(): string {
  const repo = temporal('radiografia-repo-');
  g(repo, 'init', '--quiet', '--initial-branch=main');
  g(repo, 'config', 'user.name', 'Juez');
  g(repo, 'config', 'user.email', 'juez@example.invalid');
  g(repo, 'config', 'core.autocrlf', 'true');
  for (const [ruta, texto] of Object.entries({ 'README.md': '# RadiografIA\n', 'docs/BITACORA.md': '# Bitácora\n', 'web/jueces/x.spec.ts': 'export {};\n' })) {
    mkdirSync(dirname(join(repo, ruta)), { recursive: true });
    writeFileSync(join(repo, ruta), texto);
  }
  g(repo, 'add', '--all');
  g(repo, 'commit', '--quiet', '-m', 'main');
  return repo;
}

/** Los ficheros de la rama, con su contenido tal cual (git cat-file, sin filtros). */
function enLaRama(repo: string, commit: string): Map<string, Buffer> {
  const rutas = g(repo, 'ls-tree', '-r', '--name-only', commit).split('\n').filter((r) => r !== '');
  return new Map(rutas.map((r) => [r, execFileSync('git', ['cat-file', 'blob', `${commit}:${r}`], { cwd: repo })]));
}

/** Que la rama sea dist/: las mismas rutas y los mismos bytes. */
function comoDist(repo: string, commit: string, dist: string): void {
  const rama = enLaRama(repo, commit);
  assert.deepEqual([...rama.keys()].sort(), ficherosDe(dist), 'los ficheros de la rama, frente a los de dist/');
  for (const ruta of ficherosDe(dist)) assert.ok(rama.get(ruta)!.equals(readFileSync(join(dist, ruta))), `${ruta}: otros bytes en la rama`);
}

describe('la publicación: el .htaccess y la rama publicacion, con un dist/ de prueba', () => {
  test('1 · la CSP de la web es la del <meta> de cada página, con las entidades leídas; si una página lleva otra, para', () => {
    assert.equal(cspDeLaWeb(escribirDist(ficherosDePrueba(CSP), false)), CSP);
    const distinta = { ...ficherosDePrueba(CSP), 'creditos/index.html': PAGINA(META(CSP.replace("connect-src 'self'", "connect-src 'none'"))) };
    assert.throws(() => cspDeLaWeb(escribirDist(distinta, false)), /no es la misma en todas las páginas/);
  });

  test('2 · el .htaccess lleva esa CSP, idéntica; con otro <meta>, otro .htaccess; y para con una CSP que la directiva no admite', () => {
    const htaccess = readFileSync(join(escribirDist(ficherosDePrueba(CSP)), '.htaccess'), 'utf8');
    const linea = (texto: string): string[] => [...texto.matchAll(/^Header always set Content-Security-Policy "([^"]*)"$/gm)].map((m) => m[1]!);
    assert.deepEqual(linea(htaccess), [CSP], 'la cabecera, una vez y con la CSP del <meta>');
    const otra = CSP.replace("'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw='", "'sha256-OTRAHUELLADEOTROSCRIPT000000000000000000000='");
    const otroHtaccess = readFileSync(join(escribirDist(ficherosDePrueba(otra)), '.htaccess'), 'utf8');
    assert.deepEqual(linea(otroHtaccess), [otra], 'con otro <meta>, la otra CSP');
    assert.notEqual(otroHtaccess, htaccess);
    assert.ok(!htaccess.includes('{{CSP}}') && !htaccess.includes('\r'), 'sin la marca y con saltos \\n');
    for (const mala of [`${CSP} "`, `${CSP} %{HTTP_HOST}e`, `${CSP}\n`, '']) assert.throws(() => htaccessDesde(PLANTILLA, mala), `${JSON.stringify(mala.slice(-12))}`);
  });

  test('3 · la plantilla dice lo firmado: caché por grupos, cabeceras de seguridad, HSTS de un año por https, 404, /.git fuera, tipos y nada de reescritura', () => {
    const htaccess = htaccessDesde(PLANTILLA, CSP);
    assert.deepEqual(gruposDeCache(htaccess), [
      { patron: '\\.(js|css)$', cacheControl: 'public, max-age=31536000, immutable' },
      { patron: '\\.(woff2|woff)$', cacheControl: 'public, max-age=604800' },
      { patron: '\\.(html|json|txt|webmanifest|svg|png|ico)$', cacheControl: 'no-cache' },
    ]);
    const directivas = htaccess.split('\n').filter((l) => l.trim() !== '' && !l.trim().startsWith('#') && !/^\s*<\/?FilesMatch|^\s+Header set Cache-Control/.test(l));
    assert.deepEqual(directivas, [
      'ErrorDocument 404 /404.html',
      'RedirectMatch 404 ^/\\.git',
      'AddType font/woff2 .woff2',
      'AddType font/woff .woff',
      'AddType application/manifest+json .webmanifest',
      'AddType image/svg+xml .svg',
      `Header always set Content-Security-Policy "${CSP}"`,
      'Header always set X-Content-Type-Options "nosniff"',
      'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
      'Header always set Strict-Transport-Security "max-age=31536000" env=HTTPS',
    ]);
    assert.deepEqual(paginasDeError(htaccess), ['404.html']);
    assert.doesNotMatch(htaccess, /^\s*(RewriteEngine|RewriteRule|RewriteCond|Redirect(Permanent)?\s|Expires)/m, 'ni reescritura, ni redirección a https, ni mod_expires');
  });

  test('4 · cada fichero de un dist/ como el de verdad cae en un grupo de caché y en uno solo; sin grupo, o un JS sin huella, para', () => {
    const grupos = gruposDeCache(htaccessDesde(PLANTILLA, CSP));
    const reparto = repartir(Object.keys(ficherosDePrueba(CSP)), grupos);
    assert.deepEqual(
      [...reparto].map(([g, f]) => [g.cacheControl, f.sort()]),
      [
        ['public, max-age=31536000, immutable', ['_astro/hoja.D-9100dx.css', '_astro/index.astro_astro_type_script_index_0_lang.DuWOGULV.js']],
        ['public, max-age=604800', ['fuentes/literata/literata-400.woff', 'fuentes/literata/literata-400.woff2']],
        ['no-cache', ['404.html', 'ejemplos/antonio.txt', 'favicon.ico', 'fuentes/literata/OFL.txt', 'icon-192.png', 'icon.svg', 'index.html', 'paquetes/radiografia.json', 'reglas/una-regla/index.html', 'site.webmanifest']],
      ],
    );
    assert.throws(() => repartir(['_astro/x.AbCd1234.js.map'], grupos), /cae en 0 grupos/);
    assert.throws(() => repartir(['robots.xml'], grupos), /cae en 0 grupos/);
    assert.throws(() => repartir(['_astro/sin-huella.js'], grupos), /inmutable sin la huella/);
    assert.throws(() => repartir(['app.AbCd1234.js'], grupos), /inmutable sin la huella/);
  });

  test('5 · la rama: huérfana con exactamente dist/, byte a byte; luego encima, con lo que sale, entra y cambia; sin cambios, sin commit; main sin tocar', () => {
    const repo = repositorioDePrueba();
    const main = g(repo, 'rev-parse', 'HEAD');
    const dist1 = escribirDist(ficherosDePrueba(CSP));
    const primero = actualizarRama(repo, dist1, mensajeDeLaPublicacion(main, new Date()));
    assert.ok(primero !== null, 'el primer commit');
    assert.equal(g(repo, 'rev-list', '--parents', '-n', '1', primero), primero, 'huérfano: sin padre');
    comoDist(repo, primero, dist1);
    assert.ok(enLaRama(repo, primero).has('.htaccess'), 'con el .htaccess');

    const cambiados = ficherosDePrueba(CSP) as Record<string, string | Buffer | undefined>;
    delete cambiados['ejemplos/antonio.txt'];
    cambiados['paquetes/radiografia.json'] = '{\r\n  "cabecera": { "version": "1.0.1" }\r\n}\r\n';
    cambiados['reglas/otra-regla/index.html'] = PAGINA(META(CSP));
    const dist2 = escribirDist(cambiados as Record<string, string | Buffer>);
    const segundo = actualizarRama(repo, dist2, mensajeDeLaPublicacion(main, new Date()));
    assert.ok(segundo !== null, 'el segundo commit');
    assert.equal(g(repo, 'rev-list', '--parents', '-n', '1', segundo), `${segundo} ${primero}`, 'encima del primero');
    comoDist(repo, segundo, dist2);
    assert.equal(actualizarRama(repo, dist2, 'otra vez'), null, 'sin cambios, sin commit');
    assert.equal(puntaDe(repo, RAMA), segundo);

    assert.deepEqual([g(repo, 'branch', '--show-current'), g(repo, 'rev-parse', 'HEAD'), g(repo, 'status', '--porcelain')], ['main', main, ''], 'main, su punta y su árbol');
    assert.equal(g(repo, 'worktree', 'list', '--porcelain').split('\n').filter((l) => l.startsWith('worktree ')).length, 1, 'ningún worktree de más');
  });

  test('6 · un dist/ con un mapa de fuente, o sin el .htaccess, no se publica, y la rama se queda como estaba', () => {
    const repo = repositorioDePrueba();
    const primero = actualizarRama(repo, escribirDist(ficherosDePrueba(CSP)), 'primero');
    const conMapa = escribirDist({ ...ficherosDePrueba(CSP), '_astro/hoja.D-9100dx.css.map': '{}' });
    assert.throws(() => actualizarRama(repo, conMapa, 'con mapa'), /mapas de fuente/);
    assert.throws(() => actualizarRama(repo, escribirDist(ficherosDePrueba(CSP), false), 'sin .htaccess'), /no lleva el \.htaccess/);
    assert.equal(puntaDe(repo, RAMA), primero);
  });

  test('7 · el mensaje del commit lleva el hash de main del que sale y la fecha', () => {
    const fecha = new Date(2026, 9, 6, 18, 42, 5);
    const mensaje = mensajeDeLaPublicacion('87c80b46648c31d43bed61dced84959f9221fa0e', fecha);
    assert.match(mensaje, /de main 87c80b46648c31d43bed61dced84959f9221fa0e, del 2026-10-06 18:42:05 [+-]\d{4}$/);
  });

  test('8 · desde un checkout con core.autocrlf=true, lo de texto que llega a dist/ sale en LF, también los dos paquetes y las dos OFL.txt, y así llega a la rama', () => {
    /** Un fichero del repositorio como lo dejaría un checkout de Windows (core.autocrlf=true), con el .gitattributes del árbol de trabajo. */
    const delCheckout = (ruta: string): Buffer => execFileSync('git', ['-c', 'core.autocrlf=true', 'cat-file', '--filters', `HEAD:${ruta}`], { cwd: RAIZ_DEL_REPO });
    const rutas = g(RAIZ_DEL_REPO, 'ls-files', '--', 'paquetes', 'web/public').split('\n').filter((r) => r !== '');
    const binarios = new Set(
      execFileSync('git', ['check-attr', '--stdin', 'binary'], { cwd: RAIZ_DEL_REPO, input: `${rutas.join('\n')}\n`, encoding: 'utf8' })
        .split('\n')
        .filter((l) => l.endsWith(': binary: set'))
        .map((l) => l.slice(0, -': binary: set'.length)),
    );
    const deTexto = rutas.filter((r) => !binarios.has(r));
    const CUATRO = {
      'paquetes/radiografia.json': 'paquetes/radiografia.json',
      'paquetes/espanol-correcto.json': 'paquetes/espanol-correcto.json',
      'web/public/fuentes/literata/OFL.txt': 'fuentes/literata/OFL.txt',
      'web/public/fuentes/atkinson-hyperlegible-next/OFL.txt': 'fuentes/atkinson-hyperlegible-next/OFL.txt',
    };
    for (const ruta of Object.keys(CUATRO)) assert.ok(deTexto.includes(ruta), `${ruta}, entre los de texto`);
    assert.ok(binarios.size > 0 && deTexto.length > Object.keys(CUATRO).length, `${deTexto.length} de texto y ${binarios.size} binarios`);
    assert.deepEqual(deTexto.filter((r) => delCheckout(r).includes(13)), [], 'ficheros de texto que el checkout de Windows dejaría en CRLF');

    const repo = repositorioDePrueba();
    const enDist = Object.fromEntries(Object.entries(CUATRO).map(([ruta, destino]) => [destino, delCheckout(ruta)]));
    const commit = actualizarRama(repo, escribirDist({ ...ficherosDePrueba(CSP), ...enDist }), 'los cuatro, del checkout');
    assert.ok(commit !== null);
    assert.deepEqual(Object.values(CUATRO).filter((d) => execFileSync('git', ['cat-file', 'blob', `${commit}:${d}`], { cwd: repo }).includes(13)), [], 'en la rama, con CRLF');
  });
});
