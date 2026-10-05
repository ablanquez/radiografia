/**
 * Los avisos de licencia de lo que va dentro de pdfmake (encargo 9.3; firmado
 * por Antonio en la parada previa: «los paquetes del chunk con sus fichas; y
 * el aviso viaja dentro del JS, como con Ajv»). Lee el mapa de fuentes de
 * node_modules/pdfmake/build/pdfmake.js (el fichero que empaqueta Vite: el
 * campo «browser» de su package.json), saca de qué paquetes está hecho y
 * escribe, en web/terceros/pdfmake/:
 *   · avisos.txt: el texto de la licencia de cada uno, entero, con su nombre,
 *     su versión y su licencia delante; lo pone astro.config.mjs en cabecera
 *     del trozo de JS de pdfmake, como comentario legal, y lo vigila el juez
 *     de construcción (jueces/construccion.spec.ts);
 *   · paquetes.json: la lista (paquete, versión, licencia, de dónde salen la
 *     versión y el texto), que es la tabla de THIRD-PARTY-NOTICES § 1.8 (lo
 *     vigila el mismo juez).
 * Se ejecuta a mano, desde web/, cuando cambia pdfmake: necesita la red
 * (npm pack de los paquetes que no están en el árbol instalado). La página no
 * la usa nunca.
 *
 *     node scripts/avisos-de-pdfmake.ts
 *
 * De dónde sale cada cosa:
 *   · el paquete de cada fuente, del último «node_modules/» de su ruta en el
 *     mapa; «../xmldoc.ts» es xmldoc (su propio mapa lo deja fuera); el resto
 *     sin node_modules es de pdfmake (src/), con dos piezas ajenas copiadas en
 *     él, svg-to-pdfkit (src/3rd-party, con su LICENSE) y qr.js
 *     (src/qrEnc.js, en dominio público con CC0 de respaldo, en su
 *     cabecera), y el arranque de webpack (webpack/bootstrap y webpack/runtime);
 *   · la versión y el texto: si el paquete está en el árbol instalado (desde
 *     node_modules/pdfmake), los de ahí; si no (los polyfills que añadió el
 *     build de pdfmake), los de la última versión publicada en npm. Qué
 *     versión va de verdad dentro de build/pdfmake.js NO CONSTA: el paquete
 *     no trae lockfile, y su repositorio no lo publica en la etiqueta 0.3.11
 *     (raw.githubusercontent.com/bpampuch/pdfmake/0.3.11/package-lock.json:
 *     404, el 05/10).
 *   · el texto, del fichero de licencia de la raíz del paquete (LICENSE,
 *     LICENCE, LICENSE.md…); si no trae ninguno, se dice y se pone el campo
 *     «license» de su package.json.
 * [DOC] https://sourcemaps.info/spec.html — «sources: An optional list of
 *    source names used by the "mappings" entry».
 * [DOC] https://docs.npmjs.com/cli/v11/commands/npm-pack — «Create a tarball
 *    from a package»; con un nombre@versión, el del registro.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { gunzipSync } from 'node:zlib';

const WEB = new URL('..', import.meta.url);
const SALIDA = new URL('terceros/pdfmake/', WEB);
const requerir = createRequire(new URL('node_modules/pdfmake/package.json', new URL('../', WEB)));

interface Paquete {
  paquete: string;
  version: string;
  licencia: string;
  /** De dónde salen la versión y el texto: «árbol» (el instalado) o «npm» (la última publicada). */
  origen: 'árbol' | 'npm' | 'pdfmake';
  /** El fichero del texto, o null si el paquete no trae ninguno. */
  fichero: string | null;
}

const mapa = JSON.parse(readFileSync(requerir.resolve('pdfmake/build/pdfmake.js.map'), 'utf8')) as { sources: string[] };
const nombres = new Set<string>();
for (const fuente of mapa.sources) {
  const i = fuente.lastIndexOf('node_modules/');
  if (i >= 0) {
    const partes = fuente.slice(i + 'node_modules/'.length).split('/');
    nombres.add(partes[0]!.startsWith('@') ? `${partes[0]}/${partes[1]}` : partes[0]!);
  } else if (fuente === 'webpack://pdfmake/../xmldoc.ts') nombres.add('xmldoc');
}
const ficheroDeLicencia = (carpeta: string): string | null => readdirSync(carpeta).find((f) => /^licen[cs]e(\.(md|txt))?$/i.test(f) || /^licen[cs]e-mit/i.test(f)) ?? null;

