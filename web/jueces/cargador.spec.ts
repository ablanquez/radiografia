/**
 * Los jueces de la lógica del cargador de paquetes (encargo 8.1, b; firmado
 * en la parada 1). Lo que pinta en el DOM lo mira Chrome (navegador.spec.ts).
 *
 *   1. leerPaquetePropio (propios.ts), con el validador del navegador, en el
 *      orden firmado: tamaño → JSON → esquema y paso 2 → nombre. La primera
 *      que falla corta y el paquete no entra:
 *        · más de 2 MB: rechazado SIN leerlo (un fichero cuyo text() lanza);
 *          justo 2 MB pasa del tamaño;
 *        · JSON roto: rechazado con la frase y lo que dice JSON.parse;
 *        · inválido: rechazado con los mensajes del validador, tal cual;
 *        · el nombre de un incluido (esté marcado o no: se le pasan todos) o
 *          el de otro propio: rechazado, cada uno con su mensaje;
 *        · válido: aceptado, también con un BOM delante.
 *   2. activos: los incluidos marcados, en su orden, y después los propios,
 *      en el de carga.
 *   3. generosDe: la unión de los géneros de la calibración de los paquetes
 *      que se le pasan, con «general» siempre y primero.
 *   4. indexar con un paquete propio: los colores de los incluidos no cambian
 *      (el reparto es estable), las familias del propio llevan la marca de
 *      propio, y una familia que se llama como una de otro paquete es otra
 *      entrada, con su clave; analizar da a cada señal su paquete.
 * Los paquetes sintéticos se hacen aquí a partir de Español correcto: la unión
 * de géneros y las familias homónimas se juzgan con ellos (firmado en la
 * parada 1: el paquete de prueba no trae calibración).
 *
 * [DOC] https://nodejs.org/docs/latest-v24.x/api/globals.html — File es
 *    global en Node («Added in: v20.0.0»): el juez lee Files de verdad.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Paquete } from '@radiografia/motor/navegador';
import * as textos from '../src/textos.ts';
import { activos, LIMITE_EN_BYTES, leerPaquetePropio } from '../src/pantalla/propios.ts';
import { generosDe } from '../src/pantalla/generos.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { motorDelNavegador, paquetesIncluidos } from './apoyo.ts';

/** Un paquete válido hecho de Español correcto, con otro nombre. */
function sintetico(nombre: string): Paquete {
  const paquete = structuredClone(paquetesIncluidos()[1]!);
  paquete.cabecera.nombre = nombre;
  return paquete;
}

/** Uno con una familia que se llama como la de RadiografIA, «Léxico» (id lexico): la de gramática, renombrada. */
function conLexico(nombre: string): Paquete {
  const paquete = sintetico(nombre);
  paquete.cabecera.familias = paquete.cabecera.familias.map((f) => (f.id === 'gramatica' ? { ...f, id: 'lexico', nombre: 'Léxico' } : f));
  for (const regla of paquete.reglas) if (regla.familia === 'gramatica') regla.familia = 'lexico';
  return paquete;
}

const comoFichero = (dato: unknown, nombre: string): File => new File([JSON.stringify(dato)], nombre);
const nombres = (paquetes: readonly Paquete[]): string[] => paquetes.map((p) => p.cabecera.nombre);

describe('leerPaquetePropio: tamaño → JSON → esquema y paso 2 → nombre', () => {
  test('más de 2 MB: rechazado sin leerlo', async () => {
    const { validarPaquete } = await motorDelNavegador();
    const grande = {
      name: 'grande.json',
      size: LIMITE_EN_BYTES + 1,
      text: async (): Promise<string> => {
        throw new Error('no se tenía que leer: pasa del límite');
      },
    };
    const r = await leerPaquetePropio(grande, paquetesIncluidos(), [], validarPaquete);
    assert.deepEqual(r, { paquete: null, problema: { titulo: textos.noSeCargaPorTamano('grande.json', '2,1', '2'), mensajes: [] } });
  });

  test('justo 2 MB pasa del tamaño y se lee', async () => {
    const { validarPaquete } = await motorDelNavegador();
    const justo = { name: 'justo.json', size: LIMITE_EN_BYTES, text: async (): Promise<string> => 'no es JSON' };
    const r = await leerPaquetePropio(justo, paquetesIncluidos(), [], validarPaquete);
    assert.equal(r.problema?.titulo, textos.noSeCargaPorJson('justo.json'));
  });

  test('JSON roto: rechazado con la frase y, detrás, lo que dice el navegador', async () => {
    const { validarPaquete } = await motorDelNavegador();
    const roto = '{"cabecera": {"nombre": "X",}}';
    let detalle = '';
    try {
      JSON.parse(roto);
    } catch (fallo) {
      detalle = (fallo as Error).message;
    }
    assert.notEqual(detalle, '');
    const r = await leerPaquetePropio(new File([roto], 'roto.json'), paquetesIncluidos(), [], validarPaquete);
    assert.deepEqual(r, { paquete: null, problema: { titulo: textos.noSeCargaPorJson('roto.json'), mensajes: [textos.elNavegadorDice(detalle)] } });
  });

  test('inválido: rechazado con los mensajes del validador, tal cual', async () => {
    const { validarPaquete } = await motorDelNavegador();
    const malo = sintetico('Mío') as unknown as { reglas: { peso: unknown }[] };
    malo.reglas[2]!.peso = 'uno';
    const esperados = validarPaquete(malo).errores.map((e) => e.texto);
    assert.ok(esperados.some((m) => m.includes('campo "peso"')), `el validador no señala el peso: ${esperados.join(' | ')}`);
    const r = await leerPaquetePropio(comoFichero(malo, 'malo.json'), paquetesIncluidos(), [], validarPaquete);
    assert.deepEqual(r, { paquete: null, problema: { titulo: textos.noSeCargaPorEsquema('malo.json'), mensajes: esperados } });
  });

  test('el nombre de un incluido, marcado o no: rechazado', async () => {
    const { validarPaquete } = await motorDelNavegador();
    const r = await leerPaquetePropio(comoFichero(sintetico('Español correcto'), 'copia.json'), paquetesIncluidos(), [], validarPaquete);
    assert.deepEqual(r, { paquete: null, problema: { titulo: textos.noSeCargaPorNombreDeIncluido('copia.json', 'Español correcto'), mensajes: [] } });
  });

  test('el nombre de otro propio: rechazado', async () => {
    const { validarPaquete } = await motorDelNavegador();
    const r = await leerPaquetePropio(comoFichero(sintetico('Mío'), 'otra-vez.json'), paquetesIncluidos(), [sintetico('Mío')], validarPaquete);
    assert.deepEqual(r, { paquete: null, problema: { titulo: textos.noSeCargaPorNombre('otra-vez.json', 'Mío'), mensajes: [] } });
  });

  test('válido: aceptado, también con un BOM delante', async () => {
    const { validarPaquete } = await motorDelNavegador();
    const mio = sintetico('Mío');
    assert.deepEqual(await leerPaquetePropio(comoFichero(mio, 'mio.json'), paquetesIncluidos(), [], validarPaquete), { paquete: mio, problema: null });
    const conBom = new File([`﻿${JSON.stringify(mio)}`], 'bom.json');
    assert.deepEqual(await leerPaquetePropio(conBom, paquetesIncluidos(), [], validarPaquete), { paquete: mio, problema: null });
  });
});

