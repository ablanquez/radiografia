/**
 * Los jueces de la entrada del navegador (encargo 6.1, c): motor/src/navegador.ts
 * empaquetado con esbuild (bundle, platform browser, ESM, sin minificar).
 * ⚠️ Empaquetar con esbuild NO es el build de la web: el build real es el de
 *    Astro (Vite 8 con Rolldown y el minificador Oxc, web/), que trata los
 *    comentarios legales de otra manera (docs/BITACORA.md, 2026-10-02). Lo
 *    que llega de verdad al navegador lo vigilan los jueces de la web
 *    construida, web/jueces/construccion.spec.ts.
 *
 *   1. El metafile: ningún input de node_modules/ajv y ninguna importación de
 *      un módulo de Node (`node:*` o su nombre sin prefijo), ni en el paquete
 *      sin datos ni en el paquete con los dos paquetes de reglas (con su
 *      calibración). Los tamaños en bytes de los dos se dicen
 *      (t.diagnostic); no se juzgan.
 *   2. Empaquetado, hace lo mismo que el motor en Node: validarPaquete, sobre
 *      los fixtures; analizar, con los dos paquetes reales, sobre el texto de
 *      prueba y sobre los ejemplos positivos de RadiografIA, con el género por
 *      defecto y con «noticia»; y un paquete roto lanza el mismo
 *      PaqueteInvalido. bandaHumana va dentro de analizar y, suelta, con una
 *      celda de verdad.
 *   3. El aviso MIT de Ajv en el bundle de esbuild (respuesta al informe
 *      final del 6.1): el bundle de navegador.ts, sin minificar y minificado
 *      con esbuild, lleva entero el LICENSE de node_modules/ajv (con LF). El
 *      standalone lo trae en cabecera (generar-validador.ts) y esbuild lo
 *      conserva como comentario legal, al final del fichero. Que el aviso
 *      viaje en el JS de la web lo juzga el juez 6 de
 *      web/jueces/construccion.spec.ts: Vite 8 lo quita al minificar si no se
 *      le pide conservarlo (web/astro.config.mjs).
 *
 * [DOC] https://esbuild.github.io/api/#legal-comments — un comentario que
 *    empieza por «/*!» es «legal»: «These comments are preserved in output
 *    files by default».
 * [PROPIO] `#validador-standalone` (motor/package.json, «imports») lleva en
 *    build a motor/dist/validador.standalone.js. Aquí se enchufa el que el juez
 *    genera en un temporal, con un plugin de esbuild: standalone.spec.ts borra y
 *    regenera el de motor/dist/, y node --test ejecuta los ficheros a la vez.
 * [PROPIO] Los módulos de Node se marcan externos: con platform browser,
 *    esbuild no los resuelve y la construcción fallaría sin metafile; externos,
 *    salen en el metafile y el juez dice cuál y desde dónde.
 * [PROPIO] En el temporal se escribe `.mjs`, como en standalone.spec.ts: allí
 *    no hay package.json que diga `"type": "module"`.
 *
 * [DOC] https://esbuild.github.io/api/#metafile — `inputs` (cada fichero leído,
 *    con sus `imports`) y `outputs` (con `bytes`); el tipo `Metafile` de
 *    node_modules/esbuild/lib/main.d.ts (0.28.2).
 * [DOC] https://esbuild.github.io/plugins/#on-resolve — onResolve con `filter`
 *    devuelve la ruta en la que esbuild lee el módulo.
 * [DOC] https://esbuild.github.io/api/#external — los externos se quedan como
 *    importaciones en la salida; admite el comodín «*».
 * [DOC] https://nodejs.org/api/module.html#modulebuiltinmodules — la lista de
 *    los módulos de Node, sin prefijo.
 * [DOC] https://nodejs.org/api/test.html — node:test (`t.diagnostic`).
 */
import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { builtinModules, createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, type Metafile, type Plugin } from 'esbuild';
import { generarValidador } from './generar-validador.ts';
import { analizar } from './analizar.ts';
import { bandaHumana } from './banda.ts';
import { validarPaquete } from './validar.ts';
import type { Paquete } from './paquete.ts';

