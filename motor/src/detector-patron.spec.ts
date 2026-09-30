/**
 * Los jueces propios del detector de patrón (encargo 4.1): que las señales
 * apuntan al original aunque se normalice, que la bandera «i» entra con
 * minúsculas en ámbito frase, que solo se mira la prosa, y los índices.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from './texto.ts';
import { detectarPatron, type ParametrosPatron, type Senal } from './detector-patron.ts';

const regla = (parametros: ParametrosPatron) => ({ id: 'r', parametros });
const cortes = (texto: string, senales: Senal[]) => senales.map((s) => [s.fragmento, s.inicio, s.fin, texto.slice(s.inicio, s.fin)]);

describe('detectarPatron', () => {
  test('ámbito palabra con tildes y minúsculas: la señal lleva el [inicio, fin) de la palabra ORIGINAL', () => {
    const texto = 'Él tomó una DECISIÓN rápida en Málaga.';
    const s = detectarPatron(
      regla({ formas: ['decision', 'malaga'], ambito: 'palabra', normalizar: { minusculas: true, tildes: true } }),
      analizarTexto(texto),
    );
    assert.deepEqual(cortes(texto, s), [
      ['DECISIÓN', 12, 20, 'DECISIÓN'],
      ['Málaga', 31, 37, 'Málaga'],
    ]);
  });

  test('ámbito palabra sin normalizar: distingue mayúsculas y tildes', () => {
    const texto = 'Decisión, decisión y decision.';
    const s = detectarPatron(regla({ formas: ['decisión'], ambito: 'palabra', normalizar: { minusculas: false, tildes: false } }), analizarTexto(texto));
    assert.deepEqual(s.map((x) => x.fragmento), ['decisión']);
  });

  test('ámbito palabra con regex: la regex se prueba sobre la palabra normalizada', () => {
    const texto = 'Innovó con un enfoque innovadorísimo.';
    const s = detectarPatron(regla({ regex: '^innov', ambito: 'palabra', normalizar: { minusculas: true, tildes: true } }), analizarTexto(texto));
    assert.deepEqual(s.map((x) => x.fragmento), ['Innovó', 'innovadorísimo']);
  });

  test('ámbito frase: la regex corre sobre la frase original, y con minúsculas entra la «i»', () => {
    const texto = 'Primero una cosa. En conclusión, otra.';
    const conI = detectarPatron(regla({ regex: 'en conclusión', ambito: 'frase', normalizar: { minusculas: true, tildes: false } }), analizarTexto(texto));
    assert.deepEqual(cortes(texto, conI), [['En conclusión', 18, 31, 'En conclusión']]);
    const sinI = detectarPatron(regla({ regex: 'en conclusión', ambito: 'frase', normalizar: { minusculas: false, tildes: false } }), analizarTexto(texto));
    assert.deepEqual(sinI, []);
  });

  test('ámbito frase: una señal por coincidencia, y las coincidencias vacías no cuentan', () => {
    const texto = 'Uno, dos, tres.';
    const comas = detectarPatron(regla({ regex: ',', ambito: 'frase', normalizar: { minusculas: false, tildes: false } }), analizarTexto(texto));
    assert.deepEqual(cortes(texto, comas), [
      [',', 3, 4, ','],
      [',', 8, 9, ','],
    ]);
    const vacia = detectarPatron(regla({ regex: 'x*', ambito: 'frase', normalizar: { minusculas: false, tildes: false } }), analizarTexto(texto));
    assert.deepEqual(vacia, []);
  });

  test('solo párrafos de prosa, con indiceParrafo e indiceFrase (dentro del párrafo)', () => {
    const texto = ['- crucial en una viñeta', 'Nada aquí. Esto es crucial.'].join('\n');
    const s = detectarPatron(regla({ formas: ['crucial'], ambito: 'palabra', normalizar: { minusculas: true, tildes: false } }), analizarTexto(texto));
    assert.deepEqual(
      s.map((x) => [x.reglaId, x.fragmento, x.indiceParrafo, x.indiceFrase, texto.slice(x.inicio, x.fin)]),
      [['r', 'crucial', 1, 1, 'crucial']],
    );
  });

});

// Encargo 4.2, cabo 1: «tildes» quita solo el acento agudo (U+0301); la «ñ» es letra y la diéresis
// es otro signo. Era un `todo` del 4.1 (quitar \p{M} tras NFD quitaba también la virgulilla y la diéresis).
describe('detectarPatron: tildes:true quita solo el acento agudo', () => {
  const conTildes = (formas: string[]) => regla({ formas, ambito: 'palabra', normalizar: { minusculas: true, tildes: true } });
  const fragmentos = (formas: string[], texto: string) => detectarPatron(conTildes(formas), analizarTexto(texto)).map((s) => s.fragmento);

  test('«año» no coincide con la forma «ano»', () => {
    assert.deepEqual(fragmentos(['ano'], 'Fue un buen año.'), []);
  });

  test('«pingüino» conserva la ü: no coincide con «pinguino» y sí con «pingüino»', () => {
    assert.deepEqual(fragmentos(['pinguino'], 'Vimos un pingüino.'), []);
    assert.deepEqual(fragmentos(['pingüino'], 'Vimos un Pingüino.'), ['Pingüino']);
  });

  test('«Málaga» coincide con la forma «malaga», y «malaga» con la forma «Málaga» (los dos lados igual)', () => {
    assert.deepEqual(fragmentos(['malaga'], 'Llegó a Málaga.'), ['Málaga']);
    assert.deepEqual(fragmentos(['Málaga'], 'Llegó a malaga.'), ['malaga']);
  });

  test('una «ñ» escrita descompuesta (n + U+0303) coincide con la forma «año» precompuesta: se recompone con NFC', () => {
    assert.deepEqual(fragmentos(['año'], 'Fue un buen an\u0303o.'), ['an\u0303o']);
  });
});
