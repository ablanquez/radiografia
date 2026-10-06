/**
 * Los jueces de producción (encargo 11.2; decisiones de Antonio del 06/10): la web publicada, mirada desde fuera, en
 * URL_PRODUCCION (https://radiografia.antonioblanquez.es; apoyo.ts). Sin la variable se omiten, con el aviso de cómo
 * activarlos. Lo que se espera sale del dist/ que se construye aquí y del .htaccess que escribiría `npm run publicar` con
 * él (web/publicacion/): se corren con el mismo commit de main que se publicó.
 *
 *   1. Cada fichero de dist/ responde 200, sin redirección, con su contenido (el de dist/, byte a byte) y las cabeceras
 *      de su grupo: el Cache-Control del .htaccess; la CSP, igual a la del <meta>; nosniff; Referrer-Policy; HSTS de un
 *      año por https (por http, ninguno: env=HTTPS); y su Content-Type: los de woff2, woff, webmanifest, svg y json, y,
 *      porque nosniff no deja pasar otro, el del HTML, el JS y el CSS.
 *   2. Cada página, en su dirección (la carpeta, sin index.html), responde 200 con la CSP por cabecera igual a su <meta>.
 *   3. /no-existe/ y /reglas/no-existe/x/ responden 404 con la página que no existe y las cabeceras de todas.
 *   4. /.git/HEAD, /.git/config, /.git y /.htaccess no se sirven: 403 o 404.
 *   5. Por http, cada dirección redirige a la misma por https (lo hace el panel: «Forzar HTTPS»).
 *   6. En Chrome: el analizador carga, analiza y descarga el PDF; el catálogo, una ficha, los créditos y la que no existe
 *      se abren; y en todo el recorrido, ni una petición fuera del origen, ni una violación de la CSP (el evento ni el
 *      mensaje de la consola), ni una excepción, ni otro error en la consola que el 404 de la que no existe.
 *
 * Con URL_PRODUCCION, los demás jueces de Chrome también van contra el sitio publicado (chrome.ts, abrirConTestigos): la
 * red (navegador.spec.ts), la CSP, los 320 px (pulsacion.spec.ts y los de cada página), la página que no existe y la
 * fidelidad al modelo con el mismo medidas-modelo.json (fidelidad.spec.ts). La orden, en el README («Despliegue»).
 *
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options — nosniff: «Blocks a
 *    request if the request destination is of type style and the MIME type is not text/css, or of type script and the
 *    MIME type is not a JavaScript MIME type».
 * [DOC] https://fetch.spec.whatwg.org/#concept-request-redirect-mode — redirect «manual»: la respuesta de una
 *    redirección llega tal cual, sin seguirla.
 * [DOC] https://chromedevtools.github.io/devtools-protocol/tot/Log/ — Log.enable y Log.entryAdded (source, level, text);
 *    https://chromedevtools.github.io/devtools-protocol/tot/Runtime/ — consoleAPICalled y exceptionThrown.
 * [DOC] https://nodejs.org/api/test.html — skip: «If truthy, the test is skipped. If a string is provided, that string is
 *    displayed in the test results as the reason for skipping the test».
 */
