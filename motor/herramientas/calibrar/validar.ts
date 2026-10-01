/**
 * Valida RadiografIA con los textos humanos APARTADOS (encargo 5.6, d): por
 * cada género calibrado y cada tramo con celda de `_total-radiografia`,
 * analiza SOLO los documentos de reparto «validacion» (nunca los de
 * calibración) con analizar(texto, [radiografia.json], { genero }) y escribe,
 * sin texto, data/calibracion/validacion.json (validacion.ts):
 * la FPR de la familia estadística (≥ 2 reglas «est-» que puntúan), la
 * proporción con al menos una, la tasa de disparo de todas las reglas y el
 * total en validación frente a la celda de calibración. Se ejecuta a mano:
 *
 *   node herramientas/calibrar/validar.ts        (desde motor/)
 *
 * Sin red: lee los corpus en caché (motor/corpus/<genero>/textos/) y
 * comprueba la huella de cada texto contra el manifiesto de
 * data/calibracion/; vuelve a calcular el reparto con la semilla y el tramo
 * con el motor, y si no cuadran con el manifiesto, para. Antes de escribir,
 * el juez del reparto (comprobarReparto) tiene que salir limpio.
 * El paquete tiene que llevar la calibración de data/calibracion/ (la que
 * deja inyectar-calibracion.ts): si no, para.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analizar } from '../../src/analizar.ts';
import { esAusencia } from '../../src/detector-ausencia.ts';
import type { Celda, Paquete, TramoDeCalibracion } from '../../src/paquete.ts';
import { CLAVE_TOTAL_RADIOGRAFIA } from '../../src/metricas/nombres.ts';
import { SEMILLA, TRAMOS, huella, medirLongitud, reparto } from './comun.ts';
import { GENEROS_CALIBRADOS, unirCalibraciones } from './inyeccion.ts';
import { nombreDeFichero, type Manifiesto } from './manifiesto.ts';
import { comprobarReparto, resumirCelda, type DocumentoValidado, type FicheroDeValidacion, type ReglaResumida } from './validacion.ts';

const MOTOR = fileURLToPath(new URL('../../', import.meta.url));
const DATOS = new URL('../../../data/calibracion/', import.meta.url);
const RADIOGRAFIA = JSON.parse(readFileSync(new URL('../../../paquetes/radiografia.json', import.meta.url), 'utf8')) as Paquete;

const git = (...args: string[]) => execFileSync('git', args, { cwd: MOTOR, encoding: 'utf8' }).trim();
const motor = { commit: git('rev-parse', 'HEAD'), limpio: git('status', '--porcelain', '--', 'src', '../paquetes', '../data/calibracion', ':(exclude)../data/calibracion/validacion.json') === '' };

const leer = <T>(nombre: string): T => JSON.parse(readFileSync(new URL(nombre, DATOS), 'utf8')) as T;
const calibraciones = GENEROS_CALIBRADOS.map((genero) => ({ genero, ...leer<{ celdas: Record<string, Partial<Record<TramoDeCalibracion, Celda>>> }>(`${genero}.json`) }));
if (JSON.stringify(RADIOGRAFIA.cabecera.calibracion) !== JSON.stringify(unirCalibraciones(calibraciones))) {
  throw new Error('PARA: paquetes/radiografia.json no lleva la calibración de data/calibracion/ (ejecuta inyectar-calibracion.ts)');
}

const informativaDe = new Map(RADIOGRAFIA.cabecera.familias.map((f) => [f.id, f.informativa]));
const reglas: ReglaResumida[] = RADIOGRAFIA.reglas.map((r) => ({
  id: r.id,
  estadistica: r.detector === 'estadístico',
  puntua: !r.informativa && informativaDe.get(r.familia) !== true,
}));

/** Las reglas con alguna señal: patrón y estructurales (también las informativas), las del texto entero, y las estadísticas informativas solo fuera de su banda. */
function disparadas(texto: string, genero: string): { total: number; disparadas: string[] } {
  const r = analizar(texto, [RADIOGRAFIA], { genero });
  const total = r.paquetes[0]!.puntuacion.total;
  if (total === null) throw new Error('un documento de validación sin puntuar (menos de 100 palabras de prosa)');
  const ids = new Set<string>();
  for (const s of [...r.senales, ...r.senalesTexto]) ids.add(s.reglaId);
  for (const s of r.contexto) if (esAusencia(s) || s.lado !== null) ids.add(s.reglaId);
  return { total, disparadas: [...ids] };
}

