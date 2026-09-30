/**
 * El cliente de red de la herramienta de calibración (encargo 5.5). Lo usan
 * los descargadores; el motor no tiene red (CLAUDE.md: ninguna llamada de red
 * durante el análisis ni al cargar paquetes). Lo juzga red.spec.ts sin red.
 *
 * Lo que promete a cada servidor:
 *   · Se identifica: User-Agent «RadiografIA-calibracion/0.1 (+<contacto>)».
 *     [DOC] RFC 9309 § 2.2.1: el product token «SHOULD be a substring of the
 *     identification string», y la cadena «SHOULD describe the purpose of the
 *     crawler» (el enlace al repositorio lo describe).
 *   · Lee robots.txt una vez por sitio (por origen) y no pide lo vetado.
 *     [DOC] RFC 9309 § 2.3.1.3 (4xx: «MAY access any resources»), § 2.3.1.4
 *     (5xx o error de red: «MUST assume complete disallow»), § 2.4 (la copia
 *     no se usa más de 24 horas: una ejecución no llega a tanto).
 *   · Espera entre dos peticiones al mismo sitio: la pausa que se le da, o el
 *     Crawl-delay del robots.txt si pide más (robots.ts).
 *   · Un 429 o un 503 se reintenta hasta tres veces, después de lo que diga
 *     Retry-After en segundos o, si no lo dice, 60 s [PROPIO].
 *     [DOC] RFC 9110 § 10.2.3 (Retry-After: fecha HTTP o segundos; aquí solo
 *     se leen segundos: con una fecha, 60 s).
 *   · Para con PresupuestoAgotado antes de pedir nada que empezara después de
 *     su tiempo total (encargo 5.5: una descarga de más de 30 minutos, PARA).
 *   · Sigue él mismo las redirecciones (como mucho SALTOS): cada destino pasa
 *     por el robots.txt y la pausa de SU sitio, y lleva las mismas cabeceras
 *     (un Range, otra vez). [PROPIO, académico] Un fetch que las siguiera solo
 *     pediría el destino sin mirar su robots.txt.
 *     [DOC] RFC 9110 § 15.4 (3xx y Location, referencia relativa o absoluta).
 * [DOC] https://nodejs.org/api/globals.html#fetch — fetch, estable en Node 24.
 */
import { permitido, reglasPara, retrasoPara, type ReglaRobots } from './robots.ts';

export interface Respuesta {
  estado: number;
  cuerpo: Buffer;
  tipo: string | null;
  /** Las cabeceras de la respuesta, con el nombre en minúsculas. */
  cabeceras: Record<string, string>;
  /** La URL que respondió (la última, si hubo redirecciones). */
  url: string;
}

export interface OpcionesDeCliente {
  /** El product token (RFC 9309): letras, «_» y «-». */
  agente: string;
  /** Una URL que explique quién pide y para qué. */
  contacto: string;
  /** Pausa mínima entre dos peticiones al mismo sitio, en ms. */
  pausaMs: number;
  /** Tiempo total, en ms, desde que se crea el cliente. */
  presupuestoMs: number;
  fetch?: typeof fetch;
  ahora?: () => number;
  dormir?: (ms: number) => Promise<void>;
}

export class PresupuestoAgotado extends Error {
  constructor(url: string, ms: number) {
    super(`tiempo agotado (${Math.round(ms / 1000)} s) antes de pedir ${url}`);
    this.name = 'PresupuestoAgotado';
  }
}

export class VetadoPorRobots extends Error {
  readonly url: string;
  constructor(url: string, motivo: string) {
    super(`robots.txt no deja pedir ${url} (${motivo})`);
    this.name = 'VetadoPorRobots';
    this.url = url;
  }
}

interface Sitio {
  /** null: robots.txt inalcanzable, todo vetado. */
  reglas: ReglaRobots[] | null;
  pausaMs: number;
  ultima: number | null;
}

const REINTENTOS = 3;
const SALTOS = 5;
const ESPERA_SIN_RETRY_AFTER_MS = 60_000;

export class Cliente {
  readonly agenteCompleto: string;
  peticiones = 0;
  bytes = 0;
  vetadas = 0;
  private readonly o: Required<OpcionesDeCliente>;
  private readonly inicio: number;
  private readonly sitios = new Map<string, Sitio>();

