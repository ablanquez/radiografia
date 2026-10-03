/**
 * Lo que pinta la pantalla mínima (encargo 6.2, c; firmado en la parada 1).
 * Funciona, no luce: el diseño es del punto 10.
 *
 * Todo el texto entra en el DOM con createElement y textContent (o como nodo
 * de texto con append): el del usuario y el de las fichas, que vienen de un
 * JSON. Nunca innerHTML ni plantillas de cadena.
 * [DOC] https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
 *    — «The most fundamental safe way to populate the DOM with untrusted data
 *    is to use the safe assignment property textContent»; innerHTML,
 *    outerHTML y document.write, fuera. Los atributos que se ponen son class,
 *    role, tabindex y data-* (dataset), que no ejecutan nada, y desde el 7.1
 *    el href del enlace a la ficha de cada regla (enlaceARegla).
 *
 * La vista de resultado: el texto analizado, partido en tramos por todos los
 * límites de señal de los dos paquetes (tramos.ts). Cada tramo con señales
 * es un <span role="button" tabindex="0"> con sus familias y los índices de
 * sus señales en data-*, y responde al clic, a Enter y a Espacio.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/button_role
 *    — con role="button" en un elemento que no es un botón, «the tabindex
 *    attribute has to be used to make the button focusable», y hay que
 *    definir «event handlers for click and keydown events. This includes
 *    handling the Enter and Space key presses».
 * [PROPIO, firmado en la parada 1, punto 6] No es un <button>, aunque MDN lo
 *    prefiere: <button> es inline-block, y un tramo largo se haría un bloque
 *    y rompería el renglón.
 * Un subrayado por familia en el mismo tramo: dentro del tramo, un <span>
 *    por familia, anidados, cada uno con su color y más separado del texto
 *    que el anterior.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-decoration
 *    — «Text decorations are drawn across descendant text elements», y un
 *    descendiente con su propia decoración añade otra línea.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-underline-offset
 *    — «sets the offset distance of an underline text decoration line […]
 *    from its original position»; en em, «so the offset scales with the font
 *    size».
 * Las señales del texto entero (ausencias y estadísticas) no tienen tramo: van
 * al desglose. Las familias informativas (canal) llevan otro estilo y van
 * aparte en la leyenda.
 *
 * Las cadenas de la interfaz están en web/src/textos.ts (encargo 6.3, b).
 *
 * El orden (cierre del 7.1, orden.ts): la leyenda y el desglose, como el
 * índice del catálogo: paquetes como se cargan, familias alfabéticas por su
 * nombre, reglas alfabéticas por el suyo. El panel de un tramo, no: enseña las
 * reglas en el orden de sus señales.
 *
 * Los paquetes propios (encargo 8.1, b; firmado en la parada 1): sus reglas no
 * tienen página en /reglas/, así que su nombre va sin enlace, y su ficha
 * completa (fichaCompleta) va en el panel y, en el desglose, dentro de un
 * <details> cuyo resumen es la línea de la regla. La leyenda enseña solo las
 * familias de los paquetes activos, y el medidor avisa si ninguno trae escala.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details
 *    — «creates a disclosure widget in which information is visible only when
 *    the widget is toggled into an open state»; «The contents of the <summary>
 *    element are used as the label for the disclosure widget». Baseline desde
 *    enero de 2020.
 *
 * El informe para imprimir (encargo 9.1, b; firmado en la parada 1): la
 * cabecera (pintarCabeceraDelInforme) y la lista de señales por regla
 * (pintarSenalesDelInforme, con las entradas de informe.ts) se pintan al
 * analizar, del mismo resultado, en bloques que la hoja de index.astro enseña
 * solo en papel; las siglas de familia van en data-siglas de cada tramo y en
 * data-sigla de cada línea de la leyenda, y la hoja las escribe en papel con
 * ::after y ::before. En la lista, el nombre de una regla incluida enlaza a su
 * ficha con la dirección absoluta, porque en papel se escribe el href tal cual
 * (attr(href)); en el desglose, no.
 *
 * El lenguaje de calle (encargo 9.2, b; firmado por Antonio en la parada 1),
 * con las frases de lectura.ts: el medidor da por paquete la etiqueta y la
 * frase (retoque del 9.2), el resumen y, plegadas en «Ver el detalle», las
 * cifras; el panel, el nombre, la frase en claro, qué hacer y, plegado, «¿Por
 * qué lo miramos?» (la explicación, la evidencia, el origen de la lista, el
 * paquete y el enlace a la ficha; la de un paquete propio, entera); el
 * desglose, sin el id de cada regla y con sus etiquetas en claro. Los ids
 * solo quedan dentro de «¿Por qué lo miramos?» y en el catálogo.
 */
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import type { ProblemaDeCarga } from './cargar.ts';
import { parametrosEnLlano, urlDeRegla } from '../catalogo/catalogo.ts';
import { enOrden, type ClaveDeOrden } from '../orden.ts';
import { nombreDeRegla } from './humanizar.ts';
import { entradasDelInforme, repartirSiglas } from './informe.ts';
import { cifrasDelPaquete, detalleDelPaquete, etiquetaDelPaquete, generoEnCalle, lineaDelTextoEntero, motivoNoMirada, motivoSinComparar, palabrasDelTexto, resumenDelPaquete, type Voz } from './lectura.ts';
import { partirEnTramos } from './tramos.ts';

