/**
 * Los jueces del PDF de «Descargar informe» (encargo 9.3; decisión de Antonio
 * del 05/10, firmada en la parada previa: pdfmake 0.3.11, cargado al pulsar,
 * con nuestras fuentes). Sobre astro preview de dist/ y Chrome headless
 * (chrome.ts), con la descarga de verdad: se pulsa el botón y Chrome guarda el
 * fichero (Browser.setDownloadBehavior) en una carpeta temporal, que se lee y
 * se borra. Los tests van en orden y comparten la pestaña; el último cuenta la
 * red de todos.
 *
 *   1. Sin resultado, el «Descargar informe» del formulario está desactivado.
 *   2. Con texto insuficiente, al pulsarlo no hay PDF (ni descarga ni trozo de
 *      pdfmake) y su línea de estado dice por qué.
 *   3. Con combinacion-real, desde 1280 y desde 390, el del final: mientras se
 *      prepara, desactivado y con «Preparando el informe…»; después, como
 *      estaba, y un RadiografIA.pdf que empieza por %PDF-.
 *   4. El PDF, página a página (pdf.ts): A4; «n / N» en cada una, con N el
 *      total; las siete secciones en orden, la 1 al principio y la 4, la 5 y la
 *      6 empezando página, como el papel (DISEÑO §6.5); la etiqueta y la frase
 *      del resultado; cada señal entera en una página (su nombre y su «Qué
 *      hacer»); y la nota al final, acompañada en su página.
 *   5. Su texto es el del papel (Page.printToPDF del mismo análisis y desde el
 *      mismo ancho), sin los números de página, carácter a carácter y sin los
 *      blancos: los cortes de línea y de página pueden ser otros (el eje
 *      óptico de Literata es 12 en el PDF y el del cuerpo en papel;
 *      docs/figma/fuentes.md), y Chrome no escribe como glifo cada espacio
 *      (visto el 05/10: «[O]Además» en el texto de su PDF, con el espacio en
 *      la página).
 *   6. Calcado al marco «Informe / A4», con lo mismo que el juez del papel
 *      (marco-a4.ts): el número de cada página, la primera línea de las
 *      páginas que empiezan sección, y cada pieza con su letra, su borde
 *      izquierdo y su aire; ±1 px. La letra de cada tramo, de la cara de su
 *      nombre PostScript (pdfkit no escribe FontFamily ni FontWeight).
 *   7. Las fuentes: las del PDF son caras de public/fuentes/ (por su nombre
 *      PostScript), cada una con su programa dentro (FontFile2), y las mismas
 *      caras (familia, peso y estilo) que las del papel; y las métricas de
 *      informe-pdf.ts (METRICAS), de las que sale el interlineado, son las de
 *      sus WOFF.
 *   8. Ninguna señal partida tampoco con los dos textos de ejemplo de la
 *      página (firmado: con el texto de las cinco claves, que es
 *      combinacion-real, el del marco; y aquí, además, los ejemplos).
 *   9. Ctrl+P no se intercepta: un keydown de Ctrl+P no lleva preventDefault.
 *  10. Con un paquete propio (el de prueba del cargador, con el texto de los
 *      tres paquetes): sus reglas, en el desglose con su línea, sin su ficha
 *      completa, como en papel (la hoja solo abre los <details> de «Ver el
 *      detalle»; el de cada regla propia sale cerrado: visto el 05/10); sus
 *      señales, con su id detrás del nombre y diciendo que no tienen página
 *      en el catálogo; el mismo texto que el papel; y ninguna señal partida.
 *  11. La red: después de la carga inicial, solo el trozo de JS de pdfmake y
 *      las cinco caras del PDF, del mismo origen y cada una una vez; ninguna
 *      violación de la CSP.
 *
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Browser/#method-setDownloadBehavior
 *    — «allow»: «Allow all downloads»; downloadPath; eventsEnabled: «Whether
 *    to emit download events», y Browser.downloadProgress con state
 *    «completed».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Event/defaultPrevented
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as textos from '../src/textos.ts';
import { EJEMPLOS } from '../src/pantalla/ejemplos.ts';
import { FUENTES_DEL_PDF, METRICAS } from '../src/pantalla/informe-pdf.ts';
import { EJEMPLOS_PUBLICOS, PAQUETES_DE_PRUEBA, TEXTO_DE_COMBINACION_REAL, TEXTO_DE_TRES_PAQUETES } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';
import { comoElMarco, familiaDe, medidasDelMarco, piezasComoElMarco } from './marco-a4.ts';
import { fuentesDelPdf, lineasDeLasPaginas, type PaginaDelPdf } from './pdf.ts';
import { caraDe, tablasDeWoff } from './woff2.ts';

const FUENTES = new URL('../public/fuentes/', import.meta.url);
const PUBLICOS = new URL('../public/ejemplos/', import.meta.url);
const NOMBRE = 'RadiografIA.pdf';
const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Las caras del PDF por su nombre PostScript, leídas de sus WOFF: su familia (la tipográfica), su peso y su estilo. */
const CARAS = new Map(
  [...new Set(Object.values(FUENTES_DEL_PDF).flatMap((f) => Object.values(f)))].map((ruta) => {
    const cara = caraDe(tablasDeWoff(readFileSync(new URL(ruta, FUENTES))));
    return [cara.postscript, { ...cara, ruta }] as const;
  }),
);

