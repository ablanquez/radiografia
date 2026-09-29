/**
 * Extrae las N primeras frases de un fichero CoNLL-U de UD_Spanish-AnCora con
 * sus etiquetas UPOS, para usarlas como referencia de oro del etiquetador POS
 * (encargo 3.3). Se ejecuta a mano, una vez; su salida se versiona en
 * data/referencia/ con su licencia al lado.
 *
 *   node herramientas/extraer-ancora.ts <fichero.conllu> <salida.json>
 *
 * La referencia es AJENA a la librería que se juzga: sale de la anotación
 * manual del treebank, no de es-compromise.
 *
 * [DOC] Formato CoNLL-U — https://universaldependencies.org/format.html:
 *    diez columnas separadas por tabulador (ID, FORM, LEMMA, UPOS, XPOS,
 *    FEATS, HEAD, DEPREL, DEPS, MISC); las frases se separan con una línea en
 *    blanco y empiezan con comentarios `#`, entre ellos `# sent_id =` y
 *    `# text =`. Un ID con rango («13-14») es un TOKEN MULTIPALABRA: la forma
 *    que aparece en el texto («al») y guiones bajos en el resto de columnas;
 *    debajo vienen sus palabras con ID entero («a» ADP, «el» DET). Un ID
 *    decimal («5.1») es un nodo vacío (elipsis), sin forma en el texto.
 * [DOC] Etiquetas UPOS — https://universaldependencies.org/u/pos/index.html:
 *    ADJ ADP ADV AUX CCONJ DET INTJ NOUN NUM PART PRON PROPN PUNCT SCONJ SYM
 *    VERB X. Aquí se guardan TAL CUAL: el paso al conjunto reducido
 *    (ADJ, ADV, PRON, VERB, NOUN, OTRO) se hace al evaluar (src/pos.ts), para
 *    que la referencia no se ajuste a nada.
 *
 * [PROPIO] La unidad que se guarda es el token del texto (lo que se ve), y
 *    dentro de él sus palabras sintácticas con su UPOS: un token normal tiene
 *    una; uno multipalabra («al», «dárselo») tiene varias. Los nodos vacíos se
 *    omiten: no están en el texto.
 * [PROPIO] Cada token lleva `inicio`, su posición en `texto`, buscada en orden
 *    de izquierda a derecha. La extracción comprueba que
 *    `texto.slice(inicio, inicio + forma.length) === forma`: si alguna forma no
 *    está en el texto tal cual, se para, no se inventa.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export interface TokenDeReferencia {
  forma: string;
  inicio: number;
  /** Las UPOS de sus palabras sintácticas, en orden. */
  upos: string[];
  /** Solo en los tokens multipalabra: las formas de sus palabras. */
  palabras?: string[];
}

export interface FraseDeReferencia {
  sent_id: string;
  texto: string;
  tokens: TokenDeReferencia[];
}

export function extraerFrases(conllu: string, cuantas: number): FraseDeReferencia[] {
  const frases: FraseDeReferencia[] = [];
  for (const bloque of conllu.split(/\r?\n\s*\r?\n/)) {
    if (frases.length === cuantas) break;
    const lineas = bloque.split(/\r?\n/).filter((l) => l.trim() !== '');
    if (lineas.length === 0) continue;

    const comentario = (clave: string): string | undefined =>
      lineas.find((l) => l.startsWith(`# ${clave} = `))?.slice(`# ${clave} = `.length);
    const sentId = comentario('sent_id');
    const texto = comentario('text');
    if (sentId === undefined || texto === undefined) throw new Error(`frase sin sent_id o text:\n${lineas[0]}`);

    const filas = lineas.filter((l) => !l.startsWith('#')).map((l) => l.split('\t'));
    const tokens: TokenDeReferencia[] = [];
    let cursor = 0;
    let multipalabraHasta = 0;
    for (const columnas of filas) {
      if (columnas.length !== 10) throw new Error(`${sentId}: línea con ${columnas.length} columnas`);
      const [id, forma, , upos] = columnas as [string, string, string, string];
      if (id.includes('.')) continue; // nodo vacío

      let token: TokenDeReferencia | undefined;
      const rango = /^(\d+)-(\d+)$/.exec(id);
      if (rango) {
        multipalabraHasta = Number(rango[2]);
        token = { forma, inicio: -1, upos: [], palabras: [] };
      } else if (Number(id) <= multipalabraHasta) {
        // una palabra de un token multipalabra: se añade al último token
        const ultimo = tokens[tokens.length - 1]!;
        ultimo.upos.push(upos);
        ultimo.palabras!.push(forma);
        continue;
      } else {
        token = { forma, inicio: -1, upos: [upos] };
      }

      const inicio = texto.indexOf(forma, cursor);
      if (inicio < 0) throw new Error(`${sentId}: «${forma}» no está en el texto a partir de ${cursor}`);
      token.inicio = inicio;
      cursor = inicio + forma.length;
      tokens.push(token);
    }
    for (const t of tokens) {
      if (texto.slice(t.inicio, t.inicio + t.forma.length) !== t.forma) throw new Error(`${sentId}: posición de «${t.forma}»`);
      if (t.upos.length === 0) throw new Error(`${sentId}: el token «${t.forma}» se quedó sin palabras`);
    }
    frases.push({ sent_id: sentId, texto, tokens });
  }
  if (frases.length !== cuantas) throw new Error(`el fichero tiene ${frases.length} frases y se pedían ${cuantas}`);
  return frases;
}

const [, , entrada, salida] = process.argv;
if (entrada !== undefined && salida !== undefined) {
  const bytes = readFileSync(entrada);
  const frases = extraerFrases(bytes.toString('utf8'), 100);
  const referencia = {
    fuente: {
      treebank: 'UD_Spanish-AnCora',
      version: 'r2.18',
      commit: '197cca385e0e7db1b1fe26a5772dade1b6fbbee8',
      fichero: 'es_ancora-ud-dev.conllu',
      url: 'https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/197cca385e0e7db1b1fe26a5772dade1b6fbbee8/es_ancora-ud-dev.conllu',
      sha256: createHash('sha256').update(bytes).digest('hex'),
      licencia: 'CC BY 4.0 (LICENSE-CC-BY-4.0.md, al lado de este fichero)',
      extraido: 'Las 100 primeras frases del fichero, en orden: texto, y por token su forma, su posición en el texto y las UPOS de sus palabras sintácticas. Sin lemas, rasgos ni dependencias.',
    },
    frases,
  };
  writeFileSync(salida, JSON.stringify(referencia, null, 1) + '\n');
  const tokens = frases.reduce((n, f) => n + f.tokens.length, 0);
  const palabras = frases.reduce((n, f) => n + f.tokens.reduce((m, t) => m + t.upos.length, 0), 0);
  console.log(`${frases.length} frases, ${tokens} tokens, ${palabras} palabras → ${salida}`);
}
