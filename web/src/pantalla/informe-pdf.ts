/**
 * La definición del PDF de «Descargar informe» para pdfmake (encargo 9.3;
 * decisión de Antonio del 05/10, firmada en la parada previa): el informe de
 * modelo-informe.ts, el mismo del papel, calcado al marco «Informe · A4» del
 * modelo (docs/figma/medidas-modelo.json, piezas informe.*) y a la hoja de
 * impresión (estilos/informe.css), que lo calca también. Sin DOM ni red: lo
 * llama generar-pdf.ts, que carga pdfmake y las fuentes al pulsar.
 *
 * Lo que dice el DISEÑO §6.5, aquí: A4 con márgenes de 20 mm arriba y abajo y
 * 18 a los lados; siete secciones numeradas, con salto de página antes de la 4,
 * la 5 y la 6; títulos en Atkinson 14 pt, etiqueta 16 pt, cuerpo en Literata
 * 11 pt (600 en las negritas) a 1,45, pie 10 pt, la dirección de cada ficha
 * 9,5 pt y las siglas 9 pt (los tamaños, de docs/figma/tokens.json, «impresion»,
 * como la hoja); la clave con la muestra de la línea de cada familia; «[sigla]»
 * detrás de cada tramo; ninguna señal partida; la nota, con la última; y «n /
 * N» abajo a la derecha, en Atkinson 9 pt e ink-2.
 *
 * Lo que pdfmake hace distinto del papel, firmado por Antonio en la parada
 * previa (y en el DISEÑO §6.5):
 *   · Las líneas discontinuas y punteadas: pdfmake recorta su mitad de arriba
 *     (TextDecorator.js: el recorte, rect(x, y, ancho, grosor), y la raya,
 *     rect(x, y − grosor / 2, …)); se le pide el doble de grosor para que se
 *     vea el de la familia. Los puntos salen como rayitas de 2 × 1.
 *   · La doble discontinua de Ortotipografía no existe en pdfmake: va
 *     discontinua de 1 px; la sigla [O] la distingue.
 *   · El tinte de un tramo ocupa la altura de la línea (drawBackground:
 *     rect(x, y, ancho, line.getHeight())).
 *   · Las señales no se parten con pageBreakBefore, nunca con unbreakable:
 *     un bloque unbreakable más alto que una página desaparece sin aviso
 *     (el issue 207 de pdfmake, abierto desde 2015; medido el 05/10).
 * Y lo que no estaba en la propuesta y se dice en el reporte: un tramo de
 * varias familias lleva la línea de la primera (pdfmake da a cada trozo de
 * texto una sola línea por debajo); las siglas dicen todas, como en papel.
 *
 * [DOC] https://pdfmake.github.io/docs/0.3/document-definition-object/page/ —
 *    pageSize, pageMargins «[left, top, right, bottom]», en puntos.
 * [DOC] https://pdfmake.github.io/docs/0.3/document-definition-object/headers-footers/
 *    — «you can pass a function to the header or footer», con currentPage y
 *    pageCount.
 * [DOC] https://pdfmake.github.io/docs/0.3/document-definition-object/page/ —
 *    pageBreak: 'before'; y pageBreakBefore(currentNode, nodeContainer): «If
 *    pageBreakBefore returns true, a page break will be added before the
 *    currentNode»; nodeContainer da getFollowingNodesOnPage y
 *    getNodesOnNextPage (0.3: https://pdfmake.github.io/docs/0.3/migration-from-0.1/).
 * [DOC] https://pdfmake.github.io/docs/0.3/document-definition-object/styling/
 *    — font, fontSize, bold, color, lineHeight, decoration, decorationStyle
 *    («dashed», «dotted», «double» o «wavy»), decorationColor,
 *    decorationThickness y background.
 * [DOC] https://github.com/bpampuch/pdfmake/blob/0.3.11/examples/vectors.js —
 *    canvas: rect, line, polyline, ellipse; y en el código (Renderer.js,
 *    renderVector), path con su «d».
 */
import tokens from '../../../docs/figma/tokens.json' with { type: 'json' };
import type { ApartadoDelDesglose, DesgloseDelPaquete, InformeEnDatos, LineaDeSenal, SenalEnDatos, TrozoDelTexto } from './modelo-informe.ts';

/** Puntos por px CSS (1 pt = 4/3 px) y por milímetro. */
const PT = 0.75;
const mm = (x: number): number => (x * 72) / 25.4;

