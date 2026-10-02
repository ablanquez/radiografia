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
 *
 * Sin red salvo los dos fetch de los paquetes; sin librerías de UI.
 * [DOC] https://docs.astro.build/en/guides/client-side-scripts/ — «All scripts
 *    are TypeScript by default»; los imports se empaquetan y el script queda
 *    como type="module" (de ahí el await de primer nivel).
 */
import { analizar, validarPaquete, type Paquete } from '@radiografia/motor/navegador';
import { cargarPaquetes } from './cargar.ts';
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
      pintarVista(vista, elTexto, r.senales, indice, (indices) => pintarPanel(panel, indices.map((i) => r.senales[i]!), indice));
      pintarDesglose(desglose, r, paquetes);
    }
    problemas.hidden = true;
    resultado.hidden = false;
  } catch (fallo) {
    pintarProblemas(problemas, [{ paquete: 'el análisis', mensajes: [(fallo as Error).message] }]);
  }
}

const carga = await cargarPaquetes(import.meta.env.BASE_URL, (url) => fetch(url), validarPaquete);
if (carga.paquetes === null) {
  estado.textContent = 'No se puede analizar: falta algún paquete de reglas.';
  pintarProblemas(problemas, carga.problemas);
} else {
  const paquetes = carga.paquetes;
  const indice = indexar(paquetes);
  for (const clave of generosDe(paquetes[0]!)) {
    const opcion = document.createElement('option');
    opcion.value = clave;
    opcion.textContent = nombreDeGenero(clave);
    opcion.selected = clave === GENERO_POR_DEFECTO;
    genero.append(opcion);
  }
  genero.disabled = false;
  boton.disabled = false;
  estado.textContent = `Paquetes cargados y validados: ${paquetes.map((p) => `${p.cabecera.nombre} ${p.cabecera.version}`).join(' y ')}.`;
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    analizarYPintar(paquetes, indice);
  });
}
