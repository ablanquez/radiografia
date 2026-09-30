/**
 * De señales a medidor (encargo 4.2; punto 4 del plan: «normalizada por
 * longitud, con acumulación por familia; reglas informativas no suman;
 * atenuantes restan»).
 *
 * La normalización por longitud:
 * [DOC] Biber, Conrad & Reppen (1998), Corpus Linguistics, «Norming frequency
 *    counts», pp. 263-264,
 *    https://www.cambridge.org/core/books/corpus-linguistics/norming-frequency-counts/682CFF81127A07C8FB531FD59FE5677D
 *    — los recuentos brutos de textos de distinta longitud no son
 *    comparables: «the raw frequency count should be divided by the number
 *    of words in the text, and then multiplied by whatever basis is chosen
 *    for norming».
 * [DOC] pseudobibeR (CRAN), manual, argumento `normalize` de biber():
 *    https://cran.r-project.org/web/packages/pseudobibeR/pseudobibeR.pdf —
 *    «If TRUE, count features are normalized to the rate per 1,000 tokens».
 *    Base 1.000, y aquí las palabras son las de PROSA (umbral.ts).
 * [DOC, NO LEÍDO ENTERO] Liimatta, A. (2024), «Text length and short texts:
 *    An overview of the problem», en Challenges in Corpus Linguistics,
 *    Studies in Corpus Linguistics 118, John Benjamins,
 *    https://doi.org/10.1075/scl.118.07lii (ficha en
 *    https://researchportal.helsinki.fi/en/publications/text-length-and-short-texts-an-overview-of-the-problem/)
 *    — los textos cortos son difíciles de comparar porque en ellos cuesta
 *    calcular frecuencias con sentido (resumen del buscador; el capítulo no
 *    se abrió). Normalizar infla en textos cortos: por eso el tramo del
 *    umbral viaja con el resultado. El encargo lo atribuía a «Laippala»; la
 *    ficha de la Universidad de Helsinki da como autor a Aatu Liimatta.
 *
 * [PROPIO] La fórmula (sin precedente doctrinal: Vale y textlint no puntúan;
 *    los detectores comerciales dan una probabilidad, que es lo que aquí no
 *    se quiere):
 *   · Modo de cada regla: PRESENCIA si es estructural con posición
 *     «ultimo-parrafo» —una señal única por texto (hay cierre de plantilla o
 *     no) no se normaliza— o si es ESTADÍSTICA (4.3: su señal es del texto
 *     entero, una por texto, y la métrica ya está normalizada); DENSIDAD en
 *     todo lo demás.
 *   · Por regla, n = número de señales.
 *       densidad:  densidad = n × 1.000 / palabrasProsa;  contribución = peso × densidad.
 *       presencia: contribución = peso × (n > 0 ? 1 : 0).
 *     (n × 1.000 primero y luego la división: es la misma fórmula, y así 3
 *     señales en 500 palabras dan 6 exacto.) Peso negativo resta. Sin −0: un
 *     atenuante sin señales aporta 0.
 *   · Regla informativa, o de familia informativa: contribución 0, y sus
 *     señales van aparte, en `informativas`.
 *   · Familia: suma de las contribuciones de sus reglas. Paquete: suma de
 *     las familias que no son informativas.
 *   · Sin tope, sin escala, sin veredicto, puede ser negativo: el resultado
 *     son «puntos por 1.000 palabras de prosa», con su desglose.
 *   · Tramo «insuficiente»: no se puntúa (total null y motivo, sin desglose).
 *     «poco-fiable»: se puntúa, con aviso.
 * La escala del medidor, el tope y el signo se deciden en los puntos 5
 * (calibración) y 6 (interfaz), no aquí.
 */
import type { Senal } from './detector-patron.ts';
import type { SenalTexto } from './detector-estadistico.ts';
import type { ParametrosEstructural } from './detector-estructural.ts';
import type { Familia, Regla } from './paquete.ts';
import type { Texto } from './texto.ts';
import { COMPLETO, MINIMO, evaluarLongitud, type Tramo } from './umbral.ts';

export type Modo = 'densidad' | 'presencia';

/** Lo que puntuar lee de una regla. Una `Regla` de paquete.ts lo cumple. */
export type ReglaParaPuntuar = Pick<Regla, 'id' | 'familia' | 'peso' | 'informativa'> &
  (
    | { detector: 'estructural'; parametros: Pick<ParametrosEstructural, 'posicion'> }
    | { detector: 'patrón' | 'estadístico'; parametros: object }
  );

