/**
 * El lenguaje de calle del resultado (encargo 9.2, b; firmado por Antonio en
 * la parada 1), sin DOM: lo pintan pintar.ts y el informe.
 *
 *   · etiquetaDelPaquete: la banda del total traducida a una etiqueta y una
 *     frase (retoque del 9.2, firmado por Antonio el 03/10/2026 al ver la
 *     pantalla), con el género en singular dentro de la frase y su
 *     concordancia; «de esta longitud» se queda en el detalle. No es una
 *     probabilidad ni dice quién escribió el texto: el verbo es «suena a».
 *     «Texto sin indicios…» solo si no suma ninguna regla; si suman y restan
 *     hasta 0, va la de la banda (firmado, D). Con texto corto, la de su
 *     banda y el aviso debajo. Un paquete propio con escala habla de sus
 *     señales: pocas (por debajo de la mediana o dentro de lo normal),
 *     bastantes o muchas.
 *   · detalleDelPaquete: las cifras, para el «Ver el detalle» plegado; y
 *     comparacionDelPaquete, la línea de la comparación con los textos de
 *     personas, debajo de la cual pintar.ts dice de dónde salen (11.1).
 *   · resumenDelPaquete: «Lo que más pesa:» con las tres reglas que más suman
 *     (los empates, en el orden del desglose: orden.ts) y su cola, y «Empieza
 *     por:» con la sugerencia de la primera (firmado, E). La meta solo existe
 *     donde hay percentiles humanos, en las reglas estadísticas: el borde que
 *     usa la regla, de la celda de su género y tramo (percentil.ts del motor:
 *     con «p95», [p5, p95]; con «p99», [p1, p99]), del lado por el que se sale.
 *     Español correcto y los paquetes propios, una línea con sus recuentos.
 *   · Las líneas del conjunto (ausencias y estadísticas) y los motivos en
 *     claro de las no miradas, sacados de la regla y no del texto del motor.
 *   · Desde el 10.4 (Tanda 2), lo que más pesa también como datos
 *     (loQueMasPesa: cada regla con su familia y su cola, y la sugerencia de
 *     la primera), para las tarjetas del modelo; resumenDelPaquete lo escribe
 *     en una línea con las mismas palabras de antes. Y el recuento de cada
 *     familia para sus tarjetas (recuentoDeFamilias): sus señales, sin las de
 *     las reglas de contexto de una familia que puntúa.
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

/** Un género en palabras de la calle con su concordancia («una»/«un», «las»/«los», «escrita»/«escrito») y en plural con artículo. */
export type GeneroEnCalle = textos.GeneroEnPalabras & (typeof textos.CONCORDANCIA)['femenino'] & { conArticulo: string };

/** El género en palabras de la calle (textos.ts); su género gramatical da la concordancia. */
export function generoEnCalle(clave: string): GeneroEnCalle {
  const palabras = Object.hasOwn(textos.GENEROS_EN_CALLE, clave) ? textos.GENEROS_EN_CALLE[clave]! : textos.generoDesconocido(clave);
  const concordancia = textos.CONCORDANCIA[palabras.femenino ? 'femenino' : 'masculino'];
  return { ...palabras, ...concordancia, conArticulo: `${concordancia.los} ${palabras.plural}` };
}

const tramoEnPalabras = (resultado: Resultado): string => textos.TRAMOS_EN_PALABRAS[resultado.tramoDeCalibracion ?? ''] ?? textos.MENOS_DE_100;

/** Las reglas que suman en este texto: con señales, que no son solo aviso y con contribución positiva. */
const queSuman = (r: ResultadoDePaquete): PuntosDeRegla[] => r.puntuacion.familias.flatMap((f) => f.reglas).filter((x) => !x.informativa && x.n > 0 && x.contribucion > 0);

/** Lo que encabeza el bloque de un paquete con escala: la etiqueta (su título), la frase y, con texto corto, el aviso. */
export interface EtiquetaYFrase {
  etiqueta: string;
  frase: string;
  aviso: string | null;
}

/** La etiqueta y la frase de cada banda (y de «sin calibración»). */
type PorBanda = Readonly<Record<NonNullable<ResultadoDePaquete['banda']>['banda'], readonly [string, string]>>;

export function etiquetaDelPaquete(resultado: Resultado, r: ResultadoDePaquete, voz: Voz): EtiquetaYFrase | null {
  if (resultado.tramo === 'insuficiente' || r.banda === null) return null;
  const aviso = resultado.tramo === 'poco-fiable' ? textos.AVISO_TEXTO_CORTO : null;
  const banda = r.banda.banda;
  if (voz !== 'asistente') {
    const p = r.paquete;
    const propio: PorBanda = {
      'sin calibración': [textos.ETIQUETA_SIN_COMPARAR, textos.sinConQueCompararDe(p)],
      'por debajo de la mediana': [textos.pocasSenalesDe(p), textos.menosSenalesDe(p)],
      'entre la mediana y el p95': [textos.pocasSenalesDe(p), textos.menosSenalesDe(p)],
      'por encima del p95': [textos.bastantesSenalesDe(p), textos.deCadaCienDe(p, 5)],
      'por encima del p99': [textos.muchasSenalesDe(p), textos.deCadaCienDe(p, 1)],
    };
    const [etiqueta, frase] = propio[banda];
    return { etiqueta, frase, aviso };
  }
  if (r.puntuacion.total === 0 && queSuman(r).length === 0) return { etiqueta: textos.ETIQUETA_SIN_INDICIOS, frase: textos.NADA_QUE_SUENE, aviso };
  const g = generoEnCalle(resultado.genero);
  const asistente: PorBanda = {
    'sin calibración': [textos.ETIQUETA_SIN_COMPARAR, textos.sinConQueComparar(g.plural, g.escritos, g.los)],
    'por debajo de la mediana': [textos.ETIQUETA_MUY_POCOS, textos.suenaMenos(g.un, g.singular, g.escrito)],
    'entre la mediana y el p95': [textos.ETIQUETA_DENTRO, textos.suenaComoCualquier(g.singular, g.escrito)],
    'por encima del p95': [textos.ETIQUETA_BASTANTES, textos.suenaBastante(g.plural, g.escritos)],
    'por encima del p99': [textos.ETIQUETA_MUCHOS, textos.suenaMucho(g.plural, g.escritos)],
  };
  const [etiqueta, frase] = asistente[banda];
  return { etiqueta, frase, aviso };
}

