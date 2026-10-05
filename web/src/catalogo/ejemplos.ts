/**
 * Los ejemplos de la ficha con el tramo que dispara la regla marcado (encargo
 * 10.4, Tanda 3; DISEÑO §6.4): el ejemplo partido en trozos, cada uno sin
 * marcar o marcado. Los tramos los calcula el motor antes del build
 * (scripts/tramos-de-ejemplos.ts) y la ficha los lee en su frontmatter; esta
 * parte, sin DOM, la juzga logica.spec.ts. Los trozos los parte
 * partirEnTramos, la misma función que parte la vista del analizador: dos
 * señales que se pisan dan un trozo marcado por cada tramo distinto.
 */
import { partirEnTramos } from '../pantalla/tramos.ts';

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
