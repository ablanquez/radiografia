/**
 * El texto de cada página de un PDF de Chrome (encargo 10.4, Tanda 4), para los
 * jueces del informe: dónde empieza cada sección, el número de cada página y
 * que el final del informe está en el PDF (docs/BITACORA.md, 2026-10-05: el
 * PDF perdía su última página y el juez solo contaba páginas). Sin
 * dependencias: lee lo que escribe Chrome (Skia), no cualquier PDF.
 *
 * Cómo lo escribe Chrome, visto en el PDF del informe: objetos sueltos
 * («N 0 obj … endobj», sin flujos de objetos), flujos con FlateDecode, fuentes
 * Type3 de un byte por código con su mapa /ToUnicode, y cada glifo en su
 * propio Tj, con Td entre uno y otro, dentro de BT … ET y de matrices cm
 * anidadas (q … Q). Se sigue la posición de cada glifo (la matriz de texto por
 * la de la página) y se juntan en líneas por su altura, de arriba abajo y de
 * izquierda a derecha. Lo que no sabe leer, lo dice (lanza), no lo salta.
 *
 * [DOC] ISO 32000-1:2008 (PDF 1.7, la copia que publica Adobe): § 7.3.10
 *    (objetos indirectos, «obj» y «endobj»), § 7.3.8 (flujos, «stream» y
 *    «endstream», /Length y /Filter), § 7.7.3 (árbol de páginas: /Kids en
 *    orden), § 8.3.2 y § 8.4.4 (la matriz actual, cm, q y Q), § 9.4.2 y
 *    § 9.4.3 (Tm, Td, TD, T*, Tj, TJ, ' y "), § 9.10.3 (/ToUnicode: bfchar y
 *    bfrange) y § 8.10 (XObject de forma, Do, /Matrix).
 * [DOC] https://nodejs.org/api/zlib.html — inflateSync: FlateDecode es zlib.
 */
import { inflateSync } from 'node:zlib';

type Matriz = [number, number, number, number, number, number];

/** Un objeto del PDF: su diccionario (el texto hasta «stream») y su flujo, ya inflado. */
interface Objeto {
  dic: string;
  flujo: Buffer | null;
}

/** Un glifo (o un trozo de texto) con el sitio donde empieza, en puntos de la página (y hacia arriba), y su letra. */
interface Trozo {
  x: number;
  y: number;
  /** Lo que avanza en la página (la suma de los anchos de sus glifos), en puntos. */
  avance: number;
  texto: string;
  tamano: number;
  familia: string;
  peso: number;
  color: string;
}

/**
 * Un tramo de una línea del PDF: el texto seguido con la misma letra (familia,
 * peso, tamaño y color), con el sitio donde empieza.
 */
export interface TramoDelPdf {
  /** Desde el borde izquierdo de la página, en px CSS (1 pt = 4/3 px). */
  x: number;
  /** Dónde acaba su último glifo, desde el borde izquierdo, en px CSS. */
  fin: number;
  texto: string;
  /** El cuerpo de la letra, en px CSS. */
  tamano: number;
  /** La familia y el peso del FontDescriptor de su fuente (Chrome escribe FontFamily y FontWeight). */
  familia: string;
  peso: number;
  /** El color de relleno, como lo da getComputedStyle: «rgb(26, 26, 26)». */
  color: string;
}

/** Una línea del PDF: su línea base, desde el borde de arriba de la página, y sus tramos de izquierda a derecha. */
export interface LineaDelPdf {
  /** La línea base, desde el borde de arriba de la página, en px CSS. */
  y: number;
  /** Dónde empieza su primer glifo que no es un blanco y dónde acaba el último, desde el borde izquierdo, en px CSS. */
  x: number;
  fin: number;
  texto: string;
  tramos: TramoDelPdf[];
}

/** Una página del PDF: su tamaño (de su MediaBox) y sus líneas de arriba abajo, todo en px CSS. */
export interface PaginaDelPdf {
  ancho: number;
  alto: number;
  lineas: LineaDelPdf[];
}

