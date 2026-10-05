/**
 * La pantalla mínima (encargo 6.2, c): el script de web/src/pages/index.astro.
 *
 *   1. Al arrancar, carga y valida los dos paquetes incluidos (cargar.ts, con
 *      el validarPaquete de navegador.ts: el standalone, sin Ajv). Si falla,
 *      dice qué paquete y por qué, y el botón se queda desactivado.
 *   2. Llena el selector con los géneros de la calibración de los paquetes
 *      activos (generos.ts), con «general» por defecto.
 *   3. Al pulsar «Pon tu texto a contraluz» (no al teclear), analiza el texto
 *      con los paquetes activos y pinta el medidor, la leyenda, la vista y el
 *      desglose (pintar.ts). El textarea sigue editable, y volver a pulsar
 *      reanaliza y sustituye lo pintado. Con menos de 100 palabras de prosa,
 *      «texto insuficiente» y nada más: el motor no analiza.
 *   4. Los dos botones de los ejemplos (encargo 6.3, a; ejemplos.ts) ponen su
 *      texto en el textarea y el género de los ejemplos en el selector, si está
 *      en él, y no analizan. Se activan con los paquetes, porque el selector no
 *      tiene géneros hasta entonces [PROPIO].
 *   5. El cargador (encargo 8.1, b; firmado en la parada 1):
 *      · una casilla por paquete incluido, marcada al arrancar; desmarcarla lo
 *        quita de los activos al volver a analizar, y el estado dura hasta
 *        recargar;
 *      · un paquete propio desde el <input type="file"> (propios.ts: tamaño,
 *        JSON, validador, nombre); si entra, va a la lista con su «Quitar» y a
 *        los activos; si no, sus errores en una lista, con textContent;
 *      · activos: los incluidos marcados y después los propios
 *        (propios.ts); el índice de colores, de todos los que conoce la página
 *        (pintar.ts), para que una familia no cambie de color;
 *      · al cambiar los paquetes, el selector se recalcula (si el género
 *        elegido ya no está, vuelve «general»), y un aviso dice que hay que
 *        volver a analizar si ya había un resultado pintado, o que no se puede
 *        analizar si no queda ningún paquete activo (y los botones se
 *        desactivan).
 *      Nada persiste: sin localStorage ni historial (alcance 29/09); al
 *      recargar, el paquete propio desaparece, y la página lo dice.
 *   6. El informe para imprimir (encargo 9.1, b; firmado en la parada 1): al
 *      analizar se pintan también, del mismo resultado, la cabecera del
 *      informe (con la fecha y la hora del análisis) y la lista de señales,
 *      que la hoja de impresión de index.astro enseña solo en papel. Imprime
 *      el último análisis pintado, y su cabecera dice cuál. El botón
 *      «Descargar informe» se activa con el primer resultado y abre el diálogo
 *      de imprimir; si los paquetes cambian después, sigue activo e imprime
 *      ese último resultado.
 *      [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Window/print —
 *      «Opens the print dialog to print the current document»; «This method
 *      will block while the print dialog is open».
 *      [DOC] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 *      — dateStyle y timeStyle, «long» y «short»; la zona horaria, «the
 *      runtime's time zone».
 *
 * Desde el 10.4 (Tanda 2; DISEÑO §6.1), el formulario es el del modelo: los
 * ejemplos son chips y el cargador va dentro de «Paquetes», plegado, con su
 * etiqueta como botón (estilos/formulario.css). La línea de paquetes cargados
 * se queda para el lector de pantalla (.solo-lector); si la carga falla, se ve.
 *
 * Y el resultado, como el modelo (10.4, Tanda 2; DISEÑO §6.1 y §7):
 *   · al analizar, el cuadro se pliega a tres líneas con «Editar el texto»
 *     (que lo despliega y lo enfoca), la vista ocupa la columna del texto y
 *     el foco va a la etiqueta del resultado (la pantalla salta a él; sin
 *     eso, el foco se quedaría en el botón, que se pliega con el cuadro);
 *   · con texto insuficiente no se pliega: el aviso va debajo del cuadro,
 *     unido a él con aria-describedby, y el bloque del resultado queda para
 *     el papel (el informe del 9.1 lo imprime);
 *   · «Analizar otro texto» vacía el cuadro, quita el resultado y enfoca el
 *     cuadro; «Descargar informe» del formulario se queda para cuando no hay
 *     resultado, y con resultado va entre los botones del final;
 *   · el ojo de cada familia oculta o enseña su capa en la vista; lo oculto
 *     vale para ese resultado: al volver a analizar, todo se ve otra vez;
 *   · al tocar un tramo, la tarjeta de su primera señal (tarjeta.ts), una sola
 *     por página, que se prepara con cada análisis;
 *   · en el móvil, las pestañas Texto · Reglas · Datos (pestanas.ts): lo que
 *     se llevan a sus paneles vuelve a su sitio antes de pintar otro análisis
 *     o de quitar el resultado.
 *   [DOC] https://www.w3.org/TR/wai-aria-1.2/#aria-describedby — «Identifies
 *   the element (or elements) that describes the object».
 *   [DOC] https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
 *   — por defecto, «the browser will scroll the element into view».
 *
 * Sin red salvo los fetch de los paquetes incluidos y de los ejemplos: el
 * paquete propio se lee del fichero, en el navegador (lo demuestra
 * jueces/navegador.spec.ts). Sin librerías de UI. Las cadenas de la interfaz,
 * en web/src/textos.ts (encargo 6.3, b); la de `elemento` no lo es: es un
 * fallo de programación que va a la consola.
 * [DOC] https://docs.astro.build/en/guides/client-side-scripts/ — «All scripts
 *    are TypeScript by default»; los imports se empaquetan y el script queda
 *    como type="module" (de ahí el await de primer nivel).
 * [DOC] https://html.spec.whatwg.org/multipage/input.html — el value de un
 *    input de fichero, «On setting, if the new value is the empty string,
 *    empty the list of selected files»: se vacía tras cada intento, para que
 *    elegir otra vez el mismo fichero vuelva a dar «change».
 */
