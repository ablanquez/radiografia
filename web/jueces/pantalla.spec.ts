/**
 * Los jueces del lenguaje de calle en Chrome (encargo 9.2, b; firmado por
 * Antonio en la parada 1), sobre astro preview y una sola pestaña de Chrome
 * headless con el arranque y los testigos de red de chrome.ts. Los tests van
 * en orden y comparten la pestaña.
 *
 *   1. Con el texto de combinacion-real y «General»: la etiqueta es lo
 *      primero del bloque de resultado, como su título, y la frase va
 *      debajo, las dos las que da lectura.ts (retoque del 9.2, firmado el
 *      03/10); el resumen se ve y es el suyo (el de RadiografIA y la línea de
 *      Español correcto); «Ver el detalle» está plegado por defecto, sus
 *      cifras no se ven, y al abrirlo sí.
 *   2. El panel de un subrayado, en el orden firmado: el nombre, la frase en
 *      claro de la regla, «Qué hacer» y «¿Por qué lo miramos?», plegado.
 *   3. Ninguna palabra del motor en el texto visible del analizador: ni
 *      informativa, ni atenuante, ni no aplicadas, ni tramo, ni p95, p99 o
 *      percentil, que solo quedan dentro de «Ver el detalle», plegado.
 *   4. Con 150 palabras (las primeras del ejemplo humano, cortado por
 *      palabras), el aviso de texto corto debajo de la etiqueta y la frase.
 *   5. La red, en cero después de la carga inicial.
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText
 *    — «represents the rendered text content of a node and its descendants»;
 *    «ignores hidden elements»: lo de un <details> plegado no entra.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility
 *    — false si el elemento no tiene caja.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import { etiquetaDelPaquete, resumenDelPaquete } from '../src/pantalla/lectura.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { EJEMPLOS_PUBLICOS, motorDelNavegador, paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

/** Las palabras del motor que no pueden verse en el analizador (firmado en la parada 1 del 9.2). */
const DEL_MOTOR = /informativa|atenuante|no aplicadas|noAplicadas|tramo|(?<!\p{L})p9[59](?!\d)|percentil/giu;

