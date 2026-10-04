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
 * Desde la Tanda 2, además, el analizador: el formulario, el recuadro del
 * resultado, la pastilla, las tarjetas de lo que más pesa y de las familias, el
 * detalle, Español correcto, los botones, el cuadro plegado, los tramos y sus
 * capas, la tarjeta de regla, y en el móvil la pastilla compacta, las pestañas
 * y la hoja. El resultado se juzga con combinacion-real, el texto del ejemplo
 * del modelo: las mismas reglas, familias y cifras, y los mismos textos.
 *
 * Tolerancia (encargo): ±1 px en las longitudes y ±0,01 en las proporciones
 * (el interletrado, en em); la familia, el peso, el estilo, el color, la
 * decoración y el texto, iguales; un color escrito de dos maneras (rgb() y
 * color(srgb …), el del color-mix del modelo), igual con una unidad de margen
 * por canal.
 *
 *   1. El fichero de medidas es del prototipo y trae cada pieza que se juzga;
 *      la que no sale del prototipo dice de qué apartado del DISEÑO sale.
 *   2. A 1280 (escritorio), cada pieza como en el modelo.
 *   3. La vista del texto, ya analizado, como la del modelo.
 *   4. A 820 (tableta) y a 390 (móvil), lo que cambia con el tamaño: los
 *      márgenes, la cabecera compacta y el botón principal.
 *   5. El resultado de combinacion-real a 1280, pieza a pieza.
 *   6. La tarjeta de regla abierta sobre el primer «Además», con su tramo
 *      activo.
 *   7. En el móvil, la pastilla compacta, las pestañas y la hoja (abierta
 *      después de haber abierto la tarjeta en escritorio: así cazó este juez
 *      el fallo de docs/BITACORA.md, 2026-10-04).
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
 *    — «the resolved values of all CSS properties of an element».
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EJEMPLOS_PUBLICOS, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const MEDIDAS = new URL('../../docs/figma/medidas-modelo.json', import.meta.url);

