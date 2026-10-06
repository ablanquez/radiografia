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
 * Desde el 10.4 (Tanda 3; docs/BITACORA.md, 2026-10-05), dos cuelgues
 * cerrados. Si Chrome o su conexión caen (el proceso sale, el WebSocket se
 * cierra), cada orden en vuelo falla con el motivo, las que vengan después
 * fallan en el acto, y hasta() falla con él en vez de esperar su límite: antes
 * la orden no terminaba nunca y node --test se quedaba colgado sin decir
 * nada. Y el cierre de abrirConTestigos cierra el preview aunque cerrar Chrome
 * falle (el borrado del perfil temporal daba EPERM en Windows con algún
 * proceso de Chrome aún vivo): un preview vivo deja el proceso del fichero sin
 * salir. Al cerrar, en Windows se mata el árbol entero de Chrome (taskkill,
 * como Puppeteer: sus hijos retenían el perfil más de 5 s), se espera a que
 * salga y se reintenta borrar su perfil hasta 5 s sin bloquear; si Windows
 * aún lo retiene (visto el 05/10: «acceso denegado» minutos después, sin
 * ningún proceso de Chrome vivo; quién lo retiene NO CONSTA), se avisa en la
 * salida y se sigue, y la próxima apertura barre los de más de una hora.
 * Chrome arranca sin su informe de fallos, cuyo proceso también retenía el
 * perfil.
 * De respaldo, el script de test de web
 * lleva --test-timeout (package.json): 60 s, más de seis veces el test más
 * lento en verde (9,2 s, el primero de base.spec.ts, con el build, en un clon
 * del 04/10) y más que el fallo más lento visto, una espera de hasta() de 30
 * s agotada (37,9 s); la suite entera, unos 2 minutos.
 * [DOC] https://nodejs.org/api/child_process.html#event-exit — «The 'exit'
 *    event is emitted after the child process ends».
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event
 *    — «The close event is fired when a connection with a WebSocket is
 *    closed».
 * [DOC] https://nodejs.org/api/cli.html#--test-timeout — «A number of
 *    milliseconds the test execution will fail after»; también corta un
 *    after() que no termina (visto el 05/10 en una prueba mínima).
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
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as textos from '../src/textos.ts';
import { NEGRITA_DEL_PAPEL } from '../src/estilos/recursos.ts';
import { abrirPreview, construir, paquetesIncluidos, puertoLibre, URL_PRODUCCION } from './apoyo.ts';

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

/**
 * Cuánto se reintenta borrar el perfil temporal de Chrome al cerrarlo (ms). Medido el 05/10 tras tumbar Chrome con
 * Browser.crash, cinco veces: se soltó entre 40 y 365 ms, al primer o al segundo intento; con rmSync y sus maxRetries
 * fallaba en el acto con EPERM.
 */
const BORRAR_PERFIL = 5_000;

/** Una petición de red que vio un testigo: su tipo (Document, Script, Fetch, WebSocket…) y su dirección. */
export interface Peticion {
  tipo: string;
  url: string;
}

/**
 * Lo que el analizador pide a propósito después de la carga inicial, al pintar un resultado (decisión de Antonio del
 * 05/10, punto 8 del 9.3): la negrita del papel, Literata 600 (NEGRITA_DEL_PAPEL), del mismo origen y una vez por visita.
 * Sin ella cargada, el diálogo de imprimir de Chrome, que no espera a las fuentes web, deja sin pintar el texto en negrita
 * (visto el 05/10 en el diálogo de Chrome 154: «Discurso: 28,69» desaparece); printToPDF sí espera, y por eso los jueces
 * del papel no lo ven. Es un fichero de la web: no lleva nada del texto ni sale del navegador. Hasta el 9.3 se precargaba
 * (46 KB en cada visita).
 */
export const AL_PINTAR_UN_RESULTADO: readonly string[] = [NEGRITA_DEL_PAPEL];

/**
 * Las peticiones de después de la marca, sin las que se esperan al pintar un resultado (AL_PINTAR_UN_RESULTADO), cada una
 * una vez: si se pide dos veces, la segunda se queda en la lista. `url` es la dirección del preview, con la barra final.
 */
export function sinLasDelResultado(despues: readonly Peticion[], url: string): Peticion[] {
  const vistas = new Set<string>();
  return despues.filter((x) => {
    const ruta = AL_PINTAR_UN_RESULTADO.find((r) => x.url === `${url}${r}`);
    if (ruta === undefined || vistas.has(ruta)) return true;
    vistas.add(ruta);
    return false;
  });
}

