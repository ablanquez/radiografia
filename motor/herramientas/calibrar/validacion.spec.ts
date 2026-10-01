/**
 * Jueces de validacion.ts (encargo 5.6, d): el resumen de una celda de
 * validación, con las cifras calculadas a mano, y el juez del reparto, que
 * exige que data/calibracion/validacion.json solo use documentos de reparto
 * «validacion» (nunca de calibración) y que estén todos los de cada celda.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Celda } from '../../src/paquete.ts';
import type { Manifiesto } from './manifiesto.ts';
import { comprobarReparto, resumirCelda, type DocumentoValidado, type FicheroDeValidacion, type ReglaResumida } from './validacion.ts';

const REGLAS: ReglaResumida[] = [
  { id: 'est-a', estadistica: true, puntua: true },
  { id: 'est-b', estadistica: true, puntua: true },
  { id: 'est-c', estadistica: true, puntua: false },
  { id: 'lex-x', estadistica: false, puntua: true },
];
const doc = (id: string, total: number, disparadas: string[]): DocumentoValidado => ({ id, tramo: '300-599', total, disparadas });
const CELDA: Celda = { p1: -1, p5: 0, p50: 3, p95: 9, p99: 12, n: 120, corpus: 'c', fecha: '2026-10-01', metodo: 'hyndman-fan-7' };

describe('resumirCelda', () => {
  /**
   * Cinco documentos de 300-599. Estadísticas que puntúan: est-a y est-b
   * (est-c es informativa; lex-x no es estadística).
   *   d1 est-a est-b → 2 · d2 est-a lex-x → 1 · d3 est-c lex-x → 0 · d4 → 0 · d5 est-b est-c est-a → 2
   *   FPR (≥ 2) = 2/5 = 0,4 · al menos una = 3/5 = 0,6
   *   por regla: est-a 3/5 · est-b 2/5 · est-c 2/5 · lex-x 2/5
   *   totales 5, 4, 0, 0, 7 → ordenados 0, 0, 4, 5, 7; tipo 7, h = 4p + 1:
   *     p5: h = 1,2 → 0 · p50: h = 3 → 4 · p95: h = 4,8 → 5 + 0,8 × 2 = 6,6 · p99: h = 4,96 → 5 + 0,96 × 2 = 6,92
   */
  // Dentro de cada test, no en el cuerpo del describe: si revienta, cuenta como fallido (docs/BITACORA.md, 2026-09-29).
  const resumen = () =>
    resumirCelda('300-599', [doc('d5', 7, ['est-b', 'est-c', 'est-a']), doc('d1', 5, ['est-a', 'est-b']), doc('d2', 4, ['est-a', 'lex-x']), doc('d3', 0, ['est-c', 'lex-x']), doc('d4', 0, [])], REGLAS, CELDA);

  test('n y los documentos, por id', () => {
    const r = resumen();
    assert.equal(r.n, 5);
    assert.deepEqual(r.documentos, ['d1', 'd2', 'd3', 'd4', 'd5']);
  });

  test('FPR: 2 de 5 con dos o más estadísticas que puntúan (la informativa no cuenta); al menos una: 3 de 5', () => {
    const r = resumen();
    assert.deepEqual(r.fpr, { documentos: 2, proporcion: 0.4 });
    assert.deepEqual(r.alMenosUna, { documentos: 3, proporcion: 0.6 });
  });

  test('la tasa de disparo de TODAS las reglas, en su orden', () => {
    const r = resumen();
    assert.deepEqual(r.reglas, {
      'est-a': { documentos: 3, proporcion: 0.6 },
      'est-b': { documentos: 2, proporcion: 0.4 },
      'est-c': { documentos: 2, proporcion: 0.4 },
      'lex-x': { documentos: 2, proporcion: 0.4 },
    });
    assert.deepEqual(Object.keys(r.reglas), ['est-a', 'est-b', 'est-c', 'lex-x']);
  });

  test('el total en validación (p5, p50, p95, p99) frente a la celda de calibración', () => {
    const r = resumen();
    assert.deepEqual(r.total, { validacion: { p5: 0, p50: 4, p95: 6.6, p99: 6.92 }, calibracion: { p5: 0, p50: 3, p95: 9, p99: 12, n: 120 } });
  });

  test('un documento de otro tramo, o una regla que no es del paquete: para', () => {
    assert.throws(() => resumirCelda('300-599', [{ ...doc('d1', 1, []), tramo: '600+' }], REGLAS, CELDA), /tramo/);
    assert.throws(() => resumirCelda('300-599', [doc('d1', 1, ['no-existe'])], REGLAS, CELDA), /no-existe/);
  });
});

