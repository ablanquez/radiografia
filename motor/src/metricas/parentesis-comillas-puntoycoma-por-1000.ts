/**
 * parentesis-comillas-puntoycoma-por-1000 (P15; encargo 4.3). Base de
 * PUNTUACIÓN (base.ts) para los signos; las palabras, de la base léxica.
 *
 *   signos / palabras de prosa × 1.000,  con los signos  ( ) « » " ;
 *
 * [PROPIO] El conjunto sigue el NOMBRE que fija el encargo: paréntesis,
 * comillas (las mismas del conjunto de puntuacion-por-1000: « » ") y punto y
 * coma. docs/investigacion/puntuacion-formato.md (P15) lista además «dos
 * puntos» y «barras»; aquí no entran (discrepancia declarada, reportada).
 * Medido en español: menos paréntesis, comillas, punto y coma… en texto
 * generado (ROBOT-TALK, nivel 3; P15). Un signo entre dos cifras no cuenta.
 * null: sin palabras de prosa.
 */
import { contarSignos, palabrasDeProsa, textosDeProsa, type Metrica } from './base.ts';

const SIGNOS = new Set(['(', ')', '«', '»', '"', ';']);

export const parentesisComillasPuntoycomaPor1000: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto).length;
  if (palabras === 0) return null;
  const signos = textosDeProsa(texto).reduce((n, t) => n + contarSignos(t, SIGNOS), 0);
  return (signos * 1000) / palabras;
};
