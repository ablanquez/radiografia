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
 * Cada paquete pasa por validarPaquete (el del navegador, con el validador
 * standalone: el mismo que usa el analizador al cargarlos) antes de darlo por
 * Paquete; si no valida, el build para con sus errores. Y reglasDelCatalogo
 * para el build si un id está en los dos (catalogo.ts).
 * [PROPIO] El Record exige una entrada por fichero de FICHEROS: si el
 *    analizador carga un paquete más, tsc avisa aquí.
 */
import radiografia from '../../../paquetes/radiografia.json';
import espanolCorrecto from '../../../paquetes/espanol-correcto.json';
import { validarPaquete, type Paquete } from '@radiografia/motor/navegador';
import { FICHEROS } from '../pantalla/cargar.ts';
import { reglasDelCatalogo } from './catalogo.ts';

const LEIDOS: Readonly<Record<(typeof FICHEROS)[number], unknown>> = {
  'radiografia.json': radiografia,
  'espanol-correcto.json': espanolCorrecto,
};

export const PAQUETES: readonly Paquete[] = FICHEROS.map((fichero) => {
  const { valido, errores } = validarPaquete(LEIDOS[fichero]);
  if (!valido) throw new Error(`paquetes/${fichero} no valida:\n${errores.map((e) => e.texto).join('\n')}`);
  return LEIDOS[fichero] as Paquete;
});

export const ENTRADAS = reglasDelCatalogo(PAQUETES);
