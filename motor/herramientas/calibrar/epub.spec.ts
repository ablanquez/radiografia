/**
 * Jueces de epub.ts (encargo 5.5, género «narrativa-clasica»): los capítulos
 * de un EPUB de Project Gutenberg por su índice (toc.ncx). El fixture
 * fixtures/prueba.epub lo escribió zipfile de Python con la estructura de los
 * EPUB de Ebookmaker vistos en pg12457 (cabecera #pg-header, capítulos en
 * <h2 id>, llamadas a nota a.fnanchor, números de página span.pagenum, pie
 * #pg-footer) y texto inventado. El texto esperado, a mano.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { capitulosDeEpub, esDivisionNumerada, esParatexto } from './epub.ts';
import { leerZip } from './zip.ts';

const PRUEBA = leerZip(readFileSync(new URL('./fixtures/prueba.epub', import.meta.url)));

describe('capitulosDeEpub', () => {
  test('un capítulo por entrada del índice, sin su título, sin llamadas a nota ni números de página', () => {
    const { capitulos } = capitulosDeEpub(PRUEBA);
    assert.deepEqual(capitulos, [
      {
        orden: 3,
        etiqueta: 'CAPÍTULO PRIMERO',
        texto: 'Era una noche de julio y llovía.\n—¿Quién va? —preguntó la vieja.\nNadie contestó.\nNi una voz.\nY amaneció al fin sobre el pueblo.',
        problemas: [],
      },
      { orden: 4, etiqueta: 'CAPÍTULO II', texto: 'El segundo capítulo empieza aquí.', problemas: [] },
    ]);
  });

  test('fuera, con su motivo: lo que va antes del primer capítulo numerado, el prólogo, las notas y la licencia de Gutenberg', () => {
    assert.deepEqual(capitulosDeEpub(PRUEBA).fuera, [
      { orden: 1, etiqueta: 'EL LIBRO DE PRUEBA', motivo: 'preliminar: antes de la primera división numerada' },
      { orden: 2, etiqueta: 'PRÓLOGO', motivo: 'paratexto' },
      { orden: 5, etiqueta: 'FOOTNOTES:', motivo: 'paratexto' },
      { orden: 6, etiqueta: 'THE FULL PROJECT GUTENBERG™ LICENSE', motivo: 'licencia de Project Gutenberg' },
    ]);
  });

  test('nada de la cabecera ni del pie de Gutenberg entra en ningún capítulo', () => {
    const todo = capitulosDeEpub(PRUEBA).capitulos.map((c) => c.texto).join('\n');
    assert.ok(!/Project Gutenberg|START OF|END OF|United States/i.test(todo), todo);
  });

  test('un EPUB sin toc.ncx: para', () => {
    const sinIndice = new Map(PRUEBA);
    sinIndice.delete('OEBPS/toc.ncx');
    assert.throws(() => capitulosDeEpub(sinIndice), /toc\.ncx/);
  });
});

describe('esDivisionNumerada', () => {
  test('capítulos, trancos, partes y números: sí', () => {
    for (const e of ['CAPÍTULO PRIMERO', 'Capitulo 3', 'TRANCO II', 'PARTE SEGUNDA', 'XII', 'I. La llegada', '3.', '14']) {
      assert.equal(esDivisionNumerada(e), true, e);
    }
  });
  test('títulos, aunque empiecen por letras de numeral romano: no', () => {
    for (const e of ['MI VIDA', 'LA NOCHE', 'EL DIABLO COJUELO', 'Carta de recomendación', 'Soneto', 'i. nota']) {
      assert.equal(esDivisionNumerada(e), false, e);
    }
  });
});

describe('esParatexto', () => {
  test('prólogos, dedicatorias, notas, índices y glosarios: sí', () => {
    for (const e of ['PRÓLOGO', 'Prólogo del autor', 'DEDICATORIA DE ESTA EDICIÓN', 'NOTAS', 'FOOTNOTES:', 'ÍNDICE', 'Indice', 'Vocabulario', 'INTRODUCCIÓN', 'Advertencia', 'Al lector']) {
      assert.equal(esParatexto(e), true, e);
    }
  });
  test('capítulos y títulos: no', () => {
    for (const e of ['CAPÍTULO PRIMERO', 'TRANCO II', 'I', 'La noche de San Juan', 'EL DIABLO COJUELO', 'Notable suceso']) {
      assert.equal(esParatexto(e), false, e);
    }
  });
});