/** Lo que puntuar lee de un paquete. Un `Paquete` de paquete.ts lo cumple. */
export interface PaqueteParaPuntuar {
  cabecera: { familias: readonly Familia[] };
  reglas: readonly ReglaParaPuntuar[];
}

export interface PuntosDeRegla {
  id: string;
  informativa: boolean;
  n: number;
  modo: Modo;
  /** Señales por 1.000 palabras de prosa; null en modo presencia. */
  densidad: number | null;
  contribucion: number;
}

export interface PuntosDeFamilia {
  id: string;
  nombre: string;
  informativa: boolean;
  total: number;
  reglas: PuntosDeRegla[];
}

export interface Puntuacion {
  unidad: 'puntos por 1.000 palabras de prosa';
  palabrasProsa: number;
  tramo: Tramo;
  /** null si el texto es insuficiente: no se puntúa. */
  total: number | null;
  /** Por qué total es null; null si se puntúa. */
  motivo: string | null;
  /** La marca del tramo «poco-fiable»; null en los demás. */
  aviso: string | null;
  familias: PuntosDeFamilia[];
  /** Las señales de las reglas informativas: se enseñan, no suman. */
  informativas: (Senal | SenalTexto)[];
}

const UNIDAD = 'puntos por 1.000 palabras de prosa';

/** Sin −0: en JavaScript, −1 × 0 es −0, y un atenuante sin señales aporta 0. */
const sinMenosCero = (x: number): number => (x === 0 ? 0 : x);

function modoDe(regla: ReglaParaPuntuar): Modo {
  if (regla.detector === 'estadístico') return 'presencia';
  return regla.detector === 'estructural' && regla.parametros.posicion === 'ultimo-parrafo' ? 'presencia' : 'densidad';
}

export function puntuar(senales: readonly (Senal | SenalTexto)[], paquete: PaqueteParaPuntuar, texto: Texto): Puntuacion {
  const { palabrasProsa, tramo } = evaluarLongitud(texto);

  const cuenta = new Map<string, number>(paquete.reglas.map((r) => [r.id, 0]));
  for (const s of senales) {
    const n = cuenta.get(s.reglaId);
    if (n === undefined) throw new Error(`una señal de la regla "${s.reglaId}", que no está en el paquete`);
    cuenta.set(s.reglaId, n + 1);
  }

  if (tramo === 'insuficiente') {
    return {
      unidad: UNIDAD,
      palabrasProsa,
      tramo,
      total: null,
      motivo: `texto insuficiente: ${palabrasProsa} palabras de prosa; se puntúa desde ${MINIMO}`,
      aviso: null,
      familias: [],
      informativas: [],
    };
  }

  const informativaDe = new Map(paquete.cabecera.familias.map((f) => [f.id, f.informativa]));
  const noPuntua = (r: ReglaParaPuntuar): boolean => r.informativa || informativaDe.get(r.familia) === true;

  const familias = paquete.cabecera.familias.map((familia): PuntosDeFamilia => {
    const reglas = paquete.reglas
      .filter((r) => r.familia === familia.id)
      .map((r): PuntosDeRegla => {
        const n = cuenta.get(r.id) ?? 0;
        const modo = modoDe(r);
        const densidad = modo === 'densidad' ? (n * 1000) / palabrasProsa : null;
        const bruta = densidad === null ? r.peso * (n > 0 ? 1 : 0) : r.peso * densidad;
        return { id: r.id, informativa: noPuntua(r), n, modo, densidad, contribucion: noPuntua(r) ? 0 : sinMenosCero(bruta) };
      });
    const total = sinMenosCero(reglas.reduce((suma, r) => suma + r.contribucion, 0));
    return { id: familia.id, nombre: familia.nombre, informativa: familia.informativa, total, reglas };
  });

  const informativas = senales.filter((s) => {
    const r = paquete.reglas.find((x) => x.id === s.reglaId);
    return r !== undefined && noPuntua(r);
  });

  return {
    unidad: UNIDAD,
    palabrasProsa,
    tramo,
    total: sinMenosCero(familias.filter((f) => !f.informativa).reduce((suma, f) => suma + f.total, 0)),
    motivo: null,
    aviso: tramo === 'poco-fiable' ? `poco fiable: ${palabrasProsa} palabras de prosa; el análisis es completo desde ${COMPLETO}` : null,
    familias,
    informativas,
  };
}
