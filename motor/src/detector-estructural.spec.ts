/**
 * Los jueces propios del detector estructural (encargo 4.2): cada posición
 * mira donde dice y solo ahí, el ancla cae sobre la frase SIN blancos finales,
 * los desplazamientos son los del original, `indiceFrase` en las posiciones de
 * párrafo es la frase donde empieza la coincidencia, y `minimo` cuenta en todo
 * el texto.
 *
 * Los desplazamientos esperados están contados a mano en el comentario de
 * cada juez, no sacados del detector.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from './texto.ts';
import { detectarEstructural, type ParametrosEstructural } from './detector-estructural.ts';

const regla = (parametros: ParametrosEstructural) => ({ id: 'r', parametros });

/** [fragmento, inicio, fin, indiceParrafo, indiceFrase], y comprueba que el fragmento es el original en [inicio, fin). */
function senales(texto: string, parametros: ParametrosEstructural): (string | number)[][] {
  return detectarEstructural(regla(parametros), analizarTexto(texto)).map((s) => {
    assert.equal(texto.slice(s.inicio, s.fin), s.fragmento, `el fragmento no es el original en [${s.inicio}, ${s.fin})`);
    return [s.fragmento, s.inicio, s.fin, s.indiceParrafo, s.indiceFrase];
  });
}

describe('detectarEstructural: las posiciones ancladas', () => {
  test('inicio-frase: solo al principio de cada frase, no a mitad', () => {
    // «Además, llueve. Luego, además, nieva.» → «Además» en [0, 6); el segundo «además» está a mitad de frase.
    assert.deepEqual(senales('Además, llueve. Luego, además, nieva.', { posicion: 'inicio-frase', regex: 'además', flags: 'i' }), [
      ['Además', 0, 6, 0, 0],
    ]);
  });

  test('fin-frase: el «$» cae antes de los blancos que Intl.Segmenter deja en la frase, y con \\r\\n', () => {
    // «Qué bien!!» ocupa [0, 10): «!!» en [8, 10); tres espacios (10-12); «Seguimos.» [13, 22);
    // «\r» 22, «\n» 23; «Otra vez!!» [24, 34): «!!» en [32, 34); dos espacios al final.
    const texto = 'Qué bien!!   Seguimos.\r\nOtra vez!!  ';
    assert.deepEqual(senales(texto, { posicion: 'fin-frase', regex: '!{2,}' }), [
      ['!!', 8, 10, 0, 0],
      ['!!', 32, 34, 1, 0],
    ]);
  });

  test('inicio-parrafo: solo la primera frase de cada párrafo', () => {
    // «Además, uno.» [0, 12) «Además, dos.» [13, 25) «\n» 25 «Además, tres.» [26, 39).
    assert.deepEqual(senales('Además, uno. Además, dos.\nAdemás, tres.', { posicion: 'inicio-parrafo', regex: 'Además' }), [
      ['Además', 0, 6, 0, 0],
      ['Además', 26, 32, 1, 0],
    ]);
  });

  test('fin-parrafo: solo la última frase de cada párrafo', () => {
    // «Uno!!» [0, 5) «Dos!!» [6, 11): «!!» en [9, 11); «\n» 11; «Tres!!» [12, 18): «!!» en [16, 18).
    assert.deepEqual(senales('Uno!! Dos!!\nTres!!', { posicion: 'fin-parrafo', regex: '!{2,}' }), [
      ['!!', 9, 11, 0, 1],
      ['!!', 16, 18, 1, 0],
    ]);
  });

  test('fin-parrafo: un párrafo sin puntuación final, con blancos detrás', () => {
    // «Termina sin punto» [0, 17): «punto» en [12, 17); dos espacios detrás.
    assert.deepEqual(senales('Termina sin punto  ', { posicion: 'fin-parrafo', regex: '\\p{L}+', flags: 'u' }), [['punto', 12, 17, 0, 0]]);
  });

  test('la coincidencia vacía no cuenta', () => {
    assert.deepEqual(senales('Una frase. Otra.', { posicion: 'inicio-frase', regex: 'x*' }), []);
  });
});

