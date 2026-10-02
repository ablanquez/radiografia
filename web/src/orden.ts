/**
 * El orden en que la web presenta paquetes, familias, reglas y géneros (cierre
 * del 7.1, firmado por Antonio; [PROPIO]): una sola función, enOrden, para el
 * índice del catálogo y sus casillas, el selector de género, la leyenda y el
 * desglose del analizador. No cambia los paquetes ni el motor: solo el orden
 * en que se enseña lo que ya hay.
 *
 *   · Paquetes: como los carga el analizador (FICHEROS, cargar.ts):
 *     RadiografIA y después Español correcto.
 *   · Familias: alfabéticas por su nombre visible, dentro de su paquete.
 *   · Reglas: alfabéticas por su nombre, dentro de su familia.
 *   · Géneros: «General» primero, que es el de por defecto, y el resto
 *     alfabético por su nombre visible.
 *   · Detectores, alfabéticos. La severidad no: baja → media → alta es una
 *     escala (catalogo.ts, SEVERIDADES).
 *   · El panel de un tramo no se ordena: enseña las reglas que lo señalan en
 *     el orden de sus señales.
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
 *    — localeCompare con el locale «es», para que las tildes y la eñe ordenen
 *    como en español («Árbol» junto a «árbol» y antes de «Nube»; «Ñu» después
 *    de «Nube»), y no por su código Unicode, que las manda detrás de la «z».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 *    — el orden de sort es estable: lo que empata se queda como estaba.
 */

/** Las claves de un elemento, de la que más manda a la que menos: números (la posición del paquete) o textos (nombres visibles). */
export type ClaveDeOrden = readonly (number | string)[];

function comparar(a: ClaveDeOrden, b: ClaveDeOrden): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    if (x === undefined || y === undefined) return x === undefined ? (y === undefined ? 0 : -1) : 1;
    const orden = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es');
    if (orden !== 0) return orden;
  }
  return 0;
}

/** Una copia de la lista, ordenada por las claves de cada elemento. La lista de entrada no cambia. */
export function enOrden<T>(lista: readonly T[], clave: (elemento: T) => ClaveDeOrden): T[] {
  return [...lista].sort((a, b) => comparar(clave(a), clave(b)));
}
