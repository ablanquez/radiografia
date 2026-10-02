/**
 * Valida un paquete de reglas y dice, en castellano, qué regla y qué campo
 * fallan (encargo 3.1; punto 3 del plan), con el validador de esquema que se
 * le enchufe. SIN NINGÚN IMPORT DE AJV (encargo 6.1: validar.ts partido en
 * dos): este módulo es lo que lleva el navegador (navegador.ts, con el
 * validador standalone que genera generar-validador.ts); validar.ts, solo
 * para Node, le enchufa el de Ajv compilado en vivo y conserva las firmas que
 * usan los jueces.
 *
 * Dos pasos:
 *   1. El esquema (paquete.schema.json + regla.schema.json), con una función
 *      de validación ENCHUFABLE (encargo 3.2): la de Ajv compilada en vivo
 *      (validar.ts), o la standalone (generar-validador.ts). Los mensajes
 *      salen del mismo formateador, el de aquí.
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
 *      no se usan: sin regex, la regla no señalaría nunca nada, en silencio);
 *      y que en las cuatro posiciones estructurales ancladas (inicio-frase,
 *      fin-frase, inicio-parrafo, fin-parrafo) la regex no empiece por «^» ni
 *      termine en un «$» sin escapar: esa ancla la pone el motor. Y desde el
 *      4.3, la calibración: que la métrica de cada regla estadística esté en
 *      el registro del motor (metricas/nombres.ts), que cabecera.calibracion
 *      la traiga con el género «general» en algún tramo, y que en cada celda
 *      p1 ≤ p5 ≤ p50 ≤ p95 ≤ p99 (JSON Schema no compara un número con otro
 *      del mismo dato). Y desde el 5.3: que `generos` no nombre el género por
 *      defecto, «general» (decisión de Antonio, parada 1 del 5.3): «general»
 *      nunca activa una regla con generos. El esquema no lo ve porque
 *      «general» es un nombre kebab-case como cualquier otro, y el nombre sale
 *      de GENERO_POR_DEFECTO, no se copia.
 *      [PROPIO] «Sin escapar» = con un número par de barras inversas delante;
 *      el encargo dice «sin barra inversa delante», y `\\$` (barra escapada y
 *      ancla) lleva una barra delante y sigue siendo ancla.
 *
 * [DOC] https://ajv.js.org/api.html#error-objects — cada error trae
 *    `instancePath` (puntero JSON al dato), `keyword` y `params`
 *    (`missingProperty`, `allowedValues`, `limit`, `additionalProperty`…). De
 *    ahí salen la regla y el campo. ErrorDeEsquema describe esa forma sin
 *    importar el tipo de Ajv.
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
import { NOMBRES_DE_METRICAS, esMetrica } from './metricas/nombres.ts';

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
  cabecera: {
    familias: { id: string; informativa: boolean }[];
    calibracion?: Record<string, Record<string, Record<string, Record<Percentil, number>>>>;
  };
  reglas: {
    id: string;
    familia: string;
    informativa: boolean;
    generos?: string[];
    detector: string;
    parametros: { regex?: string; flags?: string; formas?: string[]; ambito?: string; posicion?: string; metrica?: string };
  }[];
}

type Percentil = 'p1' | 'p5' | 'p50' | 'p95' | 'p99';
const PERCENTILES: readonly Percentil[] = ['p1', 'p5', 'p50', 'p95', 'p99'];

/** El género con el que se analiza si quien analiza no elige otro (encargo 4.3) [PROPIO]. */
export const GENERO_POR_DEFECTO = 'general';

/**
 * Un error de esquema con la forma de los de Ajv: los campos que lee el
 * formateador. Se describe aquí para que este módulo no importe nada de Ajv,
 * ni sus tipos; el `ErrorObject` de Ajv encaja en él, y tsc lo comprueba en
 * validar.ts, al enchufar el validador en vivo.
 */
export interface ErrorDeEsquema {
  keyword: string;
  instancePath: string;
  schemaPath: string;
  params: Record<string, unknown>;
  message?: string;
}

/**
 * Una función de validación de esquema con la forma de las de Ajv: la que
 * validar.ts compila en vivo en Node, o la standalone que genera
 * `generar-validador.ts` para el navegador. Dice sí o no y deja sus errores en
 * `errors`.
 */
export interface ValidadorDeEsquema {
  (dato: unknown): boolean;
  errors?: ErrorDeEsquema[] | null;
}

