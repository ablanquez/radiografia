# PROCEDENCIA — icono de RadiografIA

- **Obra**: icono «documento en negativo» de RadiografIA, dos variantes:
  `icono-a.svg` (favicon, manifiesto, apple-touch) e `icono-c.svg`
  (cabecera y portada).
- **Concepto y encargo**: Antonio Blánquez, 29/09/2026 (identidad del
  proyecto) y `DISEÑO-RADIOGRAFIA.md` §8 (03/10/2026).
- **Dibujo**: generado en Figma Make (modelo Claude Opus 5.5) el
  04/10/2026 a partir del prompt 8 de `docs/figma/prompts.md`, con las
  especificaciones de forma, color y zona segura escritas por Antonio y
  la estrategia; tres variantes propuestas, elegidas (a) y (c) por Antonio
  el 04/10/2026; la (b) descartada por fundirse en fondo oscuro.
- **Formato**: SVG limpio (sin ids ni atributos de editor), viewBox
  0 0 512 512, formas planas, sin texto; todo el dibujo dentro del círculo
  central de 409 px (zona segura maskable, Evil Martians 2026).
- **Colores**: #1A1A1A, #FFFFFF, #332288 (acento), #D55E00 (Sintaxis),
  tokens del DISEÑO.
- **Licencia**: la del repositorio (Apache-2.0), como el resto del proyecto;
  sin material de terceros.
- **Derivados** (calco, punto 10.4, Tanda 1, 04/10/2026): en `web/public/`,
  generados por `web/scripts/iconos.ts`, que rasteriza los SVG con Chrome
  headless (CDP: `Page.captureScreenshot` y un canvas) y escribe el `.ico`
  a mano, en el formato que documenta Microsoft (ICONDIR, ICONDIRENTRY e
  imagen DIB de 32 bits con su máscara AND). «A sangre» es el icono (a) sin
  el radio de 96 de su cuadrado: el fondo #1A1A1A llega al borde, y el
  dibujo sigue dentro del círculo de 409.

| fichero | de | tamaño | bytes | sha256 |
|---|---|---|---|---|
| `icon.svg` | `icono-a.svg`, tal cual | vectorial | 349 | `20c2580b9ccbde1d6b0c1bb2453632e2aacbcac2d2b6af61e8a45bd6eac9e89c` |
| `icono-c.svg` | `icono-c.svg`, tal cual (cabecera) | vectorial | 344 | `42bfa7d0d05c5b03637e906c69ede99c72fd3d91aec46c5037c82c6282a7dc35` |
| `favicon.ico` | `icono-a.svg` | 32 × 32 | 4.286 | `898034f7e1c7fdbc0a48c48e0e71827347440761cc6b432c90ec6fe831a1d535` |
| `apple-touch-icon.png` | `icono-a.svg` a sangre | 180 × 180 | 950 | `9fa8713d3bc20c57d6fc17dad9ded495d7839f4e2e517d28e0c0127db520ad09` |
| `icon-192.png` | `icono-a.svg` | 192 × 192 | 2.423 | `019801ea8a377efeb47d8eccc2e281a262dfcdecbd5890dbfea1bbadb43196ad` |
| `icon-512.png` | `icono-a.svg` | 512 × 512 | 6.546 | `4aee61da624c43d3347c8e15e95dc0e10f375450e968ea3d734901067d7d2110` |
| `icon-512-maskable.png` | `icono-a.svg` a sangre | 512 × 512 | 2.260 | `da72c20a52cc8397a58d98583cd11c83ea842ff85df9d8fa76c9b110743a0513` |

  Las huellas de los PNG y del `.ico` dependen de cómo rasterice Chrome:
  si se regeneran con otra versión, pueden cambiar sin que cambie el dibujo.
  Las vigila `web/jueces/iconos.spec.ts` contra los ficheros.
