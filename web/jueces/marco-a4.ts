/**
 * Lo que comparten los dos jueces de fidelidad al marco «Informe / A4» del
 * modelo (desde el 9.3): el del papel (papel.spec.ts, el PDF de Chrome) y el
 * del PDF de «Descargar informe» (informe-pdf.spec.ts, el de pdfmake). Hasta
 * el 9.3 vivía dentro de papel.spec.ts; se trajo aquí sin cambiar lo que se
 * exige. Las medidas son las de docs/figma/medidas-modelo.json (piezas
 * informe.*, medir-modelo.ts); qué se compara y con qué tolerancia, en la
 * cabecera de papel.spec.ts.
 *
 *   · comoElMarco: cada página A4; su número, «n / N», con la letra, la línea
 *     base y el borde derecho del marco; nada fuera del área de la página; y
 *     la primera línea de la página 1 y de las que empiezan la 4, la 5 y la 6.
 *   · piezasComoElMarco: cada pieza del marco en su línea del PDF, con su letra,
 *     su borde izquierdo y el aire desde la línea de antes; y el interlineado
 *     del texto.
 * La letra de cada tramo, de su FontDescriptor (Chrome) o, si el PDF no la
 * escribe (pdfkit), de la cara de su nombre PostScript: quien llama completa
 * los tramos antes (informe-pdf.spec.ts, con las WOFF de public/fuentes/).
 *
 * [DOC] https://drafts.csswg.org/css-fonts-4/#font-matching-algorithm —
 *    § 5.2: si el peso pedido es mayor que 500, «weights greater than or
 *    equal to the desired weight are checked in ascending order followed by
 *    weights below the desired weight in descending order».
 */
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import type { LineaDelPdf, PaginaDelPdf } from './pdf.ts';

const MEDIDAS = new URL('../../docs/figma/medidas-modelo.json', import.meta.url);

/** Una pieza del marco, como la escribe medir-modelo.ts. */
export interface Pieza {
  pantalla: string;
  familia: string;
  tamano: string;
  peso: string;
  interlineado: string;
  color?: string;
  ancho: number;
  alto: number;
  relleno: string[];
  pagina: number;
  arriba: number;
  izquierda: number;
  derecha: number;
  base?: number;
  ultimaBase?: number;
  /** Las del DISEÑO (no del marco): su apartado y, en la del salto de la 5, que lo lleva. */
  origen?: string;
  saltoAntes?: boolean;
}

/** Las piezas de docs/figma/medidas-modelo.json, por su clave. */
export const medidasDelMarco = (): Record<string, Pieza> => (JSON.parse(readFileSync(MEDIDAS, 'utf8')) as { medidas: Record<string, Pieza> }).medidas;

/** A4 a 96 ppp, en px CSS: 210 × 297 mm. Los márgenes de @page, 20 mm arriba y abajo y 18 a los lados. */
const MM = 96 / 25.4;
export const PAGINA = { ancho: 210 * MM, alto: 297 * MM, arriba: 20 * MM, lado: 18 * MM };

export const px = (valor: string): number => Number.parseFloat(valor);
export const cerca = (a: number, b: number, margen = 1): boolean => Math.abs(a - b) <= margen + 1e-6;
/** La familia de una fuente del PDF por su nombre de familia: «Literata 12pt» es Literata. */
export const familiaDe = (familia: string): string => (familia.startsWith('Literata') ? 'Literata' : familia);
/** El peso que pinta el navegador: Literata en negrita, con la de 600 (el modelo pide 700 y carga 400 y 600). */
export const pesoPintado = (familia: string, peso: number): number => (familiaDe(familia) === 'Literata' && peso >= 600 ? 600 : peso);

