/**
 * Los umbrales de longitud en los textos de la web (11.1, hallazgo 7 del censo pre-despliegue, firmado por Antonio):
 * nueve cadenas de textos.ts dicen 100, 300 o 600 palabras y nada las ataba al motor (docs/CENSO-PRE-DESPLIEGUE.md, § 3).
 * Sin tocar el motor:
 *
 *   1. MINIMO (100) y COMPLETO (300) los exporta motor/src/umbral.ts; navegador.ts no los reexporta, y se leen de su
 *      fichero, como ficha-pantalla.spec.ts lee texto.ts. Cada una de las ocho cadenas que los dicen lleva los suyos y
 *      ningún otro número (las funciones, con una muestra que no es un umbral).
 *   2. El 600 no es una constante exportada: es un literal de tramoDeCalibracion. Se ata por lo que hace la función:
 *      los bordes de cada tramo de calibración, de 0 a 2.000 palabras, son los números de TRAMOS_EN_PALABRAS, tramo a
 *      tramo («100 a 299», «300 a 599», «600 o más»), y no hay tramos de más ni de menos.
 *
 * Los tres mensajes del motor que repiten los números (banda.ts, detector-estadistico.ts y validacion.ts) son de
 * motor/src, y se quedan como están: declarado en el censo.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import * as textos from '../src/textos.ts';
import { COMPLETO, MINIMO, tramoDeCalibracion } from '../../motor/src/umbral.ts';

/** Los números de un texto, en su orden. */
const numeros = (texto: string): number[] => [...texto.matchAll(/\d+/g)].map((m) => Number(m[0]));

/** Una muestra que no es un umbral, para las funciones que llevan las palabras del texto. */
const MUESTRA = 137;

describe('los umbrales de longitud de los textos de la web, atados al motor', () => {
  test('1 · las ocho cadenas que dicen 100 o 300 palabras llevan MINIMO y COMPLETO de motor/src/umbral.ts, y ningún otro número', () => {
    const cadenas: [string, string, number[]][] = [
      ['SIN_INFORME_QUE_DESCARGAR', textos.SIN_INFORME_QUE_DESCARGAR, [MINIMO]],
      ['PLACEHOLDER_DEL_TEXTO', textos.PLACEHOLDER_DEL_TEXTO, [MINIMO, COMPLETO]],
      ['textoInsuficiente', textos.textoInsuficiente(MUESTRA), [MUESTRA, MINIMO]],
      ['MENOS_DE_100', textos.MENOS_DE_100, [MINIMO]],
      ['ausenciaDe', textos.ausenciaDe(1), [COMPLETO]],
      ['AVISO_TEXTO_CORTO', textos.AVISO_TEXTO_CORTO, [COMPLETO]],
      ['textoCortoEnClaro', textos.textoCortoEnClaro(MUESTRA), [MUESTRA, COMPLETO]],
      ['SOLO_TEXTOS_LARGOS', textos.SOLO_TEXTOS_LARGOS, [COMPLETO]],
    ];
    assert.deepEqual(
      cadenas.filter(([, texto, esperados]) => JSON.stringify(numeros(texto)) !== JSON.stringify(esperados)).map(([nombre, texto]) => `${nombre}: «${texto}»`),
      [],
      `cadenas que no dicen ${MINIMO} y ${COMPLETO} como el motor`,
    );
  });

  test('2 · TRAMOS_EN_PALABRAS dice los bordes de los tramos de tramoDeCalibracion, tramo a tramo', () => {
    // Cada tramo, con la primera y la última longitud que caen en él (la última, solo si acaba antes de 2.000).
    const bordes = new Map<string, number[]>();
    for (let n = 0; n <= 2000; n++) {
      const tramo = tramoDeCalibracion(n);
      if (tramo === null) continue;
      const b = bordes.get(tramo);
      if (b === undefined) bordes.set(tramo, [n, n]);
      else b[1] = n;
    }
    const esperados = Object.fromEntries([...bordes].map(([tramo, [desde, hasta]]) => [tramo, hasta === 2000 ? [desde!] : [desde!, hasta!]]));
    const dichos = Object.fromEntries(Object.entries(textos.TRAMOS_EN_PALABRAS).map(([tramo, texto]) => [tramo, numeros(texto)]));
    assert.deepEqual(dichos, esperados);
    assert.equal(esperados['100-299']![0], MINIMO, 'el primer tramo empieza en MINIMO');
  });
});
