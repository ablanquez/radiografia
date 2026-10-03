/**
 * Los jueces de la lógica del lenguaje de calle (encargo 9.2, b; firmado por
 * Antonio en la parada 1). Lo que se ve lo mira Chrome (navegador.spec.ts).
 *
 *   1. La etiqueta y la frase del medidor (etiquetaDelPaquete; retoque del
 *      9.2, firmado por Antonio el 03/10): una etiqueta por banda y una frase
 *      por banda y por género, con el género en singular y su concordancia
 *      («una crítica de cine… escrita», «un texto… escrito», «con las que» y
 *      «con los que»); «Texto sin indicios…» solo si no suma ninguna regla
 *      (si suman y restan hasta 0, la de la banda); sin calibración; con
 *      texto corto, la de su banda y el aviso debajo; las de un paquete
 *      propio con escala; y ninguna sin escala o con texto insuficiente.
 *      Ninguna dice «p95», ni «generado»: el verbo es «suena a».
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
import * as textos from '../src/textos.ts';
import type { Paquete, Resultado } from '@radiografia/motor/navegador';
import { detalleDelPaquete, etiquetaDelPaquete, generoEnCalle, lineaDelTextoEntero, motivoNoMirada, motivoSinComparar, resumenDelPaquete } from '../src/pantalla/lectura.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { enOrden } from '../src/orden.ts';
import { motorDelNavegador, paquetesIncluidos, TEXTO_DE_COMBINACION_REAL } from './apoyo.ts';

type ResultadoDePaquete = Resultado['paquetes'][number];
const cifra = (x: number): string => new Intl.NumberFormat('es', { maximumFractionDigits: 2 }).format(x);

/** Un resultado de un paquete con escala, hecho a mano: lo justo que leen la etiqueta y la frase. */
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
  test('en singular y en plural, con su género gramatical y su concordancia; uno desconocido, con su clave', () => {
    assert.deepEqual(generoEnCalle('opinion'), {
      singular: 'crítica de cine',
      plural: 'críticas de cine',
      femenino: true,
      un: 'una',
      los: 'las',
      escrito: 'escrita',
      escritos: 'escritas',
      conArticulo: 'las críticas de cine',
    });
    assert.deepEqual(generoEnCalle('narrativa-clasica'), {
      singular: 'texto de narrativa clásica',
      plural: 'textos de narrativa clásica',
      femenino: false,
      un: 'un',
      los: 'los',
      escrito: 'escrito',
      escritos: 'escritos',
      conArticulo: 'los textos de narrativa clásica',
    });
    assert.equal(generoEnCalle('carta').conArticulo, 'los textos del género «carta»');
  });
});

