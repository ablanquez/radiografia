/**
 * Lo que comparten los jueces de la web (encargo 6.3): el build, el motor del
 * navegador y los dos paquetes incluidos; y desde el 7.1, astro preview y la
 * lectura de las entidades de HTML (antes, en construccion.spec.ts y en
 * textos-web.spec.ts); desde el 8.1, los paquetes de prueba del cargador y un
 * texto con señales de los tres paquetes.
 *
 * El build: `npm run build` en web/, una vez por fichero de jueces, desde un
 * dist/ vacío.
 * ⚠️ Se llama DENTRO del primer juez que lo necesita, no en el cuerpo del
 *    describe: si revienta ahí, node --test dice «fail 0» (docs/BITACORA.md,
 *    2026-09-29).
 * [PROPIO, firmado en la parada 1 del 6.2] Astro se arranca siempre con
 *    ASTRO_TELEMETRY_DISABLED=1: el CLI manda telemetría por defecto en dev,
 *    build y preview, y una variable de entorno en un script de npm no es
 *    portable a Windows (cmd.exe).
 * [DOC] https://astro.build/telemetry/ — «You can also opt-out by setting the
 *    environment variable: ASTRO_TELEMETRY_DISABLED=1».
 * [DOC] https://nodejs.org/api/child_process.html — npm es un .cmd en Windows
 *    y se lanza con `exec` (pasa por cmd.exe; comando fijo).
 *
 * El motor es `@radiografia/motor/navegador`, la misma entrada que importa la
 * página. Su validador standalone (motor/dist/validador.standalone.js) no se
 * versiona y lo genera `npm run generar` del motor; sin él el import falla, y
 * por eso se genera antes de importar.
 * ⚠️ Los ficheros de jueces corren de uno en uno (--test-concurrency=1 en
 *    web/package.json): `npm run build` (construccion.spec.ts) genera el mismo
 *    standalone y vacía y copia web/public/paquetes/, y dos procesos haciéndolo
 *    a la vez podrían dejar a uno leyendo un fichero a medias.
 * [DOC] https://nodejs.org/docs/latest-v24.x/api/test.html — «each matching
 *    test file is executed in a separate child process. The maximum number of
 *    child processes running at any time is controlled by the
 *    --test-concurrency flag».
 */
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer, type AddressInfo } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Paquete } from '@radiografia/motor/navegador';
import { FICHEROS } from '../src/pantalla/cargar.ts';

/**
 * El modo producción del arnés (encargo 11.2; decidido por Antonio el 06/10: verificar desde fuera): con la variable
 * URL_PRODUCCION (la raíz del sitio publicado, https://radiografia.antonioblanquez.es), los jueces que abren páginas en
 * Chrome (chrome.ts, abrirConTestigos) las piden ahí en vez de a un astro preview del dist/ local, y se activan los
 * jueces de producción (produccion.spec.ts). Sin ella, todo como siempre, y los de producción se omiten con aviso. Tiene
 * que ser la raíz, por http o https, y se guarda con su barra final, como la del preview.
 */
export const URL_PRODUCCION: string | undefined = (() => {
  const valor = process.env['URL_PRODUCCION'];
  if (valor === undefined || valor === '') return undefined;
  const url = new URL(valor);
  if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search !== '' || url.hash !== '') {
    throw new Error(`URL_PRODUCCION tiene que ser la raíz de un sitio, por http o https, y es «${valor}»`);
  }
  return url.href;
})();

export const WEB = fileURLToPath(new URL('..', import.meta.url));
export const DIST = new URL('../dist/', import.meta.url);
export const PAQUETES = new URL('../../paquetes/', import.meta.url);
export const ENTORNO = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };

let salidaDelBuild: string | undefined;
/** `npm run build` en web/, una vez, desde un dist/ vacío; devuelve lo que imprime. */
export function construir(): string {
  if (salidaDelBuild === undefined) {
    rmSync(DIST, { recursive: true, force: true });
    salidaDelBuild = execSync('npm run build', { cwd: WEB, env: ENTORNO, encoding: 'utf8', stdio: 'pipe' });
  }
  return salidaDelBuild;
}

