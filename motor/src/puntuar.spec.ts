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
  ],
};

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
