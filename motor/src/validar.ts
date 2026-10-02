/**
 * La validación de un paquete en Node, con Ajv compilando los esquemas en
 * vivo (encargos 3.1 y 3.2). Desde el 6.1, partida en dos módulos:
 *
 *   · validacion.ts, sin ningún import de Ajv: el formateador (regla + campo,
 *     en castellano), el paso 2 y validarPaquete(paquete, validador), con el
 *     validador de esquema que se le enchufe. Es lo que lleva el navegador
 *     (navegador.ts, con el standalone).
 *   · este, solo para Node (jueces, herramientas, generación): compila los
 *     dos esquemas con Ajv (`validadorEnVivo`), fija OPCIONES_AJV (las mismas
 *     que usa generar-validador.ts para el standalone) y da validarEsquema y
 *     validarPaquete con el validador en vivo por defecto: las firmas de
 *     antes del 6.1, las que usan los jueces. Lo demás de validacion.ts se
 *     reexporta tal cual.
 *
 * [DOC] https://ajv.js.org/json-schema.html#draft-2020-12 — «To use
 *    draft-2020-12 schemas you need to import a different Ajv class»: Ajv2020.
 *    La doc escribe `import Ajv2020 from "ajv/dist/2020"`, y esa ruta NO
 *    funciona aquí: ajv no tiene campo `exports` en su package.json y, en ESM,
 *    Node exige la extensión completa ([DOC] https://nodejs.org/api/esm.html,
 *    «Mandatory file extensions»). Comprobado al instalar (29/09):
 *    `ajv/dist/2020` → ERR_MODULE_NOT_FOUND; `ajv/dist/2020.js` → funciona.
 *    Se importa con NOMBRE (`{ Ajv2020 }`, que `dist/2020.js` exporta
 *    como tal) para no depender de cómo trata TypeScript el `default` de un
 *    módulo CommonJS.
 * [DOC] https://ajv.js.org/api.html — `allErrors: true` para que salgan todos
 *    los errores de una vez.
 * [DOC] `formats: { uri: true }` — el `$schema` de la raíz del paquete lleva
 *    `"format": "uri"` como ANOTACIÓN para el editor, y el motor no lo comprueba:
 *    · https://ajv.js.org/guide/formats.html — «From version 7 Ajv does not
 *      include formats defined by JSON Schema specification»; sin definirlo,
 *      compilar el esquema lanza `unknown format "uri" ignored in schema at
 *      path "#/properties/%24schema"` (visto en la suite el 29/09).
 *    · https://ajv.js.org/strict-mode.html («Unknown formats») — «to have some
 *      format ignored pass `true` as its definition».
 *    · JSON Schema 2020-12, validación §7.2.1
 *      (https://json-schema.org/draft/2020-12/json-schema-validation#section-7.2.1)
 *      — la aserción de format «MUST be disabled by default».
 *    Sin ajv-formats (decisión de Antonio, parada del 3.2): sería una dependencia
 *    más y mete un `require()` en el código standalone.
 * [DOC] https://nodejs.org/api/esm.html#json-modules — los esquemas se
 *    importan como JSON con `with { type: 'json' }`, estable en Node 24. Nada
 *    se descarga: el validador no tiene `loadSchema`.
 */
import { Ajv2020 } from 'ajv/dist/2020.js';
import type { Options } from 'ajv/dist/2020.js';
import esquemaPaquete from '../esquema/paquete.schema.json' with { type: 'json' };
import esquemaRegla from '../esquema/regla.schema.json' with { type: 'json' };
import {
  validarEsquema as validarEsquemaCon,
  validarPaquete as validarPaqueteCon,
  type ResultadoDeValidacion,
  type ValidadorDeEsquema,
} from './validacion.ts';

export { GENERO_POR_DEFECTO } from './validacion.ts';
export type { ErrorDeEsquema, ErrorDeValidacion, PaqueteConForma, ResultadoDeValidacion, ValidadorDeEsquema } from './validacion.ts';

/**
 * Las opciones de Ajv. Las MISMAS para el validador en vivo y para el que se
 * genera en build (generar-validador.ts las importa de aquí): si divergieran,
 * los dos dejarían de ser equivalentes y standalone.spec.ts se pondría rojo.
 */
export const OPCIONES_AJV = { allErrors: true, formats: { uri: true } } satisfies Options;

const ajv = new Ajv2020({ ...OPCIONES_AJV });
ajv.addSchema(esquemaRegla);
/** El validador de esquema de Ajv, compilado en vivo. Que encaje en ValidadorDeEsquema lo comprueba tsc aquí. */
export const validadorEnVivo: ValidadorDeEsquema = ajv.compile(esquemaPaquete);

/**
 * Paso 1 solo: el esquema, con el validador que se le enchufe (por defecto, el
 * de Ajv en vivo), y sus errores traducidos a regla + campo (validacion.ts).
 */
export function validarEsquema(paquete: unknown, validador: ValidadorDeEsquema = validadorEnVivo): ResultadoDeValidacion {
  return validarEsquemaCon(paquete, validador);
}

/** Los dos pasos (validacion.ts), con el validador que se le enchufe; por defecto, el de Ajv en vivo. */
export function validarPaquete(paquete: unknown, validador: ValidadorDeEsquema = validadorEnVivo): ResultadoDeValidacion {
  return validarPaqueteCon(paquete, validador);
}
