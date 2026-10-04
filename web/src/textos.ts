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

// El cargador de paquetes (encargo 8.1, b; firmado en la parada 1): las casillas de los incluidos, el paquete propio
// (propios.ts) y los avisos. Lo que viene del fichero (su nombre, el del paquete) entra con textContent.
export const noSeCargaPorTamano = (fichero: string, pesa: string, maximo: string): string =>
  `No se carga «${fichero}»: pesa ${pesa} MB y el máximo es ${maximo} MB.`;
export const noSeCargaPorJson = (fichero: string): string => `No se carga «${fichero}»: no es un JSON válido.`;
/** Detrás del anterior: lo que dice el navegador de ese JSON, tal cual y en su idioma (firmado: marcado como suyo). */
export const elNavegadorDice = (detalle: string): string => `El navegador dice: ${detalle}`;
export const noSeCargaPorEsquema = (fichero: string): string => `No se carga «${fichero}»: no cumple el esquema de los paquetes. Esto es lo que falla:`;
/** El nombre ya lo lleva otro paquete propio: se puede quitar ese o renombrar este. */
export const noSeCargaPorNombre = (fichero: string, nombre: string): string =>
  `No se carga «${fichero}»: ya hay un paquete propio que se llama «${nombre}». Dos paquetes con el mismo nombre no se distinguirían en las señales: quita el otro o cambia el nombre en el JSON.`;
/** El nombre es el de un paquete incluido, marcado o no: a ese no se le puede quitar, solo queda renombrar este. */
export const noSeCargaPorNombreDeIncluido = (fichero: string, nombre: string): string =>
  `No se carga «${fichero}»: «${nombre}» es el nombre de un paquete incluido. Dos paquetes con el mismo nombre no se distinguirían en las señales: cambia el nombre en el JSON.`;
export const paquetePropioCargado = (nombre: string, version: string, reglas: number): string =>
  `Cargado «${nombre}» ${version}: ${reglas} ${reglas === 1 ? 'regla' : 'reglas'}.`;
/** Cada paquete propio en su lista. */
export const paquetePropio = (nombre: string, version: string, reglas: number): string => `${nombre} ${version} · ${reglas} ${reglas === 1 ? 'regla' : 'reglas'}`;
export const QUITAR = 'Quitar';
/** El nombre accesible del botón «Quitar» de cada paquete propio: «Quitar» y el paquete. */
export const quitarPaquete = (nombre: string): string => `Quitar «${nombre}»`;
export const SIN_PAQUETES_ACTIVOS = 'Marca al menos un paquete o carga uno propio para analizar.';
export const PAQUETES_CAMBIADOS = 'Los paquetes han cambiado: vuelve a pulsar «Pon tu texto a contraluz».';
export const SIN_ESCALA = 'Ningún paquete activo se compara con textos de personas: mira el resumen y el desglose.';

// El informe para imprimir (encargo 9.1, b; firmado en la parada 1): el botón, la cabecera, la lista de señales, la
// clave de siglas, el pie y el párrafo de cuando no hay análisis. Lo del usuario y de las fichas entra con textContent.
export const DESCARGAR_INFORME = 'Descargar informe';
export const INFORME_DE_RADIOGRAFIA = 'Informe de RadiografIA';
/** La fecha y la hora del análisis, ya escritas por Intl.DateTimeFormat. */
export const analisisDel = (fecha: string): string => `Análisis del ${fecha}`;
/** Cada paquete del análisis en la cabecera del informe: los propios, marcados. */
export const paqueteDelInforme = (nombre: string, version: string, propio: boolean): string => `${nombre} ${version}${propio ? ' (propio)' : ''}`;
export const paquetesDelInforme = (paquetes: readonly string[]): string => `Paquetes: ${paquetes.join(' · ')}`;
export const SENALES_DEL_INFORME = 'Las señales, regla a regla';
/** Cuántas señales dio una regla y sus primeros fragmentos, entre comillas; las que no caben, contadas. */
export const senalesDeLaRegla = (n: number, fragmentos: readonly string[], resto: number): string =>
  `${n} ${n === 1 ? 'señal' : 'señales'}: ${fragmentos.map((f) => `«${f}»`).join(', ')}${resto > 0 ? ` y ${resto} más` : ''}.`;
