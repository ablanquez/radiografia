/**
 * Los jueces de la web construida (encargo 6.2).
 *
 *   1. `npm run build` termina, con su prebuild (el standalone del motor y la
 *      copia de los paquetes a public/), y deja dist/index.html.
 *   2. dist/index.html lleva el botón «Pon tu texto a contraluz», la nota
 *      de autoría y lang="es".
 *   3. Ningún JS de dist/ lleva el código de Ajv ni de Node: ni «Ajv2020»,
 *      ni «new Ajv», ni «addKeyword», ni «node:», y toda aparición de
 *      «ajv/dist» es ajv/dist/runtime/ucs2length, la función que el standalone
 *      lleva por diseño (THIRD-PARTY-NOTICES § 1.1). La palabra «Ajv» del
 *      aviso MIT no cuenta (firmado en la parada 1 del 6.2, punto 7).
 *   4. Los paquetes de dist/paquetes/ son, byte a byte, los de paquetes/: ni
 *      uno más ni uno menos.
 *   5. `astro preview` sirve dist/: 200 en / y 404 en /no-existe. Se arranca
 *      en un puerto libre, se le pide y se cierra.
 *   6. El JS de dist/ que lleva el validador lleva también, entero, el aviso
 *      MIT de Ajv: el LICENSE de ajv (docs/BITACORA.md, 2026-10-02: Vite 8
 *      quita los comentarios legales al minificar, y web/astro.config.mjs le
 *      pide que los conserve).
 *   7. dist/ejemplos/ lleva los dos textos de ejemplo, byte a byte los de
 *      public/ejemplos/, y estos están en UTF-8 sin BOM y con saltos \n
 *      (encargo 6.3, a, juez 1). Desde el 8.1 (firmado en la parada 1), también
 *      los dos paquetes de prueba del cargador: paquete-prueba.json valida, y
 *      paquete-prueba-invalido.json no, con un solo error: es el mismo paquete
 *      con un campo mal.
 *   8. dist/index.html lleva los dos botones de los ejemplos, que no envían
 *      el formulario, y la línea que dice de quién es cada texto (encargo 6.3,
 *      a, juez 4).
 *   9. Cada página HTML de dist/ lleva la CSP en su <meta http-equiv> con
 *      connect-src 'self' y form-action 'self' (encargo 8.1, b; firmado en la
 *      parada 1: web/astro.config.mjs, security.csp), y nada que pueda cargar
 *      algo va antes de ella: ningún script, ningún estilo ni ningún enlace
 *      que no sea data:.
 *      [DOC] https://www.w3.org/TR/CSP3/ — «policies in meta elements are
 *      not applied to content which precedes them».
 *      [PROPIO] Antes va, y se admite, <link rel="icon" href="data:,"> (6.2:
 *      sin él Chrome pide /favicon.ico): Astro pone la CSP al final de lo que
 *      escribimos en el <head>, y una URL data: no sale a la red (en la
 *      parada 1, CDP ni la registró como petición).
 *
 * El build, memorizado y con la telemetría apagada, y astro preview son los
 * de apoyo.ts (los comparte con textos-web.spec.ts y catalogo.spec.ts).
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { EJEMPLOS } from '../src/pantalla/ejemplos.ts';
import { conPreview, construir, decodificar, DIST, motorDelNavegador, PAQUETES, PAQUETES_DE_PRUEBA } from './apoyo.ts';

const PUBLICOS = new URL('../public/ejemplos/', import.meta.url);

const BOTON = 'Pon tu texto a contraluz';
const NOTA = 'RadiografIA analiza estilo; no demuestra autoría.';
const BOTONES_DE_EJEMPLO = ['Cargar ejemplo: texto humano', 'Cargar ejemplo: texto de IA'];
const PROCEDENCIA = 'El texto humano lo escribió Antonio; el de IA lo generó Claude Opus 5.5, sin instrucciones de estilo.';

/** Los .js de dist/, a cualquier profundidad, con su ruta relativa y su texto. */
function jsDeDist(): { ruta: string; texto: string }[] {
  return readdirSync(DIST, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.js'))
    .map((ruta) => ({ ruta, texto: readFileSync(new URL(ruta.replaceAll('\\', '/'), DIST), 'utf8') }));
}

/** El LICENSE de ajv, resuelto desde el motor, que es quien declara ajv. */
function licenciaDeAjv(): string {
  const desdeElMotor = createRequire(new URL('../../motor/package.json', import.meta.url));
  return readFileSync(desdeElMotor.resolve('ajv/LICENSE'), 'utf8').replace(/\r\n/g, '\n').trim();
}

describe('la web construida', () => {
  test('1 · npm run build termina, con su prebuild, y deja dist/index.html', () => {
    const salida = construir();
    assert.match(salida, /generado: /, `el prebuild no generó el standalone:\n${salida}`);
    assert.match(salida, /copiados a /, `el prebuild no copió los paquetes:\n${salida}`);
    assert.ok(existsSync(new URL('index.html', DIST)), `no existe web/dist/index.html:\n${salida}`);
  });

  test('2 · dist/index.html lleva el botón, la nota de autoría y lang="es"', () => {
    construir();
    const html = readFileSync(new URL('index.html', DIST), 'utf8');
    assert.match(html, /<html lang="es"/, 'sin lang="es"');
    assert.ok(html.includes(BOTON), `sin «${BOTON}»`);
    assert.ok(html.includes(NOTA), `sin «${NOTA}»`);
  });

  test('3 · ningún JS de dist/ lleva el código de Ajv ni de Node', () => {
    construir();
    const js = jsDeDist();
    assert.ok(js.length > 0, 'dist/ no tiene ningún JS');
    const hallados: string[] = [];
    for (const { ruta, texto } of js) {
      for (const prohibida of ['Ajv2020', 'new Ajv', 'addKeyword', 'node:']) if (texto.includes(prohibida)) hallados.push(`${ruta}: «${prohibida}»`);
      for (const m of texto.matchAll(/ajv\/dist\/[^"'`\s)]*/g)) if (!m[0].startsWith('ajv/dist/runtime/ucs2length')) hallados.push(`${ruta}: «${m[0]}»`);
    }
    assert.deepEqual(hallados, []);
  });

  test('4 · los paquetes de dist/paquetes/ son, byte a byte, los de paquetes/', () => {
    construir();
    const fuente = readdirSync(PAQUETES).filter((f) => f.endsWith('.json')).sort();
    assert.ok(fuente.length > 0, 'paquetes/ no tiene ningún JSON');
    assert.deepEqual(readdirSync(new URL('paquetes/', DIST)).sort(), fuente, 'los ficheros de dist/paquetes/');
    for (const f of fuente) {
      assert.ok(readFileSync(new URL(f, PAQUETES)).equals(readFileSync(new URL(`paquetes/${f}`, DIST))), `dist/paquetes/${f} no es paquetes/${f}`);
    }
  });

  test('6 · el JS de dist/ que lleva el validador lleva entero el aviso MIT de Ajv', () => {
    construir();
    const licencia = licenciaDeAjv();
    assert.match(licencia, /^The MIT License \(MIT\)\n\nCopyright \(c\) 2015-2021 Evgeny Poberezkin\n/, 'el LICENSE de ajv no es el que se miró el 02/10');
    const conValidador = jsDeDist().filter(({ texto }) => texto.includes('ucs2length'));
    assert.ok(conValidador.length > 0, 'ningún JS de dist/ lleva el validador standalone');
    for (const { ruta, texto } of conValidador) assert.ok(texto.replace(/\r\n/g, '\n').includes(licencia), `${ruta} no lleva el LICENSE de ajv entero`);
  });

  test('7 · dist/ejemplos/ lleva los dos textos de ejemplo y los dos paquetes de prueba, byte a byte los de public/ejemplos/, en UTF-8 sin BOM y con \\n', async () => {
    construir();
    const ficheros = [...Object.values(EJEMPLOS), ...Object.values(PAQUETES_DE_PRUEBA)].sort();
    assert.deepEqual(readdirSync(PUBLICOS).sort(), ficheros, 'los ficheros de public/ejemplos/');
    assert.deepEqual(readdirSync(new URL('ejemplos/', DIST)).sort(), ficheros, 'los ficheros de dist/ejemplos/');
    for (const f of ficheros) {
      const bytes = readFileSync(new URL(f, PUBLICOS));
      assert.ok(bytes.equals(readFileSync(new URL(`ejemplos/${f}`, DIST))), `dist/ejemplos/${f} no es public/ejemplos/${f}`);
      const texto = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
      assert.ok(!texto.startsWith('\uFEFF'), `public/ejemplos/${f} empieza con BOM`);
      assert.ok(!texto.includes('\r'), `public/ejemplos/${f} lleva \\r`);
    }
    const { validarPaquete } = await motorDelNavegador();
    const leer = (f: string): { reglas: { peso: unknown }[] } => JSON.parse(readFileSync(new URL(f, PUBLICOS), 'utf8'));
    const valido = leer(PAQUETES_DE_PRUEBA.valido);
    const invalido = leer(PAQUETES_DE_PRUEBA.invalido);
    assert.deepEqual(validarPaquete(valido).errores, [], `${PAQUETES_DE_PRUEBA.valido} no valida`);
    assert.deepEqual(
      validarPaquete(invalido).errores.map((e) => e.texto),
      ['regla "prueba-a-nivel-de" (reglas[0]) · campo "peso": tiene que ser número'],
      `${PAQUETES_DE_PRUEBA.invalido}: un solo error, el del peso`,
    );
    invalido.reglas[0]!.peso = valido.reglas[0]!.peso;
    assert.deepEqual(invalido, valido, `${PAQUETES_DE_PRUEBA.invalido} es ${PAQUETES_DE_PRUEBA.valido} con un solo campo cambiado`);
  });

  test('8 · dist/index.html lleva los dos botones de los ejemplos y de quién es cada texto', () => {
    construir();
    const html = readFileSync(new URL('index.html', DIST), 'utf8');
    for (const etiqueta of BOTONES_DE_EJEMPLO) {
      assert.match(html, new RegExp(`<button [^>]*type="button"[^>]*>${etiqueta}</button>`), `sin el botón «${etiqueta}» (type="button")`);
    }
    assert.ok(html.includes(PROCEDENCIA), `sin «${PROCEDENCIA}»`);
  });

  test("9 · cada página de dist/ lleva la CSP con connect-src 'self' y form-action 'self', antes de cualquier script o estilo", () => {
    construir();
    const paginas = readdirSync(DIST, { recursive: true, encoding: 'utf8' })
      .map((f) => f.replaceAll('\\', '/'))
      .filter((f) => f.endsWith('.html'));
    assert.ok(paginas.length > 1, `dist/ tiene ${paginas.length} páginas HTML`);
    const mal = paginas.flatMap((pagina) => {
      const html = readFileSync(new URL(pagina, DIST), 'utf8');
      const meta = /<meta http-equiv="content-security-policy" content="([^"]*)"/i.exec(html);
      if (meta === null) return [`${pagina}: sin la CSP`];
      const directivas = decodificar(meta[1]!).split(';').map((d) => d.trim());
      const faltan = ["connect-src 'self'", "form-action 'self'"].filter((d) => !directivas.includes(d));
      // Lo que podría cargar algo antes de que la CSP aplique: un script, un estilo o un enlace que no sea data:.
      const antes = [...html.slice(0, meta.index).matchAll(/<script\b[^>]*>|<style\b[^>]*>|<link\b[^>]*>/gi)]
        .map((m) => m[0])
        .filter((etiqueta) => !/^<link\b[^>]*\shref="data:/i.test(etiqueta));
      return [...faltan.map((d) => `${pagina}: sin «${d}»`), ...antes.map((etiqueta) => `${pagina}: ${etiqueta} va antes de la CSP, y la CSP no le aplica`)];
    });
    assert.deepEqual(mal, []);
  });

  test('5 · astro preview responde 200 en / y 404 en /no-existe', async () => {
    construir();
    await conPreview(async (url) => {
      assert.equal((await fetch(url)).status, 200, `GET ${url}`);
      assert.equal((await fetch(`${url}no-existe`)).status, 404, `GET ${url}no-existe`);
    });
  });
});
