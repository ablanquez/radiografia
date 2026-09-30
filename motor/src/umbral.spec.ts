/**
 * Los jueces del umbral de longitud (encargo 4.1; decisión firmada el 29/09,
 * estadistica.md § 5): < 100 palabras de prosa «insuficiente», 100–299
 * «poco-fiable», ≥ 300 «completo». Jueces a los dos lados de cada borde.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from './texto.ts';
import { evaluarLongitud } from './umbral.ts';

/** Una frase de `n` palabras de prosa. */
const prosa = (n: number): string => `${Array.from({ length: n }, () => 'palabra').join(' ')}.`;

describe('evaluarLongitud: los dos bordes, a los dos lados', () => {
  for (const [n, tramo] of [
    [99, 'insuficiente'],
    [100, 'poco-fiable'],
    [299, 'poco-fiable'],
    [300, 'completo'],
  ] as const) {
    test(`${n} palabras de prosa → ${tramo}`, () => {
      assert.deepEqual(evaluarLongitud(analizarTexto(prosa(n))), { palabrasProsa: n, tramo });
    });
  }
});

describe('evaluarLongitud: solo cuenta la prosa', () => {
  test('400 palabras, 350 de ellas en viñetas → 50 de prosa → insuficiente', () => {
    const vinetas = Array.from({ length: 35 }, () => `- ${Array.from({ length: 10 }, () => 'viñeta').join(' ')}`);
    const texto = [prosa(50), ...vinetas].join('\n');
    const segmentado = analizarTexto(texto);
    const todas = segmentado.parrafos.reduce((n, p) => n + p.frases.reduce((m, f) => m + f.palabras.length, 0), 0);
    assert.equal(todas, 400, 'el texto tiene 400 palabras en total');
    assert.deepEqual(evaluarLongitud(segmentado), { palabrasProsa: 50, tramo: 'insuficiente' });
  });
});
