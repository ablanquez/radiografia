/**
 * Los dos paquetes incluidos, leídos en build para el catálogo (encargo 7.1,
 * b): los mismos ficheros y en el mismo orden que carga el analizador
 * (FICHEROS, cargar.ts). Solo lo importan las páginas de src/pages/reglas/,
 * en su frontmatter, que corre al construir y no viaja al navegador: las
 * fichas salen como HTML, sin fetch.
 *
 * [DOC] https://docs.astro.build/en/guides/imports/#json — «Astro supports
 *    importing JSON files directly into your application. Imported files
 *    return the full JSON object in the default import».
 * [DOC] https://docs.astro.build/en/reference/routing-reference/#getstaticpaths
 *    — getStaticPaths «executes in its own isolated scope once, before any
 *    page loads. Therefore you can't reference anything from its parent
 *    scope, other than file imports»: por eso los paquetes llegan por este
 *    módulo.
 * Los JSON están fuera de web/ (en paquetes/, en la raíz del repo) y se
 *    importan por su ruta relativa: comprobado en build y en dev el 02/10
 *    (parada 1 del 7.1), sin mover ficheros. En dev, Vite deja leer fuera de
 *    la raíz del proyecto hasta la del workspace.
 *    [DOC] https://vite.dev/config/server-options#server-fs-allow — «Vite will
 *    search for the root of the potential workspace and use it as default»;
 *    vale como workspace la carpeta cuyo package.json tiene «workspaces»,
 *    como la raíz de este repo.
 *
 * Cada paquete pasa por validarPaquete con el validador standalone (los dos
 * pasos que hace el analizador al cargarlos) antes de darlo por Paquete; si no
 * valida, el build para con sus errores. Y reglasDelCatalogo para el build si
 * un id está en los dos (catalogo.ts).
 * ⚠️ Nada del motor del navegador (@radiografia/motor/navegador) en el
 *    frontmatter: arrastra motor/src/terceros/silabea.cjs (navegador.ts →
 *    analisis.ts → detector-estadistico.ts → metricas/index.ts →
 *    metricas/ifsz.ts → silabea.cjs), que es CommonJS, y el SSR de
 *    desarrollo de Vite evalúa el motor enlazado como ESM: «module is not
 *    defined» en /reglas/ y en cada ficha con `npm run dev` (visto por
 *    Antonio el 02/10, parada 2 del 7.1; en build no pasa). Lo vigila
 *    jueces/desarrollo.spec.ts. Por eso la validación llega por dos entradas
 *    del motor que no tocan las métricas («exports» de motor/package.json):
 *    `@radiografia/motor/validacion` (validacion.ts, que solo importa
 *    metricas/nombres.ts) y `@radiografia/motor/validador` (el standalone que
 *    genera predev/prebuild en motor/dist/, sin imports). Los tipos sí
 *    vienen de la entrada del navegador: `import type` se borra al compilar.
 *    [DOC] https://nodejs.org/api/packages.html#subpath-exports — «custom
 *    subpaths can be defined along with the main entry point»; «Now only the
 *    defined subpath in "exports" can be imported by a consumer».
 * [PROPIO] El Record exige una entrada por fichero de FICHEROS: si el
 *    analizador carga un paquete más, tsc avisa aquí.
 */
import radiografia from '../../../paquetes/radiografia.json';
import espanolCorrecto from '../../../paquetes/espanol-correcto.json';
import type { Paquete } from '@radiografia/motor/navegador';
import { validarPaquete } from '@radiografia/motor/validacion';
import { validarEsquemaPaquete } from '@radiografia/motor/validador';
import { FICHEROS } from '../pantalla/cargar.ts';
import { reglasDelCatalogo } from './catalogo.ts';

const LEIDOS: Readonly<Record<(typeof FICHEROS)[number], unknown>> = {
  'radiografia.json': radiografia,
  'espanol-correcto.json': espanolCorrecto,
};

export const PAQUETES: readonly Paquete[] = FICHEROS.map((fichero) => {
  const { valido, errores } = validarPaquete(LEIDOS[fichero], validarEsquemaPaquete);
  if (!valido) throw new Error(`paquetes/${fichero} no valida:\n${errores.map((e) => e.texto).join('\n')}`);
  return LEIDOS[fichero] as Paquete;
});

export const ENTRADAS = reglasDelCatalogo(PAQUETES);
