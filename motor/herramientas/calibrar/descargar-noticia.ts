/**
 * Descarga el corpus de «noticia» para la calibración (encargo 5.5):
 * UD_Spanish-AnCora r2.18, sus tres CoNLL-U (train, dev, test), y deja en
 * motor/corpus/noticia/ un texto por documento y el manifiesto
 * motor/corpus/noticia.manifiesto.json (sin texto). Se ejecuta a mano:
 *
 *   node herramientas/calibrar/descargar-noticia.ts        (desde motor/)
 *
 * Endpoints y su documentación (leída el 30/09/2026):
 * [DOC] https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/<commit>/<fichero>
 *    — el fichero tal cual en ese commit. El commit es el de la etiqueta
 *    r2.18: GET https://api.github.com/repos/UniversalDependencies/UD_Spanish-AnCora/git/ref/tags/r2.18
 *    → «sha: 197cca385e0e7db1b1fe26a5772dade1b6fbbee8» (el mismo del 3.3).
 *    Los tamaños y los SHA-1 de blob de Git de cada fichero, de
 *    GET https://api.github.com/repos/UniversalDependencies/UD_Spanish-AnCora/contents?ref=r2.18;
 *    cada descarga se comprueba contra su blob (sha1("blob <bytes>\0" + contenido)).
 *    robots.txt de raw.githubusercontent.com: 404 (RFC 9309 § 2.3.1.3, todo permitido).
 * [DOC] https://universaldependencies.org/format.html — # newdoc id, # text (ancora.ts).
 * [DOC] Licencia: LICENSE.txt de r2.18, «The treebank is licensed under the
 *    Creative Commons License Attribution 4.0 International.», y los metadatos
 *    del README, «License: CC BY 4.0». El README dice también, en prosa, «The
 *    GNU license is inherited from the original dataset»: contradicción
 *    interna del repositorio, que va a la ficha con las dos citas (decisión de
 *    Antonio, parada 1 del 5.5). Si el literal de LICENSE.txt o el de los
 *    metadatos no está en lo descargado, PARA.
 *
 * Filtros (van al manifiesto):
 *   · documento = # newdoc id (desde la v2.9);
 *   · fuera el subcorpus 3LB-CAST [PROPIO, a la parada 2]: Taulé, Martí y
 *     Recasens (2008, § 2; http://www.lrec-conf.org/proceedings/lrec2008/pdf/35_paper.pdf)
 *     dicen que AnCora-Es «contains 75,000 words from Lexesp —a Spanish
 *     balanced 6-million-word corpus—, 225,000 words from the EFE Spanish news
 *     agency, and 200.000 from the Spanish version of the El Periódico
 *     newspaper». 3LB-CAST tiene 3.503 frases (las ≈ 3.500 de Cast3LB) y sus
 *     textos no son solo prensa (divulgación, narrativa): no consta que sea
 *     «noticia»;
 *   · fuera los de menos de 100 palabras de prosa (no tienen tramo).
 * El Periódico: el castellano es el original y el catalán su traducción
 *    automática (Fité 2006, Tradumàtica 4: «cent redactors d'El Periódico que
 *    escriuen en castellà»; https://raco.cat/index.php/Tradumatica/article/view/56010).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { frasesPor100Palabras } from '../../src/metricas/frases-por-100-palabras.ts';
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { percentil } from '../../src/percentil.ts';
import { analizarTexto } from '../../src/texto.ts';
import { documentosDeConllu, type Subcorpus } from './ancora.ts';
import { SEMILLA, TRAMOS, huella, medirLongitud, reparto } from './comun.ts';
import { nombreDeFichero, prepararManifiesto, type DocumentoDelManifiesto, type FicheroDeFuente, type Manifiesto } from './manifiesto.ts';
import { Cliente } from './red.ts';

const REPO = 'https://github.com/UniversalDependencies/UD_Spanish-AnCora';
const COMMIT = '197cca385e0e7db1b1fe26a5772dade1b6fbbee8';
const RAW = `https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/${COMMIT}`;

/** De la API de GitHub en r2.18 (ver cabecera): nombre, bytes y SHA-1 de blob. */
const FICHEROS = [
  { nombre: 'LICENSE.txt', bytes: 189, blob: '349a65a17a7259bf4897226bcc11ea74de399582' },
  { nombre: 'README.md', bytes: 6140, blob: '20984b16102e20e8bedd0fb2f0cfe73eab44b748' },
  { nombre: 'es_ancora-ud-train.conllu', bytes: 43100702, blob: 'b32f54e31c233d8cd208b0e7af62b1203e7a0a9e' },
  { nombre: 'es_ancora-ud-dev.conllu', bytes: 5121417, blob: 'ad5d02ae2226d39897ab93a8eeaad44b29fd1562' },
  { nombre: 'es_ancora-ud-test.conllu', bytes: 5123220, blob: '4096365c9ae9a8b0eda11c61d0067e2d0a4d0413' },
] as const;

