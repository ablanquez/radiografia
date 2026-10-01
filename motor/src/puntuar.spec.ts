/**
 * Los jueces de la puntuación (encargo 4.2), con las cifras calculadas A MANO
 * en el comentario de cada juez: densidad = n × 1.000 / palabras de prosa;
 * contribución = peso × densidad (modo densidad) o peso × (n > 0 ? 1 : 0)
 * (modo presencia, solo estructural «ultimo-parrafo»).
 *
 * Las señales son de mentira (puntuar solo las cuenta) y el texto es de verdad
 * (de él salen las palabras de prosa y el tramo).
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from './texto.ts';
import type { Senal } from './detector-patron.ts';
import type { SenalTexto } from './detector-estadistico.ts';
import type { SenalAusencia } from './detector-ausencia.ts';
import { puntuar, type PaqueteParaPuntuar } from './puntuar.ts';

/** Un texto de `n` palabras de prosa en una sola frase. */
const prosa = (n: number) => analizarTexto(`${Array.from({ length: n }, () => 'palabra').join(' ')}.`);

/** `n` señales de la regla `reglaId` (puntuar no mira dónde caen). */
const senales = (reglaId: string, n: number): Senal[] =>
  Array.from({ length: n }, (_, i) => ({ reglaId, inicio: i, fin: i + 1, fragmento: 'x', indiceFrase: 0, indiceParrafo: 0 }));

const PAQUETE: PaqueteParaPuntuar = {
  cabecera: {
    familias: [
      { id: 'a', nombre: 'Familia A', informativa: false },
      { id: 'canal', nombre: 'Canal', informativa: true },
    ],
  },
  reglas: [
    { id: 'peso-2', familia: 'a', detector: 'patrón', parametros: {}, peso: 2, informativa: false },
    { id: 'atenuante', familia: 'a', detector: 'patrón', parametros: {}, peso: -1, informativa: false },
    { id: 'cierre', familia: 'a', detector: 'estructural', parametros: { posicion: 'ultimo-parrafo' }, peso: 3, informativa: false },
    { id: 'informativa', familia: 'canal', detector: 'patrón', parametros: {}, peso: 5, informativa: true },
    // Encargo 4.3: una regla estadística (su señal es del texto entero).
    { id: 'estadistica', familia: 'a', detector: 'estadístico', parametros: {}, peso: 2, informativa: false },
  ],
};

/** Una señal de texto (detector estadístico) de la regla `reglaId`: puntuar solo la cuenta. */
const senalDeTexto = (reglaId: string): SenalTexto => ({
  reglaId,
  ambito: 'texto',
  metrica: 'ttr',
  valor: 0.9,
  referencia: { p1: 0.4, p5: 0.5, p50: 0.6, p95: 0.7, p99: 0.8, n: 30, corpus: 'de prueba', fecha: '2026-09-30', metodo: 'hyndman-fan-7' },
  lado: 'arriba',
});

const regla = (p: ReturnType<typeof puntuar>, id: string) => p.familias.flatMap((f) => f.reglas).find((r) => r.id === id);

describe('puntuar: 500 palabras de prosa, una regla de cada clase', () => {
  const p = puntuar([...senales('peso-2', 3), ...senales('atenuante', 2), ...senales('cierre', 1), ...senales('informativa', 5)], PAQUETE, prosa(500));

  test('peso 2 con 3 señales → densidad 3 × 1.000 / 500 = 6, contribución 2 × 6 = 12', () => {
    assert.deepEqual(regla(p, 'peso-2'), { id: 'peso-2', informativa: false, n: 3, modo: 'densidad', densidad: 6, contribucion: 12 });
  });

  test('atenuante peso −1 con 2 señales → densidad 4, contribución −4', () => {
    assert.deepEqual(regla(p, 'atenuante'), { id: 'atenuante', informativa: false, n: 2, modo: 'densidad', densidad: 4, contribucion: -4 });
  });

  test('ultimo-parrafo peso 3 con 1 señal → presencia, contribución 3 (sin densidad)', () => {
    assert.deepEqual(regla(p, 'cierre'), { id: 'cierre', informativa: false, n: 1, modo: 'presencia', densidad: null, contribucion: 3 });
  });

  test('informativa (peso 5) con 5 señales → contribución 0, y sus 5 señales en la lista aparte', () => {
    assert.deepEqual(regla(p, 'informativa'), { id: 'informativa', informativa: true, n: 5, modo: 'densidad', densidad: 10, contribucion: 0 });
    assert.equal(p.informativas.length, 5);
    assert.ok(p.informativas.every((s) => s.reglaId === 'informativa'));
  });

  test('familia A = 12 − 4 + 3 = 11; familia informativa «canal» = 0; paquete = 11', () => {
    assert.deepEqual(
      p.familias.map((f) => [f.id, f.informativa, f.total]),
      [
        ['a', false, 11],
        ['canal', true, 0],
      ],
    );
    assert.equal(p.total, 11);
  });

  test('lleva la unidad, las palabras de prosa y el tramo; completo: sin aviso ni motivo', () => {
    assert.equal(p.unidad, 'puntos por 1.000 palabras de prosa');
    assert.deepEqual([p.palabrasProsa, p.tramo, p.aviso, p.motivo], [500, 'completo', null, null]);
  });
});

