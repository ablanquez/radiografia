/**
 * El juez del paquete real, paquetes/radiografia.json (encargo 5.1; punto 5
 * del plan): lo que el esquema del motor no exige, porque sirve también a
 * paquetes de terceros, y RadiografIA sí. Once condiciones:
 *   1. valida — pasa validarPaquete sin ningún error.
 *   2. sin-fuente — ninguna regla con nivelEvidencia «sin fuente»: el esquema
 *      lo admite para paquetes de terceros; RadiografIA no (decisión del 3.1,
 *      RADIOGRAFIA-ESTADO.md § 5).
 *   3. fuente-https — toda regla tiene al menos una fuente con URL https.
 *   4. seis-familias — las familias declaradas son exactamente las seis del
 *      plan (punto 2 del alcance), en cualquier orden.
 *   5. canal-informativa — la familia canal es informativa, y todas sus
 *      reglas también (decisión 6 del 29/09).
 *   6. ids — únicos, y cada uno con el prefijo de su familia (PREFIJOS). Una
 *      familia sin prefijo en PREFIJOS es un error hasta que la tanda que la
 *      rellene lo decida y lo escriba aquí.
 *   7. peso — no pasa del máximo de su nivel de evidencia, y si queda por
 *      debajo, la explicación o una excepción dicen «peso» con el porqué.
 *      [PROPIO, decisión del 30/09, sin doctrina; la calibración es el juez]
 *      medido en español 3, medido en inglés 2, anecdótico 1, norma 0; una
 *      regla informativa, o de familia informativa, 0. Desde el 5.3, un peso
 *      negativo (un atenuante: rasgo humano que resta, discurso.md § 11) solo
 *      puede ser −1 o −2; y desde el 5.4 el máximo se aplica a |peso|: un
 *      atenuante no resta más de lo que su evidencia permitiría sumar (−2
 *      solo si está medido; −1 si es anecdótico), y si resta menos, su ficha
 *      dice «peso».
 *   8. regex-ascii (encargo 5.2) — ninguna regex lleva \b ni \w (ni sus
 *      contrarios \B y \W), sin escapar: en JavaScript son ASCII y «á», «é» o
 *      «ñ» cuentan como no-palabra. Los límites se escriben con (?<!\p{L}) y
 *      (?!\p{L}), y las letras con \p{L}.
 *      [DOC] https://developer.mozilla.org/docs/Web/JavaScript/Reference/Regular_expressions/Word_boundary_assertion
 *      — «A word character includes … Letters (A–Z, a–z), numbers (0–9), and
 *      underscore (_)»; con la bandera u y la i, solo además lo que el plegado
 *      de mayúsculas convierte en esos caracteres. «Word characters are also
 *      matched by the \w character class escape.» [PROPIO] \B y \W, por la
 *      misma definición.
 *   9. regex-u (encargo 5.2) — toda regex con \p{…} o \P{…} lleva la bandera
 *      u: sin ella, \p no es una clase de Unicode sino una «p» escapada.
 *   «Sin escapar» = con un número par de barras inversas delante (la misma
 *   regla que validar.ts usa para el «$»).
 *  10. estadistica (encargo 5.6) — las reglas de detector estadístico son las
 *      de la familia estadistica, y al revés; su métrica es del registro del
 *      motor (metricas/nombres.ts; el validador también lo exige); ninguna
 *      lleva `generos` (decisión del 5.6 para la v1: una regla estadística
 *      con géneros no tendría juez de ejemplos, que analiza con «general»);
 *      las informativas miran las dos direcciones («ambas»); y sus ejemplos
 *      son textos de 300 palabras de prosa o más: al menos 2 positivos y 2
 *      negativos si la regla puntúa, al menos 1 y 1 si es informativa. Que
 *      cada positivo dispare y cada negativo no, con «general», lo juzga
 *      ejemplos-estadisticos.spec.ts. Dirección y percentil fuera de su lista
 *      los rechaza el esquema (condición 1). Desde la parada 2 del 5.6, el
 *      texto de la ficha dice el corte de su parámetro: la explicación nombra
 *      el percentil del borde que mira («percentil 95» o «5» en p95, «99» o
 *      «1» en p99; los dos en «ambas») y la proporción de humanos que queda
 *      más allá por construcción («1 de cada 20» o «100» si mira un lado, «10»
 *      o «50» si mira los dos); y una regla en p99 lleva una excepción que
 *      empieza por «Corte en el percentil» y dice por qué (lo firmado).
 *  11. nombre (encargo 7.1) — toda regla lleva nombre (el esquema lo deja
 *      opcional, por los paquetes de terceros), que empieza por mayúscula, no
 *      contiene el id, no termina en punto y no lo lleva otra regla del
 *      paquete. Lo que dice cada nombre lo firmó Antonio en la parada 1 del 7.1.
 *  12. enClaro (encargo 9.2) — toda regla lleva su frase en claro (el
 *      esquema la deja opcional y la limita a 3-140 caracteres), que empieza
 *      por mayúscula, termina en punto, como todas, y no usa las palabras
 *      vetadas en la firma: ni percentil, densidad, regex, lema ni n-grama,
 *      ni «IA», «generado» o «detectado» (se dice «rasgos de estilo de
 *      asistente»). Lo que dice cada frase lo firmó Antonio en la parada 1 del
 *      9.2.
 *
 * Cada condición tiene al menos un caso que la rompe sobre una copia del
 * paquete real, y el juez tiene que nombrar esa condición y ninguna otra
 * (salvo cuando el propio validador también la caza: se dice en el caso).
 *
 * ⚠️ El paquete se lee DENTRO de cada test (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarPaquete } from './validar.ts';
import { esMetrica } from './metricas/nombres.ts';
import { analizarTexto } from './texto.ts';
import { COMPLETO, evaluarLongitud } from './umbral.ts';
import type { Paquete, Regla } from './paquete.ts';

const RUTA = new URL('../../paquetes/radiografia.json', import.meta.url);
const leer = (): Paquete => JSON.parse(readFileSync(RUTA, 'utf8')) as Paquete;

const FAMILIAS = ['lexico', 'sintaxis', 'puntuacion-formato', 'estadistica', 'discurso', 'canal'];

/** El prefijo del id de cada familia con reglas (encargos 5.1 a 5.4, y estadística en el 5.6). */
const PREFIJOS: Readonly<Record<string, string>> = {
  canal: 'canal-',
  'puntuacion-formato': 'pf-',
  lexico: 'lex-',
  discurso: 'disc-',
  sintaxis: 'sint-',
  estadistica: 'est-',
};