/** Una página de la web abierta en Chrome sobre astro preview (o el sitio publicado), con lo que vieron los testigos antes y después de la marca. */
export interface PaginaConTestigos {
  pestana: Pestana;
  /** La dirección de astro preview (o, en el modo producción, la del sitio publicado), con la barra final. */
  url: string;
  /** Las peticiones de la carga inicial, hasta la marca. */
  carga: Peticion[];
  /** Las peticiones después de la marca: tiene que quedarse vacía. */
  despues: Peticion[];
  /** Los intentos que bloqueó la CSP desde que nació el documento. */
  violaciones(): Promise<string[]>;
  cerrar(): Promise<void>;
}

/** El analizador abierto en Chrome sobre astro preview (desde el 9.1). */
export type AnalizadorConTestigos = PaginaConTestigos;

/**
 * Verdadero cuando la página ya ha recibido el último cambio de ancho (10.4, Tanda 4), para esperarlo con hasta() tras
 * Emulation.setDeviceMetricsOverride: los oyentes de matchMedia lo reciben en el siguiente fotograma, no en el acto, y
 * con resultado mueven bloques (pantalla/pestanas.ts): en el móvil, a los paneles de las pestañas; en una columna, la
 * vista detrás del medidor. Sin resultado (o en una página sin analizador), no hay nada que esperar.
 */
export const ANCHO_ASENTADO = `(() => {
  const resultado = document.getElementById('resultado');
  if (resultado === null || resultado.hidden || resultado.classList.contains('insuficiente')) return true;
  const vistaEnUnaColumna = document.getElementById('vista').parentElement.id !== 'columna-texto';
  return document.body.classList.contains('con-pestanas') === (innerWidth <= 768) && vistaEnUnaColumna === (innerWidth <= 1023);
})()`;

/**
 * Build, astro preview y Chrome con el analizador cargado: espera a que diga
 * que cargó los paquetes y a que la red lleve 500 ms quieta (nada en vuelo ni
 * nada nuevo), y pone ahí la marca. Si algo falla por el camino, cierra lo que
 * llegó a abrir.
 */
export async function abrirAnalizadorConTestigos(): Promise<AnalizadorConTestigos> {
  const cargados = textos.paquetesCargados(paquetesIncluidos().map((x) => `${x.cabecera.nombre} ${x.cabecera.version}`));
  return abrirConTestigos('', `document.getElementById('estado')?.textContent === ${JSON.stringify(cargados)}`, 'los paquetes incluidos cargados');
}

/**
 * Lo mismo con cualquier página de la web (desde el 10.4, Tanda 3: el
 * catálogo y las fichas): su ruta, sin barra delante, y la expresión que dice
 * que ya está lista.
 * Desde el 11.2, en el modo producción del arnés (URL_PRODUCCION, apoyo.ts), la
 * página se pide al sitio publicado: sin build ni preview, y con su dirección
 * como `url` y como origen de los testigos.
 */
export async function abrirConTestigos(ruta: string, lista: string, que: string): Promise<PaginaConTestigos> {
  const preview = URL_PRODUCCION === undefined ? (construir(), await abrirPreview()) : { url: URL_PRODUCCION, cerrar: (): void => {} };
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
    await pestana.cdp('Page.navigate', { url: preview.url + ruta });
    await pestana.hasta(lista, que);
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
      // El preview se cierra aunque cerrar Chrome falle: vivo, el proceso del fichero no sale (docs/BITACORA.md, 2026-10-05).
      cerrar: async () => {
        try {
          await abierta.cerrar();
        } finally {
          preview.cerrar();
        }
      },
    };
  } catch (fallo) {
    try {
      await pestana?.cerrar();
    } finally {
      preview.cerrar();
    }
    throw fallo;
  }
}

/** Chrome headless con un perfil temporal y una pestaña en blanco, conectada por CDP. */
/**
 * Los perfiles temporales que dejó otra ejecución porque Windows no los soltó a tiempo (cerrarChrome lo avisa): los de
 * más de una hora, que ya no son de nadie. Lo que aún no se deje borrar se queda para la próxima.
 */
function barrerPerfilesViejos(): void {
  const viejo = Date.now() - 60 * 60 * 1000;
  for (const nombre of readdirSync(tmpdir())) {
    if (!nombre.startsWith('radiografia-chrome-')) continue;
    const ruta = join(tmpdir(), nombre);
    try {
      if (statSync(ruta).mtimeMs < viejo) rmSync(ruta, { recursive: true, force: true });
    } catch {
      // Aún retenido: se intenta en la próxima apertura.
    }
  }
}

