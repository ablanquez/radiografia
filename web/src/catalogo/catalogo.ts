/**
 * La lógica del catálogo de reglas (encargo 7.1, b), sin DOM y sin los JSON:
 * la usan las páginas de src/pages/reglas/ al construirse (en su frontmatter,
 * que corre en build y no viaja al navegador) y la juzga logica.spec.ts. Los
 * paquetes los lee paquetes.ts.
 *
 * Las URL llevan la base de Astro delante (encargo 6.2) y la barra final:
 * con build.format «directory», que es el de por defecto, cada página se
 * escribe como <ruta>/index.html, y la URL con barra es la que la sirve sin
 * depender de cómo trate el alojamiento la barra que falta.
 * [DOC] https://docs.astro.build/en/reference/configuration-reference/#buildformat
 *    — «directory»: «Astro will generate a directory with a nested index.html
 *    file for each page».
 * [DOC] https://docs.astro.build/en/reference/configuration-reference/#trailingslash
 *    — «Trailing slashes on prerendered pages are handled by the hosting
 *    platform, and may not respect your chosen configuration».
 * El id va tal cual en la URL: el esquema lo limita a minúsculas, cifras y
 * guiones (regla.schema.json).
 */
import type { Paquete } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import { conBarraFinal } from '../pantalla/cargar.ts';
import { nombreDeGenero } from '../pantalla/generos.ts';

type Regla = Paquete['reglas'][number];
type Familia = Paquete['cabecera']['familias'][number];

export const urlDelAnalizador = (base: string): string => conBarraFinal(base);
export const urlDelCatalogo = (base: string): string => `${conBarraFinal(base)}reglas/`;
export const urlDeRegla = (base: string, id: string): string => `${urlDelCatalogo(base)}${id}/`;
/** La página de créditos y licencias (11.1, hallazgo 2 del censo pre-despliegue). */
export const urlDeLosCreditos = (base: string): string => `${conBarraFinal(base)}creditos/`;

/** Una regla del catálogo, con lo que la ficha enseña de su paquete y de su familia. */
export interface EntradaDelCatalogo {
  regla: Regla;
  paquete: { nombre: string; version: string; descripcion: string };
  familia: Familia;
}

/**
 * Las reglas de los paquetes, en su orden. Un id que ya esté en otro paquete
 * lanza un error, y el build para: las dos fichas tendrían la misma URL. El
 * validador ya lo impide dentro de un paquete, no entre dos.
 */
export function reglasDelCatalogo(paquetes: readonly Paquete[]): EntradaDelCatalogo[] {
  const deQuien = new Map<string, string>();
  const entradas: EntradaDelCatalogo[] = [];
  for (const { cabecera, reglas } of paquetes) {
    const familias = new Map(cabecera.familias.map((f) => [f.id, f]));
    for (const regla of reglas) {
      const otro = deQuien.get(regla.id);
      if (otro !== undefined) {
        throw new Error(`el id "${regla.id}" está en «${otro}» y en «${cabecera.nombre}»: las dos fichas tendrían la misma URL, /reglas/${regla.id}/`);
      }
      deQuien.set(regla.id, cabecera.nombre);
      const familia = familias.get(regla.familia);
      // El paso 2 del validador ya exige que la familia esté declarada; si no, el build para aquí.
      if (familia === undefined) throw new Error(`la regla "${regla.id}" de «${cabecera.nombre}» es de la familia "${regla.familia}", que el paquete no declara`);
      entradas.push({ regla, paquete: { nombre: cabecera.nombre, version: cabecera.version, descripcion: cabecera.descripcion }, familia });
    }
  }
  return entradas;
}

const FRASES = new Intl.Segmenter('es', { granularity: 'sentence' });
const cuenta = (texto: string, signo: string): number => texto.split(signo).length - 1;

