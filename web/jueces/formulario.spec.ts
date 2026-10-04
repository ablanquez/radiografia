/**
 * Los jueces del formulario del analizador (encargo 10.4, Tanda 2; DISEÑO
 * §6.1, §6.2 y §7), en Chrome sobre astro preview, con su propia pestaña: el
 * juez 4 pulsa un chip, que pide el ejemplo al servidor por diseño (6.3), y
 * no puede compartir sesión con los que cuentan la red.
 *
 *   1. A 1280, en su orden: «Tu texto» con el cuadro y el placeholder del
 *      DISEÑO; los chips «Texto humano» y «Texto de IA» (botones, redondos,
 *      de 44, borde ink-2, sin negrita) con de quién es cada texto; «Tipo de
 *      texto» con su selector (320 de ancho, los mismos géneros en el mismo
 *      orden); los botones; «Paquetes» plegado (desde la Tanda 3, los botones
 *      antes de «Paquetes» también en el escritorio: jueces/orden-del-foco.spec.ts).
 *   2. «Paquetes», abierto: una casilla por paquete incluido, marcada; el
 *      cargador, la etiqueta del input de fichero como botón secundario (44,
 *      radio 6, borde ink-2), con el input transparente pero en el árbol de
 *      accesibilidad; el foco del input dibuja el anillo en la etiqueta; y el
 *      aviso de que no sale del navegador.
 *   3. A 390: los botones, uno debajo de otro y a todo el ancho, antes de
 *      «Paquetes»; el selector, a todo el ancho.
 *   4. Los chips hacen lo de antes: «Texto humano» pone el texto de Antonio y
 *      el género de los ejemplos, y no analiza.
 *
 * [DOC] https://github.com/ChromeDevTools/devtools-protocol (json/
 *    browser_protocol.json) — Input.dispatchKeyEvent; Accessibility.
 *    getPartialAXTree (experimental); DOM.getDocument y DOM.querySelector.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import { generosDe, nombreDeGenero } from '../src/pantalla/generos.ts';
import { GENERO_DE_LOS_EJEMPLOS } from '../src/pantalla/ejemplos.ts';
import { EJEMPLOS_PUBLICOS, paquetesIncluidos } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const TINTA_2 = 'rgb(74, 74, 74)';
const ACENTO = 'rgb(51, 34, 136)';

interface Caja {
  izquierda: number;
  arriba: number;
  ancho: number;
  alto: number;
}

describe('el formulario del analizador en Chrome, sobre astro preview', () => {
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
    (await p()).evaluar<Caja>(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { izquierda: r.left, arriba: r.top, ancho: r.width, alto: r.height }; })()`);

  test('1 · a 1280: el cuadro, los chips, el tipo de texto, los botones y «Paquetes» plegado, en ese orden', async () => {
    await anchoDe(1280);
    const pestana = await p();
    const forma = await pestana.evaluar<{ etiqueta: string; placeholder: string; chips: [string, string, string, string, string, string, number][]; procedencia: string; tipo: string; opciones: string[]; abierto: boolean; resumen: string; botones: string[] }>(`(() => {
      const chips = [...document.querySelectorAll('.chips button')].map((b) => { const c = getComputedStyle(b); return [b.id, b.textContent, b.type, c.borderRadius, c.fontWeight, c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, b.getBoundingClientRect().height]; });
      return {
        etiqueta: document.querySelector('label[for="texto"]').textContent,
        placeholder: document.getElementById('texto').placeholder,
        chips,
        procedencia: document.querySelector('.ejemplos .procedencia').textContent,
        tipo: document.querySelector('label[for="genero"]').textContent,
        opciones: [...document.getElementById('genero').options].map((o) => o.textContent),
        abierto: document.getElementById('paquetes').open,
        resumen: document.querySelector('#paquetes summary').textContent,
        botones: [...document.querySelectorAll('.acciones-formulario button')].map((b) => b.id),
      };
    })()`);
    assert.deepEqual([forma.etiqueta, forma.placeholder], ['Tu texto', textos.PLACEHOLDER_DEL_TEXTO]);
    assert.equal(textos.PLACEHOLDER_DEL_TEXTO, 'Pega aquí tu texto: a partir de 100 palabras; el análisis es completo desde 300', 'el placeholder del DISEÑO §6.1, literal');
    const borde = `1px solid ${TINTA_2}`;
    const radio = (r: string): boolean => Number.parseFloat(r) >= 22;
    assert.deepEqual(
      forma.chips.map(([id, texto, tipo, r, peso, b, alto]) => [id, texto, tipo, radio(r), peso, b, alto >= 44]),
      [
        ['ejemplo-humano', textos.TEXTO_HUMANO, 'button', true, '400', borde, true],
        ['ejemplo-ia', textos.TEXTO_DE_IA, 'button', true, '400', borde, true],
      ],
      'los chips: botones redondos de 44 con borde ink-2 y sin negrita',
    );
    assert.equal(forma.procedencia, 'El texto humano lo escribió Antonio; el de IA lo generó Claude Opus 5.5, sin instrucciones de estilo.');
    assert.equal(forma.tipo, textos.TIPO_DE_TEXTO);
    assert.deepEqual(forma.opciones, generosDe(paquetesIncluidos()).map(nombreDeGenero), 'los mismos géneros, en el mismo orden');
    assert.equal((await caja('#genero')).ancho, 320, 'el selector, de 320');
    assert.deepEqual([forma.abierto, forma.resumen], [false, 'Paquetes'], '«Paquetes», plegado');
    assert.deepEqual(forma.botones, ['analizar', 'informe']);
    const orden = await Promise.all(['#texto', '.chips', '#genero', '.acciones-formulario', '#paquetes'].map(async (s) => (await caja(s)).arriba));
    assert.deepEqual([...orden].sort((a, b) => a - b), orden, `de arriba abajo: ${orden.join(' · ')}`);
  });

  test('2 · «Paquetes», abierto: las casillas, el cargador como botón secundario con su foco, y el aviso', async () => {
    const pestana = await p();
    await pestana.evaluar(`document.getElementById('paquetes').open = true`);
    const dentro = await pestana.evaluar<{ casillas: [string, boolean][]; aviso: string; fichero: { opacidad: string; para: string; accept: string }; boton: [string, string, string, number] }>(`(() => {
      const l = document.querySelector('label[for="paquete-propio"]');
      const c = getComputedStyle(l);
      return {
        casillas: [...document.querySelectorAll('#incluidos input[type=checkbox]')].map((x) => [x.value, x.checked]),
        aviso: document.querySelector('#paquetes .aviso-propio').textContent,
        fichero: { opacidad: getComputedStyle(document.getElementById('paquete-propio')).opacity, para: l.htmlFor, accept: document.getElementById('paquete-propio').accept },
        boton: [c.borderRadius, c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, c.fontWeight, l.getBoundingClientRect().height],
      };
    })()`);
    assert.deepEqual(dentro.casillas, paquetesIncluidos().map((x) => [x.cabecera.nombre, true]));
    assert.equal(dentro.aviso, 'Se queda en tu navegador: no se sube a ningún sitio. No se guarda: al recargar la página, desaparece.');
    assert.deepEqual(dentro.fichero, { opacidad: '0', para: 'paquete-propio', accept: 'application/json,.json' });
    assert.deepEqual(dentro.boton, ['6px', `1px solid ${TINTA_2}`, '700', 44], 'la etiqueta, como botón secundario');
    const { root } = (await pestana.cdp('DOM.getDocument', {})) as { root: { nodeId: number } };
    const { nodeId } = (await pestana.cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '#paquete-propio' })) as { nodeId: number };
    const { nodes } = (await pestana.cdp('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })) as { nodes: { ignored: boolean; name?: { value: string } }[] };
    assert.deepEqual([nodes[0]!.ignored, nodes[0]!.name?.value], [false, 'Cargar un paquete propio (JSON)'], 'el input, en el árbol de accesibilidad y con el nombre de su etiqueta');
    // El foco con el teclado: del último paquete incluido, Tab lleva al input, y el anillo se dibuja en la etiqueta.
    await pestana.evaluar(`[...document.querySelectorAll('#incluidos input')].at(-1).focus()`);
    for (const type of ['keyDown', 'keyUp']) await pestana.cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    assert.deepEqual(
      await pestana.evaluar(`(() => { const c = getComputedStyle(document.querySelector('label[for="paquete-propio"]')); return [document.activeElement.id, c.outlineWidth + ' ' + c.outlineStyle + ' ' + c.outlineColor, c.outlineOffset]; })()`),
      ['paquete-propio', `2px solid ${ACENTO}`, '2px'],
    );
    await pestana.evaluar(`document.getElementById('paquetes').open = false`);
  });

  test('3 · a 390: los botones, uno debajo de otro y a todo el ancho, antes de «Paquetes»; el selector, a todo el ancho', async () => {
    await anchoDe(390);
    const [texto, genero, principal, informe, paquetes] = await Promise.all(['#texto', '#genero', '#analizar', '#informe', '#paquetes'].map(caja));
    assert.equal(genero!.ancho, texto!.ancho, 'el selector, como el cuadro');
    assert.deepEqual([principal!.ancho, informe!.ancho], [texto!.ancho, texto!.ancho], 'los botones, a todo el ancho');
    assert.ok(informe!.arriba > principal!.arriba && paquetes!.arriba > informe!.arriba, `de arriba abajo: principal ${principal!.arriba}, informe ${informe!.arriba}, paquetes ${paquetes!.arriba}`);
    await anchoDe(1280);
  });

  test('4 · los chips hacen lo de antes: el texto de Antonio y el género de los ejemplos, sin analizar', async () => {
    const pestana = await p();
    await pestana.evaluar(`document.getElementById('ejemplo-humano').click()`);
    await pestana.hasta(`document.getElementById('texto').value.length > 0`, 'el texto del ejemplo');
    const humano = readFileSync(new URL('antonio.txt', EJEMPLOS_PUBLICOS), 'utf8');
    assert.deepEqual(
      await pestana.evaluar(`[document.getElementById('texto').value, document.getElementById('genero').value, document.getElementById('resultado').hidden]`),
      [humano, GENERO_DE_LOS_EJEMPLOS, true],
    );
  });
});
