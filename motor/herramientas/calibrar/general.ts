/**
 * El género «general» (encargo 5.5): una mezcla estratificada y declarada de
 * los géneros calibrados. Sin red: lo juzga general.spec.ts.
 *
 * Regla (decisiones de Antonio: parada de narrativa, punto 8; parada 3, punto
 * 4), por tramo:
 *   · entran los géneros que TIENEN ese tramo calibrado (su celda existe: n de
 *     calibración ≥ mínimo); uno sin él no entra (narrativa en 100-299);
 *   · de cada uno, el mínimo común entre ellos de documentos de CALIBRACIÓN,
 *     los primeros en el orden de sha256("<semilla>|muestra|general|<género>|<id>");
 *   · la VALIDACIÓN, con la misma regla sobre los documentos de validación de
 *     esos mismos géneros;
 *   · la celda existe solo si la suma llega al mínimo; si no, el tramo no da
 *     documentos.
 * El reparto de cada documento es el de su género (sale de su id): un
 * documento de calibración de su género lo es de «general».
 */
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { TRAMOS, ordenDeMuestra, type Reparto } from './comun.ts';

export interface EntradaDeGenero {
  genero: string;
  /** Documentos de calibración por tramo, según su fichero de calibración. */
  calibracion: Record<TramoDeCalibracion, number>;
  documentos: readonly { id: string; tramo: TramoDeCalibracion | null; reparto?: Reparto }[];
}

export interface TramoDeGeneral {
  generos: string[];
  calibracionPorGenero: number;
  validacionPorGenero: number;
  calibracion: number;
  validacion: number;
  existe: boolean;
}

export interface Mezcla {
  tramos: Record<TramoDeCalibracion, TramoDeGeneral>;
  elegidos: { genero: string; id: string; tramo: TramoDeCalibracion; reparto: Reparto }[];
}

export function mezclar(entradas: readonly EntradaDeGenero[], minimo: number, semilla: string): Mezcla {
  const vistos = new Map<string, string>();
  for (const e of entradas) {
    for (const d of e.documentos) {
      const otro = vistos.get(d.id);
      if (otro !== undefined) throw new Error(`general: el id ${d.id} está dos veces (${otro} y ${e.genero})`);
      vistos.set(d.id, e.genero);
    }
  }
  const tramos = {} as Mezcla['tramos'];
  const elegidos: Mezcla['elegidos'] = [];
  for (const tramo of TRAMOS) {
    const dentro = entradas.filter((e) => e.calibracion[tramo] >= minimo);
    const de = (e: EntradaDeGenero, r: Reparto) => e.documentos.filter((d) => d.tramo === tramo && d.reparto === r);
    const k = dentro.length === 0 ? 0 : Math.min(...dentro.map((e) => de(e, 'calibracion').length));
    const v = dentro.length === 0 ? 0 : Math.min(...dentro.map((e) => de(e, 'validacion').length));
    const existe = dentro.length > 0 && k * dentro.length >= minimo;
    tramos[tramo] = {
      generos: dentro.map((e) => e.genero),
      calibracionPorGenero: k,
      validacionPorGenero: v,
      calibracion: k * dentro.length,
      validacion: v * dentro.length,
      existe,
    };
    if (!existe) continue;
    for (const e of dentro) {
      for (const [r, cuantos] of [['calibracion', k], ['validacion', v]] as const) {
        for (const d of ordenDeMuestra(semilla, de(e, r), (x) => `general|${e.genero}|${x.id}`).slice(0, cuantos)) {
          elegidos.push({ genero: e.genero, id: d.id, tramo, reparto: r });
        }
      }
    }
  }
  return { tramos, elegidos };
}
