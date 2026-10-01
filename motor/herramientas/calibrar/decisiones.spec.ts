/**
 * Jueces de decisiones.ts (respuesta a la parada tras e) del 5.6): cada
 * decisión es de un género calibrado, está bien formada y es de un resultado
 * por encima del 5 %; la nota que calibrar.ts escribe en la ficha del género
 * dice lo firmado, con las cifras a mano.
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DECISIONES, notaDeDecision } from './decisiones.ts';
import { GENEROS_CALIBRADOS } from './inyeccion.ts';
import type { DecisionDeValidacion } from './validacion.ts';

describe('DECISIONES', () => {
  test('solo administrativo (01/10/2026): 5 de 98, con sus cinco ids', () => {
    assert.deepEqual(Object.keys(DECISIONES), ['administrativo']);
    const d = DECISIONES['administrativo']!;
    assert.equal(d.fecha, '2026-10-01');
    assert.deepEqual({ documentos: d.aceptado.documentos, n: d.aceptado.n }, { documentos: 5, n: 98 });
    assert.deepEqual(d.aceptado.ids, ['BOE-A-2012-3750', 'BOE-A-2012-7964', 'BOE-B-2010-33269', 'BOE-B-2010-33306', 'BOE-B-2012-3733']);
  });

  test('cada una, de un género calibrado, bien formada y por encima del 5 %', () => {
    for (const [genero, d] of Object.entries(DECISIONES)) {
      assert.ok((GENEROS_CALIBRADOS as readonly string[]).includes(genero), genero);
      assert.match(d.fecha, /^\d{4}-\d{2}-\d{2}$/, genero);
      assert.ok(d.firma.length > 0 && d.modifica.length > 0 && d.pendiente.length > 0 && d.motivos.length > 0, genero);
      assert.equal(d.aceptado.ids.length, d.aceptado.documentos, `${genero}: un id por documento`);
      assert.equal(new Set(d.aceptado.ids).size, d.aceptado.ids.length, `${genero}: ids repetidos`);
      assert.ok(d.aceptado.documentos / d.aceptado.n > 0.05, `${genero}: una decisión solo para un resultado por encima del 5 %`);
    }
  });
});

describe('notaDeDecision', () => {
  const D: DecisionDeValidacion = {
    fecha: '2026-10-01',
    firma: 'Quien Firma',
    decision: 'aceptado con declaración',
    modifica: 'el criterio X',
    aceptado: { documentos: 5, n: 98, ids: ['a1', 'a2', 'a3', 'a4', 'a5'] },
    motivos: ['Primer motivo.', 'Segundo motivo.'],
    pendiente: 'v1.1: lo que queda.',
  };

  test('la FPR (5 de 98, 5,1 %), quién y cuándo, qué modifica, los motivos y lo pendiente', () => {
    assert.equal(
      notaDeDecision(D),
      'Validación (data/calibracion/validacion.json): la FPR de la familia estadística es 5 de 98 (5,1 %), por encima del 5 %. Aceptado con declaración (Quien Firma, 01/10/2026); modifica el criterio X. Motivos: Primer motivo. Segundo motivo. Pendiente: v1.1: lo que queda.',
    );
  });
});
