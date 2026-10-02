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
  sinSenales: ['RadiografIA'],
  sinCalibracion: ['sin calibración de «_total-radiografia» para el género «academico», tramo «100-299»'],
  tuBanda: ['entre la mediana y el p95', 'Opinión', '300 a 599'],
  tusPercentiles: ['5', 1663, '3', '15,62', '23,6'],
  datosDelTexto: [314, '300-599', 'Opinión'],
  total: ['5', 'puntos por 1.000 palabras de prosa'],
  reglaConSenales: [1, '3'],
  reglaInformativa: [2],
  ausencia: [0, 1],
  estadistica: ['ratio-comas-puntos', '0,38', 'por debajo de la banda humana', '0,49', '0,92', '2,27', '10,67', '31'],
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

/** Todas las cadenas de textos.ts, con las funciones llamadas con sus muestras. */
function textosDelScript(): string[] {
  const exportadas = Object.entries(textos);
  const funciones = exportadas.filter(([, valor]) => typeof valor === 'function').map(([nombre]) => nombre);
  assert.deepEqual(funciones.sort(), Object.keys(MUESTRAS).sort(), 'cada función de textos.ts con su muestra, y ninguna muestra de más');
  return exportadas.flatMap(([nombre, valor]) => {
    if (typeof valor === 'string') return [valor];
    if (typeof valor === 'function') return [(valor as (...datos: readonly unknown[]) => string)(...MUESTRAS[nombre]!)];
    return Object.values(valor as Record<string, string>);
  });
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
