/**
 * Los jueces de las pestañas del móvil (encargo 10.4, Tanda 2; DISEÑO §6.2 y
 * apunte 7 de Antonio).
 *
 *   1. La lógica: el reparto de los bloques en Texto, Reglas y Datos (el del
 *      DISEÑO §6.2), y la pestaña que toca con cada tecla (las flechas dan la
 *      vuelta; Inicio y Fin; otra tecla, ninguna).
 *   En Chrome, a 390 × 844, con el texto de combinacion-real:
 *   2. Antes de analizar, ni pestañas ni «Aquí verás el resultado.».
 *   3. Al analizar: la pastilla y lo que más pesa arriba; la barra fija abajo
 *      con «Texto · Reglas · Datos» (tablist y tab, aria-selected,
 *      aria-controls, solo la elegida en el tabulador), Texto elegida, y su
 *      panel (tabpanel con aria-labelledby) con el cuadro plegado, la vista y
 *      los botones; los otros dos, ocultos; la página deja el hueco de la
 *      barra; el pie se ve.
 *   4. Flecha derecha: Reglas, elegida y con el foco, con las familias y el
 *      desglose de las reglas; el pie no se ve. Otra vez: Datos, con «Ver el
 *      detalle» abierto, solo avisos y no miradas, y Español correcto; el pie
 *      se ve. Otra: vuelve a Texto. Flecha izquierda, Inicio y Fin.
 *   7. En papel, desde el móvil y con Texto elegida, salen también lo de las
 *      otras pestañas (las familias, el desglose y Español correcto); la barra,
 *      no.
 *   5. A 320, sin scroll horizontal.
 *   6. Al ensanchar a 1280, ni pestañas ni paneles: cada bloque, en su
 *      columna, y «Ver el detalle», plegado como estaba.
 *
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ — tablist, tab y
 *    tabpanel; «Left Arrow», «Right Arrow», «Home», «End».
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as textos from '../src/textos.ts';
import { PESTANAS, pestanaTrasTecla, REPARTO } from '../src/pantalla/pestanas.ts';
import { TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

describe('las pestañas: la lógica', () => {
  test('1 · el reparto del DISEÑO §6.2 y la pestaña que toca con cada tecla', () => {
    assert.deepEqual(PESTANAS, ['texto', 'reglas', 'datos']);
    assert.deepEqual(REPARTO, {
      texto: ['#plegado', '#vista', '.acciones-resultado'],
      reglas: ['#leyenda', '#desglose-reglas'],
      datos: ['#desglose > .detalle', '#desglose-avisos', '#desglose > .otro-paquete'],
    });
    assert.deepEqual(
      [pestanaTrasTecla('texto', 'ArrowRight'), pestanaTrasTecla('datos', 'ArrowRight'), pestanaTrasTecla('texto', 'ArrowLeft'), pestanaTrasTecla('reglas', 'Home'), pestanaTrasTecla('texto', 'End'), pestanaTrasTecla('texto', 'Enter')],
      ['reglas', 'texto', 'datos', 'texto', 'datos', null],
    );
  });
});

interface Estado {
  barra: boolean;
  pestanas: [string, string | null, string | null, string | null, number][];
  paneles: [string, boolean, string | null][];
  foco: string;
  pie: boolean;
}

describe('las pestañas en el móvil, sobre astro preview', () => {
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
    await (await p()).cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 844, deviceScaleFactor: 1, mobile: ancho < 769 });
  };
  const tecla = async (key: string, code: string, windowsVirtualKeyCode: number): Promise<void> => {
    for (const type of ['keyDown', 'keyUp']) await (await p()).cdp('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode });
  };
  const estado = async (): Promise<Estado> =>
    (await p()).evaluar<Estado>(`(() => ({
      barra: document.getElementById('barra-pestanas').checkVisibility(),
      pestanas: [...document.querySelectorAll('#barra-pestanas > *')].map((b) => [b.textContent, b.getAttribute('role'), b.getAttribute('aria-selected'), b.getAttribute('aria-controls'), b.tabIndex]),
      paneles: [...document.querySelectorAll('.panel-pestana')].map((x) => [x.id, x.checkVisibility(), x.getAttribute('aria-labelledby')]),
      foco: document.activeElement.id,
      pie: document.querySelector('footer.pie').checkVisibility(),
    }))()`);
  const dentro = async (panel: string, selectores: readonly string[]): Promise<boolean[]> =>
    (await p()).evaluar(`${JSON.stringify(selectores)}.map((s) => { const e = document.querySelector(s); return e !== null && document.getElementById(${JSON.stringify(panel)}).contains(e) && e.checkVisibility(); })`);

  test('2 · antes de analizar, ni pestañas ni «Aquí verás el resultado.»', async () => {
    await anchoDe(390);
    const pestana = await p();
    assert.deepEqual(await pestana.evaluar(`[document.getElementById('barra-pestanas').checkVisibility(), document.getElementById('hueco-resultado').checkVisibility(), document.getElementById('formulario').checkVisibility()]`), [false, false, true]);
  });

  test('3 · al analizar: arriba la pastilla y lo que más pesa; la barra abajo, en Texto, con su panel; la página deja el hueco', async () => {
    const pestana = await p();
    await pestana.evaluar(`(() => {
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`document.getElementById('barra-pestanas').checkVisibility()`, 'la barra de pestañas');
    const e = await estado();
    assert.deepEqual(e.pestanas, [
      [textos.PESTANA_TEXTO, 'tab', 'true', 'panel-texto', 0],
      [textos.PESTANA_REGLAS, 'tab', 'false', 'panel-reglas', -1],
      [textos.PESTANA_DATOS, 'tab', 'false', 'panel-datos', -1],
    ]);
    assert.deepEqual(e.paneles, [['panel-texto', true, 'pestana-texto'], ['panel-reglas', false, 'pestana-reglas'], ['panel-datos', false, 'pestana-datos']]);
    assert.deepEqual(await pestana.evaluar(`[document.getElementById('barra-pestanas').getAttribute('role'), document.getElementById('barra-pestanas').getAttribute('aria-label')]`), ['tablist', textos.SECCIONES_DEL_RESULTADO]);
    assert.deepEqual(await dentro('panel-texto', ['#plegado', '#vista', '.acciones-resultado']), [true, true, true], 'en Texto: el cuadro plegado, la vista y los botones');
    const cajas = await pestana.evaluar<{ pastilla: number; pesa: number; panel: number; barraAbajo: number; barraAlto: number; hueco: number }>(`(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      return { pastilla: r('#medidor .pastilla').top + scrollY, pesa: r('.lo-que-mas-pesa').top + scrollY, panel: r('#panel-texto').top + scrollY, barraAbajo: r('#barra-pestanas').bottom, barraAlto: r('#barra-pestanas').height, hueco: parseFloat(getComputedStyle(document.body).paddingBottom) };
    })()`);
    assert.ok(cajas.pastilla < cajas.pesa && cajas.pesa < cajas.panel, `arriba la pastilla y lo que más pesa, y después el panel: ${cajas.pastilla} · ${cajas.pesa} · ${cajas.panel}`);
    assert.deepEqual([cajas.barraAbajo, cajas.barraAlto], [844, 56], 'la barra, fija abajo, de 56 como la del modelo (la pestaña se monta 1 px sobre su línea)');
    assert.ok(cajas.hueco >= 57, `la página deja el hueco de la barra: ${cajas.hueco}`);
    assert.equal(e.pie, true, 'el pie, con Texto');
  });

  test('4 · las flechas, Inicio y Fin: Reglas con las familias y el desglose, Datos con el detalle, los avisos y Español correcto', async () => {
    const pestana = await p();
    await pestana.evaluar(`document.getElementById('pestana-texto').focus()`);
    await tecla('ArrowRight', 'ArrowRight', 39);
    let e = await estado();
    assert.deepEqual([e.pestanas.map((x) => x[2]), e.paneles.map((x) => x[1]), e.foco, e.pie], [['false', 'true', 'false'], [false, true, false], 'pestana-reglas', false]);
    assert.deepEqual(await dentro('panel-reglas', ['#leyenda', '#desglose-reglas', '#desglose-reglas .desglose-paquete > h3']), [true, true, true]);
    assert.equal(await pestana.evaluar(`document.querySelector('#panel-reglas .titulo-desglose').textContent`), textos.DESGLOSE);
    await tecla('ArrowRight', 'ArrowRight', 39);
    e = await estado();
    assert.deepEqual([e.pestanas.map((x) => x[2]), e.paneles.map((x) => x[1]), e.foco, e.pie], [['false', 'false', 'true'], [false, false, true], 'pestana-datos', true]);
    assert.deepEqual(await dentro('panel-datos', ['.detalle', '.detalle .cifras', '#desglose-avisos', '.otro-paquete']), [true, true, true, true]);
    assert.equal(await pestana.evaluar(`document.querySelector('#panel-datos > .detalle').open`), true, '«Ver el detalle», abierto');
    await tecla('ArrowRight', 'ArrowRight', 39);
    assert.equal((await estado()).foco, 'pestana-texto', 'la flecha derecha da la vuelta');
    await tecla('ArrowLeft', 'ArrowLeft', 37);
    assert.equal((await estado()).foco, 'pestana-datos', 'la izquierda, también');
    await tecla('Home', 'Home', 36);
    assert.equal((await estado()).foco, 'pestana-texto');
    await tecla('End', 'End', 35);
    assert.equal((await estado()).foco, 'pestana-datos');
    await tecla('Home', 'Home', 36);
  });

  test('7 · en papel, desde el móvil y con Texto elegida, salen también las familias, el desglose y Español correcto', async () => {
    const pestana = await p();
    assert.equal((await estado()).paneles[0]![1], true, 'Texto, elegida');
    await pestana.cdp('Emulation.setEmulatedMedia', { media: 'print' });
    try {
      assert.deepEqual(
        await pestana.evaluar(`['#vista', '#leyenda', '#desglose-reglas', '#desglose-avisos', '.otro-paquete', '#panel-datos > .detalle', '#barra-pestanas'].map((s) => document.querySelector(s).checkVisibility())`),
        [true, true, true, true, true, false, false],
      );
    } finally {
      await pestana.cdp('Emulation.setEmulatedMedia', { media: '' });
    }
  });

  test('5 · a 320, sin scroll horizontal', async () => {
    await anchoDe(320);
    const [contenido, util] = await (await p()).evaluar<[number, number]>(`[document.documentElement.scrollWidth, document.documentElement.clientWidth]`);
    assert.ok(contenido <= util, `${contenido} de contenido en ${util} de ancho`);
  });

  test('6 · al ensanchar a 1280, ni pestañas ni paneles: cada bloque en su columna, y «Ver el detalle» plegado como estaba', async () => {
    await anchoDe(1280);
    const pestana = await p();
    await pestana.hasta(`!document.getElementById('barra-pestanas').checkVisibility()`, 'sin la barra');
    assert.deepEqual(
      await pestana.evaluar(`[
        [...document.querySelectorAll('.panel-pestana')].map((x) => x.childElementCount + (x.checkVisibility() ? 100 : 0)),
        document.getElementById('columna-texto').contains(document.getElementById('vista')),
        document.getElementById('resultado').contains(document.getElementById('leyenda')),
        document.querySelector('#desglose > .detalle').contains(document.getElementById('desglose-reglas')),
        document.querySelector('#desglose > .detalle').open,
        document.body.classList.contains('con-pestanas'),
      ]`),
      [[0, 0, 0], true, true, true, false, false],
    );
  });
});
