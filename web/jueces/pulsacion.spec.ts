/**
 * El tamaño de lo que se pulsa y los 320 px (encargo 10.4, Tanda 5; DISEÑO §7), en Chrome headless sobre astro preview:
 * las cajas, por CDP (Runtime.evaluate y getBoundingClientRect), en las tres páginas y en cada estado. El acta los
 * recoge (docs/acta-contraste-y-accesibilidad.md).
 *
 *   1. En el móvil (390, con mobile), cada objetivo, de 44 × 44 como mínimo (WCAG 2.2, 2.5.5; el DISEÑO, --medida-toque):
 *      el analizador sin resultado (con «Paquetes» abierto), con resultado en cada pestaña y con la hoja abierta; el
 *      catálogo y su hoja de filtros; una ficha.
 *   2. En escritorio (1280), de 24 × 24 como mínimo (2.5.8): el analizador sin resultado (con «Paquetes» abierto), con
 *      resultado (con «Ver el detalle» abierto) y con la tarjeta abierta; el catálogo; una ficha.
 *      Objetivo es lo que se pulsa y se ve (fuera lo inerte): enlaces, botones, campos, desplegables, resúmenes de
 *      <details>, lo que lleva role button, tab o checkbox, y lo que entra en el tabulador. La caja de una casilla es la de
 *      la etiqueta que la envuelve (pulsar la etiqueta la marca), y la de un campo oculto a la vista, la de su etiqueta.
 *      Exentos: los tramos (el encargo), y los enlaces dentro de una frase, que van en línea con el texto (2.5.8 y 2.5.5,
 *      excepción «Inline»): los del desglose, cada regla con su cifra en el mismo renglón («Conector repetido: 3 veces ·
 *      18,46 puntos»). Se cuentan aparte, y tiene que haber de los dos donde los hay.
 *   3. A 320, sin scroll horizontal (1.4.10) donde los jueces de cada página no miran: el resultado en cada una de sus
 *      tres pestañas, con la hoja abierta y, en el catálogo, con la hoja de filtros abierta. Los otros, en resultado.spec
 *      (9), pestanas.spec (5), catalogo-pantalla.spec (6) y ficha-pantalla.spec (6 y 8).
 *
 * [DOC] https://www.w3.org/TR/WCAG22/#target-size-minimum — 2.5.8 Target Size (Minimum): «The size of the target for
 *    pointer inputs is at least 24 by 24 CSS pixels», con la excepción «Inline: The target is in a sentence or its size
 *    is otherwise constrained by the line-height of non-target text».
 * [DOC] https://www.w3.org/TR/WCAG22/#target-size-enhanced — 2.5.5 Target Size (Enhanced): «at least 44 by 44 CSS
 *    pixels», con la misma excepción «Inline».
 * [DOC] https://www.w3.org/TR/WCAG22/#reflow — 1.4.10 Reflow: «without requiring scrolling in two dimensions» a «a width
 *    equivalent to 320 CSS pixels».
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

/** Un objetivo de pulsación, como lo cuenta la página. */
interface Objetivo {
  donde: string;
  ancho: number;
  alto: number;
  exento: '' | 'tramo' | 'en una frase';
}

