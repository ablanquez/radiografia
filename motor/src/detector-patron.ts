/**
 * El detector de patrón (encargo 4.1; punto 4 del plan): formas y/o una
 * expresión regular, sobre cada palabra o sobre la frase entera. Devuelve
 * señales, no puntos: pesos y puntuación son del 4.2.
 *
 * La regla que protege los desplazamientos (encargo 4.1, tras la parada
 * intermedia): una señal lleva SIEMPRE el [inicio, fin) del texto original.
 *
 *   · Ámbito «palabra»: se normaliza cada palabra, y solo para compararla,
 *     con `normalizar`:
 *       minusculas → toLocaleLowerCase("es");
 *       tildes     → normalize("NFD"), fuera SOLO el acento agudo (U+0301,
 *                    COMBINING ACUTE ACCENT) y normalize("NFC").
 *     [DOC] https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 *     — «NFD»: «Canonical Decomposition»; «NFC»: «Canonical Decomposition,
 *     followed by Canonical Composition»; y cambia la LONGITUD de la cadena
 *     (su ejemplo: «ñ» pasa de 1 a 2 unidades). Por eso lo normalizado solo
 *     se compara: la señal lleva la posición y el texto de la palabra ORIGINAL.
 *     Tras NFD, «á» es «a» + U+0301, «ñ» es «n» + U+0303 (virgulilla) y «ü»
 *     es «u» + U+0308 (diéresis): se quita la primera marca y se conservan las
 *     otras dos. NFC vuelve a unir «n» + U+0303 en «ñ», así que da igual cómo
 *     venga escrita la «ñ» (precompuesta o descompuesta).
 *     Por qué solo el agudo (encargo 4.2, cabo 1 del 4.1):
 *     [DOC] RAE, «Principales novedades de la última edición de la Ortografía
 *     de la lengua española (2010)»,
 *     https://www.rae.es/sites/default/files/Principales_novedades_de_la_Ortografia_de_la_lengua_espanola.pdf
 *     — «El abecedario del español queda así reducido a las veintisiete
 *     letras siguientes: a, b, c, d, e, f, g, h, i, j, k, l, m, n, ñ, o, p, q,
 *     r, s, t, u, v, w, x, y, z.» La «ñ» es una letra, no una «n» con tilde.
 *     La diéresis no aparece en ese documento. Que la Ortografía la trate como
 *     signo diacrítico distinto de la tilde: [DOC, NO LEÍDA] la sección «Signos
 *     diacríticos», https://www.rae.es/ortografía/signos-diacríticos (403 al
 *     abrirla, 30/09; solo el resumen del buscador: en español actual son dos,
 *     la tilde y la diéresis).
 *     Las formas se normalizan con las mismas opciones que la palabra (los dos
 *     lados igual). Una palabra casa si está entre las formas o si la regex la
 *     acepta (probada sobre la palabra normalizada; con minúsculas se le añade
 *     la bandera «i»).
 *   · Ámbito «frase»: la regex corre sobre la frase ORIGINAL tal cual, sin
 *     normalizar; con minúsculas se añade la bandera «i»; las tildes no se
 *     aplican (el autor escribe las variantes en la regex; lo dice el $comment
 *     del esquema). Una señal por coincidencia; las coincidencias vacías no
 *     cuentan.
 *   · La bandera «g» la pone el detector (el esquema solo admite i, m, s, u).
 *   · Solo párrafos de prosa (texto.ts). `indiceParrafo` es su posición en
 *     `texto.parrafos` (contando los de no-prosa, para poder volver a él);
 *     `indiceFrase`, la posición de la frase DENTRO de su párrafo.
 *
 * [PROPIO] En ámbito «frase» se usa solo la regex. Si una regla de ámbito
 *    «frase» no la trae, el detector lo dice con un error en vez de no
 *    señalar nada en silencio (el esquema permite formas sin regex en
 *    cualquier ámbito; propuesto para el paso 2 del validador).
 */
import type { Texto } from './texto.ts';

export interface ParametrosPatron {
  formas?: string[];
  regex?: string;
  flags?: string;
  ambito: 'palabra' | 'frase';
  normalizar: { minusculas: boolean; tildes: boolean };
}

export interface ReglaDePatron {
  id: string;
  parametros: ParametrosPatron;
}

export interface Senal {
  reglaId: string;
  inicio: number;
  fin: number;
  fragmento: string;
  indiceFrase: number;
  indiceParrafo: number;
}

function normalizador({ minusculas, tildes }: ParametrosPatron['normalizar']): (s: string) => string {
  return (s) => {
    let r = minusculas ? s.toLocaleLowerCase('es') : s;
    if (tildes) r = r.normalize('NFD').replaceAll('\u0301', '').normalize('NFC');
    return r;
  };
}

/** Las banderas de la regex: las de la regla, más «i» si hay minúsculas, más las que pida el uso. */
function banderas(p: ParametrosPatron, extra: string): string {
  let f = p.flags ?? '';
  if (p.normalizar.minusculas && !f.includes('i')) f += 'i';
  return f + extra;
}

export function detectarPatron(regla: ReglaDePatron, texto: Texto): Senal[] {
  const p = regla.parametros;
  const senales: Senal[] = [];

  if (p.ambito === 'palabra') {
    const normalizar = normalizador(p.normalizar);
    const formas = new Set((p.formas ?? []).map(normalizar));
    const regex = p.regex === undefined ? null : new RegExp(p.regex, banderas(p, ''));
    texto.parrafos.forEach((parrafo, indiceParrafo) => {
      if (!parrafo.prosa) return;
      parrafo.frases.forEach((frase, indiceFrase) => {
        for (const palabra of frase.palabras) {
          const n = normalizar(palabra.texto);
          if (formas.has(n) || (regex !== null && regex.test(n))) {
            senales.push({ reglaId: regla.id, inicio: palabra.inicio, fin: palabra.fin, fragmento: palabra.texto, indiceFrase, indiceParrafo });
          }
        }
      });
    });
    return senales;
  }

  if (p.regex === undefined) throw new Error(`regla ${regla.id}: el ámbito «frase» necesita una regex`);
  const regex = new RegExp(p.regex, banderas(p, 'g'));
  texto.parrafos.forEach((parrafo, indiceParrafo) => {
    if (!parrafo.prosa) return;
    parrafo.frases.forEach((frase, indiceFrase) => {
      for (const m of frase.texto.matchAll(regex)) {
        if (m[0].length === 0) continue;
        const inicio = frase.inicio + m.index;
        senales.push({ reglaId: regla.id, inicio, fin: inicio + m[0].length, fragmento: m[0], indiceFrase, indiceParrafo });
      }
    });
  });
  return senales;
}
