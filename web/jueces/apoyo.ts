/**
 * Lo que comparten los jueces de la web que analizan con el motor (encargo
 * 6.3): el motor del navegador y los dos paquetes incluidos.
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
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Paquete } from '@radiografia/motor/navegador';
import { FICHEROS } from '../src/pantalla/cargar.ts';

const WEB = fileURLToPath(new URL('..', import.meta.url));
const PAQUETES = new URL('../../paquetes/', import.meta.url);

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
