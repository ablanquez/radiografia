/**
 * Jueces de ifsz (E12; encargo 4.3): 206,835 − 62,3 · (sílabas / palabras)
 * − (palabras / frases). Cifras A MANO, con las sílabas contadas según la
 * Ortografía (y el silabeador tiene que dar lo mismo).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { ifsz } from './ifsz.ts';

const valor = (t: string) => ifsz(analizarTexto(t));

describe('ifsz', () => {
  test('«El río baja. Hoy llueve mucho.» → 206,835 − 62,3 · 10/6 − 6/2 = 100,001666…', () => {
    // Sílabas: el (1) · rí.o (2) · ba.ja (2) · hoy (1) · llue.ve (2) · mu.cho (2) = 10.
    // Palabras = 6; frases = 2.
    // 62,3 · 10 / 6 = 103,8333…; 6 / 2 = 3; 206,835 − 103,8333… − 3 = 100,0016666…
    const v = valor('El río baja. Hoy llueve mucho.');
    assert.ok(v !== null && Math.abs(v - 100.00166666666667) < 1e-9, String(v));
  });

  test('sin palabras de prosa → null', () => {
    assert.equal(valor(''), null);
    assert.equal(valor('- solo una viñeta'), null);
  });
});
