/**
 * Jueces de hdd-42 (E3; encargo 4.3): para cada tipo, la probabilidad de que
 * aparezca al menos una vez en una muestra de 42 palabras sin reemplazo,
 * 1 − C(N − f, 42) / C(N, 42), dividida entre 42 y sumada (escala de TTR).
 * Dos clases de juez, como en mtld.spec.ts: A MANO y ORÁCULO (TAALED HDD,
 * commit 27b19e1, con herramientas/oraculo-ld.py).
 *
 * ⚠️ El fichero de referencia se lee DENTRO del test (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizarTexto } from '../texto.ts';
import { hdd42 } from './hdd-42.ts';

const valor = (t: string) => hdd42(analizarTexto(t));
const repetida = (palabra: string, n: number) => Array<string>(n).fill(palabra);
const cerca = (v: number | null, esperado: number, tolerancia: number) =>
  assert.ok(v !== null && Math.abs(v - esperado) < tolerancia, `salió ${v}, se esperaba ${esperado}`);

describe('hdd-42 · A MANO', () => {
  test('44 palabras: «la» 41 veces, «pa» 2, «ta» 1 → (1 + 945/946) / 42 + 1/44', () => {
    // N = 44; C(44, 42) = C(44, 2) = 44 · 43 / 2 = 946.
    //   «la», f = 41: C(44 − 41, 42) = C(3, 42) = 0 → sale seguro → aporta 1 / 42.
    //   «pa», f = 2:  C(42, 42) = 1 → P(no sale) = 1/946 → aporta (1 − 1/946) / 42 = (945/946) / 42.
    //   «ta», f = 1:  C(43, 42) = 43 → P(no sale) = 43/946 = 1/22 → aporta (21/22) / 42 = 1/44.
    // HD-D = 1/42 + (945/946)/42 + 1/44 = 0,0238095… + 0,0237843… + 0,0227272… = 0,0703211…
    const texto = `${[...repetida('la', 41), 'pa', 'pa', 'ta'].join(' ')}.`;
    cerca(valor(texto), (1 + 945 / 946) / 42 + 1 / 44, 1e-12);
  });

  test('42 palabras iguales → un tipo que sale seguro → 1 / 42', () => {
    cerca(valor(`${repetida('la', 42).join(' ')}.`), 1 / 42, 1e-12);
  });

  test('menos de 42 palabras → no hay muestra de 42 → null', () => {
    assert.equal(valor(`${repetida('la', 41).join(' ')}.`), null);
    assert.equal(valor(''), null);
  });
});

describe('hdd-42 · ORÁCULO (TAALED HDD, commit 27b19e1)', () => {
  test('texto de prueba de 322 palabras → 0,83692733726478 (TAALED …7793 y lexical_diversity …7781: difieren en el orden de la suma)', () => {
    const texto = readFileSync(new URL('../../fixtures/referencia/texto-prueba-322.txt', import.meta.url), 'utf8');
    cerca(valor(texto), 0.83692733726478, 1e-12);
  });
});
