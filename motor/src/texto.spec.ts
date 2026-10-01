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
import { evaluarLongitud } from './umbral.ts';

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

  test('«+» seguido de espacio es viñeta (CommonMark § 5.2)', () => {
    // Línea en blanco desde el 6.1: sin ella, «Y esto es prosa.» es continuación del ítem (CommonMark § 5.2).
    const t = analizarTexto(['+ una viñeta con más', 'Y esto es prosa.'].join('\n\n'));
    assert.deepEqual(
      t.parrafos.map((p) => [p.texto, p.prosa, p.motivo]),
      [
        ['+ una viñeta con más', false, 'viñeta'],
        ['Y esto es prosa.', true, null],
      ],
    );
  });

  test('«~~~» abre y cierra código como «```», y cada valla solo la cierra una de su tipo (CommonMark § 4.5)', () => {
    const t = analizarTexto(['~~~', 'dentro de tildes', '```', 'sigue dentro', '~~~', 'Ya fuera: prosa.'].join('\n'));
    assert.deepEqual(
      t.parrafos.map((p) => [p.texto, p.prosa, p.motivo]),
      [
        ['~~~', false, 'código'],
        ['dentro de tildes', false, 'código'],
        ['```', false, 'código'],
        ['sigue dentro', false, 'código'],
        ['~~~', false, 'código'],
        ['Ya fuera: prosa.', true, null],
      ],
    );
  });

  test('lo que parece marca pero no lo es sigue siendo prosa («1.000 personas», «*Nota*», «#etiqueta»)', () => {
    // Líneas en blanco desde el 6.1: con un solo salto, las tres son un párrafo (tras «.», un salto seguido de «*» o «#» es espacio).
    const t = analizarTexto(['1.000 personas vinieron.', '*Nota*: esto es prosa.', '#etiqueta pegada, sin espacio.'].join('\n\n'));
    assert.deepEqual(
      t.parrafos.map((p) => p.prosa),
      [true, true, true],
    );
  });
});

/**
 * Encargo 6.1: párrafos según CommonMark (§4.8, §6.8 y §5.2), con la
 * excepción web [PROPIO, firmada el 01/10]. Esperados escritos antes de
 * ejecutar el texto.ts nuevo; con el viejo («párrafo = cada línea») dan rojo.
 */
