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
 *    por familia (una capa), anidados; estilos/familias.css da a cada capa la
 *    línea de su familia, más abajo que la anterior, y a la primera el tinte.
 * Desde el 10.4 (Tanda 2; DISEÑO §4 y §6.1), como el modelo: el color, la
 *    línea y la sigla de cada familia van por su id (familias.ts); detrás del
 *    texto, la sigla voladita de sus familias, aria-hidden; y el tramo lleva
 *    de nombre accesible el de sus reglas y su texto («Conector repetido:
 *    “Además”»).
 * [DOC] https://www.w3.org/TR/wai-aria-1.2/#aria-hidden — aria-hidden="true"
 *    saca el elemento del árbol de accesibilidad: la sigla no se lee.
 * [DOC] https://www.w3.org/TR/accname-1.2/ — paso 2C: el nombre de un
 *    elemento con aria-label es su aria-label.
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
 * solo en papel; las siglas de familia van en data-siglas de cada tramo, y la
 * hoja las escribe en papel con ::after (desde el 10.4, Tanda 4 bis, la clave
 * del papel es una lista propia de la leyenda, con la sigla en su texto). En
 * la lista, el nombre de una regla incluida enlaza a su
 * ficha con la dirección absoluta, porque en papel se escribe el href tal cual
 * (attr(href)); en el desglose, no.
 * Desde el 10.4 (Tanda 4; DISEÑO §6.5), el informe va por secciones
 * numeradas: cada parte pinta el título de la suya (los que la pantalla no
 * tiene, solo para el papel) y numerarSecciones les pone el número.
 *
 * El lenguaje de calle (encargo 9.2, b; firmado por Antonio en la parada 1),
 * con las frases de lectura.ts: el medidor da por paquete la etiqueta y la
 * frase (retoque del 9.2), el resumen y, plegadas en «Ver el detalle», las
 * cifras; el panel, el nombre, la frase en claro, qué hacer y, plegado, «¿Por
 * qué lo miramos?» (la explicación, la evidencia, el origen de la lista, el
 * paquete y el enlace a la ficha; la de un paquete propio, entera); el
 * desglose, sin el id de cada regla y con sus etiquetas en claro. Los ids
 * solo quedan dentro de «¿Por qué lo miramos?» y en el catálogo.
 *
 * El resultado como el modelo (encargo 10.4, Tanda 2; DISEÑO §6.1 y §7): el
 * medidor es la pastilla del primer paquete con escala y, si es el de estilo
 * de asistente, «Lo que más pesa» en tarjetas; la leyenda, una tarjeta por
 * familia con su muestra y su recuento; el desglose, plegado en «Ver el
 * detalle» con las cifras delante, y cada otro paquete en su tarjeta. Las
 * palabras son las de la 9.2: solo cambia dónde y cómo se enseñan.
 */
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import type { ProblemaDeCarga } from './cargar.ts';
import { parametrosEnLlano, urlDeLosCreditos, urlDeRegla } from '../catalogo/catalogo.ts';
import { enOrden } from '../orden.ts';
import { nombreDeRegla } from './humanizar.ts';
import { repartirSiglas } from './informe.ts';
import { comparacionDelPaquete, detalleDelPaquete, etiquetaDelPaquete, loQueMasPesa, palabrasDelTexto, resumenDelPaquete, type Voz } from './lectura.ts';
import { cabeceraEnDatos, claveEnDatos, desgloseDelPaquete, senalesEnDatos, type ApartadoDelDesglose, type SenalEnDatos } from './modelo-informe.ts';
import { partirEnTramos } from './tramos.ts';
import { capasVisibles, claseDeFamilia } from './familias.ts';

type Regla = Paquete['reglas'][number];
type ResultadoDePaquete = Resultado['paquetes'][number];
type SenalCalificada = Resultado['senales'][number];

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

const pesoEnCifra = new Intl.NumberFormat('es');

/**
 * Lo que se busca por clave: las reglas y las familias de los paquetes, con su
 * clase de familia. Desde el 8.1 (firmado en la parada 1), de TODOS los
 * paquetes que conoce la página, activos o no: los incluidos y después los
 * propios, en el orden de carga. La clave es paquete + familia: dos familias
 * que se llaman igual en dos paquetes son dos entradas.
 * Desde el 10.4 (Tanda 2), la clase sale del id de la familia y de su paquete
 * (familias.ts: fam-<token> o, en un paquete propio, fam-propia, en gris y
 * discontinuo), no del orden: una familia no cambia de color al marcar o
 * desmarcar una casilla ni al cargar un propio. El paquete se dice siempre en
 * texto: en la leyenda, en la tarjeta y en el desglose.
 */
