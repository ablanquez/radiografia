/**
 * El umbral de longitud mínima (encargo 4.1; alcance del plan, ítem 11).
 *
 * Firmado por Antonio el 29/09/2026 con fuentes (docs/investigacion/
 * estadistica.md § 5): se cuentan las palabras de PROSA —sin viñetas, tablas
 * ni código, como hace Turnitin (ibid.)— y:
 *   · menos de 100      → «insuficiente»: no se analiza;
 *   · de 100 a 299      → «poco-fiable»: se analiza con aviso;
 *   · 300 o más         → «completo».
 * Qué es prosa y qué es palabra lo decide texto.ts (Intl.Segmenter).
 */
import type { Texto } from './texto.ts';

export type Tramo = 'insuficiente' | 'poco-fiable' | 'completo';

export const MINIMO = 100;
export const COMPLETO = 300;

export function evaluarLongitud(texto: Texto): { palabrasProsa: number; tramo: Tramo } {
  const palabrasProsa = texto.parrafos
    .filter((p) => p.prosa)
    .reduce((n, p) => n + p.frases.reduce((m, f) => m + f.palabras.length, 0), 0);
  const tramo: Tramo = palabrasProsa < MINIMO ? 'insuficiente' : palabrasProsa < COMPLETO ? 'poco-fiable' : 'completo';
  return { palabrasProsa, tramo };
}