type Regla = Paquete['reglas'][number];
type ResultadoDePaquete = Resultado['paquetes'][number];
type SenalCalificada = Resultado['senales'][number];

/** [PROPIO] Siete colores distintos entre sí sobre blanco (clases familia-color-N de index.astro); si hubiera más familias, se repiten. */
const COLORES = 7;

/** Un elemento con su texto (textContent, nunca HTML) y su clase. */
function el<K extends keyof HTMLElementTagNameMap>(etiqueta: K, texto?: string, clase?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(etiqueta);
  if (texto !== undefined) e.textContent = texto;
  if (clase !== undefined) e.className = clase;
  return e;
}

/** Un párrafo «Nombre: valor», con el nombre en negrita. */
function campo(nombre: string, valor: string): HTMLParagraphElement {
  const p = el('p');
  p.append(el('strong', `${nombre}: `), valor);
  return p;
}

const formato = new Intl.NumberFormat('es', { maximumFractionDigits: 2 });
const cifra = (x: number): string => formato.format(x);
const pesoEnCifra = new Intl.NumberFormat('es');

/**
 * Lo que se busca por clave: las reglas y las familias de los paquetes, con su
 * clase de color. Desde el 8.1 (firmado en la parada 1), de TODOS los paquetes
 * que conoce la página, activos o no: los incluidos y después los propios, en
 * el orden de carga. Así una familia no cambia de color al marcar o desmarcar
 * una casilla. La clave es paquete + familia: dos familias que se llaman
 * igual en dos paquetes son dos entradas.
 * [PROPIO] Las familias de un paquete propio llevan además la clase
 *    familia-propia (subrayado discontinuo en index.astro): con siete colores
 *    y siete familias que puntúan en los incluidos, las de un propio repiten
 *    color. El paquete se dice siempre en texto: en la leyenda, en el panel y
 *    en el desglose.
 *    [DOC] https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html — 1.4.1:
 *    «Color is not used as the only visual means of conveying information».
 */
export interface Indice {
  /** «paquete::reglaId» → la ficha. */
  reglas: Map<string, Regla>;
  familias: { clave: string; paquete: string; nombre: string; informativa: boolean; clase: string }[];
  /** «paquete::familiaId» → su clase de color. */
  claseDeFamilia: Map<string, string>;
  /** Los nombres de los paquetes propios: sus reglas no tienen ficha en /reglas/. */
  propios: ReadonlySet<string>;
  /** paquete → su cabecera: lo que pide la ficha completa de una regla propia. */
  cabeceras: Map<string, Paquete['cabecera']>;
  /** «paquete::familiaId» → su sigla, para el papel (encargo 9.1; informe.ts). */
  siglaDeFamilia: Map<string, string>;
}

