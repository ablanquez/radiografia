/**
 * Escribe web/src/estilos/tokens.css desde docs/figma/tokens.json (encargo
 * 10.4, Tanda 1), antes de `astro dev` y de `astro build` (predev y prebuild en
 * web/package.json, como copiar-paquetes.ts). La conversión está en tokens.ts.
 * web/src/estilos/tokens.css no se versiona (.gitignore): la fuente es el JSON.
 *
 * [DOC] https://docs.npmjs.com/cli/v11/using-npm/scripts — «Pre & Post
 *    Scripts»: npm ejecuta `predev` antes de `dev` y `prebuild` antes de
 *    `build`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hojaDeTokens, tokensACss } from './tokens.ts';

const JSON_DE_TOKENS = new URL('../../docs/figma/tokens.json', import.meta.url);
const HOJA = new URL('../src/estilos/tokens.css', import.meta.url);

const json = JSON.parse(readFileSync(JSON_DE_TOKENS, 'utf8')) as Record<string, unknown>;
writeFileSync(HOJA, hojaDeTokens(json));
console.log(`${tokensACss(json).length} tokens en ${fileURLToPath(HOJA)}`);
