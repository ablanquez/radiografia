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
 *   · el solapamiento de lemas entre frases adyacentes (D15; encargo 5.5):
 *     exige un lematizador, y el motor no lo tiene.
 *
 * Encargo 5.5: parentesis-comillas-puntoycoma-por-1000 pasa a llamarse
 * puntuacion-secundaria-por-1000 (P15 con dos puntos, barras, raya y comillas
 * curvas), y entran nominalizaciones-por-1000 (S5) y
 * pronombres-anaforicos-por-1000 (D16, contexto). Trece.
 */
export const NOMBRES_DE_METRICAS = [
  'frases-por-100-palabras',
  'cv-longitud-frase',
  'ratio-comas-puntos',
  'puntuacion-por-1000',
  'puntuacion-secundaria-por-1000',
  'ttr',
  'mattr-50',
  'mtld',
  'hdd-42',
  'seq-rep-4',
  'ifsz',
  'nominalizaciones-por-1000',
  'pronombres-anaforicos-por-1000',
] as const;

export type NombreDeMetrica = (typeof NOMBRES_DE_METRICAS)[number];

export function esMetrica(nombre: string): nombre is NombreDeMetrica {
  return (NOMBRES_DE_METRICAS as readonly string[]).includes(nombre);
}

/**
 * [PROPIO, encargo 5.5] El total del paquete RadiografIA en textos humanos:
 * una clave de `cabecera.calibracion` que NO es una métrica. El motor no la
 * calcula sobre el texto ni una regla puede pedirla (esMetrica la rechaza):
 * la calcula la herramienta de calibración (motor/herramientas/calibrar/)
 * con analizar(texto, [radiografia.json], { genero }) sobre cada documento
 * humano, tomando la `puntuacion.total` de RadiografIA, con el género del
 * corpus. Es la escala del medidor (bandaHumana, banda.ts; encargo 5.6): la
 * banda del total respecto a los humanos del mismo género y tramo. Desde el
 * 5.6 incluye las reglas estadísticas del paquete.
 */
export const CLAVE_TOTAL_RADIOGRAFIA = '_total-radiografia';

/** Las claves que puede llevar la calibración: las métricas y el total. */
export const CLAVES_DE_CALIBRACION = [...NOMBRES_DE_METRICAS, CLAVE_TOTAL_RADIOGRAFIA] as const;

export function esClaveDeCalibracion(nombre: string): boolean {
  return (CLAVES_DE_CALIBRACION as readonly string[]).includes(nombre);
}
