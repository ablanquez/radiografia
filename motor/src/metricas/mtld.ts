/**
 * mtld (E2; encargo 4.3). Base LÉXICA (base.ts).
 *
 * MTLD-Original según TAALED mtldo, que declara seguir a McCarthy & Jarvis
 * 2010 (fuente primaria de pago, NO LEÍDA); contrastado con lexical_diversity
 * d78d45f: coinciden en factor 0,72, factor parcial (1 − TTR del resto) /
 * (1 − 0,72) y media de ida y vuelta; discrepan en tres reglas de borde
 * (cierre con TTR < 0,72 y mínimo 10 palabras frente a ≤ 0,72 a cualquier
 * longitud; última palabra siempre en el parcial, que puede superar 1, frente
 * a cierre a 1 y parcial 0). Se sigue TAALED. (Texto de la respuesta de
 * Antonio a la segunda parada del 4.3.)
 *
 * Fuente primaria, NO LEÍDA: McCarthy, P. M. & Jarvis, S. (2010), «MTLD,
 *   vocd-D, and HD-D: A validation study of sophisticated approaches to
 *   lexical diversity assessment», Behavior Research Methods 42(2):381-392,
 *   doi 10.3758/BRM.42.2.381 (Springer, de pago; Unpaywall: «closed»).
 * Implementación seguida: TAALED, taaled/ld.py, commit 27b19e1
 *   (https://github.com/LCR-ADS-Lab/TAALED; licencia CC BY-NC-SA 4.0: se
 *   sigue su algoritmo, no se copia su código):
 *   · ld.py:185-206, MTLDER(text, mn=10, ttrval=.720): recorre las palabras; si
 *     es la última, «fact_prop = (1 - TTR(factor_text)) / (1 - ttrval)» — el
 *     factor parcial, línea 194 —; si no, cierra un factor (cuenta 1) cuando
 *     «TTR(factor_text) < ttrval and len(factor_text) >= mn» (línea 198);
 *   · ld.py:209-212, MTLD_O: «nwords = sum(windowl)», «nfactors =
 *     sum(factorprop)», nwords / nfactors;
 *   · ld.py:230-233: ida (text) y vuelta (reversed(text)), y
 *     «valo = stat.mean([MTLD_O(ida), MTLD_O(vuelta)])»;
 *   · docs/ld_indices/1. Revised_LD_indices.md, línea 28: «The .mtldo method
 *     reports the original MTLD as it was explained by McCarthy and Jarvis
 *     (2010) in their paper».
 * Contrastada con: lexical_diversity, lexical_diversity.py, commit d78d45f
 *   (https://github.com/jennafrens/lexical_diversity, MIT): cierre con
 *   «current_ttr <= ttr_threshold» (línea 29), factor parcial «excess /
 *   excess_val» = (1 − TTR) / (1 − 0,72) (líneas 36-38), media de ida y
 *   vuelta (línea 49). Sobre el texto de prueba de 322 palabras las dos dan
 *   108,46676489849378 (herramientas/oraculo-ld.py).
 *
 * [PROPIO] Sin ningún factor, ni completo ni parcial (TTR = 1 de principio a
 * fin), la división no se puede hacer: null. TAALED devuelve 0 (safe_divide,
 * ld.py:63-67) y lexical_diversity −1 (línea 41); las dos son marcas de «no
 * calculable». También null sin palabras.
 * Por debajo de 50 palabras no es fiable (tabla de TAALED «Use with
 * confidence (★★★) — MATTR (50), MTLD-Original (50)», docs/ld_indices/1.
 * Revised_LD_indices.md, líneas 171-176, de Zenker & Kyle 2021, de pago, no
 * leído); eso lo cubre el umbral del análisis, no la métrica.
 */
import { palabrasDeProsa, type Metrica } from './base.ts';

const TTR_FACTOR = 0.72;
const MINIMO_FACTOR = 10;

/** Palabras / factores en una pasada, como MTLDER + MTLD_O de TAALED; null si no hay factores. */
function pasada(palabras: readonly string[]): number | null {
  let factores = 0;
  let tipos = new Set<string>();
  let longitud = 0;
  palabras.forEach((palabra, i) => {
    tipos.add(palabra);
    longitud++;
    const ttr = tipos.size / longitud;
    if (i === palabras.length - 1) {
      factores += (1 - ttr) / (1 - TTR_FACTOR);
    } else if (ttr < TTR_FACTOR && longitud >= MINIMO_FACTOR) {
      factores += 1;
      tipos = new Set<string>();
      longitud = 0;
    }
  });
  return factores === 0 ? null : palabras.length / factores;
}

export const mtld: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto);
  if (palabras.length === 0) return null;
  const ida = pasada(palabras);
  const vuelta = pasada([...palabras].reverse());
  if (ida === null || vuelta === null) return null;
  return (ida + vuelta) / 2;
};
