/**
 * Lo que comparten los jueces de la web (encargo 6.3): el build, el motor del
 * navegador y los dos paquetes incluidos.
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
import { execSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Paquete } from '@radiografia/motor/navegador';
import { FICHEROS } from '../src/pantalla/cargar.ts';

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
