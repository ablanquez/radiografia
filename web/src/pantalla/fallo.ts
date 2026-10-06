/**
 * El motivo de un fallo atrapado, para decirlo en la página (11.1, hallazgo 14 del censo pre-despliegue, firmado por
 * Antonio). En JavaScript se lanza cualquier cosa, no solo un Error: de un Error, su mensaje; de lo demás, su texto.
 * Lo usan los catch de cargar.ts, descarga.ts, ejemplos.ts, pantalla.ts y propios.ts (jueces/fallos.spec.ts).
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw — «You can throw any
 *    expression, not just expressions of a specific type».
 */
export const motivoDelFallo = (fallo: unknown): string => (fallo instanceof Error ? fallo.message : String(fallo));
