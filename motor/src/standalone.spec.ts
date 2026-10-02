/**
 * Los jueces del validador standalone (encargo 3.2).
 *
 * El navegador no llevará Ajv: llevará la función de validación que
 * `generar-validador.ts` genera en build. Estos jueces la generan en un
 * directorio temporal y comprueban que es EL MISMO validador que el de Ajv en
 * vivo, sobre los cuarenta y un fixtures, y que no depende de nada en ejecución.
 *
 *   1. Equivalencia de esquema: mismo veredicto y, en los inválidos de
 *      esquema, mismos errores tras el mismo formateador. Los inválidos
 *      que caza el paso 2 los aceptan los dos por igual.
 *   2. Equivalencia completa: validarPaquete con el standalone enchufado da
 *      exactamente lo mismo que con Ajv en vivo.
 *   3. El fichero generado no deja nada por resolver: según el metafile de
 *      esbuild, la salida no importa nada de fuera (ni `import`, ni
 *      `require()`), y su texto no lleva «import ». No se busca el texto
 *      «require(»: el fichero empaquetado lo contiene sin que sea una llamada
 *      (el ayudante `function __require()` de esbuild y el texto
 *      `ucs2length.code = 'require(…)'` de Ajv). Decisión de Antonio, 3.2.
 *      [DOC] el tipo `Metafile` de `node_modules/esbuild/lib/main.d.ts`
 *      (0.28.2): `outputs[fichero].imports: { path, kind, external }[]`.
 *   5. El paquete real (encargo 5.5): paquetes/radiografia.json, con la
 *      calibración inyectada, mismo veredicto (válido) con el standalone que
 *      en vivo; y dos copias rotas a propósito, mismos errores.
 *   6. El aviso MIT de Ajv (encargo 6.1): el fichero empieza por un
 *      comentario «/*! … *\/» con el LICENSE de ajv entero.
 *
 * ⚠️ Se genera DENTRO de los tests (memorizado), no en un hook ni en el cuerpo
 *    del describe: si la generación revienta, cada juez cuenta como fallido
 *    (docs/BITACORA.md, 2026-09-29). Y el juez 3 no importa el módulo: solo lo
 *    lee, para que su rojo diga qué hay dentro y no «no carga».
 *
 * [PROPIO] En el temporal se escribe `.mjs`: allí no hay package.json que diga
 *    `"type": "module"`, y no se deja a la detección de sintaxis de Node.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test, estable desde v20.
 */
import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Metafile } from 'esbuild';
import { generarValidador, NOMBRE_EXPORTADO } from './generar-validador.ts';
import { validarEsquema, validarPaquete, type ValidadorDeEsquema } from './validar.ts';

const FIXTURES = new URL('../fixtures/', import.meta.url);

/** Los inválidos que el esquema deja pasar y caza el paso 2 de validar.ts. */
const DEL_PASO_2 = [
  'invalido-id-repetido.json',
  'invalido-familia-no-declarada.json',
  'invalido-familias-repetidas.json',
  'invalido-regla-puntua-en-familia-informativa.json',
  'invalido-regex-no-compila.json',
  'invalido-forma-con-espacio.json',
  'invalido-ambito-frase-sin-regex.json',
  'invalido-regex-con-ancla.json',
  'invalido-metrica-desconocida.json',
  'invalido-sin-calibracion-para-la-metrica.json',
  'invalido-sin-genero-general.json',
  'invalido-percentiles-desordenados.json',
  'invalido-generos-con-general.json',
];

const directorio = mkdtempSync(join(tmpdir(), 'radiografia-standalone-'));
after(() => rmSync(directorio, { recursive: true, force: true }));

interface Generado {
  ruta: URL;
  codigo: string;
  metafile: Metafile;
}

let fichero: Promise<Generado> | undefined;
/** Genera el validador en el temporal, una vez, y devuelve su ruta, su texto y el metafile de esbuild. */
function generado(): Promise<Generado> {
  fichero ??= (async () => {
    const ruta = pathToFileURL(join(directorio, 'validador.standalone.mjs'));
    const metafile = await generarValidador(ruta);
    return { ruta, codigo: readFileSync(ruta, 'utf8'), metafile };
  })();
  return fichero;
}

async function standalone(): Promise<ValidadorDeEsquema> {
  const { ruta } = await generado();
  const modulo = (await import(ruta.href)) as Record<string, ValidadorDeEsquema>;
  const validador = modulo[NOMBRE_EXPORTADO];
  assert.ok(validador, `el módulo generado no exporta ${NOMBRE_EXPORTADO}`);
  return validador;
}

function fixtures(): { nombre: string; dato: unknown }[] {
  // Solo los ficheros de la raíz, que son los paquetes (fixtures/referencia/ es de otros jueces).
  const nombres = readdirSync(FIXTURES, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name).sort();
  assert.equal(nombres.length, 41, 'los cuarenta y un fixtures: si cambia, que alguien mire este juez');
  return nombres.map((nombre) => ({ nombre, dato: JSON.parse(readFileSync(new URL(nombre, FIXTURES), 'utf8')) }));
}

