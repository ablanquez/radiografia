/**
 * Jueces de boe.ts (encargo 5.5, género «administrativo»): los ítems de un
 * sumario del BOE, su subgénero o por qué quedan fuera, y el texto de un
 * documento desde su HTML (txt.php). El HTML de estos jueces es sintético,
 * calcado de la estructura vista en documentos reales del 10/03/2010
 * (BOE-A-2010-3996, -4003, -4013; BOE-B-2010-8866, -8934), sin su texto.
 * [DOC] https://www.boe.es/datosabiertos/documentos/APIsumarioBOE.pdf — la
 *    estructura del sumario (sumario → diario → seccion → departamento →
 *    epigrafe → item, o item directo en el departamento).
 * [DOC] https://nodejs.org/api/test.html — node:test.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { clasificar, conservaElTexto, fechasDelPeriodo, itemsDelSumario, textoDelDocumento, textoPlano } from './boe.ts';

const item = (id: string, titulo = `Resolución de prueba ${id}.`) => ({
  identificador: id,
  titulo,
  url_pdf: { szBytes: '1', szKBytes: '1', pagina_inicial: '10', pagina_final: '12', texto: `https://www.boe.es/x/${id}.pdf` },
  url_html: `https://www.boe.es/diario_boe/txt.php?id=${id}`,
  url_xml: `https://www.boe.es/diario_boe/xml.php?id=${id}`,
});

/** Un sumario con la forma del JSON de la API: un ítem suelto en «item» es un objeto; varios, una lista. */
const SUMARIO = {
  status: { code: '200', text: 'ok' },
  data: {
    sumario: {
      metadatos: { publicacion: 'BOE', fecha_publicacion: '20100310' },
      diario: [
        {
          numero: '60',
          seccion: [
            {
              codigo: '1',
              nombre: 'I. Disposiciones generales',
              departamento: [
                { codigo: '1', nombre: 'MINISTERIO A', epigrafe: [{ nombre: 'Seguridad privada', item: item('BOE-A-2010-1') }, { nombre: 'Tratados internacionales', item: item('BOE-A-2010-2') }] },
              ],
            },
            {
              codigo: '3',
              nombre: 'III. Otras disposiciones',
              departamento: { codigo: '2', nombre: 'MINISTERIO B', epigrafe: { nombre: 'Lotería', item: [item('BOE-A-2010-3'), item('BOE-A-2010-4', 'Traducción oficial al castellano del Convenio X.')] } },
            },
            { codigo: '4', nombre: 'IV. Administración de Justicia', departamento: { codigo: '3', nombre: 'JUZGADOS', item: item('BOE-B-2010-5') } },
            { codigo: '5A', nombre: 'V. Anuncios. - A.', departamento: { codigo: '4', nombre: 'MINISTERIO C', item: [item('BOE-B-2010-6'), item('BOE-B-2010-7')] } },
            { codigo: '5C', nombre: 'V. Anuncios. - C. Anuncios particulares', departamento: { codigo: '5', nombre: 'PARTICULARES', item: item('BOE-B-2010-8') } },
          ],
        },
      ],
    },
  },
};

