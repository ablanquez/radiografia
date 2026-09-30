/**
 * Prepara las entradas del ORÁCULO de MTLD y HD-D (encargo 4.3): las palabras
 * que el motor ve en cada texto de referencia, con su misma segmentación
 * (texto.ts) y su misma base léxica (metricas/base.ts), para pasárselas a las
 * implementaciones de referencia con oraculo-ld.py. Se ejecuta a mano:
 *
 *   node herramientas/oraculo-ld.ts > <entradas.json>
 *
 * Entradas (fixtures/referencia/):
 *   · texto-prueba-322.txt — el texto de prueba del 4.2 (322 palabras de prosa);
 *   · mtld-bordes.json — tres listas de 60 palabras (A, B, C) hechas para los
 *     tres bordes en que TAALED y lexical_diversity difieren en MTLD. Cada una
 *     se escribe como texto (palabras separadas por un espacio y un punto al
 *     final), igual que en mtld.spec.ts, y se segmenta.
 *
 * Salida: { "texto-prueba-322": [...], "A": [...], "B": [...], "C": [...] }.
 */
import { readFileSync } from 'node:fs';
import { analizarTexto } from '../src/texto.ts';
import { palabrasDeProsa } from '../src/metricas/base.ts';

const referencia = new URL('../fixtures/referencia/', import.meta.url);
const bordes = JSON.parse(readFileSync(new URL('mtld-bordes.json', referencia), 'utf8')) as Record<'A' | 'B' | 'C', { palabras: string[] }>;

const textos: Record<string, string> = {
  'texto-prueba-322': readFileSync(new URL('texto-prueba-322.txt', referencia), 'utf8'),
  A: `${bordes.A.palabras.join(' ')}.`,
  B: `${bordes.B.palabras.join(' ')}.`,
  C: `${bordes.C.palabras.join(' ')}.`,
};

const salida = Object.fromEntries(Object.entries(textos).map(([nombre, texto]) => [nombre, palabrasDeProsa(analizarTexto(texto))]));
process.stdout.write(`${JSON.stringify(salida)}\n`);
