/**
 * El detector de ausencia (encargo 5.3): una regla de patrón o estructural con
 * `ausencia: true` no señala sus coincidencias; da UNA señal del texto entero
 * cuando las coincidencias que cuentan son menos que `minimo` (sin él, 1:
 * ninguna). «Las que cuentan» son las que el detector de su tipo encuentra en
 * los párrafos que la regla mira, tras minimoPorCoincidencia (recuento.ts).
 *
 * [DOC] Precedente: Vale, «occurrence» (https://docs.vale.sh/checks/occurrence)
 *    — «min makes absence a violation: a scope with fewer than min matches is
 *    flagged». [PROPIO] Aquí el ámbito es siempre el texto entero, y la señal
 *    no lleva desplazamientos: no hay dónde apuntar. Lleva el recuento.
 *
 * La señal es del texto entero, como la estadística (un tipo hermano de
 * Senal y de SenalTexto) y puntúa por presencia (puntuar.ts). Cuándo NO se
 * juzga una ausencia (texto «poco fiable», género fuera de `generos`) lo
 * decide analizar.ts, que es quien conoce el tramo y el género.
 */
import type { Texto } from './texto.ts';
import { detectarPatron, type ParametrosPatron } from './detector-patron.ts';
import { detectarEstructural, type ParametrosEstructural } from './detector-estructural.ts';

export type ReglaDeAusencia =
  | { id: string; detector: 'patrón'; parametros: ParametrosPatron }
  | { id: string; detector: 'estructural'; parametros: ParametrosEstructural };

export interface SenalAusencia {
  reglaId: string;
  ambito: 'texto';
  /** Cuántas coincidencias contaron (tras minimoPorCoincidencia). */
  coincidencias: number;
  /** Por debajo de cuántas se señala la ausencia. */
  minimo: number;
}

/** Si una señal de texto es de ausencia (y no estadística). */
export function esAusencia(s: object): s is SenalAusencia {
  return 'coincidencias' in s;
}

export function detectarAusencia(regla: ReglaDeAusencia, texto: Texto): SenalAusencia | null {
  if (regla.parametros.ausencia !== true) throw new Error(`regla «${regla.id}»: no es una regla de ausencia`);
  const coincidencias = regla.detector === 'patrón' ? detectarPatron(regla, texto) : detectarEstructural(regla, texto);
  const minimo = regla.parametros.minimo ?? 1;
  return coincidencias.length < minimo ? { reglaId: regla.id, ambito: 'texto', coincidencias: coincidencias.length, minimo } : null;
}
