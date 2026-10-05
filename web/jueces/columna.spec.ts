/**
 * La columna del resultado con scroll propio (encargo 10.4, Tanda 3; decisión
 * de Antonio en la parada 2 de la Tanda 2; DISEÑO §6.1), en Chrome sobre astro
 * preview, a 1280 × 800 y con el texto de combinacion-real (el de las cinco
 * claves, el del modelo). Los tests van en orden y comparten la pestaña.
 *
 *   1. En escritorio la columna es sticky a 16 px y, ya fija, va de 16 a 16 del
 *      borde de abajo de la ventana; su contenido es más alto que ella (tiene
 *      scroll propio) y mide 360 de ancho (la pastilla), sin scroll horizontal.
 *   2. Con la rueda del ratón sobre la columna se llega a «Analizar otro
 *      texto» sin bajar al final del texto: el botón se ve entero, dentro de
 *      la columna y de la ventana, y el final de la vista sigue por debajo de
 *      la ventana.
 *   3. Con el teclado (Tab desde la etiqueta del resultado) se recorre la
 *      columna hasta «Analizar otro texto»: cada foco dentro de la columna se
 *      ve, y su anillo (el contorno más su desplazamiento) cabe entero en lo
 *      que la columna enseña y en la ventana; tampoco aquí hace falta bajar al
 *      final del texto.
 *   4. En la tableta (820) y en el móvil (390) la columna no es sticky ni
 *      tiene scroll propio.
 *
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html — 2.1.1:
 *    «All functionality of the content is operable through a keyboard
 *    interface».
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html —
 *    2.4.7: «Any keyboard operable user interface has a mode of operation
 *    where the keyboard focus indicator is visible».
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Input/ —
 *    Input.dispatchMouseEvent (type «mouseWheel», con deltaX y deltaY) e
 *    Input.dispatchKeyEvent.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
 *    — «includes padding but excludes borders, margins, and vertical
 *    scrollbars (if present)»: lo que la columna enseña es su caja menos el
 *    borde (clientLeft, clientTop) y menos la barra.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const ALTO = 800;

interface Rect {
  izquierda: number;
  arriba: number;
  derecha: number;
  abajo: number;
}

/** Lo que la columna enseña (su caja de relleno sin la barra), en coordenadas de la ventana. */
const VENTANA_DE_LA_COLUMNA = `(() => { const c = document.getElementById('columna-resultado'); const r = c.getBoundingClientRect(); const izquierda = r.left + c.clientLeft; const arriba = r.top + c.clientTop; return { izquierda, arriba, derecha: izquierda + c.clientWidth, abajo: arriba + c.clientHeight }; })()`;

const dentro = (a: Rect, b: Rect): boolean => a.izquierda >= b.izquierda - 0.5 && a.arriba >= b.arriba - 0.5 && a.derecha <= b.derecha + 0.5 && a.abajo <= b.abajo + 0.5;
const texto = (r: Rect): string => `${Math.round(r.izquierda)},${Math.round(r.arriba)} → ${Math.round(r.derecha)},${Math.round(r.abajo)}`;