describe('la etiqueta y la frase del medidor', () => {
  const BANDAS = ['por debajo de la mediana', 'entre la mediana y el p95', 'por encima del p95', 'por encima del p99'] as const;
  const lectura = (banda: string, genero: string, opciones?: Parameters<typeof conBanda>[2], voz: 'asistente' | 'propio' = 'asistente') =>
    etiquetaDelPaquete(...conBanda(banda, genero, opciones), voz);

  test('una etiqueta por banda, la misma en todos los géneros', () => {
    const ETIQUETAS = [
      'Texto con muy pocos rasgos que indiquen que tiene Asistente IA',
      'Dentro de lo normal',
      'Texto con bastantes rasgos de Asistente IA',
      'Texto con muchos rasgos de Asistente IA',
    ];
    for (const genero of ['general', 'noticia', 'opinion', 'academico', 'administrativo', 'narrativa-clasica']) {
      assert.deepEqual(
        BANDAS.map((b) => lectura(b, genero)?.etiqueta),
        ETIQUETAS,
        genero,
      );
    }
  });

  test('una frase por banda y por género, a mano: el género en singular y la concordancia', () => {
    const FRASES: Readonly<Record<string, readonly string[]>> = {
      general: [
        'Tu texto suena menos a asistente (IA) que un texto normal escrito por una persona.',
        'Suena como cualquier texto escrito por una persona. Nada raro.',
        'Tu texto suena bastante a asistente (IA): de cada 100 textos escritos por personas, solo 5 suenan tanto.',
        'Tu texto suena mucho a asistente (IA): de cada 100 textos escritos por personas, solo 1 suena tanto.',
      ],
      noticia: [
        'Tu texto suena menos a asistente (IA) que una noticia normal escrita por una persona.',
        'Suena como cualquier noticia escrita por una persona. Nada raro.',
        'Tu texto suena bastante a asistente (IA): de cada 100 noticias escritas por personas, solo 5 suenan tanto.',
        'Tu texto suena mucho a asistente (IA): de cada 100 noticias escritas por personas, solo 1 suena tanto.',
      ],
      opinion: [
        'Tu texto suena menos a asistente (IA) que una crítica de cine normal escrita por una persona.',
        'Suena como cualquier crítica de cine escrita por una persona. Nada raro.',
        'Tu texto suena bastante a asistente (IA): de cada 100 críticas de cine escritas por personas, solo 5 suenan tanto.',
        'Tu texto suena mucho a asistente (IA): de cada 100 críticas de cine escritas por personas, solo 1 suena tanto.',
      ],
      academico: [
        'Tu texto suena menos a asistente (IA) que un texto académico normal escrito por una persona.',
        'Suena como cualquier texto académico escrito por una persona. Nada raro.',
        'Tu texto suena bastante a asistente (IA): de cada 100 textos académicos escritos por personas, solo 5 suenan tanto.',
        'Tu texto suena mucho a asistente (IA): de cada 100 textos académicos escritos por personas, solo 1 suena tanto.',
      ],
      administrativo: [
        'Tu texto suena menos a asistente (IA) que un texto administrativo normal escrito por una persona.',
        'Suena como cualquier texto administrativo escrito por una persona. Nada raro.',
        'Tu texto suena bastante a asistente (IA): de cada 100 textos administrativos escritos por personas, solo 5 suenan tanto.',
        'Tu texto suena mucho a asistente (IA): de cada 100 textos administrativos escritos por personas, solo 1 suena tanto.',
      ],
      'narrativa-clasica': [
        'Tu texto suena menos a asistente (IA) que un texto de narrativa clásica normal escrito por una persona.',
        'Suena como cualquier texto de narrativa clásica escrito por una persona. Nada raro.',
        'Tu texto suena bastante a asistente (IA): de cada 100 textos de narrativa clásica escritos por personas, solo 5 suenan tanto.',
        'Tu texto suena mucho a asistente (IA): de cada 100 textos de narrativa clásica escritos por personas, solo 1 suena tanto.',
      ],
    };
    for (const [genero, frases] of Object.entries(FRASES)) {
      assert.deepEqual(
        BANDAS.map((b) => lectura(b, genero)?.frase),
        frases,
        genero,
      );
    }
  });

  test('ninguna dice percentiles ni «generado», y nunca afirma autoría: «suena a»', () => {
    const generos = ['general', 'noticia', 'opinion', 'academico', 'administrativo', 'narrativa-clasica'];
    const todas = [
      ...BANDAS.flatMap((b) => generos.map((g) => lectura(b, g))),
      lectura('entre la mediana y el p95', 'general', { total: 0, suma: false }),
    ];
    for (const x of todas) {
      assert.ok(x !== null, 'con escala, etiqueta y frase');
      const junto = `${x.etiqueta} · ${x.frase}`;
      assert.doesNotMatch(junto, /p\d\d|percentil|mediana|generad|detectad|escrit[oa]s? por (una )?IA/iu);
      assert.match(x.frase, /suen[ae]/iu, x.frase);
    }
  });

  test('1 · total 0 sin nada que sume: sin indicios; total 0 sumando y restando, la de la banda', () => {
    assert.deepEqual(lectura('entre la mediana y el p95', 'noticia', { total: 0, suma: false }), {
      etiqueta: 'Texto sin indicios de Asistente IA',
      frase: 'Aquí no hay nada que suene a asistente (IA).',
      aviso: null,
    });
    assert.deepEqual(lectura('entre la mediana y el p95', 'noticia', { total: 0, suma: true }), {
      etiqueta: 'Dentro de lo normal',
      frase: 'Suena como cualquier noticia escrita por una persona. Nada raro.',
      aviso: null,
    });
  });

  test('6 · sin calibración: «No podemos comparar», con la concordancia del género', () => {
    assert.deepEqual(lectura('sin calibración', 'opinion'), {
      etiqueta: 'No podemos comparar',
      frase: 'No tenemos críticas de cine de este tamaño escritas por personas con las que comparar. Mira el detalle.',
      aviso: null,
    });
    assert.equal(
      lectura('sin calibración', 'narrativa-clasica')?.frase,
      'No tenemos textos de narrativa clásica de este tamaño escritos por personas con los que comparar. Mira el detalle.',
    );
  });

  test('7 · texto corto: la etiqueta y la frase de su banda, y el aviso debajo', () => {
    const aviso = 'Ojo: tu texto es corto (menos de 300 palabras). Tómate el resultado como orientativo.';
    assert.deepEqual(lectura('por encima del p95', 'general', { tramo: 'poco-fiable' }), {
      etiqueta: 'Texto con bastantes rasgos de Asistente IA',
      frase: 'Tu texto suena bastante a asistente (IA): de cada 100 textos escritos por personas, solo 5 suenan tanto.',
      aviso,
    });
    assert.equal(lectura('entre la mediana y el p95', 'opinion', { total: 0, suma: false, tramo: 'poco-fiable' })?.aviso, aviso);
    assert.equal(lectura('por encima del p95', 'general')?.aviso, null, 'con 300 palabras o más, sin aviso');
  });

  test('8 · un paquete propio con escala: pocas, bastantes o muchas señales; sin calibración, la 6 con sus textos de referencia', () => {
    const propio = (banda: string, opciones: Parameters<typeof conBanda>[2] = {}) => lectura(banda, 'general', { paquete: 'Mi paquete', ...opciones }, 'propio');
    // La frase de «pocas», firmada por Antonio el 03/10 al aprobar las seis decisiones del retoque.
    const pocas = { etiqueta: 'Texto con pocas señales del paquete «Mi paquete»', frase: 'Tu texto tiene menos señales de «Mi paquete» que un texto de referencia normal.', aviso: null };
    assert.deepEqual(propio('por debajo de la mediana'), pocas);
    assert.deepEqual(propio('entre la mediana y el p95'), pocas);
    assert.deepEqual(propio('por encima del p95'), {
      etiqueta: 'Texto con bastantes señales del paquete «Mi paquete»',
      frase: 'De cada 100 textos de referencia de «Mi paquete», solo 5 tienen tantas señales como el tuyo.',
      aviso: null,
    });
    assert.deepEqual(propio('por encima del p99'), {
      etiqueta: 'Texto con muchas señales del paquete «Mi paquete»',
      frase: 'De cada 100 textos de referencia de «Mi paquete», solo 1 tiene tantas señales como el tuyo.',
      aviso: null,
    });
    assert.deepEqual(propio('sin calibración'), {
      etiqueta: 'No podemos comparar',
      frase: 'No tenemos textos de referencia de «Mi paquete» de este tamaño con los que comparar. Mira el detalle.',
      aviso: null,
    });
    // «Sin indicios de Asistente IA» es de RadiografIA: un propio sin nada que sume va por su banda.
    assert.deepEqual(propio('por debajo de la mediana', { total: 0, suma: false }), pocas);
    assert.equal(propio('por encima del p95', { tramo: 'poco-fiable' })?.aviso, 'Ojo: tu texto es corto (menos de 300 palabras). Tómate el resultado como orientativo.');
  });

  test('sin escala o con texto insuficiente, ninguna', () => {
    const [resultado, r] = conBanda('por encima del p95', 'general');
    assert.equal(etiquetaDelPaquete(resultado, { ...r, banda: null }, 'norma'), null);
    assert.equal(etiquetaDelPaquete({ ...resultado, tramo: 'insuficiente' }, r, 'asistente'), null);
  });
});

describe('el detalle plegado', () => {
  test('«1 punto», en singular; «8,06 puntos» y «0 puntos», en plural', () => {
    const [resultado, r] = conBanda('por debajo de la mediana', 'opinion', { total: 1 });
    assert.equal(detalleDelPaquete(resultado, r, 'Opinión (críticas de cine)')[0], 'Tu total: 1 punto por cada 1.000 palabras.');
    assert.equal(textos.totalEnClaro('1'), 'Total: 1 punto por cada 1.000 palabras.');
    assert.equal(textos.totalEnClaro('8,06'), 'Total: 8,06 puntos por cada 1.000 palabras.');
    assert.equal(textos.vecesYPuntos(1, '1'), '1 vez · 1 punto');
    assert.equal(textos.vecesYPuntos(1, '-1'), '1 vez · -1 punto');
    assert.equal(textos.vecesYPuntos(2, '0'), '2 veces · 0 puntos');
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
