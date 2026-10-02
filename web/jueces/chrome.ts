/**
 * Chrome headless por el protocolo de DevTools (CDP), para los jueces que
 * tienen que ver la página funcionando (encargo 8.1, b: navegador.spec.ts).
 * Sin dependencias: Chrome se lanza con spawn y se le habla por WebSocket, el
 * global de Node.
 *
 * Desde el 9.1, también el arranque que comparten los jueces de Chrome
 * (abrirAnalizadorConTestigos): build, astro preview, Chrome, el analizador
 * cargado y la marca tras la carga inicial, con los tres testigos de red del
 * 8.1 (cada Network.requestWillBeSent, cada Network.webSocketCreated y cada
 * securitypolicyviolation, desde antes de navegar). Se llama dentro de los
 * tests, no en un before(): si revienta ahí, node --test dice «fail 0» con
 * los tests «cancelled» (visto en el 8.1; docs/BITACORA.md, 2026-09-29).
 *
 * Dónde está Chrome: la variable de entorno CHROME o la ruta de instalación de
 * Chrome en Windows, macOS o Linux. Si no está, abrirChrome lanza un error y
 * el juez FALLA: no se salta (firmado en la parada 1).
 *
 * [DOC] https://developer.chrome.com/docs/chromium/headless — «To use Headless
 *    mode, pass the --headless command-line flag to a Chrome binary».
 * [DOC] https://developer.chrome.com/blog/remote-debugging-port — desde Chrome
 *    136, --remote-debugging-port «must now be accompanied by the
 *    --user-data-dir switch to point to a non-standard directory»: un perfil
 *    temporal, que se borra al cerrar.
 * [DOC] https://chromedevtools.github.io/devtools-protocol/ — «/json or
 *    /json/list GET List of inspectable targets (pages, workers, tabs)», cada
 *    uno con su webSocketDebuggerUrl; los mensajes son JSON con id, method y
 *    params, y los eventos llegan con method y params.
 * [DOC] https://nodejs.org/docs/latest-v24.x/api/globals.html — WebSocket:
 *    «Stable», «No longer experimental: v22.4.0».
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as textos from '../src/textos.ts';
import { abrirPreview, construir, paquetesIncluidos, puertoLibre } from './apoyo.ts';

const RUTAS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
];

/** La ruta de Chrome: CHROME, o la primera de RUTAS que exista. */
export function rutaDeChrome(): string {
  const candidatas = process.env['CHROME'] !== undefined ? [process.env['CHROME']] : RUTAS;
  const ruta = candidatas.find((r) => existsSync(r));
  if (ruta === undefined) throw new Error(`no encuentro Chrome en ${candidatas.join(', ')}: pon su ruta en la variable CHROME`);
  return ruta;
}

/** Un mensaje de CDP: respuesta (id) o evento (method y params). */
interface Mensaje {
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: unknown;
}

export interface Pestana {
  /** Una orden de CDP y su resultado. */
  cdp(metodo: string, parametros?: Record<string, unknown>): Promise<Record<string, unknown>>;
  /** Cada evento de CDP que llegue, desde ahora. */
  alEvento(escuchar: (metodo: string, parametros: Record<string, unknown>) => void): void;
  /** Una expresión en la página, con su valor (y las promesas, esperadas). */
  evaluar<T>(expresion: string): Promise<T>;
  /** Espera a que la expresión dé verdadero, o lanza con `que` al cabo de `limite` ms. */
  hasta(expresion: string, que: string, limite?: number): Promise<void>;
  cerrar(): Promise<void>;
}

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Una petición de red que vio un testigo: su tipo (Document, Script, Fetch, WebSocket…) y su dirección. */
export interface Peticion {
  tipo: string;
  url: string;
}

/** El analizador abierto en Chrome sobre astro preview, con lo que vieron los testigos antes y después de la marca. */
export interface AnalizadorConTestigos {
  pestana: Pestana;
  /** La dirección de astro preview, con la barra final. */
  url: string;
  /** Las peticiones de la carga inicial, hasta la marca. */
  carga: Peticion[];
  /** Las peticiones después de la marca: tiene que quedarse vacía. */
  despues: Peticion[];
  /** Los intentos que bloqueó la CSP desde que nació el documento. */
  violaciones(): Promise<string[]>;
  cerrar(): Promise<void>;
}

/**
 * Build, astro preview y Chrome con el analizador cargado: espera a que diga
 * que cargó los paquetes y a que la red lleve 500 ms quieta (nada en vuelo ni
 * nada nuevo), y pone ahí la marca. Si algo falla por el camino, cierra lo que
 * llegó a abrir.
 */
