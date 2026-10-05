# DISEÑO — 005 RadiografIA

Documento rector de la estética (punto 10 del `PLAN-RADIOGRAFIA.md`). Nada
se dibuja ni se calca sin estar aquí. Estado a 03/10/2026: **FIRMADO por
Antonio como punto de partida**; lo que no guste se ajusta en el modelado
de Figma Make y se vuelve a escribir aquí antes del calco. **04/10/2026:
modelado en Figma Make hecho (seis pantallas en 1280/820/390, informe A4,
tokens.json, icono); tres cambios de Antonio sobre el borrador, ya
incorporados: fondo suave tipo rotulador en los tramos (§4), tableta como
tercer tamaño (§6) y el tramo como `<span role="button">` (§6.1).**
**05/10/2026: cambios de Antonio al ver el calco: orden del documento en
tableta y móvil (§6.1), columna de resultado con scroll propio (§6.1),
icono de cabecera a 56/48 px (§8), el papel calcado al marco A4 con hoja
«sin resultado» centrada y salto antes del desglose, y descarga directa
del PDF en lugar del diálogo de imprimir (§6.5).**
Fuentes: `docs/investigacion/
informes/diseno-modulo.md` (doctrina, 03/10), `docs/investigacion/
ux-benchmark.md` (prospección, 03/10) y los nueve apuntes de Antonio del
punto 10. Cada decisión lleva su nivel: [NORMA] (WCAG, licencias,
jurisprudencia), [EVIDENCIA] (estudios), [CONVENCIÓN] (guías de estilo,
patrones de otros), [PROPIO] (decisión nuestra sin fuente).

## 1 · Qué es y para quién

Una página para pegar un texto en español y leer, en una línea, si suena a
asistente (IA) y por qué. Tres pantallas (analizador, catálogo de reglas,
ficha de regla), un informe en papel, y tres tamaños con el mismo peso:
escritorio (1280), tableta (820) y móvil (390). Identidad fijada el 29/09: **RadiografIA**, «A
contraluz se nota todo.», «Pon tu texto a contraluz», icono «documento en
negativo». Referente de forma: **Hemingway Editor** (prospección 03/10):
cada cosa en un solo sitio; una línea arriba; una tarjeta por categoría;
el texto limpio en medio; la explicación solo cuando se toca. Lo que lo
distingue de los detectores: nunca un porcentaje de «IA» ni «confident»;
siempre la comparación con textos humanos del mismo tipo.

## 2 · Doctrina que manda (resumen; detalle y citas en el informe)

- **Accesibilidad** [NORMA, WCAG 2.2 AA]: texto ≥ 4,5:1 (1.4.3); objetos
  gráficos y componentes ≥ 3:1 (1.4.11); el color nunca como único medio
  (1.4.1); objetivo de pulsación ≥ 24×24 px, y 44×44 para los controles
  importantes (2.5.8 y 2.5.5, con la exención de los objetivos en línea
  dentro de un texto); foco visible (2.4.7) y no tapado por hojas o barras
  fijas (2.4.11); sin scroll horizontal a 320 px (1.4.10); interlineado
  1,5 sin pérdida (1.4.12); lo que aparece al pasar o enfocar se puede
  descartar y recorrer (1.4.13); errores identificados en texto y con
  sugerencia (3.3.1, 3.3.3); todo lo que se arrastra tiene alternativa
  de un solo toque (2.5.7).
- **Legibilidad de texto largo** [EVIDENCIA Dyson & Haselgrove 2001; Dyson
  2004]: unos 55 caracteres por línea dan la mejor comprensión; las líneas
  largas se leen más rápido pero se entienden peor; en un analizador manda
  la comprensión. [CONVENCIÓN Butterick, Bringhurst]: 45-90 caracteres;
  cuerpo de 15-25 px en web y 10-12 pt en papel; interlineado 120-145 %.
- **Paletas** [NORMA cálculo WCAG; CONVENCIÓN Okabe-Ito, Paul Tol]: las
  paletas célebres no dan ocho colores con 3:1 sobre blanco; cumplir 3:1 no
  garantiza distinguirlos con daltonismo: eso lo garantizan la **sigla** y
  el **estilo de línea**, no el tono.
- **Tipografía** [NORMA licencia OFL; jurisprudencia LG München I
  20/01/2022]: fuentes libres, **autoalojadas** y con subsetting; nada
  desde fonts.googleapis.com. Serif para el texto y sans para la interfaz
  es [CONVENCIÓN], sin estudio detrás, y así se declara.
