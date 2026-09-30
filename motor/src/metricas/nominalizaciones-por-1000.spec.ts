/**
 * Jueces de nominalizaciones-por-1000 (S5; encargo 5.5): palabras de prosa de
 * más de cinco letras terminadas en -ción, -sión, -miento, -dad, -tad, -ncia
 * o -anza (y sus plurales), por 1.000 palabras de prosa. Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { nominalizacionesPor1000 } from './nominalizaciones-por-1000.ts';

const valor = (t: string) => nominalizacionesPor1000(analizarTexto(t));

describe('nominalizaciones-por-1000', () => {
  test('-ción y -ncia: 3 de 6 palabras → 500', () => {
    // Palabras: la solución exige atención y paciencia = 6; nominalizaciones: solución, atención, paciencia.
    assert.equal(valor('La solución exige atención y paciencia.'), 500);
  });

  test('-miento, -tad y -sión: 3 de 6 palabras → 500', () => {
    // Palabras: el crecimiento la libertad y misión = 6.
    assert.equal(valor('El crecimiento, la libertad y misión.'), 500);
  });

  test('los plurales cuentan: 4 de 5 palabras → 800', () => {
    // Palabras: soluciones movimientos bondades y esperanzas = 5; «bondades» es el falso positivo declarado.
    assert.equal(valor('Soluciones, movimientos, bondades y esperanzas.'), 800);
  });

  test('cinco letras o menos no cuentan: edad, mitad y danza no; misión sí → 1 de 5 palabras = 200', () => {
    assert.equal(valor('Edad, mitad, danza y misión.'), 200);
  });

  test('en mayúsculas cuentan igual (las palabras se pasan a minúsculas): 2 de 5 → 400', () => {
    // Palabras: la nación y la canción = 5.
    assert.equal(valor('La NACIÓN y la Canción.'), 400);
  });

  test('sin la tilde no cuenta: «cancion» no termina en -ción → 0', () => {
    assert.equal(valor('La cancion suena bien.'), 0);
  });

  test('sin palabras de prosa → null', () => {
    assert.equal(valor(''), null);
  });
});
