/**
 * Cuenta, en el fichero de ENTRENAMIENTO de UD Spanish-AnCora, qué formas son
 * PRON casi siempre, y guarda la lista como dato (encargo 3.3, pieza 1 de la
 * capa POS de src/pos.ts). Se ejecuta a mano, una vez:
 *
 *   node herramientas/contar-pronombres.ts <es_ancora-ud-train.conllu> <salida.json>
 *
 * La lista sale del recuento, no de una lista hecha a mano: una forma entra si
 * su UPOS es PRON en ≥ 95 % de sus apariciones (umbral fijado por Antonio en
 * la respuesta a la parada del 3.3).
 *
 * [DOC] CoNLL-U — https://universaldependencies.org/format.html: se cuentan
 *    las PALABRAS sintácticas (ID entero), no las líneas de rango de los tokens
 *    multipalabra ni los nodos vacíos; así «dárselo» cuenta su «se» y su «lo».
 * [PROPIO] Formas en minúsculas («Él» y «él» son la misma).
 * [PROPIO] Sin mínimo de apariciones: si una forma sale una sola vez y es
 *    PRON, entra (1/1 = 100 %). Se guarda el recuento de cada una para que se
 *    vea cuánto pesa.
 * [PROPIO] Se guardan también los recuentos de las doce formas que el encargo
 *    llama ambiguas (que, se, lo, la, los, las, le, les, me, te, nos, os), para
 *    que se vea cuáles lo son de verdad en AnCora.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';

const UMBRAL = 0.95;
const DEL_ENCARGO_AMBIGUAS = ['que', 'se', 'lo', 'la', 'los', 'las', 'le', 'les', 'me', 'te', 'nos', 'os'];

export interface Recuento {
  forma: string;
  pron: number;
  total: number;
}

export function contar(conllu: string): Map<string, { pron: number; total: number }> {
  const cuenta = new Map<string, { pron: number; total: number }>();
  for (const linea of conllu.split(/\r?\n/)) {
    if (linea === '' || linea.startsWith('#')) continue;
    const columnas = linea.split('\t');
    if (columnas.length !== 10) throw new Error(`línea con ${columnas.length} columnas: ${linea.slice(0, 60)}`);
    const [id, forma, , upos] = columnas as [string, string, string, string];
    if (id.includes('-') || id.includes('.')) continue;
    const clave = forma.toLowerCase();
    const previo = cuenta.get(clave) ?? { pron: 0, total: 0 };
    previo.total++;
    if (upos === 'PRON') previo.pron++;
    cuenta.set(clave, previo);
  }
  return cuenta;
}

const [, , entrada, salida] = process.argv;
if (entrada !== undefined && salida !== undefined) {
  const bytes = readFileSync(entrada);
  const cuenta = contar(bytes.toString('utf8'));
  const recuento = (forma: string): Recuento => ({ forma, ...(cuenta.get(forma) ?? { pron: 0, total: 0 }) });
  const pronombres = [...cuenta]
    .filter(([, c]) => c.pron > 0 && c.pron / c.total >= UMBRAL)
    .map(([forma]) => recuento(forma))
    .sort((a, b) => b.total - a.total || a.forma.localeCompare(b.forma, 'es'));
  const datos = {
    fuente: {
      treebank: 'UD_Spanish-AnCora',
      version: 'r2.18',
      commit: '197cca385e0e7db1b1fe26a5772dade1b6fbbee8',
      fichero: basename(entrada),
      url: `https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/197cca385e0e7db1b1fe26a5772dade1b6fbbee8/${basename(entrada)}`,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      licencia: 'CC BY 4.0 (LICENSE-CC-BY-4.0.md, al lado de este fichero)',
    },
    criterio: `Forma, en minúsculas, cuya UPOS es PRON en al menos el ${UMBRAL * 100} % de sus apariciones como palabra sintáctica en el fichero de entrenamiento. Sin mínimo de apariciones.`,
    pronombres,
    ambiguasDelEncargo: DEL_ENCARGO_AMBIGUAS.map(recuento),
  };
  writeFileSync(salida, JSON.stringify(datos, null, 1) + '\n');
  console.log(`${pronombres.length} formas PRON ≥ ${UMBRAL * 100} % → ${salida}`);
}