const LITERAL_LICENSE = 'The treebank is licensed under the Creative Commons License Attribution 4.0 International.';
const LITERAL_METADATOS = 'License: CC BY 4.0';
const LITERAL_GNU = 'The GNU license is inherited from the original dataset';
const ATRIBUCION =
  "Taulé, M., M.A. Martí, M. Recasens (2008) 'Ancora: Multilevel Annotated Corpora for Catalan and Spanish', Proceedings of 6th International Conference on Language Resources and Evaluation. Marrakesh (Morocco).";

const FUERA: readonly Subcorpus[] = ['3LB-CAST'];

const CORPUS = fileURLToPath(new URL('../../corpus/noticia/', import.meta.url));
const MANIFIESTO = fileURLToPath(new URL('../../corpus/noticia.manifiesto.json', import.meta.url));

const blobGit = (b: Buffer) => createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
const sha256 = (b: Buffer) => createHash('sha256').update(b).digest('hex');

const cliente = new Cliente({
  agente: 'RadiografIA-calibracion',
  contacto: 'https://github.com/ablanquez/radiografia',
  pausaMs: 1000,
  presupuestoMs: 30 * 60_000,
});

mkdirSync(`${CORPUS}fuente`, { recursive: true });
const bytesDe = new Map<string, Buffer>();
const fuentes: FicheroDeFuente[] = [];
const bajados: string[] = [];
for (const f of FICHEROS) {
  const local = `${CORPUS}fuente/${f.nombre}`;
  let b: Buffer | null = existsSync(local) ? readFileSync(local) : null;
  if (b === null || blobGit(b) !== f.blob) {
    const r = await cliente.obtener(`${RAW}/${f.nombre}`);
    if (r.estado !== 200) throw new Error(`${f.nombre}: HTTP ${r.estado}`);
    b = r.cuerpo;
    writeFileSync(local, b);
    bajados.push(f.nombre);
  }
  if (b.length !== f.bytes || blobGit(b) !== f.blob) throw new Error(`${f.nombre}: no es el de r2.18 (bytes ${b.length}, blob ${blobGit(b)})`);
  bytesDe.set(f.nombre, b);
  fuentes.push({ nombre: f.nombre, url: `${RAW}/${f.nombre}`, bytes: b.length, sha256: sha256(b), blobGit: f.blob });
}

const licencia = bytesDe.get('LICENSE.txt')!.toString('utf8');
const readme = bytesDe.get('README.md')!.toString('utf8');
for (const [dónde, texto, literal] of [
  ['LICENSE.txt', licencia, LITERAL_LICENSE],
  ['README.md', readme, LITERAL_METADATOS],
  ['README.md', readme, LITERAL_GNU],
  ['README.md', readme, 'Taulé, M., M.A. Martí, M. Recasens (2008)'],
] as const) {
  if (!texto.includes(literal)) throw new Error(`PARA: «${literal}» no está en ${dónde} de r2.18`);
}

const documentos = documentosDeConllu(
  ['es_ancora-ud-train.conllu', 'es_ancora-ud-dev.conllu', 'es_ancora-ud-test.conllu'].map((fichero) => ({
    fichero,
    texto: bytesDe.get(fichero)!.toString('utf8'),
  })),
);

