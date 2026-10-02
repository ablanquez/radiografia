/**
 * El id de una regla, humanizado solo para enseñarlo (encargo 6.2).
 * [PROPIO, firmado en la parada 1, punto 10] Las fichas no tienen nombre y el
 *    esquema no se toca: sin el prefijo de familia (lo que va hasta el primer
 *    guion), guiones a espacios y la primera letra en mayúscula.
 *    «est-frases-cortas» → «Frases cortas». Debajo se enseña el id tal cual.
 *    El nombre de verdad lo decidirá el catálogo (punto 7 del plan).
 */
export function idHumanizado(id: string): string {
  const guion = id.indexOf('-');
  const sinPrefijo = (guion >= 0 ? id.slice(guion + 1) : id).replaceAll('-', ' ');
  return sinPrefijo.charAt(0).toLocaleUpperCase('es') + sinPrefijo.slice(1);
}
