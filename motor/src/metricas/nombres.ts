/**
 * Los nombres del registro de métricas del motor (encargo 4.3): lo que una
 * regla estadística puede escribir en `parametros.metrica`, y la clave de
 * `cabecera.calibracion`. El paso 2 de validar.ts rechaza cualquier otro.
 *
 * Los nombres viven aparte de las funciones para que el validador no cargue
 * el código de las métricas. Cada nombre tiene su función en el registro
 * (`METRICAS`, metricas/index.ts), con su fórmula y su fuente en la cabecera
 * de su fichero.
 *
 * Fuera, con su motivo (encargo 4.3, suturas; decisión de Antonio en la
 * parada):
 *   · fernandez-huerta — la definición de F no está fijada por ninguna fuente
 *     a la vista: el original (Fernández Huerta 1959, Consigna 214, 29-32) no
 *     se pudo abrir; Ríos Hernández (2009) y Law (2011) dan «frases por cada
 *     100 palabras», y la transcripción de sintaxis.md § 8, «palabras por
 *     frase». No son la misma magnitud, y no se implementa de memoria.
 */
export const NOMBRES_DE_METRICAS = [
  'frases-por-100-palabras',
  'cv-longitud-frase',
  'ratio-comas-puntos',
  'puntuacion-por-1000',
  'parentesis-comillas-puntoycoma-por-1000',
  'ttr',
  'mattr-50',
  'mtld',
  'hdd-42',
  'seq-rep-4',
  'ifsz',
] as const;

export type NombreDeMetrica = (typeof NOMBRES_DE_METRICAS)[number];

export function esMetrica(nombre: string): nombre is NombreDeMetrica {
  return (NOMBRES_DE_METRICAS as readonly string[]).includes(nombre);
}
