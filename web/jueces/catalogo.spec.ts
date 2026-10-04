/**
 * Los jueces del catálogo de reglas construido (encargo 7.1, b).
 *
 *   1. El build deja una página por regla de los dos paquetes,
 *      dist/reglas/<id>/index.html: tantas como reglas traen los JSON, ni una
 *      más ni una menos; y el índice, dist/reglas/index.html, con un enlace a
 *      cada una.
 *   2. Cada ficha lleva su id, su nombre, al menos una de sus fuentes como
 *      enlace y sus ejemplos tal cual, cada uno en su <pre>. Desde el 9.2, la
 *      frase en claro de la regla justo bajo el nombre (el <h1>).
 *   3. Los enlaces internos llegan: todo href que empieza por «/» en las
 *      páginas de dist/ (analizador, índice y fichas) apunta a un fichero de
 *      dist/; el analizador enlaza el catálogo en su cabecera; y la URL de
 *      ficha que pinta el analizador en el panel y en el desglose (urlDeRegla,
 *      con la base) existe para cada regla de los dos paquetes. Que el panel la
 *      use lo ve Chrome, no este juez: esos enlaces los crea el script al
 *      analizar.
 *   5. El índice lleva el buscador con su <label>, los tres filtros (familia,
 *      detector y severidad, en ese orden desde el 10.4, Tanda 3: el del
 *      DISEÑO §6.3 y el modelo) en su <fieldset> con su <legend> y cada
 *      casilla dentro de su <label> con su texto (las de familia, con la
 *      muestra de su línea delante), el botón «Quitar filtros», el recuento en
 *      una región viva (role=status, aria-live=polite) y el script que filtra.
 *   6. astro preview sirve el índice y una ficha (200) y da 404 en
 *      /reglas/no-existe/.
 *   7. El índice en su orden (cierre del 7.1, firmado por Antonio): los
 *      paquetes como los carga el analizador; dentro, las familias alfabéticas
 *      por su nombre visible, y dentro de cada una, las reglas alfabéticas por
 *      su nombre (localeCompare con «es»). Las casillas de familia, igual; las
 *      de detector, alfabéticas; las de severidad, baja → media → alta, que es
 *      una escala.
 *   8. El índice lleva la frase en claro de cada regla justo bajo su nombre
 *      (encargo 9.2, b; firmado en la parada 1).
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
import * as textos from '../src/textos.ts';
import { DETECTORES, SEVERIDADES, urlDeRegla, urlDelCatalogo } from '../src/catalogo/catalogo.ts';
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
    assert.ok(existsSync(new URL('index.html', REGLAS)), 'no existe dist/reglas/index.html');
    const enlaces = hrefs(readFileSync(new URL('index.html', REGLAS), 'utf8'));
    assert.deepEqual(ids.filter((id) => !enlaces.includes(urlDeRegla('/', id))), [], 'reglas sin enlace en el índice');
  });

  test('2 · cada ficha lleva su id, su nombre con su frase en claro debajo, una de sus fuentes enlazada y sus ejemplos tal cual', () => {
    construir();
    for (const r of reglas()) {
      const html = ficha(r.id);
      const texto = textoVisible(html);
      assert.ok(texto.includes(r.id), `${r.id}: la ficha no lleva su id`);
      assert.ok(r.nombre !== undefined && texto.includes(r.nombre), `${r.id}: la ficha no lleva su nombre «${r.nombre}»`);
      const bajoElNombre = /<h1>[^<]*<\/h1>\s*<p class="en-claro">([^<]*)<\/p>/.exec(html);
      assert.equal(bajoElNombre ? decodificar(bajoElNombre[1]!) : null, r.enClaro, `${r.id}: la frase en claro, bajo el nombre`);
      const enlaces = hrefs(html);
      assert.ok(r.fuente.some((f) => enlaces.includes(f.url)), `${r.id}: ninguna de sus fuentes va enlazada`);
      const ejemplos = [...html.matchAll(/<pre class="ejemplo">([\s\S]*?)<\/pre>/g)].map((m) => decodificar(m[1]!));
      assert.deepEqual(ejemplos, [...r.ejemplos.positivos, ...r.ejemplos.negativos], `${r.id}: los ejemplos de la ficha y los del JSON`);
    }
  });

  test('3 · todo enlace interno de dist/ llega a una página; el analizador enlaza el catálogo y cada ficha existe en su URL', () => {
    construir();
    const paginas = readdirSync(DIST, { recursive: true, encoding: 'utf8' })
      .map((f) => f.replaceAll('\\', '/'))
      .filter((f) => f.endsWith('.html'));
    assert.ok(paginas.length > reglas().length, `dist/ tiene ${paginas.length} páginas HTML`);
    const existe = (href: string): boolean => {
      const ruta = href.split(/[?#]/)[0]!.slice(1);
      return existsSync(new URL(ruta === '' || ruta.endsWith('/') ? `${ruta}index.html` : ruta, DIST));
    };
    const rotos = paginas.flatMap((p) => hrefs(readFileSync(new URL(p, DIST), 'utf8')).filter((h) => h.startsWith('/') && !existe(h)).map((h) => `${p}: ${h}`));
    assert.deepEqual(rotos, [], 'enlaces internos que no llegan a nada');
    assert.ok(hrefs(readFileSync(new URL('index.html', DIST), 'utf8')).includes(urlDelCatalogo('/')), 'el analizador no enlaza el catálogo');
    assert.deepEqual(reglas().map((r) => urlDeRegla('/', r.id)).filter((u) => !existe(u)), [], 'URL de ficha que no existen');
  });

  test('5 · el índice lleva el buscador, los tres filtros con sus etiquetas, «Quitar filtros», el recuento en una región viva y su script', () => {
    construir();
    const html = readFileSync(new URL('index.html', REGLAS), 'utf8');
    const etiqueta = /<label for="buscar">([^<]*)<\/label>/.exec(html);
    assert.ok(etiqueta, 'sin la etiqueta del buscador');
    assert.equal(decodificar(etiqueta[1]!), textos.BUSCAR);
    assert.match(html, /<input id="buscar" type="search"/, 'sin el buscador');
    const familias = paquetesIncluidos().flatMap((p) => p.cabecera.familias).length;
    const grupos = [...html.matchAll(/<fieldset>\s*<legend>([^<]*)<\/legend>([\s\S]*?)<\/fieldset>/g)].map((m) => ({
      legend: decodificar(m[1]!),
      casillas: (m[2]!.match(/<input type="checkbox"/g) ?? []).length,
      etiquetadas: [...m[2]!.matchAll(/<label>\s*<input type="checkbox"[^>]*>([\s\S]*?)<\/label>/g)].filter((l) => l[1]!.replace(/<[^>]*>/g, '').trim() !== '').length,
    }));
    assert.deepEqual(grupos, [
      { legend: textos.FAMILIA, casillas: familias, etiquetadas: familias },
      { legend: textos.DETECTOR, casillas: DETECTORES.length, etiquetadas: DETECTORES.length },
      { legend: textos.SEVERIDAD, casillas: SEVERIDADES.length, etiquetadas: SEVERIDADES.length },
    ]);
    assert.match(html, new RegExp(`<button id="quitar-filtros" type="button">${textos.QUITAR_FILTROS}</button>`), 'sin «Quitar filtros»');
    const viva = /<p id="recuento" role="status" aria-live="polite">([^<]*)<\/p>/.exec(html);
    assert.ok(viva, 'sin el recuento en una región viva');
    assert.equal(decodificar(viva[1]!), textos.recuentoDeReglas(reglas().length));
    const scripts = [...html.matchAll(/<script type="module" src="([^"]+)"/g)].map((m) => m[1]!);
    assert.equal(scripts.length, 1, `el índice tenía que cargar un script: ${scripts.join(', ')}`);
    assert.ok(existsSync(new URL(`.${scripts[0]}`, DIST)), `no existe ${scripts[0]} en dist/`);
  });

  test('7 · el índice en su orden: paquetes como los carga el analizador; familias y reglas, alfabéticas por su nombre; casillas igual, y la severidad como escala', () => {
    construir();
    const html = readFileSync(new URL('index.html', REGLAS), 'utf8');
    // El orden se calcula aquí con localeCompare, sin la función de orden de la web: es lo que se juzga.
    const es = (a: string, b: string): number => a.localeCompare(b, 'es');
    const paquetes = paquetesIncluidos();
    const familias = paquetes.flatMap((p) => [...p.cabecera.familias].sort((a, b) => es(a.nombre, b.nombre)).map((f) => ({ p, f })));
    const esperadas = familias.flatMap(({ p, f }) =>
      p.reglas
        .filter((r) => r.familia === f.id)
        .sort((a, b) => es(a.nombre ?? '', b.nombre ?? ''))
        .map((r) => urlDeRegla('/', r.id)),
    );
    const filas = [...html.matchAll(/<h2><a href="([^"]+)"/g)].map((m) => decodificar(m[1]!));
    assert.deepEqual(filas, esperadas, 'las reglas del índice: paquete, familia alfabética, regla alfabética');
    const casillas = (nombre: string): string[] =>
      [...html.matchAll(new RegExp(`<input type="checkbox" name="${nombre}" value="([^"]*)"`, 'g'))].map((m) => decodificar(m[1]!));
    assert.deepEqual(casillas('familia'), familias.map(({ p, f }) => `${p.cabecera.nombre}::${f.id}`), 'las casillas de familia');
    assert.deepEqual(casillas('detector'), [...DETECTORES].sort(es), 'las casillas de detector, alfabéticas');
    assert.deepEqual(casillas('severidad'), ['baja', 'media', 'alta'], 'las casillas de severidad, como escala');
  });

  test('8 · el índice lleva la frase en claro de cada regla bajo su nombre', () => {
    construir();
    const html = readFileSync(new URL('index.html', REGLAS), 'utf8');
    const filas = new Map([...html.matchAll(/<h2><a href="([^"]+)">[^<]*<\/a><\/h2>\s*<p class="en-claro">([^<]*)<\/p>/g)].map((m) => [decodificar(m[1]!), decodificar(m[2]!)]));
    assert.deepEqual(
      reglas().filter((r) => filas.get(urlDeRegla('/', r.id)) !== r.enClaro).map((r) => r.id),
      [],
      'reglas del índice sin su frase en claro bajo el nombre',
    );
  });

  test('6 · astro preview sirve el índice y una ficha (200) y da 404 en /reglas/no-existe/', async () => {
    construir();
    const [primera] = reglas();
    assert.ok(primera, 'los paquetes no traen reglas');
    await conPreview(async (url) => {
      assert.equal((await fetch(`${url}reglas/`)).status, 200, `GET ${url}reglas/`);
      assert.equal((await fetch(`${url}reglas/${primera.id}/`)).status, 200, `GET ${url}reglas/${primera.id}/`);
      assert.equal((await fetch(`${url}reglas/no-existe/`)).status, 404, `GET ${url}reglas/no-existe/`);
    });
  });
});