/** Paso 1 solo: el esquema, con el validador que se le enchufe, y sus errores traducidos a regla + campo. */
export function validarEsquema(paquete: unknown, validador: ValidadorDeEsquema): ResultadoDeValidacion {
  if (validador(paquete)) return { valido: true, errores: [] };
  const todos = validador.errors ?? [];
  const deRama = (e: ErrorDeEsquema): boolean => /\/anyOf\/\d+\//.test(e.schemaPath);
  const errores = todos
    .filter((e) => e.keyword !== 'if' && !deRama(e))
    .map((e) => desdeAjv(e, paquete, todos.filter(deRama)));
  return { valido: false, errores };
}

/** Los dos pasos: el esquema, con el validador que se le enchufe, y, si da verde, las comprobaciones que el esquema no puede hacer. */
export function validarPaquete(paquete: unknown, validador: ValidadorDeEsquema): ResultadoDeValidacion {
  const esquema = validarEsquema(paquete, validador);
  if (!esquema.valido) return esquema;
  // El esquema acaba de dar verde: la forma que lee el paso 2 está garantizada.
  const errores = comprobarCoherencia(paquete as PaqueteConForma);
  return { valido: errores.length === 0, errores };
}

// ── Paso 1: traducir un error de Ajv a regla + campo ───────────────────────

