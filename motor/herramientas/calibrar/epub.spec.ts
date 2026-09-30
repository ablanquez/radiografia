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
import { capitulosDeEpub, esDivisionNumerada, esParatexto, sinImagenes } from './epub.ts';
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
      {
        orden: 4,
        etiqueta: 'CAPÍTULO II',
        texto: 'El segundo capítulo empieza aquí.\nSEÑOR mío, dijo el ama.\nAunque llovía, salió.\nLLEGÓ el otoño.',
        problemas: [],
      },
    ]);
  });

  test('sin el texto alternativo de las imágenes ni sus pies, salvo la letra de una capitular', () => {
    const casos: [string, string][] = [
      ['<div class="figcenter"><span title="Cabecera" id="img_images_cabecera.png">Cabecera</span></div>', '<div class="figcenter"></div>'],
      ['<p><span style="float:left"><span id="img_images_000s.png">S</span></span>EÑOR mío</p>', '<p><span style="float:left">S</span>EÑOR mío</p>'],
      ['<p><span id="img_images_000y.png">¡Y</span>A llegan!</p>', '<p>¡YA llegan!</p>'],
      ['<p><span id="img_images_drop-a.png">A</span>Aunque llovía</p>', '<p>Aunque llovía</p>'],
      ['<p><span id="img_images_drop-l.png">L</span>LEGÓ el otoño</p>', '<p>LLEGÓ el otoño</p>'],
      ['<div class="drop-cap"> <span id="img_images_drop-a.jpg">A ilustrada</span> </div><p>Así Dios</p>', '<div class="drop-cap">  </div><p>Así Dios</p>'],
      ['<div><span id="img_images_il1.png">Salió.</span><br/><span class="caption">Salió.</span></div>', '<div><br/> </div>'],
      ['<div><a id="x"><span id="img_images_d1.png">...y se fue.</span> </a><br/> ...y se fue.</div>', '<div><a id="x"> </a><br/> </div>'],
      ['<div><span id="img_images_d2.png">Un pie</span><br/>Otra cosa distinta.</div>', '<div><br/>Otra cosa distinta.</div>'],
    ];
    for (const [html, esperado] of casos) assert.equal(sinImagenes(html), esperado, html);
  });

  test('fuera, con su motivo: la portada, el prólogo, el teatro, la tabla, las notas, los anuncios finales y la licencia de Gutenberg', () => {
    assert.deepEqual(capitulosDeEpub(PRUEBA).fuera, [
      { orden: 1, etiqueta: 'EL LIBRO DE PRUEBA', motivo: 'portada: el título del libro' },
      { orden: 2, etiqueta: 'PRÓLOGO', motivo: 'paratexto' },
      { orden: 5, etiqueta: 'ESCENA PRIMERA', motivo: 'teatro' },
      { orden: 6, etiqueta: 'T A B L A', motivo: 'paratexto' },
      { orden: 7, etiqueta: 'FOOTNOTES:', motivo: 'paratexto' },
      { orden: 8, etiqueta: 'OBRAS DEL MISMO AUTOR', motivo: 'final: anuncios del editor u obras del autor' },
      { orden: 9, etiqueta: 'EL OTRO LIBRO', motivo: 'final: anuncios del editor u obras del autor' },
      { orden: 10, etiqueta: 'THE FULL PROJECT GUTENBERG™ LICENSE', motivo: 'licencia de Project Gutenberg' },
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
    for (const e of ['CAPÍTULO PRIMERO', 'Capitulo 3', 'TRANCO II', 'PARTE SEGUNDA', 'XII', 'I. La llegada', '3.', '14', '120', 'V', 'X.', 'IX', '-I-', '—XII—']) {
      assert.equal(esDivisionNumerada(e), true, e);
    }
  });
  test('títulos, aunque empiecen por letras de numeral romano: no', () => {
    for (const e of ['MI VIDA', 'LA NOCHE', 'EL DIABLO COJUELO', 'Carta de recomendación', 'Soneto', 'i. nota', 'D. ARMANDO PALACIO VALDÉS', 'M. Bergeret en París', '1872']) {
      assert.equal(esDivisionNumerada(e), false, e);
    }
  });
});

describe('esParatexto', () => {
  test('prólogos, dedicatorias, notas, índices y glosarios: sí', () => {
    for (const e of ['PRÓLOGO', 'Prólogo del autor', 'DEDICATORIA DE ESTA EDICIÓN', 'NOTAS', 'FOOTNOTES:', 'ÍNDICE', 'Indice', 'Vocabulario', 'INTRODUCCIÓN', 'Advertencia', 'Al lector', 'ACLARACIÓN', 'Prefacio', 'ABBREVIATIONS', 'VOCABULARY', 'NOTES', 'EXERCISES', 'TASA', 'TABLA', 'D E D I C A T O R I A', 'Codificación', 'Nota del transcriptor', 'EDICIONES ESPAÑOLAS PUBLICADAS', 'PRIVILEGIO', 'APROBACIÓN', 'ADVERTENCIAS', 'PROEMIO', 'OBRAS CITADAS', 'Significado de algunas palabras']) {
      assert.equal(esParatexto(e), true, e);
    }
  });
  test('capítulos y títulos: no', () => {
    for (const e of ['CAPÍTULO PRIMERO', 'TRANCO II', 'I', 'La noche de San Juan', 'EL DIABLO COJUELO', 'Notable suceso', 'Tasadores', 'Tablas de la ley']) {
      assert.equal(esParatexto(e), false, e);
    }
  });
});
