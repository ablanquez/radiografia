/**
 * Jueces de muchocine.ts (encargo 5.5, género «opinion»): una crítica de
 * MuchoCine en ISO-8859-1, con su nota y su cuerpo, sin el resumen. Los bytes
 * y el texto esperado, a mano.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { leerCritica } from './muchocine.ts';

const latin1 = (s: string) => Buffer.from(s, 'latin1');

describe('leerCritica', () => {
  test('en ISO-8859-1: la nota, el máximo y el cuerpo con sus entidades; el resumen, no', () => {
    const xml = latin1('<review author="A" title="May" rank="4" maxRank="5" source="muchocine">\n\t<summary>Un resumen que no entra.</summary>\n\t<body>&ldquo;May&rdquo; es una pel\xedcula peque\xf1a&hellip; y buena.</body>\n</review>');
    assert.deepEqual(leerCritica(xml), { rango: 4, maximo: 5, cuerpo: '“May” es una película pequeña… y buena.', desconocidas: [] });
  });

  test('lo que no es entidad ni etiqueta es texto del autor: se queda y se dice', () => {
    const xml = latin1('<review rank="2" maxRank="5"><summary>x</summary><body>Es Cohen&Cohen; y <Pero sigue.</body></review>');
    assert.deepEqual(leerCritica(xml), { rango: 2, maximo: 5, cuerpo: 'Es Cohen&Cohen; y <Pero sigue.', desconocidas: ['&Cohen;'] });
  });

  test('sin <body>: para', () => {
    assert.throws(() => leerCritica(latin1('<review rank="1" maxRank="5"><summary>x</summary></review>')), /sin <body>/);
  });
});