rmSync(`${CORPUS}textos`, { recursive: true, force: true });
mkdirSync(`${CORPUS}textos`, { recursive: true });
const descartados: Record<string, number> = {};
const suma = (motivo: string) => (descartados[motivo] = (descartados[motivo] ?? 0) + 1);
const textos = new Map<string, string>();
const lista: DocumentoDelManifiesto[] = [];
/** Para las verificaciones: frases por 100 con el segmentador y con la anotación, y si va a calibración. */
const medidos: { tramo: TramoDeCalibracion; fuera: boolean; calibracion: boolean; segmentador: number; oro: number; frasesSeg: number; frasesOro: number; palabras: number }[] = [];
for (const d of documentos) {
  const fuera = FUERA.includes(d.subcorpus);
  const { palabrasProsa, tramo } = medirLongitud(d.texto);
  if (tramo !== null) {
    const segmentado = analizarTexto(d.texto);
    const frasesSeg = segmentado.parrafos.filter((p) => p.prosa).reduce((n, p) => n + p.frases.length, 0);
    medidos.push({
      tramo,
      fuera,
      calibracion: reparto(SEMILLA, d.id) === 'calibracion',
      segmentador: frasesPor100Palabras(segmentado)!,
      oro: (100 * d.frases) / palabrasProsa,
      frasesSeg,
      frasesOro: d.frases,
      palabras: palabrasProsa,
    });
  }
  if (fuera) {
    suma(`subcorpus ${d.subcorpus}: no consta que sea prensa`);
    continue;
  }
  if (tramo === null) {
    suma('menos de 100 palabras de prosa');
    continue;
  }
  writeFileSync(`${CORPUS}textos/${nombreDeFichero(d.id)}`, d.texto, 'utf8');
  textos.set(d.id, d.texto);
  lista.push({ id: d.id, sha256: huella(d.texto), palabrasProsa, tramo, subcorpus: d.subcorpus, fichero: d.fichero, frases: d.frases });
}

// ── Verificaciones (parada 2 del 5.5) ──
const coma = (x: number) => x.toFixed(2).replace('.', ',');
const mediana = (xs: number[]) => (xs.length === 0 ? NaN : percentil(xs, 0.5));
const dentro = medidos.filter((m) => !m.fuera);
const iguales = dentro.filter((m) => m.frasesSeg === m.frasesOro).length;
const palabrasPorFraseOro = dentro.reduce((s, m) => s + m.palabras, 0) / dentro.reduce((s, m) => s + m.frasesOro, 0);
const verificaciones = [
  {
    que: 'segmentador del motor (Intl.Segmenter) frente a la segmentación manual de AnCora (# sent_id), documento a documento',
    resultado:
      `${iguales} de ${dentro.length} documentos con el mismo número de frases (${dentro.filter((m) => m.frasesSeg > m.frasesOro).length} con más, ${dentro.filter((m) => m.frasesSeg < m.frasesOro).length} con menos); ` +
      `mediana de frases por 100 palabras, segmentador frente a anotación: ` +
      TRAMOS.map((t) => `${t} ${coma(mediana(dentro.filter((m) => m.tramo === t).map((m) => m.segmentador)))} frente a ${coma(mediana(dentro.filter((m) => m.tramo === t).map((m) => m.oro)))}`).join('; ') +
      `; ${coma(palabrasPorFraseOro)} palabras por frase en la anotación`,
  },
  {
    que: `cifra alternativa con el subcorpus ${FUERA.join(', ')} dentro (documentos de calibración por tramo y mediana de frases por 100 palabras)`,
    resultado: TRAMOS.map((t) => {
      const cal = medidos.filter((m) => m.tramo === t && m.calibracion);
      return `${t}: ${cal.length} documentos, mediana ${coma(mediana(cal.map((m) => m.segmentador)))}`;
    }).join('; '),
  },
];
const notas = [
  `Frases por 100 palabras: AnCora da ${coma(palabrasPorFraseOro)} palabras por frase en su anotación manual. La expectativa «4-6» del encargo 5.5 no tenía fuente; la de la investigación (docs/investigacion/sintaxis.md, Schaaff et al. 2023: ~27 palabras por frase, ~3,7 por 100) coincide con el corpus. Se acepta tal cual (decisión de Antonio, parada 2 del 5.5).`,
];

