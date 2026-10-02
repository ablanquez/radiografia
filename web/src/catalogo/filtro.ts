/**
 * El buscador y los filtros del índice del catálogo (encargo 7.1, b), sin DOM:
 * lo usan la página al construirse (el texto de búsqueda de cada fila, en un
 * data-*) y el script del navegador (buscador.ts), y lo juzga logica.spec.ts.
 *
 * [PROPIO] Búsqueda: cada palabra de la consulta tiene que estar en el texto
 *    de la fila (nombre, id y explicación), en cualquier orden. Los dos lados
 *    se pasan por paraBuscar: minúsculas y sin marcas diacríticas, para que
 *    «atribucion» encuentre «Atribución». Quita también la tilde de la ñ
 *    («espanol» encuentra «español»); para buscar, no estorba.
 * [PROPIO] Filtros: dentro de uno, vale cualquiera de los valores marcados;
 *    entre filtros, todos a la vez; un filtro sin nada marcado no filtra.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 *    — «NFD: Canonical Decomposition»: «é» se escribe como «e» y la marca
 *    U+0301, que la clase \p{M} (marcas) recoge con la bandera u.
 */

export const paraBuscar = (texto: string): string => texto.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es');

/** Una fila del índice: su texto de búsqueda (ya pasado por paraBuscar) y sus valores de familia, severidad y detector. */
export interface Fila {
  texto: string;
  familia: string;
  severidad: string;
  detector: string;
}

/** Lo que pide quien busca: la consulta tal cual la escribe y lo marcado en cada filtro. */
export interface Filtro {
  consulta: string;
  familias: ReadonlySet<string>;
  severidades: ReadonlySet<string>;
  detectores: ReadonlySet<string>;
}

export function coincide(fila: Fila, filtro: Filtro): boolean {
  const palabras = paraBuscar(filtro.consulta).split(/\s+/).filter((p) => p !== '');
  const dentro = (marcadas: ReadonlySet<string>, valor: string): boolean => marcadas.size === 0 || marcadas.has(valor);
  return (
    palabras.every((p) => fila.texto.includes(p)) &&
    dentro(filtro.familias, fila.familia) &&
    dentro(filtro.severidades, fila.severidad) &&
    dentro(filtro.detectores, fila.detector)
  );
}
