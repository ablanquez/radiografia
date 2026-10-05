/**
 * El informe en datos (encargo 9.3; decisión de Antonio del 05/10): lo que
 * dicen sus siete secciones, sin DOM, del mismo Resultado y con las mismas
 * cadenas (textos.ts) y las mismas cuentas (lectura.ts, informe.ts) que el
 * papel. De aquí sale el PDF de «Descargar informe» (informe-pdf.ts). El papel
 * lo pinta pintar.ts, que toma de aquí la cabecera, la clave, el desglose y
 * las señales; el resultado y el texto los pinta con las mismas llamadas, en
 * los bloques que comparte con la pantalla. Que el PDF dice lo mismo que el
 * papel lo mira el juez del PDF (jueces/informe-pdf.spec.ts), que compara los
 * dos textos.
 *
 * Las secciones, como el papel (DISEÑO §6.5): 1 la cabecera; 2 el resultado
 * (la etiqueta, la frase, el aviso de texto corto, lo que más pesa o el
 * resumen, y la línea de cada uno de los otros paquetes); 3 la clave de las
 * familias; 4 el texto, en trozos (texto, saltos y tramos con sus familias y
 * su sigla); 5 el desglose; 6 las señales, regla a regla, con las
 * explicaciones y las reglas de contexto al final; 7 la nota de autoría. Con
 * texto insuficiente no hay informe que descargar (quien llama no lo pide).
 */
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import { urlDeRegla } from '../catalogo/catalogo.ts';
import { enOrden, type ClaveDeOrden } from '../orden.ts';
import { capasVisibles } from './familias.ts';
import { nombreDeRegla } from './humanizar.ts';
import { entradasDelInforme, type EntradaDelInforme } from './informe.ts';
import { cifrasDelPaquete, etiquetaDelPaquete, generoEnCalle, lineaDelTextoEntero, motivoNoMirada, motivoSinComparar, palabrasDelTexto, resumenDelPaquete, type EtiquetaYFrase, type Voz } from './lectura.ts';
import type { Indice } from './pintar.ts';
import { partirEnTramos } from './tramos.ts';

type Regla = Paquete['reglas'][number];
type ResultadoDePaquete = Resultado['paquetes'][number];
type SenalCalificada = Resultado['senales'][number];

const formato = new Intl.NumberFormat('es', { maximumFractionDigits: 2 });
const cifra = (x: number): string => formato.format(x);
const clave = (paquete: string, id: string): string => `${paquete}::${id}`;

/** 1 · Las líneas de la cabecera, debajo de su título: la fecha y la hora, las palabras y el género, los paquetes y las cifras de cada paquete con escala. */
export function cabeceraEnDatos(resultado: Resultado, paquetes: readonly Paquete[], indice: Indice, fecha: string, nombreDelGenero: string): string[] {
  const delInforme = paquetes.map(({ cabecera }) => textos.paqueteDelInforme(cabecera.nombre, cabecera.version, indice.propios.has(cabecera.nombre)));
  // En papel, «Ver el detalle» no se despliega (9.2): sus cifras van aquí, las de cada paquete con escala.
  const cifras = resultado.tramo === 'insuficiente' ? [] : resultado.paquetes.filter((r) => r.banda !== null).flatMap((r) => cifrasDelPaquete(resultado, r));
  return [textos.analisisDel(fecha), palabrasDelTexto(resultado, nombreDelGenero), textos.paquetesDelInforme(delInforme), ...cifras];
}

/** 2 · El resultado: la etiqueta, la frase y el aviso del primer paquete con escala (o que ninguno la tiene), sus líneas y las de los otros paquetes. */
export interface ResultadoEnDatos {
  cabeza: EtiquetaYFrase | null;
  /** Sin ningún paquete con escala, lo que lo dice (y entonces no hay cabeza ni líneas). */
  sinEscala: string | null;
  /** Lo que más pesa y por dónde empezar (estilo de asistente) o la línea de resumen (los demás). */
  lineas: string[];
  /** Cada otro paquete, con su nombre delante. */
  otros: string[];
}

