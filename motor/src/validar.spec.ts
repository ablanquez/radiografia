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
 * Y los paquetes de prueba del motor (interno, 4.1; secundario, 4.2), cuyos
 * ejemplos juzga ejemplos.spec.ts. Y `valido-sobre-no-prosa.json` (encargo
 * 5.1): sobreNoProsa en true en una regla de patrón y en una estructural, y en
 * false en otra de patrón. Y `valido-recuento-y-generos.json` (encargo 5.3):
 * minimo en patrón, minimoPorCoincidencia, ausencia en patrón y en
 * estructural, y generos en una regla de ausencia y en una de presencia. Y
 * `valido-total-de-paquete.json` (encargo 5.5): el válido estadístico con el
 * total de un paquete, «_total-radiografia», entre las claves de la calibración.
 */
const VALIDOS = [
  'valido.json',
  'valido-sin-fuente.json',
  'valido-detector-estructural.json',
  'valido-detector-estadistico.json',
  'paquete-prueba-interno.json',
  'paquete-prueba-secundario.json',
  'valido-sobre-no-prosa.json',
  'valido-recuento-y-generos.json',
  'valido-total-de-paquete.json',
] as const;

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
  // ── Encargo 4.1, tras la parada: dos comprobaciones más en el paso 2 ──
  {
    // una regex que no compila con sus flags: el mensaje es el del motor de expresiones regulares.
    fichero: 'invalido-regex-no-compila.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.regex',
    mensajeIncluye: 'Invalid regular expression',
  },
  {
    // en ámbito «palabra», una forma con espacio no puede coincidir nunca con una palabra.
    fichero: 'invalido-forma-con-espacio.json',
    regla: { indice: 1, id: 'meses-en-mayuscula' },
    campo: 'parametros.formas[0]',
    mensajeIncluye: '"de Enero"',
  },
  // ── Encargo 4.2, cabo 2 del 4.1 ──
  {
    // en ámbito «frase» la regla se aplica con su regex: sin ella, sus formas no se usarían nunca.
    fichero: 'invalido-ambito-frase-sin-regex.json',
    regla: { indice: 1, id: 'meses-en-mayuscula' },
    campo: 'parametros.regex',
    mensajeIncluye: 'ámbito "frase"',
  },
  // ── Encargo 4.2, pieza c: en las posiciones ancladas el ancla la pone el motor ──
  {
    // inicio-frase con «^» escrito por el autor (un solo diff de valido-detector-estructural.json).
    fichero: 'invalido-regex-con-ancla.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.regex',
    mensajeIncluye: '"inicio-frase"',
  },
  // ── Encargo 4.3: la regla estadística y la calibración de la cabecera ──
  {
    // una métrica que el registro del motor no tiene.
    fichero: 'invalido-metrica-desconocida.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.metrica',
    mensajeIncluye: '"frases-por-mil-palabras"',
  },
  {
    // la cabecera calibra otra métrica, no la de la regla.
    fichero: 'invalido-sin-calibracion-para-la-metrica.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.metrica',
    mensajeIncluye: 'cabecera.calibracion',
  },
  {
    // la métrica está calibrada, pero no para el género por defecto.
    fichero: 'invalido-sin-genero-general.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.metrica',
    mensajeIncluye: '"general"',
  },
  {
    // p50 por encima de p95.
    fichero: 'invalido-percentiles-desordenados.json',
    regla: null,
    campo: 'cabecera.calibracion.frases-por-100-palabras.general.300-599',
    mensajeIncluye: 'p50 (7)',
  },
  {
    fichero: 'invalido-clave-extra-en-celda.json',
    regla: null,
    campo: 'cabecera.calibracion.frases-por-100-palabras.general.300-599.media',
  },
  // ── Encargo 5.1: sobreNoProsa ──
  {
    // «sí» en vez de true (un solo diff de valido-sobre-no-prosa.json).
    fichero: 'invalido-sobre-no-prosa-no-booleano.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.sobreNoProsa',
    mensajeIncluye: 'true o false',
  },
  // ── Encargo 5.3: cada uno a un solo diff de valido-recuento-y-generos.json ──
  {
    // minimo 0 en una regla de patrón.
    fichero: 'invalido-minimo-cero-en-patron.json',
    regla: { indice: 0, id: 'd6-referencia-interna' },
    campo: 'parametros.minimo',
    mensajeIncluye: 'como mínimo 1',
  },
  {
    // «sí» en vez de true.
    fichero: 'invalido-ausencia-no-booleano.json',
    regla: { indice: 3, id: 'sin-opinion' },
    campo: 'parametros.ausencia',
    mensajeIncluye: 'true o false',
  },
  {
    // minimoPorCoincidencia 1: repetir es aparecer al menos dos veces.
    fichero: 'invalido-minimo-por-coincidencia-uno.json',
    regla: { indice: 2, id: 'conector-repetido' },
    campo: 'parametros.minimoPorCoincidencia',
    mensajeIncluye: 'como mínimo 2',
  },
  {
    // generos vacío.
    fichero: 'invalido-generos-vacio.json',
    regla: { indice: 3, id: 'sin-opinion' },
    campo: 'generos',
    mensajeIncluye: 'al menos 1 elemento',
  },
  {
    // «general» dentro de generos: el esquema lo deja pasar (es kebab-case) y lo caza el paso 2.
    fichero: 'invalido-generos-con-general.json',
    regla: { indice: 3, id: 'sin-opinion' },
    campo: 'generos',
    mensajeIncluye: '"general" no puede ir en generos',
  },
  // ── Encargo 5.5: el total de un paquete en la calibración ──
  {
    // «_totalx-» en vez de «_total-» (un solo diff de valido-total-de-paquete.json).
    fichero: 'invalido-clave-de-total-mal-escrita.json',
    regla: null,
    campo: 'cabecera.calibracion._totalx-radiografia',
    mensajeIncluye: '"_total-"',
  },
];

