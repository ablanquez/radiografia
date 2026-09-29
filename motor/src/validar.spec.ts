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
];

describe('validarPaquete', () => {
  /**
   * Ningún fixture sin juez: si entra uno nuevo en la carpeta y nadie lo añade
   * aquí, esto se pone rojo en vez de dejarlo sin mirar.
   */
  test('la carpeta de fixtures tiene exactamente los doce que se juzgan', () => {
    assert.equal(INVALIDOS.length, 11, 'once inválidos, más el válido');
    const esperados = ['valido.json', ...INVALIDOS.map((c) => c.fichero)].sort();
    assert.deepEqual(readdirSync(FIXTURES).sort(), esperados);
  });

  test('acepta el paquete válido, sin ningún error', () => {
    const resultado = validarPaquete(cargar('valido.json'));
    assert.deepEqual(resultado.errores, []);
    assert.equal(resultado.valido, true);
  });

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
