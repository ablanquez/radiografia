/**
 * El juez de los ejemplos de las reglas ESTADÍSTICAS (encargo 4.3, g): no
 * pasan por ejemplos.spec.ts porque necesitan el análisis entero. Por cada
 * regla estadística de cada paquete de PAQUETES, cada ejemplo se analiza con
 * analizar(ejemplo, [paquete]) y el género por defecto («general»):
 *   · el ejemplo tiene al menos 100 palabras de prosa (si no, no se analiza);
 *   · la regla NO acaba en «sin calibración»: un negativo que no dispara por
 *     falta de celda sería un verde falso;
 *   · positivo → la regla DISPARA: su señal de texto queda fuera de la banda
 *     (lado «arriba» o «abajo»), esté en senalesTexto o, si la regla es
 *     informativa, en contexto;
 *   · negativo → no dispara (una informativa sigue saliendo en contexto, con
 *     lado null: eso no es disparar).
 * El punto 5 lo reutilizará con las reglas reales: basta con añadir su paquete.
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
import { esAusencia } from './detector-ausencia.ts';
import type { SenalTexto } from './detector-estadistico.ts';
import { analizarTexto } from './texto.ts';
import { evaluarLongitud, MINIMO } from './umbral.ts';
import type { Paquete } from './paquete.ts';

const PAQUETES = ['paquete-prueba-interno.json', 'paquete-prueba-secundario.json'];

function disparo(paquete: Paquete, reglaId: string, ejemplo: string) {
  const { palabrasProsa } = evaluarLongitud(analizarTexto(ejemplo));
  assert.ok(palabrasProsa >= MINIMO, `${reglaId}: el ejemplo tiene ${palabrasProsa} palabras de prosa y hacen falta ${MINIMO}`);
  const r = analizar(ejemplo, [paquete]);
  const sin = r.sinCalibracion.find((s) => s.reglaId === reglaId);
  assert.equal(sin, undefined, `${reglaId}: sin calibración en su ejemplo (${sin?.motivo})`);
  // Solo las estadísticas: desde el encargo 5.3 también hay señales de texto de ausencia.
  const senal = [...r.senalesTexto, ...r.contexto]
    .filter((s): s is SenalTexto & { paquete: string } => !esAusencia(s))
    .find((s) => s.reglaId === reglaId);
  return { dispara: senal !== undefined && senal.lado !== null, senal };
}

for (const fichero of PAQUETES) {
  const paquete = JSON.parse(readFileSync(new URL(`../fixtures/${fichero}`, import.meta.url), 'utf8')) as Paquete;

  describe(`los ejemplos estadísticos de ${fichero}`, () => {
    const estadisticas = paquete.reglas.filter((r) => r.detector === 'estadístico');

    test('el paquete trae al menos una regla estadística', () => {
      assert.ok(estadisticas.length > 0);
    });

    for (const regla of estadisticas) {
      regla.ejemplos.positivos.forEach((ejemplo, i) => {
        test(`${regla.id} · positivo ${i + 1} → dispara`, () => {
          const { dispara, senal } = disparo(paquete, regla.id, ejemplo);
          assert.ok(dispara, `${regla.id} no dispara: valor ${senal?.valor}, referencia ${JSON.stringify(senal?.referencia)}`);
        });
      });
      regla.ejemplos.negativos.forEach((ejemplo, i) => {
        test(`${regla.id} · negativo ${i + 1} → no dispara`, () => {
          const { dispara, senal } = disparo(paquete, regla.id, ejemplo);
          assert.ok(!dispara, `${regla.id} dispara: valor ${senal?.valor}, lado ${senal?.lado}`);
        });
      });
    }
  });
}