/** Una señal del texto entero, con lo que dice el desglose (ausencia o estadística). */
export const senalDelTextoEntero = (dice: string | null): string => (dice === null ? 'Del texto entero.' : `Del texto entero: ${dice}.`);
export const REGLA_PROPIA_SIN_FICHA = 'Regla de un paquete propio: sin página en el catálogo.';
export const CLAVE_DE_SIGLAS = 'En el texto, detrás de cada subrayado, va entre corchetes la sigla de su familia.';
export const NOTA_DE_AUTORIA = 'RadiografIA analiza estilo; no demuestra autoría.';
export const SIN_INFORME = 'No hay análisis que imprimir: pega un texto y pulsa «Pon tu texto a contraluz».';

// Los textos de ejemplo (ejemplos.ts).
export const ejemploNoCargado = (url: string, motivo: string): string => `No se ha podido cargar el ejemplo ${url}: ${motivo}.`;

// El formulario como el modelo (encargo 10.4, Tanda 2; DISEÑO §6.1): el placeholder dice el mínimo (el del DISEÑO,
// literal), los chips de los ejemplos sustituyen a los botones «Cargar ejemplo: …» con la misma función, y el selector
// se llama «Tipo de texto», con la misma lista y el mismo orden.
export const PLACEHOLDER_DEL_TEXTO = 'Pega aquí tu texto: a partir de 100 palabras; el análisis es completo desde 300';
export const TEXTO_HUMANO = 'Texto humano';
export const TEXTO_DE_IA = 'Texto de IA';
export const TIPO_DE_TEXTO = 'Tipo de texto';
/** Debajo del cuadro, con menos de 100 palabras que cuentan (DISEÑO §7, estado «insuficiente» del cuadro; el del modelo). */
export const textoInsuficiente = (palabras: number): string => `Texto insuficiente: ${palabras} palabras que cuentan; se puntúa desde 100`;

// El resultado como el modelo (encargo 10.4, Tanda 2; DISEÑO §6.1): la columna de la derecha antes de analizar, el
// cuadro plegado con «Editar el texto», la vista, los títulos de los bloques, el recuento de cada familia y los
// botones del final.
export const AQUI_VERAS_EL_RESULTADO = 'Aquí verás el resultado.';
export const RESULTADO = 'Resultado';
export const TU_TEXTO_ANALIZADO = 'Tu texto analizado';
export const EDITAR_EL_TEXTO = 'Editar el texto';
export const LO_QUE_MAS_PESA = 'Lo que más pesa';
export const familiaConRecuento = (nombre: string, n: number): string => `${nombre} (${n})`;
/** Una familia informativa (Canal): se señala y no suma. */
export const familiaInformativa = (nombre: string, n: number): string => `${nombre}: solo avisos (${n})`;
/** El ojo de cada familia (botón con aria-pressed): su nombre no cambia al pulsarlo (APG); el del modelo, con el paquete. */
export const OCULTAR_ESTA_CAPA = 'Ocultar esta capa';
export const ocultarCapa = (familia: string, paquete: string): string => `${OCULTAR_ESTA_CAPA}: ${familia} (${paquete})`;
export const ANALIZAR_OTRO_TEXTO = 'Analizar otro texto';

// Los géneros del selector (generos.ts). [PROPIO, firmado en el encargo 6.2]
export const NOMBRES_DE_GENERO: Readonly<Record<string, string>> = {
  general: 'General',
  noticia: 'Noticia',
  administrativo: 'Administrativo',
  'narrativa-clasica': 'Narrativa clásica',
  academico: 'Académico',
  // Encargo 9.2 (firmado): lo calibrado en «opinion» son críticas de cine de MuchoCine, y el selector no promete otra cosa.
  opinion: 'Opinión (críticas de cine)',
};

// La leyenda: desde el 10.4 (Tanda 2), las tarjetas de familia del modelo, con «Abc» de muestra (aria-hidden) y la
// informativa con «solo avisos» en su propia tarjeta (familiaInformativa).
export const FAMILIAS = 'Familias';
export const MUESTRA_DE_SUBRAYADO = 'Abc';

// El nombre accesible de cada subrayado (encargo 10.4, Tanda 2; DISEÑO §6.1): sus reglas y su texto, «Conector repetido:
// “Además”». Las reglas, en lista con «y» (Intl.ListFormat de «es», conjunción).
const enLista = new Intl.ListFormat('es', { type: 'conjunction' });
export const nombreDelTramo = (reglas: readonly string[], texto: string): string => `${enLista.format(reglas)}: “${texto}”`;

// La tarjeta de un subrayado (desde el 10.4, Tanda 2, la del modelo; antes, el panel): la línea de su familia y su
// paquete, la X y el recorrido por las señales.
export const lineaDeLaTarjeta = (familia: string, paquete: string): string => `${familia} · ${paquete}`;
export const CERRAR = 'Cerrar';
export const ANTERIOR = 'Anterior';
export const SIGUIENTE = 'Siguiente';
export const EXPLICACION = 'Explicación';
export const SUGERENCIA = 'Sugerencia';
export const NIVEL_DE_EVIDENCIA = 'Nivel de evidencia';
export const ORIGEN_DE_LA_LISTA = 'Origen de la lista';
export const SIN_DATO = 'sin dato';

