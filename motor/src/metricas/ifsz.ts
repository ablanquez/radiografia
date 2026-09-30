/**
 * ifsz (E12; encargo 4.3): Índice de Flesch-Szigriszt. Bases LÉXICA y de
 * FRASE (base.ts).
 *
 *   206,835 − 62,3 · (sílabas / palabras) − (palabras / frases)
 *
 * Fuente del índice y del nombre: Barrio-Cantalejo, I. M., Simón-Lorda, P. et
 *   al. (2008), «Validation of the INFLESZ scale to evaluate readability of
 *   texts aimed at the patient» (título de la versión de SciELO), Anales del
 *   Sistema Sanitario de Navarra 31(2):135-152,
 *   https://scielo.isciii.es/scielo.php?script=sci_arttext&pid=S1137-66272008000300004
 *   Imprime la fórmula «206,835 – 62,3 x (Sílabas/Palabra – Palabras/Frases)»,
 *   con el paréntesis mal puesto: tal cual, restaría 62,3 veces las palabras
 *   por frase.
 * Fuente primaria de la fórmula: Szigriszt Pazos, F. (1993), «Sistemas
 *   predictivos de legibilidad del mensaje escrito: fórmula de perspicuidad»,
 *   tesis doctoral (leída en 1992), Universidad Complutense de Madrid
 *   (https://hdl.handle.net/20.500.14352/62699), pág. 407, leída en la capa de
 *   texto del PDF escaneado: «Para todo tamaño de muestra en lengua española:
 *   P = 207 − (62,3 s) : p − (p : f)», con s sílabas, p palabras y f frases.
 *   Confirma el 62,3 (un blog SEO da 62,5: docs/investigacion/sintaxis.md § 8)
 *   y da la CONSTANTE 207, no 206,835. Se sigue 206,835, el del índice con ese
 *   nombre (decisión de Antonio en la parada del 4.3): la diferencia, 0,165,
 *   es una constante y no altera ninguna comparación con percentiles.
 *
 * Sílabas: las de silabea (motor/src/terceros/silabea.cjs; 57 de 60 palabras
 * como la Ortografía, silabas.spec.ts), sobre cada palabra tal cual.
 * [PROPIO] Una cifra («2», «1.000») cuenta como una sílaba: es lo que da
 * silabea, que no lee números.
 * Es contexto, no señal: mide longitud de palabra y de frase y no detecta IA
 * (sintaxis.md § 8).
 * null: sin palabras de prosa.
 */
import silabea from '../terceros/silabea.cjs';
import { frasesDeProsa, palabrasDeProsa, type Metrica } from './base.ts';

export const ifsz: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto);
  const frases = frasesDeProsa(texto).length;
  if (palabras.length === 0 || frases === 0) return null;
  const silabas = palabras.reduce((n, w) => n + silabea.getSilabas(w).silabas.length, 0);
  return 206.835 - (62.3 * silabas) / palabras.length - palabras.length / frases;
};
