/**
 * El package.json de la web (11.1, censo pre-despliegue, firmado por Antonio).
 *
 *   1. Hallazgo 12: todo paquete que nombra el código de la web está declarado en sus dependencias. Se buscan los
 *      import y export … from, los import de efecto y los import() en web/src, web/scripts, web/jueces y
 *      astro.config.mjs, también los de tipo del JSDoc, que van en comentarios (el tipo del plugin de Vite en
 *      astro.config.mjs); fuera los relativos y los de Node (node:). `vite` llegaba de rebote, como dependencia de
 *      astro: si astro cambiara de Vite, o npm dejara de subirlo a la raíz de node_modules, `npm run tipos` fallaría
 *      sin haber tocado nada.
 *   2. Hallazgo 19: predev y prebuild eran la misma cadena, copiada. Ahora los dos llaman al mismo script de npm, y
 *      solo a él: lo que se genera antes de `astro dev` y de `astro build` se define una vez.
 *
 * [DOC] https://docs.npmjs.com/cli/v11/configuring-npm/package-json#devdependencies — «If someone is planning on
 *    downloading and using your module in their program, then they probably don't want or need to download and build
 *    the external test or documentation framework that you use»: lo que solo se usa al construir, en devDependencies.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const WEB = new URL('../', import.meta.url);
const paquete = JSON.parse(readFileSync(new URL('package.json', WEB), 'utf8')) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

/** Los ficheros de código de la web: web/src, web/scripts, web/jueces y astro.config.mjs. */
function codigo(): { ruta: string; texto: string }[] {
  const de = (carpeta: string): string[] =>
    readdirSync(new URL(carpeta, WEB), { recursive: true, encoding: 'utf8' })
      .map((f) => `${carpeta}${f.replaceAll('\\', '/')}`)
      .filter((f) => /\.(ts|mts|mjs|astro)$/.test(f));
  return [...de('src/'), ...de('scripts/'), ...de('jueces/'), 'astro.config.mjs'].map((ruta) => ({ ruta, texto: readFileSync(new URL(ruta, WEB), 'utf8') }));
}

/** El paquete de un especificador: «@ámbito/nombre» o «nombre», sin la ruta de dentro; null si es relativo o de Node. */
function paqueteDe(especificador: string): string | null {
  if (/^(\.|\/|node:)/.test(especificador)) return null;
  const partes = especificador.split('/');
  return especificador.startsWith('@') ? partes.slice(0, 2).join('/') : partes[0]!;
}

describe('el package.json de la web', () => {
  test('1 · todo paquete que nombra el código de la web está declarado en sus dependencias', () => {
    const declarados = new Set([...Object.keys(paquete.dependencies ?? {}), ...Object.keys(paquete.devDependencies ?? {})]);
    const nombrados = new Map<string, string>();
    for (const { ruta, texto } of codigo()) {
      for (const m of texto.matchAll(/(?:\bfrom\s+|\bimport\s+|\bimport\(\s*)['"]([^'"]+)['"]/g)) {
        const nombre = paqueteDe(m[1]!);
        if (nombre !== null && !nombrados.has(nombre)) nombrados.set(nombre, ruta);
      }
    }
    assert.ok(nombrados.has('astro') && nombrados.has('@radiografia/motor'), `los paquetes nombrados: ${[...nombrados.keys()].join(', ')}`);
    assert.deepEqual(
      [...nombrados].filter(([nombre]) => !declarados.has(nombre)).map(([nombre, ruta]) => `${nombre} (${ruta})`),
      [],
      'paquetes que nombra el código de la web y no declara web/package.json',
    );
  });

  test('2 · predev y prebuild son una sola definición: los dos llaman al mismo script, y solo a él', () => {
    const scripts = paquete.scripts ?? {};
    const llamada = (script: string | undefined): string | undefined => /^npm run ([\w:-]+)$/.exec(script ?? '')?.[1];
    const predev = llamada(scripts['predev']);
    const prebuild = llamada(scripts['prebuild']);
    assert.ok(predev !== undefined && predev === prebuild, `predev («${scripts['predev']}») y prebuild («${scripts['prebuild']}») no llaman al mismo script`);
    assert.match(scripts[predev] ?? '', /\S/, `el script ${predev}, vacío`);
  });
});
