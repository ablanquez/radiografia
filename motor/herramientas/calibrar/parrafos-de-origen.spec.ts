/**
 * Juez del punto 3 de la parada 1 del 6.1: los textos de BOE y Gutenberg,
 * regenerados desde la caché con un párrafo por bloque (regenerar-textos.ts),
 * dan en el motor los párrafos de prosa del original.
 *
 *   · parrafosDeOrigen, con cifras a mano sobre un fragmento sintético.
 *   · La muestra: 20 documentos por corpus en el orden de huella
 *     (ordenDeMuestra con la semilla), del manifiesto del corpus en caché. En
 *     cada uno, los párrafos de prosa que da el motor sobre el texto en caché
 *     (sin los que son un encabezado del original) son los `declarados` del
 *     original. Lo literal (<p> no vacíos) se cuenta y se dice: en Gutenberg
 *     coincide; en el BOE, no, por los formularios <dl>, las tablas y los <p>
 *     numerados (parrafos-de-origen.ts). Sin la caché, se salta y lo dice.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { analizarTexto } from '../../src/texto.ts';
import { bloqueDelDocumento } from './boe.ts';
import { SEMILLA, huella, ordenDeMuestra } from './comun.ts';
import { capitulosDeEpub } from './epub.ts';
import type { Manifiesto } from './manifiesto.ts';
import { parrafosDeOrigen } from './parrafos-de-origen.ts';
import { leerZip } from './zip.ts';

describe('parrafosDeOrigen', () => {
  // <p>: uno · (vacío) · celda, otra (en tabla) · 1. Numerado. · Con salto. · FIN · Madrid. → 7 no vacíos.
  // Declarados: uno · a) Organismo: · X. · Con salto. · FIN · Madrid. → 6 (fuera la tabla, «1. Entidad:» y
  // «1. Numerado.», con marca, y el <dd> que solo abre otra <dl>). Encabezados: Título.
  const F =
    '<p>uno</p><p> </p><h5>Título</h5><dl><dt>1. Entidad:</dt><dd><dl><dt>a) Organismo:</dt><dd>X.</dd></dl></dd></dl>' +
    '<table><tr><td><p>celda</p></td><td><p>otra</p></td></tr></table><p>1. Numerado.</p><p>Con <br/> salto.</p><p>FIN</p><p>Madrid.</p>';

  test('los <p> no vacíos, los declarados y los encabezados, a mano', () => {
    assert.deepEqual(parrafosDeOrigen(F), { pNoVacios: 7, declarados: 6, encabezados: ['Título'] });
  });

  test('con `hasta`, se deja de contar en el párrafo que empieza por ese texto; si no está, para', () => {
    assert.deepEqual(parrafosDeOrigen(F, 'FIN'), { pNoVacios: 5, declarados: 4, encabezados: ['Título'] });
    assert.throws(() => parrafosDeOrigen(F, 'NO ESTÁ'), /NO ESTÁ/);
  });
});

const CORPUS = new URL('../../corpus/', import.meta.url);

describe('la muestra: 20 documentos por corpus, el motor frente al original', () => {
  for (const genero of ['administrativo', 'narrativa-clasica'] as const) {
    const ruta = new URL(`${genero}.manifiesto.json`, CORPUS);
    test(
      `${genero}: los párrafos de prosa del motor son los del original en los 20`,
      { skip: existsSync(ruta) ? false : `sin la caché de los corpus (motor/corpus/${genero}/), que no se versiona` },
      (t) => {
        const manifiesto = JSON.parse(readFileSync(ruta, 'utf8')) as Manifiesto;
        const muestra = ordenDeMuestra(SEMILLA, manifiesto.documentos, (d) => d.id).slice(0, 20);
        const distintos: string[] = [];
        let literales = 0;
        for (const d of muestra) {
          const texto = readFileSync(new URL(`${genero}/textos/${d.id}.txt`, CORPUS), 'utf8');
          assert.equal(huella(texto), d.sha256, `${d.id}: el texto en caché no es el del manifiesto`);
          let origen;
          if (genero === 'administrativo') {
            const r = bloqueDelDocumento(readFileSync(new URL(`${genero}/fuente/html/${d.id}.html`, CORPUS), 'utf8'));
            assert.ok('bloque' in r, `${d.id}: sin bloque #textoxslt`);
            origen = parrafosDeOrigen(r.bloque);
          } else {
            const orden = Number(d.id.slice(d.id.lastIndexOf('-') + 1));
            const c = capitulosDeEpub(leerZip(readFileSync(new URL(`${genero}/fuente/epub/pg${d['libro']}.epub`, CORPUS))), { conFragmento: true }).capitulos.find((x) => x.orden === orden);
            assert.ok(c?.fragmento !== undefined, `${d.id}: el EPUB no tiene el capítulo ${orden}`);
            origen = parrafosDeOrigen(c.fragmento, c.recorte?.desde);
          }
          const prosa = analizarTexto(texto).parrafos.filter((p) => p.prosa);
          const encabezados = new Set(origen.encabezados);
          const sinEncabezados = prosa.filter((p) => !encabezados.has(p.texto.replace(/\s+/g, ' '))).length;
          if (prosa.length === origen.pNoVacios) literales++;
          if (sinEncabezados !== origen.declarados) distintos.push(`${d.id}: motor ${sinEncabezados}, original ${origen.declarados} (<p> no vacíos ${origen.pNoVacios})`);
        }
        t.diagnostic(`literal (prosa del motor = <p> no vacíos): ${literales} de ${muestra.length}`);
        for (const x of distintos) t.diagnostic(x);
        assert.deepEqual(distintos, []);
      },
    );
  }
});
