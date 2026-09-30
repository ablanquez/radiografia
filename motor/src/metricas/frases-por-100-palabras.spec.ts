/**
 * Jueces de frases-por-100-palabras (S1; encargo 4.3). Cifras A MANO, con la
 * cuenta en el comentario de cada juez.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { frasesPor100Palabras } from './frases-por-100-palabras.ts';

const valor = (t: string) => frasesPor100Palabras(analizarTexto(t));

describe('frases-por-100-palabras', () => {
  test('3 frases y 8 palabras → 3 / 8 × 100 = 37,5', () => {
    // «El río baja.» (3) «Hoy llueve mucho.» (3) «Mañana no.» (2): 8 palabras, 3 frases.
    assert.equal(valor('El río baja. Hoy llueve mucho. Mañana no.'), 37.5);
  });

  test('solo prosa: una viñeta no aporta frases ni palabras → sigue en 37,5', () => {
    assert.equal(valor('El río baja. Hoy llueve mucho. Mañana no.\n- una viñeta con cinco palabras'), 37.5);
  });

  test('un segmento sin palabras («***») no es una frase → sigue en 37,5', () => {
    assert.equal(valor('El río baja. Hoy llueve mucho. Mañana no.\n***'), 37.5);
  });

  test('sin palabras de prosa → null', () => {
    assert.equal(valor(''), null);
    assert.equal(valor('- solo una viñeta'), null);
  });
});
