/**
 * mattr-50 (E1; encargo 4.3). Base LÉXICA (base.ts).
 *
 *   media de los TTR de las N − W + 1 ventanas de W = 50 palabras seguidas
 *
 * [DOC] Covington & McFall (2010), «Cutting the Gordian Knot: The
 * Moving-Average Type–Token Ratio (MATTR)», Journal of Quantitative
 * Linguistics 17(2):94-100, doi 10.1080/09296171003643098 (leído entero):
 *   · «We choose a window length (say 500 words) and then compute the TTR
 *     for words 1–500, then for words 2–501, then 3–502, and so on to the end
 *     of the text. The mean of all these TTRs is a measure of the lexical
 *     diversity of the entire text»;
 *   · «the computation of the N − W + 1 individual TTRs, for a text of
 *     length N with window size W»;
 *   · el tamaño de ventana, «Smaller than the smallest text to be processed».
 * Con N < W no hay ninguna ventana: MATTR no existe y la métrica da null. Con
 * N = W hay una, y MATTR es el TTR del texto. (TAALED, ld.py:108-110, commit
 * 27b19e1, devuelve el TTR del texto entero con menos de 51 palabras; aquí se
 * sigue al artículo: respuesta de Antonio a la parada del 4.3.)
 * La ventana de 50: la «típica» de estadistica.md § 1, y la de la tabla de
 * TAALED «Use with confidence (★★★) — MATTR (50), MTLD-Original (50)»
 * (docs/ld_indices/1. Revised_LD_indices.md, líneas 171-176, que la toma de
 * Zenker & Kyle 2021; ese artículo es de pago y no se ha leído).
 * Por debajo de 50 palabras no es fiable, pero eso lo cubre el umbral del
 * análisis, no la métrica.
 * El cálculo, como el del artículo: al avanzar la ventana entra una palabra y
 * sale otra, y se ajusta la tabla de frecuencias.
 */
import { palabrasDeProsa, type Metrica } from './base.ts';

const VENTANA = 50;

export const mattr50: Metrica = (texto) => {
  const p = palabrasDeProsa(texto);
  if (p.length < VENTANA) return null;
  const cuenta = new Map<string, number>();
  for (const w of p.slice(0, VENTANA)) cuenta.set(w, (cuenta.get(w) ?? 0) + 1);
  let suma = cuenta.size / VENTANA;
  for (let i = VENTANA; i < p.length; i++) {
    const sale = p[i - VENTANA]!;
    const n = cuenta.get(sale)! - 1;
    if (n === 0) cuenta.delete(sale);
    else cuenta.set(sale, n);
    cuenta.set(p[i]!, (cuenta.get(p[i]!) ?? 0) + 1);
    suma += cuenta.size / VENTANA;
  }
  return suma / (p.length - VENTANA + 1);
};
