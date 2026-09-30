/**
 * Jueces de ttr (E13; encargo 4.3): tipos / palabras, en minúsculas y sin
 * normalizar tildes. Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { ttr } from './ttr.ts';

const valor = (t: string) => ttr(analizarTexto(t));

describe('ttr', () => {
  test('8 palabras y 5 tipos → 5 / 8 = 0,625', () => {
    // el río y el mar y el cielo → tipos: el, río, y, mar, cielo.
    assert.equal(valor('El río y el mar y el cielo.'), 0.625);
  });

  test('en minúsculas: «El», «EL» y «el» son un tipo → 1 / 3', () => {
    assert.equal(valor('El EL el.'), 1 / 3);
  });

  test('sin normalizar tildes: «río» y «rio» son dos tipos → 2 / 2 = 1', () => {
    assert.equal(valor('Río rio.'), 1);
  });

  test('sin palabras de prosa → null', () => {
    assert.equal(valor(''), null);
  });
});
