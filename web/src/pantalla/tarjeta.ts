/**
 * La tarjeta de regla (encargo 10.4, Tanda 2; DISEÑO §6.1 y §7), como el
 * modelo (TarjetaRegla y TarjetaAnclada): al tocar un tramo, un diálogo no
 * modal anclado debajo de él (encima si no cabe), con un pico que señala el
 * tramo; una señal cada vez, la primera del tramo en el orden del texto, y
 * «Anterior» / «Siguiente» para recorrer las señales del texto en ese orden
 * (función nueva; desactivados en los extremos). El tramo de la señal abierta
 * es el activo (tinte al 28 %, línea más gruesa, aria-expanded). Se cierra con
 * la X o con Escape, y el foco vuelve al tramo. Lo que dice la tarjeta lo pinta
 * pintar.ts (pintarTarjeta).
 *
 *   · ordenDeLasSenales: las señales con tramo en el orden del texto (inicio,
 *     fin y, si empatan, el del motor), sin las de las familias ocultas con el
 *     ojo: «Anterior» y «Siguiente» no van a donde no se ve nada.
 *   · vecinas: la anterior y la siguiente de una señal en ese orden.
 *   · colocar: dónde va la tarjeta y su pico, con la geometría del modelo: 12
 *     px por debajo del último renglón del tramo (o por encima del primero si
 *     no cabe), 24 px a la izquierda del tramo y a 16 de los bordes, y el pico
 *     sobre el tramo (a la mitad de su renglón, como mucho a 40 px de su
 *     principio, y a 20 de las esquinas de la tarjeta).
 *
 * El foco: al abrir y al pasar de señal, al título de la tarjeta, como el
 * modelo (así se lee la regla nueva); al cerrar, al tramo de la señal abierta.
 *
 * En el móvil (hasta 768 px; DISEÑO §2 y §6.2, VistaMovilConHoja del modelo),
 * la misma tarjeta es una hoja inferior modal: aria-modal, el resto de la
 * página inerte, Tab y Mayúsculas+Tab dando la vuelta dentro, el velo detrás
 * (tocarlo la cierra), el asa «Cambiar tamaño» (del 60 % al 40 % de la
 * pantalla con un toque: no hay que arrastrar) y el tramo activo arriba, a 120
 * px del borde, por encima del velo y del borde de la hoja.
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — «Tab: Moves
 *    focus to the next tabbable element inside the dialog. If focus is on the
 *    last tabbable element inside the dialog, moves focus to the first
 *    tabbable element inside the dialog»; «The dialog container element has
 *    aria-modal set to true».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert
 *    — sus descendientes «cannot receive focus or be clicked», y el elemento
 *    «gets removed from the tab order and accessibility tree».
 * [DOC] https://www.w3.org/TR/wai-aria-1.2/#dialog — role dialog: «A
 *    descendant window of the primary window of a web application»; no modal
 *    (sin aria-modal): el resto de la página sigue a mano.
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — «Escape:
 *    Closes the dialog»; «When a dialog closes, focus returns to the element
 *    that invoked the dialog»; el diálogo, con aria-labelledby hacia su título
 *    visible.
 * [DOC] https://www.w3.org/TR/wai-aria-1.2/#aria-haspopup — el tramo dice que
 *    abre un diálogo (aria-haspopup="dialog") y si lo tiene abierto
 *    (aria-expanded).
 */

import { CAMBIAR_TAMANO } from '../textos.ts';

/** Una señal con su sitio en el texto. */
interface ConSitio {
  inicio: number;
  fin: number;
}

/** Las señales con tramo, por su índice, en el orden del texto; sin las que no se ven. */
export function ordenDeLasSenales(senales: readonly ConSitio[], seVe: (indice: number) => boolean): number[] {
  return senales
    .map((s, i) => ({ s, i }))
    .filter(({ s, i }) => s.inicio < s.fin && seVe(i))
    .sort((a, b) => a.s.inicio - b.s.inicio || a.s.fin - b.s.fin || a.i - b.i)
    .map((x) => x.i);
}

/** La señal anterior y la siguiente de una en ese orden; null en los extremos (o si no está). */
export function vecinas(orden: readonly number[], actual: number): { anterior: number | null; siguiente: number | null } {
  const k = orden.indexOf(actual);
  if (k < 0) return { anterior: null, siguiente: null };
  return { anterior: k > 0 ? orden[k - 1]! : null, siguiente: k < orden.length - 1 ? orden[k + 1]! : null };
}

/** Un renglón de un tramo, en coordenadas de la página. */
export interface Renglon {
  left: number;
  top: number;
  bottom: number;
  width: number;
}

/** Dónde va la tarjeta: arriba a la izquierda, de qué lado del tramo (el pico arriba: debajo del tramo) y el pico desde su borde izquierdo. */
export interface Sitio {
  top: number;
  left: number;
  pico: 'arriba' | 'abajo';
  x: number;
}

