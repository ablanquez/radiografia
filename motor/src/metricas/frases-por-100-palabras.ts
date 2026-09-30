/**
 * frases-por-100-palabras (S1; encargo 4.3). Base de FRASE (base.ts).
 *
 *   frases de prosa / palabras de prosa × 100
 *
 * Definición del encargo 4.3. Lo que mide está medido en español: los LLM
 * escriben «más oraciones por texto y más puntos» (ROBOT-TALK, Alonso Simón
 * et al., RAEL 23, 2025; docs/investigacion/sintaxis.md § 1 y CANDIDATAS.md,
 * S1). Las frases son las de Intl.Segmenter (texto.ts), con sus hallazgos:
 * «Sr.» parte la frase, «…» (U+2026) no la parte y «...» sí.
 * null: sin palabras de prosa.
 */
import { frasesDeProsa, palabrasDeProsa, type Metrica } from './base.ts';

export const frasesPor100Palabras: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto).length;
  if (palabras === 0) return null;
  return (frasesDeProsa(texto).length * 100) / palabras;
};
