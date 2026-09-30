/**
 * Los jueces del percentil tipo 7 de Hyndman & Fan y de la posición de un
 * valor respecto a una celda de calibración (encargo 4.3). Cifras A MANO:
 *   h = (n − 1) · p + 1  (posición 1-based en los valores ORDENADOS)
 *   Q(p) = x⌊h⌋ + (h − ⌊h⌋) · (x⌊h⌋+1 − x⌊h⌋)
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { percentil, posicionRespectoACalibracion } from './percentil.ts';
import type { Celda } from './paquete.ts';

const cerca = (v: number, esperado: number) => assert.ok(Math.abs(v - esperado) < 1e-12, `salió ${v}, se esperaba ${esperado}`);

describe('percentil (tipo 7)', () => {
  test('[1, 2, 3, 4, 5]: p50 = 3, p25 = 2, p90 = 4,6', () => {
    // n = 5. p50: h = 4 · 0,5 + 1 = 3 → x3 = 3.
    //        p25: h = 4 · 0,25 + 1 = 2 → x2 = 2.
    //        p90: h = 4 · 0,9 + 1 = 4,6 → x4 + 0,6 · (x5 − x4) = 4 + 0,6 · 1 = 4,6.
    cerca(percentil([1, 2, 3, 4, 5], 0.5), 3);
    cerca(percentil([1, 2, 3, 4, 5], 0.25), 2);
    cerca(percentil([1, 2, 3, 4, 5], 0.9), 4.6);
  });

  test('[3, 1, 2]: ordena antes → [1, 2, 3], p50 = 2 (h = 2 · 0,5 + 1 = 2)', () => {
    cerca(percentil([3, 1, 2], 0.5), 2);
  });

  test('los extremos: p0 es el mínimo (h = 1) y p1 el máximo (h = n)', () => {
    cerca(percentil([10, 40, 20, 30], 0), 10);
    cerca(percentil([10, 40, 20, 30], 1), 40);
  });

  test('un solo valor → ese valor, para cualquier p (h = 1)', () => {
    cerca(percentil([7.5], 0.05), 7.5);
    cerca(percentil([7.5], 0.99), 7.5);
  });

  test('sin valores, o con p fuera de [0, 1] → error, no un número inventado', () => {
    assert.throws(() => percentil([], 0.5), /ningún valor/);
    assert.throws(() => percentil([1, 2], 1.5), /entre 0 y 1/);
  });
});

describe('posicionRespectoACalibracion', () => {
  const celda: Celda = { p1: 2, p5: 3, p50: 5, p95: 7, p99: 8, n: 40, corpus: 'de prueba', fecha: '2026-09-30', metodo: 'hyndman-fan-7' };
  const pos = (valor: number, direccion: 'mayor' | 'menor' | 'ambas', p: 'p95' | 'p99') => {
    const r = posicionRespectoACalibracion(valor, celda, direccion, p);
    assert.equal(r.referencia, celda);
    return [r.fuera, r.lado];
  };

  test('«mayor» con p95: fuera solo por ENCIMA de p95 (7); en el borde, dentro', () => {
    assert.deepEqual(pos(7.1, 'mayor', 'p95'), [true, 'arriba']);
    assert.deepEqual(pos(7, 'mayor', 'p95'), [false, null]);
    assert.deepEqual(pos(1, 'mayor', 'p95'), [false, null]);
  });

  test('«menor» con p95: fuera solo por DEBAJO de p5 (3)', () => {
    assert.deepEqual(pos(2.9, 'menor', 'p95'), [true, 'abajo']);
    assert.deepEqual(pos(3, 'menor', 'p95'), [false, null]);
    assert.deepEqual(pos(9, 'menor', 'p95'), [false, null]);
  });

  test('«ambas» con p95: fuera de [3, 7] por cualquiera de los dos lados', () => {
    assert.deepEqual(pos(7.5, 'ambas', 'p95'), [true, 'arriba']);
    assert.deepEqual(pos(2.5, 'ambas', 'p95'), [true, 'abajo']);
    assert.deepEqual(pos(5, 'ambas', 'p95'), [false, null]);
  });

  test('con p99 la banda es [p1, p99] = [2, 8]: 7,5 queda dentro y 8,5 fuera', () => {
    assert.deepEqual(pos(7.5, 'ambas', 'p99'), [false, null]);
    assert.deepEqual(pos(8.5, 'mayor', 'p99'), [true, 'arriba']);
    assert.deepEqual(pos(1.5, 'menor', 'p99'), [true, 'abajo']);
  });
});