function desdeAjv(e: ErrorDeEsquema, paquete: unknown, deRamas: readonly ErrorDeEsquema[]): ErrorDeValidacion {
  const ruta = punteroARuta(e.instancePath);
  // Dentro de cabecera.calibracion, a qué nivel está el objeto del error: 0 métricas, 1 géneros, 2 tramos.
  const nivelDeCalibracion = ruta[0] === 'cabecera' && ruta[1] === 'calibracion' ? ruta.length - 2 : null;
  // En `required` y `additionalProperties` el puntero señala al objeto que
  // contiene el campo; el nombre del campo viene en params.
  if (e.keyword === 'required') ruta.push(String(e.params['missingProperty']));
  if (e.keyword === 'additionalProperties') ruta.push(String(e.params['additionalProperty']));

  const valor = leer(paquete, ruta);
  const porQue = Object.entries(POR_QUE_THEN).find(([final]) => e.schemaPath.endsWith(final))?.[1];
  const alternativas = deRamas
    .filter((r) => r.instancePath === e.instancePath && r.keyword === 'required')
    .map((r) => String(r.params['missingProperty']));
  const mensaje = mensajeEnCastellano(e, valor, alternativas, nivelDeCalibracion) + (porQue === undefined ? '' : ` ${porQue}`);

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

function mensajeEnCastellano(e: ErrorDeEsquema, valor: unknown, alternativas: readonly string[], nivelDeCalibracion: number | null): string {
  const p = e.params;
  switch (e.keyword) {
    case 'required':
      return 'falta este campo obligatorio';
    case 'additionalProperties':
      // En la calibración, las claves de métrica y de género son nombres (patternProperties) y las de tramo, tres fijas.
      if (nivelDeCalibracion === 0) return 'una clave de la calibración es una métrica en kebab-case (minúsculas, cifras y guiones) o el total de un paquete, "_total-" y su nombre en kebab-case';
      if (nivelDeCalibracion === 1) return 'un género de la calibración se nombra en kebab-case: minúsculas, cifras y guiones';
      if (nivelDeCalibracion === 2) return 'no es un tramo: los tramos son "100-299", "300-599" y "600+"';
      return 'este campo no existe en el esquema (¿una errata?)';
    case 'const':
      return `vale ${JSON.stringify(valor)} y tiene que ser ${JSON.stringify(p['allowedValue'])}`;
    case 'minimum':
      return `vale ${JSON.stringify(valor)} y tiene que ser como mínimo ${p['limit']}`;
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

  // La calibración: en cada celda, los percentiles en orden.
  const calibracion = paquete.cabecera.calibracion;
  for (const [metrica, generos] of Object.entries(calibracion ?? {})) {
    for (const [genero, tramos] of Object.entries(generos)) {
      for (const [tramo, celda] of Object.entries(tramos)) {
        const desorden = PERCENTILES.slice(1)
          .map((p, i) => [PERCENTILES[i]!, p] as const)
          .filter(([a, b]) => celda[a] > celda[b]);
        if (desorden.length > 0) {
          errores.push(
            crear(
              null,
              `cabecera.calibracion.${metrica}.${genero}.${tramo}`,
              `los percentiles tienen que ir en orden, p1 ≤ p5 ≤ p50 ≤ p95 ≤ p99, y ${desorden.map(([a, b]) => `${a} (${celda[a]}) > ${b} (${celda[b]})`).join('; ')}`,
            ),
          );
        }
      }
    }
  }

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

    if (regla.generos?.includes(GENERO_POR_DEFECTO)) {
      errores.push(
        crear(
          { indice, id: regla.id },
          'generos',
          `"${GENERO_POR_DEFECTO}" no puede ir en generos: es el género por defecto del análisis y no activa reglas condicionadas; quítalo o nombra géneros concretos`,
        ),
      );
    }

    if (regla.detector === 'estadístico' && regla.parametros.metrica !== undefined) {
      const problema = problemaDeMetrica(regla.parametros.metrica, calibracion);
      if (problema !== null) errores.push(crear({ indice, id: regla.id }, 'parametros.metrica', problema));
    }

    const { regex, flags, formas, ambito, posicion } = regla.parametros;
    if (regex !== undefined) {
      try {
        new RegExp(regex, flags ?? '');
      } catch (fallo) {
        errores.push(crear({ indice, id: regla.id }, 'parametros.regex', `no compila: ${(fallo as Error).message}`));
      }
    }
    if (regex !== undefined && posicion !== undefined && ANCLADAS.includes(posicion)) {
      const anclas = [regex.startsWith('^') ? 'empieza por "^"' : null, terminaEnAncla(regex) ? 'termina en "$"' : null].filter((a) => a !== null);
      if (anclas.length > 0) {
        errores.push(
          crear(
            { indice, id: regla.id },
            'parametros.regex',
            `${anclas.join(' y ')}, y en posición "${posicion}" el ancla la pone el motor: escribe la regex sin ella`,
          ),
        );
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

/**
 * Lo que falla en la métrica de una regla estadística, o null: que el
 * registro la tenga y, si la tiene, que la cabecera la calibre para el género
 * por defecto en algún tramo. Si la métrica no existe, no se mira la
 * calibración: un defecto, un error. `Object.hasOwn`, porque «constructor» es
 * un nombre kebab-case válido y lo tiene cualquier objeto por herencia.
 */
function problemaDeMetrica(metrica: string, calibracion: PaqueteConForma['cabecera']['calibracion']): string | null {
  if (!esMetrica(metrica)) {
    return `"${metrica}" no es una métrica del motor (las registradas: ${NOMBRES_DE_METRICAS.map((n) => `"${n}"`).join(', ')})`;
  }
  if (calibracion === undefined) {
    return `el paquete no trae cabecera.calibracion, y una regla estadística compara "${metrica}" con los percentiles de ahí`;
  }
  if (!Object.hasOwn(calibracion, metrica)) {
    return `"${metrica}" no está en cabecera.calibracion: una regla estadística necesita los percentiles de su métrica`;
  }
  const porGenero = calibracion[metrica]!;
  const general = Object.hasOwn(porGenero, GENERO_POR_DEFECTO) ? porGenero[GENERO_POR_DEFECTO]! : {};
  if (Object.keys(general).length === 0) {
    return `cabecera.calibracion.${metrica} no tiene el género "${GENERO_POR_DEFECTO}" con algún tramo: es el género por defecto del análisis y tiene que estar`;
  }
  return null;
}

/** Las posiciones del detector estructural en las que el motor pone el ancla (regla.schema.json, «posicion»). */
const ANCLADAS: readonly string[] = ['inicio-frase', 'fin-frase', 'inicio-parrafo', 'fin-parrafo'];

/**
 * Si la regex termina en un «$» que es ancla: el «$» final no está escapado,
 * es decir, lo precede un número PAR de barras inversas (cero, dos…). `5\$`
 * es un dólar literal; `fin\\$` es una barra literal y, detrás, el ancla.
 */
function terminaEnAncla(regex: string): boolean {
  if (!regex.endsWith('$')) return false;
  let barras = 0;
  for (let i = regex.length - 2; i >= 0 && regex[i] === '\\'; i--) barras++;
  return barras % 2 === 0;
}

// ── El texto legible ────────────────────────────────────────────────────────

function crear(regla: ErrorDeValidacion['regla'], campo: string, mensaje: string): ErrorDeValidacion {
  const quien = regla === null ? '' : regla.id === null ? `regla reglas[${regla.indice}] · ` : `regla "${regla.id}" (reglas[${regla.indice}]) · `;
  return { regla, campo, mensaje, texto: `${quien}campo "${campo}": ${mensaje}` };
}
