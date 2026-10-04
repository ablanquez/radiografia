/**
 * Lo justo para saber qué caracteres tiene una fuente WOFF2 (encargo 10.4,
 * Tanda 1): la cabecera, el directorio de tablas, el bloque comprimido con
 * Brotli (zlib de Node, sin dependencias) y la tabla cmap. Lo usa
 * fuentes.spec.ts para comprobar que el recorte guardó los glifos del español.
 *
 * [DOC] https://www.w3.org/TR/WOFF2/ — cabecera de 48 bytes (signature
 *    0x774F4632 «wOF2», flavor, length, numTables UInt16, reserved,
 *    totalSfntSize, totalCompressedSize, majorVersion, minorVersion,
 *    metaOffset, metaLength, metaOrigLength, privOffset, privLength); cada
 *    TableDirectoryEntry: flags UInt8 (bits 0-5, índice de la tabla de
 *    etiquetas conocidas, o 63 si sigue la etiqueta en 4 bytes; bits 6-7, la
 *    versión de transformación), origLength UIntBase128 y transformLength
 *    UIntBase128 solo si la tabla va transformada: «For all tables in a font,
 *    except for 'glyf' and 'loca' tables, transformation version 0 indicates
 *    the null transform. For 'glyf' and 'loca' tables, transformation version
 *    3 indicates the null transform»; «A UIntBase128 encoded number is a
 *    sequence of bytes for which the most significant bit is set for all but
 *    the last byte»; descomprimido, las tablas van seguidas en el orden del
 *    directorio, sin relleno. La cmap es la etiqueta conocida 0 y nunca se
 *    transforma.
 * [DOC] https://learn.microsoft.com/en-us/typography/opentype/spec/cmap —
 *    cabecera (version, numTables, EncodingRecord: platformID, encodingID,
 *    subtableOffset); formato 4 (segCountX2, endCode, reservedPad,
 *    startCode, idDelta, idRangeOffset, glyphIdArray) y formato 12
 *    (numGroups y SequentialMapGroup: startCharCode, endCharCode,
 *    startGlyphID); «character codes that do not correspond to any glyph in
 *    the font should be mapped to glyph index 0».
 */
import { brotliDecompressSync } from 'node:zlib';

const ETIQUETAS = [
  'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT',
  'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH',
  'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar',
  'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill',
] as const;

/** Las tablas de la fuente, ya descomprimidas (las transformadas, tal cual vienen: aquí solo se lee la cmap). */
export function tablasDeWoff2(fichero: Buffer): Map<string, Buffer> {
  if (fichero.readUInt32BE(0) !== 0x774f4632) throw new Error('no es un WOFF2: la firma no es «wOF2»');
  const numTables = fichero.readUInt16BE(12);
  const totalCompressedSize = fichero.readUInt32BE(20);
  let p = 48;
  const base128 = (): number => {
    let valor = 0;
    for (let i = 0; i < 5; i++) {
      const byte = fichero[p++]!;
      if (i === 0 && byte === 0x80) throw new Error('UIntBase128 con ceros a la izquierda');
      valor = valor * 128 + (byte & 0x7f);
      if ((byte & 0x80) === 0) return valor;
    }
    throw new Error('UIntBase128 de más de 5 bytes');
  };
  const entradas: { etiqueta: string; largo: number }[] = [];
  for (let i = 0; i < numTables; i++) {
    const flags = fichero[p++]!;
    let etiqueta: string;
    if ((flags & 0x3f) === 63) {
      etiqueta = fichero.toString('latin1', p, p + 4);
      p += 4;
    } else {
      etiqueta = ETIQUETAS[flags & 0x3f]!;
    }
    const version = flags >> 6;
    const origLength = base128();
    const transformada = etiqueta === 'glyf' || etiqueta === 'loca' ? version !== 3 : version !== 0;
    const largo = transformada ? base128() : origLength;
    entradas.push({ etiqueta, largo });
  }
  if (fichero.readUInt32BE(4) === 0x74746366) throw new Error('colección de fuentes (ttcf): este lector no las abre');
  const datos = brotliDecompressSync(fichero.subarray(p, p + totalCompressedSize));
  const tablas = new Map<string, Buffer>();
  let desde = 0;
  for (const { etiqueta, largo } of entradas) {
    tablas.set(etiqueta, datos.subarray(desde, desde + largo));
    desde += largo;
  }
  if (desde !== datos.length) throw new Error(`las tablas suman ${desde} bytes y el bloque descomprimido tiene ${datos.length}`);
  return tablas;
}

/** Los códigos que la cmap lleva a un glifo distinto del 0, de su subtabla Unicode de Windows (3,10 o 3,1) o, si no hay, de la Unicode (0,x). */
export function codigosDeCmap(cmap: Buffer): Set<number> {
  const numTables = cmap.readUInt16BE(2);
  const registros = Array.from({ length: numTables }, (_, i) => ({
    plataforma: cmap.readUInt16BE(4 + i * 8),
    codificacion: cmap.readUInt16BE(6 + i * 8),
    desplazamiento: cmap.readUInt32BE(8 + i * 8),
  }));
  const preferencia = (r: (typeof registros)[number]): number =>
    r.plataforma === 3 && r.codificacion === 10 ? 0 : r.plataforma === 3 && r.codificacion === 1 ? 1 : r.plataforma === 0 && r.codificacion !== 5 ? 2 : 9;
  const elegido = registros.filter((r) => preferencia(r) < 9).sort((a, b) => preferencia(a) - preferencia(b))[0];
  if (elegido === undefined) throw new Error('la cmap no tiene subtabla Unicode');
  const s = elegido.desplazamiento;
  const formato = cmap.readUInt16BE(s);
  const codigos = new Set<number>();
  if (formato === 4) {
    const segmentos = cmap.readUInt16BE(s + 6) / 2;
    const fin = s + 14;
    const inicio = fin + segmentos * 2 + 2;
    const delta = inicio + segmentos * 2;
    const rango = delta + segmentos * 2;
    for (let i = 0; i < segmentos; i++) {
      const desde = cmap.readUInt16BE(inicio + i * 2);
      const hasta = cmap.readUInt16BE(fin + i * 2);
      const d = cmap.readInt16BE(delta + i * 2);
      const ro = cmap.readUInt16BE(rango + i * 2);
      for (let c = desde; c <= hasta && c !== 0xffff; c++) {
        let glifo: number;
        if (ro === 0) glifo = (c + d) & 0xffff;
        else {
          const g = cmap.readUInt16BE(rango + i * 2 + ro + (c - desde) * 2);
          glifo = g === 0 ? 0 : (g + d) & 0xffff;
        }
        if (glifo !== 0) codigos.add(c);
      }
    }
  } else if (formato === 12) {
    const grupos = cmap.readUInt32BE(s + 12);
    for (let i = 0; i < grupos; i++) {
      const g = s + 16 + i * 12;
      const desde = cmap.readUInt32BE(g);
      const hasta = cmap.readUInt32BE(g + 4);
      const primero = cmap.readUInt32BE(g + 8);
      for (let c = desde; c <= hasta; c++) if (primero + (c - desde) !== 0) codigos.add(c);
    }
  } else {
    throw new Error(`subtabla cmap de formato ${formato}: este lector solo lee los formatos 4 y 12`);
  }
  return codigos;
}