- **Impresión** [CONVENCIÓN Smashing 2018, Butterick, Bringhurst]: hoja de
  impresión dentro de la principal; ocultar navegación y controles; URL
  tras los enlaces; 10-12 pt; orphans/widows 2; en papel la sigla y el
  estilo de línea son obligatorios porque el color se pierde.
- **Móvil** [CONVENCIÓN Material 3; NORMA WCAG]: la hoja inferior es un
  diálogo modal (foco dentro, Escape cierra, el foco vuelve al tramo);
  asa como botón etiquetado; 48 dp arriba para el asa; alternativa de un
  toque a arrastrar; la hoja no tapa el tramo activo.
- **Entrega** [NORMA DTCG 2025.10]: tokens en el formato estable (color
  como objeto con espacio y componentes; dimension con valor y unidad);
  favicon según Evil Martians 2026 (ico 32, SVG, apple-touch 180, manifiesto
  192/512/maskable).

## 3 · Los nueve apuntes de Antonio, convertidos en decisiones

| nº | apunte | decisión |
|---|---|---|
| 1 | filtros del catálogo en columnas | rejilla de 3 columnas en escritorio (familia · detector · severidad), apiladas y plegadas en móvil |
| 2 | panel de regla junto al tramo | escritorio: tarjeta anclada bajo el tramo (como Hemingway); móvil: hoja inferior |
| 3 | Highlight API | fuera de la v1 (Baseline 2026-03; el clic es más difícil); vista por tramos se queda |
| 4 | `.gitattributes` para fuentes | antes de la primera fuente binaria: `*.woff2 binary` |
| 5 | contraste de #e69f00 y #56b4e9 | paleta nueva (sección 4): los ocho colores ≥ 3,4:1 sobre blanco |
| 6 | informe largo | secciones numeradas con salto de página antes de las largas; explicaciones de contexto plegadas al final; la nota al pie no queda sola |
| 7 | resultado fijo arriba + pestañas | escritorio: dos columnas (texto \| resultado y tarjetas); móvil: resultado arriba y pestañas Texto · Reglas · Datos |
| 8 | la etiqueta debe destacar | pastilla grande con la etiqueta, primera cosa visible tras analizar (ancla visual, como el sello de GPTZero, sin porcentaje) |
| 9 | móvil como requisito | cada pantalla en tres tamaños (escritorio 1280, tableta 820 en una columna con los componentes de escritorio, móvil 390); tramos tocables; hoja inferior; sin scroll horizontal a 320 px; juez |

## 4 · Color

