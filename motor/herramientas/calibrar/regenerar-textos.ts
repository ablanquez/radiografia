/**
 * Regenera desde la caché de descargas (motor/corpus/<genero>/fuente/), SIN
 * RED, los textos de los MISMOS documentos del manifiesto del corpus
 * (motor/corpus/<genero>.manifiesto.json), con el extractor de hoy (encargo
 * 6.1, parada 1, punto 3): cada bloque del original (<p>, <dd>, una fila de
 * tabla…) es un párrafo separado del siguiente por una línea en blanco, y un
 * <br> es un salto simple dentro del párrafo (html.ts). No se vuelve a
 * muestrear: el descargador elige por el tramo que mide el motor, y con el
 * motor nuevo elegiría otros documentos o pediría a la red los que no tiene.
 *
 *   node herramientas/calibrar/regenerar-textos.ts administrativo        (desde motor/)
 *   node herramientas/calibrar/regenerar-textos.ts narrativa-clasica
 *
 *   · administrativo: el texto de fuente/html/<id>.html con textoDelDocumento
 *     (boe.ts), como descargar-administrativo.ts.
 *   · narrativa-clasica: el capítulo `orden` (el número del id) de
 *     fuente/epub/pg<libro>.epub con capitulosDeEpub (epub.ts), como
 *     descargar-narrativa-clasica.ts; su etiqueta tiene que ser la del
 *     manifiesto.
 *
 * PARA si falta un original en la caché, si la extracción da problemas, si el
 * capítulo no es el mismo, o si el texto nuevo, quitados los blancos, no es
 * el de antes: solo pueden cambiar los separadores. Reescribe textos/<id>.txt
 * y, en el manifiesto del corpus, la huella, las palabras de prosa y el tramo
 * de cada documento (con el motor de hoy) y n.porTramo, y añade una nota que
 * calibrar.ts lleva a la ficha del género.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { textoDelDocumento } from './boe.ts';
import { TRAMOS, huella, medirLongitud } from './comun.ts';
import { capitulosDeEpub, type CapitulosDeEpub } from './epub.ts';
import { nombreDeFichero, prepararManifiesto, type Manifiesto } from './manifiesto.ts';
import { leerZip } from './zip.ts';

const genero = process.argv[2];
if (genero !== 'administrativo' && genero !== 'narrativa-clasica') {
  console.error('uso: node herramientas/calibrar/regenerar-textos.ts administrativo|narrativa-clasica');
  process.exit(2);
}
const CORPUS = fileURLToPath(new URL(`../../corpus/${genero}/`, import.meta.url));
const RUTA_MANIFIESTO = fileURLToPath(new URL(`../../corpus/${genero}.manifiesto.json`, import.meta.url));
const manifiesto = JSON.parse(readFileSync(RUTA_MANIFIESTO, 'utf8')) as Manifiesto;
if (manifiesto.genero !== genero) throw new Error(`PARA: el manifiesto es de «${manifiesto.genero}»`);

const leerFuente = (ruta: string): Buffer => {
  if (!existsSync(`${CORPUS}fuente/${ruta}`)) throw new Error(`PARA: la caché no conserva fuente/${ruta}`);
  return readFileSync(`${CORPUS}fuente/${ruta}`);
};
const sinBlancos = (s: string) => s.replace(/\s+/g, '');
const epubs = new Map<number, CapitulosDeEpub>();

function textoNuevo(d: Manifiesto['documentos'][number]): string {
  if (genero === 'administrativo') {
    const r = textoDelDocumento(leerFuente(`html/${d.id}.html`).toString('utf8'));
    if (r.problemas.length > 0) throw new Error(`PARA: ${d.id}: ${r.problemas.join('; ')}`);
    return r.texto;
  }
  const libro = Number(d['libro']);
  const orden = Number(d.id.slice(d.id.lastIndexOf('-') + 1));
  if (!epubs.has(libro)) epubs.set(libro, capitulosDeEpub(leerZip(leerFuente(`epub/pg${libro}.epub`))));
  const c = epubs.get(libro)!.capitulos.find((x) => x.orden === orden);
  if (c === undefined) throw new Error(`PARA: ${d.id}: el EPUB no tiene el capítulo ${orden}`);
  if (c.etiqueta !== d['capitulo']) throw new Error(`PARA: ${d.id}: el capítulo ${orden} es «${c.etiqueta}» y el manifiesto dice «${d['capitulo']}»`);
  if (c.problemas.length > 0) throw new Error(`PARA: ${d.id}: ${c.problemas.join('; ')}`);
  return c.texto;
}

const textos = new Map<string, string>();
let cambianDeTramo = 0;
const documentos = manifiesto.documentos.map((d) => {
  const viejo = readFileSync(`${CORPUS}textos/${nombreDeFichero(d.id)}`, 'utf8');
  if (huella(viejo) !== d.sha256) throw new Error(`PARA: ${d.id}: el texto en caché no es el del manifiesto`);
  const nuevo = textoNuevo(d);
  if (sinBlancos(nuevo) !== sinBlancos(viejo)) throw new Error(`PARA: ${d.id}: el texto regenerado no es el de antes (sin contar los blancos)`);
  textos.set(d.id, nuevo);
  const { palabrasProsa, tramo } = medirLongitud(nuevo);
  if (tramo !== d.tramo) cambianDeTramo++;
  return { ...d, sha256: huella(nuevo), palabrasProsa, tramo };
});

const fecha = new Date().toISOString().slice(0, 10);
const nota = `Textos regenerados el ${fecha} desde la caché de descargas (fuente/), sin red, con regenerar-textos.ts (encargo 6.1): los mismos ${documentos.length} documentos; cada bloque del original es un párrafo separado del siguiente por una línea en blanco, y un <br> es un salto simple dentro del párrafo. Quitados los blancos, cada texto es idéntico al de antes. Huella, palabras de prosa y tramo, con el motor de hoy (párrafos según CommonMark).`;
const listo = prepararManifiesto(
  {
    ...manifiesto,
    notas: [...(manifiesto.notas ?? []).filter((n) => !n.startsWith('Textos regenerados el ')), nota],
    n: { ...manifiesto.n, porTramo: Object.fromEntries(TRAMOS.map((t) => [t, documentos.filter((d) => d.tramo === t).length])) as Manifiesto['n']['porTramo'] },
    documentos,
  },
  textos,
);
for (const [id, texto] of textos) writeFileSync(`${CORPUS}textos/${nombreDeFichero(id)}`, texto, 'utf8');
writeFileSync(RUTA_MANIFIESTO, JSON.stringify(listo, null, 2) + '\n', 'utf8');
console.log(`${genero}: ${documentos.length} textos regenerados; ${cambianDeTramo} cambian de tramo con el motor de hoy`);
