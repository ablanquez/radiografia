/**
 * Lo que se mide en cada documento humano (encargo 5.5): las trece métricas
 * del registro del motor (metricas/nombres.ts) y el total de RadiografIA,
 * `_total-radiografia` (CLAVE_TOTAL_RADIOGRAFIA). Lo juzga medir.spec.ts.
 *
 * [PROPIO, encargo 5.5] Las métricas se calculan con el MISMO segmentador y
 *    las mismas funciones que medirán el texto de un usuario (analizarTexto y
 *    METRICAS). El total es `puntuacion.total` de analizar() con el paquete
 *    RadiografIA y el GÉNERO del corpus (las reglas con `generos` se activan
 *    como se activarían para un texto de ese género); para la mezcla
 *    «general», con «general». Desde el 5.6 el total incluye las reglas
 *    estadísticas, comparadas con las celdas inyectadas en el paquete.
 * [PROPIO, parada de narrativa] Los disparos: cuántas señales da cada regla
 *    que puntúa (las de patrón, las estructurales y las del texto entero; no
 *    las informativas, que son contexto), del mismo analizar(); desde el 5.6,
 *    también las estadísticas.
 */
import { analizar } from '../../src/analizar.ts';
import { analizarTexto } from '../../src/texto.ts';
import { METRICAS } from '../../src/metricas/index.ts';
import { CLAVE_TOTAL_RADIOGRAFIA, NOMBRES_DE_METRICAS } from '../../src/metricas/nombres.ts';
import type { Paquete } from '../../src/paquete.ts';

export function medirConDisparos(texto: string, genero: string, radiografia: Paquete): { valores: Record<string, number | null>; disparos: Record<string, number> } {
  const segmentado = analizarTexto(texto);
  const valores: Record<string, number | null> = {};
  for (const nombre of NOMBRES_DE_METRICAS) valores[nombre] = METRICAS[nombre](segmentado);
  const r = analizar(texto, [radiografia], { genero });
  valores[CLAVE_TOTAL_RADIOGRAFIA] = r.paquetes[0]!.puntuacion.total;
  const disparos: Record<string, number> = {};
  for (const s of [...r.senales, ...r.senalesTexto]) disparos[s.reglaId] = (disparos[s.reglaId] ?? 0) + 1;
  return { valores, disparos };
}

export function medirDocumento(texto: string, genero: string, radiografia: Paquete): Record<string, number | null> {
  return medirConDisparos(texto, genero, radiografia).valores;
}
