/**
 * Jueces de csic.ts (encargo 5.5, género «academico»): trozos de bytes por
 * huella, sus líneas completas, fragmentos de frases completas dentro de un
 * tramo y el reparto por turnos. Cifras y bytes, A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { medirLongitud } from './comun.ts';
import { fragmento, inicioDelTrozo, ocrPorMil, tramoPorTurno, unidadesCompletas } from './csic.ts';

describe('ocrPorMil', () => {
  test('palabras con un símbolo de OCR o una cifra entre letras, por 1.000 palabras', () => {
    // 2 marcadas («informaci6n», «ora•») de 8 palabras: 250 por 1.000.
    assert.equal(ocrPorMil('La informaci6n de esta ora• es muy buena.'), 250);
    // «c1usters» sí; «BOE-A-2010», «3D» y «COVID19» no (la cifra no va entre letras): 1 de 5 → 200.
    assert.equal(ocrPorMil('Los c1usters, BOE-A-2010, 3D, COVID19'), 200);
    assert.equal(ocrPorMil('Un texto limpio de principio a fin.'), 0);
  });
});

describe('inicioDelTrozo', () => {
  test('dentro del fichero, el mismo para la misma semilla e índice, distinto para otro índice', () => {
    const a = inicioDelTrozo('s', 0, 1000, 100);
    assert.ok(a >= 0 && a <= 900, String(a));
    assert.equal(inicioDelTrozo('s', 0, 1000, 100), a);
    assert.notEqual(inicioDelTrozo('s', 1, 1000, 100), a);
  });
});

describe('unidadesCompletas', () => {
  const b = (s: string) => Buffer.from(s, 'utf8');
  const lineasCompletas = (trozo: Buffer, desde: number, total: number) => unidadesCompletas(trozo, desde, total, '\n');

  test('entre el primer y el último salto de línea, con el byte donde empieza cada una', () => {
    // «cola\n» son 5 bytes: «linea A» empieza en 100 + 5; «linea A\n» son 8: «linea B» en 113.
    assert.deepEqual(lineasCompletas(b('cola\nlinea A\nlinea B\ncabeza'), 100, 10_000), [
      { byte: 105, texto: 'linea A' },
      { byte: 113, texto: 'linea B' },
    ]);
  });

  test('en el byte 0 la primera está completa; al final del fichero, la última', () => {
    assert.deepEqual(lineasCompletas(b('A\nB\nC'), 0, 10_000), [
      { byte: 0, texto: 'A' },
      { byte: 2, texto: 'B' },
    ]);
    assert.deepEqual(lineasCompletas(b('x\nA\nB'), 95, 100), [
      { byte: 97, texto: 'A' },
      { byte: 99, texto: 'B' },
    ]);
  });

  test('sin dos saltos de línea no hay línea completa; las vacías no cuentan; sin el \\r final', () => {
    assert.deepEqual(lineasCompletas(b('sin salto'), 10, 10_000), []);
    assert.deepEqual(lineasCompletas(b('abc\ndef'), 10, 10_000), []);
    assert.deepEqual(lineasCompletas(b('x\n\nA\r\n\n'), 10, 10_000), [{ byte: 13, texto: 'A' }]);
  });

  test('con una línea en blanco de separador: documentos enteros, con sus líneas dentro', () => {
    // «fin del anterior\n\n» son 18 bytes: el documento A empieza en 1000 + 18; «A1\nA2\n\n» son 7: B en 1025.
    assert.deepEqual(unidadesCompletas(b('fin del anterior\n\nA1\nA2\n\nB1\n\nC a medias'), 1000, 1_000_000, '\n\n'), [
      { byte: 1018, texto: 'A1\nA2' },
      { byte: 1025, texto: 'B1' },
    ]);
    // Un solo separador: ningún documento completo.
    assert.deepEqual(unidadesCompletas(b('cola\n\ncabeza\nsigue'), 5, 1_000_000, '\n\n'), []);
  });

  test('los bytes cuentan en UTF-8', () => {
    // «ñ» son 2 bytes: «ñ\n» ocupa 3, y «á» empieza en 3.
    assert.deepEqual(lineasCompletas(b('ñ\ná\nz'), 0, 10_000), [
      { byte: 0, texto: 'ñ' },
      { byte: 3, texto: 'á' },
    ]);
  });
});

describe('fragmento', () => {
  // 60 frases de 10 palabras, numeradas para saber dónde empieza y acaba el fragmento.
  const DOC = Array.from({ length: 60 }, (_, i) => `Frase ${i + 1} tiene exactamente diez palabras contadas en total aquí.`).join(' ');

  test('frases completas seguidas, dentro del tramo pedido', () => {
    for (const tramo of ['100-299', '300-599'] as const) {
      for (const id of ['a', 'b', 'c', 'd']) {
        const f = fragmento(DOC, id, tramo, 's');
        assert.ok(f !== null, `${tramo} ${id}`);
        assert.match(f.texto, /^Frase \d+ tiene/, 'empieza en el principio de una frase');
        assert.match(f.texto, /aquí\.$/, 'acaba en el final de una frase');
        assert.ok(DOC.includes(f.texto), 'seguidas, tal cual en el documento');
        assert.equal(medirLongitud(f.texto).tramo, tramo);
        assert.equal(f.palabrasProsa, medirLongitud(f.texto).palabrasProsa);
      }
    }
  });

  test('el mismo fragmento para el mismo id; otro para otro id', () => {
    assert.deepEqual(fragmento(DOC, 'a', '300-599', 's'), fragmento(DOC, 'a', '300-599', 's'));
    assert.notDeepEqual(fragmento(DOC, 'a', '300-599', 's'), fragmento(DOC, 'b', '300-599', 's'));
  });

  test('un documento corto para el tramo: null', () => {
    // 20 frases de 10 palabras = 200 palabras: no da 300.
    const corto = Array.from({ length: 20 }, (_, i) => `Frase ${i + 1} tiene exactamente diez palabras contadas en total aquí.`).join(' ');
    assert.equal(fragmento(corto, 'a', '300-599', 's'), null);
  });
});

describe('tramoPorTurno', () => {
  const cuenta = (a: number, b: number, c: number) => ({ '100-299': a, '300-599': b, '600+': c });

  test('un documento corto va a su tramo si aún le falta; si no, a ninguno', () => {
    assert.equal(tramoPorTurno('300-599', cuenta(0, 99, 0), 100), '300-599');
    assert.equal(tramoPorTurno('300-599', cuenta(0, 100, 0), 100), null);
  });

  test('uno de 600+, al que menos lleva de los que no llegan; a igualdad, el más largo', () => {
    assert.equal(tramoPorTurno('600+', cuenta(5, 3, 3), 100), '600+');
    assert.equal(tramoPorTurno('600+', cuenta(2, 3, 3), 100), '100-299');
    assert.equal(tramoPorTurno('600+', cuenta(40, 50, 100), 100), '100-299');
    assert.equal(tramoPorTurno('600+', cuenta(100, 100, 100), 100), null);
  });
});