import { after, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import * as textos from '../src/textos.ts';
import { cspDeLaWeb, cspDelMeta, ficherosDe, gruposDeCache, htaccessDesde, repartir } from '../publicacion/publicacion.ts';
import { construir, decodificar, DIST, TEXTO_DE_COMBINACION_REAL, URL_PRODUCCION } from './apoyo.ts';
import { abrirAnalizadorConTestigos, type AnalizadorConTestigos } from './chrome.ts';

const OMITIR = URL_PRODUCCION === undefined ? 'sin URL_PRODUCCION: estos jueces miran la web publicada (URL_PRODUCCION=https://radiografia.antonioblanquez.es npm test, en web/)' : false;
const RAIZ = URL_PRODUCCION ?? 'https://radiografia.antonioblanquez.es/';
const POR_HTTPS = new URL(RAIZ).protocol === 'https:';
const sha256 = (b: Uint8Array): string => createHash('sha256').update(b).digest('hex');

/** Lo que se espera, del dist/ que se construye aquí y del .htaccess que se escribiría con él. */
function esperado(): { dist: string; csp: string; cacheDe: Map<string, string> } {
  construir();
  const dist = fileURLToPath(DIST);
  const csp = cspDeLaWeb(dist);
  const htaccess = htaccessDesde(readFileSync(new URL('../publicacion/.htaccess.plantilla', import.meta.url), 'utf8'), csp);
  const cacheDe = new Map<string, string>();
  for (const [grupo, ficheros] of repartir(ficherosDe(dist), gruposDeCache(htaccess))) for (const f of ficheros) cacheDe.set(f, grupo.cacheControl);
  return { dist, csp, cacheDe };
}

/** Las cabeceras de todas las respuestas, también las de error (Header always set). */
function deTodas(r: Response, csp: string, donde: string): string[] {
  const mal: string[] = [];
  const debe = (nombre: string, valor: string | null): void => {
    const visto = r.headers.get(nombre);
    if (visto !== valor) mal.push(`${donde}: ${nombre} «${visto}», y se espera «${valor}»`);
  };
  debe('content-security-policy', csp);
  debe('x-content-type-options', 'nosniff');
  debe('referrer-policy', 'strict-origin-when-cross-origin');
  debe('strict-transport-security', POR_HTTPS ? 'max-age=31536000' : null);
  return mal;
}

/** El Content-Type que tiene que llevar un fichero por su extensión; null si el encargo no lo fija. */
function tipoDe(ruta: string): RegExp | null {
  const tipos: Record<string, RegExp> = {
    woff2: /^font\/woff2$/,
    woff: /^font\/woff$/,
    webmanifest: /^application\/manifest\+json$/,
    svg: /^image\/svg\+xml$/,
    json: /^application\/json$/,
    html: /^text\/html$/,
    js: /^(text|application)\/javascript$/,
    css: /^text\/css$/,
  };
  return tipos[ruta.split('.').at(-1)!] ?? null;
}

describe('la web publicada, desde fuera', () => {
  test('1 · cada fichero de dist/ responde 200 con su contenido y las cabeceras de su grupo, la CSP del <meta> y su Content-Type', { skip: OMITIR }, async () => {
    const { dist, csp, cacheDe } = esperado();
    const mal: string[] = [];
    for (const [ruta, cacheControl] of cacheDe) {
      const r = await fetch(`${RAIZ}${ruta}`, { redirect: 'manual' });
      if (r.status !== 200) {
        mal.push(`${ruta}: ${r.status}`);
        continue;
      }
      if (sha256(new Uint8Array(await r.arrayBuffer())) !== sha256(readFileSync(join(dist, ruta)))) mal.push(`${ruta}: otro contenido que el de dist/`);
      if (r.headers.get('cache-control') !== cacheControl) mal.push(`${ruta}: Cache-Control «${r.headers.get('cache-control')}», y se espera «${cacheControl}»`);
      mal.push(...deTodas(r, csp, ruta));
      const tipo = tipoDe(ruta);
      const visto = (r.headers.get('content-type') ?? '').split(';')[0]!.trim().toLowerCase();
      if (tipo !== null && !tipo.test(visto)) mal.push(`${ruta}: Content-Type «${visto}», y se espera ${tipo}`);
    }
    assert.ok(cacheDe.size > 80, `${cacheDe.size} ficheros en dist/`);
    assert.deepEqual(mal, []);
  });

  test('2 · cada página, en su dirección, responde 200 con la CSP por cabecera igual a su <meta>', { skip: OMITIR }, async () => {
    const { dist } = esperado();
    const paginas = ficherosDe(dist).filter((f) => f.endsWith('.html') && f !== '404.html');
    const mal: string[] = [];
    for (const pagina of paginas) {
      const direccion = `${RAIZ}${pagina.replace(/(^|\/)index\.html$/, '$1')}`;
      const r = await fetch(direccion, { redirect: 'manual' });
      const html = await r.text();
      if (r.status !== 200) mal.push(`${direccion}: ${r.status}`);
      else if (r.headers.get('content-security-policy') !== cspDelMeta(html)) mal.push(`${direccion}: la CSP por cabecera no es la del <meta>`);
    }
    assert.equal(paginas.length, 53, 'las páginas: el analizador, el índice, 50 fichas y los créditos');
    assert.deepEqual(mal, []);
  });

  test('3 · /no-existe/ y /reglas/no-existe/x/ responden 404 con la página que no existe y las cabeceras de todas', { skip: OMITIR }, async () => {
    const { csp } = esperado();
    for (const ruta of ['no-existe/', 'reglas/no-existe/x/']) {
      const r = await fetch(`${RAIZ}${ruta}`, { redirect: 'manual' });
      const html = await r.text();
      assert.equal(r.status, 404, `${ruta}: el código`);
      assert.ok(decodificar(html).includes(`<h1>${textos.NO_HAY_NADA_AQUI}</h1>`), `${ruta}: sin la página que no existe`);
      assert.equal(cspDelMeta(html), csp, `${ruta}: la CSP de su <meta>`);
      assert.deepEqual(deTodas(r, csp, ruta), []);
    }
  });

  test('4 · /.git/HEAD, /.git/config, /.git y /.htaccess no se sirven: 403 o 404', { skip: OMITIR }, async () => {
    const vistos = await Promise.all(['.git/HEAD', '.git/config', '.git', '.htaccess'].map(async (ruta) => [ruta, (await fetch(`${RAIZ}${ruta}`, { redirect: 'manual' })).status] as const));
    assert.deepEqual(vistos.filter(([, codigo]) => codigo !== 403 && codigo !== 404), []);
  });

  test('5 · por http, cada dirección redirige a la misma por https', { skip: OMITIR }, async () => {
    assert.ok(POR_HTTPS, `URL_PRODUCCION (${RAIZ}) no es https: la web tiene que servirse por https`);
    for (const ruta of ['', 'reglas/', 'creditos/']) {
      const porHttp = new URL(`${RAIZ}${ruta}`);
      porHttp.protocol = 'http:';
      const r = await fetch(porHttp, { redirect: 'manual' });
      assert.ok([301, 302, 307, 308].includes(r.status), `${porHttp.href}: ${r.status}, y se espera una redirección`);
      assert.equal(r.headers.get('location'), `${RAIZ}${ruta}`, `${porHttp.href}: a dónde redirige`);
    }
  });

  describe('6 · en Chrome', () => {
    let sesion: AnalizadorConTestigos | undefined;
    after(async () => {
      await sesion?.cerrar();
    });

    test('el analizador analiza y descarga el PDF, y se abren el catálogo, una ficha, los créditos y la que no existe: nada fuera del origen, ni violaciones de la CSP, ni errores en la consola', { skip: OMITIR }, async () => {
      sesion = await abrirAnalizadorConTestigos();
      const { pestana, url } = sesion;
      const consola: string[] = [];
      pestana.alEvento((metodo, datos) => {
        if (metodo === 'Log.entryAdded') {
          const { source, level, text, url: de } = (datos as { entry: { source: string; level: string; text: string; url?: string } }).entry;
          consola.push(`${level} ${source} ${text} ${de ?? ''}`);
        }
        if (metodo === 'Runtime.consoleAPICalled') {
          const { type, args } = datos as { type: string; args: { value?: unknown; description?: string }[] };
          consola.push(`${type} consola ${args.map((a) => String(a.value ?? a.description ?? '')).join(' ')}`);
        }
        if (metodo === 'Runtime.exceptionThrown') consola.push(`excepción ${JSON.stringify((datos as { exceptionDetails: unknown }).exceptionDetails)}`);
      });
      await pestana.cdp('Log.enable');
      const violaciones: string[] = [];
      const ir = async (ruta: string, lista: string): Promise<void> => {
        await pestana.cdp('Page.navigate', { url: `${url}${ruta}` });
        await pestana.hasta(`document.readyState === 'complete' && location.pathname === ${JSON.stringify(`/${ruta}`)} && (${lista})`, `${ruta || '/'}, cargada`);
        violaciones.push(...(await sesion!.violaciones()).map((v) => `${ruta || '/'}: ${v}`));
      };

      // El analizador: otra vez, con la consola escuchando desde la carga; analiza y descarga el PDF.
      await ir('', `document.getElementById('analizar')?.disabled === false`);
      await pestana.evaluar(`(() => { document.getElementById('texto').value = ${JSON.stringify(TEXTO_DE_COMBINACION_REAL)}; document.getElementById('analizar').click(); })()`);
      await pestana.hasta(`!document.getElementById('resultado').hidden`, 'el resultado');
      const carpeta = mkdtempSync(join(tmpdir(), 'radiografia-descarga-'));
      try {
        let completada = false;
        pestana.alEvento((metodo, datos) => {
          if (metodo === 'Browser.downloadProgress' && (datos as { state?: string }).state === 'completed') completada = true;
        });
        await pestana.cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: carpeta, eventsEnabled: true });
        await pestana.evaluar(`document.getElementById('descargar').click()`);
        for (const limite = Date.now() + 90_000; !completada; ) {
          if (Date.now() > limite) throw new Error(`no se descargó el PDF: «${await pestana.evaluar<string>(`[...document.querySelectorAll('.estado-descarga')].map((e) => e.textContent).join('')`)}»`);
          await new Promise((r) => setTimeout(r, 100));
        }
        assert.deepEqual(readdirSync(carpeta), ['RadiografIA.pdf'], 'lo que se descargó');
        assert.equal(readFileSync(join(carpeta, 'RadiografIA.pdf')).subarray(0, 5).toString('latin1'), '%PDF-', 'un PDF');
      } finally {
        await pestana.cdp('Browser.setDownloadBehavior', { behavior: 'deny' });
        rmSync(carpeta, { recursive: true, force: true });
      }
      violaciones.push(...(await sesion.violaciones()).map((v) => `/ (tras analizar y descargar): ${v}`));

      // Las demás páginas.
      await ir('reglas/', 'true');
      await ir('reglas/disc-marcador-repetido/', 'true');
      await ir('creditos/', 'true');
      await ir('no-existe/', `document.querySelector('h1')?.textContent === ${JSON.stringify(textos.NO_HAY_NADA_AQUI)}`);

      const origen = new URL(url).origin;
      assert.deepEqual([...sesion.carga, ...sesion.despues].filter((x) => new URL(x.url).origin !== origen), [], 'peticiones fuera del origen');
      assert.deepEqual(violaciones, [], 'violaciones de la CSP');
      assert.deepEqual(consola.filter((l) => /Content.Security.Policy/i.test(l)), [], 'la CSP, en la consola');
      // El único error esperado: el 404 del documento de la que no existe, que Chrome anota como error de red.
      assert.deepEqual(consola.filter((l) => /^(error|excepción|assert)/.test(l) && !(l.startsWith('error network') && l.includes(`${url}no-existe/`))), [], 'errores en la consola');
    });
  });
});
