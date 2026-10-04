/**
 * El orden del foco es el orden que se ve (encargo 10.4, Tanda 3; corrección de
 * Antonio en la parada 2 de la Tanda 2): en el móvil, los botones del
 * formulario se veían antes que «Paquetes» pero el tabulador los recorría
 * después (order de CSS). En Chrome sobre astro preview, en cada estado se
 * pulsa Tab de verdad desde el principio de la página hasta el final y la
 * secuencia de focos tiene que ser la del orden visual: de arriba abajo por
 * filas y, en una fila, de izquierda a derecha; en el escritorio con
 * resultado, columna a columna (la cabecera, la del texto, la del resultado,
 * el pie). De cada elemento cuenta su primer trozo (getClientRects()[0]): un
 * tramo que se parte entre dos líneas está donde empieza; un panel de
 * pestaña enfocable, que contiene lo demás, por su borde de arriba; y el
 * sitio es el del contenido: lo desplazado en la página y en la columna del
 * resultado, que tiene scroll propio, se suma.
 *
 *   1. A 1280, antes de analizar, con «Paquetes» plegado y abierto.
 *   2. A 390, antes de analizar, con «Paquetes» plegado y abierto.
 *   3. A 390, con el resultado de combinacion-real (pestaña Texto).
 *   4. A 1280, con el resultado: columna a columna.
 *   5. A 820, con el resultado (una columna, los bloques en el orden del
 *      modelo).
 *
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html
 *    — 1.3.2: «When the sequence in which content is presented affects its
 *    meaning, a correct reading sequence can be programmatically
 *    determined».
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html — 2.4.3:
 *    «If a Web page can be navigated sequentially and the navigation
 *    sequences affect meaning or operation, focusable components receive
 *    focus in an order that preserves meaning and operability».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/order
 *    — «will create a disconnect between the visual presentation of content
 *    and DOM order».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects
 *    — en un elemento en línea, un rectángulo por cada caja de línea.
 * [DOC] https://github.com/ChromeDevTools/devtools-protocol (json/
 *    browser_protocol.json) — Input.dispatchKeyEvent.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

interface Foco {
  nombre: string;
  /** 0 la cabecera, 1 lo de la columna del texto (o la página en una columna), 2 la columna del resultado, 3 el pie. */
  region: number;
  arriba: number;
  abajo: number;
  izquierda: number;
}

/** El orden visual: por región; en cada una, por filas (mismo renglón si se solapan en más de la mitad del más bajo) y de izquierda a derecha. */
function ordenVisual(focos: readonly Foco[], porColumnas: boolean): string[] {
  const grupos = new Map<number, Foco[]>();
  for (const f of focos) {
    const r = porColumnas ? f.region : f.region === 3 ? 3 : f.region === 0 ? 0 : 1;
    grupos.set(r, [...(grupos.get(r) ?? []), f]);
  }
  return [...grupos.keys()]
    .sort((a, b) => a - b)
    .flatMap((r) => {
      const filas: Foco[][] = [];
      for (const f of [...grupos.get(r)!].sort((a, b) => a.arriba - b.arriba)) {
        const fila = filas.at(-1);
        const solape = fila === undefined ? 0 : Math.min(f.abajo, fila[0]!.abajo) - Math.max(f.arriba, fila[0]!.arriba);
        if (fila !== undefined && solape > Math.min(f.abajo - f.arriba, fila[0]!.abajo - fila[0]!.arriba) / 2) fila.push(f);
        else filas.push([f]);
      }
      return filas.flatMap((fila) => fila.sort((a, b) => a.izquierda - b.izquierda).map((f) => f.nombre));
    });
}