const porTramo = Object.fromEntries(TRAMOS.map((t) => [t, lista.filter((d) => d.tramo === t).length])) as Manifiesto['n']['porTramo'];
const manifiesto = prepararManifiesto(
  {
    genero: 'noticia',
    fuente: { nombre: 'UD Spanish-AnCora', url: REPO, version: 'r2.18', commit: COMMIT, ficheros: fuentes },
    licencia: {
      nombre: 'CC BY 4.0',
      literal: [
        `LICENSE.txt: «${LITERAL_LICENSE}»`,
        `README.md, metadatos: «${LITERAL_METADATOS}»`,
        `README.md, prosa: «${LITERAL_GNU}…» — contradicción interna del repositorio; valen LICENSE.txt y los metadatos, que coinciden con corpus.md`,
      ],
      url: `${RAW}/LICENSE.txt`,
      estado: 'verificada en el repositorio (LICENSE.txt y metadatos del README)',
      atribucion: ATRIBUCION,
    },
    documentacion: [
      { que: 'formato CoNLL-U: # newdoc id, # newpar, # text', url: 'https://universaldependencies.org/format.html' },
      { que: 'límites de documento desde la v2.9 (changelog del README)', url: `${RAW}/README.md` },
      { que: 'procedencia de AnCora-Es: Lexesp, EFE y El Periódico (§ 2)', url: 'http://www.lrec-conf.org/proceedings/lrec2008/pdf/35_paper.pdf' },
      { que: 'El Periódico se redacta en castellano y se traduce al catalán', url: 'https://raco.cat/index.php/Tradumatica/article/view/56010' },
      { que: 'etiqueta r2.18 → commit', url: 'https://api.github.com/repos/UniversalDependencies/UD_Spanish-AnCora/git/ref/tags/r2.18' },
    ],
    filtros: [
      'documento = # newdoc id; su texto, los # text de sus frases unidos por un espacio (r2.18 no trae # newpar: un párrafo por documento)',
      `fuera el subcorpus ${FUERA.join(', ')} (Cast3LB/Lexesp, corpus equilibrado: no consta que sea prensa; Taulé et al. 2008, § 2)`,
      'fuera los documentos de menos de 100 palabras de prosa (sin tramo de calibración)',
    ],
    unidad: 'documento de AnCora (# newdoc id)',
    descarga: {
      fecha: new Date().toISOString().slice(0, 10),
      herramienta: 'motor/herramientas/calibrar/descargar-noticia.ts',
      peticiones: cliente.peticiones,
      bytes: cliente.bytes,
      segundos: Math.round(cliente.transcurridoMs / 1000),
      notas: [
        `descargados en esta ejecución: ${bajados.length === 0 ? "ninguno" : bajados.join(", ")}; reutilizados de motor/corpus/noticia/fuente/, comprobados contra su blob de r2.18: ${FICHEROS.length - bajados.length}`,
      ],
    },
    verificaciones,
    notas,
    n: { documentos: lista.length, descartados, porTramo },
    documentos: lista,
  },
  textos,
);
writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n', 'utf8');

const porSubcorpus = new Map<string, number>();
for (const d of lista) porSubcorpus.set(String(d['subcorpus']), (porSubcorpus.get(String(d['subcorpus'])) ?? 0) + 1);
console.log(`noticia: ${lista.length} documentos (${[...porSubcorpus].map(([s, n]) => `${s} ${n}`).join(', ')})`);
console.log(`  por tramo: ${TRAMOS.map((t) => `${t} ${porTramo[t]}`).join(' · ')}`);
console.log(`  descartados: ${JSON.stringify(descartados)}`);
console.log(`  red: ${cliente.peticiones} peticiones, ${cliente.bytes} bytes, ${Math.round(cliente.transcurridoMs / 1000)} s`);
console.log(`  → ${MANIFIESTO}`);
