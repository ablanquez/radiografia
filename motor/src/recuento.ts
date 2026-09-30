/**
 * El recuento de las coincidencias de una regla de patrón o estructural
 * (encargo 5.3): minimoPorCoincidencia y minimo, EN ESE ORDEN. Un filtro sobre
 * las señales que el detector ya encontró: no las mueve ni las cambia, así que
 * cada una conserva su [inicio, fin) del original.
 *
 *   1. minimoPorCoincidencia — las coincidencias se agrupan por su FORMA (el
 *      fragmento en minúsculas, sin blancos ni puntuación al principio o al
 *      final: «Además,», «además» y «ADEMÁS» son la misma) y solo quedan las
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

/** Las coincidencias de las formas que aparecen al menos `n` veces, en el orden del texto. */
export function porCoincidencia(senales: readonly Senal[], n: number): Senal[] {
  const cuenta = new Map<string, number>();
  for (const s of senales) {
    const forma = formaDeCoincidencia(s.fragmento);
    cuenta.set(forma, (cuenta.get(forma) ?? 0) + 1);
  }
  return senales.filter((s) => (cuenta.get(formaDeCoincidencia(s.fragmento)) ?? 0) >= n);
}

/** Lo que queda de las coincidencias tras el recuento (pasos 1 y 2 de la cabecera). */
export function aplicarRecuento(senales: Senal[], p: ParametrosDeRecuento): Senal[] {
  const quedan = p.minimoPorCoincidencia === undefined ? senales : porCoincidencia(senales, p.minimoPorCoincidencia);
  if (p.ausencia !== true && p.minimo !== undefined && quedan.length < p.minimo) return [];
  return quedan;
}