export function colocar(renglones: readonly Renglon[], alto: number, ancho: number, pagina: { ancho: number; alto: number }): Sitio {
  const primera = renglones[0]!;
  const ultima = renglones[renglones.length - 1]!;
  const debajo = ultima.bottom + 12;
  const cabeDebajo = debajo + alto <= pagina.alto - 16;
  const ref = cabeDebajo ? ultima : primera;
  const left = Math.min(Math.max(ref.left - 24, 16), pagina.ancho - ancho - 16);
  const x = Math.min(Math.max(ref.left + Math.min(ref.width / 2, 40) - left, 20), ancho - 20);
  return { top: cabeDebajo ? debajo : primera.top - 12 - alto, left, pico: cabeDebajo ? 'arriba' : 'abajo', x };
}

/** Lo de cada análisis: sus señales, cuáles se ven y cómo se pinta una en la tarjeta (devuelve la clase de su familia, para la barra y el pico). */
export interface Analisis {
  senales: readonly ConSitio[];
  seVe: (indice: number) => boolean;
  pintar: (indice: number) => string;
}

/** La tarjeta: se prepara con cada análisis, abre la primera señal de un tramo, se cierra y se entera de que el ojo cambió las capas. */
export interface Tarjeta {
  preparar: (analisis: Analisis) => void;
  abrir: (indices: readonly number[]) => void;
  cerrar: (devolverElFoco: boolean) => void;
  alCambiarLasCapas: () => void;
}

/** El móvil del DISEÑO §6.2 (hasta 768 px): la tarjeta es una hoja inferior modal. */
const MOVIL = '(max-width: 768px)';

/**
 * Una sola por página (los escuchadores de Escape, del tamaño de la ventana y
 * del ancho del móvil, una vez): `tarjeta` es su contenedor (role="dialog",
 * hijo de <body>), `vista`, la de los tramos, y `velo`, el fondo oscurecido de
 * la hoja.
 */
