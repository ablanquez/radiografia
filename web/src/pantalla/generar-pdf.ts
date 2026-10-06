/**
 * Genera y descarga el PDF de «Descargar informe» (encargo 9.3; decisión de
 * Antonio del 05/10, firmada en la parada previa). Este módulo, con pdfmake y
 * la definición del documento (informe-pdf.ts), es un trozo aparte del JS de
 * la página: lo importa descarga.ts al pulsar, con import(), y Vite lo deja en
 * su propio fichero (la página no engorda). Las cinco caras del PDF (WOFF 1.0:
 * docs/figma/fuentes.md, «Para el PDF») se piden al mismo origen al pulsar,
 * una vez por visita, y se registran en el sistema de ficheros virtual de
 * pdfmake. Nada sale del navegador: pdfmake no pide nada por URL (la política
 * de URL lo niega todo) y el PDF se descarga desde un blob.
 *
 * [DOC] https://pdfmake.github.io/docs/0.3/fonts/custom-fonts-client-side/vfs/ —
 *    addVirtualFileSystem con los ficheros en base64, y las cuatro variantes
 *    de cada familia: «You should define all 4 components (even if they all
 *    point to the same font file)».
 * [DOC] https://pdfmake.github.io/docs/0.3/getting-started/client-side/methods/ —
 *    download(filename); y setUrlAccessPolicy: «to define a custom security
 *    policy for external URLs before they are downloaded».
 * [DOC] https://vite.dev/guide/features#dynamic-import — un import() dinámico
 *    va a su propio trozo.
 * Descarga en iOS: en el visor del sistema, y desde ahí se guarda (visto por
 *    Antonio el 05/10 en su iPhone y su iPad con la página de prueba: los
 *    tres caminos se comportan igual); lo dice docs/WEB.md («Informe»).
 */
import pdfMake from 'pdfmake/build/pdfmake';
import { definicionDelInforme, FUENTES_DEL_PDF } from './informe-pdf.ts';
import type { InformeEnDatos } from './modelo-informe.ts';

/** El nombre del fichero que se descarga. */
export const NOMBRE_DEL_PDF = 'RadiografIA.pdf';

/** Unos bytes en base64, a trozos (String.fromCharCode no admite cientos de miles de argumentos). */
function enBase64(bytes: Uint8Array): string {
  let binario = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binario);
}

/** Las caras, pedidas y registradas una vez por visita. */
let fuentes: Promise<void> | null = null;
function prepararFuentes(raiz: string): Promise<void> {
  fuentes ??= (async () => {
    const rutas = [...new Set(Object.values(FUENTES_DEL_PDF).flatMap((f) => Object.values(f)))];
    const vfs: Record<string, string> = {};
    await Promise.all(
      rutas.map(async (ruta) => {
        const respuesta = await fetch(`${raiz}fuentes/${ruta}`);
        if (!respuesta.ok) throw new Error(`${ruta}: ${respuesta.status}`);
        vfs[ruta] = enBase64(new Uint8Array(await respuesta.arrayBuffer()));
      }),
    );
    pdfMake.addVirtualFileSystem(vfs);
    pdfMake.setFonts(FUENTES_DEL_PDF);
    pdfMake.setUrlAccessPolicy(() => false);
  })().catch((fallo: unknown) => {
    fuentes = null;
    throw fallo;
  });
  return fuentes;
}

/** Genera el PDF del informe y lo descarga como RadiografIA.pdf; `raiz`, la de la web con su barra final (las fuentes, en raiz + fuentes/). */
export async function descargarElInforme(informe: InformeEnDatos, raiz: string): Promise<void> {
  await prepararFuentes(raiz);
  await pdfMake.createPdf(definicionDelInforme(informe)).download(NOMBRE_DEL_PDF);
}