const fichero: FicheroDeValidacion & Record<string, unknown> = {
  fecha: new Date().toISOString().slice(0, 10),
  paquete: { nombre: RADIOGRAFIA.cabecera.nombre, version: RADIOGRAFIA.cabecera.version },
  semilla: SEMILLA,
  motor,
  criterio:
    'FPR de la familia estadística: proporción de documentos humanos de VALIDACIÓN (reparto «validacion»: sha256("semilla|id") ≥ 0,8) en los que disparan 2 o más reglas estadísticas que puntúan; objetivo ≤ 5 % en cada género × tramo con celda (plan, punto 5; encargo 5.6). Cada documento se analiza con el género de su corpus.',
  generos: {},
};
const manifiestos: Record<string, Manifiesto> = {};

for (const { genero, celdas } of calibraciones) {
  const manifiesto = leer<Manifiesto>(`${genero}.manifiesto.json`);
  if (manifiesto.genero !== genero) throw new Error(`${genero}.manifiesto.json dice ser de «${manifiesto.genero}»`);
  manifiestos[genero] = manifiesto;
  const porTramo = new Map<TramoDeCalibracion, DocumentoValidado[]>(TRAMOS.map((t) => [t, []]));
  for (const d of manifiesto.documentos) {
    if (d.reparto !== 'validacion' || d.tramo === null) continue;
    if (reparto(SEMILLA, d.id) !== 'validacion') throw new Error(`${genero} ${d.id}: el manifiesto dice «validacion» y la semilla, no`);
    const texto = readFileSync(fileURLToPath(new URL(`../../corpus/${genero}/textos/${nombreDeFichero(d.id)}`, import.meta.url)), 'utf8');
    if (huella(texto) !== d.sha256) throw new Error(`PARA: ${genero} ${d.id}: el texto en caché no es el del manifiesto`);
    const { tramo } = medirLongitud(texto);
    if (tramo !== d.tramo) throw new Error(`${genero} ${d.id}: el manifiesto dice ${d.tramo} y el motor mide ${tramo}`);
    porTramo.get(tramo)!.push({ id: d.id, tramo, ...disparadas(texto, genero) });
  }
  const resultado: FicheroDeValidacion['generos'][string] = { celdas: {}, omitidas: [] };
  for (const [tramo, documentos] of porTramo) {
    const celda = celdas[CLAVE_TOTAL_RADIOGRAFIA]?.[tramo];
    if (celda === undefined) {
      resultado.omitidas.push({ tramo, motivo: 'sin celda de calibración del total: el tramo no tiene 100 documentos de calibración', n: documentos.length });
      continue;
    }
    resultado.celdas[tramo] = resumirCelda(tramo, documentos, reglas, celda);
  }
  fichero.generos[genero] = resultado;
}

const problemas = comprobarReparto(fichero, manifiestos);
if (problemas.length > 0) throw new Error(`PARA: el reparto no cuadra:\n${problemas.map((p) => `  ${p}`).join('\n')}`);
writeFileSync(new URL('validacion.json', DATOS), JSON.stringify(fichero, null, 2) + '\n', 'utf8');

const pct = (x: number) => `${(100 * x).toFixed(1).replace('.', ',')} %`;
console.log(`data/calibracion/validacion.json: motor ${motor.commit.slice(0, 7)}${motor.limpio ? '' : ' (con cambios sin commit)'}`);
for (const [genero, { celdas, omitidas }] of Object.entries(fichero.generos)) {
  for (const [tramo, c] of Object.entries(celdas)) {
    console.log(`  ${genero.padEnd(18)} ${tramo.padEnd(8)} n ${String(c.n).padStart(4)} · FPR ${pct(c.fpr.proporcion).padStart(7)} (${c.fpr.documentos}) · ≥ 1 ${pct(c.alMenosUna.proporcion).padStart(7)} (${c.alMenosUna.documentos})`);
  }
  for (const o of omitidas) console.log(`  ${genero.padEnd(18)} ${o.tramo.padEnd(8)} omitida (${o.n} documentos): ${o.motivo}`);
}
