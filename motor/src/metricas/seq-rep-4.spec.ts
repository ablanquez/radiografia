/**
 * Jueces de seq-rep-4 (E5; encargo 4.3): 1 − 4-gramas únicos / 4-gramas
 * totales (Welleck et al. 2019, ec. 10). Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { seqRep4 } from './seq-rep-4.ts';

const valor = (t: string) => seqRep4(analizarTexto(t));

describe('seq-rep-4', () => {
  test('«el río baja hoy» dos veces → 5 cuatrigramas, 4 únicos → 1 − 4/5 = 0,2', () => {
    // [el río baja hoy] [río baja hoy el] [baja hoy el río] [hoy el río baja] [el río baja hoy]
    // → 5 en total, el primero y el último iguales → 4 únicos.
    assert.ok(Math.abs(valor('El río baja hoy. El río baja hoy.')! - 0.2) < 1e-12);
  });

  test('sin cuatrigramas repetidos → 0', () => {
    assert.equal(valor('El río baja hoy con poca agua.'), 0);
  });

  test('menos de 4 palabras → ningún cuatrigrama → null', () => {
    assert.equal(valor('Llueve mucho hoy.'), null);
    assert.equal(valor(''), null);
  });
});
