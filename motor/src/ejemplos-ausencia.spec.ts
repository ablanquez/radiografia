/**
 * El juez de los ejemplos de las reglas con `ausencia` o `generos` (encargo
 * 5.3, c). ejemplos.spec.ts las salta —con la misma condición que aquí—
 * porque dependen del análisis entero: una ausencia se juzga sobre el texto
 * completo y solo en tramo «completo», y `generos`, del género del análisis.
 * Por cada una de esas reglas de cada paquete de PAQUETES, cada ejemplo se
 * analiza con analizar(ejemplo, [paquete], { genero }) y el PRIMER género de
 * su lista («general» si no trae `generos`):
 *   · la regla se evalúa: no está en «noAplicadas» y, si es de ausencia, el
 *     ejemplo llega al tramo «completo». Un negativo que no se evalúa sería un
 *     verde falso;
 *   · positivo → la regla aparece: si es de ausencia, en las señales de texto
 *     (en contexto si es informativa); si no, en las señales;
 *   · negativo → no aparece en ninguna de las tres listas.
 * Y si la regla trae `generos`, cada ejemplo se analiza también con
 * «general»: la regla va a «noAplicadas» y no aparece en ninguna lista
 * («general» nunca activa una regla con generos).
 * [PROPIO] Las reglas estadísticas no pasan por aquí: las juzga
 *    ejemplos-estadisticos.spec.ts, con «general». Hoy ninguna trae `generos`;
 *    la que lo traiga tendrá que juzgarse con su género (tanda 5.6).
 *
 * ⚠️ Los paquetes se leen al cargar el fichero, fuera de los tests, porque de
 *    ellos salen los tests. Si uno no se puede leer, falla el fichero entero y
 *    `node --test` lo cuenta (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizar } from './analizar.ts';
import type { Paquete, Regla } from './paquete.ts';
import { COMPLETO } from './umbral.ts';
import { GENERO_POR_DEFECTO } from './validar.ts';

const PAQUETES = [
  new URL('../fixtures/paquete-prueba-interno.json', import.meta.url),
  new URL('../fixtures/paquete-prueba-secundario.json', import.meta.url),
  new URL('../../paquetes/radiografia.json', import.meta.url),
];

/** Las seis primeras palabras del ejemplo, para el nombre del test (los de ausencia son textos enteros). */
const inicio = (ejemplo: string): string => `${ejemplo.split(/\s+/).slice(0, 6).join(' ')}…`;

/** Analiza el ejemplo y dice si la regla quedó sin aplicar y en qué listas aparece. */
function juzgar(paquete: Paquete, regla: Regla, ejemplo: string, genero: string) {
  const r = analizar(ejemplo, [paquete], { genero });
  const esta = (xs: readonly { reglaId: string }[]) => xs.some((s) => s.reglaId === regla.id);
  const donde = [esta(r.senales) ? 'señales' : null, esta(r.senalesTexto) ? 'señales de texto' : null, esta(r.contexto) ? 'contexto' : null];
  return { r, noAplicada: r.noAplicadas.find((n) => n.reglaId === regla.id), donde: donde.filter((d) => d !== null) };
}

for (const url of PAQUETES) {
  const fichero = url.pathname.split('/').at(-1)!;
  const paquete = JSON.parse(readFileSync(url, 'utf8')) as Paquete;
  const aparte = paquete.reglas.filter((r) => r.detector !== 'estadístico' && (r.parametros.ausencia === true || r.generos !== undefined));

  describe(`los ejemplos con ausencia o generos de ${fichero}`, () => {
    for (const regla of aparte) {
      const ausencia = regla.detector !== 'estadístico' && regla.parametros.ausencia === true;
      const genero = regla.generos?.[0] ?? GENERO_POR_DEFECTO;
      const lista = ausencia ? (regla.informativa ? 'contexto' : 'señales de texto') : 'señales';

      /** Que la regla se haya evaluado de verdad sobre el ejemplo. */
      const evaluada = (j: ReturnType<typeof juzgar>) => {
        assert.equal(j.noAplicada, undefined, `${regla.id} no se evaluó: ${j.noAplicada?.motivo}`);
        if (ausencia) {
          assert.equal(j.r.tramo, 'completo', `${regla.id}: el ejemplo tiene ${j.r.palabrasProsa} palabras de prosa y una ausencia solo se juzga desde ${COMPLETO}`);
        }
      };

      regla.ejemplos.positivos.forEach((ejemplo, i) => {
        test(`${regla.id} · positivo ${i + 1} («${inicio(ejemplo)}») con «${genero}» → en ${lista}`, () => {
          const j = juzgar(paquete, regla, ejemplo, genero);
          evaluada(j);
          assert.deepEqual(j.donde, [lista], `${regla.id} no aparece en ${lista}${j.donde.length > 0 ? ` (aparece en ${j.donde.join(', ')})` : ''}`);
        });
      });
      regla.ejemplos.negativos.forEach((ejemplo, i) => {
        test(`${regla.id} · negativo ${i + 1} («${inicio(ejemplo)}») con «${genero}» → en ninguna lista`, () => {
          const j = juzgar(paquete, regla, ejemplo, genero);
          evaluada(j);
          assert.deepEqual(j.donde, [], `${regla.id} aparece en ${j.donde.join(', ')}`);
        });
      });

      if (regla.generos !== undefined) {
        [...regla.ejemplos.positivos, ...regla.ejemplos.negativos].forEach((ejemplo, i) => {
          test(`${regla.id} · ejemplo ${i + 1} («${inicio(ejemplo)}») con «${GENERO_POR_DEFECTO}» → en noAplicadas`, () => {
            const j = juzgar(paquete, regla, ejemplo, GENERO_POR_DEFECTO);
            assert.ok(j.noAplicada !== undefined, `${regla.id} se evaluó con «${GENERO_POR_DEFECTO}»`);
            assert.deepEqual(j.donde, [], `${regla.id} aparece con «${GENERO_POR_DEFECTO}» en ${j.donde.join(', ')}`);
          });
        });
      }
    }
  });
}
