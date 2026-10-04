/**
 * Los iconos de la web desde los SVG que eligió Antonio (encargo 10.4, Tanda
 * 1; DISEÑO §8; docs/figma/icono/PROCEDENCIA.md). Se ejecuta a mano, desde
 * web/, cuando cambie un SVG: `node scripts/iconos.ts`. Los ficheros que
 * escribe se versionan; los juzga jueces/iconos.spec.ts. Necesita Chrome
 * (jueces/chrome.ts), que rasteriza los SVG.
 *
 * Escribe en web/public/:
 *   · icon.svg — icono-a.svg tal cual (favicon vectorial).
 *   · icono-c.svg — icono-c.svg tal cual (la cabecera).
 *   · favicon.ico — el icono (a) a 32 × 32, en el formato documentado del
 *     ICO: un ICONDIR, un ICONDIRENTRY y la imagen como DIB de 32 bits con
 *     su máscara AND (transparente donde el alfa es 0).
 *   · apple-touch-icon.png (180) e icon-512-maskable.png (512) — el icono
 *     (a) a sangre: el mismo dibujo sin el radio de las esquinas, con el
 *     fondo #1A1A1A hasta el borde. El dibujo queda dentro del círculo de 409
 *     (PROCEDENCIA.md), así que sobra margen para la máscara de Android y el
 *     redondeo de iOS.
 *   · icon-192.png e icon-512.png — el icono (a) tal cual, esquinas
 *     transparentes.
 *   · site.webmanifest — nombre, idioma, colores (los tokens accent y bg) y
 *     los tres iconos.
 * Y escribe en la salida la huella sha256 de cada fichero, para
 * PROCEDENCIA.md.
 *
 * [DOC] https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
 *    — «all you need is just five icons and one JSON file»: favicon.ico de
 *    32, icon.svg, apple-touch-icon.png de 180 (mejor «20px padding around
 *    the icon and add some background color») y el manifiesto con 192, 512
 *    «maskable» y 512; la zona segura, «a 409×409 circle».
 * [DOC] https://learn.microsoft.com/en-us/previous-versions/ms997538(v=msdn.10)
 *    — ICONDIR (idReserved 0, idType «1 for icons», idCount), ICONDIRENTRY
 *    (bWidth, bHeight, bColorCount «0 if >=8bpp», bReserved, wPlanes,
 *    wBitCount, dwBytesInRes, dwImageOffset) y la imagen: un
 *    BITMAPINFOHEADER («Only the following members are used: biSize,
 *    biWidth, biHeight, biPlanes, biBitCount, biSizeImage. All other members
 *    must be 0»; biHeight, «the combined height of the XOR and AND masks»),
 *    los bits de color (XOR) y la máscara AND de 1 bit.
 * [DOC] https://github.com/ChromeDevTools/devtools-protocol (json/
 *    browser_protocol.json) — Page.captureScreenshot: «Capture page
 *    screenshot», con clip; Emulation.setDefaultBackgroundColorOverride:
 *    «Sets or clears an override of the default background color of the
 *    frame»; Emulation.setDeviceMetricsOverride: width, height y
 *    deviceScaleFactor.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons
 *    — «If src is relative, the path is resolved relative to the manifest
 *    file's URL»; sizes, type y purpose (sin él, «any»; «maskable», con la
 *    zona segura en cuenta). Y …/Reference/start_url: relativo, «resolved
 *    against the manifest file's URL»; «You can set "start_url": "./" to use
 *    the default behavior on all browsers». Con rutas relativas, el
 *    manifiesto sirve con cualquier base.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { abrirChrome } from '../jueces/chrome.ts';

const ICONO = new URL('../../docs/figma/icono/', import.meta.url);
const PUBLICO = new URL('../public/', import.meta.url);
const TOKENS = new URL('../../docs/figma/tokens.json', import.meta.url);

const iconoA = readFileSync(new URL('icono-a.svg', ICONO), 'utf8');
const iconoC = readFileSync(new URL('icono-c.svg', ICONO), 'utf8');
const CUADRADO = '<rect width="512" height="512" rx="96" fill="#1A1A1A"/>';
if (iconoA.split(CUADRADO).length !== 2) throw new Error('icono-a.svg ya no empieza por su cuadrado de radio 96: revisa la variante a sangre');
const aSangre = iconoA.replace(CUADRADO, '<rect width="512" height="512" fill="#1A1A1A"/>');

const tokens = JSON.parse(readFileSync(TOKENS, 'utf8')) as { color: Record<string, { $value: { hex: string } }> };

const pestana = await abrirChrome();
try {
  await pestana.cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  /** Pinta el SVG a `lado` × `lado` px en una página vacía y sin fondo. */
  const pintar = async (svg: string, lado: number): Promise<void> => {
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: lado, height: lado, deviceScaleFactor: 1, mobile: false });
    const datos = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    await pestana.evaluar(`(async () => {
      document.documentElement.style.margin = '0';
      document.body.style.margin = '0';
      const img = new Image(${lado}, ${lado});
      img.style.display = 'block';
      img.src = ${JSON.stringify(datos)};
      document.body.replaceChildren(img);
      await img.decode();
    })()`);
  };
  const png = async (svg: string, lado: number): Promise<Buffer> => {
    await pintar(svg, lado);
    const { data } = (await pestana.cdp('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: lado, height: lado, scale: 1 } })) as { data: string };
    return Buffer.from(data, 'base64');
  };
  /** Los píxeles RGBA del SVG a `lado` × `lado`, de arriba abajo, leídos de un canvas. */
  const rgba = async (svg: string, lado: number): Promise<Uint8Array> => {
    await pintar(svg, lado);
    const valores = await pestana.evaluar<number[]>(`(() => {
      const c = document.createElement('canvas');
      c.width = ${lado};
      c.height = ${lado};
      const g = c.getContext('2d');
      g.drawImage(document.querySelector('img'), 0, 0, ${lado}, ${lado});
      return Array.from(g.getImageData(0, 0, ${lado}, ${lado}).data);
    })()`);
    return Uint8Array.from(valores);
  };

  /** Un .ico con una sola imagen de `lado` × `lado`, DIB de 32 bits (BGRA, de abajo arriba) y máscara AND. */
  const ico = (pixeles: Uint8Array, lado: number): Buffer => {
    const filaMascara = Math.ceil(lado / 32) * 4;
    const color = lado * lado * 4;
    const mascara = filaMascara * lado;
    const imagen = Buffer.alloc(40 + color + mascara);
    imagen.writeUInt32LE(40, 0); // biSize
    imagen.writeInt32LE(lado, 4); // biWidth
    imagen.writeInt32LE(lado * 2, 8); // biHeight: XOR + AND
    imagen.writeUInt16LE(1, 12); // biPlanes
    imagen.writeUInt16LE(32, 14); // biBitCount
    imagen.writeUInt32LE(color + mascara, 20); // biSizeImage; el resto, 0
    for (let y = 0; y < lado; y++) {
      const fila = lado - 1 - y; // de abajo arriba
      for (let x = 0; x < lado; x++) {
        const o = (y * lado + x) * 4;
        const d = 40 + (fila * lado + x) * 4;
        imagen[d] = pixeles[o + 2]!;
        imagen[d + 1] = pixeles[o + 1]!;
        imagen[d + 2] = pixeles[o]!;
        imagen[d + 3] = pixeles[o + 3]!;
        if (pixeles[o + 3] === 0) imagen[40 + color + fila * filaMascara + (x >> 3)]! |= 0x80 >> (x & 7);
      }
    }
    const cabecera = Buffer.alloc(6 + 16);
    cabecera.writeUInt16LE(0, 0); // idReserved
    cabecera.writeUInt16LE(1, 2); // idType: icono
    cabecera.writeUInt16LE(1, 4); // idCount
    cabecera.writeUInt8(lado, 6); // bWidth
    cabecera.writeUInt8(lado, 7); // bHeight
    cabecera.writeUInt8(0, 8); // bColorCount: 0 con 8 bits o más
    cabecera.writeUInt8(0, 9); // bReserved
    cabecera.writeUInt16LE(1, 10); // wPlanes
    cabecera.writeUInt16LE(32, 12); // wBitCount
    cabecera.writeUInt32LE(imagen.length, 14); // dwBytesInRes
    cabecera.writeUInt32LE(cabecera.length, 18); // dwImageOffset
    return Buffer.concat([cabecera, imagen]);
  };

  const manifiesto = {
    name: 'RadiografIA',
    short_name: 'RadiografIA',
    lang: 'es',
    start_url: './',
    display: 'standalone',
    theme_color: tokens.color['accent']!.$value.hex.toUpperCase(),
    background_color: tokens.color['bg']!.$value.hex.toUpperCase(),
    icons: [
      { src: 'icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: 'icon-512-maskable.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
      { src: 'icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
  };

  const salida: [string, Buffer][] = [
    ['icon.svg', Buffer.from(iconoA)],
    ['icono-c.svg', Buffer.from(iconoC)],
    ['favicon.ico', ico(await rgba(iconoA, 32), 32)],
    ['apple-touch-icon.png', await png(aSangre, 180)],
    ['icon-192.png', await png(iconoA, 192)],
    ['icon-512.png', await png(iconoA, 512)],
    ['icon-512-maskable.png', await png(aSangre, 512)],
    ['site.webmanifest', Buffer.from(`${JSON.stringify(manifiesto, null, 2)}\n`)],
  ];
  for (const [nombre, bytes] of salida) {
    writeFileSync(new URL(nombre, PUBLICO), bytes);
    console.log(`${nombre} · ${bytes.length} bytes · sha256 ${createHash('sha256').update(bytes).digest('hex')}`);
  }
} finally {
  await pestana.cerrar();
}
