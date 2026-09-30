/**
 * El guardián del `THIRD-PARTY-NOTICES.md` (encargo 3.1).
 *
 * El plan pide que el NOTICES «se mantiene con juez … y una prueba que caza
 * cuando la cabecera envejece». El precedente es el de Desplázame
 * (`004_DESPLAZAME/motor/src/notices.spec.ts`): allí la cifra de la cabecera se
 * quedó vieja TRES veces seguidas, las dos primeras «arreglada» con una nota
 * que avisaba del desfase, hasta que se escribió un guion que cuenta. Y su
 * tabla de software arrastró una fila de `@angular/forms` después de que el
 * paquete saliera del package.json.
 *
 * [PROPIO] Adaptado, no copiado. Allí se cuentan fichas de DATOS (§ 1.x);
 * aquí hoy solo hay software, así que lo que envejece es otra cosa y se mide
 * contra la fuente de verdad, no contra otra línea del mismo documento:
 *   1. la cifra de declaradas de la cabecera  ↔ motor/package.json
 *   2. las filas de las tablas § 1.1 y § 1.2   ↔ motor/package.json (ni muertas
 *      ni sin ficha, cada una en su tabla)
 *   3. versión y licencia de cada fila          ↔ motor/package-lock.json
 *   4. la cifra de transitivas de § 1.3         ↔ motor/package-lock.json
 *
 * Y desde el encargo 3.3, los DATOS de terceros (§ 2), contra la carpeta data/:
 *   5. cada carpeta bajo data/ tiene su ficha «### 2.x · `data/<carpeta>/`»,
 *      y cada ficha su carpeta: ni una más ni una menos
 *   6. cada carpeta bajo data/ lleva al lado su LICENSE-*.md
 *
 * Y desde el encargo 5.5, la CALIBRACIÓN (§ 2.3), contra data/calibracion/:
 *   9. cada <genero>.json tiene su fila en la tabla de § 2.3 y cada fila su fichero
 *  10. cada uno lleva al lado su <genero>.manifiesto.json, y la licencia de su
 *      fila es la que dice el campo «licencia» del propio fichero
 *
 * Y el CÓDIGO de terceros incorporado (§ 1.5; encargo 3.3, silabea), contra
 * motor/src/terceros/:
 *   7. cada fichero ajeno tiene su fila en § 1.5 y cada fila su fichero (los
 *      .d.cts / .d.ts son tipos nuestros, no código ajeno)
 *   8. cada fichero empieza por su aviso de licencia, su sha256 es el de la
 *      tabla y, quitada la cabecera, el resto tiene el sha256 del original
 *   [PROPIO] Las huellas se calculan con los finales de línea normalizados a
 *   LF: con core.autocrlf, git los reescribe al sacar el fichero en Windows
 *   (medido el 29/09 con node, byte a byte: docs/BITACORA.md).
 *
 * Vive en la suite del motor porque es donde hay un `node --test`, no porque
 * sea código del motor. Lee por rutas relativas a ESTE fichero, no al `cwd`.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test, estable desde v20.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const NOTICES = new URL('../../THIRD-PARTY-NOTICES.md', import.meta.url);
const DATOS = new URL('../../data/', import.meta.url);
const TERCEROS = new URL('./terceros/', import.meta.url);
const RAIZ = new URL('../../', import.meta.url);
const PACKAGE = new URL('../package.json', import.meta.url);
const LOCK = new URL('../package-lock.json', import.meta.url);

/**
 * Los números que el documento escribe con letra, en negrita. En femenino,
 * porque lo que cuenta son «dependencias» (una, veintiuna, treinta y una).
 */
const EN_LETRA: Readonly<Record<string, number>> = {
  una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciséis: 16, diecisiete: 17,
  dieciocho: 18, diecinueve: 19, veinte: 20,
  veintiuna: 21, veintidós: 22, veintitrés: 23, veinticuatro: 24, veinticinco: 25,
  veintiséis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30,
  'treinta y una': 31, 'treinta y dos': 32, 'treinta y tres': 33, 'treinta y cuatro': 34,
  'treinta y cinco': 35, 'treinta y seis': 36, 'treinta y siete': 37, 'treinta y ocho': 38,
  'treinta y nueve': 39, cuarenta: 40,
};

interface Fila {
  paquete: string;
  version: string;
  licencia: string;
}

interface EntradaLock {
  version: string;
  license?: string;
}

/** El número en letra que precede a `frase`, en negrita: «**cinco** dependencias declaradas». */
function cifraDicha(texto: string, frase: string): number {
  // El `> ` de una cita puede partir la frase en dos líneas: se tolera.
  // [a-zéó ]: las cifras compuestas llevan espacios («treinta y una») y tildes («veintidós»).
  const patron = new RegExp(`\\*\\*([a-zéó ]+)\\*\\*[\\s>]+${frase.replaceAll(' ', '[\\s>]+')}`);
  const dicho = patron.exec(texto);
  assert.ok(dicho, `el NOTICES tiene que decir en negrita cuántas «${frase}» hay`);
  const cuantas = EN_LETRA[dicho[1]!];
  assert.ok(cuantas !== undefined, `«${dicho[1]}» no está en la tabla de números con letra de este juez: añádelo`);
  return cuantas;
}

