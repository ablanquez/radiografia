/**
 * Jueces de lo común de la herramienta de calibración (encargo 5.5): la
 * huella, el reparto calibración/validación por semilla, el orden de
 * muestra, la longitud de un documento y el control de que un manifiesto no
 * lleva texto.
 *
 * Los valores de las huellas son de un oráculo AJENO al código que se juzga:
 * `sha256sum` de Git Bash (30/09/2026), p. ej.
 *   printf '%s' 'radiografia-calibracion-2026|doc-1' | sha256sum
 * y las cuentas del reparto, de un bucle de Bash con la misma cuenta entera
 * (5 · h < 4 · 2⁵², con h los 13 primeros dígitos hexadecimales).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SEMILLA, comprobarSinTexto, huella, medirLongitud, ordenDeMuestra, reparto, uniforme } from './comun.ts';

describe('huella', () => {
  test('sha256 en hexadecimal del texto en UTF-8', () => {
    assert.equal(huella('Hola, mundo.'), '5403defbb2fad67a5ecac176977329be66cd0089acae1b5663346bcf1eaaf158');
  });
});

describe('reparto por semilla', () => {
  test('la semilla es la del encargo, fija', () => {
    assert.equal(SEMILLA, 'radiografia-calibracion-2026');
  });

  test('uniforme: los 13 primeros dígitos de sha256("semilla|id") entre 2⁵²', () => {
    // sha256sum de «radiografia-calibracion-2026|doc-1» = dd74bc86dfb0c…
    assert.equal(uniforme(SEMILLA, 'doc-1'), 0xdd74bc86dfb0c / 2 ** 52);
  });

  test('doc-1 va a validación (0,863…) y doc-2 a calibración (0,504…)', () => {
    assert.equal(reparto(SEMILLA, 'doc-1'), 'validacion');
    assert.equal(reparto(SEMILLA, 'doc-2'), 'calibracion');
  });

  test('reproducible: de doc-0 a doc-999, 806 a calibración con la semilla (810 con otra)', () => {
    const ids = Array.from({ length: 1000 }, (_, i) => `doc-${i}`);
    const cuenta = (semilla: string) => ids.filter((id) => reparto(semilla, id) === 'calibracion').length;
    assert.equal(cuenta(SEMILLA), 806);
    assert.equal(cuenta(SEMILLA), 806, 'la segunda vez, lo mismo');
    assert.equal(cuenta('otra-semilla'), 810);
  });

  test('no depende del orden de lectura', () => {
    const ids = ['doc-7', 'doc-3', 'doc-1', 'doc-2'];
    const a = new Map(ids.map((id) => [id, reparto(SEMILLA, id)]));
    const b = new Map([...ids].reverse().map((id) => [id, reparto(SEMILLA, id)]));
    assert.deepEqual(a, b);
  });
});

describe('orden de muestra', () => {
  test('por sha256("semilla|muestra|id"): a (105f…), c (3b62…), d (c69c…), b (eeca…)', () => {
    assert.deepEqual(ordenDeMuestra(SEMILLA, ['a', 'b', 'c', 'd'], (x) => x), ['a', 'c', 'd', 'b']);
    assert.deepEqual(ordenDeMuestra(SEMILLA, ['d', 'c', 'b', 'a'], (x) => x), ['a', 'c', 'd', 'b'], 'el orden de entrada no importa');
  });
});

describe('medirLongitud', () => {
  const palabras = (n: number) => Array.from({ length: n }, () => 'casa').join(' ') + '.';
  test('99 palabras de prosa: sin tramo', () => {
    assert.deepEqual(medirLongitud(palabras(99)), { palabrasProsa: 99, tramo: null });
  });
  test('100 → 100-299; 300 → 300-599; 600 → 600+', () => {
    assert.deepEqual(medirLongitud(palabras(100)), { palabrasProsa: 100, tramo: '100-299' });
    assert.deepEqual(medirLongitud(palabras(300)), { palabrasProsa: 300, tramo: '300-599' });
    assert.deepEqual(medirLongitud(palabras(600)), { palabrasProsa: 600, tramo: '600+' });
  });
  test('las viñetas no cuentan: 100 palabras de prosa y una viñeta de 50', () => {
    assert.deepEqual(medirLongitud(`${palabras(100)}\n- ${palabras(50)}`), { palabrasProsa: 100, tramo: '100-299' });
  });
});

describe('comprobarSinTexto', () => {
  const texto =
    'El Ministerio ha dispuesto el cese, con efectos de hoy, del director del gabinete de la secretaría.\n' +
    'Madrid, 1 de marzo.';
  test('un manifiesto con ids, huellas y cifras no lleva texto', () => {
    const manifiesto = { documentos: [{ id: 'BOE-A-2010-4000', sha256: huella(texto), palabrasProsa: 21 }] };
    assert.deepEqual(comprobarSinTexto(manifiesto, [texto]), []);
  });
  test('un campo con una frase del documento se caza, esté donde esté', () => {
    const manifiesto = { documentos: [{ id: 'x', notas: [{ extracto: 'El Ministerio ha dispuesto el cese, con efectos de hoy, del director' }] }] };
    assert.equal(comprobarSinTexto(manifiesto, [texto]).length, 1);
  });
  test('un párrafo de menos de 50 caracteres no cuenta como texto (una firma, una fecha)', () => {
    assert.deepEqual(comprobarSinTexto({ lugar: 'Madrid, 1 de marzo.' }, [texto]), []);
  });
});