/** En la página: cada objetivo que se ve y no es inerte, con su caja y si está exento. */
const OBJETIVOS = `(() => {
  const SELECTOR = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], [role="checkbox"], [tabindex]:not([tabindex="-1"])';
  const salida = [];
  for (const el of document.querySelectorAll(SELECTOR)) {
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) || el.closest('[inert]') !== null) continue;
    let caja = el;
    if (el.matches('input[type="checkbox"], input[type="radio"]') && el.closest('label') !== null) caja = el.closest('label');
    else if (el.labels?.length > 0 && el.getBoundingClientRect().width <= 1) caja = el.labels[0];
    const r = caja.getBoundingClientRect();
    const padre = el.parentElement;
    const enUnaFrase = getComputedStyle(el).display === 'inline' && padre !== null && padre.textContent.trim() !== el.textContent.trim();
    const nombre = el.id ? '#' + el.id : el.tagName.toLowerCase() + [...el.classList].map((c) => '.' + c).join('') + (el.getAttribute('role') ? '[role="' + el.getAttribute('role') + '"]' : '');
    const texto = (el.getAttribute('aria-label') ?? caja.textContent ?? '').trim().replace(/\\s+/g, ' ').slice(0, 30);
    salida.push({
      donde: nombre + (caja !== el ? ' (su ' + caja.tagName.toLowerCase() + ')' : '') + ' «' + texto + '»',
      ancho: Math.round(r.width * 100) / 100,
      alto: Math.round(r.height * 100) / 100,
      exento: el.matches('.tramo') ? 'tramo' : enUnaFrase ? 'en una frase' : '',
    });
  }
  return salida;
})()`;

