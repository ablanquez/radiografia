/**
 * La entrada del motor (encargos 4.2, 4.3 y 5.3; punto 4 del plan:
 * «combinación de varios paquetes con origen en cada señal»):
 * analizar(texto, paquetes, { genero }).
 *
 *   1. Valida cada paquete con validarPaquete (validar.ts). Si uno falla,
 *      lanza PaqueteInvalido con su nombre (cabecera.nombre, o su posición si
 *      no se puede leer) y sus mensajes, y no analiza nada. Y dos paquetes
 *      con el mismo cabecera.nombre son un error (encargo 4.3): el nombre es
 *      el origen de cada señal, y las de los dos no se distinguirían.
 *   2. Segmenta el texto UNA vez (texto.ts), mide su longitud y saca su tramo
 *      de calibración (umbral.ts).
 *   3. Por cada regla, antes de su detector, lo que decide si se evalúa
 *      (encargo 5.3) [PROPIO]:
 *        · `generos`: si la regla los trae y el género del análisis no está
 *          entre ellos, no se evalúa;
 *        · `ausencia` en un texto «poco fiable» (100-299 palabras de prosa):
 *          no se evalúa; la ausencia no se juzga en un texto corto
 *          (discurso.md § 11: ausencias en textos de más de 300 palabras).
 *      Las dos van a «noAplicadas», con el motivo.
 *   4. Aplica a cada regla el detector de su tipo: patrón y estructural
 *      (`detectar`) dan señales con desplazamientos; con `ausencia`,
 *      detector-ausencia.ts da una señal del texto entero; el estadístico
 *      (detector-estadistico.ts) mide el texto entero contra la celda de
 *      cabecera.calibracion de su métrica, del GÉNERO de entrada y del tramo
 *      del texto (encargo 4.3: género y tramo son entradas del análisis, no de
 *      la ficha). Sin género, «general» (GENERO_POR_DEFECTO, validar.ts).
 *   5. Puntúa cada paquete con SUS señales (puntuar.ts); las estadísticas y
 *      las de ausencia, por presencia.
 *   6. Devuelve, por paquete, su puntuación y su banda (banda.ts, encargo 5.6:
 *      el total respecto a los humanos del mismo género y tramo, con la clave
 *      `_total-*` de su calibración; null si el paquete no trae ninguna, y
 *      «sin calibración» con su motivo si no hay celda), y aparte, calificadas con
 *      { paquete: cabecera.nombre, reglaId }:
 *        · senales — las de patrón y estructural (con [inicio, fin));
 *        · senalesTexto — las del texto entero de las reglas que puntúan: las
 *          estadísticas que disparan y las ausencias (encargo 5.3);
 *        · contexto — las mismas de las reglas informativas (las estadísticas,
 *          siempre que haya celda, con su valor y su referencia; no puntúan);
 *        · sinCalibracion — las reglas estadísticas sin celda para (métrica,
 *          género, tramo) o con la métrica no calculable, con el motivo;
 *        · noAplicadas — las reglas que no se evaluaron (paso 3), con el motivo.
 *      El tipo Senal del 4.1 no cambia: SenalTexto (estadística) y
 *      SenalAusencia son tipos hermanos; `esAusencia` los distingue.
 *
 * Paquete → familia → regla, siempre: nunca se mezclan familias de dos
 * paquetes, aunque se llamen igual, y dos paquetes pueden tener una regla con
 * el mismo id (no es error: la señal lleva su paquete). Decisión del 29/09
 * (RADIOGRAFIA-ESTADO.md § 5: cargador; origen distinguible).
 *
 * Con el tramo «insuficiente» (menos de 100 palabras de prosa) no se aplica
 * ningún detector: la decisión firmada el 29/09 dice «no se analiza»
 * (docs/investigacion/estadistica.md § 5). Cada paquete sale con total null y
 * su motivo (puntuar.ts), y no hay señales de ninguna clase (ni noAplicadas:
 * no se evalúa ninguna).
 */
