/**
 * La carga de los dos paquetes incluidos al arrancar (encargo 6.2; firmado en
 * la parada 1, punto 5): fetch de web/public/paquetes/ (los copia
 * scripts/copiar-paquetes.ts) y validación con el validador standalone que
 * lleva navegador.ts. Es la única red de la página al arrancar; la otra son
 * los ejemplos, al pulsar su botón (ejemplos.ts). Si un fetch falla o un
 * paquete no valida, se devuelve qué paquete y por qué, con los mensajes del
 * validador, y ningún paquete: la página lo dice y desactiva el botón.
 *
 * [DOC] https://docs.astro.build/en/reference/configuration-reference/#base —
 *    las rutas se construyen con import.meta.env.BASE_URL, nunca con
 *    «/paquetes/…» a pelo; y «If trailingSlash: "never" is set, BASE_URL will
 *    not include a trailing slash, even if base includes one».
 * [PROPIO] Por eso la barra final se fuerza (conBarraFinal), sea cual sea
 *    trailingSlash.
 * [PROPIO] `pedir` y `validar` se pasan como argumentos para que el juez los
 *    sustituya; la página pasa fetch y el validarPaquete de navegador.ts.
 */
import type { Paquete, ResultadoDeValidacion } from '@radiografia/motor/navegador';
import { noSeCargo } from '../textos.ts';
import { motivoDelFallo } from './fallo.ts';

/** Los dos paquetes incluidos, en el orden en que se analizan: RadiografIA y Español correcto. */
export const FICHEROS = ['radiografia.json', 'espanol-correcto.json'] as const;

export function conBarraFinal(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

export interface ProblemaDeCarga {
  paquete: string;
  mensajes: string[];
}

export type Carga = { paquetes: Paquete[]; problemas: [] } | { paquetes: null; problemas: ProblemaDeCarga[] };

export async function cargarPaquetes(
  base: string,
  pedir: (url: string) => Promise<Response>,
  validar: (dato: unknown) => ResultadoDeValidacion,
): Promise<Carga> {
  const paquetes: Paquete[] = [];
  const problemas: ProblemaDeCarga[] = [];
  for (const fichero of FICHEROS) {
    const url = `${conBarraFinal(base)}paquetes/${fichero}`;
    try {
      const respuesta = await pedir(url);
      if (!respuesta.ok) {
        problemas.push({ paquete: fichero, mensajes: [noSeCargo(url, `HTTP ${respuesta.status}`)] });
        continue;
      }
      const dato: unknown = await respuesta.json();
      const { valido, errores } = validar(dato);
      if (!valido) {
        problemas.push({ paquete: fichero, mensajes: errores.map((e) => e.texto) });
        continue;
      }
      paquetes.push(dato as Paquete);
    } catch (fallo) {
      problemas.push({ paquete: fichero, mensajes: [noSeCargo(url, motivoDelFallo(fallo))] });
    }
  }
  return problemas.length === 0 ? { paquetes, problemas: [] } : { paquetes: null, problemas };
}
