/**
 * Los jueces de la entrada del motor (encargos 4.2 y 4.3): analizar(texto,
 * paquetes, { genero }) valida cada paquete, segmenta una vez, aplica a cada
 * regla su detector (también el estadístico, con el género de entrada), puntúa
 * por paquete y califica cada señal con su paquete. Paquete → familia →
 * regla, sin mezclar nunca familias de dos paquetes.
 *
 * Las cifras, a mano: TEXTO_200 tiene 200 palabras de prosa, así que una señal
 * de patrón vale 1.000 / 200 = 5 por unidad de peso; una estadística puntúa por
 * presencia (su peso).
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

  test('dos desgloses separados, aunque las familias se llamen igual: interno 1 × 5 + 2 = 7; secundario 2 × 5 = 10', () => {
    // Desde el 4.3 los dos paquetes traen reglas estadísticas (calibración de prueba, tramo 100-299):
    //   interno · frases-por-100-palabras = 21 frases / 200 × 100 = 10,5 > p95 (8) → dispara;
    //             presencia × peso 2 = 2.
    //   interno · ttr (informativa) = 19 tipos / 200 = 0,095 → contexto, contribución 0
    //             (tipos: es un enfoque innovador · el equipo revisó los datos de la semana con calma ·
    //              todo quedó listo para lunes).
    //   secundario · puntuacion-por-1000 = 21 puntos / 200 × 1.000 = 105 ≤ p95 (200) → dentro, nada.
    const r = analizar(TEXTO_200, [cargar('paquete-prueba-interno.json'), cargar('paquete-prueba-secundario.json')]);
    const desglose = (i: number) =>
      r.paquetes[i]!.puntuacion.familias.map((f) => [f.id, f.total, f.reglas.filter((x) => x.n > 0).map((x) => [x.id, x.n, x.contribucion])]);
    assert.deepEqual(
      r.paquetes.map((p) => [p.paquete, p.puntuacion.total]),
      [
        [INTERNO, 7],
        [SECUNDARIO, 10],
      ],
    );
    assert.deepEqual(desglose(0), [
      [
        'prueba',
        7,
        [
          ['prueba-formas-palabra', 1, 5],
          ['prueba-estadistica-frases-cortas', 1, 2],
          ['prueba-contexto-ttr', 1, 0],
        ],
      ],
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
        [INTERNO, 7],
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

  // Encargo 4.3, cabo del 4.2: con dos paquetes del mismo nombre, las señales de los dos
  // llevarían el mismo origen y no se distinguirían.
  test('dos paquetes con el mismo cabecera.nombre: error con el nombre y las dos posiciones', () => {
    assert.throws(
      () => analizar(TEXTO_200, [cargar('paquete-prueba-interno.json'), cargar('paquete-prueba-interno.json')]),
      /«Paquete de prueba interno del motor».*paquetes\[0\].*paquetes\[1\]/s,
    );
    // Y aunque sean paquetes distintos: el secundario con el nombre del interno, en tercera posición.
    const secundario = cargar('paquete-prueba-secundario.json');
    secundario.cabecera.nombre = INTERNO;
    assert.throws(
      () => analizar(TEXTO_200, [cargar('paquete-prueba-interno.json'), cargar('valido.json'), secundario]),
      /«Paquete de prueba interno del motor».*paquetes\[0\].*paquetes\[2\]/s,
    );
  });

  test('un paquete sin nombre legible se nombra por su posición', () => {
    assert.throws(() => analizar(TEXTO_200, [cargar('paquete-prueba-interno.json'), {} as Paquete]), /«paquetes\[1\]»/);
  });

  test('una regla estadística sin celda para el tramo del texto → «sin calibración», con su motivo, y no puntúa', () => {
    // valido-detector-estadistico.json calibra frases-por-100-palabras solo en 300-599; TEXTO_200 está en 100-299.
    const r = analizar(TEXTO_200, [cargar('valido-detector-estadistico.json')]);
    assert.deepEqual(
      r.sinCalibracion.map((s) => [s.paquete, s.reglaId, s.metrica]),
      [['Fixture mínimo válido', 'd6-referencia-interna', 'frases-por-100-palabras']],
    );
    assert.match(r.sinCalibracion[0]!.motivo, /«general», tramo «100-299»/);
    assert.deepEqual([r.senalesTexto, r.contexto, r.paquetes[0]!.puntuacion.total], [[], [], 0]);
  });

  test('insuficiente (99 palabras): cada paquete con total null y motivo, y ninguna señal', () => {
    const r = analizar(TEXTO_99, [cargar('paquete-prueba-interno.json'), cargar('paquete-prueba-secundario.json')]);
    assert.deepEqual([r.palabrasProsa, r.tramo, r.senales], [99, 'insuficiente', []]);
    assert.deepEqual(
      r.paquetes.map((p) => p.puntuacion.total),
      [null, null],
    );
    assert.ok(r.paquetes.every((p) => p.puntuacion.motivo?.includes('99')));
    // Y ninguna estadística: ni señales de texto, ni contexto, ni avisos de calibración.
    assert.deepEqual([r.tramoDeCalibracion, r.senalesTexto, r.contexto, r.sinCalibracion], [null, [], [], []]);
  });
});

// Encargo 4.3: el género es una ENTRADA del análisis (por defecto «general»).
// TEXTO_300 = 10 × [RELLENO, RELLENO, CON_COMA]: 30 frases de 10 palabras = 300 palabras (tramo 300-599).
//   · frases-por-100-palabras = 30 / 300 × 100 = 10.
//   · ttr = 10 tipos (el equipo revisó los datos de la semana con calma) / 300 = 1/30 = 0,0333…
//   · puntuacion-por-1000 = (1 + 1 + 2) × 10 = 40 signos / 300 × 1.000 = 400/3 = 133,33…
// Ninguna regla de patrón ni estructural dispara.
const CON_COMA = 'El equipo revisó los datos de la semana, con calma.';
const TEXTO_300 = Array.from({ length: 10 }, () => [RELLENO, RELLENO, CON_COMA].join(' ')).join(' ');

/**
 * sobreNoProsa (encargo 5.1): las señales de un encabezado y de una viñeta
 * salen con sus desplazamientos en el original, y el conteo de palabras NO
 * cambia: son solo las de prosa. valido-sobre-no-prosa.json: d6 (patrón,
 * «véase la tabla/figura N», peso −1, sobreNoProsa) y encabezado-markdown
 * (estructural, «# » al principio del párrafo, informativa, sobreNoProsa).
 */