export interface Indice {
  /** «paquete::reglaId» → la ficha. */
  reglas: Map<string, Regla>;
  familias: { clave: string; paquete: string; nombre: string; informativa: boolean; clase: string }[];
  /** «paquete::familiaId» → su clase de familia (familias.ts). */
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
  const clases = new Map<string, string>();
  const cabeceras = new Map<string, Paquete['cabecera']>();
  paquetes.forEach((paquete, posicion) => {
    const nombre = paquete.cabecera.nombre;
    cabeceras.set(nombre, paquete.cabecera);
    for (const regla of paquete.reglas) reglas.set(clave(nombre, regla.id), regla);
    for (const familia of paquete.cabecera.familias) {
      const clase = claseDeFamilia(nombre, familia.id);
      clases.set(clave(nombre, familia.id), clase);
      familias.push({ posicion, familia: { clave: clave(nombre, familia.id), paquete: nombre, nombre: familia.nombre, informativa: familia.informativa, clase } });
    }
  });
  // La lista, en el orden de presentación (orden.ts).
  const enPresentacion = enOrden(familias, (x) => [x.posicion, x.familia.nombre]).map((x) => x.familia);
  // Las siglas, en el de presentación: el de la leyenda, que en papel es su clave (9.1).
  return { reglas, familias: enPresentacion, claseDeFamilia: clases, propios, cabeceras, siglaDeFamilia: repartirSiglas(enPresentacion) };
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

/** El icono del ojo, del modelo (TarjetaFamilia), con su tachado; el tachado solo se ve con la capa oculta (estilos/resultado.css). */
function iconoDelOjo(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  for (const [nombre, valor] of [['aria-hidden', 'true'], ['viewBox', '0 0 24 24'], ['width', '20'], ['height', '20'], ['fill', 'none'], ['stroke', 'currentColor'], ['stroke-width', '2'], ['stroke-linecap', 'round']]) svg.setAttribute(nombre!, valor!);
  const ojo = document.createElementNS(ns, 'path');
  ojo.setAttribute('d', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z');
  const pupila = document.createElementNS(ns, 'circle');
  for (const [nombre, valor] of [['cx', '12'], ['cy', '12'], ['r', '3']]) pupila.setAttribute(nombre!, valor!);
  const tachado = document.createElementNS(ns, 'path');
  tachado.setAttribute('d', 'M4 4l16 16');
  tachado.setAttribute('class', 'tachado');
  svg.append(ojo, pupila, tachado);
  return svg;
}

/**
 * Las familias (desde el 10.4, Tanda 2; DISEÑO §6.1 y §7, TarjetaFamilia del
 * modelo): una tarjeta por familia de los paquetes activos (desde el 8.1, el
 * índice lleva también las de los que no lo están), con la muestra («Abc» con
 * su tinte y su línea, aria-hidden), su nombre y su recuento; las informativas
 * (Canal), en su propia lista y con «solo avisos»; una familia sin señales,
 * atenuada. [PROPIO] Agrupadas por paquete bajo su nombre: el paquete se dice
 * siempre en texto (8.1), y el modelo, que solo enseña los incluidos, no lo
 * necesitaba. En papel (desde el 10.4, Tanda 4 bis, como el marco «Informe /
 * A4»), las tarjetas no salen: sale la clave, una lista aparte con la muestra
 * de la línea de cada familia, en tinta, y su sigla, su nombre y su paquete.
 *
 * Cada tarjeta lleva su ojo (función nueva del 10.4): un botón conmutador que
 * oculta o enseña la capa de esa familia en la vista (quien llama, con
 * alAlternar); el recuento no cambia. Su nombre no cambia al pulsarlo: lo
 * dice aria-pressed.
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/button/ — toggle button:
 *    «A two-state button that can be either off (not pressed) or on
 *    (pressed)», con aria-pressed; «it is critical the label on a toggle does
 *    not change when its state changes»; Espacio y Enter lo activan (los de
 *    un <button>).
 */
export function pintarLeyenda(
  contenedor: HTMLElement,
  indice: Indice,
  activos: ReadonlySet<string>,
  recuento: ReadonlyMap<string, number>,
  alAlternar: (familia: string, oculta: boolean) => void,
): void {
  const titulo = el('h2', textos.FAMILIAS);
  titulo.id = 't-familias';
  contenedor.setAttribute('aria-labelledby', titulo.id);
  // En papel (10.4, Tanda 4 bis; el marco «Informe / A4»), la sección 3 lleva su título, la línea de las siglas y su
  // clave: cada familia con la muestra de su línea, en tinta, y «[sigla] familia (paquete)», en el orden de la leyenda.
  // Desde el 9.3, la clave sale de modelo-informe.ts, como la del PDF.
  const clave = el('ul', undefined, 'clave-papel solo-impresion');
  contenedor.replaceChildren(el('h2', textos.CLAVE_DE_FAMILIAS, 'titulo-seccion solo-impresion'), titulo, el('p', textos.CLAVE_DE_SIGLAS, 'solo-impresion siglas-papel'), clave);
  for (const f of claveEnDatos(indice, activos)) {
    const linea = el('li');
    const muestra = el('span', undefined, `muestra-papel ${f.clase}`);
    muestra.setAttribute('aria-hidden', 'true');
    linea.append(muestra, el('span', f.texto));
    clave.append(linea);
  }
  for (const paquete of [...new Set(indice.familias.map((f) => f.paquete))].filter((p) => activos.has(p))) {
    const grupo = el('div', undefined, 'grupo-familias');
    const puntuan = el('ul', undefined, 'leyenda');
    const informativas = el('ul', undefined, 'leyenda');
    for (const f of indice.familias.filter((x) => x.paquete === paquete)) {
      const n = recuento.get(f.clave) ?? 0;
      const tarjeta = el('li', undefined, `tarjeta-familia ${f.clase}${n === 0 ? ' atenuada' : ''}`);
      tarjeta.dataset['familia'] = f.clave;
      const muestra = el('span', textos.MUESTRA_DE_SUBRAYADO, `muestra capa ${f.clase}`);
      muestra.setAttribute('aria-hidden', 'true');
      const ojo = el('button', undefined, 'ojo');
      ojo.type = 'button';
      ojo.title = textos.OCULTAR_ESTA_CAPA;
      ojo.setAttribute('aria-label', textos.ocultarCapa(f.nombre, f.paquete));
      ojo.setAttribute('aria-pressed', 'false');
      ojo.append(iconoDelOjo());
      ojo.addEventListener('click', () => {
        const oculta = ojo.getAttribute('aria-pressed') !== 'true';
        ojo.setAttribute('aria-pressed', String(oculta));
        tarjeta.classList.toggle('oculta', oculta);
        alAlternar(f.clave, oculta);
      });
      const etiqueta = el('span', f.informativa ? textos.familiaInformativa(f.nombre, n) : textos.familiaConRecuento(f.nombre, n), 'etiqueta-familia');
      tarjeta.append(muestra, etiqueta, ojo);
      (f.informativa ? informativas : puntuan).append(tarjeta);
    }
    grupo.append(el('h3', paquete), puntuan);
    if (informativas.childElementCount > 0) grupo.append(informativas);
    contenedor.append(grupo);
  }
}

function familiaDe(senal: SenalCalificada, indice: Indice): string {
  return clave(senal.paquete, indice.reglas.get(clave(senal.paquete, senal.reglaId))?.familia ?? '');
}

/** El texto de cada tramo, para volver a vestirlo cuando cambian las capas que se ven (el ojo de las familias). */
const textoDeTramo = new WeakMap<HTMLElement, string>();

/**
 * Las capas de un tramo, una por familia que se ve (la primera, con el tinte),
 * y detrás su sigla voladita. Sin ninguna familia a la vista (las ha ocultado
 * el ojo), el tramo es texto sin más: ni botón ni foco ni nombre, porque no
 * hay nada que tocar.
 */
function vestirTramo(boton: HTMLElement, familias: readonly string[], indice: Indice): void {
  boton.replaceChildren();
  let dentro: HTMLElement = boton;
  for (const familia of familias) {
    const capa = el('span', undefined, `capa ${indice.claseDeFamilia.get(familia) ?? 'fam-propia'}`);
    dentro.append(capa);
    dentro = capa;
  }
  dentro.append(textoDeTramo.get(boton) ?? '');
  if (familias.length === 0) {
    for (const atributo of ['role', 'tabindex', 'aria-label', 'aria-haspopup', 'aria-expanded']) boton.removeAttribute(atributo);
    return;
  }
  const sigla = el('span', familias.map((familia) => indice.siglaDeFamilia.get(familia) ?? '').join('·'), 'sigla-tramo');
  sigla.setAttribute('aria-hidden', 'true');
  boton.append(sigla);
  boton.setAttribute('role', 'button');
  boton.tabIndex = 0;
  boton.setAttribute('aria-label', boton.dataset['nombre'] ?? '');
  boton.setAttribute('aria-haspopup', 'dialog');
  boton.setAttribute('aria-expanded', String(boton.classList.contains('activo')));
}

export function pintarVista(
  contenedor: HTMLElement,
  texto: string,
  senales: readonly SenalCalificada[],
  indice: Indice,
  alActivar: (indices: readonly number[]) => void,
): void {
  // El título de la sección 4 del informe, solo en papel (10.4, Tanda 4; desde la 4 bis, el del marco «Informe / A4»).
  contenedor.replaceChildren(el('h2', textos.TEXTO_DEL_INFORME, 'titulo-seccion solo-impresion'));
  for (const tramo of partirEnTramos(texto.length, senales)) {
    const trozo = texto.slice(tramo.inicio, tramo.fin);
    if (tramo.senales.length === 0) {
      // Los saltos de línea, cada tanda en su <span class="salto">: en pantalla son el mismo texto (pre-wrap), y en papel
      // separan los párrafos con el aire del modelo (10.4, Tanda 4 bis; estilos/informe.css).
      for (const parte of trozo.split(/(\n+)/)) {
        if (parte.startsWith('\n')) contenedor.append(el('span', parte, 'salto'));
        else if (parte !== '') contenedor.append(parte);
      }
      continue;
    }
    const familias = [...new Set(tramo.senales.map((i) => familiaDe(senales[i]!, indice)))];
    const reglas = [...new Set(tramo.senales.map((i) => clave(senales[i]!.paquete, senales[i]!.reglaId)))].map((k) => {
      const [paquete, id] = k.split('::') as [string, string];
      return nombreDeRegla(id, indice.reglas.get(clave(paquete, id)));
    });
    const boton = el('span', undefined, 'tramo');
    boton.dataset['nombre'] = textos.nombreDelTramo(reglas, trozo.replace(/\s+/g, ' ').trim());
    boton.dataset['familias'] = familias.join('|');
    boton.dataset['siglas'] = familias.map((familia) => indice.siglaDeFamilia.get(familia) ?? '').join('·');
    boton.dataset['senales'] = tramo.senales.join(' ');
    textoDeTramo.set(boton, trozo);
    vestirTramo(boton, familias, indice);
    // Un tramo cuyas familias están todas ocultas no es un botón: no se activa.
    const activar = (): void => {
      if (boton.getAttribute('role') === 'button') alActivar(tramo.senales);
    };
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

/** El ojo de las familias (10.4, Tanda 2): viste de nuevo cada tramo con las capas de sus familias que no están ocultas. */
export function ocultarCapas(vista: HTMLElement, ocultas: ReadonlySet<string>, indice: Indice): void {
  for (const boton of vista.querySelectorAll<HTMLElement>('.tramo')) vestirTramo(boton, capasVisibles((boton.dataset['familias'] ?? '').split('|'), ocultas), indice);
}

/** La clave «paquete::familia» de la familia de una señal. */
export function familiaDeLaSenal(senal: SenalCalificada, indice: Indice): string {
  return familiaDe(senal, indice);
}

/** La X de cerrar, del modelo (TarjetaRegla). */
function iconoDeCerrar(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  for (const [nombre, valor] of [['aria-hidden', 'true'], ['viewBox', '0 0 20 20'], ['width', '20'], ['height', '20'], ['fill', 'none'], ['stroke', 'currentColor'], ['stroke-width', '2'], ['stroke-linecap', 'round']]) svg.setAttribute(nombre!, valor!);
  const aspa = document.createElementNS(ns, 'path');
  aspa.setAttribute('d', 'M5 5l10 10M15 5L5 15');
  svg.append(aspa);
  return svg;
}

/**
 * La tarjeta de una señal (desde el 10.4, Tanda 2; DISEÑO §6.1 y §7,
 * TarjetaRegla del modelo; antes, el panel firmado en la parada 1 del 9.2):
 * el pico y la barra del color de su familia; la sigla, el nombre de la regla
 * (el título, que recibe el foco), la línea «familia · paquete» y la X de
 * cerrar; la frase en claro; «Qué hacer»; «¿Por qué lo miramos?», plegado,
 * con el id y su paquete, la explicación, el nivel de evidencia, el origen de
 * la lista, el paquete con su versión y el enlace a la ficha; la de un paquete
 * propio no tiene ficha en /reglas/: lleva su ficha completa (8.1) y la nota
 * de que no tiene página, sin enlace. Debajo, «Anterior» y «Siguiente»
 * (tarjeta.ts los activa o los desactiva). Devuelve la clase de su familia,
 * para el color de la barra y del pico.
 */
export function pintarTarjeta(contenedor: HTMLElement, senal: SenalCalificada, indice: Indice, base: string): string {
  const regla = indice.reglas.get(clave(senal.paquete, senal.reglaId));
  const cabecera = indice.cabeceras.get(senal.paquete);
  const familia = familiaDe(senal, indice);
  const clase = indice.claseDeFamilia.get(familia) ?? 'fam-propia';
  const nombreDeFamilia = indice.familias.find((f) => f.clave === familia)?.nombre ?? regla?.familia ?? '';
  const pico = el('span', undefined, 'pico');
  pico.setAttribute('aria-hidden', 'true');
  const titulo = el('h2', nombreDeRegla(senal.reglaId, regla));
  titulo.id = 'titulo-tarjeta';
  titulo.tabIndex = -1;
  const nombres = el('div', undefined, 'nombre-tarjeta');
  nombres.append(titulo, el('p', textos.lineaDeLaTarjeta(nombreDeFamilia, senal.paquete), 'linea-tarjeta'));
  const cerrar = el('button', undefined, 'cerrar');
  cerrar.type = 'button';
  cerrar.setAttribute('aria-label', textos.CERRAR);
  cerrar.append(iconoDeCerrar());
  const cabeza = el('div', undefined, 'cabecera-tarjeta');
  cabeza.append(sigla(indice.siglaDeFamilia.get(familia) ?? ''), nombres, cerrar);
  const cuerpo = el('div', undefined, 'cuerpo-tarjeta');
  cuerpo.append(cabeza);
  if (regla?.enClaro !== undefined) cuerpo.append(el('p', regla.enClaro, 'en-claro'));
  if (regla !== undefined) {
    const queHacer = campo(textos.QUE_HACER, regla.sugerencia);
    queHacer.className = 'que-hacer';
    cuerpo.append(queHacer);
  }
  const porQue = el('details', undefined, 'por-que');
  const dentro = el('div', undefined, 'por-que-dentro');
  if (indice.propios.has(senal.paquete) && regla !== undefined && cabecera !== undefined) {
    dentro.append(...fichaCompleta(regla, cabecera), el('p', textos.REGLA_PROPIA_SIN_FICHA, 'nota-propia'));
  } else {
    dentro.append(el('p', `${senal.reglaId} · ${senal.paquete}`, 'id-regla'));
    if (regla !== undefined) {
      dentro.append(
        campo(textos.EXPLICACION, regla.explicacion),
        campo(textos.NIVEL_DE_EVIDENCIA, regla.nivelEvidencia),
        campo(textos.ORIGEN_DE_LA_LISTA, regla.origenLista ?? textos.SIN_DATO),
      );
    }
    if (cabecera !== undefined) dentro.append(campo(textos.PAQUETE, `${cabecera.nombre} ${cabecera.version}`));
    const enlace = el('a', textos.VER_SU_FICHA);
    enlace.href = urlDeRegla(base, senal.reglaId);
    const parrafo = el('p');
    parrafo.append(enlace);
    dentro.append(parrafo);
  }
  porQue.append(el('summary', textos.POR_QUE_LO_MIRAMOS), dentro);
  const navegacion = el('div', undefined, 'navegacion-reglas');
  for (const texto of [textos.ANTERIOR, textos.SIGUIENTE]) {
    const boton = el('button', texto);
    boton.type = 'button';
    navegacion.append(boton);
  }
  cuerpo.append(porQue, navegacion);
  contenedor.replaceChildren(pico, el('div', undefined, 'barra-familia'), cuerpo);
  return clase;
}

/** La sigla de una familia en su círculo, con el color de la clase de familia de quien la contiene (aria-hidden: el nombre ya es texto). */
function sigla(letras: string): HTMLSpanElement {
  const s = el('span', letras, 'sigla');
  s.setAttribute('aria-hidden', 'true');
  return s;
}

/**
 * La lectura de un paquete con escala: la etiqueta (título, en el nivel que se
 * pide), la frase y, con texto corto, el aviso (retoque del 9.2).
 */
function lecturaDe(resultado: Resultado, r: ResultadoDePaquete, voz: Voz, nivel: 'h2' | 'h3', clase: string): HTMLElement {
  const cabeza = etiquetaDelPaquete(resultado, r, voz);
  const bloque = el('div', undefined, clase);
  if (cabeza === null) return bloque;
  bloque.append(el(nivel, cabeza.etiqueta, 'etiqueta'), el('p', cabeza.frase, 'frase'));
  if (cabeza.aviso !== null) bloque.append(el('p', cabeza.aviso, 'aviso-corto'));
  return bloque;
}

/**
 * «Lo que más pesa» (10.4, Tanda 2; DISEÑO §6.1 y §7): una tarjeta por regla,
 * con la barra y la sigla de su familia, su nombre y su cola; «Empieza por:»
 * debajo de la primera. Sin ninguna que sume, «bien».
 */
function tarjetasQueMasPesan(resultado: Resultado, r: ResultadoDePaquete, indice: Indice): HTMLElement {
  const seccion = el('section', undefined, 'lo-que-mas-pesa');
  const titulo = el('h2', textos.LO_QUE_MAS_PESA);
  titulo.id = 't-pesa';
  seccion.setAttribute('aria-labelledby', titulo.id);
  seccion.append(titulo);
  const pesa = loQueMasPesa(resultado, r, indice);
  if (pesa.reglas.length === 0) {
    seccion.append(el('p', textos.NINGUNA_PUNTUABLE, 'resumen'));
    return seccion;
  }
  const lista = el('ol');
  pesa.reglas.forEach((x, i) => {
    const motivo = el('li', undefined, 'motivo');
    const tarjeta = el('div', undefined, `tarjeta-motivo ${indice.claseDeFamilia.get(x.familia) ?? 'fam-propia'}`);
    tarjeta.append(sigla(indice.siglaDeFamilia.get(x.familia) ?? ''), el('span', x.nombre, 'nombre-motivo'), el('span', x.cola, 'cola'));
    motivo.append(tarjeta);
    if (i === 0 && pesa.empiezaPor !== null) motivo.append(el('p', textos.empiezaPor(pesa.empiezaPor), 'empieza-por'));
    lista.append(motivo);
  });
  seccion.append(lista);
  // En papel (10.4, Tanda 4; DISEÑO §6.5 y el modelo), en dos líneas: las tarjetas no salen.
  seccion.append(
    el('p', textos.loQueMasPesa(pesa.reglas.map((x) => textos.parteDelResumen(x.nombre, x.cola))), 'solo-impresion'),
    ...(pesa.empiezaPor === null ? [] : [el('p', textos.empiezaPor(pesa.empiezaPor), 'solo-impresion')]),
  );
  return seccion;
}

/**
 * La cabeza del resultado (desde el 10.4, Tanda 2; DISEÑO §6.1, pastilla y
 * «Lo que más pesa» del modelo): la pastilla del primer paquete con escala (en
 * tinta sobre card; su etiqueta, la de la 9.2, es el título del resultado y
 * recibe el foco al analizar) y, si es el de estilo de asistente, las tarjetas
 * de lo que más pesa; si es un propio, su línea. Los demás paquetes van en
 * su tarjeta del desglose (pintarDesglose). Sin ningún paquete con escala, la
 * pastilla lo dice (firmado en la parada 1 del 8.1). Con texto insuficiente,
 * como antes, el aviso y el motivo: en pantalla lo dice el cuadro (pantalla.ts)
 * y este bloque es para el papel. En papel (desde la Tanda 4 bis, como el marco
 * «Informe / A4»), cierra el resultado la línea de resumen de cada uno de los
 * otros paquetes, con su nombre delante («Español correcto: 9 avisos…»).
 */
export function pintarMedidor(contenedor: HTMLElement, resultado: Resultado, vozDe: (paquete: string) => Voz, indice: Indice, nombreDelGenero: string): void {
  // El título de la sección 2 del informe, solo en papel (10.4, Tanda 4).
  contenedor.replaceChildren(el('h2', textos.RESULTADO, 'titulo-seccion solo-impresion'));
  if (resultado.tramo === 'insuficiente') {
    const primero = resultado.paquetes[0]?.puntuacion;
    contenedor.append(el('p', textos.TEXTO_INSUFICIENTE, 'estado-tramo'), el('p', primero?.motivo ?? ''), el('p', palabrasDelTexto(resultado, nombreDelGenero), 'datos'));
    return;
  }
  const principal = resultado.paquetes.find((x) => x.banda !== null);
  // En papel (10.4, Tanda 4 bis; el marco «Informe / A4»), los otros paquetes, una línea cada uno con su resumen, al final
  // del resultado; en pantalla van en su tarjeta del desglose (pintarDesglose).
  const otros = resultado.paquetes
    .filter((r) => r !== principal)
    .flatMap((r) => resumenDelPaquete(resultado, r, vozDe(r.paquete), indice).map((linea) => el('p', textos.resumenDeOtroPaquete(r.paquete, linea), 'solo-impresion otro-en-papel')));
  if (principal === undefined) {
    const pastilla = el('div', undefined, 'pastilla');
    pastilla.append(el('p', textos.SIN_ESCALA, 'frase banda'));
    pastilla.firstElementChild!.setAttribute('tabindex', '-1');
    contenedor.append(pastilla, ...otros);
    return;
  }
  const voz = vozDe(principal.paquete);
  const pastilla = lecturaDe(resultado, principal, voz, 'h2', 'pastilla');
  pastilla.firstElementChild?.setAttribute('tabindex', '-1');
  contenedor.append(pastilla);
  if (voz === 'asistente') contenedor.append(tarjetasQueMasPesan(resultado, principal, indice));
  else for (const linea of resumenDelPaquete(resultado, principal, voz, indice)) contenedor.append(el('p', linea, 'resumen'));
  contenedor.append(...otros);
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
  // Desde el 9.3, sus líneas salen de modelo-informe.ts, como las del PDF.
  contenedor.replaceChildren(el('h2', textos.INFORME_DE_RADIOGRAFIA, 'titulo-seccion'), ...cabeceraEnDatos(resultado, paquetes, indice, fecha, nombreDelGenero).map((linea) => el('p', linea)));
}

/**
 * La lista de señales del informe, solo para el papel (9.1): una entrada por
 * regla (informe.ts). Con «texto insuficiente» no hay señales, y la lista no se
 * pinta. `direccion` es la de la página (location.href): con ella se escribe
 * absoluto el enlace a la ficha.
 * Desde el 10.4 (Tanda 4; DISEÑO §6.5, el modelo y la decisión de Antonio en la
 * parada 3), la sección 6 del informe: su título; cada entrada, con su nombre
 * (enlazado a su ficha, cuya dirección escribe el papel detrás; la de un
 * paquete propio, sin ficha, con su id), su frase en claro, si solo avisa,
 * sus fragmentos y «Qué hacer» (desde la Tanda 4 bis, como el marco «Informe /
 * A4»: sin la línea de la familia y el paquete, que dicen la clave y el
 * desglose, y «Fragmentos:» en vez del recuento de señales); y al final, en cuerpo
 * menor, «¿Por qué lo miramos?» con la explicación de cada una y las reglas de
 * contexto (las estadísticas informativas), enteras, con la suya. El informe no
 * pierde nada de lo de antes: cambia el sitio de las explicaciones, y
 * «Sugerencia» pasa a «Qué hacer», como en la tarjeta y en la ficha.
 */
export function pintarSenalesDelInforme(contenedor: HTMLElement, resultado: Resultado, texto: string, indice: Indice, base: string, direccion: string): void {
  // Desde el 9.3, lo que dice cada entrada sale de modelo-informe.ts, como el PDF.
  const senales = senalesEnDatos(resultado, texto, indice, base, direccion);
  contenedor.replaceChildren();
  contenedor.hidden = senales === null;
  if (senales === null) return;
  const entradaDe = (e: SenalEnDatos): HTMLElement => {
    const titulo = el('h3');
    if (e.ficha === null) {
      titulo.append(e.nombre, ` (${e.reglaId})`);
    } else {
      const enlace = el('a', e.nombre);
      enlace.href = e.ficha;
      titulo.append(enlace);
    }
    const entrada = el('article', undefined, 'entrada-informe');
    entrada.dataset['regla'] = e.reglaId;
    entrada.append(titulo);
    // La frase en claro, primera línea de la entrada (9.2); desde la Tanda 4 bis, como el marco del modelo: sin la línea de
    // la familia y el paquete (los dicen la clave y el desglose), y los fragmentos en vez del recuento de señales.
    for (const linea of e.lineas) entrada.append('etiqueta' in linea ? campo(linea.etiqueta, linea.texto) : el('p', linea.texto, linea.enClaro === true ? 'en-claro' : undefined));
    return entrada;
  };
  contenedor.append(el('h2', textos.SENALES_DEL_INFORME, 'titulo-seccion'), ...senales.principales.map(entradaDe));
  const anexo = el('div', undefined, 'anexo-informe');
  if (senales.porQue.length > 0) anexo.append(el('h3', textos.POR_QUE_LO_MIRAMOS));
  for (const e of senales.porQue) {
    const explicacion = el('p', undefined, 'explicacion-informe');
    explicacion.dataset['regla'] = e.reglaId;
    explicacion.append(el('strong', `${e.nombre}: `), e.texto);
    anexo.append(explicacion);
  }
  if (senales.deContexto.length > 0) anexo.append(el('h3', textos.LO_QUE_SE_NOTA), ...senales.deContexto.map(entradaDe));
  if (anexo.childElementCount > 0) contenedor.append(anexo);
}

/**
 * Los números de las secciones del informe (10.4, Tanda 4; DISEÑO §6.5): los
 * títulos que salen en papel, en el orden del papel (null, los que no salen),
 * numerados de 1 en adelante en data-numero, que la hoja de impresión escribe
 * delante de cada uno (estilos/informe.css: no con contadores de CSS, que
 * siguen el orden del documento).
 */
export function numerarSecciones(titulos: readonly (HTMLElement | null)[]): void {
  let n = 0;
  for (const titulo of titulos) if (titulo !== null) titulo.dataset['numero'] = String(++n);
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

/**
 * El desglose (desde el 10.4, Tanda 2; DISEÑO §6.1, puntos 4 y 5, y el
 * modelo): el del paquete de la pastilla va plegado en «Ver el detalle», con
 * sus cifras delante; cada uno de los demás (Español correcto, los propios),
 * en su tarjeta, con su nombre, su línea de resumen (y su etiqueta y su frase
 * si tiene escala) y su desglose plegado, también en «Ver el detalle». Sin
 * ningún paquete con escala, todos en tarjeta. En el orden de los paquetes,
 * el de la pastilla primero.
 * Cada desglose, como desde el 9.2: el paquete con su versión, el total y las
 * familias con sus reglas, lo que se nota en el conjunto, solo avisos, sin
 * textos con los que comparar y no miradas.
 */
export function pintarDesglose(
  contenedor: HTMLElement,
  resultado: Resultado,
  paquetes: readonly Paquete[],
  indice: Indice,
  base: string,
  vozDe: (paquete: string) => Voz,
  nombreDelGenero: string,
): void {
  /**
   * «Nombre: lo que se dice», con el nombre enlazado a su ficha, y sin el id
   * (9.2: los ids, solo en «¿Por qué lo miramos?» y en el catálogo). La de un
   * paquete propio no tiene ficha en /reglas/: la línea entera es el resumen de
   * un <details> con su ficha completa (firmado en la parada 1 del 8.1).
   */
  const deRegla = (paquete: string, id: string, resto: string): Linea => {
    const regla = indice.reglas.get(clave(paquete, id));
    const cabecera = indice.cabeceras.get(paquete);
    if (!indice.propios.has(paquete) || regla === undefined || cabecera === undefined) return [enlaceARegla(indice, base, paquete, id), resto];
    const desplegable = el('details');
    desplegable.append(el('summary', `${nombreDeRegla(id, regla)}${resto}`), ...fichaCompleta(regla, cabecera));
    return [desplegable];
  };
  /**
   * El desglose de un paquete en dos partes (desde el 10.4: en el móvil van a dos pestañas, Reglas y Datos): sus
   * familias y sus reglas con lo que se nota en el conjunto; y solo avisos, sin textos con los que comparar y no
   * miradas (null si no hay nada de eso). Desde el 9.3, lo que dice sale de modelo-informe.ts, como el PDF.
   */
  const desgloseDe = (r: ResultadoDePaquete, cabecera: Paquete['cabecera']): [HTMLElement, HTMLElement | null] => {
    const d = desgloseDelPaquete(resultado, r, cabecera, indice);
    const lineas = (a: ApartadoDelDesglose): HTMLElement[] =>
      a.nada !== null ? [el('h4', a.titulo), el('p', a.nada, 'nada')] : apartado(a.titulo, a.lineas.map((x) => deRegla(x.paquete, x.id, x.resto)));
    const seccion = el('section', undefined, 'desglose-paquete');
    seccion.append(el('h3', d.titulo));
    if (d.descripcion !== null) seccion.append(el('p', d.descripcion, 'descripcion'));
    seccion.append(el('p', d.total), ...d.apartados.flatMap(lineas));
    const avisos = el('section', undefined, 'desglose-avisos');
    avisos.append(...d.avisos.flatMap(lineas));
    return [seccion, avisos.childElementCount > 0 ? avisos : null];
  };
  /**
   * «Ver el detalle», plegado: las cifras (si hay escala) y el desglose. Las dos partes del desglose del paquete de la
   * pastilla llevan id, para las pestañas del móvil (pestanas.ts); la primera, con el título «Desglose», que solo se
   * ve allí.
   */
  const detalleDe = (r: ResultadoDePaquete, cabecera: Paquete['cabecera'], delaPastilla: boolean): HTMLDetailsElement => {
    const detalle = el('details', undefined, 'detalle');
    detalle.append(el('summary', textos.VER_EL_DETALLE));
    if (r.banda !== null) {
      const cifras = el('div', undefined, 'cifras');
      // Desde el 11.1 (hallazgo 2 del censo pre-despliegue, firmado por Antonio), debajo de la comparación con los textos
      // de personas, de dónde salen: la página de créditos. Solo en un paquete incluido: los de uno propio son suyos.
      const comparacion = indice.propios.has(r.paquete) ? null : comparacionDelPaquete(resultado, r);
      for (const linea of detalleDelPaquete(resultado, r, nombreDelGenero)) {
        cifras.append(el('p', linea));
        if (linea !== comparacion) continue;
        const enlace = el('a', textos.CREDITOS_Y_LICENCIAS);
        enlace.href = urlDeLosCreditos(base);
        const corpus = el('p', undefined, 'corpus');
        corpus.append(`${textos.CORPUS_EN} `, enlace);
        cifras.append(corpus);
      }
      detalle.append(cifras);
    }
    const [reglas, avisos] = desgloseDe(r, cabecera);
    if (delaPastilla) {
      const envoltorio = el('section');
      envoltorio.id = 'desglose-reglas';
      envoltorio.append(el('h2', textos.DESGLOSE, 'titulo-desglose'), reglas);
      detalle.append(envoltorio);
      if (avisos !== null) avisos.id = 'desglose-avisos';
    } else detalle.append(reglas);
    if (avisos !== null) detalle.append(avisos);
    return detalle;
  };
  // El título de la sección 5 del informe, solo en papel (10.4, Tanda 4).
  contenedor.replaceChildren(el('h2', textos.DESGLOSE, 'titulo-seccion solo-impresion'));
  const principal = resultado.paquetes.find((x) => x.banda !== null);
  for (const r of principal === undefined ? resultado.paquetes : [principal, ...resultado.paquetes.filter((x) => x !== principal)]) {
    const cabecera = paquetes[resultado.paquetes.indexOf(r)]!.cabecera;
    if (r === principal) {
      contenedor.append(detalleDe(r, cabecera, true));
      continue;
    }
    const voz = vozDe(r.paquete);
    const tarjeta = el('section', undefined, 'otro-paquete');
    const titulo = el('h2', r.paquete);
    tarjeta.append(titulo);
    if (r.banda !== null) tarjeta.append(lecturaDe(resultado, r, voz, 'h3', 'lectura'));
    for (const linea of resumenDelPaquete(resultado, r, voz, indice)) tarjeta.append(el('p', linea, 'resumen'));
    tarjeta.append(detalleDe(r, cabecera, false));
    contenedor.append(tarjeta);
  }
}