describe('validarPaquete', () => {
  /**
   * Ningún fixture sin juez: si entra uno nuevo en la carpeta y nadie lo añade
   * aquí, esto se pone rojo en vez de dejarlo sin mirar.
   */
  test('la carpeta de fixtures tiene exactamente los treinta y nueve que se juzgan', () => {
    assert.equal(VALIDOS.length, 9, 'nueve válidos');
    assert.equal(INVALIDOS.length, 30, 'treinta inválidos');
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

  /**
   * El «$» del final es ancla solo si no está escapado: con un número PAR de
   * barras delante (cero, dos…). `5\$` es un dólar literal; `fin\\$` es una
   * barra literal y, detrás, el ancla. Sobre la regla fin-frase del válido
   * estructural (reglas[2]).
   */
  test('en fin-frase, el «$» escapado es texto y el que sigue a una barra escapada es ancla', () => {
    const conRegex = (regex: string): unknown => {
      const paquete = cargar('valido-detector-estructural.json') as { reglas: { parametros: { posicion?: string; regex?: string } }[] };
      assert.equal(paquete.reglas[2]!.parametros.posicion, 'fin-frase');
      paquete.reglas[2]!.parametros.regex = regex;
      return paquete;
    };
    const barra = String.fromCharCode(92);
    assert.deepEqual(validarPaquete(conRegex(`cuesta 5${barra}$`)).errores, [], 'un dólar escapado no es ancla');
    const conAncla = validarPaquete(conRegex(`fin${barra}${barra}$`));
    assert.deepEqual(
      conAncla.errores.map((e) => [e.regla, e.campo]),
      [[{ indice: 2, id: 'exclamacion-doble' }, 'parametros.regex']],
    );
  });

  /**
   * La calibración (encargo 4.3): lo que el esquema rechaza en ella, con el
   * campo exacto y un mensaje en castellano que diga qué se esperaba. Cada
   * caso cambia UNA cosa del válido estadístico.
   */
  test('calibración: sin ella, y cada defecto de forma, nombrando el campo', () => {
    type Paquete = { cabecera: { calibracion?: Record<string, Record<string, Record<string, Record<string, unknown>>>> } };
    const con = (cambiar: (p: Paquete) => void) => {
      const p = cargar('valido-detector-estadistico.json') as Paquete;
      cambiar(p);
      return validarPaquete(p).errores.map((e) => [e.regla?.id ?? null, e.campo, e.mensaje]);
    };
    const CELDA = 'cabecera.calibracion.frases-por-100-palabras.general.300-599';
    const celda = (p: Paquete) => p.cabecera.calibracion!['frases-por-100-palabras']!['general']!['300-599']!;
    const casos: [string, (p: Paquete) => void, string | null, string, string][] = [
      ['sin calibración', (p) => delete p.cabecera.calibracion, 'd6-referencia-interna', 'parametros.metrica', 'cabecera.calibracion'],
      ['método de otro tipo', (p) => (celda(p)['metodo'] = 'tipo-7'), null, `${CELDA}.metodo`, '"hyndman-fan-7"'],
      ['n = 0', (p) => (celda(p)['n'] = 0), null, `${CELDA}.n`, 'como mínimo 1'],
      ['fecha en otro formato', (p) => (celda(p)['fecha'] = '30/09/2026'), null, `${CELDA}.fecha`, '"30/09/2026"'],
      [
        'una métrica que no es kebab-case',
        (p) => (p.cabecera.calibracion = { Frases_por_100: p.cabecera.calibracion!['frases-por-100-palabras']! }),
        null,
        'cabecera.calibracion.Frases_por_100',
        'minúsculas',
      ],
      [
        'un tramo que no existe',
        (p) => (p.cabecera.calibracion!['frases-por-100-palabras']!['general'] = { '300-600': celda(p) }),
        null,
        'cabecera.calibracion.frases-por-100-palabras.general.300-600',
        '"600+"',
      ],
    ];
    for (const [nombre, cambiar, regla, campo, incluye] of casos) {
      const errores = con(cambiar);
      assert.equal(errores.length, 1, `${nombre}: un defecto, un error; salieron ${JSON.stringify(errores)}`);
      assert.deepEqual(errores[0]!.slice(0, 2), [regla, campo], nombre);
      assert.ok(String(errores[0]![2]).includes(incluye), `${nombre}: el mensaje tenía que nombrar ${incluye}: ${errores[0]![2]}`);
    }
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
