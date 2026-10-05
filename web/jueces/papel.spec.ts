/**
 * El juez de fidelidad del papel (encargo 10.4, Tanda 4 bis; decisión de
 * Antonio del 05/10: el informe impreso, como el marco «Informe / A4» del
 * modelo). Compara el PDF que da Chrome con las medidas del marco que guarda
 * docs/figma/medidas-modelo.json (piezas informe.*, tomadas por
 * scripts/medir-modelo.ts: su página, su letra, su caja y la línea base de su
 * primera y su última línea). El juez no sale a Internet.
 *
 * Dónde se mide (elegido con la documentación): en el PDF, no en el DOM con la
 * impresión emulada, porque lo que se juzga solo existe al paginar: los
 * márgenes de la página, el número de cada página (una caja de margen de
 * @page), los saltos y dónde cae cada línea en su página. El PDF de Chrome
 * dice, de cada glifo, dónde va (la matriz del texto por la de la página), su
 * cuerpo, su color y su fuente, con la familia y el peso en el FontDescriptor
 * (jueces/pdf.ts). Lo que el PDF no dice como texto, las muestras de línea de
 * la clave (son trazos), se mira en el DOM con la impresión emulada.
 *
 *   1. El fichero trae las piezas del marco que se juzgan, con su página.
 *   2. Desde 1280 y desde 390 (la misma hoja, con el resultado repartido o
 *      no en pestañas), con las cabeceras y los pies de Chrome activados
 *      (displayHeaderFooter, como «Encabezados y pies de página» en el
 *      diálogo): el PDF es A4; cada página lleva su número, «n / N», con la
 *      letra del marco, su línea base y su borde derecho; no hay nada más
 *      fuera del área de la página (ni la cabecera ni el pie de Chrome); y la
 *      primera línea de la página 1 y las de las páginas donde empiezan la 4,
 *      la 5 y la 6 caen donde en el marco. Las tres llevan salto de página
 *      antes (DISEÑO §6.5): la 4 y la 6, como el marco; la 5, por el DISEÑO
 *      (la pieza informe.s5.salto; en el marco empieza página porque su
 *      paginador no parte bloques). Hasta el cierre de la parada 4 bis, este
 *      test solo miraba la 4 y la 6, y la 5 arrancaba al pie de la página 2
 *      y se partía con el juez en verde (docs/BITACORA.md, 2026-10-05).
 *   3. Desde 1280 y desde 390, cada pieza del marco en su línea del PDF: su
 *      familia, su peso, su cuerpo, su color y su borde izquierdo; y el aire
 *      entre ella y la línea de antes (la distancia entre sus líneas base),
 *      que es lo que hacen los márgenes de los títulos, los interlineados y
 *      el espacio entre secciones, párrafos y señales.
 *   4. La clave: la muestra de la línea de cada familia, de 32 × 10, centrada
 *      con su texto, con el estilo y el grosor del marco, en tinta.
 *   5. Sin resultado (va antes de analizar; DISEÑO §6.5, decisión de Antonio
 *      del 05/10): imprimir no se bloquea, y sale una sola página A4 con el
 *      icono (c) a 96 px, «RadiografIA» y el mensaje de que no hay análisis,
 *      con la letra del DISEÑO, y nada más (ni número ni cabecera o pie de
 *      Chrome); los tres, centrados (±2 px) a lo ancho y el bloque a lo alto
 *      del área de la página. Las cajas, en el DOM con la impresión emulada y
 *      la ventana del tamaño del área (que es el papel lo dice la línea base
 *      del nombre, la misma en el DOM y en el PDF); y sin red: el icono es el
 *      de la cabecera, ya cargado.
 *   6. «Márgenes: Ninguno» en el diálogo de imprimir (visto el 05/10 en el de
 *      Chrome 154: quita los márgenes de @page y, con ellos, el número de
 *      página): cuando el área de la página es la hoja entera, el cuerpo pone
 *      esos márgenes por dentro, en cada página (box-decoration-break: clone),
 *      y la hoja sin resultado los descuenta; con los márgenes de @page, nada.
 *      En el DOM con la impresión emulada y la ventana del tamaño del área:
 *      printToPDF no deja quitar los márgenes de @page (los de sus opciones
 *      no les ganan), y el diálogo no se abre en Chrome headless. En el
 *      diálogo de verdad (Chrome 154 con ventana, por CDP, el 05/10): con
 *      «Predeterminado», como el marco; con «Ninguno», el texto en x = 68 y la
 *      primera línea de las páginas 1 y 2 en y = 92.
 *   7. La hoja de impresión, regla a regla, en el DOM con la impresión
 *      emulada (PISADAS): cada declaración de dentro de un `@media print`
 *      gana en alguno de los elementos a los que se aplica, desde 1280 o
 *      desde 390, con resultado o sin él (lo que se pisa a propósito gana en
 *      alguno de los tres: el relleno de «Ninguno» del 6 solo pisa al de
 *      body cuando la ventana es más ancha que el área de la página, y la
 *      hoja sin resultado solo se oculta con resultado). Lo que el marco no
 *      mide no lo juzga el 3; esto mira que la hoja haga lo que dice. Desde
 *      la parada 4 ter del 9.3: `.anexo-informe { margin-top: 14pt }` la
 *      pisaba la regla que quita los márgenes de la pantalla, que lleva id, y
 *      el papel salía sin ese aire con los jueces en verde
 *      (docs/BITACORA.md, 2026-10-05).
 *   8. La negrita del papel, Literata 600, ya cargada en el momento en que
 *      el resultado deja de estar oculto (el primer análisis de la página):
 *      su FontFace, «loaded», y document.fonts.check, verdadero. Desde el 9.3
 *      (punto 8, decisión de Antonio del 05/10) no se precarga: se pide al
 *      pintar un resultado, y el resultado no se enseña hasta tenerla. Lo
 *      que se juzga es lo que el diálogo de imprimir de Chrome necesita: no
 *      espera a las fuentes web, y sin la cara cargada deja sin pintar el
 *      texto en negrita (visto el 05/10 en Chrome 154: «Discurso: 28,69»
 *      desaparece). printToPDF sí espera, y por eso el 3 no lo ve. Se mira
 *      el estado de la cara, además de check(), que da verdadero si ninguna
 *      cara coincide.
 *
 * Tolerancia, la del encargo: ±1 px en posiciones y distancias (Chrome deja
 * cada línea base en un píxel entero: ±0,5 en cada una), ±0,05 px en el
 * cuerpo (Skia escribe el de Tf con dos decimales: 14,66 por 14,6667). La
 * familia, el peso y el color, iguales; la familia por su nombre de familia
 * («Literata 12pt» es la Literata del eje óptico de 12, docs/figma/fuentes.md).
 * El peso de Literata en negrita: el modelo pide 700 y carga 400 y 600 (su
 * index.css, de Google Fonts), así que pinta la de 600 (la más cercana por
 * debajo, CSS Fonts 4, § 5.2); la web, igual, con la 600 que el analizador
 * pide al pintar un resultado (el 8).
 *
 * Lo que el marco no tiene y no se compara: el contenido. El marco es de
 * muestra (su orden de señales, sus fragmentos de relleno, «tipo:» por
 * «género:»), y las líneas de la web son las del análisis de verdad de
 * combinacion-real, el texto del marco; se comparan la letra de cada pieza y el
 * aire que la separa de la línea de antes, no cuántas líneas ocupa. De la
 * sección 3, la línea que explica las siglas (decisión del 01/10) va en el
 * ritmo de la clave; de la 5, el total de cada paquete, que el marco no lleva,
 * no se compara.
 *
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-printToPDF
 *    — preferCSSPageSize, printBackground (por defecto, false) y
 *    displayHeaderFooter: «Display header and footer. Defaults to false».
 * [DOC] https://drafts.csswg.org/css-fonts-4/#font-matching-algorithm —
 *    § 5.2: si el peso pedido es mayor que 500, «weights greater than or
 *    equal to the desired weight are checked in ascending order followed by
 *    weights below the desired weight in descending order».
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setEmulatedMedia
 * [DOC] https://drafts.csswg.org/css-font-loading/ — § 3.3, check(): «If font
 *    face list is empty, or all fonts in the font face list either have a
 *    status attribute of "loaded" or are system fonts, return true».
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as textos from '../src/textos.ts';
import { CARA_DE_LA_NEGRITA } from '../src/estilos/recursos.ts';
import { TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';
import { cerca, comoElMarco, letra, medidasDelMarco, PAGINA, PIEZAS, piezasComoElMarco } from './marco-a4.ts';
import { lineasDeLasPaginas, type PaginaDelPdf } from './pdf.ts';

/**
 * Para el 7, se evalúa en la página con la impresión emulada: cada declaración de las reglas de la hoja de impresión (las de
 * dentro de un `@media print`), selector a selector, con si gana en alguno de los elementos a los que se aplica. Gana si el
 * valor calculado del elemento es el mismo que con esa declaración puesta en su atributo style, que le gana a cualquier
 * regla sin !important. Los selectores que no se aplican a ningún elemento no salen. No se miran: las de !important, las
 * que se escriben con var() en un atajo (sus propiedades no tienen valor que leer en el CSSOM), los pseudoelementos
 * (querySelectorAll no los da) ni @page.
 */
