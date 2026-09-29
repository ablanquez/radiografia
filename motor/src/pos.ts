/**
 * Etiquetado morfosintáctico (POS) con es-compromise, y su medida contra una
 * referencia de oro (encargo 3.3; punto 3 del plan: decisión de librerías).
 *
 * Las reglas que lo necesitan (CANDIDATAS.md): L6/L7/S10 (proporción de
 * adjetivos, adverbios y pronombres, medidas en español en ROBOT-TALK), S6,
 * S11, el filtrado de S4/S12, E4 y E16. Por eso el conjunto reducido es:
 *
 *     ADJ · ADV · PRON · VERB · NOUN · OTRO
 *
 * ── Mapeo de la referencia: UPOS → reducido ──────────────────────────────
 * [DOC] UPOS: https://universaldependencies.org/u/pos/index.html
 *   ADJ → ADJ        ADV → ADV        PRON → PRON
 *   VERB → VERB      AUX → VERB  (encargo 3.3: el auxiliar cuenta como verbo)
 *   NOUN → NOUN      PROPN → NOUN  [PROPIO] el nombre propio es una clase de
 *                    sustantivo; es-compromise lo marca igual (ProperNoun es
 *                    subetiqueta de Noun), así que los dos lados coinciden
 *   DET → OTRO  (encargo 3.3: el determinante NO es pronombre)
 *   ADP, CCONJ, SCONJ, NUM, PART, INTJ, SYM, X → OTRO
 *   PUNCT → no se evalúa  [PROPIO] es-compromise no hace términos de la
 *                    puntuación (la guarda en `pre`/`post` del término vecino),
 *                    así que no hay nada que comparar
 *
 * ── Mapeo de es-compromise → reducido ────────────────────────────────────
 * [DOC] Etiquetas de es-compromise 0.3.1, leídas en su código
 *   (node_modules/es-compromise/src/01-one/tagset/tags/*.js; el README no las
 *   lista): cada término lleva VARIAS etiquetas jerárquicas (p. ej.
 *   `Noun, ProperNoun, Place`; `Noun, Pronoun`; `Verb, Auxiliary`). Se mira
 *   en este ORDEN y gana la primera que aparezca:
 *   1. Pronoun → PRON   (va antes que Noun: en su tagset `Pronoun` es `Noun`)
 *   2. Verb → VERB      (Auxiliary, Copula, Modal, Gerund, Infinitive… son Verb)
 *   3. Adjective → ADJ
 *   4. Adverb → ADV
 *   5. Noun → NOUN      (incluye ProperNoun, Person, Place, Organization…)
 *   6. cualquier otra → OTRO (Determiner, Preposition, Conjunction, Value,
 *      QuestionWord, Expression…)
 *   [PROPIO] el orden. QuestionWord («qué», «cuándo») cae en OTRO: su tagset no
 *   dice si es pronombre, adverbio o determinante, y no se le supone.
 *
 * ── Cómo se alinean los dos lados ─────────────────────────────────────────
 * [PROPIO] Por POSICIÓN en el texto, no por orden: un token de la referencia
 *   (con su `inicio` y su forma) se empareja con el término de es-compromise
 *   que empieza en el mismo carácter y tiene la misma longitud
 *   (`json({ offset: true })`), más los términos implícitos de longitud 0 que
 *   lo siguen (así expande es-compromise las contracciones: «del» → `del`
 *   Preposition + `''` Determiner, como AnCora: «de» + «el»).
 *   · Si el token no tiene término con esa posición → cada palabra suya cuenta
 *     como fallo, con etiqueta dada `—sin término—`.
 *   · Si el token tiene más palabras que términos (clíticos: «celebrarlos» =
 *     VERB + PRON en AnCora; es-compromise da un solo Verb) → las palabras que
 *     sobran cuentan como fallo, con etiqueta dada `—no la separa—`.
 *   No se ajusta la referencia a la librería.
 *
 * ── Qué se mide ───────────────────────────────────────────────────────────
 * Por categoría C (la definición del encargo 3.3):
 *     precisión(C) = aciertos en C / palabras de la referencia que son C
 * [PROPIO] Se calcula también, para leerla al lado, la proporción inversa
 *     aciertos en C / palabras a las que es-compromise dio C
 * porque la primera sola premia a quien etiquete C de más.
 * Global = aciertos / todas las palabras evaluadas (todas menos PUNCT).
 *
 * ── La capa propia sobre es-compromise (encargo 3.3, tras la parada) ─────
 * es-compromise solo daba, en DESARROLLO, ADJ 65,6 %, ADV 68,1 %, PRON 33,1 %.
 * Encima, tres piezas; se ajustaron SOLO sobre desarrollo y se congelaron
 * (commit propio) antes de abrir el fichero de PRUEBA.
 *
 * (1) PRON de lista cerrada: las formas que en el fichero de ENTRENAMIENTO de
 *     AnCora son PRON en ≥ 95 % de sus apariciones (data/pos/, CC BY 4.0; 52
 *     formas). Sale del recuento, no de una lista hecha a mano.
 *     [PROPIO] El recuento contradice en parte el encargo: de las doce formas
 *     que llamaba ambiguas, «se», «lo», «le», «les», «me», «te», «nos» y «os»
 *     son PRON en ≥ 95 % y entran en la lista por su propia regla; ambiguas de
 *     verdad quedan «que» (51,9 %), «la», «los» y «las» (≈ 2 %).
 * (2) PRON por contexto, mirando SOLO la etiqueta del vecino inmediato:
 *     · enclíticos: un verbo (para es-compromise) del que, quitando uno a tres
 *       pronombres átonos del final, queda un infinitivo o un gerundio, o que
 *       es-compromise marca como imperativo, se separa: verbo + PRON de
 *       longitud 0, como lo segmenta UD. [DOC] NGLE § 16.7c: «los enclíticos
 *       siguen —sin separación gráfica— al infinitivo (decirlo), al gerundio
 *       (diciéndolo), al imperativo (dilo, decilo)»; § 16.11 (secuencias de
 *       átonos: «dárselo»). https://www.rae.es/gramática/sintaxis/sintaxis-de-los-pronombres-átonos-pronombres-proclíticos-y-enclíticos
 *     · proclíticos ambiguos: «la», «los», «las» son PRON si el término
 *       SIGUIENTE es verbo para es-compromise. [DOC] NGLE § 16.7c: «los
 *       pronombres proclíticos preceden a las formas personales de los verbos».
 *     · «que» es PRON si el término ANTERIOR es nombre o pronombre: relativo
 *       con antecedente. [DOC] NGLE § 22.4 (los relativos quien, que y cual) y
 *       § 44.8 (el antecedente de las relativas).
 *       [PROPIO] NO se aplica la excepción del encargo «no tras lo»: en el
 *       entrenamiento de AnCora, el «que» de «lo que» es PRON 643 veces y otra
 *       cosa 4, y la NGLE lo trata como relativo (§ 22.4; § 44.7, relativas
 *       sin antecedente expreso). «es» y los verbos de habla ya quedan fuera
 *       por la condición principal. Y NO se añade «que tras determinante» («el
 *       que», PRON 380/380 en entrenamiento): el encargo dice «solo» nombre o
 *       pronombre.
 * (3) ADV: «no», «nunca», «jamás», «tampoco» y las formas en -mente (con algo
 *     delante de «mente»). [DOC] NGLE § 48.1d: «El adverbio de negación más
 *     característico es no. Son también adverbios negativos nunca, jamás,
 *     tampoco y nada»; § 7.14 «La derivación adverbial. Propiedades
 *     morfológicas de los adverbios en -mente». («nada» no se añade: el
 *     encargo no la nombra y en AnCora es sobre todo PRON.)
 */
