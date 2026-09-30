/**
 * La forma de un paquete YA VALIDADO, en tipos de TypeScript (encargo 4.2): el
 * espejo de paquete.schema.json y regla.schema.json para el código que lo usa
 * (puntuar.ts, analizar.ts). Solo tipos: no valida nada. Quien recibe un
 * paquete de fuera lo pasa antes por validarPaquete (validar.ts).
 *
 * [PROPIO] Escritos a mano, no generados del esquema: si el esquema cambia,
 * hay que cambiarlos aquí. Los parámetros de patrón y estructural viven con su
 * detector.
 */
import type { ParametrosPatron } from './detector-patron.ts';
import type { ParametrosEstructural } from './detector-estructural.ts';

/** Desde el 4.3, sin género ni tramo: son entradas del análisis, no de la ficha. */
export interface ParametrosEstadistico {
  metrica: string;
  direccion: 'mayor' | 'menor' | 'ambas';
  percentil: 'p95' | 'p99';
}

export type TramoDeCalibracion = '100-299' | '300-599' | '600+';

/** Una celda de cabecera.calibracion: métrica × género × tramo. */
export interface Celda {
  p1: number;
  p5: number;
  p50: number;
  p95: number;
  p99: number;
  n: number;
  corpus: string;
  fecha: string;
  metodo: 'hyndman-fan-7';
}

/** métrica → género → tramo → celda. */
export type Calibracion = Record<string, Record<string, Partial<Record<TramoDeCalibracion, Celda>>>>;

export interface Familia {
  id: string;
  nombre: string;
  informativa: boolean;
}

export interface Cabecera {
  nombre: string;
  version: string;
  idioma: string;
  descripcion: string;
  autor: string;
  licencia: string;
  familias: Familia[];
  calibracion?: Calibracion;
}

interface ReglaComun {
  id: string;
  familia: string;
  peso: number;
  severidad: 'baja' | 'media' | 'alta';
  informativa: boolean;
  explicacion: string;
  sugerencia: string;
  excepciones: string[];
  fuente: { titulo: string; url: string }[];
  origenLista: string | null;
  nivelEvidencia: 'medido en español' | 'medido en inglés' | 'anecdótico' | 'sin fuente' | 'norma';
  /** Encargo 5.3: si está, la regla solo se evalúa en esos géneros. */
  generos?: string[];
  ejemplos: { positivos: string[]; negativos: string[] };
}

export type Regla = ReglaComun &
  (
    | { detector: 'patrón'; parametros: ParametrosPatron }
    | { detector: 'estructural'; parametros: ParametrosEstructural }
    | { detector: 'estadístico'; parametros: ParametrosEstadistico }
  );

export interface Paquete {
  $schema?: string;
  cabecera: Cabecera;
  reglas: Regla[];
}