describe('detectarEstructural: las posiciones de párrafo entero', () => {
  test('ultimo-parrafo: el último párrafo de PROSA, aunque detrás venga una viñeta; el «^» lo escribe el autor', () => {
    // «Primero.» [0, 8) «\n» 8 «En resumen, bien.» [9, 26) «\n» 26 «- En resumen, viñeta.» (no-prosa).
    const texto = 'Primero.\nEn resumen, bien.\n- En resumen, viñeta.';
    assert.deepEqual(senales(texto, { posicion: 'ultimo-parrafo', regex: '^En resumen' }), [['En resumen', 9, 19, 1, 0]]);
    // En un párrafo que no es el último, no.
    assert.deepEqual(senales('En resumen, bien.\nPrimero.', { posicion: 'ultimo-parrafo', regex: '^En resumen' }), []);
  });

  test('ultimo-parrafo: indiceFrase es la frase donde EMPIEZA la coincidencia', () => {
    // «Todo bien.» [0, 10) «En resumen, mal.» [11, 27): «En resumen» en [11, 21), frase 1.
    assert.deepEqual(senales('Todo bien. En resumen, mal.', { posicion: 'ultimo-parrafo', regex: 'En resumen' }), [['En resumen', 11, 21, 0, 1]]);
  });

  test('cualquiera: una coincidencia que cruza frases, con su indiceFrase en la frase donde empieza', () => {
    // «No solo llegó tarde.» [0, 20) «Sino que se fue.» [21, 37): la coincidencia va de 0 a 25 («… Sino»).
    const texto = 'No solo llegó tarde. Sino que se fue.';
    assert.deepEqual(senales(texto, { posicion: 'cualquiera', regex: '\\bno solo\\b.*?\\bsino\\b', flags: 'i' }), [
      ['No solo llegó tarde. Sino', 0, 25, 0, 0],
    ]);
    // Y una que empieza en la segunda frase: «Sino» en [21, 25), frase 1.
    assert.deepEqual(senales(texto, { posicion: 'cualquiera', regex: 'Sino' }), [['Sino', 21, 25, 0, 1]]);
  });

  test('cualquiera: una coincidencia que empieza en el blanco entre dos frases es de la frase anterior', () => {
    // El blanco 20 queda dentro del segmento de la primera frase (Intl.Segmenter lo deja al final).
    assert.deepEqual(senales('No solo llegó tarde. Sino que se fue.', { posicion: 'cualquiera', regex: '\\s+Sino' }), [[' Sino', 20, 25, 0, 0]]);
  });

  test('cualquiera: no cruza párrafos', () => {
    assert.deepEqual(senales('No solo llegó tarde.\nSino que se fue.', { posicion: 'cualquiera', regex: '\\bno solo\\b.*?\\bsino\\b', flags: 'i' }), []);
  });
});

describe('detectarEstructural: sobreNoProsa (encargo 5.1)', () => {
  const almohadilla = (sobreNoProsa?: boolean): ParametrosEstructural => ({
    posicion: 'inicio-parrafo',
    regex: '#{1,6} ',
    ...(sobreNoProsa === undefined ? {} : { sobreNoProsa }),
  });

  test('un «# Título» solo se señala con sobreNoProsa: true', () => {
    // «# Título del informe» [0, 20) es un encabezado (no-prosa): «# » en [0, 2).
    const texto = '# Título del informe\nEl informe llega el lunes.';
    assert.deepEqual(senales(texto, almohadilla()), []);
    assert.deepEqual(senales(texto, almohadilla(false)), []);
    assert.deepEqual(senales(texto, almohadilla(true)), [['# ', 0, 2, 0, 0]]);
  });

  test('con true, un «# » dentro de un bloque de código no se señala', () => {
    assert.deepEqual(senales('```bash\n# instala las dependencias\n```\nEl informe llega el lunes.', almohadilla(true)), []);
    assert.deepEqual(senales('~~~\n## otra valla\n~~~', almohadilla(true)), []);
  });

  test('ultimo-parrafo con true: el último de los párrafos que se miran (una viñeta sí, un bloque de código no)', () => {
    // «En resumen, prosa.» [0, 18) · «- En resumen, viñeta.» [19, 40): «En resumen» en [21, 31) · código detrás.
    const texto = 'En resumen, prosa.\n- En resumen, viñeta.\n```\nEn resumen, código.\n```';
    assert.deepEqual(senales(texto, { posicion: 'ultimo-parrafo', regex: 'En resumen' }), [['En resumen', 0, 10, 0, 0]]);
    assert.deepEqual(senales(texto, { posicion: 'ultimo-parrafo', regex: 'En resumen', sobreNoProsa: true }), [['En resumen', 21, 31, 1, 0]]);
  });

  test('con true, las filas de una tabla se miran y cuentan para el mínimo', () => {
    // «| Mes | Ventas |» [0, 16) · «|---|---|» [17, 26) · «Texto.» [27, 33): una «|» al principio de cada fila.
    const texto = '| Mes | Ventas |\n|---|---|\nTexto.';
    assert.deepEqual(senales(texto, { posicion: 'inicio-parrafo', regex: '\\|', minimo: 2 }), []);
    assert.deepEqual(senales(texto, { posicion: 'inicio-parrafo', regex: '\\|', minimo: 2, sobreNoProsa: true }), [
      ['|', 0, 1, 0, 0],
      ['|', 17, 18, 1, 0],
    ]);
  });
});

