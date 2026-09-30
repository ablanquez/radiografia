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

/**
 * Los que se tienen que aceptar. `valido-sin-fuente.json` (encargo 3.3) es la
 * otra rama del if/then de la ficha: con nivelEvidencia «sin fuente», la lista
 * de fuentes puede ir vacía (el esquema es del motor y sirve a paquetes de
 * terceros; que RadiografIA no la use lo vigilará un juez del punto 5).
 * Y un válido por detector (encargo 4.1, parametros cerrados): el de patrón es
 * valido.json; valido-detector-estructural.json y valido-detector-estadistico.json.
 */
const VALIDOS = ['valido.json', 'valido-sin-fuente.json', 'valido-detector-estructural.json', 'valido-detector-estadistico.json'] as const;

/**
 * Lo que cada inválido tiene que decir: qué regla (o `null` si el error es de
 * la cabecera; `id: null` si la regla no tiene id) y qué campo. Y, cuando hace
 * falta para que el error se entienda, qué tiene que nombrar el mensaje.
 */
interface CasoInvalido {
  fichero: string;
  regla: { indice: number; id: string | null } | null;
  campo: string;
  mensajeIncluye?: string;
}

const INVALIDOS: readonly CasoInvalido[] = [
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
  // ── Encargo 3.2: las zonas que el 3.1 dejó sin juez ──
  {
    // El if/then: con evidencia distinta de «sin fuente», la lista de fuentes
    // no puede ir vacía. Y el mensaje tiene que decir POR QUÉ, porque en otra
    // regla una lista vacía es válida.
    fichero: 'invalido-fuente-vacia-con-evidencia.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'fuente',
    mensajeIncluye: 'nivelEvidencia',
  },
  {
    fichero: 'invalido-cabecera-sin-licencia.json',
    regla: null,
    campo: 'cabecera.licencia',
  },
  {
    fichero: 'invalido-regla-sin-id.json',
    regla: { indice: 1, id: null },
    campo: 'id',
  },
  {
    fichero: 'invalido-sin-parametros.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros',
  },
  {
    fichero: 'invalido-familias-repetidas.json',
    regla: null,
    campo: 'cabecera.familias[2].id',
  },
  {
    // Una regla que puntúa dentro de una familia que no puntúa: el mensaje
    // tiene que nombrar la familia.
    fichero: 'invalido-regla-puntua-en-familia-informativa.json',
    regla: { indice: 1, id: 'meses-en-mayuscula' },
    campo: 'informativa',
    mensajeIncluye: '"ortotipografia"',
  },
  // ── Encargo 4.1: parametros cerrados por detector ──
  {
    // patrón sin «formas» ni «regex»: tiene que llevar al menos uno.
    fichero: 'invalido-parametros-patron.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros',
    mensajeIncluye: 'formas',
  },
  {
    // estructural con una clave que no es de su forma.
    fichero: 'invalido-parametros-estructural.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.formas',
  },
  {
    // estadístico con una clave que no es de su forma.
    fichero: 'invalido-parametros-estadistico.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.ambito',
  },
];

describe('validarPaquete', () => {
  /**
   * Ningún fixture sin juez: si entra uno nuevo en la carpeta y nadie lo añade
   * aquí, esto se pone rojo en vez de dejarlo sin mirar.
   */
  test('la carpeta de fixtures tiene exactamente los dieciocho que se juzgan', () => {
    assert.equal(VALIDOS.length, 4, 'cuatro válidos');
    assert.equal(INVALIDOS.length, 14, 'catorce inválidos');
    const esperados = [...VALIDOS, ...INVALIDOS.map((c) => c.fichero)].sort();
    // Solo los FICHEROS de la raíz: los paquetes. Las subcarpetas (fixtures/referencia/)
    // guardan datos de referencia de otros jueces (encargo 3.3).
    const paquetes = readdirSync(FIXTURES, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name);
    assert.deepEqual(paquetes.sort(), esperados);
  });

  for (const fichero of VALIDOS) {
    test(`acepta ${fichero}, sin ningún error`, () => {
      const resultado = validarPaquete(cargar(fichero));
      assert.deepEqual(resultado.errores, []);
      assert.equal(resultado.valido, true);
    });
  }

  /**
   * La clave `$schema` de la raíz: el motor la acepta y la ignora. El esquema la
   * anota como `format: "uri"` para el editor, pero Ajv no comprueba el formato
   * (`formats: { uri: true }`, ver la cabecera de validar.ts): solo exige texto.
   */
  test('la clave $schema es opcional y solo se exige que sea texto', () => {
    const conSchema = (valor: unknown): unknown => ({ ...(cargar('valido.json') as object), $schema: valor });

    assert.deepEqual(validarPaquete(conSchema('esto no es una uri')).errores, [], 'un texto que no es URI pasa');
    assert.deepEqual(
      validarPaquete(conSchema('https://raw.githubusercontent.com/ablanquez/radiografia/main/motor/esquema/paquete.schema.json')).errores,
      [],
      'una URL pasa',
    );
    const conNumero = validarPaquete(conSchema(42));
    assert.equal(conNumero.valido, false, '42 no pasa');
    assert.deepEqual(
      conNumero.errores.map((e) => [e.regla, e.campo]),
      [[null, '$schema']],
    );
    const { $schema: _quitado, ...sinSchema } = cargar('valido.json') as Record<string, unknown>;
    assert.deepEqual(validarPaquete(sinSchema).errores, [], 'y sin $schema también pasa: es opcional');
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
      const quien =
        caso.regla === null
          ? '' // error de la cabecera: el campo ya dice dónde («cabecera.licencia»)
          : caso.regla.id === null
            ? `regla reglas[${caso.regla.indice}] · ` // sin id, se la nombra por su posición
            : `regla "${caso.regla.id}" (reglas[${caso.regla.indice}]) · `;
      assert.ok(error!.texto.startsWith(`${quien}campo "${caso.campo}": `), error!.texto);
      if (caso.mensajeIncluye !== undefined) {
        assert.ok(error!.mensaje.includes(caso.mensajeIncluye), `el mensaje tenía que nombrar ${caso.mensajeIncluye}: ${error!.mensaje}`);
      }
    });
  }
});
