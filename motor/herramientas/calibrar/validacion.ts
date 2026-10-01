/**
 * La validación de RadiografIA con los textos humanos APARTADOS (encargo 5.6,
 * d; plan, punto 5: «validación con los textos humanos apartados (20 %): FPR
 * ≤ 5 %»). Lo usa validar.ts, que escribe data/calibracion/validacion.json;
 * lo juzga validacion.spec.ts.
 *
 *   · resumirCelda — una celda género × tramo de validación: n y los ids de
 *     sus documentos; la FPR de la familia estadística (proporción de
 *     documentos en los que disparan 2 o más reglas estadísticas que
 *     PUNTÚAN; encargo 5.6: «se marca solo con ≥ 2 métricas fuera» no va al
 *     motor, se cumple con la validación); la proporción con al menos una; la
 *     tasa de disparo de TODAS las reglas del paquete (en cuántos documentos
 *     da alguna señal cada una, puntúe o no); y el total del paquete en
 *     validación (p5, p50, p95, p99) frente a la celda de calibración.
 *   · comprobarReparto — el juez del reparto: cada documento de cada celda es
 *     de reparto «validacion» en el manifiesto de su género y de su tramo,
 *     están todos los de cada celda, y n cuadra. Nunca uno de calibración:
 *     sus percentiles salen de ellos, y medirlos aquí sería medir la FPR
 *     sobre los mismos textos con los que se fijó el corte.
 *
 * [DOC] Los percentiles, los del motor (src/percentil.ts): tipo 7 de Hyndman
 *    & Fan (1996), como la calibración (celdas.ts).
 * [PROPIO] Proporciones y percentiles, a 6 decimales, como celdas.ts.
 */
import type { Celda, TramoDeCalibracion } from '../../src/paquete.ts';
import { percentil } from '../../src/percentil.ts';
import type { Manifiesto } from './manifiesto.ts';

/** Lo que validar.ts guarda de cada documento analizado (sin texto). */
export interface DocumentoValidado {
  id: string;
  tramo: TramoDeCalibracion;
  /** puntuacion.total de RadiografIA con el género del corpus. */
  total: number;
  /** Las reglas que dieron alguna señal; una estadística informativa, solo si quedó fuera de su banda. */
  disparadas: string[];
}

/** Lo que el resumen necesita saber de cada regla del paquete, en su orden. */
export interface ReglaResumida {
  id: string;
  estadistica: boolean;
  /** Ni la regla ni su familia son informativas. */
  puntua: boolean;
}

export interface Proporcion {
  documentos: number;
  proporcion: number;
}

export interface CeldaDeValidacion {
  n: number;
  documentos: string[];
  /** 2 o más reglas estadísticas que puntúan. */
  fpr: Proporcion;
  /** 1 o más reglas estadísticas que puntúan. */
  alMenosUna: Proporcion;
  /** Todas las reglas del paquete, en su orden. */
  reglas: Record<string, Proporcion>;
  total: {
    validacion: { p5: number; p50: number; p95: number; p99: number };
    calibracion: { p5: number; p50: number; p95: number; p99: number; n: number };
  };
}

export interface FicheroDeValidacion {
  generos: Record<
    string,
    {
      celdas: Partial<Record<TramoDeCalibracion, CeldaDeValidacion>>;
      /** Los tramos sin celda de calibración del total: no se validan. */
      omitidas: { tramo: TramoDeCalibracion; motivo: string; n: number }[];
    }
  >;
}

const redondear = (x: number): number => Math.round(x * 1e6) / 1e6;
const proporcion = (k: number, n: number): Proporcion => ({ documentos: k, proporcion: redondear(k / n) });

export function resumirCelda(tramo: TramoDeCalibracion, documentos: readonly DocumentoValidado[], reglas: readonly ReglaResumida[], celda: Celda): CeldaDeValidacion {
  if (documentos.length === 0) throw new Error(`celda ${tramo}: ningún documento`);
  const conocidas = new Set(reglas.map((r) => r.id));
  const estadisticasQuePuntuan = new Set(reglas.filter((r) => r.estadistica && r.puntua).map((r) => r.id));
  for (const d of documentos) {
    if (d.tramo !== tramo) throw new Error(`${d.id}: es del tramo ${d.tramo} y la celda es de ${tramo}`);
    const ajena = d.disparadas.find((id) => !conocidas.has(id));
    if (ajena !== undefined) throw new Error(`${d.id}: la regla «${ajena}» no es del paquete`);
  }
  const n = documentos.length;
  const estadisticas = documentos.map((d) => new Set(d.disparadas.filter((id) => estadisticasQuePuntuan.has(id))).size);
  const totales = documentos.map((d) => d.total);
  const p = (q: number) => redondear(percentil(totales, q));
  return {
    n,
    documentos: documentos.map((d) => d.id).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    fpr: proporcion(estadisticas.filter((k) => k >= 2).length, n),
    alMenosUna: proporcion(estadisticas.filter((k) => k >= 1).length, n),
    reglas: Object.fromEntries(reglas.map((r) => [r.id, proporcion(documentos.filter((d) => d.disparadas.includes(r.id)).length, n)])),
    total: {
      validacion: { p5: p(0.05), p50: p(0.5), p95: p(0.95), p99: p(0.99) },
      calibracion: { p5: celda.p5, p50: celda.p50, p95: celda.p95, p99: celda.p99, n: celda.n },
    },
  };
}

export function comprobarReparto(fichero: FicheroDeValidacion, manifiestos: Readonly<Record<string, Manifiesto>>): string[] {
  const problemas: string[] = [];
  for (const [genero, { celdas }] of Object.entries(fichero.generos)) {
    const manifiesto = manifiestos[genero];
    if (manifiesto === undefined) {
      problemas.push(`${genero}: no hay manifiesto con que comprobar el reparto`);
      continue;
    }
    const porId = new Map(manifiesto.documentos.map((d) => [d.id, d]));
    for (const [tramo, celda] of Object.entries(celdas) as [TramoDeCalibracion, CeldaDeValidacion][]) {
      if (celda.n !== celda.documentos.length) problemas.push(`${genero} ${tramo}: n = ${celda.n} y la lista tiene ${celda.documentos.length} documentos`);
      const presentes = new Set(celda.documentos);
      for (const id of celda.documentos) {
        const d = porId.get(id);
        if (d === undefined) problemas.push(`${genero} ${tramo}: ${id} no está en el manifiesto`);
        else if (d.reparto !== 'validacion') problemas.push(`${genero} ${tramo}: ${id} es de reparto «${d.reparto ?? 'sin reparto'}» (calibracion no puede validar)`);
        else if (d.tramo !== tramo) problemas.push(`${genero} ${tramo}: ${id} es del tramo ${d.tramo}`);
      }
      for (const d of manifiesto.documentos) {
        if (d.reparto === 'validacion' && d.tramo === tramo && !presentes.has(d.id)) problemas.push(`${genero} ${tramo}: falta ${d.id}, de validación`);
      }
    }
  }
  return problemas;
}
