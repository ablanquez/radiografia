/**
 * La calibración en el paquete (encargo 5.5): las celdas de los ficheros de
 * data/calibracion/ («clave → tramo → celda», uno por género) en
 * cabecera.calibracion («clave → género → tramo → celda», el esquema del 4.3).
 * Sin red: lo juzga inyeccion.spec.ts, también sobre el paquete real.
 *
 * [PROPIO, parada 3 del 5.5] Solo las celdas: las notas de cada fichero
 *    (márgenes, omitidas, el total sin reglas estadísticas) se quedan en
 *    data/calibracion/, no en el paquete.
 * [PROPIO] El paquete se edita sin reescribirlo entero: sus reglas llevan
 *    escapes \u a propósito (caracteres invisibles a la vista), que
 *    JSON.stringify no conservaría. Se sustituye solo el bloque de la cabecera,
 *    y solo si regenerado con JSON.stringify sale igual que estaba (si no,
 *    PARA: se cambiaría un formato que alguien eligió).
 */
import type { Calibracion, Celda, TramoDeCalibracion } from '../../src/paquete.ts';
import { CLAVES_DE_CALIBRACION, esClaveDeCalibracion } from '../../src/metricas/nombres.ts';

/** Los géneros calibrados, en el orden en que van en el paquete: «general», el de por defecto, primero. */
export const GENEROS_CALIBRADOS = ['general', 'noticia', 'administrativo', 'narrativa-clasica', 'academico', 'opinion'] as const;

export interface FicheroDeCalibracion {
  genero: string;
  celdas: Record<string, Partial<Record<TramoDeCalibracion, Celda>>>;
}

export function unirCalibraciones(ficheros: readonly FicheroDeCalibracion[]): Calibracion {
  const generos = new Set<string>();
  const salida: Calibracion = {};
  for (const f of ficheros) {
    if (generos.has(f.genero)) throw new Error(`inyección: el género ${f.genero} viene dos veces`);
    generos.add(f.genero);
    for (const clave of Object.keys(f.celdas)) if (!esClaveDeCalibracion(clave)) throw new Error(`inyección: «${clave}» (${f.genero}) no es una clave de calibración`);
  }
  const claves = [...CLAVES_DE_CALIBRACION, ...new Set(ficheros.flatMap((f) => Object.keys(f.celdas)))].filter((c, i, todas) => todas.indexOf(c) === i);
  for (const clave of claves) {
    for (const f of ficheros) {
      const tramos = f.celdas[clave];
      if (tramos === undefined || Object.keys(tramos).length === 0) continue;
      (salida[clave] ??= {})[f.genero] = tramos;
    }
  }
  return salida;
}

/** JSON con 2 espacios, metido un nivel (el de las claves de primer nivel del paquete). */
const sangrado = (valor: unknown) =>
  JSON.stringify(valor, null, 2)
    .split('\n')
    .map((l, i) => (i === 0 ? l : `  ${l}`))
    .join('\n');

export function conCalibracion(texto: string, calibracion: Calibracion): string {
  const paquete = JSON.parse(texto) as { cabecera: Record<string, unknown> };
  const inicio = texto.indexOf('\n  "cabecera": {');
  const fin = inicio < 0 ? -1 : texto.indexOf('\n  }', inicio + 1);
  if (inicio < 0 || fin < 0) throw new Error('inyección: no encuentro el bloque de la cabecera');
  const bloque = texto.slice(inicio + 1, fin + '\n  }'.length);
  if (bloque !== `  "cabecera": ${sangrado(paquete.cabecera)}`) throw new Error('inyección: la cabecera tiene otro formato del que se regeneraría; no se reescribe');
  const { calibracion: _anterior, ...resto } = paquete.cabecera;
  const cabecera = { ...resto, calibracion };
  const salida = `${texto.slice(0, inicio + 1)}  "cabecera": ${sangrado(cabecera)}${texto.slice(fin + '\n  }'.length)}`;
  const esperado = JSON.stringify({ ...paquete, cabecera });
  if (JSON.stringify(JSON.parse(salida)) !== esperado) throw new Error('inyección: el paquete resultante no es el esperado');
  return salida;
}
