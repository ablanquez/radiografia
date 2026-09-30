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
import type { TramoDeCalibracion } from './paquete.ts';

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

/**
 * El tramo de cabecera.calibracion que toca a un texto (encargo 4.3): 100-299,
 * 300-599 o 600+ palabras de prosa [PROPIO, tramos del 4.1; 100–199 y 200–299
 * van juntos porque por debajo de 300 el análisis ya es «poco fiable»]. Por
 * debajo de 100, ninguno: el texto no se analiza.
 */
export function tramoDeCalibracion(palabrasProsa: number): TramoDeCalibracion | null {
  if (palabrasProsa < MINIMO) return null;
  if (palabrasProsa < COMPLETO) return '100-299';
  if (palabrasProsa < 600) return '300-599';
  return '600+';
}
