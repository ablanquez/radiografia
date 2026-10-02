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
 */
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import type { ProblemaDeCarga } from './cargar.ts';
import { urlDeRegla } from '../catalogo/catalogo.ts';
import { enOrden, type ClaveDeOrden } from '../orden.ts';
import { nombreDeRegla } from './humanizar.ts';
import { partirEnTramos } from './tramos.ts';

type Regla = Paquete['reglas'][number];
type ResultadoDePaquete = Resultado['paquetes'][number];
type SenalCalificada = Resultado['senales'][number];
type SenalDeTexto = Resultado['senalesTexto'][number] | ResultadoDePaquete['puntuacion']['informativas'][number];

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

/** Lo que se busca por clave: las reglas y las familias de los paquetes, con su clase de color. */
export interface Indice {
  /** «paquete::reglaId» → la ficha. */
  reglas: Map<string, Regla>;
  familias: { clave: string; paquete: string; nombre: string; informativa: boolean; clase: string }[];
  /** «paquete::familiaId» → su clase de color. */
  claseDeFamilia: Map<string, string>;
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

export function indexar(paquetes: readonly Paquete[]): Indice {
  const reglas = new Map<string, Regla>();
  const familias: { posicion: number; familia: Indice['familias'][number] }[] = [];
  const claseDeFamilia = new Map<string, string>();
  let color = 0;
  paquetes.forEach((paquete, posicion) => {
    const nombre = paquete.cabecera.nombre;
    for (const regla of paquete.reglas) reglas.set(clave(nombre, regla.id), regla);
    for (const familia of paquete.cabecera.familias) {
      const clase = familia.informativa ? 'familia-informativa' : `familia-color-${color++ % COLORES}`;
      claseDeFamilia.set(clave(nombre, familia.id), clase);
      familias.push({ posicion, familia: { clave: clave(nombre, familia.id), paquete: nombre, nombre: familia.nombre, informativa: familia.informativa, clase } });
    }
  });
  // Los colores se reparten en el orden de declaración, como desde el 6.2; la lista va en el de presentación (orden.ts).
  return { reglas, familias: enOrden(familias, (x) => [x.posicion, x.familia.nombre]).map((x) => x.familia), claseDeFamilia };
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

export function pintarLeyenda(contenedor: HTMLElement, indice: Indice): void {
  const puntuan = el('ul', undefined, 'leyenda');
  const informativas = el('ul', undefined, 'leyenda');
  for (const f of indice.familias) {
    const elemento = el('li');
    elemento.append(el('span', textos.MUESTRA_DE_SUBRAYADO, `muestra ${f.clase}`), ` ${f.nombre} (${f.paquete})`);
    (f.informativa ? informativas : puntuan).append(elemento);
  }
  contenedor.replaceChildren(el('h3', textos.FAMILIAS), puntuan);
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

export function pintarPanel(contenedor: HTMLElement, senales: readonly SenalCalificada[], indice: Indice, base: string): void {
  contenedor.replaceChildren(el('h3', textos.TITULO_DEL_PANEL));
  const vistas = new Set<string>();
  for (const senal of senales) {
    const k = clave(senal.paquete, senal.reglaId);
    if (vistas.has(k)) continue;
    vistas.add(k);
    const ficha = el('article', undefined, 'ficha');
    const regla = indice.reglas.get(k);
    const titulo = el('h4');
    titulo.append(enlaceARegla(indice, base, senal.paquete, senal.reglaId));
    ficha.append(titulo, el('p', `${senal.reglaId} · ${senal.paquete}`, 'id-regla'));
    if (regla !== undefined) {
      ficha.append(
        campo(textos.EXPLICACION, regla.explicacion),
        campo(textos.SUGERENCIA, regla.sugerencia),
        campo(textos.NIVEL_DE_EVIDENCIA, regla.nivelEvidencia),
        campo(textos.ORIGEN_DE_LA_LISTA, regla.origenLista ?? textos.SIN_DATO),
      );
    }
    contenedor.append(ficha);
  }
  contenedor.hidden = false;
}

/** La banda de un paquete con escala, en texto claro (decisión del 01/10: sin tope, sin veredicto, sin porcentaje). */
function lineasDeBanda(r: ResultadoDePaquete, nombreDelGenero: string, tramo: string | null): HTMLElement[] {
  const lineas: HTMLElement[] = [];
  const total = r.puntuacion.total;
  if (total === 0) lineas.push(el('p', textos.sinSenales(r.paquete), 'banda'));
  if (r.banda === null) return lineas;
  if (r.banda.banda === 'sin calibración') {
    lineas.push(el('p', textos.sinCalibracion(r.banda.motivo), 'banda'));
  } else if (total !== null && total !== 0) {
    const b = r.banda;
    lineas.push(
      el('p', textos.tuBanda(b.banda, nombreDelGenero, textos.TRAMOS_EN_PALABRAS[tramo ?? ''] ?? `${tramo}`), 'banda'),
      el('p', textos.tusPercentiles(cifra(total), b.n, cifra(b.p50), cifra(b.p95), cifra(b.p99)), 'percentiles'),
    );
  }
  return lineas;
}

export function pintarMedidor(contenedor: HTMLElement, resultado: Resultado, nombreDelGenero: string): void {
  const datos = el('p', textos.datosDelTexto(resultado.palabrasProsa, resultado.tramoDeCalibracion ?? textos.MENOS_DE_100, nombreDelGenero), 'datos');
  const primero = resultado.paquetes[0]?.puntuacion;
  contenedor.replaceChildren();
  if (resultado.tramo === 'insuficiente') {
    contenedor.append(el('p', textos.TEXTO_INSUFICIENTE, 'estado-tramo'), el('p', primero?.motivo ?? ''), datos);
    return;
  }
  if (resultado.tramo === 'poco-fiable') contenedor.append(el('p', textos.POCO_FIABLE, 'estado-tramo'), el('p', primero?.aviso ?? ''));
  // Solo los paquetes con escala (clave `_total-*`); Español correcto no la tiene y va aparte, en su desglose.
  for (const r of resultado.paquetes.filter((x) => x.banda !== null)) {
    contenedor.append(el('h3', r.paquete), ...lineasDeBanda(r, nombreDelGenero, resultado.tramoDeCalibracion));
  }
  contenedor.append(datos);
}

/** Lo que se dice de una señal del texto entero, detrás de su regla: la estadística con su valor y su banda; la ausencia con sus cuentas. */
function deLaSenalDeTexto(s: SenalDeTexto): string | null {
  if ('coincidencias' in s) return textos.ausencia(s.coincidencias, s.minimo);
  if ('valor' in s) {
    const c = s.referencia;
    const lado = s.lado === null ? textos.DENTRO_DE_LA_BANDA : (textos.LADOS[s.lado] ?? s.lado);
    return textos.estadistica(s.metrica, cifra(s.valor), lado, cifra(c.p1), cifra(c.p5), cifra(c.p50), cifra(c.p95), cifra(c.p99));
  }
  return null;
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
  /** «Nombre (id): lo que se dice», con el nombre enlazado a su ficha. */
  const deRegla = (paquete: string, id: string, dice: string | null): Linea => [enlaceARegla(indice, base, paquete, id), dice === null ? ` (${id})` : ` (${id}): ${dice}`];
  /** El orden de una regla en el desglose, el del catálogo: el nombre de su familia y el suyo (orden.ts). */
  const nombresDeFamilia = new Map(indice.familias.map((f) => [f.clave, f.nombre]));
  const ordenDeRegla = (paquete: string, id: string): ClaveDeOrden => {
    const regla = indice.reglas.get(clave(paquete, id));
    return [nombresDeFamilia.get(clave(paquete, regla?.familia ?? '')) ?? '', nombreDeRegla(id, regla)];
  };
  contenedor.replaceChildren();
  resultado.paquetes.forEach((r, i) => {
    const cabecera = paquetes[i]!.cabecera;
    const p = r.puntuacion;
    const seccion = el('section', undefined, 'desglose-paquete');
    seccion.append(el('h3', `${r.paquete} ${cabecera.version}`));
    if (r.banda === null) seccion.append(el('p', cabecera.descripcion, 'descripcion'));
    seccion.append(el('p', p.total === null ? (p.motivo ?? '') : textos.total(cifra(p.total), p.unidad)));
    const enOrdenDeRegla = <T>(lista: readonly T[], id: (x: T) => string): T[] => enOrden(lista, (x) => ordenDeRegla(r.paquete, id(x)));
    for (const f of enOrden(p.familias.filter((x) => !x.informativa), (x) => [x.nombre])) {
      // Las reglas informativas de una familia que puntúa (las de contexto de Estadística) van aparte, abajo.
      const conSenal = enOrdenDeRegla(f.reglas.filter((x) => x.n > 0 && !x.informativa), (x) => x.id);
      seccion.append(
        ...apartado(
          `${f.nombre}: ${cifra(f.total)}`,
          conSenal.map((x) => deRegla(r.paquete, x.id, textos.reglaConSenales(x.n, cifra(x.contribucion)))),
        ),
      );
      if (conSenal.length === 0) seccion.append(el('h4', `${f.nombre}: ${cifra(f.total)}`), el('p', textos.NINGUNA_SENAL, 'nada'));
    }
    seccion.append(
      ...apartado(
        textos.DEL_TEXTO_ENTERO,
        enOrdenDeRegla(resultado.senalesTexto.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) => deRegla(r.paquete, s.reglaId, deLaSenalDeTexto(s))),
      ),
    );
    const porRegla = new Map<string, number>();
    const informativas: { id: string; linea: Linea }[] = [];
    for (const s of p.informativas) {
      if ('inicio' in s) porRegla.set(s.reglaId, (porRegla.get(s.reglaId) ?? 0) + 1);
      else informativas.push({ id: s.reglaId, linea: deRegla(r.paquete, s.reglaId, deLaSenalDeTexto(s)) });
    }
    for (const [id, n] of porRegla) informativas.push({ id, linea: deRegla(r.paquete, id, textos.reglaInformativa(n)) });
    seccion.append(
      ...apartado(textos.INFORMATIVAS_EN_EL_DESGLOSE, enOrdenDeRegla(informativas, (x) => x.id).map((x) => x.linea)),
      ...apartado(textos.SIN_CALIBRACION, enOrdenDeRegla(resultado.sinCalibracion.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) => deRegla(r.paquete, s.reglaId, s.motivo))),
      ...apartado(textos.NO_APLICADAS, enOrdenDeRegla(resultado.noAplicadas.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) => deRegla(r.paquete, s.reglaId, s.motivo))),
    );
    contenedor.append(seccion);
  });
}
