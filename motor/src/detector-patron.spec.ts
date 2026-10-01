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
    // Línea en blanco desde el 6.1: sin ella, la segunda línea es continuación del ítem (CommonMark § 5.2).
    const texto = ['- crucial en una viñeta', 'Nada aquí. Esto es crucial.'].join('\n\n');
    const s = detectarPatron(regla({ formas: ['crucial'], ambito: 'palabra', normalizar: { minusculas: true, tildes: false } }), analizarTexto(texto));
    assert.deepEqual(
      s.map((x) => [x.reglaId, x.fragmento, x.indiceParrafo, x.indiceFrase, texto.slice(x.inicio, x.fin)]),
      [['r', 'crucial', 1, 1, 'crucial']],
    );
  });

});

/**
 * Encargo 5.1: sobreNoProsa. Con true, el detector mira también viñetas,
 * encabezados y tablas; los bloques de código (``` y ~~~) nunca. Un solo
 * texto con «**x**» en cada clase de párrafo; los desplazamientos, a mano:
 *   0 «```» [0, 3) · 1 «**x** en código» [4, 19) · 2 «```» [20, 23) ·
 *   3 «~~~» [24, 27) · 4 «**x** en otra valla» [28, 47) · 5 «~~~» [48, 51) ·
 *   6 «- **x** en viñeta» [52, 69), «**x**» en [54, 59) ·
 *   7 «## **x** en encabezado» [70, 92), «**x**» en [73, 78) ·
 *   8 «| **x** | tabla |» [93, 110), «**x**» en [95, 100) ·
 *   9 «Y **x** en prosa.» [111, 128), «**x**» en [113, 118).
 */
describe('detectarPatron: sobreNoProsa (encargo 5.1)', () => {
  const texto = ['```', '**x** en código', '```', '~~~', '**x** en otra valla', '~~~', '- **x** en viñeta', '## **x** en encabezado', '| **x** | tabla |', 'Y **x** en prosa.'].join('\n');
  const negrita = (sobreNoProsa?: boolean): ParametrosPatron => ({
    regex: '\\*\\*[^*\\n]+\\*\\*',
    ambito: 'frase',
    normalizar: { minusculas: false, tildes: false },
    ...(sobreNoProsa === undefined ? {} : { sobreNoProsa }),
  });
  const vistas = (p: ParametrosPatron) => detectarPatron(regla(p), analizarTexto(texto)).map((s) => [...cortes(texto, [s])[0]!, s.indiceParrafo, s.indiceFrase]);

  test('sin sobreNoProsa, o con false: solo la prosa', () => {
    const soloProsa = [['**x**', 113, 118, '**x**', 9, 0]];
    assert.deepEqual(vistas(negrita()), soloProsa);
    assert.deepEqual(vistas(negrita(false)), soloProsa);
  });

  test('con true: también la viñeta, el encabezado y la tabla, y ninguno de los dos bloques de código', () => {
    assert.deepEqual(vistas(negrita(true)), [
      ['**x**', 54, 59, '**x**', 6, 0],
      ['**x**', 73, 78, '**x**', 7, 0],
      ['**x**', 95, 100, '**x**', 8, 0],
      ['**x**', 113, 118, '**x**', 9, 0],
    ]);
  });

  test('con true y ámbito palabra: la palabra de la viñeta sí, la del código no', () => {
    // «- crucial en viñeta» [0, 19): «crucial» en [2, 9) · «```» [20, 23) · «crucial en código» [24, 41) · «```» [42, 45).
    const t = ['- crucial en viñeta', '```', 'crucial en código', '```'].join('\n');
    const s = detectarPatron(regla({ formas: ['crucial'], ambito: 'palabra', normalizar: { minusculas: false, tildes: false }, sobreNoProsa: true }), analizarTexto(t));
    assert.deepEqual(cortes(t, s), [['crucial', 2, 9, 'crucial']]);
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

/**
 * Encargo 5.3: minimo también en patrón, y minimoPorCoincidencia (las
 * coincidencias se agrupan por su forma: en minúsculas y sin blancos ni
 * puntuación en los bordes). Los desplazamientos, a mano en cada juez.
 */
describe('detectarPatron: minimo y minimoPorCoincidencia (encargo 5.3)', () => {
  const NORMAL = { minusculas: true, tildes: false };
  const vistas = (texto: string, p: ParametrosPatron) => detectarPatron(regla(p), analizarTexto(texto)).map((s) => [s.fragmento, s.inicio, s.fin]);

  test('minimo 2: con una coincidencia, ninguna señal; con dos, las dos', () => {
    const crucial: ParametrosPatron = { formas: ['crucial'], ambito: 'palabra', normalizar: NORMAL, minimo: 2 };
    assert.deepEqual(vistas('Es crucial.', crucial), []);
    // «Es crucial.» [0, 11): «crucial» en [3, 10) · «Muy crucial.» [12, 24): «crucial» en [16, 23).
    assert.deepEqual(vistas('Es crucial. Muy crucial.', crucial), [
      ['crucial', 3, 10],
      ['crucial', 16, 23],
    ]);
  });

  test('minimoPorCoincidencia 3: «Además,», «además» y «Además» son la misma forma; «También» dos veces no llega', () => {
    // «Además, sí.» [0, 11): «Además,» en [0, 7) · «Y además no.» [12, 24): «además» en [14, 20) ·
    // «¡Además!» [25, 33): «Además» en [26, 32) · «También.» [34, 42): «También» en [34, 41) ·
    // «También.» [43, 51): [43, 50).
    const texto = 'Además, sí. Y además no. ¡Además! También. También.';
    const conectores = (minimoPorCoincidencia: number): ParametrosPatron => ({
      regex: '(?<!\\p{L})(además|también),?',
      flags: 'iu',
      ambito: 'frase',
      normalizar: NORMAL,
      minimoPorCoincidencia,
    });
    assert.deepEqual(vistas(texto, conectores(3)), [
      ['Además,', 0, 7],
      ['además', 14, 20],
      ['Además', 26, 32],
    ]);
    assert.deepEqual(vistas(texto, conectores(2)).length, 5);
    assert.deepEqual(vistas(texto, conectores(4)), []);
  });
});