/** Lo que puede restar un atenuante (encargo 5.3). */
const ATENUANTES: readonly number[] = [-1, -2];

/** El peso máximo de cada nivel de evidencia. «sin fuente» no tiene: ya lo prohíbe la condición 2. */
const MAXIMO: Readonly<Partial<Record<Regla['nivelEvidencia'], number>>> = {
  'medido en español': 3,
  'medido en inglés': 2,
  anecdótico: 1,
  norma: 0,
};

type Condicion = 'valida' | 'sin-fuente' | 'fuente-https' | 'seis-familias' | 'canal-informativa' | 'ids' | 'peso' | 'regex-ascii' | 'regex-u' | 'estadistica' | 'nombre' | 'en-claro';

/**
 * Las palabras vetadas en enClaro (firmado en la parada 1 del 9.2), como
 * palabra entera: «lema» no casa dentro de «problema». «IA», en mayúsculas.
 */
const VETADAS = /(?<!\p{L})(percentil(es)?|densidad(es)?|regex|lemas?|n-gramas?|generad[oa]s?|detectad[oa]s?)(?!\p{L})/iu;
const IA = /(?<!\p{L})IA(?!\p{L})/u;

/** Las palabras de prosa de un ejemplo (umbral.ts): lo que decide si llega al tramo completo. */
const palabras = (ejemplo: string): number => evaluarLongitud(analizarTexto(ejemplo)).palabrasProsa;

interface Problema {
  condicion: Condicion;
  detalle: string;
}

