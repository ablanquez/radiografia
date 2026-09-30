/**
 * Jueces de puntuacion-por-1000 (P16; encargo 4.3): signos de
 * . , ; : ¿ ? ¡ ! ( ) « » " “ ” — … por 1.000 palabras de prosa (las comillas
 * curvas, desde el 5.5). Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { puntuacionPor1000 } from './puntuacion-por-1000.ts';

const valor = (t: string) => puntuacionPor1000(analizarTexto(t));

describe('puntuacion-por-1000', () => {
  test('9 signos y 10 palabras → 9 / 10 × 1.000 = 900', () => {
    // Signos: ¿ ? , ( ) : « » . = 9. Palabras: llueve hoy sí mucho y hace frío un diluvio enorme = 10.
    assert.equal(valor('¿Llueve hoy? Sí, mucho (y hace frío): «un diluvio enorme».'), 900);
  });

  test('«...» es un signo, igual que «…» → 2 signos / 4 palabras × 1.000 = 500', () => {
    assert.equal(valor('Esperó mucho... Nada más.'), 500);
    assert.equal(valor('Esperó mucho… Nada más.'), 500);
  });

  test('la raya cuenta → 4 signos (— — ; .) / 8 palabras × 1.000 = 500', () => {
    assert.equal(valor('—Vamos ya —dijo ella; y se fue pronto.'), 500);
  });

  test('las comillas curvas cuentan (5.5) y la barra no: “ ” . = 3 / 4 × 1.000 = 750', () => {
    // Palabras: uno dos tres cuatro.
    assert.equal(valor('Uno/dos “tres” cuatro.'), 750);
  });

  test('un signo entre cifras no cuenta → 1 signo («.») / 3 palabras (mide, 3,5, metros)', () => {
    // 1 / 3 × 1.000 = 333,333…
    const v = valor('Mide 3,5 metros.');
    assert.ok(v !== null && Math.abs(v - 1000 / 3) < 1e-9, String(v));
  });

  test('sin palabras de prosa → null', () => {
    assert.equal(valor(''), null);
    assert.equal(valor('- ¿solo, una: viñeta?'), null);
  });
});
