/**
 * Las celdas de calibración de un género (encargo 5.5): por clave (métrica o
 * total) × tramo, los percentiles 1, 5, 50, 95 y 99 de los documentos de
 * CALIBRACIÓN, con la forma de `$defs/celda` de paquete.schema.json.
 *
 * [DOC] El percentil es el del motor (src/percentil.ts): tipo 7 de Hyndman &
 *    Fan (1996), el de R por defecto. Así la calibración y el motor calculan
 *    igual («metodo: "hyndman-fan-7"»).
 * [PROPIO, encargo 5.5] La celda solo existe con n ≥ 100 (MINIMO_POR_CELDA),
 *    y n cuenta los documentos de calibración del tramo con valor (una métrica
 *    que da null en un documento no suma). Una celda que no llega se declara
 *    en `omitidas`, no se rellena.
 * [PROPIO] Los percentiles se redondean a 6 decimales: la sexta cifra ya está
 *    muy por debajo de la resolución de cualquier métrica del registro, y el
 *    redondeo es monótono, así que p1 ≤ p5 ≤ p50 ≤ p95 ≤ p99 se conserva.
 */
import { percentil } from '../../src/percentil.ts';
import type { Celda, TramoDeCalibracion } from '../../src/paquete.ts';
import { TRAMOS, type Reparto } from './comun.ts';

export const MINIMO_POR_CELDA = 100;

/** Lo medido en un documento: su tramo, su reparto y el valor de cada clave (null si la métrica no se puede calcular). */
export interface Medida {
  id: string;
  tramo: TramoDeCalibracion;
  reparto: Reparto;
  valores: Readonly<Record<string, number | null>>;
}

export interface Omitida {
  clave: string;
  tramo: TramoDeCalibracion;
  n: number;
  motivo: string;
}

export interface Celdas {
  /** Documentos de calibración por tramo (con o sin valor en cada clave). */
  n: Record<TramoDeCalibracion, number>;
  celdas: Record<string, Partial<Record<TramoDeCalibracion, Celda>>>;
  omitidas: Omitida[];
}

const redondear = (x: number): number => Math.round(x * 1e6) / 1e6;

export function calcularCeldas(medidas: readonly Medida[], claves: readonly string[], meta: { corpus: string; fecha: string }): Celdas {
  const calibracion = medidas.filter((m) => m.reparto === 'calibracion');
  const n = Object.fromEntries(TRAMOS.map((t) => [t, calibracion.filter((m) => m.tramo === t).length])) as Record<TramoDeCalibracion, number>;
  const celdas: Celdas['celdas'] = {};
  const omitidas: Omitida[] = [];
  for (const clave of claves) {
    for (const tramo of TRAMOS) {
      const valores = calibracion
        .filter((m) => m.tramo === tramo)
        .map((m) => m.valores[clave])
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
      if (valores.length < MINIMO_POR_CELDA) {
        omitidas.push({ clave, tramo, n: valores.length, motivo: `n < ${MINIMO_POR_CELDA}` });
        continue;
      }
      (celdas[clave] ??= {})[tramo] = {
        p1: redondear(percentil(valores, 0.01)),
        p5: redondear(percentil(valores, 0.05)),
        p50: redondear(percentil(valores, 0.5)),
        p95: redondear(percentil(valores, 0.95)),
        p99: redondear(percentil(valores, 0.99)),
        n: valores.length,
        corpus: meta.corpus,
        fecha: meta.fecha,
        metodo: 'hyndman-fan-7',
      };
    }
  }
  return { n, celdas, omitidas };
}
