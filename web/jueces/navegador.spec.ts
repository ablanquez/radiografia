/**
 * Los jueces del cargador de paquetes en Chrome (encargo 8.1, b; firmados en
 * la parada 1), sobre astro preview de dist/ y una sola pestaña de Chrome
 * headless (chrome.ts). Los tests van en orden y comparten la pestaña: cada
 * uno sigue donde lo dejó el anterior, y el último cuenta la red de todos.
 *
 *   5. El paquete inválido no entra y dice por qué (la frase y el mensaje del
 *      validador); paquete-prueba.json entra en la lista, y el selector de
 *      género no cambia: no trae calibración (firmado).
 *   4. Con los tres paquetes y un texto con señales de los tres: el panel de
 *      una regla del paquete de prueba lleva su ficha completa y ningún enlace
 *      a /reglas/ (solo sus fuentes); el de una de RadiografIA, el enlace a su
 *      ficha; en el desglose, cada regla del paquete de prueba es un <details>
 *      con su ficha; la leyenda dice el paquete y lleva la marca de propio.
 *   2. Tres bloques de desglose; con Español correcto desmarcado, el aviso de
 *      volver a analizar y, al analizar, dos bloques y ningún subrayado suyo;
 *      con RadiografIA desmarcado, el aviso de que nada trae escala.
 *   6. Sin ningún paquete activo, el botón se desactiva y lo dice.
 *   3. CERO peticiones de red después de la carga inicial (firmado en la
 *      parada 1). Tres testigos, todos desde antes de navegar: cada
 *      Network.requestWillBeSent («Fired when page is about to send HTTP
 *      request»), cada Network.webSocketCreated y cada securitypolicyviolation
 *      de la página (un intento que bloquea la CSP). La marca, cuando la
 *      página dice que cargó los paquetes y la red lleva 500 ms quieta. Lo de
 *      antes de la marca (la carga inicial) tiene que ser todo del mismo
 *      origen; lo de después, nada, y si hay algo, el juez lo lista. Entre
 *      medias: cargar dos ficheros, analizar tres veces, abrir paneles, marcar,
 *      desmarcar y quitar. No se pulsa «Cargar ejemplo»: pide el .txt al
 *      servidor, por diseño (encargo 6.3). Desde el 10.4 (Tanda 1), con las
 *      fuentes autoalojadas: ni una petición a fonts.googleapis.com ni a
 *      fonts.gstatic.com, antes o después de la marca; las dos caras
 *      precargadas, en la carga inicial; y ninguna cara pedida dos veces. Y
 *      la carga inicial, solo lo esperado: la página, su JS y su CSS, las
 *      fuentes, los paquetes, y el icono y el manifiesto (Chrome pide el
 *      manifiesto y sus iconos por su cuenta al cargar).
 *
 * ⚠️ El arranque (build, preview, Chrome, la carga y la marca) no va en un
 *    before(): si revienta ahí (sin Chrome, por ejemplo), node --test cuenta
 *    los tests como «cancelled» y dice «fail 0» (visto el 02/10; el mismo
 *    agujero que construir() en docs/BITACORA.md, 2026-09-29). Va en una
 *    promesa memorizada que cada test espera: sin Chrome, fallan los cinco.
 *    Desde el 9.1 el arranque y los testigos están en chrome.ts
 *    (abrirAnalizadorConTestigos), que comparte con impresion.spec.ts.
 *
 * El fichero se elige con DOM.setFileInputFiles, como si lo eligiera quien usa
 * la página: el input dispara «input» y «change» (visto en la parada 1).
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-setFileInputFiles
 *    — «Sets files for the given file input element».
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Network/ —
 *    requestWillBeSent, webSocketCreated, loadingFinished y loadingFailed.
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Element/securitypolicyviolation_event
 *    — «fired when a Content Security Policy is violated»; un recurso bloqueado
 *    lo dispara «on document as the target». Se escucha en document desde que
 *    nace (Page.addScriptToEvaluateOnNewDocument).
 * [DOC] https://nodejs.org/api/test.html — node:test; before y after.
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import * as textos from '../src/textos.ts';
import { urlDeRegla } from '../src/catalogo/catalogo.ts';
import { generosDe } from '../src/pantalla/generos.ts';
import { FUENTES_PRECARGADAS } from '../src/estilos/recursos.ts';
import { EJEMPLOS_PUBLICOS, PAQUETES_DE_PRUEBA, paqueteDePrueba, paquetesIncluidos, TEXTO_DE_TRES_PAQUETES } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos, type Pestana } from './chrome.ts';

const PRUEBA = 'Paquete de prueba';
const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

describe('el cargador en Chrome, sobre astro preview', () => {
  /** El arranque, una vez (chrome.ts, abrirAnalizadorConTestigos). Lo espera cada test. */
  let sesion: AnalizadorConTestigos | undefined;
  let arranque: Promise<AnalizadorConTestigos> | undefined;
  const arrancar = async (): Promise<void> => {
    sesion = await (arranque ??= abrirAnalizadorConTestigos());
  };

  /** La pestaña, que abre el arranque. */
  const p = (): Pestana => {
    assert.ok(sesion, 'Chrome no llegó a abrirse');
    return sesion.pestana;
  };

  /** Elige un fichero de web/public/ejemplos/ en el input del paquete propio. */
  async function subir(fichero: string): Promise<void> {
    const { root } = (await p().cdp('DOM.getDocument')) as { root: { nodeId: number } };
    const { nodeId } = (await p().cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '#paquete-propio' })) as { nodeId: number };
    await p().cdp('DOM.setFileInputFiles', { nodeId, files: [fileURLToPath(new URL(fichero, EJEMPLOS_PUBLICOS))] });
  }

  /** Pulsa «Pon tu texto a contraluz» y espera a que la vista tenga subrayados. */
  async function analizar(): Promise<void> {
    await p().evaluar(`(() => { document.getElementById('vista').replaceChildren(); document.getElementById('analizar').click(); })()`);
    await p().hasta(`document.querySelectorAll('#vista .tramo').length > 0`, 'los subrayados');
  }

  // Desde el 10.4 (Tanda 2), cada desglose va en «Ver el detalle»: el del paquete de la pastilla y el de cada tarjeta de paquete.
  const bloques = (): Promise<string[]> => p().evaluar(`[...document.querySelectorAll('#desglose .desglose-paquete > h3')].map((h) => h.textContent)`);
  const aviso = (): Promise<string> => p().evaluar(`document.getElementById('aviso-paquetes').textContent`);
  const casilla = (nombre: string): Promise<void> => p().evaluar(`document.querySelector('#incluidos input[value="${nombre}"]').click()`);

  after(async () => {
    await sesion?.cerrar();
  });

  test('5 · el paquete inválido no entra y dice por qué; el de prueba entra y el selector no cambia', async () => {
    await arrancar();
    const opciones = (): Promise<string[]> => p().evaluar(`[...document.getElementById('genero').options].map((o) => o.value)`);
    const antes = await opciones();
    assert.deepEqual(antes, generosDe(paquetesIncluidos()), 'el selector al arrancar');

    await subir(PAQUETES_DE_PRUEBA.invalido);
    await p().hasta(`!document.getElementById('errores-propio').hidden`, 'los errores del paquete inválido');
    assert.deepEqual(await p().evaluar(`[...document.querySelectorAll('#errores-propio p, #errores-propio li')].map((e) => e.textContent)`), [
      textos.noSeCargaPorEsquema(PAQUETES_DE_PRUEBA.invalido),
      'regla "prueba-a-nivel-de" (reglas[0]) · campo "peso": tiene que ser número',
    ]);
    assert.equal(await p().evaluar(`document.querySelectorAll('#propios li').length`), 0, 'el inválido no entra en la lista');

    await subir(PAQUETES_DE_PRUEBA.valido);
    await p().hasta(`document.querySelectorAll('#propios li').length === 1`, 'el paquete de prueba en la lista');
    const prueba = paqueteDePrueba();
    const { version } = prueba.cabecera;
    assert.deepEqual(
      await p().evaluar(`(() => { const li = document.querySelector('#propios li'); const b = li.querySelector('button'); return [li.firstChild.textContent, b.textContent, b.getAttribute('aria-label'), document.getElementById('estado-propio').textContent, document.getElementById('errores-propio').hidden]; })()`),
      [`${textos.paquetePropio(PRUEBA, version, prueba.reglas.length)} `, textos.QUITAR, textos.quitarPaquete(PRUEBA), textos.paquetePropioCargado(PRUEBA, version, prueba.reglas.length), true],
    );
    assert.deepEqual(await opciones(), antes, 'el selector, sin cambio: el paquete de prueba no trae calibración');
  });

  test('4 · el panel de una regla del paquete de prueba: ficha completa y sin enlace; el de una incluida, con enlace; y el desglose, con su <details>', async () => {
    await arrancar();
    await p().evaluar(`document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_TRES_PAQUETES)}`);
    await analizar();

    // Desde el 10.4 (Tanda 2), las tarjetas de familia, agrupadas bajo el nombre de su paquete.
    const leyenda = await p().evaluar<string[]>(`[...document.querySelectorAll('#leyenda .grupo-familias')].flatMap((g) => [...g.querySelectorAll('li')].map((li) => g.querySelector('h3').textContent + ' | ' + li.querySelector('.etiqueta-familia').textContent + ' | ' + li.querySelector('.muestra').className))`);
    assert.ok(leyenda.some((x) => new RegExp(`^${PRUEBA} \\| Pruebas \\(\\d+\\) \\| muestra capa fam-propia$`).test(x)), leyenda.join('\n'));

    const propia = await p().evaluar<{ titulo: string; enlacesEnTitulo: number; texto: string; hrefs: string[]; ejemplos: string[] }>(`(() => {
      const tramo = [...document.querySelectorAll('#vista .tramo')].find((t) => t.dataset.familias.split('|').includes('${PRUEBA}::pruebas'));
      tramo.click();
      const a = [...document.querySelectorAll('#panel article')].find((x) => x.querySelector('.id-regla')?.textContent.endsWith(' · ${PRUEBA}'));
      return { titulo: a.querySelector('h4').textContent, enlacesEnTitulo: a.querySelectorAll('h4 a').length, texto: a.textContent, hrefs: [...a.querySelectorAll('a')].map((x) => x.getAttribute('href')), ejemplos: [...a.querySelectorAll('pre.ejemplo')].map((x) => x.textContent) };
    })()`);
    const prueba = paqueteDePrueba();
    const regla = prueba.reglas.find((r) => r.nombre === propia.titulo);
    assert.ok(regla, `el panel no lleva el nombre de una regla del paquete de prueba: «${propia.titulo}»`);
    assert.equal(propia.enlacesEnTitulo, 0, 'el nombre de una regla propia no enlaza');
    assert.deepEqual(propia.hrefs, regla.fuente.map((f) => f.url), 'los únicos enlaces de la ficha propia son sus fuentes');
    const { nombre, version, descripcion } = prueba.cabecera;
    const partes = [
      `${regla.id} · ${nombre}`,
      textos.paqueteConVersion(nombre, version, descripcion),
      'Pruebas',
      regla.detector,
      regla.nivelEvidencia,
      textos.COMO_BUSCA,
      regla.explicacion,
      regla.sugerencia,
      ...(regla.excepciones.length === 0 ? [textos.NINGUNA] : regla.excepciones),
      regla.origenLista ?? textos.SIN_DATO,
      ...regla.fuente.map((f) => f.titulo),
      textos.DONDE_DISPARA,
      textos.DONDE_NO_DISPARA,
    ];
    for (const parte of partes) assert.ok(propia.texto.includes(parte), `la ficha propia no lleva «${parte}»`);
    assert.deepEqual(propia.ejemplos, [...regla.ejemplos.positivos, ...regla.ejemplos.negativos], 'los ejemplos de la ficha propia');

    const incluida = await p().evaluar<{ id: string; href: string | null }>(`(() => {
      const tramo = [...document.querySelectorAll('#vista .tramo')].find((t) => t.dataset.familias.split('|').some((f) => f.startsWith('RadiografIA::')));
      tramo.click();
      const a = [...document.querySelectorAll('#panel article')].find((x) => x.querySelector('.id-regla')?.textContent.endsWith(' · RadiografIA'));
      // Desde el 9.2 el enlace a la ficha va dentro de «¿Por qué lo miramos?», no en el título.
      return { id: a.querySelector('.id-regla').textContent.split(' · ')[0], href: a.querySelector('details a')?.getAttribute('href') ?? null };
    })()`);
    assert.equal(incluida.href, urlDeRegla('/', incluida.id), 'una regla de RadiografIA enlaza a su ficha');

    const desglose = await p().evaluar<{ resumenes: string[]; todosConFicha: boolean; aReglas: number }>(`(() => {
      const s = [...document.querySelectorAll('#desglose .desglose-paquete')].find((x) => x.querySelector('h3').textContent.startsWith('${PRUEBA} '));
      const detalles = [...s.querySelectorAll('details')];
      return { resumenes: detalles.map((d) => d.querySelector('summary').textContent), todosConFicha: detalles.every((d) => d.querySelectorAll('pre.ejemplo').length > 0), aReglas: [...s.querySelectorAll('a')].filter((x) => x.getAttribute('href').includes('/reglas/')).length };
    })()`);
    assert.deepEqual(
      // Desde el 9.2 la línea es «Nombre: …», sin el id (los ids, solo en «¿Por qué lo miramos?» y en el catálogo).
      prueba.reglas.map((r) => r.nombre).filter((n) => !desglose.resumenes.some((x) => x.startsWith(`${n}: `))),
      [],
      `cada regla del paquete de prueba, en un <details> del desglose: ${desglose.resumenes.join(' | ')}`,
    );
    assert.ok(desglose.todosConFicha, 'cada <details> lleva la ficha, con sus ejemplos');
    assert.equal(desglose.aReglas, 0, 'el desglose del paquete de prueba no enlaza a /reglas/');
  });

  test('2 · tres bloques de desglose; con Español correcto desmarcado, dos; sin RadiografIA, sin escala', async () => {
    await arrancar();
    const [radiografia, espanol] = paquetesIncluidos();
    const versionDePrueba = paqueteDePrueba().cabecera.version;
    const r = `RadiografIA ${radiografia!.cabecera.version}`;
    const e = `Español correcto ${espanol!.cabecera.version}`;
    const d = `${PRUEBA} ${versionDePrueba}`;
    assert.deepEqual(await bloques(), [r, e, d]);

    await casilla('Español correcto');
    assert.equal(await aviso(), textos.PAQUETES_CAMBIADOS, 'el aviso de volver a analizar');
    await analizar();
    assert.deepEqual(await bloques(), [r, d]);
    assert.equal(await aviso(), '', 'el aviso se va al analizar');
    assert.equal(await p().evaluar(`[...document.querySelectorAll('#vista .tramo')].filter((t) => t.dataset.familias.includes('Español correcto::')).length`), 0, 'ningún subrayado de Español correcto');

    await casilla('RadiografIA');
    await casilla('Español correcto');
    await analizar();
    assert.deepEqual(await bloques(), [e, d]);
    assert.ok((await p().evaluar<string>(`document.getElementById('medidor').textContent`)).includes(textos.SIN_ESCALA), 'el aviso de sin escala');
  });

  test('6 · sin ningún paquete activo, el botón se desactiva y lo dice', async () => {
    await arrancar();
    await casilla('Español correcto');
    await p().evaluar(`document.querySelector('#propios button').click()`);
    assert.deepEqual(await p().evaluar(`[document.getElementById('analizar').disabled, document.getElementById('propios').hidden, [...document.getElementById('genero').options].map((o) => o.value)]`), [
      true,
      true,
      ['general'],
    ]);
    assert.equal(await aviso(), textos.SIN_PAQUETES_ACTIVOS);
  });

  test('3 · cero peticiones de red después de la carga inicial, y la carga inicial, toda del mismo origen', async (t) => {
    await arrancar();
    await esperar(1000);
    assert.ok(sesion, 'astro preview no llegó a abrirse');
    const { carga, despues } = sesion;
    const origen = new URL(sesion.url).origin;
    const violaciones = await sesion.violaciones();
    const enLinea = (lista: readonly string[]): string => (lista.length === 0 ? 'ninguna' : lista.join(' · '));
    t.diagnostic(`carga inicial (${carga.length}): ${enLinea(carga.map((x) => `${x.tipo} ${x.url}`))}`);
    t.diagnostic(`después de la marca (${despues.length}): ${enLinea(despues.map((x) => `${x.tipo} ${x.url}`))}`);
    t.diagnostic(`intentos bloqueados por la CSP (${violaciones.length}): ${enLinea(violaciones)}`);
    assert.ok(carga.length > 0, 'el juez no vio ni la carga inicial');
    assert.deepEqual(carga.filter((x) => new URL(x.url).origin !== origen), [], 'peticiones de la carga inicial a otro origen');
    // Las fuentes, autoalojadas (10.4, Tanda 1): nada de Google Fonts, las dos precargadas sí, y ninguna cara dos veces.
    assert.deepEqual([...carga, ...despues].filter((x) => /^fonts\.(googleapis|gstatic)\.com$/.test(new URL(x.url).hostname)), [], 'peticiones a Google Fonts');
    const fuentes = carga.filter((x) => x.tipo === 'Font').map((x) => new URL(x.url).pathname);
    for (const ruta of FUENTES_PRECARGADAS) assert.ok(fuentes.includes(`/${ruta}`), `la precarga de ${ruta}: ${fuentes.join(' · ')}`);
    assert.deepEqual(fuentes.filter((x, i) => fuentes.indexOf(x) !== i), [], 'caras pedidas dos veces (una precarga sin crossorigin no se reutiliza)');
    // Y nada en la carga inicial fuera de lo esperado: la página, su JS y su CSS, las fuentes, los paquetes, y el icono y el manifiesto (10.4).
    const ESPERADAS = [
      /^\/$/,
      /^\/_astro\/[\w.-]+\.(js|css)$/,
      /^\/fuentes\/[\w-]+\/[\w-]+\.woff2$/,
      /^\/paquetes\/[\w-]+\.json$/,
      /^\/(icono-c\.svg|icon\.svg|favicon\.ico|apple-touch-icon\.png|icon-192\.png|icon-512\.png|icon-512-maskable\.png|site\.webmanifest)$/,
    ];
    assert.deepEqual(carga.filter((x) => !ESPERADAS.some((e) => e.test(new URL(x.url).pathname))), [], 'peticiones de la carga inicial que no se esperan');
    assert.deepEqual(despues, [], 'peticiones después de la carga inicial');
    assert.deepEqual(violaciones, [], 'intentos bloqueados por la CSP');
  });
});
