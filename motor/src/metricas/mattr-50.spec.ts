/**
 * Jueces de mattr-50 (E1; encargo 4.3): media de los TTR de todas las
 * ventanas de 50 palabras seguidas, avanzando de una en una (Covington &
 * McFall 2010). Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { mattr50 } from './mattr-50.ts';

/** n palabras distintas, solo de letras (consonante + vocal: «ba», «be»…; hay 60). */
const distintas = (n: number): string[] => [...'bcdfglmnprst'].flatMap((c) => [...'aeiou'].map((v) => c + v)).slice(0, n);
const valor = (palabras: string[]) => mattr50(analizarTexto(`${palabras.join(' ')}.`));

describe('mattr-50', () => {
  test('50 palabras distintas → una sola ventana, con TTR 50 / 50 = 1', () => {
    assert.equal(valor(distintas(50)), 1);
  });

  test('52 palabras: p1…p50 distintas, p51 = p2, p52 = p3 → (1 + 0,98 + 0,98) / 3', () => {
    // Ventanas (N − W + 1 = 52 − 50 + 1 = 3):
    //   1 · p1…p50: 50 tipos → 50 / 50 = 1
    //   2 · p2…p51: p51 repite p2 → 49 tipos → 0,98
    //   3 · p3…p52: p51 (= p2) ya no repite nada dentro; p52 repite p3 → 49 tipos → 0,98
    // MATTR = 2,96 / 3 = 0,98666…
    const p = distintas(50);
    const v = valor([...p, p[1]!, p[2]!]);
    assert.ok(v !== null && Math.abs(v - 2.96 / 3) < 1e-12, String(v));
  });

  test('49 palabras: menos que la ventana, no hay ninguna → null', () => {
    assert.equal(valor(distintas(49)), null);
  });
});
