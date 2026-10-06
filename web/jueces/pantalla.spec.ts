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
 *      cifras no se ven, y al abrirlo sí. Desde el 10.4 (Tanda 2), el bloque
 *      es la pastilla, y lo que más pesa va en tarjetas: cada una, la regla y
 *      su cola, en el orden del resumen, y «Empieza por» debajo de la primera;
 *      la línea de Español correcto, en su tarjeta; y «Ver el detalle», en el
 *      desglose.
 *   2. El panel de un subrayado, en el orden firmado: el nombre, la frase en
 *      claro de la regla, «Qué hacer» y «¿Por qué lo miramos?», plegado.
 *      Desde el 10.4 (Tanda 2), la tarjeta del modelo: el nombre en su
 *      cabecera y, debajo, «Anterior» y «Siguiente».
 *   3. Ninguna palabra del motor en el texto visible del analizador: ni
 *      informativa, ni atenuante, ni no aplicadas, ni tramo, ni p95, p99 o
 *      percentil, que solo quedan dentro de «Ver el detalle», plegado.
 *   4. Con 150 palabras (las primeras del ejemplo humano, cortado por
 *      palabras), el aviso de texto corto debajo de la etiqueta y la frase.
 *   5. La red: después de la carga inicial, nada más que lo que se pide a
 *      propósito al pintar un resultado (desde el 9.3, punto 8: la negrita
 *      del papel, una vez; chrome.ts, AL_PINTAR_UN_RESULTADO).
 *   6. Desde el 11.1 (hallazgo 2 del censo pre-despliegue, firmado por
 *      Antonio): en «Ver el detalle», justo debajo de la comparación con los
 *      textos de personas, «Textos de personas: corpus en Créditos y
 *      licencias», con el enlace a /creditos/, una sola vez; sin comparación
 *      (narrativa clásica con 150 palabras: no hay textos de personas de esa
 *      longitud), sin la línea. Un paquete propio con escala no la lleva (sus
 *      textos de referencia son suyos: pintar.ts, indice.propios), pero no hay
 *      paquete de prueba con escala, y eso NO CONSTA en Chrome.
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
import { urlDeLosCreditos } from '../src/catalogo/catalogo.ts';
import { comparacionDelPaquete, etiquetaDelPaquete, loQueMasPesa, resumenDelPaquete } from '../src/pantalla/lectura.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { EJEMPLOS_PUBLICOS, motorDelNavegador, paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';
import { abrirAnalizadorConTestigos, sinLasDelResultado, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

/** Las palabras del motor que no pueden verse en el analizador (firmado en la parada 1 del 9.2). */
const DEL_MOTOR = /informativa|atenuante|no aplicadas|noAplicadas|tramo|(?<!\p{L})p9[59](?!\d)|percentil/giu;

describe('el lenguaje de calle en Chrome, sobre astro preview', () => {
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const arrancar = async (): Promise<void> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
    // A 1280 (desde el 10.4, Tanda 2): el Chrome de los jueces abre a 764 de ancho, que es el móvil, con el resultado
    // repartido en pestañas; este juez mira lo que dice la página, y la estructura del móvil la miran pestanas.spec.ts y hoja.spec.ts.
    await sesion.pestana.cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  };
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };

  after(async () => {
    await sesion?.cerrar();
  });

  /** Las tres primeras piezas del primer bloque de resultado (desde el 10.4, la pastilla): etiqueta y clase, texto y si se ve. */
  const cabezaDelBloque = (): Promise<[string, string, boolean][]> =>
    p().evaluar(`[...document.querySelector('#medidor .pastilla').children].slice(0, 3).map((x) => [x.tagName.toLowerCase() + (x.className ? '.' + x.className : ''), x.textContent, x.checkVisibility()])`);

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
    assert.ok(lectura, 'el motor da etiqueta y frase');
    const pesa = loQueMasPesa(r, r.paquetes[0]!, indice);

    const [etiqueta, frase] = await cabezaDelBloque();
    assert.deepEqual(etiqueta, ['h2.etiqueta', lectura.etiqueta, true], 'la etiqueta, lo primero del bloque de resultado y su título');
    assert.deepEqual(frase, ['p.frase', lectura.frase, true], 'la frase, debajo');
    // El resumen de RadiografIA, en tarjetas (10.4): las mismas reglas y colas que su línea de la 9.2, y «Empieza por».
    const tarjetas = await p().evaluar<[string, string, boolean][]>(`[...document.querySelectorAll('#medidor .tarjeta-motivo')].map((t) => [t.querySelector('.nombre-motivo').textContent, t.querySelector('.cola').textContent, t.checkVisibility()])`);
    assert.deepEqual(tarjetas, pesa.reglas.map((x) => [x.nombre, x.cola, true]), 'lo que más pesa, en tarjetas');
    assert.deepEqual(resumenDelPaquete(r, r.paquetes[0]!, 'asistente', indice), [textos.loQueMasPesa(tarjetas.map(([n, c]) => textos.parteDelResumen(n, c))), textos.empiezaPor(pesa.empiezaPor!)], 'las tarjetas dicen lo mismo que la línea de la 9.2');
    assert.deepEqual(
      await p().evaluar(`[...document.querySelectorAll('#medidor .motivo')].map((m) => m.querySelector('.empieza-por')?.textContent ?? null)`),
      [textos.empiezaPor(pesa.empiezaPor!), null, null],
      '«Empieza por», debajo de la primera',
    );
    assert.deepEqual(await p().evaluar(`[...document.querySelectorAll('.otro-paquete .resumen')].map((x) => [x.textContent, x.checkVisibility()])`), resumenDelPaquete(r, r.paquetes[1]!, 'norma', indice).map((x) => [x, true]), 'la línea de Español correcto, en su tarjeta');
    assert.deepEqual(
      await p().evaluar(`(() => { const d = document.querySelector('#desglose details.detalle'); return [d.open, d.querySelector('summary').textContent, [...d.querySelectorAll('.cifras p')].some((x) => x.checkVisibility())]; })()`),
      [false, textos.VER_EL_DETALLE, false],
      '«Ver el detalle», plegado: sus cifras no se ven',
    );
    assert.equal(
      await p().evaluar(`(() => { const d = document.querySelector('#desglose details.detalle'); d.open = true; const visibles = [...d.querySelectorAll('.cifras p')].every((x) => x.checkVisibility()); d.open = false; return visibles; })()`),
      true,
      'abierto, sus cifras se ven',
    );
  });

  test('2 · el panel: el nombre, la frase en claro, «Qué hacer» y «¿Por qué lo miramos?» plegado', async () => {
    await arrancar();
    const panel = await p().evaluar<{ partes: string[]; nombre: string; enClaro: string; abierto: boolean; resumen: string }>(`(() => {
      document.querySelector('#vista .tramo').click();
      const a = document.getElementById('tarjeta');
      const d = a.querySelector('details.por-que');
      return {
        partes: [...a.querySelector('.cuerpo-tarjeta').children].map((x) => x.tagName.toLowerCase() + (x.className ? '.' + x.className : '')),
        nombre: a.querySelector('.cabecera-tarjeta h2').textContent,
        enClaro: a.querySelector('.en-claro')?.textContent ?? '',
        abierto: d.open,
        resumen: d.querySelector('summary').textContent,
      };
    })()`);
    assert.deepEqual(panel.partes, ['div.cabecera-tarjeta', 'p.en-claro', 'p.que-hacer', 'details.por-que', 'div.navegacion-reglas'], 'el orden de la tarjeta');
    const regla = paquetesIncluidos().flatMap((x) => x.reglas).find((x) => x.nombre === panel.nombre);
    assert.ok(regla, `«${panel.nombre}» no es el nombre de una regla`);
    assert.equal(panel.enClaro, regla.enClaro);
    assert.deepEqual([panel.abierto, panel.resumen], [false, textos.POR_QUE_LO_MIRAMOS]);
    assert.ok((await p().evaluar<string>(`document.querySelector('#tarjeta p.que-hacer').textContent`)).startsWith(`${textos.QUE_HACER}: ${regla.sugerencia}`));
  });

  test('3 · ninguna palabra del motor en el texto visible del analizador', async (t) => {
    await arrancar();
    const visible = await p().evaluar<string>('document.body.innerText');
    const halladas = [...visible.matchAll(DEL_MOTOR)].map((m) => `«${m[0]}» en «${visible.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ')}»`);
    t.diagnostic(`texto visible: ${visible.length} caracteres; palabras del motor: ${halladas.length}`);
    assert.deepEqual(halladas, []);
    const enElDetalle = await p().evaluar<string>(`document.querySelector('#desglose details.detalle').textContent`);
    assert.match(enElDetalle, /p95/, 'las cifras siguen dentro de «Ver el detalle»');
  });

  test('4 · con 150 palabras, el aviso de texto corto debajo de la etiqueta y la frase', async () => {
    await arrancar();
    const corto = /^\s*(?:\S+\s+){149}\S+/u.exec(readFileSync(new URL('antonio.txt', EJEMPLOS_PUBLICOS), 'utf8'))![0];
    const { analizar } = await motorDelNavegador();
    const r = analizar(corto, paquetesIncluidos(), { genero: 'opinion' });
    assert.deepEqual([r.palabrasProsa, r.tramo], [150, 'poco-fiable'], 'el motor cuenta 150 palabras de prosa: texto corto');
    const lectura = etiquetaDelPaquete(r, r.paquetes[0]!, 'asistente');
    assert.ok(lectura, 'el motor da etiqueta y frase');

    await p().evaluar(`(() => {
      document.getElementById('resultado').hidden = true;
      document.getElementById('texto').value = ${JSON.stringify(corto)};
      document.getElementById('genero').value = 'opinion';
      document.getElementById('analizar').click();
    })()`);
    await p().hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
    assert.deepEqual(await cabezaDelBloque(), [
      ['h2.etiqueta', lectura.etiqueta, true],
      ['p.frase', lectura.frase, true],
      ['p.aviso-corto', textos.AVISO_TEXTO_CORTO, true],
    ]);
  });

  test('5 · después de la carga inicial, solo la negrita del papel al pintar un resultado', async (t) => {
    await arrancar();
    const { despues, url } = sesion!;
    t.diagnostic(`después de la marca (${despues.length}): ${despues.length === 0 ? 'ninguna' : despues.map((x) => `${x.tipo} ${x.url}`).join(' · ')}`);
    assert.deepEqual(sinLasDelResultado(despues, url), []);
    assert.deepEqual(await sesion!.violaciones(), []);
  });

  test('6 · en «Ver el detalle», debajo de la comparación con los textos de personas, de dónde salen, con el enlace a los créditos; sin comparación, no', async () => {
    await arrancar();
    const { analizar } = await motorDelNavegador();
    const analizarCon = async (texto: string, genero: string): Promise<string | null> => {
      await p().evaluar(`(() => {
        document.getElementById('resultado').hidden = true;
        document.getElementById('texto').value = ${JSON.stringify(texto)};
        document.getElementById('genero').value = ${JSON.stringify(genero)};
        document.getElementById('analizar').click();
      })()`);
      await p().hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
      const r = analizar(texto, paquetesIncluidos(), { genero });
      return comparacionDelPaquete(r, r.paquetes[0]!);
    };
    const lineas = (): Promise<{ texto: string; enlace: [string | null, string] | null }[]> =>
      p().evaluar(`[...document.querySelectorAll('#desglose .cifras > p')].map((x) => {
        const a = x.querySelector('a');
        return { texto: x.textContent, enlace: a === null ? null : [a.getAttribute('href'), a.textContent] };
      })`);
    const comparacion = await analizarCon(TEXTO_DE_COMBINACION_REAL, 'general');
    assert.ok(comparacion !== null, 'combinacion-real, en «General», se compara con textos de personas');
    const con = await lineas();
    const i = con.findIndex((x) => x.texto === comparacion);
    assert.ok(i >= 0, `la comparación, en «Ver el detalle»: ${con.map((x) => x.texto).join(' | ')}`);
    assert.deepEqual(
      con[i + 1],
      { texto: `${textos.CORPUS_EN} ${textos.CREDITOS_Y_LICENCIAS}`, enlace: [urlDeLosCreditos('/'), textos.CREDITOS_Y_LICENCIAS] },
      'debajo de la comparación, de dónde salen los textos de personas',
    );
    assert.equal(con.filter((x) => x.enlace !== null).length, 1, 'una sola vez');
    // Narrativa clásica no tiene textos de personas de 100 a 299 palabras: «No hay…», sin comparación y sin la línea.
    const corto = /^\s*(?:\S+\s+){149}\S+/u.exec(readFileSync(new URL('antonio.txt', EJEMPLOS_PUBLICOS), 'utf8'))![0];
    assert.equal(await analizarCon(corto, 'narrativa-clasica'), null, 'narrativa clásica, con 150 palabras, sin textos de personas con los que comparar');
    const sin = await lineas();
    assert.ok(sin.length > 0, 'las cifras de «Ver el detalle»');
    assert.deepEqual(sin.filter((x) => x.enlace !== null || x.texto.startsWith(textos.CORPUS_EN)), [], 'sin comparación, sin la línea de los créditos');
  });
});
