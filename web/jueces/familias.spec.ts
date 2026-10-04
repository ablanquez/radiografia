/**
 * Los jueces de las familias en el texto (encargo 10.4, Tanda 2; DISEÑO §4 y
 * §7): el color, la línea, el tinte y la sigla de cada familia por su id, y
 * cómo se ve cada tramo.
 *
 *   1. Cada familia de los dos paquetes incluidos tiene su token, y cada uno
 *      de los ocho tokens es de una sola familia; una familia sin token (la de
 *      un paquete propio, aunque se llame como una incluida), la clase de los
 *      propios.
 *   2. El cálculo del tinte: el de cada familia en tokens.json es su color al
 *      14 % sobre blanco, y el del activo, al 28 % (color-mix en sRGB: cada
 *      canal, c·p + 255·(1 − p)), con un margen de una unidad por redondeo.
 *   3. indexar da a cada familia su clase por su id, y las siglas son las del
 *      DISEÑO §4 (L, D, S, E, P, C, G, O).
 *   4. En Chrome, con el texto de combinacion-real: cada tramo lleva en su
 *      primera capa el tinte y la línea de su familia (color, estilo, grosor y
 *      desplazamiento de los tokens); Ortotipografía, sus dos líneas
 *      discontinuas de fondo; detrás, la sigla voladita (11 px, ink-2,
 *      vertical-align super, aria-hidden) con las siglas del tramo; de nombre
 *      accesible, sus reglas y su texto.
 *   5. Un solape: el tinte, solo el de la primera familia; la línea de la
 *      segunda, más abajo que la de la primera.
 *   6. Un tramo largo se parte entre renglones (sigue en línea: no es un
 *      bloque) y cada renglón lleva su tinte (box-decoration-break: clone).
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix
 *    — «returns the result of mixing them in a given colorspace by a given
 *    amount»; con un solo porcentaje, «p2 = 100% - p1».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects
 *    — «a collection of DOMRect objects that indicate the bounding rectangles
 *    for each CSS border box in a client»: un elemento en línea partido en dos
 *    renglones da dos.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { claseDeFamilia, TOKEN_DE_FAMILIA, TOKENS_DE_FAMILIA } from '../src/pantalla/familias.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const TOKENS = JSON.parse(readFileSync(new URL('../../docs/figma/tokens.json', import.meta.url), 'utf8')) as {
  color: Record<string, { $value: { components: [number, number, number] } }>;
  subrayado: Record<string, { estilo: { $value: string }; grosor: { $value: { value: number } }; desplazamiento: { $value: { value: number } } }>;
};

/** Un color de tokens.json en canales de 0 a 255. */
const canales = (nombre: string): number[] => TOKENS.color[nombre]!.$value.components.map((c) => c * 255);
const rgb = (nombre: string): string => `rgb(${canales(nombre).map(Math.round).join(', ')})`;

