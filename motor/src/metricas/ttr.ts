/**
 * ttr (E13; encargo 4.3). Base LÉXICA (base.ts).
 *
 *   tipos / palabras
 *
 * [DOC] Covington & McFall (2010), «Cutting the Gordian Knot: The
 * Moving-Average Type–Token Ratio (MATTR)», Journal of Quantitative
 * Linguistics 17(2):94-100, doi 10.1080/09296171003643098: «Type–token ratio
 * (TTR), or vocabulary size divided by text length (V/N)», y «The problem is
 * that the TTR of a text sample is affected by its length». Por eso la
 * calibración va por tramos de longitud (cabecera.calibracion) y el TTR solo
 * se compara dentro de su tramo. Medido en español: +2,3–2,8 % en humanos
 * (Alonso Simón et al., RAEL 23; estadistica.md § 1, E13).
 * null: sin palabras de prosa.
 */
import { palabrasDeProsa, type Metrica } from './base.ts';

export const ttr: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto);
  if (palabras.length === 0) return null;
  return new Set(palabras).size / palabras.length;
};
