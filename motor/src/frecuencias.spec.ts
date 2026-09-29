/**
 * El juez de la lista de frecuencias (encargo 3.3): data/frecuencias/
 * es-wordfreq.json, exportada de wordfreq 3.1.1 (CC BY-SA 4.0; ver su
 * LICENSE-CC-BY-SA-4.0.md y motor/herramientas/exportar-wordfreq.py).
 *
 * Lo que se compra: que el fichero carga, que tiene las 20.000 formas que se
 * pidieron, en orden de mayor a menor frecuencia, y que arriba están las
 * palabras que tienen que estar («de», «la», «que» entre las diez primeras).
 *
 * Se lee DENTRO de cada test (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const LISTA = new URL('../../data/frecuencias/es-wordfreq.json', import.meta.url);
const ESPERADAS = 20_000;

let formas: [string, number][] | undefined;
function leer(): [string, number][] {
  formas ??= (JSON.parse(readFileSync(LISTA, 'utf8')) as { formas: [string, number][] }).formas;
  return formas;
}

describe('la lista de frecuencias del español (wordfreq)', () => {
  test(`carga y tiene ${ESPERADAS} formas, todas distintas`, () => {
    const f = leer();
    assert.equal(f.length, ESPERADAS);
    assert.equal(new Set(f.map(([forma]) => forma)).size, f.length, 'hay formas repetidas');
  });

  test('está ordenada de mayor a menor frecuencia Zipf', () => {
    const f = leer();
    for (let i = 1; i < f.length; i++) {
      assert.ok(f[i]![1] <= f[i - 1]![1], `posición ${i}: «${f[i]![0]}» (${f[i]![1]}) va detrás de «${f[i - 1]![0]}» (${f[i - 1]![1]})`);
    }
  });

  test('«de», «la» y «que» están entre las diez primeras', () => {
    const diez = leer().slice(0, 10).map(([forma]) => forma);
    for (const p of ['de', 'la', 'que']) assert.ok(diez.includes(p), `«${p}» no está entre las diez primeras: ${diez.join(', ')}`);
  });
});
