/**
 * La página de créditos y licencias en Chrome, sobre astro preview (11.1, hallazgo 2 del censo pre-despliegue; firmada
 * por Antonio): /creditos/, con la misma cabecera y el mismo pie que las demás y, como la ficha (DISEÑO §6.4), en una
 * columna de 34em. Su contenido, de textos.ts (SECCIONES_DE_LOS_CREDITOS).
 *
 *   1. A 1280: la columna de 34em, centrada; el título de la pestaña y el <h1>, «Créditos y licencias», y debajo la
 *      presentación.
 *   2. Las secciones, en su orden, cada una nombrada por su título; en cada una, lo que va debajo del título y sus
 *      obras, cada una con su nombre, sus párrafos y sus enlaces, como en textos.ts.
 *   3. Los enlaces: cada uno a su dirección (los de la propia web, con la base delante), de 44 de alto; los de fuera,
 *      con el icono de enlace externo, aria-hidden, y «(enlace externo)» para el lector, como las fuentes de la ficha.
 *   4. A 820, la misma columna; a 390, a todo el ancho; a 320, sin scroll horizontal (WCAG 1.4.10).
 *   5. Ninguna petición de red después de la carga, y ninguna violación de la CSP.
 *
 * El tamaño de lo que se pulsa y el árbol de accesibilidad, con las demás páginas: pulsacion.spec.ts y
 * arbol-accesible.spec.ts. Que la página exista, que todo pie la enlace y la cita del BOE, en construccion.spec.ts (12).
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as textos from '../src/textos.ts';
import { abrirConTestigos, type PaginaConTestigos, type Pestana } from './chrome.ts';

/** Lo que la página pinta de cada sección, leído del DOM. */
interface SeccionPintada {
  titulo: string;
  nombrada: boolean;
  presentacion: string | null;
  obras: { nombre: string; parrafos: string[]; enlaces: [string, string][] }[];
}

describe('la página de créditos en Chrome, sobre astro preview', () => {
  let sesion: PaginaConTestigos | undefined;
  let arranque: Promise<PaginaConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirConTestigos('creditos/', `document.readyState === 'complete'`, 'la página de créditos cargada'));
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

  test('1 · a 1280: la columna de 34em centrada; el título de la pestaña y el <h1>, y la presentación', async () => {
    await anchoDe(1280);
    const pestana = await p();
    const [main, columna] = await Promise.all(['body > main', '.creditos'].map(caja));
    assert.equal(columna!.ancho, 544, 'la columna, 34em de la letra de la interfaz (16)');
    const pagina = await pestana.evaluar<number>('document.documentElement.clientWidth');
    assert.ok(Math.abs(columna!.izquierda - (pagina - columna!.derecha)) <= 1, `centrada: ${columna!.izquierda} y ${pagina - columna!.derecha}`);
    assert.ok(main!.ancho >= columna!.ancho);
    assert.deepEqual(
      await pestana.evaluar(`[document.title, document.querySelector('.creditos h1').textContent, document.querySelector('.cabeza-creditos p').textContent]`),
      [`${textos.CREDITOS_Y_LICENCIAS} · RadiografIA`, textos.CREDITOS_Y_LICENCIAS, textos.PRESENTACION_DE_LOS_CREDITOS],
    );
  });

  test('2 · las secciones, en su orden y nombradas por su título; sus obras, con su nombre, sus párrafos y sus enlaces, como en textos.ts', async () => {
    const pintadas = await (await p()).evaluar<SeccionPintada[]>(`[...document.querySelectorAll('.creditos > section')].map((s) => {
      const h2 = s.querySelector(':scope > h2');
      const presentacion = s.querySelector(':scope > p');
      return {
        titulo: h2.textContent,
        nombrada: s.getAttribute('aria-labelledby') === h2.id && h2.id !== '',
        presentacion: presentacion === null ? null : presentacion.textContent,
        obras: [...s.querySelectorAll(':scope > .obra')].map((o) => ({
          nombre: o.querySelector('h3').textContent,
          parrafos: [...o.querySelectorAll(':scope > p')].map((x) => x.textContent),
          enlaces: [...o.querySelectorAll('a')].map((a) => [a.getAttribute('href'), a.querySelector('span').textContent]),
        })),
      };
    })`);
    const base = (url: string): string => (/^https?:\/\//.test(url) ? url : `/${url}`);
    assert.deepEqual(
      pintadas,
      textos.SECCIONES_DE_LOS_CREDITOS.map((s) => ({
        titulo: s.titulo,
        nombrada: true,
        presentacion: s.presentacion,
        obras: s.obras.map((o) => ({ nombre: o.nombre, parrafos: [...o.parrafos], enlaces: Object.entries(o.enlaces).map(([url, texto]) => [base(url), texto]) })),
      })),
    );
  });

  test('3 · los enlaces: de 44 de alto; los de fuera, con el icono aria-hidden y «(enlace externo)» para el lector', async () => {
    const enlaces = await (await p()).evaluar<{ href: string; alto: number; icono: boolean; lector: string | null }[]>(`[...document.querySelectorAll('.creditos a')].map((a) => {
      const icono = a.querySelector('svg');
      return { href: a.getAttribute('href'), alto: a.getBoundingClientRect().height, icono: icono !== null && icono.getAttribute('aria-hidden') === 'true', lector: a.querySelector('.solo-lector')?.textContent ?? null };
    })`);
    assert.ok(enlaces.length > 10, `${enlaces.length} enlaces`);
    assert.deepEqual(enlaces.filter((e) => e.alto < 44).map((e) => `${e.href}: ${e.alto}`), [], 'enlaces de menos de 44 de alto');
    const fuera = (e: { href: string }): boolean => /^https?:\/\//.test(e.href);
    assert.deepEqual(enlaces.filter((e) => fuera(e) !== e.icono || (fuera(e) ? e.lector !== textos.ENLACE_EXTERNO : e.lector !== null)).map((e) => e.href), [], 'enlaces sin su icono y su «(enlace externo)», o con ellos sin ser de fuera');
  });

  test('4 · a 820, la misma columna; a 390, a todo el ancho; a 320, sin scroll horizontal', async () => {
    const pestana = await p();
    await anchoDe(820);
    assert.equal((await caja('.creditos')).ancho, 544, 'a 820, la columna de 34em');
    await anchoDe(390);
    const [main, columna] = await Promise.all(['body > main', '.creditos'].map(caja));
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
