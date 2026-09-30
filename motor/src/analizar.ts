/**
 * La entrada del motor (encargos 4.2 y 4.3; punto 4 del plan: «combinación
 * de varios paquetes con origen en cada señal»):
 * analizar(texto, paquetes, { genero }).
 *
 *   1. Valida cada paquete con validarPaquete (validar.ts). Si uno falla,
 *      lanza PaqueteInvalido con su nombre (cabecera.nombre, o su posición si
 *      no se puede leer) y sus mensajes, y no analiza nada. Y dos paquetes
 *      con el mismo cabecera.nombre son un error (encargo 4.3): el nombre es
 *      el origen de cada señal, y las de los dos no se distinguirían.
 *   2. Segmenta el texto UNA vez (texto.ts), mide su longitud y saca su tramo
 *      de calibración (umbral.ts).
 *   3. Aplica a cada regla el detector de su tipo: patrón y estructural
 *      (`detectar`) dan señales con desplazamientos; el estadístico
 *      (detector-estadistico.ts) mide el texto entero contra la celda de
 *      cabecera.calibracion de su métrica, del GÉNERO de entrada y del tramo
 *      del texto (encargo 4.3: género y tramo son entradas del análisis, no de
 *      la ficha). Sin género, «general» (GENERO_POR_DEFECTO, validar.ts).
 *   4. Puntúa cada paquete con SUS señales (puntuar.ts); las estadísticas,
 *      por presencia.
 *   5. Devuelve, por paquete, su puntuación, y aparte, calificadas con
 *      { paquete: cabecera.nombre, reglaId }:
 *        · senales — las de patrón y estructural (con [inicio, fin));
 *        · senalesTexto — las estadísticas que disparan (reglas que puntúan);
 *        · contexto — las de las reglas estadísticas informativas, siempre que
 *          haya celda, con su valor y su referencia (no puntúan);
 *        · sinCalibracion — las reglas estadísticas sin celda para (métrica,
 *          género, tramo) o con la métrica no calculable, con el motivo.
 *      El tipo Senal del 4.1 no cambia: SenalTexto es un tipo hermano.
 *
 * Paquete → familia → regla, siempre: nunca se mezclan familias de dos
 * paquetes, aunque se llamen igual, y dos paquetes pueden tener una regla con
 * el mismo id (no es error: la señal lleva su paquete). Decisión del 29/09
 * (RADIOGRAFIA-ESTADO.md § 5: cargador; origen distinguible).
 *
 * Con el tramo «insuficiente» (menos de 100 palabras de prosa) no se aplica
 * ningún detector: la decisión firmada el 29/09 dice «no se analiza»
 * (docs/investigacion/estadistica.md § 5). Cada paquete sale con total null y
 * su motivo (puntuar.ts), y no hay señales de ninguna clase.
 */
import { analizarTexto, type Texto } from './texto.ts';
import { evaluarLongitud, tramoDeCalibracion, type Tramo } from './umbral.ts';
import { detectarPatron, type Senal } from './detector-patron.ts';
import { detectarEstructural } from './detector-estructural.ts';
import { detectarEstadistico, type SenalTexto, type SinCalibracion } from './detector-estadistico.ts';
import { puntuar, type Puntuacion } from './puntuar.ts';
import { GENERO_POR_DEFECTO, validarPaquete, type ErrorDeValidacion } from './validar.ts';
import type { Paquete, Regla, TramoDeCalibracion } from './paquete.ts';

export interface SenalCalificada extends Senal {
  /** cabecera.nombre del paquete de la regla. */
  paquete: string;
}

export interface SenalTextoCalificada extends SenalTexto {
  paquete: string;
}

export interface SinCalibracionCalificada extends SinCalibracion {
  paquete: string;
}

export interface ResultadoDePaquete {
  paquete: string;
  puntuacion: Puntuacion;
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
}

export interface OpcionesDeAnalisis {
  /** El género del texto, para escoger la calibración (por defecto «general»). */
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
 * de los ejemplos (ejemplos.spec.ts). El estadístico no va por aquí: necesita
 * la calibración, el género y el tramo del texto (detectarEstadistico).
 */
export function detectar(regla: Regla, texto: Texto): Senal[] {
  switch (regla.detector) {
    case 'patrón':
      return detectarPatron(regla, texto);
    case 'estructural':
      return detectarEstructural(regla, texto);
    case 'estadístico':
      throw new Error(`regla «${regla.id}»: el detector estadístico necesita la calibración, el género y el tramo del texto (detectarEstadistico)`);
  }
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

  const resultados = paquetes.map((paquete): ResultadoDePaquete => {
    const nombre = paquete.cabecera.nombre;
    const propias: (Senal | SenalTexto)[] = [];
    if (tramo !== 'insuficiente') {
      for (const regla of paquete.reglas) {
        if (regla.detector !== 'estadístico') {
          for (const s of detectar(regla, texto)) {
            propias.push(s);
            senales.push({ paquete: nombre, ...s });
          }
          continue;
        }
        const r = detectarEstadistico(regla, texto, paquete.cabecera.calibracion, genero, tramoCal);
        if (r === null) continue;
        if ('motivo' in r) {
          sinCalibracion.push({ paquete: nombre, ...r });
          continue;
        }
        propias.push(r);
        (regla.informativa ? contexto : senalesTexto).push({ paquete: nombre, ...r });
      }
    }
    return { paquete: nombre, puntuacion: puntuar(propias, paquete, texto) };
  });

  return { genero, palabrasProsa, tramo, tramoDeCalibracion: tramoCal, paquetes: resultados, senales, senalesTexto, contexto, sinCalibracion };
}