describe('activos: los incluidos marcados y después los propios', () => {
  test('en el orden de los incluidos y en el de carga de los propios', () => {
    const incluidos = paquetesIncluidos();
    const propios = [sintetico('Uno'), sintetico('Dos')];
    assert.deepEqual(nombres(activos(incluidos, new Set(['RadiografIA', 'Español correcto']), propios)), ['RadiografIA', 'Español correcto', 'Uno', 'Dos']);
    assert.deepEqual(nombres(activos(incluidos, new Set(['Español correcto']), propios)), ['Español correcto', 'Uno', 'Dos']);
    assert.deepEqual(nombres(activos(incluidos, new Set(), [])), []);
  });
});

describe('generosDe: la unión de los géneros de la calibración, con «general» siempre y primero', () => {
  test('sin paquetes o sin calibración, solo «general»', () => {
    assert.deepEqual(generosDe([]), ['general']);
    assert.deepEqual(generosDe([paquetesIncluidos()[1]!]), ['general']);
  });

  test('con un propio que trae otro género, la unión, en el orden de su nombre visible', () => {
    const conCarta = sintetico('Con carta');
    conCarta.cabecera.calibracion = { '_total-con-carta': { general: {}, carta: {} } } as unknown as Paquete['cabecera']['calibracion'];
    assert.deepEqual(generosDe(paquetesIncluidos()), ['general', 'academico', 'administrativo', 'narrativa-clasica', 'noticia', 'opinion']);
    assert.deepEqual(generosDe([...paquetesIncluidos(), conCarta]), ['general', 'academico', 'administrativo', 'carta', 'narrativa-clasica', 'noticia', 'opinion']);
  });
});

describe('indexar con un paquete propio', () => {
  test('los colores de los incluidos no cambian; las familias del propio, con la marca de propio y su propia clave', () => {
    const solos = indexar(paquetesIncluidos());
    const lexico = conLexico('Sintético');
    const conPropio = indexar([...paquetesIncluidos(), lexico], new Set(['Sintético']));
    for (const [clave, clase] of solos.claseDeFamilia) assert.equal(conPropio.claseDeFamilia.get(clave), clase, `${clave} cambió de color`);
    assert.deepEqual(
      conPropio.familias.filter((f) => f.nombre === 'Léxico').map((f) => [f.clave, f.paquete, f.clase]),
      [
        ['RadiografIA::lexico', 'RadiografIA', 'familia-color-0'],
        ['Sintético::lexico', 'Sintético', 'familia-color-0 familia-propia'],
      ],
    );
    assert.equal(conPropio.claseDeFamilia.get('Sintético::ortotipografia'), 'familia-color-1 familia-propia');
  });

  test('dos familias «Léxico» de dos paquetes: cada señal lleva su paquete', async () => {
    const { analizar } = await motorDelNavegador();
    const texto = `${'Cabe destacar que la obra fue terminada por el equipo en el plazo previsto. '.repeat(12)}`;
    const r = analizar(texto, [paquetesIncluidos()[0]!, conLexico('Sintético')], { genero: 'general' });
    const origenes = new Set(r.senales.map((s) => `${s.paquete}::${s.reglaId}`));
    assert.ok(origenes.has('RadiografIA::lex-conector-de-apertura'), [...origenes].join(', '));
    assert.ok(origenes.has('Sintético::gram-pasiva-perifrastica'), [...origenes].join(', '));
  });
});
