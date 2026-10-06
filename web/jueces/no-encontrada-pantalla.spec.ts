/**
 * La página que no existe en Chrome, sobre astro preview (11.2; firmada por Antonio el 06/10, textos incluidos):
 * dist/404.html, que el servidor sirve con el código 404 en cualquier dirección que no lleve a una página (el
 * ErrorDocument del .htaccess de la rama publicacion). astro preview hace lo mismo, y por eso se abre en /no-existe/.
 * Con la misma cabecera y el mismo pie que las demás y, como la de créditos, en una columna de 34em.
 *
 *   1. Llega con el código 404, en /no-existe/.
 *   2. A 1280: la columna de 34em, centrada; el título de la pestaña y el <h1>, «No hay nada aquí», y debajo la frase.
 *   3. Sus dos enlaces, en su orden, cada uno a su dirección desde la raíz y de 44 de alto: «Ir al analizador» y «Ver
 *      el catálogo de reglas».
 *   4. A 820, la misma columna; a 390, a todo el ancho; a 320, sin scroll horizontal (WCAG 1.4.10).
 *   5. Ninguna petición de red después de la carga, y ninguna violación de la CSP.
 *
 * El tamaño de lo que se pulsa y el árbol de accesibilidad, con las demás páginas: pulsacion.spec.ts y
 * arbol-accesible.spec.ts. Que la página exista con sus textos y sus direcciones desde la raíz, en construccion.spec.ts
 * (16), y sus textos, en textos-web.spec.ts.
 *
 * [DOC] https://w3c.github.io/navigation-timing/#dom-performanceresourcetiming-responsestatus — responseStatus: «the
 *    response's status», en la entrada de la navegación (PerformanceNavigationTiming).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { urlDelAnalizador, urlDelCatalogo } from '../src/catalogo/catalogo.ts';
import * as textos from '../src/textos.ts';
import { abrirConTestigos, type PaginaConTestigos, type Pestana } from './chrome.ts';

describe('la página que no existe en Chrome, sobre astro preview', () => {
  let sesion: PaginaConTestigos | undefined;
  let arranque: Promise<PaginaConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirConTestigos('no-existe/', `document.readyState === 'complete'`, 'la página que no existe cargada'));
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  const anchoDe = async (ancho: number): Promise<void> => {
    await (await p()).cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await (await p()).hasta(`innerWidth === ${ancho}`, `el ancho de ${ancho}`);
  };
  const caja = async (selector: string): Promise<{ izquierda: number; derecha: number; ancho: number; alto: number }> =>
    (await p()).evaluar(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { izquierda: r.left, derecha: r.right, ancho: r.width, alto: r.height }; })()`);

  test('1 · llega con el código 404, en /no-existe/', async () => {
    const pestana = await p();
    assert.deepEqual(await pestana.evaluar(`[location.pathname, performance.getEntriesByType('navigation')[0].responseStatus]`), ['/no-existe/', 404]);
  });

  test('2 · a 1280: la columna de 34em centrada; el título de la pestaña y el <h1>, y la frase', async () => {
    await anchoDe(1280);
    const pestana = await p();
    const [main, columna] = await Promise.all(['body > main', '.no-encontrada'].map(caja));
    assert.equal(columna!.ancho, 544, 'la columna, 34em de la letra de la interfaz (16)');
    const pagina = await pestana.evaluar<number>('document.documentElement.clientWidth');
    assert.ok(Math.abs(columna!.izquierda - (pagina - columna!.derecha)) <= 1, `centrada: ${columna!.izquierda} y ${pagina - columna!.derecha}`);
    assert.ok(main!.ancho >= columna!.ancho);
    assert.deepEqual(
      await pestana.evaluar(`[document.title, document.querySelector('.no-encontrada h1').textContent, document.querySelector('.no-encontrada p').textContent]`),
      [`${textos.NO_HAY_NADA_AQUI} · RadiografIA`, textos.NO_HAY_NADA_AQUI, textos.ESA_DIRECCION_NO_LLEVA],
    );
  });

  test('3 · sus dos enlaces, en su orden, a su dirección desde la raíz y de 44 de alto', async () => {
    const enlaces = await (await p()).evaluar<[string, string, number][]>(`[...document.querySelectorAll('.no-encontrada a')].map((a) => [a.getAttribute('href'), a.textContent, a.getBoundingClientRect().height])`);
    assert.deepEqual(enlaces, [
      [urlDelAnalizador('/'), textos.IR_AL_ANALIZADOR, 44],
      [urlDelCatalogo('/'), textos.VER_EL_CATALOGO_DE_REGLAS, 44],
    ]);
  });

  test('4 · a 820, la misma columna; a 390, a todo el ancho; a 320, sin scroll horizontal', async () => {
    const pestana = await p();
    await anchoDe(820);
    assert.equal((await caja('.no-encontrada')).ancho, 544, 'a 820, la columna de 34em');
    await anchoDe(390);
    const [main, columna] = await Promise.all(['body > main', '.no-encontrada'].map(caja));
    assert.equal(columna!.ancho, main!.ancho, 'a 390, a todo el ancho');
    await anchoDe(320);
    const [contenido, util] = await pestana.evaluar<[number, number]>(`[document.documentElement.scrollWidth, document.documentElement.clientWidth]`);
    assert.ok(contenido <= util, `${contenido} de contenido en ${util} de ancho`);
    await anchoDe(1280);
  });

  test('5 · ninguna petición de red después de la carga y ninguna violación de la CSP', async () => {
    await p();
    assert.deepEqual(sesion!.despues, []);
    assert.deepEqual(await sesion!.violaciones(), []);
  });
});
