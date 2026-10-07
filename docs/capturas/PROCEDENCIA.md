# PROCEDENCIA — capturas del README

- **Obra**: cinco capturas de la web publicada, para el README (encargo
  11.4; decisión de Antonio del 06/10/2026).
- **De dónde**: <https://radiografia.antonioblanquez.es>, el 07/10/2026, con
  la publicación `97b6165` (de `main` `6f28a5f`).
- **Cómo**: con el Chrome de los jueces (`web/jueces/chrome.ts`), Chrome
  154.0.8037.93 sin ventana, por su protocolo de depuración:
  `Emulation.setDeviceMetricsOverride` y `Page.captureScreenshot`. En
  escritorio, 1280 × 900 a escala 1; en el móvil, 390 × 844 a escala 2.
- **Qué texto**: el de prueba de los jueces (`TEXTO_DE_COMBINACION_REAL`,
  en `web/jueces/apoyo.ts`, copia del de `motor/src/combinacion-real.spec.ts`,
  escrito para el encargo 5.4 con estilo de asistente y calcos de
  traducción), analizado con el género «Noticia» y los dos paquetes
  incluidos.
- **El informe**: la página 2 del PDF que descargó «Descargar informe» con
  ese análisis, pasada a PNG con PyMuPDF 1.27.2.3 (zoom 1,25).
- **Licencia**: la del repositorio (Apache-2.0). Lo que se ve es la propia
  web: sus textos, el icono propio (`docs/figma/icono/PROCEDENCIA.md`) y las
  fuentes Literata y Atkinson Hyperlegible Next (OFL 1.1,
  `THIRD-PARTY-NOTICES.md` § 2.4).

| fichero | qué | píxeles | bytes | sha256 |
|---|---|---|---|---|
| `analizador.png` | el analizador con el resultado, en escritorio | 1280 × 900 | 211.070 | `efd1b19015e7f6337052a851c98d24a7eb220d651f1fd5d000a598aa19e6c325` |
| `movil-resultado.png` | el resultado, en el móvil | 780 × 1688 | 137.864 | `0bbfbcd845770036937f8402ca6dbb33be3eb09817702251542b1f3b782a3ce5` |
| `movil-tarjeta.png` | la hoja de «Cierre de plantilla», en el móvil | 780 × 1688 | 176.226 | `30926a4f9ff7587ac79c944c7ec00a34358414ab9ef57817e9a570405625bdaa` |
| `ficha.png` | la ficha de `disc-cierre-de-plantilla` en el catálogo | 1280 × 900 | 97.246 | `08cf302be8b5babd5f559fdeddc3dedc13bfd68696c1ad8dc3e0f340a8f71120` |
| `informe.png` | la página 2 del PDF: el texto, con sus subrayados y sus siglas | 745 × 1053 | 152.103 | `edd4e3761b9f3a3eafd853f900e396ca9b6e4a79d079c61c5a8ca9b3e24aeba9` |

Son una foto del 07/10/2026: si la web cambia, no se regeneran solas.
