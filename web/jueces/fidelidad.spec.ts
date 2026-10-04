/**
 * El juez de fidelidad al modelo (encargo 10.4, Tanda 1): compara la web
 * construida con las medidas del prototipo de Figma Make que guarda
 * docs/figma/medidas-modelo.json (las toma scripts/medir-modelo.ts por CDP; el
 * juez no sale a Internet). En esta tanda, las piezas que ya existen: la
 * cabecera, el pie, los botones, el cuadro de texto y su etiqueta, la columna
 * de texto, la vista del texto y los márgenes de la página en los tres
 * tamaños. El icono (c) de la cabecera no está en el modelo: su medida viene
 * del DISEÑO §8 (56 px en escritorio y 48 en móvil, corregida por Antonio al
 * ver la Tanda 1) y el fichero la lleva con su origen y su nota.
 *
 * Tolerancia (encargo): ±1 px en las longitudes y ±0,01 en las proporciones
 * (el interletrado, en em); la familia, el peso, el estilo, el color, la
 * decoración y el texto, iguales.
 *
 *   1. El fichero de medidas es del prototipo y trae cada pieza que se juzga;
 *      la que no sale del prototipo dice de qué apartado del DISEÑO sale.
 *   2. A 1280 (escritorio), cada pieza como en el modelo.
 *   3. La vista del texto, ya analizado, como la del modelo.
 *   4. A 820 (tableta) y a 390 (móvil), lo que cambia con el tamaño: los
 *      márgenes, la cabecera compacta y el botón principal.
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
 *    — «the resolved values of all CSS properties of an element».
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EJEMPLOS_PUBLICOS } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const MEDIDAS = new URL('../../docs/figma/medidas-modelo.json', import.meta.url);

type Propiedad = 'familia' | 'tamano' | 'peso' | 'estilo' | 'interlineado' | 'interletrado' | 'color' | 'fondo' | 'decoracion' | 'bordeArriba' | 'bordeAbajo' | 'radio' | 'relleno' | 'ancho' | 'alto' | 'desdeElMarco' | 'texto';
type Medida = Partial<Record<Propiedad, unknown>>;
interface Caso {
  clave: string;
  selector: string;
  propiedades: readonly Propiedad[];
}

const TIPO: readonly Propiedad[] = ['familia', 'tamano', 'peso', 'interlineado', 'color'];
const BOTON: readonly Propiedad[] = [...TIPO, 'fondo', 'bordeArriba', 'radio', 'alto', 'relleno'];
const ESCRITORIO: readonly Caso[] = [
  { clave: 'escritorio.cabecera', selector: '.cabecera', propiedades: ['bordeAbajo', 'desdeElMarco'] },
  { clave: 'escritorio.cabecera.marca', selector: '.cabecera .marca', propiedades: ['relleno'] },
  { clave: 'escritorio.cabecera.icono', selector: '.cabecera .icono-marca', propiedades: ['ancho', 'alto'] },
  { clave: 'escritorio.cabecera.nombre', selector: '.cabecera .nombre', propiedades: [...TIPO, 'interletrado', 'texto'] },
  { clave: 'escritorio.cabecera.eslogan', selector: '.cabecera .eslogan', propiedades: [...TIPO, 'estilo', 'texto'] },
  { clave: 'escritorio.cabecera.enlace', selector: '.cabecera nav a', propiedades: [...TIPO, 'decoracion', 'alto', 'texto'] },
  { clave: 'escritorio.pie', selector: '.pie', propiedades: [...TIPO, 'bordeArriba', 'relleno', 'texto'] },
  { clave: 'escritorio.boton.principal', selector: '#analizar', propiedades: [...BOTON, 'texto'] },
  { clave: 'escritorio.boton.secundario', selector: '#ejemplo-humano', propiedades: BOTON },
  { clave: 'escritorio.cuadro', selector: '#texto', propiedades: [...TIPO, 'fondo', 'bordeArriba', 'radio', 'relleno'] },
  { clave: 'escritorio.cuadro.etiqueta', selector: 'label[for="texto"]', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.columna-texto', selector: '#formulario', propiedades: ['ancho'] },
];
const VISTA: Caso = { clave: 'escritorio.vista', selector: '#vista', propiedades: [...TIPO, 'ancho'] };
const TABLETA: readonly Caso[] = [{ clave: 'tableta.cabecera', selector: '.cabecera', propiedades: ['desdeElMarco'] }];
const MOVIL: readonly Caso[] = [
  { clave: 'movil.cabecera', selector: '.cabecera', propiedades: ['desdeElMarco', 'bordeAbajo'] },
  { clave: 'movil.cabecera.marca', selector: '.cabecera .marca', propiedades: ['relleno'] },
  { clave: 'movil.cabecera.icono', selector: '.cabecera .icono-marca', propiedades: ['ancho', 'alto'] },
  { clave: 'movil.cabecera.nombre', selector: '.cabecera .nombre', propiedades: [...TIPO, 'interletrado'] },
  { clave: 'movil.cabecera.enlace', selector: '.cabecera nav a', propiedades: ['alto', 'texto'] },
  { clave: 'movil.boton.principal', selector: '#analizar', propiedades: ['alto'] },
];

const px = (v: unknown): number => Number.parseFloat(String(v));

/** Las diferencias de una pieza con el modelo, fuera de la tolerancia. */
function diferencias(caso: Caso, web: Medida, modelo: Medida): string[] {
  return caso.propiedades.flatMap((p) => {
    const a = web[p];
    const b = modelo[p];
    let igual: boolean;
    if (p === 'interletrado') igual = Math.abs(px(a) / px(web.tamano) - px(b) / px(modelo.tamano)) <= 0.01;
    else if (p === 'relleno') igual = (a as string[]).every((x, i) => Math.abs(px(x) - px((b as string[])[i])) <= 1);
    else if (['tamano', 'interlineado', 'ancho', 'alto', 'desdeElMarco', 'radio'].includes(p)) igual = Math.abs(px(a) - px(b)) <= 1;
    else if (p === 'bordeArriba' || p === 'bordeAbajo') {
      const [ga, ...ra] = String(a).split(' ');
      const [gb, ...rb] = String(b).split(' ');
      igual = Math.abs(px(ga) - px(gb)) <= 1 && ra.join(' ') === rb.join(' ');
    } else igual = a === b;
    return igual ? [] : [`${caso.clave} · ${p}: web ${JSON.stringify(a)}, modelo ${JSON.stringify(b)}`];
  });
}

