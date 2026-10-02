/**
 * Los jueces de los textos de ejemplo con el motor (encargo 6.3, a). Los
 * jueces 1 y 4 del encargo miran la web construida y son el 7 y el 8 de
 * construccion.spec.ts.
 *
 *   2. Cada texto de web/public/ejemplos/ tiene 300 palabras de prosa o más
 *      con el motor: el análisis completo.
 *   3. Las cifras del resumen de docs/ejemplos.md (palabras de prosa, tramo,
 *      y total y banda de cada paquete) son las que da hoy analizar() con los
 *      dos paquetes y el género que selecciona la pantalla. Si cambia una
 *      regla, la calibración o un texto, el documento no envejece sin que se
 *      note.
 *
 * Y el género de los ejemplos está en la calibración de RadiografIA: si no, el
 * selector no tendría esa opción.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Resultado } from '@radiografia/motor/navegador';
import { EJEMPLOS, GENERO_DE_LOS_EJEMPLOS } from '../src/pantalla/ejemplos.ts';
import { generosDe } from '../src/pantalla/generos.ts';
import { motorDelNavegador, paquetesIncluidos } from './apoyo.ts';

const PUBLICOS = new URL('../public/ejemplos/', import.meta.url);
const DOCUMENTO = new URL('../../docs/ejemplos.md', import.meta.url);
const MINIMO = 300;

const formato = new Intl.NumberFormat('es', { maximumFractionDigits: 2 });

async function analizarEjemplo(fichero: string): Promise<Resultado> {
  const { analizar } = await motorDelNavegador();
  return analizar(readFileSync(new URL(fichero, PUBLICOS), 'utf8'), paquetesIncluidos(), { genero: GENERO_DE_LOS_EJEMPLOS });
}

/** Las filas del resumen, como las escribe docs/ejemplos.md, de un resultado de analizar(). */
function filasDe(r: Resultado): Record<string, string> {
  const filas: Record<string, string> = { 'Palabras de prosa': String(r.palabrasProsa), Tramo: r.tramoDeCalibracion ?? 'insuficiente' };
  for (const p of r.paquetes) {
    filas[`${p.paquete}: total`] = p.puntuacion.total === null ? '—' : formato.format(p.puntuacion.total);
    filas[`${p.paquete}: banda`] = p.banda === null ? 'sin escala' : p.banda.banda;
  }
  return filas;
}

/** La tabla de «## Resumen» de docs/ejemplos.md: fichero → fila → celda. */
function resumenDelDocumento(): Map<string, Record<string, string>> {
  const md = readFileSync(DOCUMENTO, 'utf8').replace(/\r\n/g, '\n');
  const seccion = md.split('\n## Resumen\n')[1]?.split('\n## ')[0];
  assert.ok(seccion !== undefined, 'docs/ejemplos.md no tiene la sección «## Resumen»');
  const filas = seccion
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
  const [cabecera = [], , ...datos] = filas;
  const tabla = new Map<string, Record<string, string>>();
  cabecera.forEach((fichero, columna) => {
    if (columna > 0) tabla.set(fichero, Object.fromEntries(datos.map((fila) => [fila[0], fila[columna]])));
  });
  return tabla;
}

describe('los textos de ejemplo con el motor', () => {
  test(`2 · cada ejemplo tiene ${MINIMO} palabras de prosa o más`, async () => {
    for (const fichero of Object.values(EJEMPLOS)) {
      const r = await analizarEjemplo(fichero);
      assert.ok(r.palabrasProsa >= MINIMO, `${fichero}: ${r.palabrasProsa} palabras de prosa`);
    }
  });

  test('3 · las cifras del resumen de docs/ejemplos.md son las de analizar() hoy', async () => {
    const resumen = resumenDelDocumento();
    assert.deepEqual([...resumen.keys()].sort(), Object.values(EJEMPLOS).sort(), 'las columnas del resumen');
    for (const fichero of Object.values(EJEMPLOS)) assert.deepEqual(resumen.get(fichero), filasDe(await analizarEjemplo(fichero)), fichero);
  });

  test('el género de los ejemplos está en la calibración de RadiografIA', () => {
    assert.ok(generosDe(paquetesIncluidos()).includes(GENERO_DE_LOS_EJEMPLOS), `«${GENERO_DE_LOS_EJEMPLOS}» no está en el selector`);
  });
});
