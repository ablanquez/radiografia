/**
 * Jueces de ratio-comas-puntos (P14; encargo 4.3): comas entre puntos que
 * cierran frase, sobre el texto original de la prosa. Cifras A MANO.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analizarTexto } from '../texto.ts';
import { ratioComasPuntos } from './ratio-comas-puntos.ts';

const valor = (t: string) => ratioComasPuntos(analizarTexto(t));

describe('ratio-comas-puntos', () => {
  test('4 comas y 2 frases cerradas con punto (la pregunta no) → 2', () => {
    // Comas: «Llueve,» «viento,» «río,» «crecido,» = 4. Frases que acaban en «.»: las dos primeras;
    // «¿Vendrá mañana?» acaba en «?». 4 / 2 = 2.
    assert.equal(valor('Llueve, sopla viento, y hace frío. El río, crecido, baja. ¿Vendrá mañana?'), 2);
  });

  test('solo prosa: las comas de una viñeta no cuentan → sigue en 2', () => {
    assert.equal(valor('Llueve, sopla viento, y hace frío. El río, crecido, baja. ¿Vendrá mañana?\n- una, dos, tres'), 2);
  });

  test('una coma entre cifras es de un número, no cuenta → 0 comas / 2 puntos = 0', () => {
    // «Mide 3,5 metros.» y «Pesa 1.000 kilos.»: ninguna coma de puntuación; 2 frases con punto.
    assert.equal(valor('Mide 3,5 metros. Pesa 1.000 kilos.'), 0);
  });

  test('los puntos suspensivos no cierran con punto → 1 coma / 1 punto = 1', () => {
    // «Esperó...» no cuenta como punto; «Nada, nada.» sí, con 1 coma.
    assert.equal(valor('Esperó... Nada, nada.'), 1);
  });

  test('el punto cuenta aunque lo sigan comillas de cierre → 1 coma / 2 puntos = 0,5', () => {
    // «Dijo «basta».» acaba en «.»; «Dijo "basta."» acaba en «"» con el punto delante.
    assert.equal(valor('Dijo «basta». Luego calló, sin más.'), 0.5);
    assert.equal(valor('Dijo "basta." Luego calló, sin más.'), 0.5);
  });

  test('sin ninguna frase cerrada con punto → null', () => {
    assert.equal(valor('¿Vendrá? ¡Ojalá!'), null);
    assert.equal(valor(''), null);
  });
});