// El medidor, con texto insuficiente; el resto, en el lenguaje de calle (abajo). Los tramos, en palabras.
export const TEXTO_INSUFICIENTE = 'Texto insuficiente';
export const MENOS_DE_100 = 'menos de 100';
export const TRAMOS_EN_PALABRAS: Readonly<Record<string, string>> = { '100-299': '100 a 299', '300-599': '300 a 599', '600+': '600 o más' };

// El desglose. Lo de cada regla va detrás de su nombre (enlazado a su ficha desde el 7.1), sin su id desde el 9.2: «Nombre: …».
export const NINGUNA_SENAL = 'Ninguna señal.';
export const INFORMATIVAS_EN_EL_DESGLOSE = 'Solo avisos: no suman';

// El catálogo de reglas (encargo 7.1, b): src/pages/reglas/, src/layouts/Catalogo.astro y src/catalogo/.
// Solo la interfaz: el contenido de las fichas (nombre, explicación, ejemplos…) viene de los paquetes y menciona
// las formas que las reglas buscan; no es texto de la web (mención, no uso), y el juez de textos no lo analiza.
export const CATALOGO = 'Catálogo de reglas';
// La cabecera común (encargo 10.4, Tanda 1; Cabecera.astro): el eslogan de la identidad, el enlace corto del móvil y el
// enlace del catálogo al analizador, como en el modelo.
export const ESLOGAN = 'A contraluz se nota todo.';
export const CATALOGO_CORTO = 'Catálogo';
export const ANALIZADOR = 'Analizador';
export const VOLVER_AL_CATALOGO = 'Volver al catálogo';
export const PROBAR_EN_EL_ANALIZADOR = 'Probar en el analizador';
export const INFORMATIVA = 'Solo aviso: no suma.';
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

// El lenguaje de calle (encargo 9.2, b; firmado por Antonio en la parada 1): la etiqueta y la frase del medidor, su
// detalle plegado, el resumen, las unidades de cada métrica y las etiquetas que sustituyen el vocabulario del motor.

/** Un género en palabras de la calle: en singular, en plural y si la palabra es femenina, que da la concordancia. */
export interface GeneroEnPalabras {
  readonly singular: string;
  readonly plural: string;
  readonly femenino: boolean;
}
/** Cada género en palabras de la calle, con el género gramatical de la palabra (retoque del 9.2). */
export const GENEROS_EN_CALLE: Readonly<Record<string, GeneroEnPalabras>> = {
  general: { singular: 'texto', plural: 'textos', femenino: false },
  noticia: { singular: 'noticia', plural: 'noticias', femenino: true },
  opinion: { singular: 'crítica de cine', plural: 'críticas de cine', femenino: true },
  academico: { singular: 'texto académico', plural: 'textos académicos', femenino: false },
  administrativo: { singular: 'texto administrativo', plural: 'textos administrativos', femenino: false },
  'narrativa-clasica': { singular: 'texto de narrativa clásica', plural: 'textos de narrativa clásica', femenino: false },
};
/** Un género que no está en la tabla (el de un paquete propio). */
export const generoDesconocido = (clave: string): GeneroEnPalabras => ({ singular: `texto del género «${clave}»`, plural: `textos del género «${clave}»`, femenino: false });
/** Las palabras que conciertan con el género: «una crítica… escrita», «las críticas… escritas», «con las que»; y en masculino. */
export const CONCORDANCIA: Readonly<Record<'femenino' | 'masculino', { readonly un: string; readonly los: string; readonly escrito: string; readonly escritos: string }>> = {
  femenino: { un: 'una', los: 'las', escrito: 'escrita', escritos: 'escritas' },
  masculino: { un: 'un', los: 'los', escrito: 'escrito', escritos: 'escritos' },
};

// La etiqueta y la frase del resultado, por banda (retoque del 9.2, firmado por Antonio el 03/10/2026 al ver la
// pantalla): sus textos literales, con las mayúsculas de «Asistente IA» como las escribió. Nunca afirman autoría: el
// verbo es «suena a». El género va en singular dentro de la frase, con su concordancia.
export const ETIQUETA_SIN_INDICIOS = 'Texto sin indicios de Asistente IA';
export const NADA_QUE_SUENE = 'Aquí no hay nada que suene a asistente (IA).';
export const ETIQUETA_MUY_POCOS = 'Texto con muy pocos rasgos que indiquen que tiene Asistente IA';
export const suenaMenos = (un: string, genero: string, escrito: string): string =>
  `Tu texto suena menos a asistente (IA) que ${un} ${genero} normal ${escrito} por una persona.`;
