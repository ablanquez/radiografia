/**
 * Los documentos de UD_Spanish-AnCora (encargo 5.5, género «noticia»): de
 * cada CoNLL-U se leen solo los comentarios `# newdoc id`, `# newpar`,
 * `# sent_id` y `# text`; las filas de tokens no hacen falta. Lo juzga
 * ancora.spec.ts.
 *
 * [DOC] https://universaldependencies.org/format.html — «The first sentence of
 *    a new document contains a comment that says # newdoc, which can be
 *    optionally followed by a document id»; lo mismo `# newpar` para los
 *    párrafos; `# text` es el texto de la frase tal como se escribió.
 * [DOC] README de UD_Spanish-AnCora (r2.18), changelog de la v2.9
 *    (2021-11-15): «Changed sentence ids to reflect the original AnCora
 *    documents», «Added document boundaries».
 * [PROPIO] El texto de un documento son los `# text` de sus frases unidos por
 *    un espacio, y un salto de línea en cada `# newpar` (r2.18 no trae
 *    ninguno: cada documento es un solo párrafo). Si una frase aparece antes
 *    de cualquier `# newdoc`, o su sent_id no es del documento abierto, o un id
 *    se repite, se para: no se inventan límites (encargo 5.5, suturas).
 * [PROPIO] El subcorpus es el prefijo del id, tal cual: 3LB-CAST,
 *    CESS-CAST-A, CESS-CAST-AA o CESS-CAST-P. Cualquier otro prefijo, para.
 */

export type Subcorpus = '3LB-CAST' | 'CESS-CAST-A' | 'CESS-CAST-AA' | 'CESS-CAST-P';

export interface DocumentoAncora {
  id: string;
  subcorpus: Subcorpus;
  /** El CoNLL-U del que sale (train, dev o test). */
  fichero: string;
  frases: number;
  texto: string;
}

const PREFIJO = /^(3LB-CAST|CESS-CAST-AA|CESS-CAST-A|CESS-CAST-P)-/;

interface Abierto {
  doc: DocumentoAncora;
  /** Las frases de cada párrafo. */
  parrafos: string[][];
}

function cerrar(abierto: Abierto | null, salida: DocumentoAncora[]): void {
  if (abierto === null) return;
  abierto.doc.texto = abierto.parrafos.filter((p) => p.length > 0).map((p) => p.join(' ')).join('\n');
  salida.push(abierto.doc);
}

export function documentosDeConllu(ficheros: readonly { fichero: string; texto: string }[]): DocumentoAncora[] {
  const documentos: DocumentoAncora[] = [];
  const vistos = new Map<string, string>();
  for (const { fichero, texto } of ficheros) {
    let actual: Abierto | null = null;
    let sentId: string | null = null;
    for (const linea of texto.split(/\r?\n/)) {
      if (linea.startsWith('# newdoc')) {
        cerrar(actual, documentos);
        const id = /^# newdoc id = (\S+)\s*$/.exec(linea)?.[1];
        if (id === undefined) throw new Error(`${fichero}: # newdoc sin id («${linea}»)`);
        const prefijo = PREFIJO.exec(id)?.[1] as Subcorpus | undefined;
        if (prefijo === undefined) throw new Error(`${fichero}: el documento ${id} no tiene un prefijo conocido`);
        const antes = vistos.get(id);
        if (antes !== undefined) throw new Error(`${fichero}: el documento ${id} está repetido (ya en ${antes})`);
        vistos.set(id, fichero);
        actual = { doc: { id, subcorpus: prefijo, fichero, frases: 0, texto: '' }, parrafos: [[]] };
      } else if (linea.startsWith('# newpar')) {
        actual?.parrafos.push([]);
      } else if (linea.startsWith('# sent_id = ')) {
        sentId = linea.slice('# sent_id = '.length).trim();
        if (actual === null) throw new Error(`${fichero}: la frase ${sentId} está sin # newdoc antes: no hay límites de documento`);
        if (!sentId.startsWith(`${actual.doc.id}-s`)) throw new Error(`${fichero}: la frase ${sentId} no es del documento abierto (${actual.doc.id})`);
      } else if (linea.startsWith('# text = ')) {
        if (actual === null) throw new Error(`${fichero}: una frase sin # newdoc antes (${sentId ?? 'sin sent_id'})`);
        actual.parrafos[actual.parrafos.length - 1]!.push(linea.slice('# text = '.length));
        actual.doc.frases++;
      }
    }
    cerrar(actual, documentos);
  }
  return documentos;
}
