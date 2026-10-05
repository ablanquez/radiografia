/**
 * El color para los jueces del encargo 10.4, Tanda 5 (contraste.spec.ts): el contraste de WCAG 2.2, la simulación del
 * daltonismo de Machado, Oliveira y Fernandes (2009) y la diferencia de color CIEDE2000. Sin dependencias; los colores,
 * como los da getComputedStyle («rgb(r, g, b)» o «rgba(r, g, b, a)»), en sRGB de 8 bits.
 *
 * [DOC] https://www.w3.org/TR/WCAG22/#dfn-relative-luminance — «L = 0.2126 * R + 0.7152 * G + 0.0722 * B», con «if
 *    RsRGB <= 0.04045 then R = RsRGB/12.92 else R = ((RsRGB+0.055)/1.055) ^ 2.4» y «RsRGB = R8bit/255» (igual G y B).
 * [DOC] https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio — «(L1 + 0.05) / (L2 + 0.05), where L1 is the relative
 *    luminance of the lighter of the colors, and L2 is the relative luminance of the darker of the colors».
 * [DOC] https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html — Machado, Oliveira y Fernandes,
 *    «A Physiologically-based Model for Simulation of Color Vision Deficiency», IEEE TVCG 15(6), 2009, pp. 1291-1298;
 *    «Table 1: Simulation matrices», con la severidad 1.0, que «represents the highest severity or a case of dichromacy»:
 *    sus tres matrices (protanomalía, deuteranomalía y tritanomalía) son las de la protanopía, la deuteranopía y la
 *    tritanopía. Se multiplica la matriz por el vector RGB («a single matrix multiplication», su Eq. 1).
 *    [PROPIO] Sobre RGB lineal: ni la página ni el artículo nombran la función de transferencia (NO CONSTA), y el modelo
 *    obtiene la transformación «by projecting the spectral power distributions ϕR(λ), ϕG(λ), and ϕB(λ) of the RGB
 *    primaries» (artículo, § 4.1, Eq. 8), que es luz, lineal. Así las aplica también Chrome en DevTools («Emulate vision
 *    deficiencies»): en un feColorMatrix de SVG (third_party/blink/renderer/core/css/vision_deficiency.cc, con la cita a
 *    Machado 2009), y color-interpolation-filters vale por defecto linearRGB (MDN: «This is the default property value»).
 *    Con las matrices sobre los valores con gamma, las distancias cambian (el acta lo dice). El resultado se recorta a
 *    [0, 1].
 * [DOC] https://www.w3.org/TR/css-color-4/#color-conversion-code — CSS Color 4 (borrador del 30/09/2026), § 19, «Sample
 *    code for Color Conversions» (no normativo): lin_sRGB, lin_sRGB_to_XYZ (D65), D65_to_D50 (Bradford) y XYZ_to_Lab (D50),
 *    la CIELAB de lab() en CSS. Las matrices y las constantes, copiadas de ahí.
 * [DOC] https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/ — G. Sharma, W. Wu y E. N. Dalal, «The CIEDE2000
 *    Color-Difference Formula: Implementation Notes, Supplementary Test Data, and Mathematical Observations», Color
 *    Research and Application 30(1), 2005, pp. 21-30: la fórmula con kL = kC = kH = 1, y sus 34 pares de prueba
 *    (ciede2000testdata.txt) en contraste.spec.ts, que validan esta implementación.
 */