describe('comprobarReparto', () => {
  const manifiesto = (documentos: Manifiesto['documentos']) => ({ genero: 'x', documentos }) as unknown as Manifiesto;
  const M = manifiesto([
    { id: 'v1', sha256: 'a', palabrasProsa: 400, tramo: '300-599', reparto: 'validacion' },
    { id: 'v2', sha256: 'b', palabrasProsa: 450, tramo: '300-599', reparto: 'validacion' },
    { id: 'c1', sha256: 'c', palabrasProsa: 420, tramo: '300-599', reparto: 'calibracion' },
    { id: 'v3', sha256: 'd', palabrasProsa: 150, tramo: '100-299', reparto: 'validacion' },
    { id: 'v4', sha256: 'e', palabrasProsa: 700, tramo: '600+', reparto: 'validacion' },
  ]);
  const celda = (documentos: string[]) => ({ n: documentos.length, documentos }) as unknown as FicheroDeValidacion['generos'][string]['celdas']['300-599'];
  const fichero = (celdas: Record<string, string[]>, omitidas: string[] = ['600+']) =>
    ({
      generos: {
        x: {
          celdas: Object.fromEntries(Object.entries(celdas).map(([t, ids]) => [t, celda(ids)])),
          omitidas: omitidas.map((tramo) => ({ tramo, motivo: 'sin celda', n: 1 })),
        },
      },
    }) as unknown as FicheroDeValidacion;

  test('solo documentos de validación, todos los de cada celda, cada uno en su tramo: sin problemas', () => {
    assert.deepEqual(comprobarReparto(fichero({ '300-599': ['v1', 'v2'], '100-299': ['v3'] }), { x: M }), []);
  });

  test('un documento de CALIBRACIÓN colado: lo caza', () => {
    const p = comprobarReparto(fichero({ '300-599': ['v1', 'v2', 'c1'], '100-299': ['v3'] }), { x: M });
    assert.equal(p.length, 1, p.join('\n'));
    assert.match(p[0]!, /c1.*calibracion/);
  });

  test('falta un documento de validación, uno va en otro tramo, uno no existe o n no cuadra: lo caza', () => {
    assert.match(comprobarReparto(fichero({ '300-599': ['v1'], '100-299': ['v3'] }), { x: M }).join('\n'), /falta.*v2/);
    assert.match(comprobarReparto(fichero({ '300-599': ['v1', 'v2', 'v3'], '100-299': [] }), { x: M }).join('\n'), /v3.*100-299/);
    assert.match(comprobarReparto(fichero({ '300-599': ['v1', 'v2', 'zz'], '100-299': ['v3'] }), { x: M }).join('\n'), /zz.*no está/);
    const descuadrado = fichero({ '300-599': ['v1', 'v2'], '100-299': ['v3'] });
    descuadrado.generos['x']!.celdas['300-599']!.n = 3;
    assert.match(comprobarReparto(descuadrado, { x: M }).join('\n'), /n = 3/);
  });

  test('un género sin manifiesto: lo caza', () => {
    assert.match(comprobarReparto(fichero({ '300-599': ['v1', 'v2'] }), {}).join('\n'), /manifiesto/);
  });
});