describe('la columna del resultado con scroll propio, en Chrome sobre astro preview', () => {
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
    await (await p()).cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: ALTO, deviceScaleFactor: 1, mobile: ancho < 769 });
    await (await p()).hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
  };
  const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
  /** Espera a que el scroll de la ventana y el de la columna se queden quietos (la rueda puede ir con animación). */
  const quieto = async (): Promise<void> => {
    const pestana = await p();
    const leer = (): Promise<string> => pestana.evaluar<string>(`scrollY + ' ' + document.getElementById('columna-resultado').scrollTop`);
    let antes = await leer();
    for (let i = 0; i < 40; i++) {
      await esperar(100);
      const ahora = await leer();
      if (ahora === antes) return;
      antes = ahora;
    }
  };
  const alPrincipio = async (): Promise<void> => {
    await (await p()).evaluar(`(() => { scrollTo(0, 0); document.getElementById('columna-resultado').scrollTop = 0; })()`);
    await quieto();
  };
  /** Cuánto queda la vista (el final del texto) por debajo del borde de abajo de la ventana. */
  const finalDelTextoPorDebajo = async (): Promise<number> => (await p()).evaluar<number>(`document.getElementById('vista').getBoundingClientRect().bottom - innerHeight`);

  test('1 · en escritorio: sticky a 16, de 16 a 16 de la ventana, con scroll propio y 360 de contenido', async () => {
    await anchoDe(1280);
    const pestana = await p();
    await pestana.evaluar(`(() => {
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    assert.deepEqual(await pestana.evaluar(`(() => { const c = getComputedStyle(document.getElementById('columna-resultado')); return [c.position, c.top, c.overflowY]; })()`), ['sticky', '16px', 'auto']);
    await pestana.evaluar(`scrollTo(0, 400)`);
    await quieto();
    const fija = await pestana.evaluar<{ arriba: number; abajo: number; scrollHeight: number; clientHeight: number; scrollWidth: number; clientWidth: number; pastilla: number }>(
      `(() => { const c = document.getElementById('columna-resultado'); const r = c.getBoundingClientRect(); return { arriba: r.top, abajo: innerHeight - r.bottom, scrollHeight: c.scrollHeight, clientHeight: c.clientHeight, scrollWidth: c.scrollWidth, clientWidth: c.clientWidth, pastilla: document.querySelector('#medidor .pastilla').getBoundingClientRect().width }; })()`,
    );
    assert.deepEqual([fija.arriba, fija.abajo], [16, 16], 'ya fija, a 16 de arriba y a 16 de abajo de la ventana');
    assert.ok(fija.scrollHeight > fija.clientHeight, `con scroll propio: ${fija.scrollHeight} de contenido en ${fija.clientHeight} de alto`);
    assert.ok(fija.scrollWidth <= fija.clientWidth, `sin scroll horizontal: ${fija.scrollWidth} en ${fija.clientWidth}`);
    assert.equal(fija.pastilla, 360, 'el contenido, 360 de ancho');
  });

  test('2 · con la rueda sobre la columna se llega a «Analizar otro texto» sin bajar al final del texto', async () => {
    const pestana = await p();
    await alPrincipio();
    const punto = await pestana.evaluar<{ x: number; y: number }>(`(() => { const r = document.getElementById('columna-resultado').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(Math.min(r.top + 120, innerHeight - 60)) }; })()`);
    let visto = false;
    for (let i = 0; i < 25 && !visto; i++) {
      await pestana.cdp('Input.dispatchMouseEvent', { type: 'mouseWheel', x: punto.x, y: punto.y, deltaX: 0, deltaY: 300 });
      await quieto();
      visto = await pestana.evaluar<boolean>(`(() => {
        const b = document.getElementById('otro'); const r = b.getBoundingClientRect(); const v = ${VENTANA_DE_LA_COLUMNA};
        const enVentana = r.top >= 0 && r.bottom <= innerHeight; const enColumna = r.top >= v.arriba && r.bottom <= v.abajo;
        return enVentana && enColumna && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === b;
      })()`);
    }
    assert.ok(visto, '«Analizar otro texto» se ve entero, dentro de la columna y de la ventana');
    const debajo = await finalDelTextoPorDebajo();
    assert.ok(debajo > 0, `sin bajar al final del texto: la vista acaba ${Math.round(debajo)} px por debajo de la ventana`);
  });

  test('3 · con Tab se recorre la columna hasta «Analizar otro texto» y cada foco se ve entero, con su anillo', async () => {
    const pestana = await p();
    await alPrincipio();
    await pestana.evaluar(`document.querySelector('#medidor .pastilla > .etiqueta').focus()`);
    const vistos: string[] = [];
    for (let i = 0; i < 80; i++) {
      for (const type of ['keyDown', 'keyUp']) await pestana.cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      await quieto();
      const foco = await pestana.evaluar<{ id: string; enColumna: boolean; visible: boolean; contorno: string; anillo: Rect; columna: Rect; ventana: Rect }>(`(() => {
        const e = document.activeElement; const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
        const m = parseFloat(c.outlineWidth) + parseFloat(c.outlineOffset);
        return {
          id: e.id || e.className || e.tagName, enColumna: !!e.closest('#columna-resultado'), visible: e.matches(':focus-visible'), contorno: c.outlineStyle,
          anillo: { izquierda: r.left - m, arriba: r.top - m, derecha: r.right + m, abajo: r.bottom + m },
          columna: ${VENTANA_DE_LA_COLUMNA}, ventana: { izquierda: 0, arriba: 0, derecha: innerWidth, abajo: innerHeight },
        };
      })()`);
      if (!foco.enColumna) continue;
      vistos.push(foco.id);
      assert.ok(foco.visible && foco.contorno !== 'none', `${foco.id}: el foco se ve (${foco.contorno})`);
      assert.ok(dentro(foco.anillo, foco.columna), `${foco.id}: el anillo ${texto(foco.anillo)} cabe en lo que enseña la columna ${texto(foco.columna)}`);
      assert.ok(dentro(foco.anillo, foco.ventana), `${foco.id}: el anillo ${texto(foco.anillo)} cabe en la ventana`);
      if (foco.id === 'otro') break;
    }
    assert.equal(vistos.at(-1), 'otro', `se llega a «Analizar otro texto»: ${vistos.join(' · ')}`);
    assert.ok(vistos.length >= 4, `se recorre la columna: ${vistos.join(' · ')}`);
    const debajo = await finalDelTextoPorDebajo();
    assert.ok(debajo > 0, `sin bajar al final del texto: la vista acaba ${Math.round(debajo)} px por debajo de la ventana`);
  });

  test('4 · en la tableta y en el móvil, la columna no es sticky ni tiene scroll propio', async () => {
    const pestana = await p();
    for (const ancho of [820, 390]) {
      await anchoDe(ancho);
      await esperar(200);
      assert.deepEqual(await pestana.evaluar(`(() => { const c = getComputedStyle(document.getElementById('columna-resultado')); return [c.position, c.overflowY]; })()`), ['static', 'visible'], `a ${ancho}`);
    }
    await anchoDe(1280);
  });
});