const MOTOR = fileURLToPath(new URL('..', import.meta.url));
const ENTRADA = fileURLToPath(new URL('./navegador.ts', import.meta.url));
const PAQUETES = new URL('../../paquetes/', import.meta.url);
const FIXTURES = new URL('../fixtures/', import.meta.url);

const directorio = mkdtempSync(join(tmpdir(), 'radiografia-navegador-'));
after(() => rmSync(directorio, { recursive: true, force: true }));

interface Empaquetado {
  ruta: string;
  bytes: number;
  metafile: Metafile;
}

let estandar: Promise<string> | undefined;
/** El validador standalone, generado una vez en el temporal; su ruta. */
function standaloneDelTemporal(): Promise<string> {
  estandar ??= (async () => {
    const ruta = join(directorio, 'validador.standalone.mjs');
    await generarValidador(pathToFileURL(ruta));
    return ruta;
  })();
  return estandar;
}

const DE_NODE = new Set(builtinModules);
const esDeNode = (ruta: string): boolean => ruta.startsWith('node:') || DE_NODE.has(ruta);

/** Empaqueta como el build: `entrada` es un fichero o, con `stdin`, el código de una entrada en motor/src/. */
async function empaquetar(nombre: string, entrada: { fichero: string } | { stdin: string }, minify = false): Promise<Empaquetado> {
  const standalone = await standaloneDelTemporal();
  const enchufe: Plugin = {
    name: 'validador-standalone-del-temporal',
    setup(b) {
      b.onResolve({ filter: /^#validador-standalone$/ }, () => ({ path: standalone }));
    },
  };
  const ruta = join(directorio, `${nombre}.mjs`);
  const r = await build({
    ...('fichero' in entrada
      ? { entryPoints: [entrada.fichero] }
      : { stdin: { contents: entrada.stdin, resolveDir: join(MOTOR, 'src'), sourcefile: `${nombre}.ts`, loader: 'ts' as const } }),
    absWorkingDir: MOTOR,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    minify,
    metafile: true,
    external: ['node:*', ...builtinModules],
    plugins: [enchufe],
    outfile: ruta,
    logLevel: 'silent',
  });
  return { ruta, bytes: statSync(ruta).size, metafile: r.metafile };
}

let sinDatos: Promise<Empaquetado> | undefined;
let conDatos: Promise<Empaquetado> | undefined;
const elSinDatos = () => (sinDatos ??= empaquetar('navegador', { fichero: ENTRADA }));
let minificado: Promise<Empaquetado> | undefined;
const elMinificado = () => (minificado ??= empaquetar('navegador-minificado', { fichero: ENTRADA }, true));
const elConDatos = () =>
  (conDatos ??= empaquetar('navegador-con-datos', {
    stdin: [
      "export * from './navegador.ts';",
      "import radiografia from '../../paquetes/radiografia.json' with { type: 'json' };",
      "import espanolCorrecto from '../../paquetes/espanol-correcto.json' with { type: 'json' };",
      'export { radiografia, espanolCorrecto };',
    ].join('\n'),
  }));

/** Lo que el metafile no tiene que listar: inputs de node_modules/ajv e importaciones de módulos de Node. */
function loQueSobra(metafile: Metafile): { ajv: string[]; deNode: string[]; salida: string[] } {
  const ajv = Object.keys(metafile.inputs).filter((p) => /(^|[\\/])node_modules[\\/]ajv[\\/]/.test(p));
  const deNode = Object.entries(metafile.inputs).flatMap(([p, i]) => i.imports.filter((x) => esDeNode(x.path)).map((x) => `${p} → ${x.path}`));
  const salida = Object.values(metafile.outputs).flatMap((o) => o.imports.map((x) => x.path));
  return { ajv, deNode, salida };
}

const leer = (fichero: string): Paquete => JSON.parse(readFileSync(new URL(fichero, PAQUETES), 'utf8')) as Paquete;

describe('la entrada del navegador (navegador.ts), empaquetada con esbuild', () => {
  test('1 · el metafile: ningún input de node_modules/ajv ni importación de un módulo de Node, con y sin datos', async (t) => {
    const sin = await elSinDatos();
    const con = await elConDatos();
    const datos = ['radiografia.json', 'espanol-correcto.json'].map((f) => `${f} ${statSync(new URL(f, PAQUETES)).size}`);
    t.diagnostic(`sin datos: ${sin.bytes} bytes · con datos: ${con.bytes} bytes (paquetes: ${datos.join(', ')} bytes)`);
    for (const [nombre, e] of [['sin datos', sin], ['con datos', con]] as const) {
      const { ajv, deNode, salida } = loQueSobra(e.metafile);
      t.diagnostic(`${nombre}: ${Object.keys(e.metafile.inputs).length} inputs`);
      assert.deepEqual(ajv, [], `${nombre}: entra código de node_modules/ajv (${ajv.length} ficheros)`);
      assert.deepEqual(deNode, [], `${nombre}: importa módulos de Node`);
      assert.deepEqual(salida, [], `${nombre}: la salida importa desde fuera`);
    }
  });

  test('2 · empaquetado, hace lo mismo que el motor en Node', async () => {
    const nav = (await import(pathToFileURL((await elSinDatos()).ruta).href)) as {
      analizar: typeof analizar;
      bandaHumana: typeof bandaHumana;
      validarPaquete: typeof validarPaquete;
    };
    const nombres = readdirSync(FIXTURES, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name);
    assert.ok(nombres.length > 0, 'sin fixtures');
    for (const nombre of nombres) {
      const dato: unknown = JSON.parse(readFileSync(new URL(nombre, FIXTURES), 'utf8'));
      assert.deepEqual(nav.validarPaquete(dato), validarPaquete(dato), nombre);
    }

    const radiografia = leer('radiografia.json');
    const paquetes = [radiografia, leer('espanol-correcto.json')];
    const prueba = readFileSync(new URL('referencia/texto-prueba-322.txt', FIXTURES), 'utf8');
    const ejemplos = radiografia.reglas.flatMap((r) => r.ejemplos.positivos).join('\n\n');
    for (const texto of [prueba, ejemplos]) {
      for (const opciones of [{}, { genero: 'noticia' }]) {
        assert.deepEqual(nav.analizar(texto, paquetes, opciones), analizar(texto, paquetes, opciones), JSON.stringify(opciones));
      }
    }

    const roto = structuredClone(radiografia);
    roto.cabecera.calibracion!['ttr']!['general']!['600+']!.p5 = 99;
    const esperado = (() => {
      try {
        analizar(prueba, [roto]);
      } catch (e) {
        return e as Error & { errores: unknown };
      }
      assert.fail('en Node, el paquete roto no lanzó');
    })();
    assert.throws(
      () => nav.analizar(prueba, [roto]),
      (e: Error & { errores: unknown }) => e.name === 'PaqueteInvalido' && e.message === esperado.message && JSON.stringify(e.errores) === JSON.stringify(esperado.errores),
    );

    const calibracion = radiografia.cabecera.calibracion;
    for (const total of [0, 5, 40]) {
      assert.deepEqual(nav.bandaHumana(total, 'general', '300-599', calibracion), bandaHumana(total, 'general', '300-599', calibracion), String(total));
    }
  });

  test('3 · el bundle, sin minificar y minificado, lleva entero el aviso MIT de Ajv', async () => {
    const licencia = readFileSync(createRequire(import.meta.url).resolve('ajv/LICENSE'), 'utf8').replace(/\r\n/g, '\n').trim();
    assert.match(licencia, /^The MIT License \(MIT\)\n\nCopyright \(c\) 2015-2021 Evgeny Poberezkin\n/, 'el LICENSE de ajv no es el que se miró el 02/10');
    for (const [nombre, e] of [['sin minificar', await elSinDatos()], ['minificado', await elMinificado()]] as const) {
      assert.ok(readFileSync(e.ruta, 'utf8').includes(licencia), `${nombre}: el bundle no lleva el LICENSE de ajv entero`);
    }
  });
});
