/**
 * El juez del servidor de desarrollo (encargo 7.1, parada 2): `astro dev`
 * sirve el analizador, el índice del catálogo y una ficha, con 200 y sin
 * ningún error en su salida.
 *
 * Hasta el 7.1 solo se juzgaban build y preview, y el catálogo rompió dev sin
 * que nada se pusiera rojo: su frontmatter importaba el motor del navegador,
 * que arrastra motor/src/terceros/silabea.cjs (CommonJS), y Vite lo evaluaba
 * como ESM en el SSR de desarrollo («module is not defined», visto por Antonio
 * en Chrome el 02/10). En build no pasa. Este juez cierra esa zona sin vigilar.
 *
 *   · Antes, `npm run predev` (el standalone del motor y la copia de los
 *     paquetes a public/), lo mismo que corre `npm run dev`.
 *   · `astro dev` en un puerto libre, con la telemetría apagada y
 *     `--ignore-lock`, para no chocar con el `npm run dev` de quien esté
 *     trabajando: sin él, Astro se niega a arrancar un segundo servidor del
 *     mismo proyecto.
 *     [DOC] https://docs.astro.build/en/reference/cli-reference/ —
 *     `--ignore-lock`: «Prevents checking for the existence of a lock file and
 *     the need to write one. This allows a new dev server […] to start
 *     alongside an already running server, instead of erroring».
 *   · Pide /, /reglas/ y la ficha de la primera regla, exige 200 en las tres
 *     y que la salida del proceso no lleve ningún error, y lo cierra.
 * [PROPIO] Un error en la salida es una línea con «[ERROR]» (la terminal de
 *    una persona) o con "level":"error" (JSON: Astro escribe así su registro
 *    cuando detecta que lo lanza un agente; node_modules/astro/dist/cli/dev/
 *    index.js, Astro 7.3.5, `flags.json = true`). Se miran las dos.
 *
 * [DOC] https://docs.astro.build/en/reference/cli-reference/ — `astro dev`
 *    acepta `--port` y `--host`.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import { binDeAstro, ENTORNO, paquetesIncluidos, puertoLibre, WEB } from './apoyo.ts';

const ERROR = /\[ERROR\]|"level":"error"/;

describe('el servidor de desarrollo', () => {
  test('astro dev sirve /, /reglas/ y una ficha con 200, sin ningún error en su salida', async () => {
    execSync('npm run predev', { cwd: WEB, env: ENTORNO, encoding: 'utf8', stdio: 'pipe' });
    const [primera] = paquetesIncluidos().flatMap((p) => p.reglas);
    assert.ok(primera, 'los paquetes no traen reglas');
    const puerto = await puertoLibre();
    const hijo = spawn(process.execPath, [binDeAstro(), 'dev', '--port', String(puerto), '--host', '127.0.0.1', '--ignore-lock'], {
      cwd: WEB,
      env: ENTORNO,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let salida = '';
    hijo.stdout.on('data', (d) => (salida += d));
    hijo.stderr.on('data', (d) => (salida += d));
    const base = `http://127.0.0.1:${puerto}/`;
    const estados: Record<string, number> = {};
    try {
      const limite = Date.now() + 60_000;
      for (;;) {
        try {
          await fetch(base);
          break;
        } catch {
          if (Date.now() > limite || hijo.exitCode !== null) throw new Error(`astro dev no responde en ${base}:\n${salida}`);
          await new Promise((r) => setTimeout(r, 250));
        }
      }
      for (const ruta of ['', 'reglas/', `reglas/${primera.id}/`]) estados[`/${ruta}`] = (await fetch(`${base}${ruta}`)).status;
      // Que el registro de la última petición llegue a la salida antes de cerrar.
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      hijo.kill();
    }
    assert.deepEqual(estados, { '/': 200, '/reglas/': 200, [`/reglas/${primera.id}/`]: 200 }, salida);
    const errores = salida.split('\n').filter((l) => ERROR.test(l));
    assert.deepEqual(errores, [], 'errores en la salida de astro dev');
  });
});
