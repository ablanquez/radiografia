/**
 * Los tramos de la vista de resultado (encargo 6.2; firmado en la parada 1,
 * punto 6): el texto analizado se parte por TODOS los límites [inicio, fin)
 * de las señales de los dos paquetes, y cada tramo lleva los índices de las
 * señales que lo cubren enteras. Los solapes se resuelven por construcción:
 * un trozo que cubren dos señales lleva las dos, y se subraya con las dos
 * familias.
 *
 * [PROPIO] Una señal vacía (inicio ≥ fin) no parte nada ni se pinta. Los
 *    desplazamientos son los del motor, sobre el mismo texto que se pinta
 *    (textarea.value, con los saltos ya normalizados a LF: «The algorithm for
 *    obtaining the element's API value is to return the element's raw value,
 *    with newlines normalized», https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element).
 */

export interface TramoDeTexto {
  inicio: number;
  fin: number;
  /** Los índices, en la lista de señales que se pasó, de las que cubren el tramo entero. */
  senales: number[];
}

export function partirEnTramos(longitud: number, senales: readonly { inicio: number; fin: number }[]): TramoDeTexto[] {
  const dentro = (x: number) => Math.max(0, Math.min(longitud, x));
  const limites = new Set([0, longitud]);
  for (const s of senales) {
    if (s.inicio >= s.fin) continue;
    limites.add(dentro(s.inicio));
    limites.add(dentro(s.fin));
  }
  const orden = [...limites].sort((a, b) => a - b);
  const tramos: TramoDeTexto[] = [];
  for (let i = 0; i + 1 < orden.length; i++) {
    const inicio = orden[i]!;
    const fin = orden[i + 1]!;
    const cubren = senales.flatMap((s, k) => (s.inicio < s.fin && s.inicio <= inicio && s.fin >= fin ? [k] : []));
    tramos.push({ inicio, fin, senales: cubren });
  }
  return tramos;
}
