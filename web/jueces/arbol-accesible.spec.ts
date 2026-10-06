/**
 * El árbol de accesibilidad (encargo 10.4, Tanda 5; DISEÑO §7), en Chrome headless sobre astro preview: lo que Chrome
 * da a los lectores de pantalla, leído por CDP con Accessibility.getFullAXTree, y cada nodo atado a su elemento por su
 * backendDOMNodeId. El acta lo recoge (docs/acta-contraste-y-accesibilidad.md); un lector de verdad (NVDA) queda como
 * hueco declarado.
 *
 *   1. Los tramos: cada tramo del texto analizado con role="button" es en el árbol un button, enfocable, con nombre (el
 *      de sus reglas) y sin desplegar.
 *   2. La tarjeta (1280): un dialog con el nombre de su título, no modal; el tramo que la abrió, desplegado.
 *   3. La hoja (390): un dialog con el nombre de su título, modal; y la hoja de filtros del catálogo, igual.
 *   4. Las pestañas (390, con resultado): un tablist con nombre y tres tab con el suyo, una sola elegida; cada tab
 *      controla su tabpanel, y cada tabpanel lleva el nombre de su pestaña.
 *   5. Las casillas: las de los paquetes del analizador y las de los filtros del catálogo, checkbox con el nombre de su
 *      etiqueta y su estado.
 *   6. «Descargar informe»: el del formulario, un button desactivado sin resultado y activo con un texto insuficiente
 *      (el formulario sigue a la vista); con un análisis, el formulario se pliega y su botón queda fuera del árbol, y el
 *      del final, activo; al pulsarlo, mientras se prepara (el trozo de pdfmake, retenido con Fetch), desactivado y con
 *      el nombre «Preparando el informe…»; al terminar, como estaba.
 *   7. Desde el 11.1 (hallazgo 2 del censo pre-despliegue), la página de créditos: el main; su título, heading de nivel 1,
 *      y los de sus secciones, de nivel 2, en su orden, cada sección una region con el nombre de su título; cada enlace,
 *      un link con nombre; y el pie, contentinfo, con el enlace «Créditos y licencias».
 *   8. Desde el 11.2, la página que no existe, en /no-existe/ (astro preview la sirve ahí con el 404, como el servidor):
 *      el main; su título, heading de nivel 1; sus dos enlaces, link con su nombre, en su orden; y el pie, contentinfo.
 *
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/ — getFullAXTree («Fetches the entire
 *    accessibility tree for the root Document»); AXNode: role, name, properties, ignored, backendDOMNodeId; AXPropertyName
 *    (disabled, expanded, focusable, modal, selected, checked, controls…).
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Fetch/ — Fetch.enable con patterns, el evento
 *    requestPaused y continueRequest: la petición queda en pausa hasta que se deja seguir.
 * [DOC] https://www.w3.org/TR/wai-aria-1.2/ — los roles button, dialog (aria-modal), tablist, tab (aria-selected,
 *    aria-controls), tabpanel y checkbox.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as textos from '../src/textos.ts';
import { paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

interface NodoAx {
  ignored: boolean;
  role?: { value: string };
  name?: { value: string };
  properties?: { name: string; value: { value?: unknown; relatedNodes?: { backendDOMNodeId: number }[] } }[];
  backendDOMNodeId?: number;
}
/** Lo que el juez mira de un nodo: su rol, su nombre y sus propiedades (las de relación, como los ids de sus nodos). */
interface Ax {
  rol: string;
  nombre: string;
  props: Record<string, unknown>;
}

