/**
 * Descarga el corpus de «administrativo» para la calibración (encargo 5.5):
 * disposiciones y anuncios del BOE de 2000 a 2021, y deja en
 * motor/corpus/administrativo/ un texto por documento y el manifiesto
 * motor/corpus/administrativo.manifiesto.json (sin texto). Se ejecuta a mano:
 *
 *   node herramientas/calibrar/descargar-administrativo.ts [--minutos N]   (desde motor/)
 *
 * Endpoints y su documentación (leída el 30/09/2026):
 * [DOC] GET https://www.boe.es/datosabiertos/api/boe/sumario/{AAAAMMDD}, con
 *    «Accept: application/json» — https://www.boe.es/datosabiertos/documentos/APIsumarioBOE.pdf
 *    (28/06/2024); «404 - La información solicitada no existe» (día sin BOE).
 *    FAQ, https://www.boe.es/datosabiertos/faq/boe.php: sumarios «Desde
 *    septiembre de 1960»; «Este sumario incluye para cada documento las
 *    direcciones URL en las que obtener los documentos publicados en los
 *    distintos formatos: PDF, XML y HTML.»
 * [DOC] El texto de cada documento, en su «url_html»
 *    (https://www.boe.es/diario_boe/txt.php?id=…): el robots.txt de
 *    www.boe.es veta «/diario_boe/xml.php?» y los ids que lista; red.ts lo lee
 *    y lo aplica a cada petición (RFC 9309), y los vetados se saltan y se
 *    cuentan (decisión de Antonio, parada 2 del 5.5). Extracción: boe.ts.
 * [DOC] Licencia, leída en origen en cada ejecución (si el literal no está,
 *    PARA): el aviso legal (https://www.boe.es/informacion/aviso_legal/index.php)
 *    y el art. 13 del texto refundido de la LPI consolidado
 *    (https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930).
 *
 * Muestra (decisiones de Antonio, paradas 1 y 2 del 5.5, y tras el piloto):
 *   · fechas de 2000 a 2021 en el orden de sha256("<semilla>|muestra|<fecha>");
 *     un sumario se lee cuando hace falta, y sus ítems entran en la cola de su
 *     subgénero en el orden de huella de su id;
 *   · POR TURNOS: un documento de disposición general, uno de resolución y uno
 *     de anuncio, en vuelta, hasta que CADA tramo del género tenga al menos
 *     MINIMO (100) documentos de CALIBRACIÓN con ningún subgénero por encima
 *     de TOPE (3/5, el 60 %) del tramo: lo que pase del tope se descarga, se
 *     cuenta y no entra (topeDeMezcla, boe.ts). Validación, igual, por su lado;
 *   · si se agota el tiempo: en cada tramo, la mezcla con tope si llega a 100;
 *     si no, la mezcla sin tope si llega a 100 (se declara); si no, entra lo
 *     que haya y calibrar.ts no escribe la celda (mínimo firmado de 100: el
 *     motor dirá «sin calibración» en ese tramo);
 *   · La mezcla NO es la proporción natural del BOE: se declara con las
 *     cifras de los sumarios leídos, y el subgénero de cada documento queda en
 *     el manifiesto (para recalibrar por subgénero en la v1.1);
 *   · 1 petición por segundo [PROPIO] y 30 minutos de red EN TOTAL, sumando
 *     ejecuciones y el piloto (motor/corpus/administrativo/fuente/registro.json).
 *     Lo ya descargado se guarda en fuente/ y no se vuelve a pedir.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { SUBGENEROS, clasificar, fechasDelPeriodo, itemsDelSumario, textoDelDocumento, topeDeMezcla, type ItemDelSumario, type Subgenero } from './boe.ts';
import { textoPlano } from './html.ts';
import { SEMILLA, TRAMOS, huella, medirLongitud, ordenDeMuestra, reparto, type Reparto } from './comun.ts';
import { nombreDeFichero, prepararManifiesto, type DocumentoDelManifiesto, type Manifiesto } from './manifiesto.ts';
import { Cliente, PresupuestoAgotado, VetadoPorRobots } from './red.ts';

const DESDE = '2000-01-01';
const HASTA = '2021-12-31';
const MINIMO = 100;
const TOPE: readonly [number, number] = [3, 5];
const PRESUPUESTO_TOTAL_MS = 30 * 60_000;
const API = 'https://www.boe.es/datosabiertos/api/boe/sumario/';
const AVISO_LEGAL = 'https://www.boe.es/informacion/aviso_legal/index.php';
const TRLPI = 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930';

const LITERALES_AVISO = [
  'conforme a la licencia tipo aprobada por Resolución de la Agencia de fecha 27 de junio de 2024',
  'permiten la reutilización de los documentos sometidos a ellas para fines comerciales y no comerciales',
  'la cita se realizará de la siguiente manera: "Basado en datos de la Agencia Estatal Boletín Oficial del Estado"',
];
const LITERAL_ART_13 =
  'No son objeto de propiedad intelectual las disposiciones legales o reglamentarias y sus correspondientes proyectos, las resoluciones de los órganos jurisdiccionales y los actos, acuerdos, deliberaciones y dictámenes de los organismos públicos, así como las traducciones oficiales de todos los textos anteriores.';

/** Revisados a mano, texto extraído frente a la página (30/09/2026). */
const REVISADOS_A_MANO = [
  'BOE-A-2010-3996 (disposición general, sección I: 38 bloques, 38 líneas, firmas al final)',
  'BOE-A-2010-4013 (resolución, sección III: 6 bloques, 6 líneas)',
  'BOE-A-2010-4003 (resolución, sección II.B: 87 bloques, 86 líneas; la que falta es el aviso de imágenes, quitado a propósito)',
  'BOE-B-2010-8866 (anuncio, sección V.A: formulario <dl> anidado; 81 bloques, 71 líneas: los 10 <dd> que solo contienen otro <dl> no tienen texto propio)',
  'BOE-B-2010-8934 (anuncio, sección V.B: 3 bloques, 3 líneas)',
  'y en la muestra: BOE-A-2000-1001 (disposición general, sección I: 73 bloques con cierre y 73 líneas, iguales y en orden; las filas de su tabla, con barras; termina en la firma, como el último <p>)',
  'BOE-A-2010-14902 (resolución, sección II.B: la tabla de aspirantes, una fila por línea con barras, fuera de la prosa)',
  'BOE-B-2010-33237 (anuncio, sección V.A: formulario <dl>; 83 bloques, 73 líneas; termina en la firma, como el último <p>)',
];

