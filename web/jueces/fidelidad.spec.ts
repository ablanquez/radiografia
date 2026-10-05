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
 *   3. La vista del texto, ya analizado, como la del modelo; y desde la
 *      Tanda 3, la separación de sus párrafos, que viene del DISEÑO (§5; una
 *      línea en blanco, 27 px; decisión de Antonio en la parada 2: el modelo
 *      la tenía en 16), medida con el texto humano, que los separa así.
 *   4. A 820 (tableta) y a 390 (móvil), lo que cambia con el tamaño: los
 *      márgenes, la cabecera compacta y el botón principal.
 *   5. El resultado de combinacion-real a 1280, pieza a pieza.
 *   6. La tarjeta de regla abierta sobre el primer «Además», con su tramo
 *      activo.
 *   7. En el móvil, la pastilla compacta, las pestañas y la hoja (abierta
 *      después de haber abierto la tarjeta en escritorio: así cazó este juez
 *      el fallo de docs/BITACORA.md, 2026-10-04).
 *   8. Desde la Tanda 3, el catálogo (la misma pestaña, en /reglas/): a
 *      1280, sin resultados (Gramática y alta, como el modelo), a 820, a 390 y
 *      con la hoja de filtros abierta.
 *   9. La ficha de Conector repetido (la del modelo), a 1280 y a 390.
 * Lo que no se compara, y por qué, va junto a cada pieza: medidas que el
 * modelo da por su marco (la barra de scroll del móvil), por sus datos de
 * muestra (fuentes de una línea) o al revés que el encargo (el botón
 * principal en el móvil: 44 en la ficha y en la hoja de filtros del modelo,
 * 48 en el encargo 10.4 y en la web).
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
 *    — «the resolved values of all CSS properties of an element».
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EJEMPLOS_PUBLICOS, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, ANCHO_ASENTADO, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

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
  | 'separacionDeParrafos'
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
/** Tanda 3: la separación de los párrafos de la vista, la del DISEÑO (una línea en blanco), con el texto humano, que los separa así. */
const VISTA_PARRAFOS: Caso = { clave: 'escritorio.vista.parrafos', selector: '#vista', propiedades: ['separacionDeParrafos'] };
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
/** Tanda 3: el catálogo (la regla del modelo, Conector repetido, y la que solo avisa, Negrita de Markdown) y la ficha. */
const LI_CONECTOR = '#reglas > li:has(a[href$="/disc-marcador-repetido/"])';
const LI_NEGRITA = '#reglas > li:has(a[href$="/canal-negrita-markdown/"])';
const MUESTRA: readonly Propiedad[] = ['familia', 'tamano', 'fondo', 'decoracion', 'decoEstilo', 'decoColor', 'radio'];
const CATALOGO: readonly Caso[] = [
  { clave: 'escritorio.catalogo.titulo', selector: '.catalogo h1', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.catalogo.presentacion', selector: '.presentacion', propiedades: [...TIPO, 'ancho', 'texto'] },
  { clave: 'escritorio.catalogo.buscador.etiqueta', selector: 'label[for="buscar"]', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.catalogo.buscador', selector: '#buscar', propiedades: ['alto', 'radio', 'bordeArriba', 'relleno', 'ancho'] },
  { clave: 'escritorio.catalogo.familia', selector: '.grupos-filtros > fieldset', propiedades: ['ancho'] },
  { clave: 'escritorio.catalogo.detector', selector: '.otros-filtros > fieldset:first-child', propiedades: ['ancho'] },
  { clave: 'escritorio.catalogo.severidad', selector: '.otros-filtros > fieldset:last-child', propiedades: ['ancho'] },
  { clave: 'escritorio.catalogo.leyenda', selector: '.grupos-filtros > fieldset legend', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.catalogo.casilla', selector: '.grupos-filtros > fieldset label', propiedades: ['tamano', 'peso', 'color', 'alto'] },
  { clave: 'escritorio.catalogo.casilla.muestra', selector: '.grupos-filtros > fieldset label .muestra', propiedades: MUESTRA },
  { clave: 'escritorio.catalogo.quitar', selector: '#quitar-filtros', propiedades: [...BOTON, 'texto'] },
  { clave: 'escritorio.catalogo.recuento', selector: '#recuento', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.catalogo.regla', selector: LI_CONECTOR, propiedades: ['fondo', 'bordeArriba', 'radio', 'relleno', 'ancho'] },
  { clave: 'escritorio.catalogo.regla.muestra', selector: `${LI_CONECTOR} .muestra`, propiedades: MUESTRA },
  { clave: 'escritorio.catalogo.regla.sigla', selector: `${LI_CONECTOR} .sigla`, propiedades: ['tamano', 'peso', 'bordeArriba', 'ancho', 'alto', 'texto'] },
  { clave: 'escritorio.catalogo.regla.nombre', selector: `${LI_CONECTOR} h2 a`, propiedades: [...TIPO, 'decoracion', 'texto'] },
  { clave: 'escritorio.catalogo.regla.frase', selector: `${LI_CONECTOR} .en-claro`, propiedades: [...TIPO, 'texto'] },
  // Sin el texto: la línea de la web lleva además la familia y la severidad.
  { clave: 'escritorio.catalogo.regla.datos', selector: `${LI_CONECTOR} .datos`, propiedades: TIPO },
  { clave: 'escritorio.catalogo.informativa', selector: LI_NEGRITA, propiedades: ['fondo', 'bordeArriba'] },
  { clave: 'escritorio.catalogo.informativa.frase', selector: `${LI_NEGRITA} .en-claro`, propiedades: ['color'] },
];
const CATALOGO_SIN: readonly Caso[] = [
  { clave: 'escritorio.catalogo.sin', selector: '#sin-reglas', propiedades: ['fondo', 'bordeArriba', 'radio', 'relleno'] },
  { clave: 'escritorio.catalogo.sin.texto', selector: '#sin-reglas p', propiedades: [...TIPO, 'texto'] },
];
const CATALOGO_TABLETA: readonly Caso[] = [
  { clave: 'tableta.catalogo.familia', selector: '.grupos-filtros > fieldset', propiedades: ['ancho'] },
  { clave: 'tableta.catalogo.detector', selector: '.otros-filtros > fieldset:first-child', propiedades: ['ancho'] },
];
const CATALOGO_MOVIL: readonly Caso[] = [
  { clave: 'movil.catalogo.filtros', selector: '#abrir-filtros', propiedades: [...BOTON, 'texto'] },
  // Sin el ancho: el marco del móvil del modelo pinta su barra de scroll y la tarjeta mide 343 en vez de 358.
  { clave: 'movil.catalogo.regla', selector: LI_CONECTOR, propiedades: ['relleno'] },
];
const HOJA_FILTROS: readonly Caso[] = [
  { clave: 'movil.catalogo.hoja', selector: '#panel-filtros', propiedades: ['fondo', 'bordeArriba', 'radio', 'ancho', 'altoMaximo'] },
  { clave: 'movil.catalogo.hoja.asa', selector: '#panel-filtros .asa', propiedades: ['alto', 'ancho'] },
  { clave: 'movil.catalogo.hoja.titulo', selector: '#titulo-filtros', propiedades: [...TIPO, 'texto'] },
  { clave: 'movil.catalogo.hoja.cerrar', selector: '#panel-filtros .cerrar', propiedades: ['ancho', 'alto'] },
  { clave: 'movil.catalogo.hoja.acciones', selector: '#panel-filtros .acciones-filtros', propiedades: ['bordeArriba', 'relleno'] },
  // Sin el alto: el modelo deja «Aplicar» en 44, y la web, en los 48 del botón principal en el móvil (encargo 10.4, Tanda 1).
  { clave: 'movil.catalogo.hoja.aplicar', selector: '#aplicar-filtros', propiedades: ['fondo', 'ancho', 'texto'] },
];
const FICHA: readonly Caso[] = [
  { clave: 'escritorio.ficha', selector: '.ficha', propiedades: ['ancho'] },
  // Sin el radio: los dos son redondos del todo, pero el modelo lo escribe infinito (3.35544e+07px) y la web, 9999px.
  { clave: 'escritorio.ficha.pastilla', selector: '.pastilla-familia', propiedades: ['bordeArriba', 'relleno', 'tamano'] },
  { clave: 'escritorio.ficha.pastilla.muestra', selector: '.pastilla-familia .muestra', propiedades: MUESTRA },
  { clave: 'escritorio.ficha.nombre', selector: '.ficha h1', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.ficha.id', selector: '.nombre-ficha .id-regla', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.ficha.frase', selector: '.cabeza-ficha .en-claro', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.ficha.seccion', selector: '#ficha-que-hacer', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.ficha.seccion.texto', selector: 'section[aria-labelledby="ficha-que-hacer"] p', propiedades: [...TIPO, 'texto'] },
  { clave: 'escritorio.ficha.datos', selector: '.datos-ficha', propiedades: ['fondo', 'bordeArriba', 'radio', 'relleno'] },
  { clave: 'escritorio.ficha.datos.etiqueta', selector: '.datos-ficha dt', propiedades: TIPO },
  // Sin el alto: las fuentes del modelo son de una línea y las de verdad, de varias (el mínimo de 44 lo mira ficha-pantalla.spec.ts).
  { clave: 'escritorio.ficha.fuente', selector: '.fuentes a', propiedades: ['tamano', 'color', 'decoracion'] },
  { clave: 'escritorio.ficha.ejemplo', selector: '.ejemplo-ficha', propiedades: ['bordeArriba', 'radio', 'relleno', 'ancho'] },
  { clave: 'escritorio.ficha.ejemplo.texto', selector: '.ejemplo', propiedades: TIPO },
  { clave: 'escritorio.ficha.ejemplo.tramo', selector: '.ejemplo .capa', propiedades: CAPA },
  { clave: 'escritorio.ficha.ejemplo.sigla', selector: '.ejemplo .sigla-tramo', propiedades: ['tamano', 'color', 'alineacion', 'texto'] },
  { clave: 'escritorio.ficha.probar', selector: '.acciones-ficha .boton-principal', propiedades: [...BOTON, 'texto'] },
  { clave: 'escritorio.ficha.volver', selector: '.acciones-ficha .volver', propiedades: ['peso', 'color', 'decoracion', 'alto', 'texto'] },
];
// Sin el alto: el modelo deja el botón en 44, y la web, en los 48 del botón principal en el móvil (encargo 10.4, Tanda 1).
const FICHA_MOVIL: readonly Caso[] = [{ clave: 'movil.ficha.probar', selector: '.acciones-ficha .boton-principal', propiedades: ['ancho'] }];
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
 * sale de un color-mix (el tinte del modelo), y oklab() (desde la Tanda 3, abajo); null si no es ninguno de esos.
 * [DOC] https://www.w3.org/TR/css-color-4/#serializing-color-values — rgb()/rgba() para sRGB y color() para los
 *    colores en un espacio con nombre, como srgb.
 */
function canales(v: unknown): number[] | null {
  const t = String(v);
  const rgb = /^rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)$/.exec(t);
  if (rgb) return [px(rgb[1]), px(rgb[2]), px(rgb[3]), rgb[4] === undefined ? 1 : px(rgb[4])];
  const srgb = /^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/.exec(t);
  if (srgb) return [px(srgb[1]) * 255, px(srgb[2]) * 255, px(srgb[3]) * 255, srgb[4] === undefined ? 1 : px(srgb[4])];
  // Desde la Tanda 3, oklab(): así da el modelo un color con opacidad de Tailwind (el borde ink-2 al 50 % de la regla
  // que solo avisa). Con el código de muestra de CSS Color 4, sus matrices tal cual: OKLab_to_XYZ (OKLab → LMS, al cubo,
  // → XYZ D65), XYZ_to_lin_sRGB y gam_sRGB (https://www.w3.org/TR/css-color-4/, «Sample code for Color Conversions»).
  const oklab = /^oklab\(([-\d.e]+) ([-\d.e]+) ([-\d.e]+)(?: \/ ([\d.]+))?\)$/.exec(t);
  if (oklab) {
    const por = (m: number[][], x: number[]): number[] => m.map((fila) => fila.reduce((suma, c, i) => suma + c * x[i]!, 0));
    const lab = [px(oklab[1]), px(oklab[2]), px(oklab[3])];
    const lms = por(
      [
        [1, 0.3963377773761749, 0.2158037573099136],
        [1, -0.1055613458156586, -0.0638541728258133],
        [1, -0.0894841775298119, -1.2914855480194092],
      ],
      lab,
    ).map((c) => c ** 3);
    const xyz = por(
      [
        [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
        [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
        [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
      ],
      lms,
    );
    const lineal = por(
      [
        [12831 / 3959, -329 / 214, -1974 / 3959],
        [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
        [705 / 12673, -2585 / 12673, 705 / 667],
      ],
      xyz,
    );
    const gamma = (c: number): number => (Math.abs(c) > 0.0031308 ? Math.sign(c) * (1.055 * Math.abs(c) ** (1 / 2.4) - 0.055) : 12.92 * c);
    return [...lineal.map((c) => gamma(c) * 255), oklab[4] === undefined ? 1 : px(oklab[4])];
  }
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
    else if (['tamano', 'interlineado', 'ancho', 'alto', 'desdeElMarco', 'radio', 'decoGrosor', 'decoDesplazamiento', 'separacionDeParrafos'].includes(p)) igual = Math.abs(px(a) - px(b)) <= 1;
    else if (['color', 'fondo', 'decoColor'].includes(p) && a !== b) {
      // Dos maneras de escribir el mismo color (rgb() y color(srgb …)): el mismo con un margen de una unidad por canal y 0,01 de alfa.
      const [ca, cb] = [canales(a), canales(b)];
      igual = ca !== null && cb !== null && ca.every((x, i) => Math.abs(x - cb[i]!) <= (i === 3 ? 0.01 : 1));
    } else if (p === 'bordeArriba' || p === 'bordeAbajo' || p === 'bordeIzquierdo') {
      const [ga, ...ra] = String(a).split(' ');
      const [gb, ...rb] = String(b).split(' ');
      // El grosor con ±1, el estilo igual y el color como los demás colores (desde la Tanda 3: el modelo lo da a veces en oklab()).
      const [ea, ...ca] = ra;
      const [eb, ...cb] = rb;
      const [colA, colB] = [canales(ca.join(' ')), canales(cb.join(' '))];
      const mismoColor = ca.join(' ') === cb.join(' ') || (colA !== null && colB !== null && colA.every((x, i) => Math.abs(x - colB[i]!) <= (i === 3 ? 0.01 : 1)));
      igual = Math.abs(px(ga) - px(gb)) <= 1 && ea === eb && mismoColor;
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
    await (await p()).hasta(ANCHO_ASENTADO, `el ancho de ${ancho}, asentado`);
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
        separacionDeParrafos: (() => {
          // Dos párrafos separados por una línea en blanco, en un mismo trozo de texto que no sea una sigla (aria-hidden): del renglón
          // del último carácter del primero al del primero del segundo, menos un renglón.
          const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
          for (let n = w.nextNode(); n !== null; n = w.nextNode()) {
            if (n.parentElement.closest('[aria-hidden="true"]')) continue;
            const k = n.data.indexOf('\\n\\n');
            if (k < 0) continue;
            const antes = n.data.slice(0, k).search(/\\S\\s*$/);
            const despues = n.data.slice(k).search(/\\S/);
            if (antes < 0 || despues < 0) continue;
            const renglon = (i) => { const g = document.createRange(); g.setStart(n, i); g.setEnd(n, i + 1); return g.getBoundingClientRect().top; };
            return renglon(k + despues) - renglon(antes) - parseFloat(c.lineHeight);
          }
          return null;
        })(),
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
    const claves = [...ESCRITORIO, VISTA, VISTA_PARRAFOS, ...TABLETA, ...MOVIL, ...RESULTADO, ...TARJETA, ...MOVIL_RESULTADO, ...HOJA, ...CATALOGO, ...CATALOGO_SIN, ...CATALOGO_TABLETA, ...CATALOGO_MOVIL, ...HOJA_FILTROS, ...FICHA, ...FICHA_MOVIL].map((c) => c.clave);
    assert.deepEqual(claves.filter((c) => !(c in json.medidas)), [], 'piezas que el fichero no trae');
    const sinProcedencia = Object.entries(json.medidas)
      .filter(([, m]) => ('origen' in m ? !/^DISEÑO-RADIOGRAFIA\.md §\d/.test(String(m.origen)) || typeof m.nota !== 'string' || !/no del prototipo/.test(m.nota) : typeof m.pantalla !== 'string' || typeof m.selector !== 'string'))
      .map(([clave]) => clave);
    assert.deepEqual(sinProcedencia, [], 'piezas sin pantalla y selector del prototipo, o sin apartado del DISEÑO y nota');
    assert.deepEqual(
      Object.keys(json.medidas).filter((c) => 'origen' in json.medidas[c]!),
      ['escritorio.cabecera.icono', 'movil.cabecera.icono', 'escritorio.vista.parrafos'],
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

  test('3 · la vista del texto, ya analizado, como la del modelo; sus párrafos, separados como dice el DISEÑO', async () => {
    const pestana = await p();
    const texto = readFileSync(new URL('antonio.txt', EJEMPLOS_PUBLICOS), 'utf8');
    await pestana.evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(texto)};
      document.getElementById('genero').value = 'opinion';
      document.getElementById('analizar').click();
    })()`);
    await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    assert.deepEqual(await juzgar([VISTA, VISTA_PARRAFOS]), []);
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

  /** La misma pestaña, a otra página de la web (desde la Tanda 3: el catálogo y la ficha). */
  const ir = async (ruta: string): Promise<void> => {
    const pestana = await p();
    await pestana.cdp('Page.navigate', { url: sesion!.url + ruta });
    await pestana.hasta(`location.pathname === '/${ruta}' && document.readyState === 'complete'`, `la página /${ruta}`);
  };
  /** El ancho, ya asentado en el catálogo: el recuento, junto al botón «Filtros» en el móvil y junto a «Quitar filtros» fuera. */
  const anchoDelCatalogo = async (ancho: number): Promise<void> => {
    await anchoDe(ancho);
    await (await p()).hasta(`document.getElementById('recuento').parentElement.classList.contains('${ancho <= 768 ? 'barra-filtros' : 'acciones-filtros'}')`, `el catálogo a ${ancho}`);
  };

  test('8 · el catálogo a 1280, sin resultados, a 820, a 390 y con la hoja de filtros, como el del modelo', async () => {
    const pestana = await p();
    // Sin barras de scroll, como el marco de ancho fijo del modelo: con la barra clásica de Windows, el catálogo, que es
    // largo, mediría 15 px menos de ancho que la ventana (1137 en vez de 1152). Se restablecen al acabar el 9.
    // [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setScrollbarsHidden — «Whether
    //    scrollbars should be always hidden» (experimental).
    await pestana.cdp('Emulation.setScrollbarsHidden', { hidden: true });
    await ir('reglas/');
    await anchoDelCatalogo(1280);
    const escritorio = await juzgar(CATALOGO);
    // Sin resultados, como el modelo: Gramática y severidad alta.
    await pestana.evaluar(`(() => { document.querySelector('#panel-filtros input[value="Español correcto::gramatica"]').click(); document.querySelector('#panel-filtros input[value="alta"]').click(); })()`);
    const sin = await juzgar(CATALOGO_SIN);
    await pestana.evaluar(`document.getElementById('quitar-filtros').click()`);
    await anchoDelCatalogo(820);
    const tableta = await juzgar(CATALOGO_TABLETA);
    await anchoDelCatalogo(390);
    const movil = await juzgar(CATALOGO_MOVIL);
    await pestana.evaluar(`document.getElementById('abrir-filtros').click()`);
    const hoja = await juzgar(HOJA_FILTROS);
    await pestana.evaluar(`document.querySelector('#panel-filtros .cerrar').click()`);
    assert.deepEqual([...escritorio, ...sin, ...tableta, ...movil, ...hoja], []);
  });

  test('9 · la ficha de Conector repetido a 1280 y a 390, como la del modelo', async () => {
    await ir('reglas/disc-marcador-repetido/');
    await anchoDe(1280);
    const escritorio = await juzgar(FICHA);
    await anchoDe(390);
    const movil = await juzgar(FICHA_MOVIL);
    await (await p()).cdp('Emulation.setScrollbarsHidden', { hidden: false });
    assert.deepEqual([...escritorio, ...movil], []);
  });
});
