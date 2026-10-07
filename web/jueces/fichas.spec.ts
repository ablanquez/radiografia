/**
 * Las fichas, con el mismo contenido antes y después del calco (encargo 10.4,
 * Tanda 3: «build genera las 50 fichas con el mismo contenido que hoy (huella
 * del texto por ficha antes y después: solo cambia la presentación)»).
 *
 * El contenido de una ficha es lo que trae de su paquete: el nombre, la frase
 * en claro, el id, el paquete con su versión y su descripción, la familia, el
 * detector, el peso, la severidad, el nivel de evidencia, lo que busca (cada
 * parámetro con su etiqueta), si es solo aviso, la explicación, la
 * sugerencia, las excepciones (o «Ninguna.»), el origen de la lista (o «sin
 * dato»), cada fuente con su título y su dirección, y cada ejemplo, tal cual.
 * Las etiquetas de la interfaz, el orden y el aspecto pueden cambiar; eso no.
 *
 * Cada pieza se busca en lo que la página da a leer: el texto de <main> sin lo
 * que va con aria-hidden (la muestra «Abc», las siglas voladitas), con los
 * blancos seguidos (espacio, tabulador, salto) contados como uno; las
 * direcciones de las fuentes, entre los href; y el detector, el peso, la
 * severidad, el nivel de evidencia y el paquete, como pareja de <dt> y <dd>
 * (la etiqueta puede llevar dos puntos detrás). La huella de una ficha es el
 * SHA-256 de la lista de sus piezas, cada una con su valor si está y «FALTA»
 * si no. La de referencia está en huellas-de-las-fichas.json, tomada del
 * build de la web en el commit que dice el fichero; se vuelve a tomar
 * (HUELLAS_DE_LAS_FICHAS=escribir) solo si cambia el contenido de un paquete,
 * nunca por el aspecto. Desde la release (07/10, encargo 11.5), la referencia
 * son las fichas con los paquetes en 1.0.0.
 *
 *   1. Ninguna ficha deja fuera una pieza de su contenido.
 *   2. La huella de cada ficha es la de referencia, y hay una por regla.
 *
 * [DOC] https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options
 *    — createHash('sha256').
 * [DOC] https://html.spec.whatwg.org/multipage/syntax.html#void-elements —
 *    los elementos vacíos (img, input, br, meta, link…) no tienen etiqueta de
 *    cierre.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import * as textos from '../src/textos.ts';
import { parametrosEnLlano, reglasDelCatalogo, type EntradaDelCatalogo } from '../src/catalogo/catalogo.ts';
import { nombreDeRegla } from '../src/pantalla/humanizar.ts';
import { construir, decodificar, DIST, paquetesIncluidos, WEB } from './apoyo.ts';

const HUELLAS = new URL('huellas-de-las-fichas.json', import.meta.url);
const VACIOS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** Una pieza del contenido: se busca en el texto, entre los href o como pareja <dt>/<dd>. */
type Pieza = { campo: string; valor: string; como: 'texto' | 'enlace' | 'par'; etiqueta?: string };

/** El contenido de la ficha de una regla, de su paquete. */
export function contenidoDeLaFicha({ regla, paquete, familia }: EntradaDelCatalogo): Pieza[] {
  const texto = (campo: string, valor: string): Pieza => ({ campo, valor, como: 'texto' });
  const par = (etiqueta: string, valor: string): Pieza => ({ campo: etiqueta, valor, como: 'par', etiqueta });
  return [
    texto('nombre', nombreDeRegla(regla.id, regla)),
    ...(regla.enClaro !== undefined ? [texto('frase en claro', regla.enClaro)] : []),
    texto('id', regla.id),
    par(textos.PAQUETE, textos.paqueteConVersion(paquete.nombre, paquete.version, paquete.descripcion)),
    texto('familia', familia.nombre),
    par(textos.DETECTOR, regla.detector),
    par(textos.PESO, new Intl.NumberFormat('es').format(regla.peso)),
    par(textos.SEVERIDAD, regla.severidad),
    par(textos.NIVEL_DE_EVIDENCIA, regla.nivelEvidencia),
    ...parametrosEnLlano(regla).flatMap((p) => [texto(`etiqueta de «${p.etiqueta}»`, p.etiqueta), texto(`valor de «${p.etiqueta}»`, p.valor)]),
    ...(regla.informativa === true || familia.informativa === true ? [texto('solo aviso', textos.INFORMATIVA)] : []),
    texto('explicación', regla.explicacion),
    texto('sugerencia', regla.sugerencia),
    ...(regla.excepciones.length === 0 ? [texto('excepciones', textos.NINGUNA)] : regla.excepciones.map((e, i) => texto(`excepción ${i + 1}`, e))),
    texto('origen de la lista', regla.origenLista ?? textos.SIN_DATO),
    ...regla.fuente.flatMap((f, i) => [texto(`fuente ${i + 1}`, f.titulo), { campo: `dirección de la fuente ${i + 1}`, valor: f.url, como: 'enlace' as const }]),
    ...regla.ejemplos.positivos.map((e, i) => texto(`ejemplo positivo ${i + 1}`, e)),
    ...regla.ejemplos.negativos.map((e, i) => texto(`ejemplo negativo ${i + 1}`, e)),
  ];
}

