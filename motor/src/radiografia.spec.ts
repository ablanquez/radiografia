/**
 * El juez del paquete real, paquetes/radiografia.json (encargo 5.1; punto 5
 * del plan): lo que el esquema del motor no exige, porque sirve también a
 * paquetes de terceros, y RadiografIA sí. Nueve condiciones:
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
 *      regla informativa, o de familia informativa, 0.
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
import type { Paquete, Regla } from './paquete.ts';

const RUTA = new URL('../../paquetes/radiografia.json', import.meta.url);
const leer = (): Paquete => JSON.parse(readFileSync(RUTA, 'utf8')) as Paquete;

const FAMILIAS = ['lexico', 'sintaxis', 'puntuacion-formato', 'estadistica', 'discurso', 'canal'];

/** El prefijo del id de cada familia con reglas (encargos 5.1 y 5.2). Las demás lo deciden en su tanda. */
const PREFIJOS: Readonly<Record<string, string>> = { canal: 'canal-', 'puntuacion-formato': 'pf-', lexico: 'lex-' };

/** El peso máximo de cada nivel de evidencia. «sin fuente» no tiene: ya lo prohíbe la condición 2. */
const MAXIMO: Readonly<Partial<Record<Regla['nivelEvidencia'], number>>> = {
  'medido en español': 3,
  'medido en inglés': 2,
  anecdótico: 1,
  norma: 0,
};

type Condicion = 'valida' | 'sin-fuente' | 'fuente-https' | 'seis-familias' | 'canal-informativa' | 'ids' | 'peso' | 'regex-ascii' | 'regex-u';

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

    if (vistos.has(r.id)) mal('ids', `regla "${r.id}": id repetido`);
    vistos.add(r.id);
    const prefijo = PREFIJOS[r.familia];
    if (prefijo === undefined) mal('ids', `regla "${r.id}": la familia "${r.familia}" no tiene prefijo decidido en PREFIJOS`);
    else if (!r.id.startsWith(prefijo)) mal('ids', `regla "${r.id}": no empieza por "${prefijo}", el prefijo de "${r.familia}"`);

    const informativa = r.informativa || familia.get(r.familia)?.informativa === true;
    const maximo = informativa ? 0 : MAXIMO[r.nivelEvidencia];
    if (maximo === undefined) continue;
    if (r.peso > maximo) mal('peso', `regla "${r.id}": peso ${r.peso} y el máximo de ${informativa ? 'una informativa' : `«${r.nivelEvidencia}»`} es ${maximo}`);
    else if (r.peso < maximo && ![r.explicacion, ...r.excepciones].some((t) => /\bpeso\b/i.test(t))) {
      mal('peso', `regla "${r.id}": peso ${r.peso}, por debajo del máximo (${maximo}), y ni la explicación ni las excepciones dicen «peso»`);
    }
  }
  return problemas;
}

describe('el paquete RadiografIA (paquetes/radiografia.json)', () => {
  test('cumple las nueve condiciones', () => {
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
    ['cinco familias (falta estadistica)', ['seis-familias'], (p) => (p.cabecera.familias = p.cabecera.familias.filter((f) => f.id !== 'estadistica'))],
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
    [
      'una regla en una familia sin prefijo decidido',
      ['ids'],
      (p) => {
        const r = regla(p, 'pf-raya-espaciada');
        r.familia = 'sintaxis';
        r.id = 'sintaxis-raya-espaciada';
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
    // Encargo 5.2: ni \b ni \w, y \p{…} solo con la bandera u.
    ['una regex con \\b', ['regex-ascii'], (p) => (patron(regla(p, 'pf-raya-espaciada')).regex = '\\bno\\b')],
    ['una regex con \\w', ['regex-ascii'], (p) => (patron(regla(p, 'pf-raya-espaciada')).regex = '\\w+\\s—')],
    ['una regex con \\W dentro de una clase', ['regex-ascii'], (p) => (patron(regla(p, 'pf-raya-espaciada')).regex = '[\\W]—')],
    ['una barra escapada seguida de «b» no es \\b (sin problema)', [], (p) => (patron(regla(p, 'pf-raya-espaciada')).regex = '\\\\b')],
    [
      'una regex con \\p{L} sin la bandera u',
      ['regex-u'],
      (p) => {
        const q = patron(regla(p, 'pf-raya-espaciada'));
        q.regex = '(?<!\\p{L})—';
        delete q.flags;
      },
    ],
  ];

  test('hay al menos un caso por condición', () => {
    const cubiertas = new Set(casos.flatMap(([, condiciones]) => condiciones));
    assert.deepEqual([...cubiertas].sort(), ['canal-informativa', 'fuente-https', 'ids', 'peso', 'regex-ascii', 'regex-u', 'seis-familias', 'sin-fuente', 'valida']);
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
