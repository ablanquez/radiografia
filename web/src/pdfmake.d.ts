/**
 * Los tipos de lo que usa el PDF de «Descargar informe» de pdfmake 0.3.11
 * (encargo 9.3), que no trae los suyos: su build para navegador
 * (build/pdfmake.js, el campo «browser» de su package.json) exporta la
 * instancia de pdfmake. Solo los métodos que se llaman, con la firma de su
 * código (src/base.js y src/browser-extensions/): sin @types/pdfmake, que sería
 * una dependencia más para cinco líneas.
 *
 * [DOC] https://pdfmake.github.io/docs/0.3/getting-started/client-side/methods/ —
 *    createPdf(docDefinition) y, del documento, download(filename) y getBlob();
 *    setUrlAccessPolicy(callback), «to define a custom security policy for
 *    external URLs before they are downloaded».
 * [DOC] https://pdfmake.github.io/docs/0.3/fonts/custom-fonts-client-side/vfs/ —
 *    addVirtualFileSystem(vfs) con los ficheros en base64, y las fuentes con
 *    sus cuatro variantes: «normal, bold, italics and bolditalics».
 * [DOC] https://pdfmake.github.io/docs/0.3/migration-from-0.1/ — «All methods
 *    return promise instead of using callback».
 */
declare module 'pdfmake/build/pdfmake' {
  interface DocumentoDePdfMake {
    download(nombre?: string): Promise<void>;
    getBlob(): Promise<Blob>;
  }
  interface PdfMake {
    addVirtualFileSystem(vfs: Readonly<Record<string, string>>): void;
    setFonts(fuentes: Readonly<Record<string, { normal: string; bold: string; italics: string; bolditalics: string }>>): void;
    setUrlAccessPolicy(politica: (url: string) => boolean): void;
    createPdf(definicion: object): DocumentoDePdfMake;
  }
  const pdfMake: PdfMake;
  export default pdfMake;
}
