/**
 * Los jueces de la lógica del lenguaje de calle (encargo 9.2, b; firmado por
 * Antonio en la parada 1). Lo que se ve lo mira Chrome (navegador.spec.ts).
 *
 *   1. El titular del medidor (titularDelPaquete): uno por banda y por
 *      género, con el género en palabras de la calle y «de esta longitud
 *      escritos por personas»; sin calibración; «Ni un rasgo…» solo si no
 *      suma ninguna regla (si suman y restan hasta 0, el de la banda); con
 *      texto corto, la advertencia; el de un paquete propio con escala; y
 *      ninguno sin escala o con texto insuficiente. Ninguno dice «p95».
 *   2. El resumen (resumenDelPaquete): las tres reglas que más suman, con
 *      los empates en el orden del desglose (orden.ts); «veces» solo en
 *      patrón y estructural; «ni una vez en el texto» en las ausencias; en
 *      las estadísticas, el valor con la unidad de su métrica y la meta con
 *      el borde que usa la regla, de su celda; «Empieza por» con la
 *      sugerencia de la primera; sin ninguna que sume, «Ninguna regla
 *      puntuable ha saltado: bien.». Español correcto, una línea.
 *   3. Los motivos en claro de «No miradas» (de la regla, no del motor) y de
 *      «Sin textos de personas con los que comparar», y las líneas del
 *      conjunto: la de una regla que suma, con su meta, y la de una de
 *      contexto, dentro, por encima o por debajo de lo habitual.
 * Las frases esperadas se escriben aquí, en castellano y a mano, donde se
 * juzga la redacción; el orden del resumen se calcula aparte con enOrden.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import { detalleDelPaquete, generoEnCalle, lineaDelTextoEntero, motivoNoMirada, motivoSinComparar, resumenDelPaquete, titularDelPaquete } from '../src/pantalla/lectura.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { enOrden } from '../src/orden.ts';
import { motorDelNavegador, paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';

type ResultadoDePaquete = Resultado['paquetes'][number];
const cifra = (x: number): string => new Intl.NumberFormat('es', { maximumFractionDigits: 2 }).format(x);

/** Un resultado de un paquete con escala, hecho a mano: lo justo que lee el titular. */
function conBanda(banda: string, genero: string, opciones: { total?: number; suma?: boolean; tramo?: string; paquete?: string } = {}): [Resultado, ResultadoDePaquete] {
  const { total = 5, suma = true, tramo = 'completo', paquete = 'RadiografIA' } = opciones;
  const reglas = suma ? [{ id: 'x', informativa: false, n: 1, contribucion: total || 2 }] : [];
  const r = {
    paquete,
    puntuacion: { total, familias: [{ id: 'f', nombre: 'F', informativa: false, total, reglas }] },
    banda: banda === 'sin calibración' ? { banda, motivo: 'sin celda' } : { banda, clave: '_total-radiografia', p5: 0, p50: 2, p95: 15, p99: 23, n: 1663 },
  } as unknown as ResultadoDePaquete;
  return [{ genero, tramo, tramoDeCalibracion: '300-599', palabrasProsa: 314, paquetes: [r], senales: [], senalesTexto: [], contexto: [], sinCalibracion: [], noAplicadas: [] } as unknown as Resultado, r];
}

describe('el género en palabras de la calle', () => {
  test('con su artículo, sin él y su concordancia; uno desconocido, con su clave', () => {
    assert.deepEqual(generoEnCalle('opinion'), { conArticulo: 'las críticas de cine', sinArticulo: 'críticas de cine', escritos: 'escritas' });
    assert.deepEqual(generoEnCalle('narrativa-clasica'), { conArticulo: 'los textos de narrativa clásica', sinArticulo: 'textos de narrativa clásica', escritos: 'escritos' });
    assert.deepEqual(generoEnCalle('carta'), { conArticulo: 'los textos del género «carta»', sinArticulo: 'textos del género «carta»', escritos: 'escritos' });
  });
});

