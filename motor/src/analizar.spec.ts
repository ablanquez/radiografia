/**
 * Los jueces de la entrada del motor (encargo 4.2): analizar(texto, paquetes)
 * valida cada paquete, segmenta una vez, aplica a cada regla su detector,
 * puntúa por paquete y califica cada señal con su paquete. Paquete → familia
 * → regla, sin mezclar nunca familias de dos paquetes.
 *
 * Las cifras, a mano: TEXTO_200 tiene 200 palabras de prosa, así que una señal
 * vale 1.000 / 200 = 5 por unidad de peso.
 *
 * ⚠️ Los fixtures se leen DENTRO de cada test (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizar, PaqueteInvalido } from './analizar.ts';
import type { Paquete } from './paquete.ts';

const cargar = (fichero: string): Paquete => JSON.parse(readFileSync(new URL(`../fixtures/${fichero}`, import.meta.url), 'utf8')) as Paquete;
const INTERNO = 'Paquete de prueba interno del motor';
const SECUNDARIO = 'Paquete de prueba secundario del motor';

const RELLENO = 'El equipo revisó los datos de la semana con calma.'; // 10 palabras, no dispara ninguna regla
/** «Es un enfoque innovador.» (4) + 19 × RELLENO (190) + «Todo quedó listo para el lunes.» (6) = 200. */
const TEXTO_200 = ['Es un enfoque innovador.', ...Array<string>(19).fill(RELLENO), 'Todo quedó listo para el lunes.'].join(' ');
/** «Es un enfoque innovador.» (4) + 9 × RELLENO (90) + «Todo quedó listo el lunes.» (5) = 99. */
const TEXTO_99 = ['Es un enfoque innovador.', ...Array<string>(9).fill(RELLENO), 'Todo quedó listo el lunes.'].join(' ');

describe('analizar: dos paquetes combinados', () => {
  test('una regla con el mismo id en los dos: señales distinguibles por su paquete', () => {
    const r = analizar(TEXTO_200, [cargar('paquete-prueba-interno.json'), cargar('paquete-prueba-secundario.json')]);
    assert.deepEqual([r.palabrasProsa, r.tramo], [200, 'poco-fiable']);
    // «Es un enfoque innovador.»: «enfoque» en [6, 13), «innovador» en [14, 23).
    assert.deepEqual(
      r.senales.map((s) => [s.paquete, s.reglaId, s.fragmento, s.inicio, s.fin]),
      [
        [INTERNO, 'prueba-formas-palabra', 'innovador', 14, 23],
        [SECUNDARIO, 'prueba-formas-palabra', 'enfoque', 6, 13],
      ],
    );
  });

  test('dos desgloses separados, aunque las familias se llamen igual: interno 1 × 5 = 5; secundario 2 × 5 = 10', () => {
    const r = analizar(TEXTO_200, [cargar('paquete-prueba-interno.json'), cargar('paquete-prueba-secundario.json')]);
    const desglose = (i: number) =>
      r.paquetes[i]!.puntuacion.familias.map((f) => [f.id, f.total, f.reglas.filter((x) => x.n > 0).map((x) => [x.id, x.n, x.contribucion])]);
    assert.deepEqual(
      r.paquetes.map((p) => [p.paquete, p.puntuacion.total]),
      [
        [INTERNO, 5],
        [SECUNDARIO, 10],
      ],
    );
    assert.deepEqual(desglose(0), [
      ['prueba', 5, [['prueba-formas-palabra', 1, 5]]],
      ['canal', 0, []],
    ]);
    assert.deepEqual(desglose(1), [['prueba', 10, [['prueba-formas-palabra', 1, 10]]]]);
  });

  test('con los paquetes al revés, los mismos resultados al revés', () => {
    const r = analizar(TEXTO_200, [cargar('paquete-prueba-secundario.json'), cargar('paquete-prueba-interno.json')]);
    assert.deepEqual(
      r.paquetes.map((p) => [p.paquete, p.puntuacion.total]),
      [
        [SECUNDARIO, 10],
        [INTERNO, 5],
      ],
    );
  });
});

describe('analizar: lo que no se analiza', () => {
  test('un paquete inválido: error con su nombre y sus mensajes', () => {
    assert.throws(
      () => analizar(TEXTO_200, [cargar('paquete-prueba-interno.json'), cargar('invalido-id-repetido.json')]),
      (e: unknown) => {
        assert.ok(e instanceof PaqueteInvalido, `tenía que ser PaqueteInvalido: ${String(e)}`);
        assert.equal(e.paquete, 'Fixture mínimo válido');
        assert.match(e.message, /«Fixture mínimo válido»/);
        assert.match(e.message, /ya lo usa reglas\[0\]/);
        assert.equal(e.errores.length, 1);
        return true;
      },
    );
  });

  test('un paquete sin nombre legible se nombra por su posición', () => {
    assert.throws(() => analizar(TEXTO_200, [cargar('paquete-prueba-interno.json'), {} as Paquete]), /«paquetes\[1\]»/);
  });

  test('una regla estadística: error claro, «detector estadístico: pendiente del 4.3»', () => {
    assert.throws(() => analizar(TEXTO_200, [cargar('valido-detector-estadistico.json')]), /detector estadístico: pendiente del 4\.3/);
  });

  test('insuficiente (99 palabras): cada paquete con total null y motivo, y ninguna señal', () => {
    const r = analizar(TEXTO_99, [cargar('paquete-prueba-interno.json'), cargar('paquete-prueba-secundario.json')]);
    assert.deepEqual([r.palabrasProsa, r.tramo, r.senales], [99, 'insuficiente', []]);
    assert.deepEqual(
      r.paquetes.map((p) => p.puntuacion.total),
      [null, null],
    );
    assert.ok(r.paquetes.every((p) => p.puntuacion.motivo?.includes('99')));
  });
});
