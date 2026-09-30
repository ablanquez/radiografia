/**
 * nominalizaciones-por-1000 (S5; encargo 5.5). Base LÉXICA (base.ts): las
 * palabras de prosa, en minúsculas y sin normalizar tildes.
 *
 *   palabras de más de 5 letras terminadas en -ción, -sión, -miento, -dad,
 *   -tad, -ncia o -anza, o en su plural (-ciones, -siones, -mientos, -dades,
 *   -tades, -ncias, -anzas)  /  palabras de prosa × 1.000
 *
 * Medido en inglés: los modelos ajustados por instrucciones usan
 * nominalizaciones de 1,5 a 2 veces más que los humanos (GPT-4o 2,1×,
 * d = 1,23; Reinhart et al. 2025; docs/investigacion/sintaxis.md § 2,
 * CANDIDATAS.md S5). En español no hay medición.
 * [PROPIO] La lista de terminaciones (encargo 5.5, a partir de sintaxis.md
 * § 2 y CANDIDATAS S5: -ción, -miento, -dad, -ncia, más -sión, -tad y -anza)
 * y el mínimo de más de cinco letras, que deja fuera «edad», «mitad» o
 * «danza».
 * [DOC] Los plurales cuentan como en pseudobibeR, la implementación de los
 *    rasgos de Biber que usa Reinhart: f_14_nominalizations busca
 *    «tion$|tions$|ment$|ments$|ness$|nesses$|ity$|ities$»
 *    (https://github.com/browndw/pseudobibeR, R/parse_functions.R, líneas
 *    326-336, commit 47576286b2be). pseudobibeR exige además que la palabra
 *    sea un nombre (etiqueta NOUN) y descarta una lista de excepciones; aquí
 *    no hay etiquetado gramatical (fuera de la v1) ni lista.
 * ⚠️ Falso positivo estructural: una palabra con esas terminaciones que no
 *    viene de un verbo ni de un adjetivo cuenta igual («ciudad», «verdad»,
 *    «bondad», «ciencia», «balanza»). La métrica sobreestima; los percentiles
 *    humanos, medidos con la misma definición, lo absorben.
 * ⚠️ Sin tilde no cuenta: «cancion» no termina en -ción.
 * null: sin palabras de prosa.
 */
import { palabrasDeProsa, type Metrica } from './base.ts';

const TERMINACIONES = /(ción|ciones|sión|siones|miento|mientos|dad|dades|tad|tades|ncia|ncias|anza|anzas)$/u;
/** «Más de cinco letras» [PROPIO]: la palabra tiene seis caracteres o más. */
const MINIMO = 6;

export const nominalizacionesPor1000: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto);
  if (palabras.length === 0) return null;
  const nominalizaciones = palabras.filter((p) => [...p].length >= MINIMO && TERMINACIONES.test(p)).length;
  return (nominalizaciones * 1000) / palabras.length;
};
