/**
 * [PROPIO] Tipos mínimos de silabea 1.0.0 (incorporado en silabea.cjs; no trae
 * declaraciones propias). Solo lo que se usa, leído de su README y de su
 * salida: getSilabas(palabra) devuelve, entre otras cosas,
 * `silabas: { inicioPosicion, silaba }[]`. Es `.d.cts` porque el fichero que
 * describe es CommonJS (`module.exports = silabaJS`).
 */
interface Silaba {
  inicioPosicion: number;
  silaba: string;
}
interface Resultado {
  palabra: string;
  numeroSilaba: number;
  silabas: Silaba[];
}
declare const silabea: { getSilabas(palabra: string): Resultado };
export = silabea;