/** La letra de un tramo de una línea del PDF frente a la de una pieza del marco: familia, peso, cuerpo y color. */
export function letra(nombre: string, linea: LineaDelPdf, tramo: number, marco: Pieza): string[] {
  const t = linea.tramos[tramo];
  if (t === undefined) return [`${nombre}: la línea no tiene el tramo ${tramo}`];
  const fuera: string[] = [];
  if (familiaDe(t.familia) !== marco.familia) fuera.push(`${nombre}: familia ${t.familia}, en el marco ${marco.familia}`);
  if (t.peso !== pesoPintado(marco.familia, Number(marco.peso))) fuera.push(`${nombre}: peso ${t.peso}, en el marco ${marco.peso}`);
  if (!cerca(t.tamano, px(marco.tamano), 0.05)) fuera.push(`${nombre}: cuerpo ${t.tamano}, en el marco ${marco.tamano}`);
  // El color, si la pieza lo dice (las del DISEÑO, solo lo que el DISEÑO fija).
  if (marco.color !== undefined && t.color !== marco.color) fuera.push(`${nombre}: color ${t.color}, en el marco ${marco.color}`);
  return fuera;
}

/**
 * Las piezas del marco que se buscan en el PDF: cómo se reconoce su línea, de
 * qué tramo es su letra (la primera, si no se dice; con tramo, no se mira su
 * borde izquierdo) y de qué pieza es la línea de antes (para el aire; «misma»,
 * la misma pieza, para no mirarlo).
 */
export const PIEZAS: readonly { clave: string; linea: (texto: string) => boolean; tramo?: number; antes?: string }[] = [
  { clave: 'informe.s1.titulo', linea: (x) => x === `1. ${textos.INFORME_DE_RADIOGRAFIA}` },
  { clave: 'informe.s1.linea', linea: (x) => x.startsWith('Análisis del '), antes: 'informe.s1.titulo' },
  { clave: 'informe.s1.linea2', linea: (x) => /^\d+ palabras que cuentan/.test(x), antes: 'informe.s1.linea' },
  { clave: 'informe.s2.titulo', linea: (x) => x === `2. ${textos.RESULTADO}`, antes: 'informe.s1.ultima' },
  { clave: 'informe.s2.etiqueta', linea: (x) => x.startsWith('Texto con bastantes rasgos'), antes: 'informe.s2.titulo' },
  { clave: 'informe.s2.frase', linea: (x) => x.startsWith('Tu texto suena bastante'), antes: 'informe.s2.etiqueta' },
  { clave: 'informe.s2.pesa', linea: (x) => x.startsWith('Lo que más pesa:'), antes: 'informe.s2.frase' },
  { clave: 'informe.s2.empieza', linea: (x) => x.startsWith('Empieza por:'), antes: 'informe.s2.pesa' },
  { clave: 'informe.s2.espanol', linea: (x) => x.startsWith('Español correcto:'), antes: 'informe.s2.empieza' },
  { clave: 'informe.s3.titulo', linea: (x) => x === `3. ${textos.CLAVE_DE_FAMILIAS}`, antes: 'informe.s2.espanol' },
  // La primera línea de la sección 3 es la de las siglas, en el sitio y con la letra de la primera de la clave del marco.
  { clave: 'informe.s3.linea', linea: (x) => x === textos.CLAVE_DE_SIGLAS, tramo: 0, antes: 'informe.s3.titulo' },
  { clave: 'informe.s3.linea2', linea: (x) => x.startsWith('[') && x.endsWith('(RadiografIA)'), antes: 'informe.s3.linea' },
  // Empieza por un subrayado, con su relleno de 2 px a la izquierda, como en el marco: su borde izquierdo no se compara.
  { clave: 'informe.s4.parrafo', linea: (x) => x.startsWith('##'), tramo: 0, antes: 'informe.s4.titulo' },
  { clave: 'informe.s4.sigla', linea: (x) => x.startsWith('##'), tramo: 1, antes: 'misma' },
  { clave: 'informe.s4.parrafo2', linea: (x) => x.startsWith('La productividad se ha convertido'), antes: 'informe.s4.parrafo' },
  { clave: 'informe.s5.titulo', linea: (x) => x === `5. ${textos.DESGLOSE}` },
  { clave: 'informe.s5.paquete', linea: (x) => /^RadiografIA \d/.test(x), antes: 'informe.s5.titulo' },
  { clave: 'informe.s5.familia', linea: (x) => x.startsWith('Discurso: '), antes: 'misma' },
  { clave: 'informe.s5.regla', linea: (x) => x.startsWith('Atribución vaga: '), antes: 'informe.s5.familia' },
  { clave: 'informe.s5.regla2', linea: (x) => x.startsWith('Cierre de plantilla: '), antes: 'informe.s5.regla' },
  // De la última regla de una familia a la familia siguiente: Léxico y Puntuación y formato, que caen en la misma página.
  { clave: 'informe.s5.familia2', linea: (x) => x.startsWith('Puntuación y formato: '), antes: 'informe.s5.reglaFinal' },
  { clave: 'informe.s6.nombre', linea: (x) => x.startsWith('Encabezado de Markdown ('), antes: 'informe.s6.titulo' },
  { clave: 'informe.s6.url', linea: (x) => x.startsWith('Encabezado de Markdown ('), tramo: 1, antes: 'misma' },
  { clave: 'informe.s6.frase', linea: (x) => x.startsWith('Una línea que empieza por almohadillas'), antes: 'informe.s6.nombre' },
  // Entre la frase y los fragmentos, la línea de «Solo aviso: no suma.», un párrafo de una línea como la frase: el mismo aire.
  { clave: 'informe.s6.fragmentos', linea: (x) => x.startsWith('Fragmentos: «##»'), antes: 'informe.s6.frase' },
  { clave: 'informe.s6.quehacer.etiqueta', linea: (x) => x.startsWith(`${textos.QUE_HACER}: Quita el formato`), antes: 'informe.s6.fragmentos' },
  { clave: 'informe.s6.quehacer', linea: (x) => x.startsWith(`${textos.QUE_HACER}: Quita el formato`), tramo: 1, antes: 'misma' },
  { clave: 'informe.s6.siguiente', linea: (x) => x.startsWith('Atribución vaga ('), antes: 'informe.s6.quehacer' },
  { clave: 'informe.pie', linea: (x) => x === `7. ${textos.NOTA_DE_AUTORIA}` },
];

