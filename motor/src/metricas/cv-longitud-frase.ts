/**
 * cv-longitud-frase (S2; encargo 4.3). Base de FRASE (base.ts).
 *
 *   σ / μ, con μ la media de palabras por frase y σ su desviación típica
 *   POBLACIONAL: σ = √( Σ (xᵢ − μ)² / n )
 *
 * [PROPIO] Poblacional y no muestral (n y no n − 1): se describen las frases
 * de ESTE texto, no se estima la de una población. Es el sustituto sin modelo
 * de la «burstiness», que GPTZero definía sobre la perplejidad: «Para un
 * motor sin modelo: el sustituto medible es la DT o el coeficiente de
 * variación de la longitud de frase. Es adaptación [PROPIO], no la métrica
 * original» (docs/investigacion/sintaxis.md § 1, «Burstiness»).
 * Una sola frase: σ = 0 y CV = 0. null: sin frases de prosa.
 */
import { frasesDeProsa, type Metrica } from './base.ts';

export const cvLongitudFrase: Metrica = (texto) => {
  const longitudes = frasesDeProsa(texto).map((f) => f.palabras.length);
  if (longitudes.length === 0) return null;
  const media = longitudes.reduce((s, x) => s + x, 0) / longitudes.length;
  const varianza = longitudes.reduce((s, x) => s + (x - media) ** 2, 0) / longitudes.length;
  return Math.sqrt(varianza) / media;
};
