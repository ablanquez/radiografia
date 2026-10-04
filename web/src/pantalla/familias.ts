/**
 * El color, la línea y la sigla de cada familia (encargo 10.4, Tanda 2;
 * DISEÑO §4): por su id y su paquete, no por el orden en que llegan. Cada
 * familia de los paquetes incluidos tiene sus tokens en docs/figma/tokens.json
 * (color, tinte al 14 %, tinte del activo al 28 % y línea: estilo, grosor y
 * desplazamiento); la clase fam-<token> de estilos/familias.css los reúne.
 *
 * Los paquetes propios no tienen color reservado: los ocho de la paleta son de
 * las ocho familias incluidas, así que no queda hueco libre, y van en gris
 * (ink-2) y siempre discontinuos (DISEÑO §4: «el color del hueco libre o el
 * gris, siempre discontinuo»; clase fam-propia). El paquete se dice siempre en
 * texto, y la sigla de su familia distingue sus subrayados.
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html — 1.4.1:
 *    «Color is not used as the only visual means of conveying information».
 *
 * La clave es el nombre del paquete: un paquete propio no puede llamarse como
 * uno incluido (propios.ts, noSeCargaPorNombreDeIncluido).
 */

/** Los ocho nombres de familia de los tokens de diseño (tokens.json, color y subrayado). */
export const TOKENS_DE_FAMILIA = ['lexico', 'discurso', 'sintaxis', 'estadistica', 'puntuacion', 'canal', 'gramatica', 'ortotipografia'] as const;
export type TokenDeFamilia = (typeof TOKENS_DE_FAMILIA)[number];

/** El token de cada familia de los paquetes incluidos: paquete → id de familia → token. */
export const TOKEN_DE_FAMILIA: Readonly<Record<string, Readonly<Record<string, TokenDeFamilia>>>> = {
  RadiografIA: {
    lexico: 'lexico',
    sintaxis: 'sintaxis',
    'puntuacion-formato': 'puntuacion',
    estadistica: 'estadistica',
    discurso: 'discurso',
    canal: 'canal',
  },
  'Español correcto': { gramatica: 'gramatica', ortotipografia: 'ortotipografia' },
};

/**
 * El ojo de cada familia (encargo 10.4, Tanda 2; DISEÑO §6.1, punto 3): las
 * familias de un tramo que se siguen viendo, en su orden. La primera que
 * queda lleva el tinte; si no queda ninguna, el tramo es texto sin más.
 */
export function capasVisibles(familias: readonly string[], ocultas: ReadonlySet<string>): string[] {
  return familias.filter((f) => !ocultas.has(f));
}

/** La clase de una familia: la de su token o, si no lo tiene (un paquete propio), la de los propios. */
export function claseDeFamilia(paquete: string, familia: string): string {
  const delPaquete = Object.hasOwn(TOKEN_DE_FAMILIA, paquete) ? TOKEN_DE_FAMILIA[paquete]! : {};
  return Object.hasOwn(delPaquete, familia) ? `fam-${delPaquete[familia]!}` : 'fam-propia';
}