/** Un color sRGB de 8 bits, de 0 a 255, con su opacidad de 0 a 1. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** «rgb(…)» o «rgba(…)» de getComputedStyle, también con la sintaxis de espacios y «/». */
export function leerColor(css: string): Rgb {
  const n = css.match(/-?[\d.]+%?/g)?.map((x) => (x.endsWith('%') ? Number.parseFloat(x) / 100 : Number.parseFloat(x)));
  if (!/^rgba?\(/.test(css.trim()) || n === undefined || n.length < 3) throw new Error(`color que no es rgb(): ${css}`);
  return { r: n[0]!, g: n[1]!, b: n[2]!, a: n[3] ?? 1 };
}

/** El color con su opacidad sobre un fondo opaco (composición «source-over»). */
export function sobre(color: Rgb, fondo: Rgb): Rgb {
  const mezcla = (c: number, f: number): number => c * color.a + f * (1 - color.a);
  return { r: mezcla(color.r, fondo.r), g: mezcla(color.g, fondo.g), b: mezcla(color.b, fondo.b), a: 1 };
}

export const enHex = (c: Rgb): string => `#${[c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;

/** El canal de 8 bits a luz lineal (WCAG 2.2; CSS Color 4, lin_sRGB). */
const lineal = (c8: number): number => {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
/** La luz lineal a sRGB de 8 bits (CSS Color 4, gam_sRGB), recortada a [0, 1]. */
const gamma = (l: number): number => {
  const c = Math.min(1, Math.max(0, l));
  return 255 * (c > 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c);
};

/** La luminancia relativa de WCAG 2.2. */
export function luminancia(c: Rgb): number {
  return 0.2126 * lineal(c.r) + 0.7152 * lineal(c.g) + 0.0722 * lineal(c.b);
}

/** El ratio de contraste de WCAG 2.2 entre dos colores opacos, de 1 a 21. */
export function contraste(a: Rgb, b: Rgb): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
}

export type Daltonismo = 'protanopía' | 'deuteranopía' | 'tritanopía';

/** Machado, Oliveira y Fernandes (2009), Table 1, severidad 1.0, por filas. */
export const MATRICES_DE_MACHADO: Readonly<Record<Daltonismo, readonly (readonly [number, number, number])[]>> = {
  protanopía: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopía: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopía: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** Cómo ve un color opaco una persona con ese daltonismo (Machado 2009, sobre RGB lineal). */
export function simular(c: Rgb, tipo: Daltonismo): Rgb {
  const v = [lineal(c.r), lineal(c.g), lineal(c.b)];
  const [r, g, b] = MATRICES_DE_MACHADO[tipo].map((fila) => gamma(fila[0] * v[0]! + fila[1] * v[1]! + fila[2] * v[2]!));
  return { r: r!, g: g!, b: b!, a: 1 };
}

const multiplicar = (m: readonly (readonly number[])[], v: readonly number[]): number[] => m.map((fila) => fila.reduce((s, x, i) => s + x * v[i]!, 0));

/** CSS Color 4, § 19: lin_sRGB_to_XYZ. */
const SRGB_A_XYZ = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
];
/** CSS Color 4, § 19: D65_to_D50, la adaptación de Bradford. */
const D65_A_D50 = [
  [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
  [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
  [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
];
const D50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585];

/** CIELAB (D50, la de lab() en CSS) de un color opaco: [L, a, b]. CSS Color 4, § 19, XYZ_to_Lab. */
export function lab(c: Rgb): [number, number, number] {
  const xyz = multiplicar(D65_A_D50, multiplicar(SRGB_A_XYZ, [lineal(c.r), lineal(c.g), lineal(c.b)]));
  const ε = 216 / 24389;
  const κ = 24389 / 27;
  const f = xyz.map((x, i) => x / D50[i]!).map((x) => (x > ε ? Math.cbrt(x) : (κ * x + 16) / 116));
  return [116 * f[1]! - 16, 500 * (f[0]! - f[1]!), 200 * (f[1]! - f[2]!)];
}

const grados = (rad: number): number => (rad * 180) / Math.PI;
const radianes = (g: number): number => (g * Math.PI) / 180;

/** La diferencia CIEDE2000 entre dos colores CIELAB, con kL = kC = kH = 1 (Sharma, Wu y Dalal 2005, ecuaciones 1-22). */
export function ciede2000([l1, a1, b1]: readonly number[], [l2, a2, b2]: readonly number[]): number {
  const c1 = Math.hypot(a1!, b1!);
  const c2 = Math.hypot(a2!, b2!);
  const cMedia7 = ((c1 + c2) / 2) ** 7;
  const g = 0.5 * (1 - Math.sqrt(cMedia7 / (cMedia7 + 25 ** 7)));
  const [a1p, a2p] = [(1 + g) * a1!, (1 + g) * a2!];
  const [c1p, c2p] = [Math.hypot(a1p, b1!), Math.hypot(a2p, b2!)];
  const tono = (b: number, ap: number): number => (b === 0 && ap === 0 ? 0 : (grados(Math.atan2(b, ap)) + 360) % 360);
  const [h1p, h2p] = [tono(b1!, a1p), tono(b2!, a2p)];
  const dLp = l2! - l1!;
  const dCp = c2p - c1p;
  let dhp = 0;
  if (c1p * c2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin(radianes(dhp / 2));
  const lpMedia = (l1! + l2!) / 2;
  const cpMedia = (c1p + c2p) / 2;
  let hpMedia = h1p + h2p;
  if (c1p * c2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hpMedia = (h1p + h2p) / 2;
    else if (h1p + h2p < 360) hpMedia = (h1p + h2p + 360) / 2;
    else hpMedia = (h1p + h2p - 360) / 2;
  }
  const t = 1 - 0.17 * Math.cos(radianes(hpMedia - 30)) + 0.24 * Math.cos(radianes(2 * hpMedia)) + 0.32 * Math.cos(radianes(3 * hpMedia + 6)) - 0.2 * Math.cos(radianes(4 * hpMedia - 63));
  const dTheta = 30 * Math.exp(-(((hpMedia - 275) / 25) ** 2));
  const cpMedia7 = cpMedia ** 7;
  const rc = 2 * Math.sqrt(cpMedia7 / (cpMedia7 + 25 ** 7));
  const sl = 1 + (0.015 * (lpMedia - 50) ** 2) / Math.sqrt(20 + (lpMedia - 50) ** 2);
  const sc = 1 + 0.045 * cpMedia;
  const sh = 1 + 0.015 * cpMedia * t;
  const rt = -Math.sin(radianes(2 * dTheta)) * rc;
  return Math.sqrt((dLp / sl) ** 2 + (dCp / sc) ** 2 + (dHp / sh) ** 2 + rt * (dCp / sc) * (dHp / sh));
}