import { analizar, validarPaquete, type Paquete } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import { cargarPaquetes } from './cargar.ts';
import { cargarEjemplo, GENERO_DE_LOS_EJEMPLOS, type Ejemplo } from './ejemplos.ts';
import { GENERO_POR_DEFECTO, generosDe, nombreDeGenero } from './generos.ts';
import {
  indexar,
  ocultarCapas,
  pintarCabeceraDelInforme,
  pintarDesglose,
  pintarLeyenda,
  pintarMedidor,
  familiaDeLaSenal,
  pintarTarjeta,
  pintarProblemas,
  pintarSenalesDelInforme,
  pintarVista,
  numerarSecciones,
  type Indice,
} from './pintar.ts';
import { activos, leerPaquetePropio } from './propios.ts';
import { recuentoDeFamilias, type Voz } from './lectura.ts';
import { crearTarjeta } from './tarjeta.ts';
import { crearPestanas } from './pestanas.ts';

function elemento<T extends HTMLElement>(id: string): T {
  const e = document.getElementById(id);
  if (e === null) throw new Error(`falta #${id} en la página`);
  return e as T;
}

const formulario = elemento<HTMLFormElement>('formulario');
const texto = elemento<HTMLTextAreaElement>('texto');
const genero = elemento<HTMLSelectElement>('genero');
const boton = elemento<HTMLButtonElement>('analizar');
const estado = elemento<HTMLParagraphElement>('estado');
const problemas = elemento<HTMLDivElement>('problemas');
const resultado = elemento<HTMLElement>('resultado');
const medidor = elemento<HTMLDivElement>('medidor');
const leyenda = elemento<HTMLDivElement>('leyenda');
const vista = elemento<HTMLDivElement>('vista');
const contenedorDeLaTarjeta = elemento<HTMLElement>('tarjeta');
const tarjeta = crearTarjeta(contenedorDeLaTarjeta, vista, elemento<HTMLDivElement>('velo'));
const pestanas = crearPestanas(elemento<HTMLDivElement>('barra-pestanas'));
const desglose = elemento<HTMLDivElement>('desglose');
const botonesDeEjemplo: [HTMLButtonElement, Ejemplo][] = [
  [elemento<HTMLButtonElement>('ejemplo-humano'), 'humano'],
  [elemento<HTMLButtonElement>('ejemplo-ia'), 'ia'],
];
const estadoDelEjemplo = elemento<HTMLParagraphElement>('estado-ejemplo');
const casillasDeIncluidos = elemento<HTMLDivElement>('incluidos');
const entradaPropia = elemento<HTMLInputElement>('paquete-propio');
const listaDePropios = elemento<HTMLUListElement>('propios');
const estadoPropio = elemento<HTMLParagraphElement>('estado-propio');
const erroresPropio = elemento<HTMLDivElement>('errores-propio');
const avisoDePaquetes = elemento<HTMLParagraphElement>('aviso-paquetes');
const cabeceraDelInforme = elemento<HTMLDivElement>('cabecera-informe');
const senalesDelInforme = elemento<HTMLDivElement>('senales-informe');
const pieDelInforme = elemento<HTMLParagraphElement>('pie-informe');
const fechaDelAnalisis = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' });
const botonDelInforme = elemento<HTMLButtonElement>('informe');
botonDelInforme.addEventListener('click', () => window.print());
const descargar = elemento<HTMLButtonElement>('descargar');
descargar.addEventListener('click', () => window.print());
const plegado = elemento<HTMLDivElement>('plegado');
const textoPlegado = elemento<HTMLParagraphElement>('texto-plegado');
const hueco = elemento<HTMLParagraphElement>('hueco-resultado');
const avisoInsuficiente = elemento<HTMLParagraphElement>('aviso-insuficiente');

