/**
 * Jueces de gutenberg.ts (encargo 5.5, «narrativa-clasica»): el catálogo CSV
 * de Project Gutenberg, las personas de cada libro con su año de muerte, el
 * filtro de libros y los enlaces del harvest. Los autores de los jueces son
 * filas reales del catálogo (pg_catalog.csv, descargado el 30/09/2026); lo
 * demás, sintético. Cifras a mano.
 * [DOC] https://www.rfc-editor.org/rfc/rfc4180 § 2 — campos entre comillas
 *    con comas, saltos de línea y comillas dobladas («""»).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { enlacesDeHarvest, filtrarLibro, lenguasPropias, leerCsv, librosDelCatalogo, persona } from './gutenberg.ts';

describe('leerCsv (RFC 4180)', () => {
  test('comas, saltos de línea y comillas dentro de un campo entre comillas', () => {
    assert.deepEqual(leerCsv('a,"b, c","d ""e"""\r\n1,"x\ny",z\n'), [
      ['a', 'b, c', 'd "e"'],
      ['1', 'x\ny', 'z'],
    ]);
  });
});

describe('persona: nombre, año de muerte y papel', () => {
  const casos: [string, { nombre: string; muerte: number | null; papel: string | null }][] = [
    ['Cervantes Saavedra, Miguel de, 1547-1616', { nombre: 'Cervantes Saavedra, Miguel de', muerte: 1616, papel: null }],
    ['Reina, Casiodoro de, 1520?-1594 [Translator]', { nombre: 'Reina, Casiodoro de', muerte: 1594, papel: 'Translator' }],
    ['Ruiz, Juan, 1283?-1350?', { nombre: 'Ruiz, Juan', muerte: 1350, papel: null }],
    ['Rojas, Fernando de, -1541', { nombre: 'Rojas, Fernando de', muerte: 1541, papel: null }],
    ['Aesop, 621? BCE-565? BCE', { nombre: 'Aesop', muerte: -565, papel: null }],
    ['Ovid, 44 BCE-18?', { nombre: 'Ovid', muerte: 18, papel: null }],
    ['Goyri, María, 1873-1955? [Compiler]', { nombre: 'Goyri, María', muerte: 1955, papel: 'Compiler' }],
    ['Stendal, Russell, 1955-', { nombre: 'Stendal, Russell', muerte: null, papel: null }],
    ['Núñez Cabeza de Vaca, Alvar, active 16th century', { nombre: 'Núñez Cabeza de Vaca, Alvar', muerte: null, papel: null }],
    ['Anonymous', { nombre: 'Anonymous', muerte: null, papel: null }],
  ];
  for (const [entrada, esperado] of casos) {
    test(entrada, () => assert.deepEqual(persona(entrada), esperado));
  }
});

const CABECERA = 'Text#,Type,Issued,Title,Language,Authors,Subjects,LoCC,Bookshelves';
const fila = (id: number, lengua: string, autores: string, materias: string, tipo = 'Text') => `${id},${tipo},2004-05-01,"Título ${id}",${lengua},"${autores}","${materias}",PQ,`;

describe('librosDelCatalogo y filtrarLibro', () => {
  const libros = librosDelCatalogo(
    [
      CABECERA,
      fila(1, 'es', 'Pérez Galdós, Benito, 1843-1920', 'Historical fiction; Spain -- History'),
      fila(2, 'es', 'Pérez Galdós, Benito, 1843-1920', 'Spain -- History'),
      fila(3, 'es; en', 'Pérez Galdós, Benito, 1843-1920', 'Spanish fiction'),
      fila(4, 'es', 'Voltaire, 1694-1778; Reina, Casiodoro de, 1520?-1594 [Translator]', 'Satire -- Fiction'),
      fila(5, 'es', 'Voltaire, 1694-1778', 'French fiction -- Translations into Spanish'),
      fila(6, 'es', 'Voltaire, 1694-1778', 'Manners and customs -- Fiction; French literature -- 18th century'),
      fila(7, 'es', 'Blasco Ibáñez, Vicente, 1867-1928; Asensio, José, 1759?- [Illustrator]', 'Spanish fiction'),
      fila(8, 'es', 'Goyri, María, 1873-1955? [Compiler]', 'Spanish fiction'),
      fila(9, 'es', 'Isaacs, Jorge, 1837-1895', 'Colombian fiction; Spanish American fiction; Latin American fiction'),
      fila(10, 'es', 'Pérez Galdós, Benito, 1843-1920', 'Spanish fiction', 'Sound'),
    ].join('\n'),
  );
  const motivo = (id: number) => filtrarLibro(libros.find((l) => l.id === id)!, 1945);

  test('dentro: español, texto, ficción, sin traductor, todos muertos hasta 1945 (también literatura hispanoamericana)', () => {
    assert.deepEqual(motivo(1), { dentro: true });
    assert.deepEqual(motivo(9), { dentro: true });
  });
  test('fuera, cada uno con su motivo', () => {
    assert.deepEqual(motivo(2), { fuera: 'sin «fiction» en Subjects' });
    assert.deepEqual(motivo(3), { fuera: 'no solo en español (es; en)' });
    assert.deepEqual(motivo(4), { fuera: 'con traductor' });
    assert.deepEqual(motivo(5), { fuera: 'traducción probable por Subjects' });
    assert.deepEqual(motivo(6), { fuera: 'traducción probable por Subjects' });
    assert.deepEqual(motivo(7), { fuera: 'alguien sin año de muerte en el catálogo' });
    assert.deepEqual(motivo(8), { fuera: 'murió después de 1945' });
    assert.deepEqual(motivo(10), { fuera: 'no es Text (Sound)' });
  });
});

describe('lenguasPropias y el filtro por autor', () => {
  const libros = librosDelCatalogo(
    [
      CABECERA,
      fila(20, 'fr', 'Voltaire, 1694-1778', 'Satire'),
      fila(21, 'fr', 'Voltaire, 1694-1778', 'Philosophy'),
      fila(22, 'es', 'Voltaire, 1694-1778', 'Optimism -- Fiction'),
      fila(30, 'es', 'Blasco Ibáñez, Vicente, 1867-1928', 'Spanish fiction'),
      fila(31, 'es', 'Blasco Ibáñez, Vicente, 1867-1928', 'Spanish fiction'),
      fila(32, 'en', 'Blasco Ibáñez, Vicente, 1867-1928; Jordan, Frances Douglas, 1875- [Translator]', 'War stories'),
      fila(33, 'en', 'Blasco Ibáñez, Vicente, 1867-1928; Jordan, Frances Douglas, 1875- [Translator]', 'Spanish fiction -- Translations into English'),
      fila(34, 'en', 'Blasco Ibáñez, Vicente, 1867-1928; Jordan, Frances Douglas, 1875- [Translator]', 'Spain -- Fiction'),
      fila(40, 'es', 'Rizal, José, 1861-1896', 'Philippines -- Fiction'),
      fila(41, 'fr', 'Rizal, José, 1861-1896', 'Letters'),
    ].join('\n'),
  );
  const lenguas = lenguasPropias(libros);

  test('la lengua con más libros SIN traductor: Voltaire fr (2 a 1); Blasco Ibáñez es (los ingleses llevan traductor); a igualdad, es', () => {
    assert.equal(lenguas.get('Voltaire'), 'fr');
    assert.equal(lenguas.get('Blasco Ibáñez, Vicente'), 'es');
    assert.equal(lenguas.get('Rizal, José'), 'es');
  });

  test('un libro de un autor de otra lengua: fuera, con la cuenta', () => {
    assert.deepEqual(filtrarLibro(libros.find((l) => l.id === 22)!, 1945, lenguas), { fuera: 'autor que escribe sobre todo en otra lengua (Voltaire: fr)' });
    assert.deepEqual(filtrarLibro(libros.find((l) => l.id === 30)!, 1945, lenguas), { dentro: true });
    assert.deepEqual(filtrarLibro(libros.find((l) => l.id === 40)!, 1945, lenguas), { dentro: true });
  });
});

describe('enlacesDeHarvest', () => {
  test('los EPUB por número de libro y la página siguiente', () => {
    const html =
      '<p><a href="https://aleph.gutenberg.org/cache/epub/12457/pg12457.epub">x</a></p>' +
      '<p><a href="https://aleph.gutenberg.org/cache/epub/2000/pg2000.epub">y</a></p>' +
      '<p><a href="harvest?offset=91902034&amp;filetypes[]=epub.noimages&amp;langs[]=es">Next Page</a></p>';
    assert.deepEqual(enlacesDeHarvest(html), {
      epubs: [
        [12457, 'https://aleph.gutenberg.org/cache/epub/12457/pg12457.epub'],
        [2000, 'https://aleph.gutenberg.org/cache/epub/2000/pg2000.epub'],
      ],
      siguiente: 'harvest?offset=91902034&filetypes[]=epub.noimages&langs[]=es',
    });
  });
  test('la última página: sin siguiente', () => {
    assert.deepEqual(enlacesDeHarvest('<p>No more files.</p>'), { epubs: [], siguiente: null });
  });
});
