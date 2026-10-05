/**
 * El orden del documento es el que se ve (encargo 10.4, Tanda 4; decisión de
 * Antonio en la parada 3; DISEÑO §6.1): el lector de pantalla lee en el orden
 * del documento, también lo que no es enfocable. En la tableta, la pastilla y
 * «Lo que más pesa» se veían antes que la vista del texto pero iban después en
 * el documento (order de CSS); el orden del tabulador sí coincidía, porque ahí
 * no hay nada enfocable (jueces/orden-del-foco.spec.ts). En Chrome sobre astro
 * preview, se recorren en el orden del documento los trozos de texto de <main>
 * que se ven y que lee el lector (fuera lo que lleva aria-hidden) y cada uno
 * tiene que verse después del anterior: más abajo o, en la misma fila, más a
 * la derecha. De cada trozo cuenta su primer rectángulo (getClientRects()[0]
 * de un Range): un trozo que se parte entre dos líneas está donde empieza; y el
 * sitio es el del contenido: lo desplazado en la página y en cada caja con
 * scroll propio se suma. Lo que solo es para el lector (.solo-lector), fuera
 * de la vista, no tiene sitio que comparar y no cuenta.
 *
 *   1. A 820, antes de analizar.
 *   2. A 820, con el resultado de combinacion-real.
 *   3. A 390, con el resultado: en la pestaña Texto, en Reglas y en Datos.
 *   4. A 1280, con el resultado: columna a columna (la del texto y la del
 *      resultado, con su scroll propio), como antes.
 *   5. Al cambiar de ancho, la vista cambia de sitio en el documento (a 1280,
 *      en la columna del texto, debajo del cuadro plegado; a 820, detrás del
 *      medidor) y el tramo que tenía el foco lo conserva (pantalla/
 *      pestanas.ts: mover un nodo le quita el foco).
 *   6. A 390, antes de analizar (tras «Analizar otro texto»).
 *
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html
 *    — 1.3.2: «When the sequence in which content is presented affects its
 *    meaning, a correct reading sequence can be programmatically
 *    determined».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/order
 *    — «will create a disconnect between the visual presentation of content
 *    and DOM order».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Range/getClientRects
 *    — los rectángulos de lo que abarca el Range; un trozo de texto partido
 *    entre dos líneas da uno por línea.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Document/createTreeWalker
 *    — NodeFilter.SHOW_TEXT: los nodos de texto, en el orden del documento.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility
 *    — false si «The element doesn't have an associated box, for example
 *    because the CSS display property is set to none or contents» o si su
 *    content-visibility «has (or inherits) a value of hidden», que es lo que
 *    lleva el contenido de un <details> cerrado: Chrome le calcula sitio si se
 *    le pregunta (visto al escribir este juez, con «Ver el detalle» plegado);
 *    con visibilityProperty, también lo invisible por visibility. Como un
 *    elemento con display: contents no tiene caja, se mira la del antepasado
 *    más cercano que la tenga.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

interface Trozo {
  texto: string;
  /** 1 lo de la columna del texto (o la página en una columna), 2 la columna del resultado. */
  region: number;
  arriba: number;
  abajo: number;
  izquierda: number;
}

/** ¿Se ve b antes que a? Por región; en la misma fila (se solapan en más de la mitad del más bajo), más a la izquierda; si no, más arriba. */
function seVeAntes(b: Trozo, a: Trozo, porColumnas: boolean): boolean {
  if (porColumnas && b.region !== a.region) return b.region < a.region;
  const solape = Math.min(a.abajo, b.abajo) - Math.max(a.arriba, b.arriba);
  if (solape > Math.min(a.abajo - a.arriba, b.abajo - b.arriba) / 2) return b.izquierda < a.izquierda - 1;
  return b.arriba < a.arriba;
}

/** Los pares seguidos del documento en los que el segundo se ve antes que el primero. */
function desordenes(trozos: readonly Trozo[], porColumnas: boolean): string[] {
  const malos: string[] = [];
  for (let i = 1; i < trozos.length; i++) {
    const [a, b] = [trozos[i - 1]!, trozos[i]!];
    if (seVeAntes(b, a, porColumnas)) malos.push(`«${b.texto}» (${Math.round(b.arriba)}) se ve antes que «${a.texto}» (${Math.round(a.arriba)}), que va antes en el documento`);
  }
  return malos;
}