export function crearTarjeta(tarjeta: HTMLElement, vista: HTMLElement, velo: HTMLElement): Tarjeta {
  let analisis: Analisis = { senales: [], seVe: () => false, pintar: () => '' };
  let abierta: number | null = null;
  let compacta = false;
  const movil = matchMedia(MOVIL);
  const tramosDe = (indice: number): HTMLElement[] =>
    [...vista.querySelectorAll<HTMLElement>('.tramo')].filter((t) => (t.dataset['senales'] ?? '').split(' ').includes(String(indice)));
  const marcar = (activa: boolean): void => {
    if (abierta === null) return;
    for (const t of tramosDe(abierta)) {
      t.classList.toggle('activo', activa);
      if (t.hasAttribute('role')) t.setAttribute('aria-expanded', String(activa));
    }
  };
  const esHoja = (): boolean => tarjeta.classList.contains('hoja');
  const recolocar = (): void => {
    if (abierta === null || esHoja()) return;
    const renglones = tramosDe(abierta)
      .flatMap((t) => [...t.getClientRects()])
      .map((r) => ({ left: r.left + scrollX, top: r.top + scrollY, bottom: r.bottom + scrollY, width: r.width }));
    if (renglones.length === 0) return;
    const sitio = colocar(renglones, tarjeta.offsetHeight, tarjeta.offsetWidth, { ancho: document.documentElement.clientWidth, alto: document.documentElement.scrollHeight });
    tarjeta.style.top = `${sitio.top}px`;
    tarjeta.style.left = `${sitio.left}px`;
    tarjeta.dataset['pico'] = sitio.pico;
    tarjeta.style.setProperty('--pico-x', `${sitio.x}px`);
  };
  /** Anterior y Siguiente, según las vecinas de la señal abierta entre las que se ven. */
  const navegar = (): void => {
    if (abierta === null) return;
    const { anterior, siguiente } = vecinas(ordenDeLasSenales(analisis.senales, analisis.seVe), abierta);
    const [botonAnterior, botonSiguiente] = [...tarjeta.querySelectorAll<HTMLButtonElement>('.navegacion-reglas button')];
    for (const [boton, destino] of [[botonAnterior, anterior], [botonSiguiente, siguiente]] as const) {
      if (boton === undefined) continue;
      boton.disabled = destino === null;
      boton.onclick = destino === null ? null : () => ir(destino);
    }
  };
  /** Lo que queda detrás de la hoja: todo <body> menos la hoja y el velo, inerte mientras está abierta. */
  const detras = (): Element[] => [...document.body.children].filter((e) => e !== tarjeta && e !== velo && e.tagName !== 'SCRIPT');
  /** La hoja: el asa, el velo, lo de detrás inerte y el tramo arriba, a 120 px del borde, por encima del borde de la hoja (como el modelo). */
  const abrirHoja = (): void => {
    const asa = document.createElement('button');
    asa.type = 'button';
    asa.className = 'asa';
    asa.setAttribute('aria-label', CAMBIAR_TAMANO);
    asa.append(document.createElement('span'));
    asa.addEventListener('click', () => {
      compacta = !compacta;
      tarjeta.classList.toggle('compacta', compacta);
    });
    tarjeta.querySelector('.barra-familia')?.after(asa);
    // La colocación de la tarjeta anclada va en línea y ganaría a la de la hoja (docs/BITACORA.md, 2026-10-04).
    tarjeta.style.removeProperty('top');
    tarjeta.style.removeProperty('left');
    tarjeta.classList.add('hoja');
    tarjeta.classList.toggle('compacta', compacta);
    tarjeta.setAttribute('aria-modal', 'true');
    velo.hidden = false;
    for (const e of detras()) e.setAttribute('inert', '');
    document.body.classList.add('con-hoja');
    const tramo = abierta === null ? undefined : tramosDe(abierta)[0];
    if (tramo !== undefined) scrollTo({ top: scrollY + tramo.getBoundingClientRect().top - 120 });
  };
  const cerrarHoja = (): void => {
    tarjeta.classList.remove('hoja', 'compacta');
    tarjeta.removeAttribute('aria-modal');
    velo.hidden = true;
    for (const e of detras()) e.removeAttribute('inert');
    document.body.classList.remove('con-hoja');
  };
  const ir = (indice: number): void => {
    marcar(false);
    abierta = indice;
    tarjeta.className = `tarjeta-regla ${analisis.pintar(indice)}`;
    tarjeta.querySelector<HTMLButtonElement>('.cerrar')?.addEventListener('click', () => cerrar(true));
    navegar();
    tarjeta.hidden = false;
    marcar(true);
    if (movil.matches) abrirHoja();
    else {
      cerrarHoja();
      recolocar();
    }
    tarjeta.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    if (!esHoja()) tarjeta.scrollIntoView({ block: 'nearest' });
  };
  const cerrar = (devolverElFoco: boolean): void => {
    if (abierta === null) return;
    // Lo de detrás deja de ser inerte antes de devolver el foco: un elemento inerte no lo recibe.
    cerrarHoja();
    const vuelta = tramosDe(abierta).find((t) => t.hasAttribute('role'));
    marcar(false);
    abierta = null;
    tarjeta.hidden = true;
    tarjeta.replaceChildren();
    if (devolverElFoco) vuelta?.focus();
  };
  document.addEventListener('keydown', (e) => {
    if (abierta === null) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      cerrar(true);
      return;
    }
    // En la hoja, Tab y Mayúsculas+Tab dan la vuelta dentro de ella (APG, diálogo modal).
    if (e.key !== 'Tab' || !esHoja()) return;
    const enfocables = [...tarjeta.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], summary')].filter((x) => x.checkVisibility());
    const k = enfocables.indexOf(document.activeElement as HTMLElement);
    const siguiente = e.shiftKey ? (k <= 0 ? enfocables.length - 1 : k - 1) : k === enfocables.length - 1 ? 0 : k + 1;
    e.preventDefault();
    enfocables[siguiente]?.focus();
  });
  velo.addEventListener('click', () => cerrar(true));
  addEventListener('resize', recolocar);
  // Si la ventana cruza el ancho del móvil con la tarjeta abierta, se cierra: tarjeta y hoja no se transforman la una en la otra.
  // Al imprimir, no (desde el 10.4, Tanda 4): el papel mide de ancho lo que un móvil, y lo que cambia en la página mientras se
  // imprime sale cortado en el PDF (docs/BITACORA.md, 2026-10-05; pestanas.ts); al volver del papel, el ancho es el de antes.
  const impresion = matchMedia('print');
  let eraMovil = movil.matches;
  movil.addEventListener('change', () => {
    if (impresion.matches || movil.matches === eraMovil) return;
    eraMovil = movil.matches;
    cerrar(false);
  });
  return {
    preparar: (nuevo) => {
      cerrar(false);
      analisis = nuevo;
    },
    abrir: (indices) => {
      const primera = ordenDeLasSenales(analisis.senales, analisis.seVe).find((i) => indices.includes(i));
      if (primera !== undefined) ir(primera);
    },
    cerrar,
    // Con el ojo: si la señal abierta deja de verse, la tarjeta se cierra; si no, sigue, con su tramo activo y sus vecinas al día.
    alCambiarLasCapas: () => {
      if (abierta === null) return;
      if (!analisis.seVe(abierta)) {
        cerrar(false);
        return;
      }
      marcar(true);
      navegar();
      recolocar();
    },
  };
}
