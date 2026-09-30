/**
 * Jueces de robots.ts (encargo 5.5): el protocolo de exclusión de robots, RFC
 * 9309, con los ejemplos del propio RFC (§ 5.1 y § 5.2) y con líneas copiadas
 * del robots.txt de www.boe.es (leído el 30/09/2026).
 * [DOC] https://www.rfc-editor.org/rfc/rfc9309 — § 2.2.1 (grupo por product
 *    token, sin distinguir mayúsculas; si no hay grupo propio, el de «*»),
 *    § 2.2.2 (gana la regla con más octetos; a igualdad, «allow»; /robots.txt
 *    siempre permitido), § 2.2.3 («*» y «$»).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { permitido, reglasPara, retrasoPara } from './robots.ts';

/** RFC 9309, § 5.1, tal cual. */
const RFC_5_1 = `User-Agent: *
Disallow: *.gif$
Disallow: /example/
Allow: /publications/

User-Agent: foobot
Disallow:/
Allow:/example/page.html
Allow:/example/allowed.gif

User-Agent: barbot
User-Agent: bazbot
Disallow: /example/page.html

User-Agent: quxbot
`;

describe('robots.txt (RFC 9309)', () => {
  test('§ 5.1, foobot: solo sus dos rutas permitidas', () => {
    const r = reglasPara(RFC_5_1, 'foobot');
    assert.equal(permitido(r, '/example/page.html'), true);
    assert.equal(permitido(r, '/example/allowed.gif'), true);
    assert.equal(permitido(r, '/otra'), false);
  });

  test('§ 5.1, barbot y bazbot comparten grupo', () => {
    for (const agente of ['barbot', 'bazbot']) {
      const r = reglasPara(RFC_5_1, agente);
      assert.equal(permitido(r, '/example/page.html'), false, agente);
      assert.equal(permitido(r, '/example/otra.html'), true, agente);
    }
  });

  test('§ 5.1, quxbot: grupo vacío al final, todo permitido', () => {
    assert.equal(permitido(reglasPara(RFC_5_1, 'quxbot'), '/example/page.html'), true);
  });

  test('§ 5.1, un agente sin grupo propio sigue el de «*»: «*» y «$»', () => {
    const r = reglasPara(RFC_5_1, 'RadiografIA-calibracion');
    assert.equal(permitido(r, '/a/b.gif'), false, '*.gif$');
    assert.equal(permitido(r, '/a/b.gif?x=1'), true, 'el $ ancla al final');
    assert.equal(permitido(r, '/example/x'), false);
    assert.equal(permitido(r, '/publications/x'), true);
  });

  test('el product token se busca sin distinguir mayúsculas', () => {
    assert.equal(permitido(reglasPara(RFC_5_1, 'FOOBOT'), '/otra'), false);
  });

  test('§ 5.2: gana la regla más larga', () => {
    const r = reglasPara('User-Agent: foobot\nAllow: /example/page/\nDisallow: /example/page/disallowed.gif\n', 'foobot');
    assert.equal(permitido(r, '/example/page/disallowed.gif'), false);
    assert.equal(permitido(r, '/example/page/otra.gif'), true);
  });

  test('§ 2.2.2: a igual longitud, «allow»; /robots.txt, siempre', () => {
    const r = reglasPara('User-agent: *\nDisallow: /a\nAllow: /a\nDisallow: /\n', 'x');
    assert.equal(permitido(r, '/a'), true);
    assert.equal(permitido(r, '/b'), false);
    assert.equal(permitido(r, '/robots.txt'), true);
  });

  test('reglas antes de cualquier user-agent: se ignoran; y los comentarios se quitan', () => {
    const r = reglasPara('Disallow: /\nUser-agent: *\nDisallow: /x # comentario\n', 'x');
    assert.equal(permitido(r, '/'), true);
    assert.equal(permitido(r, '/x'), false);
    assert.equal(permitido(r, '/y'), true);
  });

  test('otros registros (Crawl-delay, Sitemap) no cortan el grupo', () => {
    const r = reglasPara('User-agent: *\nCrawl-delay: 10\nDisallow: /api\nSitemap: https://x/s.xml\nAllow: /api/records/*/files\n', 'x');
    assert.equal(permitido(r, '/api/records/7313126/files/csic_es.txt/content'), true);
    assert.equal(permitido(r, '/api/otra'), false);
  });

  test('Crawl-delay (fuera del RFC): el del grupo que toca; null si no hay', () => {
    // Las líneas de zenodo.org/robots.txt (30/09/2026) que importan aquí.
    assert.equal(retrasoPara('User-agent: *\nDisallow: /api\nAllow: /api/records/*/files\nCrawl-delay: 10\n', 'RadiografIA-calibracion'), 10);
    assert.equal(retrasoPara(RFC_5_1, 'foobot'), null);
    assert.equal(retrasoPara('User-agent: foobot\nDisallow: /x\nCrawl-delay: 3\n\nUser-agent: *\nCrawl-delay: 20\n', 'foobot'), 3, 'el de su grupo, no el de «*»');
  });
});

describe('líneas del robots.txt de www.boe.es (30/09/2026)', () => {
  const BOE = `User-agent: *
# Descartar xml
Disallow: /diario_boe/xml.php?
Allow: /diario_boe/txt.php?id=BOE-B-2018-20269
Disallow: /diario_boe/txt.php?id=BOE-A-2026-4920
Disallow: /*BOE-A-2026-4920$
Disallow: /*BOE-A-2026-4920&
Disallow: /diario_boe/txt.php?*lang=ca
`;
  const r = reglasPara(BOE, 'RadiografIA-calibracion');

  test('el XML de un documento está vetado; su HTML, no', () => {
    assert.equal(permitido(r, '/diario_boe/xml.php?id=BOE-A-2010-4000'), false);
    assert.equal(permitido(r, '/diario_boe/txt.php?id=BOE-A-2010-4000'), true);
  });

  test('un documento vetado por su id, en cualquier ruta que acabe en él', () => {
    assert.equal(permitido(r, '/diario_boe/txt.php?id=BOE-A-2026-4920'), false);
    assert.equal(permitido(r, '/buscar/doc.php?id=BOE-A-2026-4920'), false);
    assert.equal(permitido(r, '/buscar/doc.php?id=BOE-A-2026-4920&lang=es'), false);
    assert.equal(permitido(r, '/buscar/doc.php?id=BOE-A-2026-49201'), true, 'otro id que empieza igual');
  });

  test('la versión en otra lengua, vetada; la API de datos abiertos, permitida', () => {
    assert.equal(permitido(r, '/diario_boe/txt.php?id=BOE-A-2010-4000&lang=ca'), false);
    assert.equal(permitido(r, '/datosabiertos/api/boe/sumario/20100310'), true);
  });
});