**Neutros** [PROPIO]: fondo #FFFFFF; tinta #1A1A1A (17,40:1); tinta
secundaria #4A4A4A (≈ 8,9:1); bordes y separadores #D9D9D9; fondo de
tarjeta #F5F5F5 (los colores de familia se recalculan sobre él antes del
calco); fondo del aviso de error #FDECEA (tinta encima: 15,2:1); velo de
las hojas negro al 40 %. Acento de marca: el índigo de la paleta
(#332288), que también es color de familia; el botón principal lo usa con
texto blanco (12,2:1). **Botón desactivado** (04/10, tras el modelo): fondo
card, borde line discontinuo, texto ink-2 (8,1:1), cursor not-allowed; el
principal desactivado pierde el índigo.

**Ocho familias**, una tinta cada una, todas ≥ 3,4:1 sobre blanco (ratios
recalculados el 03/10 con la fórmula WCAG; fuente de los hex: Okabe-Ito y
Paul Tol «muted», vía el informe). Asignación [PROPIO]: los seis de
RadiografIA primero; Español correcto en los dos últimos, para que se vea
que es otro paquete.

| familia | hex | ratio blanco | ratio #F5F5F5 | estilo de línea | sigla |
|---|---|---|---|---|---|
| Léxico | #0072B2 | 5,19 | 4,76 | continuo 2 px | L |
| Discurso | #882255 | 8,73 | 8,01 | continuo 3 px | D |
| Sintaxis | #D55E00 | 3,87 | 3,55 | discontinuo 2 px | S |
| Estadística | #332288 | 12,17 | 11,17 | doble 1 px | E |
| Puntuación y formato | #009E73 | 3,42 | 3,14 | punteado 3 px | P |
| Canal (informativa) | #117733 | 5,66 | 5,19 | punteado 1 px, gris si se desactiva | C |
| Gramática (Español correcto) | #AA4499 | 5,26 | 4,83 | ondulado 2 px | G |
| Ortotipografía (Español correcto) | #CC6677 | 3,66 | 3,36 | doble discontinuo | O |

Reglas: el tono **nunca** va solo (1.4.1): cada tramo lleva estilo de
línea propio y, en papel y al tocar, su sigla; cada tarjeta lleva el
nombre en texto. **Cambio de Antonio (04/10, al ver el modelo)**: el
subrayado solo le parece poco visible; el tramo lleva además un **fondo
suave tipo rotulador** (color-mix 14 % del color de la familia sobre
blanco; la tinta sigue siendo ink, contraste > 12:1) y la línea con su
estilo debajo. El fondo es lo que se ve; la línea y la sigla son lo que
distingue (solapes, daltonismo, papel). En papel el fondo no cuenta. Los dos de menor contraste (Puntuación 3,42 y
Ortotipografía 3,66) no se usan como texto, solo como línea. Paquetes
propios: el color del hueco libre o el gris, siempre discontinuo (8.1).
Pendiente antes de fijar: pasar la paleta por un simulador de daltonismo
(Coblis o Sim Daltonism) y anotar el resultado en el acta de contraste.

## 5 · Tipografía

- **Texto analizado y textos largos (explicaciones, informe)**: **Literata**
  (OFL 1.1, variable, 200-900, itálica, eje óptico) [NORMA licencia;
  CONVENCIÓN serif]. Cuerpo 18-19 px en pantalla, 11 pt en papel.
- **Interfaz** (etiquetas, tarjetas, botones, catálogo): **Atkinson
  Hyperlegible Next** (OFL 1.1, variable 200-800, diseñada para
  legibilidad) [NORMA licencia]. 16 px base.
- Medida de la columna de texto: `max-width` en `em` calibrado para **60-66
  caracteres** con Literata [EVIDENCIA 55 cpl; CONVENCIÓN 45-90].
  Interlineado **1,5** [CONVENCIÓN + 1.4.12]; deja sitio a subrayados de
  2-3 px con `text-underline-offset`.
- Escala [PROPIO]: siete tamaños, los de tokens.json: 28 (título de
  pantalla), 24 (etiqueta del resultado en móvil), 20 (título de tarjeta),
  18 (cuerpo), 16 (interfaz), 15 (secundario), 11 (sigla voladita); la
  pastilla del resultado usa 28 en escritorio y 24 en móvil.
- **Autoalojadas** en `web/public/fuentes/`, woff2 con subsetting latin +
  latin-ext (tildes, ñ, ¿¡, «», —, …), `font-display: swap` en la interfaz
  y `fallback` en el texto analizado [CONVENCIÓN del informe]; pila de
  reserva del sistema declarada. Licencias OFL en `THIRD-PARTY-NOTICES.md`
  §2 y los ficheros OFL.txt junto a las fuentes. Comprobar el *Reserved Font
  Name* de cada una antes de hacer subsetting (hueco del informe).
  `.gitattributes`: `*.woff2 binary` antes del primer commit de fuentes.

## 6 · Las pantallas

### 6.1 Analizador (escritorio, ≥ 1024 px; tableta 769-1023 px, los
mismos bloques en una columna, sin barra de pestañas)

Dos columnas [CONVENCIÓN: Hemingway, GPTZero, LanguageTool]. **Orden del
documento** (05/10, WCAG 1.3.2): en tableta y móvil, la pastilla y «Lo
que más pesa» van antes que la vista del texto también en el DOM (la
vista se mueve en el documento al cambiar de ancho, como los paneles de
las pestañas); en escritorio el documento sigue columna a columna, texto
y después resultado, que es una secuencia válida para dos columnas y
conserva la columna fija con scroll propio.

- **Izquierda (texto)**: antes de analizar, el cuadro de texto con
  placeholder que dice el mínimo («Pega aquí tu texto: a partir de 100
  palabras; el análisis es completo desde 300») [CONVENCIÓN QuillBot];
  debajo, los chips de ejemplo («Texto humano», «Texto de IA») y el
  selector de género; el bloque «Paquetes» plegado. Después de analizar,
  la **vista del texto** con los tramos marcados por familia (fondo suave
  tipo rotulador + línea con su estilo + sigla, §4), en
  Literata a 60-66 cpl; el cuadro queda editable arriba, plegado a tres
  líneas con «Editar».