describe('itemsDelSumario', () => {
  test('todos los ítems, con o sin epígrafe, objeto suelto o lista', () => {
    const items = itemsDelSumario(SUMARIO, '20100310');
    assert.deepEqual(
      items.map((i) => [i.id, i.seccion, i.epigrafe]),
      [
        ['BOE-A-2010-1', '1', 'Seguridad privada'],
        ['BOE-A-2010-2', '1', 'Tratados internacionales'],
        ['BOE-A-2010-3', '3', 'Lotería'],
        ['BOE-A-2010-4', '3', 'Lotería'],
        ['BOE-B-2010-5', '4', null],
        ['BOE-B-2010-6', '5A', null],
        ['BOE-B-2010-7', '5A', null],
        ['BOE-B-2010-8', '5C', null],
      ],
    );
    assert.equal(items[0]!.urlHtml, 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2010-1');
    assert.equal(items[0]!.fecha, '20100310');
  });

  test('una respuesta sin status 200: para', () => {
    assert.throws(() => itemsDelSumario({ status: { code: '404', text: 'no' } }, '20100314'), /404/);
  });
});

describe('clasificar', () => {
  const por = (id: string) => clasificar(itemsDelSumario(SUMARIO, '20100310').find((i) => i.id === id)!);
  test('I → disposición general; III → resolución; V.A → anuncio', () => {
    assert.deepEqual(por('BOE-A-2010-1'), { subgenero: 'disposicion-general' });
    assert.deepEqual(por('BOE-A-2010-3'), { subgenero: 'resolucion' });
    assert.deepEqual(por('BOE-B-2010-6'), { subgenero: 'anuncio' });
  });
  test('fuera: tratados, traducciones, sección IV y V.C, cada uno con su motivo', () => {
    assert.deepEqual(por('BOE-A-2010-2'), { fuera: 'epígrafe de tratados o acuerdos internacionales' });
    assert.deepEqual(por('BOE-A-2010-4'), { fuera: 'título con «traducción»' });
    assert.deepEqual(por('BOE-B-2010-5'), { fuera: 'sección 4 (IV. Administración de Justicia)' });
    assert.deepEqual(por('BOE-B-2010-8'), { fuera: 'sección 5C (V. Anuncios. - C. Anuncios particulares)' });
  });
});

describe('textoDelDocumento', () => {
  const pagina = (cuerpo: string) =>
    `<html><body><div id="barraSep"><h3 class="documento-tit">Título que no es texto</h3></div>\n<div id="DOdocText">\n  <h4>TEXTO ORIGINAL</h4>\n  <div id="textoxslt">\n${cuerpo}\n  </div>\n  <!-- #textoxslt -->\n</div>\n<div id="pie">Aviso legal</div></body></html>`;

  test('un párrafo por <p> y por <h5>, en orden, sin título ni pie de página', () => {
    const r = textoDelDocumento(
      pagina('<p class="parrafo">Primer párrafo del preámbulo.</p>\n<p class="centro_redonda">DISPONGO:</p>\n<h5 class="articulo">Artículo único. Objeto.</h5>\n<p class="parrafo_2">Madrid, 1 de marzo de 2010.–El Ministro.</p>'),
    );
    assert.equal(r.texto, 'Primer párrafo del preámbulo.\nDISPONGO:\nArtículo único. Objeto.\nMadrid, 1 de marzo de 2010.–El Ministro.');
    assert.deepEqual(r.problemas, []);
  });

  test('un formulario <dl> anidado: cada <dt> y cada <dd> en su línea, como se ve en la página', () => {
    const r = textoDelDocumento(
      pagina('<dl>\n<dt>1. Entidad adjudicadora:</dt>\n<dd>\n<dl>\n<dt>a) Organismo: </dt>\n<dd>Sección Económica.</dd>\n</dl>\n</dd>\n</dl>\n<p class="parrafo_2">Madrid, 3 de marzo de 2010.</p>'),
    );
    assert.equal(r.texto, '1. Entidad adjudicadora:\na) Organismo:\nSección Económica.\nMadrid, 3 de marzo de 2010.');
  });

  test('el aviso del BOE de imágenes omitidas no es texto del documento: fuera, y se cuenta', () => {
    const r = textoDelDocumento(
      pagina('<p class="parrafo">Texto.</p>\n<p class="caja gris info">Aquí aparecen varias imágenes en el original. Consulte el documento PDF oficial y auténtico.</p>'),
    );
    assert.equal(r.texto, 'Texto.');
    assert.equal(r.avisosDeImagen, 1);
  });

  test('una tabla: una fila por línea, con barras (el segmentador la marca como tabla, no prosa)', () => {
    const r = textoDelDocumento(pagina('<table><tr><th>Puesto</th><th>Nivel</th></tr><tr><td>Jefe de <em>sección</em></td><td>26</td></tr></table>'));
    assert.equal(r.texto, '| Puesto | Nivel |\n| Jefe de sección | 26 |');
  });

  test('entidades: numéricas y con nombre; &#13; es un salto de carro y se vuelve espacio', () => {
    const r = textoDelDocumento(pagina('<p class="parrafo">Uno&#13;\ndos &amp; tres&nbsp;&laquo;cuatro&raquo; &#x41;&#233;.</p>'));
    assert.equal(r.texto, 'Uno dos & tres «cuatro» Aé.');
    assert.deepEqual(r.problemas, []);
  });

  test('<br> parte la línea; <sup> y los enlaces dejan su texto', () => {
    const r = textoDelDocumento(pagina('<p>Superficie: 20 m<sup>2</sup><br/>Véase <a href="/x">el anexo</a>.</p>'));
    assert.equal(r.texto, 'Superficie: 20 m2\nVéase el anexo.');
  });

  test('sin el bloque #textoxslt o sin su cierre: vacío, con el problema dicho', () => {
    assert.deepEqual(textoDelDocumento('<html><body><p>Nada</p></body></html>'), { texto: '', problemas: ['sin bloque #textoxslt'], avisosDeImagen: 0 });
    assert.deepEqual(textoDelDocumento('<div id="textoxslt"><p>Cortado</p>').problemas, ['sin cierre de #textoxslt']);
  });

  test('una entidad con nombre desconocida: queda dicha como problema', () => {
    assert.deepEqual(textoDelDocumento(pagina('<p>Raro &zzz; aquí.</p>')).problemas, ['entidad sin decodificar: &zzz;']);
  });

  test('nada se pierde: con formulario, tabla y aviso de imagen, los caracteres del bloque son los de la salida', () => {
    const r = textoDelDocumento(
      pagina('<dl><dt>1. Objeto:</dt><dd><dl><dt>a) Tipo:</dt><dd>Suministro.</dd></dl></dd></dl><table><tr><td>A</td><td>1</td></tr></table><p class="caja gris info">Aviso.</p><p>Fin.</p>'),
    );
    assert.deepEqual(r.problemas, []);
  });
});

describe('textoPlano', () => {
  test('sin etiquetas, con las entidades decodificadas y el espacio colapsado (para buscar un literal en una página)', () => {
    assert.equal(textoPlano('<p>Resoluci&oacute;n de\n  <b>27 de junio</b>&nbsp;de 2024</p>'), 'Resolución de 27 de junio de 2024');
  });
});

describe('conservaElTexto', () => {
  test('mismos caracteres salvo espacios y barras: sí; uno de menos: no', () => {
    assert.equal(conservaElTexto('<p>Uno dos</p><p>tres</p>', 'Uno dos\ntres'), true);
    assert.equal(conservaElTexto('<tr><td>A</td><td>1</td></tr>', '| A | 1 |'), true);
    assert.equal(conservaElTexto('<p>Uno dos</p><p>tres</p>', 'Uno dos'), false);
  });
});

describe('fechasDelPeriodo', () => {
  test('del 28/02 al 01/03 de 2000 (bisiesto): tres días, AAAAMMDD', () => {
    assert.deepEqual(fechasDelPeriodo('2000-02-28', '2000-03-01'), ['20000228', '20000229', '20000301']);
  });
  test('2000-2021: 8.036 días', () => {
    assert.equal(fechasDelPeriodo('2000-01-01', '2021-12-31').length, 8036);
  });
});
