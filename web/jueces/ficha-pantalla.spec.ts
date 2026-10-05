/**
 * La ficha de una regla en Chrome, sobre astro preview (encargo 10.4, Tanda 3;
 * DISEÑO §6.4, como el modelo), con la de disc-marcador-repetido, la del
 * modelo. Los tests van en orden y comparten la pestaña.
 *
 *   1. A 1280: una columna de 34em, centrada; la pastilla de la familia
 *      (redonda, con la muestra de su línea y la sigla, las dos aria-hidden, y
 *      «familia · paquete versión»); el nombre en el <h1>, con el id debajo a
 *      15 en ink-2; la frase en claro, en Literata 18.
 *   2. Las secciones, cada una con su título y nombrada por él, en el orden
 *      del DISEÑO (Qué hacer, Explicación, Excepciones, Datos de la regla,
 *      Cómo busca, Fuentes y los ejemplos en los que dispara y en los que
 *      no); los datos, en un recuadro card de borde line, radio 8 y 16 de
 *      margen, con cada etiqueta en negrita y con sus dos puntos.
 *   3. Las fuentes: cada una, un enlace a su dirección de 44 de alto, con el
 *      icono de enlace externo (aria-hidden) y «(enlace externo)» para el
 *      lector.
 *   4. Los ejemplos, en recuadros de borde line, radio 8 y 16 de margen, tal
 *      cual; en los positivos, marcados con la línea de la familia y su sigla
 *      los mismos tramos que da el motor (detectar, recalculado aquí); en los
 *      negativos, ninguno; el tramo no se toca (ni botón ni foco). En una
 *      regla estadística, que mira el texto entero, ningún tramo.
 *   5. Abajo, «Probar en el analizador» (enlace con el aspecto del botón
 *      principal) y «Volver al catálogo» (enlace en negrita), de 44, en fila.
 *   6. A 820, la misma columna; a 390, a todo el ancho y los dos enlaces uno
 *      debajo de otro, el botón a todo el ancho y de 48; a 320, sin scroll
 *      horizontal.
 *   7. Ninguna petición de red después de la carga, y ninguna violación de la
 *      CSP.
 *   8. A 320, ninguna de las fichas desborda a lo ancho (WCAG 1.4.10).
 *
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html
 *    — 1.3.1: lo que el icono dice (enlace externo), también en texto para el
 *    lector.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as textos from '../src/textos.ts';
import { parametrosEnLlano, reglasDelCatalogo, urlDelAnalizador, urlDelCatalogo } from '../src/catalogo/catalogo.ts';
import { nombreDeRegla } from '../src/pantalla/humanizar.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { analizarTexto } from '../../motor/src/texto.ts';
import { detectar } from '../../motor/src/analisis.ts';
import { paquetesIncluidos } from './apoyo.ts';
import { abrirConTestigos, type PaginaConTestigos, type Pestana } from './chrome.ts';

const ID = 'disc-marcador-repetido';
const LINEA = 'rgb(217, 217, 217)';
const CARD = 'rgb(245, 245, 245)';
const TINTA_2 = 'rgb(74, 74, 74)';

describe('la ficha de una regla en Chrome, sobre astro preview', () => {
  const paquetes = paquetesIncluidos();
  const entradas = reglasDelCatalogo(paquetes);
  const indice = indexar(paquetes);
  const entrada = entradas.find((e) => e.regla.id === ID)!;
  const clave = `${entrada.paquete.nombre}::${entrada.familia.id}`;
  let sesion: PaginaConTestigos | undefined;
  let arranque: Promise<PaginaConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirConTestigos(`reglas/${ID}/`, `document.readyState === 'complete'`, 'la ficha cargada'));
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  const anchoDe = async (ancho: number): Promise<void> => {
    await (await p()).cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await (await p()).hasta(`innerWidth === ${ancho}`, `el ancho de ${ancho}`);
  };
  const caja = async (selector: string): Promise<{ izquierda: number; derecha: number; arriba: number; ancho: number; alto: number }> =>
    (await p()).evaluar(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { izquierda: r.left, derecha: r.right, arriba: r.top + scrollY, ancho: r.width, alto: r.height }; })()`);
  const estilo = async (selector: string, propiedades: readonly string[]): Promise<string[]> =>
    (await p()).evaluar<string[]>(`(() => { const c = getComputedStyle(document.querySelector(${JSON.stringify(selector)})); return ${JSON.stringify(propiedades)}.map((x) => c.getPropertyValue(x)); })()`);
  const familia = (valor: string): string => valor.split(',')[0]!.replace(/["']/g, '').trim();

  test('1 · a 1280: la columna de 34em centrada; la pastilla de la familia; el nombre, el id y la frase en claro', async () => {
    await anchoDe(1280);
    const pestana = await p();
    const [main, columna] = await Promise.all(['body > main', '.ficha'].map(caja));
    assert.equal(columna!.ancho, 544, 'la columna, 34em de la letra de la interfaz (16)');
    const pagina = await pestana.evaluar<number>('document.documentElement.clientWidth');
    assert.ok(Math.abs(columna!.izquierda - (pagina - columna!.derecha)) <= 1, `centrada: ${columna!.izquierda} y ${pagina - columna!.derecha}`);
    assert.ok(main!.ancho >= columna!.ancho);
    const pastilla = await pestana.evaluar<{ muestra: string; muestraOculta: boolean; sigla: string; siglaOculta: boolean; texto: string }>(`(() => {
      const p = document.querySelector('.pastilla-familia'); const m = p.querySelector('.muestra'); const s = p.querySelector('.sigla');
      return { muestra: m.className, muestraOculta: m.getAttribute('aria-hidden') === 'true', sigla: s.textContent, siglaOculta: s.getAttribute('aria-hidden') === 'true', texto: p.lastElementChild.textContent };
    })()`);
    assert.deepEqual(pastilla, {
      muestra: `muestra capa ${indice.claseDeFamilia.get(clave)}`,
      muestraOculta: true,
      sigla: indice.siglaDeFamilia.get(clave),
      siglaOculta: true,
      texto: textos.lineaDeLaTarjeta(entrada.familia.nombre, textos.nombreYVersion(entrada.paquete.nombre, entrada.paquete.version)),
    });
    assert.deepEqual(await estilo('.pastilla-familia', ['border-top', 'border-radius', 'font-size', 'padding']), [`1px solid ${LINEA}`, '9999px', '15px', '6px 16px 6px 12px']);
    assert.deepEqual(
      await pestana.evaluar(`[document.querySelector('.ficha h1').textContent, document.querySelector('.nombre-ficha .id-regla').textContent, document.querySelector('.cabeza-ficha .en-claro').textContent]`),
      [nombreDeRegla(ID, entrada.regla), ID, entrada.regla.enClaro],
    );
    assert.deepEqual(await estilo('.nombre-ficha .id-regla', ['font-size', 'color']), ['15px', TINTA_2]);
    const [letra, tamano, peso] = await estilo('.cabeza-ficha .en-claro', ['font-family', 'font-size', 'font-weight']);
    assert.deepEqual([familia(letra!), tamano, peso], ['Literata', '18px', '400']);
  });

  test('2 · las secciones, con su título y en el orden del DISEÑO; los datos, en su recuadro, con sus etiquetas', async () => {
    const pestana = await p();
    const secciones = await pestana.evaluar<[string, boolean][]>(
      `[...document.querySelectorAll('.ficha > section')].map((s) => { const h = s.querySelector(':scope > h2'); return [h.textContent, s.getAttribute('aria-labelledby') === h.id]; })`,
    );
    assert.deepEqual(
      secciones,
      [textos.QUE_HACER, textos.EXPLICACION, textos.EXCEPCIONES, textos.DATOS_DE_LA_REGLA, textos.COMO_BUSCA, textos.FUENTES, textos.DONDE_DISPARA, textos.DONDE_NO_DISPARA].map((t) => [t, true]),
    );
    const datos = await pestana.evaluar<string[][]>(`[...document.querySelectorAll('.datos-ficha')].map((dl) => [...dl.querySelectorAll('dt')].map((dt) => dt.textContent))`);
    assert.deepEqual(datos, [
      [textos.PAQUETE, textos.DETECTOR, textos.PESO, textos.SEVERIDAD, textos.NIVEL_DE_EVIDENCIA, textos.ORIGEN_DE_LA_LISTA].map(textos.conDosPuntos),
      parametrosEnLlano(entrada.regla).map((x) => textos.conDosPuntos(x.etiqueta)),
    ]);
    assert.deepEqual(await estilo('.datos-ficha', ['background-color', 'border-top', 'border-radius', 'padding']), [CARD, `1px solid ${LINEA}`, '8px', '16px']);
    assert.deepEqual(await estilo('.datos-ficha dt', ['font-weight']), ['700']);
  });

  test('3 · las fuentes: un enlace de 44 a su dirección, con el icono aria-hidden y «(enlace externo)» para el lector', async () => {
    const fuentes = await (await p()).evaluar<{ href: string; titulo: string; icono: boolean; lector: string; alto: number }[]>(
      `[...document.querySelectorAll('.fuentes a')].map((a) => ({ href: a.getAttribute('href'), titulo: a.firstElementChild.textContent, icono: a.querySelector('svg').getAttribute('aria-hidden') === 'true', lector: a.querySelector('.solo-lector').textContent, alto: a.getBoundingClientRect().height }))`,
    );
    assert.deepEqual(
      fuentes.map((f) => ({ ...f, alto: f.alto >= 44 })),
      entrada.regla.fuente.map((f) => ({ href: f.url, titulo: f.titulo, icono: true, lector: textos.ENLACE_EXTERNO, alto: true })),
    );
  });

  test('4 · los ejemplos, tal cual y en su recuadro; en los positivos, los tramos del motor con la línea y la sigla; en los negativos, ninguno; en una estadística, ninguno', async () => {
    const pestana = await p();
    const leer = `(seccion) => [...document.querySelectorAll('section[aria-labelledby="' + seccion + '"] .ejemplo')].map((e) => ({
      texto: [...e.childNodes].map((n) => n.nodeType === 3 ? n.data : n.querySelector('.capa')?.textContent ?? '').join(''),
      tramos: [...e.querySelectorAll('.tramo')].map((t) => [t.querySelector('.capa').className, t.querySelector('.capa').textContent, t.querySelector('.sigla-tramo').textContent, t.querySelector('.sigla-tramo').getAttribute('aria-hidden'), t.hasAttribute('role') || t.hasAttribute('tabindex')]),
    }))`;
    const positivos = await pestana.evaluar<{ texto: string; tramos: [string, string, string, string, boolean][] }[]>(`(${leer})('ficha-dispara')`);
    const negativos = await pestana.evaluar<{ texto: string; tramos: unknown[] }[]>(`(${leer})('ficha-no-dispara')`);
    const clase = indice.claseDeFamilia.get(clave)!;
    const sigla = indice.siglaDeFamilia.get(clave)!;
    assert.deepEqual(
      positivos,
      entrada.regla.ejemplos.positivos.map((ejemplo) => ({
        texto: ejemplo,
        tramos: detectar(entrada.regla, analizarTexto(ejemplo)).map((s) => [`capa ${clase}`, ejemplo.slice(s.inicio, s.fin), sigla, 'true', false]),
      })),
      'los positivos, tal cual, con los tramos del motor',
    );
    assert.ok(positivos.every((x) => x.tramos.length > 0), 'cada positivo con algún tramo');
    assert.deepEqual(negativos, entrada.regla.ejemplos.negativos.map((ejemplo) => ({ texto: ejemplo, tramos: [] })), 'los negativos, tal cual, sin tramo');
    assert.deepEqual(await estilo('.ejemplo-ficha', ['border-top', 'border-radius', 'padding']), [`1px solid ${LINEA}`, '8px', '16px']);
    assert.deepEqual(await estilo('.ejemplo', ['white-space']), ['pre-wrap']);
    assert.deepEqual(await estilo('.ficha .tramo .capa', ['text-decoration-line', 'text-decoration-color']), ['underline', 'rgb(136, 34, 85)']);
    assert.deepEqual(await estilo('.ficha .tramo', ['cursor']), ['auto']);
    // Una estadística mira el texto entero: sus ejemplos van sin tramo (lo comprueba el HTML construido, sin cambiar de página).
    const estadistica = entradas.find((e) => e.regla.detector === 'estadístico')!;
    const html = await (await fetch(`${sesion!.url}reglas/${estadistica.regla.id}/`)).text();
    assert.ok(!html.includes('class="tramo"'), `${estadistica.regla.id}: ningún tramo`);
  });

  test('5 · «Probar en el analizador», con el aspecto del botón principal, y «Volver al catálogo», en negrita, de 44 y en fila', async () => {
    const pestana = await p();
    const enlaces = await pestana.evaluar<[string, string | null, string][]>(`[...document.querySelectorAll('.acciones-ficha a')].map((a) => [a.textContent, a.getAttribute('href'), a.className])`);
    assert.deepEqual(enlaces, [
      [textos.PROBAR_EN_EL_ANALIZADOR, urlDelAnalizador('/'), 'boton-principal'],
      [textos.VOLVER_AL_CATALOGO, urlDelCatalogo('/'), 'volver'],
    ]);
    assert.deepEqual(await estilo('.acciones-ficha .boton-principal', ['background-color', 'color', 'border-radius', 'font-weight']), ['rgb(51, 34, 136)', 'rgb(255, 255, 255)', '6px', '700']);
    assert.deepEqual(await estilo('.acciones-ficha .volver', ['font-weight', 'text-decoration-line']), ['700', 'underline']);
    const [boton, volver] = await Promise.all(['.acciones-ficha .boton-principal', '.acciones-ficha .volver'].map(caja));
    assert.ok(boton!.alto >= 44 && volver!.alto >= 44, 'de 44 como mínimo');
    assert.ok(volver!.izquierda > boton!.derecha && Math.abs(volver!.arriba - boton!.arriba) <= 1, 'en fila');
  });

  test('6 · a 820, la misma columna; a 390, a todo el ancho y los enlaces uno debajo de otro, el botón a todo el ancho y de 48; a 320, sin scroll horizontal', async () => {
    const pestana = await p();
    await anchoDe(820);
    assert.equal((await caja('.ficha')).ancho, 544, 'a 820, la columna de 34em');
    await anchoDe(390);
    const [main, columna, boton, volver] = await Promise.all(['body > main', '.ficha', '.acciones-ficha .boton-principal', '.acciones-ficha .volver'].map(caja));
    assert.equal(columna!.ancho, main!.ancho, 'a 390, a todo el ancho');
    assert.deepEqual([boton!.ancho, boton!.alto >= 48], [columna!.ancho, true], 'el botón, a todo el ancho y de 48');
    assert.ok(volver!.arriba > boton!.arriba, 'uno debajo de otro');
    await anchoDe(320);
    const [contenido, util] = await pestana.evaluar<[number, number]>(`[document.documentElement.scrollWidth, document.documentElement.clientWidth]`);
    assert.ok(contenido <= util, `${contenido} de contenido en ${util} de ancho`);
    await anchoDe(1280);
  });

  test('7 · ninguna petición de red después de la carga y ninguna violación de la CSP', async () => {
    await p();
    assert.deepEqual(sesion!.despues, []);
    assert.deepEqual(await sesion!.violaciones(), []);
  });

  // Después del de la red: aquí se navega de ficha en ficha.
  test('8 · a 320, ninguna de las fichas desborda a lo ancho', async () => {
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: true });
    const desbordan: string[] = [];
    for (const { regla } of entradas) {
      await pestana.cdp('Page.navigate', { url: `${sesion!.url}reglas/${regla.id}/` });
      await pestana.hasta(`location.pathname.endsWith('/${regla.id}/') && document.readyState === 'complete'`, `la ficha de ${regla.id}`);
      const ancho = await pestana.evaluar<number>('document.documentElement.scrollWidth');
      if (ancho > 320) desbordan.push(`${regla.id}: ${ancho}`);
    }
    assert.deepEqual(desbordan, []);
  });
});
