/**
 * Los jueces de la lógica del informe para imprimir (encargo 9.1, b; firmado
 * en la parada 1). Lo que se ve en papel lo mira Chrome (impresion.spec.ts).
 *
 *   1. Las siglas de familia (repartirSiglas, en indexar): la inicial; si está
 *      cogida, dos letras; si también, la inicial y una cifra. Se reparten
 *      sobre todos los paquetes que conoce la página, en el orden de la
 *      leyenda, y son estables: un propio no cambia las de los incluidos.
 *   2. Los fragmentos de la lista: los blancos seguidos, uno; como mucho 80
 *      caracteres, el último «…».
 *   3. Las entradas de la lista (entradasDelInforme): una por regla que dio
 *      alguna señal, con tramo o del texto entero; en el orden del desglose
 *      (paquete, familia, regla); con cuántas señales, hasta 5 fragmentos y
 *      cuántas no caben; las informativas, marcadas.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { Paquete } from '@radiografia/motor/navegador';
import { entradasDelInforme, fragmento } from '../src/pantalla/informe.ts';
import { indexar } from '../src/pantalla/pintar.ts';
import { enOrden } from '../src/orden.ts';
import { motorDelNavegador, paqueteDePrueba, paquetesIncluidos, TEXTO_DE_TRES_PAQUETES } from './apoyo.ts';

/** Un paquete hecho de Español correcto con otro nombre y su familia de gramática llamada «Léxico». */
function conLexico(nombre: string): Paquete {
  const paquete = structuredClone(paquetesIncluidos()[1]!);
  paquete.cabecera.nombre = nombre;
  paquete.cabecera.familias = paquete.cabecera.familias.map((f) => (f.id === 'gramatica' ? { ...f, id: 'lexico', nombre: 'Léxico' } : f));
  for (const regla of paquete.reglas) if (regla.familia === 'gramatica') regla.familia = 'lexico';
  return paquete;
}

describe('las siglas de familia', () => {
  test('los dos incluidos: la inicial de cada familia', () => {
    assert.deepEqual(Object.fromEntries(indexar(paquetesIncluidos()).siglaDeFamilia), {
      'RadiografIA::canal': 'C',
      'RadiografIA::discurso': 'D',
      'RadiografIA::estadistica': 'E',
      'RadiografIA::lexico': 'L',
      'RadiografIA::puntuacion-formato': 'P',
      'RadiografIA::sintaxis': 'S',
      'Español correcto::gramatica': 'G',
      'Español correcto::ortotipografia': 'O',
    });
  });

  test('cogida la inicial, dos letras; cogidas también, la inicial y una cifra; y las de los incluidos no cambian', () => {
    const solos = indexar(paquetesIncluidos()).siglaDeFamilia;
    const conocidos = [...paquetesIncluidos(), paqueteDePrueba(), conLexico('Uno'), conLexico('Dos')];
    const siglas = indexar(conocidos, new Set(['Paquete de prueba', 'Uno', 'Dos'])).siglaDeFamilia;
    for (const [clave, sigla] of solos) assert.equal(siglas.get(clave), sigla, `${clave} cambió de sigla`);
    assert.equal(siglas.get('Paquete de prueba::pruebas'), 'Pr', '«Pruebas», con la P de «Puntuación y formato» cogida');
    assert.equal(siglas.get('Uno::lexico'), 'Lé', 'el segundo «Léxico»');
    assert.equal(siglas.get('Dos::lexico'), 'L2', 'el tercer «Léxico»');
    assert.equal(new Set(siglas.values()).size, siglas.size, 'ninguna sigla repetida');
  });
});

describe('los fragmentos de la lista de señales', () => {
  test('los blancos seguidos, uno; como mucho 80 caracteres, el último «…»', () => {
    assert.equal(fragmento('a nivel\n  de'), 'a nivel de');
    assert.equal(fragmento('x'.repeat(80)), 'x'.repeat(80));
    const largo = fragmento(`${'palabra '.repeat(20)}fin`);
    assert.equal([...largo].length, 80);
    assert.ok(largo.endsWith('…'), largo);
  });
});

