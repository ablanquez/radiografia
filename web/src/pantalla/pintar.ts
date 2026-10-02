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
 *    role, tabindex y data-* (dataset), que no ejecutan nada.
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
 */
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import type { ProblemaDeCarga } from './cargar.ts';
import { idHumanizado } from './humanizar.ts';
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

const TRAMOS_EN_PALABRAS: Readonly<Record<string, string>> = { '100-299': '100 a 299', '300-599': '300 a 599', '600+': '600 o más' };

/** Lo que se busca por clave: las reglas y las familias de los paquetes, con su clase de color. */
export interface Indice {
  /** «paquete::reglaId» → la ficha. */
  reglas: Map<string, Regla>;
  familias: { clave: string; paquete: string; nombre: string; informativa: boolean; clase: string }[];
  /** «paquete::familiaId» → su clase de color. */
  claseDeFamilia: Map<string, string>;
}

const clave = (paquete: string, id: string): string => `${paquete}::${id}`;

export function indexar(paquetes: readonly Paquete[]): Indice {
  const reglas = new Map<string, Regla>();
  const familias: Indice['familias'] = [];
  const claseDeFamilia = new Map<string, string>();
  let color = 0;
  for (const paquete of paquetes) {
    const nombre = paquete.cabecera.nombre;
    for (const regla of paquete.reglas) reglas.set(clave(nombre, regla.id), regla);
    for (const familia of paquete.cabecera.familias) {
      const clase = familia.informativa ? 'familia-informativa' : `familia-color-${color++ % COLORES}`;
      claseDeFamilia.set(clave(nombre, familia.id), clase);
      familias.push({ clave: clave(nombre, familia.id), paquete: nombre, nombre: familia.nombre, informativa: familia.informativa, clase });
    }
  }
  return { reglas, familias, claseDeFamilia };
}

export function pintarProblemas(contenedor: HTMLElement, problemas: readonly ProblemaDeCarga[]): void {
  contenedor.replaceChildren(el('p', 'No se han podido cargar los paquetes de reglas, y sin ellos no se analiza nada:'));
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
    elemento.append(el('span', 'subrayado', `muestra ${f.clase}`), ` ${f.nombre} (${f.paquete})`);
    (f.informativa ? informativas : puntuan).append(elemento);
  }
  contenedor.replaceChildren(el('h3', 'Familias'), puntuan);
  if (informativas.childElementCount > 0) contenedor.append(el('p', 'Informativas: se señalan y no suman.'), informativas);
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