import nlp from 'es-compromise';
import listaDePronombres from '../../data/pos/pronombres-ancora-train.json' with { type: 'json' };

export const CATEGORIAS = ['ADJ', 'ADV', 'PRON', 'VERB', 'NOUN'] as const;
export type Categoria = (typeof CATEGORIAS)[number];
export type Reducida = Categoria | 'OTRO';

/** Lo que se da cuando no hay término que comparar. */
export const SIN_TERMINO = '—sin término—';
export const NO_LA_SEPARA = '—no la separa—';
type Dada = Reducida | typeof SIN_TERMINO | typeof NO_LA_SEPARA;

const UPOS_A_REDUCIDA: Readonly<Record<string, Reducida | null>> = {
  ADJ: 'ADJ',
  ADV: 'ADV',
  PRON: 'PRON',
  VERB: 'VERB',
  AUX: 'VERB',
  NOUN: 'NOUN',
  PROPN: 'NOUN',
  DET: 'OTRO',
  ADP: 'OTRO',
  CCONJ: 'OTRO',
  SCONJ: 'OTRO',
  NUM: 'OTRO',
  PART: 'OTRO',
  INTJ: 'OTRO',
  SYM: 'OTRO',
  X: 'OTRO',
  PUNCT: null,
};

/** UPOS → reducido; `null` si no se evalúa (PUNCT). Una UPOS desconocida es un error, no un OTRO. */
export function reducirUpos(upos: string): Reducida | null {
  if (!(upos in UPOS_A_REDUCIDA)) throw new Error(`UPOS desconocida: ${upos}`);
  return UPOS_A_REDUCIDA[upos]!;
}

