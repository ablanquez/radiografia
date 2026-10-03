/**
 * El lenguaje de calle del resultado (encargo 9.2, b; firmado por Antonio en
 * la parada 1), sin DOM: lo pintan pintar.ts y el informe.
 *
 *   · titularDelPaquete: la banda del total traducida a una frase, con el
 *     género en palabras de la calle y «de esta longitud escritos por
 *     personas». No es una probabilidad ni dice quién escribió el texto: dice
 *     dónde queda respecto a los textos de personas del mismo tipo y
 *     longitud. Nunca «IA»: «rasgos de estilo de asistente», y en un paquete
 *     propio, sus señales. Las bandas son trozos de la distribución humana:
 *     «entre la mediana y el p95» no es «la mayoría», y se dice «dentro de lo
 *     habitual». «Ni un rasgo… que sume» solo si no suma ninguna regla; si
 *     suman y restan hasta 0, va el de la banda (firmado, D).
 *   · detalleDelPaquete: las cifras, para el «Ver el detalle» plegado.
 *   · resumenDelPaquete: «Lo que más pesa:» con las tres reglas que más suman
 *     (los empates, en el orden del desglose: orden.ts) y su cola, y «Empieza
 *     por:» con la sugerencia de la primera (firmado, E). La meta solo existe
 *     donde hay percentiles humanos, en las reglas estadísticas: el borde que
 *     usa la regla, de la celda de su género y tramo (percentil.ts del motor:
 *     con «p95», [p5, p95]; con «p99», [p1, p99]), del lado por el que se sale.
 *     Español correcto y los paquetes propios, una línea con sus recuentos.
 *   · Las líneas del conjunto (ausencias y estadísticas) y los motivos en
 *     claro de las no miradas, sacados de la regla y no del texto del motor.
 *
 * [DOC] https://hemingwayapp.com/help/docs/highlighted-issues — el molde de la
 *    frase por subrayado: «These are words like 'maybe' or 'I think' that make
 *    your writing sound less confident». El titular de su barra lateral no
 *    consta en una fuente leída.
 */
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import * as textos from '../textos.ts';
import { enOrden } from '../orden.ts';
import { nombreDeRegla } from './humanizar.ts';
import type { Indice } from './pintar.ts';

type Regla = Paquete['reglas'][number];
type ResultadoDePaquete = Resultado['paquetes'][number];
type PuntosDeRegla = ResultadoDePaquete['puntuacion']['familias'][number]['reglas'][number];
/** Una señal del texto entero: estadística (con valor) o de ausencia (con coincidencias); de una regla que suma o de contexto. */
export type SenalDelTextoEntero = Resultado['senalesTexto'][number] | ResultadoDePaquete['puntuacion']['informativas'][number];

/** Quién habla en el medidor: RadiografIA (estilo de asistente), Español correcto (norma) o un paquete propio. */
export type Voz = 'asistente' | 'norma' | 'propio';

const formato = new Intl.NumberFormat('es', { maximumFractionDigits: 2 });
const cifra = (x: number): string => formato.format(x);
const entero = new Intl.NumberFormat('es');

export interface GeneroEnCalle {
  conArticulo: string;
  sinArticulo: string;
  /** La concordancia del participio: «escritos» o «escritas». */
  escritos: string;
}

/** El género en palabras de la calle (textos.ts); el artículo da la forma sin él y la concordancia. */
export function generoEnCalle(clave: string): GeneroEnCalle {
  const conArticulo = Object.hasOwn(textos.GENEROS_EN_CALLE, clave) ? textos.GENEROS_EN_CALLE[clave]! : textos.generoDesconocido(clave);
  return { conArticulo, sinArticulo: conArticulo.replace(/^(los|las) /, ''), escritos: conArticulo.startsWith('las ') ? 'escritas' : 'escritos' };
}

const tramoEnPalabras = (resultado: Resultado): string => textos.TRAMOS_EN_PALABRAS[resultado.tramoDeCalibracion ?? ''] ?? textos.MENOS_DE_100;

/** Las reglas que suman en este texto: con señales, que no son solo aviso y con contribución positiva. */
const queSuman = (r: ResultadoDePaquete): PuntosDeRegla[] => r.puntuacion.familias.flatMap((f) => f.reglas).filter((x) => !x.informativa && x.n > 0 && x.contribucion > 0);

