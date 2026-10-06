/**
 * El motivo de un fallo atrapado (11.1, hallazgo 14 del censo pre-despliegue, firmado por Antonio): en JavaScript se
 * puede lanzar cualquier cosa, y `(fallo as Error).message` da undefined si lo lanzado no es un Error. Cuatro catch de
 * web/ lo hacían (docs/CENSO-PRE-DESPLIEGUE.md, § 4); descarga.ts ya miraba instanceof Error.
 *
 *   1. Ningún `as Error` en web/src: el tipo no se afirma, se comprueba.
 *   2. Cada catch de web/src que dice el motivo lo saca de motivoDelFallo (pantalla/fallo.ts), una sola guarda.
 *   3. motivoDelFallo: de un Error (o de una subclase), su mensaje; de cualquier otra cosa, su texto (String).
 *
 * El catch de motor/src/validacion.ts, el quinto, es del motor y se queda como está: declarado en el censo.
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw — «You can throw any
 *    expression, not just expressions of a specific type».
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const SRC = new URL('../src/', import.meta.url);

/** Los .ts y .astro de web/src, con su ruta y su texto. */
const fuentes = (): { ruta: string; texto: string }[] =>
  readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .map((f) => f.replaceAll('\\', '/'))
    .filter((f) => /\.(ts|astro)$/.test(f))
    .map((ruta) => ({ ruta, texto: readFileSync(new URL(ruta, SRC), 'utf8') }));

describe('el motivo de un fallo atrapado', () => {
  test('1 · ningún «as Error» en web/src', () => {
    const halladas = fuentes().flatMap(({ ruta, texto }) => texto.split('\n').flatMap((linea, i) => (/\bas Error\b/.test(linea) ? [`${ruta}:${i + 1}`] : [])));
    assert.deepEqual(halladas, []);
  });

  test('2 · cada catch de web/src que usa lo atrapado lo pasa por motivoDelFallo', () => {
    const mal: string[] = [];
    let catches = 0;
    for (const { ruta, texto } of fuentes()) {
      for (const m of texto.matchAll(/catch \((\w+)\) \{([\s\S]*?)\n\s*\}/g)) {
        const [, nombre, cuerpo] = m;
        catches++;
        const usos = [...cuerpo!.matchAll(new RegExp(`\\b${nombre}\\b`, 'g'))].length;
        const guardados = [...cuerpo!.matchAll(new RegExp(`motivoDelFallo\\(${nombre}\\)`, 'g'))].length;
        if (usos !== guardados) mal.push(`${ruta}: catch (${nombre}), ${usos} usos y ${guardados} con motivoDelFallo`);
      }
    }
    assert.equal(catches, 5, 'los catch de web/src que atrapan con nombre: cargar, descarga, ejemplos, pantalla y propios');
    assert.deepEqual(mal, []);
  });

  test('3 · motivoDelFallo: de un Error, su mensaje; de otra cosa, su texto', async () => {
    const { motivoDelFallo } = await import('../src/pantalla/fallo.ts');
    assert.equal(motivoDelFallo(new Error('se cortó la red')), 'se cortó la red');
    assert.equal(motivoDelFallo(new SyntaxError('Unexpected token')), 'Unexpected token');
    assert.equal(motivoDelFallo('HTTP 404'), 'HTTP 404');
    assert.equal(motivoDelFallo(404), '404');
    assert.equal(motivoDelFallo(undefined), 'undefined');
  });
});