describe('el orden del documento es el que se ve, en Chrome sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  /** Cambia el ancho y espera a que la página lo haya recibido (con resultado, las pestañas del móvil y el sitio de la vista). */
  const anchoDe = async (ancho: number): Promise<void> => {
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await pestana.hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
  };
  /** Los trozos de texto de <main> que se ven y lee el lector, en el orden del documento, cada uno con su sitio. */
  const trozos = async (): Promise<Trozo[]> =>
    (await p()).evaluar<Trozo[]>(`(() => {
      const main = document.querySelector('main');
      const caminante = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      const salida = [];
      for (let n = caminante.nextNode(); n !== null; n = caminante.nextNode()) {
        if (n.data.trim() === '') continue;
        const padre = n.parentElement;
        if (padre.closest('[aria-hidden="true"], .solo-lector')) continue;
        // Lo de un <details> cerrado no se ve, pero Chrome le calcula sitio si se le pregunta: checkVisibility() lo descarta.
        let caja = padre;
        while (getComputedStyle(caja).display === 'contents') caja = caja.parentElement;
        if (!caja.checkVisibility({ visibilityProperty: true })) continue;
        const rango = document.createRange();
        rango.selectNodeContents(n);
        const r = [...rango.getClientRects()].find((x) => x.width > 0 && x.height > 0);
        if (r === undefined) continue;
        // El sitio en el contenido, no en la ventana: más lo desplazado de la página y de cada caja con scroll propio.
        let dy = scrollY;
        let dx = scrollX;
        for (let x = padre; x !== null && x !== document.body && x !== document.documentElement; x = x.parentElement) {
          dy += x.scrollTop;
          dx += x.scrollLeft;
        }
        salida.push({
          texto: n.data.trim().replace(/\\s+/g, ' ').slice(0, 30),
          region: padre.closest('#columna-resultado') ? 2 : 1,
          arriba: r.top + dy, abajo: r.bottom + dy, izquierda: r.left + dx,
        });
      }
      return salida;
    })()`);
  const juzgar = async (que: string, porColumnas = false): Promise<void> => {
    const t = await trozos();
    assert.ok(t.length >= 3, `${que}: hay texto que leer (${t.length} trozos)`);
    assert.deepEqual(desordenes(t, porColumnas), [], `${que}: cada trozo se ve después del anterior del documento`);
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
  const elegir = async (pestanaDelMovil: string): Promise<void> => {
    const pestana = await p();
    await pestana.evaluar(`document.getElementById('pestana-${pestanaDelMovil}').click()`);
    await pestana.hasta(`!document.getElementById('panel-${pestanaDelMovil}').hidden`, `la pestaña ${pestanaDelMovil}`);
  };

  test('1 · a 820, antes de analizar', async () => {
    await anchoDe(820);
    await juzgar('a 820, antes de analizar');
  });

  test('2 · a 820, con el resultado', async () => {
    await analizar();
    await anchoDe(820);
    await juzgar('a 820, con el resultado');
  });

  test('3 · a 390, con el resultado: en Texto, en Reglas y en Datos', async () => {
    await anchoDe(390);
    for (const pestanaDelMovil of ['texto', 'reglas', 'datos']) {
      await elegir(pestanaDelMovil);
      await juzgar(`a 390, con el resultado, en la pestaña ${pestanaDelMovil}`);
    }
    await elegir('texto');
  });

  test('4 · a 1280, con el resultado: columna a columna', async () => {
    await anchoDe(1280);
    await juzgar('a 1280, con el resultado', true);
  });

  test('5 · al cambiar de ancho, la vista cambia de sitio en el documento y el tramo que tenía el foco lo conserva', async () => {
    const pestana = await p();
    const sitio = `(() => {
      const v = document.getElementById('vista');
      return [v.previousElementSibling?.id ?? null, v.parentElement.id, document.activeElement.classList.contains('tramo'), document.activeElement.dataset.ordenDelDocumento ?? null];
    })()`;
    await pestana.evaluar(`(() => { const t = document.querySelector('#vista .tramo'); t.dataset.ordenDelDocumento = 'primero'; t.focus(); })()`);
    assert.deepEqual(await pestana.evaluar(sitio), ['plegado', 'columna-texto', true, 'primero'], 'a 1280, en la columna del texto, debajo del cuadro plegado');
    await anchoDe(820);
    assert.deepEqual(await pestana.evaluar(sitio), ['medidor', 'resultado', true, 'primero'], 'a 820, detrás del medidor');
    await anchoDe(1280);
    assert.deepEqual(await pestana.evaluar(sitio), ['plegado', 'columna-texto', true, 'primero'], 'otra vez a 1280');
    await pestana.evaluar(`delete document.querySelector('[data-orden-del-documento]').dataset.ordenDelDocumento`);
  });

  test('6 · a 390, antes de analizar', async () => {
    await (await p()).evaluar(`document.getElementById('otro').click()`);
    await (await p()).hasta(`document.getElementById('resultado').hidden`, 'sin el resultado');
    await anchoDe(390);
    await juzgar('a 390, antes de analizar');
  });
});
