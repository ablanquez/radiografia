/**
 * Jueces de mtld (E2; encargo 4.3): MTLD-Original según TAALED `mtldo`. Dos
 * clases de juez, y así se etiquetan:
 *
 *   · A MANO: la cuenta, paso a paso, en el comentario. Sin él, el de oráculo
 *     no vale (respuesta de Antonio a la segunda parada del 4.3).
 *   · ORÁCULO: la cifra que da TAALED `mtldo` (taaled/ld.py, commit 27b19e1)
 *     sobre las MISMAS palabras que ve el motor. Obtenida con:
 *
 *       node herramientas/oraculo-ld.ts > entradas.json
 *       python herramientas/oraculo-ld.py <ld.py@27b19e1> <lexical_diversity.py@d78d45f> entradas.json
 *
 *     (instrucciones completas en herramientas/oraculo-ld.py). Las entradas
 *     están en fixtures/referencia/: mtld-bordes.json (los tres bordes en que
 *     TAALED y lexical_diversity difieren) y texto-prueba-322.txt.
 *
 * ⚠️ Los ficheros de referencia se leen DENTRO de los tests (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizarTexto } from '../texto.ts';
import { mtld } from './mtld.ts';

const REFERENCIA = new URL('../../fixtures/referencia/', import.meta.url);
const valor = (t: string) => mtld(analizarTexto(t));
const cerca = (v: number | null, esperado: number, tolerancia: number) =>
  assert.ok(v !== null && Math.abs(v - esperado) < tolerancia, `salió ${v}, se esperaba ${esperado}`);

describe('mtld · A MANO', () => {
  test('15 palabras: un factor completo y un parcial a la ida; solo un parcial a la vuelta → (8,75 + 15,75) / 2 = 12,25', () => {
    // Palabras: el río baja con poca agua hoy · el río baja · ya mañana quizá más ya
    //           (A B C D E F G · A B C · H I J K H)
    // IDA. Un factor se cierra cuando su TTR baja de 0,72 con al menos 10 palabras.
    //   Palabra 10 («baja»): 7 tipos / 10 = 0,70 < 0,72 y 10 palabras → factor completo (cuenta 1).
    //   Resto, palabras 11-15 (ya mañana quizá más ya): 4 tipos / 5 = 0,80. Es el final del texto:
    //   factor parcial = (1 − 0,80) / (1 − 0,72) = 0,20 / 0,28 = 0,714285…
    //   Factores = 1,714285…  →  MTLD de ida = 15 / 1,714285… = 8,75.
    // VUELTA (ya más quizá mañana ya baja río el hoy agua poca con baja río el):
    //   TTR con 10 o más palabras: 10 → 9/10 = 0,90; 11 → 10/11; 12 → 11/12; 13 → 11/13 = 0,846;
    //   14 → 11/14 = 0,786. Ninguno baja de 0,72: no se cierra ningún factor.
    //   Palabra 15, la última: 11 tipos / 15 = 0,7333…
    //   factor parcial = (1 − 11/15) / 0,28 = (4/15) / 0,28 = 0,952380…  →  MTLD de vuelta = 15 / 0,952380… = 15,75.
    // MTLD = (8,75 + 15,75) / 2 = 12,25.
    cerca(valor('El río baja con poca agua hoy. El río baja ya, mañana quizá más ya.'), 12.25, 1e-9);
  });

  test('ninguna palabra repetida → ningún factor, ni parcial (TTR 1) → null', () => {
    // Ida y vuelta: TTR = 1 hasta el final; factor parcial = (1 − 1) / 0,28 = 0 → 3 / 0 no se puede calcular.
    // TAALED devuelve 0 (safe_divide) y lexical_diversity −1: aquí es «no calculable».
    assert.equal(valor('Uno dos tres.'), null);
  });

  test('sin palabras → null', () => {
    assert.equal(valor(''), null);
  });
});

describe('mtld · ORÁCULO (TAALED mtldo, commit 27b19e1)', () => {
  const bordes = () =>
    JSON.parse(readFileSync(new URL('mtld-bordes.json', REFERENCIA), 'utf8')) as Record<'A' | 'B' | 'C', { palabras: string[] }>;
  const texto = (palabras: string[]) => `${palabras.join(' ')}.`;

  test('borde A (TTR = 0,72 justo) → 143,99999999999997 (lexical_diversity: 101,99999999999999)', () => {
    cerca(valor(texto(bordes().A.palabras)), 143.99999999999997, 1e-9);
  });

  test('borde B (factor de 3 palabras) → 504,00000000000017 (lexical_diversity: 282,0000000000001)', () => {
    cerca(valor(texto(bordes().B.palabras)), 504.00000000000017, 1e-9);
  });

  test('borde C (cierre en la última palabra) → 57,24321266968326 (lexical_diversity: 57,59615384615384)', () => {
    cerca(valor(texto(bordes().C.palabras)), 57.24321266968326, 1e-9);
  });

  test('texto de prueba de 322 palabras → 108,46676489849378 (lexical_diversity da lo mismo)', () => {
    cerca(valor(readFileSync(new URL('texto-prueba-322.txt', REFERENCIA), 'utf8')), 108.46676489849378, 1e-9);
  });
});
