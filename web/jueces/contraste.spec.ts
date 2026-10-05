/**
 * El contraste y el daltonismo (encargo 10.4, Tanda 5; DISEÑO §4 y §7), en Chrome headless sobre astro preview: los
 * colores, de los elementos de verdad (getComputedStyle), y las cuentas, en color.ts. El acta los recoge
 * (docs/acta-contraste-y-accesibilidad.md).
 *
 *   1. color.ts, comprobado: los 34 pares de prueba de Sharma, Wu y Dalal (2005) dentro de 1e-4, y blanco sobre negro, 21.
 *   2. Los pares del encargo, cada uno de su elemento, con el umbral que le toca: texto (WCAG 2.2, 1.4.3), 4,5; objetos
 *      (1.4.11: la línea de cada familia, que la identifica), 3; foco (2.4.13: el anillo frente a lo que tiene detrás), 3.
 *        · ink sobre bg (la vista del texto) y sobre card (la pastilla del resultado);
 *        · blanco sobre accent (el botón principal);
 *        · ink-2 sobre bg (el eslogan, y el placeholder del cuadro);
 *        · la línea de cada familia sobre bg y sobre card;
 *        · ink sobre el tinte de cada familia, el del 14 % (el tramo) y el del 28 % (el activo);
 *        · el foco sobre bg (el primer elemento al tabular);
 *        · el texto de un botón desactivado sobre su fondo (antes de analizar, «Descargar informe» del formulario):
 *          1.4.3 no lo exige («part of an inactive user interface component»), y el DISEÑO §4 sí (8,1:1): se le pide 4,5;
 *        · el aviso de error (el del paquete propio que no entra).
 *   3. Todo el texto que se ve, sin excepción, a 4,5 o más sobre el fondo que tiene detrás: el analizador sin resultado,
 *      con resultado y con la tarjeta abierta desde 1280, con resultado y con la hoja abierta desde 390; el catálogo
 *      desde 1280 y desde 390; y una ficha. El fondo, la composición de los background-color de sus antepasados sobre
 *      blanco (1.4.3, nota 3 del glosario: «If no background color is specified, then white is assumed»); la opacidad de
 *      los antepasados, sobre el color del texto. No se miran las imágenes de fondo (solo las líneas de Ortotipografía,
 *      debajo del texto) ni el texto solo para el lector de pantalla (de 1 × 1 px).
 *   4. El daltonismo: los ocho colores de familia (la línea de cada una), con la visión normal y simulados para la
 *      protanopía, la deuteranopía y la tritanopía (Machado, Oliveira y Fernandes 2009); la distancia CIEDE2000 entre cada
 *      par. Falla si un par baja de 5 (el encargo: «si un par baja de 5, PARA y propón»); los que bajan de 10 los lista
 *      para el acta, que declara que los distinguen el estilo de la línea y la sigla.
 *
 * [DOC] https://www.w3.org/TR/WCAG22/ — 1.4.3 Contrast (Minimum): «at least 4.5:1», con la excepción «Incidental: Text
 *    or images of text that are part of an inactive user interface component […] have no contrast requirement»; 1.4.11
 *    Non-text Contrast: «at least 3:1 against adjacent color(s)» para «Visual information required to identify user
 *    interface components and states» y «Parts of graphics required to understand the content»; 2.4.13 Focus
 *    Appearance: «a contrast ratio of at least 3:1 between the same pixels in the focused and unfocused states».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility — false sin caja; con
 *    opacityProperty y visibilityProperty, también con opacity 0 o visibility hidden.
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchKeyEvent — la tecla Tab, de verdad:
 *    el foco que deja enciende :focus-visible.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { EJEMPLOS_PUBLICOS, PAQUETES_DE_PRUEBA, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';
import { ciede2000, contraste, enHex, lab, leerColor, simular, sobre, type Daltonismo, type Rgb } from './color.ts';

/** Sharma, Wu y Dalal (2005): sus 34 pares de prueba (ciede2000testdata.txt): L, a, b de cada color y la diferencia. */
const PARES_DE_SHARMA: readonly (readonly number[])[] = [
  [50.0, 2.6772, -79.7751, 50.0, 0.0, -82.7485, 2.0425],
  [50.0, 3.1571, -77.2803, 50.0, 0.0, -82.7485, 2.8615],
  [50.0, 2.8361, -74.02, 50.0, 0.0, -82.7485, 3.4412],
  [50.0, -1.3802, -84.2814, 50.0, 0.0, -82.7485, 1.0],
  [50.0, -1.1848, -84.8006, 50.0, 0.0, -82.7485, 1.0],
  [50.0, -0.9009, -85.5211, 50.0, 0.0, -82.7485, 1.0],
  [50.0, 0.0, 0.0, 50.0, -1.0, 2.0, 2.3669],
  [50.0, -1.0, 2.0, 50.0, 0.0, 0.0, 2.3669],
  [50.0, 2.49, -0.001, 50.0, -2.49, 0.0009, 7.1792],
  [50.0, 2.49, -0.001, 50.0, -2.49, 0.001, 7.1792],
  [50.0, 2.49, -0.001, 50.0, -2.49, 0.0011, 7.2195],
  [50.0, 2.49, -0.001, 50.0, -2.49, 0.0012, 7.2195],
  [50.0, -0.001, 2.49, 50.0, 0.0009, -2.49, 4.8045],
  [50.0, -0.001, 2.49, 50.0, 0.001, -2.49, 4.8045],
  [50.0, -0.001, 2.49, 50.0, 0.0011, -2.49, 4.7461],
  [50.0, 2.5, 0.0, 50.0, 0.0, -2.5, 4.3065],
  [50.0, 2.5, 0.0, 73.0, 25.0, -18.0, 27.1492],
  [50.0, 2.5, 0.0, 61.0, -5.0, 29.0, 22.8977],
  [50.0, 2.5, 0.0, 56.0, -27.0, -3.0, 31.903],
  [50.0, 2.5, 0.0, 58.0, 24.0, 15.0, 19.4535],
  [50.0, 2.5, 0.0, 50.0, 3.1736, 0.5854, 1.0],
  [50.0, 2.5, 0.0, 50.0, 3.2972, 0.0, 1.0],
  [50.0, 2.5, 0.0, 50.0, 1.8634, 0.5757, 1.0],
  [50.0, 2.5, 0.0, 50.0, 3.2592, 0.335, 1.0],
  [60.2574, -34.0099, 36.2677, 60.4626, -34.1751, 39.4387, 1.2644],
  [63.0109, -31.0961, -5.8663, 62.8187, -29.7946, -4.0864, 1.263],
  [61.2901, 3.7196, -5.3901, 61.4292, 2.248, -4.962, 1.8731],
  [35.0831, -44.1164, 3.7933, 35.0232, -40.0716, 1.5901, 1.8645],
  [22.7233, 20.0904, -46.694, 23.0331, 14.973, -42.5619, 2.0373],
  [36.4612, 47.858, 18.3852, 36.2715, 50.5065, 21.2231, 1.4146],
  [90.8027, -2.0831, 1.441, 91.1528, -1.6435, 0.0447, 1.4441],
  [90.9257, -0.5406, -0.9208, 88.6381, -0.8985, -0.7239, 1.5381],
  [6.7747, -0.2908, -2.4247, 5.8714, -0.0985, -2.2286, 0.6377],
  [2.0776, 0.0795, -1.135, 0.9033, -0.0636, -0.5514, 0.9082],
];