describe('detectarEstructural: minimo, prosa e índices', () => {
  const apertura = { posicion: 'inicio-frase', regex: 'Además', minimo: 2 } as const;

  test('minimo 2 con una sola coincidencia en el texto → ninguna señal', () => {
    assert.deepEqual(senales('Además, llovía. Luego, hizo frío.', apertura), []);
  });

  test('minimo 2 con dos coincidencias en párrafos distintos → las dos', () => {
    // «Además, llovía.» [0, 15) «\n» 15 «Además, nevó.» [16, 29).
    assert.deepEqual(senales('Además, llovía.\nAdemás, nevó.', apertura), [
      ['Además', 0, 6, 0, 0],
      ['Además', 16, 22, 1, 0],
    ]);
  });

  test('solo prosa: una viñeta o un encabezado no señalan ni cuentan para el mínimo; indiceParrafo cuenta todos los párrafos', () => {
    // «# Además, título» (0, encabezado) «- Además, viñeta» (1, viñeta) «Además, prosa.» [34, 48) (2).
    const texto = '# Además, título\n- Además, viñeta\nAdemás, prosa.';
    assert.deepEqual(senales(texto, { posicion: 'inicio-frase', regex: 'Además' }), [['Además', 34, 40, 2, 0]]);
    assert.deepEqual(senales(texto, apertura), []);
  });
});

describe('detectarEstructural: minimoPorCoincidencia (encargo 5.3)', () => {
  // «Además, uno.» [0, 12): «Además» en [0, 6) · «Además, dos.» [13, 25): [13, 19) ·
  // «ADEMÁS, tres.» [26, 39): [26, 32) · «Sin embargo, cuatro.» [40, 60): «Sin embargo» en [40, 51).
  const texto = 'Además, uno. Además, dos. ADEMÁS, tres. Sin embargo, cuatro.';
  const apertura = (extra: Partial<ParametrosEstructural>): ParametrosEstructural => ({
    posicion: 'inicio-frase',
    regex: '(Además|Sin embargo)(?!\\p{L})',
    flags: 'iu',
    ...extra,
  });
  const LAS_TRES = [
    ['Además', 0, 6, 0, 0],
    ['Además', 13, 19, 0, 1],
    ['ADEMÁS', 26, 32, 0, 2],
  ];

  test('sin él, las cuatro; con 3, solo la forma que se repite tres veces (mayúsculas aparte)', () => {
    assert.equal(senales(texto, apertura({})).length, 4);
    assert.deepEqual(senales(texto, apertura({ minimoPorCoincidencia: 3 })), LAS_TRES);
  });

  test('con minimo también: minimo cuenta las que quedan tras el filtro por forma', () => {
    assert.deepEqual(senales(texto, apertura({ minimoPorCoincidencia: 3, minimo: 3 })), LAS_TRES);
    assert.deepEqual(senales(texto, apertura({ minimoPorCoincidencia: 3, minimo: 4 })), []);
  });
});