describe('las familias: su token, su tinte y sus siglas', () => {
  test('1 · cada familia incluida, su token; cada token, una familia; sin token, la clase de los propios', () => {
    const familias = paquetesIncluidos().flatMap((p) => p.cabecera.familias.map((f) => [p.cabecera.nombre, f.id] as const));
    assert.deepEqual(familias.filter(([p, f]) => TOKEN_DE_FAMILIA[p]?.[f] === undefined), [], 'familias incluidas sin token');
    assert.deepEqual(
      familias.map(([p, f]) => TOKEN_DE_FAMILIA[p]![f]).sort(),
      [...TOKENS_DE_FAMILIA].sort(),
      'los ocho tokens, uno por familia',
    );
    assert.deepEqual(
      [claseDeFamilia('RadiografIA', 'puntuacion-formato'), claseDeFamilia('Paquete de prueba', 'lexico'), claseDeFamilia('RadiografIA', 'constructor'), claseDeFamilia('constructor', 'lexico')],
      ['fam-puntuacion', 'fam-propia', 'fam-propia', 'fam-propia'],
    );
  });

  test('2 · el tinte de cada familia es su color al 14 % sobre blanco, y el del activo, al 28 %', () => {
    const fuera: string[] = [];
    for (const token of TOKENS_DE_FAMILIA) {
      for (const [prefijo, p] of [['tinte', 0.14], ['tinte-activo', 0.28]] as const) {
        const esperado = canales(token).map((c) => c * p + 255 * (1 - p));
        const dado = canales(`${prefijo}-${token}`);
        if (esperado.some((c, i) => Math.abs(c - dado[i]!) > 1)) fuera.push(`${prefijo}-${token}: ${dado.map(Math.round)} frente a ${esperado.map(Math.round)}`);
      }
    }
    assert.deepEqual(fuera, []);
  });

  test('3 · indexar: la clase de cada familia, por su id; las siglas, las del DISEÑO §4', () => {
    const indice = indexar(paquetesIncluidos());
    assert.deepEqual(
      indice.familias.map((f) => [f.clave, f.clase, indice.siglaDeFamilia.get(f.clave)]),
      [
        ['RadiografIA::canal', 'fam-canal', 'C'],
        ['RadiografIA::discurso', 'fam-discurso', 'D'],
        ['RadiografIA::estadistica', 'fam-estadistica', 'E'],
        ['RadiografIA::lexico', 'fam-lexico', 'L'],
        ['RadiografIA::puntuacion-formato', 'fam-puntuacion', 'P'],
        ['RadiografIA::sintaxis', 'fam-sintaxis', 'S'],
        ['Español correcto::gramatica', 'fam-gramatica', 'G'],
        ['Español correcto::ortotipografia', 'fam-ortotipografia', 'O'],
      ],
    );
  });
});

interface Capa {
  clase: string;
  fondo: string;
  imagen: string;
  linea: string;
  estilo: string;
  grosor: string;
  desplazamiento: string;
  color: string;
  corte: string;
}
interface TramoVisto {
  familias: string;
  siglas: string;
  nombre: string | null;
  texto: string;
  capas: Capa[];
  sigla: { texto: string; oculta: string | null; tam: string; color: string; alineacion: string } | null;
  renglones: number;
  display: string;
}

