/**
 * Los jueces de la cabecera y el pie (encargo 10.4, Tanda 1), como en el
 * modelo y con el icono (c) del DISEÑO §8. Los números de letra y color los
 * compara además el juez de fidelidad con las medidas del modelo; aquí, la
 * estructura y la geometría.
 *
 *   1. A 1280, en el analizador: el icono (c) de 56 px, la altura del bloque
 *      nombre + eslogan, a 12 del nombre (DISEÑO §8, corregido por Antonio al
 *      ver la Tanda 1); el nombre, el <h1>; el eslogan debajo; el enlace al catálogo a la
 *      derecha, con 44 de alto; la línea line debajo; la página con 64 px de
 *      margen a cada lado.
 *   2. El pie: la nota de autoría con su línea encima, lo último de la
 *      página; y la nota ya no se repite dentro del resultado.
 *   3. A 820, márgenes de 40; a 390, la cabecera compacta: icono de 48 (la
 *      altura del bloque),
 *      nombre a 20 px, márgenes de 16, y el enlace dice «Catálogo», también
 *      en su nombre accesible (el árbol de accesibilidad de Chrome).
 *   4. El catálogo lleva la misma cabecera, con el nombre en un <p> y el
 *      enlace «Analizador», y el mismo pie (en el HTML construido).
 *
 * [DOC] https://github.com/ChromeDevTools/devtools-protocol (json/
 *    browser_protocol.json) — Accessibility.getPartialAXTree («Fetches the
 *    accessibility node and partial accessibility tree for this DOM node»,
 *    experimental); DOM.getDocument y DOM.querySelector.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import { construir, decodificar, DIST } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

interface Caja {
  izquierda: number;
  derecha: number;
  arriba: number;
  ancho: number;
  alto: number;
}

describe('la cabecera y el pie', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  const anchoDe = async (ancho: number): Promise<void> => {
    await (await p()).cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
  };
  const caja = async (selector: string): Promise<Caja> =>
    (await p()).evaluar<Caja>(`(() => {
      const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return { izquierda: r.left, derecha: r.right, arriba: r.top, ancho: r.width, alto: r.height };
    })()`);
  const estilo = async (selector: string, propiedad: string): Promise<string> =>
    (await p()).evaluar<string>(`getComputedStyle(document.querySelector(${JSON.stringify(selector)})).getPropertyValue(${JSON.stringify(propiedad)})`);

  test('1 · a 1280: icono de 56, la altura del bloque nombre + eslogan, a 12 del nombre, el nombre en el <h1>, el enlace a la derecha con 44 de alto, la línea debajo y 64 de margen', async () => {
    await anchoDe(1280);
    const pestana = await p();
    const [icono, nombre, cabecera, enlace, bloque] = await Promise.all(['.cabecera .icono-marca', '.cabecera .nombre', '.cabecera', '.cabecera nav a', '.cabecera .marca > div'].map(caja));
    assert.deepEqual([icono!.ancho, icono!.alto], [56, 56], 'el icono');
    assert.ok(Math.abs(icono!.alto - bloque!.alto) <= 1 && Math.abs(icono!.arriba - bloque!.arriba) <= 1, `el icono, a la altura del bloque nombre + eslogan (${bloque!.alto} px)`);
    assert.equal(Math.round(nombre!.izquierda - icono!.derecha), 12, 'del icono al nombre');
    assert.equal(await pestana.evaluar(`document.querySelector('.cabecera .nombre').tagName`), 'H1', 'el nombre es el <h1> del analizador');
    assert.equal(await pestana.evaluar(`document.querySelector('.cabecera .eslogan').textContent`), textos.ESLOGAN);
    assert.equal(await pestana.evaluar(`document.querySelectorAll('h1').length`), 1, 'un solo <h1>');
    assert.equal(Math.round(enlace!.derecha), Math.round(cabecera!.derecha), 'el enlace, a la derecha');
    assert.equal(enlace!.alto, 44, 'el enlace mide 44 de alto');
    assert.equal(await pestana.evaluar(`document.querySelector('.cabecera nav a').textContent.trim()`), `${textos.CATALOGO}${textos.CATALOGO_CORTO}`, 'el enlace lleva los dos textos');
    assert.equal(await estilo('.cabecera', 'border-bottom'), '1px solid rgb(217, 217, 217)', 'la línea de la cabecera');
    // Contra el ancho útil: a 1280 de ventana, la barra de desplazamiento se lleva 15 px.
    const util = await pestana.evaluar<number>('document.documentElement.clientWidth');
    assert.deepEqual([Math.round(cabecera!.izquierda), Math.round(util - cabecera!.derecha)], [64, 64], 'los márgenes de la página');
  });

  test('2 · el pie: la nota con su línea encima, lo último de la página; la nota no se repite en el resultado', async () => {
    const pestana = await p();
    assert.equal(await pestana.evaluar(`document.querySelector('footer.pie').textContent`), textos.NOTA_DE_AUTORIA);
    assert.equal(await estilo('footer.pie', 'border-top'), '1px solid rgb(217, 217, 217)', 'la línea del pie');
    assert.equal(await pestana.evaluar(`[...document.body.children].filter((e) => e.checkVisibility()).at(-1).className`), 'pie', 'el pie es lo último que se ve');
    assert.equal(await pestana.evaluar(`[...document.querySelectorAll('#resultado p')].some((p) => p.textContent === ${JSON.stringify(textos.NOTA_DE_AUTORIA)} && !p.classList.contains('solo-impresion'))`), false, 'la nota, fuera del resultado en pantalla');
  });

  test('3 · a 820, márgenes de 40; a 390, la cabecera compacta, con el enlace «Catálogo» también en su nombre accesible', async () => {
    const pestana = await p();
    await anchoDe(820);
    assert.equal(Math.round((await caja('.cabecera')).izquierda), 40, 'el margen en tableta');
    await anchoDe(390);
    const [icono, bloque] = await Promise.all(['.cabecera .icono-marca', '.cabecera .marca > div'].map(caja));
    assert.deepEqual([icono!.ancho, icono!.alto], [48, 48], 'el icono en móvil');
    assert.ok(Math.abs(icono!.alto - bloque!.alto) <= 1 && Math.abs(icono!.arriba - bloque!.arriba) <= 1, `el icono en móvil, a la altura del bloque (${bloque!.alto} px)`);
    assert.equal(await estilo('.cabecera .nombre', 'font-size'), '20px', 'el nombre en móvil');
    assert.equal(Math.round((await caja('.cabecera')).izquierda), 16, 'el margen en móvil');
    assert.equal(await pestana.evaluar(`document.querySelector('.cabecera nav a').innerText`), textos.CATALOGO_CORTO, 'lo que se ve del enlace');
    const { root } = (await pestana.cdp('DOM.getDocument', {})) as { root: { nodeId: number } };
    const { nodeId } = (await pestana.cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '.cabecera nav a' })) as { nodeId: number };
    const { nodes } = (await pestana.cdp('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })) as { nodes: { role: { value: string }; name: { value: string } }[] };
    assert.deepEqual([nodes[0]!.role.value, nodes[0]!.name.value], ['link', textos.CATALOGO_CORTO], 'el nombre accesible del enlace en móvil');
  });

  test('4 · el catálogo: la misma cabecera, con el nombre en un <p> y el enlace «Analizador», y el mismo pie', () => {
    construir();
    for (const pagina of ['reglas/index.html', 'reglas/disc-marcador-repetido/index.html']) {
      const html = readFileSync(new URL(pagina, DIST), 'utf8');
      const cabecera = /<header class="cabecera">([\s\S]*?)<\/header>/.exec(html)?.[1] ?? '';
      assert.match(cabecera, /<img class="icono-marca" src="\/icono-c\.svg" alt="" width="56" height="56">/, `${pagina}: el icono`);
      assert.match(cabecera, /<p class="nombre">RadiografIA<\/p>/, `${pagina}: el nombre, en un <p>`);
      assert.equal(decodificar(/<p class="eslogan">([^<]*)<\/p>/.exec(cabecera)?.[1] ?? ''), textos.ESLOGAN, `${pagina}: el eslogan`);
      assert.equal(decodificar(/<nav><a href="\/">([^<]*)<\/a><\/nav>/.exec(cabecera)?.[1] ?? ''), textos.ANALIZADOR, `${pagina}: el enlace al analizador`);
      assert.equal(decodificar(/<footer class="pie">([^<]*)<\/footer>/.exec(html)?.[1] ?? ''), textos.NOTA_DE_AUTORIA, `${pagina}: el pie`);
    }
  });
});
