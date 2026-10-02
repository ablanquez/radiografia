/**
 * La entrada del motor en Node: analizar(texto, paquetes, { genero }), con el
 * validador de esquema de Ajv compilado en vivo (validar.ts). El análisis
 * entero está en analisis.ts, que no importa Ajv (encargo 6.1); el navegador
 * lo usa con el standalone (navegador.ts). Aquí, la firma de siempre, la que
 * usan los jueces y las herramientas, y lo demás de analisis.ts reexportado.
 */
import { analizarCon, type OpcionesDeAnalisis, type Resultado } from './analisis.ts';
import type { Paquete } from './paquete.ts';
import { validadorEnVivo } from './validar.ts';

export { detectar, PaqueteInvalido } from './analisis.ts';
export type {
  NoAplicada,
  OpcionesDeAnalisis,
  Resultado,
  ResultadoDePaquete,
  SenalCalificada,
  SenalTextoCalificada,
  SinCalibracionCalificada,
} from './analisis.ts';

export function analizar(textoOriginal: string, paquetes: readonly Paquete[], opciones: OpcionesDeAnalisis = {}): Resultado {
  return analizarCon(validadorEnVivo, textoOriginal, paquetes, opciones);
}
