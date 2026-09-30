/**
 * Valida un paquete de reglas y dice, en castellano, qué regla y qué campo
 * fallan (encargo 3.1; punto 3 del plan).
 *
 * Dos pasos:
 *   1. El esquema (paquete.schema.json + regla.schema.json), con una función
 *      de validación ENCHUFABLE (encargo 3.2): la de Ajv compilada aquí en
 *      vivo, o la standalone que el navegador llevará sin Ajv
 *      (generar-validador.ts). Los mensajes salen del mismo formateador.
 *   2. Lo que el esquema no puede ver: ids de regla únicos, ids de familia
 *      únicos, familia declarada, y que una regla de una familia informativa
 *      sea informativa (encargo 3.2: el motor no puntúa reglas de familias
 *      informativas, y una regla que dijera lo contrario sería una mentira
 *      de la ficha). Y desde el 4.1: que la `regex` de patrón y estructural
 *      compile con sus `flags` (new RegExp; si no, el mensaje del propio
 *      motor de expresiones regulares), y que en ámbito «palabra» ninguna
 *      forma lleve espacios (una expresión de varias palabras va por regex en
 *      ámbito «frase»: una palabra nunca contiene un espacio). Y desde el 4.2:
 *      que una regla de patrón en ámbito «frase» traiga regex (el esquema
 *      pide «formas» o «regex» en cualquier ámbito, pero en «frase» las formas
 *      no se usan: sin regex, la regla no señalaría nunca nada, en silencio).
 *
 * [DOC] https://ajv.js.org/json-schema.html#draft-2020-12 — «To use
 *    draft-2020-12 schemas you need to import a different Ajv class»: Ajv2020.
 *    La doc escribe `import Ajv2020 from "ajv/dist/2020"`, y esa ruta NO
 *    funciona aquí: ajv no tiene campo `exports` en su package.json y, en ESM,
 *    Node exige la extensión completa ([DOC] https://nodejs.org/api/esm.html,
 *    «Mandatory file extensions»). Comprobado al instalar (29/09):
 *    `ajv/dist/2020` → ERR_MODULE_NOT_FOUND; `ajv/dist/2020.js` → funciona.
 *    Se importa con NOMBRE (`{ Ajv2020 }`, que `dist/2020.js` exporta
 *    como tal) para no depender de cómo trata TypeScript el `default` de un
 *    módulo CommonJS.
 * [DOC] https://ajv.js.org/api.html — `allErrors: true` para que salgan todos
 *    los errores de una vez; cada error trae `instancePath` (puntero JSON al
 *    dato), `keyword` y `params` (`missingProperty`, `allowedValues`, `limit`,
 *    `additionalProperty`…). De ahí salen la regla y el campo.
 * [DOC] `formats: { uri: true }` — el `$schema` de la raíz del paquete lleva
 *    `"format": "uri"` como ANOTACIÓN para el editor, y el motor no lo comprueba:
 *    · https://ajv.js.org/guide/formats.html — «From version 7 Ajv does not
 *      include formats defined by JSON Schema specification»; sin definirlo,
 *      compilar el esquema lanza `unknown format "uri" ignored in schema at
 *      path "#/properties/%24schema"` (visto en la suite el 29/09).
 *    · https://ajv.js.org/strict-mode.html («Unknown formats») — «to have some
 *      format ignored pass `true` as its definition».
 *    · JSON Schema 2020-12, validación §7.2.1
 *      (https://json-schema.org/draft/2020-12/json-schema-validation#section-7.2.1)
 *      — la aserción de format «MUST be disabled by default».
 *    Sin ajv-formats (decisión de Antonio, parada del 3.2): sería una dependencia
 *    más y mete un `require()` en el código standalone.
 * [DOC] https://nodejs.org/api/esm.html#json-modules — los esquemas se
 *    importan como JSON con `with { type: 'json' }`, estable en Node 24. Nada
 *    se descarga: el validador no tiene `loadSchema`.
 * [PROPIO] Los mensajes en castellano de las palabras clave que usan nuestros
 *    esquemas; si aparece otra, sale el mensaje de Ajv tal cual.
 * [PROPIO] Los errores de `if` se omiten: repiten el error de dentro del
 *    `then`, que es el que nombra el campo. Pero el error del `then`, solo, no
 *    dice por qué se exige algo que en otra regla sería válido: POR_QUE_THEN
 *    le añade la condición, buscándola por el FINAL de su `schemaPath`
 *    (`/then/properties/fuente/minItems`). Por el final y no entera: el
 *    principio depende de cómo compile Ajv las referencias —era
 *    `regla.schema.json/then/…` y, desde que la ficha tiene `$defs` (4.1), es
 *    `#/allOf/0/then/…`; visto al ejecutar—. Si el esquema cambia de sitio esa
 *    condición, el juez que exige «nivelEvidencia» en el mensaje se pone rojo.
 * [PROPIO] Un `anyOf` (encargo 4.1: patrón necesita «formas» o «regex») da un
 *    error por cada rama más el suyo. Se omiten los de las ramas y el del
 *    `anyOf` dice qué alternativas faltan, sacadas de esas mismas ramas: «tiene
 *    que llevar al menos uno de estos campos: "formas", "regex"».
 * [PROPIO] El paso 2 solo corre si el paso 1 dio verde: sobre un paquete mal
 *    formado no se puede leer `id` ni `familia` con garantías.
 */
