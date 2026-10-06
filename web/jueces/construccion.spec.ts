/**
 * Los jueces de la web construida (encargo 6.2).
 *
 *   1. `npm run build` termina, con su prebuild (el standalone del motor y la
 *      copia de los paquetes a public/), y deja dist/index.html.
 *   2. dist/index.html lleva el botón «Pon tu texto a contraluz», la nota
 *      de autoría y lang="es". Desde el 11.1 (hallazgo 8 del censo
 *      pre-despliegue), el botón sale de textos.ts y los dos avisos que lo
 *      citan (PAQUETES_CAMBIADOS y SIN_INFORME) lo dicen tal cual; y en el
 *      juez 8, la línea de quién es cada texto, también.
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
 *      algo va antes de ella: ningún script, ningún estilo ni ningún enlace.
 *      [DOC] https://www.w3.org/TR/CSP3/ — «policies in meta elements are
 *      not applied to content which precedes them».
 *      Desde el 10.4 (Tanda 1; decidido por Antonio el 04/10): la CSP va
 *      justo detrás de <meta charset>, porque la integración cspPrimero de
 *      astro.config.mjs recoloca ahí el <meta> que Astro escribe al final del
 *      <head>; su contenido es, carácter a carácter, el que emitió Astro (la
 *      integración escribe en la salida del build la huella sha256 de cada
 *      uno antes de moverlo, y aquí se compara con la de dist/). Hasta el
 *      10.4 se admitía delante <link rel="icon" href="data:,">; ya no hace
 *      falta ninguna excepción.
 *  10. Desde el 9.3 (firmado por Antonio en la parada previa: el aviso viaja
 *      dentro del JS, como con Ajv), el trozo de JS de dist/ que lleva pdfmake
 *      lleva entero web/terceros/pdfmake/avisos.txt, con una pieza por paquete
 *      de web/terceros/pdfmake/paquetes.json (lo escribe
 *      scripts/avisos-de-pdfmake.ts y lo pone astro.config.mjs), y
 *      THIRD-PARTY-NOTICES § 1.8 tiene una fila por pieza, con su versión y su
 *      licencia, y ninguna más. Ningún otro JS de dist/ lleva pdfmake.
 *  11. Desde el 11.1 (hallazgo 1 del censo pre-despliegue, firmado por
 *      Antonio: vía a), el JS de dist/ que lleva silabea lleva entero su
 *      aviso MIT: el LICENSE que copia la cabecera de
 *      motor/src/terceros/silabea.cjs (THIRD-PARTY-NOTICES § 1.5). Esa
 *      cabecera es un comentario «/*» y el minificado la quitaba: el código de
 *      silabea viajaba sin su aviso (docs/CENSO-PRE-DESPLIEGUE.md, § 10).
 *  12. Desde el 11.1 (hallazgo 2 del censo, firmado por Antonio), la página
 *      de créditos y licencias está en dist/creditos/index.html; el pie de
 *      cada página de dist/ la enlaza («Créditos y licencias»); y lleva, en su
 *      propio párrafo, la cita que exige la licencia tipo del BOE, literal la
 *      del NOTICES § 2.3, y el enlace a la sede del BOE que pide la misma
 *      condición («incluyendo en todo caso un enlace a la sede electrónica»,
 *      data/calibracion/LICENSE-CORPUS.md).
 *  13. Desde el 11.1 (hallazgo 18 del censo, firmado por Antonio), el trozo
 *      de JS del runtime de Rolldown (rolldown-runtime.*.js, uno solo) lleva
 *      entero el LICENSE de rolldown, el que instala vite: sus ayudantes de
 *      CommonJS son código de Rolldown, no generado del nuestro
 *      (astro.config.mjs, avisoDeRolldown).
 *  14. Desde el 11.1 (hallazgo 17 del censo, firmado por Antonio), el
 *      tamaño del trozo de pdfmake que dicen THIRD-PARTY-NOTICES § 1.1 y el
 *      README («Informe»), en MB con dos decimales y en KB con gzip (Node, a
 *      su nivel por defecto), es el del trozo de dist/: el NOTICES decía 359
 *      KB, de un build del 05/10, y el guardián del NOTICES cuenta cifras del
 *      lock, no tamaños.
 *  15. Desde el 11.1 (hallazgo 21 del censo, firmado por Antonio con el
 *      mismo trato que el 18), el trozo de JS que lleva la función de
 *      precarga de Vite (el único con «vite:preloadError»: Vite la mete desde
 *      el 9.3, por el import() de pdfmake) lleva entero el aviso MIT de Vite:
 *      la parte «Vite core license» del LICENSE.md de vite, el que instala la
 *      web (astro.config.mjs, avisoDeVite).
 *
 * El build, memorizado y con la telemetría apagada, y astro preview son los
 * de apoyo.ts (los comparte con textos-web.spec.ts y catalogo.spec.ts).
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { urlDeLosCreditos } from '../src/catalogo/catalogo.ts';
import { EJEMPLOS } from '../src/pantalla/ejemplos.ts';
import * as textos from '../src/textos.ts';
import { conPreview, construir, decodificar, DIST, motorDelNavegador, PAQUETES, PAQUETES_DE_PRUEBA } from './apoyo.ts';

const PUBLICOS = new URL('../public/ejemplos/', import.meta.url);

const BOTON = 'Pon tu texto a contraluz';
const NOTA = 'RadiografIA analiza estilo; no demuestra autoría.';
/** Desde el 10.4 (Tanda 2), los chips del modelo, con la misma función (formulario.spec.ts). */
const BOTONES_DE_EJEMPLO = [textos.TEXTO_HUMANO, textos.TEXTO_DE_IA];
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

