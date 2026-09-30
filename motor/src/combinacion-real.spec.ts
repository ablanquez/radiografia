/**
 * El juez de la combinación con los dos paquetes reales (encargo 5.4): el
 * motor es genérico, y RadiografIA y «Español correcto» se analizan a la vez
 * sin mezclarse. analizar.spec.ts ya juzga la combinación con paquetes de
 * prueba (encargo 3.2); este juez la juzga con los de verdad, sobre un texto
 * de más de 300 palabras escrito para el 5.4 que mezcla estilo de asistente
 * y calcos de traducción:
 *   · dos desgloses separados, en el orden en que se pasan los paquetes, cada
 *     uno con las familias de su propia cabecera;
 *   · cada señal lleva su origen (`paquete`), y la regla que la da es de ese
 *     paquete;
 *   · hay señales de los dos, y el texto hace disparar las siete reglas de
 *     «Español correcto» y dos veces el gerundio final de RadiografIA.
 *
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analizar } from './analizar.ts';
import type { Paquete } from './paquete.ts';

const leer = (fichero: string): Paquete => JSON.parse(readFileSync(new URL(`../../paquetes/${fichero}`, import.meta.url), 'utf8')) as Paquete;

/** Estilo de asistente y calcos: un título en Title Case, pasiva con agente, «levantó su mano», «Lunes 3 de Marzo», «$100», «1,500», punto dentro de comillas y dos gerundios finales. */
const TEXTO_MIXTO = [
  '## Cinco Claves Para Mejorar Tu Productividad En El Trabajo',
  'La productividad se ha convertido en uno de los temas más relevantes del mundo laboral. En este artículo exploraremos cinco claves que pueden transformar la forma de trabajar de cualquier empresa, mejorando la concentración de todo el equipo.',
  'El método fue desarrollado por un equipo de psicólogos de la Universidad de Stanford en 2019. Desde entonces, más de 1,500 empresas lo han adoptado, y su licencia básica cuesta $100 al año. Los expertos coinciden en que su impacto es notable.',
  'La primera clave es planificar la semana. Cada Lunes, antes de abrir el correo, conviene dedicar diez minutos a fijar las prioridades. La próxima sesión de formación será el Lunes 3 de Marzo, y la inscripción ya está abierta.',
  'La segunda clave es la comunicación. En la última reunión, la directora levantó su mano y pidió silencio antes de explicar el nuevo sistema. Su mensaje fue claro: «menos reuniones y más resultados.» Además, cada equipo recibió una guía práctica.',
  'La tercera clave es desconectar. Diversos estudios demuestran que las pausas breves mejoran el rendimiento. Además, reducir las notificaciones del móvil desempeña un papel fundamental en la concentración, permitiendo centrarse en las tareas importantes.',
  'La cuarta clave es delegar. Muchos directivos siguen revisando cada documento antes de enviarlo, aunque sus equipos están preparados para hacerlo solos. Delegar no significa desentenderse: significa confiar, dar instrucciones claras y revisar los resultados al final de la semana, no a cada paso. Además, las empresas que lo han probado dicen que las decisiones llegan antes y que los empleados se sienten más valorados.',
  'La quinta clave es medir. Sin datos, cualquier cambio es una intuición; con ellos, es posible saber qué funciona y qué no. Una hoja de cálculo sencilla basta para anotar las horas dedicadas a cada proyecto y compararlas con los objetivos.',
  'En conclusión, mejorar la productividad no depende de trabajar más horas, sino de trabajar mejor. Con planificación, comunicación y pausas, cualquier equipo puede alcanzar sus objetivos.',
].join('\n');

describe('los dos paquetes reales combinados: RadiografIA y «Español correcto»', () => {
  const radiografia = leer('radiografia.json');
  const correcto = leer('espanol-correcto.json');
  const r = analizar(TEXTO_MIXTO, [radiografia, correcto]);
  const todas = [...r.senales, ...r.senalesTexto, ...r.contexto];
  const idsDe = new Map([radiografia, correcto].map((p) => [p.cabecera.nombre, new Set(p.reglas.map((x) => x.id))]));

  test('el texto llega al tramo completo (300 palabras de prosa o más)', () => {
    assert.equal(r.tramo, 'completo', `${r.palabrasProsa} palabras de prosa`);
  });

  test('dos desgloses, en el orden de los paquetes, cada uno con las familias de su cabecera', () => {
    assert.deepEqual(
      r.paquetes.map((p) => [p.paquete, p.puntuacion.familias.map((f) => f.id)]),
      [
        ['RadiografIA', radiografia.cabecera.familias.map((f) => f.id)],
        ['Español correcto', correcto.cabecera.familias.map((f) => f.id)],
      ],
    );
  });

  test('cada señal lleva su origen, y la regla que la da es de ese paquete', () => {
    const ajenas = todas.filter((s) => !idsDe.get(s.paquete)?.has(s.reglaId)).map((s) => `${s.reglaId} [${s.paquete}]`);
    assert.deepEqual(ajenas, []);
  });

  test('hay señales de los dos paquetes', () => {
    const origenes = [...new Set(todas.map((s) => s.paquete))].sort();
    assert.deepEqual(origenes, ['Español correcto', 'RadiografIA']);
  });

  test('disparan las siete reglas de «Español correcto», todas con origen «Español correcto»', () => {
    const disparadas = new Set(r.senales.filter((s) => s.paquete === 'Español correcto').map((s) => s.reglaId));
    assert.deepEqual([...disparadas].sort(), [...idsDe.get('Español correcto')!].sort());
  });

  test('el gerundio final de RadiografIA dispara dos veces, con origen RadiografIA', () => {
    const gerundios = r.senales.filter((s) => s.reglaId === 'sint-gerundio-adjunto-final');
    assert.deepEqual(
      gerundios.map((s) => [s.paquete, s.fragmento]),
      [
        ['RadiografIA', ', mejorando la concentración de todo el equipo.'],
        ['RadiografIA', ', permitiendo centrarse en las tareas importantes.'],
      ],
    );
  });
});
