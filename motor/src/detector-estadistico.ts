/**
 * El detector estadístico (encargo 4.3; punto 4 del plan: «texto entero
 * contra percentiles humanos por género × tramo de longitud, nunca umbral
 * absoluto»). Calcula la métrica de la regla (metricas/) y la sitúa respecto
 * a la celda de cabecera.calibracion de SU género y SU tramo, con la
 * dirección y el percentil de la regla (percentil.ts).
 *
 * Tres salidas [PROPIO: el encargo pedía `SenalTexto | null` y, aparte, que
 * el análisis listara «sin calibración» con su motivo; el motivo sale de
 * aquí]:
 *   · SenalTexto — la métrica queda fuera de la banda; o la regla es
 *     informativa y hay celda: entonces sale SIEMPRE, con lado null si queda
 *     dentro, porque es el contexto que se enseña (y no puntúa). Una regla de
 *     una familia informativa es informativa por fuerza (paso 2 de validar.ts).
 *   · SinCalibracion — no hay celda para (métrica, género, tramo), o la
 *     métrica no se puede calcular en este texto («no calculable»).
 *   · null — la métrica queda dentro de la banda y la regla puntúa: no hay
 *     señal.
 * Una señal estadística es del texto entero, una por texto: no tiene
 * desplazamientos (por eso es un tipo hermano de Senal, no una Senal) y
 * puntúa por presencia (puntuar.ts).
 * La regla «≥ 2 métricas fuera para marcar» (estadistica.md § 6) no es del
 * motor: se expresa con los pesos del paquete v1, en el punto 5.
 */
import type { Texto } from './texto.ts';
import type { Calibracion, Celda, ParametrosEstadistico, TramoDeCalibracion } from './paquete.ts';
import { METRICAS } from './metricas/index.ts';
import { esMetrica } from './metricas/nombres.ts';
import { posicionRespectoACalibracion, type Lado } from './percentil.ts';

export interface ReglaEstadistica {
  id: string;
  informativa: boolean;
  parametros: ParametrosEstadistico;
}

export interface SenalTexto {
  reglaId: string;
  ambito: 'texto';
  metrica: string;
  valor: number;
  referencia: Celda;
  /** Por dónde se sale de la banda; null si está dentro (solo en las informativas). */
  lado: Lado | null;
}

export interface SinCalibracion {
  reglaId: string;
  metrica: string;
  motivo: string;
}

/** La celda de (métrica, género, tramo), o undefined. Object.hasOwn: «constructor» es un nombre kebab-case válido. */
function celdaDe(calibracion: Calibracion | undefined, metrica: string, genero: string, tramo: TramoDeCalibracion): Celda | undefined {
  if (calibracion === undefined || !Object.hasOwn(calibracion, metrica)) return undefined;
  const porGenero = calibracion[metrica]!;
  if (!Object.hasOwn(porGenero, genero)) return undefined;
  const porTramo = porGenero[genero]!;
  return Object.hasOwn(porTramo, tramo) ? porTramo[tramo] : undefined;
}

export function detectarEstadistico(
  regla: ReglaEstadistica,
  texto: Texto,
  calibracion: Calibracion | undefined,
  genero: string,
  tramo: TramoDeCalibracion | null,
): SenalTexto | SinCalibracion | null {
  const { metrica, direccion, percentil } = regla.parametros;
  if (!esMetrica(metrica)) throw new Error(`regla «${regla.id}»: «${metrica}» no es una métrica del motor (el validador tenía que haberla parado)`);
  const celda = tramo === null ? undefined : celdaDe(calibracion, metrica, genero, tramo);
  if (celda === undefined) {
    const donde = tramo === null ? 'sin tramo: menos de 100 palabras de prosa' : `género «${genero}», tramo «${tramo}»`;
    return { reglaId: regla.id, metrica, motivo: `sin calibración para «${metrica}», ${donde}` };
  }
  const valor = METRICAS[metrica](texto);
  if (valor === null) return { reglaId: regla.id, metrica, motivo: `no calculable: «${metrica}» no tiene valor en este texto` };
  const { fuera, lado } = posicionRespectoACalibracion(valor, celda, direccion, percentil);
  if (!fuera && !regla.informativa) return null;
  return { reglaId: regla.id, ambito: 'texto', metrica, valor, referencia: celda, lado };
}