/** Puntos PDF (1/72 de pulgada) a px CSS (1/96 de pulgada). */
const PX = 96 / 72;

const por = (m: Matriz, n: Matriz): Matriz => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4],
  m[4] * n[1] + m[5] * n[3] + n[5],
];
const IDENTIDAD: Matriz = [1, 0, 0, 1, 0, 0];

/** Los objetos del PDF por su número. */
function objetos(pdf: Buffer): Map<number, Objeto> {
  const s = pdf.toString('latin1');
  const salida = new Map<number, Objeto>();
  const inicio = /(\d+) 0 obj\b/g;
  for (let m = inicio.exec(s); m !== null; m = inicio.exec(s)) {
    const desde = m.index + m[0].length;
    const marca = /\bstream\r?\n|\bendobj\b/g;
    marca.lastIndex = desde;
    const siguiente = marca.exec(s);
    if (siguiente === null) throw new Error(`el objeto ${m[1]} no termina`);
    const dic = s.slice(desde, siguiente.index);
    let flujo: Buffer | null = null;
    let fin = siguiente.index + siguiente[0].length;
    if (siguiente[0].startsWith('stream')) {
      const largo = /\/Length (\d+)\b(?!\s+\d+\s+R)/.exec(dic);
      const datos = largo !== null ? siguiente.index + siguiente[0].length + Number(largo[1]) : s.indexOf('endstream', fin);
      const bruto = pdf.subarray(fin, datos);
      const filtro = /\/Filter\s*\/(\w+)/.exec(dic)?.[1];
      if (filtro !== undefined && filtro !== 'FlateDecode') throw new Error(`el objeto ${m[1]} lleva un filtro que no se lee: ${filtro}`);
      flujo = filtro === 'FlateDecode' ? inflateSync(bruto) : bruto;
      fin = s.indexOf('endobj', datos);
    }
    salida.set(Number(m[1]), { dic, flujo });
    inicio.lastIndex = fin;
  }
  return salida;
}

/** Lo que va entre los << >> de una clave de un diccionario (sin anidar más), o la referencia a otro objeto que lo tiene. */
function subdiccionario(dic: string, clave: string, todos: Map<number, Objeto>): string {
  const ref = new RegExp(`/${clave}\\s+(\\d+) 0 R`).exec(dic);
  if (ref !== null) return todos.get(Number(ref[1]))?.dic ?? '';
  const i = dic.indexOf(`/${clave}`);
  if (i < 0) return '';
  const abre = dic.indexOf('<<', i);
  let nivel = 0;
  for (let j = abre; j < dic.length - 1; j++) {
    if (dic.startsWith('<<', j)) nivel++, j++;
    else if (dic.startsWith('>>', j)) {
      nivel--;
      j++;
      if (nivel === 0) return dic.slice(abre + 2, j - 1);
    }
  }
  throw new Error(`/${clave} sin cerrar`);
}

/** «/Nombre N 0 R» de un diccionario: nombre → número de objeto. */
const referencias = (dic: string): Map<string, number> => new Map([...dic.matchAll(/\/([\w.+-]+)\s+(\d+) 0 R/g)].map((m) => [m[1]!, Number(m[2])]));

/** El mapa /ToUnicode de una fuente: código (en hexadecimal) → texto. */
function aUnicode(cmap: string): Map<string, string> {
  const texto = (hex: string): string => {
    const unidades: number[] = [];
    for (let i = 0; i < hex.length; i += 4) unidades.push(parseInt(hex.slice(i, i + 4), 16));
    return String.fromCharCode(...unidades);
  };
  const mapa = new Map<string, string>();
  for (const bloque of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const [, de, a] of bloque[1]!.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) mapa.set(de!.toUpperCase(), texto(a!));
  }
  for (const bloque of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const [, de, hasta, a, lista] of bloque[1]!.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]+)>|\[([^\]]*)\])/g)) {
      const [primero, ultimo, largo] = [parseInt(de!, 16), parseInt(hasta!, 16), de!.length];
      const destinos = lista === undefined ? null : [...lista.matchAll(/<([0-9A-Fa-f]+)>/g)].map((x) => texto(x[1]!));
      for (let c = primero; c <= ultimo; c++) {
        const codigo = c.toString(16).toUpperCase().padStart(largo, '0');
        if (destinos !== null) mapa.set(codigo, destinos[c - primero] ?? '');
        else {
          const base = texto(a!);
          mapa.set(codigo, base.slice(0, -1) + String.fromCharCode(base.charCodeAt(base.length - 1) + c - primero));
        }
      }
    }
  }
  return mapa;
}

