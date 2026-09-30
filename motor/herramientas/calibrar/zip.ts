/**
 * Un lector mínimo de ZIP (encargo 5.5): los EPUB de Project Gutenberg son
 * ZIP. Sin dependencias: node:zlib (inflateRawSync, crc32). Solo lo que hace
 * falta aquí: entradas guardadas (método 0) o deflate (método 8), sin cifrar y
 * sin ZIP64; cualquier otra cosa, para. Cada entrada se comprueba contra su
 * tamaño y su CRC-32 del directorio central. Lo juzga zip.spec.ts.
 *
 * [DOC] PKWARE, APPNOTE.TXT 6.3.10 (https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT):
 *    § 4.3.16, fin del directorio central (firma 0x06054b50; total de entradas
 *    en +10, tamaño del directorio en +12, su desplazamiento en +16, longitud
 *    del comentario en +20); § 4.3.12, cabecera del directorio central (firma
 *    0x02014b50; indicadores en +8, método en +10, crc-32 en +16, tamaños en
 *    +20 y +24, longitudes de nombre, extra y comentario en +28, +30 y +32,
 *    desplazamiento de la cabecera local en +42, nombre en +46); § 4.3.7,
 *    cabecera local (firma 0x04034b50; longitudes de nombre y extra en +26 y
 *    +28; los datos empiezan en +30 + nombre + extra). Indicadores (§ 4.4.4):
 *    bit 0, cifrado; bit 11, nombre en UTF-8.
 * [DOC] https://nodejs.org/api/zlib.html — zlib.inflateRawSync y zlib.crc32.
 */
import { crc32, inflateRawSync } from 'node:zlib';

const FIN = 0x06054b50;
const CENTRAL = 0x02014b50;
const LOCAL = 0x04034b50;

/** Las entradas del ZIP, en el orden del directorio central: nombre → contenido. */
export function leerZip(b: Buffer): Map<string, Buffer> {
  // El registro de fin está al final, detrás de un comentario de hasta 65.535 bytes.
  let fin = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (b.readUInt32LE(i) === FIN) {
      fin = i;
      break;
    }
  }
  if (fin < 0) throw new Error('no es un zip: no tiene registro de fin del directorio central');
  const entradas = b.readUInt16LE(fin + 10);
  const desplazamientoCentral = b.readUInt32LE(fin + 16);
  if (entradas === 0xffff || desplazamientoCentral === 0xffffffff) throw new Error('zip: ZIP64 no soportado');

  const salida = new Map<string, Buffer>();
  let p = desplazamientoCentral;
  for (let n = 0; n < entradas; n++) {
    if (b.readUInt32LE(p) !== CENTRAL) throw new Error(`zip: cabecera central ${n} sin firma`);
    const indicadores = b.readUInt16LE(p + 8);
    const metodo = b.readUInt16LE(p + 10);
    const crc = b.readUInt32LE(p + 16);
    const comprimido = b.readUInt32LE(p + 20);
    const tamano = b.readUInt32LE(p + 24);
    const largoNombre = b.readUInt16LE(p + 28);
    const largoExtra = b.readUInt16LE(p + 30);
    const largoComentario = b.readUInt16LE(p + 32);
    const local = b.readUInt32LE(p + 42);
    const nombre = b.subarray(p + 46, p + 46 + largoNombre).toString(indicadores & 0x800 ? 'utf8' : 'latin1');
    p += 46 + largoNombre + largoExtra + largoComentario;

    if (indicadores & 0x1) throw new Error(`zip: ${nombre} está cifrado`);
    if (b.readUInt32LE(local) !== LOCAL) throw new Error(`zip: ${nombre} sin cabecera local`);
    const inicio = local + 30 + b.readUInt16LE(local + 26) + b.readUInt16LE(local + 28);
    const datos = b.subarray(inicio, inicio + comprimido);
    let contenido: Buffer;
    if (metodo === 0) contenido = Buffer.from(datos);
    else if (metodo === 8) {
      try {
        contenido = inflateRawSync(datos);
      } catch (e) {
        throw new Error(`zip: ${nombre} no se deja descomprimir (${(e as Error).message})`);
      }
    } else throw new Error(`zip: ${nombre} usa el método ${metodo}, no soportado`);
    if (contenido.length !== tamano) throw new Error(`zip: ${nombre} mide ${contenido.length} y el directorio dice ${tamano}`);
    if (crc32(contenido) !== crc) throw new Error(`zip: ${nombre} no pasa su CRC-32`);
    salida.set(nombre, contenido);
  }
  return salida;
}
