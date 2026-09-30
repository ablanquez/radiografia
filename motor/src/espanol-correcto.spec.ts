/**
 * El juez del segundo paquete incluido, paquetes/espanol-correcto.json
 * (encargo 5.4; decisión 7 del 29/09: «siete avisos de norma RAE… nada más
 * en la v1»). Lo que el esquema del motor no exige y este paquete sí. Siete
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
 *
 * Cada condición tiene al menos un caso que la rompe sobre una copia del
 * paquete, y el juez tiene que nombrar esa condición y ninguna otra (salvo
 * cuando el validador también la caza: se dice en el caso).
 *
 * ⚠️ El paquete se lee DENTRO de cada test (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validarPaquete } from './validar.ts';
import type { Paquete, Regla } from './paquete.ts';

const RUTA = new URL('../../paquetes/espanol-correcto.json', import.meta.url);
const leer = (): Paquete => JSON.parse(readFileSync(RUTA, 'utf8')) as Paquete;

/** Las dos familias del paquete y el prefijo de sus ids. */
const PREFIJOS: Readonly<Record<string, string>> = { gramatica: 'gram-', ortotipografia: 'orto-' };
const REGLAS = 7;
const RAE = 'https://www.rae.es/';

type Condicion = 'valida' | 'siete-reglas' | 'norma' | 'peso-1' | 'fuente-rae' | 'ninguna-informativa' | 'prefijos';

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

  for (const r of paquete.reglas) {
    if (r.nivelEvidencia !== 'norma') mal('norma', `regla "${r.id}": nivelEvidencia «${r.nivelEvidencia}»`);
    if (r.peso !== 1) mal('peso-1', `regla "${r.id}": peso ${r.peso}`);
    if (r.informativa) mal('ninguna-informativa', `regla "${r.id}": es informativa y un aviso de norma se cuenta`);
    if (!r.fuente.some((f) => f.url.startsWith(RAE))) mal('fuente-rae', `regla "${r.id}": ninguna fuente en ${RAE}`);
    const prefijo = PREFIJOS[r.familia];
    if (prefijo === undefined) mal('prefijos', `regla "${r.id}": la familia "${r.familia}" no es de este paquete`);
    else if (!r.id.startsWith(prefijo)) mal('prefijos', `regla "${r.id}": no empieza por "${prefijo}", el prefijo de "${r.familia}"`);
  }
  return problemas;
}

describe('el paquete «Español correcto» (paquetes/espanol-correcto.json)', () => {
  test('cumple las siete condiciones', () => {
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
    ['ocho reglas (una copia con otro id)', ['siete-reglas'], (p) => p.reglas.push({ ...regla(p, 'orto-moneda-antepuesta'), id: 'orto-moneda-copia' })],
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
  ];

  test('hay al menos un caso por condición', () => {
    const cubiertas = new Set(casos.flatMap(([, condiciones]) => condiciones));
    assert.deepEqual([...cubiertas].sort(), ['fuente-rae', 'ninguna-informativa', 'norma', 'peso-1', 'prefijos', 'siete-reglas', 'valida']);
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