describe('el árbol de accesibilidad, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };
  async function abrir(): Promise<void> {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
  }
  after(async () => {
    await sesion?.cerrar();
  });
  /** El ancho, asentado: con resultado, ANCHO_ASENTADO; en el catálogo, dos fotogramas, para que el aviso de matchMedia (que cierra la hoja de filtros) llegue antes. */
  async function anchoDe(ancho: number): Promise<void> {
    await p().cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: ancho < 769 ? 844 : 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await p().hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
    await p().evaluar('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))');
  }
  async function ir(ruta: string): Promise<void> {
    await p().cdp('Page.navigate', { url: `${sesion!.url}${ruta}` });
    if (ruta === '') await p().hasta(`document.getElementById('analizar')?.disabled === false`, 'el analizador, cargado');
    else await p().hasta(`document.readyState === 'complete' && location.pathname.endsWith(${JSON.stringify(`/${ruta}`)})`, `${ruta}, cargado`);
  }
  async function analizar(): Promise<void> {
    await p().evaluar(`(() => {
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('analizar').click();
    })()`);
    await p().hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    await p().hasta(ANCHO_ASENTADO, 'el ancho, asentado con el resultado');
  }
  /** El nodo del árbol de cada elemento que casa con el selector, en su orden (getFullAXTree, atado por backendDOMNodeId). */
  async function nodos(selector: string): Promise<Ax[]> {
    const { nodes } = (await p().cdp('Accessibility.getFullAXTree', {})) as { nodes: NodoAx[] };
    const porNodo = new Map(nodes.filter((n) => n.backendDOMNodeId !== undefined).map((n) => [n.backendDOMNodeId!, n]));
    const { root } = (await p().cdp('DOM.getDocument', { depth: 0 })) as { root: { nodeId: number } };
    const { nodeIds } = (await p().cdp('DOM.querySelectorAll', { nodeId: root.nodeId, selector })) as { nodeIds: number[] };
    const salida: Ax[] = [];
    for (const nodeId of nodeIds) {
      const { node } = (await p().cdp('DOM.describeNode', { nodeId })) as { node: { backendNodeId: number } };
      const n = porNodo.get(node.backendNodeId);
      if (n === undefined || n.ignored) {
        salida.push({ rol: n === undefined ? '(sin nodo)' : '(ignorado)', nombre: '', props: {} });
        continue;
      }
      const props = Object.fromEntries((n.properties ?? []).map((x) => [x.name, x.value.relatedNodes ? x.value.relatedNodes.map((r) => r.backendDOMNodeId) : x.value.value]));
      salida.push({ rol: n.role?.value ?? '', nombre: n.name?.value ?? '', props });
    }
    return salida;
  }
  /** El backendNodeId de un elemento, para comparar con las relaciones (controls). */
  async function idDe(selector: string): Promise<number> {
    const { root } = (await p().cdp('DOM.getDocument', { depth: 0 })) as { root: { nodeId: number } };
    const { nodeId } = (await p().cdp('DOM.querySelector', { nodeId: root.nodeId, selector })) as { nodeId: number };
    const { node } = (await p().cdp('DOM.describeNode', { nodeId })) as { node: { backendNodeId: number } };
    return node.backendNodeId;
  }
  const uno = async (selector: string): Promise<Ax> => {
    const [n] = await nodos(selector);
    assert.ok(n, `no está: ${selector}`);
    return n;
  };

  test('1 · cada tramo con role="button" es un button enfocable, con nombre y sin desplegar', async () => {
    await abrir();
    await anchoDe(1280);
    await analizar();
    const tramos = await nodos('#vista .tramo[role="button"]');
    const nombres = await p().evaluar<string[]>(`[...document.querySelectorAll('#vista .tramo[role="button"]')].map((t) => t.getAttribute('aria-label'))`);
    assert.ok(tramos.length > 10, `${tramos.length} tramos`);
    assert.deepEqual(
      tramos.map((n, i) => [n.rol, n.nombre === nombres[i] && n.nombre !== '', n.props['focusable'], n.props['expanded']]).filter(([rol, nombre, enfocable, desplegado]) => rol !== 'button' || !nombre || enfocable !== true || desplegado !== false),
      [],
      'tramos que no son un button enfocable con su nombre y sin desplegar',
    );
  });

  test('2 · la tarjeta (1280): un dialog con el nombre de su título, no modal; el tramo que la abrió, desplegado', async () => {
    await abrir();
    await anchoDe(1280);
    await p().evaluar(`document.querySelector('#vista .tramo[role="button"]').click()`);
    await p().hasta(`!document.getElementById('tarjeta').hidden`, 'la tarjeta');
    const titulo = await p().evaluar<string>(`document.getElementById('titulo-tarjeta').textContent`);
    const tarjeta = await uno('#tarjeta');
    assert.deepEqual([tarjeta.rol, tarjeta.nombre, tarjeta.props['modal'] ?? false], ['dialog', titulo, false]);
    assert.ok(titulo.length > 0, 'el título, con texto');
    assert.equal((await uno('#vista .tramo.activo[role="button"]')).props['expanded'], true, 'el tramo, desplegado');
    await p().evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
  });

  test('3 · la hoja (390) y la hoja de filtros del catálogo: dialog con el nombre de su título, modal', async () => {
    await abrir();
    try {
      await anchoDe(390);
      await p().evaluar(`document.getElementById('pestana-texto').click()`);
      await p().evaluar(`document.querySelector('#vista .tramo[role="button"]').click()`);
      await p().hasta(`!document.getElementById('tarjeta').hidden`, 'la hoja');
      const hoja = await uno('#tarjeta');
      assert.deepEqual([hoja.rol, hoja.nombre, hoja.props['modal']], ['dialog', await p().evaluar<string>(`document.getElementById('titulo-tarjeta').textContent`), true], 'la hoja');
      await p().evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
      await ir('reglas/');
      await p().evaluar(`document.getElementById('abrir-filtros').click()`);
      await p().hasta(`document.getElementById('panel-filtros').getAttribute('role') === 'dialog'`, 'la hoja de filtros');
      const filtros = await uno('#panel-filtros');
      assert.deepEqual([filtros.rol, filtros.nombre, filtros.props['modal']], ['dialog', await p().evaluar<string>(`document.getElementById('titulo-filtros').textContent`), true], 'la hoja de filtros');
    } finally {
      await anchoDe(1280);
      await ir('');
    }
  });

  test('4 · las pestañas (390): un tablist con nombre, tres tab con el suyo y una elegida; cada una controla su tabpanel, que lleva su nombre', async () => {
    await abrir();
    try {
      await anchoDe(390);
      await analizar();
      const lista = await uno('#barra-pestanas');
      assert.deepEqual([lista.rol, lista.nombre], ['tablist', textos.SECCIONES_DEL_RESULTADO]);
      const NOMBRES = [textos.PESTANA_TEXTO, textos.PESTANA_REGLAS, textos.PESTANA_DATOS];
      // Elegida cada una: las tres, con su nombre y solo ella elegida; ella controla su panel, que se ve y lleva su nombre.
      // (Chrome no da la relación controls hacia un panel oculto: se mira la de la elegida.)
      for (const [i, q] of ['texto', 'reglas', 'datos'].entries()) {
        await p().evaluar(`document.getElementById('pestana-${q}').click()`);
        await p().hasta(`!document.getElementById('panel-${q}').hidden`, `el panel ${q}`);
        const pestanas = await nodos('#barra-pestanas [role="tab"]');
        assert.deepEqual(
          pestanas.map((n) => [n.rol, n.nombre, n.props['selected']]),
          NOMBRES.map((nombre, j) => ['tab', nombre, j === i]),
          `las pestañas, con ${q} elegida`,
        );
        assert.deepEqual(pestanas[i]!.props['controls'], [await idDe(`#panel-${q}`)], `la pestaña ${q} controla su panel`);
        const panel = await uno(`#panel-${q}`);
        assert.deepEqual([panel.rol, panel.nombre], ['tabpanel', NOMBRES[i]], `el panel ${q}`);
      }
      await p().evaluar(`document.getElementById('pestana-texto').click()`);
    } finally {
      await anchoDe(1280);
    }
  });

  test('5 · las casillas de los paquetes y las de los filtros: checkbox con el nombre de su etiqueta y su estado', async () => {
    await abrir();
    await ir('');
    await p().evaluar(`document.getElementById('paquetes').open = true`);
    const paquetes = await nodos('#paquetes input[type="checkbox"]');
    assert.deepEqual(
      paquetes.map((n) => [n.rol, n.nombre, n.props['checked']]),
      paquetesIncluidos().map((x) => ['checkbox', `${x.cabecera.nombre} ${x.cabecera.version}`, 'true']),
      'las casillas de los paquetes',
    );
    await ir('reglas/');
    // El texto de cada etiqueta sin lo que lleva aria-hidden (la muestra «Abc» de cada familia), que no entra en el nombre.
    const etiquetas = await p().evaluar<string[]>(`[...document.querySelectorAll('#filtros input[type="checkbox"]')].map((c) => {
      const w = document.createTreeWalker(c.closest('label'), NodeFilter.SHOW_TEXT);
      let texto = '';
      for (let n = w.nextNode(); n; n = w.nextNode()) if (!n.parentElement.closest('[aria-hidden="true"]')) texto += n.data;
      return texto.trim().replace(/\\s+/g, ' ');
    })`);
    const filtros = await nodos('#filtros input[type="checkbox"]');
    assert.ok(filtros.length > 10, `${filtros.length} casillas de filtros`);
    assert.deepEqual(
      filtros.map((n, i) => [n.rol, n.nombre, etiquetas[i], n.props['checked']]).filter(([rol, nombre, etiqueta, marcada]) => rol !== 'checkbox' || nombre !== etiqueta || nombre === '' || marcada !== 'false'),
      [],
      'casillas de filtros sin su etiqueta de nombre o sin estado',
    );
    await ir('');
  });

  test('6 · «Descargar informe»: el del formulario, desactivado sin resultado y activo con un texto insuficiente; con un análisis, el del final; mientras se prepara, desactivado y «Preparando el informe…»; al terminar, como estaba', async () => {
    await abrir();
    await ir('');
    await anchoDe(1280);
    const sin = await uno('#informe');
    assert.deepEqual([sin.rol, sin.nombre, sin.props['disabled']], ['button', textos.DESCARGAR_INFORME, true], 'el del formulario, sin resultado');
    // Con un texto insuficiente, el formulario sigue a la vista y su botón, activo (al pulsarlo, dice que no hay informe).
    await p().evaluar(`(() => { document.getElementById('texto').value = 'Un texto corto, de pocas palabras.'; document.getElementById('analizar').click(); })()`);
    await p().hasta(`!document.getElementById('resultado').hidden && document.getElementById('resultado').classList.contains('insuficiente')`, 'el resultado insuficiente');
    const insuficiente = await uno('#informe');
    assert.deepEqual([insuficiente.rol, insuficiente.nombre, insuficiente.props['disabled'] ?? false], ['button', textos.DESCARGAR_INFORME, false], 'el del formulario, con un texto insuficiente');
    // Con un análisis, el formulario se pliega y su botón se oculta: queda el del final, activo.
    await analizar();
    const final = await uno('#descargar');
    assert.deepEqual(
      [(await uno('#informe')).rol, [final.rol, final.nombre, final.props['disabled'] ?? false]],
      ['(sin nodo)', ['button', textos.DESCARGAR_INFORME, false]],
      'con resultado: el del formulario, oculto (fuera del árbol), y el del final, activo',
    );
    // El trozo de pdfmake, retenido: mientras, el botón está preparando el informe.
    let retenida: string | undefined;
    p().alEvento((metodo, datos) => {
      if (metodo === 'Fetch.requestPaused') retenida = (datos as { requestId: string }).requestId;
    });
    await p().cdp('Browser.setDownloadBehavior', { behavior: 'deny' });
    await p().cdp('Fetch.enable', { patterns: [{ urlPattern: '*generar-pdf*', requestStage: 'Request' }] });
    try {
      await p().evaluar(`document.getElementById('descargar').click()`);
      await p().hasta(`document.getElementById('descargar').disabled`, 'el botón, preparando');
      const limite = Date.now() + 10_000;
      while (retenida === undefined && Date.now() < limite) await new Promise((r) => setTimeout(r, 50));
      assert.ok(retenida !== undefined, 'el trozo de pdfmake, retenido');
      const preparando = await uno('#descargar');
      assert.deepEqual([preparando.rol, preparando.nombre, preparando.props['disabled']], ['button', textos.PREPARANDO_EL_INFORME, true], 'mientras se prepara');
    } finally {
      if (retenida !== undefined) await p().cdp('Fetch.continueRequest', { requestId: retenida });
      await p().cdp('Fetch.disable');
    }
    await p().hasta(`!document.getElementById('descargar').disabled && document.getElementById('descargar').textContent === ${JSON.stringify(textos.DESCARGAR_INFORME)}`, 'el botón, de vuelta', 60_000);
    const despues = await uno('#descargar');
    assert.deepEqual([despues.rol, despues.nombre, despues.props['disabled'] ?? false], ['button', textos.DESCARGAR_INFORME, false], 'al terminar');
  });

  test('7 · la página de créditos: el main, los títulos de nivel 1 y 2 en su orden, cada sección una region con su nombre, cada enlace con nombre y el pie con el enlace a los créditos', async () => {
    await abrir();
    try {
      await ir('creditos/');
      assert.equal((await uno('body > main')).rol, 'main', 'el <main>');
      const h1 = await uno('.creditos h1');
      assert.deepEqual([h1.rol, h1.nombre, h1.props['level']], ['heading', textos.CREDITOS_Y_LICENCIAS, 1], 'el título');
      const titulos = await nodos('.creditos > section > h2');
      assert.deepEqual(
        titulos.map((n) => [n.rol, n.nombre, n.props['level']]),
        textos.SECCIONES_DE_LOS_CREDITOS.map((s) => ['heading', s.titulo, 2]),
        'los títulos de las secciones',
      );
      const secciones = await nodos('.creditos > section');
      assert.deepEqual(secciones.map((n) => [n.rol, n.nombre]), textos.SECCIONES_DE_LOS_CREDITOS.map((s) => ['region', s.titulo]), 'las secciones');
      const enlaces = await nodos('.creditos a');
      assert.ok(enlaces.length > 10, `${enlaces.length} enlaces`);
      assert.deepEqual(enlaces.filter((n) => n.rol !== 'link' || n.nombre === ''), [], 'enlaces que no son link o sin nombre');
      assert.equal((await uno('footer.pie')).rol, 'contentinfo', 'el pie');
      const delPie = await uno('footer.pie a');
      assert.deepEqual([delPie.rol, delPie.nombre], ['link', textos.CREDITOS_Y_LICENCIAS], 'el enlace del pie');
    } finally {
      await ir('');
    }
  });

  test('8 · la página que no existe: el main, el título de nivel 1, sus dos enlaces con su nombre y el pie', async () => {
    await abrir();
    try {
      await ir('no-existe/');
      assert.equal((await uno('body > main')).rol, 'main', 'el <main>');
      const h1 = await uno('.no-encontrada h1');
      assert.deepEqual([h1.rol, h1.nombre, h1.props['level']], ['heading', textos.NO_HAY_NADA_AQUI, 1], 'el título');
      const enlaces = await nodos('.no-encontrada a');
      assert.deepEqual(enlaces.map((n) => [n.rol, n.nombre]), [['link', textos.IR_AL_ANALIZADOR], ['link', textos.VER_EL_CATALOGO_DE_REGLAS]], 'los dos enlaces');
      assert.equal((await uno('footer.pie')).rol, 'contentinfo', 'el pie');
    } finally {
      await ir('');
    }
  });
});
