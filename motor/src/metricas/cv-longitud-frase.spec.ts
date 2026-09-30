/**
 * Jueces de cv-longitud-frase (S2; encargo 4.3): desviación típica
 * POBLACIONAL de las palabras por frase entre su media. Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { cvLongitudFrase } from './cv-longitud-frase.ts';

const valor = (t: string) => cvLongitudFrase(analizarTexto(t));

describe('cv-longitud-frase', () => {
  test('frases de 2, 4 y 6 palabras → √(8/3) / 4 = √6 / 6 ≈ 0,408248290463863', () => {
    // «Llueve hoy.» 2 · «El río baja mucho.» 4 · «Mañana el agua llegará al pueblo.» 6.
    // Media = 12 / 3 = 4. Varianza poblacional = ((2−4)² + (4−4)² + (6−4)²) / 3 = 8 / 3.
    // Desviación = √(8/3) = 1,632993161855452. CV = 1,632993161855452 / 4 = 0,408248290463863.
    const v = valor('Llueve hoy. El río baja mucho. Mañana el agua llegará al pueblo.');
    assert.ok(v !== null && Math.abs(v - 0.408248290463863) < 1e-12, String(v));
  });

  test('una sola frase → desviación 0 → CV 0', () => {
    assert.equal(valor('El río baja mucho.'), 0);
  });

  test('sin frases de prosa → null', () => {
    assert.equal(valor(''), null);
    assert.equal(valor('- solo una viñeta'), null);
  });
});
