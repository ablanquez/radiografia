/**
 * Los textos de ejemplo (encargo 6.3, a; docs/ejemplos.md): dos botones junto
 * al textarea piden uno de los dos textos de web/public/ejemplos/, lo ponen en
 * el textarea y seleccionan el género de los ejemplos. No analizan: la persona
 * pulsa «Pon tu texto a contraluz».
 *
 * [PROPIO, firmado en el encargo] El género, «opinion»: los dos son textos de
 *    opinión en primera persona. Quien los carga puede cambiarlo.
 * [DOC] https://docs.astro.build/en/reference/configuration-reference/#base —
 *    la ruta se construye con import.meta.env.BASE_URL, con la barra final
 *    forzada como la de los paquetes (cargar.ts).
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Response/text — «The
 *    response is always decoded using UTF-8»: el texto llega con sus tildes,
 *    diga lo que diga el servidor de su codificación.
 * [PROPIO] `pedir` se pasa como argumento para que el juez lo sustituya; la
 *    página pasa fetch.
 */
import { ejemploNoCargado } from '../textos.ts';
import { conBarraFinal } from './cargar.ts';
import { motivoDelFallo } from './fallo.ts';

export const GENERO_DE_LOS_EJEMPLOS = 'opinion';

/** Cada ejemplo y su fichero en web/public/ejemplos/. */
export const EJEMPLOS = { humano: 'antonio.txt', ia: 'ia.txt' } as const;
export type Ejemplo = keyof typeof EJEMPLOS;

export function urlDeEjemplo(base: string, ejemplo: Ejemplo): string {
  return `${conBarraFinal(base)}ejemplos/${EJEMPLOS[ejemplo]}`;
}

export type CargaDeEjemplo = { texto: string; problema: null } | { texto: null; problema: string };

export async function cargarEjemplo(base: string, ejemplo: Ejemplo, pedir: (url: string) => Promise<Response>): Promise<CargaDeEjemplo> {
  const url = urlDeEjemplo(base, ejemplo);
  try {
    const respuesta = await pedir(url);
    if (!respuesta.ok) return { texto: null, problema: ejemploNoCargado(url, `HTTP ${respuesta.status}`) };
    return { texto: await respuesta.text(), problema: null };
  } catch (fallo) {
    return { texto: null, problema: ejemploNoCargado(url, motivoDelFallo(fallo)) };
  }
}