/** Las piezas de un flujo de contenido: números, nombres, cadenas (en hexadecimal), arrays y operadores. */
function* piezas(contenido: string): Generator<{ tipo: 'numero' | 'nombre' | 'cadena' | 'array' | 'operador'; valor: string; lista?: string[] }> {
  let i = 0;
  const literal = (): string => {
    // ( … ) con escapes y paréntesis anidados, a hexadecimal.
    let nivel = 1;
    const bytes: number[] = [];
    i++;
    while (i < contenido.length && nivel > 0) {
      const c = contenido[i]!;
      if (c === '\\') {
        const n = contenido[i + 1]!;
        const escapes: Record<string, number> = { n: 10, r: 13, t: 9, b: 8, f: 12, '(': 40, ')': 41, '\\': 92 };
        if (/[0-7]/.test(n)) {
          const oct = /^[0-7]{1,3}/.exec(contenido.slice(i + 1))![0];
          bytes.push(parseInt(oct, 8));
          i += 1 + oct.length;
          continue;
        }
        if (n in escapes) bytes.push(escapes[n]!);
        i += 2;
        continue;
      }
      if (c === '(') nivel++;
      if (c === ')' && --nivel === 0) break;
      bytes.push(c.charCodeAt(0));
      i++;
    }
    i++;
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  while (i < contenido.length) {
    const c = contenido[i]!;
    if (/\s/.test(c)) i++;
    else if (c === '%') i = contenido.indexOf('\n', i) < 0 ? contenido.length : contenido.indexOf('\n', i);
    else if (contenido.startsWith('<<', i) || contenido.startsWith('>>', i)) i += 2;
    else if (c === '<') {
      const fin = contenido.indexOf('>', i);
      yield { tipo: 'cadena', valor: contenido.slice(i + 1, fin).replace(/\s/g, '').toUpperCase() };
      i = fin + 1;
    } else if (c === '(') yield { tipo: 'cadena', valor: literal() };
    else if (c === '[') {
      // Un array de TJ: sus cadenas (los números de entre medias, que solo separan, no cuentan).
      const lista: string[] = [];
      i++;
      while (i < contenido.length && contenido[i] !== ']') {
        if (contenido[i] === '<') {
          const fin = contenido.indexOf('>', i);
          lista.push(contenido.slice(i + 1, fin).replace(/\s/g, '').toUpperCase());
          i = fin + 1;
        } else if (contenido[i] === '(') lista.push(literal());
        else i++;
      }
      i++;
      yield { tipo: 'array', valor: '', lista };
    } else if (c === '/') {
      const m = /^\/[^\s/<>[\]()%{}]+/.exec(contenido.slice(i))![0];
      yield { tipo: 'nombre', valor: m.slice(1) };
      i += m.length;
    } else if (/[-+.\d]/.test(c)) {
      const m = /^[-+]?(\d+\.?\d*|\.\d+)/.exec(contenido.slice(i))![0];
      yield { tipo: 'numero', valor: m };
      i += m.length;
    } else {
      const m = /^[^\s/<>[\]()%{}]+/.exec(contenido.slice(i))![0];
      yield { tipo: 'operador', valor: m };
      i += m.length;
    }
  }
}

/** Los trozos de texto de un flujo de contenido, con sus recursos y la matriz con que se dibuja. */
function trozosDe(contenido: Buffer, recursos: string, matriz: Matriz, todos: Map<number, Objeto>, salida: Trozo[]): void {
  const fuentes = referencias(subdiccionario(recursos, 'Font', todos));
  const formas = referencias(subdiccionario(recursos, 'XObject', todos));
  const mapas = new Map<string, Map<string, string>>();
  /** La letra de una fuente (familia y peso de su FontDescriptor) y el ancho de sus glifos (§ 9.6.2 y § 9.6.5: /FirstChar, /Widths y /FontMatrix). */
  const letras = new Map<string, { familia: string; peso: number; ancho: (codigo: number) => number }>();
  const letraDe = (fuente: string): { familia: string; peso: number; ancho: (codigo: number) => number } => {
    if (!letras.has(fuente)) {
      const objeto = todos.get(fuentes.get(fuente) ?? -1);
      const fd = objeto === undefined ? null : /\/FontDescriptor (\d+) 0 R/.exec(objeto.dic);
      const descriptor = fd === null ? '' : (todos.get(Number(fd[1]))?.dic ?? '');
      const familia = /\/FontFamily\s*\(((?:[^()\\]|\\.)*)\)/.exec(descriptor)?.[1]?.replace(/\\(.)/g, '$1') ?? '';
      // Las fuentes simples, como las Type3 de Skia, dicen el ancho de cada código; las demás (Type0, con /W) no se miden: 0.
      const primero = Number(/\/FirstChar\s+(\d+)/.exec(objeto?.dic ?? '')?.[1] ?? 0);
      const anchos = (/\/Widths\s*\[([^\]]*)\]/.exec(objeto?.dic ?? '')?.[1] ?? '').trim().split(/\s+/).filter((x) => x !== '').map(Number);
      const escala = Number(/\/FontMatrix\s*\[\s*([-\d.]+)/.exec(objeto?.dic ?? '')?.[1] ?? 0.001);
      letras.set(fuente, { familia, peso: Number(/\/FontWeight\s+(\d+)/.exec(descriptor)?.[1] ?? 0), ancho: (codigo) => (anchos[codigo - primero] ?? 0) * escala });
    }
    return letras.get(fuente)!;
  };
  const mapaDe = (fuente: string): Map<string, string> => {
    if (!mapas.has(fuente)) {
      const objeto = todos.get(fuentes.get(fuente) ?? -1);
      const tu = objeto === undefined ? null : /\/ToUnicode (\d+) 0 R/.exec(objeto.dic);
      const cmap = tu === null ? undefined : todos.get(Number(tu[1]))?.flujo;
      if (cmap === undefined || cmap === null) throw new Error(`la fuente ${fuente} no trae /ToUnicode`);
      mapas.set(fuente, aUnicode(cmap.toString('latin1')));
    }
    return mapas.get(fuente)!;
  };
  let ctm = matriz;
  const pila: Matriz[] = [];
  let tm: Matriz = IDENTIDAD;
  let tlm: Matriz = IDENTIDAD;
  let fuente = '';
  let cuerpo = 0;
  let interlineado = 0;
  let color = 'rgb(0, 0, 0)';
  const pilaDeColor: string[] = [];
  let operandos: { tipo: string; valor: string; lista?: string[] }[] = [];
  const n = (k: number): number => Number(operandos[operandos.length - k]!.valor);
  const rgb = (r: number, g: number, b: number): string => `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  const escribir = (hex: string): void => {
    const mapa = mapaDe(fuente);
    const { familia, peso, ancho } = letraDe(fuente);
    const largo = [...mapa.keys()][0]?.length ?? 2;
    let texto = '';
    let anchoEnTexto = 0;
    for (let i = 0; i < hex.length; i += largo) {
      texto += mapa.get(hex.slice(i, i + largo)) ?? '';
      anchoEnTexto += ancho(parseInt(hex.slice(i, i + largo), 16));
    }
    const sitio = por(tm, ctm);
    // El cuerpo en la página: el de Tf por la escala vertical de la matriz del texto por la de la página (§ 9.4.4); el
    // avance, el ancho de los glifos por el cuerpo y por la escala horizontal.
    salida.push({ x: sitio[4], y: sitio[5], avance: anchoEnTexto * cuerpo * Math.hypot(sitio[0], sitio[1]), texto, tamano: cuerpo * Math.hypot(sitio[2], sitio[3]), familia, peso, color });
  };
  const linea = (tx: number, ty: number): void => {
    tlm = por([1, 0, 0, 1, tx, ty], tlm);
    tm = tlm;
  };
  for (const p of piezas(contenido.toString('latin1'))) {
    if (p.tipo !== 'operador') {
      operandos.push(p);
      continue;
    }
    switch (p.valor) {
      case 'q':
        pila.push(ctm);
        pilaDeColor.push(color);
        break;
      case 'Q':
        ctm = pila.pop() ?? matriz;
        color = pilaDeColor.pop() ?? color;
        break;
      case 'rg':
        color = rgb(n(3), n(2), n(1));
        break;
      case 'g':
        color = rgb(n(1), n(1), n(1));
        break;
      case 'cm':
        ctm = por([n(6), n(5), n(4), n(3), n(2), n(1)], ctm);
        break;
      case 'BT':
        tm = tlm = IDENTIDAD;
        break;
      case 'Tf':
        fuente = operandos[operandos.length - 2]!.valor;
        cuerpo = n(1);
        break;
      case 'TL':
        interlineado = n(1);
        break;
      case 'Tm':
        tm = tlm = [n(6), n(5), n(4), n(3), n(2), n(1)];
        break;
      case 'Td':
        linea(n(2), n(1));
        break;
      case 'TD':
        interlineado = -n(1);
        linea(n(2), n(1));
        break;
      case 'T*':
        linea(0, -interlineado);
        break;
      case 'Tj':
        escribir(operandos[operandos.length - 1]!.valor);
        break;
      case "'":
        linea(0, -interlineado);
        escribir(operandos[operandos.length - 1]!.valor);
        break;
      case '"':
        linea(0, -interlineado);
        escribir(operandos[operandos.length - 1]!.valor);
        break;
      case 'TJ':
        escribir((operandos[operandos.length - 1]!.lista ?? []).join(''));
        break;
      case 'Do': {
        const forma = todos.get(formas.get(operandos[operandos.length - 1]!.valor) ?? -1);
        if (forma !== undefined && /\/Subtype\s*\/Form/.test(forma.dic) && forma.flujo !== null) {
          const m = /\/Matrix\s*\[([^\]]*)\]/.exec(forma.dic)?.[1]?.trim().split(/\s+/).map(Number);
          const propia: Matriz = m !== undefined && m.length === 6 ? (m as Matriz) : IDENTIDAD;
          trozosDe(forma.flujo, subdiccionario(forma.dic, 'Resources', todos) || recursos, por(propia, ctm), todos, salida);
        }
        break;
      }
    }
    operandos = [];
  }
}

/** Las páginas del PDF, en orden: por cada una, sus líneas de texto de arriba abajo. */
export function textoDeLasPaginas(pdf: Buffer): string[][] {
  return lineasDeLasPaginas(pdf).map((p) => p.lineas.map((l) => l.texto));
}

/**
 * Las páginas del PDF, en orden, con su tamaño y sus líneas: dónde va cada una
 * (su línea base y su primer glifo) y la letra de cada tramo, en px CSS desde
 * la esquina de arriba a la izquierda, como las cajas de getBoundingClientRect
 * (desde el 10.4, Tanda 4 bis: el juez de fidelidad del papel).
 * [DOC] ISO 32000-1:2008, § 9.4.4 (la matriz con que se dibuja un glifo: el
 *    cuerpo de Tf, por Tm, por la matriz actual), § 9.8.1 (FontDescriptor:
 *    FontFamily y FontWeight) y § 8.6.8 (rg y g: el color de relleno).
 */
export function lineasDeLasPaginas(pdf: Buffer): PaginaDelPdf[] {
  const todos = objetos(pdf);
  const raiz = [...todos.values()].find((o) => /\/Type\s*\/Pages\b/.test(o.dic) && !/\/Parent\s/.test(o.dic));
  if (raiz === undefined) throw new Error('el PDF no tiene árbol de páginas');
  const paginas: Objeto[] = [];
  const recorrer = (nodo: Objeto): void => {
    if (/\/Type\s*\/Page\b(?!s)/.test(nodo.dic)) {
      paginas.push(nodo);
      return;
    }
    const hijos = /\/Kids\s*\[([^\]]*)\]/.exec(nodo.dic)?.[1] ?? '';
    for (const [, num] of hijos.matchAll(/(\d+) 0 R/g)) recorrer(todos.get(Number(num))!);
  };
  recorrer(raiz);
  return paginas.map((pagina) => {
    const recursos = subdiccionario(pagina.dic, 'Resources', todos);
    const contenidos = /\/Contents\s*\[([^\]]*)\]/.exec(pagina.dic)?.[1] ?? /\/Contents\s+(\d+ 0 R)/.exec(pagina.dic)?.[1] ?? '';
    // La MediaBox, de la página o heredada de su nodo (§ 7.7.3.4).
    let caja: string | undefined;
    for (let nodo: Objeto | undefined = pagina; nodo !== undefined && caja === undefined; nodo = todos.get(Number(/\/Parent (\d+) 0 R/.exec(nodo.dic)?.[1] ?? -1))) {
      caja = /\/MediaBox\s*\[([^\]]*)\]/.exec(nodo.dic)?.[1];
    }
    const [x0, y0, x1, y1] = (caja ?? '0 0 0 0').trim().split(/\s+/).map(Number) as [number, number, number, number];
    const trozos: Trozo[] = [];
    for (const [, num] of contenidos.matchAll(/(\d+) 0 R/g)) {
      const flujo = todos.get(Number(num))?.flujo;
      if (flujo !== null && flujo !== undefined) trozosDe(flujo, recursos, IDENTIDAD, todos, trozos);
    }
    // En líneas: los trozos a la misma altura (±2 puntos), de arriba abajo y, en cada línea, de izquierda a derecha.
    const grupos: Trozo[][] = [];
    for (const t of [...trozos].sort((a, b) => b.y - a.y)) {
      const ultima = grupos.at(-1);
      if (ultima !== undefined && Math.abs(ultima[0]!.y - t.y) <= 2) ultima.push(t);
      else grupos.push([t]);
    }
    const lineas: LineaDelPdf[] = [];
    const enPx = (x: number): number => Math.round((x - x0) * PX * 100) / 100;
    for (const grupo of grupos) {
      // Los tramos, con la x de su primer glifo que no es un blanco: los blancos no cuentan para dónde empieza el texto.
      // Y su fin, el del último glifo que no es un blanco.
      const tramos: (TramoDelPdf & { visible: boolean })[] = [];
      for (const t of grupo.sort((a, b) => a.x - b.x)) {
        const ultimo = tramos.at(-1);
        const letra = { tamano: Math.round(t.tamano * PX * 100) / 100, familia: t.familia, peso: t.peso, color: t.color };
        const blanco = t.texto.trim() === '';
        const fin = enPx(t.x + t.avance);
        if (ultimo !== undefined && ultimo.tamano === letra.tamano && ultimo.familia === letra.familia && ultimo.peso === letra.peso && ultimo.color === letra.color) {
          ultimo.texto += t.texto;
          if (!ultimo.visible && !blanco) Object.assign(ultimo, { x: enPx(t.x), visible: true });
          if (!blanco) ultimo.fin = fin;
        } else tramos.push({ x: enPx(t.x), fin: blanco ? enPx(t.x) : fin, texto: t.texto, ...letra, visible: !blanco });
      }
      const visibles = tramos.filter((t) => t.visible).map(({ visible: _, ...t }) => ({ ...t, texto: t.texto.trim() }));
      if (visibles.length === 0) continue;
      lineas.push({ y: Math.round((y1 - grupo[0]!.y) * PX * 100) / 100, x: visibles[0]!.x, fin: visibles.at(-1)!.fin, texto: tramos.map((t) => t.texto).join('').trim(), tramos: visibles });
    }
    return { ancho: Math.round((x1 - x0) * PX * 100) / 100, alto: Math.round((y1 - y0) * PX * 100) / 100, lineas };
  });
}
