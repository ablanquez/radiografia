/**
 * Los ficheros estáticos que enlaza el <head> (encargo 10.4, Tanda 1), con su
 * ruta dentro de web/public/: los lee Recursos.astro y los juzga
 * fuentes.spec.ts.
 */

/** Las dos caras que se precargan: la de la interfaz y la del texto (las demás, cuando algo las pide). */
export const FUENTES_PRECARGADAS = [
  'fuentes/atkinson-hyperlegible-next/atkinson-hyperlegible-next.woff2',
  'fuentes/literata/literata-400.woff2',
] as const;
