# Fuentes autoalojadas — ficha (encargo 10.4, Tanda 1)

Literata para el texto analizado y los textos largos; Atkinson Hyperlegible
Next para la interfaz (DISEÑO §5). Se sirven desde `web/public/fuentes/`,
recortadas, con su `OFL.txt` al lado. Nada de fonts.googleapis.com ni de
fonts.gstatic.com: el LG München I (20/01/2022, 3 O 17493/20) condenó la
carga dinámica desde los servidores de Google (informe del módulo, bloque 4).
Atribución y huellas también en `THIRD-PARTY-NOTICES.md` § 2.4.

## Origen

El repositorio de Google Fonts, en el commit
`9710da1eacb3be272583c3224dcb70f9da6eadbb` (30/09/2026), descargado el
04/10/2026 de `https://raw.githubusercontent.com/google/fonts/<commit>/ofl/…`.
Cada fichero coincide con el blob que lista GitHub en ese commit (`git
hash-object`).

| Fichero original | Versión (name 5) | Bytes | sha256 |
|---|---|---|---|
| `ofl/literata/Literata[opsz,wght].ttf` | Version 3.103;gftools[0.9.29] | 955.132 | `b41138c9373112f32abb589cc22e8674b06ed4048b0c513be922bdd26f274440` |
| `ofl/literata/Literata-Italic[opsz,wght].ttf` | Version 3.103;gftools[0.9.29] | 902.728 | `d483dfaeba9cbf4ce71d32a52ee65df82f7e35b15fff8d1011cdb242d1fcd465` |
| `ofl/atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext[wght].ttf` | Version 2.001 | 114.552 | `5a455d1cfa099b601ab70751bb9673e8fe1854dc4500c80e1a220d0d75e31745` |
| `ofl/literata/OFL.txt` | — | 4.389 | blob `9d3b4e3b1e9068fbda799f57833ff831d05cc271` |
| `ofl/atkinsonhyperlegiblenext/OFL.txt` | — | 4.431 | blob `88955733b80000358ef3e5521f3369b276e066a9` |

Ejes de los originales: Literata, `opsz` 7-72 (por defecto 12) y `wght`
200-900; Atkinson, `wght` 200-800. La itálica de Atkinson no se usa (el modelo
no la carga) y no se descargó para la web.

## Licencia y Reserved Font Name