- **Derecha (resultado)**, columna de ~360 px, fija al hacer scroll y con
  scroll propio cuando es más alta que la ventana (`sticky; max-height:
  calc(100vh - 32px); overflow-y: auto`; decisión 04/10 tras la tanda 2:
  con textos largos la columna medía 1.350 px y su parte baja no se veía hasta el final del texto):
  1. **Pastilla del resultado**: la etiqueta de la 9.2 en grande (28 px;
     24 en móvil), en tinta sobre fondo card (como el modelo; no en el
     color del acento ni semáforo: no es un veredicto de autoría); debajo
     la frase de calle.
  2. **Lo que más pesa**: hasta tres **tarjetas**, una por regla, con el
     color y la sigla de su familia, el nombre, la cola («3 veces» o la
     meta) y, en la primera, «Empieza por: …». [CONVENCIÓN Hemingway].
  3. **Familias**: la leyenda como fila de tarjetas pequeñas con color,
     estilo de línea, nombre, recuento y un **ojo** para ocultar esa capa
     de subrayados [CONVENCIÓN Hemingway]. Canal aparte, con «solo avisos».
  4. **Ver el detalle** (plegado): las cifras y el desglose completo
     (paquete → familia → regla), «lo que se nota en el conjunto», «solo
     avisos», «no miradas».
  5. **Español correcto**: su línea de resumen y su desglose plegado.
  6. **Botones**: «Descargar informe» y «Analizar otro texto».
  7. **Nota** «RadiografIA analiza estilo; no demuestra autoría», visible,
     en el pie de página (como el modelo) [CONVENCIÓN QuillBot].
- **Al tocar un tramo**: **tarjeta anclada** bajo el tramo (no tooltip:
  lleva botones) [CONVENCIÓN APG: diálogo no modal]: nombre, frase en
  claro, «Qué hacer», «¿Por qué lo miramos?» plegado, enlace a la ficha,
  «Anterior / Siguiente» para recorrer las señales, cierre con Escape y
  foco de vuelta al tramo (1.4.13, 2.4.7). El tramo es `<span
  role="button" tabindex="0">` con nombre accesible («Conector repetido:
  “Además”») y manejo de Enter y Espacio según el patrón button de la
  APG: no `<button>`, porque los navegadores lo fuerzan a inline-block y
  no se parte con la frase (comprobado en el modelo el 04/10; es lo que
  ya hace la web del 6.2). Pendiente de prueba con lector de pantalla.

### 6.2 Analizador (móvil, ≤ 768 px)

Una columna. Orden: cabecera breve → cuadro de texto a todo el ancho con
el placeholder → chips de ejemplo → género → botón «Pon tu texto a
contraluz» (ancho completo, ≥ 44 px de alto) → «Paquetes» plegado. Tras
analizar, la pantalla salta al resultado: **pastilla + frase** arriba,
«Lo que más pesa» como tarjetas apiladas, y debajo una **barra de pestañas
fija** [apunte 7]: **Texto** (la vista subrayada) · **Reglas** (familias
con ojo y desglose) · **Datos** (detalle, no miradas, Español correcto).
Al tocar un tramo: **hoja inferior modal** con asa-botón etiquetada, una
regla a la vez, «Anterior / Siguiente» de ≥ 44×44 px, cierre con Escape o
botón, foco de vuelta; la hoja no tapa el tramo activo (2.4.11) y se puede
cerrar sin arrastrar (2.5.7) [CONVENCIÓN LanguageTool, Material 3]. Sin
scroll horizontal a 320 px (1.4.10). La nota de autoría al pie de la
pestaña Texto y de Datos.

### 6.3 Catálogo `/reglas`

Escritorio: buscador arriba a todo el ancho; **filtros en tres columnas**
(familia · detector · severidad) con el recuento «N reglas» en aria-live;
lista en tarjetas con color y sigla de familia, nombre, frase en claro,
paquete y evidencia. Móvil: buscador; filtros plegados en un botón
«Filtros (3)» que abre hoja inferior; lista apilada. Orden alfabético
(7.1) y «Quitar filtros» siempre visibles.

### 6.4 Ficha `/reglas/<id>`

Columna única de 60-66 cpl: nombre con la pastilla de familia (color +
sigla), frase en claro, «Qué hacer», explicación, excepciones, nivel de
evidencia, origen de la lista, fuentes como enlaces, ejemplos positivos y
negativos en bloques con el estilo de subrayado de la familia aplicado al
tramo que la dispara; «Probar en el analizador» y «Volver al catálogo».
Igual en móvil, apilado.

