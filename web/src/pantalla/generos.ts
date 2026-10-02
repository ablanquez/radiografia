/**
 * Los géneros del selector (encargo 6.2): las claves de género de
 * cabecera.calibracion de RadiografIA (métrica → género → tramo; decisión del
 * 30/09: la interfaz lista los géneros desde la calibración del paquete), con
 * «general» por defecto.
 * [PROPIO, firmado en el encargo] El nombre visible de cada género
 *    (NOMBRES_DE_GENERO, en web/src/textos.ts); si una clave no lo tiene, se
 *    enseña la clave.
 */
import type { Paquete } from '@radiografia/motor/navegador';
import { enOrden } from '../orden.ts';
import { NOMBRES_DE_GENERO } from '../textos.ts';

/** El género por defecto del análisis: el mismo nombre que GENERO_POR_DEFECTO del motor (motor/src/validacion.ts), que navegador.ts no exporta. */
export const GENERO_POR_DEFECTO = 'general';

export function nombreDeGenero(clave: string): string {
  return Object.hasOwn(NOMBRES_DE_GENERO, clave) ? NOMBRES_DE_GENERO[clave]! : clave;
}

/** Las claves de género de la calibración, sin repetir: la de por defecto primero y el resto alfabético por su nombre visible (orden.ts, cierre del 7.1). */
export function generosDe(paquete: Paquete): string[] {
  const vistos = new Set<string>();
  for (const porGenero of Object.values(paquete.cabecera.calibracion ?? {})) {
    for (const genero of Object.keys(porGenero)) vistos.add(genero);
  }
  return enOrden([...vistos], (g) => [g === GENERO_POR_DEFECTO ? 0 : 1, nombreDeGenero(g)]);
}