describe('el orden del foco es el que se ve, en Chrome sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  /** Cambia el ancho y espera a que la página lo haya recibido (las pestañas solo existen con resultado y en el móvil). */
  const anchoDe = async (ancho: number): Promise<void> => {
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await pestana.hasta(`document.body.classList.contains('con-pestanas') === (!document.getElementById('resultado').hidden && innerWidth <= 768)`, `el ancho de ${ancho}, asentado`);
  };
  /** Tab desde el principio de la página hasta que el foco sale de ella o da la vuelta; cada foco, con su sitio. */
  const recorrer = async (): Promise<Foco[]> => {
    const pestana = await p();
    // El punto de partida de la navegación secuencial, al principio de <body>.
    await pestana.evaluar(`(() => { scrollTo(0, 0); document.body.tabIndex = -1; document.body.focus(); document.body.removeAttribute('tabindex'); })()`);
    const focos: Foco[] = [];
    const vistos = new Set<string>();
    for (let i = 0; i < 300; i++) {
      for (const type of ['keyDown', 'keyUp']) await pestana.cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      const f = await pestana.evaluar<Foco | null>(`(() => {
        const e = document.activeElement;
        if (e === null || e === document.body) return null;
        if (!e.dataset.ordenDelFoco) e.dataset.ordenDelFoco = String(document.querySelectorAll('[data-orden-del-foco]').length + 1);
        const primero = e.getClientRects()[0] ?? e.getBoundingClientRect();
        // Un panel enfocable contiene lo demás: cuenta por su borde de arriba.
        const r = e.matches('[role="tabpanel"]') ? { top: primero.top, bottom: primero.top + 1, left: primero.left } : primero;
        // El sitio en el contenido, no en la ventana: más lo desplazado de la página y de cada caja con scroll propio (la columna del resultado).
        let dy = scrollY;
        let dx = scrollX;
        for (let x = e.parentElement; x !== null && x !== document.body && x !== document.documentElement; x = x.parentElement) {
          dy += x.scrollTop;
          dx += x.scrollLeft;
        }
        const texto = (e.getAttribute('aria-label') ?? e.textContent ?? '').trim().replace(/\\s+/g, ' ').slice(0, 30);
        return {
          nombre: '#' + e.dataset.ordenDelFoco + ' ' + (e.id ? e.id : e.tagName.toLowerCase() + ' «' + texto + '»'),
          region: e.closest('header') ? 0 : e.closest('footer') ? 3 : e.closest('#columna-resultado') ? 2 : 1,
          arriba: r.top + dy, abajo: r.bottom + dy, izquierda: r.left + dx,
        };
      })()`);
      if (f === null || vistos.has(f.nombre)) break;
      vistos.add(f.nombre);
      focos.push(f);
    }
    await pestana.evaluar(`document.querySelectorAll('[data-orden-del-foco]').forEach((e) => delete e.dataset.ordenDelFoco)`);
    return focos;
  };
  const juzgar = async (que: string, porColumnas = false): Promise<void> => {
    const focos = await recorrer();
    assert.ok(focos.length >= 4, `${que}: el tabulador recorre la página (${focos.length} focos)`);
    assert.deepEqual(
      focos.map((f) => f.nombre),
      ordenVisual(focos, porColumnas),
      `${que}: el orden del tabulador (a la izquierda) es el que se ve (a la derecha)`,
    );
  };
  const paquetes = async (abierto: boolean): Promise<void> => {
    await (await p()).evaluar(`document.getElementById('paquetes').open = ${abierto}`);
  };
  const analizar = async (): Promise<void> => {
    const pestana = await p();
    await pestana.evaluar(`(() => {
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
  };

  test('1 · a 1280, antes de analizar, con «Paquetes» plegado y abierto', async () => {
    await anchoDe(1280);
    await juzgar('a 1280, plegado');
    await paquetes(true);
    await juzgar('a 1280, abierto');
    await paquetes(false);
  });

  test('2 · a 390, antes de analizar, con «Paquetes» plegado y abierto', async () => {
    await anchoDe(390);
    await juzgar('a 390, plegado');
    await paquetes(true);
    await juzgar('a 390, abierto');
    await paquetes(false);
  });

  test('3 · a 390, con el resultado (pestaña Texto)', async () => {
    await analizar();
    await anchoDe(390);
    await juzgar('a 390, con el resultado');
  });

  test('4 · a 1280, con el resultado: columna a columna', async () => {
    await anchoDe(1280);
    await juzgar('a 1280, con el resultado', true);
  });

  test('5 · a 820, con el resultado', async () => {
    await anchoDe(820);
    await juzgar('a 820, con el resultado');
    await anchoDe(1280);
  });
});
