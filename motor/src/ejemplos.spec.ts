/**
 * El juez de los ejemplos de las fichas (encargo 4.1; punto 4 del plan: «cada
 * ejemplo positivo dispara, cada negativo no»): por cada regla de cada
 * paquete de PAQUETES, cada ejemplo positivo produce al menos una señal y cada
 * negativo ninguna. El punto 5 lo reutilizará con las reglas reales: basta con
 * añadir su paquete a la lista.
 *
 * Desde el 4.2 juzga reglas de patrón y estructurales. El detector estadístico
 * es del 4.3: una regla estadística hace fallar su juez (no se salta en
 * silencio).
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
import { detectarPatron, type ParametrosPatron, type Senal } from './detector-patron.ts';
import { detectarEstructural, type ParametrosEstructural } from './detector-estructural.ts';
import { validarPaquete } from './validar.ts';

const PAQUETES = ['paquete-prueba-interno.json', 'paquete-prueba-secundario.json'];

type ReglaConEjemplos = { id: string; ejemplos: { positivos: string[]; negativos: string[] } } & (
  | { detector: 'patrón'; parametros: ParametrosPatron }
  | { detector: 'estructural'; parametros: ParametrosEstructural }
  | { detector: 'estadístico'; parametros: unknown }
);

function senales(regla: ReglaConEjemplos, ejemplo: string): Senal[] {
  const texto = analizarTexto(ejemplo);
  switch (regla.detector) {
    case 'patrón':
      return detectarPatron(regla, texto);
    case 'estructural':
      return detectarEstructural(regla, texto);
    case 'estadístico':
      assert.fail(`${regla.id}: el detector estadístico aún no existe (4.3)`);
  }
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
      for (const ejemplo of regla.ejemplos.positivos) {
        test(`${regla.id} · positivo «${ejemplo}» → al menos una señal`, () => {
          assert.ok(senales(regla, ejemplo).length >= 1, `${regla.id} no dispara en «${ejemplo}»`);
        });
      }
      for (const ejemplo of regla.ejemplos.negativos) {
        test(`${regla.id} · negativo «${ejemplo}» → ninguna señal`, () => {
          const s = senales(regla, ejemplo);
          assert.equal(s.length, 0, `${regla.id} dispara en «${ejemplo}»: ${s.map((x) => x.fragmento).join(', ')}`);
        });
      }
    }
  });
}
