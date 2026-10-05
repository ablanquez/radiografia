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
 *
 * Desde el 9.3 (las caras del PDF de «Descargar informe», en WOFF 1.0: con
 * WOFF2 no las incrusta pdfkit), también las tablas de un WOFF 1.0, y de una
 * fuente, sus nombres, su peso y si es itálica: lo que el juez de las fuentes
 * compara entre la cara del PDF y la de la web, y el del PDF entre los nombres
 * del PDF y las caras.
 * [DOC] https://www.w3.org/TR/WOFF/ — cabecera de 44 bytes (signature
 *    0x774F4646 «wOFF», flavor, length, numTables UInt16, reserved,
 *    totalSfntSize, majorVersion, minorVersion, metaOffset, metaLength,
 *    metaOrigLength, privOffset, privLength); cada TableDirectoryEntry, de 20
 *    bytes: tag, offset, compLength, origLength y origChecksum; «If
 *    compLength is less than origLength, the data is compressed […] using
 *    the "compress2" function of zlib», y si son iguales, va sin comprimir.
 * [DOC] https://learn.microsoft.com/en-us/typography/opentype/spec/name —
 *    version, count, storageOffset y NameRecord (platformID, encodingID,
 *    languageID, nameID, length, stringOffset); Windows (3) en UTF-16BE.
 *    nameID 1 la familia, 2 el estilo, 6 el nombre PostScript, 16 la
 *    familia tipográfica.
 * [DOC] https://learn.microsoft.com/en-us/typography/opentype/spec/os2 —
 *    usWeightClass (UInt16 en el byte 4) y fsSelection (UInt16 en el byte
 *    62; el bit 0, ITALIC).
 */
import { brotliDecompressSync, inflateSync } from 'node:zlib';

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

/** Las tablas de un WOFF 1.0, descomprimidas (desde el 9.3). */
export function tablasDeWoff(fichero: Buffer): Map<string, Buffer> {
  if (fichero.readUInt32BE(0) !== 0x774f4646) throw new Error('no es un WOFF 1.0: la firma no es «wOFF»');
  const numTables = fichero.readUInt16BE(12);
  const tablas = new Map<string, Buffer>();
  for (let i = 0; i < numTables; i++) {
    const e = 44 + i * 20;
    const etiqueta = fichero.toString('latin1', e, e + 4);
    const [desde, comprimida, original] = [fichero.readUInt32BE(e + 4), fichero.readUInt32BE(e + 8), fichero.readUInt32BE(e + 12)];
    const datos = fichero.subarray(desde, desde + comprimida);
    const tabla = comprimida < original ? inflateSync(datos) : datos;
    if (tabla.length !== original) throw new Error(`la tabla ${etiqueta} mide ${tabla.length} bytes y el directorio dice ${original}`);
    tablas.set(etiqueta, tabla);
  }
  return tablas;
}

/** Los nombres de la tabla name, por nameID, de sus registros de Windows (3) en inglés de EE. UU. (0x409), en UTF-16BE. */
export function nombresDe(name: Buffer): Map<number, string> {
  const count = name.readUInt16BE(2);
  const almacen = name.readUInt16BE(4);
  const nombres = new Map<number, string>();
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12;
    const [plataforma, , idioma, id, largo, desde] = [0, 2, 4, 6, 8, 10].map((k) => name.readUInt16BE(r + k)) as [number, number, number, number, number, number];
    if (plataforma !== 3 || idioma !== 0x409) continue;
    const bytes = Buffer.from(name.subarray(almacen + desde, almacen + desde + largo));
    nombres.set(id, bytes.swap16().toString('utf16le'));
  }
  return nombres;
}

/** La cara de una fuente: su nombre PostScript (name 6), su familia (la tipográfica, name 16, o la de name 1), su peso (OS/2) y si es itálica (OS/2 fsSelection, bit 0). */
export function caraDe(tablas: Map<string, Buffer>): { postscript: string; familia: string; peso: number; italica: boolean; variable: boolean } {
  const nombres = nombresDe(tablas.get('name')!);
  const os2 = tablas.get('OS/2')!;
  return {
    postscript: nombres.get(6) ?? '',
    familia: nombres.get(16) ?? nombres.get(1) ?? '',
    peso: os2.readUInt16BE(4),
    italica: (os2.readUInt16BE(62) & 1) === 1,
    variable: tablas.has('fvar'),
  };
}
