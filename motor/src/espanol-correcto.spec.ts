/**
 * El juez del segundo paquete incluido, paquetes/espanol-correcto.json
 * (encargo 5.4; decisión 7 del 29/09: «siete avisos de norma RAE… nada más
 * en la v1»). Lo que el esquema del motor no exige y este paquete sí. Ocho
 * condiciones:
 *   1. valida — pasa validarPaquete sin ningún error.
 *   2. siete-reglas — exactamente siete: el plan dice siete y ninguna más.
 *   3. norma — todas con nivelEvidencia «norma»: son avisos de norma, no de
 *      estilo IA.
 *   4. peso-1 — todas con peso 1 [PROPIO, estrategia del 30/09]: el paquete
 *      cuenta avisos de norma por cada 1.000 palabras.
 *   5. fuente-rae — toda regla cita al menos una sección de rae.es
 *      (https://www.rae.es/…), la que la respalda (Regla Cero del encargo).
 *   6. ninguna-informativa — ni las reglas ni las familias son informativas:
 *      un aviso de norma se cuenta.
 *   7. prefijos — las familias declaradas son exactamente gramatica y
 *      ortotipografia, y cada id empieza por el prefijo de su familia
 *      (gram-, orto-).
 *   8. nombre (encargo 7.1) — toda regla lleva nombre (el esquema lo deja
 *      opcional, por los paquetes de terceros), que empieza por mayúscula, no
 *      contiene el id, no termina en punto y no lo lleva otra regla del
 *      paquete. Lo que dice cada nombre lo firmó Antonio en la parada 1 del 7.1.
 *  9. enClaro (encargo 9.2) — toda regla lleva su frase en claro (el
 *      esquema la deja opcional y la limita a 3-140 caracteres), que empieza
 *      por mayúscula, termina en punto, como todas, y no usa las palabras
 *      vetadas en la firma: ni percentil, densidad, regex, lema ni n-grama,
 *      ni «IA», «generado» o «detectado» (se dice «rasgos de estilo de
 *      asistente»). Lo que dice cada frase lo firmó Antonio en la parada 1 del
 *      9.2.
 *
 * Cada condición tiene al menos un caso que la rompe sobre una copia del
 * paquete, y el juez tiene que nombrar esa condición y ninguna otra (salvo
 * cuando el validador también la caza: se dice en el caso).
 *
 * Y desde el encargo 6.2 (respuesta a la parada 1, punto 9): P22,
 * orto-moneda-antepuesta, subraya la cantidad entera, no solo el símbolo y la
 * primera cifra, y sin comerse el punto final de la frase. Cada positivo de su
 * ficha lleva aquí su fragmento esperado: el esquema no admite un fragmento en
 * los ejemplos (son cadenas), y ejemplos.spec.ts solo mira que disparen.
 *
 * ⚠️ El paquete se lee DENTRO de cada test (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarPaquete } from './validar.ts';
import { detectar } from './analizar.ts';
import { analizarTexto } from './texto.ts';
import type { Paquete, Regla } from './paquete.ts';

const RUTA = new URL('../../paquetes/espanol-correcto.json', import.meta.url);
const leer = (): Paquete => JSON.parse(readFileSync(RUTA, 'utf8')) as Paquete;

/** Las dos familias del paquete y el prefijo de sus ids. */
const PREFIJOS: Readonly<Record<string, string>> = { gramatica: 'gram-', ortotipografia: 'orto-' };
const REGLAS = 7;
const RAE = 'https://www.rae.es/';

type Condicion = 'valida' | 'siete-reglas' | 'norma' | 'peso-1' | 'fuente-rae' | 'ninguna-informativa' | 'prefijos' | 'nombre' | 'en-claro';

/**
 * Las palabras vetadas en enClaro (firmado en la parada 1 del 9.2), como
 * palabra entera: «lema» no casa dentro de «problema». «IA», en mayúsculas.
 */
const VETADAS = /(?<!\p{L})(percentil(es)?|densidad(es)?|regex|lemas?|n-gramas?|generad[oa]s?|detectad[oa]s?)(?!\p{L})/iu;
const IA = /(?<!\p{L})IA(?!\p{L})/u;

interface Problema {
  condicion: Condicion;
  detalle: string;
}