export function titularDelPaquete(resultado: Resultado, r: ResultadoDePaquete, voz: Voz): string | null {
  if (resultado.tramo === 'insuficiente' || r.banda === null) return null;
  const corto = resultado.tramo === 'poco-fiable';
  const propio = voz !== 'asistente';
  if (r.puntuacion.total === 0 && queSuman(r).length === 0) return textos.titular(propio ? textos.niUnaSenalDe(r.paquete) : textos.NI_UN_RASGO, corto);
  if (r.banda.banda === 'sin calibración') return textos.titular(textos.SIN_REFERENCIA, corto);
  const g = generoEnCalle(resultado.genero);
  const quien = textos.quienEscribe(g.conArticulo, g.escritos);
  const frase = {
    'por debajo de la mediana': propio ? textos.menosSenalesQueLaMitad(r.paquete, quien) : textos.menosRasgosQueLaMitad(quien),
    'entre la mediana y el p95': textos.dentroDeLoHabitual(quien),
    'por encima del p95': propio ? textos.masSenalesQue(r.paquete, '95', quien) : textos.masRasgosQue('95', quien),
    'por encima del p99': propio ? textos.masSenalesQue(r.paquete, '99', quien) : textos.masRasgosQue('99', quien),
  }[r.banda.banda];
  return textos.titular(frase, corto);
}

/** Las cifras de un paquete con escala: su total y con qué textos de personas se compara (también van en la cabecera del informe). */
export function cifrasDelPaquete(resultado: Resultado, r: ResultadoDePaquete): string[] {
  const g = generoEnCalle(resultado.genero);
  const tramo = tramoEnPalabras(resultado);
  const lineas: string[] = [];
  if (r.puntuacion.total !== null) lineas.push(textos.tuTotal(cifra(r.puntuacion.total)));
  if (r.banda !== null && r.banda.banda !== 'sin calibración') {
    const b = r.banda;
    lineas.push(textos.comparadoCon(entero.format(b.n), g.sinArticulo, tramo, g.escritos, cifra(b.p50), cifra(b.p95), cifra(b.p99)));
  } else if (r.banda !== null) {
    lineas.push(textos.sinTextosDePersonas(g.sinArticulo, tramo, g.escritos));
  }
  return lineas;
}

/** Las palabras que cuentan, la longitud con la que se compara y el género, en claro. */
export function palabrasDelTexto(resultado: Resultado, nombreDelGenero: string): string {
  return textos.palabrasQueCuentan(resultado.palabrasProsa, tramoEnPalabras(resultado), nombreDelGenero);
}

/** Las líneas de «Ver el detalle»: las cifras, las palabras que cuentan y, con texto corto, por qué es orientativo. */
export function detalleDelPaquete(resultado: Resultado, r: ResultadoDePaquete, nombreDelGenero: string): string[] {
  const lineas = [...cifrasDelPaquete(resultado, r), palabrasDelTexto(resultado, nombreDelGenero)];
  if (resultado.tramo === 'poco-fiable') lineas.push(textos.textoCortoEnClaro(resultado.palabrasProsa));
  return lineas;
}

/** Los bordes de lo habitual que usa una regla estadística: con «p95», p5 y p95; con «p99», p1 y p99. */
function bordes(regla: Regla | undefined): { abajo: 'p1' | 'p5'; arriba: 'p95' | 'p99' } {
  const percentil = regla?.detector === 'estadístico' ? regla.parametros.percentil : 'p95';
  return percentil === 'p99' ? { abajo: 'p1', arriba: 'p99' } : { abajo: 'p5', arriba: 'p95' };
}

const unidad = (metrica: string): string => (Object.hasOwn(textos.UNIDADES_DE_METRICA, metrica) ? textos.UNIDADES_DE_METRICA[metrica]! : metrica);

/**
 * Lo que se dice de una señal del texto entero. Una ausencia, cuántas veces
 * aparece; una estadística de una regla que suma, su valor y la meta (el
 * borde del lado por el que se sale); una de contexto, dónde queda respecto a
 * lo habitual, con los dos bordes.
 */
