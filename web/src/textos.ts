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

// La leyenda.
export const FAMILIAS = 'Familias';
export const MUESTRA_DE_SUBRAYADO = 'subrayado';
export const INFORMATIVAS_EN_LA_LEYENDA = 'Solo avisos: no suman.';

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
export const INFORMATIVAS_EN_EL_DESGLOSE = 'Solo avisos: no suman';
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

// El lenguaje de calle (encargo 9.2, b; firmado por Antonio en la parada 1): el titular del medidor, su detalle plegado,
// el resumen, las unidades de cada métrica y las etiquetas que sustituyen el vocabulario del motor. Nunca «IA»: «rasgos
// de estilo de asistente», y el titular es la banda respecto a los textos de personas, no una probabilidad.

/** Cada género en palabras de la calle, con su artículo, que da la concordancia («escritos», «escritas»). */
export const GENEROS_EN_CALLE: Readonly<Record<string, string>> = {
  general: 'los textos',
  noticia: 'las noticias',
  opinion: 'las críticas de cine',
  academico: 'los textos académicos',
  administrativo: 'los textos administrativos',
  'narrativa-clasica': 'los textos de narrativa clásica',
};
/** Un género que no está en la tabla (el de un paquete propio). */
export const generoDesconocido = (clave: string): string => `los textos del género «${clave}»`;
/** «las noticias de esta longitud escritas por personas»: con quién se compara. */
export const quienEscribe = (genero: string, escritos: string): string => `${genero} de esta longitud ${escritos} por personas`;

// El titular, por banda; sin punto final: lo pone titular().
export const menosRasgosQueLaMitad = (quien: string): string => `Menos rasgos de estilo de asistente que la mitad de ${quien}`;
export const dentroDeLoHabitual = (quien: string): string => `Dentro de lo habitual en ${quien}`;
export const masRasgosQue = (porcentaje: string, quien: string): string => `Más rasgos de estilo de asistente que el ${porcentaje} % de ${quien}`;
export const NI_UN_RASGO = 'Ni un rasgo de estilo de asistente que sume en tu texto';
// Los de un paquete propio con escala: no mide estilo de asistente, sino sus señales.
export const menosSenalesQueLaMitad = (paquete: string, quien: string): string => `Menos señales de «${paquete}» que la mitad de ${quien}`;
export const masSenalesQue = (paquete: string, porcentaje: string, quien: string): string => `Más señales de «${paquete}» que el ${porcentaje} % de ${quien}`;
export const niUnaSenalDe = (paquete: string): string => `Ni una señal de «${paquete}» que sume en tu texto`;
export const SIN_REFERENCIA = 'Sin referencia humana para este tipo de texto y esta longitud: mira el detalle';
/** El titular entero: con texto de 100 a 299 palabras, la advertencia; y el punto final. */
export const titular = (frase: string, corto: boolean): string => `${frase}${corto ? ' (texto corto: resultado orientativo)' : ''}.`;

// «Ver el detalle»: las cifras, plegadas.
export const VER_EL_DETALLE = 'Ver el detalle';
export const tuTotal = (cifra: string): string => `Tu total: ${cifra} puntos por cada 1.000 palabras.`;
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
export const vecesYPuntos = (n: number, puntos: string): string => `${veces(n)} · ${puntos} puntos`;
export const totalEnClaro = (cifra: string): string => `Total: ${cifra} puntos por cada 1.000 palabras.`;
/** Una métrica de contexto: su valor, dónde queda respecto a lo habitual y los bordes de lo habitual. */
export const estadisticaDeContexto = (valor: string, unidad: string, posicion: string, genero: string, abajo: string, arriba: string): string =>
  `${valor} ${unidad}: ${posicion} lo habitual en ${genero} (de ${abajo} a ${arriba})`;
export const POSICIONES_RESPECTO_A_LO_HABITUAL: Readonly<Record<string, string>> = { dentro: 'dentro de', arriba: 'por encima de', abajo: 'por debajo de' };
export const QUE_HACER = 'Qué hacer';
export const POR_QUE_LO_MIRAMOS = '¿Por qué lo miramos?';
export const VER_SU_FICHA = 'Ver su ficha en el catálogo';
