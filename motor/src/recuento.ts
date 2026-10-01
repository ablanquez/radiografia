/**
 * El recuento de las coincidencias de una regla de patrón o estructural
 * (encargo 5.3): minimoPorCoincidencia y minimo, EN ESE ORDEN. Un filtro sobre
 * las señales que el detector ya encontró: no las mueve ni las cambia, así que
 * cada una conserva su [inicio, fin) del original.
 *
 *   1. minimoPorCoincidencia — las coincidencias se agrupan por su FORMA (su
 *      [inicio, fin) en la copia de trabajo, con los saltos como espacio
 *      —encargo 6.1—, en minúsculas, sin blancos ni puntuación al principio o
 *      al final: «Además,», «además» y «ADEMÁS» son la misma) y solo quedan las
 *      de las formas que aparecen al menos ese número de veces en el texto.
 *      [PROPIO] Precedente: Vale, «repetition»
 *      (https://docs.vale.sh/checks/repetition), que señala un token repetido
 *      SEGUIDO («is is»); aquí cuenta la misma forma en cualquier punto.
 *   2. minimo — si quedan menos, la regla no señala ninguna. Con «ausencia»
 *      no filtra: es el umbral de la ausencia, y lo aplica
 *      detector-ausencia.ts sobre lo que queda del paso 1.
 *      [DOC] Precedente: Vale, «occurrence»
 *      (https://docs.vale.sh/checks/occurrence), «min» y «max».
 */
import type { Senal } from './detector-patron.ts';

export interface ParametrosDeRecuento {
  minimo?: number;
  minimoPorCoincidencia?: number;
  ausencia?: boolean;
}

/** La forma de una coincidencia [PROPIO]: en minúsculas, sin blancos ni puntuación (\p{P}) en los bordes. */
export function formaDeCoincidencia(fragmento: string): string {
  return fragmento.toLocaleLowerCase('es').replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '');
}

/**
 * Las coincidencias de las formas que aparecen al menos `n` veces, en el orden del texto. La forma sale del
 * texto de TRABAJO en [inicio, fin) (texto.ts, encargo 6.1): con el salto como espacio, «es importante
destacar»
 * y «es importante destacar» son la misma.
 */
export function porCoincidencia(senales: readonly Senal[], n: number, trabajo: string): Senal[] {
  const forma = (s: Senal) => formaDeCoincidencia(trabajo.slice(s.inicio, s.fin));
  const cuenta = new Map<string, number>();
  for (const s of senales) cuenta.set(forma(s), (cuenta.get(forma(s)) ?? 0) + 1);
  return senales.filter((s) => (cuenta.get(forma(s)) ?? 0) >= n);
}

/** Lo que queda de las coincidencias tras el recuento (pasos 1 y 2 de la cabecera). */
export function aplicarRecuento(senales: Senal[], p: ParametrosDeRecuento, trabajo: string): Senal[] {
  const quedan = p.minimoPorCoincidencia === undefined ? senales : porCoincidencia(senales, p.minimoPorCoincidencia, trabajo);
  if (p.ausencia !== true && p.minimo !== undefined && quedan.length < p.minimo) return [];
  return quedan;
}
