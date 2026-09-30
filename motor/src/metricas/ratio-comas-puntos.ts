/**
 * ratio-comas-puntos (P14; encargo 4.3). Base de PUNTUACIÓN (base.ts): el
 * texto original de los párrafos de prosa.
 *
 *   comas / puntos que cierran frase
 *
 * Medido en español: ratio bajo en texto generado, más puntos y menos comas
 * (ROBOT-TALK; docs/investigacion/puntuacion-formato.md, P14).
 * [PROPIO] «Punto que cierra frase»: la frase (de Intl.Segmenter, sin blancos
 * finales) acaba en «.» una vez quitados los signos de cierre que puedan
 * seguirlo ( » " ” ’ ) ] ), y ese punto no es el último de unos puntos
 * suspensivos («...»). Una coma entre dos cifras («3,5») es de un número y no
 * cuenta (base.ts, contarSignos).
 * null: ninguna frase cerrada con punto.
 */
import { contarSignos, frasesDeProsa, textosDeProsa, type Metrica } from './base.ts';

const COMA = new Set([',']);
const CIERRES = /[»"”’)\]]+$/u;

function cierraConPunto(frase: string): boolean {
  const sinCierres = frase.replace(CIERRES, '');
  return sinCierres.endsWith('.') && !sinCierres.endsWith('..');
}

export const ratioComasPuntos: Metrica = (texto) => {
  const puntos = frasesDeProsa(texto).filter((f) => cierraConPunto(f.texto)).length;
  if (puntos === 0) return null;
  const comas = textosDeProsa(texto).reduce((n, t) => n + contarSignos(t, COMA), 0);
  return comas / puntos;
};
