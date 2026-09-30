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
 *       tildes     → normalize("NFD") y fuera las marcas \p{M}.
 *     [DOC] https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 *     — «NFD»: «Canonical Decomposition»; y cambia la LONGITUD de la cadena
 *     (su ejemplo: «ñ» pasa de 1 a 2 unidades). Por eso lo normalizado solo
 *     se compara: la señal lleva la posición y el texto de la palabra ORIGINAL.
 *     [DOC] \p{M} (marcas, General_Category M) con la bandera «u»:
 *     https://developer.mozilla.org/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape
 *     Las formas se normalizan igual. Una palabra casa si está entre las formas
 *     o si la regex la acepta (probada sobre la palabra normalizada; con
 *     minúsculas se le añade la bandera «i»).
 *     ⚠️ Quitar \p{M} quita también la virgulilla de la «ñ» y la diéresis de
 *     la «ü»: con tildes: true, «año» y «ano» son la misma forma (juez `todo`
 *     en detector-patron.spec.ts). Es la regla del encargo, tal cual.
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
    if (tildes) r = r.normalize('NFD').replace(/\p{M}/gu, '');
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
