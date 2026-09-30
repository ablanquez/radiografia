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
 *    «general», con «general». Hoy el paquete no tiene reglas estadísticas:
 *    el total se recalcula en el 5.6.
 */
import { analizar } from '../../src/analizar.ts';
import { analizarTexto } from '../../src/texto.ts';
import { METRICAS } from '../../src/metricas/index.ts';
import { CLAVE_TOTAL_RADIOGRAFIA, NOMBRES_DE_METRICAS } from '../../src/metricas/nombres.ts';
import type { Paquete } from '../../src/paquete.ts';

export function medirDocumento(texto: string, genero: string, radiografia: Paquete): Record<string, number | null> {
  const segmentado = analizarTexto(texto);
  const valores: Record<string, number | null> = {};
  for (const nombre of NOMBRES_DE_METRICAS) valores[nombre] = METRICAS[nombre](segmentado);
  valores[CLAVE_TOTAL_RADIOGRAFIA] = analizar(texto, [radiografia], { genero }).paquetes[0]!.puntuacion.total;
  return valores;
}
