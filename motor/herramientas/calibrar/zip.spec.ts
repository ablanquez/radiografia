/**
 * Jueces de zip.ts (encargo 5.5): el fixture fixtures/prueba.zip lo escribió
 * el módulo zipfile de Python 3 (un escritor ajeno a este código), con una
 * entrada guardada sin comprimir y dos comprimidas con deflate:
 *   mimetype    método 0,  20 bytes, CRC-32 2cab616f
 *   a.txt       método 8, 260 bytes, CRC-32 7500627f («Hola, mundo. » × 20)
 *   dir/b.html  método 8,  33 bytes, CRC-32 3e7775c2
 * (listado con zipfile.infolist() el 30/09/2026).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { leerZip } from './zip.ts';

const PRUEBA = readFileSync(new URL('./fixtures/prueba.zip', import.meta.url));

describe('leerZip', () => {
  test('las tres entradas, en orden, con su contenido', () => {
    const z = leerZip(PRUEBA);
    assert.deepEqual([...z.keys()], ['mimetype', 'a.txt', 'dir/b.html']);
    assert.equal(z.get('mimetype')!.toString('utf8'), 'application/epub+zip');
    assert.equal(z.get('a.txt')!.toString('utf8'), 'Hola, mundo. '.repeat(20));
    assert.equal(z.get('dir/b.html')!.toString('utf8'), '<p>Año, señor: «ñandú».</p>');
  });

  test('un byte cambiado dentro de lo comprimido: para (CRC o deflate)', () => {
    const roto = Buffer.from(PRUEBA);
    // a.txt: cabecera local en 58, 30 bytes fijos + 5 del nombre → datos desde 93.
    roto[95] = roto[95]! ^ 0xff;
    assert.throws(() => leerZip(roto), /a\.txt/);
  });

  test('lo que no es un zip: para', () => {
    assert.throws(() => leerZip(Buffer.from('esto no es un zip')), /no es un zip/);
  });
});
