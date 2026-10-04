/**
 * Los jueces del icono y del manifiesto (encargo 10.4, Tanda 1; DISEÑO §8):
 *
 *   1. En web/public/ están los derivados: icon.svg e icono-c.svg, byte a
 *      byte los SVG que eligió Antonio (docs/figma/icono/); los PNG con su
 *      tamaño (180, 192, 512 y 512 enmascarable, leído de su cabecera IHDR);
 *      y favicon.ico con una sola imagen de 32 × 32 a 32 bits, con su
 *      ICONDIR, su ICONDIRENTRY y su DIB coherentes.
 *   2. site.webmanifest es JSON válido con name, short_name, lang es,
 *      start_url, display standalone, theme_color #332288 y background_color
 *      #FFFFFF (los tokens accent y bg) y sus tres iconos, que existen y
 *      miden lo que dicen.
 *   3. Cada página construida enlaza favicon.ico (32x32), icon.svg
 *      (image/svg+xml), apple-touch-icon y el manifiesto, con la base; ya no
 *      lleva el data: del 6.2; y su cabecera lleva el icono (c) con alt vacío.
 *   4. PROCEDENCIA.md tiene la huella sha256 de cada derivado, y cada fila
 *      su fichero.
 *   5. En Chrome: el enmascarable y el apple-touch llegan al borde (esquina
 *      opaca, #1A1A1A), el 192 y el 512 tienen las esquinas transparentes, y
 *      favicon.ico se decodifica a 32 × 32.
 * La red (que la página no pida nada más que lo esperado) la mira el juez de
 * red, navegador.spec.ts.
 *
 * [DOC] https://www.w3.org/TR/png-3/#11IHDR — la firma «89 50 4E 47 0D 0A
 *    1A 0A» (§ 5.2); cada chunk, Length y Chunk Type de 4 bytes antes de sus
 *    datos (§ 5.3); «The IHDR chunk shall be the first chunk in the PNG
 *    datastream», con Width y Height de 4 bytes cada uno (§ 11.2.1).
 * [DOC] https://learn.microsoft.com/en-us/previous-versions/ms997538(v=msdn.10)
 *    — ICONDIR (idReserved 0, idType «1 for icons», idCount), ICONDIRENTRY
 *    y el BITMAPINFOHEADER de la imagen (biHeight, XOR más AND).
 * [DOC] https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
 *    — los cuatro enlaces y el manifiesto con 192, 512 «maskable» y 512.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { construir, decodificar, DIST } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos } from './chrome.ts';

const PUBLICO = new URL('../public/', import.meta.url);
const ICONO = new URL('../../docs/figma/icono/', import.meta.url);
const TOKENS = new URL('../../docs/figma/tokens.json', import.meta.url);

const PNG = { 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512, 'icon-512-maskable.png': 512 } as const;
const DERIVADOS = ['icon.svg', 'icono-c.svg', 'favicon.ico', ...Object.keys(PNG)];

const leer = (nombre: string): Buffer => readFileSync(new URL(nombre, PUBLICO));
/** Ancho y alto de un PNG, de su IHDR; lanza si no es un PNG. */
function ladoDePng(bytes: Buffer): [number, number] {
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'la firma de PNG');
  assert.equal(bytes.toString('latin1', 12, 16), 'IHDR', 'el primer chunk es IHDR');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe('el icono y el manifiesto', () => {
  test('1 · los derivados: los SVG byte a byte, los PNG con su tamaño y favicon.ico de 32 × 32 a 32 bits', () => {
    assert.ok(leer('icon.svg').equals(readFileSync(new URL('icono-a.svg', ICONO))), 'icon.svg es icono-a.svg');
    assert.ok(leer('icono-c.svg').equals(readFileSync(new URL('icono-c.svg', ICONO))), 'icono-c.svg es el de docs/figma/icono/');
    for (const [nombre, lado] of Object.entries(PNG)) assert.deepEqual(ladoDePng(leer(nombre)), [lado, lado], nombre);
    const ico = leer('favicon.ico');
    assert.deepEqual([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)], [0, 1, 1], 'ICONDIR: reservado 0, tipo 1 (icono), una imagen');
    assert.deepEqual([ico[6], ico[7], ico[8], ico.readUInt16LE(10), ico.readUInt16LE(12)], [32, 32, 0, 1, 32], 'ICONDIRENTRY: 32 × 32, 32 bits');
    const bytes = ico.readUInt32LE(14);
    const desde = ico.readUInt32LE(18);
    assert.equal(desde + bytes, ico.length, 'la imagen llega justo al final del fichero');
    assert.deepEqual([ico.readUInt32LE(desde), ico.readInt32LE(desde + 4), ico.readInt32LE(desde + 8), ico.readUInt16LE(desde + 14)], [40, 32, 64, 32], 'BITMAPINFOHEADER: 40 bytes, 32 de ancho, 64 de alto (XOR + AND), 32 bits');
  });

  test('2 · site.webmanifest: JSON válido con sus campos y sus tres iconos', () => {
    const manifiesto = JSON.parse(leer('site.webmanifest').toString('utf8')) as Record<string, unknown>;
    const tokens = JSON.parse(readFileSync(TOKENS, 'utf8')) as { color: Record<string, { $value: { hex: string } }> };
    const { icons, ...resto } = manifiesto;
    assert.deepEqual(resto, {
      name: 'RadiografIA',
      short_name: 'RadiografIA',
      lang: 'es',
      start_url: './',
      display: 'standalone',
      theme_color: '#332288',
      background_color: '#FFFFFF',
    });
    assert.equal(resto['theme_color'], tokens.color['accent']!.$value.hex.toUpperCase(), 'theme_color es el token accent');
    assert.equal(resto['background_color'], tokens.color['bg']!.$value.hex.toUpperCase(), 'background_color es el token bg');
    assert.deepEqual(icons, [
      { src: 'icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: 'icon-512-maskable.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
      { src: 'icon-512.png', type: 'image/png', sizes: '512x512' },
    ]);
    for (const { src, sizes } of icons as { src: string; sizes: string }[]) assert.equal(ladoDePng(leer(src)).join('x'), sizes, src);
  });

  test('3 · cada página enlaza el icono y el manifiesto con la base, sin el data: del 6.2, y lleva el icono (c) en la cabecera', () => {
    construir();
    for (const pagina of ['index.html', 'reglas/index.html', 'reglas/disc-marcador-repetido/index.html']) {
      const html = readFileSync(new URL(pagina, DIST), 'utf8');
      const enlaces = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).filter((l) => /rel="(icon|apple-touch-icon|manifest)"/.test(l));
      assert.deepEqual(
        enlaces.map((l) => [/rel="([^"]+)"/.exec(l)?.[1], decodificar(/href="([^"]+)"/.exec(l)?.[1] ?? ''), /sizes="([^"]+)"/.exec(l)?.[1] ?? null, /type="([^"]+)"/.exec(l)?.[1] ?? null]),
        [
          ['icon', '/favicon.ico', '32x32', null],
          ['icon', '/icon.svg', null, 'image/svg+xml'],
          ['apple-touch-icon', '/apple-touch-icon.png', null, null],
          ['manifest', '/site.webmanifest', null, null],
        ],
        `${pagina}: los enlaces del icono y del manifiesto`,
      );
      assert.ok(!/href="data:/.test(html), `${pagina}: todavía lleva un enlace data:`);
      const img = /<header>[\s\S]*?<img\b([^>]*)>/.exec(html)?.[1] ?? '';
      assert.match(img, /src="\/icono-c\.svg"/, `${pagina}: el icono (c) en la cabecera`);
      assert.match(img, /alt=""/, `${pagina}: con alt vacío`);
    }
    for (const nombre of [...DERIVADOS, 'site.webmanifest']) assert.ok(existsSync(new URL(nombre, DIST)), `dist/${nombre}`);
  });

  test('4 · PROCEDENCIA.md: la huella de cada derivado, y cada fila su fichero', () => {
    const procedencia = readFileSync(new URL('PROCEDENCIA.md', ICONO), 'utf8');
    const filas = new Map([...procedencia.matchAll(/^\| `([^`]+)` \|.*\| `([0-9a-f]{64})` \|$/gm)].map((m) => [m[1]!, m[2]!]));
    assert.deepEqual([...filas.keys()].sort(), [...DERIVADOS].sort(), 'las filas de PROCEDENCIA.md frente a los derivados');
    for (const nombre of DERIVADOS) assert.equal(filas.get(nombre), createHash('sha256').update(leer(nombre)).digest('hex'), `la huella de ${nombre}`);
  });

  describe('en Chrome, sobre astro preview', () => {
    let sesion: AnalizadorConTestigos | undefined;
    after(async () => {
      await sesion?.cerrar();
    });

    test('5 · el enmascarable y el apple-touch llegan al borde; el 192 y el 512, esquinas transparentes; favicon.ico se decodifica a 32 × 32', async () => {
      sesion = await abrirAnalizadorConTestigos();
      const visto = await sesion.pestana.evaluar<Record<string, { ancho: number; esquina: number[] }>>(`(async () => {
        const salida = {};
        for (const nombre of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'favicon.ico']) {
          const img = new Image();
          img.src = ${JSON.stringify(new URL(sesion.url).pathname)} + nombre;
          await img.decode();
          const c = document.createElement('canvas');
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const g = c.getContext('2d');
          g.drawImage(img, 0, 0);
          salida[nombre] = { ancho: img.naturalWidth, esquina: Array.from(g.getImageData(0, 0, 1, 1).data) };
        }
        return salida;
      })()`);
      assert.deepEqual(visto['apple-touch-icon.png']!.esquina, [26, 26, 26, 255], 'apple-touch, a sangre');
      assert.deepEqual(visto['icon-512-maskable.png']!.esquina, [26, 26, 26, 255], 'enmascarable, a sangre');
      assert.equal(visto['icon-192.png']!.esquina[3], 0, '192, esquina transparente');
      assert.equal(visto['icon-512.png']!.esquina[3], 0, '512, esquina transparente');
      assert.equal(visto['favicon.ico']!.ancho, 32, 'favicon.ico, 32 de ancho');
      assert.equal(visto['favicon.ico']!.esquina[3], 0, 'favicon.ico, esquina transparente');
    });
  });
});