describe('la fidelidad al modelo, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const p = async (): Promise<Pestana> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    return sesion.pestana;
  };
  after(async () => {
    await sesion?.cerrar();
  });
  const modelo = (): Record<string, Medida> => (JSON.parse(readFileSync(MEDIDAS, 'utf8')) as { medidas: Record<string, Medida> }).medidas;
  const anchoDe = async (ancho: number): Promise<void> => {
    await (await p()).cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 769 });
  };
  /** Las mismas medidas que toma medir-modelo.ts, en la web; el texto, el que se ve (innerText). */
  const medir = async (selector: string): Promise<Medida> =>
    (await p()).evaluar<Medida>(`(() => {
      const e = document.querySelector(${JSON.stringify(selector)});
      const c = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      const borde = (lado) => c.getPropertyValue('border-' + lado + '-width') + ' ' + c.getPropertyValue('border-' + lado + '-style') + ' ' + c.getPropertyValue('border-' + lado + '-color');
      return {
        texto: e.innerText.trim().slice(0, 60),
        familia: c.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
        tamano: c.fontSize, peso: c.fontWeight, estilo: c.fontStyle, interlineado: c.lineHeight, interletrado: c.letterSpacing,
        color: c.color, fondo: c.backgroundColor, decoracion: c.textDecorationLine,
        bordeArriba: borde('top'), bordeAbajo: borde('bottom'), radio: c.borderRadius,
        relleno: [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft],
        ancho: r.width, alto: r.height, desdeElMarco: r.left,
      };
    })()`);
  const juzgar = async (casos: readonly Caso[]): Promise<string[]> => {
    const medidas = modelo();
    const salida: string[] = [];
    for (const caso of casos) salida.push(...diferencias(caso, await medir(caso.selector), medidas[caso.clave]!));
    return salida;
  };

  test('1 · el fichero de medidas es del prototipo y trae cada pieza que se juzga; la que no sale del prototipo dice de qué apartado del DISEÑO sale', () => {
    const json = JSON.parse(readFileSync(MEDIDAS, 'utf8')) as { url: string; medidas: Record<string, Record<string, unknown>> };
    assert.match(json.url, /^https:\/\/[\w-]+\.figma\.site\/$/, 'la URL del prototipo publicado');
    const claves = [...ESCRITORIO, VISTA, ...TABLETA, ...MOVIL].map((c) => c.clave);
    assert.deepEqual(claves.filter((c) => !(c in json.medidas)), [], 'piezas que el fichero no trae');
    const sinProcedencia = Object.entries(json.medidas)
      .filter(([, m]) => ('origen' in m ? !/^DISEÑO-RADIOGRAFIA\.md §\d/.test(String(m.origen)) || typeof m.nota !== 'string' || !/no del prototipo/.test(m.nota) : typeof m.pantalla !== 'string' || typeof m.selector !== 'string'))
      .map(([clave]) => clave);
    assert.deepEqual(sinProcedencia, [], 'piezas sin pantalla y selector del prototipo, o sin apartado del DISEÑO y nota');
    assert.deepEqual(
      Object.keys(json.medidas).filter((c) => 'origen' in json.medidas[c]!),
      ['escritorio.cabecera.icono', 'movil.cabecera.icono'],
      'las piezas que vienen del DISEÑO y no del prototipo',
    );
  });

  test('2 · a 1280, cada pieza como en el modelo', async () => {
    await anchoDe(1280);
    assert.deepEqual(await juzgar(ESCRITORIO), []);
  });

  test('3 · la vista del texto, ya analizado, como la del modelo', async () => {
    const pestana = await p();
    const texto = readFileSync(new URL('antonio.txt', EJEMPLOS_PUBLICOS), 'utf8');
    await pestana.evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(texto)};
      document.getElementById('genero').value = 'opinion';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    assert.deepEqual(await juzgar([VISTA]), []);
  });

  test('4 · a 820 y a 390, lo que cambia con el tamaño', async () => {
    await anchoDe(820);
    const tableta = await juzgar(TABLETA);
    await anchoDe(390);
    assert.deepEqual([...tableta, ...(await juzgar(MOVIL))], []);
  });
});
