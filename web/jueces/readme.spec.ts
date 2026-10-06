/**
 * El juez del README (encargo 11.4): la portada del repositorio, que se lee en frío, dice lo que se puede comprobar en el
 * repositorio y en la web publicada.
 *
 *   1. Lleva las secciones acordadas, en su orden, y la cabecera: el nombre, el eslogan, que analiza estilo y no
 *      demuestra autoría, la demo y el catálogo, la versión en preparación y la licencia.
 *   2. Cada enlace relativo (también el de una imagen) del README y de los cinco documentos que salieron de él en el 11.4
 *      lleva a un fichero o a una carpeta del repositorio, y su ancla, a un título de ese fichero, como la calcula GitHub.
 *   3. Sus cifras son las de hoy: los tests de la suite, los del motor y los de la web, contados sin correrlos
 *      (contar-tests.ts); las páginas de dist/; las reglas, por paquete y por nivel de evidencia; los géneros calibrados;
 *      y la tasa de falsos positivos de la validación (data/calibracion/validacion.json).
 *   4. El paquete de ejemplo del README entra en la web como un paquete propio (leerPaquetePropio, el camino del botón),
 *      y cada ejemplo de su regla hace lo que dice, con su detector, como en motor/src/ejemplos.spec.ts; y el error que
 *      cita es el que da la web con paquete-prueba-invalido.json.
 *   5. Con URL_PRODUCCION, cada URL pública del README responde, siguiendo sus redirecciones, con un 2xx.
 *
 * El tamaño del trozo de pdfmake que dicen el README y docs/WEB.md lo vigila el juez 14 de construccion.spec.ts.
 * Importa dos módulos del motor por su ruta (texto.ts y analisis.ts), como web/scripts/tramos-de-ejemplos.ts: las
 * funciones que hacen falta no están en los exports del motor.
 *
 * [DOC] https://github.com/Flet/github-slugger (index.js y script/generate-regex.js) — el ancla de un título: en
 *    minúsculas, `value.replace(regex, '').replace(/ /g, '-')`, donde la expresión quita las categorías Unicode
 *    Other_Number, la puntuación salvo el guion normal («All except a normal `-` (dash)») y la de conexión, Symbol,
 *    Control, Private_Use, Format, Unassigned y los separadores salvo el espacio, menos lo alfabético; y si el ancla se
 *    repite, «originalSlug + '-' + self.occurrences[originalSlug]».
 * [DOC] https://nodejs.org/api/globals.html#class-file — File, global en Node: el fichero que lee leerPaquetePropio.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analizarTexto } from '../../motor/src/texto.ts';
import { detectar } from '../../motor/src/analisis.ts';
import type { Paquete } from '../../motor/src/paquete.ts';
import { leerPaquetePropio } from '../src/pantalla/propios.ts';
import { construir, DIST, EJEMPLOS_PUBLICOS, ENTORNO, motorDelNavegador, PAQUETES_DE_PRUEBA, paquetesIncluidos, URL_PRODUCCION } from './apoyo.ts';
import { ficherosDe } from '../publicacion/publicacion.ts';

const RAIZ = new URL('../../', import.meta.url);
const leer = (ruta: string): string => readFileSync(new URL(ruta, RAIZ), 'utf8');
const README = 'README.md';
/** Los documentos que salieron del README en el 11.4 (decisión de Antonio del 06/10). */
const SALIDOS_DEL_README = ['docs/ARRANQUE-LOCAL.md', 'docs/DESPLIEGUE.md', 'docs/WEB.md', 'docs/CALIBRACION.md', 'docs/CRONICA-DE-CONSTRUCCION.md'];

/** Las secciones acordadas en el encargo 11.4, con la forma de los README de Linaje, ZetaBus y Desplázame. */
const SECCIONES = [
  'Qué hace',
  'Qué no demuestra, y por qué',
  'Capturas',
  'Cómo está hecho',
  'Cómo ejecutarlo y probarlo',
  'Cómo escribir un paquete propio',
  'Reglas y evidencia',
  'Accesibilidad y diseño',
  'Estado y nevera',
  'Licencia y créditos',
];

/** El Markdown sin los bloques de código: ni sus «#» son títulos ni sus corchetes, enlaces. */
const sinBloques = (md: string): string => md.replace(/^```[^\n]*\n[\s\S]*?^```$/gm, '');

