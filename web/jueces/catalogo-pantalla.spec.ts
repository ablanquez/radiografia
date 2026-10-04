/**
 * El índice del catálogo en Chrome, sobre astro preview (encargo 10.4, Tanda
 * 3; DISEÑO §6.3, como el modelo). Los tests van en orden y comparten la
 * pestaña.
 *
 *   1. A 1280: el título con su presentación; el buscador con su etiqueta, a
 *      todo el ancho y de 48; los filtros en cuatro columnas en fila
 *      (familia, con la muestra de su línea y «(paquete)»; detector;
 *      severidad, baja → media → alta; y «Quitar filtros» con el recuento);
 *      sin el botón «Filtros», ni «Aplicar», ni el título ni el asa de la hoja.
 *   2. Las tarjetas: una por regla, con la muestra y la sigla de su familia
 *      (aria-hidden), el nombre que enlaza a su ficha, la frase en claro y la
 *      línea de datos (id, familia, paquete, detector, severidad, nivel de
 *      evidencia); borde line, radio 8 y 20 de margen; las que solo avisan,
 *      discontinuas sobre card.
 *   3. Marcar una familia deja solo sus reglas, y el recuento lo dice;
 *      buscar, también; «Quitar filtros» lo devuelve todo y vacía el buscador.
 *   4. Sin ninguna regla: «Ninguna regla con esos filtros.» en su recuadro,
 *      sin la lista; su «Quitar filtros» lo devuelve todo y lleva el foco al
 *      buscador.
 *   5. A 820: los filtros en dos columnas (familia; detector y severidad, uno
 *      encima del otro) y debajo, en fila, «Quitar filtros» y el recuento.
 *   6. A 390: el botón «Filtros» con el recuento al lado; los filtros, no;
 *      las tarjetas, a todo el ancho; y a 320, sin scroll horizontal.
 *   7. La hoja de filtros: un diálogo modal con nombre, el foco en su título,
 *      abajo y a todo el ancho, como mucho el 60 % de la pantalla (90 % con
 *      el asa, y otro toque la devuelve); el velo; lo demás, inerte; Tab da la
 *      vuelta dentro.
 *   8. Lo que se marca en la hoja no filtra hasta «Aplicar», que la cierra,
 *      filtra y pone en el botón cuántas casillas van marcadas; Escape, la X
 *      y el velo la cierran sin aplicar; «Quitar filtros» desmarca el
 *      borrador; al cerrar, el foco vuelve al botón.
 *   9. Si la ventana se ensancha con la hoja abierta, se cierra sin aplicar y
 *      el recuento vuelve junto a «Quitar filtros».
 *  10. Ninguna petición de red después de la carga, y ninguna violación de la
 *      CSP.
 *
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — aria-modal,
 *    el foco dentro al abrir, Tab que da la vuelta, Escape y el foco de
 *    vuelta al elemento que lo abrió.
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/reflow.html — 1.4.10:
 *    sin scroll en dos dimensiones a 320 CSS px.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as textos from '../src/textos.ts';
import { reglasDelCatalogo, urlDeRegla } from '../src/catalogo/catalogo.ts';
import { nombreDeRegla } from '../src/pantalla/humanizar.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { paquetesIncluidos } from './apoyo.ts';
import { abrirConTestigos, type PaginaConTestigos, type Pestana } from './chrome.ts';

const ALTO = 844;
const CARD = 'rgb(245, 245, 245)';
const LINEA = 'rgb(217, 217, 217)';
const TINTA_2 = 'rgb(74, 74, 74)';

interface Caja {
  izquierda: number;
  derecha: number;
  arriba: number;
  abajo: number;
  ancho: number;
  alto: number;
  visible: boolean;
}

describe('el índice del catálogo en Chrome, sobre astro preview', () => {
  const paquetes = paquetesIncluidos();
  const entradas = reglasDelCatalogo(paquetes);
  const indice = indexar(paquetes);
  let sesion: PaginaConTestigos | undefined;
  let arranque: Promise<PaginaConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirConTestigos('reglas/', `document.readyState === 'complete'`, 'el catálogo cargado'));
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  /** Cambia el ancho y espera a que la página lo haya recibido: el recuento, junto al botón «Filtros» en el móvil y junto a «Quitar filtros» fuera. */
  const anchoDe = async (ancho: number, alto = ALTO): Promise<void> => {
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 769 });
    const sitio = ancho <= 768 ? 'barra-filtros' : 'acciones-filtros';
    await pestana.hasta(`document.getElementById('recuento').parentElement.classList.contains('${sitio}')`, `el ancho de ${ancho}, asentado`);
  };
  const caja = async (selector: string): Promise<Caja> =>
    (await p()).evaluar<Caja>(
      `(() => { const e = document.querySelector(${JSON.stringify(selector)}); const r = e.getBoundingClientRect(); return { izquierda: r.left, derecha: r.right, arriba: r.top + scrollY, abajo: r.bottom + scrollY, ancho: r.width, alto: r.height, visible: e.checkVisibility() }; })()`,
    );
  const estilo = async (selector: string, propiedades: readonly string[]): Promise<string[]> =>
    (await p()).evaluar<string[]>(`(() => { const c = getComputedStyle(document.querySelector(${JSON.stringify(selector)})); return ${JSON.stringify(propiedades)}.map((x) => c.getPropertyValue(x)); })()`);
  const pulsar = async (selector: string): Promise<void> => {
    await (await p()).evaluar(`document.querySelector(${JSON.stringify(selector)}).click()`);
  };
  const tecla = async (key: string, code: string, windowsVirtualKeyCode: number, modifiers = 0): Promise<void> => {
    for (const type of ['keyDown', 'keyUp']) await (await p()).cdp('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode, modifiers });
  };
  const casilla = (nombre: string, valor: string): string => `#panel-filtros input[name="${nombre}"][value="${valor}"]`;
  const recuento = async (): Promise<string> => (await p()).evaluar<string>(`document.getElementById('recuento').textContent`);
  const visibles = async (): Promise<string[]> => (await p()).evaluar<string[]>(`[...document.querySelectorAll('#reglas > li')].filter((li) => !li.hidden).map((li) => li.querySelector('h2 a').getAttribute('href'))`);
  const hrefDe = (id: string): string => urlDeRegla('/', id);
  const todas = entradas.map((e) => hrefDe(e.regla.id)).sort();

  test('1 · a 1280: el título, el buscador y los filtros en cuatro columnas con «Quitar filtros» y el recuento; nada de la hoja', async () => {
    await anchoDe(1280, 900);
    const pestana = await p();
    assert.equal(await pestana.evaluar(`document.querySelector('main h1').textContent`), textos.CATALOGO);
    const [letra, tamano, color] = await estilo('.presentacion', ['font-family', 'font-size', 'color']);
    assert.deepEqual([letra!.split(',')[0]!.replace(/["']/g, '').trim(), tamano, color], ['Literata', '18px', TINTA_2], 'la presentación, en Literata 18 y en ink-2');
    const [main, buscador] = await Promise.all(['main', '#buscar'].map(caja));
    assert.equal(await pestana.evaluar(`document.querySelector('label[for="buscar"]').textContent`), textos.BUSCAR);
    assert.deepEqual([buscador!.ancho, buscador!.alto], [main!.ancho, 48], 'el buscador, a todo el ancho y de 48');
    const leyendas = await pestana.evaluar<string[]>(`[...document.querySelectorAll('#panel-filtros legend')].map((l) => l.textContent)`);
    assert.deepEqual(leyendas, [textos.FAMILIA, textos.DETECTOR, textos.SEVERIDAD]);
    const columnas = await Promise.all(['.grupos-filtros > fieldset', '.otros-filtros fieldset:nth-of-type(1)', '.otros-filtros fieldset:nth-of-type(2)', '.acciones-filtros'].map(caja));
    assert.equal(new Set(columnas.map((c) => Math.round(c.arriba))).size, 1, `las cuatro, en fila: ${columnas.map((c) => Math.round(c.arriba)).join(' · ')}`);
    assert.ok(columnas.every((c, i) => i === 0 || c.izquierda >= columnas[i - 1]!.derecha + 40 - 0.5), `de izquierda a derecha, a 40: ${columnas.map((c) => `${Math.round(c.izquierda)}-${Math.round(c.derecha)}`).join(' · ')}`);
    const [quitar, cuenta] = await Promise.all(['#quitar-filtros', '#recuento'].map(caja));
    assert.ok(cuenta!.arriba >= quitar!.abajo, '«Quitar filtros» y, debajo, el recuento');
    assert.equal(await recuento(), textos.recuentoDeReglas(entradas.length));
    const familias = await pestana.evaluar<[string, boolean, string][]>(
      `[...document.querySelectorAll('.grupos-filtros > fieldset label')].map((l) => { const m = l.querySelector('.muestra'); return [m.className, m.getAttribute('aria-hidden') === 'true', l.textContent.replace(m.textContent, '').trim()]; })`,
    );
    assert.deepEqual(
      familias,
      indice.familias.map((f) => [`muestra capa ${f.clase}`, true, `${f.nombre} (${f.paquete})`]),
      'cada familia con la muestra de su línea, aria-hidden, y «(paquete)»',
    );
    assert.deepEqual(await pestana.evaluar(`[...document.querySelectorAll('.otros-filtros fieldset:nth-of-type(2) label')].map((l) => l.textContent.trim())`), ['baja', 'media', 'alta']);
    assert.deepEqual(
      await Promise.all(['#abrir-filtros', '#aplicar-filtros', '#titulo-filtros', '#panel-filtros .asa'].map(async (s) => (await caja(s)).visible)),
      [false, false, false, false],
      'ni el botón «Filtros» ni nada de la hoja',
    );
  });

  test('2 · las tarjetas: muestra y sigla, nombre con enlace, frase en claro y línea de datos; las que solo avisan, discontinuas', async () => {
    const pestana = await p();
    const tarjetas = await pestana.evaluar<{ href: string; muestra: string; sigla: string; ocultas: boolean; nombre: string; claro: string | null; datos: string; informativa: boolean }[]>(
      `[...document.querySelectorAll('#reglas > li')].map((li) => ({
        href: li.querySelector('h2 > a').getAttribute('href'), muestra: li.querySelector('.muestra').className, sigla: li.querySelector('.sigla').textContent,
        ocultas: li.querySelector('.muestra').getAttribute('aria-hidden') === 'true' && li.querySelector('.sigla').getAttribute('aria-hidden') === 'true',
        nombre: li.querySelector('h2 > a').textContent, claro: li.querySelector('.en-claro')?.textContent ?? null, datos: li.querySelector('.datos').textContent,
        informativa: li.classList.contains('informativa'),
      }))`,
    );
    assert.equal(tarjetas.length, entradas.length, 'una tarjeta por regla');
    const porHref = new Map(tarjetas.map((t) => [t.href, t]));
    for (const { regla, paquete, familia } of entradas) {
      const clave = `${paquete.nombre}::${familia.id}`;
      assert.deepEqual(porHref.get(hrefDe(regla.id)), {
        href: hrefDe(regla.id),
        muestra: `muestra capa ${indice.claseDeFamilia.get(clave)}`,
        sigla: indice.siglaDeFamilia.get(clave),
        ocultas: true,
        nombre: nombreDeRegla(regla.id, regla),
        claro: regla.enClaro ?? null,
        datos: textos.lineaDeLaRegla([regla.id, familia.nombre, paquete.nombre, regla.detector, regla.severidad, regla.nivelEvidencia]),
        informativa: regla.informativa === true || familia.informativa === true,
      });
    }
    assert.deepEqual(await estilo('#reglas > li:not(.informativa)', ['border-top', 'border-radius', 'padding', 'background-color']), [`1px solid ${LINEA}`, '8px', '20px', 'rgb(255, 255, 255)']);
    assert.ok(tarjetas.some((t) => t.informativa), 'hay reglas que solo avisan');
    assert.deepEqual(await estilo('#reglas > li.informativa', ['border-top-style', 'background-color']), ['dashed', CARD]);
    assert.deepEqual(await estilo('#reglas > li.informativa .en-claro', ['color']), [TINTA_2]);
  });

  test('3 · una familia deja solo sus reglas; buscar, también; «Quitar filtros» lo devuelve todo y vacía el buscador', async () => {
    const pestana = await p();
    const familia = indice.familias[0]!;
    await pulsar(casilla('familia', familia.clave));
    const suyas = entradas.filter((e) => `${e.paquete.nombre}::${e.familia.id}` === familia.clave).map((e) => hrefDe(e.regla.id)).sort();
    assert.deepEqual((await visibles()).sort(), suyas);
    assert.equal(await recuento(), textos.recuentoDeReglas(suyas.length));
    await pulsar('#quitar-filtros');
    const [{ regla }] = entradas;
    await pestana.evaluar(`(() => { const b = document.getElementById('buscar'); b.value = ${JSON.stringify(regla!.id)}; b.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    assert.ok((await visibles()).includes(hrefDe(regla!.id)) && (await visibles()).length < entradas.length, 'buscar por el id deja esa regla y menos que todas');
    await pulsar('#quitar-filtros');
    assert.deepEqual([(await visibles()).sort(), await recuento(), await pestana.evaluar(`document.getElementById('buscar').value`)], [todas, textos.recuentoDeReglas(entradas.length), '']);
  });

  test('4 · sin ninguna regla: el aviso en su recuadro, sin la lista; su «Quitar filtros» lo devuelve todo y lleva el foco al buscador', async () => {
    const pestana = await p();
    // Una familia y una severidad que no tienen ninguna regla a la vez (el modelo: Gramática y alta).
    const vacio = indice.familias.flatMap((f) => (['baja', 'media', 'alta'] as const).map((s) => ({ f, s }))).find(({ f, s }) => !entradas.some((e) => `${e.paquete.nombre}::${e.familia.id}` === f.clave && e.regla.severidad === s));
    assert.ok(vacio, 'hay una familia y una severidad sin reglas');
    await pulsar(casilla('familia', vacio.f.clave));
    await pulsar(casilla('severidad', vacio.s));
    assert.deepEqual(
      await pestana.evaluar(`[document.getElementById('sin-reglas').checkVisibility(), document.querySelector('#sin-reglas p').textContent, document.getElementById('reglas').checkVisibility(), document.getElementById('recuento').textContent]`),
      [true, textos.NINGUNA_REGLA, false, textos.recuentoDeReglas(0)],
    );
    assert.deepEqual(await estilo('#sin-reglas', ['background-color', 'border-top', 'border-radius', 'padding']), [CARD, `1px solid ${LINEA}`, '8px', '32px']);
    assert.deepEqual(await estilo('#sin-reglas p', ['font-size', 'font-weight']), ['20px', '700']);
    await pulsar('#quitar-filtros-sin-reglas');
    assert.deepEqual(
      [await pestana.evaluar(`[document.getElementById('sin-reglas').checkVisibility(), document.getElementById('reglas').checkVisibility(), document.activeElement.id]`), await recuento()],
      [[false, true, 'buscar'], textos.recuentoDeReglas(entradas.length)],
    );
  });

  test('5 · a 820: los filtros en dos columnas y debajo, en fila, «Quitar filtros» y el recuento', async () => {
    await anchoDe(820, 900);
    const [familia, detector, severidad, quitar, cuenta] = await Promise.all(
      ['.grupos-filtros > fieldset', '.otros-filtros fieldset:nth-of-type(1)', '.otros-filtros fieldset:nth-of-type(2)', '#quitar-filtros', '#recuento'].map(caja),
    );
    assert.ok(detector!.izquierda >= familia!.derecha + 32 - 0.5, 'detector, a la derecha de la familia, a 32');
    assert.equal(Math.round(severidad!.izquierda), Math.round(detector!.izquierda), 'severidad, en la columna del detector');
    assert.ok(severidad!.arriba >= detector!.abajo + 24 - 0.5, 'severidad, debajo del detector, a 24');
    assert.ok(quitar!.arriba >= Math.max(familia!.abajo, severidad!.abajo), '«Quitar filtros», debajo de los filtros');
    assert.ok(cuenta!.izquierda > quitar!.derecha && Math.abs(cuenta!.arriba + cuenta!.alto / 2 - (quitar!.arriba + quitar!.alto / 2)) <= 1, 'el recuento, en la misma fila, a la derecha');
  });

  test('6 · a 390: el botón «Filtros» con el recuento al lado, sin los filtros; las tarjetas a todo el ancho; a 320, sin scroll horizontal', async () => {
    await anchoDe(390);
    const pestana = await p();
    const [boton, cuenta, panel, main, tarjeta] = await Promise.all(['#abrir-filtros', '#recuento', '#panel-filtros', 'main', '#reglas > li'].map(caja));
    assert.deepEqual([boton!.visible, await pestana.evaluar(`document.getElementById('abrir-filtros').textContent`), panel!.visible], [true, textos.FILTROS, false]);
    assert.ok(cuenta!.izquierda > boton!.derecha, 'el recuento, a la derecha del botón');
    assert.equal(tarjeta!.ancho, main!.ancho, 'la tarjeta, a todo el ancho');
    await anchoDe(320);
    const [contenido, util] = await pestana.evaluar<[number, number]>(`[document.documentElement.scrollWidth, document.documentElement.clientWidth]`);
    assert.ok(contenido <= util, `${contenido} de contenido en ${util} de ancho`);
    await anchoDe(390);
  });

  test('7 · la hoja: modal, con nombre, el foco en el título, abajo a todo el ancho y al 60 % (90 % con el asa); el velo; lo demás, inerte; Tab da la vuelta', async () => {
    const pestana = await p();
    await pulsar('#abrir-filtros');
    const estado = await pestana.evaluar<{ rol: string | null; modal: string | null; nombre: string; foco: string; expandido: string | null; velo: boolean; inertes: boolean[] }>(`(() => {
      const panel = document.getElementById('panel-filtros');
      return {
        rol: panel.getAttribute('role'), modal: panel.getAttribute('aria-modal'), nombre: document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent ?? '',
        foco: document.activeElement.id, expandido: document.getElementById('abrir-filtros').getAttribute('aria-expanded'), velo: document.getElementById('velo').checkVisibility(),
        inertes: ['header a', '#buscar', '#abrir-filtros', '#reglas a'].map((s) => document.querySelector(s).closest('[inert]') !== null),
      };
    })()`);
    assert.deepEqual(estado, { rol: 'dialog', modal: 'true', nombre: textos.FILTROS, foco: 'titulo-filtros', expandido: 'true', velo: true, inertes: [true, true, true, true] });
    const hoja = await pestana.evaluar<{ abajo: number; izquierda: number; ancho: number; alto: number; util: number; maximo: string }>(
      `(() => { const p = document.getElementById('panel-filtros'); const r = p.getBoundingClientRect(); return { abajo: r.bottom, izquierda: r.left, ancho: r.width, alto: r.height, util: document.documentElement.clientWidth, maximo: getComputedStyle(p).maxHeight }; })()`,
    );
    assert.deepEqual([Math.round(hoja.abajo), hoja.izquierda, hoja.ancho, hoja.maximo], [ALTO, 0, hoja.util, '60%'], 'abajo, a todo el ancho, como mucho al 60 %');
    assert.ok(hoja.alto <= ALTO * 0.6 + 1, `alto ${hoja.alto}`);
    assert.equal(await pestana.evaluar(`document.querySelector('#panel-filtros .asa').getAttribute('aria-label')`), textos.CAMBIAR_TAMANO);
    await pulsar('#panel-filtros .asa');
    assert.deepEqual(await estilo('#panel-filtros', ['max-height']), ['90%'], 'con el asa, al 90 %');
    await pulsar('#panel-filtros .asa');
    assert.deepEqual(await estilo('#panel-filtros', ['max-height']), ['60%'], 'otro toque la devuelve');
    const enfocables = await pestana.evaluar<number>(`[...document.querySelectorAll('#panel-filtros button, #panel-filtros input')].filter((x) => x.checkVisibility()).length`);
    for (let i = 0; i < enfocables + 2; i++) {
      await tecla('Tab', 'Tab', 9, i % 3 === 2 ? 8 : 0);
      assert.equal(await pestana.evaluar(`!!document.activeElement.closest('#panel-filtros')`), true, `el foco sigue en la hoja (Tab ${i + 1})`);
    }
  });

  test('8 · «Aplicar» filtra y cierra; Escape, la X y el velo cierran sin aplicar; «Quitar filtros» desmarca el borrador; el foco, de vuelta al botón', async () => {
    const pestana = await p();
    const [a, b] = indice.familias;
    const total = textos.recuentoDeReglas(entradas.length);
    const deA = entradas.filter((e) => `${e.paquete.nombre}::${e.familia.id}` === a!.clave).length;
    const cerrada = `(() => { const p = document.getElementById('panel-filtros'); return [p.classList.contains('hoja'), p.hasAttribute('role'), document.getElementById('velo').checkVisibility(), document.activeElement.id, document.getElementById('abrir-filtros').getAttribute('aria-expanded'), document.querySelectorAll('[inert]').length]; })()`;
    await pulsar(casilla('familia', a!.clave));
    assert.equal(await recuento(), total, 'en la hoja, marcar no filtra');
    await pulsar('#aplicar-filtros');
    assert.deepEqual(await pestana.evaluar(cerrada), [false, false, false, 'abrir-filtros', 'false', 0], '«Aplicar» la cierra y el foco vuelve al botón');
    assert.deepEqual([await recuento(), await pestana.evaluar(`document.getElementById('abrir-filtros').textContent`)], [textos.recuentoDeReglas(deA), textos.filtrosMarcados(1)]);
    const marcadas = `[...document.querySelectorAll('#panel-filtros input:checked')].map((c) => c.value)`;
    for (const [como, cerrar] of [
      ['Escape', () => tecla('Escape', 'Escape', 27)],
      ['la X', () => pulsar('#panel-filtros .cerrar')],
      ['el velo', () => pulsar('#velo')],
    ] as const) {
      await pulsar('#abrir-filtros');
      await pulsar(casilla('familia', b!.clave));
      await cerrar();
      assert.deepEqual([await pestana.evaluar(marcadas), await recuento(), (await pestana.evaluar<unknown[]>(cerrada))[3]], [[a!.clave], textos.recuentoDeReglas(deA), 'abrir-filtros'], `${como} la cierra sin aplicar`);
    }
    await pulsar('#abrir-filtros');
    await pulsar('#quitar-filtros');
    assert.deepEqual([await pestana.evaluar(marcadas), await recuento()], [[], textos.recuentoDeReglas(deA)], '«Quitar filtros» desmarca el borrador, sin filtrar');
    await pulsar('#aplicar-filtros');
    assert.deepEqual([await recuento(), await pestana.evaluar(`document.getElementById('abrir-filtros').textContent`)], [total, textos.FILTROS]);
  });

  test('9 · al ensanchar con la hoja abierta, se cierra sin aplicar y el recuento vuelve junto a «Quitar filtros»', async () => {
    const pestana = await p();
    await pulsar('#abrir-filtros');
    await pulsar(casilla('familia', indice.familias[0]!.clave));
    await anchoDe(1280, 900);
    assert.deepEqual(
      await pestana.evaluar(`(() => { const p = document.getElementById('panel-filtros'); return [p.classList.contains('hoja'), p.hasAttribute('role'), document.querySelectorAll('#panel-filtros input:checked').length, document.querySelectorAll('[inert]').length, document.getElementById('velo').checkVisibility()]; })()`),
      [false, false, 0, 0, false],
    );
    assert.equal(await recuento(), textos.recuentoDeReglas(entradas.length));
  });

  test('10 · ninguna petición de red después de la carga y ninguna violación de la CSP', async () => {
    await p();
    assert.deepEqual(sesion!.despues, []);
    assert.deepEqual(await sesion!.violaciones(), []);
  });
});