/** Un texto línea a línea, sin la sangría, sin el « * » de las líneas de un comentario y sin espacios al final. */
function sinMarcasDeComentario(texto: string): string {
  return texto.replace(/\r\n/g, '\n').replace(/^[ \t]*\*?[ \t]?/gm, '').replace(/[ \t]+$/gm, '').trim();
}

/** El LICENSE de silabea, tal como lo copia la cabecera de motor/src/terceros/silabea.cjs (NOTICES § 1.5). */
function licenciaDeSilabea(): string {
  const fuente = readFileSync(new URL('../../motor/src/terceros/silabea.cjs', import.meta.url), 'utf8');
  const cabecera = /^\/\*([\s\S]*?)\*\//.exec(fuente)?.[1] ?? '';
  return sinMarcasDeComentario(cabecera.split('texto íntegro de su fichero LICENSE:')[1] ?? '');
}

/** El LICENSE de rolldown, el que instala vite (que es quien lo trae), como lo lee astro.config.mjs. */
function licenciaDeRolldown(): string {
  const desdeVite = createRequire(createRequire(new URL('../package.json', import.meta.url)).resolve('vite/package.json'));
  return readFileSync(new URL('LICENSE', pathToFileURL(desdeVite.resolve('rolldown/package.json'))), 'utf8').replace(/\r\n/g, '\n').trim();
}

