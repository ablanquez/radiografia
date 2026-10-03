/**
 * Los jueces del informe en Chrome (encargo 9.1, b; firmados en la parada 1),
 * sobre astro preview de dist/ y una sola pestaña de Chrome headless, con el
 * arranque y los testigos de red de chrome.ts. Los tests van en orden y
 * comparten la pestaña; el último cuenta la red de todos.
 *
 *   0. La copia del texto de combinacion-real (apoyo.ts) sigue igual que en
 *      motor/src/combinacion-real.spec.ts: cada línea está allí.
 *   3. Sin resultado, «Descargar informe» está desactivado, y en papel solo
 *      sale «No hay análisis que imprimir». Con «texto insuficiente», el
 *      botón se activa, y en papel salen la cabecera y el aviso, sin vista,
 *      desglose, lista ni clave.
 *   1. Con el texto de combinacion-real y los dos paquetes, bajo media print:
 *      no se ven el cuadro de texto, el selector, el cargador, los botones,
 *      la navegación ni el panel; sí la cabecera (fecha del análisis,
 *      paquetes con versión, género), el medidor (desde el retoque del 9.2,
 *      con la etiqueta y la frase en lugar del titular), el texto con la
 *      sigla de cada tramo, la clave, el desglose, una entrada de la lista
 *      por regla con señales (con la dirección absoluta de su ficha y
 *      break-inside: avoid; desde el 9.2, con la frase en claro de la regla
 *      como primera línea, bajo el nombre) y la nota del pie.
 *   2. Page.printToPDF (preferCSSPageSize, sin fondos, como el navegador por
 *      defecto): empieza por %PDF-, tiene de 2 a 20 páginas por /Type /Page
 *      (las mismas que /Count) y su MediaBox es A4.
 *   4. La red: cero peticiones después de la carga inicial y ningún intento
 *      bloqueado por la CSP, también al emular la impresión e imprimir.
 *
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setEmulatedMedia
 *    — «Emulates the given media type or media feature for CSS media
 *    queries»; con media vacío, se quita.
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-printToPDF
 *    — «Print page as PDF»; preferCSSPageSize: «Whether or not to prefer page
 *    size as defined by css. Defaults to false, in which case the content will
 *    be scaled to fit the paper size»; printBackground: «Defaults to false»;
 *    devuelve el PDF en base64.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility
 *    — false si el elemento «doesn't have an associated box», por ejemplo con
 *    display: none (también en un ancestro: entonces no tiene caja); Baseline
 *    desde marzo de 2024.
 * [DOC] ISO 32000-1:2008 (PDF 1.7, la copia que publica Adobe), § 7.7.3.2,
 *    tabla 29: en un nodo del árbol de páginas, Count es «The number of leaf
 *    nodes (page objects) that are descendants of this node within the page
 *    tree», y Parent está «prohibited in the root node». Las páginas son las
 *    /Type /Page, y el total, el /Count de la raíz (el único /Pages sin
 *    /Parent): con 16 páginas, Chrome escribe dos nodos de 8 y la raíz con
 *    16 (visto el 02/10).
 * [PROPIO] A4 son 210 × 297 mm: 595,28 × 841,89 puntos PDF; se admite medio
 *    punto de redondeo (Chrome escribe 594,96 × 841,92, visto en la parada 1).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import { motorDelNavegador, paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const A4 = { ancho: 595.28, alto: 841.89 };

describe('el informe en Chrome, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const arrancar = async (): Promise<void> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
  };
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };

  /** Pone el texto, pulsa «Pon tu texto a contraluz» y espera al resultado. */
  async function analizar(texto: string): Promise<void> {
    await p().evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(texto)};
      document.getElementById('analizar').click();
    })()`);
    await p().hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
  }

  /** Cuáles de estos selectores tienen caja (checkVisibility), con la impresión emulada. */
  async function enPapel(selectores: readonly string[]): Promise<Record<string, boolean>> {
    await p().cdp('Emulation.setEmulatedMedia', { media: 'print' });
    try {
      return await p().evaluar(`Object.fromEntries(${JSON.stringify(selectores)}.map((s) => [s, document.querySelector(s)?.checkVisibility() ?? null]))`);
    } finally {
      await p().cdp('Emulation.setEmulatedMedia', { media: '' });
    }
  }

  after(async () => {
    await sesion?.cerrar();
  });

  test('0 · la copia del texto de combinacion-real sigue en motor/src/combinacion-real.spec.ts', () => {
    const motor = readFileSync(new URL('../../motor/src/combinacion-real.spec.ts', import.meta.url), 'utf8');
    const lineas = TEXTO_DE_COMBINACION_REAL.split('\n');
    assert.ok(lineas.length > 5, `${lineas.length} líneas`);
    assert.deepEqual(lineas.filter((l) => !motor.includes(`'${l}'`)), [], 'líneas de la copia que no están en el motor');
  });

  test('3 · sin resultado, el botón desactivado y en papel «No hay análisis»; con texto insuficiente, la cabecera y el aviso, sin secciones vacías', async () => {
    await arrancar();
    assert.equal(await p().evaluar(`document.getElementById('informe').disabled`), true, '«Descargar informe» sin resultado');
    assert.equal(await p().evaluar(`document.getElementById('informe').textContent`), textos.DESCARGAR_INFORME);
    assert.deepEqual(await enPapel(['.sin-informe', '#resultado']), { '.sin-informe': true, '#resultado': false });
    assert.equal(await p().evaluar(`document.querySelector('.sin-informe').textContent`), textos.SIN_INFORME);

    await analizar('Un texto de pocas palabras.');
    assert.equal(await p().evaluar(`document.getElementById('informe').disabled`), false, '«Descargar informe» con resultado');
    assert.deepEqual(await enPapel(['#cabecera-informe', '#medidor', '.sin-informe', '#vista', '#leyenda', '#desglose', '#senales-informe']), {
      '#cabecera-informe': true,
      '#medidor': true,
      '.sin-informe': false,
      '#vista': false,
      '#leyenda': false,
      '#desglose': false,
      '#senales-informe': false,
    });
    assert.ok((await p().evaluar<string>(`document.getElementById('medidor').textContent`)).includes(textos.TEXTO_INSUFICIENTE));
  });

  test('1 · bajo media print: ni el formulario ni la navegación ni el panel; el informe entero, con siglas, clave, lista y pie', async () => {
    await arrancar();
    await analizar(TEXTO_DE_COMBINACION_REAL);
    await p().evaluar(`document.querySelector('#vista .tramo').click()`);
    const visibles = await enPapel([
      '#texto',
      '#genero',
      '#paquetes',
      '#analizar',
      '#informe',
      'header nav',
      '#panel',
      '#medidor details',
      '#cabecera-informe',
      '#medidor',
      '#medidor .etiqueta',
      '#medidor .frase',
      '#leyenda',
      '#vista',
      '#desglose',
      '#senales-informe',
      '.pie-informe',
    ]);
    assert.deepEqual(visibles, {
      '#texto': false,
      '#genero': false,
      '#paquetes': false,
      '#analizar': false,
      '#informe': false,
      'header nav': false,
      '#panel': false,
      '#medidor details': false,
      '#cabecera-informe': true,
      '#medidor': true,
      '#medidor .etiqueta': true,
      '#medidor .frase': true,
      '#leyenda': true,
      '#vista': true,
      '#desglose': true,
      '#senales-informe': true,
      '.pie-informe': true,
    });

    const cabecera = await p().evaluar<string[]>(`[...document.querySelectorAll('#cabecera-informe p')].map((x) => x.textContent)`);
    const versiones = paquetesIncluidos().map((x) => textos.paqueteDelInforme(x.cabecera.nombre, x.cabecera.version, false));
    assert.equal(cabecera[0], textos.INFORME_DE_RADIOGRAFIA);
    assert.match(cabecera[1] ?? '', /^Análisis del \d{1,2} de [a-z]+ de \d{4} a las \d{1,2}:\d{2}$/, 'la fecha y la hora del análisis');
    assert.ok(cabecera[2]?.endsWith('género: General'), cabecera[2]);
    assert.equal(cabecera[3], textos.paquetesDelInforme(versiones));
    assert.equal(await p().evaluar(`document.querySelector('.pie-informe').textContent`), textos.NOTA_DE_AUTORIA);

    await p().cdp('Emulation.setEmulatedMedia', { media: 'print' });
    try {
      const siglas = await p().evaluar<{ siglas: string; despues: string }[]>(
        `[...document.querySelectorAll('#vista .tramo')].map((t) => ({ siglas: t.dataset.siglas, despues: getComputedStyle(t, '::after').content }))`,
      );
      assert.ok(siglas.length > 0, 'ningún subrayado');
      assert.deepEqual(siglas.filter((x) => x.siglas === '' || x.despues !== `" [${x.siglas}]"`), [], 'tramos sin su sigla en papel');
      const clave = await p().evaluar<{ sigla: string; antes: string }[]>(
        `[...document.querySelectorAll('#leyenda li')].map((li) => ({ sigla: li.dataset.sigla, antes: getComputedStyle(li, '::before').content }))`,
      );
      assert.ok(clave.length > 0, 'la clave, vacía');
      assert.deepEqual(clave.filter((x) => x.sigla === '' || x.antes !== `"[${x.sigla}] "`), [], 'líneas de la clave sin su sigla');

      const entradas = await p().evaluar<{ id: string; corte: string; ficha: string | null; tras: string | null; texto: string; claro: string | null }[]>(`[...document.querySelectorAll('#senales-informe .entrada-informe')].map((e) => {
        const a = e.querySelector('h4 a');
        return { id: /\\(([^()]+)\\)$/.exec(e.querySelector('h4').textContent)?.[1] ?? '', corte: getComputedStyle(e).breakInside, ficha: a?.getAttribute('href') ?? null, tras: a ? getComputedStyle(a, '::after').content : null, texto: e.textContent, claro: e.querySelector('h4 + p.en-claro')?.textContent ?? null };
      })`);
      const { analizar: analizarEnNode } = await motorDelNavegador();
      const r = analizarEnNode(TEXTO_DE_COMBINACION_REAL, paquetesIncluidos(), { genero: 'general' });
      const conSenal = [...new Set([...r.senales, ...r.senalesTexto, ...r.contexto].map((s) => s.reglaId))].sort();
      assert.deepEqual(entradas.map((e) => e.id).sort(), conSenal, 'una entrada por regla con señales');
      const url = sesion!.url;
      const claros = new Map(paquetesIncluidos().flatMap((x) => x.reglas).map((x) => [x.id, x.enClaro]));
      for (const e of entradas) {
        assert.equal(e.claro, claros.get(e.id), `${e.id}: la frase en claro, primera línea de su entrada`);
        assert.equal(e.corte, 'avoid', `${e.id}: break-inside`);
        assert.equal(e.ficha, `${url}reglas/${e.id}/`, `${e.id}: la dirección absoluta de su ficha`);
        assert.equal(e.tras, `" (${url}reglas/${e.id}/)"`, `${e.id}: la dirección, escrita en papel`);
        assert.ok(e.texto.includes(textos.EXPLICACION) && e.texto.includes(textos.SUGERENCIA), `${e.id}: sin explicación o sin sugerencia`);
      }
    } finally {
      await p().cdp('Emulation.setEmulatedMedia', { media: '' });
    }
  });

  test('2 · Page.printToPDF: un PDF que empieza por %PDF-, de 2 a 20 páginas, en A4', async (t) => {
    await arrancar();
    const { data } = (await p().cdp('Page.printToPDF', { preferCSSPageSize: true, printBackground: false })) as { data: string };
    const pdf = Buffer.from(data, 'base64');
    const crudo = pdf.toString('latin1');
    const paginas = (crudo.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
    // El total, en el /Count del nodo raíz del árbol de páginas: el único /Pages sin /Parent.
    const raices = crudo.split('endobj').filter((o) => /\/Type\s*\/Pages(?!\w)/.test(o) && !/\/Parent\s/.test(o));
    assert.equal(raices.length, 1, `nodos raíz del árbol de páginas: ${raices.length}`);
    const cuenta = Number(/\/Count\s+(\d+)/.exec(raices[0]!)?.[1]);
    const caja = /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(crudo);
    t.diagnostic(`PDF: ${pdf.length} bytes, ${paginas} páginas, MediaBox ${caja?.[1]} × ${caja?.[2]}`);
    assert.equal(crudo.slice(0, 5), '%PDF-');
    assert.ok(paginas >= 2 && paginas <= 20, `${paginas} páginas`);
    assert.equal(cuenta, paginas, '/Count y las /Type /Page');
    assert.ok(caja, 'sin MediaBox');
    assert.ok(Math.abs(Number(caja[1]) - A4.ancho) < 0.5 && Math.abs(Number(caja[2]) - A4.alto) < 0.5, `MediaBox ${caja[1]} × ${caja[2]}, y A4 es ${A4.ancho} × ${A4.alto}`);
  });

  test('4 · cero peticiones de red después de la carga inicial, también al emular la impresión e imprimir', async (t) => {
    await arrancar();
    await esperar(1000);
    const { despues } = sesion!;
    const violaciones = await sesion!.violaciones();
    t.diagnostic(`después de la marca (${despues.length}): ${despues.length === 0 ? 'ninguna' : despues.map((x) => `${x.tipo} ${x.url}`).join(' · ')}`);
    t.diagnostic(`intentos bloqueados por la CSP (${violaciones.length}): ${violaciones.length === 0 ? 'ninguna' : violaciones.join(' · ')}`);
    assert.deepEqual(despues, [], 'peticiones después de la carga inicial');
    assert.deepEqual(violaciones, [], 'intentos bloqueados por la CSP');
  });
});