describe('puntuar: ultimo-parrafo puntúa por presencia, no por densidad', () => {
  for (const palabras of [300, 3000]) {
    test(`${palabras} palabras: 1 señal → 3; 0 señales → 0`, () => {
      assert.equal(regla(puntuar(senales('cierre', 1), PAQUETE, prosa(palabras)), 'cierre')?.contribucion, 3);
      assert.equal(regla(puntuar([], PAQUETE, prosa(palabras)), 'cierre')?.contribucion, 0);
    });
  }

  test('en contraste, una regla de densidad sí cambia: peso 2, 3 señales → 3.000/300 = 10 → 20; 3.000/3.000 = 1 → 2', () => {
    assert.equal(regla(puntuar(senales('peso-2', 3), PAQUETE, prosa(300)), 'peso-2')?.contribucion, 20);
    assert.equal(regla(puntuar(senales('peso-2', 3), PAQUETE, prosa(3000)), 'peso-2')?.contribucion, 2);
  });
});

describe('puntuar: una regla estadística puntúa por presencia (encargo 4.3)', () => {
  for (const palabras of [300, 3000]) {
    test(`${palabras} palabras: peso 2 con su señal de texto → 2 (sin densidad); sin ella → 0`, () => {
      assert.deepEqual(regla(puntuar([senalDeTexto('estadistica')], PAQUETE, prosa(palabras)), 'estadistica'), {
        id: 'estadistica',
        informativa: false,
        n: 1,
        modo: 'presencia',
        densidad: null,
        contribucion: 2,
      });
      assert.equal(regla(puntuar([], PAQUETE, prosa(palabras)), 'estadistica')?.contribucion, 0);
    });
  }
});

describe('puntuar: signo, tramos y guardas', () => {
  test('total negativo: solo el atenuante, 2 señales en 500 → −4', () => {
    assert.equal(puntuar(senales('atenuante', 2), PAQUETE, prosa(500)).total, -4);
  });

  test('un atenuante sin señales aporta 0, no −0 (−1 × 0 en JavaScript es −0)', () => {
    const c = regla(puntuar([], PAQUETE, prosa(500)), 'atenuante')?.contribucion;
    assert.ok(Object.is(c, 0), `salió ${Object.is(c, -0) ? '−0' : String(c)}`);
  });

  test('insuficiente (99 palabras): no se puntúa — total null, motivo, sin desglose', () => {
    const p = puntuar(senales('peso-2', 3), PAQUETE, prosa(99));
    assert.deepEqual([p.total, p.tramo, p.palabrasProsa, p.familias, p.informativas, p.aviso], [null, 'insuficiente', 99, [], [], null]);
    assert.ok(p.motivo?.includes('99'), `el motivo tenía que decir cuántas palabras: ${p.motivo}`);
  });

  test('poco fiable (150 palabras): se puntúa y lleva la marca — peso 2, 3 señales → 3.000/150 = 20 → 40', () => {
    const p = puntuar(senales('peso-2', 3), PAQUETE, prosa(150));
    assert.deepEqual([p.total, p.tramo, p.motivo], [40, 'poco-fiable', null]);
    assert.ok(p.aviso?.includes('poco fiable'), `faltaba la marca: ${p.aviso}`);
  });

  test('una señal de una regla que no está en el paquete es un error, no se ignora', () => {
    assert.throws(() => puntuar(senales('no-existe', 1), PAQUETE, prosa(500)), /no-existe/);
  });
});

