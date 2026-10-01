/**
 * Jueces de inyeccion.ts (encargo 5.5): las celdas de los ficheros de
 * data/calibracion/ en cabecera.calibracion del paquete, y el paquete real
 * (paquetes/radiografia.json) en sincronía con esos seis ficheros.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Celda } from '../../src/paquete.ts';
import { validarPaquete } from '../../src/validar.ts';
import { GENEROS_CALIBRADOS, conCalibracion, unirCalibraciones, type FicheroDeCalibracion } from './inyeccion.ts';

const celda = (p50: number): Celda => ({ p1: p50 - 2, p5: p50 - 1, p50, p95: p50 + 1, p99: p50 + 2, n: 100, corpus: 'c', fecha: '2026-09-30', metodo: 'hyndman-fan-7' });

describe('unirCalibraciones', () => {
  test('de «clave → tramo» por fichero a «clave → género → tramo», en el orden de los géneros', () => {
    const general: FicheroDeCalibracion = { genero: 'general', celdas: { ttr: { '100-299': celda(5) }, '_total-radiografia': { '600+': celda(9) } } };
    const noticia: FicheroDeCalibracion = { genero: 'noticia', celdas: { ttr: { '100-299': celda(6), '600+': celda(7) } } };
    const r = unirCalibraciones([general, noticia]);
    assert.deepEqual(r, {
      ttr: { general: { '100-299': celda(5) }, noticia: { '100-299': celda(6), '600+': celda(7) } },
      '_total-radiografia': { general: { '600+': celda(9) } },
    });
    assert.deepEqual(Object.keys(r['ttr']!), ['general', 'noticia']);
  });

  test('un género dos veces o una clave que no es de calibración: para', () => {
    const f: FicheroDeCalibracion = { genero: 'noticia', celdas: { ttr: { '100-299': celda(6) } } };
    assert.throws(() => unirCalibraciones([f, f]), /dos veces/);
    assert.throws(() => unirCalibraciones([{ genero: 'noticia', celdas: { 'no-es-metrica': { '100-299': celda(6) } } }]), /no es una clave de calibración/);
  });
});

describe('conCalibracion', () => {
  const PAQUETE = '{\n  "$schema": "x",\n  "cabecera": {\n    "nombre": "P",\n    "familias": [\n      {\n        "id": "a"\n      }\n    ]\n  },\n  "reglas": [\n    "El informe\\u202Fllega"\n  ]\n}\n';
  const cal = { ttr: { general: { '100-299': celda(5) } } };

  test('solo cambia la cabecera; lo demás, byte a byte (los escapes \\u de las reglas siguen ahí)', () => {
    const r = conCalibracion(PAQUETE, cal);
    assert.deepEqual(JSON.parse(r).cabecera.calibracion, cal);
    assert.ok(r.endsWith('  },\n  "reglas": [\n    "El informe\\u202Fllega"\n  ]\n}\n'), r);
    assert.ok(r.startsWith('{\n  "$schema": "x",\n  "cabecera": {\n    "nombre": "P",\n'), r);
  });

  test('otra vez, sustituye la que había: el mismo resultado', () => {
    const una = conCalibracion(PAQUETE, cal);
    assert.equal(conCalibracion(una, cal), una);
    const otra = { ttr: { general: { '600+': celda(8) } } };
    assert.deepEqual(JSON.parse(conCalibracion(una, otra)).cabecera.calibracion, otra);
  });

  test('una cabecera con otro formato del que se regeneraría: para, en vez de reescribirla', () => {
    assert.throws(() => conCalibracion(PAQUETE.replace('"nombre": "P"', '"nombre":"P"'), cal), /formato/);
  });
});

describe('el paquete real', () => {
  const paquete = JSON.parse(readFileSync(new URL('../../../paquetes/radiografia.json', import.meta.url), 'utf8'));
  const ficheros = GENEROS_CALIBRADOS.map((genero) => {
    const f = JSON.parse(readFileSync(new URL(`../../../data/calibracion/${genero}.json`, import.meta.url), 'utf8'));
    return { genero, celdas: f.celdas };
  });

  test('cabecera.calibracion es la de los seis ficheros de data/calibracion/, tal cual', () => {
    assert.deepEqual(paquete.cabecera.calibracion, unirCalibraciones(ficheros));
  });

  test('valida en vivo, sin ningún error', () => {
    assert.deepEqual(validarPaquete(paquete), { valido: true, errores: [] });
  });
});
