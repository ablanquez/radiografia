/**
 * Jueces del cliente de red de la herramienta de calibración (encargo 5.5),
 * SIN red: un fetch falso que sirve respuestas fijas y un reloj falso que
 * avanza cuando el cliente duerme. Se juzga lo que la herramienta promete a
 * los servidores: se identifica, lee y obedece robots.txt (RFC 9309), espera
 * entre peticiones al mismo sitio (y el Crawl-delay si pide más), reintenta
 * un 429 después de lo que diga Retry-After, y para al agotar su tiempo.
 * [DOC] https://www.rfc-editor.org/rfc/rfc9309 § 2.3.1.3 (robots.txt con
 *    4xx: «MAY access any resources») y § 2.3.1.4 (5xx: «MUST assume
 *    complete disallow»).
 * [DOC] https://www.rfc-editor.org/rfc/rfc9110#section-10.2.3 — Retry-After
 *    en segundos; § 15.4 (3xx y Location) y § 14 (peticiones Range).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Cliente, PresupuestoAgotado, VetadoPorRobots } from './red.ts';

interface Servida {
  estado: number;
  cuerpo?: string;
  cabeceras?: Record<string, string>;
}

/** Un fetch falso: por URL, una lista de respuestas que se van gastando (la última se repite). */
function montar(respuestas: Record<string, Servida[]>, pausaMs = 1000, presupuestoMs = 3_600_000) {
  let reloj = 0;
  const llamadas: { url: string; agente: string | null; rango: string | null; redireccion: string | undefined; en: number }[] = [];
  const fetchFalso = (async (entrada: string | URL | Request, init?: RequestInit) => {
    const url = String(entrada);
    llamadas.push({ url, agente: new Headers(init?.headers).get('user-agent'), rango: new Headers(init?.headers).get('range'), redireccion: init?.redirect, en: reloj });
    const lista = respuestas[url];
    if (lista === undefined) return new Response('no servida', { status: 404 });
    const r = lista.length > 1 ? lista.shift()! : lista[0]!;
    return new Response(r.cuerpo ?? '', { status: r.estado, headers: r.cabeceras });
  }) as typeof fetch;
  const cliente = new Cliente({
    agente: 'RadiografIA-calibracion',
    contacto: 'https://github.com/ablanquez/radiografia',
    pausaMs,
    presupuestoMs,
    fetch: fetchFalso,
    ahora: () => reloj,
    dormir: async (ms) => {
      reloj += ms;
    },
  });
  return { cliente, llamadas, reloj: () => reloj };
}

const ROBOTS_BOE = 'User-agent: *\nDisallow: /diario_boe/xml.php?\n';

