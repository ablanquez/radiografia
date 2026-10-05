/**
 * Los jueces de las fuentes autoalojadas (encargo 10.4, Tanda 1; DISEÑO §5):
 *
 *   1. En web/public/fuentes/ están las cuatro caras (y, desde el 9.3, las
 *      cinco del PDF, test 6) y ninguna más, cada
 *      familia con su OFL.txt al lado (con su copyright y la OFL 1.1), y cada
 *      cara pesa menos de su umbral: 50.000 bytes una de Literata y 30.000 la
 *      de Atkinson. Recortadas pesan de 25.920 a 46.424; con el eje óptico
 *      entero, una de Literata pasaría de 66.000, y sin recorte, de 158.000
 *      (docs/figma/fuentes.md): el umbral caza que vuelva una de esas.
 *   2. Cada cara tiene los glifos de la prueba: á é í ó ú Á É Í Ó Ú ñ Ñ ü Ü ¿
 *      ¡ « » — – … “ ” ‘ ’ · € º ª y las cifras; Literata, además, → − ≥ η ρ,
 *      que usan las fichas. Atkinson no los trae ni en su original
 *      (comprobado con fontTools): caen en la fuente del sistema.
 *   3. THIRD-PARTY-NOTICES § 2.4 tiene una fila por cara, con la huella
 *      sha256 del fichero, y cada fila su fichero.
 *   4. dist/ lleva las caras, y el CSS construido las pide con @font-face a
 *      ficheros que existen: swap en Atkinson y fallback en Literata.
 *   5. En Chrome, sobre astro preview: la interfaz se pinta en Atkinson
 *      Hyperlegible Next y el cuadro de texto en Literata, con las dos caras
 *      cargadas.
 *   6. Desde el 9.3 (el PDF de «Descargar informe», con pdfmake; decisión de
 *      Antonio del 05/10): las cinco caras del PDF, en WOFF 1.0 (con WOFF2,
 *      pdfkit no las incrusta: fontkit, issue #201), son las de la web: cada
 *      una sale de su woff2, con su mismo recorte (los mismos códigos en la
 *      cmap), su familia, su peso, su estilo y su nombre PostScript, que es
 *      el que escribe el PDF; estáticas (pdfkit no aplica los ejes), Atkinson
 *      en 400 y en 700 y Literata en su eje óptico por defecto. Los tests 1,
 *      3 y 4 las cuentan también: su umbral, su fila con huella en § 2.4 y su
 *      sitio en dist/ (no van en ningún @font-face: las pide el PDF).
 * La red (nada de fonts.googleapis.com ni fonts.gstatic.com, y cada cara
 * pedida una vez) la mira el juez de red, navegador.spec.ts.
 *
 * [DOC] https://www.w3.org/TR/WOFF2/ y la cmap de OpenType: woff2.ts.
 * [DOC] https://openfontlicense.org/ofl-faq/ — 2.4: «Make sure the font file
 *    contains the needed copyright notice(s) and licensing information in
 *    its metadata»; los OFL.txt van además al lado y viajan con dist/.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { construir, DIST } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos } from './chrome.ts';
import { caraDe, codigosDeCmap, tablasDeWoff, tablasDeWoff2 } from './woff2.ts';

const FUENTES = new URL('../public/fuentes/', import.meta.url);
const NOTICES = new URL('../../THIRD-PARTY-NOTICES.md', import.meta.url);

/** Las caras, con su umbral de bytes, el copyright de su familia y si llevan los signos de las fichas. */
const CARAS = [
  { ruta: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next.woff2', umbral: 30_000, fichas: false },
  { ruta: 'literata/literata-400.woff2', umbral: 50_000, fichas: true },
  { ruta: 'literata/literata-400-italica.woff2', umbral: 50_000, fichas: true },
  { ruta: 'literata/literata-600.woff2', umbral: 50_000, fichas: true },
] as const;
/**
 * Las caras del PDF (9.3): de qué woff2 sale cada una, su umbral (Literata sin
 * los ejes pesa de 38.944 a 43.076 bytes y Atkinson 19.948 y 20.772; con el eje
 * óptico, una de Literata pasaría de 58.000: docs/figma/fuentes.md), y su nombre
 * PostScript, su peso y su estilo.
 */
const CARAS_DEL_PDF = [
  { ruta: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next-400.woff', de: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next.woff2', umbral: 25_000, postscript: 'AtkinsonHyperlegibleNext-Regular', peso: 400, italica: false },
  { ruta: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next-700.woff', de: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next.woff2', umbral: 25_000, postscript: 'AtkinsonHyperlegibleNext-Bold', peso: 700, italica: false },
  { ruta: 'literata/literata-400.woff', de: 'literata/literata-400.woff2', umbral: 50_000, postscript: 'Literata-12pt', peso: 400, italica: false },
  { ruta: 'literata/literata-400-italica.woff', de: 'literata/literata-400-italica.woff2', umbral: 50_000, postscript: 'LiterataItalic-12ptItalic', peso: 400, italica: true },
  { ruta: 'literata/literata-600.woff', de: 'literata/literata-600.woff2', umbral: 50_000, postscript: 'Literata-12ptSemiBold', peso: 600, italica: false },
] as const;
const COPYRIGHT: Readonly<Record<string, string>> = {
  'atkinson-hyperlegible-next': 'Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors (https://github.com/googlefonts/atkinson-hyperlegible-next)',
  literata: 'Copyright 2017 The Literata Project Authors (https://github.com/googlefonts/literata)',
};
const PRUEBA = 'áéíóúÁÉÍÓÚñÑüÜ¿¡«»—–…“”‘’·€ºª0123456789';
const DE_LAS_FICHAS = '→−≥ηρ';

const huella = (ruta: URL): string => createHash('sha256').update(readFileSync(ruta)).digest('hex');

describe('las fuentes autoalojadas', () => {
  test('1 · las cuatro caras de la web y las cinco del PDF, y ninguna más, cada familia con su OFL.txt, y por debajo de su umbral', (t) => {
    const familias = readdirSync(FUENTES, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    assert.deepEqual(familias, Object.keys(COPYRIGHT).sort(), 'las carpetas de web/public/fuentes/');
    const woff2 = familias.flatMap((f) => readdirSync(new URL(`${f}/`, FUENTES)).filter((n) => n.endsWith('.woff2')).map((n) => `${f}/${n}`)).sort();
    assert.deepEqual(woff2, CARAS.map((c) => c.ruta).sort(), 'los woff2');
    const woff = familias.flatMap((f) => readdirSync(new URL(`${f}/`, FUENTES)).filter((n) => n.endsWith('.woff')).map((n) => `${f}/${n}`)).sort();
    assert.deepEqual(woff, CARAS_DEL_PDF.map((c) => c.ruta).sort(), 'los woff del PDF');
    for (const familia of familias) {
      const ofl = readFileSync(new URL(`${familia}/OFL.txt`, FUENTES), 'utf8');
      assert.ok(ofl.startsWith(COPYRIGHT[familia]!), `${familia}/OFL.txt empieza por su copyright`);
      assert.match(ofl, /SIL OPEN FONT LICENSE Version 1\.1 - 26 February 2007/, `${familia}/OFL.txt es la OFL 1.1`);
    }
    for (const { ruta, umbral } of [...CARAS, ...CARAS_DEL_PDF]) {
      const bytes = statSync(new URL(ruta, FUENTES)).size;
      t.diagnostic(`${ruta}: ${bytes} bytes (umbral ${umbral})`);
      assert.ok(bytes < umbral, `${ruta} pesa ${bytes} bytes; el umbral es ${umbral}`);
    }
  });

  test('2 · cada cara tiene los glifos de la prueba; Literata, también los signos de las fichas', () => {
    for (const { ruta, fichas } of CARAS) {
      const codigos = codigosDeCmap(tablasDeWoff2(readFileSync(new URL(ruta, FUENTES))).get('cmap')!);
      const faltan = [...PRUEBA, ...(fichas ? DE_LAS_FICHAS : '')].filter((c) => !codigos.has(c.codePointAt(0)!));
      assert.deepEqual(faltan, [], `${ruta}: glifos que faltan`);
    }
  });

  test('3 · THIRD-PARTY-NOTICES § 2.4: una fila por cara (las de la web y las del PDF) con su huella sha256, y cada fila su fichero', () => {
    const notices = readFileSync(NOTICES, 'utf8');
    const seccion = /^### 2\.4 · [^\n]*\n([\s\S]*?)(?=^#{2,3} |(?![\s\S]))/m.exec(notices)?.[1] ?? '';
    assert.ok(seccion !== '', 'el NOTICES no tiene § 2.4');
    const filas = [...seccion.matchAll(/^\| `([^`]+\.woff2?)` \|.*\| `([0-9a-f]{64})` \|$/gm)].map((m) => [m[1]!, m[2]!]);
    assert.deepEqual(
      filas.map(([n]) => n).sort(),
      [...CARAS, ...CARAS_DEL_PDF].map((c) => c.ruta.split('/')[1]!).sort(),
      'las filas de § 2.4 frente a los woff2 y los woff',
    );
    for (const { ruta } of [...CARAS, ...CARAS_DEL_PDF]) {
      const fila = filas.find(([n]) => n === ruta.split('/')[1]);
      assert.equal(fila?.[1], huella(new URL(ruta, FUENTES)), `la huella de ${ruta} en § 2.4`);
    }
  });

  test('4 · dist/ lleva las caras (también las del PDF) y el CSS construido pide las de la web a ficheros que existen (swap en Atkinson, fallback en Literata)', () => {
    construir();
    const paginas = ['index.html', 'reglas/index.html'].map((p) => readFileSync(new URL(p, DIST), 'utf8'));
    const hojas = readdirSync(new URL('_astro/', DIST)).filter((n) => n.endsWith('.css')).map((n) => readFileSync(new URL(`_astro/${n}`, DIST), 'utf8'));
    const reglas = [...[...paginas, ...hojas].join('\n').matchAll(/@font-face\{([^}]*)\}/g)].map((m) => m[1]!);
    const declaradas = new Map(reglas.map((r) => [/url\(([^)]+)\)/.exec(r)?.[1] ?? '', r]));
    assert.deepEqual([...declaradas.keys()].sort(), CARAS.map((c) => `/fuentes/${c.ruta}`).sort(), 'las url() de los @font-face');
    for (const [url, regla] of declaradas) {
      assert.ok(existsSync(new URL(`.${url}`, DIST)), `${url} no está en dist/`);
      assert.match(regla, url.includes('atkinson') ? /font-display:swap/ : /font-display:fallback/, `font-display de ${url}`);
    }
    for (const familia of Object.keys(COPYRIGHT)) assert.ok(existsSync(new URL(`fuentes/${familia}/OFL.txt`, DIST)), `dist/fuentes/${familia}/OFL.txt`);
    for (const { ruta } of CARAS_DEL_PDF) assert.ok(existsSync(new URL(`fuentes/${ruta}`, DIST)), `dist/fuentes/${ruta}`);
  });

  test('6 · las caras del PDF son las de la web: de su woff2, con su recorte, su familia, su peso, su estilo y su nombre PostScript, y estáticas', () => {
    for (const cara of CARAS_DEL_PDF) {
      const pdf = tablasDeWoff(readFileSync(new URL(cara.ruta, FUENTES)));
      const web = tablasDeWoff2(readFileSync(new URL(cara.de, FUENTES)));
      const [delPdf, deLaWeb] = [caraDe(pdf), caraDe(web)];
      assert.deepEqual(delPdf, { postscript: cara.postscript, familia: deLaWeb.familia, peso: cara.peso, italica: cara.italica, variable: false }, `${cara.ruta}: su cara`);
      // La de la web, con el mismo estilo y, salvo la de Atkinson (la variable, que lleva los dos pesos), el mismo peso.
      assert.equal(deLaWeb.italica, cara.italica, `${cara.de}: el estilo`);
      if (!deLaWeb.variable || !cara.de.startsWith('atkinson')) assert.equal(deLaWeb.peso, cara.peso, `${cara.de}: el peso`);
      const codigos = (tablas: Map<string, Buffer>): number[] => [...codigosDeCmap(tablas.get('cmap')!)].sort((a, b) => a - b);
      assert.deepEqual(codigos(pdf), codigos(web), `${cara.ruta}: el recorte de ${cara.de}`);
    }
  });

  describe('en Chrome, sobre astro preview', () => {
    let sesion: AnalizadorConTestigos | undefined;
    after(async () => {
      await sesion?.cerrar();
    });

    test('5 · la interfaz, en Atkinson Hyperlegible Next, y el cuadro de texto, en Literata, con las dos caras cargadas', async () => {
      sesion = await abrirAnalizadorConTestigos();
      const visto = await sesion.pestana.evaluar<{ cuerpo: string; cuadro: string; cargadas: string[] }>(`document.fonts.ready.then(() => ({
        cuerpo: getComputedStyle(document.body).fontFamily,
        cuadro: getComputedStyle(document.getElementById('texto')).fontFamily,
        cargadas: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '') + ' ' + f.weight + ' ' + f.style).sort(),
      }))`);
      assert.match(visto.cuerpo, /^"?Atkinson Hyperlegible Next"?,/, 'la familia de la interfaz');
      assert.match(visto.cuadro, /^"?Literata"?,/, 'la familia del cuadro de texto');
      assert.ok(visto.cargadas.includes('Atkinson Hyperlegible Next 400 700 normal'), visto.cargadas.join(' · '));
      assert.ok(visto.cargadas.includes('Literata 400 normal'), visto.cargadas.join(' · '));
    });
  });
});