function comprobar(paquete: Paquete): Problema[] {
  const problemas: Problema[] = [];
  const mal = (condicion: Condicion, detalle: string) => problemas.push({ condicion, detalle });

  for (const e of validarPaquete(paquete).errores) mal('valida', e.texto);
  if (paquete.reglas.length !== REGLAS) mal('siete-reglas', `trae ${paquete.reglas.length} reglas y tienen que ser ${REGLAS}`);

  for (const f of paquete.cabecera.familias.filter((x) => x.informativa)) mal('ninguna-informativa', `la familia "${f.id}" es informativa`);
  const declaradas = paquete.cabecera.familias.map((f) => f.id);
  if (JSON.stringify([...declaradas].sort()) !== JSON.stringify(Object.keys(PREFIJOS).sort())) {
    mal('prefijos', `declara ${declaradas.join(', ')}; tienen que ser ${Object.keys(PREFIJOS).join(', ')}`);
  }

  const nombres = new Set<string>();
  for (const r of paquete.reglas) {
    if (r.nivelEvidencia !== 'norma') mal('norma', `regla "${r.id}": nivelEvidencia «${r.nivelEvidencia}»`);
    if (r.peso !== 1) mal('peso-1', `regla "${r.id}": peso ${r.peso}`);
    if (r.informativa) mal('ninguna-informativa', `regla "${r.id}": es informativa y un aviso de norma se cuenta`);
    if (!r.fuente.some((f) => f.url.startsWith(RAE))) mal('fuente-rae', `regla "${r.id}": ninguna fuente en ${RAE}`);
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
    const prefijo = PREFIJOS[r.familia];
    if (prefijo === undefined) mal('prefijos', `regla "${r.id}": la familia "${r.familia}" no es de este paquete`);
    else if (!r.id.startsWith(prefijo)) mal('prefijos', `regla "${r.id}": no empieza por "${prefijo}", el prefijo de "${r.familia}"`);
  }
  return problemas;
}

describe('el paquete «Español correcto» (paquetes/espanol-correcto.json)', () => {
  test('cumple las nueve condiciones', () => {
    assert.deepEqual(comprobar(leer()), []);
  });
});