/**
 * Un paquete del registro, con npm pack, desempaquetado en `destino` (solo los ficheros de su raíz: package.json y la
 * licencia). El .tgz se lee aquí: gzip y, dentro, bloques de 512 bytes, cada fichero con su cabecera (el nombre en los
 * bytes 0-99, el prefijo en 345-499, el tamaño en octal en 124-135) y su contenido detrás, redondeado a 512.
 * [DOC] https://www.gnu.org/software/tar/manual/html_node/Standard.html — «struct posix_header».
 */
function desdeNpm(nombre: string, destino: string): string {
  const tgz = execSync(`npm pack ${nombre} --pack-destination "${destino}" --silent`, { encoding: 'utf8' }).trim().split(/\r?\n/).at(-1)!;
  const tar = gunzipSync(readFileSync(join(destino, tgz)));
  const carpeta = join(destino, 'package');
  mkdirSync(carpeta, { recursive: true });
  for (let i = 0; i + 512 <= tar.length; ) {
    const cabeza = tar.subarray(i, i + 512);
    if (cabeza.every((b) => b === 0)) break;
    const campo = (desde: number, largo: number): string => cabeza.toString('utf8', desde, desde + largo).replace(/\0[\s\S]*$/, '');
    const ruta = [campo(345, 155), campo(0, 100)].filter((x) => x !== '').join('/');
    const largo = Number.parseInt(campo(124, 12).trim() || '0', 8);
    const enLaRaiz = /^[^/]+\/[^/]+$/.exec(ruta);
    if (enLaRaiz !== null && cabeza[156] !== 53) writeFileSync(join(carpeta, ruta.split('/')[1]!), tar.subarray(i + 512, i + 512 + largo));
    i += 512 + Math.ceil(largo / 512) * 512;
  }
  return carpeta;
}

