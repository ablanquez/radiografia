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
 *   Desde el 10.4 (Tanda 4; DISEÑO §6.5, el modelo y las decisiones de Antonio
 *   en la parada 3), el informe por secciones numeradas: en el 3, con texto
 *   insuficiente, la 1, la 2 y la nota con el 3; en el 1, las siete, con su
 *   número delante del título; la sigla de la clave, delante del nombre de la
 *   familia; cada señal, con su nombre en un <h3> (su id, en data-regla) y
 *   «Qué hacer»; la explicación de cada una, al final, en «¿Por qué lo
 *   miramos?», y las seis de contexto, enteras y con la suya, detrás, todo en
 *   cuerpo menor (9,5 pt). Desde la Tanda 4 bis (el papel como el marco
 *   «Informe / A4», decisión de Antonio del 05/10), los títulos de la 3 y la
 *   4 son los del marco («Clave de familias» y «Texto»), y la clave es una
 *   lista propia del papel: una línea por familia de la leyenda, con la
 *   muestra de su línea y «[sigla] familia (paquete)». La fidelidad al marco
 *   (letra, márgenes y aire) la juzga papel.spec.ts.
 *   5. El PDF, página a página (su texto, con pdf.ts), desde 1280 y desde 390:
 *      cada página lleva abajo «n / N» con N el total de verdad; la sección 4
 *      y la 6 empiezan página (su título es lo primero de una página que no es
 *      la primera); ninguna señal se parte (su nombre y su «Qué hacer», en la
 *      misma página); y el PDF acaba con la nota de autoría, acompañada en su
 *      página (docs/BITACORA.md, 2026-10-05: impreso desde el escritorio, el
 *      PDF perdía su final, y el 2 daba verde porque solo contaba páginas).
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
import { nombreDeRegla } from '../src/pantalla/humanizar.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';
import { textoDeLasPaginas } from './pdf.ts';

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const A4 = { ancho: 595.28, alto: 841.89 };

