/**
 * Los jueces de los tokens de diseño en CSS (encargo 10.4, Tanda 1):
 *
 *   1. La hoja generada tiene un token por cada uno del JSON, con el nombre
 *      de su ruta, y ninguno de más; los colores opacos llevan el hex del
 *      JSON, y un caso de cada tipo sale con el valor escrito aquí a mano.
 *   2. La conversión no adivina: un alias, un tipo que no conoce, un hex
 *      que no casa con sus componentes o una dimension en em la paran.
 *   3. web/src/estilos/tokens.css, la que sirve la web, es la generada (la
 *      escribe el prebuild del build de apoyo.ts), y las páginas
 *      construidas llevan todos los tokens.
 *   4. Ningún color suelto en web/src fuera de tokens.css: ni hex, ni rgb(),
 *      ni hsl(), ni un nombre de color como valor en el CSS.
 *   5. Desde el 11.1 (hallazgo 9 del censo pre-despliegue, firmado por
 *      Antonio): cada token de los grupos radio y espacio, que solo usa el
 *      CSS (ningún TS los lee), tiene su var() en web/src; y ningún
 *      border-radius de web/src/estilos va a mano: o un var(--radio-…), o 0.
 *      Los dos radios del tramo iban a 2px habiendo --radio-tramo, y
 *      espacio.rejilla y espacio.paso, informativos, no los usaba nada.
 *
 * [DOC] https://www.designtokens.org/tr/2025.10/format/ — un token es un
 *    objeto con $value (§ 5.1); los grupos son los demás objetos.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { hojaDeTokens, nombreCss, tokensACss } from '../scripts/tokens.ts';
import { construir, DIST } from './apoyo.ts';

const JSON_DE_TOKENS = new URL('../../docs/figma/tokens.json', import.meta.url);
const HOJA = new URL('../src/estilos/tokens.css', import.meta.url);
const SRC = new URL('../src/', import.meta.url);

type Nodo = Record<string, unknown>;
const leerJson = (): Nodo => JSON.parse(readFileSync(JSON_DE_TOKENS, 'utf8')) as Nodo;

/** Las rutas de los tokens del JSON, recorridas aquí y no con el conversor. */
function rutas(nodo: Nodo, ruta: string[] = []): string[][] {
  if ('$value' in nodo) return [ruta];
  return Object.entries(nodo)
    .filter(([clave, hijo]) => !clave.startsWith('$') && typeof hijo === 'object' && hijo !== null)
    .flatMap(([clave, hijo]) => rutas(hijo as Nodo, [...ruta, clave]));
}

/** Las custom properties de una hoja: nombre → valor. */
const propiedades = (css: string): Map<string, string> => new Map([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));

