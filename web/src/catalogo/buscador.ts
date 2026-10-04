/**
 * El buscador y los filtros del índice del catálogo (encargo 7.1, b): el
 * script de src/pages/reglas/index.astro. Oculta y enseña las filas ya
 * pintadas (el atributo hidden), sin volver a pintar nada ni pedir nada a la
 * red, y pone en la región viva cuántas quedan.
 *
 *   · Cada cambio del buscador o de una casilla vuelve a aplicar el filtro.
 *     [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event
 *     — el evento input salta en el <input> de texto al escribir y «for
 *     <input> elements with type=checkbox or type=radio, the input event
 *     should fire whenever a user toggles the control»; sube hasta el
 *     formulario, que lo escucha una vez para todos.
 *   · Enter en el buscador no envía el formulario: no hay a dónde.
 *   · «Quitar filtros» vacía el buscador y desmarca todo (reset del
 *     formulario, que no lanza input) y vuelve a aplicar.
 *     [DOC] https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset
 *     — «restores a form element's default values».
 *   · El recuento solo se reescribe si cambia, para que el lector de pantalla
 *     no repita lo mismo.
 * Desde el 10.4 (Tanda 3; DISEÑO §6.3, como el modelo): sin ninguna regla, la
 *   lista se va y sale «Ninguna regla con esos filtros.» con su «Quitar
 *   filtros», que además lleva el foco al buscador (el botón que lo tenía
 *   desaparece); y en el móvil los filtros van en una hoja (hoja-filtros.ts):
 *   mientras está abierta, las casillas son un borrador que no filtra, y su
 *   «Quitar filtros» solo desmarca el borrador.
 * La lógica, en filtro.ts; las cadenas, en textos.ts.
 */
import { recuentoDeReglas } from '../textos.ts';
import { coincide } from './filtro.ts';
import { crearHojaDeFiltros } from './hoja-filtros.ts';

function elemento<T extends HTMLElement>(id: string): T {
  const e = document.getElementById(id);
  if (e === null) throw new Error(`falta #${id} en la página`);
  return e as T;
}

function dentro<T extends HTMLElement>(padre: HTMLElement, selector: string): T {
  const e = padre.querySelector<T>(selector);
  if (e === null) throw new Error(`falta ${selector} en #${padre.id}`);
  return e;
}

const formulario = elemento<HTMLFormElement>('filtros');
const buscador = elemento<HTMLInputElement>('buscar');
const quitar = elemento<HTMLButtonElement>('quitar-filtros');
const quitarSinReglas = elemento<HTMLButtonElement>('quitar-filtros-sin-reglas');
const recuento = elemento<HTMLParagraphElement>('recuento');
const lista = elemento<HTMLUListElement>('reglas');
const sinReglas = elemento<HTMLDivElement>('sin-reglas');
const panel = elemento<HTMLDivElement>('panel-filtros');
const filas = [...lista.children].filter((e): e is HTMLLIElement => e instanceof HTMLLIElement);
const casillas = [...formulario.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];

const marcadas = (nombre: string): Set<string> => new Set(casillas.filter((c) => c.name === nombre && c.checked).map((c) => c.value));

function aplicar(): void {
  const filtro = { consulta: buscador.value, familias: marcadas('familia'), severidades: marcadas('severidad'), detectores: marcadas('detector') };
  let quedan = 0;
  for (const fila of filas) {
    const { texto = '', familia = '', severidad = '', detector = '' } = fila.dataset;
    fila.hidden = !coincide({ texto, familia, severidad, detector }, filtro);
    if (!fila.hidden) quedan++;
  }
  lista.hidden = quedan === 0;
  sinReglas.hidden = quedan !== 0;
  const texto = recuentoDeReglas(quedan);
  if (recuento.textContent !== texto) recuento.textContent = texto;
}

const hoja = crearHojaDeFiltros(
  {
    panel,
    abrir: elemento<HTMLButtonElement>('abrir-filtros'),
    titulo: elemento<HTMLElement>('titulo-filtros'),
    asa: dentro<HTMLButtonElement>(panel, '.asa'),
    cerrar: dentro<HTMLButtonElement>(panel, '.cerrar'),
    aplicar: elemento<HTMLButtonElement>('aplicar-filtros'),
    barra: dentro<HTMLElement>(formulario, '.barra-filtros'),
    acciones: dentro<HTMLElement>(panel, '.acciones-filtros'),
    recuento,
    velo: elemento<HTMLElement>('velo'),
    casillas,
  },
  aplicar,
);

const quitarTodo = (): void => {
  formulario.reset();
  aplicar();
  hoja.rotular();
};

formulario.addEventListener('input', () => {
  if (hoja.abierta()) return;
  aplicar();
  hoja.rotular();
});
formulario.addEventListener('submit', (e) => e.preventDefault());
quitar.addEventListener('click', () => {
  if (hoja.abierta()) for (const c of casillas) c.checked = false;
  else quitarTodo();
});
quitarSinReglas.addEventListener('click', () => {
  quitarTodo();
  buscador.focus();
});
