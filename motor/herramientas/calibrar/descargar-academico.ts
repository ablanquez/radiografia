/**
 * Descarga el corpus de «academico» para la calibración (encargo 5.5): el CSIC
 * Spanish Corpus de Zenodo (artículos de revistas.csic.es), leído por rangos
 * de bytes, y deja en motor/corpus/academico/ un texto por unidad y el
 * manifiesto motor/corpus/academico.manifiesto.json (sin texto). Se ejecuta
 * a mano:
 *
 *   NODE_EXTRA_CA_CERTS=corpus/academico/fuente/harica-geant-tls-rsa-1.pem \
 *     node herramientas/calibrar/descargar-academico.ts [--minutos N] [--trozos N]   (desde motor/)
 *
 * [PROPIO, 30/09/2026] revistas.csic.es no manda su certificado intermedio
 *    (Node: UNABLE_TO_VERIFY_LEAF_SIGNATURE). Se completa la cadena como un
 *    navegador: el intermedio que publica la autoridad en el AIA del
 *    certificado (http://crt.harica.gr/HARICA-GEANT-TLS-R1.cer, «GEANT TLS
 *    RSA 1»), comprobado antes: lo firma «HARICA TLS RSA Root CA 2021», del
 *    almacén de Node, y él firma el de *.revistas.csic.es. La verificación de
 *    TLS no se desactiva.
 *
 * Endpoints y su documentación (leída el 30/09/2026):
 * [DOC] Registro: https://zenodo.org/records/7313126 (su página; la API
 *    /api/records/7313126 la veta el robots.txt de zenodo.org, que solo deja
 *    «/api/records/*\/files» y pide «Crawl-delay: 10»; red.ts lo cumple). El
 *    fichero: https://zenodo.org/api/records/7313126/files/csic_es.txt/content
 *    (929.127.061 bytes). Descripción del registro: «Documents are separated
 *    by single new lines»; «We license the actual packaging of these data
 *    under a Attribution 4.0 International License».
 * [DOC] Licencia en origen: https://revistas.csic.es/mas.html («Salvo
 *    indicación contraria, todos los contenidos de la edición electrónica se
 *    distribuyen bajo una licencia de uso y distribución "Creative Commons
 *    Reconocimiento 4.0 Internacional" (CC BY 4.0)») y la condición de
 *    https://revistas.csic.es/mas_en.html sobre la descarga sistemática DE LA
 *    PLATAFORMA (aquí no se descarga nada de ella: solo se leen esas dos
 *    páginas). Si un literal no está, PARA.
 * [DOC] RFC 9110 § 14: Range, 206 y Content-Range (csic.ts).
 *
 * Muestra (decisiones de Antonio: parada 1 y parada de narrativa del 5.5):
 *   · si el fichero admite rangos (sondeo con «Range: bytes=0-0»), se leen
 *     TROZOS de TAMANO bytes que empiezan en bytes elegidos por huella, y de
 *     cada trozo solo los DOCUMENTOS COMPLETOS, entre su primer y su último
 *     separador; si no,
 *     PARA con la estimación de tiempo;
 *   · de cada trozo, como mucho TOPE_POR_TROZO unidades, las primeras en el
 *     orden de huella de su id, para repartir la muestra por el fichero
 *     [PROPIO]; el id es «csic-<byte donde empieza el documento>»;
 *   · [HALLAZGO, 30/09/2026] El fichero NO es un documento por línea: es una
 *     frase por línea, y los documentos van separados por una LÍNEA EN BLANCO
 *     (el primer trozo: 1.194 líneas de 179 caracteres de mediana y 9 líneas
 *     en blanco en 256 KiB; 929 MB entre 30.929 documentos son unos 30 KB por
 *     documento). «Documents are separated by single new lines» quiere decir
 *     eso. El separador es «\n\n» (unidadesCompletas); el texto de cada
 *     documento conserva sus saltos de línea (una frase por línea);
 *   · [HALLAZGO, 30/09/2026] Parte del corpus viene de OCR («informaci6n»,
 *     «c1usters», «ora•»): cada unidad lleva su señal (ocrPorMil, csic.ts) en
 *     el manifiesto. NO se filtra: decisión pendiente de Antonio;
 *   · un documento de 100-299 o 300-599 va entero a su tramo; uno de 600+, por
 *     turnos al tramo que menos lleva (tramoPorTurno), y en 100-299 o 300-599
 *     como FRAGMENTO de frases completas (fragmento): un documento, una unidad;
 *   · hasta que cada tramo tenga MINIMO unidades de calibración o se agote el
 *     tiempo: 30 minutos EN TOTAL, sumando ejecuciones (fuente/registro.json);
 *     lo ya descargado, en caché.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { SEMILLA, TRAMOS, huella, medirLongitud, ordenDeMuestra, reparto, type Reparto } from './comun.ts';
import { fragmento, inicioDelTrozo, ocrPorMil, tramoPorTurno, unidadesCompletas } from './csic.ts';
import { textoPlano } from './html.ts';
import { nombreDeFichero, prepararManifiesto, type DocumentoDelManifiesto, type Manifiesto } from './manifiesto.ts';
import { Cliente, PresupuestoAgotado, type Respuesta } from './red.ts';

const MINIMO = 100;
const TAMANO = 256 * 1024;
const TOPE_POR_TROZO = 4;
const PRESUPUESTO_TOTAL_MS = 30 * 60_000;
const TOTAL_ESPERADO = 929_127_061;
const REGISTRO_ZENODO = 'https://zenodo.org/records/7313126';
const README = 'https://zenodo.org/api/records/7313126/files/README.md/content';
const FICHERO = 'https://zenodo.org/api/records/7313126/files/csic_es.txt/content';
const CSIC_ES = 'https://revistas.csic.es/mas.html';
const CSIC_EN = 'https://revistas.csic.es/mas_en.html';

const LITERALES_ZENODO = [
  'We license the actual packaging of these data under a Attribution 4.0 International License',
  'Documents are separated by single new lines',
];
const LITERAL_CSIC_ES =
  'Salvo indicación contraria, todos los contenidos de la edición electrónica se distribuyen bajo una licencia de uso y distribución "Creative Commons Reconocimiento 4.0 Internacional" (CC BY 4.0)';
const LITERAL_CSIC_CITA =
  'Los originales publicados en las ediciones impresa y electrónica de esta Revista son propiedad del Consejo Superior de Investigaciones Científicas, siendo necesario citar la procedencia en cualquier reproducción parcial o total.';
const LITERAL_CSIC_EN =
  'Unless permission is granted, widespread or systematic downloading of files from the Editorial Platform Revistas CSIC to other external databases is not permitted';

const CORPUS = fileURLToPath(new URL('../../corpus/academico/', import.meta.url));
const FUENTE = `${CORPUS}fuente/`;
const MANIFIESTO = fileURLToPath(new URL('../../corpus/academico.manifiesto.json', import.meta.url));
const REGISTRO = `${FUENTE}registro.json`;

const argumento = (nombre: string) => {
  const i = process.argv.indexOf(nombre);
  return i >= 0 ? Number(process.argv[i + 1]) : Infinity;
};
const minutos = argumento('--minutos');
const maxTrozos = argumento('--trozos');

interface Registro {
  ejecuciones: { fecha: string; peticiones: number; bytes: number; segundos: number; nota?: string }[];
}
mkdirSync(`${FUENTE}trozos`, { recursive: true });
const registro: Registro = existsSync(REGISTRO) ? (JSON.parse(readFileSync(REGISTRO, 'utf8')) as Registro) : { ejecuciones: [] };
const gastadoMs = registro.ejecuciones.reduce((s, e) => s + e.segundos * 1000, 0);
const cliente = new Cliente({
  agente: 'RadiografIA-calibracion',
  contacto: 'https://github.com/ablanquez/radiografia',
  pausaMs: 1000,
  presupuestoMs: Math.max(0, Math.min(PRESUPUESTO_TOTAL_MS - gastadoMs, minutos * 60_000)),
});
let registrada = false;
const guardarRegistro = () => {
  if (registrada) return;
  registrada = true;
  registro.ejecuciones.push({ fecha: new Date().toISOString(), peticiones: cliente.peticiones, bytes: cliente.bytes, segundos: Math.round(cliente.transcurridoMs / 1000) });
  writeFileSync(REGISTRO, JSON.stringify(registro, null, 2) + '\n', 'utf8');
};
// Una ejecución que para (PARA, error de red…) también deja su tiempo en el registro: cuenta para los 30 minutos.
process.once('exit', guardarRegistro);
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');
/** Para buscar un literal en una página: sin comillas y sin el espacio que deja un enlace antes de un signo, con el espacio colapsado. */
const normalizar = (s: string) =>
  s
    .replace(/[“”«»"]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/ ([,.;:)])/g, '$1');

async function pagina(nombre: string, url: string): Promise<Buffer> {
  const ruta = `${FUENTE}${nombre}`;
  if (existsSync(ruta)) return readFileSync(ruta);
  const r = await cliente.obtener(url);
  if (r.estado !== 200) throw new Error(`PARA: ${url}: HTTP ${r.estado}`);
  writeFileSync(ruta, r.cuerpo);
  return r.cuerpo;
}

// ── Licencia y descripción, leídas en origen ──
if (!existsSync(`${FUENTE}revistas-csic-mas.html`) && process.env['NODE_EXTRA_CA_CERTS'] === undefined) {
  throw new Error('PARA: revistas.csic.es no manda su certificado intermedio; ejecutar con NODE_EXTRA_CA_CERTS=corpus/academico/fuente/harica-geant-tls-rsa-1.pem (ver la cabecera)');
}
const registroZenodo = await pagina('zenodo-7313126.html', REGISTRO_ZENODO);
const readme = await pagina('README.md', README);
const csicEs = await pagina('revistas-csic-mas.html', CSIC_ES);
const csicEn = await pagina('revistas-csic-mas_en.html', CSIC_EN);
const textoZenodo = normalizar(textoPlano(registroZenodo.toString('utf8')));
for (const l of LITERALES_ZENODO) if (!textoZenodo.includes(normalizar(l))) throw new Error(`PARA: «${l}» no está en ${REGISTRO_ZENODO}`);
for (const l of [LITERAL_CSIC_ES, LITERAL_CSIC_CITA]) if (!normalizar(textoPlano(csicEs.toString('utf8'))).includes(normalizar(l))) throw new Error(`PARA: «${l.slice(0, 50)}…» no está en ${CSIC_ES}`);
if (!normalizar(textoPlano(csicEn.toString('utf8'))).includes(normalizar(LITERAL_CSIC_EN))) throw new Error(`PARA: el literal de la descarga sistemática no está en ${CSIC_EN}`);

// ── Sondeo: ¿admite rangos? ──
const rutaSondeo = `${FUENTE}sondeo.json`;
interface Sondeo {
  estado: number;
  cabeceras: Record<string, string>;
  url: string;
}
let sondeo: Sondeo;
if (existsSync(rutaSondeo)) sondeo = JSON.parse(readFileSync(rutaSondeo, 'utf8')) as Sondeo;
else {
  const r = await cliente.obtener(FICHERO, { Range: 'bytes=0-0' });
  sondeo = { estado: r.estado, cabeceras: r.cabeceras, url: r.url };
  writeFileSync(rutaSondeo, JSON.stringify(sondeo, null, 2) + '\n', 'utf8');
}
const rango = /^bytes 0-0\/(\d+)$/.exec(sondeo.cabeceras['content-range'] ?? '');
if (sondeo.estado !== 206 || rango === null) {
  guardarRegistro();
  throw new Error(
    `PARA: el fichero no responde a un Range (HTTP ${sondeo.estado}, Accept-Ranges «${sondeo.cabeceras['accept-ranges'] ?? 'NO CONSTA'}»): habría que bajar ${TOTAL_ESPERADO} bytes enteros; ver la velocidad y proponer`,
  );
}
const total = Number(rango[1]);
if (total !== TOTAL_ESPERADO) throw new Error(`PARA: el fichero mide ${total} bytes y el registro dice ${TOTAL_ESPERADO}`);

async function trozo(i: number, inicio: number): Promise<Buffer> {
  const ruta = `${FUENTE}trozos/${String(i).padStart(4, '0')}-${inicio}.bin`;
  if (existsSync(ruta)) return readFileSync(ruta);
  const fin = inicio + TAMANO - 1;
  const r: Respuesta = await cliente.obtener(FICHERO, { Range: `bytes=${inicio}-${fin}` });
  if (r.estado !== 206 || r.cabeceras['content-range'] !== `bytes ${inicio}-${fin}/${total}` || r.cuerpo.length !== TAMANO) {
    throw new Error(`PARA: el trozo ${i} (${inicio}-${fin}) volvió con HTTP ${r.estado}, «${r.cabeceras['content-range'] ?? 'sin Content-Range'}», ${r.cuerpo.length} bytes`);
  }
  writeFileSync(ruta, r.cuerpo);
  return r.cuerpo;
}

// ── Trozos, documentos y unidades ──
interface Unidad {
  id: string;
  texto: string;
  palabrasProsa: number;
  tramo: TramoDeCalibracion;
  reparto: Reparto;
  byte: number;
  trozo: number;
  palabrasDelDocumento: number;
  fragmento: boolean;
  ocr: number;
}
const unidades: Unidad[] = [];
const cuenta = { '100-299': 0, '300-599': 0, '600+': 0 } as Record<TramoDeCalibracion, number>;
const vistos = new Set<number>();
const descartados: Record<string, number> = {};
const suma = (motivo: string, n = 1) => (descartados[motivo] = (descartados[motivo] ?? 0) + n);
const naturales: Record<string, number> = {};
let trozosLeidos = 0;
let documentosCompletos = 0;
let agotado: string | null = null;
try {
  for (let i = 0; i < maxTrozos && !TRAMOS.every((t) => cuenta[t] >= MINIMO); i++) {
    const inicio = inicioDelTrozo(SEMILLA, i, total, TAMANO);
    const completas = unidadesCompletas(await trozo(i, inicio), inicio, total, '\n\n');
    trozosLeidos++;
    documentosCompletos += completas.length;
    let tomadas = 0;
    for (const l of ordenDeMuestra(SEMILLA, completas, (x) => `csic-${x.byte}`)) {
      if (vistos.has(l.byte)) {
        suma('documento ya visto en otro trozo');
        continue;
      }
      vistos.add(l.byte);
      if (tomadas >= TOPE_POR_TROZO) {
        suma(`más de ${TOPE_POR_TROZO} del mismo trozo`);
        continue;
      }
      const id = `csic-${l.byte}`;
      const { palabrasProsa, tramo: natural } = medirLongitud(l.texto);
      naturales[natural ?? 'menos de 100'] = (naturales[natural ?? 'menos de 100'] ?? 0) + 1;
      if (natural === null) {
        suma('menos de 100 palabras de prosa');
        continue;
      }
      const tramo = tramoPorTurno(natural, cuenta, MINIMO);
      if (tramo === null) {
        suma('su tramo ya tiene el mínimo');
        continue;
      }
      let texto = l.texto;
      let palabras = palabrasProsa;
      if (tramo !== natural) {
        const f = fragmento(l.texto, id, tramo as '100-299' | '300-599', SEMILLA);
        if (f === null) {
          suma('no da un fragmento de frases completas en su tramo');
          continue;
        }
        texto = f.texto;
        palabras = f.palabrasProsa;
      }
      const r = reparto(SEMILLA, id);
      unidades.push({ id, texto, palabrasProsa: palabras, tramo, reparto: r, byte: l.byte, trozo: i, palabrasDelDocumento: palabrasProsa, fragmento: tramo !== natural, ocr: Math.round(ocrPorMil(texto) * 100) / 100 });
      if (r === 'calibracion') cuenta[tramo]++;
      tomadas++;
    }
  }
} catch (e) {
  if (!(e instanceof PresupuestoAgotado)) {
    guardarRegistro();
    throw e;
  }
  agotado = e.message;
}
guardarRegistro();

// ── Textos y manifiesto ──
rmSync(`${CORPUS}textos`, { recursive: true, force: true });
mkdirSync(`${CORPUS}textos`, { recursive: true });
const textos = new Map<string, string>();
const lista: DocumentoDelManifiesto[] = [];
for (const u of unidades) {
  writeFileSync(`${CORPUS}textos/${nombreDeFichero(u.id)}`, u.texto, 'utf8');
  textos.set(u.id, u.texto);
  lista.push({ id: u.id, sha256: huella(u.texto), palabrasProsa: u.palabrasProsa, tramo: u.tramo, byte: u.byte, trozo: u.trozo, palabrasDelDocumento: u.palabrasDelDocumento, fragmento: u.fragmento, ocrPorMil: u.ocr });
}
const tot = registro.ejecuciones.reduce((a, e) => ({ p: a.p + e.peticiones, b: a.b + e.bytes, s: a.s + e.segundos }), { p: 0, b: 0, s: 0 });
const porTramo = Object.fromEntries(TRAMOS.map((t) => [t, lista.filter((d) => d.tramo === t).length])) as Manifiesto['n']['porTramo'];
const fragmentos = Object.fromEntries(TRAMOS.map((t) => [t, unidades.filter((u) => u.tramo === t && u.fragmento).length]));

const manifiesto = prepararManifiesto(
  {
    genero: 'academico',
    fuente: {
      nombre: 'CSIC Spanish Corpus (BSC / Plan TL), Zenodo',
      version: '1.0.0 (DOI 10.5281/zenodo.7313126)',
      url: REGISTRO_ZENODO,
      ficheros: [
        { nombre: 'csic_es.txt (leído por rangos: no se baja entero, no se comprueba su md5)', url: FICHERO, bytes: total },
        { nombre: 'README.md del registro', url: README, bytes: readme.length, sha256: sha(readme) },
        { nombre: 'página del registro en Zenodo', url: REGISTRO_ZENODO, bytes: registroZenodo.length, sha256: sha(registroZenodo) },
        { nombre: 'Revistas CSIC, «Más información» (licencia)', url: CSIC_ES, bytes: csicEs.length, sha256: sha(csicEs) },
        { nombre: 'Revistas CSIC, «More information» (descarga sistemática)', url: CSIC_EN, bytes: csicEn.length, sha256: sha(csicEn) },
      ],
    },
    licencia: {
      nombre: 'CC BY 4.0',
      literal: [
        `Zenodo, registro 7313126: «${LITERALES_ZENODO[0]}.»`,
        `Revistas CSIC (${CSIC_ES}): «${LITERAL_CSIC_ES}».`,
        `Revistas CSIC (${CSIC_ES}): «${LITERAL_CSIC_CITA}»`,
        `Revistas CSIC (${CSIC_EN}), sobre la plataforma: «${LITERAL_CSIC_EN}» (aquí no se descarga nada de la plataforma).`,
      ],
      url: 'https://creativecommons.org/licenses/by/4.0/',
      estado: 'verificada en el empaquetado (Zenodo) y en origen (revistas.csic.es), leídas en cada ejecución',
      atribucion: 'CSIC Spanish Corpus, BSC / Plan de Tecnologías del Lenguaje, SEDIA (2022), https://doi.org/10.5281/zenodo.7313126; textos de revistas.csic.es (CSIC)',
    },
    documentacion: [
      { que: 'registro del corpus en Zenodo (descripción, licencia, ficheros)', url: REGISTRO_ZENODO },
      { que: 'robots.txt de zenodo.org (Disallow /api salvo /api/records/*/files; Crawl-delay 10)', url: 'https://zenodo.org/robots.txt' },
      { que: 'peticiones Range, 206 y Content-Range', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-14' },
      { que: 'licencia de los contenidos en origen', url: CSIC_ES },
      { que: 'protocolo de exclusión de robots', url: 'https://www.rfc-editor.org/rfc/rfc9309' },
    ],
    filtros: [
      `el fichero, por trozos de ${TAMANO} bytes que empiezan en bytes elegidos por huella (sha256("semilla|trozo|i")); de cada trozo, solo los documentos completos (van separados por una línea en blanco; dentro, una frase por línea)`,
      `de cada trozo, como mucho ${TOPE_POR_TROZO} unidades, las primeras en el orden de sha256("semilla|muestra|id"); un documento ya visto en otro trozo no cuenta dos veces`,
      'un documento de 100-299 o 300-599, entero a su tramo; uno de 600+, por turnos al tramo que menos unidades de calibración lleva, y en 100-299 o 300-599 como FRAGMENTO de frases completas seguidas (largo y primera frase por huella); un documento da una sola unidad',
      `hasta ${MINIMO} unidades de calibración por tramo; fuera los documentos de menos de 100 palabras de prosa`,
    ],
    unidad: 'artículo de una revista del CSIC (un documento del fichero, entre líneas en blanco) o un fragmento de frases completas de uno',
    descarga: {
      fecha: new Date().toISOString().slice(0, 10),
      herramienta: 'motor/herramientas/calibrar/descargar-academico.ts',
      peticiones: tot.p,
      bytes: tot.b,
      segundos: tot.s,
      notas: [
        `${registro.ejecuciones.length} ejecuciones; en caché, en motor/corpus/academico/fuente/: ${readdirSync(`${FUENTE}trozos`).length} trozos, el sondeo y las páginas de la licencia`,
        `sondeo del fichero con «Range: bytes=0-0»: HTTP ${sondeo.estado}, Accept-Ranges «${sondeo.cabeceras['accept-ranges'] ?? 'NO CONSTA'}», Content-Range «${sondeo.cabeceras['content-range']}», respondió ${sondeo.url}`,
        ...(agotado === null ? [] : [`presupuesto de descarga agotado: ${agotado}`]),
        'el registro cuenta el tiempo de cada ejecución entera, también el de medir: sobrestima el de red',
      ],
    },
    verificaciones: [
      { que: 'trozos leídos; documentos completos en ellos; unidades tomadas', resultado: `${trozosLeidos} trozos; ${documentosCompletos} documentos completos; ${unidades.length} unidades` },
      { que: 'tramo de cada documento entero, antes de repartir (de los documentos mirados)', resultado: Object.entries(naturales).map(([t, n]) => `${t}: ${n}`).join('; ') },
      {
        que: 'señal de OCR (ocrPorMil: palabras con un símbolo pegado o una cifra entre letras, por 1.000), por tramo: unidades con ≥ 1 y con ≥ 5',
        resultado: TRAMOS.map((t) => `${t}: ${unidades.filter((u) => u.tramo === t && u.ocr >= 1).length} y ${unidades.filter((u) => u.tramo === t && u.ocr >= 5).length} de ${porTramo[t]}`).join('; '),
      },
      { que: 'unidades por tramo que son fragmento', resultado: TRAMOS.map((t) => `${t}: ${fragmentos[t]} de ${porTramo[t]}`).join('; ') },
    ],
    incidencias: [
      '30/09/2026, exploración previa (antes de leer el robots.txt de zenodo.org, fuera de este registro): una petición con curl a https://zenodo.org/api/records/7313126 (los metadatos del registro), ruta que ese robots.txt veta («Disallow: /api»; solo se permite «/api/records/*/files»), y otra al README (permitida). Su tiempo NO CONSTA. No se repite: los metadatos y la licencia se leen en la página del registro (/records/7313126, permitida).',
      '30/09/2026: revistas.csic.es no manda su certificado intermedio (UNABLE_TO_VERIFY_LEAF_SIGNATURE). Se pidió el que publica HARICA en el AIA del certificado (http://crt.harica.gr/HARICA-GEANT-TLS-R1.cer, «GEANT TLS RSA 1»), se comprobó que lo firma «HARICA TLS RSA Root CA 2021» (almacén de Node) y que él firma el de *.revistas.csic.es, y se ejecuta con NODE_EXTRA_CA_CERTS: la verificación de TLS no se desactiva.',
      '30/09/2026: la primera ejecución paró por ese TLS antes de guardar su registro; se reconstruyó en fuente/registro.json con las horas de la caché (21 s, 4 peticiones). Desde entonces, cada ejecución guarda su registro también al parar.',
    ],
    notas: [
      '«academico»: artículos de revistas científicas del CSIC (humanidades, ciencias sociales y ciencias), España, publicados antes de octubre de 2022; NO CONSTA la fecha de cada artículo ni si alguno es traducción.',
      'Parte del corpus viene de OCR de números antiguos («informaci6n», «c1usters»): cada unidad lleva en el manifiesto su señal (ocrPorMil); no se filtra (decisión pendiente). La señal es un mínimo: los cambios de letra por letra no se ven.',
      'El corpus viene preprocesado y sin duplicados (Corpus-Cleaner, según el registro), con una frase por línea y los documentos separados por una línea en blanco: no conserva los párrafos de los artículos. Desde el encargo 6.1 (párrafos según CommonMark), el motor une esas líneas salvo donde una acaba en signo de cierre y la siguiente empieza por mayúscula (la excepción web: el 90,6 % de los saltos entre líneas de prosa, medido el 01/10/2026). Unirlas es correcto, porque no son párrafos del original. Las métricas por párrafo no se calibran con él.',
      `Los tramos 100-299 y 300-599 son casi todo FRAGMENTOS de artículos (frases completas seguidas), no documentos: ${TRAMOS.slice(0, 2).map((t) => `${t}, ${fragmentos[t]} de ${porTramo[t]}`).join('; ')}.`,
      `Sesgo de la lectura por trozos: un documento más largo que el trozo (${TAMANO} bytes) no puede salir, y cuanto más larga, menos probable es que quepa entera; los artículos muy largos quedan por debajo de su proporción.`,
    ],
    n: { documentos: lista.length, descartados, porTramo },
    documentos: lista,
  },
  textos,
);
writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n', 'utf8');

console.log(`academico: ${lista.length} unidades de ${trozosLeidos} trozos (${documentosCompletos} documentos completos)`);
console.log(`  calibración por tramo: ${TRAMOS.map((t) => `${t} ${cuenta[t]}`).join(' · ')}; unidades por tramo: ${TRAMOS.map((t) => `${t} ${porTramo[t]} (${fragmentos[t]} fragmentos)`).join(' · ')}`);
console.log(`  tramo natural de los documentos mirados: ${JSON.stringify(naturales)}`);
console.log(`  descartados: ${JSON.stringify(descartados)}`);
console.log(`  sondeo: HTTP ${sondeo.estado}, Accept-Ranges ${sondeo.cabeceras['accept-ranges'] ?? 'NO CONSTA'}, ${sondeo.cabeceras['content-range']}, ${sondeo.url}`);
console.log(`  red, esta ejecución: ${cliente.peticiones} peticiones, ${cliente.bytes} bytes, ${Math.round(cliente.transcurridoMs / 1000)} s; en total: ${tot.p} peticiones, ${Math.round(tot.b / 1e6)} MB, ${tot.s} s de ${PRESUPUESTO_TOTAL_MS / 1000}`);
if (agotado !== null) console.log(`  ⚠️ ${agotado}`);
for (const t of TRAMOS) if (cuenta[t] < MINIMO) console.log(`  ⚠️ ${t}: ${cuenta[t]} de calibración, por debajo de ${MINIMO}: la celda no existirá`);