/** Los blancos seguidos de HTML (espacio, tabulador, saltos), uno; los demás (sin separación, estrecho, invisibles) se quedan. */
const blancos = (texto: string): string => texto.replace(/[ \t\n\r\f]+/g, ' ').trim();

/** Lo que <main> da a leer: su texto, sin scripts, estilos ni lo que va con aria-hidden, con las entidades decodificadas. */
export function textoLeido(html: string): string {
  const main = /<main\b[^>]*>([\s\S]*)<\/main>/.exec(html)?.[1] ?? '';
  let salida = '';
  let fuera = 0;
  const pila: boolean[] = [];
  let desde = 0;
  for (const m of main.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g)) {
    if (fuera === 0) salida += main.slice(desde, m.index);
    desde = m.index + m[0].length;
    const [, cierra, nombre, atributos] = m as unknown as [string, string, string, string];
    const etiqueta = nombre.toLowerCase();
    if (VACIOS.has(etiqueta) || atributos.trimEnd().endsWith('/')) continue;
    if (cierra === '/') {
      if (pila.pop() === true) fuera--;
      continue;
    }
    const oculto = etiqueta === 'script' || etiqueta === 'style' || /\saria-hidden="true"/.test(atributos);
    pila.push(oculto);
    if (oculto) fuera++;
  }
  if (fuera === 0) salida += main.slice(desde);
  return blancos(decodificar(salida));
}

const hrefs = (html: string): string[] => [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => decodificar(m[1]!));
const regex = (texto: string): string => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Cada pieza con su valor si la ficha la lleva y «FALTA» si no. */
export function piezasDeLaFicha(html: string, entrada: EntradaDelCatalogo): [string, string][] {
  const leido = textoLeido(html);
  const enlaces = hrefs(html);
  const pares = decodificar(html.replace(/<(dt|dd)\b[^>]*>/g, '<$1>'));
  return contenidoDeLaFicha(entrada).map((p) => {
    const esta =
      p.como === 'enlace'
        ? enlaces.includes(p.valor)
        : p.como === 'par'
          ? new RegExp(`<dt>\\s*${regex(p.etiqueta!)}:?\\s*</dt>\\s*<dd>\\s*${regex(p.valor)}\\s*</dd>`).test(pares)
          : leido.includes(blancos(p.valor));
    return [p.campo, esta ? p.valor : 'FALTA'];
  });
}

const huella = (piezas: readonly [string, string][]): string => createHash('sha256').update(JSON.stringify(piezas)).digest('hex');
const fichaConstruida = (id: string): string => readFileSync(new URL(`reglas/${id}/index.html`, DIST), 'utf8');

describe('las fichas, con el mismo contenido antes y después del calco', () => {
  const entradas = (): EntradaDelCatalogo[] => reglasDelCatalogo(paquetesIncluidos());

  test('1 · ninguna ficha deja fuera una pieza de su contenido', () => {
    construir();
    const faltan = entradas().flatMap((e) =>
      piezasDeLaFicha(fichaConstruida(e.regla.id), e)
        .filter(([, v]) => v === 'FALTA')
        .map(([campo]) => `${e.regla.id}: ${campo}`),
    );
    assert.deepEqual(faltan, []);
  });

  test('2 · la huella de cada ficha es la de referencia, y hay una por regla', () => {
    construir();
    const ahora = Object.fromEntries(entradas().map((e) => [e.regla.id, huella(piezasDeLaFicha(fichaConstruida(e.regla.id), e))]));
    if (process.env['HUELLAS_DE_LAS_FICHAS'] === 'escribir') {
      const commit = execSync('git rev-parse --short HEAD', { cwd: WEB, encoding: 'utf8' }).trim();
      const json = {
        $descripcion: `Las huellas del contenido de cada ficha (jueces/fichas.spec.ts), tomadas del build de la web en ${commit}, con los paquetes en 1.0.0 (release del 07/10, encargo 11.5). Se vuelven a tomar solo si cambia el contenido de un paquete, nunca por el aspecto.`,
        commit,
        huellas: ahora,
      };
      writeFileSync(HUELLAS, `${JSON.stringify(json, null, 2)}\n`);
    }
    const antes = (JSON.parse(readFileSync(HUELLAS, 'utf8')) as { huellas: Record<string, string> }).huellas;
    assert.deepEqual(Object.keys(antes).sort(), Object.keys(ahora).sort(), 'una huella por regla');
    assert.deepEqual(
      Object.keys(ahora).filter((id) => antes[id] !== ahora[id]),
      [],
      'fichas cuya huella no es la de referencia',
    );
  });
});