/** Las páginas del PDF con la letra de cada tramo completada desde la cara de su nombre PostScript. */
const conCaras = (paginas: readonly PaginaDelPdf[]): PaginaDelPdf[] =>
  paginas.map((p) => ({ ...p, lineas: p.lineas.map((l) => ({ ...l, tramos: l.tramos.map((t) => ({ ...t, familia: CARAS.get(t.fuente)?.familia ?? `(${t.fuente})`, peso: CARAS.get(t.fuente)?.peso ?? 0 })) })) }));

/** El texto de un PDF sin los blancos, sin la última línea de cada página (su número). */
const sinBlancos = (paginas: readonly PaginaDelPdf[]): string => paginas.flatMap((p) => p.lineas.slice(0, -1).map((l) => l.texto)).join('').replace(/\s/g, '');

/** Dónde difieren el texto del PDF y el del papel, sin los blancos y sin los números de página; null si en ninguna parte. */
function diferenciaDeTexto(paginas: readonly PaginaDelPdf[], papel: readonly PaginaDelPdf[]): string | null {
  const [delPdf, delPapel] = [[...sinBlancos(paginas)], [...sinBlancos(papel)]];
  const k = delPdf.findIndex((x, i) => x !== delPapel[i]);
  if (k < 0 && delPdf.length === delPapel.length) return null;
  const donde = k < 0 ? Math.min(delPdf.length, delPapel.length) : k;
  const contexto = (texto: string[]): string => texto.slice(Math.max(0, donde - 40), donde + 40).join('');
  return `en el carácter ${donde}, «${contexto(delPdf)}» en el PDF y «${contexto(delPapel)}» en el papel (${delPdf.length} y ${delPapel.length} caracteres)`;
}

/** Lo que se descargó y lo que había en la página: el PDF, el del papel desde el mismo ancho y las señales del informe. */
interface Descarga {
  pdf: Buffer;
  paginas: PaginaDelPdf[];
  papel: PaginaDelPdf[];
  /** El botón justo después del clic: su texto y si estaba desactivado; y al terminar. */
  preparando: [string, boolean];
  despues: [string, boolean];
  senales: { nombre: string; queHacer: string }[];
}

