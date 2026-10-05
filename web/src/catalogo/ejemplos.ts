/**
 * Los ejemplos de la ficha con el tramo que dispara la regla marcado (encargo
 * 10.4, Tanda 3; DISEÑO §6.4): el ejemplo partido en trozos, cada uno sin
 * marcar o marcado. Los tramos los calcula el motor antes del build
 * (scripts/tramos-de-ejemplos.ts) y la ficha los lee en su frontmatter; esta
 * parte, sin DOM, la juzga logica.spec.ts. Los trozos los parte
 * partirEnTramos, la misma función que parte la vista del analizador: dos
 * señales que se pisan dan un trozo marcado por cada tramo distinto.
 *
 * Las reglas cuyos ejemplos no llevan tramo, y por qué (sinTramo, desde la
 * Tanda 4: Antonio en la parada 3, «dicho en la ficha donde no hay tramo»),
 * las mismas que deja aparte el juez de los ejemplos del motor
 * (motor/src/ejemplos.spec.ts): las estadísticas miran el texto entero; las
 * de ausencia señalan lo que falta; las que van por género dependen del tipo
 * de texto. El script de los tramos no las calcula y la ficha lo dice.
 */
import type { Paquete } from '@radiografia/motor/navegador';
import type { SIN_TRAMO } from '../textos.ts';
import { partirEnTramos } from '../pantalla/tramos.ts';

/** Por qué una regla no marca tramo en sus ejemplos: la clave de su frase en textos.ts. */
export type SinTramo = keyof typeof SIN_TRAMO;

/** Por qué los ejemplos de la regla no llevan tramo marcado; null si lo llevan. */
export function sinTramo(regla: Pick<Paquete['reglas'][number], 'detector' | 'parametros' | 'generos'>): SinTramo | null {
  if (regla.detector === 'estadístico') return 'textoEntero';
  if ('ausencia' in regla.parametros && regla.parametros.ausencia === true) return 'ausencia';
  if (regla.generos !== undefined) return 'genero';
  return null;
}

/** Un trozo del ejemplo: su texto y si va marcado. */
export interface TrozoDelEjemplo {
  texto: string;
  marcado: boolean;
}

/** El ejemplo en trozos, con los tramos [inicio, fin] marcados (ninguno si no hay tramos). */
export function trozosDelEjemplo(ejemplo: string, tramos: readonly (readonly [number, number])[]): TrozoDelEjemplo[] {
  return partirEnTramos(
    ejemplo.length,
    tramos.map(([inicio, fin]) => ({ inicio, fin })),
  ).map((t) => ({ texto: ejemplo.slice(t.inicio, t.fin), marcado: t.senales.length > 0 }));
}
