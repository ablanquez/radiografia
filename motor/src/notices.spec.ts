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
 * Vive en la suite del motor porque es donde hay un `node --test`, no porque
 * sea código del motor. Lee por rutas relativas a ESTE fichero, no al `cwd`.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test, estable desde v20.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const NOTICES = new URL('../../THIRD-PARTY-NOTICES.md', import.meta.url);
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