type Propiedad =
  | 'familia'
  | 'tamano'
  | 'peso'
  | 'estilo'
  | 'interlineado'
  | 'interletrado'
  | 'color'
  | 'fondo'
  | 'decoracion'
  | 'decoEstilo'
  | 'decoGrosor'
  | 'decoColor'
  | 'decoDesplazamiento'
  | 'alineacion'
  | 'bordeArriba'
  | 'bordeAbajo'
  | 'bordeIzquierdo'
  | 'radio'
  | 'relleno'
  | 'ancho'
  | 'alto'
  | 'altoMaximo'
  | 'desdeElMarco'
  | 'texto';
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
  // Desde el 10.4 (Tanda 2) los ejemplos son chips: el secundario es el cargador, como en el modelo (que lo mide con «Paquetes» abierto).
  { clave: 'escritorio.boton.secundario', selector: 'label[for="paquete-propio"]', propiedades: BOTON },
  { clave: 'escritorio.cuadro', selector: '#texto', propiedades: [...TIPO, 'fondo', 'bordeArriba', 'radio', 'relleno'] },
  { clave: 'escritorio.cuadro.etiqueta', selector: 'label[for="texto"]', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.columna-texto', selector: '#formulario', propiedades: ['ancho'] },
  // Tanda 2: el formulario y el recuadro del resultado, antes de analizar.
  { clave: 'escritorio.chip', selector: '#ejemplo-humano', propiedades: ['familia', 'tamano', 'peso', 'color', 'fondo', 'bordeArriba', 'alto', 'relleno', 'texto'] },
  { clave: 'escritorio.tipo', selector: '#genero', propiedades: ['fondo', 'bordeArriba', 'radio', 'relleno', 'alto', 'ancho'] },
  { clave: 'escritorio.tipo.etiqueta', selector: 'label[for="genero"]', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.paquetes', selector: '#paquetes', propiedades: ['fondo', 'bordeArriba', 'radio', 'ancho'] },
  { clave: 'escritorio.paquetes.resumen', selector: '#paquetes summary', propiedades: ['peso', 'alto', 'relleno', 'texto'] },
  { clave: 'escritorio.hueco', selector: '#hueco-resultado', propiedades: ['bordeArriba', 'radio', 'relleno', 'ancho'] },
  { clave: 'escritorio.hueco.texto', selector: '#hueco-resultado', propiedades: ['color', 'tamano', 'texto'] },
];
const VISTA: Caso = { clave: 'escritorio.vista', selector: '#vista', propiedades: [...TIPO, 'ancho'] };
const CAPA: readonly Propiedad[] = ['familia', 'tamano', 'fondo', 'decoracion', 'decoEstilo', 'decoGrosor', 'decoColor', 'decoDesplazamiento', 'radio'];
const LEXICO = '.tarjeta-familia[data-familia="RadiografIA::lexico"]';
/** Tanda 2: el resultado de combinacion-real a 1280 (el texto del modelo: sus mismas reglas, familias y cifras). */
const RESULTADO: readonly Caso[] = [
  { clave: 'escritorio.plegado', selector: '.texto-plegado', propiedades: ['familia', 'tamano', 'interlineado', 'color', 'bordeArriba', 'radio', 'relleno', 'alto', 'ancho'] },
  { clave: 'escritorio.plegado.editar', selector: '#editar', propiedades: ['peso', 'color', 'decoracion', 'alto', 'texto'] },
  { clave: 'escritorio.pastilla', selector: '#medidor .pastilla', propiedades: ['fondo', 'radio', 'relleno', 'ancho'] },
  { clave: 'escritorio.pastilla.etiqueta', selector: '#medidor .pastilla > .etiqueta', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.pastilla.frase', selector: '#medidor .pastilla > .frase', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.pesa.titulo', selector: '#t-pesa', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.motivo', selector: '.tarjeta-motivo', propiedades: ['fondo', 'bordeArriba', 'bordeIzquierdo', 'radio', 'relleno', 'alto'] },
  { clave: 'escritorio.motivo.sigla', selector: '.tarjeta-motivo .sigla', propiedades: ['tamano', 'peso', 'interlineado', 'bordeArriba', 'ancho', 'alto', 'texto'] },
  { clave: 'escritorio.motivo.nombre', selector: '.nombre-motivo', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.motivo.cola', selector: '.cola', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.motivo.empieza', selector: '.empieza-por', propiedades: [...TIPO, 'estilo', 'texto'] },
  { clave: 'escritorio.familia', selector: LEXICO, propiedades: ['fondo', 'bordeArriba', 'radio', 'relleno', 'alto'] },
  { clave: 'escritorio.familia.muestra', selector: `${LEXICO} .muestra`, propiedades: [...CAPA, 'interlineado'] },
  { clave: 'escritorio.familia.etiqueta', selector: `${LEXICO} .etiqueta-familia`, propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.familia.ojo', selector: `${LEXICO} .ojo`, propiedades: ['color', 'ancho', 'alto', 'radio'] },
  { clave: 'escritorio.detalle', selector: '#desglose > .detalle', propiedades: ['bordeArriba', 'radio', 'relleno', 'ancho'] },
  { clave: 'escritorio.detalle.resumen', selector: '#desglose > .detalle > summary', propiedades: ['peso', 'alto', 'texto'] },
  { clave: 'escritorio.espanol', selector: '.otro-paquete', propiedades: ['bordeArriba', 'radio', 'relleno', 'ancho'] },
  { clave: 'escritorio.espanol.titulo', selector: '.otro-paquete > h2', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.espanol.resumen', selector: '.otro-paquete .resumen', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.acciones.principal', selector: '#descargar', propiedades: [...BOTON, 'texto'] },
  { clave: 'escritorio.tramo', selector: '#vista .tramo', propiedades: ['relleno', 'radio'] },
  { clave: 'escritorio.tramo.sigla', selector: '#vista .tramo .sigla-tramo', propiedades: ['tamano', 'interlineado', 'color', 'alineacion', 'texto'] },
  { clave: 'escritorio.capa.discurso', selector: '#vista .tramo > .capa.fam-discurso', propiedades: CAPA },
  { clave: 'escritorio.capa.sintaxis', selector: '#vista .tramo > .capa.fam-sintaxis', propiedades: CAPA },
  { clave: 'escritorio.capa.gramatica', selector: '#vista .tramo > .capa.fam-gramatica', propiedades: CAPA },
  { clave: 'escritorio.capa.lexico', selector: '#vista .tramo > .capa.fam-lexico', propiedades: CAPA },
];
/** Tanda 2: la tarjeta de regla abierta sobre el primer «Además», a 1280. */
const TARJETA: readonly Caso[] = [
  { clave: 'escritorio.tarjeta', selector: '#tarjeta', propiedades: ['fondo', 'bordeArriba', 'radio', 'ancho'] },
  { clave: 'escritorio.tarjeta.barra', selector: '#tarjeta .barra-familia', propiedades: ['fondo', 'alto', 'radio'] },
  { clave: 'escritorio.tarjeta.titulo', selector: '#tarjeta h2', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.tarjeta.linea', selector: '#tarjeta .linea-tarjeta', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.tarjeta.cerrar', selector: '#tarjeta .cerrar', propiedades: ['ancho', 'alto', 'radio'] },
  { clave: 'escritorio.tarjeta.cuerpo', selector: '#tarjeta .cuerpo-tarjeta', propiedades: ['relleno'] },
  { clave: 'escritorio.tarjeta.frase', selector: '#tarjeta .en-claro', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.tarjeta.porque', selector: '#tarjeta .por-que', propiedades: ['bordeArriba'] },
  { clave: 'escritorio.tarjeta.porque.resumen', selector: '#tarjeta .por-que > summary', propiedades: ['peso', 'alto', 'texto'] },
  { clave: 'escritorio.tarjeta.anterior', selector: '#tarjeta .navegacion-reglas button', propiedades: [...BOTON, 'ancho', 'texto'] },
  { clave: 'escritorio.tarjeta.pico', selector: '#tarjeta .pico', propiedades: ['fondo', 'ancho', 'alto'] },
  { clave: 'escritorio.tramo.activo', selector: '#vista .tramo.activo > .capa', propiedades: ['fondo', 'decoGrosor', 'decoColor'] },
];
/** Tanda 2: el móvil con el resultado (la pastilla compacta y las pestañas) y con la hoja abierta sobre el primer «Además». */
const MOVIL_RESULTADO: readonly Caso[] = [
  { clave: 'movil.pastilla', selector: '#medidor .pastilla', propiedades: ['relleno'] },
  { clave: 'movil.pastilla.etiqueta', selector: '#medidor .pastilla > .etiqueta', propiedades: ['tamano', 'interlineado', 'peso'] },
  { clave: 'movil.pestanas', selector: '#barra-pestanas', propiedades: ['fondo', 'bordeArriba', 'alto'] },
  { clave: 'movil.pestana.elegida', selector: '#pestana-texto', propiedades: ['peso', 'color', 'bordeArriba', 'alto', 'texto'] },
  { clave: 'movil.pestana.otra', selector: '#pestana-reglas', propiedades: ['peso', 'color', 'bordeArriba', 'alto', 'texto'] },
];
const HOJA: readonly Caso[] = [
  { clave: 'movil.hoja', selector: '#tarjeta', propiedades: ['fondo', 'bordeArriba', 'radio', 'ancho', 'altoMaximo'] },
  { clave: 'movil.hoja.asa', selector: '#tarjeta .asa', propiedades: ['alto', 'ancho'] },
  { clave: 'movil.hoja.raya', selector: '#tarjeta .asa span', propiedades: ['fondo', 'ancho', 'alto'] },
  { clave: 'movil.hoja.cuerpo', selector: '#tarjeta .cuerpo-tarjeta', propiedades: ['relleno'] },
  { clave: 'movil.hoja.siguiente', selector: '#tarjeta .navegacion-reglas button', propiedades: ['alto', 'ancho'] },
];
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

/**
 * Un color calculado en canales de 0 a 255 y su alfa: getComputedStyle da rgb() y rgba(), y color(srgb …) para lo que
 * sale de un color-mix (el tinte del modelo); null si no es ninguno de esos.
 * [DOC] https://www.w3.org/TR/css-color-4/#serializing-color-values — rgb()/rgba() para sRGB y color() para los
 *    colores en un espacio con nombre, como srgb.
 */
function canales(v: unknown): number[] | null {
  const t = String(v);
  const rgb = /^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/.exec(t);
  if (rgb) return [px(rgb[1]), px(rgb[2]), px(rgb[3]), rgb[4] === undefined ? 1 : px(rgb[4])];
  const srgb = /^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/.exec(t);
  if (srgb) return [px(srgb[1]) * 255, px(srgb[2]) * 255, px(srgb[3]) * 255, srgb[4] === undefined ? 1 : px(srgb[4])];
  return null;
}

/** Las diferencias de una pieza con el modelo, fuera de la tolerancia. */
function diferencias(caso: Caso, web: Medida, modelo: Medida): string[] {
  return caso.propiedades.flatMap((p) => {
    const a = web[p];
    const b = modelo[p];
    let igual: boolean;
    if (p === 'interletrado') igual = Math.abs(px(a) / px(web.tamano) - px(b) / px(modelo.tamano)) <= 0.01;
    else if (p === 'relleno') igual = (a as string[]).every((x, i) => Math.abs(px(x) - px((b as string[])[i])) <= 1);
    else if (['tamano', 'interlineado', 'ancho', 'alto', 'desdeElMarco', 'radio', 'decoGrosor', 'decoDesplazamiento'].includes(p)) igual = Math.abs(px(a) - px(b)) <= 1;
    else if (['color', 'fondo', 'decoColor'].includes(p) && a !== b) {
      // Dos maneras de escribir el mismo color (rgb() y color(srgb …)): el mismo con un margen de una unidad por canal y 0,01 de alfa.
      const [ca, cb] = [canales(a), canales(b)];
      igual = ca !== null && cb !== null && ca.every((x, i) => Math.abs(x - cb[i]!) <= (i === 3 ? 0.01 : 1));
    } else if (p === 'bordeArriba' || p === 'bordeAbajo' || p === 'bordeIzquierdo') {
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
        decoEstilo: c.textDecorationStyle, decoGrosor: c.textDecorationThickness, decoColor: c.textDecorationColor, decoDesplazamiento: c.textUnderlineOffset, alineacion: c.verticalAlign,
        bordeArriba: borde('top'), bordeAbajo: borde('bottom'), bordeIzquierdo: borde('left'), radio: c.borderRadius, altoMaximo: c.maxHeight,
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
    const claves = [...ESCRITORIO, VISTA, ...TABLETA, ...MOVIL, ...RESULTADO, ...TARJETA, ...MOVIL_RESULTADO, ...HOJA].map((c) => c.clave);
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
    await (await p()).evaluar(`document.getElementById('paquetes').open = true`);
    const diferentes = await juzgar(ESCRITORIO);
    await (await p()).evaluar(`document.getElementById('paquetes').open = false`);
    assert.deepEqual(diferentes, []);
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
    // Tras analizar (3), el cuadro está plegado (10.4): «Editar el texto» lo despliega con sus botones.
    await (await p()).evaluar(`document.getElementById('editar').click()`);
    await anchoDe(820);
    const tableta = await juzgar(TABLETA);
    await anchoDe(390);
    assert.deepEqual([...tableta, ...(await juzgar(MOVIL))], []);
  });

  const ADEMAS = `[...document.querySelectorAll('#vista .tramo')].find((t) => t.textContent.startsWith('Además'))`;

  test('5 · el resultado de combinacion-real a 1280, como el del modelo (el mismo texto)', async () => {
    await anchoDe(1280);
    const pestana = await p();
    await pestana.evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    assert.deepEqual(await juzgar(RESULTADO), []);
  });

  test('6 · la tarjeta de regla abierta sobre el primer «Además», como la del modelo', async () => {
    const pestana = await p();
    await pestana.evaluar(`${ADEMAS}.click()`);
    const diferentes = await juzgar(TARJETA);
    await pestana.evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
    assert.deepEqual(diferentes, []);
  });

  test('7 · en el móvil, la pastilla compacta, las pestañas y la hoja, como las del modelo', async () => {
    const pestana = await p();
    await anchoDe(390);
    await pestana.hasta(`document.getElementById('barra-pestanas').checkVisibility()`, 'las pestañas');
    const resultado = await juzgar(MOVIL_RESULTADO);
    await pestana.evaluar(`${ADEMAS}.click()`);
    const hoja = await juzgar(HOJA);
    await pestana.evaluar(`document.querySelector('#tarjeta .cerrar').click()`);
    assert.deepEqual([...resultado, ...hoja], []);
  });
});