- Las dos son **SIL Open Font License 1.1**. Copyright, tal cual en su
  `OFL.txt`: «Copyright 2017 The Literata Project Authors
  (https://github.com/googlefonts/literata)» y «Copyright 2020-2024 The
  Atkinson Hyperlegible Next Project Authors
  (https://github.com/googlefonts/atkinson-hyperlegible-next)».
- **Ninguna declara Reserved Font Name.** La OFL dice que un RFN es «any names
  specified as such after the copyright statement(s)»; ninguna de las dos
  líneas de copyright lleva esa cláusula, y las tres apariciones de
  «reserved» en cada `OFL.txt` son del texto general de la licencia.
- [DOC] https://openfontlicense.org/ofl-faq/ — 2.6: «Removing any parts of
  the font when delivering a webfont to a browser, including unused glyphs
  and smart font code, is considered modification»: lo de aquí es una
  versión modificada. 5.6: los RFN «are optional»; sin RFN, la versión
  modificada puede conservar el nombre. **No se renombra**: las familias
  siguen siendo «Literata» y «Atkinson Hyperlegible Next».
- 2.4: «Make sure the font file contains the needed copyright notice(s) and
  licensing information in its metadata». El recorte conserva la tabla
  `name` entera: copyright (0), licencia (13) y su URL (14), comprobados en
  los cuatro woff2.

## Qué se cambió

1. **Instancias** con `fonttools varLib.instancer`: Literata 400, 400
   itálica y 600 con el peso fijado y el eje óptico acotado a 12-20;
   Atkinson con el peso acotado a 400-700. `--update-name-table` deja los
   nombres de estilo al día con la tabla STAT (por ejemplo, «Literata 12pt
   SemiBold»; la familia tipográfica, name 16, sigue siendo «Literata»).
2. **Recorte** con `pyftsubset` a latin + latin-ext y los signos que usa la
   web: la lista, con sus bloques de Unicode, en
   [`subconjunto-unicode.txt`](subconjunto-unicode.txt). Un código que la
   fuente no tiene no añade nada.
3. **WOFF2** (Brotli), con la tabla `name` entera.

Nada más: ni contornos, ni métricas, ni rasgos OpenType (los que conserva
`pyftsubset` por defecto: calt, ccmp, clig, curs, dnom, frac, kern, liga,
locl, mark, mkmk, numr, rclt, rlig, rvrn y los que pide la escritura).

**Atkinson no tiene →, η ni ρ**, ni en el original (de griego solo trae Δ, Ω,
μ y π; comprobado con fontTools): esos signos caen en la fuente del sistema.
Literata los tiene todos.

## Herramienta

fontTools 4.66.1 (MIT, https://github.com/fonttools/fonttools) con brotli
1.2.0 (MIT), en un entorno de Python 3.14.3 fuera del repositorio. **No es
dependencia del proyecto**: los woff2 se generan una vez y se versionan; por
eso no tiene ficha en § 1 del NOTICES. Los comandos, desde la raíz del
repositorio, con los originales en `originales/`:

```
fonttools varLib.instancer --update-name-table "originales/Literata[opsz,wght].ttf" wght=400 opsz=12:20 -o literata-400.ttf
fonttools varLib.instancer --update-name-table "originales/Literata[opsz,wght].ttf" wght=600 opsz=12:20 -o literata-600.ttf
fonttools varLib.instancer --update-name-table "originales/Literata-Italic[opsz,wght].ttf" wght=400 opsz=12:20 -o literata-400-italica.ttf
fonttools varLib.instancer "originales/AtkinsonHyperlegibleNext[wght].ttf" wght=400:700 -o atkinson-hyperlegible-next.ttf
PYTHONUTF8=1 pyftsubset literata-400.ttf --unicodes-file=docs/figma/subconjunto-unicode.txt --flavor=woff2 --name-IDs='*' --name-languages='*' --output-file=web/public/fuentes/literata/literata-400.woff2
(y lo mismo para las otras tres caras)
```

`PYTHONUTF8=1`: sin el modo UTF-8, `pyftsubset` lee la lista con la
codificación de Windows (cp1252) y se para en las tildes de los comentarios
(visto el 04/10).

- [DOC] https://fonttools.readthedocs.io/en/latest/subset/index.html —
  `--unicodes-file`: «Anything after a '#' on any line in the file is
  ignored as comments»; `--flavor`: «May be 'woff' or 'woff2'»; por defecto
  «only nameIDs between 0 and 6 are preserved» y «only records with langID
  0x0409 (English)»: por eso `--name-IDs='*'` y `--name-languages='*'`.
- [DOC] https://fonttools.readthedocs.io/en/latest/varLib/instancer.html —
  `wght=400:700` restringe un eje a un rango; `wdth=85` lo fija. La página no
  dice si acotar un rango deja intactos los contornos dentro de él: se midió
  (abajo).

## Variable o estáticas: las cifras (woff2, mismo recorte)

| Opción | Bytes |
|---|---|
| Literata variable entera (opsz 7-72, wght 200-900) | 158.652 |
| Literata variable, wght 400-600, opsz 7-72 | 108.676 |
| Literata 400, opsz 7-72 | 66.612 |
| Literata 600, opsz 7-72 | 72.148 |
| Literata 400 itálica, opsz 7-72 | 68.804 |
| **Literata 400, opsz 12-20** | **43.696** |
| **Literata 600, opsz 12-20** | **46.424** |
| **Literata 400 itálica, opsz 12-20** | **44.212** |
| Literata 400, opsz fijo en 18 | 30.412 |
| Atkinson variable entera (wght 200-800) | 42.844 |
| **Atkinson variable, wght 400-700** | **25.920** |
| Atkinson 400 + 700 estáticas | 15.132 + 15.896 = 31.028 |

Decisión:

- **Atkinson, variable 400-700**: un fichero con las dos caras que usa la
  interfaz (400 y 700), más ligero que las dos estáticas juntas.
- **Literata, tres estáticas** con el eje óptico acotado a 12-20:
  - el navegador solo baja una cara cuando algo la pide; una variable
    400-600 obligaría a bajar el rango entero en cada visita;
  - el eje óptico se queda porque el DISEÑO lo nombra y el modelo lo usaba
    (`font-optical-sizing` automático: opsz igual al tamaño en px). Se acota
    a los tamaños en que la web usa Literata: de 14,67 px (11 pt en papel) a
    18 px (cuerpo); 12-20 los cubre con margen y pesa un 35 % menos que el
    eje entero;
  - fijar opsz en 18 pesaría menos, pero cambiaría las letras a 15 px y en
    papel.
- **¿Cambia algo acotar el eje?** Medido glifo a glifo con fontTools: la
  instancia en 12, 14,67, 15, 18 y 20 sacada de la fuente entera frente a la
  sacada de la acotada. Los avances difieren como mucho en 1 unidad de 1.000
  y los contornos en 2,35 unidades (0,04 px a 18 px): redondeos, no se ven.
- **La 600 se queda**: en el prototipo, el informe pide negrita en Literata
  (26 elementos a 700, como el nombre de cada regla) y el navegador usa esa
  cara. Ninguna otra pantalla la carga.

Primera visita al analizador: Atkinson + Literata 400 + Literata 400
itálica, 113.828 bytes. Las cuatro caras en disco: 160.252 bytes.

## Cómo se sirven

- `web/src/estilos/fuentes.css`: un `@font-face` por cara, `font-display:
  swap` en Atkinson (la interfaz) y `fallback` en Literata (el texto, para
  que no salte tarde), y la pila de reserva del sistema en `tokens.json`
  (Literata, Georgia, serif; Atkinson Hyperlegible Next, system-ui,
  sans-serif).
- `web/src/componentes/Recursos.astro`: precarga de Atkinson y Literata 400,
  con `crossorigin` (sin él, la precarga no se reutiliza y la cara se pide
  dos veces: el juez de red lo comprueba).
- **Las `url()` son absolutas** (`/fuentes/…`), como pide Vite para lo de
  `public/`, y no relativas como sugería el encargo:
  - Astro incrusta este CSS en cada página, y una URL relativa se rompería en
    `/reglas/<id>/`;
  - con una base distinta de «/», la ruta la reescribe Vite al construir.
    Comprobado el 04/10 con `astro build --base /sub/`: las cuatro `url()`
    salen como `/sub/fuentes/…`. La guía de Vite dice que las `url()` del CSS
    respetan `base`, pero no dice si eso incluye lo de `public/`; por eso se
    probó.
