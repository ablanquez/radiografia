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
 *
 * Las páginas del catálogo (encargo 7.1, b) sacan de aquí TODA su interfaz,
 * también lo que escriben en su HTML: el juez no lee su HTML, porque lleva el
 * contenido de las fichas, que menciona las formas que las reglas buscan.
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
export const SIN_DATO = 'sin dato';

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

// El desglose. Lo de cada regla va detrás de su nombre (enlazado a su ficha desde el 7.1) y su id: «Nombre (id): …».
export const total = (cifra: string, unidad: string): string => `Total: ${cifra} ${unidad}.`;
export const reglaConSenales = (n: number, contribucion: string): string => `${n} ${n === 1 ? 'señal' : 'señales'}, contribución ${contribucion}`;
export const reglaInformativa = (n: number): string => `${n} ${n === 1 ? 'señal' : 'señales'}`;
export const NINGUNA_SENAL = 'Ninguna señal.';
export const DEL_TEXTO_ENTERO = 'Del texto entero';
export const INFORMATIVAS_EN_EL_DESGLOSE = 'Informativas: se enseñan, no suman';
export const SIN_CALIBRACION = 'Sin calibración';
export const NO_APLICADAS = 'No aplicadas';
export const LADOS: Readonly<Record<string, string>> = { arriba: 'por encima de la banda humana', abajo: 'por debajo de la banda humana' };
export const DENTRO_DE_LA_BANDA = 'dentro de la banda humana';
export const ausencia = (coincidencias: number, minimo: number): string =>
  `ausencia: ${coincidencias} ${coincidencias === 1 ? 'aparición' : 'apariciones'}; señala por debajo de ${minimo}`;
export const estadistica = (metrica: string, valor: string, lado: string, p1: string, p5: string, p50: string, p95: string, p99: string): string =>
  `${metrica} = ${valor}, ${lado}; en los textos humanos: p1 ${p1} · p5 ${p5} · mediana ${p50} · p95 ${p95} · p99 ${p99}`;

// El catálogo de reglas (encargo 7.1, b): src/pages/reglas/, src/layouts/Catalogo.astro y src/catalogo/.
// Solo la interfaz: el contenido de las fichas (nombre, explicación, ejemplos…) viene de los paquetes y menciona
// las formas que las reglas buscan; no es texto de la web (mención, no uso), y el juez de textos no lo analiza.
export const CATALOGO = 'Catálogo de reglas';
export const VOLVER_AL_CATALOGO = 'Volver al catálogo';
export const PROBAR_EN_EL_ANALIZADOR = 'Probar en el analizador';
export const INFORMATIVA = 'Regla informativa: se señala y no suma.';
export const PAQUETE = 'Paquete';
export const FAMILIA = 'Familia';
export const DETECTOR = 'Detector';
export const PESO = 'Peso';
export const SEVERIDAD = 'Severidad';
export const COMO_BUSCA = 'Cómo busca';
export const EXCEPCIONES = 'Excepciones';
export const NINGUNA = 'Ninguna.';
export const FUENTES = 'Fuentes';
export const DONDE_DISPARA = 'Ejemplos en los que dispara';
export const DONDE_NO_DISPARA = 'Ejemplos en los que no dispara';
export const paqueteConVersion = (nombre: string, version: string, descripcion: string): string => `${nombre} ${version}. ${descripcion}`;

// Los parámetros de cada detector, en palabras (catalogo.ts, parametrosEnLlano).
export const DONDE_MIRA = 'Dónde mira';
export const AMBITOS: Readonly<Record<string, string>> = { palabra: 'palabra a palabra', frase: 'en cada frase entera' };
export const POSICIONES: Readonly<Record<string, string>> = {
  'inicio-frase': 'al principio de cada frase',
  'fin-frase': 'al final de cada frase',
  'inicio-parrafo': 'al principio de cada párrafo',
  'fin-parrafo': 'al final de cada párrafo',
  'ultimo-parrafo': 'en el último párrafo',
  cualquiera: 'en cualquier punto de cada párrafo',
};
export const FORMAS = 'Formas';
export const numeroDeFormas = (n: number): string => `${n} ${n === 1 ? 'forma' : 'formas'}`;
export const EXPRESION_REGULAR = 'Expresión regular';
export const BANDERAS = 'Banderas';
export const CUANDO_SENALA = 'Cuándo señala';
/** [PROPIO] Las 300 palabras son el tramo completo, firmado el 29/09 (plan, alcance, punto 11): por debajo, una ausencia no se juzga. */
export const ausenciaDe = (minimo: number): string =>
  `${minimo === 1 ? 'si no aparece ninguna' : `si aparecen menos de ${minimo}`} en el texto entero, y solo con 300 palabras de prosa o más`;
export const minimoDeApariciones = (minimo: number): string => `con ${minimo} apariciones o más en el texto`;
export const REPETICION = 'Repetición';
export const repeticion = (veces: number): string => `solo cuenta la forma que aparece ${veces} veces o más`;
export const TAMBIEN_MIRA = 'También mira';
export const NO_PROSA = 'viñetas, encabezados y tablas';
export const GENEROS = 'Géneros';
export const soloEnGeneros = (nombres: readonly string[]): string =>
  `solo en ${nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}` : nombres.join('')}`;
export const METRICA = 'Métrica';
export const DISPARA = 'Dispara';
export const DIRECCIONES: Readonly<Record<string, string>> = {
  mayor: 'por encima de la banda humana',
  menor: 'por debajo de la banda humana',
  ambas: 'por encima o por debajo de la banda humana',
};
export const BANDA_HUMANA = 'Banda humana';
export const entrePercentiles = (abajo: string, arriba: string): string =>
  `entre los percentiles ${abajo} y ${arriba} de los textos humanos de su género y longitud`;

// El índice del catálogo (src/pages/reglas/index.astro y catalogo/buscador.ts).
export const PRESENTACION_DEL_CATALOGO =
  'Todas las reglas de los dos paquetes incluidos. Cada una tiene su propia página, con su explicación, sus fuentes y sus ejemplos.';
export const BUSCAR = 'Buscar por nombre, id o explicación';
export const QUITAR_FILTROS = 'Quitar filtros';
export const recuentoDeReglas = (n: number): string => `${n} ${n === 1 ? 'regla' : 'reglas'}`;
