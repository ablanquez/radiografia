/**
 * Valida un paquete de reglas y dice, en castellano, qué regla y qué campo
 * fallan (encargo 3.1; punto 3 del plan).
 *
 * Dos pasos:
 *   1. El esquema (paquete.schema.json + regla.schema.json).
 *   2. Lo que el esquema no puede ver: ids únicos y familia declarada.
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
 * [DOC] https://nodejs.org/api/esm.html#json-modules — los esquemas se
 *    importan como JSON con `with { type: 'json' }`, estable en Node 24. Nada
 *    se descarga: el validador no tiene `loadSchema`.
 * [PROPIO] Los mensajes en castellano de las palabras clave que usan nuestros
 *    esquemas; si aparece otra, sale el mensaje de Ajv tal cual.
 * [PROPIO] Los errores de `if` se omiten: repiten el error de dentro del
 *    `then`, que es el que nombra el campo.
 * [PROPIO] El paso 2 solo corre si el paso 1 dio verde: sobre un paquete mal
 *    formado no se puede leer `id` ni `familia` con garantías.
 */
import { Ajv2020 } from 'ajv/dist/2020.js';
import type { ErrorObject } from 'ajv/dist/2020.js';
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
interface PaqueteConForma {
  cabecera: { familias: { id: string }[] };
  reglas: { id: string; familia: string }[];
}

const ajv = new Ajv2020({ allErrors: true });
ajv.addSchema(esquemaRegla);
// El tipo que se le da aquí es el que el type guard de Ajv deja en `paquete`
// cuando el esquema da verde: el paso 2 lo lee sin cast.
const validarEsquema = ajv.compile<PaqueteConForma>(esquemaPaquete);

export function validarPaquete(paquete: unknown): ResultadoDeValidacion {
  if (!validarEsquema(paquete)) {
    const errores = (validarEsquema.errors ?? [])
      .filter((e) => e.keyword !== 'if')
      .map((e) => desdeAjv(e, paquete));
    return { valido: false, errores };
  }
  const errores = comprobarCoherencia(paquete);
  return { valido: errores.length === 0, errores };
}

// ── Paso 1: traducir un error de Ajv a regla + campo ───────────────────────

function desdeAjv(e: ErrorObject, paquete: unknown): ErrorDeValidacion {
  const ruta = punteroARuta(e.instancePath);
  // En `required` y `additionalProperties` el puntero señala al objeto que
  // contiene el campo; el nombre del campo viene en params.
  if (e.keyword === 'required') ruta.push(String(e.params['missingProperty']));
  if (e.keyword === 'additionalProperties') ruta.push(String(e.params['additionalProperty']));

  const valor = leer(paquete, ruta);
  const mensaje = mensajeEnCastellano(e, valor);

  if (ruta[0] === 'reglas' && typeof ruta[1] === 'number') {
    const indice = ruta[1];
    const id = leer(paquete, ['reglas', indice, 'id']);
    return crear({ indice, id: typeof id === 'string' ? id : null }, rutaATexto(ruta.slice(2)), mensaje);
  }
  return crear(null, rutaATexto(ruta), mensaje);
}

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

function mensajeEnCastellano(e: ErrorObject, valor: unknown): string {
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
  const primeraVez = new Map<string, number>();
  const familias = paquete.cabecera.familias.map((f) => f.id);

  paquete.reglas.forEach((regla, indice) => {
    const anterior = primeraVez.get(regla.id);
    if (anterior === undefined) {
      primeraVez.set(regla.id, indice);
    } else {
      errores.push(crear({ indice, id: regla.id }, 'id', `el id "${regla.id}" ya lo usa reglas[${anterior}]`));
    }

    if (!familias.includes(regla.familia)) {
      const declaradas = familias.map((f) => `"${f}"`).join(', ');
      errores.push(
        crear(
          { indice, id: regla.id },
          'familia',
          `la familia "${regla.familia}" no está declarada en cabecera.familias (declaradas: ${declaradas})`,
        ),
      );
    }
  });
  return errores;
}

// ── El texto legible ────────────────────────────────────────────────────────

function crear(regla: ErrorDeValidacion['regla'], campo: string, mensaje: string): ErrorDeValidacion {
  const quien = regla === null ? '' : regla.id === null ? `regla reglas[${regla.indice}] · ` : `regla "${regla.id}" (reglas[${regla.indice}]) · `;
  return { regla, campo, mensaje, texto: `${quien}campo "${campo}": ${mensaje}` };
}