import { Ajv2020 } from 'ajv/dist/2020.js';
import type { ErrorObject, Options } from 'ajv/dist/2020.js';
import esquemaPaquete from '../esquema/paquete.schema.json' with { type: 'json' };
import esquemaRegla from '../esquema/regla.schema.json' with { type: 'json' };

export interface ErrorDeValidacion {
  /** La regla culpable (posición en `reglas` y su id si lo tiene), o null si el error es de la cabecera o del paquete. */
  regla: { indice: number; id: string | null } | null;
  /** Ruta del campo dentro de la regla (`ejemplos.negativos`) o del paquete (`cabecera.version`). */
  campo: string;
  mensaje: string;
  /** Todo junto, listo para enseñar: `regla "x" (reglas[1]) · campo "id": …`. */
  texto: string;
}

export interface ResultadoDeValidacion {
  valido: boolean;
  errores: ErrorDeValidacion[];
}

/** Lo que el paso 2 lee, cuando el esquema ya garantizó la forma. */
export interface PaqueteConForma {
  cabecera: { familias: { id: string; informativa: boolean }[] };
  reglas: {
    id: string;
    familia: string;
    informativa: boolean;
    detector: string;
    parametros: { regex?: string; flags?: string; formas?: string[]; ambito?: string };
  }[];
}

/**
 * Una función de validación de esquema con la forma de las de Ajv: la que se
 * compila aquí en vivo, o la standalone que genera `generar-validador.ts` para
 * el navegador. Dice sí o no y deja sus errores en `errors`.
 */
export interface ValidadorDeEsquema {
  (dato: unknown): boolean;
  errors?: ErrorObject[] | null;
}

/**
 * Las opciones de Ajv. Las MISMAS para el validador en vivo y para el que se
 * genera en build (generar-validador.ts las importa de aquí): si divergieran,
 * los dos dejarían de ser equivalentes y standalone.spec.ts se pondría rojo.
 */
export const OPCIONES_AJV = { allErrors: true, formats: { uri: true } } satisfies Options;

const ajv = new Ajv2020({ ...OPCIONES_AJV });
ajv.addSchema(esquemaRegla);
const validadorEnVivo: ValidadorDeEsquema = ajv.compile(esquemaPaquete);

/**
 * Paso 1 solo: el esquema, con el validador que se le enchufe (por defecto, el
 * de Ajv en vivo), y sus errores traducidos a regla + campo.
 */
export function validarEsquema(paquete: unknown, validador: ValidadorDeEsquema = validadorEnVivo): ResultadoDeValidacion {
  if (validador(paquete)) return { valido: true, errores: [] };
  const todos = validador.errors ?? [];
  const deRama = (e: ErrorObject): boolean => /\/anyOf\/\d+\//.test(e.schemaPath);
  const errores = todos
    .filter((e) => e.keyword !== 'if' && !deRama(e))
    .map((e) => desdeAjv(e, paquete, todos.filter(deRama)));
  return { valido: false, errores };
}