describe('el titular del medidor', () => {
  test('cuatro bandas, a mano, en cuatro géneros', () => {
    const t = (banda: string, genero: string): string | null => titularDelPaquete(...conBanda(banda, genero), 'asistente');
    assert.equal(t('por debajo de la mediana', 'opinion'), 'Menos rasgos de estilo de asistente que la mitad de las críticas de cine de esta longitud escritas por personas.');
    assert.equal(t('entre la mediana y el p95', 'general'), 'Dentro de lo habitual en los textos de esta longitud escritos por personas.');
    assert.equal(t('por encima del p95', 'noticia'), 'Más rasgos de estilo de asistente que el 95 % de las noticias de esta longitud escritas por personas.');
    assert.equal(t('por encima del p99', 'narrativa-clasica'), 'Más rasgos de estilo de asistente que el 99 % de los textos de narrativa clásica de esta longitud escritos por personas.');
  });

  test('una por banda y por género: 24 frases distintas, con punto final y sin percentiles', () => {
    const bandas = ['por debajo de la mediana', 'entre la mediana y el p95', 'por encima del p95', 'por encima del p99'];
    const generos = ['general', 'noticia', 'opinion', 'academico', 'administrativo', 'narrativa-clasica'];
    const todas = bandas.flatMap((b) => generos.map((g) => titularDelPaquete(...conBanda(b, g), 'asistente')));
    assert.equal(new Set(todas).size, 24);
    for (const f of todas) {
      assert.ok(f !== null && f.endsWith('.') && !/p\d\d|percentil|mediana|IA\b/.test(f), String(f));
      assert.ok(f.includes('de esta longitud escrit'), f);
    }
  });

  test('sin calibración; total 0 sin nada que sume; total 0 sumando y restando, el de la banda; texto corto', () => {
    assert.equal(titularDelPaquete(...conBanda('sin calibración', 'narrativa-clasica'), 'asistente'), 'Sin referencia humana para este tipo de texto y esta longitud: mira el detalle.');
    assert.equal(titularDelPaquete(...conBanda('entre la mediana y el p95', 'noticia', { total: 0, suma: false }), 'asistente'), 'Ni un rasgo de estilo de asistente que sume en tu texto.');
    assert.equal(
      titularDelPaquete(...conBanda('entre la mediana y el p95', 'noticia', { total: 0, suma: true }), 'asistente'),
      'Dentro de lo habitual en las noticias de esta longitud escritas por personas.',
    );
    assert.equal(
      titularDelPaquete(...conBanda('por encima del p95', 'general', { tramo: 'poco-fiable' }), 'asistente'),
      'Más rasgos de estilo de asistente que el 95 % de los textos de esta longitud escritos por personas (texto corto: resultado orientativo).',
    );
  });

  test('un paquete propio con escala habla de sus señales; sin escala o con texto insuficiente, ningún titular', () => {
    assert.equal(
      titularDelPaquete(...conBanda('por encima del p95', 'general', { paquete: 'Mi paquete' }), 'propio'),
      'Más señales de «Mi paquete» que el 95 % de los textos de esta longitud escritos por personas.',
    );
    const [resultado, r] = conBanda('por encima del p95', 'general');
    assert.equal(titularDelPaquete(resultado, { ...r, banda: null }, 'norma'), null);
    assert.equal(titularDelPaquete({ ...resultado, tramo: 'insuficiente' }, r, 'asistente'), null);
  });

  test('el detalle: el total, con quién se compara y las palabras, sin «tramo»', () => {
    const [resultado, r] = conBanda('entre la mediana y el p95', 'opinion', { total: 3 });
    assert.deepEqual(detalleDelPaquete(resultado, r, 'Opinión (críticas de cine)'), [
      'Tu total: 3 puntos por cada 1.000 palabras.',
      // Intl en «es» no agrupa las cifras de un número de cuatro dígitos (la RAE tampoco): 1663, como ya pintaba la pantalla.
      'Comparado con 1663 críticas de cine de 300 a 599 palabras escritas por personas: mediana 2 · p95 15 · p99 23.',
      '314 palabras que cuentan (sin listas, títulos, tablas ni código) · textos de 300 a 599 palabras · género: Opinión (críticas de cine)',
    ]);
  });
});

