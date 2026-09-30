/**
 * Jueces de parentesis-comillas-puntoycoma-por-1000 (P15; encargo 4.3):
 * signos de ( ) « » " ; por 1.000 palabras de prosa. Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { parentesisComillasPuntoycomaPor1000 } from './parentesis-comillas-puntoycoma-por-1000.ts';

const valor = (t: string) => parentesisComillasPuntoycomaPor1000(analizarTexto(t));

describe('parentesis-comillas-puntoycoma-por-1000', () => {
  test('5 signos y 8 palabras → 5 / 8 × 1.000 = 625', () => {
    // ( ) ; « » = 5; la coma y el punto no son de este conjunto.
    // Palabras: el río el grande crece otra vez dicen = 8.
    assert.equal(valor('El río (el grande) crece; «otra vez», dicen.'), 625);
  });

  test('las comillas rectas cuentan: " " ( ) ; = 5 / 8 palabras × 1.000 = 625', () => {
    // Palabras: dijo basta en voz baja y se fue = 8.
    assert.equal(valor('Dijo "basta" (en voz baja); y se fue.'), 625);
  });

  test('los dos puntos no son de este conjunto → 0', () => {
    assert.equal(valor('Dijo: basta.'), 0);
  });

  test('sin palabras de prosa → null', () => {
    assert.equal(valor(''), null);
  });
});
