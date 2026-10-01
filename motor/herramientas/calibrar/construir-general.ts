/**
 * Construye el corpus de «general» para la calibración (encargo 5.5): la
 * mezcla estratificada de los cinco géneros calibrados (general.ts), y deja en
 * motor/corpus/general/ un texto por documento y el manifiesto
 * motor/corpus/general.manifiesto.json (sin texto). Después,
 * `node herramientas/calibrar/calibrar.ts general`. Se ejecuta a mano:
 *
 *   node herramientas/calibrar/construir-general.ts   (desde motor/)
 *
 * Sin red: de cada género lee su fichero de calibración (qué tramos tienen
 * celda) y su manifiesto en data/calibracion/ (tramo, reparto y huella de
 * cada documento), y los textos de la caché local (motor/corpus/<género>/
 * textos/), cada uno comprobado contra su huella: si no casa, PARA (la caché
 * ya no es la de los datos publicados).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { TramoDeCalibracion } from '../../src/paquete.ts';
import { MINIMO_POR_CELDA } from './celdas.ts';
import { SEMILLA, TRAMOS, huella } from './comun.ts';
import { mezclar, type EntradaDeGenero } from './general.ts';
import { nombreDeFichero, prepararManifiesto, type DocumentoDelManifiesto, type Manifiesto } from './manifiesto.ts';

const GENEROS = ['noticia', 'administrativo', 'narrativa-clasica', 'academico', 'opinion'] as const;
const DATOS = fileURLToPath(new URL('../../../data/calibracion/', import.meta.url));
const CACHE = fileURLToPath(new URL('../../corpus/', import.meta.url));
const CORPUS = `${CACHE}general/`;
const MANIFIESTO = `${CACHE}general.manifiesto.json`;

interface FicheroDeCalibracion {
  licencia: string;
  n: { calibracion: Record<TramoDeCalibracion, number> };
}

const leidos = GENEROS.map((genero) => {
  const crudoManifiesto = readFileSync(`${DATOS}${genero}.manifiesto.json`);
  const calibracion = JSON.parse(readFileSync(`${DATOS}${genero}.json`, 'utf8')) as FicheroDeCalibracion;
  const manifiesto = JSON.parse(crudoManifiesto.toString('utf8')) as Manifiesto;
  return { genero, calibracion, manifiesto, crudoManifiesto };
});
const entradas: EntradaDeGenero[] = leidos.map((l) => ({ genero: l.genero, calibracion: l.calibracion.n.calibracion, documentos: l.manifiesto.documentos }));
const mezcla = mezclar(entradas, MINIMO_POR_CELDA, SEMILLA);

// ── Textos, comprobados contra su huella ──
rmSync(CORPUS, { recursive: true, force: true });
mkdirSync(`${CORPUS}textos`, { recursive: true });
const textos = new Map<string, string>();
const lista: DocumentoDelManifiesto[] = [];
for (const e of mezcla.elegidos) {
  const d = leidos.find((l) => l.genero === e.genero)!.manifiesto.documentos.find((x) => x.id === e.id)!;
  const texto = readFileSync(`${CACHE}${e.genero}/textos/${nombreDeFichero(e.id)}`, 'utf8');
  if (huella(texto) !== d.sha256) throw new Error(`PARA: ${e.genero}/${e.id}: el texto de la caché no es el del manifiesto publicado`);
  writeFileSync(`${CORPUS}textos/${nombreDeFichero(e.id)}`, texto, 'utf8');
  textos.set(e.id, texto);
  lista.push({ id: e.id, sha256: d.sha256, palabrasProsa: d.palabrasProsa, tramo: e.tramo, reparto: e.reparto, genero: e.genero });
}

const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');
const declaracion = (t: TramoDeCalibracion) => {
  const x = mezcla.tramos[t];
  if (!x.existe) return `${t}: ningún género tiene este tramo calibrado; la celda no existe`;
  return `${t}: ${x.generos.join(', ')}; ${x.calibracionPorGenero} documentos de calibración y ${x.validacionPorGenero} de validación de cada uno (${x.calibracion} y ${x.validacion})`;
};
const fuera = TRAMOS.flatMap((t) =>
  leidos
    .filter((l) => !mezcla.tramos[t].generos.includes(l.genero))
    .map((l) => `${l.genero} no entra en ${t}: su tramo no está calibrado (${l.calibracion.n.calibracion[t]} documentos de calibración, menos de ${MINIMO_POR_CELDA})`),
);
const porTramo = Object.fromEntries(TRAMOS.map((t) => [t, lista.filter((d) => d.tramo === t).length])) as Manifiesto['n']['porTramo'];

const manifiesto = prepararManifiesto(
  {
    genero: 'general',
    fuente: {
      nombre: 'Mezcla estratificada de los cinco géneros calibrados (noticia, administrativo, narrativa-clasica, academico, opinion)',
      url: 'data/calibracion/',
      ficheros: leidos.map((l) => ({ nombre: `${l.genero}.manifiesto.json`, url: `data/calibracion/${l.genero}.manifiesto.json`, bytes: l.crudoManifiesto.length, sha256: sha(l.crudoManifiesto) })),
    },
    licencia: {
      nombre: 'La de cada corpus de origen',
      literal: leidos.map((l) => `${l.genero}: ${l.calibracion.licencia}`),
      url: 'data/calibracion/LICENSE-CORPUS.md',
      estado: 'heredada: cada documento conserva la licencia de su corpus (opinion: CC BY 2.1 ES declarada por terceros, solo cifras)',
      atribucion: leidos.map((l) => `${l.genero}: ${l.manifiesto.licencia.atribucion}`).join(' · '),
    },
    documentacion: [
      { que: 'la regla de la mezcla', url: 'motor/herramientas/calibrar/general.ts' },
      { que: 'la licencia y la atribución de cada corpus', url: 'data/calibracion/LICENSE-CORPUS.md' },
    ],
    filtros: [
      `por tramo, los géneros que tienen ese tramo calibrado (${MINIMO_POR_CELDA} documentos de calibración o más); de cada uno, el mínimo común entre ellos, los primeros en el orden de sha256("semilla|muestra|general|<género>|<id>")`,
      'la validación, con la misma regla sobre los documentos de validación de esos géneros; el reparto de cada documento es el de su género',
      `la celda existe solo si la suma llega a ${MINIMO_POR_CELDA}`,
    ],
    unidad: 'un documento de uno de los cinco géneros, con su género',
    descarga: {
      fecha: new Date().toISOString().slice(0, 10),
      herramienta: 'motor/herramientas/calibrar/construir-general.ts',
      peticiones: 0,
      bytes: 0,
      segundos: 0,
      notas: ['sin red: los textos salen de la caché local de cada género (motor/corpus/<género>/textos/), cada uno comprobado contra la huella de su manifiesto publicado'],
    },
    verificaciones: [
      ...TRAMOS.map((t) => ({ que: `qué géneros y cuántos documentos de cada uno, ${t}`, resultado: declaracion(t) })),
      { que: 'géneros que no entran en un tramo', resultado: fuera.join('; ') || 'ninguno' },
    ],
    notas: [
      ...TRAMOS.map((t) => `Mezcla de ${declaracion(t)}.`),
      ...fuera.map((f) => `${f[0]!.toUpperCase()}${f.slice(1)}.`),
      '«general» hereda los sesgos de cada parte: narrativa clásica anterior a 1946; administrativo, mezcla de tres subgéneros con tope del 60 %; académico, con fragmentos en los tramos cortos y OCR declarado; opinión, críticas de cine de aficionados con licencia declarada por terceros (solo cifras).',
      'Sin Wikipedia ni corporativo: la mezcla solo lleva los cinco géneros calibrados.',
    ],
    n: { documentos: lista.length, descartados: {}, porTramo },
    documentos: lista,
  },
  textos,
);
writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n', 'utf8');

console.log(`general: ${lista.length} documentos`);
for (const t of TRAMOS) console.log(`  ${declaracion(t)}`);
for (const f of fuera) console.log(`  ${f}`);
