/**
 * Los géneros del selector (encargo 6.2): las claves de género de
 * cabecera.calibracion de RadiografIA (métrica → género → tramo; decisión del
 * 30/09: la interfaz lista los géneros desde la calibración del paquete), con
 * «general» por defecto.
 * [PROPIO, firmado en el encargo] El nombre visible de cada género; si una
 *    clave no lo tiene, se enseña la clave.
 */
import type { Paquete } from '@radiografia/motor/navegador';

/** El género por defecto del análisis: el mismo nombre que GENERO_POR_DEFECTO del motor (motor/src/validacion.ts), que navegador.ts no exporta. */
export const GENERO_POR_DEFECTO = 'general';

const NOMBRES: Readonly<Record<string, string>> = {
  general: 'General',
  noticia: 'Noticia',
  administrativo: 'Administrativo',
  'narrativa-clasica': 'Narrativa clásica',
  academico: 'Académico',
  opinion: 'Opinión',
};

export function nombreDeGenero(clave: string): string {
  return Object.hasOwn(NOMBRES, clave) ? NOMBRES[clave]! : clave;
}

/** Las claves de género de la calibración, sin repetir y en el orden en que aparecen, con la de por defecto primero. */
export function generosDe(paquete: Paquete): string[] {
  const vistos = new Set<string>();
  for (const porGenero of Object.values(paquete.cabecera.calibracion ?? {})) {
    for (const genero of Object.keys(porGenero)) vistos.add(genero);
  }
  const lista = [...vistos];
  return lista.includes(GENERO_POR_DEFECTO) ? [GENERO_POR_DEFECTO, ...lista.filter((g) => g !== GENERO_POR_DEFECTO)] : lista;
}
