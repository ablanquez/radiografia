/**
 * Jueces de las celdas de calibración (encargo 5.5): percentiles tipo 7 de
 * Hyndman & Fan sobre los documentos de CALIBRACIÓN de cada tramo, y la celda
 * solo existe con n ≥ 100. Cifras A MANO:
 *   con x = 1, 2, …, 100 y h = (n − 1) · p + 1 = 99 · p + 1,
 *   p1 → h = 1,99 → 1 + 0,99 · (2 − 1) = 1,99;  p5 → h = 5,95 → 5,95;
 *   p50 → h = 50,5 → 50,5;  p95 → h = 95,05 → 95,05;  p99 → h = 99,01 → 99,01.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MINIMO_POR_CELDA, calcularCeldas, type Medida } from './celdas.ts';

const META = { corpus: 'corpus sintético', fecha: '2026-09-30' };

/** n documentos de calibración en un tramo, con valores 1, 2, …, n para «m». */
function sinteticos(n: number, tramo: Medida['tramo'] = '300-599', desde = 1): Medida[] {
  return Array.from({ length: n }, (_, i) => ({ id: `d${desde + i}`, tramo, reparto: 'calibracion', valores: { m: desde + i } }));
}

describe('calcularCeldas', () => {
  test('el mínimo por celda es 100', () => {
    assert.equal(MINIMO_POR_CELDA, 100);
  });

  test('1, 2, …, 100: p1 1,99 · p5 5,95 · p50 50,5 · p95 95,05 · p99 99,01, n = 100', () => {
    const r = calcularCeldas(sinteticos(100), ['m'], META);
    assert.deepEqual(r.celdas['m']?.['300-599'], {
      p1: 1.99,
      p5: 5.95,
      p50: 50.5,
      p95: 95.05,
      p99: 99.01,
      n: 100,
      corpus: 'corpus sintético',
      fecha: '2026-09-30',
      metodo: 'hyndman-fan-7',
    });
    assert.deepEqual(r.omitidas.filter((o) => o.tramo === '300-599'), [], 'los otros dos tramos, sin documentos, sí quedan en omitidas');
  });

  test('n = 99: la celda no se escribe y queda en omitidas (como toda celda que falta, también con n = 0)', () => {
    const r = calcularCeldas(sinteticos(99), ['m'], META);
    assert.equal(r.celdas['m']?.['300-599'], undefined);
    assert.deepEqual(r.omitidas.filter((o) => o.tramo === '300-599'), [{ clave: 'm', tramo: '300-599', n: 99, motivo: 'n < 100' }]);
  });

  test('los de validación no cuentan: 100 de calibración y 30 de validación con valores enormes', () => {
    const validacion: Medida[] = Array.from({ length: 30 }, (_, i) => ({ id: `v${i}`, tramo: '300-599', reparto: 'validacion', valores: { m: 1e9 } }));
    const r = calcularCeldas([...sinteticos(100), ...validacion], ['m'], META);
    assert.equal(r.celdas['m']?.['300-599']?.n, 100);
    assert.equal(r.celdas['m']?.['300-599']?.p99, 99.01);
    assert.deepEqual(r.n, { '100-299': 0, '300-599': 100, '600+': 0 });
  });

  test('un valor null no cuenta en n: 99 valores y un null → no hay celda', () => {
    const nulo: Medida = { id: 'z', tramo: '300-599', reparto: 'calibracion', valores: { m: null } };
    const r = calcularCeldas([...sinteticos(99), nulo], ['m'], META);
    assert.equal(r.celdas['m']?.['300-599'], undefined);
    assert.deepEqual(r.omitidas.filter((o) => o.tramo === '300-599'), [{ clave: 'm', tramo: '300-599', n: 99, motivo: 'n < 100' }]);
    assert.equal(r.n['300-599'], 100, 'n del tramo = documentos de calibración, con o sin valor');
  });

  test('cada tramo por su lado: 100 en 600+ y 50 en 100-299', () => {
    const r = calcularCeldas([...sinteticos(100, '600+'), ...sinteticos(50, '100-299', 1000)], ['m'], META);
    assert.ok(r.celdas['m']?.['600+']);
    assert.equal(r.celdas['m']?.['100-299'], undefined);
    assert.deepEqual(r.omitidas, [
      { clave: 'm', tramo: '100-299', n: 50, motivo: 'n < 100' },
      { clave: 'm', tramo: '300-599', n: 0, motivo: 'n < 100' },
    ]);
  });
});