/** El cuadro desplegado (y el formulario entero) o plegado a tres líneas con su texto. */
function desplegar(): void {
  formulario.hidden = false;
  plegado.hidden = true;
}
function plegar(): void {
  textoPlegado.textContent = texto.value;
  formulario.hidden = true;
  plegado.hidden = false;
}

elemento<HTMLButtonElement>('editar').addEventListener('click', () => {
  desplegar();
  texto.focus();
});

/** El aviso de texto insuficiente debajo del cuadro, o ninguno. */
function avisarInsuficiente(palabras: number | null): void {
  avisoInsuficiente.hidden = palabras === null;
  avisoInsuficiente.querySelector('span')!.textContent = palabras === null ? '' : textos.textoInsuficiente(palabras);
  if (palabras === null) texto.removeAttribute('aria-describedby');
  else texto.setAttribute('aria-describedby', avisoInsuficiente.id);
}

elemento<HTMLButtonElement>('otro').addEventListener('click', () => {
  texto.value = '';
  tarjeta.cerrar(false);
  pestanas.devolver();
  for (const parte of [resultado, vista]) parte.hidden = true;
  hueco.hidden = false;
  avisarInsuficiente(null);
  hayResultado = false;
  botonDelInforme.hidden = false;
  botonDelInforme.disabled = true;
  avisoDePaquetes.textContent = '';
  desplegar();
  texto.focus();
});

/** true si lo analizado salió bien y está pintado: cambiar los paquetes lo deja atrás. */
let hayResultado = false;

