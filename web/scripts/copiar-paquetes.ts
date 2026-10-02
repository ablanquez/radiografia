/**
 * Copia los paquetes de reglas incluidos (paquetes/*.json) a
 * web/public/paquetes/, antes de `astro dev` y de `astro build` (predev y
 * prebuild en web/package.json; encargo 6.2, firmado en la parada 1). La
 * página los pide con fetch() y los valida con el standalone al arrancar.
 * web/public/paquetes/ no se versiona (.gitignore).
 *
 * [DOC] https://docs.astro.build/en/basics/project-structure/#public — «The
 *    files in this folder will be copied into the build folder untouched»:
 *    llegan a dist/ tal cual, byte a byte.
 * [DOC] https://docs.npmjs.com/cli/v11/using-npm/scripts — «Pre & Post
 *    Scripts»: npm ejecuta `predev` antes de `dev` y `prebuild` antes de
 *    `build`.
 * [PROPIO] Se vacía la carpeta antes de copiar, para que no quede en ella un
 *    paquete que ya no esté en paquetes/.
 */
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ORIGEN = new URL('../../paquetes/', import.meta.url);
const DESTINO = new URL('../public/paquetes/', import.meta.url);

rmSync(DESTINO, { recursive: true, force: true });
mkdirSync(DESTINO, { recursive: true });
const ficheros = readdirSync(ORIGEN).filter((f) => f.endsWith('.json')).sort();
for (const f of ficheros) copyFileSync(new URL(f, ORIGEN), new URL(f, DESTINO));
console.log(`copiados a ${fileURLToPath(DESTINO)}: ${ficheros.join(', ')}`);
