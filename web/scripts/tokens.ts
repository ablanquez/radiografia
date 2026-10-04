/**
 * Los tokens de diseño en CSS (encargo 10.4, Tanda 1): de docs/figma/tokens.json
 * (DTCG 2025.10, la única fuente de colores, tipografías, tamaños, radios y
 * foco) a custom properties en :root, con el nombre de su ruta en el JSON:
 * color.ink → --color-ink, subrayado.lexico.estilo → --subrayado-lexico-estilo,
 * tipografia.fontFamily.ui → --tipografia-font-family-ui (camelCase a guiones).
 * Lo escribe en web/src/estilos/tokens.css scripts/tokens-a-css.ts, antes de
 * `astro dev` y de `astro build`; lo juzga jueces/tokens.spec.ts.
 *
 * [DOC] https://www.designtokens.org/tr/2025.10/format/ — un token es un
 *    objeto con $value; «if any of the token's parent groups have a $type
 *    property, then the token's type is inherited from the closest parent
 *    group with a $type property» (§ 5.2.2); dimension: «a numeric value […]
 *    and unit of measurement ("px" or "rem")» (§ 8.2); number: «a JSON number
 *    value» (§ 8.7); fontFamily: «a font name or an array of font names
 *    (ordered from most to least preferred)» (§ 8.3);
 *    shadow: color, offsetX, offsetY, blur y spread, o una lista de sombras
 *    (§ 9.6); $extensions, datos propios de una herramienta con nombre de
 *    dominio invertido (§ 5.2.3).
 * [DOC] https://www.designtokens.org/tr/2025.10/color/ — $value de color:
 *    colorSpace y components; alpha «between 0 and 1» y, si falta, 1; hex,
 *    «a fallback value of the color», en «6 digit CSS hex color notation».
 * [PROPIO] Lo que el JSON tiene fuera de la especificación, dicho y no
 *    adivinado: la unidad de los number en em, pt o mm va en
 *    $extensions["com.github.ablanquez.radiografia"].unidad (DTCG no admite
 *    esas unidades en dimension; docs/figma/README.md), y el $type "string"
 *    del estilo de línea de cada familia, que venía de Make, sale tal cual.
 *    Un tipo que no esté aquí, un alias («{…}») o un hex que no case con sus
 *    componentes hacen fallar la conversión: nada se escribe a medias.
 */

/** Un token ya convertido: su custom property y su valor en CSS. */
export interface TokenCss {
  ruta: string;
  nombre: string;
  valor: string;
}

const EXTENSION = 'com.github.ablanquez.radiografia';
type Nodo = Record<string, unknown>;

const aGuiones = (s: string): string => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
export const nombreCss = (ruta: readonly string[]): string => `--${ruta.map(aGuiones).join('-')}`;

const dosHex = (c: number): string => Math.round(c * 255).toString(16).padStart(2, '0');

function color(v: unknown, ruta: string): string {
  const { colorSpace, components, alpha, hex } = v as { colorSpace?: string; components?: number[]; alpha?: number; hex?: string };
  if (colorSpace !== 'srgb' || !Array.isArray(components) || components.length !== 3) throw new Error(`${ruta}: solo se convierten colores srgb de tres componentes`);
  const propio = `#${components.map(dosHex).join('')}`;
  if (hex !== undefined && hex.toLowerCase() !== propio) throw new Error(`${ruta}: hex ${hex} y componentes ${propio} no casan`);
  if (alpha === undefined || alpha === 1) return propio;
  return `rgb(${components.map((c) => Math.round(c * 255)).join(' ')} / ${alpha})`;
}

function dimension(v: unknown, ruta: string): string {
  const { value, unit } = v as { value?: number; unit?: string };
  if (typeof value !== 'number' || (unit !== 'px' && unit !== 'rem')) throw new Error(`${ruta}: dimension con value numérico y unit px o rem`);
  return `${value}${unit}`;
}

const familia = (nombre: string): string => (/[\s\d]/.test(nombre) ? `'${nombre}'` : nombre);

function valorCss(tipo: string | undefined, token: Nodo, ruta: string): string {
  const v = token['$value'];
  if (typeof v === 'string' && v.startsWith('{')) throw new Error(`${ruta}: los alias no se convierten`);
  switch (tipo) {
    case 'color':
      return color(v, ruta);
    case 'dimension':
      return dimension(v, ruta);
    case 'number': {
      if (typeof v !== 'number') throw new Error(`${ruta}: number sin número`);
      const unidad = ((token['$extensions'] as Nodo | undefined)?.[EXTENSION] as { unidad?: string } | undefined)?.unidad;
      return `${v}${unidad ?? ''}`;
    }
    case 'fontFamily':
      return (Array.isArray(v) ? v : [v]).map((n) => familia(String(n))).join(', ');
    case 'shadow':
      return (Array.isArray(v) ? v : [v])
        .map((s: Nodo) => `${dimension(s['offsetX'], ruta)} ${dimension(s['offsetY'], ruta)} ${dimension(s['blur'], ruta)} ${dimension(s['spread'], ruta)} ${color(s['color'], ruta)}`)
        .join(', ');
    case 'string':
      if (typeof v !== 'string') throw new Error(`${ruta}: string sin texto`);
      return v;
    default:
      throw new Error(`${ruta}: el tipo «${tipo}» no se convierte`);
  }
}

/** Todos los tokens del JSON, en su orden, con el tipo heredado del grupo más cercano. */
export function tokensACss(json: Nodo): TokenCss[] {
  const salida: TokenCss[] = [];
  const recorrer = (nodo: Nodo, ruta: string[], tipo: string | undefined): void => {
    const suTipo = typeof nodo['$type'] === 'string' ? (nodo['$type'] as string) : tipo;
    if ('$value' in nodo) {
      const r = ruta.join('.');
      salida.push({ ruta: r, nombre: nombreCss(ruta), valor: valorCss(suTipo, nodo, r) });
      return;
    }
    for (const [clave, hijo] of Object.entries(nodo)) {
      if (clave.startsWith('$') || typeof hijo !== 'object' || hijo === null) continue;
      recorrer(hijo as Nodo, [...ruta, clave], suTipo);
    }
  };
  recorrer(json, [], undefined);
  return salida;
}

/** La hoja entera: el aviso de que es generada y :root con un token por línea. */
export function hojaDeTokens(json: Nodo): string {
  const lineas = tokensACss(json).map((t) => `  ${t.nombre}: ${t.valor};`);
  return [
    '/* Generado por web/scripts/tokens-a-css.ts desde docs/figma/tokens.json (DTCG 2025.10). No se edita a mano: se cambia el JSON. */',
    ':root {',
    ...lineas,
    '}',
    '',
  ].join('\n');
}