/** Las caras del PDF, como las registra pdfmake (familia y sus cuatro variantes), por su ruta en public/fuentes/ (docs/figma/fuentes.md, «Para el PDF»). */
export const FUENTES_DEL_PDF = {
  Literata: {
    normal: 'literata/literata-400.woff',
    bold: 'literata/literata-600.woff',
    italics: 'literata/literata-400-italica.woff',
    bolditalics: 'literata/literata-600.woff',
  },
  Atkinson: {
    normal: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next-400.woff',
    bold: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next-700.woff',
    italics: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next-400.woff',
    bolditalics: 'atkinson-hyperlegible-next/atkinson-hyperlegible-next-700.woff',
  },
} as const;
type Familia = keyof typeof FUENTES_DEL_PDF;

/**
 * Las métricas verticales de las caras del PDF, de su tabla hhea (las mismas en
 * las caras de cada familia; lo comprueba el juez del PDF, que las lee de los
 * WOFF) y unitsPerEm de head.
 */
export const METRICAS: Readonly<Record<Familia, { ascendente: number; descendente: number; unidades: number }>> = {
  Literata: { ascendente: 1177, descendente: -308, unidades: 1000 },
  Atkinson: { ascendente: 984, descendente: -316, unidades: 1000 },
};

/**
 * El interlineado de pdfmake que da el del CSS. pdfmake multiplica su
 * lineHeight por la altura natural de la fuente, no por el cuerpo
 * (TextInlines.js: item.height = item.font.lineHeight(item.fontSize) *
 * lineHeight; pdfkit, PDFFont.lineHeight: (ascender − descender) / 1000 ×
 * cuerpo, sin el lineGap, que no pide), y el CSS multiplica el cuerpo:
 *   altura de la línea = interlineadoCss × cuerpo = lineHeight × (ascendente − descendente) / unidades × cuerpo
 *   lineHeight = interlineadoCss × unidades / (ascendente − descendente)
 * Con Literata, 1,45 × 1000 / 1485 = 0,9764; con Atkinson, 1,25 × 1000 / 1300.
 */
export function interlineado(familia: Familia, css: number): number {
  const m = METRICAS[familia];
  return (css * m.unidades) / (m.ascendente - m.descendente);
}

/** Lo que sube la línea base del CSS respecto a la de pdfmake: el CSS reparte el medio interlineado (puede ser negativo), pdfmake la pone a un ascendente de arriba (Renderer.js, renderLine). */
function medioInterlineado(familia: Familia, css: number, cuerpo: number): number {
  const m = METRICAS[familia];
  return ((css - (m.ascendente - m.descendente) / m.unidades) * cuerpo) / 2;
}

