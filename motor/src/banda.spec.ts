/**
 * Los jueces de la escala del medidor (banda.ts; encargo 5.6): la banda del
 * total respecto a los humanos del mismo género y tramo, con cifras a mano y
 * los bordes de cada banda, y su lugar en el resultado de analizar().
 *
 * Celda de prueba: p5 0 · p50 3 · p95 9 · p99 12 · n 120.
 *   < 3 «por debajo de la mediana» · de 3 a 9, los dos incluidos, «entre la
 *   mediana y el p95» · más de 9 y hasta 12 «por encima del p95» · más de 12
 *   «por encima del p99».
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizar } from './analizar.ts';
import { bandaHumana } from './banda.ts';
import type { Calibracion, Celda, Paquete } from './paquete.ts';

const celda = (p50: number, p95: number, p99: number): Celda => ({ p1: -1, p5: 0, p50, p95, p99, n: 120, corpus: 'c', fecha: '2026-10-01', metodo: 'hyndman-fan-7' });
const CALIBRACION: Calibracion = {
  ttr: { general: { '300-599': celda(0.5, 0.6, 0.7) } },
  '_total-radiografia': { general: { '300-599': celda(3, 9, 12) }, opinion: { '300-599': celda(0, 9, 12) } },
};
const banda = (total: number) => bandaHumana(total, 'general', '300-599', CALIBRACION).banda;

describe('bandaHumana: las cuatro bandas y sus bordes', () => {
  test('por debajo de la mediana: −2 y 2,999', () => {
    assert.equal(banda(-2), 'por debajo de la mediana');
    assert.equal(banda(2.999), 'por debajo de la mediana');
  });

  test('en la mediana (3) y en el p95 (9): entre la mediana y el p95', () => {
    assert.equal(banda(3), 'entre la mediana y el p95');
    assert.equal(banda(5), 'entre la mediana y el p95');
    assert.equal(banda(9), 'entre la mediana y el p95');
  });

  test('por encima del p95: 9,000001 y 12, el p99 justo', () => {
    assert.equal(banda(9.000001), 'por encima del p95');
    assert.equal(banda(12), 'por encima del p95');
  });

  test('por encima del p99: 12,000001 y 50', () => {
    assert.equal(banda(12.000001), 'por encima del p99');
    assert.equal(banda(50), 'por encima del p99');
  });

  test('con la banda, los percentiles de referencia, n y la clave de la calibración', () => {
    assert.deepEqual(bandaHumana(10, 'general', '300-599', CALIBRACION), {
      banda: 'por encima del p95',
      clave: '_total-radiografia',
      p5: 0,
      p50: 3,
      p95: 9,
      p99: 12,
      n: 120,
    });
  });

  test('una celda con la mediana en 0: un total de 0 queda «entre la mediana y el p95»', () => {
    assert.equal(bandaHumana(0, 'opinion', '300-599', CALIBRACION).banda, 'entre la mediana y el p95');
    assert.equal(bandaHumana(-0.5, 'opinion', '300-599', CALIBRACION).banda, 'por debajo de la mediana');
  });
});

describe('bandaHumana: sin calibración, con su motivo', () => {
  const sin = (r: ReturnType<typeof bandaHumana>) => {
    assert.equal(r.banda, 'sin calibración');
    return 'motivo' in r ? r.motivo : '';
  };

  test('un género sin celda del total', () => {
    assert.match(sin(bandaHumana(5, 'noticia', '300-599', CALIBRACION)), /«noticia».*300-599/);
  });

  test('un tramo sin celda del total', () => {
    assert.match(sin(bandaHumana(5, 'general', '600+', CALIBRACION)), /«general».*600\+/);
  });

  test('un texto insuficiente: sin total ni tramo', () => {
    assert.match(sin(bandaHumana(null, 'general', null, CALIBRACION)), /insuficiente/);
  });

  test('un paquete sin ninguna clave «_total-*», o sin calibración', () => {
    assert.match(sin(bandaHumana(5, 'general', '300-599', { ttr: CALIBRACION['ttr']! })), /_total-/);
    assert.match(sin(bandaHumana(5, 'general', '300-599', undefined)), /_total-/);
  });

  test('dos claves «_total-*» en el mismo paquete: para', () => {
    assert.throws(() => bandaHumana(5, 'general', '300-599', { ...CALIBRACION, '_total-otro': CALIBRACION['_total-radiografia']! }), /_total-/);
  });
});

describe('analizar() lleva la banda en el resultado de cada paquete', () => {
  const leer = (fichero: string): Paquete => JSON.parse(readFileSync(new URL(`../../paquetes/${fichero}`, import.meta.url), 'utf8')) as Paquete;
  // 123 palabras de prosa (tramo 100-299), en una noticia escrita para el 5.6.
  const NOTICIA =
    'El tren de las ocho salió ayer de Atocha con cuarenta minutos de retraso, y los viajeros que esperaban en el andén 5 tuvieron que buscar otra forma de llegar a Valladolid. Según Adif, la avería afectó a una catenaria cerca de Chamartín; los técnicos la repararon a media mañana. Renfe ofreció autobuses a quienes no podían esperar, aunque muchos prefirieron quedarse en la cafetería de la estación. «Llevo tres semanas así», contaba una enfermera que trabaja en el Clínico. El ministerio ha prometido revisar el contrato de mantenimiento, firmado en 2019, y publicar en marzo un informe con las incidencias de toda la línea. Mientras tanto, la asociación de usuarios pide que se devuelva el importe del billete en todos los casos.';

  test('RadiografIA, con su `_total-radiografia`: la banda de su total, con su género y su tramo', () => {
    const radiografia = leer('radiografia.json');
    const r = analizar(NOTICIA, [radiografia], { genero: 'noticia' });
    const p = r.paquetes[0]!;
    assert.deepEqual(p.banda, bandaHumana(p.puntuacion.total, 'noticia', r.tramoDeCalibracion, radiografia.cabecera.calibracion));
    assert.equal(p.banda?.banda, 'entre la mediana y el p95');
  });

  test('«Español correcto», sin `_total-*`: sin banda (null)', () => {
    const r = analizar(NOTICIA, [leer('radiografia.json'), leer('espanol-correcto.json')]);
    assert.equal(r.paquetes[1]!.banda, null);
    assert.notEqual(r.paquetes[0]!.banda, null);
  });

  test('narrativa clásica de 100 a 299 palabras: sin calibración; menos de 100: también', () => {
    const radiografia = leer('radiografia.json');
    assert.equal(analizar(NOTICIA, [radiografia], { genero: 'narrativa-clasica' }).paquetes[0]!.banda?.banda, 'sin calibración');
    assert.equal(analizar('Muy corto.', [radiografia]).paquetes[0]!.banda?.banda, 'sin calibración');
  });
});