describe('las familias en Chrome, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });

  let vistos: TramoVisto[] | undefined;
  /** Analiza combinacion-real una vez y lee cada tramo: sus capas, su sigla y sus renglones. */
  const tramos = async (): Promise<TramoVisto[]> => {
    if (vistos !== undefined) return vistos;
    const pestana = await p();
    await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await pestana.evaluar(`(() => {
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`document.querySelectorAll('#vista .tramo').length > 0`, 'los subrayados');
    vistos = await pestana.evaluar<TramoVisto[]>(`[...document.querySelectorAll('#vista .tramo')].map((t) => {
      const capas = [];
      for (let c = t.querySelector(':scope > .capa'); c; c = c.querySelector(':scope > .capa')) {
        const s = getComputedStyle(c);
        capas.push({ clase: c.className, fondo: s.backgroundColor, imagen: s.backgroundImage, linea: s.textDecorationLine, estilo: s.textDecorationStyle, grosor: s.textDecorationThickness, desplazamiento: s.textUnderlineOffset, color: s.textDecorationColor, corte: s.boxDecorationBreak || s.webkitBoxDecorationBreak });
      }
      const g = t.querySelector(':scope > .sigla-tramo');
      const sg = g && getComputedStyle(g);
      return { familias: t.dataset.familias, siglas: t.dataset.siglas, nombre: t.getAttribute('aria-label'), texto: [...t.querySelectorAll('.capa')].at(-1).textContent,
        capas, sigla: g && { texto: g.textContent, oculta: g.getAttribute('aria-hidden'), tam: sg.fontSize, color: sg.color, alineacion: sg.verticalAlign },
        renglones: t.getClientRects().length, display: getComputedStyle(t).display };
    })`);
    return vistos;
  };

  test('4 · cada tramo: el tinte y la línea de su familia, la sigla voladita y el nombre de sus reglas', async () => {
    const lista = await tramos();
    const indice = indexar(paquetesIncluidos());
    const fallos: string[] = [];
    for (const t of lista) {
      const primera = t.familias.split('|')[0]!;
      const token = indice.claseDeFamilia.get(primera)!.replace('fam-', '');
      const capa = t.capas[0]!;
      const s = TOKENS.subrayado[token]!;
      const esperada = token === 'ortotipografia'
        ? { fondo: rgb(`tinte-${token}`), linea: 'none' }
        : { fondo: rgb(`tinte-${token}`), linea: 'underline', estilo: s.estilo.$value, grosor: `${s.grosor.$value.value}px`, desplazamiento: `${s.desplazamiento.$value.value}px`, color: rgb(token) };
      for (const [k, v] of Object.entries(esperada)) if (capa[k as keyof Capa] !== v) fallos.push(`«${t.texto}» (${token}) · ${k}: ${capa[k as keyof Capa]}, y es ${v}`);
      if (token === 'ortotipografia' && (capa.imagen.match(/linear-gradient/g) ?? []).length !== 2) fallos.push(`«${t.texto}»: Ortotipografía sin sus dos líneas de fondo (${capa.imagen})`);
      if (t.sigla === null || t.sigla.texto !== t.siglas || t.sigla.oculta !== 'true' || t.sigla.tam !== '11px' || t.sigla.color !== rgb('ink-2') || t.sigla.alineacion !== 'super') fallos.push(`«${t.texto}»: la sigla voladita ${JSON.stringify(t.sigla)}`);
      if (t.nombre === null || !t.nombre.endsWith(`: “${t.texto.replace(/\s+/g, ' ').trim()}”`)) fallos.push(`«${t.texto}»: el nombre accesible ${t.nombre}`);
    }
    assert.ok(lista.length >= 20, `${lista.length} tramos`);
    assert.deepEqual(fallos, []);
    const nombres = new Set(paquetesIncluidos().flatMap((x) => x.reglas.map((r) => r.nombre)));
    assert.deepEqual(lista.filter((t) => !nombres.has(t.nombre!.split(': “')[0]!.split(' y ')[0]!)).map((t) => t.nombre), [], 'el nombre empieza por el de una regla');
  });

  test('5 · un solape: el tinte, el de la primera familia; la línea de la segunda, por debajo de la de la primera', async () => {
    const solape = (await tramos()).find((t) => t.capas.length > 1);
    assert.ok(solape, 'combinacion-real tiene un solape (Canal y Ortotipografía en «## »)');
    const [primera, segunda] = solape.capas as [Capa, Capa];
    assert.equal(segunda.fondo, 'rgba(0, 0, 0, 0)', 'la segunda capa, sin tinte');
    if (segunda.linea === 'underline') {
      assert.ok(Number.parseFloat(segunda.desplazamiento) >= Number.parseFloat(primera.desplazamiento) + Number.parseFloat(primera.grosor) + 2, `${segunda.desplazamiento} frente a ${primera.desplazamiento} + ${primera.grosor}`);
    } else {
      // Ortotipografía de segunda capa: sus líneas son de fondo, abajo del todo, debajo de la línea de la primera.
      assert.match(segunda.imagen, /linear-gradient.*linear-gradient/);
    }
  });

  test('6 · un tramo largo se parte entre renglones, en línea, con su tinte en cada uno', async () => {
    const largos = (await tramos()).filter((t) => t.renglones > 1);
    assert.ok(largos.length > 0, 'ningún tramo partido entre renglones a 1280');
    for (const t of largos) {
      assert.equal(t.display, 'inline', `«${t.texto}»`);
      assert.equal(t.capas[0]!.corte, 'clone', `«${t.texto}»: box-decoration-break`);
    }
  });
});
