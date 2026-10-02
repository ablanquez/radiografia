/**
 * La pantalla mínima (encargo 6.2, c): el script de web/src/pages/index.astro.
 *
 *   1. Al arrancar, carga y valida los dos paquetes (cargar.ts, con el
 *      validarPaquete de navegador.ts: el standalone, sin Ajv). Si falla,
 *      dice qué paquete y por qué, y el botón se queda desactivado.
 *   2. Llena el selector con los géneros de la calibración de RadiografIA
 *      (generos.ts), con «general» por defecto.
 *   3. Al pulsar «Pon tu texto a contraluz» (no al teclear), analiza el texto
 *      con los dos paquetes, siempre activos en el 6.2 (elegirlos es del punto
 *      8), y pinta el medidor, la leyenda, la vista y el desglose
 *      (pintar.ts). El textarea sigue editable, y volver a pulsar reanaliza y
 *      sustituye lo pintado. Con menos de 100 palabras de prosa, «texto
 *      insuficiente» y nada más: el motor no analiza.
 *   4. Los dos botones de los ejemplos (encargo 6.3, a; ejemplos.ts) ponen su
 *      texto en el textarea y el género de los ejemplos en el selector, y no
 *      analizan. Se activan con los paquetes, porque el selector no tiene
 *      géneros hasta entonces [PROPIO].
 *
 * Sin red salvo los fetch de los paquetes y de los ejemplos; sin librerías de
 * UI. Las cadenas de la interfaz, en web/src/textos.ts (encargo 6.3, b); la
 * de `elemento` no lo es: es un fallo de programación que va a la consola.
 * [DOC] https://docs.astro.build/en/guides/client-side-scripts/ — «All scripts
 *    are TypeScript by default»; los imports se empaquetan y el script queda
 *    como type="module" (de ahí el await de primer nivel).
 */
import { analizar, validarPaquete, type Paquete } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import { cargarPaquetes } from './cargar.ts';
import { cargarEjemplo, GENERO_DE_LOS_EJEMPLOS, type Ejemplo } from './ejemplos.ts';
import { GENERO_POR_DEFECTO, generosDe, nombreDeGenero } from './generos.ts';
import { indexar, pintarDesglose, pintarLeyenda, pintarMedidor, pintarPanel, pintarProblemas, pintarVista, type Indice } from './pintar.ts';

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

function analizarYPintar(paquetes: readonly Paquete[], indice: Indice): void {
  const elTexto = texto.value;
  const elGenero = genero.value;
  try {
    const r = analizar(elTexto, paquetes, { genero: elGenero });
    pintarMedidor(medidor, r, nombreDeGenero(elGenero));
    panel.replaceChildren();
    panel.hidden = true;
    const hayAnalisis = r.tramo !== 'insuficiente';
    for (const parte of [leyenda, vista, desglose]) {
      parte.replaceChildren();
      parte.hidden = !hayAnalisis;
    }
    if (hayAnalisis) {
      pintarLeyenda(leyenda, indice);
      pintarVista(vista, elTexto, r.senales, indice, (indices) => pintarPanel(panel, indices.map((i) => r.senales[i]!), indice, import.meta.env.BASE_URL));
      pintarDesglose(desglose, r, paquetes, indice, import.meta.env.BASE_URL);
    }
    problemas.hidden = true;
    resultado.hidden = false;
  } catch (fallo) {
    pintarProblemas(problemas, [{ paquete: textos.EL_ANALISIS, mensajes: [(fallo as Error).message] }]);
  }
}

const carga = await cargarPaquetes(import.meta.env.BASE_URL, (url) => fetch(url), validarPaquete);
if (carga.paquetes === null) {
  estado.textContent = textos.SIN_PAQUETES;
  pintarProblemas(problemas, carga.problemas);
} else {
  const paquetes = carga.paquetes;
  const indice = indexar(paquetes);
  for (const clave of generosDe(paquetes)) {
    const opcion = document.createElement('option');
    opcion.value = clave;
    opcion.textContent = nombreDeGenero(clave);
    opcion.selected = clave === GENERO_POR_DEFECTO;
    genero.append(opcion);
  }
  genero.disabled = false;
  boton.disabled = false;
  for (const [botonDeEjemplo, ejemplo] of botonesDeEjemplo) {
    botonDeEjemplo.disabled = false;
    botonDeEjemplo.addEventListener('click', async () => {
      const carga = await cargarEjemplo(import.meta.env.BASE_URL, ejemplo, (url) => fetch(url));
      if (carga.texto === null) {
        estadoDelEjemplo.textContent = carga.problema;
        return;
      }
      texto.value = carga.texto;
      genero.value = GENERO_DE_LOS_EJEMPLOS;
      estadoDelEjemplo.textContent = '';
    });
  }
  estado.textContent = textos.paquetesCargados(paquetes.map((p) => `${p.cabecera.nombre} ${p.cabecera.version}`));
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    analizarYPintar(paquetes, indice);
  });
}
