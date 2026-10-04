/**
 * Los jueces de la base de la interfaz en Chrome (encargo 10.4, Tanda 1;
 * DISEÑO §4, §5 y §7), sobre astro preview y una pestaña de Chrome headless
 * con el arranque de chrome.ts. Los tests van en orden y comparten la pestaña.
 *
 *   1. La letra y la escala, a 1280: la interfaz en Atkinson 16/24 y tinta;
 *      el cuadro de texto en Literata 18/27 con borde ink-2 y radio 8; un
 *      título de sección a 20/26 en negrita; lo secundario a 15 en ink-2.
 *   2. Desactivado, distinto del activo (DISEÑO §4, 04/10): «Descargar
 *      informe» antes de analizar y «Pon tu texto a contraluz» sin paquetes,
 *      con fondo card, borde line discontinuo, texto ink-2 y cursor
 *      not-allowed; el principal, sin el índigo.
 *   3. Los botones, de 44 px como mínimo y radio 6: el principal, índigo con
 *      texto blanco; los demás, con borde ink-2.
 *   4. El foco con el teclado: anillo de 2 px en el acento, a 2 px.
 *   5. La columna de texto mide 34em (544 px) y el texto analizado sale a
 *      60-66 caracteres por línea de media (DISEÑO §5), contados en Chrome
 *      carácter a carácter con el texto de Antonio.
 *   6. En móvil (390), el botón principal mide 48 de alto y ocupa el ancho
 *      de la columna.
 *
 * [DOC] https://github.com/ChromeDevTools/devtools-protocol (json/
 *    browser_protocol.json) — Input.dispatchKeyEvent («Dispatches a key event
 *    to the page»); Emulation.setDeviceMetricsOverride.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Range/getClientRects
 *    — «a list of DOMRect objects representing the area of the screen
 *    occupied by the range»: el de un rango de un carácter dice en qué línea
 *    cae (por su borde de arriba).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EJEMPLOS_PUBLICOS } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const TINTA = 'rgb(26, 26, 26)';
const TINTA_2 = 'rgb(74, 74, 74)';
const ACENTO = 'rgb(51, 34, 136)';
const BLANCO = 'rgb(255, 255, 255)';
const CARD = 'rgb(245, 245, 245)';
const LINEA = 'rgb(217, 217, 217)';

interface Estilo {
  familia: string;
  tam: string;
  peso: string;
  alto: string;
  color: string;
  fondo: string;
  borde: string;
  radio: string;
  relleno: string;
  cursor: string;
  ancho: number;
  altura: number;
}

describe('la base de la interfaz en Chrome, sobre astro preview', () => {
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
  const estilo = async (selector: string): Promise<Estilo> =>
    (await p()).evaluar<Estilo>(`(() => {
      const e = document.querySelector(${JSON.stringify(selector)});
      const c = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return { familia: c.fontFamily.split(',')[0].replace(/"/g, ''), tam: c.fontSize, peso: c.fontWeight, alto: c.lineHeight, color: c.color, fondo: c.backgroundColor,
        borde: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, radio: c.borderRadius, relleno: c.padding, cursor: c.cursor, ancho: r.width, altura: r.height };
    })()`);

  test('1 · la letra y la escala, a 1280', async () => {
    await anchoDe(1280);
    const cuerpo = await estilo('body');
    assert.deepEqual([cuerpo.familia, cuerpo.tam, cuerpo.alto, cuerpo.color], ['Atkinson Hyperlegible Next', '16px', '24px', TINTA], 'la interfaz');
    const cuadro = await estilo('#texto');
    assert.deepEqual([cuadro.familia, cuadro.tam, cuadro.alto, cuadro.color, cuadro.borde, cuadro.radio, cuadro.relleno], ['Literata', '18px', '27px', TINTA, `1px solid ${TINTA_2}`, '8px', '16px'], 'el cuadro de texto');
    const titulo = await estilo('#titulo-resultado');
    assert.deepEqual([titulo.familia, titulo.tam, titulo.alto, titulo.peso], ['Atkinson Hyperlegible Next', '20px', '26px', '700'], 'un título de sección');
    const secundario = await estilo('.procedencia');
    assert.deepEqual([secundario.tam, secundario.alto, secundario.color], ['15px', '21.75px', TINTA_2], 'lo secundario');
  });

  test('2 · desactivado, distinto del activo: fondo card, borde line discontinuo, texto ink-2 y cursor not-allowed', async () => {
    const pestana = await p();
    const informe = await estilo('#informe');
    assert.equal(await pestana.evaluar(`document.getElementById('informe').disabled`), true, '«Descargar informe», desactivado antes de analizar');
    assert.deepEqual([informe.fondo, informe.borde, informe.color, informe.cursor], [CARD, `1px dashed ${LINEA}`, TINTA_2, 'not-allowed'], 'secundario desactivado');
    const activo = await estilo('#ejemplo-humano');
    assert.deepEqual([activo.fondo, activo.borde, activo.color, activo.cursor], [BLANCO, `1px solid ${TINTA_2}`, TINTA, 'pointer'], 'secundario activo');
    // Sin paquetes activos, el principal se desactiva (8.1): pierde el índigo.
    await pestana.evaluar(`document.querySelectorAll('#incluidos input[type=checkbox]').forEach((c) => { c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); })`);
    await pestana.hasta(`document.getElementById('analizar').disabled`, 'el principal, desactivado sin paquetes');
    const principal = await estilo('#analizar');
    assert.deepEqual([principal.fondo, principal.borde, principal.color, principal.cursor], [CARD, `1px dashed ${LINEA}`, TINTA_2, 'not-allowed'], 'principal desactivado');
    await pestana.evaluar(`document.querySelectorAll('#incluidos input[type=checkbox]').forEach((c) => { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); })`);
    await pestana.hasta(`!document.getElementById('analizar').disabled`, 'el principal, activo otra vez');
  });

  test('3 · los botones: 44 px como mínimo y radio 6; el principal, índigo con texto blanco; los demás, con borde ink-2', async () => {
    const principal = await estilo('#analizar');
    assert.deepEqual([principal.fondo, principal.color, principal.borde, principal.radio, principal.peso], [ACENTO, BLANCO, `1px solid ${ACENTO}`, '6px', '700'], 'el principal');
    assert.ok(principal.altura >= 44, `el principal mide ${principal.altura} de alto`);
    const secundario = await estilo('#ejemplo-humano');
    assert.deepEqual([secundario.radio, secundario.peso, secundario.relleno], ['6px', '700', '0px 20px'], 'un secundario');
    assert.ok(secundario.altura >= 44, `el secundario mide ${secundario.altura} de alto`);
  });

  test('4 · el foco con el teclado: anillo de 2 px en el acento, a 2 px', async () => {
    const pestana = await p();
    await pestana.evaluar(`document.getElementById('ejemplo-humano').scrollIntoView(); document.getElementById('texto').focus()`);
    for (const type of ['keyDown', 'keyUp']) await pestana.cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    const foco = await pestana.evaluar<{ id: string; anillo: string; separacion: string }>(`(() => {
      const e = document.activeElement;
      const c = getComputedStyle(e);
      return { id: e.id, anillo: c.outlineWidth + ' ' + c.outlineStyle + ' ' + c.outlineColor, separacion: c.outlineOffset };
    })()`);
    assert.equal(foco.id, 'ejemplo-humano', 'el Tab lleva del cuadro al primer ejemplo');
    assert.deepEqual([foco.anillo, foco.separacion], [`2px solid ${ACENTO}`, '2px']);
  });

  test('5 · la columna de texto mide 34em (544 px) y el texto analizado sale a 60-66 caracteres por línea', async (t) => {
    const pestana = await p();
    assert.equal((await estilo('#formulario')).ancho, 544, 'la columna de texto');
    const texto = readFileSync(new URL('antonio.txt', EJEMPLOS_PUBLICOS), 'utf8');
    await pestana.evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(texto)};
      document.getElementById('genero').value = 'opinion';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    // Cada carácter de la vista, agrupado por la línea en que cae; la última línea de cada párrafo no cuenta.
    const llenas = await pestana.evaluar<number[]>(`(() => {
      const recorrido = document.createTreeWalker(document.getElementById('vista'), NodeFilter.SHOW_TEXT);
      const rango = document.createRange();
      const lineas = [];
      let actual = null;
      for (let n = recorrido.nextNode(); n !== null; n = recorrido.nextNode()) {
        for (let i = 0; i < n.data.length; i++) {
          if (n.data[i] === '\\n') {
            if (actual !== null) lineas.push({ ...actual, ultima: true });
            actual = null;
            continue;
          }
          rango.setStart(n, i);
          rango.setEnd(n, i + 1);
          const caja = rango.getClientRects()[0];
          if (caja === undefined) continue;
          if (actual === null || Math.abs(actual.arriba - caja.top) > 4) {
            if (actual !== null) lineas.push(actual);
            actual = { arriba: caja.top, caracteres: 0 };
          }
          actual.caracteres++;
        }
      }
      return lineas.filter((l) => !l.ultima).map((l) => l.caracteres);
    })()`);
    const media = llenas.reduce((a, b) => a + b, 0) / llenas.length;
    t.diagnostic(`${llenas.length} líneas llenas; media ${media.toFixed(1)} caracteres (de ${Math.min(...llenas)} a ${Math.max(...llenas)})`);
    assert.ok(llenas.length > 10, 'el juez no vio líneas');
    assert.ok(media >= 60 && media <= 66, `media de ${media.toFixed(1)} caracteres por línea`);
  });

  test('6 · en móvil (390), el botón principal mide 48 de alto y ocupa el ancho de la columna', async () => {
    await anchoDe(390);
    const principal = await estilo('#analizar');
    const columna = await estilo('#formulario');
    assert.equal(principal.altura, 48, 'alto del principal');
    assert.equal(principal.ancho, columna.ancho, 'ancho del principal frente al de la columna');
  });
});
