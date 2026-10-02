/**
 * Los tipos de `#validador-standalone` (motor/package.json, «imports»): el
 * validador que genera generar-validador.ts en motor/dist/, que no se
 * versiona. Con ellos tsc revisa navegador.ts sin haberlo generado. El nombre
 * es NOMBRE_EXPORTADO de generar-validador.ts: si divergen, esbuild no
 * encuentra la exportación y navegador.spec.ts se pone rojo.
 */
import type { ValidadorDeEsquema } from './validacion.ts';

export declare const validarEsquemaPaquete: ValidadorDeEsquema;