export function resultadoEnDatos(resultado: Resultado, vozDe: (paquete: string) => Voz, indice: Indice): ResultadoEnDatos {
  const principal = resultado.paquetes.find((x) => x.banda !== null);
  const otros = resultado.paquetes
    .filter((r) => r !== principal)
    .flatMap((r) => resumenDelPaquete(resultado, r, vozDe(r.paquete), indice).map((linea) => textos.resumenDeOtroPaquete(r.paquete, linea)));
  if (principal === undefined) return { cabeza: null, sinEscala: textos.SIN_ESCALA, lineas: [], otros };
  const voz = vozDe(principal.paquete);
  return { cabeza: etiquetaDelPaquete(resultado, principal, voz), sinEscala: null, lineas: resumenDelPaquete(resultado, principal, voz, indice), otros };
}

/** 3 · Una línea de la clave: la clase de su familia (familias.ts), que da la muestra de su línea, y «[sigla] familia (paquete)». */
export interface FamiliaEnLaClave {
  clase: string;
  texto: string;
}

/** La clave, en el orden de la leyenda: por cada paquete activo, sus familias que puntúan y después las que solo avisan. */
export function claveEnDatos(indice: Indice, activos: ReadonlySet<string>): FamiliaEnLaClave[] {
  const salida: FamiliaEnLaClave[] = [];
  for (const paquete of [...new Set(indice.familias.map((f) => f.paquete))].filter((p) => activos.has(p))) {
    const delPaquete = indice.familias.filter((x) => x.paquete === paquete);
    for (const f of [...delPaquete.filter((x) => !x.informativa), ...delPaquete.filter((x) => x.informativa)]) {
      salida.push({ clase: f.clase, texto: textos.familiaEnLaClave(indice.siglaDeFamilia.get(f.clave) ?? '', f.nombre, f.paquete, f.informativa) });
    }
  }
  return salida;
}

/**
 * 4 · Un trozo del texto: texto sin señales; una tanda de saltos de línea (en
 * papel, un párrafo nuevo con el aire del marco); o un tramo con señales, con
 * las clases de sus familias a la vista (las que el ojo no ha ocultado; la
 * primera lleva el tinte) y las siglas de todas, que van detrás entre
 * corchetes.
 */
export type TrozoDelTexto = { tipo: 'texto'; texto: string } | { tipo: 'salto' } | { tipo: 'tramo'; texto: string; clases: string[]; siglas: string };

export function textoEnDatos(texto: string, senales: readonly SenalCalificada[], indice: Indice, ocultas: ReadonlySet<string>): TrozoDelTexto[] {
  const familiaDe = (senal: SenalCalificada): string => clave(senal.paquete, indice.reglas.get(clave(senal.paquete, senal.reglaId))?.familia ?? '');
  const salida: TrozoDelTexto[] = [];
  for (const tramo of partirEnTramos(texto.length, senales)) {
    const trozo = texto.slice(tramo.inicio, tramo.fin);
    if (tramo.senales.length === 0) {
      for (const parte of trozo.split(/(\n+)/)) {
        if (parte.startsWith('\n')) salida.push({ tipo: 'salto' });
        else if (parte !== '') salida.push({ tipo: 'texto', texto: parte });
      }
      continue;
    }
    const familias = [...new Set(tramo.senales.map((i) => familiaDe(senales[i]!)))];
    salida.push({
      tipo: 'tramo',
      texto: trozo,
      clases: capasVisibles(familias, ocultas).map((f) => indice.claseDeFamilia.get(f) ?? 'fam-propia'),
      siglas: familias.map((f) => indice.siglaDeFamilia.get(f) ?? '').join('·'),
    });
  }
  return salida;
}

/** 5 · Una línea del desglose: la regla (su nombre, que en pantalla enlaza a su ficha) y lo que se dice de ella. */
export interface LineaDeRegla {
  paquete: string;
  id: string;
  nombre: string;
  /** Lo que sigue al nombre, con sus dos puntos («: 2 veces · 3,08 puntos»), o nada. */
  resto: string;
}

