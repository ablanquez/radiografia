/**
 * Las medidas del modelo publicado (encargo 10.4, Tanda 1): abre el prototipo
 * de Figma Make en Chrome headless (jueces/chrome.ts), va a cada pantalla por
 * su hash, toma los estilos calculados y las cajas de las piezas de la lista y
 * las escribe en docs/figma/medidas-modelo.json, que lee el juez de fidelidad
 * (jueces/fidelidad.spec.ts). Se ejecuta a mano, desde web/, cuando cambie el
 * modelo o entren piezas nuevas en el calco:
 *
 *     node scripts/medir-modelo.ts https://exit-pure-51322631.figma.site/
 *
 * Los jueces no salen a Internet: leen el JSON.
 *
 * Desde la Tanda 2, también las piezas del analizador: el formulario, el
 * recuadro del resultado, la pastilla, las tarjetas de lo que más pesa y de
 * las familias, el detalle, Español correcto, los botones, los tramos y sus
 * capas, la tarjeta de regla abierta, y en el móvil la pastilla compacta, las
 * pestañas y la hoja; y además de lo de antes, el estilo, el grosor, el color y
 * el desplazamiento de la línea, la alineación, el borde izquierdo y el alto
 * máximo. Desde la Tanda 3, entre las piezas del DISEÑO, la separación de los
 * párrafos de la vista: una línea en blanco (decisión de Antonio en la parada
 * 2; el modelo la tenía en 16); y las del catálogo (sus tres tamaños, sin
 * resultados y la hoja de filtros del móvil) y de la ficha.
 *
 * Desde la Tanda 4 bis, el marco «Informe / A4» (794 px de ancho, la página A4
 * a 96 ppp), para el juez de fidelidad del papel:
 * la página y sus márgenes, el número de página, y en cada sección sus
 * títulos y sus líneas; de cada una, además, en qué página va, su caja en la
 * página y la línea base de su primera y de su última línea, desde el borde de
 * arriba de la página (con un marcador de 0 × 0 en la línea base, que se quita
 * después). Con eso el juez mira márgenes, interlineados y el aire entre
 * secciones, párrafos y señales. Y, entre las piezas del DISEÑO, la hoja de
 * imprimir sin resultado (§6.5; decisión de Antonio del 05/10).
 *
 * Cada pieza se mide en el marco de su tamaño (escritorio 1280, tableta 820,
 * móvil 390): el modelo pinta cada pantalla en un marco de ancho fijo
 * (MarcoPantalla), así que sus medidas no dependen de la ventana. El margen de
 * la página es la distancia del borde del marco a la cabecera.
 *
 * [DOC] https://github.com/ChromeDevTools/devtools-protocol (json/
 *    browser_protocol.json) — Page.navigate, Runtime.evaluate y
 *    Emulation.setDeviceMetricsOverride.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
 *    — «the resolved values of all CSS properties of an element, after
 *    applying active stylesheets and resolving any computation those values
 *    may contain». Las longitudes salen en px (visto en el prototipo: 28px,
 *    33.6px).
 */
import { writeFileSync } from 'node:fs';
import { abrirChrome } from '../jueces/chrome.ts';

const URL_DEL_MODELO = process.argv[2];
if (URL_DEL_MODELO === undefined || !/^https:\/\//.test(URL_DEL_MODELO)) {
  console.error('uso: node scripts/medir-modelo.ts <URL del prototipo publicado>');
  process.exit(2);
}
const SALIDA = new URL('../../docs/figma/medidas-modelo.json', import.meta.url);

/** Las páginas del marco «Informe / A4» del modelo. */
const PAGINA = '[data-capa^="página "]';