/** Los dos pasos: el esquema y, si da verde, las comprobaciones que el esquema no puede hacer. */
export function validarPaquete(paquete: unknown, validador: ValidadorDeEsquema = validadorEnVivo): ResultadoDeValidacion {
  const esquema = validarEsquema(paquete, validador);
  if (!esquema.valido) return esquema;
  // El esquema acaba de dar verde: la forma que lee el paso 2 está garantizada.
  const errores = comprobarCoherencia(paquete as PaqueteConForma);
  return { valido: errores.length === 0, errores };
}

// ── Paso 1: traducir un error de Ajv a regla + campo ───────────────────────

function desdeAjv(e: ErrorObject, paquete: unknown, deRamas: readonly ErrorObject[]): ErrorDeValidacion {
  const ruta = punteroARuta(e.instancePath);
  // En `required` y `additionalProperties` el puntero señala al objeto que
  // contiene el campo; el nombre del campo viene en params.
  if (e.keyword === 'required') ruta.push(String(e.params['missingProperty']));
  if (e.keyword === 'additionalProperties') ruta.push(String(e.params['additionalProperty']));

  const valor = leer(paquete, ruta);
  const porQue = Object.entries(POR_QUE_THEN).find(([final]) => e.schemaPath.endsWith(final))?.[1];
  const alternativas = deRamas
    .filter((r) => r.instancePath === e.instancePath && r.keyword === 'required')
    .map((r) => String(r.params['missingProperty']));
  const mensaje = mensajeEnCastellano(e, valor, alternativas) + (porQue === undefined ? '' : ` ${porQue}`);

  if (ruta[0] === 'reglas' && typeof ruta[1] === 'number') {
    const indice = ruta[1];
    const id = leer(paquete, ['reglas', indice, 'id']);
    return crear({ indice, id: typeof id === 'string' ? id : null }, rutaATexto(ruta.slice(2)), mensaje);
  }
  return crear(null, rutaATexto(ruta), mensaje);
}

/** La condición de cada `then` de los esquemas, por el FINAL del `schemaPath` de su error. */
const POR_QUE_THEN: Readonly<Record<string, string>> = {
  '/then/properties/fuente/minItems': '(porque nivelEvidencia no es "sin fuente")',
};

/** `/reglas/1/ejemplos/negativos` → `['reglas', 1, 'ejemplos', 'negativos']` (RFC 6901: ~1 es «/», ~0 es «~»). */
function punteroARuta(puntero: string): (string | number)[] {
  if (puntero === '') return [];
  return puntero
    .slice(1)
    .split('/')
    .map((s) => s.replaceAll('~1', '/').replaceAll('~0', '~'))
    .map((s) => (/^\d+$/.test(s) ? Number(s) : s));
}

/** `['fuente', 0, 'url']` → `fuente[0].url`. */
function rutaATexto(ruta: (string | number)[]): string {
  if (ruta.length === 0) return '(entero)';
  return ruta.reduce<string>(
    (texto, parte) => (typeof parte === 'number' ? `${texto}[${parte}]` : texto ? `${texto}.${parte}` : parte),
    '',
  );
}

function leer(dato: unknown, ruta: (string | number)[]): unknown {
  let actual = dato;
  for (const parte of ruta) {
    if (actual === null || typeof actual !== 'object') return undefined;
    actual = (actual as Record<string | number, unknown>)[parte];
  }
  return actual;
}

const TIPOS: Readonly<Record<string, string>> = {
  string: 'texto',
  number: 'número',
  integer: 'número entero',
  boolean: 'true o false',
  object: 'objeto',
  array: 'lista',
  null: 'null',
};

function mensajeEnCastellano(e: ErrorObject, valor: unknown, alternativas: readonly string[]): string {
  const p = e.params;
  switch (e.keyword) {
    case 'required':
      return 'falta este campo obligatorio';
    case 'additionalProperties':
      return 'este campo no existe en el esquema (¿una errata?)';
    case 'enum': {
      const permitidos = (p['allowedValues'] as unknown[]).map((v) => JSON.stringify(v)).join(', ');
      return `vale ${JSON.stringify(valor)} y tiene que ser uno de: ${permitidos}`;
    }
    case 'type': {
      const tipos = String(p['type']).split(',').map((t) => TIPOS[t] ?? t);
      return `tiene que ser ${tipos.join(' o ')}`;
    }
    case 'minItems':
      return `tiene que tener al menos ${p['limit']} ${p['limit'] === 1 ? 'elemento' : 'elementos'}`;
    case 'minLength':
      return p['limit'] === 1 ? 'no puede estar vacío' : `tiene que tener al menos ${p['limit']} caracteres`;
    case 'anyOf':
      if (alternativas.length > 0) return `tiene que llevar al menos uno de estos campos: ${alternativas.map((a) => `"${a}"`).join(', ')}`;
      return e.message ?? e.keyword;
    case 'pattern':
      return `vale ${JSON.stringify(valor)} y no cumple el formato ${p['pattern']}`;
    default:
      return e.message ?? e.keyword;
  }
}