const temporal = mkdtempSync(join(tmpdir(), 'avisos-pdfmake-'));
const paquetes: (Paquete & { texto: string })[] = [];
try {
  for (const nombre of [...nombres].sort()) {
    // El del árbol, el de primer nivel de node_modules/ (si hay varias copias, la versión de la que va dentro NO CONSTA).
    const enElArbol = join(dirname(dirname(requerir.resolve('pdfmake/package.json'))), nombre);
    let carpeta: string | null = existsSync(join(enElArbol, 'package.json')) ? enElArbol : null;
    let origen: Paquete['origen'] = 'árbol';
    if (carpeta === null) {
      origen = 'npm';
      carpeta = desdeNpm(nombre, mkdtempSync(join(temporal, 'p-')));
    }
    const json = JSON.parse(readFileSync(join(carpeta, 'package.json'), 'utf8')) as { version: string; license?: string; repository?: string | { url: string }; author?: string | { name: string } };
    let fichero = ficheroDeLicencia(carpeta);
    let texto = fichero === null ? null : readFileSync(join(carpeta, fichero), 'utf8');
    if (texto === null) {
      // El paquete publicado no trae su licencia: la de su repositorio, en la etiqueta de su versión (o en su rama por defecto).
      const repositorio = /github\.com[/:]([^/]+\/[^/#]+?)(\.git)?(#.*)?$/.exec(typeof json.repository === 'string' ? json.repository : (json.repository?.url ?? ''))?.[1];
      for (const ref of repositorio === undefined ? [] : [`v${json.version}`, json.version, 'HEAD']) {
        for (const nombreDelFichero of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license']) {
          const url = `https://raw.githubusercontent.com/${repositorio}/${ref}/${nombreDelFichero}`;
          const respuesta = await fetch(url);
          if (respuesta.ok) {
            texto = await respuesta.text();
            fichero = url;
            break;
          }
        }
        if (texto !== null) break;
      }
    }
    const autor = typeof json.author === 'string' ? json.author : json.author?.name;
    texto ??= `(${nombre} no trae fichero de licencia ni lo tiene su repositorio; su package.json dice «license»: ${json.license ?? 'NO CONSTA'}, y «author»: ${autor ?? 'NO CONSTA'})`;
    paquetes.push({ paquete: nombre, version: json.version, licencia: json.license ?? (fichero === null ? 'NO CONSTA' : `NO CONSTA en package.json; ${fichero}: ${texto.split(/\r?\n/)[0]!.trim()}`), origen, fichero, texto });
    console.log(`${nombre} ${json.version} (${origen}): ${json.license ?? '—'} · ${fichero ?? 'sin fichero'}`);
  }
  // Lo de pdfmake: su código (src/), con svg-to-pdfkit y qr.js dentro, y el arranque de webpack.
  const pdfmake = dirname(requerir.resolve('pdfmake/package.json'));
  const version = (JSON.parse(readFileSync(join(pdfmake, 'package.json'), 'utf8')) as { version: string }).version;
  paquetes.unshift({ paquete: 'pdfmake', version, licencia: 'MIT', origen: 'pdfmake', fichero: 'LICENSE', texto: readFileSync(join(pdfmake, 'LICENSE'), 'utf8') });
  paquetes.push({
    paquete: 'svg-to-pdfkit (copiado en pdfmake, src/3rd-party)',
    version,
    licencia: 'MIT',
    origen: 'pdfmake',
    fichero: 'src/3rd-party/svg-to-pdfkit/LICENSE',
    texto: readFileSync(join(pdfmake, 'src/3rd-party/svg-to-pdfkit/LICENSE'), 'utf8'),
  });
  const qr = readFileSync(join(pdfmake, 'src/qrEnc.js'), 'utf8');
  const cabeceraDeQr = /\/\* qr\.js[\s\S]*?\*\//.exec(qr)?.[0];
  if (cabeceraDeQr === undefined) throw new Error('src/qrEnc.js ya no empieza por la cabecera de qr.js');
  paquetes.push({ paquete: 'qr.js (copiado en pdfmake, src/qrEnc.js)', version, licencia: 'dominio público; CC0 donde no se reconozca', origen: 'pdfmake', fichero: 'src/qrEnc.js (cabecera)', texto: cabeceraDeQr.replace(/^\/\* ?|\s*\*\/$/g, '').replace(/^ \* ?/gm, '') });
  const webpack = desdeNpm('webpack', mkdtempSync(join(temporal, 'p-')));
  const jsonDeWebpack = JSON.parse(readFileSync(join(webpack, 'package.json'), 'utf8')) as { version: string; license: string };
  paquetes.push({ paquete: 'webpack (su arranque: webpack/bootstrap y webpack/runtime)', version: jsonDeWebpack.version, licencia: jsonDeWebpack.license, origen: 'npm', fichero: 'LICENSE', texto: readFileSync(join(webpack, 'LICENSE'), 'utf8') });
} finally {
  rmSync(temporal, { recursive: true, force: true });
}

// El texto entero va dentro de un comentario /*! … */: un «*/» lo cerraría antes de tiempo.
for (const p of paquetes) if (p.texto.includes('*/')) throw new Error(`el texto de ${p.paquete} lleva «*/»`);
mkdirSync(SALIDA, { recursive: true });
const cabecera = [
  `Lo que va dentro de pdfmake ${paquetes[0]!.version} (build/pdfmake.js), que genera el PDF de «Descargar informe» de RadiografIA:`,
  `${paquetes.length} piezas, cada una con el texto de su licencia. Las versiones: las del árbol que instala RadiografIA o, si no`,
  'está en él, la última publicada en npm; la que va de verdad dentro NO CONSTA (pdfmake no publica su lockfile). La lista,',
  'en THIRD-PARTY-NOTICES.md § 1.8.',
].join('\n');
const cuerpo = paquetes.map((p) => `=== ${p.paquete} ${p.version} · ${p.licencia}${p.fichero === null ? '' : ` · ${p.fichero}`}\n\n${p.texto.replace(/\r\n/g, '\n').trim()}\n`).join('\n');
writeFileSync(new URL('avisos.txt', SALIDA), `${cabecera}\n\n${cuerpo}`);
writeFileSync(new URL('paquetes.json', SALIDA), `${JSON.stringify(paquetes.map(({ texto: _, ...p }) => p), null, 2)}\n`);
console.log(`${paquetes.length} piezas en ${SALIDA.pathname}`);
if (!existsSync(new URL('avisos.txt', SALIDA))) throw new Error('no se escribió avisos.txt');