function analizarYPintar(paquetes: readonly Paquete[], indice: Indice, vozDe: (paquete: string) => Voz): void {
  const elTexto = texto.value;
  const elGenero = genero.value;
  try {
    const r = analizar(elTexto, paquetes, { genero: elGenero });
    // Lo que las pestañas del móvil se llevaron vuelve a su sitio antes de pintar encima.
    pestanas.devolver();
    pintarCabeceraDelInforme(cabeceraDelInforme, r, paquetes, indice, fechaDelAnalisis.format(new Date()), nombreDeGenero(elGenero));
    pintarMedidor(medidor, r, vozDe, indice, nombreDeGenero(elGenero));
    pintarSenalesDelInforme(senalesDelInforme, r, elTexto, indice, import.meta.env.BASE_URL, location.href);
    const hayAnalisis = r.tramo !== 'insuficiente';
    const ocultas = new Set<string>();
    tarjeta.preparar({
      senales: r.senales,
      seVe: (i) => !ocultas.has(familiaDeLaSenal(r.senales[i]!, indice)),
      pintar: (i) => pintarTarjeta(contenedorDeLaTarjeta, r.senales[i]!, indice, import.meta.env.BASE_URL),
    });
    for (const parte of [leyenda, vista, desglose]) {
      parte.replaceChildren();
      parte.hidden = !hayAnalisis;
    }
    if (hayAnalisis) {
      pintarLeyenda(leyenda, indice, new Set(paquetes.map((p) => p.cabecera.nombre)), recuentoDeFamilias(r), (familia, oculta) => {
        if (oculta) ocultas.add(familia);
        else ocultas.delete(familia);
        ocultarCapas(vista, ocultas, indice);
        tarjeta.alCambiarLasCapas();
      });
      pintarVista(vista, elTexto, r.senales, indice, (indices) => tarjeta.abrir(indices));
      pintarDesglose(desglose, r, paquetes, indice, import.meta.env.BASE_URL, vozDe, nombreDeGenero(elGenero));
    }
    // Los números de las secciones del informe, las que salen en papel, en su orden (10.4, Tanda 4).
    numerarSecciones([...[cabeceraDelInforme, medidor, leyenda, vista, desglose, senalesDelInforme].map((parte) => parte.querySelector<HTMLElement>(':scope > .titulo-seccion')), pieDelInforme]);
    problemas.hidden = true;
    resultado.hidden = false;
    resultado.classList.toggle('insuficiente', !hayAnalisis);
    hueco.hidden = hayAnalisis;
    avisarInsuficiente(hayAnalisis ? null : r.palabrasProsa);
    hayResultado = true;
    botonDelInforme.disabled = false;
    botonDelInforme.hidden = hayAnalisis;
    avisoDePaquetes.textContent = '';
    if (hayAnalisis) {
      plegar();
      pestanas.alPintar();
      medidor.querySelector<HTMLElement>('.pastilla > [tabindex]')?.focus();
    }
  } catch (fallo) {
    pintarProblemas(problemas, [{ paquete: textos.EL_ANALISIS, mensajes: [(fallo as Error).message] }]);
  }
}

/** Las opciones del selector, de los paquetes activos; conserva el género elegido si sigue en la lista. */
function rellenarGeneros(paquetes: readonly Paquete[]): void {
  const elegido = genero.value;
  const claves = generosDe(paquetes);
  genero.replaceChildren();
  for (const clave of claves) {
    const opcion = document.createElement('option');
    opcion.value = clave;
    opcion.textContent = nombreDeGenero(clave);
    opcion.selected = clave === (claves.includes(elegido) ? elegido : GENERO_POR_DEFECTO);
    genero.append(opcion);
  }
}

