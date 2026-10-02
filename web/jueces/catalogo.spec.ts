/**
 * Los jueces del catálogo de reglas construido (encargo 7.1, b).
 *
 *   1. El build deja una página por regla de los dos paquetes,
 *      dist/reglas/<id>/index.html: tantas como reglas traen los JSON, ni una
 *      más ni una menos.
 *   2. Cada ficha lleva su id, su nombre, al menos una de sus fuentes como
 *      enlace y sus ejemplos tal cual, cada uno en su <pre>.
 *   6. astro preview sirve una ficha (200) y da 404 en /reglas/no-existe/.
 * El juez 4 del encargo (ningún JS de dist/ con Ajv ni node:) es el 3 de
 * construccion.spec.ts, que mira todo dist/ y sigue valiendo con las páginas
 * nuevas.
 *
 * Los paquetes se leen de paquetes/ (paquetesIncluidos, apoyo.ts), no de lo
 * que importa el build: lo que se compara es lo que hay en el repositorio con
 * lo que sale en dist/. El HTML se lee con sus entidades decodificadas.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { conPreview, construir, decodificar, DIST, paquetesIncluidos } from './apoyo.ts';

const REGLAS = new URL('reglas/', DIST);

/** Las reglas de los dos paquetes, de los JSON. */
const reglas = () => paquetesIncluidos().flatMap((p) => p.reglas);

const ficha = (id: string): string => readFileSync(new URL(`${id}/index.html`, REGLAS), 'utf8');

/** El texto visible de una página: sin etiquetas, scripts ni estilos, con las entidades decodificadas. */
function textoVisible(html: string): string {
  return decodificar(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]*>/g, ' '));
}

const hrefs = (html: string): string[] => [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => decodificar(m[1]!));

describe('el catálogo construido', () => {
  test('1 · una página por regla de los dos paquetes, dist/reglas/<id>/index.html', () => {
    construir();
    const ids = reglas().map((r) => r.id).sort();
    assert.ok(ids.length > 0, 'los paquetes no traen reglas');
    const carpetas = readdirSync(REGLAS, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    assert.deepEqual(carpetas, ids, `las carpetas de dist/reglas/ (${carpetas.length}) y las reglas de los JSON (${ids.length})`);
    for (const id of ids) assert.ok(existsSync(new URL(`${id}/index.html`, REGLAS)), `no existe dist/reglas/${id}/index.html`);
  });

  test('2 · cada ficha lleva su id, su nombre, una de sus fuentes enlazada y sus ejemplos tal cual', () => {
    construir();
    for (const r of reglas()) {
      const html = ficha(r.id);
      const texto = textoVisible(html);
      assert.ok(texto.includes(r.id), `${r.id}: la ficha no lleva su id`);
      assert.ok(r.nombre !== undefined && texto.includes(r.nombre), `${r.id}: la ficha no lleva su nombre «${r.nombre}»`);
      const enlaces = hrefs(html);
      assert.ok(r.fuente.some((f) => enlaces.includes(f.url)), `${r.id}: ninguna de sus fuentes va enlazada`);
      const ejemplos = [...html.matchAll(/<pre class="ejemplo">([\s\S]*?)<\/pre>/g)].map((m) => decodificar(m[1]!));
      assert.deepEqual(ejemplos, [...r.ejemplos.positivos, ...r.ejemplos.negativos], `${r.id}: los ejemplos de la ficha y los del JSON`);
    }
  });

  test('6 · astro preview sirve una ficha (200) y da 404 en /reglas/no-existe/', async () => {
    construir();
    const [primera] = reglas();
    assert.ok(primera, 'los paquetes no traen reglas');
    await conPreview(async (url) => {
      assert.equal((await fetch(`${url}reglas/${primera.id}/`)).status, 200, `GET ${url}reglas/${primera.id}/`);
      assert.equal((await fetch(`${url}reglas/no-existe/`)).status, 404, `GET ${url}reglas/no-existe/`);
    });
  });
});
