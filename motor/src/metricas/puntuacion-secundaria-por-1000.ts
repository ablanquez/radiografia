/**
 * puntuacion-secundaria-por-1000 (P15; encargo 4.3 como
 * parentesis-comillas-puntoycoma-por-1000, renombrada y ampliada en el 5.5).
 * Base de PUNTUACIÓN (base.ts) para los signos; las palabras, de la base
 * léxica.
 *
 *   signos / palabras de prosa × 1.000,  con los signos  ( ) « » " “ ” ; : / —
 *
 * El conjunto es el de P15 en docs/investigacion/puntuacion-formato.md
 * (paréntesis, comillas, punto y coma, dos puntos, barras), con las comillas
 * curvas “ ” (decisión del 30/09, RADIOGRAFIA-ESTADO.md § 6) y la raya, que
 * ROBOT-TALK cuenta en «otros» (Tabla 7, nivel 3). El guion corto, que
 * ROBOT-TALK también cuenta, no entra: une las partes de los compuestos
 * («coche-cama»).
 * Medido en español: menos paréntesis, comillas, punto y coma, dos puntos y
 * barras en texto generado (ROBOT-TALK, nivel 3; P15). Un signo entre dos
 * cifras no cuenta («10:30», «1/2»; base.ts, contarSignos).
 * ⚠️ Una URL escrita en la prosa suma sus barras.
 * null: sin palabras de prosa.
 */
import { contarSignos, palabrasDeProsa, textosDeProsa, type Metrica } from './base.ts';

const SIGNOS = new Set(['(', ')', '«', '»', '"', '“', '”', ';', ':', '/', '—']);

export const puntuacionSecundariaPor1000: Metrica = (texto) => {
  const palabras = palabrasDeProsa(texto).length;
  if (palabras === 0) return null;
  const signos = textosDeProsa(texto).reduce((n, t) => n + contarSignos(t, SIGNOS), 0);
  return (signos * 1000) / palabras;
};
