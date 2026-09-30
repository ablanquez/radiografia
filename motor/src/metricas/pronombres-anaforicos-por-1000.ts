/**
 * pronombres-anaforicos-por-1000 (D16; encargo 5.5). Métrica de CONTEXTO.
 * Base LÉXICA (base.ts): las palabras de prosa, en minúsculas y sin
 * normalizar tildes («el» artículo y «él» pronombre son tipos distintos).
 *
 *   palabras de la lista / palabras de prosa × 1.000
 *
 * Lista [PROPIO, encargo 5.5, a partir de docs/investigacion/discurso.md § 7]:
 * él, ella, ellos, ellas, lo, la, los, las, le, les, este, esta, estos,
 * estas, ese, esa, esos, esas, aquel, aquella, aquellos, aquellas, cuyo,
 * cuya, cuyos, cuyas.
 * Cualitativo en español: los humanos sustituyen con sinónimos y pronombres
 * donde el texto generado repite palabras («pronominal substitution»; UCM,
 * IberLEF 2023; discurso.md § 7, CANDIDATAS D16). Sin medición.
 * ⚠️ «lo», «la», «los» y «las» son también artículos, y los demostrativos
 *    también determinantes («este libro»): sin etiquetado gramatical (fuera
 *    de la v1) no se distinguen, y la métrica sobreestima. Solo contexto.
 * ⚠️ Un pronombre pegado al verbo no se ve («dáselo» es una palabra).
 * null: sin palabras de prosa.
 */
import { palabrasDeProsa, type Metrica } from './base.ts';

const LISTA: ReadonlySet<string> = new Set([
  'él', 'ella', 'ellos', 'ellas',
  'lo', 'la', 'los', 'las', 'le', 'les',
  'este', 'esta', 'estos', 'estas',
  'ese', 'esa', 'esos', 'esas',
  'aquel', 'aquella', 'aquellos', 'aquellas',
  'cuyo', 'cuya', 'cuyos', 'cuyas',
]);

export const pronombresAnaforicosPor1000: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto);
  if (palabras.length === 0) return null;
  const pronombres = palabras.filter((p) => LISTA.has(p)).length;
  return (pronombres * 1000) / palabras.length;
};