const ORDEN_ES_COMPROMISE: readonly [string, Reducida][] = [
  ['Pronoun', 'PRON'],
  ['Verb', 'VERB'],
  ['Adjective', 'ADJ'],
  ['Adverb', 'ADV'],
  ['Noun', 'NOUN'],
];

/** Etiquetas de un término de es-compromise → reducido. */
export function reducirEsCompromise(etiquetas: readonly string[]): Reducida {
  for (const [etiqueta, reducida] of ORDEN_ES_COMPROMISE) {
    if (etiquetas.includes(etiqueta)) return reducida;
  }
  return 'OTRO';
}

export interface Termino {
  texto: string;
  inicio: number;
  longitud: number;
  /** Las etiquetas que dio es-compromise (vacío en los términos que añade la capa). */
  etiquetas: string[];
  /** La categoría reducida final. */
  categoria: Reducida;
}

interface TerminoJson {
  text: string;
  tags: string[];
  offset: { start: number; length: number };
}

/** Los términos de es-compromise de un texto, en orden, con su posición: es-compromise SOLO. */
export function etiquetarConEsCompromise(texto: string): Termino[] {
  const oraciones = nlp(texto).json({ offset: true }) as { terms: TerminoJson[] }[];
  return oraciones.flatMap((o) =>
    o.terms.map((t) => ({
      texto: t.text,
      inicio: t.offset.start,
      longitud: t.offset.length,
      etiquetas: t.tags,
      categoria: reducirEsCompromise(t.tags),
    })),
  );
}

// ── La capa propia sobre es-compromise (encargo 3.3, tras la parada) ──────────

/** Pieza 1: formas que en AnCora (entrenamiento) son PRON en ≥ 95 % de sus apariciones. */
const PRONOMBRES = new Set(listaDePronombres.pronombres.map((p) => p.forma));

/**
 * Pieza 2: de las doce formas que el encargo llamaba ambiguas, las que el
 * recuento NO mete en la lista son las ambiguas de verdad: «que», «la», «los»,
 * «las». «que» tiene su regla propia; las otras tres, la del proclítico.
 */
const AMBIGUAS = listaDePronombres.ambiguasDelEncargo.map((a) => a.forma).filter((f) => !PRONOMBRES.has(f));
const PROCLITICOS_AMBIGUOS = new Set(AMBIGUAS.filter((f) => f !== 'que'));

/** Los pronombres átonos que pueden ir pegados al verbo, de más largo a más corto. */
const ENCLITICOS = ['los', 'las', 'les', 'nos', 'me', 'te', 'se', 'lo', 'la', 'le', 'os'] as const;

/** Pieza 3: adverbios negativos. */
const ADVERBIOS_NEGATIVOS = new Set(['no', 'nunca', 'jamás', 'tampoco']);

const sinTildes = (s: string): string => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Los enclíticos de un verbo en infinitivo, gerundio o imperativo, o `null` si
 * no los lleva. Se quitan del final uno, dos o tres, y vale el primer resto que
 * sea un infinitivo (-ar, -er, -ir) o un gerundio (-ndo), sin tildes (la tilde
 * que añade la enclisis: «dándo-se-lo»). Si es-compromise lo marca como
 * imperativo, vale quitarlos sin mirar el resto («haz-lo»).
 */
function encliticos(termino: Termino): string[] | null {
  if (!termino.etiquetas.includes('Verb')) return null;
  const imperativo = termino.etiquetas.includes('Imperative');
  let resto = termino.texto.toLowerCase();
  const quitados: string[] = [];
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    const clitico = ENCLITICOS.find((c) => resto.endsWith(c) && resto.length > c.length + 1);
    if (clitico === undefined) return null;
    resto = resto.slice(0, -clitico.length);
    quitados.unshift(clitico);
    const base = sinTildes(resto);
    if (/(ar|er|ir|ndo)$/.test(base) || imperativo) return quitados;
  }
  return null;
}

/**
 * es-compromise y, encima, la capa. Las tres piezas, en este orden:
 *   1. lista de pronombres y adverbios negativos o en -mente (el término solo);
 *      y enclíticos: se separan en términos de longitud 0 detrás del verbo,
 *      como hace UD («celebrarlos» → VERB + PRON);
 *   2. «la», «los», «las» son PRON si el término SIGUIENTE es verbo para
 *      es-compromise (proclítico);
 *   3. «que» es PRON si el término ANTERIOR es nombre o pronombre (relativo
 *      con antecedente); si no, lo que dijera es-compromise.
 * Cada regla mira el propio término o la etiqueta de su vecino inmediato, nada
 * más (encargo 3.3: sin parser).
 */