/** Un apartado del desglose: su título y sus líneas; una familia sin señales lleva en su lugar «Ninguna señal». */
export interface ApartadoDelDesglose {
  titulo: string;
  lineas: LineaDeRegla[];
  nada: string | null;
}

/**
 * El desglose de un paquete (como desde el 9.2): su nombre con la versión, su
 * descripción si no tiene escala y su total; sus familias, cada una con sus
 * reglas, y lo que se nota en el conjunto; y aparte (en el móvil, en otra
 * pestaña), solo avisos, sin textos con los que comparar y no miradas.
 */
export interface DesgloseDelPaquete {
  titulo: string;
  descripcion: string | null;
  total: string;
  apartados: ApartadoDelDesglose[];
  avisos: ApartadoDelDesglose[];
}

export function desgloseDelPaquete(resultado: Resultado, r: ResultadoDePaquete, cabecera: Paquete['cabecera'], indice: Indice): DesgloseDelPaquete {
  const p = r.puntuacion;
  const reglaDe = (id: string): Regla | undefined => indice.reglas.get(clave(r.paquete, id));
  const linea = (id: string, dice: string | null): LineaDeRegla => ({ paquete: r.paquete, id, nombre: nombreDeRegla(id, reglaDe(id)), resto: dice === null || dice === '' ? '' : `: ${dice}` });
  /** El orden de una regla en el desglose, el del catálogo: el nombre de su familia y el suyo (orden.ts). */
  const nombresDeFamilia = new Map(indice.familias.map((f) => [f.clave, f.nombre]));
  const ordenDeRegla = (id: string): ClaveDeOrden => [nombresDeFamilia.get(clave(r.paquete, reglaDe(id)?.familia ?? '')) ?? '', nombreDeRegla(id, reglaDe(id))];
  const enOrdenDeRegla = <T>(lista: readonly T[], id: (x: T) => string): T[] => enOrden(lista, (x) => ordenDeRegla(id(x)));
  const genero = generoEnCalle(resultado.genero).conArticulo;
  const apartados: ApartadoDelDesglose[] = [];
  for (const f of enOrden(p.familias.filter((x) => !x.informativa), (x) => [x.nombre])) {
    // Las reglas informativas de una familia que puntúa (las de contexto de Estadística) van aparte, abajo.
    const conSenal = enOrdenDeRegla(f.reglas.filter((x) => x.n > 0 && !x.informativa), (x) => x.id);
    apartados.push({
      titulo: `${f.nombre}: ${cifra(f.total)}`,
      lineas: conSenal.map((x) => {
        // Las que restan lo dicen: un rasgo humano (9.2: «rasgo humano: resta», no «atenuante»).
        const resta = (reglaDe(x.id)?.peso ?? 0) < 0 ? ` · ${textos.RASGO_HUMANO}` : '';
        return linea(x.id, `${textos.vecesYPuntos(x.n, cifra(x.contribucion))}${resta}`);
      }),
      nada: conSenal.length === 0 ? textos.NINGUNA_SENAL : null,
    });
  }
  const seNota = enOrdenDeRegla(resultado.senalesTexto.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) => linea(s.reglaId, lineaDelTextoEntero(s, genero, false, reglaDe(s.reglaId))));
  if (seNota.length > 0) apartados.push({ titulo: textos.LO_QUE_SE_NOTA, lineas: seNota, nada: null });
  const porRegla = new Map<string, number>();
  const informativas: LineaDeRegla[] = [];
  for (const s of p.informativas) {
    if ('inicio' in s) porRegla.set(s.reglaId, (porRegla.get(s.reglaId) ?? 0) + 1);
    else informativas.push(linea(s.reglaId, lineaDelTextoEntero(s, genero, true, reglaDe(s.reglaId))));
  }
  for (const [id, n] of porRegla) informativas.push(linea(id, textos.veces(n)));
  const avisos = [
    { titulo: textos.INFORMATIVAS_EN_EL_DESGLOSE, lineas: enOrdenDeRegla(informativas, (x) => x.id) },
    { titulo: textos.SIN_TEXTOS_PARA_COMPARAR, lineas: enOrdenDeRegla(resultado.sinCalibracion.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) => linea(s.reglaId, motivoSinComparar(s.motivo))) },
    { titulo: textos.NO_MIRADAS, lineas: enOrdenDeRegla(resultado.noAplicadas.filter((s) => s.paquete === r.paquete), (s) => s.reglaId).map((s) => linea(s.reglaId, motivoNoMirada(reglaDe(s.reglaId), s.motivo))) },
  ]
    .filter((a) => a.lineas.length > 0)
    .map((a) => ({ ...a, nada: null }));
  return {
    titulo: `${r.paquete} ${cabecera.version}`,
    descripcion: r.banda === null ? cabecera.descripcion : null,
    total: p.total === null ? (p.motivo ?? '') : textos.totalEnClaro(cifra(p.total)),
    apartados,
    avisos,
  };
}