/** El texto de un título como lo pinta GitHub: sin imágenes, los enlaces por su texto, sin código ni énfasis. */
const textoDelTitulo = (titulo: string): string =>
  titulo
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*]/g, '')
    .trim();

/** El ancla de un título, como github-slugger. */
const ancla = (titulo: string): string =>
  textoDelTitulo(titulo)
    .toLowerCase()
    .replace(/[\p{No}\p{P}\p{S}\p{C}\p{Z}]/gu, (c) => (c === '-' || c === ' ' || /\p{Pc}/u.test(c) || /\p{Alphabetic}/u.test(c) ? c : ''))
    .replace(/ /g, '-');

/** Las anclas de los títulos de un Markdown, con su sufijo cuando se repiten. */
function anclasDe(md: string): Set<string> {
  const vistas = new Map<string, number>();
  const anclas = new Set<string>();
  for (const [, titulo] of sinBloques(md).matchAll(/^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/gm)) {
    const base = ancla(titulo!);
    const veces = vistas.get(base);
    anclas.add(veces === undefined ? base : `${base}-${veces + 1}`);
    vistas.set(base, (veces ?? 0) + 1);
  }
  return anclas;
}

/** Los destinos de los enlaces y de las imágenes de un Markdown, fuera de los bloques de código. */
function destinosDe(md: string): string[] {
  const texto = sinBloques(md);
  return [
    ...[...texto.matchAll(/\]\(([^)\s]+)(?:[ \t]+"[^"]*")?\)/g)].map((m) => m[1]!),
    ...[...texto.matchAll(/<(?:img|a)\b[^>]*?\b(?:src|href)="([^"]+)"/g)].map((m) => m[1]!),
    ...[...texto.matchAll(/<(https?:\/\/[^>\s]+)>/g)].map((m) => m[1]!),
  ];
}

/** El texto como se lee: un salto de línea dentro de un párrafo es un espacio, y la cita de un párrafo no lleva «> ». */
const enUnaLinea = (md: string): string => md.replace(/^>[ \t]?/gm, '').replace(/\s+/g, ' ');

/** Las secciones de nivel 2 de un Markdown, en su orden. */
const seccionesDe = (md: string): string[] => [...sinBloques(md).matchAll(/^## (.+)$/gm)].map((m) => m[1]!.trim());

/** Un número escrito a la española («1.703», «2,1») como número. */
const numero = (escrito: string): number => Number(escrito.replace(/\./g, '').replace(',', '.'));
/** Un número como lo escribe el README: con punto de millares. */
const millares = (n: number): string => n.toLocaleString('es-ES', { useGrouping: 'always' } as Intl.NumberFormatOptions);
/** Una proporción en tanto por ciento con un decimal, como la escribe el README: «2,1 %». */
const porCiento = (p: number): string => `${(Math.round(p * 1000) / 10).toFixed(1).replace('.', ',')} %`;

/**
 * Los tests de una suite, contados con node --test sin correr ninguno (contar-tests.ts). Sin NODE_TEST_CONTEXT, la marca
 * que node --test pone a cada fichero de jueces que lanza: con ella, el node --test de aquí dentro se cree dentro de un
 * test y no corre nada (visto el 06/10: «node:test run() is being called recursively within a test file. skipping running
 * files.»). [PROPIO: la variable no está en la documentación de Node; es la que lee su runner.]
 */
function testsDe(carpeta: string, patrones: string[]): number {
  const precarga = new URL('./contar-tests.ts', import.meta.url).href;
  const entorno = Object.fromEntries(Object.entries(ENTORNO).filter(([nombre]) => nombre !== 'NODE_TEST_CONTEXT'));
  const r = spawnSync(process.execPath, ['--import', precarga, '--test', '--test-concurrency=1', ...patrones], { cwd: fileURLToPath(new URL(carpeta, RAIZ)), env: entorno, encoding: 'utf8' });
  const m = /^ℹ tests (\d+)$/m.exec(r.stdout);
  assert.ok(m !== null && r.status === 0, `la cuenta de ${carpeta}: salida ${r.status}\n${r.stdout.slice(-2000)}\n${r.stderr.slice(-2000)}`);
  assert.match(r.stdout, /^ℹ pass 0$/m, `en ${carpeta} corrió algún test: la cuenta no los omite todos`);
  return Number(m![1]);
}

describe('el README', () => {
  test('1 · lleva las secciones acordadas, en su orden, y la cabecera: nombre, eslogan, que no demuestra autoría, la demo, el catálogo, la versión y la licencia', () => {
    const readme = leer(README);
    assert.deepEqual(seccionesDe(readme), SECCIONES);
    const cabecera = readme.slice(0, readme.indexOf('\n## '));
    for (const dicho of [
      '# RadiografIA',
      '**A contraluz se nota todo.**',
      'Analiza estilo. No demuestra autoría.',
      '(https://radiografia.antonioblanquez.es)',
      '(https://radiografia.antonioblanquez.es/reglas/)',
      'versi%C3%B3n-1.0.0%20en%20preparaci%C3%B3n',
      'licencia-Apache%202.0',
    ])
      assert.ok(enUnaLinea(cabecera).includes(dicho), `la cabecera no dice «${dicho}»`);
  });

  test('2 · cada enlace relativo del README y de los documentos que salieron de él lleva a algo del repositorio, y su ancla, a un título', () => {
    const mal: string[] = [];
    let vistos = 0;
    for (const documento of [README, ...SALIDOS_DEL_README]) {
      const md = leer(documento);
      for (const destino of destinosDe(md)) {
        if (/^(https?:|mailto:)/.test(destino)) continue;
        vistos++;
        const [ruta, anclaDicha] = destino.split('#') as [string, string | undefined];
        const fichero = ruta === '' ? documento : posix.normalize(posix.join(posix.dirname(documento), decodeURIComponent(ruta)));
        if (fichero.startsWith('..') || !existsSync(new URL(fichero, RAIZ))) {
          mal.push(`${documento}: «${destino}» no lleva a nada (${fichero})`);
          continue;
        }
        if (anclaDicha !== undefined && fichero.endsWith('.md') && !anclasDe(leer(fichero)).has(decodeURIComponent(anclaDicha)))
          mal.push(`${documento}: «${destino}», ${fichero} no tiene ese título`);
      }
    }
    assert.ok(vistos > 150, `${vistos} enlaces relativos`);
    assert.deepEqual(mal, []);
  });

  test('3 · sus cifras son las de hoy: tests del motor y de la web, páginas, reglas por paquete y por evidencia, géneros y falsos positivos', () => {
    const readme = leer(README);
    const texto = enUnaLinea(readme);
    construir();
    const paginas = ficherosDe(fileURLToPath(DIST)).filter((f) => f.endsWith('.html')).length;
    const [radiografia, correcto] = paquetesIncluidos();
    const reglas = radiografia!.reglas.length + correcto!.reglas.length;
    const generos = Object.keys(radiografia!.cabecera.calibracion!['_total-radiografia']!).length;

    const cifras = /\*\*(\d+) reglas · (\d+) paquetes · (\d+) géneros calibrados · (\d+) páginas · nada sale del navegador\*\*/.exec(texto);
    assert.ok(cifras !== null, 'la línea de cifras de la cabecera');
    assert.deepEqual(cifras!.slice(1).map(numero), [reglas, 2, generos, paginas], 'reglas, paquetes, géneros y páginas');
    assert.deepEqual(
      [/\*\*RadiografIA\*\*, (\d+) reglas/.exec(texto)?.[1], /\*\*Español correcto\*\*, (\d+) avisos/.exec(texto)?.[1]].map((x) => numero(x ?? 'NaN')),
      [radiografia!.reglas.length, correcto!.reglas.length],
      'las reglas de cada paquete',
    );

    const porNivel = new Map<string, number>();
    for (const r of [...radiografia!.reglas, ...correcto!.reglas]) porNivel.set(r.nivelEvidencia, (porNivel.get(r.nivelEvidencia) ?? 0) + 1);
    const tabla = new Map<string, number>();
    for (const [, nivel, cuantas] of readme.matchAll(/^\| «([^»]+)» \|.*\| (\d+) \|$/gm)) tabla.set(nivel!, numero(cuantas!));
    assert.deepEqual(tabla, porNivel, 'la tabla de niveles de evidencia');

    const validacion = JSON.parse(leer('data/calibracion/validacion.json')) as { generos: Record<string, { conjunto: { n: number; fpr: { documentos: number; proporcion: number } } }> };
    const conjuntos = Object.values(validacion.generos).map((g) => g.conjunto);
    const n = conjuntos.reduce((s, c) => s + c.n, 0);
    const falsos = conjuntos.reduce((s, c) => s + c.fpr.documentos, 0);
    const [menor, mayor] = [...conjuntos].sort((a, b) => a.fpr.proporcion - b.fpr.proporcion).filter((_, i, todos) => i === 0 || i === todos.length - 1);
    for (const dicho of [`${porCiento(falsos / n)} (${falsos} de ${millares(n)})`, porCiento(menor!.fpr.proporcion), `${porCiento(mayor!.fpr.proporcion)} (${mayor!.fpr.documentos} de ${mayor!.n})`])
      assert.ok(texto.includes(dicho), `el README no dice «${dicho}» (data/calibracion/validacion.json)`);

    const suite = /`npm test` corre \*\*([\d.]+) tests\*\*: ([\d.]+) del motor y ([\d.]+) de la web/.exec(texto);
    assert.ok(suite !== null, 'la frase con los tests de la suite');
    const motor = testsDe('motor/', ['src/**/*.spec.ts', 'herramientas/**/*.spec.ts']);
    const web = testsDe('web/', ['jueces/**/*.spec.ts']);
    assert.deepEqual(suite!.slice(1).map(numero), [motor + web, motor, web], 'los tests: en total, del motor y de la web');
  });

  test('4 · el paquete de ejemplo entra como un paquete propio y sus ejemplos hacen lo que dicen; el error que cita es el de la web', async () => {
    const readme = leer(README);
    const seccion = readme.slice(readme.indexOf('\n## Cómo escribir un paquete propio'));
    const bloque = /^```json\n([\s\S]*?)^```$/m.exec(seccion)?.[1];
    assert.ok(bloque !== undefined, 'el bloque JSON del paquete de ejemplo');
    const { validarPaquete } = await motorDelNavegador();
    const leido = await leerPaquetePropio(new File([bloque!], 'mi-paquete.json'), paquetesIncluidos(), [], validarPaquete);
    assert.equal(leido.problema, null, `no entra: ${JSON.stringify(leido.problema)}`);
    const paquete = leido.paquete as Paquete;
    const mal: string[] = [];
    for (const regla of paquete.reglas) {
      for (const ejemplo of regla.ejemplos.positivos) if (detectar(regla, analizarTexto(ejemplo)).length === 0) mal.push(`${regla.id}: no dispara en «${ejemplo}»`);
      for (const ejemplo of regla.ejemplos.negativos) if (detectar(regla, analizarTexto(ejemplo)).length > 0) mal.push(`${regla.id}: dispara en «${ejemplo}»`);
    }
    assert.deepEqual(mal, []);

    const invalido = await leerPaquetePropio(new File([readFileSync(new URL(PAQUETES_DE_PRUEBA.invalido, EJEMPLOS_PUBLICOS))], PAQUETES_DE_PRUEBA.invalido), paquetesIncluidos(), [], validarPaquete);
    assert.ok(invalido.problema !== null && invalido.problema.mensajes.length > 0, 'el paquete inválido no entra');
    for (const mensaje of invalido.problema!.mensajes) assert.ok(enUnaLinea(seccion).includes(`\`${mensaje}\``), `el README no cita el error de la web: ${mensaje}`);
  });

  test('5 · cada URL pública del README responde', { skip: URL_PRODUCCION === undefined ? 'sin URL_PRODUCCION: las URL del README se piden con la web publicada (URL_PRODUCCION=https://radiografia.antonioblanquez.es npm test, en web/)' : false }, async () => {
    const urls = [...new Set(destinosDe(leer(README)).filter((d) => /^https?:/.test(d)))];
    assert.ok(urls.length > 5, `${urls.length} URL`);
    const mal: string[] = [];
    for (const url of urls) {
      try {
        const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30_000) });
        await r.arrayBuffer();
        if (!r.ok) mal.push(`${url}: ${r.status}`);
      } catch (fallo) {
        mal.push(`${url}: ${(fallo as Error).message}`);
      }
    }
    assert.deepEqual(mal, []);
  });
});
