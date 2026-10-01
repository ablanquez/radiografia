/**
 * Las decisiones firmadas sobre la validación del 5.6. Un género cuya FPR
 * (validacion.ts) pasa del 5 % solo se da por bueno con una decisión de
 * Antonio escrita aquí, con el resultado que aceptó: k de n y los ids de los
 * documentos que cuentan.
 *
 *   · validar.ts la escribe en data/calibracion/validacion.json, en el
 *     género, y PARA si el resultado de hoy no es el aceptado, si un género
 *     pasa del 5 % sin decisión o si una decisión sobra (comprobarDecision).
 *   · calibrar.ts la anota en la ficha de calibración del género
 *     (data/calibracion/<genero>.json, notas), con notaDeDecision.
 *
 * Administrativo (respuesta a la parada tras e) del 5.6, 01/10/2026): queda
 * en 5 de 98 y se ACEPTA CON DECLARACIÓN, lo que modifica para ese género el
 * criterio firmado del plan. El plan y el estado los escribe Antonio.
 */
import type { DecisionDeValidacion } from './validacion.ts';

export const DECISIONES: Readonly<Record<string, DecisionDeValidacion>> = {
  administrativo: {
    fecha: '2026-10-01',
    firma: 'Antonio Blánquez',
    decision: 'aceptado con declaración',
    modifica: 'el criterio firmado del plan (punto 5): «validación con los textos humanos apartados (20 %): FPR ≤ 5 % o no se cierra el punto»',
    aceptado: { documentos: 5, n: 98, ids: ['BOE-A-2012-3750', 'BOE-A-2012-7964', 'BOE-B-2010-33269', 'BOE-B-2010-33306', 'BOE-B-2012-3733'] },
    motivos: [
      'El 01/10/2026, el criterio se cumplía en los otros cinco géneros y en el conjunto de la validación (37 de 1.667 documentos, 2,2 %).',
      'Con n = 98, el intervalo de Wilson al 95 % (2,2 % a 11,4 %) incluye el 5 %: la muestra no distingue 5,1 % de 5 %.',
      'Cuatro de los cinco documentos son el falso positivo de formato ya declarado en las fichas de est-frases-cortas, est-pocas-comas, est-poca-puntuacion-secundaria y est-poca-puntuacion: tablas del BOE pasadas a texto (BOE-A-2012-3750, BOE-B-2010-33306 y BOE-B-2012-3733) y un formulario de párrafos numerados (BOE-B-2010-33269). El quinto (BOE-A-2012-7964) es la repetición de fórmula legal declarada en est-repeticion-de-secuencias.',
      'No se excluye ningún documento ni se cambia nada después de ver la validación.',
    ],
    pendiente: 'v1.1: que el motor trate las tablas pasadas a texto como no-prosa, con estos cinco documentos como casos de prueba.',
  },
};

const fechaEs = (iso: string): string => iso.split('-').reverse().join('/');
const pct = (x: number): string => `${(100 * x).toFixed(1).replace('.', ',')} %`;

/** La nota de la decisión en la ficha de calibración del género. */
export function notaDeDecision(d: DecisionDeValidacion): string {
  const { documentos: k, n } = d.aceptado;
  const decision = d.decision.charAt(0).toUpperCase() + d.decision.slice(1);
  return (
    `Validación (data/calibracion/validacion.json): la FPR de la familia estadística es ${k} de ${n} (${pct(k / n)}), por encima del 5 %. ` +
    `${decision} (${d.firma}, ${fechaEs(d.fecha)}); modifica ${d.modifica}. Motivos: ${d.motivos.join(' ')} Pendiente: ${d.pendiente}`
  );
}