/** 5 · El desglose de cada paquete, como en papel: el del primero con escala primero, sin más; cada uno de los otros, con su etiqueta y su frase si tiene escala. */
export interface DesgloseEnDatos {
  paquete: string;
  /** La etiqueta, la frase y el aviso de un otro paquete con escala; null en el primero y en los que no la tienen. */
  cabeza: EtiquetaYFrase | null;
  desglose: DesgloseDelPaquete;
}

export function desgloseEnDatos(resultado: Resultado, paquetes: readonly Paquete[], indice: Indice, vozDe: (paquete: string) => Voz): DesgloseEnDatos[] {
  const principal = resultado.paquetes.find((x) => x.banda !== null);
  return (principal === undefined ? resultado.paquetes : [principal, ...resultado.paquetes.filter((x) => x !== principal)]).map((r) => ({
    paquete: r.paquete,
    cabeza: r === principal || r.banda === null ? null : etiquetaDelPaquete(resultado, r, vozDe(r.paquete)),
    desglose: desgloseDelPaquete(resultado, r, paquetes[resultado.paquetes.indexOf(r)]!.cabecera, indice),
  }));
}

/** 6 · Una línea de una señal: un párrafo (la frase en claro, marcada), o «Etiqueta: texto» con la etiqueta en negrita. */
export type LineaDeSenal = { texto: string; enClaro?: true } | { etiqueta: string; texto: string };

/**
 * Una señal, regla a regla: su nombre, la dirección absoluta de su ficha (null
 * en la de un paquete propio, que no tiene, y entonces su id va detrás del
 * nombre) y sus líneas: la frase en claro, si solo avisa, los fragmentos, lo
 * del texto entero, la explicación (solo en las de contexto), «Qué hacer» y,
 * en la de un paquete propio, que no tiene ficha.
 */
export interface SenalEnDatos {
  reglaId: string;
  nombre: string;
  ficha: string | null;
  lineas: LineaDeSenal[];
}

export interface SenalesEnDatos {
  principales: SenalEnDatos[];
  /** «¿Por qué lo miramos?»: la explicación de cada principal con ficha, con su nombre delante. */
  porQue: { reglaId: string; nombre: string; texto: string }[];
  /** Las reglas de contexto (las estadísticas informativas), enteras, con su explicación. */
  deContexto: SenalEnDatos[];
}

