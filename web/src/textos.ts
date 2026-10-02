/**
 * Las cadenas de la interfaz que pinta el script de la página (encargo 6.3,
 * b): todas aquí, para que el juez de los textos de la web
 * (web/jueces/textos-web.spec.ts) las pase por los dos paquetes junto con el
 * texto visible de dist/index.html. Las que llevan datos son funciones, y el
 * juez las llama con datos de muestra.
 *
 * Lo escrito en index.astro (título, eslogan, etiquetas, botones, nota) va en
 * el HTML, y el juez lo lee de dist/index.html. Tampoco están aquí, porque no
 * son textos de la web: lo que viene de los paquetes (nombres de familia y de
 * paquete, descripción, fichas) y lo que dice el motor (motivo, aviso, bandas,
 * unidad, motivos de las no aplicadas y de las sin calibración).
 */

// La carga de los paquetes (pantalla.ts, cargar.ts).
export const SIN_PAQUETES = 'No se puede analizar: falta algún paquete de reglas.';
export const paquetesCargados = (nombres: readonly string[]): string => `Paquetes cargados y validados: ${nombres.join(' y ')}.`;
export const PROBLEMAS_DE_CARGA = 'No se han podido cargar los paquetes de reglas, y sin ellos no se analiza nada:';
export const noSeCargo = (url: string, motivo: string): string => `no se pudo cargar ${url}: ${motivo}`;
/** El «paquete» que se nombra cuando falla el análisis mismo. */
export const EL_ANALISIS = 'el análisis';

// Los textos de ejemplo (ejemplos.ts).
export const ejemploNoCargado = (url: string, motivo: string): string => `No se ha podido cargar el ejemplo ${url}: ${motivo}.`;

// Los géneros del selector (generos.ts). [PROPIO, firmado en el encargo 6.2]
export const NOMBRES_DE_GENERO: Readonly<Record<string, string>> = {
  general: 'General',
  noticia: 'Noticia',
  administrativo: 'Administrativo',
  'narrativa-clasica': 'Narrativa clásica',
  academico: 'Académico',
  opinion: 'Opinión',
};

// La leyenda.
export const FAMILIAS = 'Familias';
export const MUESTRA_DE_SUBRAYADO = 'subrayado';
export const INFORMATIVAS_EN_LA_LEYENDA = 'Informativas: se señalan y no suman.';

// El panel de un tramo.
export const TITULO_DEL_PANEL = 'Lo que señala este tramo';
export const EXPLICACION = 'Explicación';
export const SUGERENCIA = 'Sugerencia';
export const NIVEL_DE_EVIDENCIA = 'Nivel de evidencia';
export const ORIGEN_DE_LA_LISTA = 'Origen de la lista';
export const SIN_DATO = '—';

// El medidor.
export const TEXTO_INSUFICIENTE = 'Texto insuficiente';
export const POCO_FIABLE = 'Resultado poco fiable';
export const MENOS_DE_100 = 'menos de 100';
export const TRAMOS_EN_PALABRAS: Readonly<Record<string, string>> = { '100-299': '100 a 299', '300-599': '300 a 599', '600+': '600 o más' };
export const sinSenales = (paquete: string): string => `Sin señales: ${paquete} no ha encontrado nada que puntúe en este texto.`;
export const sinCalibracion = (motivo: string): string => `Sin calibración: ${motivo}.`;
export const tuBanda = (banda: string, genero: string, tramo: string): string =>
  `Tu texto queda ${banda} de los textos humanos del género «${genero}» de ${tramo} palabras.`;
export const tusPercentiles = (total: string, n: number, p50: string, p95: string, p99: string): string =>
  `Tu total: ${total}. En esos textos humanos (n = ${n}): mediana ${p50} · p95 ${p95} · p99 ${p99}.`;
export const datosDelTexto = (palabras: number, tramo: string, genero: string): string => `Palabras de prosa: ${palabras} · Tramo: ${tramo} · Género: ${genero}`;

// El desglose.
export const total = (cifra: string, unidad: string): string => `Total: ${cifra} ${unidad}.`;
export const reglaConSenales = (quien: string, n: number, contribucion: string): string => `${quien}: ${n} ${n === 1 ? 'señal' : 'señales'}, contribución ${contribucion}`;
export const reglaInformativa = (quien: string, n: number): string => `${quien}: ${n} ${n === 1 ? 'señal' : 'señales'}`;
export const NINGUNA_SENAL = 'Ninguna señal.';
export const DEL_TEXTO_ENTERO = 'Del texto entero';
export const INFORMATIVAS_EN_EL_DESGLOSE = 'Informativas: se enseñan, no suman';
export const SIN_CALIBRACION = 'Sin calibración';
export const NO_APLICADAS = 'No aplicadas';
export const LADOS: Readonly<Record<string, string>> = { arriba: 'por encima de la banda humana', abajo: 'por debajo de la banda humana' };
export const DENTRO_DE_LA_BANDA = 'dentro de la banda humana';
export const ausencia = (quien: string, coincidencias: number, minimo: number): string =>
  `${quien}: ausencia: ${coincidencias} ${coincidencias === 1 ? 'aparición' : 'apariciones'}; señala por debajo de ${minimo}`;
export const estadistica = (quien: string, metrica: string, valor: string, lado: string, p1: string, p5: string, p50: string, p95: string, p99: string): string =>
  `${quien}: ${metrica} = ${valor}, ${lado}; en los textos humanos: p1 ${p1} · p5 ${p5} · mediana ${p50} · p95 ${p95} · p99 ${p99}`;
