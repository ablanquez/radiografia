/**
 * La escala del medidor (encargo 5.6; decisión de Antonio del 01/10): dónde
 * queda el total de un paquete respecto a los textos HUMANOS del mismo género
 * y tramo, con las celdas de su clave `_total-*` en cabecera.calibracion
 * (para RadiografIA, `_total-radiografia`: metricas/nombres.ts). Cuatro
 * bandas, sin tope ni veredicto (la interfaz las pinta en el punto 6):
 *
 *   «por debajo de la mediana» · «entre la mediana y el p95» ·
 *   «por encima del p95» · «por encima del p99»
 *
 * Devuelve la banda con los percentiles de referencia (p5, p50, p95, p99) y
 * n, o «sin calibración» con su motivo: el texto es insuficiente (sin total
 * ni tramo), el paquete no trae clave `_total-*`, o no hay celda para ese
 * género y tramo (la narrativa clásica de 100 a 299 palabras, por ejemplo).
 *
 * [PROPIO] Los bordes: «por encima» es estrictamente por encima, como en
 *    percentil.ts («fuera = estrictamente»; en el borde, dentro), y «por
 *    debajo de la mediana», estrictamente por debajo. La mediana y el p95
 *    caen «entre la mediana y el p95», y el p99, «por encima del p95».
 *    ⚠️ En las celdas con la mediana en 0 (la mitad de los humanos de ese
 *    género y tramo no da ninguna señal: noticia, administrativo y opinión
 *    de 100 a 299, entre otras), un texto sin señales cae «entre la
 *    mediana y el p95»: está en la mediana. Cómo se dice en pantalla, punto 6.
 * [PROPIO] Un paquete con dos claves `_total-*` no tiene una escala sino dos:
 *    para. El validador (validar.ts) solo admite `_total-radiografia`.
 */
import type { Calibracion, TramoDeCalibracion } from './paquete.ts';

export type Banda = 'por debajo de la mediana' | 'entre la mediana y el p95' | 'por encima del p95' | 'por encima del p99';

export interface BandaHumana {
  banda: Banda;
  /** La clave `_total-*` de cabecera.calibracion de la que salen los percentiles. */
  clave: string;
  p5: number;
  p50: number;
  p95: number;
  p99: number;
  n: number;
}

export interface SinBanda {
  banda: 'sin calibración';
  motivo: string;
}

/** Las claves `_total-*` de una calibración. */
export function clavesDeTotal(calibracion: Calibracion | undefined): string[] {
  return Object.keys(calibracion ?? {}).filter((k) => k.startsWith('_total-'));
}

export function bandaHumana(total: number | null, genero: string, tramo: TramoDeCalibracion | null, calibracion: Calibracion | undefined): BandaHumana | SinBanda {
  const claves = clavesDeTotal(calibracion);
  if (claves.length > 1) throw new Error(`la calibración trae ${claves.length} claves «_total-*» (${claves.join(', ')}): una escala por paquete`);
  if (total === null || tramo === null) return { banda: 'sin calibración', motivo: 'texto insuficiente: sin total ni tramo de calibración (menos de 100 palabras de prosa)' };
  const clave = claves[0];
  if (clave === undefined) return { banda: 'sin calibración', motivo: 'el paquete no trae ninguna clave «_total-*» en cabecera.calibracion' };
  const porGenero = calibracion![clave]!;
  const celda = Object.hasOwn(porGenero, genero) ? porGenero[genero]![tramo] : undefined;
  if (celda === undefined) return { banda: 'sin calibración', motivo: `sin calibración de «${clave}» para el género «${genero}», tramo «${tramo}»` };
  const banda: Banda =
    total > celda.p99 ? 'por encima del p99' : total > celda.p95 ? 'por encima del p95' : total >= celda.p50 ? 'entre la mediana y el p95' : 'por debajo de la mediana';
  return { banda, clave, p5: celda.p5, p50: celda.p50, p95: celda.p95, p99: celda.p99, n: celda.n };
}
