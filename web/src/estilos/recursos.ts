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
