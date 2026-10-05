/**
 * Los ficheros estáticos que enlaza el <head> (encargo 10.4, Tanda 1), con su
 * ruta dentro de web/public/: los lee Recursos.astro y los juzgan
 * fuentes.spec.ts e iconos.spec.ts.
 */

/** Las dos caras que se precargan: la de la interfaz y la del texto (las demás, cuando algo las pide). */
export const FUENTES_PRECARGADAS = [
  'fuentes/atkinson-hyperlegible-next/atkinson-hyperlegible-next.woff2',
  'fuentes/literata/literata-400.woff2',
] as const;

/**
 * La negrita del papel (10.4, Tanda 4 bis; el marco «Informe / A4»): Literata
 * 600, la que pinta el modelo en los nombres de las reglas, en «Qué hacer» y en
 * las familias del desglose. 46 KB. Desde el 9.3 (punto 8, decisión de Antonio
 * del 05/10) no se precarga: la pide el analizador al pintar un resultado
 * (pantalla.ts, CARA_DE_LA_NEGRITA), y la esperan así los jueces de red
 * (jueces/chrome.ts, AL_PINTAR_UN_RESULTADO). De la Tanda 4 bis al 9.3, el
 * analizador la precargaba.
 */
export const NEGRITA_DEL_PAPEL = 'fuentes/literata/literata-600.woff2';

/** La negrita del papel como la pide document.fonts (el atajo de font de CSS: peso, cuerpo y familia; el cuerpo da igual). */
export const CARA_DE_LA_NEGRITA = '600 11pt Literata';

/**
 * Los enlaces del icono y del manifiesto, en el orden de Evil Martians (DISEÑO
 * §8): favicon.ico de 32, icon.svg, apple-touch-icon y el manifiesto. Los
 * escribe scripts/iconos.ts desde docs/figma/icono/.
 */
export const ENLACES_DE_ICONO = [
  { rel: 'icon', href: 'favicon.ico', sizes: '32x32' },
  { rel: 'icon', href: 'icon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' },
  { rel: 'manifest', href: 'site.webmanifest' },
] as const;

/** El icono (c) de la cabecera, junto al nombre (DISEÑO §8). */
export const ICONO_DE_CABECERA = 'icono-c.svg';