import { analizarTexto, type Texto } from './texto.ts';
import { COMPLETO, evaluarLongitud, tramoDeCalibracion, type Tramo } from './umbral.ts';
import { detectarPatron, type Senal } from './detector-patron.ts';
import { detectarEstructural } from './detector-estructural.ts';
import { detectarEstadistico, type SenalTexto, type SinCalibracion } from './detector-estadistico.ts';
import { detectarAusencia, type SenalAusencia } from './detector-ausencia.ts';
import { puntuar, type Puntuacion } from './puntuar.ts';
import { bandaHumana, clavesDeTotal, type BandaHumana, type SinBanda } from './banda.ts';
import { GENERO_POR_DEFECTO, validarPaquete, type ErrorDeValidacion } from './validar.ts';
import type { Paquete, Regla, TramoDeCalibracion } from './paquete.ts';

export interface SenalCalificada extends Senal {
  /** cabecera.nombre del paquete de la regla. */
  paquete: string;
}

/** Una señal del texto entero: estadística o de ausencia (`esAusencia`, detector-ausencia.ts). */
export type SenalTextoCalificada = (SenalTexto | SenalAusencia) & { paquete: string };

export interface SinCalibracionCalificada extends SinCalibracion {
  paquete: string;
}

/** Una regla que no se evaluó, y por qué (encargo 5.3). */
export interface NoAplicada {
  paquete: string;
  reglaId: string;
  motivo: string;
}

export interface ResultadoDePaquete {
  paquete: string;
  puntuacion: Puntuacion;
  /** La escala del medidor (banda.ts); null si el paquete no trae clave `_total-*` en su calibración. */
  banda: BandaHumana | SinBanda | null;
}

export interface Resultado {
  genero: string;
  palabrasProsa: number;
  tramo: Tramo;
  /** El tramo de cabecera.calibracion del texto; null si es insuficiente. */
  tramoDeCalibracion: TramoDeCalibracion | null;
  paquetes: ResultadoDePaquete[];
  senales: SenalCalificada[];
  senalesTexto: SenalTextoCalificada[];
  contexto: SenalTextoCalificada[];
  sinCalibracion: SinCalibracionCalificada[];
  noAplicadas: NoAplicada[];
}

export interface OpcionesDeAnalisis {
  /** El género del texto, para escoger la calibración y las reglas con `generos` (por defecto «general»). */
  genero?: string;
}

export class PaqueteInvalido extends Error {
  readonly paquete: string;
  readonly errores: ErrorDeValidacion[];

  constructor(paquete: string, errores: ErrorDeValidacion[]) {
    super(`el paquete «${paquete}» no es válido:\n${errores.map((e) => `  · ${e.texto}`).join('\n')}`);
    this.name = 'PaqueteInvalido';
    this.paquete = paquete;
    this.errores = errores;
  }
}

/**
 * El detector de patrón o estructural de una regla. También lo usa el juez
 * de los ejemplos (ejemplos.spec.ts). No van por aquí el estadístico, que
 * necesita la calibración, el género y el tramo del texto
 * (detectarEstadistico), ni las reglas de ausencia, que dan una señal del
 * texto entero (detectarAusencia) y no señales por coincidencia.
 */
export function detectar(regla: Regla, texto: Texto): Senal[] {
  if (regla.detector !== 'estadístico' && regla.parametros.ausencia === true) {
    throw new Error(`regla «${regla.id}»: una regla de ausencia se juzga sobre el texto entero (detectarAusencia), no por coincidencias`);
  }
  switch (regla.detector) {
    case 'patrón':
      return detectarPatron(regla, texto);
    case 'estructural':
      return detectarEstructural(regla, texto);
    case 'estadístico':
      throw new Error(`regla «${regla.id}»: el detector estadístico necesita la calibración, el género y el tramo del texto (detectarEstadistico)`);
  }
}