const clave = (paquete: string, id: string): string => `${paquete}::${id}`;

/**
 * El nombre de la regla (encargo 7.1: el de su ficha; si no lo trae, el id
 * humanizado), enlazado a su ficha del catálogo, /reglas/<id>/ con la base
 * (urlDeRegla). El id lo limita el esquema a minúsculas, cifras y guiones: el
 * href no puede ser un «javascript:».
 */
function enlaceARegla(indice: Indice, base: string, paquete: string, id: string): HTMLAnchorElement {
  const enlace = el('a', nombreDeRegla(id, indice.reglas.get(clave(paquete, id))));
  enlace.href = urlDeRegla(base, id);
  return enlace;
}

/**
 * La ficha completa de una regla de un paquete propio (encargo 8.1; firmado en
 * la parada 1): el mismo orden y las mismas etiquetas que su página del
 * catálogo (src/pages/reglas/[id].astro), sin el título, que pone quien la
 * llama. Todo con textContent. Los únicos href son las fuentes, que el esquema
 * limita a «^https?://\S+$» (regla.schema.json, fuente.url): no puede colarse
 * un «javascript:».
 */
export function fichaCompleta(regla: Regla, cabecera: Paquete['cabecera']): HTMLElement[] {
  const familia = cabecera.familias.find((f) => f.id === regla.familia);
  const partes: HTMLElement[] = [el('p', `${regla.id} · ${cabecera.nombre}`, 'id-regla')];
  if (regla.informativa || familia?.informativa) partes.push(el('p', textos.INFORMATIVA));
  const datos = el('dl');
  for (const [nombre, valor] of [
    [textos.PAQUETE, textos.paqueteConVersion(cabecera.nombre, cabecera.version, cabecera.descripcion)],
    [textos.FAMILIA, familia?.nombre ?? regla.familia],
    [textos.DETECTOR, regla.detector],
    [textos.PESO, pesoEnCifra.format(regla.peso)],
    [textos.SEVERIDAD, regla.severidad],
    [textos.NIVEL_DE_EVIDENCIA, regla.nivelEvidencia],
  ] as const) {
    datos.append(el('dt', nombre), el('dd', valor));
  }
  const comoBusca = el('dl');
  for (const p of parametrosEnLlano(regla)) {
    const valor = el('dd');
    valor.append(p.codigo ? el('code', p.valor) : p.valor);
    comoBusca.append(el('dt', p.etiqueta), valor);
  }
  const excepciones = el('ul');
  for (const e of regla.excepciones) excepciones.append(el('li', e));
  const fuentes = el('ul');
  for (const fuente of regla.fuente) {
    const enlace = el('a', fuente.titulo);
    enlace.href = fuente.url;
    const elemento = el('li');
    elemento.append(enlace);
    fuentes.append(elemento);
  }
  partes.push(
    datos,
    el('h5', textos.COMO_BUSCA),
    comoBusca,
    el('h5', textos.EXPLICACION),
    el('p', regla.explicacion),
    el('h5', textos.SUGERENCIA),
    el('p', regla.sugerencia),
    el('h5', textos.EXCEPCIONES),
    regla.excepciones.length === 0 ? el('p', textos.NINGUNA) : excepciones,
    el('h5', textos.ORIGEN_DE_LA_LISTA),
    el('p', regla.origenLista ?? textos.SIN_DATO),
    el('h5', textos.FUENTES),
    fuentes,
    el('h5', textos.DONDE_DISPARA),
    ...regla.ejemplos.positivos.map((e) => el('pre', e, 'ejemplo')),
    el('h5', textos.DONDE_NO_DISPARA),
    ...regla.ejemplos.negativos.map((e) => el('pre', e, 'ejemplo')),
  );
  return partes;
}