describe('analizarTexto: párrafos según CommonMark (encargo 6.1)', () => {
  /** El texto de cada párrafo, sin los saltos (para comparar con la versión sin cortar). */
  const enUnaLinea = (s: string) => s.replace(/\r?\n/g, ' ');
  const SIN_CORTAR =
    'El tren de las ocho salió ayer de Atocha con cuarenta minutos de retraso, y los viajeros que esperaban en el andén tuvieron que buscar otra forma de llegar a Valladolid. La avería afectó a una catenaria cerca de Chamartín.';
  // El mismo párrafo cortado a 76 columnas: ninguna línea acaba en signo de cierre.
  const CORTADO =
    'El tren de las ocho salió ayer de Atocha con cuarenta minutos de retraso, y\nlos viajeros que esperaban en el andén tuvieron que buscar otra forma de\nllegar a Valladolid. La avería afectó a una catenaria cerca de Chamartín.';

  test('(1) un párrafo de tres líneas cortadas a 76 columnas es UN párrafo, con sus dos frases', () => {
    const t = analizarTexto(CORTADO);
    assert.equal(t.parrafos.length, 1);
    assert.equal(t.parrafos[0]!.texto, CORTADO);
    assert.deepEqual(frases(t).map(enUnaLinea), frases(analizarTexto(SIN_CORTAR)));
    assert.deepEqual(palabras(t), palabras(analizarTexto(SIN_CORTAR)));
    desplazamientosExactos(t);
  });

  test('(2) dos párrafos de dos líneas, separados por una línea en blanco, son DOS', () => {
    const t = analizarTexto('El primer párrafo empieza aquí y\nsigue en esta línea.\n\nEl segundo empieza\nen otra y acaba aquí.');
    assert.deepEqual(
      t.parrafos.map((p) => p.texto),
      ['El primer párrafo empieza aquí y\nsigue en esta línea.', 'El segundo empieza\nen otra y acaba aquí.'],
    );
    desplazamientosExactos(t);
  });

  test('(3) la excepción web: tras signo de cierre y con mayúscula, párrafo nuevo; si no, el salto es espacio', () => {
    assert.deepEqual(
      analizarTexto('La primera parte terminó bien.\nLa segunda parte empezó tarde.').parrafos.map((p) => p.texto),
      ['La primera parte terminó bien.', 'La segunda parte empezó tarde.'],
    );
    assert.deepEqual(
      analizarTexto('La primera parte terminó\nbien la cosa.').parrafos.map((p) => p.texto),
      ['La primera parte terminó\nbien la cosa.'],
    );
  });

  test('(3) la excepción web, signo a signo: cierres . ! ? … » " ” y aperturas mayúscula ¿ ¡ — « " “', () => {
    for (const cierre of ['.', '!', '?', '…', '»', '"', '”']) {
      assert.equal(analizarTexto(`Acabó así${cierre}\nOtra frase.`).parrafos.length, 2, `cierre «${cierre}»`);
    }
    for (const apertura of ['¿Vienes?', '¡Ya!', '—Sí, dijo.', '«Bien», dijo.', '"Bien", dijo.', '“Bien”, dijo.']) {
      assert.equal(analizarTexto(`Acabó así.\n${apertura}`).parrafos.length, 2, `apertura «${apertura}»`);
    }
    // Sin signo de cierre, o con minúscula o cifra detrás: el salto es espacio.
    assert.equal(analizarTexto('Capítulo primero\nEl tren salió tarde.').parrafos.length, 1, 'título sin punto');
    assert.equal(analizarTexto('Acabó así.\nluego siguió.').parrafos.length, 1, 'minúscula');
    assert.equal(analizarTexto('Llegaron a las.\n10 de la noche.').parrafos.length, 1, 'cifra');
    assert.equal(analizarTexto('Dijo esto:\n—Sí.').parrafos.length, 1, 'dos puntos');
  });

  test('(4) una viñeta de dos líneas es UN ítem de no-prosa con la segunda línea dentro, y esa línea no cuenta como prosa', () => {
    const t = analizarTexto('- primera línea de la viñeta, que sigue\nen la segunda línea sin marca\n\nEste es el párrafo de prosa.');
    assert.deepEqual(
      t.parrafos.map((p) => [p.texto, p.prosa, p.motivo]),
      [
        ['- primera línea de la viñeta, que sigue\nen la segunda línea sin marca', false, 'viñeta'],
        ['Este es el párrafo de prosa.', true, null],
      ],
    );
    assert.equal(evaluarLongitud(t).palabrasProsa, 6);
    desplazamientosExactos(t);
  });

  test('(4) la sangría (CommonMark § 5.2, parada 1 del 6.1): una línea sangrada tras un ítem sigue en el ítem aunque la anterior acabe en punto', () => {
    const t = analizarTexto('- primera línea del ítem, que acaba aquí.\n  Segunda línea, sangrada: sigue en el ítem.\nY esta, sin sangría, es un párrafo de prosa.');
    assert.deepEqual(
      t.parrafos.map((p) => [p.texto, p.prosa, p.motivo]),
      [
        ['- primera línea del ítem, que acaba aquí.\n  Segunda línea, sangrada: sigue en el ítem.', false, 'viñeta'],
        ['Y esta, sin sangría, es un párrafo de prosa.', true, null],
      ],
    );
    desplazamientosExactos(t);
  });

  test('(4) detrás de un ítem, la excepción web también abre párrafo (firmada en la parada 1 del 6.1)', () => {
    const t = analizarTexto('- el último punto de la lista.\nEl párrafo siguiente, pegado de una web con un solo salto.');
    assert.deepEqual(
      t.parrafos.map((p) => [p.prosa, p.motivo]),
      [
        [false, 'viñeta'],
        [true, null],
      ],
    );
  });

  test('(4) regla del 1 (CommonMark § 5.2, excepción 1): una marca ordenada que no es 1 no corta un párrafo; el 1 y las viñetas, sí', () => {
    assert.deepEqual(
      analizarTexto('El plazo se amplió en el año\n2010. Después volvió a cambiar.').parrafos.map((p) => p.motivo),
      [null],
    );
    assert.deepEqual(
      analizarTexto('Se convoca el concurso siguiente\n1. Entidad adjudicadora: el ministerio.').parrafos.map((p) => p.motivo),
      [null, 'viñeta'],
    );
    assert.deepEqual(
      analizarTexto('Se convoca el concurso siguiente\n- con una viñeta.').parrafos.map((p) => p.motivo),
      [null, 'viñeta'],
    );
    assert.deepEqual(
      analizarTexto('1. Primero.\n2. Segundo.').parrafos.map((p) => p.motivo),
      ['viñeta', 'viñeta'],
    );
  });

  test('regla horizontal (CommonMark § 4.1): corta el párrafo y es su propio bloque, con la clase del 4.1', () => {
    assert.deepEqual(
      analizarTexto('Primera parte.\n---\nsegunda parte.').parrafos.map((p) => [p.texto, p.motivo]),
      [
        ['Primera parte.', null],
        ['---', null],
        ['segunda parte.', null],
      ],
    );
    assert.deepEqual(
      analizarTexto('Texto\n* * *\nmás texto').parrafos.map((p) => [p.texto, p.motivo]),
      [
        ['Texto', null],
        ['* * *', 'viñeta'],
        ['más texto', null],
      ],
    );
  });

  test('(5) cortado con «\\r\\n», las mismas frases que con «\\n», y desplazamientos exactos', () => {
    const conCRLF = CORTADO.replaceAll('\n', '\r\n');
    const t = analizarTexto(conCRLF);
    assert.equal(t.parrafos.length, 1);
    assert.deepEqual(
      frases(t).map((f) => f.replaceAll('\r\n', '\n')),
      frases(analizarTexto(CORTADO)),
    );
    assert.equal(frases(t).length, 2);
    desplazamientosExactos(t);
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
