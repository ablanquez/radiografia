/**
 * Jueces de pronombres-anaforicos-por-1000 (D16; encargo 5.5): formas de la
 * lista (él, ella, ellos, ellas, lo, la, los, las, le, les, demostrativos y
 * cuyo) por 1.000 palabras de prosa. Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { pronombresAnaforicosPor1000 } from './pronombres-anaforicos-por-1000.ts';

const valor = (t: string) => pronombresAnaforicosPor1000(analizarTexto(t));

describe('pronombres-anaforicos-por-1000', () => {
  test('él, lo y ella: 3 de 6 palabras → 500', () => {
    // Palabras: él lo sabe y ella también = 6.
    assert.equal(valor('Él lo sabe y ella también.'), 500);
  });

  test('los artículos la y los también cuentan (la métrica sobreestima): 2 de 5 → 400', () => {
    // Palabras: la casa y los perros = 5.
    assert.equal(valor('La casa y los perros.'), 400);
  });

  test('«el» sin tilde es artículo y no cuenta; «él» sí: 1 de 4 → 250', () => {
    // Palabras: el perro y él = 4.
    assert.equal(valor('El perro y él.'), 250);
  });

  test('los demostrativos cuentan también como determinantes: este y aquel, 2 de 4 → 500', () => {
    // Palabras: este libro y aquel = 4.
    assert.equal(valor('Este libro y aquel.'), 500);
  });

  test('cuya: 1 de 5 palabras → 200', () => {
    // Palabras: el autor cuya obra conozco = 5.
    assert.equal(valor('El autor, cuya obra conozco.'), 200);
  });

  test('un pronombre pegado al verbo no se ve: «dáselo» es una palabra → 0', () => {
    assert.equal(valor('Dáselo ahora.'), 0);
  });

  test('sin palabras de prosa → null', () => {
    assert.equal(valor(''), null);
  });
});
