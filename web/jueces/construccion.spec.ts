/**
 * Los jueces de la web construida (encargo 6.2).
 *
 *   1. `npm run build` termina, con su prebuild (el standalone del motor y la
 *      copia de los paquetes a public/), y deja dist/index.html.
 *   5. `astro preview` sirve dist/: 200 en / y 404 en /no-existe. Se arranca
 *      en un puerto libre, se le pide y se cierra.
 *   (El 2, el 3 y el 4 llegan con la pantalla, en c y d.)
 *
 * ⚠️ El build se hace DENTRO del primer juez que lo necesita (memorizado), no
 *    en el cuerpo del describe: si revienta ahí, node --test dice «fail 0»
 *    (docs/BITACORA.md, 2026-09-29).
 *
 * [PROPIO, firmado en la parada 1 del 6.2] Astro se arranca siempre con
 *    ASTRO_TELEMETRY_DISABLED=1: el CLI manda telemetría por defecto en dev,
 *    build y preview, y una variable de entorno en un script de npm no es
 *    portable a Windows (cmd.exe).
 * [DOC] https://astro.build/telemetry/ — «You can also opt-out by setting the
 *    environment variable: ASTRO_TELEMETRY_DISABLED=1».
 * [DOC] https://docs.astro.build/en/reference/cli-reference/ — `astro
 *    preview`: «Starts a local server to serve the contents of your static
 *    directory (dist/ by default) created by running astro build»; acepta
 *    `--port` y `--host`.
 * [DOC] https://nodejs.org/api/child_process.html — npm es un .cmd en Windows
 *    y se lanza con `exec` (pasa por cmd.exe; comando fijo); astro se lanza
 *    con `spawn` de node sobre su `bin`, para poder cerrarlo con kill().
 * [DOC] https://nodejs.org/api/net.html#serverlistenport-host-backlog-callback
 *    — con el puerto 0, el sistema elige uno libre.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer, type AddressInfo } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = fileURLToPath(new URL('..', import.meta.url));
const DIST = new URL('../dist/', import.meta.url);
const ENTORNO = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };

let salidaDelBuild: string | undefined;
/** `npm run build` en web/, una vez, desde un dist/ vacío; devuelve lo que imprime. */
function construir(): string {
  if (salidaDelBuild === undefined) {
    rmSync(DIST, { recursive: true, force: true });
    salidaDelBuild = execSync('npm run build', { cwd: WEB, env: ENTORNO, encoding: 'utf8', stdio: 'pipe' });
  }
  return salidaDelBuild;
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

  test('5 · astro preview responde 200 en / y 404 en /no-existe', async () => {
    construir();
    await conPreview(async (url) => {
      assert.equal((await fetch(url)).status, 200, `GET ${url}`);
      assert.equal((await fetch(`${url}no-existe`)).status, 404, `GET ${url}no-existe`);
    });
  });
});
