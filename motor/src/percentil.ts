/**
 * El percentil con el que se calibra y la posición de un valor respecto a su
 * celda de calibración (encargo 4.3).
 *
 * [DOC] Hyndman, R. J. & Fan, Y. (1996), «Sample quantiles in statistical
 *    packages», American Statistician 50, 361–365, doi 10.2307/2684934: nueve
 *    definiciones de cuantil muestral que dan resultados distintos. Se fija
 *    el TIPO 7 para que la calibración del punto 5 y el motor calculen igual
 *    (cabecera.calibracion lleva «metodo: "hyndman-fan-7"»). Es el de R por
 *    defecto: https://rdocumentation.org/packages/stats/topics/quantile —
 *    «type = 7»; «p_k = (k - 1)/(n - 1)», interpolación lineal entre los
 *    valores ordenados. Con p en [0, 1] y los valores ordenados x₁ ≤ … ≤ xₙ:
 *      h = (n − 1) · p + 1
 *      Q(p) = x⌊h⌋ + (h − ⌊h⌋) · (x⌊h⌋+1 − x⌊h⌋)
 *
 * posicionRespectoACalibracion: la semántica del $comment de
 * parametrosEstadistico (regla.schema.json). Con «p95», la banda normal es
 * [p5, p95]; con «p99», [p1, p99]. «mayor» mira solo el borde de arriba,
 * «menor» solo el de abajo y «ambas» los dos. Fuera = ESTRICTAMENTE por
 * encima o por debajo del borde: en el borde, dentro.
 */
import type { Celda } from './paquete.ts';

export type Direccion = 'mayor' | 'menor' | 'ambas';
export type Percentil = 'p95' | 'p99';
export type Lado = 'arriba' | 'abajo';

export interface Posicion {
  fuera: boolean;
  lado: Lado | null;
  referencia: Celda;
}

export function percentil(valores: readonly number[], p: number): number {
  if (valores.length === 0) throw new Error('percentil: ningún valor');
  if (!(p >= 0 && p <= 1)) throw new Error(`percentil: p tiene que estar entre 0 y 1 (vale ${p})`);
  const x = [...valores].sort((a, b) => a - b);
  const h = (x.length - 1) * p + 1;
  const k = Math.floor(h);
  if (k >= x.length) return x[x.length - 1]!;
  return x[k - 1]! + (h - k) * (x[k]! - x[k - 1]!);
}

export function posicionRespectoACalibracion(valor: number, celda: Celda, direccion: Direccion, p: Percentil): Posicion {
  const arriba = p === 'p95' ? celda.p95 : celda.p99;
  const abajo = p === 'p95' ? celda.p5 : celda.p1;
  if (direccion !== 'menor' && valor > arriba) return { fuera: true, lado: 'arriba', referencia: celda };
  if (direccion !== 'mayor' && valor < abajo) return { fuera: true, lado: 'abajo', referencia: celda };
  return { fuera: false, lado: null, referencia: celda };
}