const CORPUS = fileURLToPath(new URL('../../corpus/administrativo/', import.meta.url));
const FUENTE = `${CORPUS}fuente/`;
const MANIFIESTO = fileURLToPath(new URL('../../corpus/administrativo.manifiesto.json', import.meta.url));
const REGISTRO = `${FUENTE}registro.json`;

const argMinutos = process.argv.indexOf('--minutos');
const minutos = argMinutos >= 0 ? Number(process.argv[argMinutos + 1]) : Infinity;

interface Registro {
  ejecuciones: { fecha: string; peticiones: number; bytes: number; segundos: number }[];
}
mkdirSync(`${FUENTE}sumarios`, { recursive: true });
mkdirSync(`${FUENTE}html`, { recursive: true });
const registro: Registro = existsSync(REGISTRO) ? (JSON.parse(readFileSync(REGISTRO, 'utf8')) as Registro) : { ejecuciones: [] };
const gastadoMs = registro.ejecuciones.reduce((s, e) => s + e.segundos * 1000, 0);
const cliente = new Cliente({
  agente: 'RadiografIA-calibracion',
  contacto: 'https://github.com/ablanquez/radiografia',
  pausaMs: 1000,
  presupuestoMs: Math.max(0, Math.min(PRESUPUESTO_TOTAL_MS - gastadoMs, minutos * 60_000)),
});
const guardarRegistro = () => {
  registro.ejecuciones.push({
    fecha: new Date().toISOString(),
    peticiones: cliente.peticiones,
    bytes: cliente.bytes,
    segundos: Math.round(cliente.transcurridoMs / 1000),
  });
  writeFileSync(REGISTRO, JSON.stringify(registro, null, 2) + '\n', 'utf8');
};

