/**
 * El juez de los textos de la web (encargo 6.3, b; casilla heredada del punto
 * 5, decisión del 01/10). Lo que la gente lee en la página pasa por los dos
 * paquetes con el género «general»:
 *
 *   · RadiografIA no puntúa ninguna regla fuera de DECLARADAS, cada una con su
 *     porqué. Si aparece otra, se cambia la frase o se declara; nunca se
 *     silencia. Y si una declarada deja de puntuar, se quita de la lista, para
 *     que no envejezca.
 *   · Español correcto no da ninguna señal.
 *
 * Los textos son:
 *   · el texto visible de dist/index.html, sin etiquetas, scripts, estilos ni
 *     comentarios;
 *   · el placeholder del textarea;
 *   · todas las cadenas de web/src/textos.ts: las fijas, los valores de sus
 *     tablas y las funciones llamadas con los datos de MUESTRAS. Una función
 *     sin muestra, o una muestra sin función, hace fallar el juez.
 * Cada texto va como un párrafo. No entran, porque no son de la web, lo que
 * viene de los paquetes y lo que dice el motor (textos.ts).
 *
 * Con 100 palabras de prosa o más se analiza con analizar(); hoy pasan de 300.
 * [PROPIO] Si bajaran de 100, el juez falla en vez de pasar: el motor no
 *    analizaría (texto insuficiente), y el encargo pide entonces pasar los
 *    detectores sobre las frases y declararlo en el README. navegador.ts no
 *    exporta los detectores.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test; t.diagnostic() deja en
 *    la salida las palabras y las señales.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as textos from '../src/textos.ts';
import { construir, decodificar, DIST, motorDelNavegador, paquetesIncluidos } from './apoyo.ts';

const GENERO = 'general';
const MINIMO = 100;

/** Las reglas de RadiografIA que puntúan en los textos de la web, y por qué no se cambia la frase. */
const DECLARADAS: Readonly<Record<string, string>> = {
  'lex-verbos-de-enfasis':
    '«subrayado», la muestra de la leyenda, es el nombre de la función y no se cambia (decisión del 01/10). La regla busca la raíz subray- y no distingue el nombre del verbo; está declarado en su ficha.',
  'est-frases-cortas':
    'los textos de la web son etiquetas y mensajes sueltos, no prosa: cada uno cuenta como una frase, y salen muchas frases para tan pocas palabras. Juntarlos en frases largas para que no dispare sería escribir para la regla.',
  'est-pocas-comas':
    'la misma causa (encargo 8.1): los mensajes del cargador son frases sueltas y cortas, con dos puntos y sin incisos, y bajan las comas por punto por debajo de la banda humana. Meterles comas para que no dispare sería escribir para la regla.',
};