export function indexar(paquetes: readonly Paquete[], propios: ReadonlySet<string> = new Set()): Indice {
  const reglas = new Map<string, Regla>();
  const familias: { posicion: number; familia: Indice['familias'][number] }[] = [];
  const claseDeFamilia = new Map<string, string>();
  const cabeceras = new Map<string, Paquete['cabecera']>();
  let color = 0;
  paquetes.forEach((paquete, posicion) => {
    const nombre = paquete.cabecera.nombre;
    cabeceras.set(nombre, paquete.cabecera);
    for (const regla of paquete.reglas) reglas.set(clave(nombre, regla.id), regla);
    for (const familia of paquete.cabecera.familias) {
      const deColor = familia.informativa ? 'familia-informativa' : `familia-color-${color++ % COLORES}`;
      const clase = propios.has(nombre) ? `${deColor} familia-propia` : deColor;
      claseDeFamilia.set(clave(nombre, familia.id), clase);
      familias.push({ posicion, familia: { clave: clave(nombre, familia.id), paquete: nombre, nombre: familia.nombre, informativa: familia.informativa, clase } });
    }
  });
  // Los colores se reparten en el orden de declaración, como desde el 6.2; la lista va en el de presentación (orden.ts).
  const enPresentacion = enOrden(familias, (x) => [x.posicion, x.familia.nombre]).map((x) => x.familia);
  // Las siglas, en el de presentación: el de la leyenda, que en papel es su clave (9.1).
  return { reglas, familias: enPresentacion, claseDeFamilia, propios, cabeceras, siglaDeFamilia: repartirSiglas(enPresentacion) };
}

export function pintarProblemas(contenedor: HTMLElement, problemas: readonly ProblemaDeCarga[]): void {
  contenedor.replaceChildren(el('p', textos.PROBLEMAS_DE_CARGA));
  for (const { paquete, mensajes } of problemas) {
    const lista = el('ul');
    for (const mensaje of mensajes) lista.append(el('li', mensaje));
    contenedor.append(el('p', paquete, 'problema-paquete'), lista);
  }
  contenedor.hidden = false;
}

/** La leyenda de las familias de los paquetes activos (desde el 8.1, el índice lleva también las de los que no lo están). */
export function pintarLeyenda(contenedor: HTMLElement, indice: Indice, activos: ReadonlySet<string>): void {
  const puntuan = el('ul', undefined, 'leyenda');
  const informativas = el('ul', undefined, 'leyenda');
  for (const f of indice.familias.filter((x) => activos.has(x.paquete))) {
    const elemento = el('li');
    elemento.dataset['sigla'] = indice.siglaDeFamilia.get(f.clave) ?? '';
    elemento.append(el('span', textos.MUESTRA_DE_SUBRAYADO, `muestra ${f.clase}`), ` ${f.nombre} (${f.paquete})`);
    (f.informativa ? informativas : puntuan).append(elemento);
  }
  contenedor.replaceChildren(el('h3', textos.FAMILIAS), el('p', textos.CLAVE_DE_SIGLAS, 'solo-impresion'), puntuan);
  if (informativas.childElementCount > 0) contenedor.append(el('p', textos.INFORMATIVAS_EN_LA_LEYENDA), informativas);
}

function familiaDe(senal: SenalCalificada, indice: Indice): string {
  return clave(senal.paquete, indice.reglas.get(clave(senal.paquete, senal.reglaId))?.familia ?? '');
}

