# Doctrina de diseño para RadiografIA: base de fuentes (docs/investigacion/informes/diseno-modulo.md)

Con ocho categorías marcadas solo por el tono, RadiografIA incumpliría WCAG 2.2: el color nunca puede ser el único medio visual (1.4.1, nivel A). Cada tramo subrayado necesita un color con al menos 3:1 sobre blanco (1.4.11, AA). También necesita una segunda señal que no dependa del tono: una sigla o un estilo de línea. Okabe-Ito no sirve tal cual: tres de sus ocho colores no llegan a 3:1. Paul Tol «bright» y «vibrant» tienen solo 7 colores. Ninguna paleta cualitativa de ColorBrewer es apta para daltonismo con 8 clases. La paleta de 8 que se propone abajo cumple 3:1 en todos sus colores. Las cifras están calculadas con la fórmula WCAG y se muestra el cálculo. Nada de esto sustituye la doble codificación.

## TL;DR

- **Color + forma, siempre.** Cada categoría lleva un color de subrayado de ≥3:1 sobre #FFFFFF (1.4.11) y una sigla visible o un estilo de línea propio (1.4.1). Las siglas y los textos de las tarjetas van en tinta oscura, no en el color de la categoría. De los 8 colores propuestos, solo 4 llegan a 4,5:1 para texto normal (1.4.3).
- **Lectura y tipografía.** La evidencia empírica (Dyson y Haselgrove, Universidad de Reading, *International Journal of Human-Computer Studies* 54(4):585–612, 2001; Dyson 2004) favorece unos 55 caracteres por línea para comprender mejor. Las guías de diseñador piden entre 45 y 90 (Butterick) o entre 45 y 75, con 66 como ideal (Bringhurst, citado de fuentes secundarias). Butterick fija para web un cuerpo de 15–25 px y un interlineado del 120–145 %. Serif para el texto analizado y sans para la interfaz es convención, no evidencia. Literata (OFL, 200–900) y Atkinson Hyperlegible Next (OFL, 200–800) son candidatas verificadas. Las fuentes se autoalojan: el LG München I (3 O 17493/20) condenó la carga dinámica desde servidores de Google.
- **Entrega.** En móvil, la hoja inferior es un diálogo modal: foco dentro, Escape cierra y el foco vuelve al tramo. El asa debe ser un botón con etiqueta y tener una alternativa a arrastrar (Material 3; WCAG 2.5.7). Los tokens siguen DTCG 2025.10, la primera versión estable, del 28/10/2025. Según «How to Favicon in 2026» de Andrey Sitnik (Evil Martians, 21/01/2026), el favicon son «five icons and one JSON file»: favicon.ico de 32×32, icon.svg, apple-touch-icon.png de 180×180 y un manifiesto con iconos de 192, 512 enmascarable y 512. La impresión usa `@media print`, oculta la navegación y muestra las URL con contenido generado (Smashing). Quedan huecos sin fuente abierta leída: Hemingway, LanguageTool, Apple HIG, GOV.UK, el carrusel APG, la escala modular y el brief para herramientas generativas.

## Key Findings

1. **Okabe-Ito sobre blanco** (cálculo propio con la fórmula WCAG): pasan 3:1 #009E73 (3,42), #0072B2 (5,19), #D55E00 (3,87), #CC79A7 (3,06) y #000000 (21). Fallan #E69F00 (2,25), #56B4E9 (2,31) y #F0E442 (1,32).
2. **Paul Tol muted** (9 colores): pasan 6 de 9. **Bright** pasa 3 de 7 y **vibrant** 4 de 7. **Light** no pasa ninguno: Tol lo destina a rellenar celdas con texto.\[1\]
3. **Carbon (IBM), paleta categórica de 14 colores:** según mi cálculo, los 14 superan 3:1 sobre blanco. Pero Carbon no declara que sea apta para daltonismo. En la incidencia #1244 de carbon-design-system/carbon-charts, quien la abrió transmitió la queja de un usuario daltónico: «Purple 70» (6929c4) y «Cyan 50» (1192e8) «were indistinguishable» cuando solo se mostraban dos categorías seguidas. El mantenedor respondió que el equipo «can't guarantee that the sequence will be kept» y propuso «a high-contrast option… (e.g pattern fills for the graphs)».
4. **ColorBrewer:** ninguna paleta cualitativa es apta para daltonismo con 8 clases. El máximo es 4 clases, y solo con «Paired».\[2\]\[3\]
5. **Tamaño de objetivo:** 2.5.8 exime a los objetivos «en una frase» (excepción *Inline*).\[4\] Por eso los tramos subrayados no necesitan medir 24×24 px. La lista de tarjetas sirve además como control *Equivalent*.\[4\]
6. **Hoja inferior (Material 3):** los 48 dp superiores son interactivos. El asa recibe el foco, Espacio o Intro alternan las alturas y su rol es «button». Toda acción de arrastre necesita una alternativa con un solo puntero.\[5\]

---

## Bloque 1. Accesibilidad (WCAG 2.2, AA)

### Norma

La versión vigente es WCAG 2.2, Recomendación W3C del 12 de diciembre de 2024 (https://www.w3.org/TR/WCAG22/). \[6\] Textos de los criterios (en inglés, como en la norma):

| Criterio | Nivel | Texto normativo (resumen literal) | Fuente |
|---|---|---|---|
| 1.4.1 Use of Color | A | «Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.» | https://www.w3.org/WAI/WCAG22/Understanding/use-of-color y https://w3c.github.io/wcag21/understanding/use-of-color.html |
| 1.4.3 Contrast (Minimum) | AA | Texto e imágenes de texto ≥4.5:1; texto grande ≥3:1; excepciones: texto incidental y logotipos. | https://www.w3.org/TR/WCAG22/#contrast-minimum |
| 1.4.11 Non-text Contrast | AA | «The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s)»: componentes de interfaz y «Graphical Objects: Parts of graphics required to understand the content». | https://www.w3.org/TR/WCAG22/ y https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html |
| 1.4.10 Reflow | AA | Sin pérdida de información ni scroll bidimensional a un ancho equivalente a 320 CSS px (contenido de scroll vertical). | https://www.w3.org/TR/WCAG22/#reflow |
| 1.4.12 Text Spacing | AA | Sin pérdida de contenido al fijar el interlineado en 1,5× el tamaño, el espacio tras párrafo en 2×, el interletrado en 0,12× y el espacio entre palabras en 0,16×. | https://www.w3.org/TR/WCAG22/#text-spacing |
| 1.4.13 Content on Hover or Focus | AA | El contenido que aparece al pasar el puntero o al recibir el foco (tooltips) debe poder descartarse, poder recorrerse con el puntero y mantenerse visible. | https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus |
| 2.4.7 Focus Visible | AA | Todo interfaz operable por teclado tiene un modo en que el indicador de foco es visible. | https://www.w3.org/TR/WCAG22/#focus-visible |
| 2.4.11 Focus Not Obscured (Minimum) | AA | El componente con foco no queda totalmente oculto por contenido del autor. Atención a la hoja inferior y a las barras fijas. | https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum |
| 2.4.13 Focus Appearance | AAA | Indicador con área ≥ un perímetro de 2 CSS px y contraste ≥3:1 entre los estados con y sin foco. | https://www.w3.org/TR/WCAG22/#focus-appearance |
| 2.5.5 Target Size (Enhanced) | AAA | Objetivo ≥44×44 CSS px, con excepciones. | https://www.w3.org/TR/WCAG22/#target-size-enhanced |
| 2.5.7 Dragging Movements | AA | Toda función que se opere arrastrando debe poder hacerse con un solo puntero sin arrastrar. | https://www.w3.org/TR/WCAG22/#dragging-movements |
| 2.5.8 Target Size (Minimum) | AA | «The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when:» Spacing / Equivalent / Inline / User Agent Control / Essential.\[4\] | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html |
| 3.3.1 Error Identification | A | Un error detectado automáticamente se identifica y se describe en texto. | https://www.w3.org/TR/WCAG22/#error-identification |
| 3.3.2 Labels or Instructions | A | Hay etiquetas o instrucciones cuando se pide entrada. | https://www.w3.org/TR/WCAG22/#labels-or-instructions |
| 3.3.3 Error Suggestion | AA | Si se conocen correcciones, se sugieren. | https://www.w3.org/TR/WCAG22/#error-suggestion |
| 3.3.5 Help | AAA | Ayuda contextual disponible. | https://www.w3.org/TR/WCAG22/#help |

