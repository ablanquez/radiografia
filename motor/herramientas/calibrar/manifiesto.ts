/**
 * El manifiesto de un corpus de calibración (encargo 5.5; esquema presentado
 * en la parada 1): qué se bajó, de dónde, con qué licencia y filtros, y la
 * lista de documentos con su huella, SIN TEXTO. Lo escriben los descargadores
 * en motor/corpus/<genero>.manifiesto.json y calibrar.ts en
 * data/calibracion/<genero>.manifiesto.json (con tramo y reparto). Lo juzga
 * manifiesto.spec.ts.
 */
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { comprobarSinTexto, huella, type Reparto } from './comun.ts';

export interface FicheroDeFuente {
  nombre: string;
  url: string;
  bytes: number;
  /** La huella de lo descargado; sin ella, el fichero no se bajó entero (se leyó por rangos) y su nombre lo dice. */
  sha256?: string;
  /** El SHA-1 de blob de Git, cuando la fuente es un repositorio y se comprobó contra él. */
  blobGit?: string;
}

export interface DocumentoDelManifiesto {
  id: string;
  sha256: string;
  palabrasProsa: number;
  tramo: TramoDeCalibracion | null;
  reparto?: Reparto;
  /** Lo propio de cada corpus: subcorpus, subgénero, fichero de origen, fecha, «fragmento»… */
  [campo: string]: string | number | boolean | null | undefined;
}

export interface Manifiesto {
  genero: string;
  fuente: { nombre: string; url: string; version?: string; commit?: string; ficheros: FicheroDeFuente[] };
  licencia: { nombre: string; literal: string[]; url: string; estado: string; atribucion: string };
  documentacion: { que: string; url: string }[];
  filtros: string[];
  unidad: string;
  descarga: { fecha: string; herramienta: string; peticiones: number; bytes: number; segundos: number; notas?: string[] };
  /** Comprobaciones hechas sobre el corpus al descargarlo (qué se comprobó y qué salió). */
  verificaciones?: { que: string; resultado: string }[];
  /** Lo que salió mal o fuera de lo previsto durante la descarga, dicho. */
  incidencias?: string[];
  /** Notas que calibrar.ts lleva al fichero de calibración del género. */
  notas?: string[];
  /** Cuando los documentos salen de libros: los metadatos públicos de cada libro del que sale alguno. */
  libros?: { id: number; titulo: string; autores: string; muerte: number; materias: string }[];
  semilla?: string;
  motor?: { commit: string; limpio: boolean };
  n: {
    documentos: number;
    descartados: Record<string, number>;
    porTramo: Record<TramoDeCalibracion, number>;
    reparto?: Record<Reparto, number>;
  };
  documentos: DocumentoDelManifiesto[];
}

/**
 * El manifiesto listo para escribir: documentos ordenados por id, cada huella
 * comprobada contra su texto, n.documentos cuadrado y ningún trozo de texto
 * en ningún campo (comprobarSinTexto). Si algo falla, para.
 */
export function prepararManifiesto(m: Manifiesto, textos: ReadonlyMap<string, string>): Manifiesto {
  const documentos = [...m.documentos].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const d of documentos) {
    const texto = textos.get(d.id);
    if (texto === undefined) throw new Error(`manifiesto: el documento ${d.id} no tiene texto`);
    if (!/^[0-9a-f]{64}$/.test(d.sha256) || d.sha256 !== huella(texto)) throw new Error(`manifiesto: la huella de ${d.id} no es la de su texto`);
  }
  if (m.n.documentos !== documentos.length) throw new Error(`manifiesto: n.documentos dice ${m.n.documentos} y hay ${documentos.length}`);
  const listo = { ...m, documentos };
  const trozos = comprobarSinTexto(listo, [...textos.values()]);
  if (trozos.length > 0) throw new Error(`manifiesto: lleva texto de los documentos («${trozos[0]}»…)`);
  return listo;
}

/** El fichero de un documento en motor/corpus/<genero>/textos/: su id y «.txt». */
export function nombreDeFichero(id: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) throw new Error(`id de documento no válido como nombre de fichero: «${id}»`);
  return `${id}.txt`;
}
