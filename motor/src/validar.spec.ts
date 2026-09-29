/**
 * Los jueces del validador de paquetes (encargo 3.1).
 *
 * Un fixture válido y cinco inválidos, cada inválido con UN solo defecto
 * respecto al válido (se comprueba con `diff`): lo que se compra es que el
 * validador rechaza cada uno nombrando la regla (índice e id) y el campo, y que
 * no dice nada más.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test, estable desde v20. Este
 * fichero no casa con los patrones por defecto de `node --test` (que buscan
 * `*.test.ts`, no `*.spec.ts`): se ejecuta con el glob explícito del script
 * `test` de package.json. Sin ese glob la suite sale vacía y en verde.
 *
 * [DOC] https://nodejs.org/api/typescript.html — se ejecuta borrando tipos, sin
 * tsx; por eso las importaciones llevan `.ts` y los tipos van con `import type`.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { validarPaquete } from './validar.ts';

/** La carpeta de fixtures, desde este fichero: `motor/src/…` → `motor/fixtures/`. */
const FIXTURES = new URL('../fixtures/', import.meta.url);

function cargar(fichero: string): unknown {
  return JSON.parse(readFileSync(new URL(fichero, FIXTURES), 'utf8'));
}

/** Lo que cada inválido tiene que decir: qué regla y qué campo. */
const INVALIDOS = [
  {
    fichero: 'invalido-falta-campo.json',
    regla: { indice: 1, id: 'meses-en-mayuscula' },
    campo: 'explicacion',
  },
  {
    fichero: 'invalido-detector-fuera-del-enum.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'detector',
  },
  {
    fichero: 'invalido-sin-ejemplo-negativo.json',
    regla: { indice: 1, id: 'meses-en-mayuscula' },
    campo: 'ejemplos.negativos',
  },
  {
    fichero: 'invalido-id-repetido.json',
    regla: { indice: 1, id: 'd6-referencia-interna' },
    campo: 'id',
  },
  {
    fichero: 'invalido-familia-no-declarada.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'familia',
  },
] as const;

describe('validarPaquete', () => {
  /**
   * Ningún fixture sin juez: si entra uno nuevo en la carpeta y nadie lo añade
   * aquí, esto se pone rojo en vez de dejarlo sin mirar.
   */
  test('la carpeta de fixtures tiene exactamente los seis que se juzgan', () => {
    const esperados = ['valido.json', ...INVALIDOS.map((c) => c.fichero)].sort();
    assert.deepEqual(readdirSync(FIXTURES).sort(), esperados);
  });

  test('acepta el paquete válido, sin ningún error', () => {
    const resultado = validarPaquete(cargar('valido.json'));
    assert.deepEqual(resultado.errores, []);
    assert.equal(resultado.valido, true);
  });

  for (const caso of INVALIDOS) {
    test(`rechaza ${caso.fichero} nombrando regla y campo`, () => {
      const resultado = validarPaquete(cargar(caso.fichero));
      assert.equal(resultado.valido, false, 'tenía que rechazarlo');
      assert.equal(
        resultado.errores.length,
        1,
        `un defecto, un error; salieron: ${JSON.stringify(resultado.errores, null, 2)}`,
      );
      const [error] = resultado.errores;
      assert.deepEqual(error!.regla, caso.regla);
      assert.equal(error!.campo, caso.campo);
      // Y el texto legible lleva las dos cosas, que es lo que verá quien cargue el paquete.
      assert.match(error!.texto, new RegExp(`regla "${caso.regla.id}" \\(reglas\\[${caso.regla.indice}\\]\\)`));
      assert.ok(error!.texto.includes(`campo "${caso.campo}"`), error!.texto);
    });
  }
});
