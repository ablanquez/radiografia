/**
 * Los jueces de la tarjeta de regla (encargo 10.4, Tanda 2; DISEÑO §6.1 y
 * §7), en escritorio y tableta.
 *
 *   1. La lógica: el orden de las señales para «Anterior» y «Siguiente» (el
 *      del texto, sin las vacías ni las que oculta el ojo), sus vecinas (null
 *      en los extremos) y dónde se coloca (12 px bajo el último renglón o
 *      sobre el primero si no cabe, 24 a la izquierda del tramo y a 16 de los
 *      bordes; el pico, sobre el tramo).
 *   En Chrome, con el texto de combinacion-real:
 *   2. Enter en un tramo («Además», Conector repetido) abre su tarjeta: un
 *      diálogo con nombre (su título), el foco en el título, 360 de ancho, 12
 *      px bajo el tramo y con el pico arriba; el tramo, activo (aria-expanded,
 *      tinte al 28 %, línea 1 px más gruesa).
 *   3. Lo que dice: la barra del color de su familia, la sigla, la línea
 *      «familia · paquete», la X (44 × 44, «Cerrar»), la frase en claro, «Qué
 *      hacer», «¿Por qué lo miramos?» plegado con el paquete y el enlace a su
 *      ficha, y «Anterior» y «Siguiente».
 *   4. «Siguiente» y «Anterior» recorren las señales en el orden del texto:
 *      el activo y la tarjeta pasan al tramo de la siguiente; en la primera,
 *      «Anterior» está desactivado, y en la última, «Siguiente».
 *   5. Escape la cierra y el foco vuelve al tramo, que deja de estar activo;
 *      la X, igual.
 *   6. Con el ojo, «Siguiente» se salta las señales de la familia oculta.
 *   7. A 820, la tarjeta va debajo del tramo, sin taparlo y dentro de la
 *      pantalla.
 *
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — «Escape:
 *    Closes the dialog»; el foco vuelve a quien lo abrió.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import { colocar, ordenDeLasSenales, vecinas } from '../src/pantalla/tarjeta.ts';
import { urlDeRegla } from '../src/catalogo/catalogo.ts';
import { motorDelNavegador, paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const TOKENS = JSON.parse(readFileSync(new URL('../../docs/figma/tokens.json', import.meta.url), 'utf8')) as { color: Record<string, { $value: { components: number[] } }> };
const rgb = (nombre: string): string => `rgb(${TOKENS.color[nombre]!.$value.components.map((c) => Math.round(c * 255)).join(', ')})`;

describe('la tarjeta: la lógica', () => {
  test('1 · el orden de las señales, sus vecinas y dónde se coloca', () => {
    const senales = [
      { inicio: 30, fin: 40 },
      { inicio: 5, fin: 9 },
      { inicio: 5, fin: 12 },
      { inicio: 20, fin: 20 },
      { inicio: 5, fin: 9 },
    ];
    assert.deepEqual(ordenDeLasSenales(senales, () => true), [1, 4, 2, 0], 'por inicio y fin; los empates, por índice; sin la vacía');
    assert.deepEqual(ordenDeLasSenales(senales, (i) => i !== 4), [1, 2, 0], 'sin las que no se ven');
    assert.deepEqual(vecinas([1, 4, 2, 0], 1), { anterior: null, siguiente: 4 });
    assert.deepEqual(vecinas([1, 4, 2, 0], 2), { anterior: 4, siguiente: 0 });
    assert.deepEqual(vecinas([1, 4, 2, 0], 0), { anterior: 2, siguiente: null });
    assert.deepEqual(vecinas([1, 4, 2, 0], 3), { anterior: null, siguiente: null });
    const renglon = { left: 185, top: 885, bottom: 912, width: 81 };
    assert.deepEqual(colocar([renglon], 375, 360, { ancho: 1280, alto: 3000 }), { top: 924, left: 161, pico: 'arriba', x: 64 }, 'debajo, como en el modelo (el «Además» de su tarjeta)');
    assert.deepEqual(colocar([{ left: 531, top: 1250, bottom: 1277, width: 81 }], 375, 360, { ancho: 820, alto: 3000 }), { top: 1289, left: 444, pico: 'arriba', x: 127 }, 'en la tableta, a 16 del borde derecho');
    assert.deepEqual(colocar([renglon], 375, 360, { ancho: 1280, alto: 1200 }), { top: 885 - 12 - 375, left: 161, pico: 'abajo', x: 64 }, 'encima, si no cabe debajo');
  });
});

interface Abierta {
  visible: boolean;
  rol: string | null;
  nombre: string;
  foco: boolean;
  ancho: number;
  arriba: number;
  pico: string | undefined;
  tramoAbajo: number;
  activos: string[];
  expandido: string | null;
}

describe('la tarjeta en Chrome, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  const tecla = async (key: string, code: string, windowsVirtualKeyCode: number): Promise<void> => {
    for (const type of ['keyDown', 'keyUp']) await (await p()).cdp('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode });
  };
  const ADEMAS = `[...document.querySelectorAll('#vista .tramo')].find((t) => t.textContent.startsWith('Además'))`;
  const abierta = async (): Promise<Abierta> =>
    (await p()).evaluar<Abierta>(`(() => {
      const t = document.getElementById('tarjeta');
      const r = t.getBoundingClientRect();
      const activos = [...document.querySelectorAll('#vista .tramo.activo')];
      const ultimo = activos.at(-1);
      return { visible: t.checkVisibility(), rol: t.getAttribute('role'), nombre: document.getElementById(t.getAttribute('aria-labelledby'))?.textContent ?? '', foco: document.activeElement === t.querySelector('h2'),
        ancho: r.width, arriba: r.top + scrollY, pico: t.dataset.pico, tramoAbajo: ultimo ? [...ultimo.getClientRects()].at(-1).bottom + scrollY : -1,
        activos: activos.map((a) => a.getAttribute('aria-label')), expandido: ultimo?.getAttribute('aria-expanded') ?? null };
    })()`);

  test('2 · Enter en un tramo abre su tarjeta: diálogo con nombre, foco en el título, 12 px bajo el tramo, y el tramo activo', async () => {
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await pestana.evaluar(`(() => {
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`document.querySelectorAll('#vista .tramo').length > 0`, 'los subrayados');
    await pestana.evaluar(`${ADEMAS}.focus()`);
    await tecla('Enter', 'Enter', 13);
    const a = await abierta();
    assert.deepEqual([a.visible, a.rol, a.nombre, a.foco, a.ancho, a.pico], [true, 'dialog', 'Conector repetido', true, 360, 'arriba']);
    assert.ok(Math.abs(a.arriba - (a.tramoAbajo + 12)) <= 1, `12 px bajo el tramo: ${a.arriba} y ${a.tramoAbajo}`);
    assert.deepEqual([a.activos, a.expandido], [['Conector repetido: “Además”'], 'true']);
    assert.deepEqual(
      await pestana.evaluar(`(() => { const c = getComputedStyle(${ADEMAS}.querySelector('.capa')); return [c.backgroundColor, c.textDecorationThickness]; })()`),
      [rgb('tinte-activo-discurso'), '4px'],
      'el activo: tinte al 28 % y la línea de 3 px, a 4',
    );
  });

  test('3 · lo que dice: barra, sigla, «familia · paquete», la X, la frase en claro, «Qué hacer», «¿Por qué lo miramos?» y la navegación', async () => {
    const regla = paquetesIncluidos()[0]!.reglas.find((r) => r.nombre === 'Conector repetido')!;
    const vista = await (await p()).evaluar<Record<string, unknown>>(`(() => {
      const t = document.getElementById('tarjeta');
      const x = t.querySelector('.cerrar');
      const d = t.querySelector('details.por-que');
      return {
        barra: getComputedStyle(t.querySelector('.barra-familia')).backgroundColor,
        sigla: t.querySelector('.cabecera-tarjeta .sigla').textContent,
        linea: t.querySelector('.linea-tarjeta').textContent,
        cerrar: [x.getAttribute('aria-label'), x.getBoundingClientRect().width, x.getBoundingClientRect().height],
        enClaro: t.querySelector('.en-claro').textContent,
        queHacer: t.querySelector('.que-hacer').textContent,
        porQue: [d.open, d.querySelector('summary').textContent, [...d.querySelectorAll('p')].map((x) => x.textContent).filter((x) => x.startsWith('Paquete')), d.querySelector('a').getAttribute('href')],
        navegacion: [...t.querySelectorAll('.navegacion-reglas button')].map((b) => b.textContent),
      };
    })()`);
    assert.deepEqual(vista, {
      barra: rgb('discurso'),
      sigla: 'D',
      linea: textos.lineaDeLaTarjeta('Discurso', 'RadiografIA'),
      cerrar: [textos.CERRAR, 44, 44],
      enClaro: regla.enClaro,
      queHacer: `${textos.QUE_HACER}: ${regla.sugerencia}`,
      porQue: [false, textos.POR_QUE_LO_MIRAMOS, [`${textos.PAQUETE}: RadiografIA ${paquetesIncluidos()[0]!.cabecera.version}`], urlDeRegla('/', regla.id)],
      navegacion: [textos.ANTERIOR, textos.SIGUIENTE],
    });
  });

  test('4 · «Siguiente» y «Anterior» recorren las señales en el orden del texto; desactivados en los extremos', async () => {
    const pestana = await p();
    const { analizar } = await motorDelNavegador();
    const r = analizar(TEXTO_DE_COMBINACION_REAL, paquetesIncluidos(), { genero: 'general' });
    const orden = ordenDeLasSenales(r.senales, () => true);
    const nombres = new Map(paquetesIncluidos().flatMap((x) => x.reglas.map((y) => [`${x.cabecera.nombre}::${y.id}`, y.nombre!])));
    const titulos = orden.map((i) => nombres.get(`${r.senales[i]!.paquete}::${r.senales[i]!.reglaId}`));
    const ahora = (): Promise<[string, boolean, boolean]> =>
      pestana.evaluar(`(() => { const t = document.getElementById('tarjeta'); const [a, s] = t.querySelectorAll('.navegacion-reglas button'); return [t.querySelector('h2').textContent, a.disabled, s.disabled]; })()`);
    // A la primera señal, y de ahí hasta la última con «Siguiente».
    await pestana.evaluar(`document.querySelector('#vista .tramo').click()`);
    const vistos: [string, boolean, boolean][] = [await ahora()];
    for (let k = 1; k < orden.length; k++) {
      await pestana.evaluar(`document.querySelectorAll('#tarjeta .navegacion-reglas button')[1].click()`);
      vistos.push(await ahora());
    }
    assert.deepEqual(vistos.map((v) => v[0]), titulos, 'los títulos, en el orden del texto');
    assert.deepEqual([vistos[0]![1], vistos.at(-1)![2]], [true, true], '«Anterior» en la primera y «Siguiente» en la última, desactivados');
    assert.ok(vistos.slice(1, -1).every((v) => !v[1] && !v[2]), 'en medio, los dos activos');
    assert.equal(await pestana.evaluar(`document.activeElement === document.querySelector('#tarjeta h2')`), true, 'el foco, en el título de la señal nueva');
    await pestana.evaluar(`document.querySelectorAll('#tarjeta .navegacion-reglas button')[0].click()`);
    assert.equal((await ahora())[0], titulos.at(-2), '«Anterior» vuelve a la penúltima');
    const activos = (await abierta()).activos;
    assert.ok(activos.length > 0 && activos.every((n) => n.startsWith(`${titulos.at(-2)}`) || n.includes(` y ${titulos.at(-2)}`) || n.includes(`${titulos.at(-2)} y `)), `el activo, el tramo de la penúltima: ${activos.join(' | ')}`);
  });

  test('5 · Escape la cierra y el foco vuelve al tramo; la X, igual', async () => {
    const pestana = await p();
    await pestana.evaluar(`${ADEMAS}.click()`);
    await tecla('Escape', 'Escape', 27);
    assert.deepEqual(
      await pestana.evaluar(`[document.getElementById('tarjeta').checkVisibility(), document.activeElement === ${ADEMAS}, ${ADEMAS}.classList.contains('activo'), ${ADEMAS}.getAttribute('aria-expanded')]`),
      [false, true, false, 'false'],
    );
    await pestana.evaluar(`${ADEMAS}.click()`);
    await pestana.evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
    assert.deepEqual(await pestana.evaluar(`[document.getElementById('tarjeta').checkVisibility(), document.activeElement === ${ADEMAS}]`), [false, true]);
  });

  test('6 · con el ojo, «Siguiente» se salta las señales de la familia oculta', async () => {
    const pestana = await p();
    await pestana.evaluar(`document.querySelector('#leyenda .tarjeta-familia[data-familia="RadiografIA::discurso"] .ojo').click()`);
    await pestana.evaluar(`document.querySelector('#vista .tramo[role="button"]').click()`);
    const titulos: string[] = [];
    for (let k = 0; k < 40; k++) {
      titulos.push(await pestana.evaluar<string>(`document.querySelector('#tarjeta h2').textContent`));
      if (await pestana.evaluar<boolean>(`document.querySelectorAll('#tarjeta .navegacion-reglas button')[1].disabled`)) break;
      await pestana.evaluar(`document.querySelectorAll('#tarjeta .navegacion-reglas button')[1].click()`);
    }
    const deDiscurso = new Set(paquetesIncluidos()[0]!.reglas.filter((r) => r.familia === 'discurso').map((r) => r.nombre));
    assert.ok(titulos.length > 3, `${titulos.length} señales recorridas`);
    assert.deepEqual(titulos.filter((t) => deDiscurso.has(t)), [], 'ninguna de Discurso');
    await pestana.evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
    await pestana.evaluar(`document.querySelector('#leyenda .tarjeta-familia[data-familia="RadiografIA::discurso"] .ojo').click()`);
  });

  test('7 · a 820, debajo del tramo, sin taparlo y dentro de la pantalla', async () => {
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 820, height: 900, deviceScaleFactor: 1, mobile: false });
    await pestana.hasta(ANCHO_ASENTADO, 'el ancho de 820, asentado');
    await pestana.evaluar(`${ADEMAS}.click()`);
    const a = await abierta();
    const { izquierda, derecha, util } = await pestana.evaluar<{ izquierda: number; derecha: number; util: number }>(`(() => { const r = document.getElementById('tarjeta').getBoundingClientRect(); return { izquierda: r.left, derecha: r.right, util: document.documentElement.clientWidth }; })()`);
    assert.ok(a.visible && a.arriba >= a.tramoAbajo, `debajo del tramo, sin taparlo: ${a.arriba} y ${a.tramoAbajo}`);
    assert.ok(izquierda >= 16 && derecha <= util - 16, `dentro de la pantalla: ${izquierda} a ${derecha} de ${util}`);
    await pestana.evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
  });
});