let motor: Promise<typeof import('@radiografia/motor/navegador')> | undefined;
/** El motor del navegador, con su standalone generado (una vez por fichero de jueces). */
export function motorDelNavegador(): Promise<typeof import('@radiografia/motor/navegador')> {
  if (motor === undefined) {
    execSync('npm run generar --workspace @radiografia/motor', { cwd: WEB, encoding: 'utf8', stdio: 'pipe' });
    motor = import('@radiografia/motor/navegador');
  }
  return motor;
}

/** Los dos paquetes incluidos, de paquetes/ y en el orden en que los analiza la página (FICHEROS, cargar.ts). */
export function paquetesIncluidos(): Paquete[] {
  return FICHEROS.map((f) => JSON.parse(readFileSync(new URL(f, PAQUETES), 'utf8')) as Paquete);
}

/** Los dos paquetes de prueba del cargador (encargo 8.1, b), en web/public/ejemplos/: ninguno se carga solo. */
export const PAQUETES_DE_PRUEBA = { valido: 'paquete-prueba.json', invalido: 'paquete-prueba-invalido.json' } as const;
export const EJEMPLOS_PUBLICOS = new URL('../public/ejemplos/', import.meta.url);

/** El paquete de prueba que valida, leído de web/public/ejemplos/. */
export function paqueteDePrueba(): Paquete {
  return JSON.parse(readFileSync(new URL(PAQUETES_DE_PRUEBA.valido, EJEMPLOS_PUBLICOS), 'utf8')) as Paquete;
}

/**
 * Un texto con señales de los tres paquetes (encargo 8.1, b, jueces 2 y 3), de
 * más de 100 palabras de prosa para que el motor lo analice: «Cabe destacar»
 * al principio de una frase (RadiografIA), «fue aprobado por el» y «Enero»
 * (Español correcto), y «a nivel de», «okey» y una pregunta sin «¿» (el
 * paquete de prueba). Lo escribe el juez; no es un texto de Antonio.
 */
export const TEXTO_DE_TRES_PAQUETES = [
  'Cabe destacar que el proyecto fue aprobado por el consejo en la reunión del 5 de Enero.',
  'A nivel de empresa, el cambio afecta a todos los equipos, y cada responsable tendrá que revisar sus cuentas antes del cierre.',
  'La directora dijo que todo estaba okey y que no hacía falta esperar más.',
  'Qué opinas tú de todo esto?',
  'Algunos compañeros creen que el plan llega tarde, otros piensan que llega justo a tiempo, y casi nadie sabe todavía cómo se va a repartir el trabajo entre las oficinas de la costa y las del interior.',
  'Habrá que hablarlo con calma la semana que viene, cuando vuelvan los que están de viaje y se pueda reunir a todo el mundo en la misma sala.',
].join(' ');

/**
 * El texto de motor/src/combinacion-real.spec.ts (encargo 5.4), copiado tal
 * cual para el juez del informe (encargo 9.1, b; firmado en la parada 1): de
 * más de 300 palabras, con señales de los dos paquetes incluidos y de varias
 * familias. No se importa porque importar aquel fichero correría sus tests;
 * un juez de impresion.spec.ts comprueba que cada línea sigue en él.
 */
