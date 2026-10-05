/**
 * Un juez de mentira para chrome.spec.ts (encargo 10.4, Tanda 3): no lo corre
 * `npm test` (no acaba en .spec.ts); chrome.spec.ts lo lanza con node --test
 * en un proceso aparte. Abre Chrome, deja una orden en vuelo (una promesa que
 * no se resuelve nunca) y tumba el proceso del navegador con Browser.crash,
 * como cuando Chrome cae a media prueba. Lo que tiene que pasar: la orden
 * falla con el motivo, el test falla, el after cierra lo que quede y el
 * proceso termina.
 *
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Browser/#method-crash
 *    — «Crashes browser on the main thread» (experimental). Mandado por la
 *    conexión de la pestaña, tumba el proceso del navegador entero (visto el
 *    05/10: los procesos de Chrome del arnés, de 26 a 15 tras la orden).
 */
import { after, test } from 'node:test';
import { abrirChrome, type Pestana } from './chrome.ts';

let pestana: Pestana | undefined;
after(async () => {
  await pestana?.cerrar();
});

test('Chrome cae con una orden en vuelo', async () => {
  pestana = await abrirChrome();
  const enVuelo = pestana.evaluar('new Promise(() => {})');
  await new Promise((r) => setTimeout(r, 300));
  pestana.cdp('Browser.crash').catch(() => {});
  await enVuelo;
});
