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

  // HALLAZGO (30/09): quitar \p{M} tras NFD quita también la virgulilla de la «ñ» y la diéresis de
  // la «ü»: con tildes:true, «año» y «ano» son la misma forma. Es la regla del encargo 4.1, tal cual.
  test('con tildes:true, «año» no coincide con la forma «ano»', { todo: 'quitar \\p{M} tras NFD quita la virgulilla: «año» → «ano»' }, () => {
    const s = detectarPatron(regla({ formas: ['ano'], ambito: 'palabra', normalizar: { minusculas: true, tildes: true } }), analizarTexto('Fue un buen año.'));
    assert.deepEqual(s, []);
  });
});