const PISADAS = `(() => {
  const reglas = [];
  const recoger = (lista, enPapel) => {
    for (const r of lista) {
      if (r instanceof CSSMediaRule) recoger(r.cssRules, enPapel || r.media.mediaText === 'print');
      else if (r instanceof CSSStyleRule && enPapel) reglas.push(r);
    }
  };
  for (const hoja of document.styleSheets) recoger(hoja.cssRules, false);
  const vistas = [];
  for (const regla of reglas) {
    const selectores = [];
    let hondo = 0;
    let desde = 0;
    const st = regla.selectorText;
    for (let i = 0; i < st.length; i++) {
      if (st[i] === '(') hondo++;
      else if (st[i] === ')') hondo--;
      else if (st[i] === ',' && hondo === 0) {
        selectores.push(st.slice(desde, i).trim());
        desde = i + 1;
      }
    }
    selectores.push(st.slice(desde).trim());
    for (const selector of selectores) {
      let elementos;
      try {
        elementos = [...document.querySelectorAll(selector)];
      } catch {
        continue;
      }
      if (elementos.length === 0) continue;
      for (const propiedad of regla.style) {
        const valor = regla.style.getPropertyValue(propiedad);
        if (valor === '' || regla.style.getPropertyPriority(propiedad) === 'important') continue;
        const gana = elementos.some((el) => {
          const antes = getComputedStyle(el).getPropertyValue(propiedad);
          const suyo = el.style.getPropertyValue(propiedad);
          const prioridad = el.style.getPropertyPriority(propiedad);
          el.style.setProperty(propiedad, valor);
          const conLaSuya = getComputedStyle(el).getPropertyValue(propiedad);
          if (suyo === '') el.style.removeProperty(propiedad);
          else el.style.setProperty(propiedad, suyo, prioridad);
          return antes === conLaSuya;
        });
        vistas.push([selector.replace(/\\s+/g, ' ') + ' { ' + propiedad + ': ' + valor + ' }', gana]);
      }
    }
  }
  return vistas;
})()`;