describe('el resumen', () => {
  test('combinacion-real con «general»: las tres que más suman, con sus veces, en orden, y «Empieza por» con la primera', async () => {
    const { analizar } = await motorDelNavegador();
    const paquetes = paquetesIncluidos();
    const indice = indexar(paquetes);
    const r = analizar(TEXTO_DE_COMBINACION_REAL, paquetes, { genero: 'general' });
    const radiografia = r.paquetes[0]!;
    const familias = new Map(radiografia.puntuacion.familias.flatMap((f) => f.reglas.map((x) => [x.id, f.nombre])));
    const suman = radiografia.puntuacion.familias.flatMap((f) => f.reglas).filter((x) => !x.informativa && x.n > 0 && x.contribucion > 0);
    const regla = (id: string) => indice.reglas.get(`RadiografIA::${id}`)!;
    // El orden se calcula aquí: contribución de mayor a menor y, en el empate, familia y nombre (orden.ts).
    const tres = enOrden(suman, (x) => [-x.contribucion, familias.get(x.id)!, regla(x.id).nombre!]).slice(0, 3);
    assert.ok(tres.every((x) => ['patrón', 'estructural'].includes(regla(x.id).detector)), 'las tres de este texto son de patrón o estructurales');
    assert.deepEqual(resumenDelPaquete(r, radiografia, 'asistente', indice), [
      `Lo que más pesa: ${tres.map((x) => `${regla(x.id).nombre} (${x.n} ${x.n === 1 ? 'vez' : 'veces'})`).join(' · ')}.`,
      `Empieza por: ${regla(tres[0]!.id).sugerencia}`,
    ]);
  });

  test('una estadística: el valor con su unidad y la meta, el borde que usa la regla en la celda (pocas comas: p1)', async () => {
    const { analizar } = await motorDelNavegador();
    const paquetes = paquetesIncluidos();
    const indice = indexar(paquetes);
    const { readFileSync } = await import('node:fs');
    const humano = readFileSync(new URL('../public/ejemplos/antonio.txt', import.meta.url), 'utf8');
    const r = analizar(humano, paquetes, { genero: 'opinion' });
    const s = r.senalesTexto.find((x) => x.reglaId === 'est-pocas-comas');
    assert.ok(s && 'valor' in s, 'el texto de Antonio dispara «Pocas comas»');
    const [linea] = resumenDelPaquete(r, r.paquetes[0]!, 'asistente', indice);
    assert.ok(
      linea!.includes(`Pocas comas (${cifra(s.valor)} comas por punto; lo normal en las críticas de cine es más de ${cifra(s.referencia.p1)})`),
      linea,
    );
  });

  test('una ausencia: «ni una vez en el texto», sin «veces»', async () => {
    const { analizar } = await motorDelNavegador();
    const paquetes = paquetesIncluidos();
    const indice = indexar(paquetes);
    const parrafo = 'El ayuntamiento abrió ayer la biblioteca del barrio, que tiene tres salas de lectura, un patio y una sala para talleres. Los vecinos llevaban años esperando la obra, que se retrasó por un problema con la licencia y por el cambio de empresa constructora.';
    const r = analizar(Array.from({ length: 8 }, () => parrafo).join('\n\n'), paquetes, { genero: 'opinion' });
    assert.ok(r.senalesTexto.some((x) => x.reglaId === 'disc-sin-automenciones'), 'el texto no lleva primera persona');
    const [linea] = resumenDelPaquete(r, r.paquetes[0]!, 'asistente', indice);
    assert.ok(linea!.includes('Sin primera persona (ni una vez en el texto)'), linea);
  });

  test('sin ninguna regla que sume: «Ninguna regla puntuable ha saltado: bien.»; y Español correcto, una línea', async () => {
    const [resultado, r] = conBanda('por debajo de la mediana', 'general', { total: 0, suma: false });
    assert.deepEqual(resumenDelPaquete(resultado, r, 'asistente', indexar(paquetesIncluidos())), ['Ninguna regla puntuable ha saltado: bien.']);
    const { analizar } = await motorDelNavegador();
    const paquetes = paquetesIncluidos();
    const indice = indexar(paquetes);
    const mixto = analizar(TEXTO_DE_COMBINACION_REAL, paquetes, { genero: 'general' });
    const espanol = mixto.paquetes[1]!;
    const filas = espanol.puntuacion.familias.flatMap((f) => f.reglas.map((x) => ({ ...x, familia: f.nombre }))).filter((x) => x.n > 0);
    const n = filas.reduce((suma, x) => suma + x.n, 0);
    const dos = enOrden(filas, (x) => [-x.n, x.familia, indice.reglas.get(`Español correcto::${x.id}`)!.nombre!]).slice(0, 2);
    assert.deepEqual(resumenDelPaquete(mixto, espanol, 'norma', indice), [
      `${n} avisos de norma: ${dos.map((x) => `${indice.reglas.get(`Español correcto::${x.id}`)!.nombre} (${x.n})`).join(' y ')}.`,
    ]);
    assert.deepEqual(resumenDelPaquete({ ...mixto, senales: [] }, { ...espanol, puntuacion: { ...espanol.puntuacion, familias: [] } }, 'norma', indice), ['Ningún aviso de norma.']);
  });
});