/**
 * La primera frase de un texto, para el índice (encargo 7.1, b: la primera
 * frase de la explicación), con Intl.Segmenter, como las frases del motor.
 * [PROPIO] Si la frase que da el segmentador deja un paréntesis o unas
 *    comillas angulares sin cerrar, se le suma la siguiente hasta que cuadren:
 *    la explicación de est-poca-puntuacion lista los signos («(. , ; : ¿ ?
 *    ¡ ! …)») y el segmentador cortaba en el «?» de dentro (visto el 02/10).
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
 *    — granularity «sentence»: «Split the input into segments at sentence
 *    boundaries as determined by the locale».
 */
export function primeraFrase(texto: string): string {
  let frase = '';
  for (const { segment } of FRASES.segment(texto)) {
    frase += segment;
    if (cuenta(frase, '(') === cuenta(frase, ')') && cuenta(frase, '«') === cuenta(frase, '»')) break;
  }
  return frase.trim();
}

/** Los valores de los dos enum del esquema (regla.schema.json), en su orden: las casillas de los filtros. */
export const SEVERIDADES = ['baja', 'media', 'alta'] as const;
export const DETECTORES = ['patrón', 'estructural', 'estadístico'] as const;

/** Un parámetro de la regla en palabras: etiqueta y valor; `codigo` si el valor se enseña tal cual (regex, banderas, métrica). */
export interface Parametro {
  etiqueta: string;
  valor: string;
  codigo: boolean;
}

/**
 * Lo que busca la regla, en palabras (encargo 7.1, b): dónde mira (ámbito o
 * posición), qué busca (expresión regular con sus banderas, o número de
 * formas) y cuándo señala; en las estadísticas, la métrica, hacia dónde
 * dispara y la banda humana de su percentil (regla.schema.json, $defs). Las
 * cadenas, en textos.ts.
 */
export function parametrosEnLlano(regla: Regla): Parametro[] {
  const llano = (etiqueta: string, valor: string): Parametro => ({ etiqueta, valor, codigo: false });
  const tal = (etiqueta: string, valor: string): Parametro => ({ etiqueta, valor, codigo: true });
  const lineas: Parametro[] = [];
  if (regla.detector === 'estadístico') {
    const { metrica, direccion, percentil } = regla.parametros;
    const [abajo, arriba] = percentil === 'p95' ? ['5', '95'] : ['1', '99'];
    lineas.push(tal(textos.METRICA, metrica), llano(textos.DISPARA, textos.DIRECCIONES[direccion] ?? direccion), llano(textos.BANDA_HUMANA, textos.entrePercentiles(abajo, arriba)));
  } else {
    const p = regla.parametros;
    if (regla.detector === 'patrón') {
      lineas.push(llano(textos.DONDE_MIRA, textos.AMBITOS[regla.parametros.ambito] ?? regla.parametros.ambito));
      if (regla.parametros.formas !== undefined) lineas.push(llano(textos.FORMAS, textos.numeroDeFormas(regla.parametros.formas.length)));
    } else {
      lineas.push(llano(textos.DONDE_MIRA, textos.POSICIONES[regla.parametros.posicion] ?? regla.parametros.posicion));
    }
    if (p.regex !== undefined) lineas.push(tal(textos.EXPRESION_REGULAR, p.regex));
    if (p.flags !== undefined) lineas.push(tal(textos.BANDERAS, p.flags));
    if (p.ausencia === true) lineas.push(llano(textos.CUANDO_SENALA, textos.ausenciaDe(p.minimo ?? 1)));
    else if (p.minimo !== undefined) lineas.push(llano(textos.CUANDO_SENALA, textos.minimoDeApariciones(p.minimo)));
    if (p.minimoPorCoincidencia !== undefined) lineas.push(llano(textos.REPETICION, textos.repeticion(p.minimoPorCoincidencia)));
    if (p.sobreNoProsa === true) lineas.push(llano(textos.TAMBIEN_MIRA, textos.NO_PROSA));
  }
  if (regla.generos !== undefined) lineas.push(llano(textos.GENEROS, textos.soloEnGeneros(regla.generos.map(nombreDeGenero))));
  return lineas;
}
