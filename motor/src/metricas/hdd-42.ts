/**
 * hdd-42 (E3; encargo 4.3). Base LÉXICA (base.ts).
 *
 *   Σ sobre los tipos t de  [ 1 − C(N − fₜ, 42) / C(N, 42) ] / 42
 *
 * N palabras, fₜ las veces que sale el tipo t. 1 − C(N − fₜ, 42) / C(N, 42) es
 * la probabilidad hipergeométrica de que t salga al menos una vez en una
 * muestra de 42 palabras sin reemplazo. Escala de TTR: la suma se divide
 * entre 42.
 *
 * Fuente primaria, de pago, NO LEÍDA: McCarthy & Jarvis (2010), Behavior
 * Research Methods 42(2):381-392, doi 10.3758/BRM.42.2.381. Implementación
 * contrastada con TAALED y lexical_diversity (respuesta de Antonio a la
 * segunda parada del 4.3), que COINCIDEN en dividir entre 42:
 *   · TAALED, taaled/ld.py, commit 27b19e1, líneas 167-168:
 *     «prob_1 = 1.0 - (float((choose(freq, successes) * choose((population_size
 *     - freq),(sample_size - successes)))) / float(choose(population_size,
 *     sample_size)))» y «prob_1 = prob_1 * (1/sample_size)»; y su
 *     documentación (docs/ld_indices/1. Revised_LD_indices.md, línea 124):
 *     «these probabilities are then added together to produce the final value
 *     for the text. For convenience, TAALED reports these values on the same
 *     scale as TTR».
 *   · lexical_diversity, lexical_diversity.py, commit d78d45f, línea 99:
 *     «contribution = (1.0 - hypergeometric(len(word_array), sample_size,
 *     type_counts[token_type], 0.0)) / sample_size», con el comentario
 *     (líneas 95-96) que cita a McCarthy & Jarvis 2010: «the mean contribution
 *     of any given type is 1/42 multiplied by the percentage of combinations
 *     in which the type would be found».
 * Sobre el texto de prueba de 322 palabras las dos dan 0,83692733726478
 * (herramientas/oraculo-ld.py).
 *
 * El cociente C(N − f, 42) / C(N, 42) se calcula con logaritmos, como suma de
 * log((N − f − i) / (N − i)) para i = 0…41, para no desbordar con N grande
 * [PROPIO; es la misma cantidad]. Si N − f < 42, el cociente es 0: el tipo sale
 * seguro.
 * null: menos de 42 palabras (no hay muestra de 42).
 */
import { palabrasDeProsa, type Metrica } from './base.ts';

const MUESTRA = 42;

/** C(N − f, 42) / C(N, 42): la probabilidad de que un tipo con f apariciones NO salga en la muestra. */
function noSale(N: number, f: number): number {
  if (N - f < MUESTRA) return 0;
  let log = 0;
  for (let i = 0; i < MUESTRA; i++) log += Math.log((N - f - i) / (N - i));
  return Math.exp(log);
}

export const hdd42: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto);
  const N = palabras.length;
  if (N < MUESTRA) return null;
  const frecuencias = new Map<string, number>();
  for (const w of palabras) frecuencias.set(w, (frecuencias.get(w) ?? 0) + 1);
  let suma = 0;
  for (const f of frecuencias.values()) suma += (1 - noSale(N, f)) / MUESTRA;
  return suma;
};
