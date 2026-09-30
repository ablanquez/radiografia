/**
 * Jueces de puntuacion-secundaria-por-1000 (P15; encargo 4.3, renombrada y
 * ampliada en el 5.5): signos de ( ) « » " “ ” ; : / — por 1.000 palabras de
 * prosa. Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { puntuacionSecundariaPor1000 } from './puntuacion-secundaria-por-1000.ts';

const valor = (t: string) => puntuacionSecundariaPor1000(analizarTexto(t));

describe('puntuacion-secundaria-por-1000', () => {
  test('5 signos y 8 palabras → 5 / 8 × 1.000 = 625', () => {
    // ( ) ; « » = 5; la coma y el punto no son de este conjunto.
    // Palabras: el río el grande crece otra vez dicen = 8.
    assert.equal(valor('El río (el grande) crece; «otra vez», dicen.'), 625);
  });

  test('las comillas rectas cuentan: " " ( ) ; = 5 / 8 palabras × 1.000 = 625', () => {
    // Palabras: dijo basta en voz baja y se fue = 8.
    assert.equal(valor('Dijo "basta" (en voz baja); y se fue.'), 625);
  });

  test('los dos puntos cuentan (5.5): 1 / 2 palabras × 1.000 = 500', () => {
    // Palabras: dijo basta = 2. El punto final no es de este conjunto.
    assert.equal(valor('Dijo: basta.'), 500);
  });

  test('las comillas curvas cuentan (5.5): “ ” = 2 / 5 palabras × 1.000 = 400', () => {
    // Palabras: dijo basta y se fue = 5.
    assert.equal(valor('Dijo “basta” y se fue.'), 400);
  });

  test('la barra cuenta (5.5): / / = 2 / 5 palabras × 1.000 = 400', () => {
    // La barra parte la palabra: entrada salida y ida vuelta = 5.
    assert.equal(valor('Entrada/salida y ida/vuelta.'), 400);
  });

  test('la raya cuenta (5.5): — — = 2 / 4 palabras × 1.000 = 500', () => {
    // Palabras: vamos ya dijo ella = 4.
    assert.equal(valor('—Vamos ya —dijo ella.'), 500);
  });

  test('entre dos cifras, ni la barra ni los dos puntos cuentan → 0', () => {
    assert.equal(valor('Llegó a las 10:30 con 1/2 kilo.'), 0);
  });

  test('el punto, la coma y ¿ ? no son de este conjunto → 0', () => {
    assert.equal(valor('Sí, claro. ¿Y?'), 0);
  });

  test('sin palabras de prosa → null', () => {
    assert.equal(valor(''), null);
  });
});
