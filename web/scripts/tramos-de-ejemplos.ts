/**
 * Los tramos de los ejemplos positivos de cada regla (encargo 10.4, Tanda 3;
 * DISEÑO §6.4: «ejemplos positivos y negativos en bloques con el estilo de
 * subrayado de la familia aplicado al tramo que la dispara»), antes de `astro
 * dev` y de `astro build` (predev y prebuild en web/package.json). Escribe
 * web/src/catalogo/tramos-de-ejemplos.json, que no se versiona (.gitignore):
 * por regla, por cada ejemplo positivo, el inicio y el fin de cada señal.
 *
 * Los tramos los da el motor, con el detector de la regla sobre el ejemplo
 * solo (detectar y analizarTexto), como el juez de los ejemplos del motor
 * (motor/src/ejemplos.spec.ts): analizar() no aplica las reglas a un texto de
 * menos de 100 palabras, y los ejemplos son frases. Con las mismas que ese
 * juez deja aparte, sin tramo: las estadísticas (miran el texto entero), las
 * de ausencia (señalan lo que falta) y las que van por género (desde la
 * Tanda 4, con sinTramo de src/catalogo/ejemplos.ts, la que usa la ficha
 * para decir por qué no hay tramo).
 *
 * El script importa esos dos módulos del motor por su ruta (motor/src/), no
 * por el paquete: no están en los «exports» de motor/package.json, y el motor
 * no se toca en este encargo. Corre en Node, fuera de Vite: el motor del
 * navegador no puede entrar en el frontmatter del catálogo (src/catalogo/
 * paquetes.ts, el aviso de silabea.cjs con `npm run dev`).
 *
 * [DOC] https://docs.npmjs.com/cli/v11/using-npm/scripts — «Pre & Post
 *    Scripts»: npm ejecuta `predev` antes de `dev` y `prebuild` antes de
 *    `build`.
 * [DOC] https://nodejs.org/api/typescript.html — «Node.js can run TypeScript
 *    files that contain only erasable TypeScript syntax».
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analizarTexto } from '../../motor/src/texto.ts';
import { detectar } from '../../motor/src/analisis.ts';
import type { Paquete } from '../../motor/src/paquete.ts';
import { FICHEROS } from '../src/pantalla/cargar.ts';
import { sinTramo } from '../src/catalogo/ejemplos.ts';

const ORIGEN = new URL('../../paquetes/', import.meta.url);
const SALIDA = new URL('../src/catalogo/tramos-de-ejemplos.json', import.meta.url);

/** Por regla que marca tramo, por cada ejemplo positivo, los tramos [inicio, fin] de sus señales. */
const tramos: Record<string, [number, number][][]> = {};
for (const fichero of FICHEROS) {
  const paquete = JSON.parse(readFileSync(new URL(fichero, ORIGEN), 'utf8')) as Paquete;
  for (const regla of paquete.reglas) {
    if (sinTramo(regla) !== null) continue;
    tramos[regla.id] = regla.ejemplos.positivos.map((ejemplo) => detectar(regla, analizarTexto(ejemplo)).map((s): [number, number] => [s.inicio, s.fin]));
  }
}
writeFileSync(SALIDA, `${JSON.stringify(tramos)}\n`);
console.log(`tramos de los ejemplos de ${Object.keys(tramos).length} reglas en ${fileURLToPath(SALIDA)}`);
