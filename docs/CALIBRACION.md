# Calibración, validación y escala

Cómo se comparan las reglas estadísticas con textos de personas: los
corpus, cómo se reproduce la calibración, la validación con sus cifras y la
escala del medidor. El resumen está en el
[README](../README.md#reglas-y-evidencia).

Hasta el 06/10/2026 este texto estaba en el README. En el encargo 11.4 se
trasladó aquí tal cual. Solo cambiaron los enlaces y, delante de los que
ahora llevan a otro documento, «abajo» por «en».

---

## Estadística

Trece reglas de RadiografIA no buscan palabras: miden el texto entero con
una métrica y comparan la cifra con **los textos humanos de su mismo género
y su mismo tramo de longitud**, nunca con un umbral fijo. Los percentiles
vienen en el propio paquete (abajo, [«Calibración»](#calibración)), y el
género lo elige quien analiza; si no elige, «general».

- **Siete puntúan**, y cada una mira un solo lado de la banda humana:

  | regla | métrica | señala si queda | peso | evidencia |
  |---|---|---|---|---|
  | `est-frases-cortas` | frases por 100 palabras | por encima del p95 | 3 | medido en español |
  | `est-poca-puntuacion-secundaria` | paréntesis, comillas, punto y coma, dos puntos, barras y raya por 1.000 palabras | por debajo del p5 | 3 | medido en español |
  | `est-pocas-comas` | comas por punto | por debajo del p1 | 3 | medido en español |
  | `est-poca-puntuacion` | signos por 1.000 palabras | por debajo del p1 | 3 | medido en español |
  | `est-ritmo-uniforme` | dispersión de la longitud de frase | por debajo del p1 | 2 | medido en inglés |
  | `est-nominalizacion` | nominalizaciones por 1.000 palabras | por encima del p99 | 2 | medido en inglés |
  | `est-repeticion-de-secuencias` | secuencias de cuatro palabras repetidas | por encima del p99 | 1 | medido en inglés |

  Con el corte en el p95 (o el p5), 1 de cada 20 textos humanos de su celda
  queda fuera; con el p99 (o el p1), 1 de cada 100. Una regla que se sale
  suma su peso entero, una vez por texto. Por qué cinco cortan en el p99 o
  el p1, abajo, en [«Validación»](#validación).
- **Seis son de contexto**: informativas, se enseñan y no suman. Miran los
  dos lados (por debajo del p5 o por encima del p95), así que 1 de cada 10
  textos humanos queda fuera. Son la variedad léxica (MATTR, MTLD, HD-D y
  TTR), la legibilidad de Flesch-Szigriszt y los pronombres anafóricos.
- **«Sin calibración» existe.** Si el género elegido no tiene celda para la
  longitud del texto (la narrativa clásica de 100 a 299 palabras), las
  reglas estadísticas no se evalúan y el análisis lo dice, regla por regla.
  Con menos de 100 palabras de prosa no se analiza nada.
- **No demuestran autoría.** La dirección de cada regla sale de los
  estudios que cita su ficha, y salirse de lo habitual en su género no dice
  quién escribió el texto.
- **Texto cortado a mano.** Desde el 6.1, un salto de línea simple no parte
  el párrafo (en [«Cómo está pensado»](WEB.md#cómo-está-pensado)). Los 341
  textos humanos de validación de «general», cortados a 76 columnas, hacen
  saltar `est-frases-cortas` en el 4,4 % (el 4,1 % tal cual), y la tasa de
  falsos positivos es la misma en los dos casos, el 2,9 %. Con el motor
  anterior, que tomaba cada línea por un párrafo, eran el 43,2 % y el 8,0 %,
  sobre los 287 textos de entonces.

## Calibración

El detector estadístico nunca compara un texto con un umbral fijo: lo
compara con **textos humanos de su mismo género y su mismo tramo de
longitud**. Esos textos están medidos de antemano, y el paquete RadiografIA
trae, en `cabecera.calibracion`, sus percentiles (p1, p5, p50, p95 y p99)
para cada una de las trece métricas y para el total del propio paquete,
en seis géneros y tres tramos (100-299, 300-599 y 600 palabras o más).

El total se recalculó en el 5.6 con las trece reglas estadísticas dentro,
cada una comparada con las celdas de su métrica que trae el paquete. En el
6.1, cuando el motor pasó a leer los párrafos como CommonMark, se midió todo
otra vez, en dos vueltas: la segunda, para que el total se calculara con las
celdas nuevas ya dentro del paquete.

### Cómo se reproduce

Las herramientas están en
[`motor/herramientas/calibrar/`](../motor/herramientas/calibrar/), y se
ejecutan a mano desde `motor/`:

1. **Cada corpus, con su descargador**: `descargar-noticia.ts`,
   `descargar-administrativo.ts`, `descargar-narrativa-clasica.ts`,
   `descargar-academico.ts` y `descargar-opinion.ts`. Cada uno lee la
   licencia en origen, respeta el `robots.txt` y la pausa de cada sitio, y
   no pasa de 30 minutos de descarga. Los textos van a `motor/corpus/`,
   que no se versiona; el manifiesto no lleva texto. Los del BOE y los de
   Gutenberg dejan una línea en blanco entre párrafo y párrafo, uno por
   cada `<p>` del original. El CSIC trae una frase por línea y no conserva
   los párrafos: su manifiesto lo declara, y que el motor una esas líneas es
   lo correcto.
2. **`node herramientas/calibrar/regenerar-textos.ts administrativo`** (y
   `narrativa-clasica`), desde el 6.1: vuelve a sacar los mismos documentos
   de la copia de los originales que guarda el descargador en
   `motor/corpus/<género>/fuente/`, sin red y sin volver a muestrear, con
   la línea en blanco entre párrafos. Para si falta un original o si un
   texto cambia en algo más que los espacios y los saltos.
3. **`node herramientas/calibrar/calibrar.ts <género>`**: mide cada documento
   con el motor de hoy (el mismo segmentador y las mismas métricas que
   medirán tu texto) y escribe en [`data/calibracion/`](../data/calibracion/)
   las celdas, las omitidas, los disparos de cada regla por tramo y las
   notas, más el manifiesto: id, huella sha256, tramo y reparto de cada
   documento, sin texto.
4. **`construir-general.ts`** y después `calibrar.ts general`, para la mezcla.
5. **`inyectar-calibracion.ts`**: vuelca las celdas de los seis ficheros en
   el paquete. Solo las celdas: las notas se quedan en `data/calibracion/`.
6. **`validar.ts`**: analiza con el paquete los textos de validación y
   escribe [`validacion.json`](../data/calibracion/validacion.json) (abajo,
   [«Validación»](#validación)).

Las reglas son siempre las mismas:

- **Semilla** `radiografia-calibracion-2026`. Con ella, la huella sha256 de
  cada id decide la muestra y el reparto: el 80 % va a calibración, y el
  20 % a validación, con la que se midieron los falsos positivos en el 5.6.
  Sin generador aleatorio: se reproduce igual.
- **Percentiles de tipo 7** de Hyndman y Fan (el de R por defecto), los
  mismos que calcula el motor.
- **Mínimo 100 documentos de calibración por celda.** Una celda que no llega
  no se rellena: se declara omitida y el motor dice «sin calibración» en ese
  género y tramo.
- **Cada fichero lleva el commit del motor** con que se midió. Si cambian el
  segmentador o el silabeo, se vuelve a medir, como en el 6.1.

### Los seis géneros

Mediana (p50) de cuatro de las catorce claves, sacada de los ficheros de
`data/calibracion/` al escribir esto:

| género | tramo | n (calibración) | frases por 100 palabras | MATTR-50 | nominalizaciones por 1.000 | total RadiografIA |
|---|---|---|---|---|---|---|
| `noticia` | 100-299 | 357 | 3,60 | 0,802 | 36,0 | 0,0 |
|  | 300-599 | 354 | 3,18 | 0,799 | 38,4 | 2,4 |
|  | 600+ | 109 | 2,80 | 0,800 | 39,3 | 3,0 |
| `administrativo` | 100-299 | 155 | 7,09 | 0,731 | 91,6 | 0,0 |
|  | 300-599 | 100 | 4,84 | 0,748 | 71,6 | 0,0 |
|  | 600+ | 110 | 4,12 | 0,739 | 87,4 | 1,0 |
| `narrativa-clasica` | 100-299 | 65 (sin celda) | — | — | — | — |
|  | 300-599 | 124 | 5,78 | 0,814 | 18,2 | 10,2 |
|  | 600+ | 895 | 5,24 | 0,820 | 20,0 | 15,9 |
| `academico` | 100-299 | 99 (sin celda) | — | — | — | — |
|  | 300-599 | 100 | 3,05 | 0,798 | 48,7 | 5,1 |
|  | 600+ | 101 | 3,02 | 0,795 | 53,8 | 5,5 |
| `opinion` | 100-299 | 739 | 2,66 | 0,821 | 20,8 | 0,0 |
|  | 300-599 | 1663 | 3,02 | 0,818 | 23,9 | 3,0 |
|  | 600+ | 726 | 2,95 | 0,816 | 27,8 | 4,0 |
| `general` | 100-299 | 465 | 3,63 | 0,795 | 38,5 | 0,0 |
|  | 300-599 | 500 | 3,59 | 0,799 | 34,7 | 1,9 |
|  | 600+ | 505 | 3,36 | 0,802 | 38,1 | 3,9 |

Celdas publicadas: 42 por género (14 claves × 3 tramos) en noticia,
administrativo, opinión y general; en narrativa clásica y en académico, 28,
con las 14 de 100-299 omitidas. En total van al paquete 224 celdas.

- **`noticia`**: [UD Spanish-AnCora](https://github.com/UniversalDependencies/UD_Spanish-AnCora)
  r2.18, noticias de la agencia EFE y de El Periódico del año 2000, sin el
  subcorpus Cast3LB.
- **`administrativo`**: el BOE de 2000 a 2021, con disposiciones generales,
  resoluciones y anuncios.
- **`narrativa-clasica`**: capítulos de novelas y cuentos de [Project
  Gutenberg](https://www.gutenberg.org) de autores muertos en 1945 o antes,
  con un máximo de 5 capítulos por libro y tramo. Fuera traducciones,
  crítica, obras en diálogo y lo que no es narración.
- **`academico`**: el [CSIC Spanish
  Corpus](https://doi.org/10.5281/zenodo.7313126), artículos de las revistas
  del CSIC, leído por rangos de bytes sin bajarlo entero.
- **`opinion`**: críticas de cine de usuarios de MuchoCine (hacia 2005-2008).
  Por eso en el selector se llama «Opinión (críticas de cine)».
- **`general`**, el género por defecto: por tramo, los géneros que tienen ese
  tramo calibrado y el mismo número de documentos de cada uno, elegidos por
  huella. En 100-299 entran noticia, administrativo y opinión, 155 de cada
  uno; en 300-599, 5 × 100; en 600+, 5 × 101.

### Lo que no está

- **Corporativo o de marketing**: no hay un corpus abierto con licencia que
  lo permita. Ese género no existe y la interfaz dirá «sin calibración».
- **Narrativa clásica de 100 a 299 palabras**: quedaron 65 capítulos de
  calibración, menos de 100. No se subió el tope por libro para llenar la
  celda, porque se habría concentrado en tres libros.
- **Académico de 100 a 299 palabras**: desde el 6.1 quedan 99 documentos de
  calibración, uno menos del mínimo. En un artículo, una cita partida en dos
  líneas deja la segunda empezando por «129) », y el motor anterior la
  contaba como viñeta. Con los párrafos de CommonMark es prosa, y el
  artículo gana palabras y pasa a 300-599. No se ajustó nada. Ampliar la
  muestra por huella, con la misma semilla, queda para la v1.1.
- **Wikipedia**: la investigación la proponía para «general»; la mezcla
  lleva solo los cinco géneros calibrados.

### Advertencias

- **Narrativa clásica es anterior a 1946**: arrastra un sesgo de época
  (siglos XVI a XX, sobre todo XIX) y no representa la narrativa
  contemporánea. La raya de diálogo, norma en español, hace saltar
  `pf-raya-densidad` en 813 de 895 capítulos de 600+.
- **Administrativo mezcla tres subgéneros** con percentiles conjuntos, con
  un tope del 60 % por subgénero en cada tramo. No es la proporción natural
  del BOE; el subgénero de cada documento queda en el manifiesto, para
  recalibrar por subgénero más adelante.
- **Académico lleva OCR**: hay artículos escaneados con errores como
  «informaci6n». Está medido por unidad en el manifiesto, sin filtrar: 24 de
  361 unidades tienen una marca o más por cada 1.000 palabras, y quitarlas
  apenas mueve los percentiles. En 100-299 y 300-599 casi todo son fragmentos de frases
  completas de artículos más largos.
- **Opinión, solo cifras**: la licencia CC BY 2.1 ES la declaran los
  curadores del corpus y no está verificada en origen. No se publica ninguna
  muestra.
- **El total RadiografIA depende del género.** En 600+, su mediana va de
  1,0 en administrativo a 15,9 en narrativa clásica. Por eso el medidor
  compara cada texto con los de su género y su longitud (abajo,
  [«Escala»](#escala)), y no con una cifra fija.
- **Frases en prensa**: AnCora da 28,56 palabras por frase en su anotación
  manual, entre 2,8 y 3,6 frases por 100 palabras. Coincide con la
  investigación (Schaaff et al., 2023: unas 27 palabras por frase).
- **Segmentador**: el del motor no parte las frases igual que la anotación
  de AnCora en 129 de 1025 documentos (93 con más frases, 36 con menos).
  Las medianas casi coinciden: 3,57 frente a 3,52 en 100-299, 3,19 frente a
  3,16 en 300-599 y 2,85 frente a 2,88 en 600+. Medido otra vez con el motor
  del 6.1, sale igual.

Las licencias de cada corpus, citadas literalmente, están en
[`data/calibracion/LICENSE-CORPUS.md`](../data/calibracion/LICENSE-CORPUS.md).

## Validación

Las reglas estadísticas se comprueban con los textos humanos que **no** se
usaron para calibrar: el 20 % de cada corpus, apartado por huella antes de
medir nada. La cifra es la **tasa de falsos positivos (FPR)**: la
proporción de esos textos en los que saltan dos o más reglas estadísticas
que puntúan. El plan pide que no pase del 5 %. La mide
[`validar.ts`](../motor/herramientas/calibrar/validar.ts), que deja el
resultado, sin texto, en
[`data/calibracion/validacion.json`](../data/calibracion/validacion.json).

**Se juzga por género**, con sus tres tramos juntos. En las celdas más
pequeñas, de 19 a 32 textos de validación, uno o dos textos ya pasan del
5 % (1 de 19 es el 5,3 %, y 2 de 32, el 6,3 %): celda a celda, el criterio
sería «ninguno» o «uno». Es una decisión propia, firmada por Antonio en la
parada 2 del 5.6. Las celdas se enseñan igual, una a una.

| género | textos | FPR | intervalo de Wilson al 95 % | al menos una regla |
|---|---|---|---|---|
| `general` | 341 | 2,9 % (10) | 1,6 % a 5,3 % | 14,4 % |
| `noticia` | 205 | 2,4 % (5) | 1,0 % a 5,6 % | 15,1 % |
| `administrativo` | 98 | **5,1 % (5)** | 2,2 % a 11,4 % | 19,4 % |
| `narrativa-clasica` | 274 | 2,2 % (6) | 1,0 % a 4,7 % | 13,1 % |
| `academico` | 43 | 2,3 % (1) | 0,4 % a 12,1 % | 32,6 % |
| `opinion` | 742 | 1,1 % (8) | 0,5 % a 2,1 % | 12,9 % |

En conjunto, 35 de 1.703 textos: el 2,1 %. El intervalo es el de Wilson
(1927), con la fórmula del manual de estadística de NIST/SEMATECH
([§ 7.2.4.1](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)):
el rango de proporciones que la muestra no permite descartar. El de
general, noticia y académico también incluye el 5 %: la muestra tampoco
demuestra que estén por debajo. Los de narrativa clásica y opinión quedan
enteros por debajo.

**Revalidado en el 6.1**, con el motor nuevo de párrafos y la misma
muestra: ningún género sube. Bajan narrativa clásica (del 2,9 % al 2,2 %)
y académico (del 3,3 % al 2,3 %), que pierde los 18 textos de 100 a 299
palabras porque ese tramo se quedó sin celda. General pasa de 287 a 341
textos porque cambió su mezcla (arriba, [«Los seis
géneros»](#los-seis-géneros)). Administrativo sigue igual, con los mismos
cinco textos.

**Revalidado en el 6.4**, después de ampliar las listas de dos ausencias:
D3, sin marcadores epistémicos, y D4, sin automenciones (abajo, [«Qué se
ajustó y por qué»](#qué-se-ajustó-y-por-qué)).

- **La FPR no cambia en ningún género:** D3 y D4 no son reglas
  estadísticas.
- **Administrativo** sigue igual, con los mismos cinco textos.
- **Cambia el total en opinión y académico.** Por eso se recalculó su celda
  de calibración y la tabla por celda de abajo lleva las cifras nuevas.

**Administrativo queda en 5,1 % (5 de 98) y se acepta con declaración.**
Lo decidió Antonio el 01/10/2026, y para este género modifica el criterio
del plan. Los motivos:

- el criterio se cumple en los otros cinco géneros y en el conjunto;
- con 98 textos, el intervalo de Wilson va del 2,2 % al 11,4 % e incluye el
  5 %: la muestra no distingue 5,1 % de 5 %;
- cuatro de los cinco textos son el falso positivo de formato ya declarado
  en las fichas: tablas del BOE pasadas a texto y un formulario de párrafos
  numerados. El quinto repite una fórmula legal, como declara la ficha de
  `est-repeticion-de-secuencias`;
- no se excluyó ningún texto ni se cambió nada después de ver la
  validación.

Que el motor trate las tablas pasadas a texto como no-prosa queda para la
v1.1, con esos cinco textos como casos de prueba (sus ids, en
`validacion.json` y en la nota de
[`administrativo.json`](../data/calibracion/administrativo.json)).

Por celda (el total, en puntos: su mediana y su p95 en validación frente a
la celda de calibración):

| género | tramo | textos | FPR | al menos una regla | total p50: validación / calibración | total p95: validación / calibración |
|---|---|---|---|---|---|---|
| `general` | 100-299 | 126 | 0,8 % (1) | 7,9 % | 0,0 / 0,0 | 13,0 / 14,1 |
|  | 300-599 | 120 | 4,2 % (5) | 16,7 % | 3,0 / 1,9 | 27,9 / 32,2 |
|  | 600+ | 95 | 4,2 % (4) | 20,0 % | 4,0 / 3,9 | 24,0 / 30,4 |
| `noticia` | 100-299 | 86 | 1,2 % (1) | 5,8 % | 0,0 / 0,0 | 27,2 / 16,4 |
|  | 300-599 | 98 | 3,1 % (3) | 21,4 % | 3,0 / 2,4 | 20,1 / 17,6 |
|  | 600+ | 21 | 4,8 % (1) | 23,8 % | 2,3 / 3,0 | 13,3 / 13,7 |
| `administrativo` | 100-299 | 42 | 4,8 % (2) | 19,0 % | 0,0 / 0,0 | 5,9 / 3,0 |
|  | 300-599 | 24 | 0,0 % (0) | 16,7 % | 0,0 / 0,0 | 3,0 / 4,7 |
|  | 600+ | 32 | 9,4 % (3) | 21,9 % | 2,5 / 1,0 | 6,4 / 6,9 |
| `narrativa-clasica` | 100-299 | 19 (sin celda) | — | — | — | — |
|  | 300-599 | 30 | 6,7 % (2) | 20,0 % | 7,8 / 10,2 | 53,3 / 74,6 |
|  | 600+ | 244 | 1,6 % (4) | 12,3 % | 14,5 / 15,9 | 51,2 / 48,5 |
| `academico` | 100-299 | 18 (sin celda) | — | — | — | — |
|  | 300-599 | 24 | 4,2 % (1) | 41,7 % | 6,7 / 5,1 | 14,2 / 21,0 |
|  | 600+ | 19 | 0,0 % (0) | 21,1 % | 5,4 / 5,4 | 11,1 / 13,6 |
| `opinion` | 100-299 | 178 | 0,6 % (1) | 12,4 % | 0,0 / 0,0 | 21,6 / 19,4 |
|  | 300-599 | 383 | 0,8 % (3) | 9,9 % | 2,0 / 2,0 | 15,3 / 15,1 |
|  | 600+ | 181 | 2,2 % (4) | 19,9 % | 4,4 / 3,8 | 11,0 / 12,1 |

### Qué se ajustó y por qué

La primera validación, en el 5.6, con las siete reglas cortando en el p95
(o el p5), dio un **7,7 %** en conjunto (128 de 1.667), y 13 de las 17
celdas pasaban
del 5 %. Por género: general 8,4 %, noticia 7,3 %, administrativo 13,3 %,
narrativa clásica 10,2 %, académico 13,1 % y opinión 5,4 %. Con siete
reglas independientes, cada una en el 5 %, lo esperable era un 4,4 %. El
exceso venía, sobre todo, de reglas que miden casi lo mismo:
`est-frases-cortas` y `est-pocas-comas` cuentan los mismos puntos, y los
signos de la puntuación secundaria son parte de los de la puntuación.

Lo que se cambió, firmado por Antonio en la parada 2 y escrito en la ficha
de cada regla:

- **Al p99 o el p1** (1 de cada 100): `est-pocas-comas` y
  `est-poca-puntuacion`, porque dependen de otra regla;
  `est-ritmo-uniforme`, `est-nominalizacion` y
  `est-repeticion-de-secuencias`, porque están medidas en inglés.
- **Se quedan en el p95 o el p5** las dos medidas en español que no
  dependen de otra: `est-frases-cortas` y `est-poca-puntuacion-secundaria`.
- **Nada más**: ni pesos ni direcciones, y ninguna regla estadística se
  limita a unos géneros.

Las tablas pasadas a texto, los párrafos numerados y los títulos sin punto
quedan declarados como falso positivo conocido en las fichas de frases
cortas, pocas comas, poca puntuación y poca puntuación secundaria. En la
validación del 5.6, siete reglas de otras familias saltaban en más del
25 % de los textos humanos de algún género, por ejemplo la raya en la
narrativa (92,3 %) o la falta de marcadores de opinión en lo académico
(47,5 %). En la del 6.1 son nueve. Lo académico se valida ahora solo
desde 300 palabras, donde las ausencias sí se juzgan, y sube: la falta de
marcadores de opinión llegó al 67,4 %. Pasan también del 25 %
`lex-no-solo-sino` (32,6 %) y `lex-importancia` (30,2 %), las dos en lo
académico. Las fichas de esas nueve reglas llevan las cifras de la
revalidación del 6.1 (02/10/2026), con su fecha. En la v1 no se ajustan.
El detalle, regla a regla y celda a celda, está en `validacion.json`.

**La ampliación 6.4** (02/10/2026, firmada por Antonio) no ajusta ningún
umbral: completa dos listas que se habían quedado cortas. Los textos de
ejemplo lo destaparon.

- **D3, sin marcadores epistémicos.** La lista solo llevaba «me parece» de
  «parecer», y una sola forma de cada verbo. Ahora lleva la primera persona
  de creer, pensar, suponer, opinar y considerar que en cuatro tiempos, y
  «parecer» con «me» o «nos». Los lemas son los de Herbold et al. 2023.
- **D4, sin automenciones.** No contaba «me» ni «nos». Ahora sí: son
  siempre de primera persona, y Tang y John (1999) los cuentan entre las
  automenciones.

Son reglas de ausencia, así que disparan menos. En los textos apartados:

| regla | académico (300 palabras o más) | opinión |
|---|---|---|
| D3 | 67,4 % → 58,1 % | 36,9 % → 32,5 % |
| D4 | 53,5 % → 39,5 % | 23,7 % → 6,5 % |

Las fichas de D3 y D4 llevan ya las cifras del 6.4.

**Límites del método.** Hay una sola validación, con la misma muestra
medida dos veces: antes de los ajustes y después. Los ajustes se
propusieron con lo que se veía en los textos de calibración, pero su
efecto en la validación se enseñó, simulado, antes de firmarlos. La
decisión sobre administrativo se tomó viendo la validación. La
revalidación del 6.1 midió la misma muestra una tercera vez, con el motor
nuevo, y después no se cambió nada. La del 6.4 la midió una cuarta vez.
Las listas de D3 y D4 se fijaron con sondas y fuente. Su efecto en estos
textos se enseñó en la parada, antes de firmarlas, y después no se cambió
nada. Con eso, el 20 % apartado ya no es una
muestra que nadie haya mirado: para una comprobación limpia hace falta
otra muestra.

## Escala

El medidor no da veredicto ni tiene tope. Dice **dónde cae el total del
texto respecto a los textos humanos de su mismo género y tramo**, con las
celdas de `_total-radiografia` (arriba, [«Calibración»](#calibración)).
Hay cuatro bandas:

| banda | el total del texto |
|---|---|
| por debajo de la mediana | es menor que el de la mitad de los textos humanos de su celda |
| entre la mediana y el p95 | está entre la mediana y el p95, los dos incluidos: lo habitual |
| por encima del p95 | supera el p95 y llega como mucho al p99 |
| por encima del p99 | supera el p99 |

La calcula `bandaHumana()`
([`motor/src/banda.ts`](../motor/src/banda.ts)), y `analizar()` la devuelve
en el resultado de cada paquete, con los percentiles de referencia (p5,
p50, p95 y p99) y el número de textos de la celda. La pantalla la dice en
texto claro: «Tu texto queda por encima del p95 de los textos humanos del
género “Noticia” de 300 a 599 palabras», con su total y los percentiles.

- **Sin banda.** Un paquete sin clave `_total-*` en su calibración, como
  «Español correcto», no tiene banda. Si el género no tiene celda para esa
  longitud, o el texto es insuficiente, la banda es «sin calibración», con
  el motivo.
- **Los bordes** son decisión propia: «por encima» es estrictamente por
  encima, como en las reglas estadísticas, y la mediana y el p95 caen
  «entre la mediana y el p95».
- ⚠️ **Mediana 0.** En cinco celdas, la mitad de los textos humanos no da
  ninguna señal y la mediana del total es 0: los cuatro géneros con celda
  de 100 a 299 palabras y administrativo de 300 a 599. Ahí, un texto sin
  ninguna señal cae «entre la mediana y el p95», porque está justo en la
  mediana. Por eso la pantalla, con un total de 0, dice «sin señales» y no
  da la banda.