export function pintarPanel(contenedor: HTMLElement, senales: readonly SenalCalificada[], indice: Indice): void {
  contenedor.replaceChildren(el('h3', 'Lo que señala este tramo'));
  const vistas = new Set<string>();
  for (const senal of senales) {
    const k = clave(senal.paquete, senal.reglaId);
    if (vistas.has(k)) continue;
    vistas.add(k);
    const ficha = el('article', undefined, 'ficha');
    ficha.append(el('h4', idHumanizado(senal.reglaId)), el('p', `${senal.reglaId} · ${senal.paquete}`, 'id-regla'));
    const regla = indice.reglas.get(k);
    if (regla !== undefined) {
      ficha.append(
        campo('Explicación', regla.explicacion),
        campo('Sugerencia', regla.sugerencia),
        campo('Nivel de evidencia', regla.nivelEvidencia),
        campo('Origen de la lista', regla.origenLista ?? '—'),
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
  if (total === 0) lineas.push(el('p', `Sin señales: ${r.paquete} no ha encontrado nada que puntúe en este texto.`, 'banda'));
  if (r.banda === null) return lineas;
  if (r.banda.banda === 'sin calibración') {
    lineas.push(el('p', `Sin calibración: ${r.banda.motivo}.`, 'banda'));
  } else if (total !== null && total !== 0) {
    const b = r.banda;
    lineas.push(
      el('p', `Tu texto queda ${b.banda} de los textos humanos del género «${nombreDelGenero}» de ${TRAMOS_EN_PALABRAS[tramo ?? ''] ?? tramo} palabras.`, 'banda'),
      el('p', `Tu total: ${cifra(total)}. En esos textos humanos (n = ${b.n}): mediana ${cifra(b.p50)} · p95 ${cifra(b.p95)} · p99 ${cifra(b.p99)}.`, 'percentiles'),
    );
  }
  return lineas;
}

export function pintarMedidor(contenedor: HTMLElement, resultado: Resultado, nombreDelGenero: string): void {
  const datos = el('p', `Palabras de prosa: ${resultado.palabrasProsa} · Tramo: ${resultado.tramoDeCalibracion ?? 'menos de 100'} · Género: ${nombreDelGenero}`, 'datos');
  const primero = resultado.paquetes[0]?.puntuacion;
  contenedor.replaceChildren();
  if (resultado.tramo === 'insuficiente') {
    contenedor.append(el('p', 'Texto insuficiente', 'estado-tramo'), el('p', primero?.motivo ?? ''), datos);
    return;
  }
  if (resultado.tramo === 'poco-fiable') contenedor.append(el('p', 'Resultado poco fiable', 'estado-tramo'), el('p', primero?.aviso ?? ''));
  // Solo los paquetes con escala (clave `_total-*`); Español correcto no la tiene y va aparte, en su desglose.
  for (const r of resultado.paquetes.filter((x) => x.banda !== null)) {
    contenedor.append(el('h3', r.paquete), ...lineasDeBanda(r, nombreDelGenero, resultado.tramoDeCalibracion));
  }
  contenedor.append(datos);
}

const LADOS: Readonly<Record<string, string>> = { arriba: 'por encima de la banda humana', abajo: 'por debajo de la banda humana' };

/** Una señal del texto entero, en una línea: la estadística con su valor y su banda; la ausencia con sus cuentas. */
function lineaDeTexto(s: SenalDeTexto): string {
  const quien = `${idHumanizado(s.reglaId)} (${s.reglaId})`;
  if ('coincidencias' in s) return `${quien}: ausencia: ${s.coincidencias} ${s.coincidencias === 1 ? 'aparición' : 'apariciones'}; señala por debajo de ${s.minimo}`;
  if ('valor' in s) {
    const c = s.referencia;
    const lado = s.lado === null ? 'dentro de la banda humana' : (LADOS[s.lado] ?? s.lado);
    return `${quien}: ${s.metrica} = ${cifra(s.valor)}, ${lado}; en los textos humanos: p1 ${cifra(c.p1)} · p5 ${cifra(c.p5)} · mediana ${cifra(c.p50)} · p95 ${cifra(c.p95)} · p99 ${cifra(c.p99)}`;
  }
  return quien;
}

/** Una lista con un título; nada si no hay elementos. */
function apartado(titulo: string, lineas: readonly string[]): HTMLElement[] {
  if (lineas.length === 0) return [];
  const lista = el('ul');
  for (const linea of lineas) lista.append(el('li', linea));
  return [el('h4', titulo), lista];
}

export function pintarDesglose(contenedor: HTMLElement, resultado: Resultado, paquetes: readonly Paquete[]): void {
  contenedor.replaceChildren();
  resultado.paquetes.forEach((r, i) => {
    const cabecera = paquetes[i]!.cabecera;
    const p = r.puntuacion;
    const seccion = el('section', undefined, 'desglose-paquete');
    seccion.append(el('h3', `${r.paquete} ${cabecera.version}`));
    if (r.banda === null) seccion.append(el('p', cabecera.descripcion, 'descripcion'));
    seccion.append(el('p', p.total === null ? (p.motivo ?? '') : `Total: ${cifra(p.total)} ${p.unidad}.`));
    for (const f of p.familias.filter((x) => !x.informativa)) {
      // Las reglas informativas de una familia que puntúa (las de contexto de Estadística) van aparte, abajo.
      const conSenal = f.reglas.filter((x) => x.n > 0 && !x.informativa);
      seccion.append(
        ...apartado(
          `${f.nombre}: ${cifra(f.total)}`,
          conSenal.map((x) => `${idHumanizado(x.id)} (${x.id}): ${x.n} ${x.n === 1 ? 'señal' : 'señales'}, contribución ${cifra(x.contribucion)}`),
        ),
      );
      if (conSenal.length === 0) seccion.append(el('h4', `${f.nombre}: ${cifra(f.total)}`), el('p', 'Ninguna señal.', 'nada'));
    }
    seccion.append(...apartado('Del texto entero', resultado.senalesTexto.filter((s) => s.paquete === r.paquete).map(lineaDeTexto)));
    const porRegla = new Map<string, number>();
    const informativasDeTexto: string[] = [];
    for (const s of p.informativas) {
      if ('inicio' in s) porRegla.set(s.reglaId, (porRegla.get(s.reglaId) ?? 0) + 1);
      else informativasDeTexto.push(lineaDeTexto(s));
    }
    seccion.append(
      ...apartado('Informativas: se enseñan, no suman', [
        ...[...porRegla].map(([id, n]) => `${idHumanizado(id)} (${id}): ${n} ${n === 1 ? 'señal' : 'señales'}`),
        ...informativasDeTexto,
      ]),
      ...apartado('Sin calibración', resultado.sinCalibracion.filter((s) => s.paquete === r.paquete).map((s) => `${idHumanizado(s.reglaId)} (${s.reglaId}): ${s.motivo}`)),
      ...apartado('No aplicadas', resultado.noAplicadas.filter((s) => s.paquete === r.paquete).map((s) => `${idHumanizado(s.reglaId)} (${s.reglaId}): ${s.motivo}`)),
    );
    contenedor.append(seccion);
  });
}
