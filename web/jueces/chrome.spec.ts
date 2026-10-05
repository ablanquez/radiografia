/**
 * Los jueces del arnés de Chrome (encargo 10.4, Tanda 3): que una caída de
 * Chrome a media prueba haga fallar la prueba con su motivo en vez de dejar
 * node --test colgado para siempre (visto dos veces el 04/10: un clon con los
 * jueces parados diez minutos, sin Chrome vivo; docs/BITACORA.md, 2026-10-05).
 * Chrome se tumba con Browser.crash, que mandado por la conexión de la
 * pestaña tumba el proceso del navegador entero.
 *
 *   1. Un juez de mentira (chrome-cae.prueba.ts) que tumba Chrome con una
 *      orden en vuelo, lanzado con node --test sin --test-timeout (lo tiene
 *      que resolver el arnés, no el límite): falla con el motivo y el proceso
 *      termina, en menos de 30 s.
 *   2. Tras la caída, en el mismo proceso: la orden en vuelo falla enseguida
 *      con el motivo, una orden nueva falla en el acto, hasta() falla con el
 *      motivo (no a los 30 s con «no llegó») y cerrar() termina.
 *   3. El script de test de web lleva --test-timeout, de 60 s: el respaldo si
 *      algo se queda esperando por otra causa.
 *
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Browser/#method-crash
 *    — «Crashes browser on the main thread» (experimental).
 * [DOC] https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
 *    — spawn, con sus tuberías y el evento «exit» con el código de salida.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { abrirChrome } from './chrome.ts';
import { ENTORNO, WEB } from './apoyo.ts';

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
/** Lo que haga la promesa antes de `ms`: «resuelta», el Error con que falle, o «colgada». */
const antesDe = async (promesa: Promise<unknown>, ms: number): Promise<'resuelta' | 'colgada' | Error> =>
  Promise.race([promesa.then(() => 'resuelta' as const, (e: unknown) => (e instanceof Error ? e : new Error(String(e)))), esperar(ms).then(() => 'colgada' as const)]);
const MOTIVO = /Chrome se cerró|conexión con Chrome/;

test('1 · Chrome cae a media prueba: la prueba falla con el motivo y node --test termina, sin --test-timeout', async () => {
  // Sin NODE_TEST_CONTEXT, que hereda de este proceso: con ella, node --test no corre ficheros («run() is being called recursively within a test file»).
  const entorno: NodeJS.ProcessEnv = { ...ENTORNO };
  delete entorno['NODE_TEST_CONTEXT'];
  const hijo = spawn(process.execPath, ['--test', '--test-concurrency=1', 'jueces/chrome-cae.prueba.ts'], { cwd: WEB, env: entorno, stdio: ['ignore', 'pipe', 'pipe'] });
  let salida = '';
  hijo.stdout.on('data', (d) => (salida += d));
  hijo.stderr.on('data', (d) => (salida += d));
  const desde = Date.now();
  const codigo = await Promise.race([new Promise<number | null>((r) => hijo.on('exit', (c) => r(c))), esperar(30_000).then(() => 'colgado' as const)]);
  if (codigo === 'colgado') {
    // El árbol entero (node --test, su proceso del fichero y Chrome), para no dejar nada vivo.
    if (process.platform === 'win32') execSync(`taskkill /PID ${hijo.pid} /T /F`, { stdio: 'ignore' });
    else hijo.kill('SIGKILL');
  }
  assert.notEqual(codigo, 'colgado', `node --test sigue colgado a los 30 s de que Chrome cayera; lo que imprimió:\n${salida}`);
  assert.equal(codigo, 1, `node --test termina con fallo; lo que imprimió:\n${salida}`);
  assert.match(salida, /✖ Chrome cae con una orden en vuelo/, 'el test de la caída, en rojo');
  assert.match(salida, MOTIVO, 'con el motivo');
  assert.ok(Date.now() - desde < 30_000);
});

test('2 · tras la caída: la orden en vuelo, una nueva y hasta() fallan con el motivo, enseguida; cerrar() termina', async () => {
  const pestana = await abrirChrome();
  try {
    const enVuelo = pestana.evaluar('new Promise(() => {})');
    await esperar(300);
    pestana.cdp('Browser.crash').catch(() => {});
    const primera = await antesDe(enVuelo, 10_000);
    assert.ok(primera instanceof Error && MOTIVO.test(primera.message) && primera.message.includes('Runtime.evaluate'), `la orden en vuelo: ${String(primera)}`);
    const nueva = await antesDe(pestana.evaluar('1'), 1_000);
    assert.ok(nueva instanceof Error && MOTIVO.test(nueva.message), `una orden nueva: ${String(nueva)}`);
    const espera = await antesDe(pestana.hasta('false', 'algo que no llega'), 2_000);
    assert.ok(espera instanceof Error && MOTIVO.test(espera.message), `hasta(): ${String(espera)}`);
  } finally {
    assert.equal(await antesDe(pestana.cerrar(), 10_000), 'resuelta', 'cerrar() termina tras la caída');
  }
});

test('3 · el script de test de web lleva --test-timeout, de 60 s', () => {
  const paquete = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> };
  assert.match(paquete.scripts['test'] ?? '', /\s--test-timeout=60000\s/);
});
