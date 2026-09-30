/**
 * La entrada del motor (encargo 4.2; punto 4 del plan: «combinación de varios
 * paquetes con origen en cada señal»): analizar(texto, paquetes).
 *
 *   1. Valida cada paquete con validarPaquete (validar.ts). Si uno falla,
 *      lanza PaqueteInvalido con su nombre (cabecera.nombre, o su posición si
 *      no se puede leer) y sus mensajes, y no analiza nada. Y dos paquetes
 *      con el mismo cabecera.nombre son un error (encargo 4.3): el nombre es
 *      el origen de cada señal, y las de los dos no se distinguirían.
 *   2. Una regla estadística lanza «detector estadístico: pendiente del 4.3»,
 *      antes de mirar el texto: el paquete no se puede analizar entero.
 *   3. Segmenta el texto UNA vez (texto.ts) y mide su longitud (umbral.ts).
 *   4. Aplica a cada regla el detector de su tipo (`detectar`) y puntúa cada
 *      paquete con SUS señales (puntuar.ts).
 *   5. Devuelve, por paquete, su puntuación, y todas las señales calificadas
 *      con { paquete: cabecera.nombre, reglaId }.
 *
 * Paquete → familia → regla, siempre: nunca se mezclan familias de dos
 * paquetes, aunque se llamen igual, y dos paquetes pueden tener una regla con
 * el mismo id (no es error: la señal lleva su paquete). Decisión del 29/09
 * (RADIOGRAFIA-ESTADO.md § 5: cargador; origen distinguible).
 *
 * Con el tramo «insuficiente» (menos de 100 palabras de prosa) no se aplica
 * ningún detector: la decisión firmada el 29/09 dice «no se analiza»
 * (docs/investigacion/estadistica.md § 5). Cada paquete sale con total null y
 * su motivo (puntuar.ts), y no hay señales.
 */
import { analizarTexto, type Texto } from './texto.ts';
import { evaluarLongitud, type Tramo } from './umbral.ts';
import { detectarPatron, type Senal } from './detector-patron.ts';
import { detectarEstructural } from './detector-estructural.ts';
import { puntuar, type Puntuacion } from './puntuar.ts';
import { validarPaquete, type ErrorDeValidacion } from './validar.ts';
import type { Paquete, Regla } from './paquete.ts';

export interface SenalCalificada extends Senal {
  /** cabecera.nombre del paquete de la regla. */
  paquete: string;
}

export interface ResultadoDePaquete {
  paquete: string;
  puntuacion: Puntuacion;
}

export interface Resultado {
  palabrasProsa: number;
  tramo: Tramo;
  paquetes: ResultadoDePaquete[];
  senales: SenalCalificada[];
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

/** El detector de cada tipo de regla. También lo usa el juez de los ejemplos (ejemplos.spec.ts). */
export function detectar(regla: Regla, texto: Texto): Senal[] {
  switch (regla.detector) {
    case 'patrón':
      return detectarPatron(regla, texto);
    case 'estructural':
      return detectarEstructural(regla, texto);
    case 'estadístico':
      throw new Error(`regla «${regla.id}»: detector estadístico: pendiente del 4.3`);
  }
}

/** cabecera.nombre si se puede leer; si no, la posición del paquete en la lista. */
function nombreDe(paquete: unknown, indice: number): string {
  const nombre = (paquete as { cabecera?: { nombre?: unknown } } | null)?.cabecera?.nombre;
  return typeof nombre === 'string' && nombre !== '' ? nombre : `paquetes[${indice}]`;
}

export function analizar(textoOriginal: string, paquetes: readonly Paquete[]): Resultado {
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
  for (const paquete of paquetes) {
    const estadistica = paquete.reglas.find((r) => r.detector === 'estadístico');
    if (estadistica !== undefined) {
      throw new Error(`paquete «${paquete.cabecera.nombre}», regla «${estadistica.id}»: detector estadístico: pendiente del 4.3`);
    }
  }

  const texto = analizarTexto(textoOriginal);
  const { palabrasProsa, tramo } = evaluarLongitud(texto);

  const senales: SenalCalificada[] = [];
  const resultados = paquetes.map((paquete): ResultadoDePaquete => {
    const propias = tramo === 'insuficiente' ? [] : paquete.reglas.flatMap((regla) => detectar(regla, texto));
    for (const s of propias) senales.push({ paquete: paquete.cabecera.nombre, ...s });
    return { paquete: paquete.cabecera.nombre, puntuacion: puntuar(propias, paquete, texto) };
  });

  return { palabrasProsa, tramo, paquetes: resultados, senales };
}