/** Las filas de la tabla de la sección que empieza por `### <numero> · `. */
function filasDe(texto: string, numero: string): Fila[] {
  const inicio = texto.indexOf(`### ${numero} · `);
  assert.ok(inicio >= 0, `falta la sección § ${numero}`);
  const resto = texto.slice(inicio + 4);
  const fin = resto.search(/^#{2,3} /m);
  const seccion = fin >= 0 ? resto.slice(0, fin) : resto;
  return [...seccion.matchAll(/^\| `([^`]+)` \| ([^|]+?) \| ([^|]+?) \|/gm)].map((m) => ({
    paquete: m[1]!,
    version: m[2]!.trim(),
    licencia: m[3]!.trim(),
  }));
}

/**
 * ⚠️ Se lee DENTRO de cada test, nunca en el cuerpo del `describe`
 * (docs/BITACORA.md, 2026-09-29): si la lectura revienta en el `describe`,
 * `node --test` marca la suite con ✖ y sale con 1, pero el resumen dice
 * «ℹ fail 0» porque ningún juez llegó a existir. Aquí revienta dentro de cada
 * juez y cada uno cuenta como fallido.
 */
let leido: ReturnType<typeof leerTodo> | undefined;
function leer(): ReturnType<typeof leerTodo> {
  leido ??= leerTodo();
  return leido;
}

function leerTodo() {
  const texto = readFileSync(NOTICES, 'utf8');
  const pkg = JSON.parse(readFileSync(PACKAGE, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const lock = JSON.parse(readFileSync(LOCK, 'utf8')) as { packages: Record<string, EntradaLock> };
  return {
    texto,
    lock,
    ejecucion: Object.keys(pkg.dependencies ?? {}).sort(),
    desarrollo: Object.keys(pkg.devDependencies ?? {}).sort(),
  };
}

describe('el THIRD-PARTY-NOTICES no puede envejecer solo', () => {
  test('1 · la cabecera dice tantas dependencias declaradas como declara motor/package.json', () => {
    const { texto, ejecucion, desarrollo } = leer();
    assert.equal(cifraDicha(texto, 'dependencias declaradas'), ejecucion.length + desarrollo.length);
  });

  test('2 · § 1.1 lista las de ejecución y § 1.2 las de desarrollo, ni una más ni una menos', () => {
    const { texto, ejecucion, desarrollo } = leer();
    assert.deepEqual(filasDe(texto, '1.1').map((f) => f.paquete).sort(), ejecucion, '§ 1.1 frente a dependencies');
    assert.deepEqual(filasDe(texto, '1.2').map((f) => f.paquete).sort(), desarrollo, '§ 1.2 frente a devDependencies');
  });

  test('3 · versión y licencia de cada fila son las que instala el package-lock.json', () => {
    const { texto, lock } = leer();
    for (const fila of [...filasDe(texto, '1.1'), ...filasDe(texto, '1.2')]) {
      const instalada = lock.packages[`node_modules/${fila.paquete}`];
      assert.ok(instalada, `${fila.paquete} no está en el package-lock.json`);
      assert.equal(fila.version, instalada.version, `versión de ${fila.paquete}`);
      assert.equal(fila.licencia, instalada.license, `licencia de ${fila.paquete}`);
    }
  });

  test('4 · § 1.3 dice tantas transitivas como trae el package-lock.json', () => {
    const { texto, lock, ejecucion, desarrollo } = leer();
    const declaradas = new Set([...ejecucion, ...desarrollo]);
    const transitivas = Object.keys(lock.packages).filter(
      (ruta) => ruta !== '' && !declaradas.has(ruta.replace(/^.*node_modules\//, '')),
    );
    assert.equal(cifraDicha(texto, 'dependencias transitivas'), transitivas.length);
  });
});

describe('los datos de terceros de data/ tienen ficha y licencia al lado', () => {
  /** Las carpetas de primer nivel bajo data/. */
  function carpetas(): string[] {
    return readdirSync(DATOS, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  }

  test('5 · cada carpeta de data/ tiene su ficha en § 2, y cada ficha su carpeta', () => {
    const { texto } = leer();
    const fichas = [...texto.matchAll(/^### 2\.\d+ · `data\/([^`/]+)\/`/gm)].map((m) => m[1]!).sort();
    assert.deepEqual(fichas, carpetas(), 'fichas «### 2.x · `data/<carpeta>/`» frente a carpetas de data/');
  });

  test('6 · cada carpeta de data/ lleva al lado su LICENSE-*.md', () => {
    for (const carpeta of carpetas()) {
      const licencias = readdirSync(new URL(`${carpeta}/`, DATOS)).filter((f) => /^LICENSE-.+\.md$/.test(f));
      assert.ok(licencias.length > 0, `data/${carpeta}/ no tiene ningún LICENSE-*.md`);
    }
  });
});