// ── Paso 2: lo que JSON Schema no compara ──────────────────────────────────
// JSON Schema compara un dato con valores escritos en el esquema, no con otro
// dato: `uniqueItems` mira reglas enteras, no un campo, y no hay forma estándar
// de decir «esta familia tiene que estar en aquella lista».

function comprobarCoherencia(paquete: PaqueteConForma): ErrorDeValidacion[] {
  const errores: ErrorDeValidacion[] = [];

  // Las familias: cada id una sola vez. Si se repite, manda la primera.
  const familias = new Map<string, { indice: number; informativa: boolean }>();
  paquete.cabecera.familias.forEach((familia, indice) => {
    const anterior = familias.get(familia.id);
    if (anterior === undefined) {
      familias.set(familia.id, { indice, informativa: familia.informativa });
    } else {
      errores.push(
        crear(null, `cabecera.familias[${indice}].id`, `el id "${familia.id}" ya lo usa cabecera.familias[${anterior.indice}]`),
      );
    }
  });

  const primeraVez = new Map<string, number>();
  paquete.reglas.forEach((regla, indice) => {
    const anterior = primeraVez.get(regla.id);
    if (anterior === undefined) {
      primeraVez.set(regla.id, indice);
    } else {
      errores.push(crear({ indice, id: regla.id }, 'id', `el id "${regla.id}" ya lo usa reglas[${anterior}]`));
    }

    const familia = familias.get(regla.familia);
    if (familia === undefined) {
      const declaradas = [...familias.keys()].map((f) => `"${f}"`).join(', ');
      errores.push(
        crear(
          { indice, id: regla.id },
          'familia',
          `la familia "${regla.familia}" no está declarada en cabecera.familias (declaradas: ${declaradas})`,
        ),
      );
    } else if (familia.informativa && !regla.informativa) {
      errores.push(
        crear(
          { indice, id: regla.id },
          'informativa',
          `vale false, pero la familia "${regla.familia}" es informativa y el motor no puntúa sus reglas: tiene que ser true`,
        ),
      );
    }

    const { regex, flags, formas, ambito } = regla.parametros;
    if (regex !== undefined) {
      try {
        new RegExp(regex, flags ?? '');
      } catch (fallo) {
        errores.push(crear({ indice, id: regla.id }, 'parametros.regex', `no compila: ${(fallo as Error).message}`));
      }
    }
    if (ambito === 'frase' && regex === undefined) {
      errores.push(
        crear(
          { indice, id: regla.id },
          'parametros.regex',
          `falta, y en ámbito "frase" la regla se aplica con su regex: las formas solo se comparan en ámbito "palabra"`,
        ),
      );
    }
    if (ambito === 'palabra') {
      formas?.forEach((forma, i) => {
        if (/\s/.test(forma)) {
          errores.push(
            crear(
              { indice, id: regla.id },
              `parametros.formas[${i}]`,
              `"${forma}" lleva un espacio y en ámbito "palabra" se compara palabra a palabra: una expresión de varias palabras va por regex en ámbito "frase"`,
            ),
          );
        }
      });
    }
  });
  return errores;
}

// ── El texto legible ────────────────────────────────────────────────────────

function crear(regla: ErrorDeValidacion['regla'], campo: string, mensaje: string): ErrorDeValidacion {
  const quien = regla === null ? '' : regla.id === null ? `regla reglas[${regla.indice}] · ` : `regla "${regla.id}" (reglas[${regla.indice}]) · `;
  return { regla, campo, mensaje, texto: `${quien}campo "${campo}": ${mensaje}` };
}
