/**
 * Los jueces del analizador con su resultado (encargo 10.4, Tanda 2; DISEÑO
 * §6.1, §6.2 y §7), en Chrome sobre astro preview. Los tests van en orden y
 * comparten la pestaña.
 *
 *   1. A 1280, antes de analizar: dos columnas, la del texto de 34em (544) y
 *      la del resultado de 360, fija (sticky; desde la Tanda 3, a 16, con su
 *      scroll propio: jueces/columna.spec.ts), con «Aquí verás el resultado.»
 *      en un recuadro de borde line, radio 8 y 24 de margen. Desde la Tanda 3,
 *      los 360 son los de su contenido: la columna lleva además el margen del
 *      anillo de foco y el carril de la barra (estilos/resultado.css).
 *   2. Al analizar combinacion-real: el cuadro se pliega a tres líneas con «Tu
 *      texto» y «Editar el texto»; la vista, debajo, en la columna del texto;
 *      el foco, en la etiqueta del resultado; en la columna del resultado, de
 *      arriba abajo, la pastilla (card, radio 8, 24 de margen, etiqueta a 28 en
 *      negrita), lo que más pesa, las familias, «Ver el detalle», Español
 *      correcto y los botones «Descargar informe» y «Analizar otro texto».
 *   3. Las familias: una tarjeta por familia de los paquetes activos, bajo el
 *      nombre de su paquete, con su recuento (recuentoDeFamilias), Canal con
 *      «solo avisos», y atenuada la que no tiene señales.
 *   4. «Editar el texto» despliega el cuadro y lo enfoca; el resultado sigue.
 *   5. «Analizar otro texto» vacía el cuadro, quita el resultado y la vista,
 *      vuelve «Aquí verás el resultado.» y enfoca el cuadro.
 *   6. Con texto insuficiente: el aviso debajo del cuadro, unido a él con
 *      aria-describedby; el cuadro no se pliega; la columna sigue con «Aquí
 *      verás el resultado.»; el bloque del resultado, solo para el papel.
 *   7. A 820, una columna y los bloques en el orden del modelo: cuadro
 *      plegado, pastilla, lo que más pesa, vista, familias, detalle y botones;
 *      la vista, de 34em de su letra como mucho (612).
 *   8. A 390, la pastilla con 20 de margen y la etiqueta a 24/30; los
 *      botones, uno debajo de otro y a todo el ancho.
 *   9. A 320, sin scroll horizontal, antes y después de analizar (WCAG 2.2,
 *      1.4.10).
 *
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/reflow.html — 1.4.10:
 *    «without requiring scrolling in two dimensions» a 320 CSS px de ancho.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
 *    — mayor que clientWidth cuando hay desbordamiento horizontal.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as textos from '../src/textos.ts';
import { recuentoDeFamilias } from '../src/pantalla/lectura.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { motorDelNavegador, paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const CARD = 'rgb(245, 245, 245)';
const LINEA = 'rgb(217, 217, 217)';
const TINTA_2 = 'rgb(74, 74, 74)';

interface Caja {
  izquierda: number;
  derecha: number;
  arriba: number;
  ancho: number;
  alto: number;
  visible: boolean;
}

describe('el resultado del analizador en Chrome, sobre astro preview', () => {
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
    await (await p()).hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
  };
  const caja = async (selector: string): Promise<Caja> =>
    (await p()).evaluar<Caja>(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); const r = e.getBoundingClientRect(); return { izquierda: r.left + scrollX, derecha: r.right + scrollX, arriba: r.top + scrollY, ancho: r.width, alto: r.height, visible: e.checkVisibility() }; })()`);
  const estilo = async (selector: string, propiedades: readonly string[]): Promise<string[]> =>
    (await p()).evaluar<string[]>(`(() => { const c = getComputedStyle(document.querySelector(${JSON.stringify(selector)})); return ${JSON.stringify(propiedades)}.map((x) => c.getPropertyValue(x)); })()`);
  const analizar = async (texto: string): Promise<void> => {
    const pestana = await p();
    await pestana.evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(texto)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
  };
  const sinScrollHorizontal = async (): Promise<[number, number]> => (await p()).evaluar(`[document.documentElement.scrollWidth, document.documentElement.clientWidth]`);

  test('1 · a 1280, antes de analizar: dos columnas, la del resultado fija y con «Aquí verás el resultado.»', async () => {
    await anchoDe(1280);
    const [texto, hueco] = await Promise.all(['#columna-texto', '#hueco-resultado'].map(caja));
    assert.deepEqual([texto!.ancho, hueco!.ancho], [544, 360], 'los anchos de las columnas');
    assert.ok(hueco!.izquierda - texto!.derecha >= 64, `entre columnas: ${hueco!.izquierda - texto!.derecha}`);
    assert.equal(Math.round(texto!.arriba), Math.round(hueco!.arriba), 'las dos columnas empiezan a la misma altura');
    assert.deepEqual(await estilo('#columna-resultado', ['position', 'top']), ['sticky', '16px']);
    assert.equal(await (await p()).evaluar(`document.getElementById('hueco-resultado').textContent`), textos.AQUI_VERAS_EL_RESULTADO);
    assert.ok(hueco!.visible, 'el recuadro se ve');
    assert.deepEqual(await estilo('#hueco-resultado', ['border-top', 'border-radius', 'padding', 'color']), [`1px solid ${LINEA}`, '8px', '24px', TINTA_2]);
  });

  test('2 · al analizar: el cuadro plegado, la vista debajo, el foco en la etiqueta y los bloques del resultado en su orden', async () => {
    await analizar(TEXTO_DE_COMBINACION_REAL);
    const pestana = await p();
    assert.deepEqual(
      await pestana.evaluar(`[document.getElementById('formulario').checkVisibility(), document.getElementById('plegado').checkVisibility(), document.querySelector('.plegado-etiqueta').textContent, document.getElementById('editar').textContent]`),
      [false, true, 'Tu texto', textos.EDITAR_EL_TEXTO],
    );
    const plegado = await caja('.texto-plegado');
    assert.ok(Math.abs(plegado.alto - (3 * 27 + 2 * 16 + 2)) <= 1, `el cuadro plegado, a tres líneas: ${plegado.alto}`);
    const [vista, columnaTexto] = await Promise.all(['#vista', '#columna-texto'].map(caja));
    assert.ok(vista!.visible && vista!.arriba > plegado.arriba + plegado.alto && vista!.izquierda === columnaTexto!.izquierda, 'la vista, debajo del cuadro plegado, en la columna del texto');
    assert.equal(await pestana.evaluar(`document.activeElement.matches('#medidor .pastilla > .etiqueta')`), true, 'el foco, en la etiqueta');
    const orden = await Promise.all(['#medidor .pastilla', '.lo-que-mas-pesa', '#leyenda', '#desglose > .detalle', '.otro-paquete', '.acciones-resultado'].map(caja));
    assert.ok(orden.every((c) => c.visible && c.izquierda >= columnaTexto!.derecha), 'todos, en la columna del resultado');
    assert.deepEqual(orden.map((c) => c.arriba), [...orden.map((c) => c.arriba)].sort((a, b) => a - b), 'de arriba abajo, en el orden del modelo');
    assert.deepEqual(await estilo('#medidor .pastilla', ['background-color', 'border-radius', 'padding']), [CARD, '8px', '24px'], 'la pastilla');
    assert.deepEqual(await estilo('#medidor .pastilla > .etiqueta', ['font-size', 'line-height', 'font-weight']), ['28px', '33.6px', '700'], 'la etiqueta');
    assert.deepEqual(
      await pestana.evaluar(`[...document.querySelectorAll('.acciones-resultado button')].map((b) => [b.textContent, b.classList.contains('boton-principal')])`),
      [[textos.DESCARGAR_INFORME, true], [textos.ANALIZAR_OTRO_TEXTO, false]],
    );
    assert.equal(await pestana.evaluar(`document.getElementById('informe').checkVisibility()`), false, 'el «Descargar informe» del formulario, no, con el resultado');
  });

  test('3 · las familias: una tarjeta por familia, bajo su paquete, con su recuento; Canal, solo avisos; sin señales, atenuada', async () => {
    const { analizar: analizarEnNode } = await motorDelNavegador();
    const paquetes = paquetesIncluidos();
    const r = analizarEnNode(TEXTO_DE_COMBINACION_REAL, paquetes, { genero: 'general' });
    const recuento = recuentoDeFamilias(r);
    const indice = indexar(paquetes);
    // Por paquete, las que puntúan y, en su propia lista detrás, las informativas (Canal aparte, como en el modelo).
    const enGrupo = [...new Set(indice.familias.map((f) => f.paquete))].flatMap((paquete) => {
      const del = indice.familias.filter((f) => f.paquete === paquete);
      return [...del.filter((f) => !f.informativa), ...del.filter((f) => f.informativa)];
    });
    const esperadas = enGrupo.map((f) => [f.paquete, f.informativa ? textos.familiaInformativa(f.nombre, recuento.get(f.clave)!) : textos.familiaConRecuento(f.nombre, recuento.get(f.clave)!), recuento.get(f.clave) === 0]);
    const vistas = await (await p()).evaluar(`[...document.querySelectorAll('#leyenda .grupo-familias')].flatMap((g) => [...g.querySelectorAll('li')].map((li) => [g.querySelector('h3').textContent, li.querySelector('.etiqueta-familia').textContent, li.classList.contains('atenuada')]))`);
    assert.deepEqual(vistas, esperadas);
    // Los del modelo, con este mismo texto: Discurso 7, Léxico 1, Sintaxis 2, Gramática 2, Ortotipografía 7 y Canal 1.
    assert.deepEqual(
      ['RadiografIA::discurso', 'RadiografIA::lexico', 'RadiografIA::sintaxis', 'Español correcto::gramatica', 'Español correcto::ortotipografia', 'RadiografIA::canal'].map((k) => recuento.get(k)),
      [7, 1, 2, 2, 7, 1],
    );
  });

  test('4 · «Editar el texto» despliega el cuadro y lo enfoca; el resultado sigue', async () => {
    const pestana = await p();
    await pestana.evaluar(`document.getElementById('editar').click()`);
    assert.deepEqual(
      await pestana.evaluar(`[document.getElementById('formulario').checkVisibility(), document.getElementById('plegado').checkVisibility(), document.activeElement.id, document.getElementById('texto').value === ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)}, document.querySelector('#medidor .pastilla').checkVisibility(), document.getElementById('vista').checkVisibility()]`),
      [true, false, 'texto', true, true, true],
    );
  });

  test('5 · «Analizar otro texto» vacía el cuadro, quita el resultado y enfoca el cuadro', async () => {
    const pestana = await p();
    await analizar(TEXTO_DE_COMBINACION_REAL);
    await pestana.evaluar(`document.getElementById('otro').click()`);
    assert.deepEqual(
      await pestana.evaluar(`[document.getElementById('texto').value, document.activeElement.id, document.getElementById('formulario').checkVisibility(), document.getElementById('resultado').checkVisibility(), document.getElementById('vista').checkVisibility(), document.getElementById('plegado').checkVisibility(), document.getElementById('hueco-resultado').checkVisibility(), document.getElementById('informe').checkVisibility(), document.getElementById('informe').disabled]`),
      ['', 'texto', true, false, false, false, true, true, true],
    );
  });

  test('6 · con texto insuficiente: el aviso debajo del cuadro, con aria-describedby; nada se pliega y el bloque es para el papel', async () => {
    const pestana = await p();
    await analizar('Un texto de pocas palabras.');
    const { analizar: analizarEnNode } = await motorDelNavegador();
    const palabras = analizarEnNode('Un texto de pocas palabras.', paquetesIncluidos(), { genero: 'general' }).palabrasProsa;
    assert.deepEqual(
      await pestana.evaluar(`(() => { const a = document.getElementById('aviso-insuficiente'); return [a.checkVisibility(), a.textContent.trim(), document.getElementById('texto').getAttribute('aria-describedby'), document.getElementById('formulario').checkVisibility(), document.getElementById('hueco-resultado').checkVisibility(), document.getElementById('resultado').checkVisibility(), document.getElementById('informe').disabled]; })()`),
      [true, textos.textoInsuficiente(palabras), 'aviso-insuficiente', true, true, false, false],
    );
    const [aviso, cuadro] = await Promise.all(['#aviso-insuficiente', '#texto'].map(caja));
    assert.ok(aviso!.arriba >= cuadro!.arriba + cuadro!.alto, 'el aviso, debajo del cuadro');
    await analizar(TEXTO_DE_COMBINACION_REAL);
    assert.deepEqual(await pestana.evaluar(`[document.getElementById('aviso-insuficiente').checkVisibility(), document.getElementById('texto').hasAttribute('aria-describedby')]`), [false, false], 'con un texto que se analiza, el aviso se va');
  });

  test('7 · a 820, una columna con los bloques en el orden del modelo; la vista, de 34em de su letra como mucho', async () => {
    await anchoDe(820);
    const orden = await Promise.all(['#plegado', '#medidor .pastilla', '.lo-que-mas-pesa', '#vista', '#leyenda', '#desglose', '.acciones-resultado'].map(caja));
    assert.ok(orden.every((c) => c.visible), 'todos se ven');
    assert.deepEqual(orden.map((c) => c.arriba), [...orden.map((c) => c.arriba)].sort((a, b) => a - b), `de arriba abajo: ${orden.map((c) => Math.round(c.arriba)).join(' · ')}`);
    assert.equal(new Set(orden.map((c) => Math.round(c.izquierda))).size, 1, 'todos, al mismo margen');
    assert.equal((await caja('#vista')).ancho, 612, 'la vista, 34em de Literata a 18');
  });

  test('8 · a 390: la pastilla con 20 de margen y la etiqueta a 24/30; los botones, uno debajo de otro y a todo el ancho', async () => {
    await anchoDe(390);
    assert.deepEqual(await estilo('#medidor .pastilla', ['padding']), ['20px']);
    assert.deepEqual(await estilo('#medidor .pastilla > .etiqueta', ['font-size', 'line-height']), ['24px', '30px']);
    const [informe, otro, vista] = await Promise.all(['#descargar', '#otro', '#vista'].map(caja));
    assert.deepEqual([informe!.ancho, otro!.ancho], [vista!.ancho, vista!.ancho], 'a todo el ancho');
    assert.ok(otro!.arriba > informe!.arriba, 'uno debajo de otro');
  });

  test('9 · a 320, sin scroll horizontal, antes y después de analizar', async () => {
    await anchoDe(320);
    const [despues, util] = await sinScrollHorizontal();
    assert.ok(despues <= util, `con resultado: ${despues} de contenido en ${util} de ancho`);
    await (await p()).evaluar(`document.getElementById('otro').click()`);
    const [antes, util2] = await sinScrollHorizontal();
    assert.ok(antes <= util2, `sin resultado: ${antes} de contenido en ${util2} de ancho`);
    await anchoDe(1280);
  });
});