/** La parte MIT del LICENSE.md de vite, el que instala la web: lo que va entre «# Vite core license» y la lista de lo que Vite lleva empaquetado. */
function licenciaDeVite(): string {
  const licencia = readFileSync(new URL('LICENSE.md', pathToFileURL(createRequire(new URL('../package.json', import.meta.url)).resolve('vite/package.json'))), 'utf8').replace(/\r\n/g, '\n');
  return (/^# Vite core license\n([\s\S]*?)\n# Licenses of bundled dependencies\n/.exec(licencia)?.[1] ?? '').trim();
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
    // Desde el 11.1 (hallazgo 8): el botón sale de textos.ts, y los dos avisos que lo citan, de esa misma constante.
    assert.equal(textos.PON_TU_TEXTO_A_CONTRALUZ, BOTON, 'el botón de la identidad, en textos.ts');
    assert.deepEqual([textos.PAQUETES_CAMBIADOS, textos.SIN_INFORME].filter((aviso) => !aviso.includes(`«${BOTON}»`)), [], 'avisos que no citan el botón');
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

  test('10 · el trozo de JS de pdfmake lleva entero el aviso de cada pieza que va dentro, y § 1.8 del NOTICES es su lista', () => {
    construir();
    const avisos = readFileSync(new URL('../terceros/pdfmake/avisos.txt', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
    const paquetes = JSON.parse(readFileSync(new URL('../terceros/pdfmake/paquetes.json', import.meta.url), 'utf8')) as { paquete: string; version: string; licencia: string }[];
    assert.deepEqual(
      paquetes.filter((x) => !avisos.includes(`=== ${x.paquete} ${x.version} · ${x.licencia}`)).map((x) => x.paquete),
      [],
      'piezas de paquetes.json sin su aviso en avisos.txt',
    );
    assert.equal([...avisos.matchAll(/^=== /gm)].length, paquetes.length, 'avisos de más en avisos.txt');
    // pdfmake, por un nombre de su código que la minificación no cambia: el método de su impresora.
    const conPdfmake = jsDeDist().filter(({ texto }) => texto.includes('createPdfKitDocument'));
    assert.equal(conPdfmake.length, 1, `los JS de dist/ con pdfmake: ${conPdfmake.map((x) => x.ruta).join(', ')}`);
    // Línea a línea y sin la sangría: el empaquetador se la quita a cada línea de un comentario (visto el 05/10: el
    // «              2016-2026 liborm85» del LICENSE de pdfmake llega como «2016-2026 liborm85»).
    const sinSangria = (texto: string): string => texto.replace(/\r\n/g, '\n').replace(/^[ \t]+/gm, '').trim();
    assert.ok(sinSangria(conPdfmake[0]!.texto).includes(sinSangria(avisos)), `${conPdfmake[0]!.ruta} no lleva avisos.txt entero`);
    const notices = readFileSync(new URL('../../THIRD-PARTY-NOTICES.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
    const seccion = /^### 1\.8 · [^\n]*\n([\s\S]*?)(?=^#{2,3} |(?![\s\S]))/m.exec(notices)?.[1] ?? '';
    assert.ok(seccion !== '', 'el NOTICES no tiene § 1.8');
    const filas = [...seccion.matchAll(/^\| `([^`]+)` \| ([^|]+?) \| ([^|]+?) \|/gm)].map((m) => `${m[1]} ${m[2]!.trim()} ${m[3]!.trim()}`);
    assert.deepEqual(filas.sort(), paquetes.map((x) => `${x.paquete} ${x.version} ${x.licencia}`).sort(), 'las filas de § 1.8 frente a paquetes.json');
  });

  test('11 · el JS de dist/ que lleva silabea lleva entero su aviso MIT, el de la cabecera de motor/src/terceros/silabea.cjs', () => {
    construir();
    const licencia = licenciaDeSilabea();
    assert.match(
      licencia,
      /^MIT License\n\nCopyright \(c\) 2018 Nicolás Cofré Méndez \(of the original library\)\nCopyright \(c\) 2018 Javier Arce \(of the node package and its tests\)\n\nPermission is hereby granted, /,
      'la cabecera de silabea.cjs no lleva el LICENSE que se copió el 29/09',
    );
    assert.match(licencia, /\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software\.\n/);
    // silabea, por un nombre de su código que la minificación no cambia: el método que exporta.
    const conSilabea = jsDeDist().filter(({ texto }) => texto.includes('getSilabas'));
    assert.ok(conSilabea.length > 0, 'ningún JS de dist/ lleva silabea');
    for (const { ruta, texto } of conSilabea) assert.ok(sinMarcasDeComentario(texto).includes(licencia), `${ruta} no lleva el aviso MIT de silabea entero`);
  });

  test('12 · la página de créditos está en dist/creditos/, el pie de cada página la enlaza, y lleva literal la cita del BOE del NOTICES y el enlace a su sede', () => {
    construir();
    assert.ok(existsSync(new URL('creditos/index.html', DIST)), 'no existe dist/creditos/index.html');
    const paginas = readdirSync(DIST, { recursive: true, encoding: 'utf8' })
      .map((f) => f.replaceAll('\\', '/'))
      .filter((f) => f.endsWith('.html'));
    const enlace = new RegExp(`<a href="${urlDeLosCreditos('/')}"[^>]*>${textos.CREDITOS_Y_LICENCIAS}</a>`);
    const sinEnlace = paginas.filter((pagina) => !enlace.test(/<footer class="pie">([\s\S]*?)<\/footer>/.exec(readFileSync(new URL(pagina, DIST), 'utf8'))?.[1] ?? ''));
    assert.deepEqual(sinEnlace, [], `páginas de dist/ (${paginas.length}) sin el enlace a los créditos en su pie`);
    const notices = readFileSync(new URL('../../THIRD-PARTY-NOTICES.md', import.meta.url), 'utf8');
    const cita = /Cita obligatoria: «([^»]+)»/.exec(notices)?.[1];
    assert.equal(cita, 'Basado en datos de la Agencia Estatal Boletín Oficial del Estado', 'la cita del BOE en el NOTICES § 2.3');
    const creditos = decodificar(readFileSync(new URL('creditos/index.html', DIST), 'utf8'));
    assert.ok(creditos.includes(`<p class="largo">${cita}</p>`), 'la página de créditos no lleva la cita del BOE literal, en su propio párrafo');
    assert.match(creditos, /<a href="https:\/\/www\.boe\.es">/, 'la página de créditos no enlaza la sede del BOE');
  });

  test('13 · el trozo del runtime de Rolldown lleva entero el LICENSE de rolldown', () => {
    construir();
    const licencia = licenciaDeRolldown();
    assert.match(licencia, /^MIT License\n\nCopyright \(c\) 2024-present VoidZero Inc\. & Contributors\n\nPermission is hereby granted, /, 'el LICENSE de rolldown no es el que se miró el 06/10');
    const runtime = jsDeDist().filter(({ ruta }) => /rolldown-runtime\.[\w-]+\.js$/.test(ruta));
    assert.equal(runtime.length, 1, `los trozos del runtime de Rolldown en dist/: ${runtime.map((x) => x.ruta).join(', ')}`);
    assert.ok(sinMarcasDeComentario(runtime[0]!.texto).includes(sinMarcasDeComentario(licencia)), `${runtime[0]!.ruta} no lleva el LICENSE de rolldown entero`);
  });

  test('14 · el NOTICES y el README dicen el tamaño del trozo de pdfmake que hay en dist/ («unos N MB» y «unos N KB» con gzip)', () => {
    construir();
    const pdfmake = jsDeDist().filter(({ texto }) => texto.includes('createPdfKitDocument'));
    assert.equal(pdfmake.length, 1, 'el trozo de pdfmake');
    const contenido = readFileSync(new URL(pdfmake[0]!.ruta.replaceAll('\\', '/'), DIST));
    const medido = [(contenido.length / 1e6).toFixed(2).replace('.', ','), String(Math.round(gzipSync(contenido).length / 1000))];
    for (const documento of ['THIRD-PARTY-NOTICES.md', 'README.md']) {
      // Las líneas, juntas y sin la marca de cita (el párrafo del NOTICES va en un «> »).
      const texto = readFileSync(new URL(`../../${documento}`, import.meta.url), 'utf8').replace(/^>[ \t]?/gm, '').replace(/\s+/g, ' ');
      const dichos = [...texto.matchAll(/unos (\d+,\d+) MB[,;] unos (\d+) KB (?:con gzip|comprimido con gzip)/g)].map((m) => [m[1]!, m[2]!]);
      assert.ok(dichos.length > 0, `${documento} no dice el tamaño del trozo de pdfmake`);
      for (const dicho of dichos) assert.deepEqual(dicho, medido, `${documento}: el trozo de pdfmake, en MB y en KB con gzip`);
    }
  });

  test('15 · el trozo que lleva la función de precarga de Vite lleva entero su aviso MIT (la parte «Vite core license» del LICENSE.md de vite)', () => {
    construir();
    const licencia = licenciaDeVite();
    assert.match(licencia, /^Vite is released under the MIT license:\n\nMIT License\n\nCopyright \(c\) 2019-present, VoidZero Inc\. and Vite contributors\n\nPermission is hereby granted, [\s\S]*\nSOFTWARE\.$/, 'la parte MIT del LICENSE.md de vite no es la que se miró el 06/10');
    const precarga = jsDeDist().filter(({ texto }) => texto.includes('vite:preloadError'));
    assert.equal(precarga.length, 1, `los trozos con la función de precarga de Vite en dist/: ${precarga.map((x) => x.ruta).join(', ')}`);
    assert.ok(sinMarcasDeComentario(precarga[0]!.texto).includes(sinMarcasDeComentario(licencia)), `${precarga[0]!.ruta} no lleva entero el aviso MIT de Vite`);
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
    assert.equal(textos.PROCEDENCIA_DE_LOS_EJEMPLOS, PROCEDENCIA, 'de quién es cada texto, en textos.ts (11.1, hallazgo 8)');
  });

  test("9 · cada página de dist/ lleva la CSP con connect-src 'self' y form-action 'self', justo detrás de <meta charset> y con el contenido que emitió Astro", () => {
    const salida = construir();
    const paginas = readdirSync(DIST, { recursive: true, encoding: 'utf8' })
      .map((f) => f.replaceAll('\\', '/'))
      .filter((f) => f.endsWith('.html'));
    assert.ok(paginas.length > 1, `dist/ tiene ${paginas.length} páginas HTML`);
    // La huella del contenido de cada <meta> tal como lo emitió Astro, antes de que la integración lo recolocara.
    // El logger de Astro colorea la etiqueta con códigos ANSI («ESC[34m»): fuera antes de leer.
    const sinColor = salida.replace(/\u001b\[[0-9;]*m/g, '');
    const emitidas = new Map([...sinColor.matchAll(/\[radiografia-csp-primero\] (\S+\.html) ([0-9a-f]{64})/g)].map((m) => [m[1]!, m[2]!]));
    assert.deepEqual([...emitidas.keys()].sort(), [...paginas].sort(), 'las páginas que recolocó la integración, frente a las de dist/');
    const mal = paginas.flatMap((pagina) => {
      const html = readFileSync(new URL(pagina, DIST), 'utf8');
      const meta = /<meta http-equiv="content-security-policy" content="([^"]*)">/i.exec(html);
      if (meta === null) return [`${pagina}: sin la CSP`];
      const directivas = decodificar(meta[1]!).split(';').map((d) => d.trim());
      const faltan = ["connect-src 'self'", "form-action 'self'"].filter((d) => !directivas.includes(d));
      const charset = /<meta charset="utf-8">/i.exec(html);
      const sitio = charset !== null && meta.index === charset.index + charset[0].length ? [] : [`${pagina}: la CSP no va justo detrás de <meta charset>`];
      // Lo que podría cargar algo antes de que la CSP aplique: un script, un estilo o un enlace.
      const antes = [...html.slice(0, meta.index).matchAll(/<script\b[^>]*>|<style\b[^>]*>|<link\b[^>]*>/gi)].map((m) => m[0]);
      const contenido = createHash('sha256').update(meta[1]!).digest('hex') === emitidas.get(pagina) ? [] : [`${pagina}: el contenido de la CSP no es el que emitió Astro`];
      return [...faltan.map((d) => `${pagina}: sin «${d}»`), ...sitio, ...antes.map((etiqueta) => `${pagina}: ${etiqueta} va antes de la CSP, y la CSP no le aplica`), ...contenido];
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
