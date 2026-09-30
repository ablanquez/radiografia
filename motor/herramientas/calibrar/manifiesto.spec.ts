/**
 * Jueces del manifiesto de un corpus (encargo 5.5): cada documento con su
 * huella sha256 (64 hexadecimales, la de SU texto), ordenados por id, y ni una
 * frase de texto en ningún campo. Y el nombre del fichero de un documento.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { huella } from './comun.ts';
import { nombreDeFichero, prepararManifiesto, type Manifiesto } from './manifiesto.ts';

const TEXTOS = new Map([
  ['b-2', 'La Dirección General ha resuelto convocar el concurso para la provisión de puestos de trabajo vacantes.'],
  ['a-1', 'El equipo surafricano se clasificó para disputar la final de la Copa Hopman tras ganar a Suecia.'],
]);

function manifiesto(documentos: Manifiesto['documentos']): Manifiesto {
  return {
    genero: 'prueba',
    fuente: { nombre: 'corpus de prueba', url: 'https://example.org', ficheros: [] },
    licencia: { nombre: 'CC BY 4.0', literal: ['«licensed under CC BY 4.0»'], url: 'https://example.org/LICENSE', estado: 'verificada', atribucion: 'Nadie (2026)' },
    documentacion: [],
    filtros: [],
    unidad: 'documento',
    descarga: { fecha: '2026-09-30', herramienta: 'prueba', peticiones: 0, bytes: 0, segundos: 0 },
    n: { documentos: documentos.length, descartados: {}, porTramo: { '100-299': 0, '300-599': 0, '600+': 0 } },
    documentos,
  };
}

const doc = (id: string, sha256 = huella(TEXTOS.get(id)!)) => ({ id, sha256, palabrasProsa: 17, tramo: null });

describe('prepararManifiesto', () => {
  test('ordena los documentos por id y deja la huella de cada texto', () => {
    const m = prepararManifiesto(manifiesto([doc('b-2'), doc('a-1')]), TEXTOS);
    assert.deepEqual(m.documentos.map((d) => d.id), ['a-1', 'b-2']);
    for (const d of m.documentos) {
      assert.match(d.sha256, /^[0-9a-f]{64}$/);
      assert.equal(d.sha256, huella(TEXTOS.get(d.id)!));
    }
  });

  test('una huella que no es la del texto: para, nombrando el documento', () => {
    assert.throws(() => prepararManifiesto(manifiesto([doc('a-1', huella('otro')), doc('b-2')]), TEXTOS), /a-1/);
  });

  test('un documento sin texto: para', () => {
    assert.throws(() => prepararManifiesto(manifiesto([doc('a-1'), doc('b-2'), { ...doc('a-1'), id: 'c-3' }]), TEXTOS), /c-3/);
  });

  test('un campo con una frase de un texto: para', () => {
    const m = manifiesto([doc('a-1'), doc('b-2')]);
    m.filtros.push(`ejemplo: ${TEXTOS.get('b-2')}`);
    assert.throws(() => prepararManifiesto(m, TEXTOS), /texto/);
  });

  test('n.documentos tiene que ser el número de documentos', () => {
    const m = manifiesto([doc('a-1'), doc('b-2')]);
    m.n.documentos = 3;
    assert.throws(() => prepararManifiesto(m, TEXTOS), /n\.documentos/);
  });
});

describe('nombreDeFichero', () => {
  test('el id y «.txt»', () => {
    assert.equal(nombreDeFichero('CESS-CAST-P-19981201-5'), 'CESS-CAST-P-19981201-5.txt');
    assert.equal(nombreDeFichero('BOE-A-2010-4000'), 'BOE-A-2010-4000.txt');
  });
  test('un id con barras, puntos al principio o espacios: para', () => {
    assert.throws(() => nombreDeFichero('../x'));
    assert.throws(() => nombreDeFichero('a/b'));
    assert.throws(() => nombreDeFichero('a b'));
  });
});
