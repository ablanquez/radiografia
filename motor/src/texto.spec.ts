/**
 * Los jueces del texto segmentado (encargo 4.1): párrafos, frases y palabras
 * con desplazamientos exactos sobre el original, y prosa / no-prosa.
 *
 * Los ESPERADOS de los casos límite se escribieron ANTES de ejecutar el
 * segmentador sobre ellos (encargo 4.1, método). Lo que Intl.Segmenter haga
 * distinto no se parchea: se documenta como hallazgo (en el propio caso).
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto, type Texto } from './texto.ts';

/** Las frases de todos los párrafos, como texto. */
const frases = (t: Texto): string[] => t.parrafos.flatMap((p) => p.frases.map((f) => f.texto));
/** Las palabras de cada frase, como texto. */
const palabras = (t: Texto): string[][] => t.parrafos.flatMap((p) => p.frases.map((f) => f.palabras.map((w) => w.texto)));

/** Todo desplazamiento apunta al original: original.slice(inicio, fin) === texto. */
function desplazamientosExactos(t: Texto): void {
  for (const p of t.parrafos) {
    assert.equal(t.original.slice(p.inicio, p.fin), p.texto, `párrafo [${p.inicio}, ${p.fin})`);
    for (const f of p.frases) {
      assert.equal(t.original.slice(f.inicio, f.fin), f.texto, `frase [${f.inicio}, ${f.fin})`);
      assert.ok(f.inicio >= p.inicio && f.fin <= p.fin, `la frase «${f.texto}» se sale de su párrafo`);
      for (const w of f.palabras) {
        assert.equal(t.original.slice(w.inicio, w.fin), w.texto, `palabra [${w.inicio}, ${w.fin})`);
        assert.ok(w.inicio >= f.inicio && w.fin <= f.fin, `la palabra «${w.texto}» se sale de su frase`);
      }
    }
  }
}

describe('Intl.Segmenter en este Node', () => {
  test('soporta el locale «es» (si no, el encargo para)', () => {
    assert.deepEqual(Intl.Segmenter.supportedLocalesOf(['es']), ['es']);
  });
});