### 6.5 Informe

Dos salidas, calcadas al marco «Informe · A4» del modelo (medido el
05/10 y guardado en `docs/figma/medidas-modelo.json`):

- **Descarga** (botón «Descargar informe»; decisión de Antonio del 05/10,
  casilla 9.3): el PDF se genera en el navegador con pdfmake, cargado al
  pulsar, con nuestras fuentes incrustadas; funciona igual en PC, tableta y
  móvil (en iOS se abre en el visor y desde ahí se guarda). Sustituye al
  «CSS de impresión + window.print()» del 29/09: el diálogo de imprimir no
  sirve en iPhone ni iPad.
- **Papel** (Ctrl+P o menú Imprimir, que no se bloquean): la hoja de
  impresión da el mismo informe. **Sin resultado**, sale una sola página
  con el icono (c) a 96 px y «RadiografIA» (Atkinson 700, 24 pt) centrados
  en horizontal y en vertical y, debajo, en Literata 12 pt e ink-2, «No
  hay análisis que imprimir: pega un texto y pulsa «Pon tu texto a
  contraluz».»; nada más en la hoja.

**Estructura**, en los dos casos [apunte 6]: 1 cabecera (fecha y hora del
análisis, género, palabras, paquetes, cifras del detalle); 2 resultado
(etiqueta, frase, lo que más pesa, empieza por, la línea de Español
correcto); 3 clave de familias (muestra de línea en tinta + sigla + nombre);
4 texto completo con subrayados y «[sigla]» tras cada tramo; 5 desglose; 6
señales regla a regla (nombre con URL, frase en claro, fragmentos, qué
hacer; la explicación larga y las seis reglas de contexto al final, en
cuerpo menor); 7 nota de autoría, que cierra la última sección en vez de
ir sola. **Saltos de página antes de la 4, la 5 y la 6** (1-3 juntas en
la primera; el salto de la 5 se añadió el 05/10 al ver que el desglose
arrancaba al pie de una página y se partía); ninguna señal partida.

**Medidas**: A4, márgenes 20 mm arriba y abajo y 18 mm a los lados;
Literata 11 pt en el cuerpo (600 en las negritas); títulos de sección en
Atkinson 14 pt; etiqueta del resultado 16 pt; pie 10 pt; URL 9,5 pt; siglas
9 pt (tamaños del modelo, 04/10); interlineado 1,45 (el del marco medido el
05/10); orphans/widows 2; `break-inside: avoid` por regla [CONVENCIÓN del
informe]. Número de página «n / N» abajo a la derecha (Atkinson 9 pt,
ink-2): en papel por `@page @bottom-right` (donde el navegador no tenga
cajas de margen, no sale); en el PDF por el pie de pdfmake. Sin color
imprescindible: la sigla y el estilo de línea distinguen las familias. En
el PDF, la doble discontinua de Ortotipografía se dibuja como discontinua
fina (pdfmake no la tiene) y la sigla [O] la distingue. Si en el diálogo
de Chrome se elige «Márgenes: Ninguno», la hoja pone los márgenes por
dentro y el número de página desaparece; el README lo advierte.

## 7 · Componentes y estados

| componente | estados |
|---|---|
| Pastilla del resultado | 6 etiquetas de la 9.2 + texto corto + sin referencia + paquete propio con escala |
| Tarjeta «lo que más pesa» | con meta (estadística) / con recuento (patrón) / ausencia («ni una vez») / «Empieza por» en la primera / sin puntuables («bien») |
| Tarjeta de familia (leyenda) | activa / ocultada con el ojo / sin señales (atenuada) / informativa (Canal) / paquete propio (discontinuo) |
| Tramo subrayado | reposo (tinte 14 % + línea + sigla) / foco visible (anillo 2 px, ≥ 3:1) / activo (tarjeta abierta: tinte 28 %, línea más gruesa) / solapado (dos líneas apiladas, tinte de la primera familia) |
| Tarjeta de regla (escritorio) y hoja inferior (móvil) | abierta / «¿Por qué?» desplegado / regla propia sin ficha (sin enlace) / anterior-siguiente deshabilitados en los extremos |
| Cuadro de texto | vacío con placeholder / con texto / insuficiente (< 100) / corto (100-299, aviso) / error de carga de paquete (botón desactivado) |
| Cargador de paquetes | sin propios / propio cargado (nombre, versión, reglas, Quitar) / error con lista de mensajes / «los paquetes han cambiado» |
| Selector de género | General primero, alfabético, nombres visibles (Opinión (críticas de cine)) |
| Botones | principal (índigo, texto blanco) / secundario (borde) / desactivado (≥ 3:1 el texto) / foco |
| Catálogo | con filtros / sin resultados («Ninguna regla con esos filtros») |
| Informe | con resultado / sin análisis («No hay análisis que imprimir») |