describe('el tamaño de lo que se pulsa y los 320 px, sobre astro preview', () => {
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
  /** Otra página de la web en la misma pestaña y el mismo preview (astro no deja abrir otro a la vez). */
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
  async function abrirLaTarjeta(): Promise<void> {
    await p().evaluar(`document.querySelector('#vista .tramo[role="button"]').click()`);
    await p().hasta(`!document.getElementById('tarjeta').hidden`, 'la tarjeta');
  }
  async function cerrarLaTarjeta(): Promise<void> {
    await p().evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
    await p().hasta(`document.getElementById('tarjeta').hidden`, 'la tarjeta, cerrada');
  }
  /** Mide un estado: los objetivos por debajo del mínimo, a `fuera`; y cuántos hay y cuántos exentos, al diagnóstico. */
  async function medir(t: { diagnostic: (s: string) => void }, que: string, minimo: number, fuera: string[], exentos: Map<string, number>): Promise<void> {
    const objetivos = await p().evaluar<Objetivo[]>(OBJETIVOS);
    assert.ok(objetivos.length > 3, `${que}: ${objetivos.length} objetivos`);
    const cuenta = { tramo: 0, 'en una frase': 0 };
    for (const o of objetivos) {
      if (o.exento !== '') cuenta[o.exento]++;
      else if (o.ancho < minimo || o.alto < minimo) fuera.push(`${que}: ${o.donde}, ${o.ancho} × ${o.alto}`);
    }
    for (const [k, n] of Object.entries(cuenta)) exentos.set(`${que} · ${k}`, n);
    const medidos = objetivos.filter((o) => o.exento === '');
    t.diagnostic(`${que}: ${medidos.length} objetivos medidos (el menor, ${Math.min(...medidos.map((o) => Math.min(o.ancho, o.alto)))}); exentos: ${cuenta.tramo} tramos y ${cuenta['en una frase']} enlaces en una frase`);
  }

  test('1 · en el móvil (390), cada objetivo de 44 × 44 como mínimo, salvo los tramos y los enlaces en una frase', async (t) => {
    await abrir();
    const fuera: string[] = [];
    const exentos = new Map<string, number>();
    try {
      await anchoDe(390);
      await p().evaluar(`document.getElementById('paquetes').open = true`);
      await medir(t, 'el analizador sin resultado, con «Paquetes» abierto', 44, fuera, exentos);
      await analizar();
      for (const q of ['texto', 'reglas', 'datos']) {
        await p().evaluar(`document.getElementById('pestana-${q}').click()`);
        await p().hasta(`!document.getElementById('panel-${q}').hidden`, `la pestaña ${q}`);
        await medir(t, `con resultado, en la pestaña ${q}`, 44, fuera, exentos);
      }
      await p().evaluar(`document.getElementById('pestana-texto').click()`);
      await abrirLaTarjeta();
      await medir(t, 'con la hoja abierta', 44, fuera, exentos);
      await cerrarLaTarjeta();
      await ir('reglas/');
      await medir(t, 'el catálogo', 44, fuera, exentos);
      await p().evaluar(`document.getElementById('abrir-filtros').click()`);
      await p().hasta(`document.getElementById('panel-filtros').getAttribute('role') === 'dialog'`, 'la hoja de filtros');
      await medir(t, 'el catálogo, con la hoja de filtros', 44, fuera, exentos);
      await ir('reglas/disc-marcador-repetido/');
      await medir(t, 'una ficha', 44, fuera, exentos);
    } finally {
      await anchoDe(1280);
      await ir('');
    }
    assert.ok((exentos.get('con resultado, en la pestaña texto · tramo') ?? 0) > 0, 'con resultado, hay tramos exentos');
    assert.ok((exentos.get('con resultado, en la pestaña reglas · en una frase') ?? 0) > 0, 'en la pestaña Reglas, hay enlaces en una frase');
    assert.deepEqual(fuera, [], 'objetivos por debajo de 44 × 44');
  });

  test('2 · en escritorio (1280), cada objetivo de 24 × 24 como mínimo, salvo los tramos y los enlaces en una frase', async (t) => {
    await abrir();
    const fuera: string[] = [];
    const exentos = new Map<string, number>();
    try {
      await anchoDe(1280);
      await p().evaluar(`document.getElementById('paquetes').open = true`);
      await medir(t, 'el analizador sin resultado, con «Paquetes» abierto', 24, fuera, exentos);
      await analizar();
      await p().evaluar(`document.querySelectorAll('details.detalle').forEach((d) => (d.open = true))`);
      await medir(t, 'con resultado, con «Ver el detalle» abierto', 24, fuera, exentos);
      await p().evaluar(`document.querySelectorAll('details.detalle').forEach((d) => (d.open = false))`);
      await abrirLaTarjeta();
      await medir(t, 'con la tarjeta abierta', 24, fuera, exentos);
      await cerrarLaTarjeta();
      await ir('reglas/');
      await medir(t, 'el catálogo', 24, fuera, exentos);
      await ir('reglas/disc-marcador-repetido/');
      await medir(t, 'una ficha', 24, fuera, exentos);
    } finally {
      await ir('');
    }
    assert.ok((exentos.get('con resultado, con «Ver el detalle» abierto · tramo') ?? 0) > 0, 'con resultado, hay tramos exentos');
    assert.ok((exentos.get('con resultado, con «Ver el detalle» abierto · en una frase') ?? 0) > 0, 'con el detalle, hay enlaces en una frase');
    assert.deepEqual(fuera, [], 'objetivos por debajo de 24 × 24');
  });

  test('3 · a 320, sin scroll horizontal: el resultado en cada pestaña, con la hoja abierta, y el catálogo con la hoja de filtros', async () => {
    await abrir();
    const desbordan: string[] = [];
    const ancho = async (que: string): Promise<void> => {
      const [contenido, util] = await p().evaluar<[number, number]>(`[document.documentElement.scrollWidth, document.documentElement.clientWidth]`);
      if (contenido > util) desbordan.push(`${que}: ${contenido} de contenido en ${util} de ancho`);
    };
    try {
      await anchoDe(320);
      await analizar();
      for (const q of ['texto', 'reglas', 'datos']) {
        await p().evaluar(`document.getElementById('pestana-${q}').click()`);
        await p().hasta(`!document.getElementById('panel-${q}').hidden`, `la pestaña ${q}`);
        await ancho(`la pestaña ${q}`);
      }
      await p().evaluar(`document.getElementById('pestana-texto').click()`);
      await abrirLaTarjeta();
      await ancho('con la hoja abierta');
      await cerrarLaTarjeta();
      await ir('reglas/');
      await p().evaluar(`document.getElementById('abrir-filtros').click()`);
      await p().hasta(`document.getElementById('panel-filtros').getAttribute('role') === 'dialog'`, 'la hoja de filtros');
      await ancho('el catálogo, con la hoja de filtros');
    } finally {
      await anchoDe(1280);
      await ir('');
    }
    assert.deepEqual(desbordan, []);
  });
});
