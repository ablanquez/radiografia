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
 * máximo.
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
];

/**
 * Las piezas que el modelo no tiene y fija el DISEÑO, que manda sobre él
 * (encargo 10.4, método): se escriben con su apartado y su nota, sin pantalla
 * ni selector, para que el juez de fidelidad las mida igual y nadie las tome
 * por medidas del prototipo.
 */
const DEL_DISENO: Readonly<Record<string, { origen: string; nota: string; ancho: number; alto: number }>> = {
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
