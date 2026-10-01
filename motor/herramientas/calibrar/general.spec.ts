/**
 * Jueces de general.ts (encargo 5.5, género «general»): la regla de la mezcla
 * (paradas de narrativa, punto 8, y 3, punto 4). Cifras A MANO, con tres
 * géneros sintéticos:
 *   A: 100-299 150 cal / 30 val · 300-599 100 / 10 · 600+  50 / 5
 *   B: 100-299 120 / 40          · 300-599 300 / 60 · 600+ 200 / 50
 *   C: 100-299  90 / 20          · 300-599 110 / 25 · 600+ 130 / 20
 * Con mínimo 100: 100-299, A y B (C no llega) → 120 de cada uno (240) y 30 de
 * validación de cada uno (60); 300-599, los tres → 100 de cada uno (300) y 10
 * (30); 600+, B y C (A no llega) → 130 de cada uno (260) y 20 (40).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { ordenDeMuestra, type Reparto } from './comun.ts';
import { mezclar, type EntradaDeGenero } from './general.ts';

function genero(nombre: string, cuentas: Record<TramoDeCalibracion, [number, number]>): EntradaDeGenero {
  const documentos: EntradaDeGenero['documentos'][number][] = [];
  for (const [tramo, [cal, val]] of Object.entries(cuentas) as [TramoDeCalibracion, [number, number]][]) {
    for (let i = 0; i < cal; i++) documentos.push({ id: `${nombre}-${tramo}-c${i}`, tramo, reparto: 'calibracion' });
    for (let i = 0; i < val; i++) documentos.push({ id: `${nombre}-${tramo}-v${i}`, tramo, reparto: 'validacion' });
  }
  const calibracion = Object.fromEntries(Object.entries(cuentas).map(([t, [cal]]) => [t, cal])) as Record<TramoDeCalibracion, number>;
  return { genero: nombre, calibracion, documentos };
}
const A = genero('A', { '100-299': [150, 30], '300-599': [100, 10], '600+': [50, 5] });
const B = genero('B', { '100-299': [120, 40], '300-599': [300, 60], '600+': [200, 50] });
const C = genero('C', { '100-299': [90, 20], '300-599': [110, 25], '600+': [130, 20] });

describe('mezclar', () => {
  const r = mezclar([A, B, C], 100, 's');

  test('por tramo: los géneros con celda, el mínimo común entre ellos y la suma', () => {
    assert.deepEqual(r.tramos, {
      '100-299': { generos: ['A', 'B'], calibracionPorGenero: 120, validacionPorGenero: 30, calibracion: 240, validacion: 60, existe: true },
      '300-599': { generos: ['A', 'B', 'C'], calibracionPorGenero: 100, validacionPorGenero: 10, calibracion: 300, validacion: 30, existe: true },
      '600+': { generos: ['B', 'C'], calibracionPorGenero: 130, validacionPorGenero: 20, calibracion: 260, validacion: 40, existe: true },
    });
  });

  test('los elegidos de cada género, los primeros por huella; calibración de calibración y validación de validación', () => {
    const de = (g: string, t: TramoDeCalibracion, rep: Reparto) => r.elegidos.filter((e) => e.genero === g && e.tramo === t && e.reparto === rep).map((e) => e.id);
    const primeros = (g: EntradaDeGenero, t: TramoDeCalibracion, rep: Reparto, k: number) =>
      ordenDeMuestra('s', g.documentos.filter((d) => d.tramo === t && d.reparto === rep), (d) => `general|${g.genero}|${d.id}`)
        .slice(0, k)
        .map((d) => d.id);
    assert.deepEqual(de('A', '100-299', 'calibracion'), primeros(A, '100-299', 'calibracion', 120));
    assert.deepEqual(de('B', '600+', 'validacion'), primeros(B, '600+', 'validacion', 20));
    assert.equal(de('C', '100-299', 'calibracion').length, 0, 'C no tiene celda en 100-299');
    assert.equal(de('A', '600+', 'calibracion').length, 0, 'A no tiene celda en 600+');
    assert.equal(r.elegidos.length, 240 + 60 + 300 + 30 + 260 + 40);
    assert.ok(r.elegidos.every((e) => e.id.includes(e.reparto === 'calibracion' ? '-c' : '-v')));
  });

  test('un tramo sin ningún género con celda no existe y no da documentos', () => {
    const s = mezclar([A, C], 100, 's');
    assert.deepEqual(s.tramos['600+'], { generos: ['C'], calibracionPorGenero: 130, validacionPorGenero: 20, calibracion: 130, validacion: 20, existe: true });
    const t = mezclar([A], 100, 's');
    assert.deepEqual(t.tramos['600+'], { generos: [], calibracionPorGenero: 0, validacionPorGenero: 0, calibracion: 0, validacion: 0, existe: false });
    assert.equal(t.elegidos.filter((e) => e.tramo === '600+').length, 0);
  });

  test('un id repetido entre géneros: para', () => {
    const otroA = { ...A, genero: 'A2' };
    assert.throws(() => mezclar([A, otroA], 100, 's'), /dos veces/);
  });
});
