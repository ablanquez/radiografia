/**
 * El juez de los ejemplos de las fichas (encargo 4.1; punto 4 del plan: «cada
 * ejemplo positivo dispara, cada negativo no»): por cada regla de cada
 * paquete de PAQUETES, cada ejemplo positivo produce al menos una señal y cada
 * negativo ninguna. El punto 5 lo reutilizará con las reglas reales: basta con
 * añadir su paquete a la lista.
 *
 * En el 4.1 solo existe el detector de patrón; una regla de otro detector hace
 * fallar su juez (no se salta en silencio).
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
import { detectarPatron, type ReglaDePatron } from './detector-patron.ts';
import { validarPaquete } from './validar.ts';

const PAQUETES = ['paquete-prueba-interno.json'];

interface ReglaConEjemplos extends ReglaDePatron {
  detector: string;
  ejemplos: { positivos: string[]; negativos: string[] };
}

for (const fichero of PAQUETES) {
  const paquete = JSON.parse(readFileSync(new URL(`../fixtures/${fichero}`, import.meta.url), 'utf8')) as {
    reglas: ReglaConEjemplos[];
  };

  describe(`los ejemplos de ${fichero}`, () => {
    test('el paquete es válido', () => {
      assert.deepEqual(validarPaquete(paquete).errores, []);
    });

    for (const regla of paquete.reglas) {
      const senales = (ejemplo: string) => {
        assert.equal(regla.detector, 'patrón', `${regla.id}: el detector «${regla.detector}» aún no existe (4.2)`);
        return detectarPatron(regla, analizarTexto(ejemplo));
      };
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
