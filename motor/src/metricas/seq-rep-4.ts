/**
 * seq-rep-4 (E5; encargo 4.3). Base LÉXICA (base.ts).
 *
 *   1 − |4-gramas únicos| / |4-gramas|
 *
 * [DOC] Welleck et al. (2019), «Neural Text Generation with Unlikelihood
 * Training», arXiv 1908.04319 (leído), ecuación 10: «We use the portion of
 * duplicate n-grams (seq-rep-n) in a generated sequence to measure
 * sequence-level repetition. That is, for a continuation x_{k+1:k+N} we
 * compute, seq-rep-n = 1.0 − |unique n-grams(x_{k+1:k+N})| / |n-grams|»;
 * «seq-rep-n is zero when the continuation has no repeating n-grams, and
 * increases towards 1.0 as the model repeats». Su tabla 2: humano 0,006 en
 * Wikitext-103 (estadistica.md § 3: discrimina la degeneración greedy, no los
 * chatbots con muestreo).
 * [PROPIO] Welleck lo mide sobre tokens de un modelo en cada continuación; aquí,
 * sobre las palabras de prosa del texto entero, en orden: los 4-gramas
 * cruzan frases y párrafos.
 * null: menos de 4 palabras (ningún 4-grama).
 */
import { palabrasDeProsa, type Metrica } from './base.ts';

const N = 4;

export const seqRep4: Metrica = (texto) => {
  const p = palabrasDeProsa(texto);
  const total = p.length - N + 1;
  if (total <= 0) return null;
  const unicos = new Set<string>();
  // Las palabras no llevan espacios (Intl.Segmenter): unidas con uno, cada 4-grama es una clave sin ambigüedad.
  for (let i = 0; i < total; i++) unicos.add(p.slice(i, i + N).join(' '));
  return 1 - unicos.size / total;
};
