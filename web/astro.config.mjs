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
 */
import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    optimizeDeps: { include: ['@radiografia/motor/navegador'] },
    build: { rolldownOptions: { output: { comments: { legal: true } } } },
  },
});