/** Lo que haya en caché o, si no, lo pide y lo guarda (solo las respuestas 200 y, de los sumarios, los 404). */
async function cacheado(ruta: string, url: string, cabeceras: Record<string, string> = {}): Promise<{ estado: number; cuerpo: Buffer }> {
  if (existsSync(ruta)) return { estado: 200, cuerpo: readFileSync(ruta) };
  if (existsSync(`${ruta}.404`)) return { estado: 404, cuerpo: Buffer.alloc(0) };
  const r = await cliente.obtener(url, cabeceras);
  if (r.estado === 200) writeFileSync(ruta, r.cuerpo);
  else if (r.estado === 404) writeFileSync(`${ruta}.404`, '');
  return r;
}

// ── Licencia, leída en origen ──
const aviso = await cacheado(`${FUENTE}aviso-legal.html`, AVISO_LEGAL);
const trlpi = await cacheado(`${FUENTE}trlpi.html`, TRLPI);
if (aviso.estado !== 200 || trlpi.estado !== 200) throw new Error(`PARA: aviso legal ${aviso.estado}, TRLPI ${trlpi.estado}`);
const planoAviso = textoPlano(aviso.cuerpo.toString('utf8'));
const planoTrlpi = textoPlano(trlpi.cuerpo.toString('utf8'));
for (const l of LITERALES_AVISO) if (!planoAviso.includes(l)) throw new Error(`PARA: «${l}» no está en el aviso legal del BOE`);
if (!planoTrlpi.includes(LITERAL_ART_13)) throw new Error('PARA: el art. 13 no dice lo esperado en el TRLPI consolidado');

// ── Muestra por turnos ──
const fechas = ordenDeMuestra(SEMILLA, fechasDelPeriodo(DESDE, HASTA), (f) => f);
let siguienteFecha = 0;
const colas = new Map<Subgenero, ItemDelSumario[]>(SUBGENEROS.map((s) => [s, []]));
const candidatosNaturales = new Map<Subgenero, number>(SUBGENEROS.map((s) => [s, 0]));
const fuera: Record<string, number> = {};
const descartados: Record<string, number> = {};
const suma = (r: Record<string, number>, motivo: string) => (r[motivo] = (r[motivo] ?? 0) + 1);
let sumariosLeidos = 0;
let diasSinBoe = 0;
let vetados = 0;
let avisosDeImagen = 0;
let conAvisoDeImagen = 0;
let agotado: string | null = null;

interface Descargado {
  id: string;
  subgenero: Subgenero;
  seccion: string;
  fecha: string;
  paginas: number | null;
  texto: string;
  palabrasProsa: number;
  tramo: TramoDeCalibracion;
  reparto: Reparto;
  avisosDeImagen: number;
}
const descargados: Descargado[] = [];
const cuenta = (s: Subgenero, t: TramoDeCalibracion, r: Reparto) => descargados.filter((d) => d.subgenero === s && d.tramo === t && d.reparto === r).length;
const cuentas = (t: TramoDeCalibracion, r: Reparto) => Object.fromEntries(SUBGENEROS.map((s) => [s, cuenta(s, t, r)])) as Record<Subgenero, number>;
const sumar = (c: Record<Subgenero, number>) => SUBGENEROS.reduce((n, s) => n + c[s], 0);
/** El tramo ya tiene MINIMO documentos de calibración con el tope aplicado. */
const cumpleConTope = (t: TramoDeCalibracion) => sumar(topeDeMezcla(cuentas(t, 'calibracion'), TOPE)) >= MINIMO;

