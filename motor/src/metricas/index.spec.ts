/**
 * El juez del registro de métricas (encargo 4.3): tiene exactamente los
 * nombres de nombres.ts (los que acepta el validador), once, y cada uno es
 * una función que da null sobre un texto vacío.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { METRICAS } from './index.ts';
import { NOMBRES_DE_METRICAS } from './nombres.ts';

describe('el registro de métricas', () => {
  test('tiene las once de nombres.ts, ni una más ni una menos', () => {
    assert.equal(NOMBRES_DE_METRICAS.length, 11, 'once nombres (fernandez-huerta fuera, con su motivo)');
    assert.deepEqual(Object.keys(METRICAS).sort(), [...NOMBRES_DE_METRICAS].sort());
  });

  test('cada métrica da null sobre un texto vacío', () => {
    const vacio = analizarTexto('');
    for (const [nombre, metrica] of Object.entries(METRICAS)) assert.equal(metrica(vacio), null, nombre);
  });
});