/** Por qué no se evalúa la regla con este género y este tramo (paso 3 de la cabecera), o null si se evalúa. */
function motivoParaNoAplicar(regla: Regla, genero: string, tramo: Tramo, palabrasProsa: number): string | null {
  if (regla.generos !== undefined && !regla.generos.includes(genero)) {
    const lista = regla.generos.map((g) => `«${g}»`).join(', ');
    return `solo se aplica ${regla.generos.length === 1 ? 'al género' : 'a los géneros'} ${lista}, y el análisis es de «${genero}»`;
  }
  if (regla.detector !== 'estadístico' && regla.parametros.ausencia === true && tramo === 'poco-fiable') {
    return `regla de ausencia: no se juzga en un texto poco fiable (${palabrasProsa} palabras de prosa; hacen falta ${COMPLETO})`;
  }
  return null;
}

/** cabecera.nombre si se puede leer; si no, la posición del paquete en la lista. */
function nombreDe(paquete: unknown, indice: number): string {
  const nombre = (paquete as { cabecera?: { nombre?: unknown } } | null)?.cabecera?.nombre;
  return typeof nombre === 'string' && nombre !== '' ? nombre : `paquetes[${indice}]`;
}

export function analizar(textoOriginal: string, paquetes: readonly Paquete[], opciones: OpcionesDeAnalisis = {}): Resultado {
  paquetes.forEach((paquete, indice) => {
    const { valido, errores } = validarPaquete(paquete);
    if (!valido) throw new PaqueteInvalido(nombreDe(paquete, indice), errores);
  });
  const primeraVez = new Map<string, number>();
  paquetes.forEach((paquete, indice) => {
    const anterior = primeraVez.get(paquete.cabecera.nombre);
    if (anterior !== undefined) {
      throw new Error(
        `dos paquetes se llaman «${paquete.cabecera.nombre}» (paquetes[${anterior}] y paquetes[${indice}]): las señales de los dos llevarían el mismo origen`,
      );
    }
    primeraVez.set(paquete.cabecera.nombre, indice);
  });

  const genero = opciones.genero ?? GENERO_POR_DEFECTO;
  const texto = analizarTexto(textoOriginal);
  const { palabrasProsa, tramo } = evaluarLongitud(texto);
  const tramoCal = tramoDeCalibracion(palabrasProsa);

  const senales: SenalCalificada[] = [];
  const senalesTexto: SenalTextoCalificada[] = [];
  const contexto: SenalTextoCalificada[] = [];
  const sinCalibracion: SinCalibracionCalificada[] = [];
  const noAplicadas: NoAplicada[] = [];

  const resultados = paquetes.map((paquete): ResultadoDePaquete => {
    const nombre = paquete.cabecera.nombre;
    const propias: (Senal | SenalTexto | SenalAusencia)[] = [];
    if (tramo !== 'insuficiente') {
      for (const regla of paquete.reglas) {
        const motivo = motivoParaNoAplicar(regla, genero, tramo, palabrasProsa);
        if (motivo !== null) {
          noAplicadas.push({ paquete: nombre, reglaId: regla.id, motivo });
          continue;
        }
        if (regla.detector === 'estadístico') {
          const r = detectarEstadistico(regla, texto, paquete.cabecera.calibracion, genero, tramoCal);
          if (r === null) continue;
          if ('motivo' in r) {
            sinCalibracion.push({ paquete: nombre, ...r });
            continue;
          }
          propias.push(r);
          (regla.informativa ? contexto : senalesTexto).push({ paquete: nombre, ...r });
          continue;
        }
        if (regla.parametros.ausencia === true) {
          const r = detectarAusencia(regla, texto);
          if (r === null) continue;
          propias.push(r);
          (regla.informativa ? contexto : senalesTexto).push({ paquete: nombre, ...r });
          continue;
        }
        for (const s of detectar(regla, texto)) {
          propias.push(s);
          senales.push({ paquete: nombre, ...s });
        }
      }
    }
    const puntuacion = puntuar(propias, paquete, texto);
    const { calibracion } = paquete.cabecera;
    const banda = clavesDeTotal(calibracion).length > 0 ? bandaHumana(puntuacion.total, genero, tramoCal, calibracion) : null;
    return { paquete: nombre, puntuacion, banda };
  });

  return { genero, palabrasProsa, tramo, tramoDeCalibracion: tramoCal, paquetes: resultados, senales, senalesTexto, contexto, sinCalibracion, noAplicadas };
}
