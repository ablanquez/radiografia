/**
 * El registro de métricas del motor (encargo 4.3; trece desde el 5.5): nombre → función. Los
 * nombres son los de nombres.ts (los que acepta el validador); el tipo obliga
 * a que estén todos, y metricas/index.spec.ts a que no haya ninguno más.
 * Cada métrica lleva su fórmula, su fuente y su base de cálculo en la cabecera
 * de su fichero.
 */
import type { Metrica } from './base.ts';
import type { NombreDeMetrica } from './nombres.ts';
import { frasesPor100Palabras } from './frases-por-100-palabras.ts';
import { cvLongitudFrase } from './cv-longitud-frase.ts';
import { ratioComasPuntos } from './ratio-comas-puntos.ts';
import { puntuacionPor1000 } from './puntuacion-por-1000.ts';
import { puntuacionSecundariaPor1000 } from './puntuacion-secundaria-por-1000.ts';
import { ttr } from './ttr.ts';
import { mattr50 } from './mattr-50.ts';
import { mtld } from './mtld.ts';
import { hdd42 } from './hdd-42.ts';
import { seqRep4 } from './seq-rep-4.ts';
import { ifsz } from './ifsz.ts';
import { nominalizacionesPor1000 } from './nominalizaciones-por-1000.ts';
import { pronombresAnaforicosPor1000 } from './pronombres-anaforicos-por-1000.ts';

export type { Metrica } from './base.ts';

export const METRICAS: Readonly<Record<NombreDeMetrica, Metrica>> = {
  'frases-por-100-palabras': frasesPor100Palabras,
  'cv-longitud-frase': cvLongitudFrase,
  'ratio-comas-puntos': ratioComasPuntos,
  'puntuacion-por-1000': puntuacionPor1000,
  'puntuacion-secundaria-por-1000': puntuacionSecundariaPor1000,
  ttr,
  'mattr-50': mattr50,
  mtld,
  'hdd-42': hdd42,
  'seq-rep-4': seqRep4,
  ifsz,
  'nominalizaciones-por-1000': nominalizacionesPor1000,
  'pronombres-anaforicos-por-1000': pronombresAnaforicosPor1000,
};