type Token = keyof typeof tokens.subrayado & keyof typeof tokens.color;
const color = (nombre: keyof typeof tokens.color): string => (tokens.color[nombre] as { $value: { hex: string } }).$value.hex;
const TINTA = color('ink');
const TINTA_2 = color('ink-2');
/** Un color mezclado con el fondo, como color-mix(in srgb, c p%, bg) (el tinte de los paquetes propios: estilos/familias.css). */
function mezclar(hex: string, fraccion: number): string {
  const fondo = color('bg');
  const canal = (h: string, i: number): number => Number.parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(canal(hex, i) * fraccion + canal(fondo, i) * (1 - fraccion)).toString(16).padStart(2, '0')).join('')}`;
}

/** Los tamaños del informe, de los tokens (impresion.tamano, en pt), como la hoja de impresión. */
const TAMANO = {
  titulo: tokens.impresion.tamano['titulo-seccion'].$value,
  etiqueta: tokens.impresion.tamano.etiqueta.$value,
  cuerpo: tokens.impresion.tamano.cuerpo.$value,
  pie: tokens.impresion.tamano.pie.$value,
  url: tokens.impresion.tamano.url.$value,
  sigla: tokens.impresion.tamano.sigla.$value,
  /** El número de página (DISEÑO §6.5 y la hoja: Atkinson 9 pt). */
  numero: 9,
};
const MARGEN = { arriba: mm(tokens.impresion.margen.vertical.$value), lado: mm(tokens.impresion.margen.horizontal.$value) };
const A4 = { ancho: mm(210), alto: mm(297) };
const ANCHO_UTIL = A4.ancho - 2 * MARGEN.lado;

/** Los interlineados de la hoja (estilos/informe.css): 1,45 el cuerpo y el pie, 1,25 los títulos, 1,375 la etiqueta. */
const CUERPO = { font: 'Literata', fontSize: TAMANO.cuerpo, lineHeight: interlineado('Literata', 1.45), color: TINTA };
const em = (x: number, cuerpo = TAMANO.cuerpo): number => x * cuerpo;

/**
 * La línea de una familia: su estilo, su grosor en px y su color (tokens.json,
 * subrayado y color, como estilos/familias.css), y su tinte; los paquetes
 * propios, en ink-2 y discontinuos, con el grosor de Sintaxis.
 */
interface Trazo {
  estilo: string;
  grosor: number;
  color: string;
  tinte: string;
}
function trazoDe(clase: string): Trazo {
  const token = clase.replace(/^fam-/, '');
  if (!Object.hasOwn(tokens.subrayado, token) || token === '$description') {
    return { estilo: 'dashed', grosor: tokens.subrayado.sintaxis.grosor.$value.value, color: TINTA_2, tinte: mezclar(TINTA_2, 0.14) };
  }
  const t = token as Token;
  const s = tokens.subrayado[t] as { estilo: { $value: string }; grosor: { $value: { value: number } } };
  return { estilo: s.estilo.$value, grosor: s.grosor.$value.value, color: color(t), tinte: color(`tinte-${t}` as keyof typeof tokens.color) };
}

/**
 * Lo que se le pide a pdfmake para la línea de una familia, con el grosor que
 * hace falta para que salga el de la familia (TextDecorator.js): continua, el
 * grosor; discontinua y punteada, el doble (recorta la mitad de arriba);
 * doble, el doble (dos barras de grosor / 2); ondulada, el triple (la traza con
 * grosor / 3). La doble discontinua, discontinua de 1 px.
 */
function decoracion(t: Trazo): { decorationStyle?: 'dashed' | 'dotted' | 'double' | 'wavy'; decorationThickness: number } {
  const g = t.grosor * PT;
  switch (t.estilo) {
    case 'dashed':
      return { decorationStyle: 'dashed', decorationThickness: 2 * g };
    case 'double-dashed':
      return { decorationStyle: 'dashed', decorationThickness: 2 * PT };
    case 'dotted':
      return { decorationStyle: 'dotted', decorationThickness: 2 * g };
    case 'double':
      return { decorationStyle: 'double', decorationThickness: 2 * g };
    case 'wavy':
      return { decorationStyle: 'wavy', decorationThickness: 3 * g };
    default:
      return { decorationThickness: g };
  }
}

/** Un vector del canvas de pdfmake (con color, relleno; con lineColor, trazado). */
type Vector =
  | { type: 'rect'; x: number; y: number; w: number; h: number; color: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; lineWidth: number; lineColor: string; lineCap?: 'round' }
  | { type: 'ellipse'; x: number; y: number; r1: number; r2: number; color?: string; lineColor?: string; lineWidth?: number };

/**
 * La muestra de la clave (24 × 7,5 pt, los 32 × 10 px del marco), en tinta:
 * lo mismo que pdfmake dibuja bajo el texto con esa decoración
 * (TextDecorator.js, _drawDecoration), con su geometría, centrado en el alto de
 * la muestra. Firmado por Antonio en la parada previa: la clave dibuja
 * exactamente lo mismo que el texto.
 */
export function muestraDeLaClave(clase: string, arriba = 0, ancho = 32 * PT, alto = 10 * PT): Vector[] {
  const d = decoracion(trazoDe(clase));
  const lw = d.decorationThickness;
  const y = arriba + alto / 2;
  const tiras = (paso: number, largo: number): Vector[] => {
    const salida: Vector[] = [];
    for (let x = 0; x < ancho; x += paso) salida.push({ type: 'rect', x, y: y - lw / 4, w: Math.min(largo, ancho - x), h: lw / 2, color: TINTA });
    return salida;
  };
  switch (d.decorationStyle) {
    case 'double': {
      // Dos barras de lw / 2 con su hueco, max(0,5, lw, 0,15 × cuerpo), como debajo de un texto de 11 pt; el par, centrado.
      const hueco = Math.max(0.5, lw, TAMANO.cuerpo * 0.15);
      const arriba = y - (hueco + lw / 2) / 2;
      return [
        { type: 'rect', x: 0, y: arriba, w: ancho, h: lw / 2, color: TINTA },
        { type: 'rect', x: 0, y: arriba + hueco, w: ancho, h: lw / 2, color: TINTA },
      ];
    }
    case 'dashed':
      // Rayas de 3,96 cada 6,8 pt; de cada una se ve la mitad de abajo (lw / 2), aquí centrada.
      return tiras(3.96 + 2.84, 3.96);
    case 'dotted':
      // Cuadrados de lw cada 3 lw, de los que se ve la mitad de abajo.
      return tiras(lw * 3, lw);
    case 'wavy': {
      // La onda de pdfmake: curvas de Bézier de 1 pt de amplitud y 4,2 de periodo, desde 1 pt antes del borde, trazadas con
      // lw / 3 y recortadas al ancho. El canvas no recorta ni tiene curvas que se coloquen: la misma curva, en tramos rectos
      // de 0,35 pt con los extremos redondos, solo dentro del ancho. No en una polyline: pdfmake 0.3.11 mueve sus puntos al
      // colocarla (helpers/tools.js, offsetVector) y no los devuelve a su sitio antes de rehacer la maquetación con
      // pageBreakBefore (LayoutBuilder.js: el resetXY de los vectores restaura x, y, x1, y1, x2 e y2, no points); en cada
      // pasada la muestra se iba más abajo hasta no caber (visto el 05/10).
      const sh = 0.7;
      const sv = 1;
      const bezier = (p: readonly number[], t: number): number => (1 - t) ** 3 * p[0]! + 3 * (1 - t) ** 2 * t * p[1]! + 3 * (1 - t) * t ** 2 * p[2]! + t ** 3 * p[3]!;
      const puntos: { x: number; y: number }[] = [];
      for (let x = -1; x < ancho; x += sh * 6) {
        for (const [xs, ys] of [
          [[x, x + sh, x + sh * 2, x + sh * 3], [y, y - sv, y - sv, y]],
          [[x + sh * 3, x + sh * 4, x + sh * 5, x + sh * 6], [y, y + sv, y + sv, y]],
        ] as const) {
          for (let k = 0; k < 6; k++) {
            const punto = { x: bezier(xs, k / 6), y: bezier(ys, k / 6) };
            if (punto.x >= 0 && punto.x <= ancho) puntos.push(punto);
          }
        }
      }
      return puntos.slice(1).map((p, i) => ({ type: 'line', x1: puntos[i]!.x, y1: puntos[i]!.y, x2: p.x, y2: p.y, lineWidth: lw / 3, lineColor: TINTA, lineCap: 'round' }));
    }
    default:
      return [{ type: 'rect', x: 0, y: y - lw / 2, w: ancho, h: lw, color: TINTA }];
  }
}

/** Un trozo de texto de pdfmake y un nodo del documento: lo justo de lo que se usa. */
interface Trozo {
  text: string | Trozo[];
  font?: Familia;
  fontSize?: number;
  bold?: boolean;
  color?: string;
  lineHeight?: number;
  link?: string;
  decoration?: 'underline';
  decorationStyle?: 'dashed' | 'dotted' | 'double' | 'wavy';
  decorationColor?: string;
  decorationThickness?: number;
  background?: string;
}
type Margen = [number, number, number, number];
/** Lo común a los nodos: su aire, sus marcas para los saltos (MARCA) y el salto de sección. */
interface Comun {
  margin?: Margen;
  style?: string[];
  pageBreak?: 'before';
}
type Nodo =
  | (Trozo & Comun & { alignment?: 'right'; width?: '*' })
  | ({ stack: Nodo[] } & Comun)
  | ({ columns: Nodo[]; columnGap: number } & Comun)
  | ({ canvas: Vector[]; width?: number } & Comun);

const ATKINSON = (cuerpo: number, css: number, extra: Partial<Trozo> = {}): Partial<Trozo> => ({ font: 'Atkinson', fontSize: cuerpo, lineHeight: interlineado('Atkinson', css), ...extra });

/**
 * Las marcas de los nodos para pageBreakBefore, en su «style» (pdfmake se lo
 * da a pageBreakBefore y no pinta nada con un nombre que no está en su
 * diccionario de estilos; con «id», cada texto sería además un destino con
 * nombre dentro del PDF): «entero», lo que no se parte (cada señal, cada línea
 * de la clave y del desglose, cada explicación: break-inside: avoid en la
 * hoja); «titulo», lo que no se queda solo al pie (break-after: avoid); «pie»,
 * la nota; y «antes-del-pie», lo último de antes de la nota, que se la lleva
 * si esta se quedara sola (break-before: avoid en la nota).
 */
const MARCA = { entero: 'entero', titulo: 'titulo', pie: 'pie', antesDelPie: 'antes-del-pie' } as const;

/** El título de una sección, con su número: Atkinson 700 a 14 pt y 1,25, 0,6 em debajo. */
function titulo(numero: number, texto: string, extra: { pageBreak?: 'before'; arriba?: number } = {}): Nodo {
  return {
    text: `${numero}. ${texto}`,
    ...ATKINSON(TAMANO.titulo, 1.25, { bold: true, color: TINTA }),
    margin: [0, extra.arriba ?? 0, 0, em(0.6, TAMANO.titulo)],
    style: [MARCA.titulo],
    ...(extra.pageBreak === undefined ? {} : { pageBreak: extra.pageBreak }),
  };
}

/** Un párrafo con su aire por arriba. */
const parrafo = (text: string | Trozo[], arriba: number, extra: Partial<Trozo> & Comun = {}): Nodo => ({ text, ...extra, margin: [0, arriba, 0, 0] });

/** 4 · El texto: los trozos en párrafos (cada tanda de saltos, uno nuevo, a 14 pt), con la línea y el tinte de la primera familia de cada tramo y su sigla detrás. */
function parrafosDelTexto(trozos: readonly TrozoDelTexto[]): Nodo[] {
  const parrafos: Trozo[][] = [[]];
  for (const t of trozos) {
    const actual = parrafos.at(-1)!;
    if (t.tipo === 'salto') {
      if (actual.length > 0) parrafos.push([]);
    } else if (t.tipo === 'texto') {
      actual.push({ text: t.texto });
    } else {
      const primera = t.clases[0];
      if (primera === undefined) actual.push({ text: t.texto });
      else {
        const trazo = trazoDe(primera);
        actual.push({ text: t.texto, decoration: 'underline', decorationColor: trazo.color, ...decoracion(trazo), background: trazo.tinte });
      }
      actual.push({ text: ` [${t.siglas}]`, ...ATKINSON(TAMANO.sigla, 1.45, { color: TINTA }) });
    }
  }
  return parrafos.filter((p) => p.length > 0).map((p, i) => parrafo(p, i === 0 ? 0 : 14));
}

/**
 * La viñeta de una línea de lista, en una columna del ancho de la sangría:
 * llena (disc) o hueca (circle), a la izquierda del texto y a media altura de
 * las minúsculas de Literata. [PROPIO] Su tamaño y su sitio: el marco solo
 * mide dónde empieza el texto.
 */
function vineta(llena: boolean, sangria: number): Vector[] {
  const r = 0.17 * TAMANO.cuerpo;
  const x = sangria - 0.55 * TAMANO.cuerpo;
  const y = medioInterlineado('Literata', 1.45, TAMANO.cuerpo) + TAMANO.cuerpo * (METRICAS.Literata.ascendente / METRICAS.Literata.unidades) - 0.25 * TAMANO.cuerpo;
  return [llena ? { type: 'ellipse', x, y, r1: r, r2: r, color: TINTA } : { type: 'ellipse', x, y, r1: r - 0.35, r2: r - 0.35, lineColor: TINTA, lineWidth: 0.7 }];
}

/**
 * Un dibujo (una viñeta, una muestra de la clave) con su texto al lado: dos
 * columnas, la del dibujo de `ancho` y la del texto a `hueco` de ella, en un
 * bloque que no se parte.
 */
function conDibujo(dibujo: Vector[], texto: Trozo, ancho: number, hueco: number, marca: string, arriba = 0): Nodo {
  return { columns: [{ canvas: dibujo, width: ancho }, { ...texto, width: '*' }], columnGap: hueco, margin: [0, arriba, 0, 0], style: [marca] };
}

/** 5 · Un apartado del desglose: su título (la familia), con viñeta llena y el texto a 1,2 em; sus reglas, con viñeta hueca y el texto a 2,4 em; o «Ninguna señal», a 2,4 em. */
function apartado(a: ApartadoDelDesglose, arriba: number): Nodo[] {
  const sangria = em(1.2);
  const cabeza = conDibujo(vineta(true, sangria), { text: a.titulo, bold: true }, sangria, 0, MARCA.titulo, arriba);
  if (a.nada !== null) return [cabeza, { text: a.nada, margin: [2 * sangria, 0, 0, 0], style: [MARCA.entero] }];
  return [cabeza, ...a.lineas.map((l) => conDibujo(vineta(false, 2 * sangria), { text: `${l.nombre}${l.resto}` }, 2 * sangria, 0, MARCA.entero))];
}

/** 5 · El desglose de un paquete: su nombre (Atkinson 700), su descripción y su total, y sus apartados, a 0,3 em; y los avisos, cada uno a 0,3 em. */
function desgloseDelPaquete(d: DesgloseDelPaquete, arriba: number): Nodo[] {
  const salida: Nodo[] = [{ text: d.titulo, ...ATKINSON(TAMANO.cuerpo, 1.45, { bold: true }), margin: [0, arriba, 0, 0], style: [MARCA.titulo] }];
  if (d.descripcion !== null) salida.push(parrafo(d.descripcion, em(0.3)));
  salida.push(parrafo(d.total, em(0.3)));
  for (const a of [...d.apartados, ...d.avisos]) salida.push(...apartado(a, em(0.3)));
  return salida;
}

/** 6 · Una línea de una señal: un párrafo o «Etiqueta: texto», con la etiqueta en negrita. */
const lineaDeSenal = (l: LineaDeSenal, cuerpo: number): Trozo[] => ('etiqueta' in l ? [{ text: `${l.etiqueta}: `, bold: true }, { text: l.texto }] : [{ text: l.texto }]).map((t) => ({ ...t, fontSize: cuerpo }));

/** 6 · Una señal entera: su nombre en negrita, la dirección de su ficha detrás (Atkinson 9,5 pt, ink-2), y sus líneas, a 0,3 em; en un bloque que no se parte. */
function senal(e: SenalEnDatos, arriba: number, cuerpo: number): Nodo {
  const nombre: Trozo[] =
    e.ficha === null
      ? [{ text: `${e.nombre} (${e.reglaId})`, bold: true, fontSize: cuerpo }]
      : [
          { text: e.nombre, bold: true, fontSize: cuerpo, link: e.ficha },
          { text: ` (${e.ficha})`, ...ATKINSON(TAMANO.url, 1.45, { color: TINTA_2, link: e.ficha }) },
        ];
  return { stack: [{ text: nombre }, ...e.lineas.map((l) => parrafo(lineaDeSenal(l, cuerpo), em(0.3, cuerpo)))], margin: [0, arriba, 0, 0], style: [MARCA.entero] };
}

/** La definición entera del documento para pdfmake. */
export function definicionDelInforme(informe: InformeEnDatos): object {
  let numero = 0;
  const contenido: Nodo[] = [];
  // 1 · La cabecera, con 0,25 em entre líneas.
  contenido.push(titulo(++numero, informe.titulos.cabecera), ...informe.cabecera.map((l, i) => parrafo(l, i === 0 ? 0 : em(0.25))));
  // 2 · El resultado, a 14 pt: la etiqueta (Atkinson 700, 16 pt, 1,375), la frase, el aviso, las líneas y los otros paquetes, a 0,4 em.
  const r = informe.resultado;
  contenido.push(titulo(++numero, informe.titulos.resultado, { arriba: 14 }));
  if (r.cabeza !== null) contenido.push({ text: r.cabeza.etiqueta, ...ATKINSON(TAMANO.etiqueta, 1.375, { bold: true, color: TINTA }) });
  const lineas = [...(r.cabeza === null ? [] : [r.cabeza.frase, ...(r.cabeza.aviso === null ? [] : [r.cabeza.aviso])]), ...(r.sinEscala === null ? [] : [r.sinEscala]), ...r.lineas, ...r.otros];
  lineas.forEach((l, i) => contenido.push(parrafo(l, i === 0 && r.cabeza === null ? 0 : em(0.4))));
  // 3 · La clave, a 14 pt: la línea de las siglas y cada familia con su muestra (32 × 10 px, centrada en su línea) a 12 px de su texto, a 0,2 em.
  contenido.push(titulo(++numero, informe.titulos.clave, { arriba: 14 }), parrafo(informe.clave.siglas, 0));
  const altoDeLinea = 1.45 * TAMANO.cuerpo;
  for (const f of informe.clave.familias) contenido.push(conDibujo(muestraDeLaClave(f.clase, (altoDeLinea - 10 * PT) / 2), { text: f.texto }, 32 * PT, 12 * PT, MARCA.entero, em(0.2)));
  // 4 · El texto, en página nueva.
  contenido.push(titulo(++numero, informe.titulos.texto, { pageBreak: 'before' }), ...parrafosDelTexto(informe.texto));
  // 5 · El desglose, en página nueva (DISEÑO §6.5, desde el cierre de la parada 4 bis): cada paquete; los otros, a 14 pt, con su etiqueta y su frase si tienen escala.
  contenido.push(titulo(++numero, informe.titulos.desglose, { pageBreak: 'before' }));
  informe.desglose.forEach((d, i) => {
    const arriba = i === 0 ? 0 : 14;
    if (d.cabeza !== null) {
      contenido.push(
        { text: d.cabeza.etiqueta, ...ATKINSON(TAMANO.cuerpo, 1.45, { bold: true }), margin: [0, arriba, 0, 0], style: [MARCA.titulo] },
        parrafo(d.cabeza.frase, em(0.3)),
        ...(d.cabeza.aviso === null ? [] : [parrafo(d.cabeza.aviso, em(0.3))]),
      );
    }
    contenido.push(...desgloseDelPaquete(d.desglose, d.cabeza === null ? arriba : 0));
  });
  // 6 · Las señales, en página nueva, a 14 pt entre ellas; al final, a 14 pt y en cuerpo menor (9,5 pt), las explicaciones y las de contexto, a 0,6 em.
  const s = informe.senales;
  if (s !== null) {
    contenido.push(titulo(++numero, informe.titulos.senales, { pageBreak: 'before' }), ...s.principales.map((e, i) => senal(e, i === 0 ? 0 : 14, TAMANO.cuerpo)));
    const menor = TAMANO.url;
    const anexo: Nodo[] = [];
    if (s.porQue.length > 0) anexo.push({ text: informe.titulos.porQue, bold: true, fontSize: menor, style: [MARCA.titulo] });
    for (const p of s.porQue) anexo.push({ text: [{ text: `${p.nombre}: `, bold: true }, { text: p.texto }], fontSize: menor, style: [MARCA.entero] });
    if (s.deContexto.length > 0) anexo.push({ text: informe.titulos.deContexto, bold: true, fontSize: menor, style: [MARCA.titulo] });
    anexo.push(...s.deContexto.map((e) => senal(e, 0, menor)));
    anexo.forEach((n, i) => contenido.push({ ...n, margin: [0, i === 0 ? 14 : em(0.6, menor), 0, 0] }));
  }
  // 7 · La nota de autoría, a 14 pt, con su raya encima (1 px de tinta) y 0,6 em hasta el texto (Atkinson 10 pt a 1,45); no queda sola.
  const ultimo = contenido.at(-1)!;
  ultimo.style = [...(ultimo.style ?? []), MARCA.antesDelPie];
  contenido.push({
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: PT / 2, x2: ANCHO_UTIL, y2: PT / 2, lineWidth: PT, lineColor: TINTA }] },
      { text: `${++numero}. ${informe.nota}`, ...ATKINSON(TAMANO.pie, 1.45, { color: TINTA }), margin: [0, em(0.6, TAMANO.pie), 0, 0] },
    ],
    margin: [0, 14, 0, 0],
    style: [MARCA.pie],
  });
  return {
    info: { title: informe.titulos.cabecera },
    content: aireDebajo(contenido).map(medioInterlineadoEnElMargen),
    language: 'es',
    pageSize: 'A4',
    pageMargins: [MARGEN.lado, MARGEN.arriba, MARGEN.lado, MARGEN.arriba],
    defaultStyle: CUERPO,
    footer: piePagina,
    pageBreakBefore: saltoAntes,
  };
}

/**
 * El aire entre los bloques del documento, debajo del de antes y no encima del
 * siguiente: en papel, el margen de un bloque que pasa a la página siguiente
 * sin un salto forzado se pierde («When an unforced break occurs before or
 * after a block-level box, any margins adjoining the break are truncated to
 * zero», CSS Fragmentation 3, § 5.2), y pdfmake conserva arriba de la página nueva
 * el margen de arriba del bloque (visto el 05/10: la primera señal de una
 * página, 14 pt más abajo); el de abajo de lo último de una página no pasa a
 * la siguiente. Tras un salto forzado (los títulos de la 4, la 5 y la 6), el
 * margen se conserva, como en papel: el suyo es 0.
 * [DOC] https://www.w3.org/TR/css-break-3/#break-margins
 */
function aireDebajo(contenido: Nodo[]): Nodo[] {
  return contenido.map((nodo, i) => {
    const arriba = nodo.pageBreak === 'before' ? (nodo.margin?.[1] ?? 0) : 0;
    const siguiente = contenido[i + 1];
    const debajo = (nodo.margin?.[3] ?? 0) + (siguiente === undefined || siguiente.pageBreak === 'before' ? 0 : (siguiente.margin?.[1] ?? 0));
    const [izquierda, , derecha] = nodo.margin ?? [0, 0, 0, 0];
    return { ...nodo, margin: [izquierda, arriba, derecha, debajo] };
  });
}

/**
 * El medio interlineado del CSS, en el margen de cada texto: pdfmake pone la
 * línea base a un ascendente del borde de arriba de la línea, y el CSS, a
 * medio interlineado más (medioInterlineado: positivo en Atkinson a 1,45, que
 * así baja hasta 1,1 px; negativo y de 0,26 px en Literata a 1,45). Se baja el
 * texto ese medio interlineado (margen de arriba) y se le quita lo mismo al de
 * abajo: lo que viene detrás no se mueve. En un bloque (una señal) y en unas
 * columnas (la clave, el desglose), a cada texto suyo; los dibujos, no: la
 * muestra de la clave va centrada en la caja de la línea, como en papel.
 */
function medioInterlineadoEnElMargen(nodo: Nodo): Nodo {
  if ('stack' in nodo) return { ...nodo, stack: nodo.stack.map(medioInterlineadoEnElMargen) };
  if ('columns' in nodo) return { ...nodo, columns: nodo.columns.map(medioInterlineadoEnElMargen) };
  if (!('text' in nodo)) return nodo;
  const familia = nodo.font ?? 'Literata';
  const m = METRICAS[familia];
  const css = (nodo.lineHeight ?? CUERPO.lineHeight) * ((m.ascendente - m.descendente) / m.unidades);
  const medio = medioInterlineado(familia, css, nodo.fontSize ?? TAMANO.cuerpo);
  const [izquierda, arriba, derecha, abajo] = nodo.margin ?? [0, 0, 0, 0];
  return { ...nodo, margin: [izquierda, arriba + medio, derecha, abajo - medio] };
}

/**
 * «n / N», abajo a la derecha, como el número de la hoja: Atkinson 9 pt a 1,45
 * e ink-2, en la caja de margen de abajo con «vertical-align: bottom» y
 * «padding-bottom: calc(10mm − 6px)» (estilos/informe.css; el marco lo pone a
 * M_V / 2 − 6 px del borde de abajo). Su línea base, la del CSS: el borde de
 * abajo de la caja, menos el medio interlineado y el descendente; pdfmake la
 * pone a un ascendente del borde de arriba del pie, que empieza en el margen
 * de abajo.
 */
function piePagina(pagina: number, total: number): Nodo {
  const m = METRICAS.Atkinson;
  const cuerpo = TAMANO.numero;
  const base = A4.alto - (mm(10) - 6 * PT) - medioInterlineado('Atkinson', 1.45, cuerpo) - (-m.descendente / m.unidades) * cuerpo;
  const arriba = base - (m.ascendente / m.unidades) * cuerpo - (A4.alto - MARGEN.arriba);
  return { text: `${pagina} / ${total}`, ...ATKINSON(cuerpo, 1.45, { color: TINTA_2 }), alignment: 'right', margin: [MARGEN.lado, arriba, MARGEN.lado, 0] };
}

/** Lo que pdfmake da de un nodo a pageBreakBefore (LayoutBuilder.js, nodeInfo): sus marcas y las páginas que ocupa. */
interface NodoColocado {
  style?: string | string[];
  pageNumbers: number[];
}
const marcas = (n: NodoColocado): readonly string[] => (n.style === undefined ? [] : typeof n.style === 'string' ? [n.style] : n.style);

/**
 * Los saltos que no son de sección: lo que no se parte (una señal, una línea
 * de la clave o del desglose, una explicación) y acabaría en otra página pasa
 * entera a la siguiente; un título que se quedaría al pie, también; y si la
 * nota se quedara sola en su página, se lleva consigo lo último de antes.
 */
function saltoAntes(nodo: NodoColocado, contenedor: { getFollowingNodesOnPage(): NodoColocado[]; getNodesOnNextPage(): NodoColocado[] }): boolean {
  const de = marcas(nodo);
  if (de.includes(MARCA.antesDelPie)) {
    const esElPie = (n: NodoColocado): boolean => marcas(n).includes(MARCA.pie);
    if (!contenedor.getFollowingNodesOnPage().some(esElPie) && contenedor.getNodesOnNextPage().some(esElPie)) return true;
  }
  if (de.includes(MARCA.entero) && nodo.pageNumbers.length > 1) return true;
  if (de.includes(MARCA.titulo)) return contenedor.getFollowingNodesOnPage().length === 0 && contenedor.getNodesOnNextPage().length > 0;
  return false;
}