describe('los tokens de diseño en CSS', () => {
  test('1 · un token por cada uno del JSON y ninguno de más, con su valor', () => {
    const json = leerJson();
    const hoja = propiedades(hojaDeTokens(json));
    const esperados = rutas(json).map((r) => nombreCss(r));
    assert.deepEqual([...hoja.keys()].sort(), [...esperados].sort(), 'las custom properties frente a los tokens del JSON');
    assert.equal(hoja.size, 110, 'tokens.json tiene 110 tokens: 112 desde la ampliación del 04/10, menos espacio.rejilla y espacio.paso desde el 11.1');
    // Los colores opacos, con el hex que dice el propio JSON.
    const colores = json['color'] as Record<string, Nodo>;
    for (const [nombre, token] of Object.entries(colores)) {
      if (nombre.startsWith('$')) continue;
      const v = token['$value'] as { hex: string; alpha?: number };
      if (v.alpha === undefined) assert.equal(hoja.get(`--color-${nombre}`), v.hex, `--color-${nombre}`);
    }
    // Un caso de cada tipo, a mano.
    const A_MANO: Readonly<Record<string, string>> = {
      '--color-ink': '#1a1a1a',
      '--color-tinte-lexico': '#dbebf4',
      '--color-velo': 'rgb(0 0 0 / 0.4)',
      '--color-ink-2-50': 'rgb(74 74 74 / 0.5)',
      '--subrayado-discurso-grosor': '3px',
      '--subrayado-sintaxis-estilo': 'dashed',
      '--tipografia-font-family-texto': 'Literata, Georgia, serif',
      '--tipografia-font-family-ui': "'Atkinson Hyperlegible Next', system-ui, sans-serif",
      '--tipografia-tamano-titulo-pantalla': '28px',
      '--tipografia-interlineado-cuerpo': '1.5',
      '--tipografia-interletrado-marca': '-0.025em',
      '--medida-columna-texto': '34em',
      '--medida-toque': '44px',
      '--radio-boton': '6px',
      '--foco-color': '#332288',
      '--sombra-suave': '0px 1px 2px 0px rgb(0 0 0 / 0.08)',
      '--impresion-tamano-url': '9.5pt',
      '--impresion-margen-horizontal': '18mm',
    };
    for (const [nombre, valor] of Object.entries(A_MANO)) assert.equal(hoja.get(nombre), valor, nombre);
  });

  test('2 · la conversión no adivina: alias, tipo desconocido, hex que no casa o dimension en em', () => {
    const color = (hex: string) => ({ colorSpace: 'srgb', components: [0, 0, 0], hex });
    assert.throws(() => tokensACss({ a: { $type: 'color', $value: '{color.ink}' } }), /alias/);
    assert.throws(() => tokensACss({ a: { $type: 'gradient', $value: [] } }), /no se convierte/);
    assert.throws(() => tokensACss({ a: { $type: 'color', $value: color('#000001') } }), /no casan/);
    assert.throws(() => tokensACss({ a: { $type: 'dimension', $value: { value: 34, unit: 'em' } } }), /px o rem/);
    assert.deepEqual(tokensACss({ g: { $type: 'color', a: { $value: color('#000000') } } }), [{ ruta: 'g.a', nombre: '--g-a', valor: '#000000' }], 'el tipo, heredado del grupo');
  });

  test('3 · tokens.css es la generada, y las páginas construidas llevan todos los tokens', () => {
    construir();
    const json = leerJson();
    assert.equal(readFileSync(HOJA, 'utf8'), hojaDeTokens(json), 'web/src/estilos/tokens.css frente a la conversión del JSON');
    const nombres = tokensACss(json).map((t) => t.nombre);
    for (const pagina of ['index.html', 'reglas/index.html']) {
      const html = readFileSync(new URL(pagina, DIST), 'utf8');
      const enlazadas = [...html.matchAll(/<link rel="stylesheet" href="[^"]*\/_astro\/([^"]+\.css)"/g)].map((m) => readFileSync(new URL(`_astro/${m[1]}`, DIST), 'utf8'));
      const css = [html, ...enlazadas].join('\n');
      assert.deepEqual(nombres.filter((n) => !css.includes(`${n}:`)), [], `${pagina}: tokens que no llegan`);
    }
  });

  test('5 · cada token de radio y de espacio, con su var() en web/src; ningún border-radius a mano', () => {
    const json = leerJson();
    const css = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
      .map((f) => f.replaceAll('\\', '/'))
      .filter((f) => /\.(css|astro|ts)$/.test(f) && f !== 'estilos/tokens.css')
      .map((f) => ({ f, texto: readFileSync(new URL(f, SRC), 'utf8') }));
    const todo = css.map((x) => x.texto).join('\n');
    const nombres = rutas(json)
      .filter((r) => r[0] === 'radio' || r[0] === 'espacio')
      .map((r) => nombreCss(r));
    assert.ok(nombres.length > 10, `${nombres.length} tokens de radio y espacio`);
    assert.deepEqual(nombres.filter((n) => !todo.includes(`var(${n})`)), [], 'tokens de radio y espacio sin su var() en web/src');
    const aMano = css
      .filter(({ f }) => f.endsWith('.css'))
      .flatMap(({ f, texto }) => [...texto.matchAll(/border-radius:\s*([^;]+);/g)].map((m) => [f, m[1]!.trim()] as const))
      .filter(([, valor]) => valor !== '0' && !/var\(--radio-/.test(valor))
      .map(([f, valor]) => `${f}: ${valor}`);
    assert.deepEqual(aMano, [], 'radios a mano en web/src/estilos');
  });

  test('4 · ningún color suelto en web/src fuera de tokens.css', () => {
    const ficheros = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
      .map((f) => f.replaceAll('\\', '/'))
      .filter((f) => /\.(css|astro|ts)$/.test(f) && f !== 'estilos/tokens.css');
    const NOMBRES = /:\s*[^;{}]*\b(white|black|gray|grey|red|green|blue|yellow|orange|purple|silver)\b/gi;
    const sueltos = ficheros.flatMap((f) => {
      const texto = readFileSync(new URL(f, SRC), 'utf8');
      // El CSS de un .astro, en sus <style> de la plantilla: fuera el frontmatter (sus comentarios citan «<style>») y los comentarios de CSS.
      const plantilla = texto.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
      const css = (f.endsWith('.css') ? texto : f.endsWith('.astro') ? [...plantilla.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]!).join('\n') : '').replace(
        /\/\*[\s\S]*?\*\//g,
        '',
      );
      return [
        ...[...texto.matchAll(/#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/gi)].map((m) => `${f}: ${m[0]}`),
        ...[...css.matchAll(NOMBRES)].map((m) => `${f}: ${m[0].trim()}`),
      ];
    });
    assert.deepEqual(sueltos, []);
  });
});