export async function abrirChrome(): Promise<Pestana> {
  barrerPerfilesViejos();
  const ruta = rutaDeChrome();
  const puerto = await puertoLibre();
  const perfil = mkdtempSync(join(tmpdir(), 'radiografia-chrome-'));
  // Sin el informe de fallos (desde el 10.4, Tanda 3): su proceso, crashpad, guardaba ficheros del perfil temporal abiertos
  // después de cerrar o tumbar Chrome, y el perfil no se podía borrar (EPERM).
  // [DOC] https://peter.sh/experiments/chromium-command-line-switches/ — --disable-crash-reporter: «Disable crash reporter
  //    for headless. It is enabled by default in official builds».
  const chrome = spawn(ruta, ['--headless', '--disable-gpu', '--disable-crash-reporter', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  /** Por qué ya no se puede hablar con Chrome (null mientras se puede); con ello fallan las órdenes en vuelo y las que vengan. */
  let caida: string | null = null;
  const pendientes = new Map<number, { metodo: string; bien: (r: Record<string, unknown>) => void; mal: (e: Error) => void }>();
  const caer = (motivo: string): void => {
    if (caida !== null) return;
    caida = motivo;
    for (const { metodo, mal } of pendientes.values()) mal(new Error(`${metodo}: ${motivo}`));
    pendientes.clear();
  };
  const salio = new Promise<void>((listo) =>
    chrome.once('exit', (codigo, senal) => {
      caer(`Chrome se cerró (código ${codigo}, señal ${senal})`);
      listo();
    }),
  );
  const cerrarChrome = async (): Promise<void> => {
    caer('la pestaña se cerró');
    // En Windows, el árbol entero con taskkill: chrome.kill() solo mata el proceso del navegador, y sus hijos siguen vivos
    // un rato con el perfil abierto (visto el 05/10: más de 5 s). Si taskkill falla (o Chrome ya salió), chrome.kill().
    // [DOC] https://github.com/puppeteer/puppeteer/blob/main/packages/browsers/src/launch.ts — kill(): en win32,
    //    «taskkill /pid ${pid} /T /F», y si falla, el kill de Node, que «delays killing of all child processes».
    let arbol = false;
    if (process.platform === 'win32' && chrome.exitCode === null && chrome.signalCode === null) {
      try {
        execFileSync('taskkill', ['/pid', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
        arbol = true;
      } catch {
        arbol = false;
      }
    }
    if (!arbol) chrome.kill();
    // Hasta que sale el proceso de Chrome (5 s como mucho); sus hijos sueltan el perfil poco después: se reintenta, sin
    // bloquear, hasta BORRAR_PERFIL ms, y si no se suelta, el cierre falla diciéndolo.
    await Promise.race([salio, esperar(5_000)]);
    const desde = Date.now();
    for (let intento = 1; ; intento++) {
      try {
        rmSync(perfil, { recursive: true, force: true });
        return;
      } catch (fallo) {
        const codigo = (fallo as NodeJS.ErrnoException).code ?? '';
        if (!['EPERM', 'EBUSY', 'ENOTEMPTY'].includes(codigo)) throw fallo;
        if (Date.now() - desde > BORRAR_PERFIL) {
          // Se avisa en la salida y no se lanza: el perfil retenido es cosa de Windows, no de la web, y lanzar aquí dejaba
          // sin cerrar lo que venía detrás (el preview). Lo barre la próxima apertura (barrerPerfilesViejos).
          process.emitWarning(`no se pudo borrar el perfil temporal de Chrome (${perfil}) en ${Date.now() - desde} ms y ${intento} intentos (${codigo}): se queda en el temporal`);
          return;
        }
        await esperar(100);
      }
    }
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
    ws.addEventListener('close', (ev) => caer(`la conexión con Chrome se cerró (código ${ev.code})`));
    ws.addEventListener('error', () => caer('la conexión con Chrome falló'));
    let siguiente = 0;
    const oyentes: ((metodo: string, parametros: Record<string, unknown>) => void)[] = [];
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(String(ev.data)) as Mensaje;
      if (m.id !== undefined) {
        const pendiente = pendientes.get(m.id);
        pendientes.delete(m.id);
        if (pendiente === undefined) return;
        if (m.error !== undefined) pendiente.mal(new Error(`${pendiente.metodo}: ${JSON.stringify(m.error)}`));
        else pendiente.bien(m.result ?? {});
      } else if (m.method !== undefined) {
        for (const oyente of oyentes) oyente(m.method, m.params ?? {});
      }
    });
    const cdp: Pestana['cdp'] = (metodo, parametros = {}) =>
      new Promise((bien, mal) => {
        if (caida !== null) {
          mal(new Error(`${metodo}: ${caida}`));
          return;
        }
        const id = ++siguiente;
        pendientes.set(id, { metodo, bien, mal });
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
          // Una expresión que aún falla es un «todavía no»; Chrome caído, no: se dice el motivo ya.
          const lista = await evaluar<boolean>(expresion).catch((fallo: unknown) => {
            if (caida !== null) throw fallo;
            return false;
          });
          if (lista) return;
          await esperar(100);
        }
        throw new Error(`no llegó: ${que}`);
      },
      cerrar: async () => {
        caer('la pestaña se cerró');
        ws.close();
        await cerrarChrome();
      },
    };
  } catch (fallo) {
    await cerrarChrome();
    throw fallo;
  }
}
