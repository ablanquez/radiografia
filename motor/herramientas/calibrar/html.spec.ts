/**
 * Jueces de html.ts (encargo 5.5): el texto plano de una página (para buscar
 * un literal) y el invariante de que la extracción no pierde caracteres. La
 * extracción entera (lineasDeHtml) la juzga boe.spec.ts a través del BOE.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { conservaElTexto, textoPlano } from './html.ts';

describe('textoPlano', () => {
  test('sin etiquetas, con las entidades decodificadas y el espacio colapsado (para buscar un literal en una página)', () => {
    assert.equal(textoPlano('<p>Resoluci&oacute;n de\n  <b>27 de junio</b>&nbsp;de 2024</p>'), 'Resolución de 27 de junio de 2024');
  });
});

describe('conservaElTexto', () => {
  test('mismos caracteres salvo espacios y barras: sí; uno de menos: no', () => {
    assert.equal(conservaElTexto('<p>Uno dos</p><p>tres</p>', 'Uno dos\ntres'), true);
    assert.equal(conservaElTexto('<tr><td>A</td><td>1</td></tr>', '| A | 1 |'), true);
    assert.equal(conservaElTexto('<p>Uno dos</p><p>tres</p>', 'Uno dos'), false);
  });
});