/** Con qué textos de personas se compara un paquete con escala; null sin escala o sin textos de personas para este texto. */
export function comparacionDelPaquete(resultado: Resultado, r: ResultadoDePaquete): string | null {
  if (r.banda === null || r.banda.banda === 'sin calibración') return null;
  const g = generoEnCalle(resultado.genero);
  const b = r.banda;
  return textos.comparadoCon(entero.format(b.n), g.plural, tramoEnPalabras(resultado), g.escritos, cifra(b.p50), cifra(b.p95), cifra(b.p99));
}

/** Las cifras de un paquete con escala: su total y con qué textos de personas se compara (también van en la cabecera del informe). */
export function cifrasDelPaquete(resultado: Resultado, r: ResultadoDePaquete): string[] {
  const g = generoEnCalle(resultado.genero);
  const lineas: string[] = [];
  if (r.puntuacion.total !== null) lineas.push(textos.tuTotal(cifra(r.puntuacion.total)));
  const comparacion = comparacionDelPaquete(resultado, r);
  if (comparacion !== null) lineas.push(comparacion);
  else if (r.banda !== null) lineas.push(textos.sinTextosDePersonas(g.plural, tramoEnPalabras(resultado), g.escritos));
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

/** Una regla de las que más pesan: su id, su nombre, la clave de su familia («paquete::familia») y su cola (veces o meta). */
export interface ReglaQuePesa {
  id: string;
  nombre: string;
  familia: string;
  cola: string;
}

/**
 * Lo que más pesa de un paquete de estilo de asistente (firmado, E): las tres
 * reglas que más suman, con los empates en el orden del desglose, cada una con
 * su cola; y la sugerencia de la primera. Sin ninguna que sume, la lista vacía
 * y sin sugerencia.
 */
export function loQueMasPesa(resultado: Resultado, r: ResultadoDePaquete, indice: Indice): { reglas: ReglaQuePesa[]; empiezaPor: string | null } {
  if (resultado.tramo === 'insuficiente') return { reglas: [], empiezaPor: null };
  const nombresDeFamilia = new Map(indice.familias.map((f) => [f.clave, f.nombre]));
  const regla = (id: string): Regla | undefined => indice.reglas.get(`${r.paquete}::${id}`);
  const claveDeFamilia = (id: string): string => `${r.paquete}::${regla(id)?.familia ?? ''}`;
  const nombre = (id: string): string => nombreDeRegla(id, regla(id));
  const tres = enOrden(queSuman(r), (x) => [-x.contribucion, nombresDeFamilia.get(claveDeFamilia(x.id)) ?? '', nombre(x.id)]).slice(0, 3);
  const genero = generoEnCalle(resultado.genero).conArticulo;
  const cola = (x: PuntosDeRegla): string => {
    const s = resultado.senalesTexto.find((y) => y.paquete === r.paquete && y.reglaId === x.id);
    return s === undefined ? textos.veces(x.n) : lineaDelTextoEntero(s, genero, false, regla(x.id));
  };
  return {
    reglas: tres.map((x) => ({ id: x.id, nombre: nombre(x.id), familia: claveDeFamilia(x.id), cola: cola(x) })),
    empiezaPor: tres.length === 0 ? null : (regla(tres[0]!.id)?.sugerencia ?? ''),
  };
}

/**
 * Cuántas señales tiene cada familia de los paquetes del resultado, por su
 * clave «paquete::familia»: las de sus reglas; en una familia que puntúa, sin
 * las de sus reglas informativas (las de contexto de Estadística, que van en
 * «Solo avisos»). Con texto insuficiente, ninguna.
 */
export function recuentoDeFamilias(resultado: Resultado): Map<string, number> {
  const recuento = new Map<string, number>();
  for (const r of resultado.paquetes) {
    for (const f of r.puntuacion.familias) {
      recuento.set(`${r.paquete}::${f.id}`, f.reglas.filter((x) => f.informativa || !x.informativa).reduce((suma, x) => suma + x.n, 0));
    }
  }
  return recuento;
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
  const pesa = loQueMasPesa(resultado, r, indice);
  if (pesa.reglas.length === 0) return [textos.NINGUNA_PUNTUABLE];
  return [textos.loQueMasPesa(pesa.reglas.map((x) => textos.parteDelResumen(x.nombre, x.cola))), textos.empiezaPor(pesa.empiezaPor ?? '')];
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
