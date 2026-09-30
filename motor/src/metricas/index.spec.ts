/**
 * El juez del registro de métricas (encargo 4.3; trece desde el 5.5): tiene
 * exactamente los nombres de nombres.ts (los que acepta el validador), y cada
 * uno es una función que da null sobre un texto vacío. Y las claves de
 * calibración (encargo 5.5): las trece métricas más `_total-radiografia`, que
 * no es una métrica (el motor no la calcula sobre el texto).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { METRICAS } from './index.ts';
import { CLAVES_DE_CALIBRACION, CLAVE_TOTAL_RADIOGRAFIA, NOMBRES_DE_METRICAS, esClaveDeCalibracion, esMetrica } from './nombres.ts';

describe('el registro de métricas', () => {
  test('tiene las trece de nombres.ts, ni una más ni una menos', () => {
    assert.equal(NOMBRES_DE_METRICAS.length, 13, 'trece nombres (fernandez-huerta y el solapamiento de lemas, D15, fuera con su motivo)');
    assert.deepEqual(Object.keys(METRICAS).sort(), [...NOMBRES_DE_METRICAS].sort());
  });

  test('cada métrica da null sobre un texto vacío', () => {
    const vacio = analizarTexto('');
    for (const [nombre, metrica] of Object.entries(METRICAS)) assert.equal(metrica(vacio), null, nombre);
  });
});

describe('las claves de calibración', () => {
  test('son las trece métricas y «_total-radiografia»', () => {
    assert.equal(CLAVE_TOTAL_RADIOGRAFIA, '_total-radiografia');
    assert.deepEqual([...CLAVES_DE_CALIBRACION].sort(), [...NOMBRES_DE_METRICAS, '_total-radiografia'].sort());
  });

  test('«_total-radiografia» es clave de calibración y no es una métrica: ninguna regla puede pedirla', () => {
    assert.equal(esClaveDeCalibracion('_total-radiografia'), true);
    assert.equal(esMetrica('_total-radiografia'), false);
    assert.equal(esClaveDeCalibracion('frases-por-100-palabras'), true);
    assert.equal(esClaveDeCalibracion('parentesis-comillas-puntoycoma-por-1000'), false, 'el nombre viejo de P15 ya no existe');
  });
});