describe('analizarTexto: casos límite (esperados escritos antes de ejecutar)', () => {
  // HALLAZGO (30/09, Node 24.19.0): Intl.Segmenter «es» parte tras «Sr.» → ['Sr.', 'Pérez llegó.'].
  // No se parchea (encargo 4.1); los desplazamientos siguen exactos. Afecta a contar frases
  // y a lo que es «inicio de frase» después de una abreviatura.
  test('«Sr. Pérez llegó.» — no parte en «Sr.»', { todo: 'Intl.Segmenter «es» parte tras «Sr.»: da [«Sr.», «Pérez llegó.»]' }, () => {
    const t = analizarTexto('Sr. Pérez llegó.');
    assert.deepEqual(frases(t), ['Sr. Pérez llegó.']);
    assert.deepEqual(palabras(t), [['Sr', 'Pérez', 'llegó']]);
  });

  // Documentado (30/09): la predicción escrita antes de ejecutar se cumplió, parte en dos.
  test('«etc. Y siguió» — se documenta lo que haga (predicción: parte en dos)', () => {
    const t = analizarTexto('etc. Y siguió');
    assert.deepEqual(frases(t), ['etc.', 'Y siguió']);
  });

  test('«¿Vienes? Sí.» — dos frases', () => {
    const t = analizarTexto('¿Vienes? Sí.');
    assert.deepEqual(frases(t), ['¿Vienes?', 'Sí.']);
    assert.deepEqual(palabras(t), [['Vienes'], ['Sí']]);
  });

  test('«Dijo: «no». Y se fue.» — dos frases, las comillas no cortan', () => {
    const t = analizarTexto('Dijo: «no». Y se fue.');
    assert.deepEqual(frases(t), ['Dijo: «no».', 'Y se fue.']);
    assert.deepEqual(palabras(t), [['Dijo', 'no'], ['Y', 'se', 'fue']]);
  });

  test('«Espera… ya voy.» — los puntos suspensivos seguidos de minúscula no cortan', () => {
    const t = analizarTexto('Espera… ya voy.');
    assert.deepEqual(frases(t), ['Espera… ya voy.']);
    assert.deepEqual(palabras(t), [['Espera', 'ya', 'voy']]);
  });

  test('«3,5 %» y «1.000» son una palabra cada uno', () => {
    const t = analizarTexto('Subió un 3,5 % en 1.000 casos.');
    assert.deepEqual(palabras(t), [['Subió', 'un', '3,5', 'en', '1.000', 'casos']]);
  });

  // HALLAZGO (30/09, Node 24.19.0): Intl.Segmenter «word» separa por el guion → ['coche', 'cama'].
  // No se parchea (encargo 4.1). Afecta al conteo de palabras (una palabra de más por compuesto).
  test('«coche-cama» es una palabra', { todo: 'Intl.Segmenter «word» parte por el guion: da [«coche», «cama»]' }, () => {
    const t = analizarTexto('Viajó en coche-cama.');
    assert.deepEqual(palabras(t), [['Viajó', 'en', 'coche-cama']]);
  });

  test('con «\\r\\n», los desplazamientos apuntan al original', () => {
    const original = 'Primera frase.\r\nSegunda línea, aquí.\r\n';
    const t = analizarTexto(original);
    assert.deepEqual(
      t.parrafos.map((p) => [p.texto, p.inicio, p.fin]),
      [
        ['Primera frase.', 0, 14],
        ['Segunda línea, aquí.', 16, 36],
      ],
    );
    assert.deepEqual(
      t.parrafos[1]!.frases[0]!.palabras.map((w) => [w.texto, w.inicio, w.fin]),
      [
        ['Segunda', 16, 23],
        ['línea', 24, 29],
        ['aquí', 31, 35],
      ],
    );
  });

  test('viñetas, tabla, código y encabezado no son prosa; solo cuenta el párrafo de prosa', () => {
    const t = analizarTexto(
      [
        '# Título del informe',
        '- primera viñeta con varias palabras',
        '2) otra viñeta numerada',
        '• una más',
        '| columna | otra |',
        '```',
        'const x = 1;',
        '```',
        'Este es el único párrafo de prosa del texto.',
      ].join('\n'),
    );
    assert.deepEqual(
      t.parrafos.map((p) => [p.texto, p.prosa, p.motivo]),
      [
        ['# Título del informe', false, 'encabezado'],
        ['- primera viñeta con varias palabras', false, 'viñeta'],
        ['2) otra viñeta numerada', false, 'viñeta'],
        ['• una más', false, 'viñeta'],
        ['| columna | otra |', false, 'tabla'],
        ['```', false, 'código'],
        ['const x = 1;', false, 'código'],
        ['```', false, 'código'],
        ['Este es el único párrafo de prosa del texto.', true, null],
      ],
    );
  });

  test('lo que parece marca pero no lo es sigue siendo prosa («1.000 personas», «*Nota*», «#etiqueta»)', () => {
    const t = analizarTexto(['1.000 personas vinieron.', '*Nota*: esto es prosa.', '#etiqueta pegada, sin espacio.'].join('\n'));
    assert.deepEqual(
      t.parrafos.map((p) => p.prosa),
      [true, true, true],
    );
  });
});

describe('analizarTexto: desplazamientos exactos en todos los casos', () => {
  test('original.slice(inicio, fin) es el texto de cada párrafo, frase y palabra', () => {
    for (const entrada of [
      'Sr. Pérez llegó.',
      'etc. Y siguió',
      '¿Vienes? Sí.',
      'Dijo: «no». Y se fue.',
      'Espera… ya voy.',
      'Subió un 3,5 % en 1.000 casos.',
      'Viajó en coche-cama.',
      'Primera frase.\r\nSegunda línea, aquí.\r\n',
      '  Con sangría.  \n\n\nY líneas vacías entre medias.\r\n',
    ]) {
      desplazamientosExactos(analizarTexto(entrada));
    }
  });
});
