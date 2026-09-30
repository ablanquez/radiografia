/**
 * Juez de medir.ts (encargo 5.5): un documento da un valor por cada clave de
 * calibración —las trece métricas del registro y `_total-radiografia`—, cada
 * métrica igual a la del motor sobre el mismo texto, y el total igual a la
 * puntuación de RadiografIA que da analizar() con el género del corpus.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizar } from '../../src/analizar.ts';
import { analizarTexto } from '../../src/texto.ts';
import { METRICAS } from '../../src/metricas/index.ts';
import { CLAVES_DE_CALIBRACION, NOMBRES_DE_METRICAS } from '../../src/metricas/nombres.ts';
import type { Paquete } from '../../src/paquete.ts';
import { medirDocumento } from './medir.ts';

const RADIOGRAFIA = JSON.parse(readFileSync(new URL('../../../paquetes/radiografia.json', import.meta.url), 'utf8')) as Paquete;

/** 120 palabras de prosa, humanas, sin nada especial. */
const TEXTO = Array.from({ length: 12 }, (_, i) => `El tren número ${i + 1} salió con retraso de la estación de Atocha y llegó tarde.`).join(' ');

describe('medirDocumento', () => {
  test('un valor por clave de calibración: las trece métricas y el total', () => {
    const valores = medirDocumento(TEXTO, 'noticia', RADIOGRAFIA);
    assert.deepEqual(Object.keys(valores).sort(), [...CLAVES_DE_CALIBRACION].sort());
  });

  test('cada métrica, la del motor sobre el mismo texto', () => {
    const valores = medirDocumento(TEXTO, 'noticia', RADIOGRAFIA);
    const texto = analizarTexto(TEXTO);
    for (const nombre of NOMBRES_DE_METRICAS) assert.equal(valores[nombre], METRICAS[nombre](texto), nombre);
  });

  test('el total, la puntuación de RadiografIA con el género del corpus', () => {
    // Con una señal (lex-verbos-de-enfasis), para que el total no sea 0.
    const conSenal = `${TEXTO} En resumen, cabe destacar que es crucial.`;
    const valores = medirDocumento(conSenal, 'opinion', RADIOGRAFIA);
    const esperado = analizar(conSenal, [RADIOGRAFIA], { genero: 'opinion' }).paquetes[0]!.puntuacion.total;
    assert.ok(typeof esperado === 'number' && esperado > 0, String(esperado));
    assert.equal(valores['_total-radiografia'], esperado);
  });
});