/**
 * Encargo 5.6: contribuciones y totales redondeados a 6 decimales. El caso es
 * el de BOE-A-2000-1013 (calibración del 5.5, género administrativo), que dio
 * un total de −1,1102230246251565·10⁻¹⁶ donde la cuenta exacta da 0:
 * 5.470 palabras de prosa; léxico, peso 3 × 1 señal + peso 1 × 1 señal;
 * discurso, peso 2 × 3 señales + peso −2 × 5 señales. A mano, con
 * 1.000 / 5.470 = 0,18281535…:
 *   léxico   3 × 0,18281535 = 0,54844606 → 0,548446 · 1 × 0,18281535 → 0,182815
 *            familia (3 + 1) × 0,18281535 = 0,73126142 → 0,731261
 *   discurso 2 × 3 × 0,18281535 = 1,09689213 → 1,096892 · −2 × 5 × 0,18281535 = −1,82815356 → −1,828154
 *            familia (6 − 10) × 0,18281535 = −0,73126142 → −0,731261
 *   total    (3 + 1 + 6 − 10) × 1.000 / 5.470 = 0, y 0 sin signo (no −0).
 * Sumar las contribuciones ya redondeadas daría −0,000001 (0,731261 −
 * 0,731262): el total se redondea desde la suma sin redondear.
 */
describe('puntuar: contribuciones y totales a 6 decimales (encargo 5.6)', () => {
  const BOE: PaqueteParaPuntuar = {
    cabecera: {
      familias: [
        { id: 'lexico', nombre: 'Léxico', informativa: false },
        { id: 'discurso', nombre: 'Discurso', informativa: false },
      ],
    },
    reglas: [
      { id: 'enfasis', familia: 'lexico', detector: 'patrón', parametros: {}, peso: 3, informativa: false },
      { id: 'conector', familia: 'lexico', detector: 'patrón', parametros: {}, peso: 1, informativa: false },
      { id: 'marcador', familia: 'discurso', detector: 'patrón', parametros: {}, peso: 2, informativa: false },
      { id: 'referencia', familia: 'discurso', detector: 'patrón', parametros: {}, peso: -2, informativa: false },
    ],
  };
  const p = puntuar([...senales('enfasis', 1), ...senales('conector', 1), ...senales('marcador', 3), ...senales('referencia', 5)], BOE, prosa(5470));

  test('cada contribución, a 6 decimales: 0,548446 · 0,182815 · 1,096892 · −1,828154', () => {
    assert.deepEqual(
      p.familias.flatMap((f) => f.reglas.map((r) => [r.id, r.contribucion])),
      [
        ['enfasis', 0.548446],
        ['conector', 0.182815],
        ['marcador', 1.096892],
        ['referencia', -1.828154],
      ],
    );
  });

  test('cada familia, a 6 decimales desde su suma sin redondear: 0,731261 y −0,731261', () => {
    assert.deepEqual(
      p.familias.map((f) => [f.id, f.total]),
      [
        ['lexico', 0.731261],
        ['discurso', -0.731261],
      ],
    );
  });

  test('el total es 0, sin residuo de coma flotante y sin signo', () => {
    assert.ok(Object.is(p.total, 0), `salió ${Object.is(p.total, -0) ? '−0' : String(p.total)}`);
  });
});

/**
 * Encargo 5.3: una regla de ausencia (patrón o estructural) da una señal del
 * texto entero y puntúa por PRESENCIA, como las estadísticas: peso × 1.
 */
describe('puntuar: las reglas de ausencia puntúan por presencia (encargo 5.3)', () => {
  const AUSENCIAS: PaqueteParaPuntuar = {
    cabecera: { familias: [{ id: 'a', nombre: 'Familia A', informativa: false }] },
    reglas: [
      { id: 'sin-opinion', familia: 'a', detector: 'patrón', parametros: { ausencia: true }, peso: 2, informativa: false },
      { id: 'sin-cifras', familia: 'a', detector: 'estructural', parametros: { posicion: 'cualquiera', ausencia: true }, peso: 1, informativa: false },
    ],
  };
  const deAusencia = (reglaId: string): SenalAusencia => ({ reglaId, ambito: 'texto', coincidencias: 0, minimo: 1 });

  test('en 500 palabras: patrón peso 2 → 2 y estructural peso 1 → 1, sin densidad; total 3', () => {
    const p = puntuar([deAusencia('sin-opinion'), deAusencia('sin-cifras')], AUSENCIAS, prosa(500));
    assert.deepEqual(regla(p, 'sin-opinion'), { id: 'sin-opinion', informativa: false, n: 1, modo: 'presencia', densidad: null, contribucion: 2 });
    assert.deepEqual(regla(p, 'sin-cifras'), { id: 'sin-cifras', informativa: false, n: 1, modo: 'presencia', densidad: null, contribucion: 1 });
    assert.equal(p.total, 3);
  });
});