async function leerSiguienteSumario(): Promise<boolean> {
  if (siguienteFecha >= fechas.length) return false;
  const fecha = fechas[siguienteFecha++]!;
  const r = await cacheado(`${FUENTE}sumarios/${fecha}.json`, `${API}${fecha}`, { Accept: 'application/json' });
  if (r.estado === 404) {
    diasSinBoe++;
    return true;
  }
  if (r.estado !== 200) throw new Error(`sumario ${fecha}: HTTP ${r.estado}`);
  sumariosLeidos++;
  const items = ordenDeMuestra(SEMILLA, itemsDelSumario(JSON.parse(r.cuerpo.toString('utf8')), fecha), (i) => i.id);
  for (const item of items) {
    const c = clasificar(item);
    if ('fuera' in c) {
      suma(fuera, c.fuera);
      continue;
    }
    candidatosNaturales.set(c.subgenero, candidatosNaturales.get(c.subgenero)! + 1);
    colas.get(c.subgenero)!.push(item);
  }
  return true;
}

async function descargarUno(s: Subgenero): Promise<'hecho' | 'sin-candidatos'> {
  const cola = colas.get(s)!;
  while (cola.length === 0) if (!(await leerSiguienteSumario())) return 'sin-candidatos';
  const item = cola.shift()!;
  let r: { estado: number; cuerpo: Buffer };
  try {
    r = await cacheado(`${FUENTE}html/${nombreDeFichero(item.id).replace(/\.txt$/, '.html')}`, item.urlHtml);
  } catch (e) {
    if (e instanceof VetadoPorRobots) {
      vetados++;
      return 'hecho';
    }
    throw e;
  }
  if (r.estado !== 200) {
    suma(descartados, `HTTP ${r.estado}`);
    return 'hecho';
  }
  const extraido = textoDelDocumento(r.cuerpo.toString('utf8'));
  if (extraido.problemas.length > 0) {
    for (const p of extraido.problemas) suma(descartados, `extracción: ${p}`);
    return 'hecho';
  }
  avisosDeImagen += extraido.avisosDeImagen;
  if (extraido.avisosDeImagen > 0) conAvisoDeImagen++;
  const { palabrasProsa, tramo } = medirLongitud(extraido.texto);
  if (tramo === null) {
    suma(descartados, 'menos de 100 palabras de prosa');
    return 'hecho';
  }
  descargados.push({
    id: item.id,
    subgenero: s,
    seccion: item.seccion,
    fecha: `${item.fecha.slice(0, 4)}-${item.fecha.slice(4, 6)}-${item.fecha.slice(6)}`,
    paginas: item.paginas,
    texto: extraido.texto,
    palabrasProsa,
    tramo,
    reparto: reparto(SEMILLA, item.id),
    avisosDeImagen: extraido.avisosDeImagen,
  });
  return 'hecho';
}

const sinCandidatos = new Set<Subgenero>();
try {
  for (;;) {
    if (TRAMOS.every(cumpleConTope)) break;
    const activos = SUBGENEROS.filter((s) => !sinCandidatos.has(s));
    if (activos.length === 0) break;
    for (const s of activos) if ((await descargarUno(s)) === 'sin-candidatos') sinCandidatos.add(s);
  }
} catch (e) {
  if (!(e instanceof PresupuestoAgotado)) {
    guardarRegistro();
    throw e;
  }
  agotado = e.message;
}
guardarRegistro();