export async function abrirAnalizadorConTestigos(): Promise<AnalizadorConTestigos> {
  construir();
  const preview = await abrirPreview();
  let pestana: Pestana | undefined;
  try {
    pestana = await abrirChrome();
    const carga: Peticion[] = [];
    const despues: Peticion[] = [];
    let marcada = false;
    const enVuelo = new Set<string>();
    let ultimo = Date.now();
    pestana.alEvento((metodo, datos) => {
      const lista = marcada ? despues : carga;
      if (metodo === 'Network.requestWillBeSent') {
        const { requestId, type, request } = datos as { requestId: string; type?: string; request: { url: string } };
        lista.push({ tipo: type ?? '?', url: request.url });
        enVuelo.add(requestId);
        ultimo = Date.now();
      }
      if (metodo === 'Network.loadingFinished' || metodo === 'Network.loadingFailed') {
        enVuelo.delete((datos as { requestId: string }).requestId);
        ultimo = Date.now();
      }
      if (metodo === 'Network.webSocketCreated') lista.push({ tipo: 'WebSocket', url: (datos as { url: string }).url });
    });
    for (const dominio of ['Network', 'Runtime', 'Page', 'DOM']) await pestana.cdp(`${dominio}.enable`);
    await pestana.cdp('Page.addScriptToEvaluateOnNewDocument', {
      source: `window.__violaciones = []; document.addEventListener('securitypolicyviolation', (e) => window.__violaciones.push(e.effectiveDirective + ' ' + e.blockedURI));`,
    });
    await pestana.cdp('Page.navigate', { url: preview.url });
    const cargados = textos.paquetesCargados(paquetesIncluidos().map((x) => `${x.cabecera.nombre} ${x.cabecera.version}`));
    await pestana.hasta(`document.getElementById('estado')?.textContent === ${JSON.stringify(cargados)}`, 'los paquetes incluidos cargados');
    const limite = Date.now() + 15_000;
    while (enVuelo.size > 0 || Date.now() - ultimo < 500) {
      if (Date.now() > limite) throw new Error(`la red no se aquieta: ${enVuelo.size} peticiones en vuelo`);
      await esperar(100);
    }
    marcada = true;
    const abierta = pestana;
    return {
      pestana: abierta,
      url: preview.url,
      carga,
      despues,
      violaciones: () => abierta.evaluar<string[]>('window.__violaciones'),
      cerrar: async () => {
        await abierta.cerrar();
        preview.cerrar();
      },
    };
  } catch (fallo) {
    await pestana?.cerrar();
    preview.cerrar();
    throw fallo;
  }
}

/** Chrome headless con un perfil temporal y una pestaña en blanco, conectada por CDP. */
export async function abrirChrome(): Promise<Pestana> {
  const ruta = rutaDeChrome();
  const puerto = await puertoLibre();
  const perfil = mkdtempSync(join(tmpdir(), 'radiografia-chrome-'));
  const chrome = spawn(ruta, ['--headless', '--disable-gpu', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  const cerrarChrome = async (): Promise<void> => {
    chrome.kill();
    await esperar(500);
    rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  };
  try {
    let pagina: { webSocketDebuggerUrl: string } | undefined;
    for (let i = 0; i < 120 && pagina === undefined; i++) {
      try {
        const objetivos = (await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
        pagina = objetivos.find((o) => o.type === 'page');
      } catch {
        // Chrome aún no escucha.
      }
      if (pagina === undefined) await esperar(250);
    }
    if (pagina === undefined) throw new Error(`Chrome (${ruta}) no abrió su puerto de depuración ${puerto}`);
    const ws = new WebSocket(pagina.webSocketDebuggerUrl);
    await new Promise((listo, mal) => {
      ws.addEventListener('open', listo, { once: true });
      ws.addEventListener('error', mal, { once: true });
    });
    let siguiente = 0;
    const pendientes = new Map<number, (m: Mensaje) => void>();
    const oyentes: ((metodo: string, parametros: Record<string, unknown>) => void)[] = [];
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(String(ev.data)) as Mensaje;
      if (m.id !== undefined) {
        pendientes.get(m.id)?.(m);
        pendientes.delete(m.id);
      } else if (m.method !== undefined) {
        for (const oyente of oyentes) oyente(m.method, m.params ?? {});
      }
    });
    const cdp: Pestana['cdp'] = (metodo, parametros = {}) =>
      new Promise((bien, mal) => {
        const id = ++siguiente;
        pendientes.set(id, (m) => (m.error !== undefined ? mal(new Error(`${metodo}: ${JSON.stringify(m.error)}`)) : bien(m.result ?? {})));
        ws.send(JSON.stringify({ id, method: metodo, params: parametros }));
      });
    const evaluar = async <T>(expresion: string): Promise<T> => {
      const r = (await cdp('Runtime.evaluate', { expression: expresion, returnByValue: true, awaitPromise: true })) as {
        result: { value: T };
        exceptionDetails?: { text: string; exception?: { description?: string } };
      };
      if (r.exceptionDetails !== undefined) throw new Error(`${expresion.slice(0, 100)}: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
      return r.result.value;
    };
    return {
      cdp,
      alEvento: (escuchar) => oyentes.push(escuchar),
      evaluar,
      hasta: async (expresion, que, limite = 30_000) => {
        const final = Date.now() + limite;
        while (Date.now() < final) {
          if (await evaluar<boolean>(expresion).catch(() => false)) return;
          await esperar(100);
        }
        throw new Error(`no llegó: ${que}`);
      },
      cerrar: async () => {
        ws.close();
        await cerrarChrome();
      },
    };
  } catch (fallo) {
    await cerrarChrome();
    throw fallo;
  }
}
