/**
 * Los jueces de la lógica de la pantalla que no necesita navegador (encargo
 * 6.2, c): los tramos de la vista, el id humanizado, los géneros del selector
 * y la carga de los paquetes. Lo que pinta en el DOM se ve en Chrome (parada 3)
 * y en los jueces de la web construida (construccion.spec.ts).
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { partirEnTramos } from '../src/pantalla/tramos.ts';
import { idHumanizado, nombreDeRegla } from '../src/pantalla/humanizar.ts';
import { GENERO_POR_DEFECTO, generosDe, nombreDeGenero } from '../src/pantalla/generos.ts';
import { cargarPaquetes, conBarraFinal, FICHEROS } from '../src/pantalla/cargar.ts';
import { cargarEjemplo, urlDeEjemplo } from '../src/pantalla/ejemplos.ts';
import { parametrosEnLlano, primeraFrase, reglasDelCatalogo, urlDeRegla, urlDelAnalizador, urlDelCatalogo } from '../src/catalogo/catalogo.ts';
import { coincide, paraBuscar } from '../src/catalogo/filtro.ts';
import { enOrden } from '../src/orden.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { paquetesIncluidos } from './apoyo.ts';
import type { Paquete, ResultadoDeValidacion } from '@radiografia/motor/navegador';

describe('partirEnTramos: la vista partida por todos los límites de señal', () => {
  test('sin señales, un solo tramo sin señales', () => {
    assert.deepEqual(partirEnTramos(10, []), [{ inicio: 0, fin: 10, senales: [] }]);
  });

  test('dos señales que se solapan: cada trozo lleva las que lo cubren enteras', () => {
    // «0123456789»: la señal 0 cubre [2, 6) y la 1 cubre [4, 8).
    assert.deepEqual(partirEnTramos(10, [{ inicio: 2, fin: 6 }, { inicio: 4, fin: 8 }]), [
      { inicio: 0, fin: 2, senales: [] },
      { inicio: 2, fin: 4, senales: [0] },
      { inicio: 4, fin: 6, senales: [0, 1] },
      { inicio: 6, fin: 8, senales: [1] },
      { inicio: 8, fin: 10, senales: [] },
    ]);
  });

  test('una señal dentro de otra, y dos con los mismos límites', () => {
    assert.deepEqual(partirEnTramos(6, [{ inicio: 0, fin: 6 }, { inicio: 2, fin: 3 }, { inicio: 2, fin: 3 }]), [
      { inicio: 0, fin: 2, senales: [0] },
      { inicio: 2, fin: 3, senales: [0, 1, 2] },
      { inicio: 3, fin: 6, senales: [0] },
    ]);
  });

  test('una señal vacía no parte nada, y los tramos cubren el texto entero sin huecos', () => {
    const tramos = partirEnTramos(7, [{ inicio: 3, fin: 3 }, { inicio: 1, fin: 5 }]);
    assert.deepEqual(tramos, [
      { inicio: 0, fin: 1, senales: [] },
      { inicio: 1, fin: 5, senales: [1] },
      { inicio: 5, fin: 7, senales: [] },
    ]);
  });
});

describe('idHumanizado (firmado en la parada 1 del 6.2, punto 10)', () => {
  test('sin el prefijo de familia, guiones a espacios y la primera letra en mayúscula', () => {
    assert.equal(idHumanizado('est-frases-cortas'), 'Frases cortas');
    assert.equal(idHumanizado('canal-espacio-estrecho-u202f'), 'Espacio estrecho u202f');
    assert.equal(idHumanizado('orto-moneda-antepuesta'), 'Moneda antepuesta');
    assert.equal(idHumanizado('singuion'), 'Singuion');
  });
});

describe('nombreDeRegla (encargo 7.1)', () => {
  test('el campo nombre de la ficha; sin él (paquetes de terceros), el id humanizado', () => {
    assert.equal(nombreDeRegla('disc-atribucion-vaga', { nombre: 'Atribución vaga' }), 'Atribución vaga');
    assert.equal(nombreDeRegla('disc-atribucion-vaga', {}), 'Atribucion vaga');
    assert.equal(nombreDeRegla('disc-atribucion-vaga', undefined), 'Atribucion vaga');
  });
});

describe('los géneros del selector', () => {
  const paquete = {
    cabecera: { calibracion: { ttr: { noticia: {}, general: {} }, mtld: { general: {}, opinion: {} } } },
  } as unknown as Paquete;

  test('las claves de la calibración, sin repetir, con «general» primero', () => {
    assert.equal(GENERO_POR_DEFECTO, 'general');
    assert.deepEqual(generosDe([paquete]), ['general', 'noticia', 'opinion']);
  });

  test('el nombre visible de cada género; si no lo tiene, la clave', () => {
    assert.deepEqual(
      ['general', 'noticia', 'administrativo', 'narrativa-clasica', 'academico', 'opinion', 'corporativo'].map(nombreDeGenero),
      ['General', 'Noticia', 'Administrativo', 'Narrativa clásica', 'Académico', 'Opinión', 'corporativo'],
    );
  });
});

describe('la carga de los paquetes', () => {
  test('conBarraFinal: la base de Astro siempre acaba en «/»', () => {
    assert.equal(conBarraFinal('/'), '/');
    assert.equal(conBarraFinal('/radiografia'), '/radiografia/');
    assert.equal(conBarraFinal('/radiografia/'), '/radiografia/');
  });

  const valido: ResultadoDeValidacion = { valido: true, errores: [] };
  const respuesta = (cuerpo: unknown, estado = 200) => new Response(JSON.stringify(cuerpo), { status: estado });

  test('pide cada paquete con la base delante y los devuelve si validan', async () => {
    const pedidas: string[] = [];
    const carga = await cargarPaquetes('/base', async (url) => (pedidas.push(url), respuesta({ url })), () => valido);
    assert.deepEqual(pedidas, FICHEROS.map((f) => `/base/paquetes/${f}`));
    assert.deepEqual(carga, { paquetes: FICHEROS.map((f) => ({ url: `/base/paquetes/${f}` })), problemas: [] });
  });

  test('un paquete que no valida: su nombre y los mensajes del validador, y ningún paquete', async () => {
    const invalido: ResultadoDeValidacion = {
      valido: false,
      errores: [{ regla: null, campo: 'cabecera.version', mensaje: 'falta este campo obligatorio', texto: 'campo "cabecera.version": falta este campo obligatorio' }],
    };
    const carga = await cargarPaquetes('/', async (url) => respuesta({ url }), (p) => ((p as { url: string }).url.endsWith(FICHEROS[1]) ? invalido : valido));
    assert.deepEqual(carga, { paquetes: null, problemas: [{ paquete: FICHEROS[1], mensajes: ['campo "cabecera.version": falta este campo obligatorio'] }] });
  });

  test('un fetch que falla o un 404: el paquete y por qué', async () => {
    const carga = await cargarPaquetes('/', async (url) => {
      if (url.endsWith(FICHEROS[0])) throw new TypeError('Failed to fetch');
      return respuesta({}, 404);
    }, () => valido);
    assert.deepEqual(carga, {
      paquetes: null,
      problemas: [
        { paquete: FICHEROS[0], mensajes: [`no se pudo cargar /paquetes/${FICHEROS[0]}: Failed to fetch`] },
        { paquete: FICHEROS[1], mensajes: [`no se pudo cargar /paquetes/${FICHEROS[1]}: HTTP 404`] },
      ],
    });
  });
});

describe('los textos de ejemplo (encargo 6.3, a)', () => {
  test('la URL de cada ejemplo, con la base delante', () => {
    assert.equal(urlDeEjemplo('/', 'humano'), '/ejemplos/antonio.txt');
    assert.equal(urlDeEjemplo('/radiografia', 'ia'), '/radiografia/ejemplos/ia.txt');
  });

  test('cargarEjemplo: el texto tal cual llega, o por qué no se pudo', async () => {
    const pedidas: string[] = [];
    assert.deepEqual(await cargarEjemplo('/', 'ia', async (url) => (pedidas.push(url), new Response('«Así»\n\ny más.'))), { texto: '«Así»\n\ny más.', problema: null });
    assert.deepEqual(pedidas, ['/ejemplos/ia.txt']);
    assert.deepEqual(await cargarEjemplo('/', 'humano', async () => new Response('', { status: 404 })), {
      texto: null,
      problema: 'No se ha podido cargar el ejemplo /ejemplos/antonio.txt: HTTP 404.',
    });
    assert.deepEqual(
      await cargarEjemplo('/', 'humano', async () => {
        throw new TypeError('Failed to fetch');
      }),
      { texto: null, problema: 'No se ha podido cargar el ejemplo /ejemplos/antonio.txt: Failed to fetch.' },
    );
  });
});

describe('el catálogo de reglas (encargo 7.1, b)', () => {
  const paquete = (nombre: string, ids: string[]): Paquete =>
    ({
      cabecera: { nombre, version: '0.1.0', descripcion: `El paquete ${nombre}.`, familias: [{ id: 'f', nombre: 'Efe', informativa: false }] },
      reglas: ids.map((id) => ({ id, familia: 'f' })),
    }) as unknown as Paquete;

  test('las URL del catálogo, de cada ficha y del analizador, con la base delante y la barra final', () => {
    assert.equal(urlDelAnalizador('/'), '/');
    assert.equal(urlDelCatalogo('/'), '/reglas/');
    assert.equal(urlDeRegla('/', 'disc-atribucion-vaga'), '/reglas/disc-atribucion-vaga/');
    assert.equal(urlDelAnalizador('/radiografia'), '/radiografia/');
    assert.equal(urlDeRegla('/radiografia', 'est-ttr'), '/radiografia/reglas/est-ttr/');
  });

  test('reglasDelCatalogo: cada regla con su paquete y su familia, en el orden de los paquetes', () => {
    const entradas = reglasDelCatalogo([paquete('Uno', ['a-1', 'a-2']), paquete('Dos', ['b-1'])]);
    assert.deepEqual(
      entradas.map((e) => [e.regla.id, e.paquete.nombre, e.paquete.descripcion, e.familia.nombre]),
      [
        ['a-1', 'Uno', 'El paquete Uno.', 'Efe'],
        ['a-2', 'Uno', 'El paquete Uno.', 'Efe'],
        ['b-1', 'Dos', 'El paquete Dos.', 'Efe'],
      ],
    );
  });

  test('reglasDelCatalogo: un id en dos paquetes para el build, nombrando los dos', () => {
    assert.throws(() => reglasDelCatalogo([paquete('Uno', ['a-1', 'x-1']), paquete('Dos', ['x-1'])]), {
      message: 'el id "x-1" está en «Uno» y en «Dos»: las dos fichas tendrían la misma URL, /reglas/x-1/',
    });
  });

  test('primeraFrase: la primera frase, sin cortar dentro de un paréntesis ni de unas comillas', () => {
    assert.equal(primeraFrase('Una frase. Y otra.'), 'Una frase.');
    // La de est-poca-puntuacion: el «?» de la lista de signos no cierra la frase.
    assert.equal(
      primeraFrase('Poca puntuación: cuenta (. , ; : ¿ ? ¡ ! ( ) « » —) por cada 1.000 palabras. Se compara.'),
      'Poca puntuación: cuenta (. , ; : ¿ ? ¡ ! ( ) « » —) por cada 1.000 palabras.',
    );
    assert.equal(primeraFrase('Dice «¿Seguro? Sí.» y sigue. Otra.'), 'Dice «¿Seguro? Sí.» y sigue.');
    assert.equal(primeraFrase('Sin punto final'), 'Sin punto final');
  });

  test('paraBuscar: minúsculas y sin tildes, para que «atribucion» encuentre «Atribución»', () => {
    assert.equal(paraBuscar('Atribución Vaga · disc-atribucion-vaga'), 'atribucion vaga · disc-atribucion-vaga');
  });

  test('coincide: cada palabra buscada en el texto; dentro de un filtro, cualquiera; entre filtros, todos', () => {
    const fila = { texto: paraBuscar('Atribución vaga disc-atribucion-vaga Opiniones atribuidas a una autoridad sin nombre'), familia: 'RadiografIA::discurso', severidad: 'media', detector: 'patrón' };
    const nada = { consulta: '', familias: new Set<string>(), severidades: new Set<string>(), detectores: new Set<string>() };
    assert.equal(coincide(fila, nada), true, 'sin filtro, todas');
    assert.equal(coincide(fila, { ...nada, consulta: '  Autoridad   ATRIBUCIÓN ' }), true, 'dos palabras, en otro orden y con tilde');
    assert.equal(coincide(fila, { ...nada, consulta: 'autoridad experta' }), false, 'una palabra que no está');
    assert.equal(coincide(fila, { ...nada, familias: new Set(['RadiografIA::lexico', 'RadiografIA::discurso']) }), true, 'una de las familias marcadas');
    assert.equal(coincide(fila, { ...nada, familias: new Set(['RadiografIA::lexico']) }), false, 'otra familia');
    assert.equal(coincide(fila, { ...nada, severidades: new Set(['media']), detectores: new Set(['estructural']) }), false, 'la severidad sí y el detector no');
    assert.equal(coincide(fila, { ...nada, consulta: 'vaga', severidades: new Set(['media']), detectores: new Set(['patrón', 'estructural']) }), true, 'todo a la vez');
  });

  test('parametrosEnLlano: lo que busca cada detector, en palabras', () => {
    const regla = (id: string) => {
      const r = paquetesIncluidos()[0]!.reglas.find((x) => x.id === id);
      assert.ok(r, `el paquete ya no trae ${id}`);
      return r;
    };
    const regex = (id: string): string | undefined => {
      const r = regla(id);
      assert.ok(r.detector !== 'estadístico', `${id} no tiene regex`);
      return r.parametros.regex;
    };
    const llano = (id: string) => parametrosEnLlano(regla(id)).map((p) => `${p.etiqueta}: ${p.valor}${p.codigo ? ' [código]' : ''}`);
    assert.deepEqual(llano('lex-innovador'), ['Dónde mira: palabra a palabra', 'Formas: 4 formas']);
    assert.deepEqual(llano('disc-sin-automenciones'), [
      'Dónde mira: en cada frase entera',
      `Expresión regular: ${regex('disc-sin-automenciones')} [código]`,
      'Banderas: iu [código]',
      'Cuándo señala: si no aparece ninguna en el texto entero, y solo con 300 palabras de prosa o más',
      'Géneros: solo en Opinión y Académico',
    ]);
    assert.deepEqual(llano('disc-marcador-repetido'), [
      'Dónde mira: al principio de cada frase',
      `Expresión regular: ${regex('disc-marcador-repetido')} [código]`,
      'Banderas: iu [código]',
      'Repetición: solo cuenta la forma que aparece 3 veces o más',
    ]);
    assert.deepEqual(llano('canal-separador-o-tabla'), [
      'Dónde mira: al principio de cada párrafo',
      `Expresión regular: ${regex('canal-separador-o-tabla')} [código]`,
      'También mira: viñetas, encabezados y tablas',
    ]);
    assert.deepEqual(llano('est-pocas-comas'), [
      'Métrica: ratio-comas-puntos [código]',
      'Dispara: por debajo de la banda humana',
      'Banda humana: entre los percentiles 1 y 99 de los textos humanos de su género y longitud',
    ]);
  });
});

describe('el orden de presentación (cierre del 7.1, firmado por Antonio)', () => {
  test('enOrden: por cada clave, los números de menor a mayor y los textos con localeCompare en «es»; sin tocar la lista', () => {
    const palabras = ['Zeta', 'Ñu', 'árbol', 'Nube', 'Abeto', 'Árbol'];
    assert.deepEqual(enOrden(palabras, (p) => [p]), ['Abeto', 'árbol', 'Árbol', 'Nube', 'Ñu', 'Zeta']);
    assert.deepEqual(palabras, ['Zeta', 'Ñu', 'árbol', 'Nube', 'Abeto', 'Árbol'], 'la lista de entrada no cambia');
    const filas = [
      { p: 1, f: 'Ortotipografía', r: 'Mes' },
      { p: 0, f: 'Sintaxis', r: 'Coletilla' },
      { p: 0, f: 'Léxico', r: 'Verbos' },
      { p: 0, f: 'Léxico', r: 'Adjetivo' },
      { p: 1, f: 'Gramática', r: 'Pasiva' },
    ];
    assert.deepEqual(
      enOrden(filas, (x) => [x.p, x.f, x.r]).map((x) => x.r),
      ['Adjetivo', 'Verbos', 'Coletilla', 'Pasiva', 'Mes'],
    );
  });

  test('generosDe: «general» primero y el resto alfabético por su nombre visible', () => {
    assert.deepEqual(generosDe([paquetesIncluidos()[0]!]), ['general', 'academico', 'administrativo', 'narrativa-clasica', 'noticia', 'opinion']);
  });

  test('indexar: las familias, por paquete y alfabéticas por su nombre; cada una con el color de antes', () => {
    assert.deepEqual(
      indexar(paquetesIncluidos()).familias.map((f) => [f.clave, f.clase]),
      [
        ['RadiografIA::canal', 'familia-informativa'],
        ['RadiografIA::discurso', 'familia-color-4'],
        ['RadiografIA::estadistica', 'familia-color-3'],
        ['RadiografIA::lexico', 'familia-color-0'],
        ['RadiografIA::puntuacion-formato', 'familia-color-2'],
        ['RadiografIA::sintaxis', 'familia-color-1'],
        ['Español correcto::gramatica', 'familia-color-5'],
        ['Español correcto::ortotipografia', 'familia-color-6'],
      ],
    );
  });
});