// ── La mezcla de cada tramo: con tope si llega a MINIMO; si no, sin tope (se declara) ──
type Modo = 'con tope' | 'sin tope' | 'insuficiente';
const usados: Descargado[] = [];
const modo = {} as Record<TramoDeCalibracion, Modo>;
for (const t of TRAMOS) {
  modo[t] = cumpleConTope(t) ? 'con tope' : sumar(cuentas(t, 'calibracion')) >= MINIMO ? 'sin tope' : 'insuficiente';
  for (const r of ['calibracion', 'validacion'] as const) {
    const limite = modo[t] === 'con tope' ? topeDeMezcla(cuentas(t, r), TOPE) : cuentas(t, r);
    for (const s of SUBGENEROS) {
      const todos = descargados.filter((d) => d.subgenero === s && d.tramo === t && d.reparto === r);
      usados.push(...todos.slice(0, limite[s]));
      for (let i = limite[s]; i < todos.length; i++) suma(descartados, `por encima del tope de ${TOPE[0]}/${TOPE[1]} de su tramo`);
    }
  }
}

rmSync(`${CORPUS}textos`, { recursive: true, force: true });
mkdirSync(`${CORPUS}textos`, { recursive: true });
const textos = new Map<string, string>();
const lista: DocumentoDelManifiesto[] = [];
for (const d of usados) {
  writeFileSync(`${CORPUS}textos/${nombreDeFichero(d.id)}`, d.texto, 'utf8');
  textos.set(d.id, d.texto);
  lista.push({
    id: d.id,
    sha256: huella(d.texto),
    palabrasProsa: d.palabrasProsa,
    tramo: d.tramo,
    subgenero: d.subgenero,
    seccion: d.seccion,
    fecha: d.fecha,
    paginas: d.paginas,
    ...(d.avisosDeImagen > 0 ? { avisosDeImagen: d.avisosDeImagen } : {}),
  });
}

// ── Cuentas por subgénero y tramo, con porcentajes ──
const NOMBRE: Readonly<Record<Subgenero, string>> = { 'disposicion-general': 'disposición general', resolucion: 'resolución', anuncio: 'anuncio' };
const pct = (n: number, d: number) => (d === 0 ? '—' : `${((100 * n) / d).toFixed(1).replace('.', ',')} %`);
const usadosEn = (s: Subgenero, t: TramoDeCalibracion, r: Reparto) => usados.filter((d) => d.subgenero === s && d.tramo === t && d.reparto === r).length;
const MODO: Readonly<Record<Modo, string>> = {
  'con tope': `con tope: ningún subgénero pasa de ${TOPE[0]}/${TOPE[1]}`,
  'sin tope': `SIN tope: el de ${TOPE[0]}/${TOPE[1]} no se alcanzó en el presupuesto; se acepta la mezcla con ≥ ${MINIMO}`,
  insuficiente: `menos de ${MINIMO} de calibración: la celda NO existe (el motor dirá «sin calibración»)`,
};
const composicion = TRAMOS.map((t) => {
  const parte = (r: Reparto) => {
    const total = SUBGENEROS.reduce((n, s) => n + usadosEn(s, t, r), 0);
    return `${total} (${SUBGENEROS.map((s) => `${NOMBRE[s]} ${usadosEn(s, t, r)}, ${pct(usadosEn(s, t, r), total)}`).join('; ')})`;
  };
  const antes = SUBGENEROS.map((s) => `${NOMBRE[s]} ${cuenta(s, t, 'calibracion')} + ${cuenta(s, t, 'validacion')}`).join('; ');
  return `${t} — ${MODO[modo[t]]}. Calibración ${parte('calibracion')}. Validación ${parte('validacion')}. Descargados antes del tope (calibración + validación): ${antes}.`;
});
const natural = `${SUBGENEROS.map((s) => candidatosNaturales.get(s)).join('/')} en ${sumariosLeidos} sumarios`;
const fraseNatural = `La mezcla no es la proporción natural del BOE (${natural}: disposición general/resolución/anuncio).`;
const excluidos = Object.entries(fuera).map(([m, n]) => `${m}: ${n}`).join('; ');
const hayTC = Object.keys(fuera).some((m) => /constitucional/i.test(m));
const total = registro.ejecuciones.reduce((a, e) => ({ p: a.p + e.peticiones, b: a.b + e.bytes, s: a.s + e.segundos }), { p: 0, b: 0, s: 0 });
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');
const INCIDENCIA_XML =
  '30/09/2026, diseño de la parada 1: una petición a https://www.boe.es/diario_boe/xml.php?id=BOE-A-2010-4000 ANTES de leer el robots.txt, que veta xml.php. No se repitió; la herramienta lee robots.txt antes de cada petición.';