/**
 * Lo que de las páginas no es como el marco: el tamaño A4; el número de cada
 * una, «n / N», con su letra, su línea base y su borde derecho; nada fuera
 * del área de la página (ni la cabecera ni el pie de Chrome, ni nada que se
 * salga por los lados); y la primera línea de la página 1 y de las páginas
 * donde empiezan la 4, la 5 y la 6 (saltos de página antes), donde en el
 * marco. `margen`, la tolerancia de las posiciones en px.
 */
export function comoElMarco(paginas: readonly PaginaDelPdf[], m: Record<string, Pieza>, margen = 1): string[] {
  const n = paginas.length;
  const diferencias: string[] = [];
  paginas.forEach((pagina, i) => {
    if (!cerca(pagina.ancho, PAGINA.ancho) || !cerca(pagina.alto, PAGINA.alto)) diferencias.push(`p${i + 1}: ${pagina.ancho} × ${pagina.alto}, y A4 es ${PAGINA.ancho.toFixed(2)} × ${PAGINA.alto.toFixed(2)}`);
    const numero = pagina.lineas.at(-1);
    const marco = m['informe.numero']!;
    if (numero === undefined || numero.texto !== `${i + 1} / ${n}`) diferencias.push(`p${i + 1}: el número es «${numero?.texto}»`);
    else {
      diferencias.push(...letra(`p${i + 1} número`, numero, 0, marco));
      if (!cerca(numero.y, marco.base!, margen)) diferencias.push(`p${i + 1} número: línea base en ${numero.y}, en el marco ${marco.base}`);
      if (!cerca(numero.fin, marco.derecha, margen)) diferencias.push(`p${i + 1} número: acaba en ${numero.fin}, en el marco ${marco.derecha}`);
    }
    for (const l of pagina.lineas.slice(0, -1)) {
      if (l.y < PAGINA.arriba - 1 || l.y > PAGINA.alto - PAGINA.arriba + 1 || l.x < PAGINA.lado - 1 || l.fin > PAGINA.ancho - PAGINA.lado + 1) {
        diferencias.push(`p${i + 1}: fuera del área, «${l.texto.slice(0, 50)}» en x ${l.x}–${l.fin}, línea base ${l.y}`);
      }
    }
  });
  for (const [clave, titulo] of [
    ['informe.s1.titulo', `1. ${textos.INFORME_DE_RADIOGRAFIA}`],
    ['informe.s4.titulo', `4. ${textos.TEXTO_DEL_INFORME}`],
    ['informe.s5.titulo', `5. ${textos.DESGLOSE}`],
    ['informe.s6.titulo', `6. ${textos.SENALES_DEL_INFORME}`],
  ] as const) {
    const donde = paginas.findIndex((pg) => pg.lineas[0]?.texto === titulo);
    if (donde < 0) diferencias.push(`«${titulo}» no empieza ninguna página`);
    else if (!cerca(paginas[donde]!.lineas[0]!.y, m[clave]!.base!, margen)) diferencias.push(`«${titulo}»: línea base en ${paginas[donde]!.lineas[0]!.y}, en el marco ${m[clave]!.base}`);
  }
  return diferencias;
}