/** Las piezas que se miden: su clave, la pantalla (hash) y el selector en el DOM del modelo. */
const PIEZAS: readonly { clave: string; pantalla: string; selector: string }[] = [
  { clave: 'escritorio.cabecera', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="cabecera"]' },
  { clave: 'escritorio.cabecera.marca', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="marca"]' },
  { clave: 'escritorio.cabecera.nombre', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="marca"] p:first-child' },
  { clave: 'escritorio.cabecera.eslogan', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="marca"] p:last-child' },
  { clave: 'escritorio.cabecera.enlace', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="enlace-catalogo"]' },
  { clave: 'escritorio.pie', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="pie"]' },
  { clave: 'escritorio.boton.principal', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="boton-principal"]' },
  // El único secundario activo de la pantalla vacía está dentro de «Paquetes», plegado: se mide en los estados, donde va abierto.
  { clave: 'escritorio.boton.secundario', pantalla: 'analizador-vacio-estados/escritorio', selector: '[data-capa="estado – Error de carga de paquete"] [data-capa="boton-secundario"]:not([disabled])' },
  { clave: 'escritorio.cuadro', pantalla: 'analizador-vacio/escritorio', selector: '#tu-texto' },
  { clave: 'escritorio.cuadro.etiqueta', pantalla: 'analizador-vacio/escritorio', selector: 'label[for="tu-texto"]' },
  { clave: 'escritorio.columna-texto', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="columna-texto"]' },
  { clave: 'escritorio.vista', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="vista-texto"]' },
  { clave: 'tableta.cabecera', pantalla: 'analizador-vacio/tableta', selector: '[data-capa="cabecera"]' },
  { clave: 'movil.cabecera', pantalla: 'analizador-vacio/movil', selector: '[data-capa="cabecera"]' },
  { clave: 'movil.cabecera.marca', pantalla: 'analizador-vacio/movil', selector: '[data-capa="marca"]' },
  { clave: 'movil.cabecera.nombre', pantalla: 'analizador-vacio/movil', selector: '[data-capa="marca"] p:first-child' },
  { clave: 'movil.cabecera.enlace', pantalla: 'analizador-vacio/movil', selector: '[data-capa="enlace-catalogo"]' },
  { clave: 'movil.boton.principal', pantalla: 'analizador-vacio/movil', selector: '[data-capa="boton-principal"]' },
  // Tanda 2 (el analizador): el formulario y el recuadro del resultado, antes de analizar.
  { clave: 'escritorio.chip', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="chip – Texto humano"]' },
  { clave: 'escritorio.tipo', pantalla: 'analizador-vacio/escritorio', selector: '#tipo-texto' },
  { clave: 'escritorio.tipo.etiqueta', pantalla: 'analizador-vacio/escritorio', selector: 'label[for="tipo-texto"]' },
  { clave: 'escritorio.paquetes', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="paquetes"]' },
  { clave: 'escritorio.paquetes.resumen', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="paquetes"] summary' },
  { clave: 'escritorio.hueco', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="columna-resultado"]' },
  { clave: 'escritorio.hueco.texto', pantalla: 'analizador-vacio/escritorio', selector: '[data-capa="resultado"]' },
  // El resultado, a 1280.
  { clave: 'escritorio.plegado', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="cuadro-plegado"] p' },
  { clave: 'escritorio.plegado.editar', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="cuadro-plegado"] button' },
  { clave: 'escritorio.pastilla', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="pastilla"]' },
  { clave: 'escritorio.pastilla.etiqueta', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="pastilla"] p:first-child' },
  { clave: 'escritorio.pastilla.frase', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="pastilla"] p:nth-child(2)' },
  { clave: 'escritorio.pesa.titulo', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="lo-que-mas-pesa"] h2' },
  { clave: 'escritorio.motivo', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="motivo"] > div' },
  { clave: 'escritorio.motivo.sigla', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="motivo"] [data-capa^="sigla"]' },
  { clave: 'escritorio.motivo.nombre', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="motivo"] > div > span:nth-child(2)' },
  { clave: 'escritorio.motivo.cola', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="motivo"] > div > span:nth-child(3)' },
  { clave: 'escritorio.motivo.empieza', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="motivo"] > p' },
  { clave: 'escritorio.familia', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="tarjeta-familia"]' },
  { clave: 'escritorio.familia.muestra', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="tarjeta-familia"] > span:first-child' },
  { clave: 'escritorio.familia.etiqueta', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="tarjeta-familia"] > span:nth-child(2)' },
  { clave: 'escritorio.familia.ojo', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa^="tarjeta-familia"] button' },
  { clave: 'escritorio.detalle', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="desglose"]' },
  { clave: 'escritorio.detalle.resumen', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="desglose"] summary' },
  { clave: 'escritorio.espanol', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="espanol-correcto"]' },
  { clave: 'escritorio.espanol.titulo', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="espanol-correcto"] h2' },
  { clave: 'escritorio.espanol.resumen', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="espanol-correcto"] p' },
  { clave: 'escritorio.acciones.principal', pantalla: 'analizador-resultado/escritorio', selector: '[data-capa="resultado"] [data-capa="boton-principal"]' },
  { clave: 'escritorio.tramo', pantalla: 'analizador-resultado/escritorio', selector: '.tramo' },
  { clave: 'escritorio.tramo.sigla', pantalla: 'analizador-resultado/escritorio', selector: '.tramo > span[aria-hidden]' },
  { clave: 'escritorio.capa.discurso', pantalla: 'analizador-resultado/escritorio', selector: '.sub-discurso' },
  { clave: 'escritorio.capa.sintaxis', pantalla: 'analizador-resultado/escritorio', selector: '.sub-sintaxis' },
  { clave: 'escritorio.capa.gramatica', pantalla: 'analizador-resultado/escritorio', selector: '.sub-gramatica' },
  { clave: 'escritorio.capa.lexico', pantalla: 'analizador-resultado/escritorio', selector: '.sub-lexico' },
  // La tarjeta de regla abierta sobre el primer «Además», a 1280.
  { clave: 'escritorio.tarjeta', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="tarjeta-regla"]' },
  { clave: 'escritorio.tarjeta.barra', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="barra-familia"]' },
  { clave: 'escritorio.tarjeta.titulo', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="cabecera-tarjeta"] h2' },
  { clave: 'escritorio.tarjeta.linea', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="cabecera-tarjeta"] p' },
  { clave: 'escritorio.tarjeta.cerrar', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="boton-cerrar"]' },
  { clave: 'escritorio.tarjeta.cuerpo', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="tarjeta-regla"] > div:last-child' },
  { clave: 'escritorio.tarjeta.frase', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="tarjeta-regla"] > div:last-child > p' },
  { clave: 'escritorio.tarjeta.porque', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="por-que"]' },
  { clave: 'escritorio.tarjeta.porque.resumen', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="por-que"] summary' },
  { clave: 'escritorio.tarjeta.anterior', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="navegacion-reglas"] button' },
  { clave: 'escritorio.tarjeta.pico', pantalla: 'tarjeta-regla/escritorio', selector: '[data-capa="pico"]' },
  { clave: 'escritorio.tramo.activo', pantalla: 'tarjeta-regla/escritorio', selector: '.tramo-activo .subrayado' },
  // El móvil: la pastilla compacta, las pestañas y la hoja.
  { clave: 'movil.pastilla', pantalla: 'analizador-resultado/movil', selector: '[data-capa="pastilla"]' },
  { clave: 'movil.pastilla.etiqueta', pantalla: 'analizador-resultado/movil', selector: '[data-capa="pastilla"] p:first-child' },
  { clave: 'movil.pestanas', pantalla: 'analizador-resultado/movil', selector: '[data-capa="barra-pestanas"]' },
  { clave: 'movil.pestana.elegida', pantalla: 'analizador-resultado/movil', selector: '[data-capa="pestana – Texto"]' },
  { clave: 'movil.pestana.otra', pantalla: 'analizador-resultado/movil', selector: '[data-capa="pestana – Reglas"]' },
  { clave: 'movil.hoja', pantalla: 'tarjeta-regla/movil', selector: '[data-capa="hoja-inferior"]' },
  { clave: 'movil.hoja.asa', pantalla: 'tarjeta-regla/movil', selector: '[data-capa="asa"]' },
  { clave: 'movil.hoja.raya', pantalla: 'tarjeta-regla/movil', selector: '[data-capa="asa"] span' },
  { clave: 'movil.hoja.cuerpo', pantalla: 'tarjeta-regla/movil', selector: '[data-capa="hoja-inferior"] > div:last-child' },
  { clave: 'movil.hoja.siguiente', pantalla: 'tarjeta-regla/movil', selector: '[data-capa="hoja-inferior"] [data-capa="navegacion-reglas"] button' },
  // Tanda 3: el catálogo (sus tres tamaños, sin resultados y la hoja de filtros del móvil) y la ficha.
  { clave: 'escritorio.catalogo.titulo', pantalla: 'catalogo/escritorio', selector: '[data-capa="catalogo"] h1' },
  { clave: 'escritorio.catalogo.presentacion', pantalla: 'catalogo/escritorio', selector: '[data-capa="catalogo"] h1 + p' },
  { clave: 'escritorio.catalogo.buscador.etiqueta', pantalla: 'catalogo/escritorio', selector: '[data-capa="buscador"] label' },
  { clave: 'escritorio.catalogo.buscador', pantalla: 'catalogo/escritorio', selector: '#buscar-reglas' },
  { clave: 'escritorio.catalogo.familia', pantalla: 'catalogo/escritorio', selector: '[data-capa="filtro – Familia"]' },
  { clave: 'escritorio.catalogo.detector', pantalla: 'catalogo/escritorio', selector: '[data-capa="filtro – Detector"]' },
  { clave: 'escritorio.catalogo.severidad', pantalla: 'catalogo/escritorio', selector: '[data-capa="filtro – Severidad"]' },
  { clave: 'escritorio.catalogo.leyenda', pantalla: 'catalogo/escritorio', selector: '[data-capa="filtro – Familia"] legend' },
  { clave: 'escritorio.catalogo.casilla', pantalla: 'catalogo/escritorio', selector: '[data-capa="filtro – Familia"] label' },
  { clave: 'escritorio.catalogo.casilla.muestra', pantalla: 'catalogo/escritorio', selector: '[data-capa="filtro – Familia"] label .subrayado' },
  { clave: 'escritorio.catalogo.quitar', pantalla: 'catalogo/escritorio', selector: '[data-capa="acciones-filtros"] [data-capa="boton-secundario"]' },
  { clave: 'escritorio.catalogo.recuento', pantalla: 'catalogo/escritorio', selector: '[data-capa="recuento"]' },
  { clave: 'escritorio.catalogo.regla', pantalla: 'catalogo/escritorio', selector: '[data-capa="regla – Conector repetido (D)"]' },
  { clave: 'escritorio.catalogo.regla.muestra', pantalla: 'catalogo/escritorio', selector: '[data-capa="regla – Conector repetido (D)"] .subrayado' },
  { clave: 'escritorio.catalogo.regla.sigla', pantalla: 'catalogo/escritorio', selector: '[data-capa="regla – Conector repetido (D)"] [data-capa="sigla-D"]' },
  { clave: 'escritorio.catalogo.regla.nombre', pantalla: 'catalogo/escritorio', selector: '[data-capa="regla – Conector repetido (D)"] a' },
  { clave: 'escritorio.catalogo.regla.frase', pantalla: 'catalogo/escritorio', selector: '[data-capa="regla – Conector repetido (D)"] > div:last-child > p:first-of-type' },
  { clave: 'escritorio.catalogo.regla.datos', pantalla: 'catalogo/escritorio', selector: '[data-capa="regla – Conector repetido (D)"] > div:last-child > p:last-of-type' },
  { clave: 'escritorio.catalogo.informativa', pantalla: 'catalogo/escritorio', selector: '[data-capa="regla – Negrita de Markdown (C)"]' },
  { clave: 'escritorio.catalogo.informativa.frase', pantalla: 'catalogo/escritorio', selector: '[data-capa="regla – Negrita de Markdown (C)"] > div:last-child > p:first-of-type' },
  { clave: 'escritorio.catalogo.sin', pantalla: 'catalogo-sin-resultados/escritorio', selector: '[data-capa="sin-resultados"]' },
  { clave: 'escritorio.catalogo.sin.texto', pantalla: 'catalogo-sin-resultados/escritorio', selector: '[data-capa="sin-resultados"] p' },
  { clave: 'tableta.catalogo.familia', pantalla: 'catalogo/tableta', selector: '[data-capa="filtro – Familia"]' },
  { clave: 'tableta.catalogo.detector', pantalla: 'catalogo/tableta', selector: '[data-capa="filtro – Detector"]' },
  { clave: 'movil.catalogo.filtros', pantalla: 'catalogo/movil', selector: '[data-capa="barra-filtros"] [data-capa="boton-secundario"]' },
  { clave: 'movil.catalogo.regla', pantalla: 'catalogo/movil', selector: '[data-capa="regla – Conector repetido (D)"]' },
  { clave: 'movil.catalogo.hoja', pantalla: 'catalogo-filtros/movil', selector: '[data-capa="hoja-inferior"]' },
  { clave: 'movil.catalogo.hoja.asa', pantalla: 'catalogo-filtros/movil', selector: '[data-capa="hoja-inferior"] [data-capa="asa"]' },
  { clave: 'movil.catalogo.hoja.titulo', pantalla: 'catalogo-filtros/movil', selector: '#t-hoja-filtros' },
  { clave: 'movil.catalogo.hoja.cerrar', pantalla: 'catalogo-filtros/movil', selector: '[data-capa="hoja-inferior"] [data-capa="boton-cerrar"]' },
  { clave: 'movil.catalogo.hoja.acciones', pantalla: 'catalogo-filtros/movil', selector: '[data-capa="hoja-inferior"] [data-capa="acciones-filtros"]' },
  { clave: 'movil.catalogo.hoja.aplicar', pantalla: 'catalogo-filtros/movil', selector: '[data-capa="hoja-inferior"] [data-capa="boton-principal"]' },
  { clave: 'escritorio.ficha', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="ficha-regla"]' },
  { clave: 'escritorio.ficha.pastilla', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="pastilla-familia"]' },
  { clave: 'escritorio.ficha.pastilla.muestra', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="pastilla-familia"] .subrayado' },
  { clave: 'escritorio.ficha.nombre', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="ficha-regla"] h1' },
  { clave: 'escritorio.ficha.id', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="ficha-regla"] h1 + p' },
  { clave: 'escritorio.ficha.frase', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="ficha-regla"] > div:first-child > p:last-child' },
  { clave: 'escritorio.ficha.seccion', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="seccion – Qué hacer"] h2' },
  { clave: 'escritorio.ficha.seccion.texto', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="seccion – Qué hacer"] p' },
  { clave: 'escritorio.ficha.datos', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="seccion – Datos de la regla"] dl' },
  { clave: 'escritorio.ficha.datos.etiqueta', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="seccion – Datos de la regla"] dt' },
  { clave: 'escritorio.ficha.fuente', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="seccion – Fuentes"] a' },
  { clave: 'escritorio.ficha.ejemplo', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="ejemplo – Positivo"]' },
  { clave: 'escritorio.ficha.ejemplo.texto', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="ejemplo – Positivo"] p' },
  { clave: 'escritorio.ficha.ejemplo.tramo', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="ejemplo – Positivo"] .subrayado' },
  { clave: 'escritorio.ficha.ejemplo.sigla', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="ejemplo – Positivo"] p > span[aria-hidden="true"]' },
  { clave: 'escritorio.ficha.probar', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="acciones"] [data-capa="boton-principal"]' },
  { clave: 'escritorio.ficha.volver', pantalla: 'ficha-regla/escritorio', selector: '[data-capa="acciones"] a' },
  { clave: 'movil.ficha.probar', pantalla: 'ficha-regla/movil', selector: '[data-capa="acciones"] [data-capa="boton-principal"]' },
  // Tanda 4 bis: el marco «Informe / A4», página a página (sus selectores, dentro de las páginas: la columna invisible con
  // que el modelo mide sus bloques va antes en el documento y lleva los mismos).
  { clave: 'informe.pagina', pantalla: 'informe/escritorio', selector: '[data-capa="página 1"]' },
  { clave: 'informe.numero', pantalla: 'informe/escritorio', selector: '[data-capa="página 1"] [data-capa="número de página"]' },
  { clave: 'informe.s1.titulo', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 1"] h1` },
  { clave: 'informe.s1.linea', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 1"] h1 + div > p:nth-child(1)` },
  { clave: 'informe.s1.linea2', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 1"] h1 + div > p:nth-child(2)` },
  { clave: 'informe.s1.ultima', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 1"] h1 + div > p:last-child` },
  { clave: 'informe.s2.titulo', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 2"] h2` },
  { clave: 'informe.s2.etiqueta', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 2"] h2 + div > p:nth-child(1)` },
  { clave: 'informe.s2.frase', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 2"] h2 + div > p:nth-child(2)` },
  { clave: 'informe.s2.pesa', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 2"] h2 + div > p:nth-child(3)` },
  { clave: 'informe.s2.empieza', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 2"] h2 + div > p:nth-child(4)` },
  { clave: 'informe.s2.espanol', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 2"] h2 + div > p:nth-child(5)` },
  { clave: 'informe.s3.titulo', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 3"] h2` },
  { clave: 'informe.s3.muestra', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 3"] li:first-child svg` },
  { clave: 'informe.s3.linea', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 3"] li:first-child span` },
  { clave: 'informe.s3.linea2', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 3"] li:nth-child(2) span` },
  { clave: 'informe.s4.titulo', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 4"] h2` },
  { clave: 'informe.s4.parrafo', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="párrafo 1"]` },
  { clave: 'informe.s4.sigla', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="párrafo 1"] > span.font-ui` },
  { clave: 'informe.s4.parrafo2', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="párrafo 2"]` },
  { clave: 'informe.s5.titulo', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 5"] h2` },
  { clave: 'informe.s5.paquete', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 5"] h3` },
  { clave: 'informe.s5.familia', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 5"] li.list-disc:first-child > span` },
  { clave: 'informe.s5.regla', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 5"] li.list-disc:first-child li:first-child` },
  { clave: 'informe.s5.regla2', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 5"] li.list-disc:first-child li:nth-child(2)` },
  { clave: 'informe.s5.reglaFinal', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 5"] li.list-disc:first-child li:last-child` },
  { clave: 'informe.s5.familia2', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 5"] li.list-disc:nth-child(2) > span` },
  { clave: 'informe.s6.titulo', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa^="seccion 6"] h2` },
  { clave: 'informe.s6.nombre', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="entrada – Conector repetido"] strong` },
  { clave: 'informe.s6.url', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="entrada – Conector repetido"] > p:first-child > span` },
  { clave: 'informe.s6.frase', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="entrada – Conector repetido"] > p:nth-child(2)` },
  { clave: 'informe.s6.fragmentos', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="entrada – Conector repetido"] > p:nth-child(3)` },
  { clave: 'informe.s6.quehacer', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="entrada – Conector repetido"] > p:nth-child(4)` },
  { clave: 'informe.s6.quehacer.etiqueta', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="entrada – Conector repetido"] > p:nth-child(4) > span` },
  { clave: 'informe.s6.siguiente', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="entrada – Coletilla de gerundio final"] strong` },
  { clave: 'informe.pie', pantalla: 'informe/escritorio', selector: `${PAGINA} [data-capa="seccion 7 – Pie"]` },
];

/**
 * Las piezas que el modelo no tiene y fija el DISEÑO, que manda sobre él
 * (encargo 10.4, método): se escriben con su apartado y su nota, sin pantalla
 * ni selector, para que el juez de fidelidad las mida igual y nadie las tome
 * por medidas del prototipo.
 */
const DEL_DISENO: Readonly<
  Record<string, { origen: string; nota: string } & Partial<Record<'ancho' | 'alto' | 'separacionDeParrafos' | 'margenDeScroll', number>> & Partial<Record<'familia' | 'peso' | 'tamano' | 'color', string>>>
> = {
  'escritorio.cabecera.icono': {
    origen: 'DISEÑO-RADIOGRAFIA.md §8',
    nota: 'Del DISEÑO, no del prototipo (el modelo no tiene icono en la cabecera): el icono (c) a 56 px en escritorio, la altura del bloque nombre + eslogan; corregido por Antonio al ver la Tanda 1 (04/10, cb89407).',
    ancho: 56,
    alto: 56,
  },
  'movil.cabecera.icono': {
    origen: 'DISEÑO-RADIOGRAFIA.md §8',
    nota: 'Del DISEÑO, no del prototipo (el modelo no tiene icono en la cabecera): el icono (c) a 48 px en la cabecera compacta del móvil; corregido por Antonio al verlo pequeño a 32 en su iPhone (04/10, cb89407).',
    ancho: 48,
    alto: 48,
  },
  // La separación entre dos párrafos de la vista: lo que hay entre el renglón de arriba del segundo y el último del primero, menos un renglón.
  'escritorio.vista.parrafos': {
    origen: 'DISEÑO-RADIOGRAFIA.md §5',
    nota: 'Del DISEÑO, no del prototipo (el modelo separaba los párrafos de la vista con 16 px): la vista respeta los saltos del texto (white-space: pre-wrap) y una línea en blanco entre párrafos mide un renglón de Literata 18 a 1,5, 27 px; es la legibilidad del DISEÑO, decidido por Antonio en la parada 2 de la Tanda 2 (04/10).',
    separacionDeParrafos: 27,
  },
  // La caja de la columna del resultado con scroll propio (desde la Tanda 3), con resultado; su contenido son las piezas escritorio.pastilla y demás, a 360.
  'escritorio.columna-resultado': {
    origen: 'DISEÑO-RADIOGRAFIA.md §6.1',
    nota: 'Del DISEÑO, no del prototipo (en el modelo la columna no tiene scroll propio): con scroll propio (decisión de Antonio en la parada 2, DISEÑO §6.1), la caja mide su contenido, 360 como en el modelo, más el sitio del anillo de foco a cada lado (2 + 2 px, para que no se corte) y el carril de la barra de scroll clásica (15 px en el Chrome de Windows de los jueces): 383. Con barras superpuestas (macOS, iOS) no hay carril y mide 368. Aceptado por Antonio en la parada 3 (05/10).',
    ancho: 383,
  },
  // El margen de scroll del anillo de foco (desde la Tanda 3), arriba y abajo, en la ventana y en la columna del resultado.
  'escritorio.margen-de-scroll': {
    origen: 'DISEÑO-RADIOGRAFIA.md §7',
    nota: 'Del DISEÑO, no del prototipo (el modelo no se recorre con el tabulador): al tabular, el navegador desplaza lo justo para que se vea el elemento, no su anillo de foco (2 px a 2 px, DISEÑO §7), y el anillo se salía 4 px por el borde; la ventana y la columna del resultado dejan arriba y abajo el sitio del anillo, 4 px (scroll-padding-block). Aceptado por Antonio en la parada 3 (05/10).',
    margenDeScroll: 4,
  },
  // La hoja de imprimir sin resultado (Tanda 4 bis): el icono, el nombre y el mensaje, centrados en una sola página A4.
  'informe.sin-resultado.icono': {
    origen: 'DISEÑO-RADIOGRAFIA.md §6.5',
    nota: 'Del DISEÑO, no del prototipo (el modelo no tiene la hoja de imprimir sin resultado): el icono (c) a 96 px, centrado en horizontal y en vertical en una sola página A4, con el nombre y el mensaje debajo; decisión de Antonio del 05/10.',
    ancho: 96,
    alto: 96,
  },
  'informe.sin-resultado.nombre': {
    origen: 'DISEÑO-RADIOGRAFIA.md §6.5',
    nota: 'Del DISEÑO, no del prototipo (el modelo no tiene la hoja de imprimir sin resultado): «RadiografIA» en Atkinson 700 a 24 pt (32 px), debajo del icono; decisión de Antonio del 05/10.',
    familia: 'Atkinson Hyperlegible Next',
    peso: '700',
    tamano: '32px',
  },
  'informe.sin-resultado.mensaje': {
    origen: 'DISEÑO-RADIOGRAFIA.md §6.5',
    nota: 'Del DISEÑO, no del prototipo (el modelo no tiene la hoja de imprimir sin resultado): «No hay análisis que imprimir…» en Literata a 12 pt (16 px) e ink-2, debajo del nombre; decisión de Antonio del 05/10.',
    familia: 'Literata',
    peso: '400',
    tamano: '16px',
    color: 'rgb(74, 74, 74)',
  },
};

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const pestana = await abrirChrome();
try {
  await pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1000, deviceScaleFactor: 1, mobile: false });
  const medidas: Record<string, unknown> = {};
  let actual = '';
  for (const { clave, pantalla, selector } of PIEZAS) {
    if (pantalla !== actual) {
      await pestana.cdp('Page.navigate', { url: `${URL_DEL_MODELO}?pantalla=${encodeURIComponent(pantalla)}#${pantalla}` });
      await pestana.hasta(`!!document.querySelector('[data-capa^="Pantalla / "]') && document.fonts.status === 'loaded'`, `la pantalla ${pantalla}`, 60_000);
      await esperar(800);
      actual = pantalla;
    }
    medidas[clave] = {
      pantalla,
      selector,
      ...(await pestana.evaluar<Record<string, unknown>>(`(() => {
        const e = document.querySelector(${JSON.stringify(selector)});
        if (e === null) throw new Error('no está: ' + ${JSON.stringify(selector)});
        const marco = e.closest('[data-capa^="Pantalla / "]').getBoundingClientRect();
        const c = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        const borde = (lado) => c.getPropertyValue('border-' + lado + '-width') + ' ' + c.getPropertyValue('border-' + lado + '-style') + ' ' + c.getPropertyValue('border-' + lado + '-color');
        return {
          texto: e.textContent.trim().slice(0, 60),
          familia: c.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
          tamano: c.fontSize,
          peso: c.fontWeight,
          estilo: c.fontStyle,
          interlineado: c.lineHeight,
          interletrado: c.letterSpacing,
          color: c.color,
          fondo: c.backgroundColor,
          decoracion: c.textDecorationLine,
          decoEstilo: c.textDecorationStyle,
          decoGrosor: c.textDecorationThickness,
          decoColor: c.textDecorationColor,
          decoDesplazamiento: c.textUnderlineOffset,
          alineacion: c.verticalAlign,
          bordeArriba: borde('top'),
          bordeAbajo: borde('bottom'),
          bordeIzquierdo: borde('left'),
          altoMaximo: c.maxHeight,
          radio: c.borderRadius,
          relleno: [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft],
          ancho: Math.round(r.width * 100) / 100,
          alto: Math.round(r.height * 100) / 100,
          desdeElMarco: Math.round((r.left - marco.left) * 100) / 100,
          anchoDelMarco: Math.round(marco.width * 100) / 100,
          ...(() => {
            // En el informe, dónde va en su página: su número, su caja y la línea base de su primera y su última línea
            // (un marcador de 0 × 0 en la línea base, al principio y al final, que se quita después).
            const pagina = e.closest('[data-capa^="página "]');
            if (pagina === null) return {};
            const P = pagina.getBoundingClientRect();
            const base = (alFinal) => {
              const marca = document.createElement('span');
              marca.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
              if (alFinal) e.append(marca);
              else e.prepend(marca);
              const y = marca.getBoundingClientRect().bottom;
              marca.remove();
              return Math.round((y - P.top) * 100) / 100;
            };
            const conTexto = e.tagName !== 'svg' && e.getAttribute('data-capa')?.startsWith('página ') !== true;
            return {
              pagina: Number(pagina.getAttribute('data-capa').replace('página ', '')),
              arriba: Math.round((r.top - P.top) * 100) / 100,
              izquierda: Math.round((r.left - P.left) * 100) / 100,
              derecha: Math.round((r.right - P.left) * 100) / 100,
              ...(conTexto ? { base: base(false), ultimaBase: base(true) } : {}),
            };
          })(),
        };
      })()`)),
    };
    console.log(`${clave}: medido`);
  }
  Object.assign(medidas, DEL_DISENO);
  const version = (await pestana.cdp('Browser.getVersion', {})) as { product: string };
  const json = {
    $descripcion:
      'Medidas del modelo de Figma Make publicado (encargo 10.4), tomadas por CDP con web/scripts/medir-modelo.ts. Las lee web/jueces/fidelidad.spec.ts; se regeneran a mano cuando cambia el modelo. Longitudes en px CSS, colores como los da getComputedStyle. Las piezas con «origen» no son del prototipo: las fija el DISEÑO, que manda, y su «nota» dice por qué.',
    url: URL_DEL_MODELO,
    fecha: new Date().toISOString().slice(0, 10),
    navegador: version.product,
    medidas,
  };
  writeFileSync(SALIDA, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${Object.keys(medidas).length} piezas en ${SALIDA.pathname}`);
} finally {
  await pestana.cerrar();
}