describe('el validador standalone es el mismo que el de Ajv en vivo', () => {
  test('1 · equivalencia de esquema sobre los cuarenta y un fixtures', async () => {
    const validador = await standalone();
    for (const { nombre, dato } of fixtures()) {
      const enVivo = validarEsquema(dato);
      const generadoEnBuild = validarEsquema(dato, validador);
      assert.deepEqual(generadoEnBuild, enVivo, nombre);
      const debeAceptar = nombre.startsWith('valido') || nombre.startsWith('paquete-prueba') || DEL_PASO_2.includes(nombre);
      assert.equal(enVivo.valido, debeAceptar, `${nombre}: el esquema en vivo tenía que ${debeAceptar ? 'aceptarlo' : 'rechazarlo'}`);
    }
  });

  test('2 · equivalencia completa: validarPaquete con el standalone enchufado', async () => {
    const validador = await standalone();
    for (const { nombre, dato } of fixtures()) {
      assert.deepEqual(validarPaquete(dato, validador), validarPaquete(dato), nombre);
    }
  });

  test('3 · el fichero generado no deja nada por resolver: el metafile no lista importaciones y el texto no lleva «import »', async () => {
    const { codigo, metafile } = await generado();
    const salidas = Object.entries(metafile.outputs);
    assert.equal(salidas.length, 1, `esbuild tenía que escribir un solo fichero: ${salidas.map(([f]) => f).join(', ')}`);
    const [[nombre, salida]] = salidas as [[string, Metafile['outputs'][string]]];
    assert.deepEqual(salida.imports, [], `${nombre} importa desde fuera: ${JSON.stringify(salida.imports)}`);
    assert.ok(!codigo.includes('import '), `lleva «import »: ${codigo.match(/.{0,40}import .{0,60}/)?.[0]}`);
  });

  /**
   * 5 · El paquete real (encargo 5.5): paquetes/radiografia.json, con la
   * calibración inyectada, valida con el standalone igual que en vivo y sin
   * errores; y una copia con una celda rota (percentiles desordenados, paso 2)
   * y otra con un método que no es «hyndman-fan-7» (esquema) los dos la
   * rechazan con los mismos errores.
   */
  test('5 · el paquete real, con su calibración: mismo veredicto en vivo y con el standalone', async () => {
    const validador = await standalone();
    const real = JSON.parse(readFileSync(new URL('../../paquetes/radiografia.json', import.meta.url), 'utf8'));
    assert.ok(Object.keys(real.cabecera.calibracion ?? {}).length > 0, 'el paquete real no trae cabecera.calibracion');
    assert.deepEqual(validarPaquete(real, validador), { valido: true, errores: [] });
    const desordenado = structuredClone(real);
    desordenado.cabecera.calibracion.ttr.general['600+'].p5 = 99;
    const metodo = structuredClone(real);
    metodo.cabecera.calibracion.ttr.general['600+'].metodo = 'otro';
    for (const roto of [desordenado, metodo]) {
      const enVivo = validarPaquete(roto);
      assert.equal(enVivo.valido, false);
      assert.deepEqual(validarPaquete(roto, validador), enVivo);
    }
  });

  /**
   * 6 · El aviso MIT de Ajv viaja dentro del fichero (encargo 6.1, c): la
   * salida empieza por un comentario «/*! … *\/» que lleva entero el LICENSE de
   * node_modules/ajv (finales de línea LF; el del paquete npm viene en CRLF).
   */
  test('6 · el fichero generado empieza por el aviso de licencia MIT de Ajv, el de su LICENSE entero', async () => {
    const { codigo } = await generado();
    const licencia = readFileSync(createRequire(import.meta.url).resolve('ajv/LICENSE'), 'utf8').replace(/\r\n/g, '\n').trim();
    assert.match(licencia, /^The MIT License \(MIT\)\n\nCopyright \(c\) 2015-2021 Evgeny Poberezkin\n/, 'el LICENSE de ajv no es el que se miró el 02/10');
    const cabecera = /^\/\*![\s\S]*?\*\//.exec(codigo)?.[0];
    assert.ok(cabecera !== undefined, `el fichero no empieza por un comentario «/*! … */»: ${JSON.stringify(codigo.slice(0, 80))}`);
    assert.ok(cabecera.includes(licencia), `la cabecera no lleva el LICENSE de ajv entero:\n${cabecera}`);
  });

  /**
   * 4 · El script de verdad (encargo 3.3): los jueces de arriba llaman a la
   * función en un temporal; este ejecuta `npm run generar` como proceso hijo,
   * tal como se lanzará en build, y mira lo que deja en motor/dist/.
   *
   * [DOC] https://nodejs.org/api/child_process.html («Spawning .bat and .cmd
   *    files on Windows»): npm es un .cmd en Windows y no se puede lanzar con
   *    execFile; la doc da `exec` (que pasa por cmd.exe) como vía, y desaconseja
   *    spawn con `shell` (DEP0190). Comando fijo, sin nada que venga de fuera.
   * [PROPIO] Se borra antes el fichero de salida (es salida de build y no se
   *    versiona), para que lo que se juzga lo haya escrito ESTA ejecución.
   */
  test('4 · `npm run generar` deja motor/dist/validador.standalone.js, y no vacío', () => {
    const motor = fileURLToPath(new URL('..', import.meta.url));
    const salida = fileURLToPath(new URL('../dist/validador.standalone.js', import.meta.url));
    rmSync(salida, { force: true });
    const consola = execSync('npm run generar', { cwd: motor, encoding: 'utf8', stdio: 'pipe' });
    assert.match(consola, /generado: /, `el script no dijo que generara: ${consola}`);
    assert.ok(existsSync(salida), `no existe ${salida}`);
    assert.ok(statSync(salida).size > 0, `${salida} está vacío`);
  });
});