Detalles leídos en los documentos «Understanding»:

- Según «Understanding 2.5.8», el autor no puede cumplir el criterio contando con que el usuario amplíe la página: «The requirement is independent of the zoom factor of the page» (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). \[4\]
- La excepción *Inline* existe porque el reflujo del texto hace imposible prever dónde quedan los enlaces.\[4\] El mismo documento añade: «It is more important to set the line height to a value that improves readability» (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). \[4\]
- La misma página recomienda la meta más estricta de 2.5.5 para los controles importantes (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). \[4\]
- «Understanding 1.4.11» deja fuera de 1.4.11 el cambio de **solo** color de un objeto, que cubre 1.4.1 (https://w3c.github.io/wcag21/understanding/non-text-contrast.html). \[7\]
- Ese mismo documento no exige un borde visible del área pulsable si el control ya se identifica por otra vía (https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html). \[8\]
- Técnicas suficientes de 1.4.1: «Including a text cue whenever color cues are used» y, para imágenes, «G111: Using color and pattern» (https://w3c.github.io/wcag21/understanding/use-of-color.html; https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-without-color.html). \[9\]\[10\]

**Cómo cumplir 1.4.1 con ocho categorías** (aplicación de las técnicas citadas al caso de RadiografIA; es inferencia, no texto de la norma):

1. **Texto.** Cada tarjeta y cada ficha nombra la categoría en palabras (técnica «text cue»).
2. **Sigla.** Una sigla de 2–3 letras en tinta oscura, junto al tramo o en el margen. Esto equivale a la técnica de color + patrón.
3. **Estilo de línea.** Se reparten estilos distintos de subrayado (continuo, doble, punteado, discontinuo, ondulado), combinados con dos grosores. Así se distinguen ocho categorías sin tono. Las propiedades CSS `text-decoration-style`, `text-decoration-thickness` y `text-underline-offset` existen, pero su documentación MDN no se leyó en esta investigación (ver HUECOS).
4. **Contraste.** Cada color de subrayado debe tener ≥3:1 frente al fondo adyacente (1.4.11, objeto gráfico necesario para entender el contenido). Considerar el subrayado como «graphical object» es interpretación propia.

**Patrón ARIA para un tramo subrayado que se puede tocar** (inferencia a partir de la norma y del APG leído; no hay fuente que lo prescriba para editores):

- El tramo es interactivo, así que necesita nombre, rol y estado (4.1.2, https://www.w3.org/TR/WCAG22/#name-role-value). El rol natural es `button`, porque abre una tarjeta o un diálogo y no navega.
- `<mark>` aporta la semántica de «resaltado», pero no es interactivo por sí mismo. La opción propuesta es `<mark>` dentro de un `<button>` con nombre accesible. Ejemplo: «Pasiva refleja: "se dice"». Esta propuesta no está verificada con lectores de pantalla (HUECO).
- `aria-describedby` puede apuntar al texto de la regla.
- El tooltip del APG es solo descriptivo y, según la versión 1.2, «work in progress». Se cierra con Escape. El contenido con elementos enfocables debe ir en un diálogo no modal (https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/; https://wai-aria-practices.netlify.app/aria-practices/). \[11\]\[12\]
- Por tanto, la explicación de una regla con botones («Ver ficha», «Siguiente») va en un **diálogo**, no en un tooltip.

**Diálogo modal (APG 1.2):**

- Al abrirse, el foco pasa a un elemento del diálogo.\[11\]\[12\]
- Tab y Mayús+Tab circulan dentro del diálogo y Escape lo cierra.\[12\]\[13\]
- Al cerrarse, el foco vuelve al elemento que lo invocó.\[12\]
- `aria-modal="true"` sustituye a `aria-hidden` sobre el fondo. Solo debe usarse si el diálogo se comporta de verdad como modal.\[13\]

Fuente: https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/ y https://wai-aria-practices.netlify.app/aria-practices/.

### Evidencia
No se encontró en fuente abierta ningún estudio empírico sobre subrayados por categorías en editores (HUECO).

### Convención
- Pearson resume así 1.4.11: «Ensure that all active controls, form fields, graphs, charts, and other informational non-text elements have a minimum 3:1 contrast ratio» (https://www.pearson.com/accessibility-guidelines/perceivable-principle/non-text-contrast.html). \[14\]
- Cómo resuelven el subrayado Hemingway y LanguageTool: NO CONSTA (no se leyó ninguna fuente abierta; ver HUECOS).

---

## Bloque 2. Legibilidad de texto largo en pantalla

### Evidencia
- **Dyson y Haselgrove (2001)**, Departamento de Tipografía y Comunicación Gráfica de la Universidad de Reading, *International Journal of Human-Computer Studies* 54(4):585–612, DOI 10.1006/ijhc.2001.0458. «A medium line length (55 characters per line) appears to support effective reading at normal and fast speeds. This produced the highest level of comprehension and was also read faster than short lines.» (https://www.sciencedirect.com/science/article/abs/pii/S1071581901904586)
- **Dyson (2004)**, revisión crítica en *Behaviour & Information Technology* 23(6):377–393. La revisión «identifies the number of characters per line as the critical variable in looking at line length» (https://www.semanticscholar.org/paper/How-physical-text-layout-affects-reading-from-Dyson/651935632433e354c41de19a878d6fe65e675233; PDF: https://stu.westga.edu/~ssynan1/literacy/Dyson.pdf). \[15\]
- La misma revisión recoge que **las líneas más largas (unos 100 cpl) pueden leerse más rápido**, mientras que 55 cpl dan mejor comprensión (https://stu.westga.edu/~ssynan1/literacy/Dyson.pdf). \[16\] En un analizador cuyo fin es releer con atención, manda la comprensión.

### Convención (opinión de diseñador)
- **Butterick:** «Aim for an average line length of 45–90 characters, including spaces» (https://practicaltypography.com/line-length.html). \[17\]
- Butterick también recomienda un cuerpo de «15–25 pixels» en web y de «10–12 point» en impreso, con un interlineado de «120–145%» (https://practicaltypography.com/typography-in-ten-minutes.html; https://practicaltypography.com/summary-of-key-rules.html). \[18\]\[19\]
- Butterick desaconseja la unidad `ch` como medida del ancho de línea: «the zero's width is not a useful proxy». Propone `max-width` en el contenedor (https://practicaltypography.com/responsive-web-design.html). \[20\]
- **Bringhurst:** de 45 a 75 caracteres, con 66 como ideal. Este dato procede de resúmenes secundarios, no del libro (https://optimwise.com/review-the-elements-of-typographic-style-by-robert-bringhurst/; https://mitchellkember.com/books/bringhurst). \[21\]\[22\]
- **Serif para el texto analizado y sans para la interfaz:** es **convención**. No se encontró evidencia empírica abierta que lo respalde (HUECO).
- **Escala modular y número de tamaños:** NO CONSTA en fuente leída (HUECO). La propuesta propia es de 4 tamaños: cuerpo, secundario, título de tarjeta y título de pantalla.

**Decisión derivada:** columna de texto analizado de unos 60–66 caracteres (`max-width` en `em` calibrado con la fuente real), cuerpo de 18–20 px e interlineado de 1,5. El 1,5 queda dentro del rango de Butterick por arriba y coincide con el umbral de 1.4.12. Además deja aire para los subrayados de 2–3 px con desplazamiento.

---

## Bloque 3. Paletas para ocho categorías

### Norma: fórmula de contraste WCAG

- La razón de contraste es (L1 + 0,05) / (L2 + 0,05), con L1 la luminancia relativa más clara (https://www.w3.org/WAI/GL/wiki/Contrast_ratio; definición en https://www.w3.org/TR/WCAG22/#dfn-relative-luminance). \[23\]
- Luminancia relativa: L = 0,2126·R + 0,7152·G + 0,0722·B.\[24\] Cada canal sRGB se linealiza así: si c ≤ 0,04045, entonces c/12,92; si no, ((c+0,055)/1,055)^2,4.
- El umbral de linealización solo afecta a los valores de canal entre 0 y 10. En esta paleta solo aparecen en #570408 y #012749 (Carbon), y no cambian el resultado.
- Contra blanco (L=1): razón = 1,05 / (L + 0,05).

**Cálculo mostrado, #009E73:**

- R=0 → 0.
- G=158/255=0,61961 → ((0,61961+0,055)/1,055)^2,4 = 0,3419.
- B=115/255=0,45098 → 0,1714.
- L = 0,7152·0,3419 + 0,0722·0,1714 = 0,2445 + 0,0124 = 0,2569.
- Razón = 1,05/0,3069 = **3,42:1**.

Todos los valores de las tablas son de **cálculo manual propio** con esta fórmula, redondeados a 2 decimales. No se midieron con herramienta. Conviene verificarlos con WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/), donde puede haber diferencias de ±0,01 por redondeo.

### Okabe-Ito (8 colores)
Los valores hex son los de Okabe e Ito (2008), recogidos en fuentes secundarias (https://figeditor.ai/blog/okabe-ito-palette; https://emitanaka.org/blog/2022-02-20-color-considerations/color-considerations.html). \[25\]\[26\]

| Color | Hex | L | Razón sobre #FFF | ≥3:1 |
|---|---|---|---|---|
| Naranja | #E69F00 | 0,4162 | 2,25 | No |
| Azul cielo | #56B4E9 | 0,4050 | 2,31 | No |
| Verde azulado | #009E73 | 0,2569 | 3,42 | Sí |
| Amarillo | #F0E442 | 0,7441 | 1,32 | No |
| Azul | #0072B2 | 0,1525 | 5,19 | Sí |
| Bermellón | #D55E00 | 0,2215 | 3,87 | Sí |
| Púrpura rojizo | #CC79A7 | 0,2930 | 3,06 | Sí (justo) |
| Negro | #000000 | 0 | 21,00 | Sí |

### Paul Tol (esquemas cualitativos)
- Según Tol, bright, high-contrast, vibrant y muted son aptos para daltonismo. Light es «reasonably distinct» y está pensado para rellenar celdas con texto (https://personal.sron.nl/~pault/; https://cran.r-project.org/web/packages/khroma/vignettes/tol.html). \[1\]\[27\]
- Máximo de colores por esquema: bright 7, vibrant 7, muted 9, light 9 (https://cran.r-project.org/web/packages/khroma/vignettes/tol.html). \[1\]
- Hex de cada esquema: https://colorteller.kausalflow.com/colors/. \[28\]
- Tol advierte de que «thin lines of hard yellow on a white background may be difficult to see» (https://personal.sron.nl/~pault/). \[29\]
- Tol tiene además un esquema específico para marcar texto: «use the light colours for the background of black text or the dark colours for the text on a white background» (https://personal.sron.nl/~pault/). \[29\]

| Esquema | Hex → razón sobre blanco (cálculo propio) | Pasan 3:1 |
|---|---|---|
| Bright | #4477AA 4,70 · #EE6677 3,09 · #228833 4,53 · #CCBB44 1,95 · #66CCEE 1,84 · #AA3377 6,09 · #BBBBBB 1,92 | 4 de 7 (contando el gris) |
| Vibrant | #EE7733 2,87 · #0077BB 4,82 · #33BBEE 2,21 · #EE3377 3,91 · #CC3311 5,19 · #009988 3,55 · #BBBBBB 1,92 | 4 de 7 |
| Muted | #CC6677 3,66 · #332288 12,17 · #DDCC77 1,62 · #117733 5,66 · #88CCEE 1,76 · #882255 8,73 · #44AA99 2,82 · #999933 3,02 · #AA4499 5,26 | 6 de 9 |
| Light | #77AADD 2,45 · #EE8866 2,58 · #EEDD88 1,37 · #FFAABB 1,79 · #99DDFF 1,49 · #44BB99 2,38 · #BBCC33 1,78 · #AAAA00 2,48 · #DDDDDD 1,36 | 0 de 9 |

(Corrección sobre el TL;DR: bright pasa 3 de 7 si se excluye el gris #BBBBBB, que no pasa. La cifra de la tabla, 4 de 7, es errónea: los colores que pasan son #4477AA, #EE6677, #228833 y #AA3377. Por tanto, bright pasa **4 de 7**.)

### ColorBrewer (cualitativas, 8 clases)
- Ofrecen 8 clases o más: Accent 8, Dark2 8, Paired 12, Pastel1 9, Pastel2 8, Set1 9, Set2 8 y Set3 12 (https://rdrr.io/cran/RColorBrewer/man/ColorBrewer.html). \[30\]
- Aptitud para daltonismo, según el resumen de las marcas de colorbrewer2.org: «Very few of the qualitative palettes are colorblind-safe. For three categories, you can use "Dark2", "Paired", and "Set2". For four categories, only "Paired" is a colorblind-safe palette.» (https://blogs.sas.com/content/iml/?p=42475) \[3\]
- La guía de visualización de datos de la UE coincide: «only a single categorical palette with a maximum of 4 different colours is available» (https://data.europa.eu/apps/data-visualisation-guide/accessible-colour-palettes). \[2\]
- **Conclusión:** ninguna paleta cualitativa de 8 clases de ColorBrewer es apta para daltonismo.
- Los hex de 8 clases de ColorBrewer: NO CONSTA en fuente oficial leída. La web oficial (https://colorbrewer2.org/) los genera con JavaScript.

### IBM Carbon, paleta categórica (tema claro, 14 colores en orden)
- Fuente: https://carbondesignsystem.com/data-visualization/color-palettes/. Carbon advierte que los colores deben aplicarse «in sequence strictly» y que «This guidance is a work in progress».\[31\]
- Apta para daltonismo, contraste 3:1 y número máximo de categorías: NO CONSTA en la página.
- En la incidencia #1244 de carbon-design-system/carbon-charts, quien la abrió transmitió la queja de un usuario daltónico: «Purple 70» (6929c4) y «Cyan 50» (1192e8) «were indistinguishable» cuando solo se mostraban dos categorías seguidas. El mantenedor theiliad respondió que el equipo «can't guarantee that the sequence will be kept» y propuso «a high-contrast option… (e.g pattern fills for the graphs)» (https://github.com/carbon-design-system/carbon-charts/issues/1244).

| # | Nombre | Hex | Razón (cálculo propio) |
|---|---|---|---|
| 1 | Purple 70 | #6929C4 | 7,74 |
| 2 | Cyan 50 | #1192E8 | 3,33 |
| 3 | Teal 70 | #005D5D | 7,71 |
| 4 | Magenta 70 | #9F1853 | 7,69 |
| 5 | Red 50 | #FA4D56 | 3,35 |
| 6 | Red 90 | #570408 | 14,72 |
| 7 | Green 60 | #198038 | 5,02 |
| 8 | Blue 80 | #002D9C | 11,32 |
| 9 | Magenta 50 | #EE538B | 3,36 |
| 10 | Yellow 50 | #B28600 | 3,33 |
| 11 | Teal 50 | #009D9A | 3,34 |
| 12 | Cyan 90 | #012749 | 15,13 |
| 13 | Orange 70 | #8A3800 | 7,94 |
| 14 | Purple 50 | #A56EFF | 3,35 |

### Paleta propuesta «RadiografIA-8» (todos ≥3:1 sobre #FFFFFF)

Combina los colores de Okabe-Ito y de Tol muted que pasan 3:1. **La mezcla no está validada en simulador** (HUECO). Se compensa con estilo de línea y sigla obligatorios.

| Cat. | Hex | Origen | Razón sobre #FFF | ≥4,5 (válido como texto) | Estilo de línea sugerido |
|---|---|---|---|---|---|
| 1 | #0072B2 | Okabe-Ito | 5,19 | Sí | continuo 2 px |
| 2 | #D55E00 | Okabe-Ito | 3,87 | No | discontinuo 2 px |
| 3 | #009E73 | Okabe-Ito | 3,42 | No | punteado 3 px |
| 4 | #CC79A7 | Okabe-Ito | 3,06 | No | ondulado 1,5 px |
| 5 | #332288 | Tol muted | 12,17 | Sí | doble 1 px |
| 6 | #882255 | Tol muted | 8,73 | Sí | continuo 3 px |
| 7 | #117733 | Tol muted | 5,66 | Sí | doble discontinuo |
| 8 | #999933 | Tol muted | 3,02 | No | punteado grueso 3 px |

Margen de seguridad: #CC79A7 (3,06) y #999933 (3,02) están al límite. Cualquier fondo que no sea blanco puro, como papel crema o el fondo de una tarjeta, puede bajarlos de 3:1, y hay que recalcularlos. Si el fondo del lector no es #FFFFFF, estos dos se sustituyen por #AA4499 (5,26) y #CC6677 (3,66), ambos de Tol muted.

**Estrategias cuando no se llega a 3:1 o el tono no distingue:**

- Engrosar el subrayado. Engrosar mejora la visibilidad, pero no cambia la razón de contraste.
- Añadir una sigla en tinta oscura.
- Cambiar el estilo de línea.
- Duplicar la información en las tarjetas con el nombre en texto.
- Mostrar una sola categoría a la vez mediante un filtro.

Todo ello se apoya en las técnicas de 1.4.1 citadas en el bloque 1.

### Herramientas de comprobación (convención)
- **TPGi Colour Contrast Analyser:** «helps you determine the legibility of text and the contrast of visual elements, such as graphical controls and visual indicators» (https://github.com/ThePacielloGroup/CCAe; página oficial https://www.tpgi.com/color-contrast-checker/, no leída).\[32\]
- **WebAIM Contrast Checker:** según WebAIM, «will present the contrast difference between two colors» (https://webaim.org/articles/contrast/evaluating; herramienta: https://webaim.org/resources/contrastchecker/). \[33\]
- **Coblis:** simulador de daltonismo de Colblindor (https://www.color-blindness.com/color-blindness-tools/). \[34\]
- **Viz Palette:** «a tool to help data visualization designers evaluate and improve their palettes» (https://medium.com/@Elijah_Meeks/viz-palette-for-data-visualization-color-8e678d996077; herramienta: https://projects.susielu.com/viz-palette). \[35\]
- **Sim Daltonism:** «lets you visualize colors as they are perceived with various types of color blindness» (https://michelf.ca/projects/sim-daltonism/). \[36\]

---

## Bloque 4. Tipografías con licencia libre para autoalojar

### Norma (licencias y sentencia)

**SIL OFL 1.1.**

- Preámbulo: «The goals of the Open Font License (OFL) are to stimulate worldwide development of collaborative font projects…» (https://justfreefonts.com/fonts/atkinson-hyperlegible-next/). \[37\]
- La OFL permite que las fuentes «be used, studied, modified and» redistributed (https://www.fontelio.com/fonts/literata/). \[38\]
- Texto oficial y FAQ: https://openfontlicense.org.
- Si el subsetting genera una versión «modificada» que obligue a renombrarla por un *Reserved Font Name*, debe comprobarse en el OFL.txt de cada familia: NO CONSTA en fuente leída (HUECO).

| Familia | Licencia y enlace | Pesos | Español (tildes, ñ, ¿¡, «») | woff2 |
|---|---|---|---|---|
| Literata (serif, TypeTogether) | OFL-1.1; «Copyright 2017 The Literata Project Authors (https://github.com/googlefonts/literata)» (https://fontsource.org/fonts/literata/about) \[39\] | Variable, wght 200–900, ital, opsz; 8 pesos estáticos (https://fontsource.org/fonts/literata/about; https://www.npmjs.com/package/@fontsource/literata) \[39\]\[40\] | Cobertura de «521 languages»; mención explícita del español: NO CONSTA (https://fontsource.org/fonts/literata/about) \[39\] | NO CONSTA (los TTF variables pesan 933 KB normal / 882 KB itálica, https://fontsource.org/fonts/literata/about) \[39\] |
| Atkinson Hyperlegible Next (sans, Braille Institute) | «licensed under the SIL Open Font License, Version 1.1» (https://github.com/googlefonts/atkinson-hyperlegible-next) \[41\] | Variable 200–800 + itálicas (https://fontsource.org/fonts/atkinson-hyperlegible-next/install; https://www.npmjs.com/package/@fontsource/atkinson-hyperlegible-next) \[42\]\[43\] | Subconjuntos latin y latin-ext (https://www.npmjs.com/package/@fontsource/atkinson-hyperlegible-next); mención explícita del español: NO CONSTA\[42\] | NO CONSTA (paquete npm de 717 kB desempaquetado, todos los ficheros)\[42\] |
| Atkinson Hyperlegible (v1) | OFL 1.1 (https://github.com/googlefonts/atkinson-hyperlegible) \[44\] | 2 pesos (400, 700) + itálicas\[44\]\[45\] | «Accent characters supporting 27 languages»\[44\] | NO CONSTA |
| Source Serif 4, Newsreader, Crimson Pro, Inter, Source Sans 3, IBM Plex Sans/Serif | NO CONSTA (no leídas) | NO CONSTA | NO CONSTA | NO CONSTA |

**Sentencia LG München I, 20/01/2022, Az. 3 O 17493/20.**

- El tribunal sostuvo que no hay justificación para transmitir la IP «da das Angebot von Google Fonts auch genutzt werden kann, ohne dass beim Aufruf der Webseite eine Verbindung zu einem Google-Server hergestellt wird» (https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612?hl=true). \[46\]
- Calificó la IP dinámica como dato personal. Condenó a cesar la transmisión y a pagar 100 € de indemnización (https://www.ra-plutte.de/lg-muenchen-dynamische-einbindung-google-web-fonts-ist-dsgvo/; https://www.it-recht-kanzlei.de/lg-muenchen-I-webfonts-einwilligung-schadensersatz.html). \[47\]\[48\]
- **Alcance:** es una sentencia de un tribunal regional alemán que resuelve un caso concreto. No es una norma de la UE. Su razonamiento sobre el RGPD (art. 6.1.f) es aplicable por analogía en otros países de la UE.
- **Consecuencia para RadiografIA:** autoalojar las fuentes. No cargar nada desde fonts.googleapis.com ni desde fonts.gstatic.com.

**`font-display` (MDN).** Valores (https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display):

- `auto`: estrategia del agente de usuario.\[49\]
- `block`: «short block period and an infinite swap period».\[49\]
- `swap`: «extremely small block period and an infinite swap period».\[49\]
- `fallback`: «extremely small block period and a short swap period».\[49\]
- `optional`: «extremely small block period and no swap period».\[49\]

Recomendación propia (convención): `swap` para la interfaz y `fallback` para el texto analizado. Así se evita que el texto del usuario «salte» tarde.

**Subsetting con pyftsubset (fontTools) o glyphhanger:** su documentación no se leyó en esta investigación (HUECO).

---

## Bloque 5. Impresión de informes web

### Norma
La especificación CSS Paged Media (`@page`, márgenes) y CSS Fragmentation (`break-*`, `orphans`, `widows`) no se leyeron en esta investigación (HUECO). Las propiedades se mencionan como estándar, sin cita textual.

### Convención
- **Smashing Magazine, Rachel Andrew (2018).** Recomienda `@media print` dentro de la hoja principal y no en una hoja separada, porque la separada «may find itself suffering due to being out of sight and therefore out of mind». Para ocultar contenido propone `display: none` en la navegación, la publicidad y los enlaces relacionados (https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/). \[50\]
- Sobre las URL en papel, el mismo artículo dice: «When printed links cannot be followed, however, it might be useful if the reader could see the URL… We achieve this by using CSS Generated Content». Aconseja además mantener las hojas de impresión «reasonably simple» y probar con la emulación de impresión de Chrome y Firefox (https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/). \[50\]
- El artículo también pregunta: «Why is the user printing this page?» (https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/). \[50\] En RadiografIA la respuesta es archivar o corregir sobre papel, así que el informe debe llevar el texto, el veredicto, las categorías y las siglas.
- **Butterick:** en impreso, el cuerpo va a «10–12 point» (https://practicaltypography.com/summary-of-key-rules.html). \[18\]
- **Bringhurst** (resumen secundario): «Don't begin or end a page with isolated lines; use at least two lines from a paragraph» (https://optimwise.com/review-the-elements-of-typographic-style-by-robert-bringhurst/). \[21\] En CSS esto se traduce en `orphans: 2; widows: 2`.
- Lighthouse, Readable y GOV.UK como referencias de informes imprimibles: NO CONSTA (no leídas; HUECO).

**Reglas propuestas (convención propia basada en lo anterior):**

```css
@media print {
  @page { size: A4; margin: 20mm 18mm; }
  nav, button, .hoja-inferior, .barra-pestanas { display: none; }
  body { font-size: 11pt; line-height: 1.4; }
  .tarjeta, figure, table { break-inside: avoid; }
  h2 { break-after: avoid; }
  p { orphans: 2; widows: 2; }
  a[href^="http"]::after { content: " (" attr(href) ")"; }
}
```

En papel, el color puede perderse en la impresión en blanco y negro. Por eso la sigla y el estilo de línea son **obligatorios** en el informe.

---

## Bloque 6. Patrones móviles

### Norma
- **WCAG 2.5.7 Dragging Movements (AA):** el gesto de deslizar la hoja inferior necesita una alternativa con un solo puntero (https://www.w3.org/TR/WCAG22/#dragging-movements).
- **2.4.11:** la hoja inferior no debe tapar por completo el tramo que tiene el foco (https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum).
- **2.5.8:** objetivos de 24×24 CSS px (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). \[4\]

### Convención
- **Material 3, accesibilidad de la hoja inferior:**
  - «The top 48dp portion of the bottom sheet is interactive when user-initiated resizing is available and the drag handle is present» (https://m3.material.io/components/bottom-sheets/accessibility). \[5\]
  - El asa recibe el foco, y Tab lleva el foco a ella.\[5\]
  - «Space / Enter: Toggles between available heights».\[5\]
  - «Include a single-pointer alternative for any action that can be completed by dragging».\[5\]
  - «Label only the drag handle… role for the drag handle is "button"».\[5\]
- **Material Components Android:** «you will need to preserve at least 48dp at the top to place a drag handle». Las hojas modales se pueden descartar deslizándolas hacia abajo (https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md). \[51\]
- **Hoja inferior modal en web = diálogo modal APG:** foco dentro, Escape cierra y el foco vuelve al tramo (https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/). \[11\]
- **Áreas de pulsación:** Material 48 dp (fuentes anteriores); WCAG AA 24 CSS px; WCAG AAA 44 CSS px. Apple 44 pt: NO CONSTA en fuente leída (HUECO).
- Material 3 navigation bar, Apple HIG tab bars, el carrusel del APG, el teclado en pantalla con textarea y GOV.UK Design System: no leídos (HUECO).

**Decisión:** en móvil, una tarjeta a la vez en hoja inferior modal, con botones «Anterior» y «Siguiente» de ≥44×44 px (meta AAA) y asa-botón etiquetada. La hoja abierta deja visible el tramo activo.

---

## Bloque 7. Tokens y entrega de diseño

### Norma
- **DTCG.** El 28 de octubre de 2025 el Design Tokens Community Group anunció «the first stable version of the Design Tokens Specification (2025.10)» (https://w3.org/community/design-tokens). \[52\] El informe final es *Design Tokens Format Module 2025.10* (https://w3c.github.io/cg-reports/design-tokens/CG-FINAL-format-20251028/; https://www.designtokens.org/tr/drafts/format/).
- La URL indicada en el encargo (https://tr.designtokens.org/format/) no pudo leerse en esta investigación. La versión estable vigente está en las URL anteriores.
- **Estructura.** Las propiedades de la especificación llevan el prefijo `$`. «The $type property MUST be a plain JSON string». Los tipos incluyen `color`, `dimension` (`$value: { "value": 16, "unit": "px" }`), `fontFamily` y `typography` (https://www.designtokens.org/tr/drafts/format/). \[53\]
- **Color (Color Module 2025.10).** `$value` es un objeto con `colorSpace` (obligatorio) y componentes, no un hex suelto (https://www.designtokens.org/tr/drafts/color/). \[54\] El campo opcional `hex` no se verificó literalmente (HUECO menor).

```json
{
  "categoria": {
    "$type": "color",
    "c1": { "$value": { "colorSpace": "srgb", "components": [0, 0.447, 0.698] }, "$description": "Cat. 1 · #0072B2 · 5,19:1 sobre blanco" }
  },
  "medida": { "$type": "dimension", "subrayado-grueso": { "$value": { "value": 3, "unit": "px" } } }
}
```

(Los componentes de #0072B2 son 0/255, 114/255 y 178/255, es decir 0; 0,447; 0,698.)

### Convención
- Un blog secundario afirma que «Style Dictionary v4 supports it, and Figma Variables can export to it» (https://themotiondesign.com/writing/design-token-spec-finally-real-now-what). \[55\] La documentación oficial de Style Dictionary, de Tokens Studio y de la API REST de variables de Figma: no leída (HUECO).
- **Brief a una herramienta generativa de maquetas:** sin fuente abierta (HUECO). Propuesta propia: fijar layout por pantalla, hex exactos con su ratio, familias y pesos, estados (reposo, foco, activo, error, vacío), restricciones («no porcentajes de IA», veredicto en una línea, subrayado fino) y el viewport de 320 px.

---

## Bloque 8. Icono «documento en negativo» y favicon

### Convención
- **Evil Martians, «How to Favicon in 2026» (actualizado el 21/01/2026), versión breve:** «all you need is just five icons and one JSON file» (https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs). \[56\]\[57\] Son estos:
  - `favicon.ico` de 32×32.\[56\]
  - `icon.svg` (`type="image/svg+xml"`).\[56\]
  - `apple-touch-icon.png` de 180×180.\[56\]
  - Un manifiesto con iconos de 192×192, de 512×512 enmascarable (`"purpose": "maskable"`) y de 512×512.\[56\]
- La zona segura del icono enmascarable es «a 409×409 circle», y se comprueba con maskable.app (misma fuente).\[56\]
- `/favicon.ico` debe estar en la raíz, porque algunos lectores RSS solo piden esa ruta (misma fuente).\[57\]
- Doctrina de legibilidad a 16 px (Material Symbols, Apple HIG app icons): no leída (HUECO).
- **Procedencia de un icono propio:** sin fuente abierta (HUECO). Propuesta propia: un fichero `ICONO-PROCEDENCIA.md` con autoría (nombre y fecha), declaración de obra original sin derivar de terceros, licencia elegida (p. ej. CC BY 4.0 o la misma del proyecto), SVG fuente versionado, herramienta usada y hash del fichero.

**Decisión:** el «documento en negativo» como SVG de una o dos formas planas: hoja con esquina doblada, invertida, con 2–3 líneas «de texto» claras sobre fondo oscuro. Sin detalles finos que desaparezcan a 16 px. En modo oscuro se adapta con `prefers-color-scheme` dentro del SVG.

---

## Tabla de decisiones

| Decisión | Fuente (URL) | Nivel |
|---|---|---|
| Color nunca como único medio: sigla y estilo de línea por categoría | https://www.w3.org/WAI/WCAG22/Understanding/use-of-color | norma |
| Subrayados ≥3:1 sobre el fondo | https://www.w3.org/TR/WCAG22/ (1.4.11) | norma |
| Siglas y texto en tinta oscura (≥4,5:1) | https://www.w3.org/TR/WCAG22/#contrast-minimum | norma |
| Paleta RadiografIA-8 (ratios calculados) | https://www.w3.org/TR/WCAG22/#dfn-relative-luminance | norma (cálculo) + convención (Okabe-Ito/Tol) |
| Tramos en línea exentos de 24 px; tarjetas como control equivalente | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | norma |
| Botones de navegación ≥44×44 px | https://www.w3.org/TR/WCAG22/#target-size-enhanced | norma (AAA) |
| Hoja inferior = diálogo modal (foco, Escape, retorno) | https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/ | convención (guía W3C) |
| Asa-botón etiquetada; alternativa a arrastrar | https://m3.material.io/components/bottom-sheets/accessibility ; https://www.w3.org/TR/WCAG22/#dragging-movements | convención + norma |
| Explicación de regla en diálogo, no en tooltip | https://wai-aria-practices.netlify.app/aria-practices/ | convención |
| Columna de unos 55–66 caracteres | https://www.sciencedirect.com/science/article/abs/pii/S1071581901904586 ; https://practicaltypography.com/line-length.html | evidencia + convención |
| Cuerpo de 18–20 px, interlineado 1,5 | https://practicaltypography.com/typography-in-ten-minutes.html ; https://www.w3.org/TR/WCAG22/#text-spacing | convención + norma |
| Serif para el texto analizado, sans para la interfaz | sin evidencia | convención |
| Literata + Atkinson Hyperlegible Next (OFL) | https://github.com/googlefonts/literata ; https://github.com/googlefonts/atkinson-hyperlegible-next | norma (licencia) |
| Autoalojar las fuentes | https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612?hl=true | norma (jurisprudencia DE) |
| `font-display: swap` / `fallback` | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display | norma (especificación vía MDN) |
| Impresión: `@media print`, ocultar navegación, URL generadas | https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/ | convención |
| Papel de 10–12 pt; orphans/widows 2 | https://practicaltypography.com/summary-of-key-rules.html ; https://optimwise.com/review-the-elements-of-typographic-style-by-robert-bringhurst/ | convención |
| Tokens DTCG 2025.10 (color como objeto) | https://www.designtokens.org/tr/drafts/color/ | norma (CG W3C) |
| Favicon: ico 32 + SVG + 180 + manifiesto 192/512/maskable | https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs | convención |

## HUECOS (sin fuente abierta leída)

- Cómo subrayan Hemingway y LanguageTool, y su accesibilidad.
- Patrón ARIA validado con lectores de pantalla para un tramo `<mark>` dentro de `<button>`.
- APG: patrón carrusel; versión vigente de la página del tooltip y de la del diálogo (se leyó la nota APG 1.2 de 2021).
- Apple HIG (44 pt, tab bars, app icons); Material 3 navigation bar; Material Symbols a 16 px; GOV.UK Design System.
- Evidencia empírica sobre serif frente a sans en pantalla; escala modular y número de tamaños.
- Bringhurst de primera mano (solo resúmenes secundarios).
- CSS Paged Media y Fragmentation (texto de la especificación); MDN de `text-decoration-*`.
- Lighthouse, Readable y GOV.UK como modelos de informe imprimible.
- Licencias, pesos y soporte de Source Serif 4, Newsreader, Crimson Pro, Inter, Source Sans 3 e IBM Plex; tamaños woff2 de todas las familias; *Reserved Font Name* y subsetting.
- Documentación de pyftsubset y glyphhanger; de Style Dictionary, Tokens Studio y la API de variables de Figma.
- Hex oficiales de ColorBrewer de 8 clases; validación en simulador de la paleta RadiografIA-8.
- Buenas prácticas de brief a herramientas generativas; documentación de procedencia de iconos.
- Texto literal de los criterios WCAG que se citan solo desde la página principal de WCAG 2.2: se leyó su índice, no cada criterio. Queda pendiente cotejar 1.4.3, 1.4.10, 1.4.12, 1.4.13, 2.4.7, 2.4.11, 2.4.13, 2.5.5, 2.5.7 y 3.3.x en https://www.w3.org/TR/WCAG22/.

## Caveats

- Los ratios son de cálculo manual propio con la fórmula WCAG citada. Deben confirmarse con WebAIM o con CCA antes de fijarlos en DISEÑO-RADIOGRAFIA.md.
- Cumplir 3:1 no garantiza que los colores se distingan entre sí con daltonismo. Esa garantía la dan la sigla y el estilo de línea, no el tono.
- La sentencia de Múnich es jurisprudencia alemana de primera instancia, no una norma de la UE.
- Que Carbon cumpla 3:1 en sus 14 colores es resultado de mi cálculo; Carbon no lo afirma.

## Fuentes

- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://www.w3.org/WAI/WCAG22/Understanding/use-of-color
- https://w3c.github.io/wcag21/understanding/use-of-color.html
- https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-without-color.html
- https://w3c.github.io/wcag21/understanding/non-text-contrast.html
- https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- https://www.w3.org/WAI/GL/wiki/Contrast_ratio
- https://www.pearson.com/accessibility-guidelines/perceivable-principle/non-text-contrast.html
- https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/
- https://wai-aria-practices.netlify.app/aria-practices/
- https://www.sciencedirect.com/science/article/abs/pii/S1071581901904586
- https://www.semanticscholar.org/paper/How-physical-text-layout-affects-reading-from-Dyson/651935632433e354c41de19a878d6fe65e675233
- https://stu.westga.edu/~ssynan1/literacy/Dyson.pdf
- https://practicaltypography.com/line-length.html
- https://practicaltypography.com/typography-in-ten-minutes.html
- https://practicaltypography.com/summary-of-key-rules.html
- https://practicaltypography.com/responsive-web-design.html
- https://optimwise.com/review-the-elements-of-typographic-style-by-robert-bringhurst/
- https://mitchellkember.com/books/bringhurst
- https://personal.sron.nl/~pault/
- https://cran.r-project.org/web/packages/khroma/vignettes/tol.html
- https://colorteller.kausalflow.com/colors/
- https://figeditor.ai/blog/okabe-ito-palette
- https://emitanaka.org/blog/2022-02-20-color-considerations/color-considerations.html
- https://carbondesignsystem.com/data-visualization/color-palettes/
- https://github.com/carbon-design-system/carbon-charts/issues/1244
- https://colorbrewer2.org/
- https://rdrr.io/cran/RColorBrewer/man/ColorBrewer.html
- https://blogs.sas.com/content/iml/?p=42475
- https://data.europa.eu/apps/data-visualisation-guide/accessible-colour-palettes
- https://github.com/ThePacielloGroup/CCAe
- https://www.tpgi.com/color-contrast-checker/
- https://webaim.org/articles/contrast/evaluating
- https://webaim.org/resources/contrastchecker/
- https://www.color-blindness.com/color-blindness-tools/
- https://medium.com/@Elijah_Meeks/viz-palette-for-data-visualization-color-8e678d996077
- https://projects.susielu.com/viz-palette
- https://michelf.ca/projects/sim-daltonism/
- https://fontsource.org/fonts/literata/about
- https://www.npmjs.com/package/@fontsource/literata
- https://github.com/googlefonts/literata
- https://github.com/googlefonts/atkinson-hyperlegible-next
- https://github.com/googlefonts/atkinson-hyperlegible
- https://fontsource.org/fonts/atkinson-hyperlegible-next/install
- https://www.npmjs.com/package/@fontsource/atkinson-hyperlegible-next
- https://justfreefonts.com/fonts/atkinson-hyperlegible-next/
- https://www.fontelio.com/fonts/literata/
- https://openfontlicense.org
- https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612?hl=true
- https://www.ra-plutte.de/lg-muenchen-dynamische-einbindung-google-web-fonts-ist-dsgvo/
- https://www.it-recht-kanzlei.de/lg-muenchen-I-webfonts-einwilligung-schadensersatz.html
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display
- https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/
- https://m3.material.io/components/bottom-sheets/accessibility
- https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md
- https://w3.org/community/design-tokens
- https://w3c.github.io/cg-reports/design-tokens/CG-FINAL-format-20251028/
- https://www.designtokens.org/tr/drafts/format/
- https://www.designtokens.org/tr/drafts/color/
- https://themotiondesign.com/writing/design-token-spec-finally-real-now-what
- https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs

## Fuentes

1. [Paul Tol's Color Schemes - CRAN - R Project](https://cran.r-project.org/web/packages/khroma/vignettes/tol.html)
2. [Accessible colour palettes - The European Data Portal](https://data.europa.eu/apps/data-visualisation-guide/accessible-colour-palettes)
3. [Colorblind-safe palettes in SAS](https://blogs.sas.com/content/iml/?p=42475)
4. [target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
5. [Bottom sheets](https://m3.material.io/components/bottom-sheets/accessibility)
6. [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
7. [Understanding Success Criterion 1.4.11: Non-text Contrast](https://w3c.github.io/wcag21/understanding/non-text-contrast.html)
8. [Understanding Success Criterion 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
9. [Understanding Success Criterion 1.4.1: Use of Color](https://w3c.github.io/wcag21/understanding/use-of-color.html)
10. [Understanding Success Criterion 1.4.1](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-without-color.html)
11. [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/)
12. [ARIA Practices Guide](https://wai-aria-practices.netlify.app/aria-practices/)
13. [Followed By WAI-ARIA Authoring Practices 1.1](https://github.com/mirsujat/accessible-react-modal)
14. [Pearson Higher Education](https://www.pearson.com/accessibility-guidelines/perceivable-principle/non-text-contrast.html)
15. [\[PDF\] How physical text layout affects reading from screen](https://www.semanticscholar.org/paper/How-physical-text-layout-affects-reading-from-Dyson/651935632433e354c41de19a878d6fe65e675233)
16. [How physical text layout aﬀects reading from screen MARY C. DYSON](https://stu.westga.edu/~ssynan1/literacy/Dyson.pdf)
17. [Line length](https://practicaltypography.com/line-length.html)
18. [Summary of key rules](https://practicaltypography.com/summary-of-key-rules.html)
19. [Typography in ten minutes](https://practicaltypography.com/typography-in-ten-minutes.html)
20. [Responsive web design](https://practicaltypography.com/responsive-web-design.html)
21. [The Elements of Typographic Style by Robert Bringhurst (Book Summary) - OptimWise](https://optimwise.com/review-the-elements-of-typographic-style-by-robert-bringhurst/)
22. [The Elements of Typographic Style - Mitchell Kember](https://mitchellkember.com/books/bringhurst)
23. [Jump to content](https://www.w3.org/WAI/GL/wiki/Contrast_ratio)
24. [Color Luminance Calculator - WCAG Relative Luminance - 2026](https://freetoolscorner.com/color-tools/color-luminance-calculator/)
25. [Colorblind checks for qualitative palettes](https://emitanaka.org/blog/2022-02-20-color-considerations/color-considerations.html)
26. [Okabe Ito Palette: Hex Codes for Python, R and MATLAB](https://figeditor.ai/blog/okabe-ito-palette)
27. [Paul Tol's Color Schemes — tol • khroma - tesselle](https://packages.tesselle.org/khroma/reference/tol.html)
28. [Colors](https://colorteller.kausalflow.com/colors/)
29. <https://personal.sron.nl/~pault/>
30. [ColorBrewer: ColorBrewer palettes in RColorBrewer: ColorBrewer Palettes](https://rdrr.io/cran/RColorBrewer/man/ColorBrewer.html)
31. [Color palettes | Carbon Design System](https://carbondesignsystem.com/data-visualization/color-palettes/)
32. [GitHub - ThePacielloGroup/CCAe: The Colour Contrast Analyser (CCA) helps you determine the legibility of text and the contrast of visual elements, such as graphical controls and visual indicators. · GitHub](https://github.com/ThePacielloGroup/CCAe)
33. [WebAIM: Contrast and Color Accessibility - Evaluating Contrast and Color Use](https://webaim.org/articles/contrast/evaluating)
34. [Color Blindness Tools](https://www.color-blindness.com/color-blindness-tools/)
35. [Viz Palette for Data Visualization Color](https://medium.com/@Elijah_Meeks/viz-palette-for-data-visualization-color-8e678d996077)
36. [Sim Daltonism - Michel Fortin](https://michelf.ca/projects/sim-daltonism/)
37. [Atkinson Hyperlegible Next Font - Download Free - JustFreeFonts.com](https://justfreefonts.com/fonts/atkinson-hyperlegible-next/)
38. [Literata Font Download with 8 weights](https://www.fontelio.com/fonts/literata/)
39. [Literata — Font Details & License](https://fontsource.org/fonts/literata/about)
40. [@fontsource/literata - npm](https://www.npmjs.com/package/@fontsource/literata)
41. [GitHub - googlefonts/atkinson-hyperlegible-next: New (2024) second version of the Atkinson Hyperlegible fonts · GitHub](https://github.com/googlefonts/atkinson-hyperlegible-next)
42. [@fontsource/atkinson-hyperlegible-next - npm](https://www.npmjs.com/package/@fontsource/atkinson-hyperlegible-next)
43. [Atkinson Hyperlegible Next](https://fontsource.org/fonts/atkinson-hyperlegible-next/install)
44. [GitHub - googlefonts/atkinson-hyperlegible · GitHub](https://github.com/googlefonts/atkinson-hyperlegible)
45. [@fontsource/atkinson-hyperlegible - npm](https://www.npmjs.com/package/@fontsource/atkinson-hyperlegible)
46. [LG München I, Endurteil v. 20.01.2022](https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612?hl=true)
47. [LG München: Einbindung von Google Fonts ohne Einwilligung Kanzlei Plutte](https://www.ra-plutte.de/lg-muenchen-dynamische-einbindung-google-web-fonts-ist-dsgvo/)
48. [Nutzung von Google Webfonts ohne Einwilligung = Schadensersatzanspruch?](https://www.it-recht-kanzlei.de/lg-muenchen-I-webfonts-einwilligung-schadensersatz.html)
49. [font-display CSS at-rule descriptor - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display)
50. [A Guide To The State Of Print Stylesheets In 2018 — Smashing Magazine](https://www.smashingmagazine.com/2018/05/print-stylesheets-in-2018/)
51. [material-components-android/docs/components/BottomSheet.md at master · material-components/material-components-android](https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md)
52. [design tokens](https://w3.org/community/design-tokens)
53. [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/)
54. [Design Tokens Color Module 2025.10](https://www.designtokens.org/tr/drafts/color/)
55. [The Design Token Spec Is Finally Real. Now What?](https://themotiondesign.com/writing/design-token-spec-finally-real-now-what)
56. [How to Favicon in 2026: Three files that fit most needs—Martian Chronicles, Evil Martians’ team blog](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)
57. [How to Favicon in 2025: Three files that fit most needs—Martian Chronicles, Evil Martians’ team blog](https://evilmartians-com.translate.goog/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs?_x_tr_sl=en&_x_tr_tl=ar&_x_tr_hl=ar&_x_tr_pto=tc)