/** Lo que cuenta la página de un texto o de un trazo: su color, la opacidad de sus antepasados y los fondos de él hacia arriba. */
interface Visto {
  donde: string;
  color: string;
  opacidad: number;
  fondos: string[];
}

/** En la página: lo Visto de un elemento (su color o la propiedad que se diga) y, si se dice, los fondos de otro. */
const VER = `(el, propiedad = 'color', delFondo = el) => {
  let opacidad = 1;
  for (let e = el; e; e = e.parentElement) opacidad *= Number(getComputedStyle(e).opacity);
  const fondos = [];
  for (let e = delFondo; e; e = e.parentElement) fondos.push(getComputedStyle(e).backgroundColor);
  const donde = el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.classList.length ? '.' + [...el.classList].join('.') : '');
  return { donde, color: getComputedStyle(el).getPropertyValue(propiedad), opacidad, fondos };
}`;

/** En la página: lo Visto de cada elemento con texto que se ve (un nodo de texto no vacío), una vez por elemento. */
const TODO_EL_TEXTO = `(() => {
  const ver = ${VER};
  const vistos = new Set();
  const salida = [];
  const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
    const el = n.parentElement;
    if (n.textContent.trim() === '' || el === null || vistos.has(el)) continue;
    vistos.add(el);
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue;
    const visto = ver(el);
    salida.push({ ...visto, donde: visto.donde + ' «' + n.textContent.trim().slice(0, 30) + '»' });
  }
  return salida;
})()`;