describe('los motivos en claro y las líneas del conjunto', () => {
  const regla = (id: string): Paquete['reglas'][number] => paquetesIncluidos().flatMap((p) => p.reglas).find((r) => r.id === id)!;

  test('«No miradas»: de la regla, con los géneros en la calle o la longitud', () => {
    assert.equal(motivoNoMirada(regla('disc-sin-automenciones'), 'motivo del motor'), 'solo se miran en las críticas de cine y los textos académicos');
    const sinGeneros = { ...regla('disc-sin-automenciones'), generos: undefined };
    assert.equal(motivoNoMirada(sinGeneros, 'motivo del motor'), 'solo se miran en textos de 300 palabras o más');
  });

  test('«Sin textos de personas con los que comparar»: para este tipo y longitud, o no se puede medir', () => {
    assert.equal(motivoSinComparar('sin calibración para «ttr», género «narrativa-clasica», tramo «100-299»'), 'para este tipo de texto y esta longitud');
    assert.equal(motivoSinComparar('no calculable: «ratio-comas-puntos» no tiene valor en este texto'), 'no se puede medir en este texto');
  });

  test('la línea de una regla que suma, con su meta; la de una de contexto, con lo habitual', () => {
    const referencia = { p1: 0.4, p5: 0.5, p50: 0.56, p95: 0.62, p99: 0.7, n: 900 };
    const suma = { reglaId: 'est-pocas-comas', ambito: 'texto', metrica: 'ratio-comas-puntos', valor: 0.38, referencia, lado: 'abajo' } as never;
    assert.equal(lineaDelTextoEntero(suma, 'las noticias', false, regla('est-pocas-comas')), '0,38 comas por punto; lo normal en las noticias es más de 0,4');
    const dentro = { reglaId: 'est-ttr', ambito: 'texto', metrica: 'ttr', valor: 0.58, referencia, lado: null } as never;
    assert.equal(lineaDelTextoEntero(dentro, 'las noticias', true, regla('est-ttr')), '0,58 de palabras distintas sobre el total (de 0 a 1): dentro de lo habitual en las noticias (de 0,5 a 0,62)');
    const arriba = { reglaId: 'est-ttr', ambito: 'texto', metrica: 'ttr', valor: 0.8, referencia, lado: 'arriba' } as never;
    assert.equal(lineaDelTextoEntero(arriba, 'las noticias', true, regla('est-ttr')), '0,8 de palabras distintas sobre el total (de 0 a 1): por encima de lo habitual en las noticias (de 0,5 a 0,62)');
    const ausencia = { reglaId: 'disc-sin-automenciones', ambito: 'texto', coincidencias: 0, minimo: 1 } as never;
    assert.equal(lineaDelTextoEntero(ausencia, 'las noticias', false, regla('disc-sin-automenciones')), 'ni una vez en el texto');
  });
});
