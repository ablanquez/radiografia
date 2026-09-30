/**
 * Lo que comparten las métricas del registro (encargo 4.3): de qué parte del
 * texto sale cada una. Dos bases de cálculo, declaradas en la cabecera de cada
 * métrica:
 *
 *   · Métricas LÉXICAS y de FRASE: las palabras de los párrafos de prosa
 *     (texto.ts, Intl.Segmenter), en minúsculas con toLocaleLowerCase("es") y
 *     SIN normalizar tildes: «río» y «rio» son tipos distintos. [PROPIO] Las
 *     minúsculas, como lexical_diversity (lexical_diversity.py:23, commit
 *     d78d45f); TAALED no transforma nada: recibe las palabras ya preparadas
 *     por quien lo usa.
 *     Frases: las de los párrafos de prosa que tienen al menos una palabra.
 *     [PROPIO] Un segmento sin palabras («***», un emoji solo) no es una frase.
 *   · Métricas de PUNTUACIÓN: el TEXTO ORIGINAL de los párrafos de prosa (los
 *     signos no son palabras), sin normalizar.
 *
 * Toda métrica devuelve un número o null («no calculable»: faltan palabras,
 * frases o el denominador que pide su fórmula).
 */
import type { Frase, Texto } from '../texto.ts';

export type Metrica = (texto: Texto) => number | null;

const prosa = (texto: Texto) => texto.parrafos.filter((p) => p.prosa);

/** Las palabras de los párrafos de prosa, en orden y en minúsculas. */
export function palabrasDeProsa(texto: Texto): string[] {
  return prosa(texto).flatMap((p) => p.frases.flatMap((f) => f.palabras.map((w) => w.texto.toLocaleLowerCase('es'))));
}

/** Las frases de los párrafos de prosa que tienen al menos una palabra. */
export function frasesDeProsa(texto: Texto): Frase[] {
  return prosa(texto).flatMap((p) => p.frases.filter((f) => f.palabras.length > 0));
}

/** El texto original de cada párrafo de prosa. */
export function textosDeProsa(texto: Texto): string[] {
  return prosa(texto).map((p) => p.texto);
}

/**
 * Cuántos signos de `signos` hay en `texto` [PROPIO, encargo 4.3]:
 *   · «...» (tres puntos seguidos) cuenta como un signo, igual que «…»: son
 *     los puntos suspensivos escritos de dos maneras;
 *   · un signo entre dos cifras es parte de un número («3,5», «1.000»,
 *     «10:30») y no cuenta.
 */
export function contarSignos(texto: string, signos: ReadonlySet<string>): number {
  const t = texto.replaceAll('...', '…');
  let n = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i]!;
    if (!signos.has(c)) continue;
    if (/\d/.test(t[i - 1] ?? '') && /\d/.test(t[i + 1] ?? '')) continue;
    n++;
  }
  return n;
}