describe('el PDF de «Descargar informe»', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  let completadas = 0;
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };
  async function abrir(): Promise<void> {
    if (sesion !== undefined) return;
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    sesion.pestana.alEvento((metodo, datos) => {
      if (metodo === 'Browser.downloadProgress' && (datos as { state?: string }).state === 'completed') completadas++;
    });
  }
  async function anchoDe(ancho: number): Promise<void> {
    await p().cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
    await p().hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
  }
  async function analizar(texto: string): Promise<void> {
    await anchoDe(1280);
    await p().evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(texto)};
      document.getElementById('analizar').click();
    })()`);
    await p().hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
  }
  /** Pulsa un botón «Descargar informe» y espera la descarga; lanza con la línea de estado si no llega. */
  async function descargar(boton: string): Promise<{ pdf: Buffer; preparando: [string, boolean]; despues: [string, boolean] }> {
    const carpeta = mkdtempSync(join(tmpdir(), 'radiografia-descarga-'));
    try {
      await p().cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: carpeta, eventsEnabled: true });
      const antes = completadas;
      const leerBoton = `[document.getElementById(${JSON.stringify(boton)}).textContent, document.getElementById(${JSON.stringify(boton)}).disabled]`;
      const preparando = await p().evaluar<[string, boolean]>(`(() => { document.getElementById(${JSON.stringify(boton)}).click(); return ${leerBoton}; })()`);
      for (const limite = Date.now() + 60_000; completadas === antes; ) {
        const estado = await p().evaluar<string>(`[...document.querySelectorAll('.estado-descarga')].map((e) => e.textContent).join('')`);
        if (estado !== '' || Date.now() > limite) throw new Error(`no se descargó el PDF: «${estado}»`);
        await esperar(100);
      }
      await p().hasta(`!document.getElementById(${JSON.stringify(boton)}).disabled`, 'el botón, como estaba');
      assert.deepEqual(readdirSync(carpeta), [NOMBRE], 'lo que se descargó');
      return { pdf: readFileSync(join(carpeta, NOMBRE)), preparando, despues: await p().evaluar<[string, boolean]>(leerBoton) };
    } finally {
      rmSync(carpeta, { recursive: true, force: true });
    }
  }
  /** Las señales del informe en la página: el nombre y el principio de «Qué hacer» de cada una. */
  const senales = (): Promise<{ nombre: string; queHacer: string }[]> =>
    p().evaluar(`[...document.querySelectorAll('#senales-informe .entrada-informe')].map((e) => ({
      nombre: e.querySelector('h3').textContent,
      queHacer: [...e.querySelectorAll('p')].find((x) => x.textContent.startsWith(${JSON.stringify(`${textos.QUE_HACER}: `)}))?.textContent.slice(0, 40) ?? '',
    }))`);
  /**
   * Las señales partidas entre dos páginas de un PDF (o que no están): su nombre y su «Qué hacer», en páginas distintas.
   * El nombre, con la dirección de su ficha detrás; el de una regla de un paquete propio, que no tiene ficha, solo (su
   * título en la página ya lleva su id).
   */
  const partidas = (paginas: readonly PaginaDelPdf[], lista: readonly { nombre: string; queHacer: string }[]): string[] =>
    lista
      .filter((e) => {
        const donde = paginas.findIndex((pg) => pg.lineas.some((l) => l.texto === e.nombre || l.texto.startsWith(`${e.nombre} (`)));
        return donde < 0 || !paginas[donde]!.lineas.some((l) => l.texto.startsWith(e.queHacer));
      })
      .map((e) => e.nombre);

  const porAncho = new Map<number, Descarga>();
  async function combinacionReal(): Promise<Map<number, Descarga>> {
    if (porAncho.size > 0) return porAncho;
    await abrir();
    await analizar(TEXTO_DE_COMBINACION_REAL);
    const lista = await senales();
    for (const ancho of [1280, 390]) {
      await anchoDe(ancho);
      const d = await descargar('descargar');
      const { data } = (await p().cdp('Page.printToPDF', { preferCSSPageSize: true, printBackground: false })) as { data: string };
      porAncho.set(ancho, { ...d, paginas: lineasDeLasPaginas(d.pdf), papel: lineasDeLasPaginas(Buffer.from(data, 'base64')), senales: lista });
    }
    await anchoDe(1280);
    return porAncho;
  }

  after(async () => {
    await sesion?.cerrar();
  });

  test('1 · sin resultado, el «Descargar informe» del formulario está desactivado', async () => {
    await abrir();
    assert.equal(await p().evaluar<boolean>(`document.getElementById('informe').disabled`), true);
  });

  test('2 · con texto insuficiente, no hay PDF y su línea de estado lo dice', async () => {
    await abrir();
    await analizar('Un texto corto, de una sola frase, que no llega a las cien palabras que hacen falta para analizarlo.');
    const carpeta = mkdtempSync(join(tmpdir(), 'radiografia-descarga-'));
    try {
      await p().cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: carpeta, eventsEnabled: true });
      const antes = completadas;
      const visto = await p().evaluar<{ activo: boolean; estado: string; oculto: boolean }>(`(() => {
        const boton = document.getElementById('informe');
        const activo = !boton.disabled && !boton.hidden;
        boton.click();
        const estado = document.getElementById('estado-informe');
        return { activo, estado: estado.textContent, oculto: estado.hidden };
      })()`);
      await esperar(1500);
      assert.deepEqual(visto, { activo: true, estado: textos.SIN_INFORME_QUE_DESCARGAR, oculto: false });
      assert.equal(completadas, antes, 'una descarga');
      assert.deepEqual(readdirSync(carpeta), [], 'lo que se descargó');
      assert.deepEqual(sesion!.despues.filter((x) => x.url.includes('/_astro/')), [], 'el trozo de pdfmake, pedido');
    } finally {
      rmSync(carpeta, { recursive: true, force: true });
    }
  });

  test('3 · con combinacion-real, desde 1280 y desde 390: «Preparando el informe…» mientras se prepara y, después, RadiografIA.pdf', async (t) => {
    for (const [ancho, d] of await combinacionReal()) {
      t.diagnostic(`desde ${ancho}: ${d.pdf.length} bytes, ${d.paginas.length} páginas; el papel, ${d.papel.length}`);
      assert.deepEqual(d.preparando, [textos.PREPARANDO_EL_INFORME, true], `desde ${ancho}: el botón mientras se prepara`);
      assert.deepEqual(d.despues, [textos.DESCARGAR_INFORME, false], `desde ${ancho}: el botón después`);
      assert.equal(d.pdf.subarray(0, 5).toString('latin1'), '%PDF-', `desde ${ancho}: la cabecera del fichero`);
    }
  });

  test('4 · el PDF, página a página: A4, «n / N», las siete secciones con salto antes de la 4, la 5 y la 6, la etiqueta y la frase, ninguna señal partida y la nota al final, acompañada', async () => {
    for (const [ancho, d] of await combinacionReal()) {
      const paginas = d.paginas;
      const n = paginas.length;
      const lineas = paginas.map((pg) => pg.lineas.map((l) => l.texto));
      assert.deepEqual(
        paginas.filter((pg) => Math.abs(pg.ancho - 793.7) > 1 || Math.abs(pg.alto - 1122.5) > 1).map((pg) => `${pg.ancho} × ${pg.alto}`),
        [],
        `desde ${ancho}: páginas que no son A4`,
      );
      assert.deepEqual(lineas.map((l) => l.at(-1)), lineas.map((_, i) => `${i + 1} / ${n}`), `desde ${ancho}: el número de cada página`);
      const titulos = [textos.INFORME_DE_RADIOGRAFIA, textos.RESULTADO, textos.CLAVE_DE_FAMILIAS, textos.TEXTO_DEL_INFORME, textos.DESGLOSE, textos.SENALES_DEL_INFORME].map((x, i) => `${i + 1}. ${x}`);
      const donde = titulos.map((titulo) => lineas.findIndex((l) => l.includes(titulo)));
      assert.deepEqual(donde.map((x) => x >= 0), titulos.map(() => true), `desde ${ancho}: las secciones en el PDF`);
      assert.deepEqual([...donde].sort((a, b) => a - b), donde, `desde ${ancho}: las secciones en orden`);
      assert.equal(lineas[0]![0], titulos[0], `desde ${ancho}: la sección 1, al principio`);
      for (const k of [3, 4, 5]) assert.equal(lineas[donde[k]!]![0], titulos[k], `desde ${ancho}: «${titulos[k]}» empieza página`);
      // Las mismas páginas de salto que el papel: la 4, la 5 y la 6 empiezan página también allí.
      for (const k of [3, 4, 5]) assert.ok(d.papel.some((pg) => pg.lineas[0]?.texto === titulos[k]), `desde ${ancho}: en papel, «${titulos[k]}» empieza página`);
      const todo = lineas.flat().join(' ');
      for (const frase of ['Texto con bastantes rasgos de Asistente IA', 'Tu texto suena bastante a asistente (IA)']) assert.ok(todo.includes(frase), `desde ${ancho}: «${frase}»`);
      assert.deepEqual(partidas(paginas, d.senales), [], `desde ${ancho}: señales partidas entre dos páginas (o que no están)`);
      assert.ok(d.senales.length > 10, `${d.senales.length} señales`);
      const ultima = lineas.at(-1)!;
      assert.equal(ultima.at(-2), `7. ${textos.NOTA_DE_AUTORIA}`, `desde ${ancho}: la nota, al final`);
      assert.ok(ultima.length > 2, `desde ${ancho}: la nota, acompañada en su página`);
    }
  });

  test('5 · su texto es el del papel, carácter a carácter sin los blancos y sin los números de página', async () => {
    for (const [ancho, d] of await combinacionReal()) assert.equal(diferenciaDeTexto(d.paginas, d.papel), null, `desde ${ancho}`);
  });

  test('6 · calcado al marco «Informe / A4»: el número de cada página, la primera línea de cada sección que empieza página y cada pieza con su letra y su aire', async (t) => {
    const m = medidasDelMarco();
    for (const [ancho, d] of await combinacionReal()) {
      const paginas = conCaras(d.paginas);
      const { diferencias, paso, enElMarco } = piezasComoElMarco(paginas, m);
      t.diagnostic(`desde ${ancho}: interlineado del texto ${paso} px; en el marco ${enElMarco.toFixed(2)}`);
      assert.deepEqual([...comoElMarco(paginas, m), ...diferencias], [], `desde ${ancho}`);
    }
  });

  test('7 · las fuentes: nuestras caras, incrustadas, las mismas que las del papel; y las métricas de informe-pdf.ts, las de sus WOFF', async () => {
    const d = (await combinacionReal()).get(1280)!;
    const delPdf = fuentesDelPdf(d.pdf);
    assert.deepEqual(delPdf.filter((f) => !CARAS.has(f.nombre)).map((f) => f.nombre), [], 'fuentes del PDF que no son las nuestras');
    assert.deepEqual(delPdf.filter((f) => !f.incrustada || f.subtipo !== 'Type0').map((f) => `${f.nombre} (${f.subtipo})`), [], 'fuentes sin su programa dentro');
    const cara = (familia: string, peso: number, italica: boolean): string => `${familiaDe(familia)} ${peso}${italica ? ' itálica' : ''}`;
    const usadas = (paginas: readonly PaginaDelPdf[], deTramo: (t: PaginaDelPdf['lineas'][number]['tramos'][number]) => string): string[] =>
      [...new Set(paginas.flatMap((pg) => pg.lineas.flatMap((l) => l.tramos.map(deTramo))))].sort();
    const delPapel = usadas(d.papel, (t) => cara(t.familia, t.peso, /Italic/.test(t.fuente)));
    const enElPdf = usadas(d.paginas, (t) => {
      const c = CARAS.get(t.fuente)!;
      return cara(c.familia, c.peso, c.italica);
    });
    assert.deepEqual(enElPdf, delPapel, 'las caras del PDF frente a las del papel');
    for (const [familia, caras] of Object.entries(FUENTES_DEL_PDF)) {
      for (const ruta of new Set(Object.values(caras))) {
        const tablas = tablasDeWoff(readFileSync(new URL(ruta, FUENTES)));
        const hhea = tablas.get('hhea')!;
        const visto = { ascendente: hhea.readInt16BE(4), descendente: hhea.readInt16BE(6), unidades: tablas.get('head')!.readUInt16BE(18) };
        assert.deepEqual(visto, METRICAS[familia as keyof typeof METRICAS], `las métricas de ${ruta}`);
      }
    }
  });

  test('8 · ninguna señal partida tampoco con los dos textos de ejemplo', async (t) => {
    await abrir();
    for (const fichero of Object.values(EJEMPLOS)) {
      await analizar(readFileSync(new URL(fichero, PUBLICOS), 'utf8'));
      const lista = await senales();
      const { pdf } = await descargar('descargar');
      const paginas = lineasDeLasPaginas(pdf);
      t.diagnostic(`${fichero}: ${paginas.length} páginas, ${lista.length} señales`);
      assert.deepEqual(partidas(paginas, lista), [], `${fichero}: señales partidas entre dos páginas (o que no están)`);
      assert.equal(paginas.at(-1)!.lineas.at(-2)?.texto, `7. ${textos.NOTA_DE_AUTORIA}`, `${fichero}: la nota, al final`);
    }
  });

  test('9 · Ctrl+P no se intercepta', async () => {
    await abrir();
    const interceptado = await p().evaluar<boolean>(`(() => {
      const e = new KeyboardEvent('keydown', { key: 'p', code: 'KeyP', ctrlKey: true, bubbles: true, cancelable: true });
      document.body.dispatchEvent(e);
      return e.defaultPrevented;
    })()`);
    assert.equal(interceptado, false);
  });

  test('10 · con un paquete propio: sus reglas en el desglose y sus señales con su id y «sin página en el catálogo», el mismo texto que el papel y ninguna señal partida', async (t) => {
    await abrir();
    const { root } = (await p().cdp('DOM.getDocument')) as { root: { nodeId: number } };
    const { nodeId } = (await p().cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '#paquete-propio' })) as { nodeId: number };
    await p().cdp('DOM.setFileInputFiles', { nodeId, files: [fileURLToPath(new URL(PAQUETES_DE_PRUEBA.valido, EJEMPLOS_PUBLICOS))] });
    await p().hasta(`document.getElementById('propios').childElementCount > 0`, 'el paquete propio, cargado');
    await analizar(TEXTO_DE_TRES_PAQUETES);
    const lista = await senales();
    const { pdf } = await descargar('descargar');
    const { data } = (await p().cdp('Page.printToPDF', { preferCSSPageSize: true, printBackground: false })) as { data: string };
    const [paginas, papel] = [lineasDeLasPaginas(pdf), lineasDeLasPaginas(Buffer.from(data, 'base64'))];
    t.diagnostic(`${paginas.length} páginas; el papel, ${papel.length}`);
    const propio = JSON.parse(readFileSync(new URL(PAQUETES_DE_PRUEBA.valido, EJEMPLOS_PUBLICOS), 'utf8')) as { cabecera: { nombre: string; version: string }; reglas: { id: string }[] };
    const todo = paginas.flatMap((pg) => pg.lineas.map((l) => l.texto)).join(' ');
    assert.ok(todo.includes(`${propio.cabecera.nombre} ${propio.cabecera.version}`), `el desglose de «${propio.cabecera.nombre}»`);
    assert.ok(propio.reglas.some((r) => todo.includes(`(${r.id})`)), 'una señal del propio, con su id detrás del nombre');
    assert.ok(todo.includes(textos.REGLA_PROPIA_SIN_FICHA), 'las señales del propio dicen que no tienen ficha');
    assert.equal(diferenciaDeTexto(paginas, papel), null, 'el texto del PDF frente al del papel');
    assert.deepEqual(partidas(paginas, lista), [], 'señales partidas entre dos páginas (o que no están)');
  });

  test('11 · la red: después de la carga inicial, solo el trozo de pdfmake y las cinco caras, del mismo origen y una vez cada una; y ninguna violación de la CSP', async (t) => {
    await abrir();
    const { despues, url } = sesion!;
    t.diagnostic(`después de la marca: ${despues.map((x) => x.url.replace(url, '/')).join(' · ') || 'nada'}`);
    const fuera = despues.filter((x) => !x.url.startsWith(url) || !(/^_astro\/[\w.-]+\.js$/.test(x.url.slice(url.length)) || /^fuentes\/[\w/-]+\.woff$/.test(x.url.slice(url.length))));
    assert.deepEqual(fuera, [], 'peticiones que no son el trozo de pdfmake ni las caras del PDF');
    const caras = despues.filter((x) => x.url.endsWith('.woff')).map((x) => x.url.slice(url.length)).sort();
    assert.deepEqual(caras, [...new Set(Object.values(FUENTES_DEL_PDF).flatMap((f) => Object.values(f)))].map((r) => `fuentes/${r}`).sort(), 'las caras del PDF, una vez cada una');
    assert.deepEqual(await sesion!.violaciones(), [], 'intentos bloqueados por la CSP');
  });
});
