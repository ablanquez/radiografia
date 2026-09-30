/**
 * Jueces de ancora.ts (encargo 5.5): los documentos de un CoNLL-U de
 * UD_Spanish-AnCora por sus comentarios `# newdoc id` y `# text`.
 * [DOC] https://universaldependencies.org/format.html — «The first sentence of
 *    a new document contains a comment that says # newdoc, which can be
 *    optionally followed by a document id»; igual `# newpar` para párrafos.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { documentosDeConllu } from './ancora.ts';

/** Una frase CoNLL-U mínima: sus comentarios y una fila por token (las columnas no se leen). */
const frase = (sentId: string, texto: string, antes: string[] = []) =>
  [...antes, `# sent_id = ${sentId}`, `# text = ${texto}`, ...texto.split(' ').map((f, i) => `${i + 1}\t${f}\t_\t_\t_\t_\t0\t_\t_\t_`)].join('\n') + '\n\n';

describe('documentosDeConllu', () => {
  test('un documento por # newdoc id, con el # text de sus frases unido por un espacio', () => {
    const conllu =
      frase('CESS-CAST-P-1-s1', 'Llueve en Madrid.', ['# newdoc id = CESS-CAST-P-1']) +
      frase('CESS-CAST-P-1-s2', 'Mañana, también.') +
      frase('3LB-CAST-t5-4-s1', 'Sólo que el calor era peor.', ['# newdoc id = 3LB-CAST-t5-4']);
    assert.deepEqual(documentosDeConllu([{ fichero: 'es_ancora-ud-dev.conllu', texto: conllu }]), [
      { id: 'CESS-CAST-P-1', subcorpus: 'CESS-CAST-P', fichero: 'es_ancora-ud-dev.conllu', frases: 2, texto: 'Llueve en Madrid. Mañana, también.' },
      { id: '3LB-CAST-t5-4', subcorpus: '3LB-CAST', fichero: 'es_ancora-ud-dev.conllu', frases: 1, texto: 'Sólo que el calor era peor.' },
    ]);
  });

  test('el subcorpus es el prefijo del id: CESS-CAST-AA no se confunde con CESS-CAST-A', () => {
    const conllu =
      frase('CESS-CAST-AA-20000106-3047-s1', 'Uno.', ['# newdoc id = CESS-CAST-AA-20000106-3047']) +
      frase('CESS-CAST-A-20000217-1-s1', 'Dos.', ['# newdoc id = CESS-CAST-A-20000217-1']);
    assert.deepEqual(
      documentosDeConllu([{ fichero: 'f', texto: conllu }]).map((d) => d.subcorpus),
      ['CESS-CAST-AA', 'CESS-CAST-A'],
    );
  });

  test('# newpar abre un párrafo: una línea por párrafo', () => {
    const conllu =
      frase('CESS-CAST-P-2-s1', 'Primero.', ['# newdoc id = CESS-CAST-P-2', '# newpar']) +
      frase('CESS-CAST-P-2-s2', 'Sigue.') +
      frase('CESS-CAST-P-2-s3', 'Otro párrafo.', ['# newpar id = p2']);
    assert.equal(documentosDeConllu([{ fichero: 'f', texto: conllu }])[0]!.texto, 'Primero. Sigue.\nOtro párrafo.');
  });

  test('una frase antes de cualquier # newdoc: sin límites de documento, para', () => {
    assert.throws(() => documentosDeConllu([{ fichero: 'f', texto: frase('CESS-CAST-P-3-s1', 'Suelta.') }]), /sin # newdoc/);
  });

  test('un sent_id que no es del documento abierto: para', () => {
    const conllu = frase('CESS-CAST-P-4-s1', 'Uno.', ['# newdoc id = CESS-CAST-P-4']) + frase('CESS-CAST-P-5-s1', 'Dos.');
    assert.throws(() => documentosDeConllu([{ fichero: 'f', texto: conllu }]), /CESS-CAST-P-5-s1/);
  });

  test('el mismo id en dos ficheros: para', () => {
    const uno = frase('CESS-CAST-P-6-s1', 'Uno.', ['# newdoc id = CESS-CAST-P-6']);
    assert.throws(() => documentosDeConllu([{ fichero: 'a', texto: uno }, { fichero: 'b', texto: uno }]), /repetido/);
  });

  test('un prefijo desconocido: para', () => {
    assert.throws(() => documentosDeConllu([{ fichero: 'f', texto: frase('XYZ-1-s1', 'Uno.', ['# newdoc id = XYZ-1']) }]), /prefijo/);
  });
});
