/**
 * puntuacion-por-1000 (P16; encargo 4.3). Base de PUNTUACIÓN (base.ts) para
 * los signos; las palabras, de la base léxica.
 *
 *   signos / palabras de prosa × 1.000
 *
 * Conjunto de signos [PROPIO, del encargo 4.3]: . , ; : ¿ ? ¡ ! ( ) « » " — …
 * Nada más: ni el guion, ni la barra, ni las comillas curvas “ ” ‘ ’.
 * «...» cuenta como un signo, igual que «…», y un signo entre dos cifras
 * («3,5», «1.000», «10:30») no cuenta (base.ts, contarSignos).
 * Medido en español y en inglés: puntuación total más baja en texto generado
 * (docs/investigacion/puntuacion-formato.md, P16). La base de 1.000, como la
 * puntuación (Biber, Conrad & Reppen 1998; pseudobibeR: puntuar.ts).
 * null: sin palabras de prosa.
 */
import { contarSignos, palabrasDeProsa, textosDeProsa, type Metrica } from './base.ts';

const SIGNOS = new Set(['.', ',', ';', ':', '¿', '?', '¡', '!', '(', ')', '«', '»', '"', '—', '…']);

export const puntuacionPor1000: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto).length;
  if (palabras === 0) return null;
  const signos = textosDeProsa(texto).reduce((n, t) => n + contarSignos(t, SIGNOS), 0);
  return (signos * 1000) / palabras;
};
