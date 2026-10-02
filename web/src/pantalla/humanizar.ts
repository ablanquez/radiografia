/**
 * El nombre que se enseña de una regla.
 *
 * Desde el encargo 7.1 la ficha trae `nombre` (opcional en el esquema, por
 * los paquetes de terceros; RadiografIA y Español correcto lo llevan en
 * todas sus reglas, firmado por Antonio). Donde falta, se humaniza el id,
 * como desde el 6.2.
 */

/**
 * El id de una regla, humanizado solo para enseñarlo (encargo 6.2).
 * [PROPIO, firmado en la parada 1, punto 10] Sin el prefijo de familia (lo
 *    que va hasta el primer guion), guiones a espacios y la primera letra en
 *    mayúscula. «est-frases-cortas» → «Frases cortas». Pierde las tildes
 *    («Atribucion vaga»): desde el 7.1 es solo la reserva de nombreDeRegla.
 */
export function idHumanizado(id: string): string {
  const guion = id.indexOf('-');
  const sinPrefijo = (guion >= 0 ? id.slice(guion + 1) : id).replaceAll('-', ' ');
  return sinPrefijo.charAt(0).toLocaleUpperCase('es') + sinPrefijo.slice(1);
}

/** El campo `nombre` de la ficha; si no lo trae (o no se encuentra la ficha), el id humanizado. */
export function nombreDeRegla(id: string, regla: { nombre?: string } | undefined): string {
  return regla?.nombre ?? idHumanizado(id);
}
