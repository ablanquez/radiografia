/**
 * El juez del silabeador (encargo 3.3): silabea contra 60 palabras silabeadas
 * por la Ortografía de la lengua española (RAE-ASALE, 2010) y el DPD
 * (fixtures/referencia/silabas-referencia.json; ahí están las secciones
 * citadas y qué entradas son literales y cuáles derivadas).
 *
 * silabea no se instala por npm: va incorporado, sin modificar, en
 * src/terceros/silabea.cjs (decisión de Antonio, parada del 3.3: el paquete
 * arrastraba mocha y chai con 6 vulnerabilidades). Ficha en el NOTICES § 1.5.
 * [DOC] silabea (https://github.com/javierarce/silabea, README):
 *    `getSilabas(palabra).silabas` es la lista de sílabas `{ silaba }`.
 *
 * Un juez por palabra, para que cada fallo salga con su palabra. Lo que falle
 * NO se arregla en la librería (encargo 3.3): se deja el juez en rojo como
 * `todo`, con la razón, en FALLOS_CONOCIDOS. Un `todo` que falla no rompe la
 * suite, pero sale en la salida marcado como tal.
 *
 * ⚠️ El fixture se lee al cargar el fichero, fuera de los tests, porque de él
 *    salen los tests mismos. Si no se puede leer, falla el fichero entero y
 *    `node --test` lo cuenta como un fallo (visto el 29/09 con un esquema
 *    roto), a diferencia de lo que pasaba dentro de un describe
 *    (docs/BITACORA.md, 2026-09-29). El juez «son sesenta» comprueba además
 *    que ninguna palabra se quedó sin juez.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import silabea from './terceros/silabea.cjs';

interface PalabraDeReferencia {
  palabra: string;
  silabas: string[];
  tipo: string;
  cita: string;
  literal: boolean;
}

const { palabras } = JSON.parse(
  readFileSync(new URL('../fixtures/referencia/silabas-referencia.json', import.meta.url), 'utf8'),
) as { palabras: PalabraDeReferencia[] };

/**
 * Palabra → por qué silabea no la silabea como la RAE. Rellenado tras medir el
 * 29/09 (57 de 60 bien), nunca antes. Se reportan, no se arreglan.
 */
const FALLOS_CONOCIDOS: Readonly<Record<string, string>> = {
  tungsteno:
    'silabea da tung.ste.no: aplica la regla general de cuatro consonantes (dos y dos), y no la excepción de OLE III § 4.1.1.1.1.1 para voces de otras lenguas (tungsteno, ángstrom), donde la frontera va detrás de la s',
  subrayar:
    'silabea da su.bra.yar: trata «br» como grupo inseparable y no sabe que «sub-» es prefijo; la RAE separa sub.ra.yar (OLE III § 4.1.1.1.1.1a). Solo se resuelve conociendo la morfología de la palabra',
  sublunar:
    'silabea da su.blu.nar: trata «bl» como grupo inseparable y no sabe que «sub-» es prefijo; la RAE separa sub.lu.nar (OLE III § 4.1.1.1.1.1a). Solo se resuelve conociendo la morfología de la palabra',
};

describe('silabea contra la Ortografía de la RAE', () => {
  test('son sesenta palabras, sin repetir', () => {
    assert.equal(palabras.length, 60);
    assert.equal(new Set(palabras.map((p) => p.palabra)).size, 60);
  });

  for (const p of palabras) {
    const razon = FALLOS_CONOCIDOS[p.palabra];
    test(`${p.palabra} → ${p.silabas.join('.')} (${p.tipo})`, razon === undefined ? {} : { todo: razon }, () => {
      const dadas = silabea.getSilabas(p.palabra).silabas.map((s) => s.silaba);
      assert.deepEqual(dadas, p.silabas, `${p.palabra}: silabea da ${dadas.join('.')} y la RAE ${p.silabas.join('.')} (${p.cita})`);
    });
  }
});
