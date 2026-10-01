/**
 * Juez de medir.ts (encargo 5.5): un documento da un valor por cada clave de
 * calibración —las trece métricas del registro y `_total-radiografia`—, cada
 * métrica igual a la del motor sobre el mismo texto, y el total igual a la
 * puntuación de RadiografIA que da analizar() con el género del corpus.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizar } from '../../src/analizar.ts';
import { analizarTexto } from '../../src/texto.ts';
import { METRICAS } from '../../src/metricas/index.ts';
import { CLAVES_DE_CALIBRACION, NOMBRES_DE_METRICAS } from '../../src/metricas/nombres.ts';
import type { Paquete } from '../../src/paquete.ts';
import { medirConDisparos, medirDocumento } from './medir.ts';

const RADIOGRAFIA = JSON.parse(readFileSync(new URL('../../../paquetes/radiografia.json', import.meta.url), 'utf8')) as Paquete;

/** 120 palabras de prosa: la misma frase doce veces (sintético; desde el 5.6 dispara reglas estadísticas). */
const TEXTO = Array.from({ length: 12 }, (_, i) => `El tren número ${i + 1} salió con retraso de la estación de Atocha y llegó tarde.`).join(' ');

/**
 * 123 palabras de prosa con forma de noticia, escritas para el 5.6, en las que
 * ninguna regla de RadiografIA que puntúa da señal con «noticia» (comprobado
 * con analizar(): total 0). TEXTO ya no sirve para eso: repetir la misma frase
 * es justo lo que miden las reglas estadísticas.
 */
const NOTICIA = 'El tren de las ocho salió ayer de Atocha con cuarenta minutos de retraso, y los viajeros que esperaban en el andén 5 tuvieron que buscar otra forma de llegar a Valladolid. Según Adif, la avería afectó a una catenaria cerca de Chamartín; los técnicos la repararon a media mañana. Renfe ofreció autobuses a quienes no podían esperar, aunque muchos prefirieron quedarse en la cafetería de la estación. «Llevo tres semanas así», contaba una enfermera que trabaja en el Clínico. El ministerio ha prometido revisar el contrato de mantenimiento, firmado en 2019, y publicar en marzo un informe con las incidencias de toda la línea. Mientras tanto, la asociación de usuarios pide que se devuelva el importe del billete en todos los casos.';

describe('medirDocumento', () => {
  test('un valor por clave de calibración: las trece métricas y el total', () => {
    const valores = medirDocumento(TEXTO, 'noticia', RADIOGRAFIA);
    assert.deepEqual(Object.keys(valores).sort(), [...CLAVES_DE_CALIBRACION].sort());
  });

  test('cada métrica, la del motor sobre el mismo texto', () => {
    const valores = medirDocumento(TEXTO, 'noticia', RADIOGRAFIA);
    const texto = analizarTexto(TEXTO);
    for (const nombre of NOMBRES_DE_METRICAS) assert.equal(valores[nombre], METRICAS[nombre](texto), nombre);
  });

  test('el total, la puntuación de RadiografIA con el género del corpus', () => {
    // Con una señal (lex-verbos-de-enfasis), para que el total no sea 0.
    const conSenal = `${TEXTO} En resumen, cabe destacar que es crucial.`;
    const valores = medirDocumento(conSenal, 'opinion', RADIOGRAFIA);
    const esperado = analizar(conSenal, [RADIOGRAFIA], { genero: 'opinion' }).paquetes[0]!.puntuacion.total;
    assert.ok(typeof esperado === 'number' && esperado > 0, String(esperado));
    assert.equal(valores['_total-radiografia'], esperado);
  });

  test('los disparos: las señales de cada regla que puntúa, las de analizar() con el género del corpus', () => {
    const conSenal = `${TEXTO} En resumen, cabe destacar que es crucial. Cabe destacar, además, que es clave.`;
    const { valores, disparos } = medirConDisparos(conSenal, 'opinion', RADIOGRAFIA);
    assert.deepEqual(valores, medirDocumento(conSenal, 'opinion', RADIOGRAFIA));
    const r = analizar(conSenal, [RADIOGRAFIA], { genero: 'opinion' });
    const esperado: Record<string, number> = {};
    for (const s of [...r.senales, ...r.senalesTexto]) esperado[s.reglaId] = (esperado[s.reglaId] ?? 0) + 1;
    assert.ok((disparos['lex-verbos-de-enfasis'] ?? 0) >= 2, JSON.stringify(disparos));
    assert.deepEqual(disparos, esperado);
  });

  test('sin señales, sin disparos', () => {
    assert.deepEqual(medirConDisparos(NOTICIA, 'noticia', RADIOGRAFIA).disparos, {});
  });

  test('las reglas estadísticas también son disparos (encargo 5.6): la misma frase doce veces', () => {
    const { disparos } = medirConDisparos(TEXTO, 'noticia', RADIOGRAFIA);
    assert.ok(Object.keys(disparos).some((id) => id.startsWith('est-')), JSON.stringify(disparos));
  });
});