/** Los datos con que se llama a cada función de textos.ts: los que pinta la página en un análisis de verdad. */
const MUESTRAS: Readonly<Record<string, readonly unknown[]>> = {
  paquetesCargados: [['RadiografIA 0.1.0', 'Español correcto 0.1.0']],
  noSeCargo: ['/paquetes/radiografia.json', 'HTTP 404'],
  ejemploNoCargado: ['/ejemplos/ia.txt', 'HTTP 404'],
  // El catálogo (encargo 7.1, b): la descripción es de muestra, porque la de verdad es del paquete, no de la web.
  paqueteConVersion: ['RadiografIA', '0.1.0', 'Reglas de estilo.'],
  numeroDeFormas: [4],
  ausenciaDe: [1],
  minimoDeApariciones: [2],
  repeticion: [3],
  soloEnGeneros: [['Opinión', 'Académico']],
  entrePercentiles: ['1', '99'],
  recuentoDeReglas: [50],
  // El cargador (encargo 8.1, b). El detalle del JSON roto es el mensaje de Chrome, tal cual: es del navegador, no de la web.
  noSeCargaPorTamano: ['mi-paquete.json', '2,4', '2'],
  noSeCargaPorJson: ['mi-paquete.json'],
  elNavegadorDice: ['Expected double-quoted property name in JSON at position 28 (line 1 column 29)'],
  noSeCargaPorEsquema: ['mi-paquete.json'],
  noSeCargaPorNombre: ['mi-paquete.json', 'Mi paquete'],
  noSeCargaPorNombreDeIncluido: ['mi-paquete.json', 'RadiografIA'],
  paquetePropioCargado: ['Mi paquete', '1.0.0', 3],
  paquetePropio: ['Mi paquete', '1.0.0', 3],
  quitarPaquete: ['Mi paquete'],
  // El informe (encargo 9.1, b): la fecha como la escribe Intl.DateTimeFormat en «es» con dateStyle long y timeStyle short.
  analisisDel: ['2 de octubre de 2026 a las 16:40'],
  paqueteDelInforme: ['Paquete de prueba', '1.0.0', true],
  paquetesDelInforme: [['RadiografIA 0.1.0', 'Español correcto 0.1.0', 'Paquete de prueba 1.0.0 (propio)']],
  senalesDeLaRegla: [7, ['okey', 'OK', 'okey', 'oká', 'okey'], 2],
  senalDelTextoEntero: ['ausencia: 0 apariciones; señala por debajo de 1'],
  // El lenguaje de calle (encargo 9.2, b): las muestras con los géneros y las cifras que pinta la página.
  generoDesconocido: ['carta'],
  // La etiqueta y la frase (retoque del 9.2): el género en singular y en plural, con su concordancia.
  suenaMenos: ['una', 'crítica de cine', 'escrita'],
  suenaComoCualquier: ['texto académico', 'escrito'],
  suenaBastante: ['noticias', 'escritas'],
  suenaMucho: ['textos', 'escritos'],
  sinConQueComparar: ['críticas de cine', 'escritas', 'las'],
  pocasSenalesDe: ['Mi paquete'],
  menosSenalesDe: ['Mi paquete'],
  bastantesSenalesDe: ['Mi paquete'],
  muchasSenalesDe: ['Mi paquete'],
  deCadaCienDe: ['Mi paquete', 5],
  sinConQueCompararDe: ['Mi paquete'],
  tuTotal: ['3'],
  comparadoCon: ['1.663', 'críticas de cine', '300 a 599', 'escritas', '2', '15,14', '23,6'],
  palabrasQueCuentan: [314, '300 a 599', 'Opinión (críticas de cine)'],
  textoCortoEnClaro: [180],
  sinTextosDePersonas: ['textos de narrativa clásica', '100 a 299', 'escritos'],
  loQueMasPesa: [['Conector repetido (3 veces)', 'Coletilla de gerundio final (2 veces)', 'Pocas comas (0,38 comas por punto; lo normal en las críticas de cine es más de 0,49)']],
  parteDelResumen: ['Conector repetido', '3 veces'],
  veces: [3],
  conMeta: ['0,38', 'comas por punto', 'las críticas de cine', 'más', '0,49'],
  soloVeces: [1, 2],
  empiezaPor: ['Cambia alguno de los conectores repetidos o quítalo: muchas veces la frase se entiende sin él.'],
  avisosDeNorma: [9, ['Mes o día con mayúscula (3)', 'Pasiva perifrástica con agente (1)']],
  reglaConCuenta: ['Mes o día con mayúscula', 3],
  senalesDe: [4, 'Mi paquete', ['Pruebas (2)', 'Otra regla (1)']],
  ningunaSenalDe: ['Mi paquete'],
  soloSeMiranEn: [['las críticas de cine', 'los textos académicos']],
  vecesYPuntos: [2, '3'],
  puntos: ['1'],
  totalEnClaro: ['5'],
  estadisticaDeContexto: ['0,58', 'de palabras distintas sobre el total (de 0 a 1)', 'dentro de', 'las noticias', '0,5', '0,62'],
  // El nombre accesible de un subrayado (10.4, Tanda 2): el de sus reglas y su texto, que es del usuario (aquí, de muestra).
  nombreDelTramo: [['Conector repetido', 'Mes o día con mayúscula'], 'Además'],
  // El resultado (10.4, Tanda 2): el aviso de texto insuficiente y las tarjetas de familia, con los números del modelo.
  textoInsuficiente: [99],
  familiaConRecuento: ['Discurso', 7],
  familiaInformativa: ['Canal', 1],
};