export function pintarVista(
  contenedor: HTMLElement,
  texto: string,
  senales: readonly SenalCalificada[],
  indice: Indice,
  alActivar: (indices: readonly number[]) => void,
): void {
  contenedor.replaceChildren();
  for (const tramo of partirEnTramos(texto.length, senales)) {
    const trozo = texto.slice(tramo.inicio, tramo.fin);
    if (tramo.senales.length === 0) {
      contenedor.append(trozo);
      continue;
    }
    const familias = [...new Set(tramo.senales.map((i) => familiaDe(senales[i]!, indice)))];
    const boton = el('span', undefined, 'tramo');
    boton.setAttribute('role', 'button');
    boton.tabIndex = 0;
    boton.dataset['familias'] = familias.join('|');
    boton.dataset['siglas'] = familias.map((familia) => indice.siglaDeFamilia.get(familia) ?? '').join('·');
    boton.dataset['senales'] = tramo.senales.join(' ');
    let dentro: HTMLElement = boton;
    familias.forEach((familia, nivel) => {
      const capa = el('span', undefined, indice.claseDeFamilia.get(familia) ?? 'familia-color-0');
      capa.style.textUnderlineOffset = `${0.15 + nivel * 0.3}em`;
      dentro.append(capa);
      dentro = capa;
    });
    dentro.append(trozo);
    const activar = () => alActivar(tramo.senales);
    boton.addEventListener('click', activar);
    boton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activar();
      }
    });
    contenedor.append(boton);
  }
}

/**
 * El panel de un subrayado (firmado en la parada 1 del 9.2): por regla, el
 * nombre, la frase en claro, qué hacer y, plegado, «¿Por qué lo miramos?», con
 * la explicación, el nivel de evidencia, el origen de la lista, el id con su
 * paquete y el enlace a la ficha; la de un paquete propio no tiene ficha en
 * /reglas/, y lleva dentro su ficha completa (8.1).
 */
export function pintarPanel(contenedor: HTMLElement, senales: readonly SenalCalificada[], indice: Indice, base: string): void {
  contenedor.replaceChildren(el('h3', textos.TITULO_DEL_PANEL));
  const vistas = new Set<string>();
  for (const senal of senales) {
    const k = clave(senal.paquete, senal.reglaId);
    if (vistas.has(k)) continue;
    vistas.add(k);
    const ficha = el('article', undefined, 'ficha');
    const regla = indice.reglas.get(k);
    const cabecera = indice.cabeceras.get(senal.paquete);
    ficha.append(el('h4', nombreDeRegla(senal.reglaId, regla)));
    if (regla?.enClaro !== undefined) ficha.append(el('p', regla.enClaro, 'en-claro'));
    if (regla !== undefined) ficha.append(campo(textos.QUE_HACER, regla.sugerencia));
    const porQue = el('details', undefined, 'por-que');
    porQue.append(el('summary', textos.POR_QUE_LO_MIRAMOS));
    if (indice.propios.has(senal.paquete) && regla !== undefined && cabecera !== undefined) {
      porQue.append(...fichaCompleta(regla, cabecera));
    } else {
      porQue.append(el('p', `${senal.reglaId} · ${senal.paquete}`, 'id-regla'));
      if (regla !== undefined) {
        porQue.append(
          campo(textos.EXPLICACION, regla.explicacion),
          campo(textos.NIVEL_DE_EVIDENCIA, regla.nivelEvidencia),
          campo(textos.ORIGEN_DE_LA_LISTA, regla.origenLista ?? textos.SIN_DATO),
        );
      }
      const enlace = el('a', textos.VER_SU_FICHA);
      enlace.href = urlDeRegla(base, senal.reglaId);
      const parrafo = el('p');
      parrafo.append(enlace);
      porQue.append(parrafo);
    }
    ficha.append(porQue);
    contenedor.append(ficha);
  }
  contenedor.hidden = false;
}

/**
 * El medidor en claro (firmado en la parada 1 del 9.2): por paquete con
 * escala, la etiqueta como título del bloque, la frase debajo y, con texto
 * corto, el aviso (retoque del 9.2); su resumen y, plegadas en «Ver el
 * detalle», sus cifras. Sin escala, el nombre del paquete y su resumen. Con
 * texto insuficiente, como antes: el aviso y el motivo.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details
 *    — plegado por defecto: la información se ve «only when the widget is
 *    toggled into an open state».
 */