describe('el lenguaje de calle en Chrome, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const arrancar = async (): Promise<void> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
  };
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };

  after(async () => {
    await sesion?.cerrar();
  });

  /** Las tres primeras piezas del primer bloque de resultado: etiqueta y clase, texto y si se ve. */
  const cabezaDelBloque = (): Promise<[string, string, boolean][]> =>
    p().evaluar(`[...document.querySelector('#medidor .lectura').children].slice(0, 3).map((x) => [x.tagName.toLowerCase() + (x.className ? '.' + x.className : ''), x.textContent, x.checkVisibility()])`);

  test('1 · la etiqueta, primero del bloque, la frase y el resumen se ven, y «Ver el detalle» está plegado hasta que se abre', async () => {
    await arrancar();
    await p().evaluar(`(() => {
      document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)};
      document.getElementById('genero').value = 'general';
      document.getElementById('analizar').click();
    })()`);
    await p().hasta(`document.querySelectorAll('#vista .tramo').length > 0`, 'los subrayados');

    const { analizar } = await motorDelNavegador();
    const paquetes = paquetesIncluidos();
    const r = analizar(TEXTO_DE_COMBINACION_REAL, paquetes, { genero: 'general' });
    const indice = indexar(paquetes);
    const lectura = etiquetaDelPaquete(r, r.paquetes[0]!, 'asistente');
    assert.ok(lectura && lectura.frase !== null, 'el motor da etiqueta y frase');
    const resumen = [...resumenDelPaquete(r, r.paquetes[0]!, 'asistente', indice), ...resumenDelPaquete(r, r.paquetes[1]!, 'norma', indice)];

    const [etiqueta, frase] = await cabezaDelBloque();
    assert.deepEqual(etiqueta, ['h3.etiqueta', lectura.etiqueta, true], 'la etiqueta, lo primero del bloque de resultado y su título');
    assert.deepEqual(frase, ['p.frase', lectura.frase, true], 'la frase, debajo');
    assert.deepEqual(await p().evaluar(`[...document.querySelectorAll('#medidor .resumen')].map((x) => x.textContent)`), resumen);
    assert.deepEqual(
      await p().evaluar(`(() => { const d = document.querySelector('#medidor details.detalle'); return [d.open, d.querySelector('summary').textContent, [...d.querySelectorAll('p')].some((x) => x.checkVisibility())]; })()`),
      [false, textos.VER_EL_DETALLE, false],
      '«Ver el detalle», plegado: sus cifras no se ven',
    );
    assert.equal(
      await p().evaluar(`(() => { const d = document.querySelector('#medidor details.detalle'); d.open = true; const visibles = [...d.querySelectorAll('p')].every((x) => x.checkVisibility()); d.open = false; return visibles; })()`),
      true,
      'abierto, sus cifras se ven',
    );
  });

  test('2 · el panel: el nombre, la frase en claro, «Qué hacer» y «¿Por qué lo miramos?» plegado', async () => {
    await arrancar();
    const panel = await p().evaluar<{ partes: string[]; nombre: string; enClaro: string; abierto: boolean; resumen: string }>(`(() => {
      document.querySelector('#vista .tramo').click();
      const a = document.querySelector('#panel article');
      const d = a.querySelector('details.por-que');
      return {
        partes: [...a.children].map((x) => x.tagName.toLowerCase() + (x.className ? '.' + x.className : '')),
        nombre: a.querySelector('h4').textContent,
        enClaro: a.querySelector('.en-claro')?.textContent ?? '',
        abierto: d.open,
        resumen: d.querySelector('summary').textContent,
      };
    })()`);
    assert.deepEqual(panel.partes, ['h4', 'p.en-claro', 'p', 'details.por-que'], 'el orden del panel');
    const regla = paquetesIncluidos().flatMap((x) => x.reglas).find((x) => x.nombre === panel.nombre);
    assert.ok(regla, `«${panel.nombre}» no es el nombre de una regla`);
    assert.equal(panel.enClaro, regla.enClaro);
    assert.deepEqual([panel.abierto, panel.resumen], [false, textos.POR_QUE_LO_MIRAMOS]);
    assert.ok((await p().evaluar<string>(`document.querySelector('#panel article p:not(.en-claro)').textContent`)).startsWith(`${textos.QUE_HACER}: ${regla.sugerencia}`));
  });

  test('3 · ninguna palabra del motor en el texto visible del analizador', async (t) => {
    await arrancar();
    const visible = await p().evaluar<string>('document.body.innerText');
    const halladas = [...visible.matchAll(DEL_MOTOR)].map((m) => `«${m[0]}» en «${visible.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ')}»`);
    t.diagnostic(`texto visible: ${visible.length} caracteres; palabras del motor: ${halladas.length}`);
    assert.deepEqual(halladas, []);
    const enElDetalle = await p().evaluar<string>(`document.querySelector('#medidor details.detalle').textContent`);
    assert.match(enElDetalle, /p95/, 'las cifras siguen dentro de «Ver el detalle»');
  });

  test('4 · con 150 palabras, el aviso de texto corto debajo de la etiqueta y la frase', async () => {
    await arrancar();
    const corto = /^\s*(?:\S+\s+){149}\S+/u.exec(readFileSync(new URL('antonio.txt', EJEMPLOS_PUBLICOS), 'utf8'))![0];
    const { analizar } = await motorDelNavegador();
    const r = analizar(corto, paquetesIncluidos(), { genero: 'opinion' });
    assert.deepEqual([r.palabrasProsa, r.tramo], [150, 'poco-fiable'], 'el motor cuenta 150 palabras de prosa: texto corto');
    const lectura = etiquetaDelPaquete(r, r.paquetes[0]!, 'asistente');
    assert.ok(lectura && lectura.frase !== null, 'el motor da etiqueta y frase');

    await p().evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(corto)};
      document.getElementById('genero').value = 'opinion';
      document.getElementById('analizar').click();
    })()`);
    await p().hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    assert.deepEqual(await cabezaDelBloque(), [
      ['h3.etiqueta', lectura.etiqueta, true],
      ['p.frase', lectura.frase, true],
      ['p.aviso-corto', textos.AVISO_TEXTO_CORTO, true],
    ]);
  });

  test('5 · cero peticiones de red después de la carga inicial', async (t) => {
    await arrancar();
    const { despues } = sesion!;
    t.diagnostic(`después de la marca (${despues.length}): ${despues.length === 0 ? 'ninguna' : despues.map((x) => `${x.tipo} ${x.url}`).join(' · ')}`);
    assert.deepEqual(despues, []);
    assert.deepEqual(await sesion!.violaciones(), []);
  });
});
