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
  pintarCabeceraDelInforme,
  pintarDesglose,
  pintarLeyenda,
  pintarMedidor,
  pintarPanel,
  pintarProblemas,
  pintarSenalesDelInforme,
  pintarVista,
  type Indice,
} from './pintar.ts';
import { activos, leerPaquetePropio } from './propios.ts';
import type { Voz } from './lectura.ts';

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
const panel = elemento<HTMLElement>('panel');
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
const fechaDelAnalisis = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' });
const botonDelInforme = elemento<HTMLButtonElement>('informe');
botonDelInforme.addEventListener('click', () => window.print());

/** true si lo analizado salió bien y está pintado: cambiar los paquetes lo deja atrás. */
let hayResultado = false;

function analizarYPintar(paquetes: readonly Paquete[], indice: Indice, vozDe: (paquete: string) => Voz): void {
  const elTexto = texto.value;
  const elGenero = genero.value;
  try {
    const r = analizar(elTexto, paquetes, { genero: elGenero });
    pintarCabeceraDelInforme(cabeceraDelInforme, r, paquetes, indice, fechaDelAnalisis.format(new Date()), nombreDeGenero(elGenero));
    pintarMedidor(medidor, r, vozDe, indice, nombreDeGenero(elGenero));
    pintarSenalesDelInforme(senalesDelInforme, r, elTexto, indice, import.meta.env.BASE_URL, location.href);
    panel.replaceChildren();
    panel.hidden = true;
    const hayAnalisis = r.tramo !== 'insuficiente';
    for (const parte of [leyenda, vista, desglose]) {
      parte.replaceChildren();
      parte.hidden = !hayAnalisis;
    }
    if (hayAnalisis) {
      pintarLeyenda(leyenda, indice, new Set(paquetes.map((p) => p.cabecera.nombre)));
      pintarVista(vista, elTexto, r.senales, indice, (indices) => pintarPanel(panel, indices.map((i) => r.senales[i]!), indice, import.meta.env.BASE_URL));
      pintarDesglose(desglose, r, paquetes, indice, import.meta.env.BASE_URL);
    }
    problemas.hidden = true;
    resultado.hidden = false;
    hayResultado = true;
    botonDelInforme.disabled = false;
    avisoDePaquetes.textContent = '';
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
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    analizarYPintar(losActivos(), indice, vozDe);
  });
}