  constructor(opciones: OpcionesDeCliente) {
    this.o = {
      fetch: globalThis.fetch,
      ahora: () => Date.now(),
      dormir: (ms) => new Promise((resolver) => setTimeout(resolver, ms)),
      ...opciones,
    };
    this.agenteCompleto = `${opciones.agente}/0.1 (+${opciones.contacto})`;
    this.inicio = this.o.ahora();
  }

  /** Milisegundos desde que se creó el cliente. */
  get transcurridoMs(): number {
    return this.o.ahora() - this.inicio;
  }

  async obtener(url: string, cabeceras: Readonly<Record<string, string>> = {}): Promise<Respuesta> {
    let actual = url;
    for (let salto = 0; ; salto++) {
      const u = new URL(actual);
      const sitio = await this.sitio(u.origin);
      if (sitio.reglas === null) {
        this.vetadas++;
        throw new VetadoPorRobots(actual, 'robots.txt inalcanzable: RFC 9309 § 2.3.1.4, todo vetado');
      }
      if (!permitido(sitio.reglas, u.pathname + u.search)) {
        this.vetadas++;
        throw new VetadoPorRobots(actual, 'Disallow');
      }
      const r = await this.pedir(actual, sitio, cabeceras);
      const destino = r.cabeceras['location'];
      if (r.estado < 300 || r.estado >= 400 || destino === undefined) return r;
      if (salto >= SALTOS) throw new Error(`${url}: más de ${SALTOS} redirecciones`);
      actual = new URL(destino, actual).href;
    }
  }

  private async sitio(origen: string): Promise<Sitio> {
    const conocido = this.sitios.get(origen);
    if (conocido !== undefined) return conocido;
    const sitio: Sitio = { reglas: [], pausaMs: this.o.pausaMs, ultima: null };
    this.sitios.set(origen, sitio);
    let r: Respuesta | null = null;
    try {
      // [DOC] RFC 9309 § 2.3.1.2: un robots.txt que redirige se sigue («at least five consecutive redirects, even
      // across authorities») y sus reglas valen «in the context of the initial authority»; con más, no disponible.
      let url = `${origen}/robots.txt`;
      for (let salto = 0; ; salto++) {
        r = await this.pedir(url, sitio, {});
        const destino = r.cabeceras['location'];
        if (r.estado < 300 || r.estado >= 400 || destino === undefined) break;
        if (salto >= SALTOS) {
          r = { ...r, estado: 404 };
          break;
        }
        url = new URL(destino, url).href;
      }
    } catch (e) {
      if (e instanceof PresupuestoAgotado) throw e;
      r = null; // error de red: inalcanzable
    }
    if (r === null || r.estado >= 500) {
      sitio.reglas = null;
    } else if (r.estado >= 200 && r.estado < 300) {
      const texto = r.cuerpo.toString('utf8');
      sitio.reglas = reglasPara(texto, this.o.agente);
      const retraso = retrasoPara(texto, this.o.agente);
      if (retraso !== null) sitio.pausaMs = Math.max(sitio.pausaMs, retraso * 1000);
    }
    // 4xx: sin reglas (todo permitido).
    return sitio;
  }

  private async pedir(url: string, sitio: Sitio, cabeceras: Readonly<Record<string, string>>): Promise<Respuesta> {
    for (let intento = 0; ; intento++) {
      const espera = sitio.ultima === null ? 0 : Math.max(0, sitio.ultima + sitio.pausaMs - this.o.ahora());
      if (this.o.ahora() + espera - this.inicio > this.o.presupuestoMs) throw new PresupuestoAgotado(url, this.o.presupuestoMs);
      if (espera > 0) await this.o.dormir(espera);
      sitio.ultima = this.o.ahora();
      this.peticiones++;
      const r = await this.o.fetch(url, { headers: { ...cabeceras, 'User-Agent': this.agenteCompleto }, redirect: 'manual' });
      const cuerpo = Buffer.from(await r.arrayBuffer());
      this.bytes += cuerpo.length;
      if ((r.status === 429 || r.status === 503) && intento < REINTENTOS) {
        const segundos = Number(r.headers.get('retry-after'));
        const esperaMs = Number.isFinite(segundos) && segundos > 0 ? segundos * 1000 : ESPERA_SIN_RETRY_AFTER_MS;
        // La próxima petición a este sitio no sale antes de esperaMs desde ahora.
        sitio.ultima = this.o.ahora() + esperaMs - sitio.pausaMs;
        continue;
      }
      return { estado: r.status, cuerpo, tipo: r.headers.get('content-type'), cabeceras: Object.fromEntries(r.headers), url };
    }
  }
}