describe('el papel, como el marco «Informe / A4» del modelo', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  let analizado = false;
  const medidas = medidasDelMarco;
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };
  /**
   * El analizador con combinacion-real ya analizado. Es el primer análisis de la página: para el 8, apunta en
   * window.__negritaAlEnsenar cómo estaba la negrita del papel en el momento en que el resultado deja de estar oculto.
   */
  async function preparar(): Promise<void> {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    if (analizado) return;
    await anchoDe(1280);
    await p().evaluar(`(() => {
      const resultado = document.getElementById('resultado');
      resultado.hidden = true;
      new MutationObserver((cambios, observador) => {
        if (resultado.hidden) return;
        const cara = [...document.fonts].find((f) => f.family.replace(/["']/g, '') === 'Literata' && f.weight === '600');
        window.__negritaAlEnsenar = { estado: cara?.status ?? null, check: document.fonts.check(${JSON.stringify(CARA_DE_LA_NEGRITA)}) };
        observador.disconnect();
      }).observe(resultado, { attributes: true, attributeFilter: ['hidden'] });
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('analizar').click();
    })()`);
    await p().hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    analizado = true;
  }
  async function anchoDe(ancho: number): Promise<void> {
    await p().cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await p().hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
  }
  /** El PDF desde ese ancho, con las cabeceras y los pies de Chrome activados. */
  async function pdfDesde(ancho: number): Promise<PaginaDelPdf[]> {
    await anchoDe(ancho);
    try {
      const { data } = (await p().cdp('Page.printToPDF', { preferCSSPageSize: true, printBackground: false, displayHeaderFooter: true })) as { data: string };
      return lineasDeLasPaginas(Buffer.from(data, 'base64'));
    } finally {
      await anchoDe(1280);
    }
  }

  after(async () => {
    await sesion?.cerrar();
  });

  test('5 · sin resultado (antes de analizar): una sola página A4 con el icono, el nombre y el mensaje, centrados, y nada más', async (t) => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    assert.equal(analizado, false, 'este juez va antes de analizar');
    const m = medidas();
    await anchoDe(1280);
    // El PDF: una página, con sus dos líneas y nada más (ni el número ni la cabecera o el pie de Chrome), cada una con la letra del
    // DISEÑO y centrada a lo ancho de la página.
    const { data } = (await p().cdp('Page.printToPDF', { preferCSSPageSize: true, printBackground: false, displayHeaderFooter: true })) as { data: string };
    const paginas = lineasDeLasPaginas(Buffer.from(data, 'base64'));
    assert.equal(paginas.length, 1, 'sin resultado, una sola página');
    const [nombre, mensaje] = paginas[0]!.lineas;
    assert.deepEqual(paginas[0]!.lineas.map((l) => l.texto), ['RadiografIA', textos.SIN_INFORME], 'el nombre y el mensaje, y nada más');
    const diferencias = [...letra('nombre', nombre!, 0, m['informe.sin-resultado.nombre']!), ...letra('mensaje', mensaje!, 0, m['informe.sin-resultado.mensaje']!)];
    for (const [cual, l] of [['nombre', nombre!], ['mensaje', mensaje!]] as const) {
      if (!cerca((l.x + l.fin) / 2, paginas[0]!.ancho / 2, 2)) diferencias.push(`${cual}: su centro en x ${((l.x + l.fin) / 2).toFixed(2)}, y el de la página ${(paginas[0]!.ancho / 2).toFixed(2)}`);
    }
    // El DOM, con la impresión emulada y la ventana del tamaño del área de la página (A4 menos los márgenes): las cajas del icono,
    // el nombre y el mensaje; la del icono, de 96 × 96. Que es el papel lo dice la línea base del nombre, la misma que en el PDF.
    const area = { ancho: Math.round(PAGINA.ancho - 2 * PAGINA.lado), alto: Math.round(PAGINA.alto - 2 * PAGINA.arriba) };
    await p().cdp('Emulation.setDeviceMetricsOverride', { width: area.ancho, height: area.alto, deviceScaleFactor: 1, mobile: false });
    await p().cdp('Emulation.setEmulatedMedia', { media: 'print' });
    try {
      const cajas = await p().evaluar<{ icono: number[]; nombre: number[]; mensaje: number[]; cargado: boolean; base: number }>(`(() => {
        const caja = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
        const n = document.querySelector('.nombre-sin-informe');
        const marca = document.createElement('span');
        marca.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        n.prepend(marca);
        const base = marca.getBoundingClientRect().bottom;
        marca.remove();
        const icono = document.querySelector('.icono-sin-informe');
        return { icono: caja('.icono-sin-informe'), nombre: caja('.nombre-sin-informe'), mensaje: caja('.hoja-sin-informe .sin-informe'), cargado: icono.complete && icono.naturalWidth > 0, base };
      })()`);
      t.diagnostic(`área ${area.ancho} × ${area.alto}; icono ${cajas.icono.map((x) => x.toFixed(1)).join(', ')}; nombre ${cajas.nombre.map((x) => x.toFixed(1)).join(', ')}; mensaje ${cajas.mensaje.map((x) => x.toFixed(1)).join(', ')}`);
      if (!cajas.cargado) diferencias.push('el icono no está cargado');
      const icono = m['informe.sin-resultado.icono']!;
      if (!cerca(cajas.icono[2]!, icono.ancho) || !cerca(cajas.icono[3]!, icono.alto)) diferencias.push(`el icono: ${cajas.icono[2]} × ${cajas.icono[3]}, y el DISEÑO ${icono.ancho} × ${icono.alto}`);
      for (const [cual, [x, , ancho]] of Object.entries({ icono: cajas.icono, nombre: cajas.nombre, mensaje: cajas.mensaje })) {
        if (!cerca(x! + ancho! / 2, area.ancho / 2, 2)) diferencias.push(`${cual}: su centro en x ${(x! + ancho! / 2).toFixed(2)}, y el del área ${area.ancho / 2}`);
      }
      const centro = (cajas.icono[1]! + cajas.mensaje[1]! + cajas.mensaje[3]!) / 2;
      if (!cerca(centro, area.alto / 2, 2)) diferencias.push(`el bloque: su centro en y ${centro.toFixed(2)}, y el del área ${area.alto / 2}`);
      if (!cerca(cajas.base + PAGINA.arriba, nombre!.y)) diferencias.push(`el nombre: línea base en ${(cajas.base + PAGINA.arriba).toFixed(2)} en el DOM y en ${nombre!.y} en el PDF`);
    } finally {
      await p().cdp('Emulation.setEmulatedMedia', { media: '' });
      await anchoDe(1280);
    }
    assert.deepEqual(diferencias, []);
    // Y nada de red al imprimir la hoja: el icono es el de la cabecera, ya cargado.
    assert.deepEqual(sesion.despues, [], 'peticiones después de la carga inicial');
  });

  test('6 · «Márgenes: Ninguno» en el diálogo: con el área de la página del tamaño de la hoja, el cuerpo pone dentro los márgenes de @page, en cada página; con los de @page, nada', async () => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    /** Con la impresión emulada y la ventana del tamaño del área de la página: el relleno del cuerpo, cómo se parte y el alto de la hoja sin resultado. */
    const leer = async (ancho: number, alto: number): Promise<{ relleno: number[]; partido: string; hoja: number }> => {
      await p().cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
      await p().cdp('Emulation.setEmulatedMedia', { media: 'print' });
      return p().evaluar(`(() => {
        const c = getComputedStyle(document.body);
        return { relleno: [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft].map(parseFloat), partido: c.boxDecorationBreak, hoja: document.querySelector('.hoja-sin-informe').getBoundingClientRect().height };
      })()`);
    };
    const diferencias: string[] = [];
    try {
      // La hoja entera (210 × 297 mm, en px enteros): los márgenes de @page, por dentro y en cada página; la hoja sin resultado, sin ellos.
      // El área con los márgenes de @page (174 × 257 mm): nada.
      for (const [que, ancho, alto, relleno, hoja] of [
        ['la hoja entera', PAGINA.ancho, PAGINA.alto, [PAGINA.arriba, PAGINA.lado, PAGINA.arriba, PAGINA.lado], PAGINA.alto - 2 * PAGINA.arriba],
        ['el área con los márgenes de @page', PAGINA.ancho - 2 * PAGINA.lado, PAGINA.alto - 2 * PAGINA.arriba, [0, 0, 0, 0], PAGINA.alto - 2 * PAGINA.arriba],
      ] as const) {
        const visto = await leer(Math.round(ancho), Math.round(alto));
        if (visto.relleno.some((x, k) => !cerca(x, relleno[k]!))) diferencias.push(`${que}: el relleno del cuerpo es ${visto.relleno.join(' ')}, y lo esperado ${relleno.map((x) => x.toFixed(2)).join(' ')}`);
        if (visto.partido !== 'clone') diferencias.push(`${que}: box-decoration-break ${visto.partido}`);
        if (!cerca(visto.hoja, hoja)) diferencias.push(`${que}: la hoja sin resultado mide ${visto.hoja}, y lo esperado ${hoja.toFixed(2)}`);
      }
    } finally {
      await p().cdp('Emulation.setEmulatedMedia', { media: '' });
      await anchoDe(1280);
    }
    assert.deepEqual(diferencias, []);
  });

  test('1 · el fichero trae las piezas del marco que se juzgan, con su página', () => {
    const m = medidas();
    const claves = [...PIEZAS.map((x) => x.clave), 'informe.pagina', 'informe.numero', 'informe.s3.muestra', 'informe.s4.titulo', 'informe.s5.titulo', 'informe.s6.titulo'];
    assert.deepEqual(
      claves.filter((c) => m[c]?.pantalla !== 'informe/escritorio' || typeof m[c]?.pagina !== 'number'),
      [],
      'piezas del marco que el fichero no trae',
    );
    assert.deepEqual([m['informe.pagina']!.ancho, m['informe.pagina']!.alto], [794, 1123], 'la página del marco, A4 a 96 ppp');
    // El salto antes de la 5, del DISEÑO y no del marco, con su apartado.
    assert.deepEqual([m['informe.s5.salto']?.origen, m['informe.s5.salto']?.saltoAntes], ['DISEÑO-RADIOGRAFIA.md §6.5', true], 'el salto de página antes de la sección 5, del DISEÑO');
  });

  for (const ancho of [1280, 390]) {
    test(`2 · desde ${ancho}: A4, el número de cada página como el del marco, nada fuera del área, y la primera línea de la página 1 y de las que empiezan la 4, la 5 y la 6 donde en el marco`, async (t) => {
      await preparar();
      const m = medidas();
      const paginas = await pdfDesde(ancho);
      t.diagnostic(`desde ${ancho}: ${paginas.length} páginas`);
      assert.deepEqual(comoElMarco(paginas, m), []);
    });

    test(`3 · desde ${ancho}: cada pieza del marco en su línea del PDF, con su letra y el aire de la línea de antes`, async (t) => {
      await preparar();
      const m = medidas();
      const paginas = await pdfDesde(ancho);
      const { diferencias, paso, enElMarco } = piezasComoElMarco(paginas, m);
      t.diagnostic(`desde ${ancho}: interlineado del texto ${paso} px; en el marco ${enElMarco.toFixed(2)}`);
      assert.deepEqual(diferencias, []);
    });
  }

  test('4 · la clave: la muestra de cada familia, de 32 × 10 y centrada con su texto, con el estilo y el grosor del marco, en tinta', async () => {
    await preparar();
    const m = medidas()['informe.s3.muestra']!;
    await p().cdp('Emulation.setEmulatedMedia', { media: 'print' });
    try {
      const muestras = await p().evaluar<{ clase: string; ancho: number; alto: number; desvio: number; arriba: string; abajo: string; alto2: string; deco: string }[]>(`[...document.querySelectorAll('#leyenda .clave-papel > li')].map((li) => {
        const muestra = li.querySelector('.muestra-papel');
        const r = muestra.getBoundingClientRect();
        const texto = li.lastElementChild.getBoundingClientRect();
        const antes = getComputedStyle(muestra, '::before');
        return {
          clase: [...muestra.classList].find((c) => c.startsWith('fam-')),
          ancho: r.width,
          alto: r.height,
          desvio: Math.round((r.top + r.height / 2 - (texto.top + texto.height / 2)) * 100) / 100,
          arriba: antes.borderTopWidth + ' ' + antes.borderTopStyle + ' ' + antes.borderTopColor,
          abajo: antes.borderBottomWidth + ' ' + antes.borderBottomStyle + ' ' + antes.borderBottomColor,
          alto2: antes.height,
          deco: antes.textDecorationLine + ' ' + antes.textDecorationStyle + ' ' + antes.textDecorationThickness + ' ' + antes.textDecorationColor,
        };
      })`);
      assert.equal(muestras.length, 8, 'una muestra por familia de los dos paquetes');
      const TINTA = 'rgb(26, 26, 26)';
      // Las del marco (Informe.tsx, MuestraTinta: el trazo de cada familia, de 32 × 10 y en #1a1a1a): continua de 2 y de 3,
      // discontinua de 2, doble de 1 con 2 entre las dos, punteada de 3 y de 1, ondulada de 1,5 y doble discontinua de 1 con 3.
      const ESPERADAS: Record<string, Partial<(typeof muestras)[number]>> = {
        'fam-lexico': { arriba: `2px solid ${TINTA}` },
        'fam-discurso': { arriba: `3px solid ${TINTA}` },
        'fam-sintaxis': { arriba: `2px dashed ${TINTA}` },
        'fam-estadistica': { arriba: `1px solid ${TINTA}`, abajo: `1px solid ${TINTA}`, alto2: '2px' },
        'fam-puntuacion': { arriba: `3px dotted ${TINTA}` },
        'fam-canal': { arriba: `1px dotted ${TINTA}` },
        'fam-gramatica': { deco: `line-through wavy 1.5px ${TINTA}` },
        'fam-ortotipografia': { arriba: `1px dashed ${TINTA}`, abajo: `1px dashed ${TINTA}`, alto2: '3px' },
      };
      const diferencias = muestras.flatMap((x) => {
        const fuera: string[] = [];
        if (!cerca(x.ancho, m.ancho) || !cerca(x.alto, m.alto)) fuera.push(`${x.clase}: ${x.ancho} × ${x.alto}, en el marco ${m.ancho} × ${m.alto}`);
        if (!cerca(x.desvio, 0)) fuera.push(`${x.clase}: ${x.desvio} px por debajo del centro de su texto`);
        for (const [propiedad, valor] of Object.entries(ESPERADAS[x.clase] ?? { clase: 'una familia del marco' })) {
          if (x[propiedad as keyof typeof x] !== valor) fuera.push(`${x.clase} ${propiedad}: ${x[propiedad as keyof typeof x]}, y el marco ${valor}`);
        }
        return fuera;
      });
      assert.deepEqual(diferencias, []);
    } finally {
      await p().cdp('Emulation.setEmulatedMedia', { media: '' });
    }
  });

  test('7 · la hoja de impresión: cada declaración gana en algún elemento al que se aplica, desde 1280 o desde 390, con resultado o sin él', async (t) => {
    await preparar();
    /** Cada declaración de la hoja, con la impresión emulada, y si ha ganado en algún elemento (las que no se aplican a ninguno, fuera). */
    const vistas = new Map<string, boolean>();
    const leer = async (que: string, antes = '', despues = ''): Promise<void> => {
      await p().cdp('Emulation.setEmulatedMedia', { media: 'print' });
      try {
        const leidas = await p().evaluar<[string, boolean][]>(`(() => { ${antes}; try { return ${PISADAS}; } finally { ${despues}; } })()`);
        t.diagnostic(`${que}: ${leidas.length} declaraciones, ${leidas.filter(([, gana]) => !gana).length} pisadas`);
        for (const [clave, gana] of leidas) vistas.set(clave, (vistas.get(clave) ?? false) || gana);
      } finally {
        await p().cdp('Emulation.setEmulatedMedia', { media: '' });
      }
    };
    try {
      await leer('desde 1280, con resultado');
      await anchoDe(390);
      await leer('desde 390, con resultado');
      await anchoDe(1280);
      await leer('desde 1280, sin resultado', `document.getElementById('resultado').hidden = true`, `document.getElementById('resultado').hidden = false`);
    } finally {
      await anchoDe(1280);
    }
    assert.ok(vistas.size > 100, `${vistas.size} declaraciones leídas`);
    assert.deepEqual([...vistas].filter(([, gana]) => !gana).map(([clave]) => clave), [], 'declaraciones de la hoja de impresión que no ganan en ningún elemento');
  });

  test('8 · la negrita del papel (Literata 600), ya cargada cuando aparece el resultado, antes de que se pueda imprimir', async () => {
    await preparar();
    const vista = await p().evaluar<{ estado: string | null; check: boolean } | null>('window.__negritaAlEnsenar ?? null');
    assert.deepEqual(vista, { estado: 'loaded', check: true }, 'la cara de Literata 600 y document.fonts.check, al quitarse el hidden del resultado');
  });
});
