// @ts-check
/**
 * La configuración de Astro de la web de RadiografIA (encargo 6.2; firmada en
 * la parada 1). Astro 7.3.5, fijada exacta en web/package.json.
 *
 * [DOC] https://docs.astro.build/en/install/manual/ — `defineConfig` desde
 *    'astro/config'; montaje manual con los ficheros de la plantilla
 *    `minimal` (github.com/withastro/astro/tree/main/examples/minimal).
 * [DOC] https://docs.astro.build/en/reference/configuration-reference/#output
 *    — `output` vale 'static' por defecto: un sitio estático, sin servidor.
 *    No se escribe. Sin integraciones.
 *
 * optimizeDeps.include — el motor es una dependencia ENLAZADA (workspace,
 *    sin compilar) que lleva un fichero CommonJS incorporado tal cual
 *    (motor/src/terceros/silabea.cjs, THIRD-PARTY-NOTICES § 1.5).
 *    [DOC] https://vite.dev/guide/dep-pre-bundling#monorepos-and-linked-dependencies
 *    — «Vite automatically detects dependencies that are not resolved from
 *    node_modules and treats the linked dep as source code […] However, this
 *    requires the linked dep to be exported as ESM. If not, you can add the
 *    dependency to optimizeDeps.include in your config.» Sin esto, `astro
 *    dev` no carga el motor: Chrome da «The requested module
 *    '…/silabea.cjs?import' does not provide an export named 'default'»
 *    (visto el 02/10 en la parada 1). El build no lo necesita.
 *    Y, de la misma sección: «When making changes to the linked dep, restart
 *    the dev server with the --force command line option for the changes to
 *    take effect»: después de tocar motor/src, `npm run dev -- --force`.
 *
 * build.rolldownOptions.output.comments.legal — el aviso MIT de Ajv viaja en
 *    la cabecera del validador standalone como comentario legal «/*!»
 *    (motor/src/generar-validador.ts). Vite 8 lo quita al minificar: fija
 *    `legal: !options.minify` (node_modules/vite/dist/node/chunks/node.js,
 *    Vite 8.3.2; docs/BITACORA.md, 2026-10-02).
 *    [DOC] https://vite.dev/config/build-options — build.rolldownOptions:
 *    «Directly customize the underlying Rolldown bundle […] will be merged
 *    with Vite's internal Rolldown options»; build.minify: «'oxc' for client
 *    build».
 *    [DOC] https://rolldown.rs/reference/OutputOptions.comments — `legal`:
 *    «Comments that contain @license, @preserve or start with //! or /*!».
 *
 * vite.plugins: avisosDePdfmake — desde el 9.3 (firmado por Antonio en la
 *    parada previa: el aviso viaja dentro del JS, como con Ajv), el trozo de
 *    JS de pdfmake, que la página carga al pulsar «Descargar informe», lleva
 *    en cabecera, como comentario legal «/*!», los avisos de licencia de las
 *    76 piezas que van dentro de node_modules/pdfmake/build/pdfmake.js
 *    (web/terceros/pdfmake/avisos.txt, que escribe a mano
 *    scripts/avisos-de-pdfmake.ts): el build de pdfmake solo trae cinco
 *    líneas «/*!», y comments.legal (arriba) las conserva tal cual, sin
 *    añadir las demás. Lo vigila el juez 10 de jueces/construccion.spec.ts.
 *    En dev no hace falta: Vite sirve pdfmake preempaquetado (optimizeDeps)
 *    y la licencia es cosa de lo que se publica.
 *    [DOC] https://vite.dev/guide/api-plugin#universal-hooks — transform:
 *    «Can be used to transform individual modules».
 *
 * vite.plugins: avisoDeSilabea — desde el 11.1 (hallazgo 1 del censo
 *    pre-despliegue, firmado por Antonio: vía a, sin tocar motor/src).
 *    motor/src/terceros/silabea.cjs lleva en cabecera el LICENSE de silabea
 *    (MIT) en un comentario «/*», que el minificado quita: su código viajaba
 *    en el JS del analizador sin su aviso. Al empaquetarlo, esa misma
 *    cabecera pasa a comentario legal «/*!» y comments.legal (arriba) la
 *    conserva; el fichero no cambia (su huella, en THIRD-PARTY-NOTICES § 1.5,
 *    la vigila motor/src/notices.spec.ts). Si la cabecera no está, el build
 *    para. Lo vigila el juez 11 de jueces/construccion.spec.ts.
 *
 * vite.plugins: avisoDeRolldown — desde el 11.1 (hallazgo 18 del censo
 *    pre-despliegue, firmado por Antonio: si viaja código de terceros, su
 *    aviso va en el JS). Rolldown, el empaquetador de Vite 8 (MIT, VoidZero
 *    Inc. & Contributors), escribe en el JS publicado un trozo propio,
 *    rolldown-runtime.*.js, con sus ayudantes para cargar CommonJS
 *    (__commonJSMin, __copyProps y __toESM). No los genera a partir de
 *    nuestro código: son su módulo de runtime, el que lleva dentro tal cual
 *    («export var __create = Object.create; …», visto el 06/10 en
 *    @rolldown/binding-win32-x64-msvc), y sin aviso. A ese trozo, el que
 *    lleva el módulo de runtime, se le pone en cabecera el LICENSE de
 *    rolldown como comentario legal «/*!». Lo vigila el juez 13 de
 *    jueces/construccion.spec.ts.
 *    [DOC] node_modules/rolldown/dist (rolldown 1.2.12) — `const
 *    RUNTIME_MODULE_ID = "\0rolldown/runtime.js"`; y en sus tipos
 *    (shared/define-config-*.d.mts), el RenderedChunk de cada trozo: «The
 *    list of ids of modules included in this chunk» (moduleIds); y, de
 *    output.postBanner, «after renderChunk hook and minification»: el
 *    gancho renderChunk va antes del minificado, que conserva el «/*!»
 *    (comments.legal, arriba).
 *
 * security.csp — la Content-Security-Policy de las páginas publicadas
 *    (encargo 8.1, b; firmada en la parada 1): connect-src 'self' (ningún
 *    fetch, XHR, WebSocket ni sendBeacon a otro origen) y form-action 'self'
 *    (ningún formulario envía a otro sitio). Es el guardia de «nada sale del
 *    navegador»; la prueba es el juez de red de jueces/navegador.spec.ts, y
 *    el juez 9 de construccion.spec.ts mira que cada página la lleve.
 *    [DOC] https://docs.astro.build/en/reference/configuration-reference/#securitycsp
 *    — «Added in: astro@6.0.0»; «When enabled, Astro will add a <meta>
 *    element inside the <head> element of each page» con
 *    http-equiv="content-security-policy"; script-src y style-src los pone
 *    Astro, con los hashes de sus scripts y estilos, y directives añade el
 *    resto. Y: «Due to the nature of the Vite dev server, this feature isn't
 *    supported while working in dev mode»: `astro dev` va sin CSP, por diseño
 *    de Astro, y su websocket de recarga no se toca.
 *    [DOC] https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/connect-src
 *    — connect-src controla «<a ping>», fetch(), fetchLater(),
 *    XMLHttpRequest, WebSocket, EventSource y Navigator.sendBeacon().
 *    [DOC] https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/form-action
 *    — «Restricts the URLs which can be used as the target of a form
 *    submissions».
 *    Visto en la parada 1 en un clon (build, preview y dev en Chrome): la
 *    página analiza, pinta y filtra igual, y un fetch a otro origen queda
 *    bloqueado. En el punto 11 se valora pasarla a cabecera del servidor.
 *
 * integrations: cspPrimero — Astro escribe ese <meta> al final del <head>,
 *    detrás de lo que escribe la página, y la precarga de fuentes y los
 *    enlaces de icono y manifiesto (encargo 10.4) quedaban delante, fuera de
 *    la política (juez 9 de jueces/construccion.spec.ts). Al terminar el
 *    build, la integración RECOLOCA en cada página el <meta> que Astro ya
 *    generó, justo detrás de <meta charset> (scripts/csp-primero.ts): no
 *    toca su contenido ni amplía la política. Escribe en la salida del build
 *    la huella sha256 de cada contenido, tal como lo emitió Astro, y el juez
 *    9 la compara con la de dist/. Decidido por Antonio el 04/10 (parada de
 *    sutura de la Tanda 1). En dev no hay CSP (arriba) y no hace nada.
 *    Para el punto 11: si en Hostinger la CSP pasa a cabecera HTTP, esta
 *    integración sobra.
 *    [DOC] https://docs.astro.build/en/reference/integrations-reference/ —
 *    astro:build:done: «After a production build (SSG or SSR) has
 *    completed»; `dir`: «A URL path to the build output directory»; el
 *    logger antepone a cada mensaje «a label that has the same value as the
 *    name of the integration».
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { cspDetrasDelCharset } from './scripts/csp-primero.ts';

/** @type {import('astro').AstroIntegration} */
const cspPrimero = {
  name: 'radiografia-csp-primero',
  hooks: {
    'astro:build:done': ({ dir, logger }) => {
      const raiz = fileURLToPath(dir);
      for (const ruta of readdirSync(raiz, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.html'))) {
        const fichero = join(raiz, ruta);
        const { html, contenido } = cspDetrasDelCharset(readFileSync(fichero, 'utf8'));
        writeFileSync(fichero, html);
        logger.info(`${ruta.replaceAll('\\', '/')} ${createHash('sha256').update(contenido).digest('hex')}`);
      }
    },
  },
};

/** @type {import('vite').Plugin} */
const avisoDeSilabea = {
  name: 'radiografia-aviso-de-silabea',
  transform(codigo, id) {
    if (!/[\\/]motor[\\/]src[\\/]terceros[\\/]silabea\.cjs$/.test(id)) return null;
    const cabecera = /^\/\*(?=\r?\n \* silabea 1\.0\.0 )/;
    if (!cabecera.test(codigo)) throw new Error('motor/src/terceros/silabea.cjs no empieza por su cabecera: su aviso MIT no viajaría');
    return { code: codigo.replace(cabecera, '/*!'), map: null };
  },
};

/** El LICENSE de rolldown, el que instala vite (que es quien lo trae). */
function licenciaDeRolldown() {
  const desdeVite = createRequire(createRequire(import.meta.url).resolve('vite/package.json'));
  const licencia = readFileSync(join(dirname(desdeVite.resolve('rolldown/package.json')), 'LICENSE'), 'utf8').replace(/\r\n/g, '\n').trim();
  if (licencia.includes('*/')) throw new Error('el LICENSE de rolldown lleva «*/»: cerraría el comentario');
  return licencia;
}

/** @type {import('vite').Plugin} */
const avisoDeRolldown = {
  name: 'radiografia-aviso-de-rolldown',
  renderChunk(codigo, trozo) {
    if (!trozo.moduleIds.includes('\0rolldown/runtime.js')) return null;
    return { code: `/*!\n${licenciaDeRolldown()}\n*/\n${codigo}`, map: null };
  },
};

/** @type {import('vite').Plugin} */
const avisosDePdfmake = {
  name: 'radiografia-avisos-de-pdfmake',
  transform(codigo, id) {
    if (!/[\\/]node_modules[\\/]pdfmake[\\/]build[\\/]pdfmake\.js$/.test(id)) return null;
    const avisos = readFileSync(new URL('./terceros/pdfmake/avisos.txt', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
    if (avisos.includes('*/')) throw new Error('terceros/pdfmake/avisos.txt lleva «*/»: cerraría el comentario');
    return { code: `/*!\n${avisos}\n*/\n${codigo}`, map: null };
  },
};

export default defineConfig({
  integrations: [cspPrimero],
  security: { csp: { directives: ["connect-src 'self'", "form-action 'self'"] } },
  vite: {
    plugins: [avisoDeSilabea, avisoDeRolldown, avisosDePdfmake],
    optimizeDeps: { include: ['@radiografia/motor/navegador'] },
    build: { rolldownOptions: { output: { comments: { legal: true } } } },
  },
});