describe('el juez de «Español correcto» caza cada condición rota', () => {
  /** La regla del paquete con ese id (y si no está, el caso no vale). */
  const regla = (p: Paquete, id: string): Regla => {
    const r = p.reglas.find((x) => x.id === id);
    assert.ok(r, `el paquete ya no trae la regla ${id}: este caso no rompe nada`);
    return r;
  };

  const casos: [string, Condicion[], (p: Paquete) => void][] = [
    ['una severidad fuera del enum', ['valida'], (p) => (regla(p, 'orto-moneda-antepuesta').severidad = 'altísima' as Regla['severidad'])],
    ['seis reglas', ['siete-reglas'], (p) => (p.reglas = p.reglas.filter((r) => r.id !== 'orto-moneda-antepuesta'))],
    ['ocho reglas (una copia con otro id y otro nombre)', ['siete-reglas'], (p) => p.reglas.push({ ...regla(p, 'orto-moneda-antepuesta'), id: 'orto-moneda-copia', nombre: 'Copia de la moneda antepuesta' })],
    ['una regla «medido en inglés»', ['norma'], (p) => (regla(p, 'gram-pasiva-perifrastica').nivelEvidencia = 'medido en inglés')],
    ['una regla con peso 2', ['peso-1'], (p) => (regla(p, 'orto-cifras-a-la-inglesa').peso = 2)],
    ['una regla con peso 0', ['peso-1'], (p) => (regla(p, 'orto-cifras-a-la-inglesa').peso = 0)],
    [
      'una regla sin ninguna fuente de rae.es',
      ['fuente-rae'],
      (p) => (regla(p, 'orto-moneda-antepuesta').fuente = [{ titulo: 'FundéuRAE', url: 'https://www.fundeu.es/recomendacion/simbolos/' }]),
    ],
    ['una regla informativa', ['ninguna-informativa'], (p) => (regla(p, 'orto-punto-dentro-de-comillas').informativa = true)],
    // El validador también lo caza (paso 2: una regla de una familia informativa tiene que serlo).
    [
      'una familia informativa',
      ['valida', 'ninguna-informativa'],
      (p) => (p.cabecera.familias.find((f) => f.id === 'ortotipografia')!.informativa = true),
    ],
    ['un id sin el prefijo de su familia', ['prefijos'], (p) => (regla(p, 'orto-moneda-antepuesta').id = 'moneda-antepuesta')],
    ['una regla de gramática con el prefijo «orto-»', ['prefijos'], (p) => (regla(p, 'gram-pasiva-perifrastica').familia = 'ortotipografia')],
    ['una tercera familia declarada', ['prefijos'], (p) => p.cabecera.familias.push({ id: 'lexico', nombre: 'Léxico', informativa: false })],
    // Encargo 7.1: el nombre de la regla.
    ['una regla sin nombre', ['nombre'], (p) => delete regla(p, 'orto-moneda-antepuesta').nombre],
    // El esquema también lo caza (minLength 3).
    ['un nombre vacío', ['valida', 'nombre'], (p) => (regla(p, 'orto-moneda-antepuesta').nombre = '')],
    ['un nombre que empieza por minúscula', ['nombre'], (p) => (regla(p, 'orto-moneda-antepuesta').nombre = 'nombre en minúscula')],
    ['un nombre que contiene el id', ['nombre'], (p) => (regla(p, 'orto-moneda-antepuesta').nombre = 'Regla orto-moneda-antepuesta')],
    ['un nombre que termina en punto', ['nombre'], (p) => (regla(p, 'orto-moneda-antepuesta').nombre = 'Nombre con punto.')],
    ['dos reglas con el mismo nombre', ['nombre'], (p) => (regla(p, 'orto-cifras-a-la-inglesa').nombre = regla(p, 'orto-moneda-antepuesta').nombre)],
    // Encargo 9.2: la frase en claro.
    ['una regla sin enClaro', ['en-claro'], (p) => delete regla(p, 'orto-moneda-antepuesta').enClaro],
    // El esquema también lo caza (minLength 3).
    ['un enClaro vacío', ['valida', 'en-claro'], (p) => (regla(p, 'orto-moneda-antepuesta').enClaro = '')],
    ['un enClaro que empieza por minúscula', ['en-claro'], (p) => (regla(p, 'orto-moneda-antepuesta').enClaro = 'el símbolo delante.')],
    ['un enClaro sin punto final', ['en-claro'], (p) => (regla(p, 'orto-moneda-antepuesta').enClaro = 'El símbolo delante')],
    ['un enClaro con «regex»', ['en-claro'], (p) => (regla(p, 'orto-moneda-antepuesta').enClaro = 'Lo que busca la regex.')],
    ['un enClaro con «generado»', ['en-claro'], (p) => (regla(p, 'orto-moneda-antepuesta').enClaro = 'Texto generado.')],
  ];

  test('hay al menos un caso por condición', () => {
    const cubiertas = new Set(casos.flatMap(([, condiciones]) => condiciones));
    assert.deepEqual([...cubiertas].sort(), ['en-claro', 'fuente-rae', 'ninguna-informativa', 'nombre', 'norma', 'peso-1', 'prefijos', 'siete-reglas', 'valida']);
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

describe('orto-moneda-antepuesta (P22) subraya la cantidad entera', () => {
  /** Cada positivo de la ficha con el fragmento que tiene que subrayar: el símbolo y la cifra entera, sin el punto final. */
  const FRAGMENTOS: Readonly<Record<string, string>> = {
    'Cuesta $100.': '$100',
    'Cuesta €100.': '€100',
    'El billete vale £ 20.': '£ 20',
    'Cuesta $1.500,00.': '$1.500,00',
  };

  test('cada positivo, con su fragmento esperado', () => {
    const regla = leer().reglas.find((r) => r.id === 'orto-moneda-antepuesta');
    assert.ok(regla, 'el paquete ya no trae orto-moneda-antepuesta');
    assert.deepEqual([...regla.ejemplos.positivos].sort(), Object.keys(FRAGMENTOS).sort(), 'los positivos de la ficha y los de este juez');
    for (const ejemplo of regla.ejemplos.positivos) {
      assert.deepEqual(detectar(regla, analizarTexto(ejemplo)).map((s) => s.fragmento), [FRAGMENTOS[ejemplo]], ejemplo);
    }
  });
});