export const TEXTO_DE_COMBINACION_REAL = [
  '## Cinco Claves Para Mejorar Tu Productividad En El Trabajo',
  'La productividad se ha convertido en uno de los temas más relevantes del mundo laboral. En este artículo exploraremos cinco claves que pueden transformar la forma de trabajar de cualquier empresa, mejorando la concentración de todo el equipo.',
  'El método fue desarrollado por un equipo de psicólogos de la Universidad de Stanford en 2019. Desde entonces, más de 1,500 empresas lo han adoptado, y su licencia básica cuesta $100 al año. Los expertos coinciden en que su impacto es notable.',
  'La primera clave es planificar la semana. Cada Lunes, antes de abrir el correo, conviene dedicar diez minutos a fijar las prioridades. La próxima sesión de formación será el Lunes 3 de Marzo, y la inscripción ya está abierta.',
  'La segunda clave es la comunicación. En la última reunión, la directora levantó su mano y pidió silencio antes de explicar el nuevo sistema. Su mensaje fue claro: «menos reuniones y más resultados.» Además, cada equipo recibió una guía práctica.',
  'La tercera clave es desconectar. Diversos estudios demuestran que las pausas breves mejoran el rendimiento. Además, reducir las notificaciones del móvil desempeña un papel fundamental en la concentración, permitiendo centrarse en las tareas importantes.',
  'La cuarta clave es delegar. Muchos directivos siguen revisando cada documento antes de enviarlo, aunque sus equipos están preparados para hacerlo solos. Delegar no significa desentenderse: significa confiar, dar instrucciones claras y revisar los resultados al final de la semana, no a cada paso. Además, las empresas que lo han probado dicen que las decisiones llegan antes y que los empleados se sienten más valorados.',
  'La quinta clave es medir. Sin datos, cualquier cambio es una intuición; con ellos, es posible saber qué funciona y qué no. Una hoja de cálculo sencilla basta para anotar las horas dedicadas a cada proyecto y compararlas con los objetivos.',
  'En conclusión, mejorar la productividad no depende de trabajar más horas, sino de trabajar mejor. Con planificación, comunicación y pausas, cualquier equipo puede alcanzar sus objetivos.',
].join('\n');

/** El ejecutable de astro: el `bin` de su package.json (astro exporta ./package.json). */
export function binDeAstro(): string {
  const paquete = createRequire(import.meta.url).resolve('astro/package.json');
  const { bin } = JSON.parse(readFileSync(paquete, 'utf8')) as { bin: { astro: string } };
  return join(dirname(paquete), bin.astro);
}

/** Un puerto libre en 127.0.0.1, que elige el sistema. */
export function puertoLibre(): Promise<number> {
  return new Promise((resolver, rechazar) => {
    const servidor = createServer();
    servidor.once('error', rechazar);
    servidor.listen(0, '127.0.0.1', () => {
      const { port } = servidor.address() as AddressInfo;
      servidor.close(() => resolver(port));
    });
  });
}

/**
 * Arranca `astro preview` en un puerto libre, espera a que responda, hace `pedir` y lo cierra.
 * Con la telemetría apagada (ENTORNO), como el build.
 * [DOC] https://docs.astro.build/en/reference/cli-reference/ — `astro
 *    preview`: «Starts a local server to serve the contents of your static
 *    directory (dist/ by default) created by running astro build»; acepta
 *    `--port` y `--host`.
 * [DOC] https://nodejs.org/api/child_process.html — astro se lanza con
 *    `spawn` de node sobre su `bin`, para poder cerrarlo con kill().
 * [DOC] https://nodejs.org/api/net.html#serverlistenport-host-backlog-callback
 *    — con el puerto 0, el sistema elige uno libre.
 */
export async function conPreview(pedir: (url: string) => Promise<void>): Promise<void> {
  const preview = await abrirPreview();
  try {
    await pedir(preview.url);
  } finally {
    preview.cerrar();
  }
}

/** astro preview en un puerto libre, ya respondiendo: su URL y cómo cerrarlo (desde el 8.1, para los jueces de Chrome, que lo usan entre tests). */
export async function abrirPreview(): Promise<{ url: string; cerrar: () => void }> {
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
  const limite = Date.now() + 30_000;
  for (;;) {
    try {
      await fetch(url);
      return { url, cerrar: () => hijo.kill() };
    } catch {
      if (Date.now() > limite || hijo.exitCode !== null) {
        hijo.kill();
        throw new Error(`astro preview no responde en ${url}:\n${registro}`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
}

/** Las entidades que escribe Astro al escapar texto y atributos. */
const ENTIDADES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

export function decodificar(texto: string): string {
  return texto.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entidad, nombre: string) => {
    if (nombre.startsWith('#x') || nombre.startsWith('#X')) return String.fromCodePoint(parseInt(nombre.slice(2), 16));
    if (nombre.startsWith('#')) return String.fromCodePoint(parseInt(nombre.slice(1), 10));
    const caracter = ENTIDADES[nombre];
    assert.ok(caracter !== undefined, `el HTML lleva una entidad que el juez no sabe leer: ${entidad}`);
    return caracter;
  });
}
