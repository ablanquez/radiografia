/**
 * Los filtros del catálogo en el móvil (encargo 10.4, Tanda 3; DISEÑO §6.3,
 * como el modelo): el botón «Filtros (n)» abre los tres grupos de casillas en
 * una hoja inferior modal, con su título, la X, el asa «Cambiar tamaño» (60 %
 * ↔ 90 % de alto, con un toque), «Aplicar» y «Quitar filtros». Un solo DOM:
 * la hoja es el mismo panel de filtros del escritorio, que aquí recibe la
 * clase hoja y role="dialog" con aria-modal y aria-labelledby mientras está
 * abierto; en el escritorio y en la tableta es un bloque más del formulario.
 *
 *   · Lo que se marca en la hoja es un borrador: no filtra hasta «Aplicar».
 *     La X, Escape y tocar el velo la cierran sin aplicar (las casillas
 *     vuelven a como estaban). «Quitar filtros», con la hoja abierta,
 *     desmarca el borrador (lo hace buscador.ts, que lo pregunta con abierta()).
 *   · Al abrir, el foco va al título; al cerrar, vuelve al botón «Filtros».
 *     Tab y Mayúsculas+Tab dan la vuelta dentro de la hoja; lo de alrededor,
 *     inerte (en cada nivel, del panel a <body>, sus hermanos, menos el velo).
 *   · El recuento (la región viva) va junto a «Quitar filtros» en el
 *     escritorio y junto al botón «Filtros» en el móvil: se mueve de sitio al
 *     cruzar el ancho; si cruza con la hoja abierta, la hoja se cierra sin
 *     aplicar.
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — «When a
 *    dialog opens, focus moves to an element inside the dialog»; Tab y
 *    Shift+Tab se quedan dentro; Escape lo cierra; al cerrarse, el foco
 *    vuelve al elemento que lo abrió.
 * [DOC] https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute
 *    — inert: el elemento y lo que contiene no reciben foco ni clics.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia —
 *    el MediaQueryList avisa con «change» al cruzar el ancho.
 */
import { filtrosMarcados } from '../textos.ts';

const MOVIL = '(max-width: 768px)';

/** Las piezas de la página que usa la hoja. */
export interface PiezasDeLaHoja {
  panel: HTMLElement;
  abrir: HTMLButtonElement;
  titulo: HTMLElement;
  asa: HTMLButtonElement;
  cerrar: HTMLButtonElement;
  aplicar: HTMLButtonElement;
  barra: HTMLElement;
  acciones: HTMLElement;
  recuento: HTMLElement;
  velo: HTMLElement;
  casillas: readonly HTMLInputElement[];
}

export interface HojaDeFiltros {
  /** Si la hoja está abierta: mientras, las casillas son un borrador y no filtran. */
  abierta(): boolean;
  /** El botón «Filtros (n)», con las casillas marcadas que filtran ahora. */
  rotular(): void;
}

/** Monta la hoja; `filtrar` aplica a la lista lo que marcan las casillas. */
export function crearHojaDeFiltros(p: PiezasDeLaHoja, filtrar: () => void): HojaDeFiltros {
  const movil = matchMedia(MOVIL);
  let borrador: boolean[] | null = null;
  const rotular = (): void => {
    const texto = filtrosMarcados(p.casillas.filter((c) => c.checked).length);
    if (p.abrir.textContent !== texto) p.abrir.textContent = texto;
  };
  const colocarRecuento = (): void => {
    const sitio = movil.matches ? p.barra : p.acciones;
    if (p.recuento.parentElement !== sitio) sitio.append(p.recuento);
  };
  /** Lo de alrededor del panel: en cada nivel, del panel a <body>, sus hermanos (menos el velo y los scripts). */
  const alrededor = (): Element[] => {
    const fuera: Element[] = [];
    for (let e: Element = p.panel; e !== document.body && e.parentElement !== null; e = e.parentElement) {
      for (const hermano of e.parentElement.children) if (hermano !== e && hermano !== p.velo && hermano.tagName !== 'SCRIPT') fuera.push(hermano);
    }
    return fuera;
  };
  const abrirHoja = (): void => {
    borrador = p.casillas.map((c) => c.checked);
    p.panel.classList.add('hoja');
    p.panel.classList.remove('grande');
    p.panel.setAttribute('role', 'dialog');
    p.panel.setAttribute('aria-modal', 'true');
    p.panel.setAttribute('aria-labelledby', p.titulo.id);
    p.velo.hidden = false;
    for (const e of alrededor()) e.setAttribute('inert', '');
    p.abrir.setAttribute('aria-expanded', 'true');
    p.titulo.focus({ preventScroll: true });
  };
  const cerrarHoja = (aplicar: boolean, devolverElFoco: boolean): void => {
    if (borrador === null) return;
    if (!aplicar) p.casillas.forEach((c, i) => (c.checked = borrador![i]!));
    borrador = null;
    p.panel.classList.remove('hoja', 'grande');
    for (const atributo of ['role', 'aria-modal', 'aria-labelledby']) p.panel.removeAttribute(atributo);
    p.velo.hidden = true;
    for (const e of alrededor()) e.removeAttribute('inert');
    p.abrir.setAttribute('aria-expanded', 'false');
    filtrar();
    rotular();
    if (devolverElFoco) p.abrir.focus();
  };
  p.abrir.addEventListener('click', abrirHoja);
  p.aplicar.addEventListener('click', () => cerrarHoja(true, true));
  p.cerrar.addEventListener('click', () => cerrarHoja(false, true));
  p.velo.addEventListener('click', () => cerrarHoja(false, true));
  p.asa.addEventListener('click', () => p.panel.classList.toggle('grande'));
  document.addEventListener('keydown', (e) => {
    if (borrador === null) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      cerrarHoja(false, true);
      return;
    }
    if (e.key !== 'Tab') return;
    const enfocables = [...p.panel.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')].filter((x) => x.checkVisibility());
    const k = enfocables.indexOf(document.activeElement as HTMLElement);
    const siguiente = e.shiftKey ? (k <= 0 ? enfocables.length - 1 : k - 1) : k === enfocables.length - 1 ? 0 : k + 1;
    e.preventDefault();
    enfocables[siguiente]?.focus();
  });
  movil.addEventListener('change', () => {
    cerrarHoja(false, false);
    colocarRecuento();
  });
  colocarRecuento();
  rotular();
  return { abierta: () => borrador !== null, rotular };
}
