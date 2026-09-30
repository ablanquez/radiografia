/**
 * Los jueces del detector estadístico (encargo 4.3), con las reglas y la
 * calibración de prueba del paquete interno. El tramo se pasa a mano (lo
 * calcula analizar.ts), así que bastan textos minúsculos. Cifras A MANO.
 *
 * ⚠️ El paquete se lee DENTRO de cada test (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizarTexto } from './texto.ts';
import { detectarEstadistico, type ReglaEstadistica } from './detector-estadistico.ts';
import type { Paquete } from './paquete.ts';

function interno() {
  const p = JSON.parse(readFileSync(new URL('../fixtures/paquete-prueba-interno.json', import.meta.url), 'utf8')) as Paquete;
  const regla = (id: string) => p.reglas.find((r) => r.id === id) as ReglaEstadistica;
  return { calibracion: p.cabecera.calibracion, frases: regla('prueba-estadistica-frases-cortas'), ttr: regla('prueba-contexto-ttr') };
}

describe('detectarEstadistico', () => {
  test('«mayor» p95: 3 frases de 1 palabra → 3 / 3 × 100 = 100 > p95 (8) → señal de texto, lado «arriba»', () => {
    const { calibracion, frases } = interno();
    const r = detectarEstadistico(frases, analizarTexto('Llueve. Sopla. Nieva.'), calibracion, 'general', '100-299');
    assert.deepEqual(r, {
      reglaId: 'prueba-estadistica-frases-cortas',
      ambito: 'texto',
      metrica: 'frases-por-100-palabras',
      valor: 100,
      referencia: calibracion!['frases-por-100-palabras']!['general']!['100-299'],
      lado: 'arriba',
    });
  });

  test('«mayor» p95: 1 frase de 15 palabras → 1 / 15 × 100 = 6,67 ≤ 8 → dentro: una regla que puntúa no da señal (null)', () => {
    const { calibracion, frases } = interno();
    const texto = analizarTexto('El río baja mucho más despacio hoy por la tarde que ayer por la mañana.');
    assert.equal(detectarEstadistico(frases, texto, calibracion, 'general', '100-299'), null);
  });

  test('informativa, «ambas» p99: TTR 5 / 8 = 0,625, dentro de [0,45, 0,82] → señal de CONTEXTO igual, con lado null', () => {
    const { calibracion, ttr } = interno();
    const r = detectarEstadistico(ttr, analizarTexto('El río y el mar y el cielo.'), calibracion, 'general', '100-299');
    assert.deepEqual(r, {
      reglaId: 'prueba-contexto-ttr',
      ambito: 'texto',
      metrica: 'ttr',
      valor: 0.625,
      referencia: calibracion!['ttr']!['general']!['100-299'],
      lado: null,
    });
  });

  test('informativa, «ambas» p99: TTR 1 / 4 = 0,25 < p1 (0,45) → lado «abajo»', () => {
    const { calibracion, ttr } = interno();
    const r = detectarEstadistico(ttr, analizarTexto('La la la la.'), calibracion, 'general', '100-299');
    assert.ok(r !== null && 'ambito' in r);
    assert.deepEqual([r.valor, r.lado], [0.25, 'abajo']);
  });

  test('sin celda para (métrica, género, tramo): sin calibración, con el motivo', () => {
    const { calibracion, frases } = interno();
    const noticia = detectarEstadistico(frases, analizarTexto('Llueve. Sopla. Nieva.'), calibracion, 'noticia', '100-299');
    assert.ok(noticia !== null && 'motivo' in noticia, JSON.stringify(noticia));
    assert.deepEqual([noticia.reglaId, noticia.metrica], ['prueba-estadistica-frases-cortas', 'frases-por-100-palabras']);
    assert.match(noticia.motivo, /sin calibración.*«noticia».*«100-299»/);
    const sinTramo = detectarEstadistico(frases, analizarTexto('Llueve. Sopla. Nieva.'), calibracion, 'general', null);
    assert.ok(sinTramo !== null && 'motivo' in sinTramo);
    assert.match(sinTramo.motivo, /sin calibración/);
  });

  test('la métrica no se puede calcular (sin palabras) → sin calibración, con el motivo «no calculable»', () => {
    const { calibracion, frases } = interno();
    const r = detectarEstadistico(frases, analizarTexto(''), calibracion, 'general', '100-299');
    assert.ok(r !== null && 'motivo' in r);
    assert.match(r.motivo, /no calculable/);
  });
});