describe('las entradas de la lista de señales', () => {
  test('una por regla con señales, con tramo o del texto entero, y n suma todas las señales con tramo', async () => {
    const { analizar } = await motorDelNavegador();
    const paquetes = [...paquetesIncluidos(), paqueteDePrueba()];
    const indice = indexar(paquetes, new Set(['Paquete de prueba']));
    const r = analizar(TEXTO_DE_TRES_PAQUETES, paquetes, { genero: 'general' });
    const entradas = entradasDelInforme(r, TEXTO_DE_TRES_PAQUETES, indice);
    const conSenal = new Set([...r.senales, ...r.senalesTexto, ...r.contexto].map((s) => `${s.paquete}::${s.reglaId}`));
    assert.deepEqual(new Set(entradas.map((e) => `${e.paquete}::${e.reglaId}`)), conSenal);
    assert.equal(entradas.length, conSenal.size, 'una entrada por regla');
    assert.equal(entradas.reduce((suma, e) => suma + e.n, 0), r.senales.length, 'n suma todas las señales con tramo');
    for (const e of entradas) {
      assert.equal(e.fragmentos.length, Math.min(e.n, 5), `${e.reglaId}: hasta 5 fragmentos`);
      assert.equal(e.resto, Math.max(0, e.n - 5), `${e.reglaId}: las que no caben`);
    }
    const nivel = entradas.find((e) => e.reglaId === 'prueba-a-nivel-de');
    assert.deepEqual(nivel && [nivel.paquete, nivel.familia, nivel.n, nivel.fragmentos, nivel.informativa], ['Paquete de prueba', 'Pruebas', 1, ['A nivel de'], false]);
    assert.equal(entradas.find((e) => e.reglaId === 'prueba-okey')?.informativa, true, 'la informativa, marcada');
  });

  test('en el orden del desglose: paquete, familia y regla, alfabéticas por su nombre', async () => {
    const { analizar } = await motorDelNavegador();
    const paquetes = [...paquetesIncluidos(), paqueteDePrueba()];
    const indice = indexar(paquetes, new Set(['Paquete de prueba']));
    const entradas = entradasDelInforme(analizar(TEXTO_DE_TRES_PAQUETES, paquetes, { genero: 'general' }), TEXTO_DE_TRES_PAQUETES, indice);
    const posicion = new Map(paquetes.map((p, i) => [p.cabecera.nombre, i]));
    // El orden se calcula aquí con enOrden y las claves a la vista: paquete, nombre de familia, nombre de regla.
    const esperado = enOrden(entradas, (e) => [posicion.get(e.paquete) ?? 0, e.familia, e.nombre]).map((e) => e.reglaId);
    assert.deepEqual(entradas.map((e) => e.reglaId), esperado);
    assert.deepEqual([...new Set(entradas.map((e) => e.paquete))], ['RadiografIA', 'Español correcto', 'Paquete de prueba']);
  });

  test('más de cinco señales de una regla: cinco fragmentos y las demás, contadas', async () => {
    const { analizar } = await motorDelNavegador();
    const prueba = paqueteDePrueba();
    const relleno = 'Habrá que hablarlo con calma la semana que viene, cuando vuelvan los que están de viaje y se pueda reunir a todo el mundo en la misma sala.';
    const texto = [...Array.from({ length: 7 }, (_, i) => `La directora dijo que todo estaba okey en la reunión número ${i + 1}.`), relleno, relleno, relleno].join(' ');
    const r = analizar(texto, [prueba], { genero: 'general' });
    assert.notEqual(r.tramo, 'insuficiente', `${r.palabrasProsa} palabras de prosa`);
    const okey = entradasDelInforme(r, texto, indexar([prueba], new Set(['Paquete de prueba']))).find((e) => e.reglaId === 'prueba-okey');
    assert.deepEqual(okey && [okey.n, okey.fragmentos, okey.resto], [7, ['okey', 'okey', 'okey', 'okey', 'okey'], 2]);
  });
});