export function pintarMedidor(contenedor: HTMLElement, resultado: Resultado, vozDe: (paquete: string) => Voz, indice: Indice, nombreDelGenero: string): void {
  contenedor.replaceChildren();
  if (resultado.tramo === 'insuficiente') {
    const primero = resultado.paquetes[0]?.puntuacion;
    contenedor.append(el('p', textos.TEXTO_INSUFICIENTE, 'estado-tramo'), el('p', primero?.motivo ?? ''), el('p', palabrasDelTexto(resultado, nombreDelGenero), 'datos'));
    return;
  }
  for (const r of resultado.paquetes) {
    const voz = vozDe(r.paquete);
    const bloque = el('section', undefined, 'lectura');
    const cabeza = etiquetaDelPaquete(resultado, r, voz);
    // Con escala, la etiqueta es el título del bloque (retoque del 9.2) y la de RadiografIA dice ya qué mide; sin escala, el nombre del paquete.
    if (cabeza === null) bloque.append(el('h3', r.paquete));
    else {
      bloque.append(el('h3', cabeza.etiqueta, 'etiqueta'));
      if (cabeza.frase !== null) bloque.append(el('p', cabeza.frase, 'frase'));
      if (cabeza.aviso !== null) bloque.append(el('p', cabeza.aviso, 'aviso-corto'));
    }
    for (const linea of resumenDelPaquete(resultado, r, voz, indice)) bloque.append(el('p', linea, 'resumen'));
    if (r.banda !== null) {
      const detalle = el('details', undefined, 'detalle');
      detalle.append(el('summary', textos.VER_EL_DETALLE), ...detalleDelPaquete(resultado, r, nombreDelGenero).map((linea) => el('p', linea)));
      bloque.append(detalle);
    }
    contenedor.append(bloque);
  }
  // Ninguno trae escala (por ejemplo, RadiografIA desmarcado): sin etiqueta, y se dice (firmado en la parada 1 del 8.1).
  if (resultado.paquetes.every((x) => x.banda === null)) contenedor.append(el('p', textos.SIN_ESCALA, 'banda'));
}

/** La cabecera del informe, solo para el papel (9.1): título, fecha y hora del análisis, género, palabras y tramo, y los paquetes con su versión. */
export function pintarCabeceraDelInforme(
  contenedor: HTMLElement,
  resultado: Resultado,
  paquetes: readonly Paquete[],
  indice: Indice,
  fecha: string,
  nombreDelGenero: string,
): void {
  const delInforme = paquetes.map(({ cabecera }) => textos.paqueteDelInforme(cabecera.nombre, cabecera.version, indice.propios.has(cabecera.nombre)));
  // En papel, «Ver el detalle» no se despliega (9.2): sus cifras van aquí, las de cada paquete con escala.
  const cifras = resultado.tramo === 'insuficiente' ? [] : resultado.paquetes.filter((r) => r.banda !== null).flatMap((r) => cifrasDelPaquete(resultado, r));
  contenedor.replaceChildren(
    el('p', textos.INFORME_DE_RADIOGRAFIA, 'titulo-informe'),
    el('p', textos.analisisDel(fecha)),
    el('p', palabrasDelTexto(resultado, nombreDelGenero)),
    el('p', textos.paquetesDelInforme(delInforme)),
    ...cifras.map((linea) => el('p', linea)),
  );
}

/**
 * La lista de señales del informe, solo para el papel (9.1): una entrada por
 * regla (informe.ts) con su nombre, su familia y su paquete, sus señales, su
 * explicación y su sugerencia. Con «texto insuficiente» no hay señales, y la
 * lista no se pinta. `direccion` es la de la página (location.href): con ella
 * se escribe absoluto el enlace a la ficha.
 */