describe('analizar: sobreNoProsa (encargo 5.1)', () => {
  test('el conteo es de prosa (105), y las señales del encabezado y de la viñeta llevan su [inicio, fin)', () => {
    // «La muestra se redujo a la mitad.» = 7 palabras y 32 caracteres; 15 veces, unidas por un espacio: 105
    // palabras y 15 × 32 + 14 = 494 caracteres.
    //   «# Véase la tabla 2» [0, 18) (encabezado) · «\n» 18 · prosa [19, 513) · «\n» 513 ·
    //   «- Véase la figura 3 para el detalle.» [514, 550) (viñeta): «Véase la figura 3» en [516, 533).
    const prosa = Array<string>(15).fill('La muestra se redujo a la mitad.').join(' ');
    const texto = ['# Véase la tabla 2', prosa, '- Véase la figura 3 para el detalle.'].join('\n');
    const r = analizar(texto, [cargar('valido-sobre-no-prosa.json')]);
    assert.deepEqual([r.palabrasProsa, r.tramo], [105, 'poco-fiable']);
    assert.deepEqual(
      r.senales.map((s) => [s.reglaId, s.fragmento, s.inicio, s.fin, s.indiceParrafo, texto.slice(s.inicio, s.fin)]),
      [
        ['d6-referencia-interna', 'Véase la tabla 2', 2, 18, 0, 'Véase la tabla 2'],
        ['d6-referencia-interna', 'Véase la figura 3', 516, 533, 2, 'Véase la figura 3'],
        ['encabezado-markdown', '# ', 0, 2, 0, '# '],
      ],
    );
    // d6: 2 señales × 1.000 / 105 palabras de prosa × peso −1; encabezado-markdown es informativa (0).
    assert.equal(r.paquetes[0]!.puntuacion.total, -((2 * 1000) / 105));
  });
});

describe('analizar: el género de entrada (encargo 4.3)', () => {
  test('sin género → «general»: dispara la del interno (10 > p95 7,5), la de contexto va aparte (1/30 < p1 0,38) y la del secundario queda dentro (133,3 ≤ p95 190)', () => {
    const interno = cargar('paquete-prueba-interno.json');
    const r = analizar(TEXTO_300, [interno, cargar('paquete-prueba-secundario.json')]);
    assert.deepEqual([r.genero, r.palabrasProsa, r.tramoDeCalibracion], ['general', 300, '300-599']);
    assert.deepEqual(
      r.senalesTexto.map((s) => [s.paquete, s.reglaId, s.valor, s.lado]),
      [[INTERNO, 'prueba-estadistica-frases-cortas', 10, 'arriba']],
    );
    assert.deepEqual(r.senalesTexto[0]!.referencia, interno.cabecera.calibracion!['frases-por-100-palabras']!['general']!['300-599']);
    assert.deepEqual(
      r.contexto.map((s) => [s.paquete, s.reglaId, s.valor, s.lado]),
      [[INTERNO, 'prueba-contexto-ttr', 1 / 30, 'abajo']],
    );
    assert.deepEqual(r.sinCalibracion, []);
    // Presencia: interno 2 (peso de la estadística); secundario 0.
    assert.deepEqual(
      r.paquetes.map((p) => [p.paquete, p.puntuacion.total]),
      [
        [INTERNO, 2],
        [SECUNDARIO, 0],
      ],
    );
  });

  test('género «noticia»: el interno no lo calibra (sin calibración) y la del secundario dispara con su referencia (133,3 > p95 120)', () => {
    const secundario = cargar('paquete-prueba-secundario.json');
    const r = analizar(TEXTO_300, [cargar('paquete-prueba-interno.json'), secundario], { genero: 'noticia' });
    assert.equal(r.genero, 'noticia');
    assert.deepEqual(
      r.senalesTexto.map((s) => [s.paquete, s.reglaId, s.valor, s.lado]),
      [[SECUNDARIO, 'secundario-puntuacion-alta', 400 / 3, 'arriba']],
    );
    assert.deepEqual(r.senalesTexto[0]!.referencia, secundario.cabecera.calibracion!['puntuacion-por-1000']!['noticia']!['300-599']);
    assert.deepEqual(r.contexto, []);
    assert.deepEqual(
      r.sinCalibracion.map((s) => [s.paquete, s.reglaId]),
      [
        [INTERNO, 'prueba-estadistica-frases-cortas'],
        [INTERNO, 'prueba-contexto-ttr'],
      ],
    );
    assert.ok(r.sinCalibracion.every((s) => s.motivo.includes('«noticia»')));
    assert.deepEqual(
      r.paquetes.map((p) => [p.paquete, p.puntuacion.total]),
      [
        [INTERNO, 0],
        [SECUNDARIO, 1],
      ],
    );
  });
});