describe('Cliente', () => {
  test('se identifica en cada petición, también en la de robots.txt', async () => {
    const { cliente, llamadas } = montar({
      'https://www.boe.es/robots.txt': [{ estado: 200, cuerpo: ROBOTS_BOE }],
      'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-4000': [{ estado: 200, cuerpo: '<p>hola</p>' }],
    });
    const r = await cliente.obtener('https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-4000');
    assert.equal(r.estado, 200);
    assert.equal(r.cuerpo.toString('utf8'), '<p>hola</p>');
    assert.deepEqual(
      llamadas.map((l) => l.agente),
      ['RadiografIA-calibracion/0.1 (+https://github.com/ablanquez/radiografia)', 'RadiografIA-calibracion/0.1 (+https://github.com/ablanquez/radiografia)'],
    );
  });

  test('lee robots.txt una vez por sitio y no pide lo vetado', async () => {
    const { cliente, llamadas } = montar({
      'https://www.boe.es/robots.txt': [{ estado: 200, cuerpo: ROBOTS_BOE }],
      'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-4000': [{ estado: 200, cuerpo: 'x' }],
    });
    await cliente.obtener('https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-4000');
    await assert.rejects(cliente.obtener('https://www.boe.es/diario_boe/xml.php?id=BOE-A-2010-4000'), VetadoPorRobots);
    assert.deepEqual(
      llamadas.map((l) => l.url),
      ['https://www.boe.es/robots.txt', 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-4000'],
    );
    assert.equal(cliente.vetadas, 1);
  });

  test('robots.txt con 404: todo permitido; con 503: nada', async () => {
    const libre = montar({ 'https://a.example/x': [{ estado: 200, cuerpo: 'x' }] });
    assert.equal((await libre.cliente.obtener('https://a.example/x')).estado, 200);
    const caido = montar({ 'https://b.example/robots.txt': [{ estado: 503 }], 'https://b.example/x': [{ estado: 200 }] });
    await assert.rejects(caido.cliente.obtener('https://b.example/x'), VetadoPorRobots);
    assert.ok(!caido.llamadas.some((l) => l.url === 'https://b.example/x'), 'no llegó a pedirla');
  });

  test('espera la pausa entre dos peticiones al mismo sitio', async () => {
    const { cliente, llamadas } = montar(
      { 'https://a.example/1': [{ estado: 200 }], 'https://a.example/2': [{ estado: 200 }] },
      1000,
    );
    await cliente.obtener('https://a.example/1');
    await cliente.obtener('https://a.example/2');
    const en = llamadas.map((l) => l.en);
    assert.deepEqual(en, [0, 1000, 2000], 'robots.txt en 0, /1 en 1.000 ms y /2 en 2.000 ms');
  });

  test('el Crawl-delay manda si pide más que la pausa: 10 s en zenodo.org', async () => {
    const { llamadas, cliente } = montar(
      {
        'https://zenodo.org/robots.txt': [{ estado: 200, cuerpo: 'User-agent: *\nDisallow: /api\nAllow: /api/records/*/files\nCrawl-delay: 10\n' }],
        'https://zenodo.org/api/records/7313126/files/README.md/content': [{ estado: 200 }],
      },
      1000,
    );
    await cliente.obtener('https://zenodo.org/api/records/7313126/files/README.md/content');
    assert.deepEqual(llamadas.map((l) => l.en), [0, 10_000]);
  });

  test('un 429 con Retry-After: 30 espera 30 s y reintenta', async () => {
    const { cliente, llamadas } = montar(
      {
        'https://a.example/x': [
          { estado: 429, cabeceras: { 'retry-after': '30' } },
          { estado: 200, cuerpo: 'ya' },
        ],
      },
      1000,
    );
    const r = await cliente.obtener('https://a.example/x');
    assert.equal(r.cuerpo.toString('utf8'), 'ya');
    assert.deepEqual(llamadas.map((l) => l.en), [0, 1000, 31_000]);
  });

  test('pasa las cabeceras de la petición (Range) y devuelve las de la respuesta', async () => {
    const { cliente, llamadas } = montar({
      'https://zenodo.org/f': [{ estado: 206, cuerpo: 'a', cabeceras: { 'Accept-Ranges': 'bytes', 'Content-Range': 'bytes 0-0/929127061' } }],
    });
    const r = await cliente.obtener('https://zenodo.org/f', { Range: 'bytes=0-0' });
    assert.equal(r.estado, 206);
    assert.equal(r.cabeceras['accept-ranges'], 'bytes');
    assert.equal(r.cabeceras['content-range'], 'bytes 0-0/929127061');
    assert.equal(r.url, 'https://zenodo.org/f');
    assert.equal(llamadas.at(-1)!.rango, 'bytes=0-0');
  });

  test('sigue una redirección él mismo: robots.txt y pausa del sitio de destino, y el Range otra vez', async () => {
    const { cliente, llamadas } = montar({
      'https://a.example/f': [{ estado: 302, cabeceras: { Location: 'https://cdn.example/b/f?x=1' } }],
      'https://cdn.example/robots.txt': [{ estado: 200, cuerpo: 'User-agent: *\nDisallow: /privado\n' }],
      'https://cdn.example/b/f?x=1': [{ estado: 206, cuerpo: 'abc' }],
    });
    const r = await cliente.obtener('https://a.example/f', { Range: 'bytes=5-7' });
    assert.equal(r.estado, 206);
    assert.equal(r.url, 'https://cdn.example/b/f?x=1');
    assert.deepEqual(
      llamadas.map((l) => [l.url, l.rango, l.redireccion]),
      [
        ['https://a.example/robots.txt', null, 'manual'],
        ['https://a.example/f', 'bytes=5-7', 'manual'],
        ['https://cdn.example/robots.txt', null, 'manual'],
        ['https://cdn.example/b/f?x=1', 'bytes=5-7', 'manual'],
      ],
    );
  });

  test('una redirección a lo que el robots.txt del destino veta: no la pide', async () => {
    const { cliente, llamadas } = montar({
      'https://a.example/f': [{ estado: 301, cabeceras: { Location: '/privado/f' } }],
      'https://a.example/robots.txt': [{ estado: 200, cuerpo: 'User-agent: *\nDisallow: /privado\n' }],
    });
    await assert.rejects(cliente.obtener('https://a.example/f'), VetadoPorRobots);
    assert.ok(!llamadas.some((l) => l.url === 'https://a.example/privado/f'));
  });

  test('un robots.txt que redirige: se sigue (RFC 9309 § 2.3.1.2) y manda el de destino', async () => {
    const { cliente, llamadas } = montar({
      'https://a.example/robots.txt': [{ estado: 301, cabeceras: { Location: 'https://www.a.example/robots.txt' } }],
      'https://www.a.example/robots.txt': [{ estado: 200, cuerpo: 'User-agent: *\nDisallow: /privado\n' }],
      'https://a.example/libre': [{ estado: 200 }],
    });
    await assert.rejects(cliente.obtener('https://a.example/privado/x'), VetadoPorRobots);
    assert.equal((await cliente.obtener('https://a.example/libre')).estado, 200);
    assert.deepEqual(
      llamadas.map((l) => l.url),
      ['https://a.example/robots.txt', 'https://www.a.example/robots.txt', 'https://a.example/libre'],
    );
  });

  test('más de cinco redirecciones seguidas: para', async () => {
    const { cliente } = montar({ 'https://a.example/f': [{ estado: 302, cabeceras: { Location: '/f' } }] });
    await assert.rejects(cliente.obtener('https://a.example/f'), /redirecciones/);
  });

  test('al agotar el tiempo, para antes de pedir', async () => {
    const { cliente, llamadas } = montar(
      { 'https://a.example/1': [{ estado: 200 }], 'https://a.example/2': [{ estado: 200 }], 'https://a.example/3': [{ estado: 200 }] },
      1000,
      2500,
    );
    await cliente.obtener('https://a.example/1');
    await cliente.obtener('https://a.example/2');
    await assert.rejects(cliente.obtener('https://a.example/3'), PresupuestoAgotado);
    assert.equal(llamadas.length, 3, 'robots.txt, /1 y /2; /3 no');
    assert.equal(cliente.peticiones, 3);
  });
});
