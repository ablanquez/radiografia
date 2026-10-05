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
 *      primera línea de la página 1 y las de las páginas donde empiezan la 4 y
 *      la 6 caen donde en el marco.
 *   3. Desde 1280 y desde 390, cada pieza del marco en su línea del PDF: su
 *      familia, su peso, su cuerpo, su color y su borde izquierdo; y el aire
 *      entre ella y la línea de antes (la distancia entre sus líneas base),
 *      que es lo que hacen los márgenes de los títulos, los interlineados y
 *      el espacio entre secciones, párrafos y señales.
 *   4. La clave: la muestra de la línea de cada familia, de 32 × 10, centrada
 *      con su texto, con el estilo y el grosor del marco, en tinta.
 *
 * Tolerancia, la del encargo: ±1 px en posiciones y distancias (Chrome deja
 * cada línea base en un píxel entero: ±0,5 en cada una), ±0,05 px en el
 * cuerpo (Skia escribe el de Tf con dos decimales: 14,66 por 14,6667). La
 * familia, el peso y el color, iguales; la familia por su nombre de familia
 * («Literata 12pt» es la Literata del eje óptico de 12, docs/figma/fuentes.md).
 * El peso de Literata en negrita: el modelo pide 700 y carga 400 y 600 (su
 * index.css, de Google Fonts), así que pinta la de 600 (la más cercana por
 * debajo, CSS Fonts 4, § 5.2); la web, igual, con la 600 que precarga el
 * analizador.
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
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import { TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';
import { lineasDeLasPaginas, type LineaDelPdf, type PaginaDelPdf } from './pdf.ts';

const MEDIDAS = new URL('../../docs/figma/medidas-modelo.json', import.meta.url);

/** Una pieza del marco, como la escribe medir-modelo.ts. */
interface Pieza {
  pantalla: string;
  familia: string;
  tamano: string;
  peso: string;
  interlineado: string;
  color: string;
  ancho: number;
  alto: number;
  relleno: string[];
  pagina: number;
  arriba: number;
  izquierda: number;
  derecha: number;
  base?: number;
  ultimaBase?: number;
}

/** A4 a 96 ppp, en px CSS: 210 × 297 mm. Los márgenes de @page, 20 mm arriba y abajo y 18 a los lados. */
const MM = 96 / 25.4;
const PAGINA = { ancho: 210 * MM, alto: 297 * MM, arriba: 20 * MM, lado: 18 * MM };

const px = (valor: string): number => Number.parseFloat(valor);
const cerca = (a: number, b: number, margen = 1): boolean => Math.abs(a - b) <= margen + 1e-6;
/** La familia de una fuente del PDF por su nombre de familia: «Literata 12pt» es Literata. */
const familiaDe = (familia: string): string => (familia.startsWith('Literata') ? 'Literata' : familia);
/** El peso que pinta el navegador: Literata en negrita, con la de 600 (véase arriba). */
const pesoPintado = (familia: string, peso: number): number => (familiaDe(familia) === 'Literata' && peso >= 600 ? 600 : peso);

describe('el papel, como el marco «Informe / A4» del modelo', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  let analizado = false;
  const medidas = (): Record<string, Pieza> => (JSON.parse(readFileSync(MEDIDAS, 'utf8')) as { medidas: Record<string, Pieza> }).medidas;
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };
  /** El analizador con combinacion-real ya analizado. */
  async function preparar(): Promise<void> {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    if (analizado) return;
    await anchoDe(1280);
    await p().evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
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

  test('1 · el fichero trae las piezas del marco que se juzgan, con su página', () => {
    const m = medidas();
    const claves = [...PIEZAS.map((x) => x.clave), 'informe.pagina', 'informe.numero', 'informe.s3.muestra', 'informe.s4.titulo', 'informe.s6.titulo'];
    assert.deepEqual(
      claves.filter((c) => m[c]?.pantalla !== 'informe/escritorio' || typeof m[c]?.pagina !== 'number'),
      [],
      'piezas del marco que el fichero no trae',
    );
    assert.deepEqual([m['informe.pagina']!.ancho, m['informe.pagina']!.alto], [794, 1123], 'la página del marco, A4 a 96 ppp');
  });

  for (const ancho of [1280, 390]) {
    test(`2 · desde ${ancho}: A4, el número de cada página como el del marco, nada fuera del área, y la primera línea de las páginas 1, 4 y 6 donde en el marco`, async (t) => {
      await preparar();
      const m = medidas();
      const paginas = await pdfDesde(ancho);
      const n = paginas.length;
      t.diagnostic(`desde ${ancho}: ${n} páginas`);
      const diferencias: string[] = [];
      paginas.forEach((pagina, i) => {
        if (!cerca(pagina.ancho, PAGINA.ancho) || !cerca(pagina.alto, PAGINA.alto)) diferencias.push(`p${i + 1}: ${pagina.ancho} × ${pagina.alto}, y A4 es ${PAGINA.ancho.toFixed(2)} × ${PAGINA.alto.toFixed(2)}`);
        // El número, la última línea: su texto, su letra, su línea base y su borde derecho.
        const numero = pagina.lineas.at(-1);
        const marco = m['informe.numero']!;
        if (numero === undefined || numero.texto !== `${i + 1} / ${n}`) diferencias.push(`p${i + 1}: el número es «${numero?.texto}»`);
        else {
          diferencias.push(...letra(`p${i + 1} número`, numero, 0, marco));
          if (!cerca(numero.y, marco.base!)) diferencias.push(`p${i + 1} número: línea base en ${numero.y}, en el marco ${marco.base}`);
          if (!cerca(numero.fin, marco.derecha)) diferencias.push(`p${i + 1} número: acaba en ${numero.fin}, en el marco ${marco.derecha}`);
        }
        // Lo demás, dentro del área de la página: ni la cabecera ni el pie de Chrome, ni nada que se salga por los lados.
        for (const l of pagina.lineas.slice(0, -1)) {
          if (l.y < PAGINA.arriba - 1 || l.y > PAGINA.alto - PAGINA.arriba + 1 || l.x < PAGINA.lado - 1 || l.fin > PAGINA.ancho - PAGINA.lado + 1) {
            diferencias.push(`p${i + 1}: fuera del área, «${l.texto.slice(0, 50)}» en x ${l.x}–${l.fin}, línea base ${l.y}`);
          }
        }
      });
      // La primera línea de la página 1 y de las páginas donde empiezan la 4 y la 6 (saltos de página antes), donde en el marco.
      for (const [clave, titulo] of [
        ['informe.s1.titulo', `1. ${textos.INFORME_DE_RADIOGRAFIA}`],
        ['informe.s4.titulo', `4. ${textos.TEXTO_DEL_INFORME}`],
        ['informe.s6.titulo', `6. ${textos.SENALES_DEL_INFORME}`],
      ] as const) {
        const donde = paginas.findIndex((pg) => pg.lineas[0]?.texto === titulo);
        if (donde < 0) diferencias.push(`«${titulo}» no empieza ninguna página`);
        else if (!cerca(paginas[donde]!.lineas[0]!.y, m[clave]!.base!)) diferencias.push(`«${titulo}»: línea base en ${paginas[donde]!.lineas[0]!.y}, en el marco ${m[clave]!.base}`);
      }
      assert.deepEqual(diferencias, []);
    });

    test(`3 · desde ${ancho}: cada pieza del marco en su línea del PDF, con su letra y el aire de la línea de antes`, async (t) => {
      await preparar();
      const m = medidas();
      const paginas = await pdfDesde(ancho);
      const todas = paginas.flatMap((pagina, i) => pagina.lineas.slice(0, -1).map((l, j) => ({ ...l, pagina: i, j })));
      const diferencias: string[] = [];
      for (const pieza of PIEZAS) {
        const marco = m[pieza.clave]!;
        const k = todas.findIndex((l) => pieza.linea(l.texto));
        if (k < 0) {
          diferencias.push(`${pieza.clave}: ninguna línea del PDF es la suya`);
          continue;
        }
        const linea = todas[k]!;
        diferencias.push(...letra(pieza.clave, linea, pieza.tramo ?? 0, marco));
        if (pieza.tramo === undefined && !cerca(linea.x, marco.izquierda)) diferencias.push(`${pieza.clave}: empieza en ${linea.x}, en el marco ${marco.izquierda}`);
        if (pieza.antes !== undefined && pieza.antes !== 'misma') {
          // El aire: de la línea base de la línea de antes (la última de la pieza anterior) a la suya.
          const anterior = todas[k - 1];
          const delMarco = marco.base! - (m[pieza.antes]!.ultimaBase ?? m[pieza.antes]!.base!);
          if (anterior === undefined || anterior.pagina !== linea.pagina) diferencias.push(`${pieza.clave}: no tiene línea de antes en su página`);
          else if (!cerca(linea.y - anterior.y, delMarco)) diferencias.push(`${pieza.clave}: ${(linea.y - anterior.y).toFixed(2)} px desde «${anterior.texto.slice(0, 30)}», en el marco ${delMarco.toFixed(2)}`);
        }
      }
      // El interlineado del texto: dentro de un párrafo de la sección 4, de una línea a la siguiente, como en el marco.
      const parrafo = m['informe.s4.parrafo2']!;
      const enElMarco = (parrafo.ultimaBase! - parrafo.base!) / Math.round((parrafo.ultimaBase! - parrafo.base!) / px(parrafo.interlineado));
      const k = todas.findIndex((l) => l.texto.startsWith('La productividad se ha convertido'));
      const paso = todas[k + 1]!.y - todas[k]!.y;
      t.diagnostic(`desde ${ancho}: interlineado del texto ${paso} px; en el marco ${enElMarco.toFixed(2)}`);
      if (!cerca(paso, enElMarco)) diferencias.push(`el interlineado del texto: ${paso} px, en el marco ${enElMarco.toFixed(2)}`);
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
});

/** La letra de un tramo de una línea del PDF frente a la de una pieza del marco: familia, peso, cuerpo y color. */
function letra(nombre: string, linea: LineaDelPdf, tramo: number, marco: Pieza): string[] {
  const t = linea.tramos[tramo];
  if (t === undefined) return [`${nombre}: la línea no tiene el tramo ${tramo}`];
  const fuera: string[] = [];
  if (familiaDe(t.familia) !== marco.familia) fuera.push(`${nombre}: familia ${t.familia}, en el marco ${marco.familia}`);
  if (t.peso !== pesoPintado(marco.familia, Number(marco.peso))) fuera.push(`${nombre}: peso ${t.peso}, en el marco ${marco.peso}`);
  if (!cerca(t.tamano, px(marco.tamano), 0.05)) fuera.push(`${nombre}: cuerpo ${t.tamano}, en el marco ${marco.tamano}`);
  if (t.color !== marco.color) fuera.push(`${nombre}: color ${t.color}, en el marco ${marco.color}`);
  return fuera;
}

/**
 * Las piezas del marco que se buscan en el PDF: cómo se reconoce su línea, de
 * qué tramo es su letra (la primera, si no se dice; con tramo, no se mira su
 * borde izquierdo) y de qué pieza es la línea de antes (para el aire; «misma»,
 * la misma pieza, para no mirarlo).
 */
const PIEZAS: readonly { clave: string; linea: (texto: string) => boolean; tramo?: number; antes?: string }[] = [
  { clave: 'informe.s1.titulo', linea: (x) => x === `1. ${textos.INFORME_DE_RADIOGRAFIA}` },
  { clave: 'informe.s1.linea', linea: (x) => x.startsWith('Análisis del '), antes: 'informe.s1.titulo' },
  { clave: 'informe.s1.linea2', linea: (x) => /^\d+ palabras que cuentan/.test(x), antes: 'informe.s1.linea' },
  { clave: 'informe.s2.titulo', linea: (x) => x === `2. ${textos.RESULTADO}`, antes: 'informe.s1.ultima' },
  { clave: 'informe.s2.etiqueta', linea: (x) => x.startsWith('Texto con bastantes rasgos'), antes: 'informe.s2.titulo' },
  { clave: 'informe.s2.frase', linea: (x) => x.startsWith('Tu texto suena bastante'), antes: 'informe.s2.etiqueta' },
  { clave: 'informe.s2.pesa', linea: (x) => x.startsWith('Lo que más pesa:'), antes: 'informe.s2.frase' },
  { clave: 'informe.s2.empieza', linea: (x) => x.startsWith('Empieza por:'), antes: 'informe.s2.pesa' },
  { clave: 'informe.s2.espanol', linea: (x) => x.startsWith('Español correcto:'), antes: 'informe.s2.empieza' },
  { clave: 'informe.s3.titulo', linea: (x) => x === `3. ${textos.CLAVE_DE_FAMILIAS}`, antes: 'informe.s2.espanol' },
  // La primera línea de la sección 3 es la de las siglas, en el sitio y con la letra de la primera de la clave del marco.
  { clave: 'informe.s3.linea', linea: (x) => x === textos.CLAVE_DE_SIGLAS, tramo: 0, antes: 'informe.s3.titulo' },
  { clave: 'informe.s3.linea2', linea: (x) => x.startsWith('[') && x.endsWith('(RadiografIA)'), antes: 'informe.s3.linea' },
  // Empieza por un subrayado, con su relleno de 2 px a la izquierda, como en el marco: su borde izquierdo no se compara.
  { clave: 'informe.s4.parrafo', linea: (x) => x.startsWith('##'), tramo: 0, antes: 'informe.s4.titulo' },
  { clave: 'informe.s4.sigla', linea: (x) => x.startsWith('##'), tramo: 1, antes: 'misma' },
  { clave: 'informe.s4.parrafo2', linea: (x) => x.startsWith('La productividad se ha convertido'), antes: 'informe.s4.parrafo' },
  { clave: 'informe.s5.titulo', linea: (x) => x === `5. ${textos.DESGLOSE}` },
  { clave: 'informe.s5.paquete', linea: (x) => /^RadiografIA \d/.test(x), antes: 'informe.s5.titulo' },
  { clave: 'informe.s5.familia', linea: (x) => x.startsWith('Discurso: '), antes: 'misma' },
  { clave: 'informe.s5.regla', linea: (x) => x.startsWith('Atribución vaga: '), antes: 'informe.s5.familia' },
  { clave: 'informe.s5.regla2', linea: (x) => x.startsWith('Cierre de plantilla: '), antes: 'informe.s5.regla' },
  // De la última regla de una familia a la familia siguiente: Léxico y Puntuación y formato, que caen en la misma página.
  { clave: 'informe.s5.familia2', linea: (x) => x.startsWith('Puntuación y formato: '), antes: 'informe.s5.reglaFinal' },
  { clave: 'informe.s6.nombre', linea: (x) => x.startsWith('Encabezado de Markdown ('), antes: 'informe.s6.titulo' },
  { clave: 'informe.s6.url', linea: (x) => x.startsWith('Encabezado de Markdown ('), tramo: 1, antes: 'misma' },
  { clave: 'informe.s6.frase', linea: (x) => x.startsWith('Una línea que empieza por almohadillas'), antes: 'informe.s6.nombre' },
  // Entre la frase y los fragmentos, la línea de «Solo aviso: no suma.», un párrafo de una línea como la frase: el mismo aire.
  { clave: 'informe.s6.fragmentos', linea: (x) => x.startsWith('Fragmentos: «##»'), antes: 'informe.s6.frase' },
  { clave: 'informe.s6.quehacer.etiqueta', linea: (x) => x.startsWith(`${textos.QUE_HACER}: Quita el formato`), antes: 'informe.s6.fragmentos' },
  { clave: 'informe.s6.quehacer', linea: (x) => x.startsWith(`${textos.QUE_HACER}: Quita el formato`), tramo: 1, antes: 'misma' },
  { clave: 'informe.s6.siguiente', linea: (x) => x.startsWith('Atribución vaga ('), antes: 'informe.s6.quehacer' },
  { clave: 'informe.pie', linea: (x) => x === `7. ${textos.NOTA_DE_AUTORIA}` },
];