export function etiquetar(texto: string): Termino[] {
  const base = etiquetarConEsCompromise(texto);
  const salida: Termino[] = [];
  for (const termino of base) {
    const forma = termino.texto.toLowerCase();
    const clitos = encliticos(termino);
    if (PRONOMBRES.has(forma)) {
      salida.push({ ...termino, categoria: 'PRON' });
    } else if (ADVERBIOS_NEGATIVOS.has(forma) || (forma.length > 'mente'.length && forma.endsWith('mente'))) {
      salida.push({ ...termino, categoria: 'ADV' });
    } else if (clitos !== null) {
      salida.push({ ...termino, categoria: 'VERB' });
      for (const c of clitos) salida.push({ texto: c, inicio: termino.inicio + termino.longitud, longitud: 0, etiquetas: [], categoria: 'PRON' });
    } else {
      salida.push({ ...termino });
    }
  }
  for (let i = 0; i < salida.length; i++) {
    const t = salida[i]!;
    const forma = t.texto.toLowerCase();
    if (PROCLITICOS_AMBIGUOS.has(forma) && salida[i + 1]?.etiquetas.includes('Verb')) t.categoria = 'PRON';
  }
  for (let i = 1; i < salida.length; i++) {
    const t = salida[i]!;
    const anterior = salida[i - 1]!.categoria;
    if (t.texto.toLowerCase() === 'que' && (anterior === 'NOUN' || anterior === 'PRON')) t.categoria = 'PRON';
  }
  return salida;
}

export interface TokenDeReferencia {
  forma: string;
  inicio: number;
  upos: string[];
  palabras?: string[];
}

export interface FraseDeReferencia {
  sent_id: string;
  texto: string;
  tokens: TokenDeReferencia[];
}

export interface Medida {
  porCategoria: Record<Reducida, { oro: number; aciertos: number; dadas: number }>;
  global: { evaluadas: number; aciertos: number };
  /** Tokens de la referencia sin término de es-compromise en su posición. */
  tokensSinTermino: number;
  /** Cada fallo, contado: «forma (en minúsculas) · oro · dada». */
  fallos: Map<string, { forma: string; oro: Reducida; dada: Dada; veces: number }>;
}

export function medir(frases: readonly FraseDeReferencia[], etiquetar: (texto: string) => Termino[]): Medida {
  const vacia = () => ({ oro: 0, aciertos: 0, dadas: 0 });
  const medida: Medida = {
    porCategoria: { ADJ: vacia(), ADV: vacia(), PRON: vacia(), VERB: vacia(), NOUN: vacia(), OTRO: vacia() },
    global: { evaluadas: 0, aciertos: 0 },
    tokensSinTermino: 0,
    fallos: new Map(),
  };

  for (const frase of frases) {
    const terminos = etiquetar(frase.texto);
    for (const token of frase.tokens) {
      const i = terminos.findIndex((t) => t.inicio === token.inicio && t.longitud === token.forma.length);
      const grupo: Termino[] = [];
      if (i >= 0) {
        grupo.push(terminos[i]!);
        for (let k = i + 1; k < terminos.length && terminos[k]!.longitud === 0; k++) grupo.push(terminos[k]!);
      }
      const evaluables = token.upos.map((u, j) => ({ oro: reducirUpos(u), j })).filter((p) => p.oro !== null);
      if (i < 0 && evaluables.length > 0) medida.tokensSinTermino++;

      for (const { oro, j } of evaluables as { oro: Reducida; j: number }[]) {
        const termino = grupo[j];
        const dada: Dada = i < 0 ? SIN_TERMINO : termino === undefined ? NO_LA_SEPARA : termino.categoria;
        medida.porCategoria[oro].oro++;
        medida.global.evaluadas++;
        if (dada !== SIN_TERMINO && dada !== NO_LA_SEPARA) medida.porCategoria[dada].dadas++;
        if (dada === oro) {
          medida.porCategoria[oro].aciertos++;
          medida.global.aciertos++;
        } else {
          const forma = (token.palabras?.[j] ?? token.forma).toLowerCase();
          const clave = `${forma} · ${oro} · ${dada}`;
          const previo = medida.fallos.get(clave);
          if (previo) previo.veces++;
          else medida.fallos.set(clave, { forma, oro, dada, veces: 1 });
        }
      }
    }
  }
  return medida;
}