export function pintarSenalesDelInforme(contenedor: HTMLElement, resultado: Resultado, texto: string, indice: Indice, base: string, direccion: string): void {
  const entradas = resultado.tramo === 'insuficiente' ? [] : entradasDelInforme(resultado, texto, indice);
  contenedor.replaceChildren();
  contenedor.hidden = entradas.length === 0;
  if (entradas.length === 0) return;
  contenedor.append(el('h3', textos.SENALES_DEL_INFORME));
  for (const e of entradas) {
    const propia = indice.propios.has(e.paquete);
    const titulo = el('h4');
    if (propia) {
      titulo.append(e.nombre);
    } else {
      const enlace = el('a', e.nombre);
      enlace.href = new URL(urlDeRegla(base, e.reglaId), direccion).href;
      titulo.append(enlace);
    }
    titulo.append(` (${e.reglaId})`);
    const entrada = el('article', undefined, 'entrada-informe');
    entrada.append(titulo);
    // La frase en claro, primera línea de la entrada (9.2).
    if (e.regla?.enClaro !== undefined) entrada.append(el('p', e.regla.enClaro, 'en-claro'));
    entrada.append(el('p', `${e.familia} · ${e.paquete}`, 'id-regla'));
    if (e.informativa) entrada.append(el('p', textos.INFORMATIVA));
    if (e.n > 0) entrada.append(el('p', textos.senalesDeLaRegla(e.n, e.fragmentos, e.resto)));
    const genero = generoEnCalle(resultado.genero).conArticulo;
    for (const s of e.delTextoEntero) entrada.append(el('p', textos.senalDelTextoEntero(lineaDelTextoEntero(s, genero, e.informativa, e.regla))));
    if (e.regla !== undefined) entrada.append(campo(textos.EXPLICACION, e.regla.explicacion), campo(textos.SUGERENCIA, e.regla.sugerencia));
    if (propia) entrada.append(el('p', textos.REGLA_PROPIA_SIN_FICHA));
    contenedor.append(entrada);
  }
}

/** Una línea de una lista: texto y nodos (el enlace de la regla). */
type Linea = readonly (string | Node)[];

/** Una lista con un título; nada si no hay elementos. */
function apartado(titulo: string, lineas: readonly Linea[]): HTMLElement[] {
  if (lineas.length === 0) return [];
  const lista = el('ul');
  for (const linea of lineas) {
    const elemento = el('li');
    elemento.append(...linea);
    lista.append(elemento);
  }
  return [el('h4', titulo), lista];
}

