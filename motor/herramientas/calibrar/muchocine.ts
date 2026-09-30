/**
 * Las críticas de MuchoCine (encargo 5.5, género «opinion»): un XML por
 * crítica en el repositorio de ITALIC-US (Spanish-Movie-Reviews). Sin red: lo
 * juzga muchocine.spec.ts.
 *
 * [PROPIO, estructura vista en los 3.878 XML del commit 4f8efab, 30/09/2026]
 *    Sin declaración XML y en ISO-8859-1 (ninguno es UTF-8 válido y ninguno
 *    tiene bytes 0x80-0x9F, así que Latin-1 y Windows-1252 coinciden):
 *    `<review author="…" title="…" rank="N" maxRank="5" source="muchocine">`,
 *    `<summary>…</summary>` y `<body>…</body>`, el cuerpo en una sola línea.
 * [PROPIO, decisión de Antonio a la parada 1] Solo el CUERPO de la crítica
 *    (no el resumen). Sus entidades se decodifican (html.ts); lo que parece
 *    una entidad y no lo es («Cohen&Cohen;», crítica 1628) o un «<» suelto
 *    («<Pero yendo al grano», 2633) es texto del autor y se queda tal cual.
 */
import { decodificar } from './html.ts';

export interface Critica {
  rango: number;
  maximo: number;
  cuerpo: string;
  /** Lo que parecía una entidad y se dejó tal cual. */
  desconocidas: string[];
}

export function leerCritica(bytes: Buffer): Critica {
  const xml = bytes.toString('latin1');
  const cabecera = /<review\b([^>]*)>/.exec(xml)?.[1];
  const cuerpo = /<body>([\s\S]*?)<\/body>/.exec(xml)?.[1];
  if (cabecera === undefined || cuerpo === undefined) throw new Error('muchocine: sin <review> o sin <body>');
  const atributo = (n: string) => Number(new RegExp(`\\b${n}="(\\d+)"`).exec(cabecera)?.[1]);
  const { texto, desconocidas } = decodificar(cuerpo.replace(/\r\n?/g, '\n').trim());
  return { rango: atributo('rank'), maximo: atributo('maxRank'), cuerpo: texto, desconocidas };
}