/**
 * Lo que de las piezas no es como el marco: cada pieza en su línea del PDF,
 * con su letra, su borde izquierdo y el aire entre ella y la línea de antes
 * (la distancia entre sus líneas base); y el interlineado del texto (dentro de
 * un párrafo de la sección 4, de una línea a la siguiente). Con el paso del
 * PDF y el del marco, para el diagnóstico.
 */
export function piezasComoElMarco(paginas: readonly PaginaDelPdf[], m: Record<string, Pieza>): { diferencias: string[]; paso: number; enElMarco: number } {
  const todas = paginas.flatMap((pagina, i) => pagina.lineas.slice(0, -1).map((l, j) => ({ ...l, pagina: i, j })));
  const diferencias: string[] = [];
  for (const pieza of PIEZAS) {
    const marco = m[pieza.clave]!;
    const k = todas.findIndex((l) => pieza.linea(l.texto));
    if (k < 0) {
      diferencias.push(`${pieza.clave}: ninguna línea del PDF es la suya`);
      continue;
    }
    const linea = todas[k]!;
    diferencias.push(...letra(pieza.clave, linea, pieza.tramo ?? 0, marco));
    if (pieza.tramo === undefined && !cerca(linea.x, marco.izquierda)) diferencias.push(`${pieza.clave}: empieza en ${linea.x}, en el marco ${marco.izquierda}`);
    if (pieza.antes !== undefined && pieza.antes !== 'misma') {
      const anterior = todas[k - 1];
      const delMarco = marco.base! - (m[pieza.antes]!.ultimaBase ?? m[pieza.antes]!.base!);
      if (anterior === undefined || anterior.pagina !== linea.pagina) diferencias.push(`${pieza.clave}: no tiene línea de antes en su página`);
      else if (!cerca(linea.y - anterior.y, delMarco)) diferencias.push(`${pieza.clave}: ${(linea.y - anterior.y).toFixed(2)} px desde «${anterior.texto.slice(0, 30)}», en el marco ${delMarco.toFixed(2)}`);
    }
  }
  const parrafo = m['informe.s4.parrafo2']!;
  const enElMarco = (parrafo.ultimaBase! - parrafo.base!) / Math.round((parrafo.ultimaBase! - parrafo.base!) / px(parrafo.interlineado));
  const k = todas.findIndex((l) => l.texto.startsWith('La productividad se ha convertido'));
  const paso = todas[k + 1]!.y - todas[k]!.y;
  if (!cerca(paso, enElMarco)) diferencias.push(`el interlineado del texto: ${paso} px, en el marco ${enElMarco.toFixed(2)}`);
  return { diferencias, paso, enElMarco };
}
