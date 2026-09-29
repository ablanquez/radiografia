/**
 * Genera el validador de esquema que llevará el navegador, SIN Ajv dentro
 * (encargo 3.2; se usará desde el punto 6).
 *
 * Por qué no se compila en el navegador:
 * [DOC] https://ajv.js.org/security.html#content-security-policy — compilar
 *    esquemas en el navegador exige `'unsafe-eval'` en la CSP, «NOT
 *    recommended»; la salida es compilarlos en build (standalone).
 *
 * Dos pasos:
 *   1. Ajv genera el código standalone de los dos esquemas en ESM.
 *      [DOC] https://ajv.js.org/standalone.html — `code.source: true` y
 *      `code.esm: true`; con varios esquemas, un mapa nombre → $id de lo que se
 *      exporta. Las opciones de Ajv son OPCIONES_AJV, las mismas del validador
 *      en vivo (validar.ts): si divergieran, standalone.spec.ts se pone rojo.
 *   2. esbuild lo empaqueta en un solo fichero sin dependencias.
 *      [DOC] https://ajv.js.org/standalone.html — «The standalone generated
 *      functions still has a dependency on the Ajv. Specifically on the code
 *      in the runtime folder … To create completely isolated validation
 *      functions … you can process the generated code through a bundler like
 *      ES Build». Aquí esa dependencia es una: `ucs2length`, con la que Ajv
 *      cuenta caracteres en minLength, y su código fijo es
 *      `require("ajv/dist/runtime/ucs2length").default` aunque se pida ESM
 *      (lib/runtime/ucs2length.ts): sin empaquetar, el módulo no carga
 *      («require is not defined in ES module scope», visto el 29/09).
 *      [DOC] https://esbuild.github.io/api/ — `stdin` con `resolveDir` (desde
 *      dónde se resuelven sus imports: motor/, para encontrar ajv en
 *      node_modules), `bundle: true`, `format: "esm"`, `platform: "browser"`;
 *      sin minificar (decisión de Antonio, 3.2), para que se pueda leer; y
 *      `metafile: true`, que se devuelve para que el juez vea qué importa la
 *      salida desde fuera ([DOC] el tipo `Metafile` de
 *      `node_modules/esbuild/lib/main.d.ts`, 0.28.2: `outputs[fichero].imports`
 *      es la lista `{ path, kind, external }` de lo que la salida importa, con
 *      `kind` entre «import-statement», «require-call», «dynamic-import»…).
 *
 * Por qué no la opción A (`unicode: false`, que quitaba ucs2length sin
 * empaquetar): en Ajv 8 esa opción está OBSOLETA. `dist/core.js` la lista en
 * `deprecatedOptions` («"minLength"/"maxLength" account for unicode
 * characters by default.») y `dist/core.d.ts` la marca `@deprecated`; cada
 * `new Ajv2020({ unicode: false })` imprime «DEPRECATED: option unicode.»
 * (ejecutado el 29/09). options.md ni la documenta. Con esbuild, `unicode` se
 * queda por defecto en el vivo y en el generado: los dos cuentan igual.
 *
 * ⭐ Punto 6: el build de Astro generará este fichero y Vite lo empaquetará
 *    con el resto. motor/dist/ no se versiona (.gitignore de la raíz). El juez
 *    3 de standalone.spec.ts (el metafile no lista ninguna importación, y el
 *    texto no lleva «import ») es el que avisa si una palabra clave futura trae
 *    una dependencia de ejecución que el empaquetado no resuelva. No se busca
 *    el texto «require(»: el fichero empaquetado lo contiene sin que sea una
 *    llamada (el ayudante `function __require()` de esbuild y el texto
 *    `ucs2length.code = 'require(…)'` de Ajv, visto el 29/09).
 *
 * [PROPIO] Se ejecuta como script cuando es el punto de entrada (comparando
 *    `import.meta.url` con `process.argv[1]`), no con `import.meta.main`, que
 *    en Node 24 es «Stability: 1.0 - Early development»
 *    ([DOC] https://nodejs.org/api/esm.html#importmetamain).
 * [PROPIO] ajv/dist/standalone es CommonJS (`module.exports = standaloneCode`
 *    y además `exports.default = standaloneCode`). Con module nodenext,
 *    TypeScript tipa su import por defecto como el objeto module.exports
 *    entero (TS2349 si se llama directamente), así que se llama por su
 *    `.default`, que en ejecución es la misma función.
 */
import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import standalone from 'ajv/dist/standalone/index.js';
import { build, type Metafile } from 'esbuild';
import esquemaPaquete from '../esquema/paquete.schema.json' with { type: 'json' };
import esquemaRegla from '../esquema/regla.schema.json' with { type: 'json' };
import { OPCIONES_AJV } from './validar.ts';

/** El nombre con que el módulo generado exporta la función de validación. */
export const NOMBRE_EXPORTADO = 'validarEsquemaPaquete';

/** La carpeta motor/: desde ahí resuelve esbuild los imports del código de Ajv. */
const MOTOR = fileURLToPath(new URL('..', import.meta.url));

/** Paso 1: el código standalone de Ajv para los dos esquemas, en ESM, SIN empaquetar. */
export function generarCodigoAjv(): string {
  const ajv = new Ajv2020({
    ...OPCIONES_AJV,
    schemas: [esquemaRegla, esquemaPaquete],
    code: { source: true, esm: true },
  });
  return standalone.default(ajv, { [NOMBRE_EXPORTADO]: esquemaPaquete.$id });
}

/**
 * Pasos 1 y 2: genera, empaqueta y escribe el validador en `destino`.
 * Devuelve el metafile de esbuild: qué importa la salida desde fuera.
 */
export async function generarValidador(destino: URL): Promise<Metafile> {
  const salida = fileURLToPath(destino);
  mkdirSync(dirname(salida), { recursive: true });
  const resultado = await build({
    stdin: {
      contents: generarCodigoAjv(),
      resolveDir: MOTOR,
      sourcefile: 'validador.standalone.sin-empaquetar.js',
      loader: 'js',
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    minify: false,
    metafile: true,
    outfile: salida,
    logLevel: 'warning',
  });
  return resultado.metafile;
}

const DESTINO = new URL('../dist/validador.standalone.js', import.meta.url);

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generarValidador(DESTINO);
  console.log(`generado: ${fileURLToPath(DESTINO)}`);
}
