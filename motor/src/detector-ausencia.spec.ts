/**
 * Los jueces del detector de ausencia (encargo 5.3): una regla de patrón o
 * estructural con `ausencia: true` no señala coincidencias; da UNA señal del
 * texto entero cuando las coincidencias que cuentan son menos que `minimo`
 * (por defecto 1: ninguna). «Las que cuentan» = las que quedan tras
 * minimoPorCoincidencia, y solo en los párrafos que la regla mira.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from './texto.ts';
import { detectarAusencia, type ReglaDeAusencia } from './detector-ausencia.ts';

const opinion = (extra: object = {}): ReglaDeAusencia => ({
  id: 'sin-opinion',
  detector: 'patrón',
  parametros: {
    regex: '(?<!\\p{L})(creo|opino)(?!\\p{L})',
    flags: 'iu',
    ambito: 'frase',
    normalizar: { minusculas: true, tildes: false },
    ausencia: true,
    ...extra,
  },
});

const cifras = (minimo: number): ReglaDeAusencia => ({
  id: 'sin-cifras',
  detector: 'estructural',
  parametros: { posicion: 'cualquiera', regex: '\\p{N}+', flags: 'u', ausencia: true, minimo },
});

const ausencia = (regla: ReglaDeAusencia, texto: string) => detectarAusencia(regla, analizarTexto(texto));

describe('detectarAusencia', () => {
  test('sin ninguna coincidencia → una señal de texto con 0 coincidencias y minimo 1 (por defecto)', () => {
    assert.deepEqual(ausencia(opinion(), 'El plan sigue. Nadie lo discute.'), {
      reglaId: 'sin-opinion',
      ambito: 'texto',
      coincidencias: 0,
      minimo: 1,
    });
  });

  test('con una coincidencia y minimo 1 → nada (null)', () => {
    assert.equal(ausencia(opinion(), 'Creo que el plan sigue.'), null);
  });

  test('estructural con minimo 2: una cifra → señal con 1 coincidencia; dos cifras → nada', () => {
    assert.deepEqual(ausencia(cifras(2), 'Llegaron 3 personas.'), { reglaId: 'sin-cifras', ambito: 'texto', coincidencias: 1, minimo: 2 });
    assert.equal(ausencia(cifras(2), 'Llegaron 3 personas y se fueron 2.'), null);
  });

  test('cuenta solo lo que queda tras minimoPorCoincidencia: «creo» dos veces con minimoPorCoincidencia 3 → 0 coincidencias', () => {
    assert.deepEqual(ausencia(opinion({ minimoPorCoincidencia: 3 }), 'Creo que sí. Creo que no.'), {
      reglaId: 'sin-opinion',
      ambito: 'texto',
      coincidencias: 0,
      minimo: 1,
    });
    assert.equal(ausencia(opinion({ minimoPorCoincidencia: 2 }), 'Creo que sí. Creo que no.'), null);
  });

  test('solo mira la prosa: un «creo» en una viñeta no cuenta (sin sobreNoProsa)', () => {
    assert.deepEqual(ausencia(opinion(), '- Creo que sí.\nEl plan sigue.'), { reglaId: 'sin-opinion', ambito: 'texto', coincidencias: 0, minimo: 1 });
    assert.equal(ausencia(opinion({ sobreNoProsa: true }), '- Creo que sí.\nEl plan sigue.'), null);
  });
});

/** Encargo 6.1 (parada 1, punto 5): el recuento de la ausencia usa el texto de trabajo, con el salto como espacio. */
describe('detectarAusencia sobre la copia de trabajo (encargo 6.1)', () => {
  test('«creo que» partido por un salto cuenta: no hay ausencia', () => {
    assert.equal(ausencia(opinion({ regex: '(?<!\\p{L})creo que(?!\\p{L})' }), 'Yo creo\nque el plan sigue.'), null);
  });
});