function comprobar(paquete: Paquete): Problema[] {
  const problemas: Problema[] = [];
  const mal = (condicion: Condicion, detalle: string) => problemas.push({ condicion, detalle });

  for (const e of validarPaquete(paquete).errores) mal('valida', e.texto);

  const declaradas = paquete.cabecera.familias.map((f) => f.id);
  if (JSON.stringify([...declaradas].sort()) !== JSON.stringify([...FAMILIAS].sort())) {
    mal('seis-familias', `declara ${declaradas.join(', ')}; tienen que ser ${FAMILIAS.join(', ')}`);
  }
  const familia = new Map(paquete.cabecera.familias.map((f) => [f.id, f]));
  if (familia.get('canal')?.informativa !== true) mal('canal-informativa', 'la familia canal no es informativa');

  const vistos = new Set<string>();
  const nombres = new Set<string>();
  // Una barra inversa SIN escapar (con un número par de barras delante) seguida de la letra.
  const ASCII = /(?:^|[^\\])(?:\\\\)*\\[bBwW]/;
  const UNICODE = /(?:^|[^\\])(?:\\\\)*\\[pP]\{/;
  for (const r of paquete.reglas) {
    if (r.nivelEvidencia === 'sin fuente') mal('sin-fuente', `regla "${r.id}": nivelEvidencia «sin fuente»`);
    if (!r.fuente.some((f) => f.url.startsWith('https://'))) mal('fuente-https', `regla "${r.id}": ninguna fuente con URL https`);
    if (r.familia === 'canal' && !r.informativa) mal('canal-informativa', `regla "${r.id}": es de canal y no es informativa`);
    if (r.detector !== 'estadístico') {
      const { regex, flags } = r.parametros;
      if (regex !== undefined && ASCII.test(regex)) mal('regex-ascii', `regla "${r.id}": la regex lleva \\b, \\B, \\w o \\W, que en JavaScript son ASCII`);
      if (regex !== undefined && UNICODE.test(regex) && !(flags ?? '').includes('u')) {
        mal('regex-u', `regla "${r.id}": la regex lleva \\p{…} y sus banderas no tienen «u»`);
      }
    }

    if ((r.detector === 'estadístico') !== (r.familia === 'estadistica')) {
      mal('estadistica', `regla "${r.id}": detector ${r.detector} en la familia ${r.familia}; las estadísticas, y solo ellas, van en estadistica`);
    }
    if (r.detector === 'estadístico') {
      const { metrica, direccion } = r.parametros;
      if (!esMetrica(metrica)) mal('estadistica', `regla "${r.id}": «${metrica}» no es una métrica del registro`);
      if (r.generos !== undefined) mal('estadistica', `regla "${r.id}": lleva generos, y ninguna regla estadística los lleva en la v1`);
      if (r.informativa && direccion !== 'ambas') mal('estadistica', `regla "${r.id}": es informativa y mira solo «${direccion}»; las informativas, «ambas»`);
      const { percentil } = r.parametros;
      // Un percentil fuera de p95 y p99 lo rechaza el esquema (condición 1): aquí no se mira su texto.
      const conocido = percentil === 'p95' || percentil === 'p99';
      const [abajo, arriba] = percentil === 'p95' ? ['5', '95'] : ['1', '99'];
      const bordes = direccion === 'mayor' ? [arriba] : direccion === 'menor' ? [abajo] : [abajo, arriba];
      for (const b of conocido ? bordes : []) {
        if (!new RegExp(`percentil ${b}(?!\\d)`).test(r.explicacion)) mal('estadistica', `regla "${r.id}": en ${percentil} su explicación no dice «percentil ${b}»`);
      }
      const cola = (percentil === 'p95' ? 20 : 100) / (direccion === 'ambas' ? 2 : 1);
      if (conocido && !r.explicacion.includes(`1 de cada ${cola} `)) mal('estadistica', `regla "${r.id}": en ${percentil} y «${direccion}» su explicación no dice «1 de cada ${cola}»`);
      if (percentil === 'p99' && !r.excepciones.some((e) => e.startsWith('Corte en el percentil'))) {
        mal('estadistica', `regla "${r.id}": está en p99 y ninguna excepción dice por qué («Corte en el percentil…»)`);
      }
      const minimo = r.informativa ? 1 : 2;
      for (const clase of ['positivos', 'negativos'] as const) {
        const ejemplos = r.ejemplos[clase];
        if (ejemplos.length < minimo) mal('estadistica', `regla "${r.id}": ${ejemplos.length} ${clase}, y hacen falta ${minimo}`);
        ejemplos.forEach((e, i) => {
          const n = palabras(e);
          if (n < COMPLETO) mal('estadistica', `regla "${r.id}": el ${clase.slice(0, -1)} ${i + 1} tiene ${n} palabras de prosa, y hacen falta ${COMPLETO}`);
        });
      }
    }

    if (r.nombre === undefined) mal('nombre', `regla "${r.id}": no tiene nombre`);
    else {
      if (!/^\p{Lu}/u.test(r.nombre)) mal('nombre', `regla "${r.id}": el nombre «${r.nombre}» no empieza por mayúscula`);
      if (r.nombre.toLowerCase().includes(r.id)) mal('nombre', `regla "${r.id}": el nombre «${r.nombre}» contiene el id`);
      if (r.nombre.endsWith('.')) mal('nombre', `regla "${r.id}": el nombre «${r.nombre}» termina en punto`);
      if (nombres.has(r.nombre)) mal('nombre', `regla "${r.id}": el nombre «${r.nombre}» ya lo lleva otra regla del paquete`);
      nombres.add(r.nombre);
    }

    if (r.enClaro === undefined) mal('en-claro', `regla "${r.id}": no tiene enClaro`);
    else {
      if (!/^\p{Lu}/u.test(r.enClaro)) mal('en-claro', `regla "${r.id}": enClaro no empieza por mayúscula`);
      if (!r.enClaro.endsWith('.')) mal('en-claro', `regla "${r.id}": enClaro no termina en punto, como todas`);
      const vetada = VETADAS.exec(r.enClaro) ?? IA.exec(r.enClaro);
      if (vetada !== null) mal('en-claro', `regla "${r.id}": enClaro dice «${vetada[0]}»`);
    }

    if (vistos.has(r.id)) mal('ids', `regla "${r.id}": id repetido`);
    vistos.add(r.id);
    const prefijo = PREFIJOS[r.familia];
    if (prefijo === undefined) mal('ids', `regla "${r.id}": la familia "${r.familia}" no tiene prefijo decidido en PREFIJOS`);
    else if (!r.id.startsWith(prefijo)) mal('ids', `regla "${r.id}": no empieza por "${prefijo}", el prefijo de "${r.familia}"`);

    if (r.peso < 0 && !ATENUANTES.includes(r.peso)) mal('peso', `regla "${r.id}": peso ${r.peso}, y un atenuante solo resta 1 o 2 (−1 o −2)`);
    const informativa = r.informativa || familia.get(r.familia)?.informativa === true;
    const maximo = informativa ? 0 : MAXIMO[r.nivelEvidencia];
    if (maximo === undefined) continue;
    // El máximo vale para sumar y para restar: se compara |peso|.
    const magnitud = Math.abs(r.peso);
    const de = informativa ? 'una informativa' : `«${r.nivelEvidencia}»`;
    if (magnitud > maximo) mal('peso', `regla "${r.id}": peso ${r.peso} y el máximo de ${de} es ${maximo}${r.peso < 0 ? ', también para restar' : ''}`);
    else if (magnitud < maximo && ![r.explicacion, ...r.excepciones].some((t) => /\bpeso\b/i.test(t))) {
      mal('peso', `regla "${r.id}": peso ${r.peso}, por debajo del máximo (${maximo}), y ni la explicación ni las excepciones dicen «peso»`);
    }
  }
  return problemas;
}

describe('el paquete RadiografIA (paquetes/radiografia.json)', () => {
  test('cumple las doce condiciones', () => {
    assert.deepEqual(comprobar(leer()), []);
  });
});

describe('el juez de RadiografIA caza cada condición rota', () => {
  /** La regla del paquete con ese id (y si no está, el caso no vale). */
  const regla = (p: Paquete, id: string): Regla => {
    const r = p.reglas.find((x) => x.id === id);
    assert.ok(r, `el paquete ya no trae la regla ${id}: este caso no rompe nada`);
    return r;
  };
  /** Los parámetros de una regla con regex (patrón o estructural), para romperlos. */
  const patron = (r: Regla): { regex?: string; flags?: string } => {
    assert.ok(r.detector !== 'estadístico', `${r.id} no tiene regex: este caso no rompe nada`);
    return r.parametros as { regex?: string; flags?: string };
  };
  /** Los parámetros de una regla estadística, para romperlos. */
  const estadistica = (r: Regla): { metrica: string; direccion: string; percentil: 'p95' | 'p99' } => {
    assert.ok(r.detector === 'estadístico', `${r.id} no es estadística: este caso no rompe nada`);
    return r.parametros;
  };
  /** Cambia a por b en un texto, y exige que a esté. */
  const cambiar = (texto: string, a: string, b: string): string => {
    assert.ok(texto.includes(a), `no encuentro «${a}»: este caso no rompe nada`);
    return texto.replace(a, () => b);
  };

  const casos: [string, Condicion[], (p: Paquete) => void][] = [
    ['una severidad fuera del enum', ['valida'], (p) => (regla(p, 'pf-raya-densidad').severidad = 'altísima' as Regla['severidad'])],
    ['una regla «sin fuente» (con sus fuentes aún puestas)', ['sin-fuente'], (p) => (regla(p, 'canal-negrita-markdown').nivelEvidencia = 'sin fuente')],
    [
      'una regla con todas sus fuentes en http://',
      ['fuente-https'],
      (p) => regla(p, 'canal-espacio-estrecho-u202f').fuente.forEach((f) => (f.url = cambiar(f.url, 'https://', 'http://'))),
    ],
    // Desde el 5.6 la familia estadistica tiene reglas: el validador también lo caza (paso 2: familia no declarada).
    ['cinco familias (falta estadistica)', ['seis-familias', 'valida'], (p) => (p.cabecera.familias = p.cabecera.familias.filter((f) => f.id !== 'estadistica'))],
    ['siete familias', ['seis-familias'], (p) => p.cabecera.familias.push({ id: 'ortotipografia', nombre: 'Ortotipografía', informativa: false })],
    [
      'la familia canal no es informativa',
      ['canal-informativa'],
      (p) => (p.cabecera.familias.find((f) => f.id === 'canal')!.informativa = false),
    ],
    // El validador también lo caza (paso 2: una regla de una familia informativa tiene que serlo).
    ['una regla de canal que no es informativa', ['valida', 'canal-informativa'], (p) => (regla(p, 'canal-negrita-markdown').informativa = false)],
    ['un id sin el prefijo de su familia', ['ids'], (p) => (regla(p, 'canal-negrita-markdown').id = 'negrita-markdown')],
    // El validador también lo caza (paso 2: ids únicos).
    ['un id repetido', ['valida', 'ids'], (p) => (regla(p, 'pf-raya-espaciada').id = 'pf-raya-densidad')],
    // Desde el 5.6 las seis familias tienen prefijo: la séptima, que no lo tiene, rompe también seis-familias.
    [
      'una regla en una familia sin prefijo decidido',
      ['seis-familias', 'ids'],
      (p) => {
        p.cabecera.familias.push({ id: 'ortotipografia', nombre: 'Ortotipografía', informativa: false });
        const r = regla(p, 'pf-raya-espaciada');
        r.familia = 'ortotipografia';
        r.id = 'orto-raya-espaciada';
      },
    ],
    [
      'una regla de sintaxis con el prefijo «sint-» (sin problema)',
      [],
      (p) => {
        const r = regla(p, 'pf-raya-espaciada');
        r.familia = 'sintaxis';
        r.id = 'sint-raya-espaciada';
      },
    ],
    ['medido en inglés con peso 3 (máximo 2)', ['peso'], (p) => (regla(p, 'pf-raya-densidad').peso = 3)],
    ['anecdótico con peso 2 (máximo 1)', ['peso'], (p) => (regla(p, 'pf-raya-espaciada').peso = 2)],
    ['una regla informativa con peso 1 (máximo 0)', ['peso'], (p) => (regla(p, 'canal-encabezado-markdown').peso = 1)],
    [
      'peso por debajo del máximo sin decir «peso» en la ficha',
      ['peso'],
      (p) => {
        const r = regla(p, 'pf-raya-densidad');
        r.explicacion = cambiar(r.explicacion, 'Peso 1, y no 2', 'Uno, y no dos');
      },
    ],
    // Encargo 5.3: los atenuantes (peso negativo) restan 1 o 2, y la familia discurso lleva «disc-».
    ['un atenuante de −3 (solo −1 o −2)', ['peso'], (p) => (regla(p, 'pf-raya-densidad').peso = -3)],
    ['un atenuante de −2, con «peso» en la ficha (sin problema)', [], (p) => (regla(p, 'pf-raya-densidad').peso = -2)],
    // Encargo 5.4: el máximo por evidencia vale también para restar (|peso|).
    ['un atenuante anecdótico a −2 (máximo 1, también para restar)', ['peso'], (p) => (regla(p, 'disc-anecdota-en-primera-persona').peso = -2)],
    [
      'una regla de discurso con el prefijo «disc-» (sin problema)',
      [],
      (p) => {
        const r = regla(p, 'pf-raya-espaciada');
        r.familia = 'discurso';
        r.id = 'disc-raya-espaciada';
      },
    ],
    [
      'una regla de discurso sin el prefijo «disc-»',
      ['ids'],
      (p) => {
        const r = regla(p, 'pf-raya-espaciada');
        r.familia = 'discurso';
        r.id = 'raya-espaciada';
      },
    ],
    // Encargo 5.2: ni \b ni \w, y \p{…} solo con la bandera u.
    ['una regex con \\b', ['regex-ascii'], (p) => (patron(regla(p, 'pf-raya-espaciada')).regex = '\\bno\\b')],
    ['una regex con \\w', ['regex-ascii'], (p) => (patron(regla(p, 'pf-raya-espaciada')).regex = '\\w+\\s—')],
    ['una regex con \\W dentro de una clase', ['regex-ascii'], (p) => (patron(regla(p, 'pf-raya-espaciada')).regex = '[\\W]—')],
    ['una barra escapada seguida de «b» no es \\b (sin problema)', [], (p) => (patron(regla(p, 'pf-raya-espaciada')).regex = '\\\\b')],
    // Encargo 5.6: la familia estadística.
    ['una regla estadística sin el prefijo «est-»', ['ids'], (p) => (regla(p, 'est-frases-cortas').id = 'estadistica-frases-cortas')],
    [
      'una regla estadística fuera de la familia estadistica',
      ['estadistica'],
      (p) => {
        const r = regla(p, 'est-frases-cortas');
        r.familia = 'sintaxis';
        r.id = 'sint-frases-cortas';
      },
    ],
    [
      'una regla de patrón en la familia estadistica',
      ['estadistica'],
      (p) => {
        const r = regla(p, 'pf-raya-espaciada');
        r.familia = 'estadistica';
        r.id = 'est-raya-espaciada';
      },
    ],
    // El validador también lo caza (paso 2: la métrica no está en el registro).
    ['una regla estadística con una métrica fuera del registro', ['valida', 'estadistica'], (p) => (estadistica(regla(p, 'est-frases-cortas')).metrica = 'compresion-gzip')],
    // El esquema lo caza (enum de percentil): la condición 10 no lo repite.
    ['una regla estadística con percentil «p90»', ['valida'], (p) => (estadistica(regla(p, 'est-frases-cortas')).percentil = 'p90' as 'p95')],
    ['una regla estadística con generos', ['estadistica'], (p) => (regla(p, 'est-frases-cortas').generos = ['opinion'])],
    ['una informativa estadística que solo mira «mayor»', ['estadistica'], (p) => (estadistica(regla(p, 'est-ttr')).direccion = 'mayor')],
    ['una regla estadística que puntúa con un solo negativo', ['estadistica'], (p) => regla(p, 'est-frases-cortas').ejemplos.negativos.splice(1)],
    // Encargo 5.6, parada 2: el texto de la ficha dice el corte de su parámetro, y un p99 dice por qué.
    [
      'est-pocas-comas en p99 sin la excepción que dice por qué',
      ['estadistica'],
      (p) => {
        const r = regla(p, 'est-pocas-comas');
        r.excepciones = r.excepciones.filter((e) => !e.startsWith('Corte en el percentil'));
      },
    ],
    ['est-frases-cortas pasada a p99 con su texto de p95', ['estadistica'], (p) => (estadistica(regla(p, 'est-frases-cortas')).percentil = 'p99')],
    [
      'una informativa que no dice «1 de cada 10»',
      ['estadistica'],
      (p) => {
        const r = regla(p, 'est-ttr');
        r.explicacion = cambiar(r.explicacion, '1 de cada 10 ', 'uno de cada diez ');
      },
    ],
    [
      'un positivo estadístico de menos de 300 palabras de prosa',
      ['estadistica'],
      (p) => {
        const r = regla(p, 'est-frases-cortas');
        r.ejemplos.positivos[0] = r.ejemplos.positivos[0]!.split(' ').slice(0, 250).join(' ');
      },
    ],
    [
      'una regex con \\p{L} sin la bandera u',
      ['regex-u'],
      (p) => {
        const q = patron(regla(p, 'pf-raya-espaciada'));
        q.regex = '(?<!\\p{L})—';
        delete q.flags;
      },
    ],
    // Encargo 7.1: el nombre de la regla.
    ['una regla sin nombre', ['nombre'], (p) => delete regla(p, 'pf-raya-densidad').nombre],
    // El esquema también lo caza (minLength 3).
    ['un nombre vacío', ['valida', 'nombre'], (p) => (regla(p, 'pf-raya-densidad').nombre = '')],
    ['un nombre que empieza por minúscula', ['nombre'], (p) => (regla(p, 'pf-raya-densidad').nombre = 'nombre en minúscula')],
    ['un nombre que contiene el id', ['nombre'], (p) => (regla(p, 'pf-raya-densidad').nombre = 'Regla pf-raya-densidad')],
    ['un nombre que termina en punto', ['nombre'], (p) => (regla(p, 'pf-raya-densidad').nombre = 'Nombre con punto.')],
    ['dos reglas con el mismo nombre', ['nombre'], (p) => (regla(p, 'pf-raya-espaciada').nombre = regla(p, 'pf-raya-densidad').nombre)],
    // Encargo 9.2: la frase en claro.
    ['una regla sin enClaro', ['en-claro'], (p) => delete regla(p, 'pf-raya-densidad').enClaro],
    // El esquema también lo caza (minLength 3).
    ['un enClaro vacío', ['valida', 'en-claro'], (p) => (regla(p, 'pf-raya-densidad').enClaro = '')],
    ['un enClaro que empieza por minúscula', ['en-claro'], (p) => (regla(p, 'pf-raya-densidad').enClaro = 'cada raya del texto cuenta.')],
    ['un enClaro sin punto final', ['en-claro'], (p) => (regla(p, 'pf-raya-densidad').enClaro = 'Cada raya del texto cuenta')],
    ['un enClaro con «percentil»', ['en-claro'], (p) => (regla(p, 'pf-raya-densidad').enClaro = 'Por encima del percentil 95.')],
    ['un enClaro con «IA»', ['en-claro'], (p) => (regla(p, 'pf-raya-densidad').enClaro = 'Rayas de la IA.')],
  ];

  test('hay al menos un caso por condición', () => {
    const cubiertas = new Set(casos.flatMap(([, condiciones]) => condiciones));
    assert.deepEqual([...cubiertas].sort(), ['canal-informativa', 'en-claro', 'estadistica', 'fuente-https', 'ids', 'nombre', 'peso', 'regex-ascii', 'regex-u', 'seis-familias', 'sin-fuente', 'valida']);
  });

  for (const [nombre, esperadas, romper] of casos) {
    test(`${nombre} → ${esperadas.join(' + ')}`, () => {
      const p = leer();
      romper(p);
      const problemas = comprobar(p);
      assert.deepEqual([...new Set(problemas.map((x) => x.condicion))].sort(), [...esperadas].sort(), JSON.stringify(problemas, null, 2));
    });
  }
});