/** Las señales del informe, o null si no hay ninguna (con texto insuficiente, nunca). `direccion` es la de la página: con ella, la de cada ficha va absoluta. */
export function senalesEnDatos(resultado: Resultado, texto: string, indice: Indice, base: string, direccion: string): SenalesEnDatos | null {
  const entradas = resultado.tramo === 'insuficiente' ? [] : entradasDelInforme(resultado, texto, indice);
  if (entradas.length === 0) return null;
  const genero = generoEnCalle(resultado.genero).conArticulo;
  const enDatos = (e: EntradaDelInforme, conExplicacion: boolean): SenalEnDatos => {
    const propia = indice.propios.has(e.paquete);
    const lineas: LineaDeSenal[] = [];
    if (e.regla?.enClaro !== undefined) lineas.push({ texto: e.regla.enClaro, enClaro: true });
    if (e.informativa) lineas.push({ texto: textos.INFORMATIVA });
    if (e.n > 0) lineas.push({ texto: textos.fragmentosDeLaRegla(e.fragmentos, e.resto) });
    for (const s of e.delTextoEntero) lineas.push({ texto: textos.senalDelTextoEntero(lineaDelTextoEntero(s, genero, e.informativa, e.regla)) });
    if (e.regla !== undefined) {
      if (conExplicacion) lineas.push({ etiqueta: textos.EXPLICACION, texto: e.regla.explicacion });
      lineas.push({ etiqueta: textos.QUE_HACER, texto: e.regla.sugerencia });
    }
    if (propia) lineas.push({ texto: textos.REGLA_PROPIA_SIN_FICHA });
    return { reglaId: e.reglaId, nombre: e.nombre, ficha: propia ? null : new URL(urlDeRegla(base, e.reglaId), direccion).href, lineas };
  };
  const principales = entradas.filter((e) => !e.deContexto);
  return {
    principales: principales.map((e) => enDatos(e, false)),
    porQue: principales.filter((e) => e.regla !== undefined).map((e) => ({ reglaId: e.reglaId, nombre: e.nombre, texto: e.regla!.explicacion })),
    deContexto: entradas.filter((e) => e.deContexto).map((e) => enDatos(e, true)),
  };
}

/** Lo que hace falta para el informe: el último análisis pintado y cómo se pintó. */
export interface Analisis {
  resultado: Resultado;
  texto: string;
  paquetes: readonly Paquete[];
  indice: Indice;
  vozDe: (paquete: string) => Voz;
  /** La fecha y la hora del análisis, ya escritas (las de la cabecera del papel). */
  fecha: string;
  nombreDelGenero: string;
  /** Las familias que el ojo ha ocultado en la vista: en papel, su línea no sale. */
  ocultas: ReadonlySet<string>;
  base: string;
  direccion: string;
}

/** El informe entero, sección a sección, con sus títulos. */
export interface InformeEnDatos {
  /** Los de las secciones y, en la 6, los de sus dos partes del final. */
  titulos: { cabecera: string; resultado: string; clave: string; texto: string; desglose: string; senales: string; porQue: string; deContexto: string };
  cabecera: string[];
  resultado: ResultadoEnDatos;
  clave: { siglas: string; familias: FamiliaEnLaClave[] };
  texto: TrozoDelTexto[];
  desglose: DesgloseEnDatos[];
  senales: SenalesEnDatos | null;
  nota: string;
}

/** El informe de un análisis que no es de texto insuficiente (con él no hay informe que descargar). */
export function informeEnDatos(a: Analisis): InformeEnDatos {
  return {
    titulos: {
      cabecera: textos.INFORME_DE_RADIOGRAFIA,
      resultado: textos.RESULTADO,
      clave: textos.CLAVE_DE_FAMILIAS,
      texto: textos.TEXTO_DEL_INFORME,
      desglose: textos.DESGLOSE,
      senales: textos.SENALES_DEL_INFORME,
      porQue: textos.POR_QUE_LO_MIRAMOS,
      deContexto: textos.LO_QUE_SE_NOTA,
    },
    cabecera: cabeceraEnDatos(a.resultado, a.paquetes, a.indice, a.fecha, a.nombreDelGenero),
    resultado: resultadoEnDatos(a.resultado, a.vozDe, a.indice),
    clave: { siglas: textos.CLAVE_DE_SIGLAS, familias: claveEnDatos(a.indice, new Set(a.paquetes.map((p) => p.cabecera.nombre))) },
    texto: textoEnDatos(a.texto, a.resultado.senales, a.indice, a.ocultas),
    desglose: desgloseEnDatos(a.resultado, a.paquetes, a.indice, a.vozDe),
    senales: senalesEnDatos(a.resultado, a.texto, a.indice, a.base, a.direccion),
    nota: textos.NOTA_DE_AUTORIA,
  };
}