/** El texto visible de la página construida y su placeholder. */
function textosDelHtml(html: string): string[] {
  const sinCodigo = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const visibles = sinCodigo.split(/<[^>]*>/).map((t) => decodificar(t.trim())).filter((t) => t !== '');
  const placeholders = [...sinCodigo.matchAll(/\splaceholder="([^"]*)"/g)].map((m) => decodificar(m[1]!));
  return [...visibles, ...placeholders];
}

/** Las cadenas de un valor: él mismo, o las de sus campos, también anidados (la tabla de géneros y la concordancia); ni claves ni booleanos. */
function cadenas(valor: unknown): string[] {
  if (typeof valor === 'string') return [valor];
  if (typeof valor === 'object' && valor !== null) return Object.values(valor).flatMap(cadenas);
  return [];
}

/** Todas las cadenas de textos.ts, con las funciones llamadas con sus muestras. */
function textosDelScript(): string[] {
  const exportadas = Object.entries(textos);
  const funciones = exportadas.filter(([, valor]) => typeof valor === 'function').map(([nombre]) => nombre);
  assert.deepEqual(funciones.sort(), Object.keys(MUESTRAS).sort(), 'cada función de textos.ts con su muestra, y ninguna muestra de más');
  return exportadas.flatMap(([nombre, valor]) => cadenas(typeof valor === 'function' ? (valor as (...datos: readonly unknown[]) => unknown)(...MUESTRAS[nombre]!) : valor));
}

describe('los textos de la web, por los dos paquetes', () => {
  test(`RadiografIA solo puntúa las reglas declaradas, y Español correcto nada (género «${GENERO}»)`, async (t) => {
    construir();
    const texto = [...textosDelHtml(readFileSync(new URL('index.html', DIST), 'utf8')), ...textosDelScript()].join('\n\n');
    const { analizar } = await motorDelNavegador();
    const r = analizar(texto, paquetesIncluidos(), { genero: GENERO });
    assert.ok(r.palabrasProsa >= MINIMO, `los textos de la web suman ${r.palabrasProsa} palabras de prosa: por debajo de ${MINIMO} el motor no analiza`);

    const [radiografia, espanol] = r.paquetes;
    const puntuan = radiografia!.puntuacion.familias.flatMap((f) => f.reglas).filter((x) => x.n > 0 && !x.informativa);
    const donde = (id: string): string[] => [
      ...r.senales.filter((s) => s.paquete === radiografia!.paquete && s.reglaId === id).map((s) => `«${texto.slice(s.inicio, s.fin)}»`),
      ...r.senalesTexto.filter((s) => s.paquete === radiografia!.paquete && s.reglaId === id).map((s) => ('valor' in s ? `${s.metrica} = ${s.valor}` : 'ausencia')),
    ];
    t.diagnostic(`palabras de prosa: ${r.palabrasProsa}; RadiografIA ${radiografia!.puntuacion.total}`);
    for (const x of puntuan) t.diagnostic(`${x.id}: ${x.n} (${donde(x.id).join(', ')})`);

    assert.deepEqual(
      puntuan.map((x) => x.id).sort(),
      Object.keys(DECLARADAS).sort(),
      `las reglas de RadiografIA que puntúan, frente a las declaradas:\n${puntuan.map((x) => `  ${x.id}: ${donde(x.id).join(', ')}`).join('\n')}`,
    );
    const deEspanol = r.senales.filter((s) => s.paquete === espanol!.paquete).map((s) => `${s.reglaId} «${texto.slice(s.inicio, s.fin)}»`);
    assert.deepEqual(deEspanol, [], 'Español correcto');
  });
});
