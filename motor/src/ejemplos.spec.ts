/**
 * El juez de los ejemplos de las fichas (encargo 4.1; punto 4 del plan: «cada
 * ejemplo positivo dispara, cada negativo no»): por cada regla de cada
 * paquete de PAQUETES, cada ejemplo positivo produce al menos una señal y cada
 * negativo ninguna. El punto 5 lo reutilizará con las reglas reales: basta con
 * añadir su paquete a la lista.
 *
 * Desde el 4.2 aplica a cada regla su detector con `detectar` de analizar.ts,
 * el mismo reparto que usa el motor: patrón y estructural. Cada ejemplo se
 * juzga solo, con su detector, sin el umbral de longitud: los ejemplos son
 * cortos a propósito.
 * Las reglas ESTADÍSTICAS no pasan por aquí (encargo 4.3): sus ejemplos
 * necesitan el análisis entero —longitud de al menos 100 palabras de prosa,
 * tramo, calibración y género— y tienen su propio juez.
 *
 * ⚠️ Los paquetes se leen al cargar el fichero, fuera de los tests, porque de
 *    ellos salen los tests. Si uno no se puede leer, falla el fichero entero y
 *    `node --test` lo cuenta (docs/BITACORA.md, 2026-09-29).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizarTexto } from './texto.ts';
import { detectar } from './analizar.ts';
import type { Paquete } from './paquete.ts';
import { validarPaquete } from './validar.ts';

const PAQUETES = ['paquete-prueba-interno.json', 'paquete-prueba-secundario.json'];

for (const fichero of PAQUETES) {
  const paquete = JSON.parse(readFileSync(new URL(`../fixtures/${fichero}`, import.meta.url), 'utf8')) as Paquete;

  describe(`los ejemplos de ${fichero}`, () => {
    test('el paquete es válido', () => {
      assert.deepEqual(validarPaquete(paquete).errores, []);
    });

    for (const regla of paquete.reglas.filter((r) => r.detector !== 'estadístico')) {
      const senales = (ejemplo: string) => detectar(regla, analizarTexto(ejemplo));
      for (const ejemplo of regla.ejemplos.positivos) {
        test(`${regla.id} · positivo «${ejemplo}» → al menos una señal`, () => {
          assert.ok(senales(ejemplo).length >= 1, `${regla.id} no dispara en «${ejemplo}»`);
        });
      }
      for (const ejemplo of regla.ejemplos.negativos) {
        test(`${regla.id} · negativo «${ejemplo}» → ninguna señal`, () => {
          const s = senales(ejemplo);
          assert.equal(s.length, 0, `${regla.id} dispara en «${ejemplo}»: ${s.map((x) => x.fragmento).join(', ')}`);
        });
      }
    }
  });
}