/** El color que se ve: el del texto (con su opacidad) sobre la composición de sus fondos, desde el blanco. */
function colores(v: Visto): { texto: Rgb; fondo: Rgb } {
  const fondo = [...v.fondos].reverse().reduce((debajo, css) => sobre(leerColor(css), debajo), { r: 255, g: 255, b: 255, a: 1 } as Rgb);
  const t = leerColor(v.color);
  return { texto: sobre({ ...t, a: t.a * v.opacidad }, fondo), fondo };
}

const FAMILIAS = ['lexico', 'discurso', 'sintaxis', 'estadistica', 'puntuacion', 'canal', 'gramatica', 'ortotipografia'] as const;
const DALTONISMOS: readonly Daltonismo[] = ['protanopía', 'deuteranopía', 'tritanopía'];

describe('el contraste y el daltonismo', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };
  async function abrir(): Promise<void> {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
  }
  async function anchoDe(ancho: number): Promise<void> {
    await p().cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await p().hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
  }
  async function analizar(): Promise<void> {
    await p().evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('analizar').click();
    })()`);
    await p().hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
  }
  /** Los colores de cada familia, de una capa de prueba dentro de la vista (lo que la hoja le da a .capa.fam-…): su línea y sus dos tintes. */
  const familias = (): Promise<Record<string, { linea: Visto; tinte: Visto; activo: Visto }>> =>
    p().evaluar(`(() => {
      const ver = ${VER};
      const salida = {};
      for (const familia of ${JSON.stringify(FAMILIAS)}) {
        const tramo = document.createElement('span');
        tramo.className = 'tramo';
        const capa = document.createElement('span');
        capa.className = 'capa fam-' + familia;
        capa.textContent = 'Abc';
        tramo.append(capa);
        document.getElementById('vista').append(tramo);
        const linea = ver(capa, 'text-decoration-color', document.getElementById('vista'));
        const tinte = ver(capa);
        tramo.classList.add('activo');
        const activo = ver(capa);
        tramo.remove();
        salida[familia] = { linea, tinte, activo };
      }
      return salida;
    })()`);
  /** Lo que no llega: cada texto por debajo de 4,5, con su ratio, sus colores y dónde está. */
  const pordebajo = (vistos: readonly Visto[], que: string): string[] =>
    vistos.flatMap((v) => {
      const { texto, fondo } = colores(v);
      const r = contraste(texto, fondo);
      return r < 4.5 ? [`${que}: ${v.donde}, ${enHex(texto)} sobre ${enHex(fondo)}, ${r.toFixed(2)}`] : [];
    });

  after(async () => {
    await sesion?.cerrar();
  });

  test('1 · color.ts: los 34 pares de prueba de Sharma, Wu y Dalal, y blanco sobre negro, 21', () => {
    const fuera = PARES_DE_SHARMA.filter((f) => Math.abs(ciede2000(f.slice(0, 3), f.slice(3, 6)) - f[6]!) > 1e-4);
    assert.deepEqual(fuera, [], 'pares de Sharma fuera de 1e-4');
    assert.equal(contraste({ r: 255, g: 255, b: 255, a: 1 }, { r: 0, g: 0, b: 0, a: 1 }), 21);
  });

  test('2 · los pares del encargo, de sus elementos, con su umbral: texto 4,5, objetos 3, foco 3', async (t) => {
    await abrir();
    await anchoDe(1280);
    const pares: { que: string; visto: Visto; umbral: number }[] = [];
    const ver = (expresion: string): Promise<Visto> => p().evaluar(`(${VER})(${expresion})`);
    // Antes de analizar, con la página recién cargada y nada enfocado, el foco: la tecla Tab lleva al primer elemento de la
    // página; el anillo (outline-color) sobre lo que tiene detrás, su padre.
    for (const type of ['keyDown', 'keyUp']) await p().cdp('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    pares.push({
      que: 'el foco sobre bg (el anillo del primer elemento al tabular)',
      visto: await p().evaluar(`(() => { const el = document.activeElement; if (!el.matches(':focus-visible')) throw new Error('sin :focus-visible en ' + el.outerHTML.slice(0, 80)); return (${VER})(el, 'outline-color', el.parentElement); })()`),
      umbral: 3,
    });
    // El botón desactivado, el principal, el placeholder y el aviso de error.
    pares.push({ que: 'texto de botón desactivado sobre su fondo («Descargar informe», sin resultado)', visto: await ver(`document.getElementById('informe')`), umbral: 4.5 });
    pares.push({ que: 'blanco sobre accent (el botón principal)', visto: await ver(`document.getElementById('analizar')`), umbral: 4.5 });
    pares.push({ que: 'ink-2 sobre bg (el placeholder del cuadro)', visto: await p().evaluar(`(() => { const v = (${VER})(document.getElementById('texto')); return { ...v, donde: '#texto::placeholder', color: getComputedStyle(document.getElementById('texto'), '::placeholder').color }; })()`), umbral: 4.5 });
    const { root } = (await p().cdp('DOM.getDocument')) as { root: { nodeId: number } };
    const { nodeId } = (await p().cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '#paquete-propio' })) as { nodeId: number };
    await p().cdp('DOM.setFileInputFiles', { nodeId, files: [fileURLToPath(new URL(PAQUETES_DE_PRUEBA.invalido, EJEMPLOS_PUBLICOS))] });
    await p().hasta(`!document.getElementById('errores-propio').hidden`, 'el aviso de error');
    pares.push({ que: 'el aviso de error (el paquete propio que no entra)', visto: await ver(`document.querySelector('#errores-propio li, #errores-propio p')`), umbral: 4.5 });
    // Con resultado.
    await analizar();
    pares.push({ que: 'ink sobre bg (la vista del texto)', visto: await ver(`document.getElementById('vista')`), umbral: 4.5 });
    pares.push({ que: 'ink sobre card (la etiqueta de la pastilla)', visto: await ver(`document.querySelector('#medidor .pastilla .etiqueta')`), umbral: 4.5 });
    pares.push({ que: 'ink-2 sobre bg (el eslogan)', visto: await ver(`document.querySelector('.eslogan')`), umbral: 4.5 });
    const card = await ver(`document.querySelector('#medidor .pastilla')`);
    for (const [familia, { linea, tinte, activo }] of Object.entries(await familias())) {
      pares.push({ que: `la línea de ${familia} sobre bg`, visto: linea, umbral: 3 });
      pares.push({ que: `la línea de ${familia} sobre card`, visto: { ...linea, fondos: card.fondos }, umbral: 3 });
      pares.push({ que: `ink sobre el tinte de ${familia} (14 %)`, visto: tinte, umbral: 4.5 });
      pares.push({ que: `ink sobre el tinte activo de ${familia} (28 %)`, visto: activo, umbral: 4.5 });
    }
    const filas = pares.map(({ que, visto, umbral }) => {
      const { texto, fondo } = colores(visto);
      return { que, donde: visto.donde, texto: enHex(texto), fondo: enHex(fondo), ratio: contraste(texto, fondo), umbral };
    });
    for (const f of filas) t.diagnostic(`${f.que} | ${f.donde} | ${f.texto} sobre ${f.fondo} | ${f.ratio.toFixed(2)} | ${f.umbral}`);
    assert.equal(filas.length, 8 + 4 * FAMILIAS.length, 'los pares');
    assert.deepEqual(filas.filter((f) => !(f.ratio >= f.umbral)).map((f) => `${f.que}: ${f.ratio.toFixed(2)} < ${f.umbral}`), [], 'pares por debajo de su umbral');
  });

  test('3 · todo el texto que se ve, a 4,5 o más: el analizador (sin resultado, con resultado, con la tarjeta y con la hoja), el catálogo y una ficha', async (t) => {
    await abrir();
    const fuera: string[] = [];
    const leer = async (pestana: Pestana, que: string): Promise<void> => {
      const vistos = await pestana.evaluar<Visto[]>(TODO_EL_TEXTO);
      t.diagnostic(`${que}: ${vistos.length} elementos con texto`);
      assert.ok(vistos.length > 5, `${que}: ${vistos.length} elementos con texto`);
      fuera.push(...pordebajo(vistos, que));
    };
    await anchoDe(1280);
    await p().evaluar(`document.getElementById('otro').click()`);
    await leer(p(), 'el analizador sin resultado, desde 1280');
    await analizar();
    await leer(p(), 'con resultado, desde 1280');
    await p().evaluar(`document.querySelector('#vista .tramo[role="button"]').click()`);
    await p().hasta(`!document.getElementById('tarjeta').hidden`, 'la tarjeta');
    await leer(p(), 'con la tarjeta abierta, desde 1280');
    await p().evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
    await anchoDe(390);
    await p().evaluar(`document.querySelector('#vista .tramo[role="button"]').click()`);
    await p().hasta(`!document.getElementById('tarjeta').hidden`, 'la hoja');
    await leer(p(), 'con la hoja abierta, desde 390');
    await p().evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
    await anchoDe(1280);
    // El catálogo y una ficha, en la misma pestaña y el mismo preview (astro no deja abrir otro a la vez); y vuelta al analizador.
    try {
      for (const [ruta, que] of [
        ['reglas/', 'el catálogo'],
        ['reglas/disc-marcador-repetido/', 'una ficha'],
      ] as const) {
        await p().cdp('Page.navigate', { url: `${sesion!.url}${ruta}` });
        await p().hasta(`document.readyState === 'complete' && location.pathname.endsWith(${JSON.stringify(`/${ruta}`)})`, `${que}, cargado`);
        for (const ancho of [1280, 390]) {
          await anchoDe(ancho);
          await leer(p(), `${que}, desde ${ancho}`);
        }
      }
    } finally {
      await anchoDe(1280);
      await p().cdp('Page.navigate', { url: sesion!.url });
      await p().hasta(`document.getElementById('analizar')?.disabled === false`, 'el analizador, otra vez');
    }
    assert.deepEqual(fuera, [], 'texto por debajo de 4,5');
  });

  test('4 · el daltonismo: los ocho colores de familia, la distancia CIEDE2000 entre cada par, con la visión normal y con protanopía, deuteranopía y tritanopía; ningún par por debajo de 5', async (t) => {
    await abrir();
    const vistas = await familias();
    const color = Object.fromEntries(FAMILIAS.map((f) => [f, colores(vistas[f]!.linea).texto]));
    const visiones: [string, (c: Rgb) => Rgb][] = [['visión normal', (c) => c], ...DALTONISMOS.map((d): [string, (c: Rgb) => Rgb] => [d, (c) => simular(c, d)])];
    const bajos: string[] = [];
    const muyBajos: string[] = [];
    for (const [vision, ver] of visiones) {
      t.diagnostic(`${vision}: ${FAMILIAS.map((f) => `${f} ${enHex(ver(color[f]!))}`).join(' · ')}`);
      for (let i = 0; i < FAMILIAS.length; i++) {
        for (let j = i + 1; j < FAMILIAS.length; j++) {
          const [a, b] = [FAMILIAS[i]!, FAMILIAS[j]!];
          const d = ciede2000(lab(ver(color[a]!)), lab(ver(color[b]!)));
          if (d < 10) bajos.push(`${vision}: ${a} y ${b}, ${d.toFixed(2)}`);
          if (d < 5) muyBajos.push(`${vision}: ${a} y ${b}, ${d.toFixed(2)}`);
        }
      }
    }
    for (const b of bajos) t.diagnostic(`por debajo de 10 · ${b}`);
    assert.deepEqual(muyBajos, [], 'pares de familias por debajo de 5');
  });
});