export const ETIQUETA_DENTRO = 'Dentro de lo normal';
export const suenaComoCualquier = (genero: string, escrito: string): string => `Suena como cualquier ${genero} ${escrito} por una persona. Nada raro.`;
export const ETIQUETA_BASTANTES = 'Texto con bastantes rasgos de Asistente IA';
export const suenaBastante = (generos: string, escritos: string): string =>
  `Tu texto suena bastante a asistente (IA): de cada 100 ${generos} ${escritos} por personas, solo 5 suenan tanto.`;
export const ETIQUETA_MUCHOS = 'Texto con muchos rasgos de Asistente IA';
export const suenaMucho = (generos: string, escritos: string): string =>
  `Tu texto suena mucho a asistente (IA): de cada 100 ${generos} ${escritos} por personas, solo 1 suena tanto.`;
export const ETIQUETA_SIN_COMPARAR = 'No podemos comparar';
export const sinConQueComparar = (generos: string, escritos: string, los: string): string =>
  `No tenemos ${generos} de este tamaño ${escritos} por personas con ${los} que comparar. Mira el detalle.`;
/** Debajo de la frase, con 100 a 299 palabras de prosa. */
export const AVISO_TEXTO_CORTO = 'Ojo: tu texto es corto (menos de 300 palabras). Tómate el resultado como orientativo.';
// Los de un paquete propio con escala: no mide estilo de asistente, sino sus señales.
export const pocasSenalesDe = (paquete: string): string => `Texto con pocas señales del paquete «${paquete}»`;
export const bastantesSenalesDe = (paquete: string): string => `Texto con bastantes señales del paquete «${paquete}»`;
export const muchasSenalesDe = (paquete: string): string => `Texto con muchas señales del paquete «${paquete}»`;
/** La frase de «pocas» (por debajo de la mediana o dentro de lo normal), firmada aparte el 03/10/2026. */
export const menosSenalesDe = (paquete: string): string => `Tu texto tiene menos señales de «${paquete}» que un texto de referencia normal.`;
export const deCadaCienDe = (paquete: string, cuantos: number): string =>
  `De cada 100 textos de referencia de «${paquete}», solo ${cuantos} ${cuantos === 1 ? 'tiene' : 'tienen'} tantas señales como el tuyo.`;
export const sinConQueCompararDe = (paquete: string): string => `No tenemos textos de referencia de «${paquete}» de este tamaño con los que comparar. Mira el detalle.`;

// «Ver el detalle»: las cifras, plegadas.
export const VER_EL_DETALLE = 'Ver el detalle';
/** «1 punto» y «-1 punto»; cualquier otra cifra, «puntos» («0 puntos», «8,06 puntos»). */
export const puntos = (cifra: string): string => `${cifra} ${cifra === '1' || cifra === '-1' ? 'punto' : 'puntos'}`;
export const tuTotal = (cifra: string): string => `Tu total: ${puntos(cifra)} por cada 1.000 palabras.`;
export const comparadoCon = (n: string, genero: string, tramo: string, escritos: string, p50: string, p95: string, p99: string): string =>
  `Comparado con ${n} ${genero} de ${tramo} palabras ${escritos} por personas: mediana ${p50} · p95 ${p95} · p99 ${p99}.`;
export const palabrasQueCuentan = (palabras: number, tramo: string, genero: string): string =>
  `${palabras} palabras que cuentan (sin listas, títulos, tablas ni código) · textos de ${tramo} palabras · género: ${genero}`;
export const textoCortoEnClaro = (palabras: number): string => `Con ${palabras} palabras, el resultado es orientativo: el análisis es completo desde 300.`;
export const sinTextosDePersonas = (genero: string, tramo: string, escritos: string): string =>
  `No hay ${genero} de ${tramo} palabras ${escritos} por personas para comparar.`;

// El resumen: lo que más pesa y por dónde empezar.
export const loQueMasPesa = (partes: readonly string[]): string => `Lo que más pesa: ${partes.join(' · ')}.`;
export const parteDelResumen = (nombre: string, cola: string): string => `${nombre} (${cola})`;
export const veces = (n: number): string => `${n} ${n === 1 ? 'vez' : 'veces'}`;
export const NI_UNA_VEZ = 'ni una vez en el texto';
/** Una ausencia que no llega al mínimo sin ser cero. */
export const soloVeces = (n: number, minimo: number): string => `solo ${veces(n)}; lo esperable es al menos ${minimo}`;
/** El valor de una métrica con su unidad y lo que hacen los textos de personas (el borde que usa la regla). */
export const conMeta = (valor: string, unidad: string, genero: string, comparacion: string, cifra: string): string =>
  `${valor} ${unidad}; lo normal en ${genero} es ${comparacion} de ${cifra}`;
