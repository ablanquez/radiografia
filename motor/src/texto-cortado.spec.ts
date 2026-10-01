/**
 * Juez (6) del encargo 6.1: los 287 textos humanos de validación de
 * «general» (los ids de data/calibracion/general.manifiesto.json), cortados a
 * 76 columnas con el cortador de abajo, tienen las MISMAS frases de prosa y la
 * misma frases-por-100-palabras que sin cortar. El número de párrafos se
 * cuenta y no se juzga (la excepción web lo cambia por diseño).
 *
 * [PROPIO, parada 1 del 6.1, firmado por Antonio] El encargo pedía el 95 %;
 * coinciden 269 de 287 (93,7 %). Se acepta con las 18 diferencias listadas
 * abajo, cada una con su causa, y el juez exige «≥ 93 % y la lista de causas
 * no crece»: un documento distinto que no esté en la lista lo para. La
 * excepción web no se amplía ni se recorta.
 *
 * Los textos están en la caché de los corpus (motor/corpus/general/textos/),
 * que no se versiona: sin ella, el juez se salta y lo dice. Cada texto se
 * comprueba contra la huella sha256 de su manifiesto.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test (`skip`, `t.diagnostic`).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { analizarTexto } from './texto.ts';
import { frasesDeProsa } from './metricas/base.ts';
import { frasesPor100Palabras } from './metricas/frases-por-100-palabras.ts';

const CACHE = new URL('../corpus/general/textos/', import.meta.url);
const MANIFIESTO = new URL('../../data/calibracion/general.manifiesto.json', import.meta.url);

const ITEMS = 'ítem numerado cortado: dentro, una línea acaba en punto y la siguiente empieza en mayúscula; la excepción web pasa a prosa el resto del ítem';
const TABLA = 'fila de tabla cortada: los trozos con menos de dos «|» dejan de ser tabla y pasan a prosa';
const RAYA = '«- -» como raya (AnCora): al cortar, una línea empieza por «- », que es viñeta (CommonMark § 5.2)';
const EXCLAMACION = 'excepción web: un salto tras signo de cierre seguido de «¡» parte donde Intl.Segmenter no partía';

/** Las 18 diferencias aceptadas en la parada 1 del 6.1, con su causa. */
const DIFERENCIAS: Readonly<Record<string, string>> = {
  'BOE-A-2006-7899': ITEMS,
  'BOE-A-2012-1684': ITEMS,
  'BOE-A-2012-3753': ITEMS,
  'BOE-A-2012-3754': ITEMS,
  'BOE-A-2016-4444': ITEMS,
  'BOE-B-2012-3687': ITEMS,
  'BOE-B-2010-33291': ITEMS,
  'BOE-A-2000-15061': TABLA,
  'BOE-A-2001-18185': TABLA,
  'BOE-A-2011-16289': TABLA,
  'BOE-A-2012-1732': TABLA,
  'BOE-A-2012-7952': TABLA,
  'BOE-B-2010-33307': TABLA,
  'CESS-CAST-P-20000202-21_b': RAYA,
  'CESS-CAST-P-20000903-55': RAYA,
  'CESS-CAST-P-20010202-39': RAYA,
  'CESS-CAST-P-20020103-122': RAYA,
  'pg55058-009': EXCLAMACION,
};

/** Corta cada línea del texto en líneas de 76 columnas como mucho, por los espacios (un correo, un PDF copiado). */
function cortar(texto: string, ancho = 76): string {
  return texto
    .split('\n')
    .map((linea) => {
      const salida: string[] = [];
      let actual = '';
      for (const palabra of linea.split(' ')) {
        if (actual !== '' && actual.length + 1 + palabra.length > ancho) {
          salida.push(actual);
          actual = palabra;
        } else actual = actual === '' ? palabra : `${actual} ${palabra}`;
      }
      salida.push(actual);
      return salida.join('\n');
    })
    .join('\n');
}

describe('el cortador del juez', () => {
  test('corta por los espacios sin pasar de 76 columnas, y al unir las líneas devuelve el texto', () => {
    const linea = 'palabra '.repeat(40).trim();
    const cortado = cortar(`${linea}\nOtra línea corta.`);
    for (const l of cortado.split('\n')) assert.ok(l.length <= 76, l);
    assert.equal(cortado.split('\n').length, 6);
    assert.equal(cortado.replaceAll('\n', ' '), `${linea} Otra línea corta.`);
  });
});

describe('(6) los 287 textos de validación de «general», cortados a 76 columnas', () => {
  const hayCache = existsSync(CACHE);
  test(
    'las mismas frases de prosa y la misma frases-por-100-palabras que sin cortar en el 93 % o más, y ninguna diferencia fuera de la lista',
    { skip: hayCache ? false : 'sin la caché de los corpus (motor/corpus/general/textos/), que no se versiona' },
    (t) => {
      const manifiesto = JSON.parse(readFileSync(MANIFIESTO, 'utf8')) as { documentos: { id: string; sha256: string; tramo: string | null; reparto?: string }[] };
      const documentos = manifiesto.documentos.filter((d) => d.reparto === 'validacion' && d.tramo !== null);
      assert.equal(documentos.length, 287);
      const distintos: { id: string; detalle: string }[] = [];
      let parrafosSin = 0;
      let parrafosCon = 0;
      for (const d of documentos) {
        const texto = readFileSync(new URL(`${d.id}.txt`, CACHE), 'utf8');
        assert.equal(createHash('sha256').update(texto, 'utf8').digest('hex'), d.sha256, `${d.id}: el texto en caché no es el del manifiesto`);
        const sin = analizarTexto(texto);
        const con = analizarTexto(cortar(texto));
        parrafosSin += sin.parrafos.length;
        parrafosCon += con.parrafos.length;
        const [fs, fc] = [frasesDeProsa(sin).length, frasesDeProsa(con).length];
        const [ms, mc] = [frasesPor100Palabras(sin), frasesPor100Palabras(con)];
        if (fs !== fc || ms !== mc) distintos.push({ id: d.id, detalle: `frases ${fs} → ${fc}; frases por 100 palabras ${ms?.toFixed(3)} → ${mc?.toFixed(3)}` });
      }
      t.diagnostic(`párrafos: ${parrafosSin} sin cortar, ${parrafosCon} cortados`);
      t.diagnostic(`distintos: ${distintos.length} de ${documentos.length}`);
      for (const { id, detalle } of distintos) t.diagnostic(`${id}: ${detalle} — ${DIFERENCIAS[id] ?? 'SIN CAUSA DECLARADA'}`);
      const iguales = new Set(distintos.map((x) => x.id));
      for (const id of Object.keys(DIFERENCIAS)) if (!iguales.has(id)) t.diagnostic(`${id}: declarado y ya coincide`);
      assert.deepEqual(
        distintos.map((x) => x.id).filter((id) => !Object.hasOwn(DIFERENCIAS, id)),
        [],
        'documentos distintos que no están en la lista de causas',
      );
      const coinciden = documentos.length - distintos.length;
      assert.ok(coinciden / documentos.length >= 0.93, `coinciden ${coinciden} de ${documentos.length}: menos del 93 %`);
    },
  );
});
