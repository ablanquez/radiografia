/**
 * El juez de los ejemplos de las fichas (encargo 4.1; punto 4 del plan: «cada
 * ejemplo positivo dispara, cada negativo no»): por cada regla de cada
 * paquete de PAQUETES, cada ejemplo positivo produce al menos una señal y cada
 * negativo ninguna. Desde el encargo 5.1 juzga también el paquete real,
 * paquetes/radiografia.json (en la raíz del repo, junto a data/), y desde el
 * 5.4 el segundo paquete incluido, paquetes/espanol-correcto.json.
 *
 * Desde el 4.2 aplica a cada regla su detector con `detectar` de analizar.ts,
 * el mismo reparto que usa el motor: patrón y estructural. Cada ejemplo se
 * juzga solo, con su detector, sin el umbral de longitud: los ejemplos son
 * cortos a propósito.
 * Las reglas ESTADÍSTICAS no pasan por aquí (encargo 4.3): sus ejemplos
 * necesitan el análisis entero —longitud de al menos 100 palabras de prosa,
 * tramo, calibración y género— y tienen su propio juez.
 * Tampoco las que llevan `ausencia` o `generos` (encargo 5.3): una ausencia se
 * juzga sobre el texto entero y solo en tramo completo, y `generos` depende
 * del género del análisis; las juzga ejemplos-ausencia.spec.ts con
 * analizar(). Aquí cada una deja un test SALTADO que lo dice en su nombre,
 * para que el resumen de node --test la cuente como saltada y no desaparezca.
 * [PROPIO] En el nombre de cada test, los saltos de línea y los caracteres
 * invisibles del ejemplo se escriben a la vista (⏎, <U+202F>): si no, un
 * positivo con U+202F y su negativo sin él se llamarían igual.
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

const PAQUETES = [
  new URL('../fixtures/paquete-prueba-interno.json', import.meta.url),
  new URL('../fixtures/paquete-prueba-secundario.json', import.meta.url),
  new URL('../../paquetes/radiografia.json', import.meta.url),
  new URL('../../paquetes/espanol-correcto.json', import.meta.url),
];

/** El ejemplo con sus saltos de línea y sus caracteres invisibles a la vista, para el nombre del test. */
const aLaVista = (ejemplo: string): string =>
  ejemplo.replace(/[\n\u00A0\u200B-\u200D\u2060\u202F\uFEFF]/g, (c) =>
    c === '\n' ? '⏎' : `<U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}>`,
  );

for (const url of PAQUETES) {
  const fichero = url.pathname.split('/').at(-1)!;
  const paquete = JSON.parse(readFileSync(url, 'utf8')) as Paquete;

  describe(`los ejemplos de ${fichero}`, () => {
    test('el paquete es válido', () => {
      assert.deepEqual(validarPaquete(paquete).errores, []);
    });

    for (const regla of paquete.reglas.filter((r) => r.detector !== 'estadístico')) {
      const aparte = [regla.parametros.ausencia === true ? 'ausencia' : null, regla.generos !== undefined ? 'generos' : null].filter((x) => x !== null);
      if (aparte.length > 0) {
        const motivo = `lleva ${aparte.join(' y ')}: la juzga ejemplos-ausencia.spec.ts`;
        test(`${regla.id} · aquí no: ${motivo}`, { skip: motivo }, () => {});
        continue;
      }
      const senales = (ejemplo: string) => detectar(regla, analizarTexto(ejemplo));
      for (const ejemplo of regla.ejemplos.positivos) {
        test(`${regla.id} · positivo «${aLaVista(ejemplo)}» → al menos una señal`, () => {
          assert.ok(senales(ejemplo).length >= 1, `${regla.id} no dispara en «${aLaVista(ejemplo)}»`);
        });
      }
      for (const ejemplo of regla.ejemplos.negativos) {
        test(`${regla.id} · negativo «${aLaVista(ejemplo)}» → ninguna señal`, () => {
          const s = senales(ejemplo);
          assert.equal(s.length, 0, `${regla.id} dispara en «${aLaVista(ejemplo)}»: ${s.map((x) => x.fragmento).join(', ')}`);
        });
      }
    }
  });
}
