/**
 * Los jueces del ojo de cada familia (encargo 10.4, Tanda 2; DISEÑO §6.1,
 * punto 3, y §7: tarjeta de familia «ocultada con el ojo»).
 *
 *   1. La lógica (capasVisibles): las familias de un tramo que se siguen
 *      viendo, en su orden; ninguna si están todas ocultas.
 *   En Chrome, con el texto de combinacion-real a 1280:
 *   2. Cada tarjeta de familia lleva su ojo: un botón de 44 × 44 con
 *      aria-pressed="false" y de nombre «Ocultar esta capa: familia
 *      (paquete)».
 *   3. Con el teclado (Espacio), el ojo de Discurso oculta su capa: el botón
 *      pasa a aria-pressed="true" sin cambiar de nombre, la tarjeta se
 *      atenúa, los tramos que solo son de Discurso quedan como texto (sin
 *      capa, sin sigla, sin botón ni foco), los demás no cambian y los
 *      recuentos tampoco.
 *   4. En un solape, ocultar la primera familia (Canal en «## ») deja la
 *      segunda (Ortotipografía) con su tinte y su sigla.
 *   5. Pulsarlo otra vez lo deja como estaba.
 *   6. Al volver a analizar, todo se ve otra vez y ningún ojo está pulsado.
 *
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/button/ — toggle button y
 *    aria-pressed; «the label on a toggle does not change when its state
 *    changes»; «Space: Activates the button».
 * [DOC] https://github.com/ChromeDevTools/devtools-protocol (json/
 *    browser_protocol.json) — Input.dispatchKeyEvent.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import { capasVisibles } from '../src/pantalla/familias.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const TOKENS = JSON.parse(readFileSync(new URL('../../docs/figma/tokens.json', import.meta.url), 'utf8')) as { color: Record<string, { $value: { components: number[] } }> };
const rgb = (nombre: string): string => `rgb(${TOKENS.color[nombre]!.$value.components.map((c) => Math.round(c * 255)).join(', ')})`;

describe('el ojo: la lógica', () => {
  test('1 · las familias que se siguen viendo, en su orden; ninguna si están todas ocultas', () => {
    assert.deepEqual(capasVisibles(['a', 'b', 'c'], new Set()), ['a', 'b', 'c']);
    assert.deepEqual(capasVisibles(['a', 'b', 'c'], new Set(['a'])), ['b', 'c']);
    assert.deepEqual(capasVisibles(['a', 'b'], new Set(['a', 'b'])), []);
  });
});

interface Tramo {
  familias: string;
  capas: string[];
  fondo: string | null;
  sigla: string | null;
  rol: string | null;
  foco: string | null;
  nombre: string | null;
}

describe('el ojo en Chrome, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  const analizar = async (): Promise<void> => {
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await pestana.evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
  };
  const tramos = async (): Promise<Tramo[]> =>
    (await p()).evaluar<Tramo[]>(`[...document.querySelectorAll('#vista .tramo')].map((t) => {
      const capas = [...t.querySelectorAll('.capa')];
      return { familias: t.dataset.familias, capas: capas.map((c) => c.className), fondo: capas[0] ? getComputedStyle(capas[0]).backgroundColor : null,
        sigla: t.querySelector('.sigla-tramo')?.textContent ?? null, rol: t.getAttribute('role'), foco: t.getAttribute('tabindex'), nombre: t.getAttribute('aria-label') };
    })`);
  const tarjetas = async (): Promise<[string, string, string, string][]> =>
    (await p()).evaluar(`[...document.querySelectorAll('#leyenda .tarjeta-familia')].map((t) => { const b = t.querySelector('.ojo'); return [t.dataset.familia, b.getAttribute('aria-pressed'), b.getAttribute('aria-label'), t.querySelector('.etiqueta-familia').textContent]; })`);
  const ojo = (familia: string): string => `#leyenda .tarjeta-familia[data-familia="${familia}"] .ojo`;

  test('2 · cada tarjeta, su ojo: un botón de 44 × 44, sin pulsar, con el nombre de su familia y su paquete', async () => {
    await analizar();
    const indice = indexar(paquetesIncluidos());
    const vistas = await tarjetas();
    assert.deepEqual(
      vistas.map(([familia, pulsado, nombre]) => [familia, pulsado, nombre]),
      // En el orden de las tarjetas: por paquete, las que puntúan y después las informativas.
      [...indice.familias.filter((f) => f.paquete === 'RadiografIA' && !f.informativa), ...indice.familias.filter((f) => f.paquete === 'RadiografIA' && f.informativa), ...indice.familias.filter((f) => f.paquete === 'Español correcto')].map((f) => [f.clave, 'false', textos.ocultarCapa(f.nombre, f.paquete)]),
    );
    assert.deepEqual(await (await p()).evaluar(`[...document.querySelectorAll('#leyenda .ojo')].every((b) => b.tagName === 'BUTTON' && b.type === 'button' && b.getBoundingClientRect().width === 44 && b.getBoundingClientRect().height === 44)`), true);
  });

  test('3 · con Espacio, el ojo de Discurso oculta su capa: pulsado, mismo nombre, sus tramos como texto, los demás igual, los recuentos igual', async () => {
    const pestana = await p();
    const antes = await tramos();
    const recuentos = (await tarjetas()).map((t) => t[3]);
    await pestana.evaluar(`document.querySelector(${JSON.stringify(ojo('RadiografIA::discurso'))}).focus()`);
    for (const type of ['keyDown', 'keyUp']) await pestana.cdp('Input.dispatchKeyEvent', { type, key: ' ', code: 'Space', windowsVirtualKeyCode: 32, ...(type === 'keyDown' ? { text: ' ' } : {}) });
    const [, pulsado, nombre] = (await tarjetas()).find((t) => t[0] === 'RadiografIA::discurso')!;
    assert.deepEqual([pulsado, nombre], ['true', textos.ocultarCapa('Discurso', 'RadiografIA')], 'pulsado, con el mismo nombre');
    assert.equal(await pestana.evaluar(`document.querySelector('#leyenda .tarjeta-familia[data-familia="RadiografIA::discurso"]').classList.contains('oculta')`), true);
    const despues = await tramos();
    const soloDiscurso = despues.filter((t) => t.familias === 'RadiografIA::discurso');
    assert.equal(soloDiscurso.length, 7, 'los siete tramos de Discurso');
    assert.deepEqual(soloDiscurso.filter((t) => t.capas.length > 0 || t.sigla !== null || t.rol !== null || t.foco !== null || t.nombre !== null), [], 'sus tramos, texto sin más');
    assert.deepEqual(
      despues.filter((t) => !t.familias.includes('discurso')),
      antes.filter((t) => !t.familias.includes('discurso')),
      'los demás, igual',
    );
    assert.deepEqual((await tarjetas()).map((t) => t[3]), recuentos, 'los recuentos no cambian');
  });

  test('4 · en el solape, ocultar Canal deja Ortotipografía con su tinte y su sigla', async () => {
    const pestana = await p();
    await pestana.evaluar(`document.querySelector(${JSON.stringify(ojo('RadiografIA::canal'))}).click()`);
    const solape = (await tramos()).find((t) => t.familias === 'RadiografIA::canal|Español correcto::ortotipografia');
    assert.ok(solape, 'el solape de «## »');
    assert.deepEqual([solape.capas, solape.fondo, solape.sigla, solape.rol], [['capa fam-ortotipografia'], rgb('tinte-ortotipografia'), 'O', 'button']);
  });

  test('5 · pulsarlo otra vez lo deja como estaba', async () => {
    const pestana = await p();
    for (const familia of ['RadiografIA::discurso', 'RadiografIA::canal']) await pestana.evaluar(`document.querySelector(${JSON.stringify(ojo(familia))}).click()`);
    assert.deepEqual((await tarjetas()).filter((t) => t[1] !== 'false'), [], 'ningún ojo pulsado');
    const todos = await tramos();
    assert.deepEqual(todos.filter((t) => t.capas.length !== t.familias.split('|').length || t.rol !== 'button' || t.foco !== '0' || t.nombre === null), [], 'cada tramo, con sus capas, su botón y su nombre');
  });

  test('6 · al volver a analizar, todo se ve y ningún ojo está pulsado', async () => {
    const pestana = await p();
    await pestana.evaluar(`document.querySelector(${JSON.stringify(ojo('RadiografIA::discurso'))}).click()`);
    await analizar();
    assert.deepEqual((await tarjetas()).filter((t) => t[1] !== 'false'), []);
    assert.deepEqual((await tramos()).filter((t) => t.capas.length === 0), []);
  });
});
