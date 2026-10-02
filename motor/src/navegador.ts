/**
 * La entrada del motor para el navegador (encargo 6.1, c; la importará Astro
 * en el punto 6): analizar, bandaHumana y validarPaquete, con el validador
 * standalone enchufado. Sin Ajv, sin `node:*` y sin fs: lo vigila el metafile
 * de esbuild en navegador.spec.ts, que además comprueba que, empaquetada,
 * hace lo mismo que el motor en Node.
 *
 *   · El validador: `#validador-standalone`, que motor/package.json
 *     («imports») lleva a motor/dist/validador.standalone.js, el fichero que
 *     genera generar-validador.ts en build (no se versiona). Sus tipos, en
 *     validador-standalone.d.ts (condición «types»), para que tsc revise sin
 *     haberlo generado.
 *   · analizar y validarPaquete: las de analisis.ts y validacion.ts con ese
 *     validador, y las mismas firmas que las de Node (analizar.ts, validar.ts).
 *   · bandaHumana: la de banda.ts, tal cual.
 *
 * [DOC] https://nodejs.org/api/packages.html#subpath-imports — «a package
 *    "imports" field to create private mappings that only apply to import
 *    specifiers from within the package itself»; las entradas empiezan por «#»
 *    y admiten condiciones, como en «exports».
 * [DOC] https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-imports-and-self-name-imports
 *    — con moduleResolution nodenext (el de @tsconfig/node24), TypeScript
 *    resuelve «#…» por el «imports» del package.json más cercano, con la
 *    condición «types».
 * [DOC] https://github.com/vitejs/vite/pull/7770 — Vite resuelve «imports»
 *    desde la 4.2.0. Con Astro, se verá en el punto 6.
 * [PROPIO] esbuild 0.28.2 también: comprobado el 02/10 empaquetando este
 *    fichero sin el enchufe de navegador.spec.ts, con motor/dist/ generado.
 *    En su API no encontré la página que lo diga.
 */
import { validarEsquemaPaquete } from '#validador-standalone';
import { analizarCon, type OpcionesDeAnalisis, type Resultado } from './analisis.ts';
import { validarPaquete as validarPaqueteCon, type ResultadoDeValidacion, type ValidadorDeEsquema } from './validacion.ts';
import type { Paquete } from './paquete.ts';

export { bandaHumana } from './banda.ts';
export type { BandaHumana, SinBanda } from './banda.ts';
export type { OpcionesDeAnalisis, Resultado } from './analisis.ts';
export type { ErrorDeValidacion, ResultadoDeValidacion } from './validacion.ts';
export type { Paquete } from './paquete.ts';

export function analizar(textoOriginal: string, paquetes: readonly Paquete[], opciones: OpcionesDeAnalisis = {}): Resultado {
  return analizarCon(validarEsquemaPaquete, textoOriginal, paquetes, opciones);
}

export function validarPaquete(paquete: unknown, validador: ValidadorDeEsquema = validarEsquemaPaquete): ResultadoDeValidacion {
  return validarPaqueteCon(paquete, validador);
}
