/**
 * Vuelca las celdas de los seis ficheros de calibración (data/calibracion/
 * <género>.json: general, noticia, administrativo, narrativa-clasica,
 * academico, opinion) en cabecera.calibracion de paquetes/radiografia.json
 * (encargo 5.5, parada 3) y valida el paquete en vivo. Se ejecuta a mano:
 *
 *   node herramientas/calibrar/inyectar-calibracion.ts   (desde motor/)
 *
 * Solo las celdas (inyeccion.ts); las notas se quedan en data/calibracion/.
 * Si el paquete no valida, no se escribe. El juez del paquete real
 * (inyeccion.spec.ts) exige que lo inyectado sea exactamente lo de los
 * ficheros, y standalone.spec.ts, que el validador del navegador diga lo
 * mismo que el de Ajv en vivo.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validarPaquete } from '../../src/validar.ts';
import { GENEROS_CALIBRADOS, conCalibracion, unirCalibraciones } from './inyeccion.ts';

const PAQUETE = fileURLToPath(new URL('../../../paquetes/radiografia.json', import.meta.url));
const ficheros = GENEROS_CALIBRADOS.map((genero) => {
  const f = JSON.parse(readFileSync(new URL(`../../../data/calibracion/${genero}.json`, import.meta.url), 'utf8'));
  if (f.genero !== genero) throw new Error(`data/calibracion/${genero}.json dice ser de «${f.genero}»`);
  return { genero, celdas: f.celdas };
});
const calibracion = unirCalibraciones(ficheros);
const texto = conCalibracion(readFileSync(PAQUETE, 'utf8'), calibracion);
const r = validarPaquete(JSON.parse(texto));
if (!r.valido) throw new Error(`PARA: el paquete con la calibración no valida:\n${r.errores.map((e) => `  ${JSON.stringify(e)}`).join('\n')}`);
writeFileSync(PAQUETE, texto, 'utf8');

const celdas = Object.values(calibracion).reduce((s, porGenero) => s + Object.values(porGenero).reduce((t, tramos) => t + Object.keys(tramos).length, 0), 0);
console.log(`paquetes/radiografia.json: ${Object.keys(calibracion).length} claves, ${GENEROS_CALIBRADOS.length} géneros, ${celdas} celdas; valida en vivo`);
for (const g of GENEROS_CALIBRADOS) console.log(`  ${g}: ${Object.values(calibracion).reduce((s, porGenero) => s + Object.keys(porGenero[g] ?? {}).length, 0)} celdas`);