const porTramo = Object.fromEntries(TRAMOS.map((t) => [t, lista.filter((d) => d.tramo === t).length])) as Manifiesto['n']['porTramo'];
const manifiesto = prepararManifiesto(
  {
    genero: 'administrativo',
    fuente: {
      nombre: 'BOE (Agencia Estatal Boletín Oficial del Estado): API de sumarios y texto HTML de cada documento',
      url: 'https://www.boe.es/datosabiertos/',
      ficheros: [
        { nombre: 'aviso legal (condiciones de reutilización)', url: AVISO_LEGAL, bytes: aviso.cuerpo.length, sha256: sha(aviso.cuerpo) },
        { nombre: 'TRLPI consolidado (art. 13)', url: TRLPI, bytes: trlpi.cuerpo.length, sha256: sha(trlpi.cuerpo) },
      ],
    },
    licencia: {
      nombre: 'Art. 13 LPI y licencia tipo del BOE de 27/06/2024',
      literal: [`TRLPI, art. 13: «${LITERAL_ART_13}»`, ...LITERALES_AVISO.map((l) => `aviso legal del BOE: «…${l}…»`)],
      url: AVISO_LEGAL,
      estado: 'verificada en origen: aviso legal y art. 13 del TRLPI consolidado, leídos en cada ejecución',
      atribucion: 'Basado en datos de la Agencia Estatal Boletín Oficial del Estado (https://www.boe.es)',
    },
    documentacion: [
      { que: 'API de sumarios del BOE', url: 'https://www.boe.es/datosabiertos/documentos/APIsumarioBOE.pdf' },
      { que: 'FAQ de datos abiertos: sumarios desde 1960, URL de PDF, XML y HTML por documento', url: 'https://www.boe.es/datosabiertos/faq/boe.php' },
      { que: 'robots.txt de www.boe.es (veta xml.php y ids concretos de txt.php)', url: 'https://www.boe.es/robots.txt' },
      { que: 'protocolo de exclusión de robots', url: 'https://www.rfc-editor.org/rfc/rfc9309' },
      { que: 'condiciones de reutilización', url: AVISO_LEGAL },
      { que: 'art. 13 LPI (TRLPI consolidado)', url: TRLPI },
    ],
    filtros: [
      `fechas de ${DESDE} a ${HASTA}, en el orden de sha256("semilla|muestra|fecha"); días sin BOE (404), saltados`,
      'subgénero por sección: 1 → disposición general; 2A, 2B y 3 → resolución; 5A y 5B → anuncio',
      'fuera: sección 4 (Administración de Justicia), 5C (anuncios particulares: no los cubre el art. 13 LPI), Tribunal Constitucional y cualquier otra sección',
      'fuera: epígrafes de tratados o acuerdos internacionales y títulos con «traducción» (corpus.md)',
      'texto: el bloque #textoxslt de url_html (txt.php); xml.php, vetado por robots.txt; los ids vetados por robots.txt, saltados',
      'fuera: documentos con problemas de extracción (sin bloque, sin cierre, entidades sin decodificar, texto perdido) y los de menos de 100 palabras de prosa',
      `por turnos entre subgéneros hasta que cada tramo tiene ${MINIMO} documentos de calibración con ningún subgénero por encima de ${TOPE[0]}/${TOPE[1]} del tramo; lo que pasa del tope, fuera`,
    ],
    unidad: 'disposición o anuncio del BOE (un identificador BOE-A o BOE-B)',
    descarga: {
      fecha: new Date().toISOString().slice(0, 10),
      herramienta: 'motor/herramientas/calibrar/descargar-administrativo.ts',
      peticiones: total.p,
      bytes: total.b,
      segundos: total.s,
      notas: [
        `${registro.ejecuciones.length} ejecuciones; en caché, en motor/corpus/administrativo/fuente/: ${readdirSync(`${FUENTE}sumarios`).length} sumarios y ${readdirSync(`${FUENTE}html`).length} páginas`,
        ...(agotado === null ? [] : [`presupuesto de red agotado: ${agotado}`]),
      ],
    },
    verificaciones: [
      { que: 'extracción del texto revisada a mano, un documento de cada subgénero', resultado: REVISADOS_A_MANO.join('; ') },
      {
        que: 'extracción, en todos los documentos descargados: vacíos o truncados',
        resultado:
          Object.entries(descartados)
            .filter(([m]) => m.startsWith('extracción:'))
            .map(([m, n]) => `${m.replace('extracción: ', '')}: ${n}`)
            .join('; ') || 'ninguno',
      },
      { que: 'avisos del BOE de imágenes que solo están en el PDF (el documento se conserva, sin ese contenido)', resultado: `${conAvisoDeImagen} documentos, ${avisosDeImagen} avisos` },
      { que: 'documentos vetados por robots.txt (saltados)', resultado: String(vetados) },
      { que: `proporción natural: candidatos por subgénero (disposición general/resolución/anuncio) en los sumarios leídos (${diasSinBoe} días sin BOE)`, resultado: natural },
      { que: 'documentos por subgénero y tramo, con porcentajes', resultado: composicion.join(' ') },
      { que: 'excluidos por el filtro, en los sumarios leídos', resultado: excluidos + (hayTC ? '' : '; Tribunal Constitucional: ninguna sección suya en los sumarios leídos') },
    ],
    incidencias: [INCIDENCIA_XML],
    notas: [
      `«administrativo» es una MEZCLA de tres subgéneros (disposición general, resolución y anuncio) con percentiles conjuntos, descargados por turnos. El subgénero de cada documento queda en el manifiesto para poder recalibrar por subgénero en la v1.1.`,
      fraseNatural,
      ...composicion.map((c) => `Por tramo: ${c}`),
      `Excluidos por el filtro: ${excluidos}${hayTC ? '' : '; Tribunal Constitucional: ninguna sección suya en los sumarios leídos'}.`,
      `Con aviso del BOE de imágenes que solo están en el PDF, conservados sin ese contenido: ${conAvisoDeImagen} documentos de los descargados.`,
      `Vetados por robots.txt: ${vetados}. Incidencia: ${INCIDENCIA_XML}`,
    ],
    n: { documentos: lista.length, descartados: { ...descartados, ...Object.fromEntries(Object.entries(fuera).map(([m, n]) => [`fuera del filtro: ${m}`, n])), 'vetados por robots.txt': vetados }, porTramo },
    documentos: lista,
  },
  textos,
);
writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n', 'utf8');

console.log(`administrativo: ${lista.length} documentos usados de ${descargados.length} con tramo`);
console.log(`  ${fraseNatural} (${diasSinBoe} días sin BOE)`);
for (const l of composicion) console.log(`  ${l}`);
console.log(`  descartados: ${JSON.stringify(descartados)}`);
console.log(`  fuera del filtro: ${JSON.stringify(fuera)}; vetados por robots.txt: ${vetados}; con aviso de imágenes: ${conAvisoDeImagen}`);
console.log(`  red, esta ejecución: ${cliente.peticiones} peticiones, ${cliente.bytes} bytes, ${Math.round(cliente.transcurridoMs / 1000)} s; en total: ${total.p} peticiones, ${Math.round(total.b / 1e6)} MB, ${total.s} s de ${PRESUPUESTO_TOTAL_MS / 1000}`);
if (agotado !== null) console.log(`  ⚠️ ${agotado}`);
for (const t of TRAMOS) if (modo[t] !== 'con tope') console.log(`  ⚠️ ${t}: ${MODO[modo[t]]}`);