const carga = await cargarPaquetes(import.meta.env.BASE_URL, (url) => fetch(url), validarPaquete);
if (carga.paquetes === null) {
  estado.textContent = textos.SIN_PAQUETES;
  pintarProblemas(problemas, carga.problemas);
} else {
  const incluidos = carga.paquetes;
  // Quién habla en el medidor (9.2): RadiografIA, el primero de FICHEROS, de estilo de asistente; Español correcto, de norma; los propios, de sus señales.
  const vozDe = (paquete: string): Voz => (paquete === incluidos[0]?.cabecera.nombre ? 'asistente' : incluidos.some((p) => p.cabecera.nombre === paquete) ? 'norma' : 'propio');
  const marcados = new Set(incluidos.map((p) => p.cabecera.nombre));
  const propios: Paquete[] = [];
  const losActivos = (): Paquete[] => activos(incluidos, marcados, propios);
  let indice = indexar(incluidos);

  /** Después de marcar, desmarcar, cargar o quitar: índice, selector, botones y aviso. */
  const alCambiarLosPaquetes = (): void => {
    indice = indexar([...incluidos, ...propios], new Set(propios.map((p) => p.cabecera.nombre)));
    const ahora = losActivos();
    rellenarGeneros(ahora);
    const hay = ahora.length > 0;
    boton.disabled = !hay;
    for (const [botonDeEjemplo] of botonesDeEjemplo) botonDeEjemplo.disabled = !hay;
    avisoDePaquetes.textContent = !hay ? textos.SIN_PAQUETES_ACTIVOS : hayResultado ? textos.PAQUETES_CAMBIADOS : '';
  };

  for (const paquete of incluidos) {
    const nombre = paquete.cabecera.nombre;
    const casilla = document.createElement('input');
    casilla.type = 'checkbox';
    casilla.value = nombre;
    casilla.checked = true;
    casilla.addEventListener('change', () => {
      if (casilla.checked) marcados.add(nombre);
      else marcados.delete(nombre);
      alCambiarLosPaquetes();
    });
    const etiqueta = document.createElement('label');
    etiqueta.className = 'casilla';
    etiqueta.append(casilla, ` ${nombre} ${paquete.cabecera.version}`);
    casillasDeIncluidos.append(etiqueta);
  }

  /** La lista de paquetes propios, cada uno con su «Quitar». */
  const pintarPropios = (): void => {
    listaDePropios.replaceChildren();
    for (const paquete of propios) {
      const { nombre, version } = paquete.cabecera;
      const quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.textContent = textos.QUITAR;
      quitar.setAttribute('aria-label', textos.quitarPaquete(nombre));
      quitar.addEventListener('click', () => {
        propios.splice(propios.indexOf(paquete), 1);
        estadoPropio.textContent = '';
        pintarPropios();
        alCambiarLosPaquetes();
      });
      const fila = document.createElement('li');
      fila.append(`${textos.paquetePropio(nombre, version, paquete.reglas.length)} `, quitar);
      listaDePropios.append(fila);
    }
    listaDePropios.hidden = propios.length === 0;
  };

  entradaPropia.addEventListener('change', async () => {
    const fichero = entradaPropia.files?.[0];
    entradaPropia.value = '';
    if (fichero === undefined) return;
    const lectura = await leerPaquetePropio(fichero, incluidos, propios, validarPaquete);
    if (lectura.problema !== null) {
      estadoPropio.textContent = '';
      const titulo = document.createElement('p');
      titulo.textContent = lectura.problema.titulo;
      erroresPropio.replaceChildren(titulo);
      if (lectura.problema.mensajes.length > 0) {
        const lista = document.createElement('ul');
        for (const mensaje of lectura.problema.mensajes) {
          const fila = document.createElement('li');
          fila.textContent = mensaje;
          lista.append(fila);
        }
        erroresPropio.append(lista);
      }
      erroresPropio.hidden = false;
      return;
    }
    const { nombre, version } = lectura.paquete.cabecera;
    propios.push(lectura.paquete);
    erroresPropio.replaceChildren();
    erroresPropio.hidden = true;
    estadoPropio.textContent = textos.paquetePropioCargado(nombre, version, lectura.paquete.reglas.length);
    pintarPropios();
    alCambiarLosPaquetes();
  });

  rellenarGeneros(losActivos());
  genero.disabled = false;
  boton.disabled = false;
  entradaPropia.disabled = false;
  for (const [botonDeEjemplo, ejemplo] of botonesDeEjemplo) {
    botonDeEjemplo.disabled = false;
    botonDeEjemplo.addEventListener('click', async () => {
      const carga = await cargarEjemplo(import.meta.env.BASE_URL, ejemplo, (url) => fetch(url));
      if (carga.texto === null) {
        estadoDelEjemplo.textContent = carga.problema;
        return;
      }
      texto.value = carga.texto;
      // Sin RadiografIA, el género de los ejemplos puede no estar en el selector: entonces se queda el elegido.
      if ([...genero.options].some((o) => o.value === GENERO_DE_LOS_EJEMPLOS)) genero.value = GENERO_DE_LOS_EJEMPLOS;
      estadoDelEjemplo.textContent = '';
    });
  }
  estado.textContent = textos.paquetesCargados(incluidos.map((p) => `${p.cabecera.nombre} ${p.cabecera.version}`));
  estado.classList.add('solo-lector');
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    analizarYPintar(losActivos(), indice, vozDe);
  });
}
