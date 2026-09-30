/**
 * El protocolo de exclusión de robots (encargo 5.5): qué rutas de un sitio
 * puede pedir la herramienta de calibración según su robots.txt. Sin red: el
 * texto del robots.txt lo trae red.ts. Lo juzga robots.spec.ts.
 *
 * [DOC] https://www.rfc-editor.org/rfc/rfc9309 (RFC 9309, septiembre de 2022):
 *    · § 2.1 y § 2.2: un grupo son una o más líneas «user-agent» seguidas de
 *      reglas «allow» / «disallow»; lo termina otra línea «user-agent» o el
 *      final del fichero. Las reglas que no están en ningún grupo se ignoran
 *      (§ 2.2.2), y los registros que no son del protocolo (Crawl-delay,
 *      Sitemap) no cortan un grupo (§ 2.2.4).
 *    · § 2.2.1: el grupo se busca por el product token SIN distinguir
 *      mayúsculas; varios grupos que casan se juntan; si no casa ninguno, el
 *      de «*».
 *    · § 2.2.2: la regla se compara desde el primer octeto de la ruta; gana
 *      «the match that has the most octets»; a igualdad, «allow»; sin
 *      coincidencia, permitido; /robots.txt, siempre permitido.
 *    · § 2.2.3: «*» es cero o más caracteres cualesquiera; «$», el final.
 * [PROPIO] «Crawl-delay» no es del RFC (§ 2.2.4: otros registros «MAY»
 *    leerse); se lee igual, por grupo, y red.ts lo respeta si pide más pausa
 *    que la suya: zenodo.org lo pone a 10 segundos.
 * [PROPIO] «Más octetos» se lee como la longitud en octetos del PATRÓN de la
 *    regla. Y no se normaliza la codificación «%»: las rutas que pide la
 *    herramienta son ASCII sin escapes (ids del BOE, rutas de API).
 */

export interface ReglaRobots {
  permitir: boolean;
  /** La ruta tal como viene en el robots.txt (con «*» y «$»). */
  ruta: string;
  expresion: RegExp;
  octetos: number;
}

/** El patrón de una regla como expresión regular anclada al principio de la ruta. */
function compilar(ruta: string): RegExp {
  const anclada = ruta.endsWith('$');
  const cuerpo = (anclada ? ruta.slice(0, -1) : ruta)
    .split('*')
    .map((trozo) => trozo.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${cuerpo}${anclada ? '$' : ''}`, 's');
}

interface Grupo {
  agentes: string[];
  reglas: ReglaRobots[];
  /** Crawl-delay en segundos; null si el grupo no lo trae. */
  retraso: number | null;
}

/** Los grupos del robots.txt que tocan a `agente`: los suyos o, si no hay, los de «*». */
function gruposPara(robotsTxt: string, agente: string): Grupo[] {
  const grupos: Grupo[] = [];
  let actual: Grupo | null = null;
  let conReglas = false;
  for (const bruta of robotsTxt.split(/\r\n|\r|\n/)) {
    const linea = bruta.replace(/#.*$/, '').trim();
    const dos = linea.indexOf(':');
    if (dos < 0) continue;
    const clave = linea.slice(0, dos).trim().toLowerCase();
    const valor = linea.slice(dos + 1).trim();
    if (clave === 'user-agent') {
      if (actual === null || conReglas) {
        actual = { agentes: [], reglas: [], retraso: null };
        grupos.push(actual);
        conReglas = false;
      }
      actual.agentes.push(valor.toLowerCase());
    } else if (clave === 'allow' || clave === 'disallow') {
      if (actual === null) continue;
      conReglas = true;
      if (valor === '') continue; // «Disallow:» vacío no prohíbe nada
      actual.reglas.push({ permitir: clave === 'allow', ruta: valor, expresion: compilar(valor), octetos: Buffer.byteLength(valor, 'utf8') });
    } else if (clave === 'crawl-delay' && actual !== null) {
      const segundos = Number(valor);
      if (valor !== '' && Number.isFinite(segundos) && segundos >= 0) actual.retraso = segundos;
    }
  }
  const propio = grupos.filter((g) => g.agentes.includes(agente.toLowerCase()));
  return propio.length > 0 ? propio : grupos.filter((g) => g.agentes.includes('*'));
}

/** Las reglas que tocan a `agente` (su product token) en ese robots.txt. */
export function reglasPara(robotsTxt: string, agente: string): ReglaRobots[] {
  return gruposPara(robotsTxt, agente).flatMap((g) => g.reglas);
}

/** El Crawl-delay (segundos) que toca a `agente`: el mayor de sus grupos; null si ninguno lo trae. */
export function retrasoPara(robotsTxt: string, agente: string): number | null {
  const retrasos = gruposPara(robotsTxt, agente).flatMap((g) => (g.retraso === null ? [] : [g.retraso]));
  return retrasos.length === 0 ? null : Math.max(...retrasos);
}

/** Si la ruta (con su «?consulta») se puede pedir. */
export function permitido(reglas: readonly ReglaRobots[], rutaYConsulta: string): boolean {
  if (rutaYConsulta === '/robots.txt') return true;
  let mejor: ReglaRobots | null = null;
  for (const regla of reglas) {
    if (!regla.expresion.test(rutaYConsulta)) continue;
    if (mejor === null || regla.octetos > mejor.octetos || (regla.octetos === mejor.octetos && regla.permitir)) mejor = regla;
  }
  return mejor === null ? true : mejor.permitir;
}