export function lineaDelTextoEntero(s: SenalDelTextoEntero, genero: string, deContexto: boolean, regla: Regla | undefined): string {
  if ('coincidencias' in s) return s.coincidencias === 0 ? textos.NI_UNA_VEZ : textos.soloVeces(s.coincidencias, s.minimo);
  // Una informativa de tramo (las de canal) no es del texto entero: no llega aquí.
  if (!('valor' in s)) return '';
  const { abajo, arriba } = bordes(regla);
  if (deContexto) {
    const posicion = textos.POSICIONES_RESPECTO_A_LO_HABITUAL[s.lado ?? 'dentro'] ?? textos.POSICIONES_RESPECTO_A_LO_HABITUAL['dentro']!;
    return textos.estadisticaDeContexto(cifra(s.valor), unidad(s.metrica), posicion, genero, cifra(s.referencia[abajo]), cifra(s.referencia[arriba]));
  }
  const porArriba = s.lado !== 'abajo';
  return textos.conMeta(cifra(s.valor), unidad(s.metrica), genero, porArriba ? 'menos' : 'más', cifra(s.referencia[porArriba ? arriba : abajo]));
}

export function resumenDelPaquete(resultado: Resultado, r: ResultadoDePaquete, voz: Voz, indice: Indice): string[] {
  if (resultado.tramo === 'insuficiente') return [];
  const nombresDeFamilia = new Map(indice.familias.map((f) => [f.clave, f.nombre]));
  const regla = (id: string): Regla | undefined => indice.reglas.get(`${r.paquete}::${id}`);
  const familia = (id: string): string => nombresDeFamilia.get(`${r.paquete}::${regla(id)?.familia ?? ''}`) ?? '';
  const nombre = (id: string): string => nombreDeRegla(id, regla(id));
  if (voz !== 'asistente') {
    const filas = r.puntuacion.familias.flatMap((f) => f.reglas).filter((x) => x.n > 0);
    const n = filas.reduce((suma, x) => suma + x.n, 0);
    const dos = enOrden(filas, (x) => [-x.n, familia(x.id), nombre(x.id)])
      .slice(0, 2)
      .map((x) => textos.reglaConCuenta(nombre(x.id), x.n));
    if (voz === 'norma') return [n === 0 ? textos.NINGUN_AVISO : textos.avisosDeNorma(n, dos)];
    return [n === 0 ? textos.ningunaSenalDe(r.paquete) : textos.senalesDe(n, r.paquete, dos)];
  }
  const tres = enOrden(queSuman(r), (x) => [-x.contribucion, familia(x.id), nombre(x.id)]).slice(0, 3);
  if (tres.length === 0) return [textos.NINGUNA_PUNTUABLE];
  const genero = generoEnCalle(resultado.genero).conArticulo;
  const cola = (x: PuntosDeRegla): string => {
    const s = resultado.senalesTexto.find((y) => y.paquete === r.paquete && y.reglaId === x.id);
    return s === undefined ? textos.veces(x.n) : lineaDelTextoEntero(s, genero, false, regla(x.id));
  };
  return [textos.loQueMasPesa(tres.map((x) => textos.parteDelResumen(nombre(x.id), cola(x)))), textos.empiezaPor(regla(tres[0]!.id)?.sugerencia ?? '')];
}

/** Por qué no se miró una regla, en claro y de la propia regla: sus géneros, o que es una ausencia en un texto corto. */
export function motivoNoMirada(regla: Regla | undefined, motivoDelMotor: string): string {
  if (regla?.generos !== undefined && regla.generos.length > 0) return textos.soloSeMiranEn(regla.generos.map((g) => generoEnCalle(g).conArticulo));
  if (regla !== undefined && regla.detector !== 'estadístico' && regla.parametros.ausencia === true) return textos.SOLO_TEXTOS_LARGOS;
  // [PROPIO] Hoy el motor solo deja sin mirar por esas dos razones; si añadiera otra, se dice la suya.
  return motivoDelMotor;
}

/**
 * Por qué una regla estadística no tiene textos de personas con los que
 * comparar. [PROPIO] El motor da dos motivos (detector-estadistico.ts): sin
 * celda para esa métrica, género y tramo, o «no calculable» (la métrica no
 * tiene valor en este texto); se distinguen por cómo empieza el suyo.
 */
export function motivoSinComparar(motivoDelMotor: string): string {
  return motivoDelMotor.startsWith('no calculable') ? textos.NO_SE_PUEDE_MEDIR : textos.PARA_ESTE_TIPO;
}
