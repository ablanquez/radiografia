/**
 * La lógica del informe para imprimir (encargo 9.1, b; firmado en la parada 1),
 * sin DOM: lo pinta pintar.ts y la hoja de impresión de index.astro lo enseña
 * solo en papel.
 *
 *   · repartirSiglas: la sigla de cada familia, que en papel va entre
 *     corchetes detrás de cada subrayado y delante de cada línea de la
 *     leyenda (la clave). [PROPIO, firmado] La inicial en mayúscula; si ya está
 *     cogida, la inicial y la segunda letra; si también, la inicial y una
 *     cifra, desde el 2. Se reparten en el orden de la leyenda sobre todos
 *     los paquetes que conoce la página, como los colores del 8.1: un paquete
 *     propio no cambia las siglas de los incluidos. El color no es el único
 *     medio de saber la familia de un subrayado.
 *     [DOC] https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html —
 *     1.4.1: «Color is not used as the only visual means of conveying
 *     information».
 *   · entradasDelInforme: la lista de señales, una entrada por regla que dio
 *     alguna, con tramo o del texto entero, en el orden del desglose
 *     (paquete, familia y regla, alfabéticas por su nombre; orden.ts): cuántas
 *     señales, sus primeros fragmentos y cuántos no caben, y las del texto
 *     entero, que el desglose ya sabe decir.
 *     [PROPIO, firmado] Hasta 5 fragmentos por regla, de hasta 80 caracteres
 *     (fragmento), y «y N más». Desde el 10.4 (Tanda 4; DISEÑO §6.5), cada
 *     entrada dice si es de contexto (las estadísticas informativas, que el
 *     informe pone al final, en cuerpo menor).
 */
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import { enOrden } from '../orden.ts';
import { nombreDeRegla } from './humanizar.ts';
import type { Indice } from './pintar.ts';

type Regla = Paquete['reglas'][number];
/** Una señal del texto entero: de una regla que puntúa (senalesTexto) o informativa (contexto). */
export type SenalDelTextoEntero = Resultado['senalesTexto'][number];

export const FRAGMENTOS_POR_REGLA = 5;
export const LARGO_DEL_FRAGMENTO = 80;

/** Las siglas de las familias, por su clave «paquete::familia», en el orden en que llegan. */
export function repartirSiglas(familias: readonly { clave: string; nombre: string }[]): Map<string, string> {
  const siglas = new Map<string, string>();
  const cogidas = new Set<string>();
  for (const { clave, nombre } of familias) {
    const letras = [...nombre.trim()];
    const inicial = (letras[0] ?? '?').toLocaleUpperCase('es');
    const dos = letras.length > 1 ? `${inicial}${letras[1]!.toLocaleLowerCase('es')}` : null;
    let sigla = !cogidas.has(inicial) ? inicial : dos !== null && !cogidas.has(dos) ? dos : null;
    for (let cifra = 2; sigla === null; cifra++) if (!cogidas.has(`${inicial}${cifra}`)) sigla = `${inicial}${cifra}`;
    cogidas.add(sigla);
    siglas.set(clave, sigla);
  }
  return siglas;
}

/** Un fragmento del texto para la lista: los blancos seguidos, uno; si pasa del largo, cortado con «…». */
export function fragmento(texto: string, largo = LARGO_DEL_FRAGMENTO): string {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  const letras = [...limpio];
  return letras.length <= largo ? limpio : `${letras.slice(0, largo - 1).join('').trimEnd()}…`;
}

export interface EntradaDelInforme {
  paquete: string;
  reglaId: string;
  regla: Regla | undefined;
  /** El nombre de la regla (el de su ficha o el id humanizado). */
  nombre: string;
  /** El nombre de su familia. */
  familia: string;
  /** Una regla informativa, o de una familia informativa: se señala y no suma. */
  informativa: boolean;
  /** Las señales con tramo: cuántas, las primeras como fragmentos, y cuántas no caben. */
  n: number;
  fragmentos: string[];
  resto: number;
  /** Las señales del texto entero (ausencias y estadísticas). */
  delTextoEntero: SenalDelTextoEntero[];
  /** Una regla de contexto: sus señales del texto entero son informativas (resultado.contexto, las estadísticas que no suman). */
  deContexto: boolean;
}

export function entradasDelInforme(resultado: Resultado, texto: string, indice: Indice): EntradaDelInforme[] {
  const familias = new Map(indice.familias.map((f) => [f.clave, f]));
  const porRegla = new Map<string, EntradaDelInforme>();
  const entrada = (paquete: string, reglaId: string): EntradaDelInforme => {
    const clave = `${paquete}::${reglaId}`;
    let e = porRegla.get(clave);
    if (e === undefined) {
      const regla = indice.reglas.get(clave);
      const familia = familias.get(`${paquete}::${regla?.familia ?? ''}`);
      e = {
        paquete,
        reglaId,
        regla,
        nombre: nombreDeRegla(reglaId, regla),
        familia: familia?.nombre ?? regla?.familia ?? '',
        informativa: (regla?.informativa ?? false) || (familia?.informativa ?? false),
        n: 0,
        fragmentos: [],
        resto: 0,
        delTextoEntero: [],
        deContexto: false,
      };
      porRegla.set(clave, e);
    }
    return e;
  };
  for (const s of resultado.senales) {
    const e = entrada(s.paquete, s.reglaId);
    e.n += 1;
    if (e.fragmentos.length < FRAGMENTOS_POR_REGLA) e.fragmentos.push(fragmento(texto.slice(s.inicio, s.fin)));
    else e.resto += 1;
  }
  for (const s of resultado.senalesTexto) entrada(s.paquete, s.reglaId).delTextoEntero.push(s);
  for (const s of resultado.contexto) {
    const e = entrada(s.paquete, s.reglaId);
    e.delTextoEntero.push(s);
    e.deContexto = true;
  }
  const posicion = new Map(resultado.paquetes.map((p, i) => [p.paquete, i]));
  return enOrden([...porRegla.values()], (e) => [posicion.get(e.paquete) ?? 0, e.familia, e.nombre]);
}
