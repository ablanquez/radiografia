/**
 * El detector estructural (encargo 4.2; punto 4 del plan): una expresión
 * regular en una posición de la frase, del párrafo o del texto. Devuelve
 * señales, no puntos (la puntuación es de puntuar.ts), con la misma `Senal`
 * que el detector de patrón.
 *
 * Las seis posiciones [PROPIO], definidas en el $comment de «posicion» de
 * regla.schema.json. Siempre sobre la frase o el párrafo SIN blancos al final:
 * Intl.Segmenter deja dentro de cada segmento el espacio que lo sigue, y
 * texto.ts ya lo recorta (`Frase.texto` y `Parrafo.texto` van sin blancos en
 * los bordes, con su `inicio` en el original).
 *   · inicio-frase   — `^(?:regex)` sobre cada frase.
 *   · fin-frase      — `(?:regex)$` sobre cada frase.
 *   · inicio-parrafo — `^(?:regex)` sobre la primera frase de cada párrafo.
 *   · fin-parrafo    — `(?:regex)$` sobre la última frase de cada párrafo.
 *   · ultimo-parrafo — la regex tal cual sobre el último párrafo de prosa entero.
 *   · cualquiera     — la regex tal cual sobre cada párrafo de prosa entero
 *                      (patrones que cruzan frases, como «no solo… sino»).
 * El ancla la pone el motor, y el paso 2 de validar.ts rechaza la regex que
 * ya la trae. Se envuelve en `(?:…)` para que una alternativa («a|b») quede
 * entera dentro del ancla; un grupo sin captura no cambia la numeración de
 * los grupos de la regla.
 * [DOC] https://developer.mozilla.org/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion
 *    — sin la bandera «m», «^» casa solo al principio de la cadena y «$» solo
 *    al final; con «m», también junto a un salto de línea. Una frase no lleva
 *    «\n» (un párrafo es una línea), pero sí podría llevar un «\r» suelto o un
 *    U+2028: con «m» el ancla casaría también ahí. La bandera es del autor.
 *
 *   · Banderas: las de la regla más «g», para recoger todas las coincidencias
 *     con matchAll ([DOC] https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
 *     — sin «g» lanza TypeError). Las coincidencias vacías no cuentan.
 *   · `indiceParrafo` es la posición en `texto.parrafos` (contando los de
 *     no-prosa); `indiceFrase`, la de la frase dentro de su párrafo. En las
 *     posiciones de párrafo entero, la frase donde EMPIEZA la coincidencia.
 *     [PROPIO] Si empieza en el blanco entre dos frases, cuenta la anterior:
 *     ese blanco es del segmento de la anterior en Intl.Segmenter.
 *   · Recuento (encargo 5.3; `minimo` desde el 4.2): minimoPorCoincidencia y
 *     minimo, en ese orden, sobre las coincidencias ya encontradas
 *     (recuento.ts); si quedan menos que `minimo`, la regla no señala nada.
 *     Con `ausencia`, lo que devuelve son las coincidencias que CUENTAN: las
 *     convierte detector-ausencia.ts.
 *   · Solo párrafos de prosa (texto.ts), salvo con `sobreNoProsa` (encargo
 *     5.1): entonces también viñetas, encabezados y tablas, nunca código
 *     (`seMira` de texto.ts). [PROPIO] Con él, cada posición se aplica a los
 *     párrafos que se miran: el «último párrafo» es el último de ellos (una
 *     viñeta final sí; un bloque de código final no), y el mínimo cuenta
 *     también las coincidencias de la no-prosa.
 */
import { seMira, type Parrafo, type Texto } from './texto.ts';
import type { Senal } from './detector-patron.ts';
import { aplicarRecuento, type ParametrosDeRecuento } from './recuento.ts';

export type Posicion = 'inicio-frase' | 'fin-frase' | 'inicio-parrafo' | 'fin-parrafo' | 'ultimo-parrafo' | 'cualquiera';

export interface ParametrosEstructural extends ParametrosDeRecuento {
  posicion: Posicion;
  regex: string;
  flags?: string;
  sobreNoProsa?: boolean;
}

export interface ReglaEstructural {
  id: string;
  parametros: ParametrosEstructural;
}

/** La regex con el ancla de su posición, si la posición es anclada. */
function anclar(posicion: Posicion, regex: string): string {
  switch (posicion) {
    case 'inicio-frase':
    case 'inicio-parrafo':
      return `^(?:${regex})`;
    case 'fin-frase':
    case 'fin-parrafo':
      return `(?:${regex})$`;
    case 'ultimo-parrafo':
    case 'cualquiera':
      return regex;
  }
}

/** La frase del párrafo donde cae `posicion`: la última que empieza en ella o antes. */
function fraseDonde(parrafo: Parrafo, posicion: number): number {
  let indice = 0;
  parrafo.frases.forEach((frase, i) => {
    if (frase.inicio <= posicion) indice = i;
  });
  return indice;
}

export function detectarEstructural(regla: ReglaEstructural, texto: Texto): Senal[] {
  const p = regla.parametros;
  const regex = new RegExp(anclar(p.posicion, p.regex), `${p.flags ?? ''}g`);
  const senales: Senal[] = [];

  /** Busca en un trozo (una frase o un párrafo entero, sin blancos en los bordes) y apunta las señales. */
  const buscar = (trozo: { texto: string; inicio: number }, indiceParrafo: number, indiceFrase: (inicio: number) => number): void => {
    for (const m of trozo.texto.matchAll(regex)) {
      if (m[0].length === 0) continue;
      const inicio = trozo.inicio + m.index;
      senales.push({ reglaId: regla.id, inicio, fin: inicio + m[0].length, fragmento: m[0], indiceFrase: indiceFrase(inicio), indiceParrafo });
    }
  };

  const mirados = texto.parrafos
    .map((parrafo, indiceParrafo) => ({ parrafo, indiceParrafo }))
    .filter(({ parrafo }) => seMira(parrafo, p.sobreNoProsa ?? false));

  switch (p.posicion) {
    case 'inicio-frase':
    case 'fin-frase':
      for (const { parrafo, indiceParrafo } of mirados) {
        parrafo.frases.forEach((frase, i) => buscar(frase, indiceParrafo, () => i));
      }
      break;
    case 'inicio-parrafo':
      for (const { parrafo, indiceParrafo } of mirados) {
        const primera = parrafo.frases[0];
        if (primera !== undefined) buscar(primera, indiceParrafo, () => 0);
      }
      break;
    case 'fin-parrafo':
      for (const { parrafo, indiceParrafo } of mirados) {
        const i = parrafo.frases.length - 1;
        const ultima = parrafo.frases[i];
        if (ultima !== undefined) buscar(ultima, indiceParrafo, () => i);
      }
      break;
    case 'ultimo-parrafo': {
      const ultimo = mirados.at(-1);
      if (ultimo !== undefined) buscar(ultimo.parrafo, ultimo.indiceParrafo, (inicio) => fraseDonde(ultimo.parrafo, inicio));
      break;
    }
    case 'cualquiera':
      for (const { parrafo, indiceParrafo } of mirados) {
        buscar(parrafo, indiceParrafo, (inicio) => fraseDonde(parrafo, inicio));
      }
      break;
  }

  return aplicarRecuento(senales, p);
}
