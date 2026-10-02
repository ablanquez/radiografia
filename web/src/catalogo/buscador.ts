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
 * La lógica, en filtro.ts; las cadenas, en textos.ts.
 */
import { recuentoDeReglas } from '../textos.ts';
import { coincide } from './filtro.ts';

function elemento<T extends HTMLElement>(id: string): T {
  const e = document.getElementById(id);
  if (e === null) throw new Error(`falta #${id} en la página`);
  return e as T;
}

const formulario = elemento<HTMLFormElement>('filtros');
const buscador = elemento<HTMLInputElement>('buscar');
const quitar = elemento<HTMLButtonElement>('quitar-filtros');
const recuento = elemento<HTMLParagraphElement>('recuento');
const filas = [...elemento<HTMLUListElement>('reglas').children].filter((e): e is HTMLLIElement => e instanceof HTMLLIElement);

const marcadas = (nombre: string): Set<string> =>
  new Set([...formulario.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="${nombre}"]:checked`)].map((c) => c.value));

function aplicar(): void {
  const filtro = { consulta: buscador.value, familias: marcadas('familia'), severidades: marcadas('severidad'), detectores: marcadas('detector') };
  let quedan = 0;
  for (const fila of filas) {
    const { texto = '', familia = '', severidad = '', detector = '' } = fila.dataset;
    fila.hidden = !coincide({ texto, familia, severidad, detector }, filtro);
    if (!fila.hidden) quedan++;
  }
  const texto = recuentoDeReglas(quedan);
  if (recuento.textContent !== texto) recuento.textContent = texto;
}

formulario.addEventListener('input', aplicar);
formulario.addEventListener('submit', (e) => e.preventDefault());
quitar.addEventListener('click', () => {
  formulario.reset();
  aplicar();
});
