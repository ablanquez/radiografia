/**
 * Calibra un género (encargo 5.5; plan, punto 5): lee el corpus que dejó su
 * descargador (motor/corpus/<genero>/ y su manifiesto), mide cada documento
 * (medir.ts), lo reparte entre calibración y validación por la semilla
 * (comun.ts) y escribe, sin texto:
 *
 *   data/calibracion/<genero>.json             las celdas (n ≥ 100), las omitidas y
 *                                              los disparos de las reglas por tramo
 *   data/calibracion/<genero>.manifiesto.json  el manifiesto con tramo y reparto
 *
 *   node herramientas/calibrar/calibrar.ts <genero>        (desde motor/)
 *
 * [PROPIO, parada 1 del 5.5] El tramo se vuelve a medir aquí con el motor de
 *    hoy (el de los textos de los usuarios), y cada fichero lleva el commit
 *    del motor y si el árbol de motor/src y de paquetes/ estaba limpio: si
 *    cambian texto.ts o silabas, se vuelve a ejecutar (es reproducible).
 * [PROPIO] En la celda, «corpus» es el nombre y la versión de la fuente y el
 *    manifiesto de donde salen; «fecha», la de esta calibración.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Paquete } from '../../src/paquete.ts';
import { CLAVES_DE_CALIBRACION } from '../../src/metricas/nombres.ts';
import { calcularCeldas, disparosPorTramo, MINIMO_POR_CELDA, type Medida } from './celdas.ts';
import { SEMILLA, TRAMOS, huella, medirLongitud, reparto } from './comun.ts';
import { medirConDisparos } from './medir.ts';
import { nombreDeFichero, prepararManifiesto, type Manifiesto } from './manifiesto.ts';

const genero = process.argv[2];
if (genero === undefined || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(genero)) {
  console.error('uso: node herramientas/calibrar/calibrar.ts <genero>');
  process.exit(2);
}

const MOTOR = fileURLToPath(new URL('../../', import.meta.url));
const CORPUS = fileURLToPath(new URL(`../../corpus/${genero}/`, import.meta.url));
const SALIDA = fileURLToPath(new URL('../../../data/calibracion/', import.meta.url));
const RADIOGRAFIA = JSON.parse(readFileSync(new URL('../../../paquetes/radiografia.json', import.meta.url), 'utf8')) as Paquete;

const git = (...args: string[]) => execFileSync('git', args, { cwd: MOTOR, encoding: 'utf8' }).trim();
const motor = { commit: git('rev-parse', 'HEAD'), limpio: git('status', '--porcelain', '--', 'src', '../paquetes') === '' };

const corpus = JSON.parse(readFileSync(fileURLToPath(new URL(`../../corpus/${genero}.manifiesto.json`, import.meta.url)), 'utf8')) as Manifiesto;
if (corpus.genero !== genero) throw new Error(`el manifiesto es de «${corpus.genero}», no de «${genero}»`);

const fecha = new Date().toISOString().slice(0, 10);
const textos = new Map<string, string>();
const medidas: Medida[] = [];
const disparos: Parameters<typeof disparosPorTramo>[0][number][] = [];
const cambios: string[] = [];
const documentos = corpus.documentos.flatMap((d) => {
  const texto = readFileSync(`${CORPUS}textos/${nombreDeFichero(d.id)}`, 'utf8');
  if (huella(texto) !== d.sha256) throw new Error(`${d.id}: el texto no es el del manifiesto`);
  const { palabrasProsa, tramo } = medirLongitud(texto);
  if (palabrasProsa !== d.palabrasProsa) cambios.push(`${d.id}: ${d.palabrasProsa} → ${palabrasProsa} palabras de prosa`);
  if (tramo === null) return [];
  textos.set(d.id, texto);
  const r = reparto(SEMILLA, d.id);
  const medido = medirConDisparos(texto, genero, RADIOGRAFIA);
  medidas.push({ id: d.id, tramo, reparto: r, valores: medido.valores });
  disparos.push({ tramo, reparto: r, disparos: medido.disparos });
  return [{ ...d, palabrasProsa, tramo, reparto: r }];
});

const nombreCorpus = `${corpus.fuente.nombre}${corpus.fuente.version ? ` ${corpus.fuente.version}` : ''} — data/calibracion/${genero}.manifiesto.json`;
const { n, celdas, omitidas } = calcularCeldas(medidas, CLAVES_DE_CALIBRACION, { corpus: nombreCorpus, fecha });
const cuenta = (r: 'calibracion' | 'validacion') =>
  Object.fromEntries(TRAMOS.map((t) => [t, documentos.filter((d) => d.tramo === t && d.reparto === r).length]));

const calibracion = {
  genero,
  fecha,
  corpus: nombreCorpus,
  licencia: `${corpus.licencia.nombre} (${corpus.licencia.estado})`,
  semilla: SEMILLA,
  motor,
  metodo: 'hyndman-fan-7',
  minimoPorCelda: MINIMO_POR_CELDA,
  n: { calibracion: n, validacion: cuenta('validacion') },
  celdas,
  omitidas,
  disparos: disparosPorTramo(disparos),
  notas: [
    'Percentiles de los documentos de CALIBRACIÓN (sha256("semilla|id") < 0,8); los de validación quedan para el FPR del 5.6.',
    `Margen sobre el mínimo de ${MINIMO_POR_CELDA} documentos de calibración por tramo: ${TRAMOS.map((t) => `${t} ${n[t] - MINIMO_POR_CELDA >= 0 ? '+' : ''}${n[t] - MINIMO_POR_CELDA}`).join(' · ')}.`,
    `_total-radiografia: puntuacion.total de analizar() con paquetes/radiografia.json y el género «${genero}»; desde el 5.6 incluye las reglas estadísticas (trece «est-», siete que puntúan), comparadas con las celdas de calibración inyectadas en el paquete.`,
    'disparos: por tramo, en los documentos de calibración, en cuántos da alguna señal cada regla de RadiografIA que puntúa y cuántas señales suman (las informativas no cuentan); desde el 5.6, también las reglas estadísticas.',
    ...(corpus.notas ?? []),
    ...corpus.filtros.map((f) => `filtro del corpus: ${f}`),
  ],
};

const manifiesto = prepararManifiesto(
  {
    ...corpus,
    semilla: SEMILLA,
    motor,
    n: {
      ...corpus.n,
      documentos: documentos.length,
      porTramo: Object.fromEntries(TRAMOS.map((t) => [t, documentos.filter((d) => d.tramo === t).length])) as Manifiesto['n']['porTramo'],
      reparto: { calibracion: documentos.filter((d) => d.reparto === 'calibracion').length, validacion: documentos.filter((d) => d.reparto === 'validacion').length },
    },
    documentos,
  },
  textos,
);

mkdirSync(SALIDA, { recursive: true });
writeFileSync(`${SALIDA}${genero}.json`, JSON.stringify(calibracion, null, 2) + '\n', 'utf8');
writeFileSync(`${SALIDA}${genero}.manifiesto.json`, JSON.stringify(manifiesto, null, 2) + '\n', 'utf8');

const publicadas = Object.values(celdas).reduce((s, porTramo) => s + Object.keys(porTramo).length, 0);
console.log(`${genero}: ${documentos.length} documentos; motor ${motor.commit.slice(0, 7)}${motor.limpio ? '' : ' (con cambios sin commit)'}`);
console.log(`  calibración por tramo: ${TRAMOS.map((t) => `${t} ${n[t]}`).join(' · ')}`);
console.log(`  validación por tramo:  ${TRAMOS.map((t) => `${t} ${cuenta('validacion')[t]}`).join(' · ')}`);
console.log(`  celdas: ${publicadas} publicadas, ${omitidas.length} omitidas`);
if (cambios.length > 0) console.log(`  ⚠️ ${cambios.length} documentos cambian de palabras de prosa respecto al descargador (${cambios[0]}…)`);
