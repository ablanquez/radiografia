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

export interface ParametrosEstadistico {
  metrica: string;
  genero: string;
  tramo: '100-299' | '300-599' | '600+';
  direccion: 'mayor' | 'menor' | 'ambas';
}

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