export const empiezaPor = (sugerencia: string): string => `Empieza por: ${sugerencia}`;
export const NINGUNA_PUNTUABLE = 'Ninguna regla puntuable ha saltado: bien.';
// Español correcto y los paquetes propios: una línea.
export const avisosDeNorma = (n: number, reglas: readonly string[]): string => `${n} ${n === 1 ? 'aviso' : 'avisos'} de norma: ${reglas.join(' y ')}.`;
export const NINGUN_AVISO = 'Ningún aviso de norma.';
export const reglaConCuenta = (nombre: string, n: number): string => `${nombre} (${n})`;
export const senalesDe = (n: number, paquete: string, reglas: readonly string[]): string =>
  `${n} ${n === 1 ? 'señal' : 'señales'} de «${paquete}»: ${reglas.join(' y ')}.`;
export const ningunaSenalDe = (paquete: string): string => `Ninguna señal de «${paquete}».`;

/** [PROPIO, firmado] La unidad de cada métrica del motor, detrás de su valor. */
export const UNIDADES_DE_METRICA: Readonly<Record<string, string>> = {
  'frases-por-100-palabras': 'frases por cada 100 palabras',
  'cv-longitud-frase': 'de variación en la longitud de las frases',
  'ratio-comas-puntos': 'comas por punto',
  'puntuacion-por-1000': 'signos de puntuación por cada 1.000 palabras',
  'puntuacion-secundaria-por-1000': 'paréntesis, comillas, dos puntos y similares por cada 1.000 palabras',
  'nominalizaciones-por-1000': 'sustantivos en -ción, -miento, -dad… por cada 1.000 palabras',
  'seq-rep-4': 'de los grupos de cuatro palabras, repetidos (de 0 a 1)',
  ttr: 'de palabras distintas sobre el total (de 0 a 1)',
  'mattr-50': 'de palabras distintas en cada trozo de 50 (de 0 a 1)',
  mtld: 'palabras seguidas, de media, antes de repetir vocabulario',
  'hdd-42': 'de variedad en 42 palabras al azar (de 0 a 1)',
  ifsz: 'de legibilidad (más alto, más fácil)',
  'pronombres-anaforicos-por-1000': 'pronombres que remiten a lo ya dicho por cada 1.000 palabras',
};

// Las etiquetas que sustituyen el vocabulario del motor en el desglose y en el panel.
export const RASGO_HUMANO = 'rasgo humano: resta';
export const NO_MIRADAS = 'No miradas en este texto';
export const soloSeMiranEn = (generos: readonly string[]): string =>
  `solo se miran en ${generos.length > 1 ? `${generos.slice(0, -1).join(', ')} y ${generos.at(-1)}` : generos.join('')}`;
export const SOLO_TEXTOS_LARGOS = 'solo se miran en textos de 300 palabras o más';
export const LO_QUE_SE_NOTA = 'Lo que se nota en el conjunto';
export const SIN_TEXTOS_PARA_COMPARAR = 'Sin textos de personas con los que comparar';
export const PARA_ESTE_TIPO = 'para este tipo de texto y esta longitud';
export const NO_SE_PUEDE_MEDIR = 'no se puede medir en este texto';
export const vecesYPuntos = (n: number, cifra: string): string => `${veces(n)} · ${puntos(cifra)}`;
export const totalEnClaro = (cifra: string): string => `Total: ${puntos(cifra)} por cada 1.000 palabras.`;
/** Una métrica de contexto: su valor, dónde queda respecto a lo habitual y los bordes de lo habitual. */
export const estadisticaDeContexto = (valor: string, unidad: string, posicion: string, genero: string, abajo: string, arriba: string): string =>
  `${valor} ${unidad}: ${posicion} lo habitual en ${genero} (de ${abajo} a ${arriba})`;
export const POSICIONES_RESPECTO_A_LO_HABITUAL: Readonly<Record<string, string>> = { dentro: 'dentro de', arriba: 'por encima de', abajo: 'por debajo de' };
export const QUE_HACER = 'Qué hacer';
export const POR_QUE_LO_MIRAMOS = '¿Por qué lo miramos?';
export const VER_SU_FICHA = 'Ver su ficha en el catálogo';
