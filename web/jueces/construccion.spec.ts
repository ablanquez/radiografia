/**
 * Los jueces de la web construida (encargo 6.2).
 *
 *   1. `npm run build` termina, con su prebuild (el standalone del motor y la
 *      copia de los paquetes a public/), y deja dist/index.html.
 *   2. dist/index.html lleva el botón «Pon tu texto a contraluz», la nota
 *      de autoría y lang="es".
 *   3. Ningún JS de dist/ lleva el código de Ajv ni de Node: ni «Ajv2020»,
 *      ni «new Ajv», ni «addKeyword», ni «node:», y toda aparición de
 *      «ajv/dist» es ajv/dist/runtime/ucs2length, la función que el standalone
 *      lleva por diseño (THIRD-PARTY-NOTICES § 1.1). La palabra «Ajv» del
 *      aviso MIT no cuenta (firmado en la parada 1 del 6.2, punto 7).
 *   4. Los paquetes de dist/paquetes/ son, byte a byte, los de paquetes/: ni
 *      uno más ni uno menos.
 *   5. `astro preview` sirve dist/: 200 en / y 404 en /no-existe. Se arranca
 *      en un puerto libre, se le pide y se cierra.
 *   6. El JS de dist/ que lleva el validador lleva también, entero, el aviso
 *      MIT de Ajv: el LICENSE de ajv (docs/BITACORA.md, 2026-10-02: Vite 8
 *      quita los comentarios legales al minificar, y web/astro.config.mjs le
 *      pide que los conserve).
 *   7. dist/ejemplos/ lleva los dos textos de ejemplo, byte a byte los de
 *      public/ejemplos/, y estos están en UTF-8 sin BOM y con saltos \n
 *      (encargo 6.3, a, juez 1).
 *   8. dist/index.html lleva los dos botones de los ejemplos, que no envían
 *      el formulario, y la línea que dice de quién es cada texto (encargo 6.3,
 *      a, juez 4).
 *
 * El build, memorizado y con la telemetría apagada, es el de apoyo.ts (lo
 * comparte con textos-web.spec.ts). Astro preview también se arranca con
 * ASTRO_TELEMETRY_DISABLED=1 (ENTORNO).
 *
 * [DOC] https://docs.astro.build/en/reference/cli-reference/ — `astro
 *    preview`: «Starts a local server to serve the contents of your static
 *    directory (dist/ by default) created by running astro build»; acepta
 *    `--port` y `--host`.
 * [DOC] https://nodejs.org/api/child_process.html — astro se lanza con
 *    `spawn` de node sobre su `bin`, para poder cerrarlo con kill().
 * [DOC] https://nodejs.org/api/net.html#serverlistenport-host-backlog-callback
 *    — con el puerto 0, el sistema elige uno libre.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer, type AddressInfo } from 'node:net';
import { dirname, join } from 'node:path';
import { EJEMPLOS } from '../src/pantalla/ejemplos.ts';
import { construir, DIST, ENTORNO, PAQUETES, WEB } from './apoyo.ts';

const PUBLICOS = new URL('../public/ejemplos/', import.meta.url);

const BOTON = 'Pon tu texto a contraluz';
const NOTA = 'RadiografIA analiza estilo; no demuestra autoría.';
const BOTONES_DE_EJEMPLO = ['Cargar ejemplo: texto humano', 'Cargar ejemplo: texto de IA'];
const PROCEDENCIA = 'El texto humano lo escribió Antonio; el de IA lo generó Claude Opus 5.5, sin instrucciones de estilo.';

/** Los .js de dist/, a cualquier profundidad, con su ruta relativa y su texto. */
function jsDeDist(): { ruta: string; texto: string }[] {
  return readdirSync(DIST, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.js'))
    .map((ruta) => ({ ruta, texto: readFileSync(new URL(ruta.replaceAll('\\', '/'), DIST), 'utf8') }));
}

/** El LICENSE de ajv, resuelto desde el motor, que es quien declara ajv. */
function licenciaDeAjv(): string {
  const desdeElMotor = createRequire(new URL('../../motor/package.json', import.meta.url));
  return readFileSync(desdeElMotor.resolve('ajv/LICENSE'), 'utf8').replace(/\r\n/g, '\n').trim();
}

/** El ejecutable de astro: el `bin` de su package.json (astro exporta ./package.json). */
function binDeAstro(): string {
  const paquete = createRequire(import.meta.url).resolve('astro/package.json');
  const { bin } = JSON.parse(readFileSync(paquete, 'utf8')) as { bin: { astro: string } };
  return join(dirname(paquete), bin.astro);
}

function puertoLibre(): Promise<number> {
  return new Promise((resolver, rechazar) => {
    const servidor = createServer();
    servidor.once('error', rechazar);
    servidor.listen(0, '127.0.0.1', () => {
      const { port } = servidor.address() as AddressInfo;
      servidor.close(() => resolver(port));
    });
  });
}

/** Arranca `astro preview` en un puerto libre, espera a que responda, hace `pedir` y lo cierra. */
async function conPreview(pedir: (url: string) => Promise<void>): Promise<void> {
  const puerto = await puertoLibre();
  const hijo = spawn(process.execPath, [binDeAstro(), 'preview', '--port', String(puerto), '--host', '127.0.0.1'], {
    cwd: WEB,
    env: ENTORNO,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let registro = '';
  hijo.stdout.on('data', (d) => (registro += d));
  hijo.stderr.on('data', (d) => (registro += d));
  const url = `http://127.0.0.1:${puerto}/`;
  try {
    const limite = Date.now() + 30_000;
    for (;;) {
      try {
        await fetch(url);
        break;
      } catch {
        if (Date.now() > limite || hijo.exitCode !== null) throw new Error(`astro preview no responde en ${url}:\n${registro}`);
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    await pedir(url);
  } finally {
    hijo.kill();
  }
}

describe('la web construida', () => {
  test('1 · npm run build termina, con su prebuild, y deja dist/index.html', () => {
    const salida = construir();
    assert.match(salida, /generado: /, `el prebuild no generó el standalone:\n${salida}`);
    assert.match(salida, /copiados a /, `el prebuild no copió los paquetes:\n${salida}`);
    assert.ok(existsSync(new URL('index.html', DIST)), `no existe web/dist/index.html:\n${salida}`);
  });

  test('2 · dist/index.html lleva el botón, la nota de autoría y lang="es"', () => {
    construir();
    const html = readFileSync(new URL('index.html', DIST), 'utf8');
    assert.match(html, /<html lang="es"/, 'sin lang="es"');
    assert.ok(html.includes(BOTON), `sin «${BOTON}»`);
    assert.ok(html.includes(NOTA), `sin «${NOTA}»`);
  });

  test('3 · ningún JS de dist/ lleva el código de Ajv ni de Node', () => {
    construir();
    const js = jsDeDist();
    assert.ok(js.length > 0, 'dist/ no tiene ningún JS');
    const hallados: string[] = [];
    for (const { ruta, texto } of js) {
      for (const prohibida of ['Ajv2020', 'new Ajv', 'addKeyword', 'node:']) if (texto.includes(prohibida)) hallados.push(`${ruta}: «${prohibida}»`);
      for (const m of texto.matchAll(/ajv\/dist\/[^"'`\s)]*/g)) if (!m[0].startsWith('ajv/dist/runtime/ucs2length')) hallados.push(`${ruta}: «${m[0]}»`);
    }
    assert.deepEqual(hallados, []);
  });

  test('4 · los paquetes de dist/paquetes/ son, byte a byte, los de paquetes/', () => {
    construir();
    const fuente = readdirSync(PAQUETES).filter((f) => f.endsWith('.json')).sort();
    assert.ok(fuente.length > 0, 'paquetes/ no tiene ningún JSON');
    assert.deepEqual(readdirSync(new URL('paquetes/', DIST)).sort(), fuente, 'los ficheros de dist/paquetes/');
    for (const f of fuente) {
      assert.ok(readFileSync(new URL(f, PAQUETES)).equals(readFileSync(new URL(`paquetes/${f}`, DIST))), `dist/paquetes/${f} no es paquetes/${f}`);
    }
  });

  test('6 · el JS de dist/ que lleva el validador lleva entero el aviso MIT de Ajv', () => {
    construir();
    const licencia = licenciaDeAjv();
    assert.match(licencia, /^The MIT License \(MIT\)\n\nCopyright \(c\) 2015-2021 Evgeny Poberezkin\n/, 'el LICENSE de ajv no es el que se miró el 02/10');
    const conValidador = jsDeDist().filter(({ texto }) => texto.includes('ucs2length'));
    assert.ok(conValidador.length > 0, 'ningún JS de dist/ lleva el validador standalone');
    for (const { ruta, texto } of conValidador) assert.ok(texto.replace(/\r\n/g, '\n').includes(licencia), `${ruta} no lleva el LICENSE de ajv entero`);
  });

  test('7 · dist/ejemplos/ lleva los dos textos de ejemplo, byte a byte los de public/ejemplos/, en UTF-8 sin BOM y con \\n', () => {
    construir();
    const ficheros = Object.values(EJEMPLOS).sort();
    assert.deepEqual(readdirSync(PUBLICOS).sort(), ficheros, 'los ficheros de public/ejemplos/');
    assert.deepEqual(readdirSync(new URL('ejemplos/', DIST)).sort(), ficheros, 'los ficheros de dist/ejemplos/');
    for (const f of ficheros) {
      const bytes = readFileSync(new URL(f, PUBLICOS));
      assert.ok(bytes.equals(readFileSync(new URL(`ejemplos/${f}`, DIST))), `dist/ejemplos/${f} no es public/ejemplos/${f}`);
      const texto = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
      assert.ok(!texto.startsWith('\uFEFF'), `public/ejemplos/${f} empieza con BOM`);
      assert.ok(!texto.includes('\r'), `public/ejemplos/${f} lleva \\r`);
    }
  });

  test('8 · dist/index.html lleva los dos botones de los ejemplos y de quién es cada texto', () => {
    construir();
    const html = readFileSync(new URL('index.html', DIST), 'utf8');
    for (const etiqueta of BOTONES_DE_EJEMPLO) {
      assert.match(html, new RegExp(`<button [^>]*type="button"[^>]*>${etiqueta}</button>`), `sin el botón «${etiqueta}» (type="button")`);
    }
    assert.ok(html.includes(PROCEDENCIA), `sin «${PROCEDENCIA}»`);
  });

  test('5 · astro preview responde 200 en / y 404 en /no-existe', async () => {
    construir();
    await conPreview(async (url) => {
      assert.equal((await fetch(url)).status, 200, `GET ${url}`);
      assert.equal((await fetch(`${url}no-existe`)).status, 404, `GET ${url}no-existe`);
    });
  });
});