describe('el informe en Chrome, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const arrancar = async (): Promise<void> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    // A 1280 (desde el 10.4, Tanda 2): el Chrome de los jueces abre a 764 de ancho, que es el móvil, con el resultado
    // repartido en pestañas; este juez mira lo que dice la página, y la estructura del móvil la miran pestanas.spec.ts y hoja.spec.ts.
    await sesion.pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
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

  /** Con la impresión ya emulada: el número que el papel escribe delante de cada título de sección que sale, y de la nota del pie. */
  async function numerosEnPapel(): Promise<Record<string, string>> {
    return p().evaluar(
      `Object.fromEntries([...document.querySelectorAll('.titulo-seccion, .pie-informe')].filter((t) => t.checkVisibility()).map((t) => [t.textContent, getComputedStyle(t, '::before').content]))`,
    );
  }

  /** El PDF que da Chrome desde ese ancho, como texto: por página, sus líneas de arriba abajo (pdf.ts). */
  async function pdfDesde(ancho: number): Promise<string[][]> {
    await p().cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await p().hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
    const { data } = (await p().cdp('Page.printToPDF', { preferCSSPageSize: true, printBackground: false })) as { data: string };
    return textoDeLasPaginas(Buffer.from(data, 'base64'));
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
    // Desde el 10.4 (Tanda 4): las secciones que salen, numeradas seguidas; la nota cierra con el 3.
    await p().cdp('Emulation.setEmulatedMedia', { media: 'print' });
    try {
      assert.deepEqual(await numerosEnPapel(), { [textos.INFORME_DE_RADIOGRAFIA]: '"1. "', [textos.RESULTADO]: '"2. "', [textos.NOTA_DE_AUTORIA]: '"3. "' });
    } finally {
      await p().cdp('Emulation.setEmulatedMedia', { media: '' });
    }
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
      '#tarjeta',
      '.detalle > summary',
      '.detalle > .cifras',
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
      '#tarjeta': false,
      '.detalle > summary': false,
      '.detalle > .cifras': false,
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

    // Desde el 10.4 (Tanda 4), el título del informe es el <h2> de su sección 1.
    const cabecera = await p().evaluar<string[]>(`[...document.querySelectorAll('#cabecera-informe > *')].map((x) => x.textContent)`);
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
      // Desde el 10.4 (Tanda 4), la sigla va delante del nombre de la familia, detrás de la muestra de su línea; desde la 4 bis
      // (el marco «Informe / A4»), en el texto de cada línea de la clave del papel, una por familia de la leyenda, con su paquete.
      const clave = await p().evaluar<{ texto: string; muestra: boolean; seVe: boolean }[]>(
        `[...document.querySelectorAll('#leyenda .clave-papel > li')].map((e) => ({ texto: e.textContent, muestra: e.firstElementChild.classList.contains('muestra-papel'), seVe: e.checkVisibility() }))`,
      );
      assert.equal(clave.length, await p().evaluar<number>(`document.querySelectorAll('#leyenda .tarjeta-familia').length`), 'una línea de la clave por familia de la leyenda');
      assert.deepEqual(clave.filter((x) => !x.seVe || !x.muestra || !/^\[[^\]]+\] .+ \(.+\)( · solo avisos)?$/.test(x.texto)), [], 'líneas de la clave sin su muestra, su sigla o su paquete');

      // Desde el 10.4 (Tanda 4), el nombre de cada entrada va en un <h3> y su id, en data-regla (la dirección de la ficha ya lo lleva).
      const entradas = await p().evaluar<{ id: string; corte: string; ficha: string | null; tras: string | null; texto: string; claro: string | null; alFinal: boolean }[]>(`[...document.querySelectorAll('#senales-informe .entrada-informe')].map((e) => {
        const a = e.querySelector('h3 a');
        return { id: e.dataset.regla, corte: getComputedStyle(e).breakInside, ficha: a?.getAttribute('href') ?? null, tras: a ? getComputedStyle(a, '::after').content : null, texto: e.textContent, claro: e.querySelector('h3 + p.en-claro')?.textContent ?? null, alFinal: e.closest('.anexo-informe') !== null };
      })`);
      const explicaciones = await p().evaluar<Record<string, string>>(
        `Object.fromEntries([...document.querySelectorAll('#senales-informe .anexo-informe > .explicacion-informe')].map((e) => [e.dataset.regla, e.textContent]))`,
      );
      const { analizar: analizarEnNode } = await motorDelNavegador();
      const r = analizarEnNode(TEXTO_DE_COMBINACION_REAL, paquetesIncluidos(), { genero: 'general' });
      const conSenal = [...new Set([...r.senales, ...r.senalesTexto, ...r.contexto].map((s) => s.reglaId))].sort();
      assert.deepEqual(entradas.map((e) => e.id).sort(), conSenal, 'una entrada por regla con señales');
      const url = sesion!.url;
      const reglas = new Map(paquetesIncluidos().flatMap((x) => x.reglas).map((x) => [x.id, x]));
      const deContexto = new Set(r.contexto.map((s) => s.reglaId));
      assert.equal(deContexto.size, 6, 'las seis reglas de contexto (las estadísticas informativas)');
      for (const e of entradas) {
        const regla = reglas.get(e.id)!;
        assert.equal(e.claro, regla.enClaro, `${e.id}: la frase en claro, primera línea de su entrada`);
        assert.equal(e.corte, 'avoid', `${e.id}: break-inside`);
        assert.equal(e.ficha, `${url}reglas/${e.id}/`, `${e.id}: la dirección absoluta de su ficha`);
        assert.equal(e.tras, `" (${url}reglas/${e.id}/)"`, `${e.id}: la dirección, escrita en papel`);
        // Desde el 10.4 (Tanda 4; DISEÑO §6.5): «Qué hacer» en cada entrada; la explicación de cada una, al final, en «¿Por qué lo
        // miramos?»; y las de contexto, enteras y con la suya, también al final. Ninguna se queda sin explicación ni sin sugerencia.
        assert.ok(e.texto.includes(`${textos.QUE_HACER}: ${regla.sugerencia}`), `${e.id}: sin «Qué hacer»`);
        assert.equal(e.alFinal, deContexto.has(e.id), `${e.id}: al final, las de contexto y solo ellas`);
        if (deContexto.has(e.id)) assert.ok(e.texto.includes(`${textos.EXPLICACION}: ${regla.explicacion}`), `${e.id}: sin su explicación`);
        else assert.equal(explicaciones[e.id], `${nombreDeRegla(e.id, regla)}: ${regla.explicacion}`, `${e.id}: su explicación, al final`);
      }
      assert.deepEqual(
        await p().evaluar(`[...document.querySelectorAll('.anexo-informe > h3')].map((h) => h.textContent).concat(getComputedStyle(document.querySelector('.anexo-informe')).fontSize)`),
        [textos.POR_QUE_LO_MIRAMOS, textos.LO_QUE_SE_NOTA, '12.6667px'],
        'el final, en cuerpo menor (9,5 pt)',
      );
      // Las siete secciones, numeradas en el orden del papel.
      assert.deepEqual(await numerosEnPapel(), {
        [textos.INFORME_DE_RADIOGRAFIA]: '"1. "',
        [textos.RESULTADO]: '"2. "',
        [textos.CLAVE_DE_FAMILIAS]: '"3. "',
        [textos.TEXTO_DEL_INFORME]: '"4. "',
        [textos.DESGLOSE]: '"5. "',
        [textos.SENALES_DEL_INFORME]: '"6. "',
        [textos.NOTA_DE_AUTORIA]: '"7. "',
      });
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

  test('5 · el PDF, página a página, desde 1280 y desde 390: el número de cada página, la 4 y la 6 empiezan página, ninguna señal se parte y el final está, con la nota acompañada', async (t) => {
    await arrancar();
    const entradas = await p().evaluar<{ id: string; nombre: string; queHacer: string }[]>(`[...document.querySelectorAll('#senales-informe .entrada-informe')].map((e) => ({
      id: e.dataset.regla,
      nombre: e.querySelector('h3').textContent,
      queHacer: [...e.querySelectorAll('p')].find((x) => x.textContent.startsWith(${JSON.stringify(`${textos.QUE_HACER}: `)}))?.textContent.slice(0, 40) ?? '',
    }))`);
    assert.ok(entradas.length > 10, `${entradas.length} entradas en las señales`);
    try {
      for (const ancho of [1280, 390]) {
        const paginas = await pdfDesde(ancho);
        const n = paginas.length;
        t.diagnostic(`desde ${ancho}: ${n} páginas; la última acaba en «${paginas.at(-1)?.at(-2)}»`);
        // El número de cada página, abajo: «n / N», con N el total de verdad.
        assert.deepEqual(paginas.map((l) => l.at(-1)), paginas.map((_, i) => `${i + 1} / ${n}`), `desde ${ancho}: el número de cada página`);
        // La 4 y la 6 empiezan página: su título es lo primero de una página que no es la primera.
        for (const titulo of [`4. ${textos.TEXTO_DEL_INFORME}`, `6. ${textos.SENALES_DEL_INFORME}`]) {
          const donde = paginas.findIndex((l) => l.includes(titulo));
          assert.ok(donde > 0 && paginas[donde]![0] === titulo, `desde ${ancho}: «${titulo}» en la página ${donde + 1}, que empieza por «${paginas[donde]?.[0]}»`);
        }
        // Ninguna señal se parte: su nombre (con la dirección de su ficha detrás) y su «Qué hacer», en la misma página.
        const partidas = entradas.filter((e) => {
          const nombre = paginas.findIndex((l) => l.some((x) => x.startsWith(`${e.nombre} (`)));
          return nombre < 0 || !paginas[nombre]!.some((x) => x.startsWith(e.queHacer));
        });
        assert.deepEqual(partidas.map((e) => e.id), [], `desde ${ancho}: señales partidas entre dos páginas (o que no están)`);
        // El final está: la nota de autoría, la última línea, y no sola en su página.
        const ultima = paginas.at(-1)!;
        assert.equal(ultima.at(-2), `7. ${textos.NOTA_DE_AUTORIA}`, `desde ${ancho}: la nota, al final del PDF`);
        assert.ok(ultima.length > 2, `desde ${ancho}: la nota, acompañada en su página`);
      }
    } finally {
      await p().cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
      await p().hasta(ANCHO_ASENTADO, 'el ancho de 1280, asentado');
    }
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