export function pintarDesglose(contenedor: HTMLElement, resultado: Resultado, paquetes: readonly Paquete[], indice: Indice, base: string): void {
  /**
   * «Nombre: lo que se dice», con el nombre enlazado a su ficha, y sin el id
   * (9.2: los ids, solo en «¿Por qué lo miramos?» y en el catálogo). La de un
   * paquete propio no tiene ficha en /reglas/: la línea entera es el resumen de
   * un <details> con su ficha completa (firmado en la parada 1 del 8.1).
   */
  const deRegla = (paquete: string, id: string, dice: string | null): Linea => {
    const resto = dice === null || dice === '' ? '' : `: ${dice}`;
    const regla = indice.reglas.get(clave(paquete, id));
    const cabecera = indice.cabeceras.get(paquete);
    if (!indice.propios.has(paquete) || regla === undefined || cabecera === undefined) return [enlaceARegla(indice, base, paquete, id), resto];
    const desplegable = el('details');
    desplegable.append(el('summary', `${nombreDeRegla(id, regla)}${resto}`), ...fichaCompleta(regla, cabecera));
    return [desplegable];
  };
  /** El orden de una regla en el desglose, el del catálogo: el nombre de su familia y el suyo (orden.ts). */
  const nombresDeFamilia = new Map(indice.familias.map((f) => [f.clave, f.nombre]));
  const ordenDeRegla = (paquete: string, id: string): ClaveDeOrden => {
    const regla = indice.reglas.get(clave(paquete, id));
    return [nombresDeFamilia.get(clave(paquete, regla?.familia ?? '')) ?? '', nombreDeRegla(id, regla)];
  };
  const genero = generoEnCalle(resultado.genero).conArticulo;
  const reglaDe = (paquete: string, id: string) => indice.reglas.get(clave(paquete, id));
  contenedor.replaceChildren();
  resultado.paquetes.forEach((r, i) => {
    const cabecera = paquetes[i]!.cabecera;
    const p = r.puntuacion;
    const seccion = el('section', undefined, 'desglose-paquete');
    seccion.append(el('h3', `${r.paquete} ${cabecera.version}`));
    if (r.banda === null) seccion.append(el('p', cabecera.descripcion, 'descripcion'));
    seccion.append(el('p', p.total === null ? (p.motivo ?? '') : textos.totalEnClaro(cifra(p.total))));
    const enOrdenDeRegla = <T>(lista: readonly T[], id: (x: T) => string): T[] => enOrden(lista, (x) => ordenDeRegla(r.paquete, id(x)));
    for (const f of enOrden(p.familias.filter((x) => !x.informativa), (x) => [x.nombre])) {
      // Las reglas informativas de una familia que puntúa (las de contexto de Estadística) van aparte, abajo.
      const conSenal = enOrdenDeRegla(f.reglas.filter((x) => x.n > 0 && !x.informativa), (x) => x.id);
      seccion.append(
        ...apartado(
          `${f.nombre}: ${cifra(f.total)}`,
          conSenal.map((x) => {
            // Las que restan lo dicen: un rasgo humano (9.2: «rasgo humano: resta», no «atenuante»).
            const resta = (reglaDe(r.paquete, x.id)?.peso ?? 0) < 0 ? ` · ${textos.RASGO_HUMANO}` : '';
            return deRegla(r.paquete, x.id, `${textos.vecesYPuntos(x.n, cifra(x.contribucion))}${resta}`);
          }),
        ),
      );
      if (conSenal.length === 0) seccion.append(el('h4', `${f.nombre}: ${cifra(f.total)}`), el('p', textos.NINGUNA_SENAL, 'nada'));
    }
    seccion.append(
      ...apartado(
        textos.LO_QUE_SE_NOTA,
        enOrdenDeRegla(resultado.senalesTexto.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) =>
          deRegla(r.paquete, s.reglaId, lineaDelTextoEntero(s, genero, false, reglaDe(r.paquete, s.reglaId))),
        ),
      ),
    );
    const porRegla = new Map<string, number>();
    const informativas: { id: string; linea: Linea }[] = [];
    for (const s of p.informativas) {
      if ('inicio' in s) porRegla.set(s.reglaId, (porRegla.get(s.reglaId) ?? 0) + 1);
      else informativas.push({ id: s.reglaId, linea: deRegla(r.paquete, s.reglaId, lineaDelTextoEntero(s, genero, true, reglaDe(r.paquete, s.reglaId))) });
    }
    for (const [id, n] of porRegla) informativas.push({ id, linea: deRegla(r.paquete, id, textos.veces(n)) });
    seccion.append(
      ...apartado(textos.INFORMATIVAS_EN_EL_DESGLOSE, enOrdenDeRegla(informativas, (x) => x.id).map((x) => x.linea)),
      ...apartado(
        textos.SIN_TEXTOS_PARA_COMPARAR,
        enOrdenDeRegla(resultado.sinCalibracion.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) => deRegla(r.paquete, s.reglaId, motivoSinComparar(s.motivo))),
      ),
      ...apartado(
        textos.NO_MIRADAS,
        enOrdenDeRegla(resultado.noAplicadas.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) =>
          deRegla(r.paquete, s.reglaId, motivoNoMirada(reglaDe(r.paquete, s.reglaId), s.motivo)),
        ),
      ),
    );
    contenedor.append(seccion);
  });
}