Foco visible en todo lo operable: anillo de 2 px en el índigo, con
desplazamiento de 2 px (2.4.7; meta 2.4.13).

## 8 · Icono y favicon

**Elegido por Antonio el 04/10 en Figma Make**: la variante **(a)** (hoja
blanca con esquina doblada sobre cuadrado #1A1A1A de radio 96; tres líneas
en tinta y la central subrayada en #332288) para favicon, manifiesto y
apple-touch; la variante **(c)** (círculo #332288 con la hoja en negativo,
líneas en índigo y la central en #D55E00) para la cabecera y la portada;
la (b) descartada (se funde en fondo oscuro). Los SVG, limpios, están en
`docs/figma/icono/`; la zona segura maskable (círculo de 409) se respeta.
**En la cabecera** [PROPIO, 04/10; tamaño corregido por Antonio al ver la
tanda 1]: el icono (c) como círculo de **56 px** en escritorio (la altura
del bloque nombre + eslogan) a 12 px del nombre; **48 px** en la cabecera
compacta del móvil (Antonio lo vio pequeño a 32 en su iPhone); `alt=""` porque el nombre ya es texto. El icono (a) no
necesita modo oscuro: se ve bien sobre claro y sobre oscuro.

**Documento en negativo** [PROPIO], el concepto del que salieron las tres
variantes (elección arriba): una hoja con esquina doblada, invertida
(fondo oscuro, hoja clara), con tres líneas «de texto» de las que la
central va subrayada: a contraluz se nota todo. Una o dos formas planas;
nada que desaparezca a 16 px. Variantes para que Antonio elija: (a) hoja
clara sobre cuadrado oscuro; (b) hoja oscura con líneas claras y una
subrayada en el acento; (c) la hoja como silueta recortada en el índigo.
Entrega: `icon.svg`,
`favicon.ico` 32, `apple-touch-icon.png` 180, manifiesto con 192/512 y 512
maskable (zona segura: círculo de 409) [CONVENCIÓN Evil Martians 2026];
`PROCEDENCIA.md` con autoría, fecha, obra original, licencia, SVG fuente,
herramienta y hash.

## 9 · Resumen ejecutivo — lo que Antonio valida antes de abrir Figma

1. Hemingway como molde; dos columnas en escritorio, una columna en
   tableta, pestañas en móvil.
2. La pastilla del resultado como ancla visual: etiqueta grande + frase;
   sin semáforo ni porcentaje.
3. «Lo que más pesa» como tarjetas por regla; la leyenda como tarjetas de
   familia con ojo.
4. Tramos con fondo suave tipo rotulador más línea con estilo propio y
   sigla (cambio de Antonio del 04/10 sobre el subrayado solo); la paleta
   de ocho de la sección 4 (≥ 3,4:1), pendiente del simulador.
5. Tarjeta anclada al tocar (escritorio) y hoja inferior (móvil), una
   regla a la vez con anterior/siguiente.
6. Literata (texto) y Atkinson Hyperlegible Next (interfaz), autoalojadas.
7. Columna de 60-66 caracteres, 18-19 px, interlineado 1,5.
8. Catálogo con filtros en columnas; informe por secciones numeradas.
9. Icono «documento en negativo»: elegidas la (a) para favicon y la (c)
   para cabecera y portada (04/10).
10. Fuera de la v1: modo oscuro completo (solo el icono lo respeta),
    animaciones, Highlight API, personalización de colores.

Con la firma de estas diez líneas se escribe el brief a Figma Make
(sección siguiente, 10.2 del plan) y se abre el modelado.

## 10 · Huecos declarados (del informe)

Serif/sans sin evidencia; paleta sin simulador; patrón ARIA del tramo sin
prueba con lector de pantalla; Hemingway y LanguageTool solo por
prospección propia; CSS Paged Media sin leer la especificación; Reserved
Font Name de Literata y Atkinson sin comprobar; escala tipográfica
[PROPIO]. Se cierran en el calco (10.4) y en el acta de contraste (10.5).