describe('cada calibración de data/calibracion/ tiene su fila en § 2.3', () => {
  const CALIBRACION = new URL('calibracion/', DATOS);

  /** Los géneros calibrados: los `<genero>.json` de data/calibracion/ que no son manifiestos. */
  function generos(): string[] {
    if (!existsSync(CALIBRACION)) return [];
    return readdirSync(CALIBRACION)
      .filter((f) => /^[a-z0-9]+(-[a-z0-9]+)*\.json$/.test(f) && !f.endsWith('.manifiesto.json'))
      .sort();
  }

  /** Las filas de la tabla de § 2.3: fichero y licencia (sin negrita). */
  function filas(): { fichero: string; licencia: string }[] {
    const { texto } = leer();
    const inicio = texto.indexOf('### 2.3 · ');
    assert.ok(inicio >= 0, 'falta la sección § 2.3');
    const resto = texto.slice(inicio + 4);
    const fin = resto.search(/^#{2,3} /m);
    const seccion = fin >= 0 ? resto.slice(0, fin) : resto;
    return [...seccion.matchAll(/^\| `([^`]+\.json)` \|[^|]+\|[^|]+\| ([^|]+?) \|/gm)].map((m) => ({
      fichero: m[1]!,
      licencia: m[2]!.replaceAll('**', '').trim(),
    }));
  }

  test('9 · cada data/calibracion/<genero>.json tiene su fila en § 2.3, y cada fila su fichero', () => {
    assert.deepEqual(filas().map((f) => f.fichero).sort(), generos());
  });

  test('10 · cada <genero>.json lleva al lado su manifiesto, y su fila dice la licencia que dice el fichero', () => {
    for (const fila of filas()) {
      const genero = fila.fichero.replace(/\.json$/, '');
      assert.ok(existsSync(new URL(`${genero}.manifiesto.json`, CALIBRACION)), `falta data/calibracion/${genero}.manifiesto.json`);
      const { licencia } = JSON.parse(readFileSync(new URL(fila.fichero, CALIBRACION), 'utf8')) as { licencia: string };
      assert.equal(fila.licencia, licencia.replace(/ \(.*$/, ''), `licencia de ${fila.fichero} en § 2.3 frente a la del fichero`);
    }
  });
});

describe('el código de terceros incorporado es el que dice § 1.5', () => {
  interface Fila {
    fichero: string;
    licencia: string;
    shaFichero: string;
    shaOriginal: string;
  }

  const sha256 = (texto: string): string => createHash('sha256').update(texto).digest('hex');
  const enLF = (texto: string): string => texto.replaceAll('\r\n', '\n');

  function filas(): Fila[] {
    const { texto } = leer();
    const inicio = texto.indexOf('### 1.5 · ');
    assert.ok(inicio >= 0, 'falta la sección § 1.5');
    const resto = texto.slice(inicio + 4);
    const seccion = resto.slice(0, resto.search(/^#{2,3} /m));
    return [...seccion.matchAll(/^\| `([^`]+)` \|[^|]+\|[^|]+\| ([^|]+?) \| `([0-9a-f]{64})` \| `([0-9a-f]{64})` \|/gm)].map((m) => ({
      fichero: m[1]!,
      licencia: m[2]!,
      shaFichero: m[3]!,
      shaOriginal: m[4]!,
    }));
  }

  test('7 · cada fichero de motor/src/terceros/ tiene su fila en § 1.5, y cada fila su fichero', () => {
    const ajenos = readdirSync(TERCEROS)
      .filter((f) => !/\.d\.c?ts$/.test(f))
      .map((f) => `motor/src/terceros/${f}`)
      .sort();
    assert.ok(ajenos.length > 0, 'no hay ningún fichero en motor/src/terceros/');
    assert.deepEqual(filas().map((f) => f.fichero).sort(), ajenos);
  });

  test('8 · cada fichero empieza por su aviso, y sus huellas son las de la tabla', () => {
    for (const fila of filas()) {
      const ruta = new URL(fila.fichero, RAIZ);
      assert.ok(existsSync(ruta), `no existe ${fila.fichero}`);
      const contenido = enLF(readFileSync(ruta, 'utf8'));
      const fin = contenido.indexOf('*/\n');
      assert.ok(contenido.startsWith('/*') && fin > 0, `${fila.fichero} no empieza por un comentario de cabecera`);
      const cabecera = contenido.slice(0, fin + 3);
      assert.ok(cabecera.includes(`${fila.licencia} License`), `la cabecera de ${fila.fichero} no trae el texto de la licencia ${fila.licencia}`);
      assert.ok(cabecera.includes('Copyright (c)'), `la cabecera de ${fila.fichero} no trae el aviso de copyright`);
      assert.equal(sha256(contenido), fila.shaFichero, `sha256 de ${fila.fichero}`);
      assert.equal(sha256(contenido.slice(fin + 3)), fila.shaOriginal, `sha256 de ${fila.fichero} sin su cabecera (el original)`);
    }
  });
});
