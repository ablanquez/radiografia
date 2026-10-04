/**
 * Los jueces de la hoja inferior del móvil (encargo 10.4, Tanda 2; DISEÑO
 * §2 y §6.2), en Chrome a 390 × 844, sobre astro preview, con el texto de
 * combinacion-real.
 *
 *   1. Tocar un tramo abre la hoja: un diálogo modal (aria-modal) con nombre
 *      (su título), el foco en el título, pegada abajo y a todo el ancho, de
 *      como mucho el 60 % de la pantalla; el resto de la página, inerte.
 *   2. El velo (negro al 40 %) cubre la pantalla, y el tramo activo queda por
 *      encima del velo y por encima del borde de la hoja: no lo tapa (2.4.11).
 *   3. El asa «Cambiar tamaño» (un botón de 44 de alto a todo el ancho) la
 *      pasa al 40 % con un toque, y otro toque la devuelve (2.5.7).
 *   4. «Anterior» y «Siguiente», uno debajo de otro, a todo el ancho y de 44
 *      de alto como mínimo.
 *   5. Tab y Mayúsculas+Tab dan la vuelta dentro de la hoja.
 *   6. Escape la cierra, el foco vuelve al tramo y la página deja de estar
 *      inerte; tocar el velo también la cierra.
 *
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — aria-modal,
 *    Tab que da la vuelta dentro, Escape y el foco de vuelta.
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
 *    — 2.4.11: el componente con el foco no queda «entirely hidden» por
 *    contenido del autor; aquí, el tramo activo no queda bajo la hoja.
 * [DOC] https://github.com/ChromeDevTools/devtools-protocol (json/
 *    browser_protocol.json) — Page.captureScreenshot con clip: el color de un
 *    punto, lo que de verdad se ve (lo inerte no entra en elementFromPoint).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import * as textos from '../src/textos.ts';
import { TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const TOKENS = JSON.parse(readFileSync(new URL('../../docs/figma/tokens.json', import.meta.url), 'utf8')) as { color: Record<string, { $value: { components: number[]; alpha?: number } }> };
const ALTO = 844;

describe('la hoja inferior en el móvil, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  const tecla = async (key: string, code: string, windowsVirtualKeyCode: number, modifiers = 0): Promise<void> => {
    for (const type of ['keyDown', 'keyUp']) await (await p()).cdp('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode, modifiers });
  };
  const ADEMAS = `[...document.querySelectorAll('#vista .tramo')].find((t) => t.textContent.startsWith('Además'))`;
  /**
   * El color de un punto de la página (en sus coordenadas: con el desplazamiento): una captura de 1 × 1 en PNG. Con un solo píxel, los filtros de PNG no cambian
   * nada (los vecinos valen 0), y los bytes descomprimidos son el filtro y el color.
   * [DOC] https://www.w3.org/TR/png-3/ — IHDR (ancho, alto, profundidad 8, tipo de color 2 RGB o 6 RGBA), IDAT con zlib,
   *    y cada fila empieza por el byte de su filtro.
   */
  const pixel = async (x: number, y: number): Promise<number[]> => {
    const { data } = (await (await p()).cdp('Page.captureScreenshot', { format: 'png', clip: { x, y, width: 1, height: 1, scale: 1 } })) as { data: string };
    const png = Buffer.from(data, 'base64');
    const idat: Buffer[] = [];
    let tipo = 0;
    for (let i = 8; i < png.length; ) {
      const largo = png.readUInt32BE(i);
      const nombre = png.toString('latin1', i + 4, i + 8);
      if (nombre === 'IHDR') tipo = png[i + 8 + 9]!;
      if (nombre === 'IDAT') idat.push(png.subarray(i + 8, i + 8 + largo));
      i += 12 + largo;
    }
    const crudo = inflateSync(Buffer.concat(idat));
    return [...crudo.subarray(1, tipo === 6 ? 5 : 4)];
  };
  const hoja = async (): Promise<{ arriba: number; abajo: number; izquierda: number; ancho: number; alto: number }> =>
    (await p()).evaluar(`(() => { const r = document.getElementById('tarjeta').getBoundingClientRect(); return { arriba: r.top, abajo: r.bottom, izquierda: r.left, ancho: r.width, alto: r.height }; })()`);

  test('1 · tocar un tramo abre la hoja: modal, con nombre y el foco en el título, abajo, a todo el ancho y como mucho al 60 %; lo demás, inerte', async () => {
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: ALTO, deviceScaleFactor: 1, mobile: true });
    await pestana.evaluar(`(() => {
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`document.querySelectorAll('#vista .tramo').length > 0`, 'los subrayados');
    await pestana.evaluar(`${ADEMAS}.click()`);
    assert.deepEqual(
      await pestana.evaluar(`(() => { const t = document.getElementById('tarjeta'); return [t.checkVisibility(), t.getAttribute('role'), t.getAttribute('aria-modal'), document.getElementById(t.getAttribute('aria-labelledby')).textContent, document.activeElement === t.querySelector('h2')]; })()`),
      [true, 'dialog', 'true', 'Conector repetido', true],
    );
    const h = await hoja();
    const util = await pestana.evaluar<number>('document.documentElement.clientWidth');
    assert.deepEqual([Math.round(h.abajo), Math.round(h.izquierda), Math.round(h.ancho)], [ALTO, 0, util], 'abajo y a todo el ancho');
    assert.ok(h.alto <= ALTO * 0.6 + 1, `como mucho el 60 %: ${h.alto}`);
    assert.deepEqual(
      await pestana.evaluar(`[...document.body.children].filter((e) => e.tagName !== 'SCRIPT').map((e) => [e.id || e.tagName.toLowerCase(), e.inert])`),
      [['header', true], ['main', true], ['tarjeta', false], ['velo', false], ['barra-pestanas', true], ['footer', true]],
      'detrás de la hoja, todo inerte',
    );
  });

  test('2 · el velo cubre la pantalla, y el tramo activo queda por encima del velo y del borde de la hoja', async () => {
    const pestana = await p();
    const velo = await pestana.evaluar<[boolean, string, number, number]>(`(() => { const v = document.getElementById('velo'); const r = v.getBoundingClientRect(); return [v.checkVisibility(), getComputedStyle(v).backgroundColor, r.width, r.height]; })()`);
    const negro40 = TOKENS.color['velo']!.$value;
    assert.deepEqual(velo, [true, `rgba(0, 0, 0, ${negro40.alpha})`, await pestana.evaluar<number>('document.documentElement.clientWidth'), ALTO]);
    const tramo = await pestana.evaluar<{ abajo: number; x: number; y: number }>(`(() => {
      const t = ${ADEMAS};
      const r = [...t.getClientRects()].at(-1);
      const capa = t.querySelector('.capa').getClientRects()[0];
      return { abajo: r.bottom, x: capa.left + scrollX + 2, y: capa.top + scrollY + 2 };
    })()`);
    assert.ok(tramo.abajo <= (await hoja()).arriba, `el tramo, por encima del borde de la hoja: ${tramo.abajo} y ${(await hoja()).arriba}`);
    // Lo de detrás de la hoja es inerte y no recibe el hit testing (elementFromPoint no devolvería el tramo aunque se vea):
    // se mira el color de un punto del tinte del tramo, encima de las letras. Con el velo encima saldría oscurecido (×0,6).
    const [rojo, verde, azul] = await pixel(tramo.x, tramo.y);
    const tinte = TOKENS.color['tinte-activo-discurso']!.$value.components.map((c) => Math.round(c * 255));
    assert.ok([rojo, verde, azul].every((c, i) => Math.abs(c - tinte[i]!) <= 2), `el tinte del activo, sin oscurecer: ${[rojo, verde, azul]} frente a ${tinte}`);
  });

  test('3 · el asa «Cambiar tamaño» la pasa al 40 % con un toque, y otro toque la devuelve', async () => {
    const pestana = await p();
    const asa = await pestana.evaluar<[string, string, number, number]>(`(() => { const a = document.querySelector('#tarjeta .asa'); const r = a.getBoundingClientRect(); return [a.tagName, a.getAttribute('aria-label'), r.height, r.width]; })()`);
    assert.deepEqual(asa, ['BUTTON', textos.CAMBIAR_TAMANO, 44, (await hoja()).ancho]);
    await pestana.evaluar(`document.querySelector('#tarjeta .asa').click()`);
    const compacta = await hoja();
    assert.ok(compacta.alto <= ALTO * 0.4 + 1, `compacta, como mucho el 40 %: ${compacta.alto}`);
    await pestana.evaluar(`document.querySelector('#tarjeta .asa').click()`);
    assert.ok((await hoja()).alto > compacta.alto, 'otro toque la devuelve');
  });

  test('4 · «Anterior» y «Siguiente», uno debajo de otro, a todo el ancho y de 44 de alto como mínimo', async () => {
    const botones = await (await p()).evaluar<{ arriba: number; ancho: number; alto: number }[]>(`[...document.querySelectorAll('#tarjeta .navegacion-reglas button')].map((b) => { const r = b.getBoundingClientRect(); return { arriba: r.top, ancho: r.width, alto: r.height }; })`);
    const cuerpo = await (await p()).evaluar<number>(`(() => { const c = getComputedStyle(document.querySelector('#tarjeta .cuerpo-tarjeta')); return document.querySelector('#tarjeta .cuerpo-tarjeta').clientWidth - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight); })()`);
    assert.equal(botones.length, 2);
    assert.ok(botones[1]!.arriba > botones[0]!.arriba, 'uno debajo de otro');
    assert.deepEqual(botones.map((b) => [Math.round(b.ancho), b.alto >= 44]), [[Math.round(cuerpo), true], [Math.round(cuerpo), true]]);
  });

  test('5 · Tab y Mayúsculas+Tab dan la vuelta dentro de la hoja', async () => {
    const pestana = await p();
    const dentro = (): Promise<boolean> => pestana.evaluar(`document.getElementById('tarjeta').contains(document.activeElement)`);
    for (let k = 0; k < 12; k++) {
      await tecla('Tab', 'Tab', 9);
      assert.equal(await dentro(), true, `Tab número ${k + 1}, dentro`);
    }
    for (let k = 0; k < 12; k++) {
      await tecla('Tab', 'Tab', 9, 8);
      assert.equal(await dentro(), true, `Mayúsculas+Tab número ${k + 1}, dentro`);
    }
  });

  test('6 · Escape la cierra, el foco vuelve al tramo y nada queda inerte; tocar el velo también la cierra', async () => {
    const pestana = await p();
    await tecla('Escape', 'Escape', 27);
    assert.deepEqual(
      await pestana.evaluar(`[document.getElementById('tarjeta').checkVisibility(), document.getElementById('velo').checkVisibility(), document.activeElement === ${ADEMAS}, [...document.body.children].some((e) => e.inert)]`),
      [false, false, true, false],
    );
    await pestana.evaluar(`${ADEMAS}.click()`);
    await pestana.evaluar(`document.getElementById('velo').click()`);
    assert.deepEqual(await pestana.evaluar(`[document.getElementById('tarjeta').checkVisibility(), document.activeElement === ${ADEMAS}]`), [false, true]);
  });
});
