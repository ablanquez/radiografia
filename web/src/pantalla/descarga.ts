/**
 * Los dos botones «Descargar informe» (encargo 9.3; decisión de Antonio del
 * 05/10, firmada en la parada previa): generan el PDF en el navegador y lo
 * descargan como RadiografIA.pdf, sin el diálogo de imprimir (que no sirve en
 * el iPhone ni en el iPad). El del formulario está desactivado hasta que hay
 * resultado (pantalla.ts) y el del final, activo. Al pulsar:
 *   · con texto insuficiente, no hay PDF y su línea de estado lo dice;
 *   · si no, el botón se desactiva y dice «Preparando el informe…»; se carga,
 *     solo entonces, el trozo de JS con pdfmake (generar-pdf.ts), que pide las
 *     fuentes al mismo origen, genera el PDF y lo descarga; si algo falla, la
 *     línea de estado dice el motivo. Al terminar, el botón vuelve a ser el
 *     que era.
 * El informe es el del último análisis pintado, con su fecha: el mismo que el
 * papel (modelo-informe.ts). Ctrl+P y el menú Imprimir no se tocan: sacan la
 * hoja de impresión (estilos/informe.css).
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
 *    — import(): «loads a module asynchronously and dynamically».
 * [DOC] https://www.w3.org/TR/wai-aria-1.2/#status — role="status": «A type of
 *    live region whose content is advisory information for the user»; la
 *    línea de estado de cada botón, oculta mientras está vacía.
 */
import * as textos from '../textos.ts';
import { conBarraFinal } from './cargar.ts';
import { motivoDelFallo } from './fallo.ts';
import { informeEnDatos, type Analisis } from './modelo-informe.ts';

/** El estado de un botón: su línea, con un texto o vacía y oculta. */
function decir(estado: HTMLElement, texto: string): void {
  estado.textContent = texto;
  estado.hidden = texto === '';
}

/**
 * Engancha un botón «Descargar informe» con su línea de estado. `analisis` da
 * el último análisis pintado (null sin resultado); `activo`, si el botón debe
 * quedar activo al terminar (el del formulario, solo con resultado).
 */
export function engancharDescarga(boton: HTMLButtonElement, estado: HTMLElement, analisis: () => Analisis | null, activo: () => boolean): void {
  decir(estado, '');
  boton.addEventListener('click', async () => {
    const a = analisis();
    decir(estado, '');
    if (a === null) return;
    if (a.resultado.tramo === 'insuficiente') {
      decir(estado, textos.SIN_INFORME_QUE_DESCARGAR);
      return;
    }
    const nombre = boton.textContent;
    boton.disabled = true;
    boton.textContent = textos.PREPARANDO_EL_INFORME;
    try {
      const { descargarElInforme } = await import('./generar-pdf.ts');
      await descargarElInforme(informeEnDatos(a), conBarraFinal(a.base));
    } catch (fallo) {
      decir(estado, textos.informeNoPreparado(motivoDelFallo(fallo)));
    } finally {
      boton.textContent = nombre;
      boton.disabled = !activo();
    }
  });
}

/** Vacía la línea de estado de un botón (al pintar otro análisis o al quitar el resultado). */
export function callarDescarga(estado: HTMLElement): void {
  decir(estado, '');
}
