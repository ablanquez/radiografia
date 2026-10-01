<div align="center">

# RadiografIA

**A contraluz se nota todo.**

[![Licencia](https://img.shields.io/badge/licencia-Apache%202.0-64748B)](LICENSE)
[![Estado](https://img.shields.io/badge/estado-en%20construcci%C3%B3n-F59E0B)](#hoja-de-ruta)

</div>

> Pegas un texto en español, pulsas **«Pon tu texto a contraluz»** y ves
> qué patrones de *estilo IA* hay en él: subrayados por familia, un medidor
> con su desglose y, en cada señal, la regla que la disparó, por qué y qué
> harías tú.
>
> ⚠️ **Analiza estilo. No demuestra autoría.** Un texto lleno de señales
> puede ser de una persona; uno limpio puede ser de una máquina. La
> herramienta señala rasgos, no firma sentencias.

---

## Qué es

Un analizador de textos **por reglas**, no por modelo. No hay red neuronal
detrás ni llamada a ninguna API: cada señal la produce una regla escrita a
mano, con su explicación, su sugerencia y sus ejemplos, y se puede leer una
por una en el catálogo.

El motor **no sabe nada de «IA»**. Aplica un **paquete de reglas** en JSON.
RadiografIA es el primer paquete y «español correcto» el segundo; el
siguiente puede ser la guía de estilo de tu empresa. Se cargan paquetes
propios desde el ordenador, se combinan, y **nada sale del navegador**: ni
el texto ni las reglas.

## Estado

**En construcción.** Hoy (30/09/2026) existe el plan firmado, la
investigación de las familias en [`docs/investigacion/`](docs/investigacion/)
y, en la carpeta [`motor/`](motor/), el **motor completo**, probado con
paquetes de prueba:

- el **esquema del paquete y de la ficha de regla** (JSON Schema 2020-12),
  con los parámetros de cada tipo de detector ya cerrados, y un
  **validador** que dice qué regla y qué campo fallan, probado con un
  paquete válido y uno roto a propósito por cada error que tiene que saber
  nombrar;
- el **texto segmentado** en párrafos, frases y palabras, con sus posiciones
  exactas sobre el original y cada párrafo marcado como prosa o no (viñetas,
  tablas y código no cuentan);
- el **umbral de longitud**: menos de 100 palabras de prosa, texto
  insuficiente y no se analiza; de 100 a 299, resultado poco fiable; 300 o
  más, completo;
- los **detectores de patrón y estructural**: formas o expresiones regulares
  por palabra o por frase, y expresiones en una posición (principio o final
  de frase o de párrafo, último párrafo, o en cualquier punto de un párrafo).
  Miran solo la prosa, salvo las reglas que buscan formato pegado, que miran
  también viñetas, encabezados y tablas; el código, nunca. Una regla puede
  pedir un mínimo de apariciones, señalar solo la forma que se repite cierto
  número de veces o, al revés, señalar que algo falta en el texto entero (las
  ausencias no se juzgan por debajo de 300 palabras de prosa); y puede
  limitarse a ciertos géneros, que se eligen al analizar;
- el **detector estadístico**: mide el texto entero con una métrica y la
  compara con los percentiles de textos humanos del mismo género y del mismo
  tramo de longitud, que trae el propio paquete; nunca con un umbral fijo. El
  género lo elige quien analiza (por defecto, «general»);
- la **puntuación**: puntos por 1.000 palabras de prosa, con su desglose por
  familia y por regla; las reglas informativas se enseñan pero no suman y
  los atenuantes restan. Cómo se muestra el medidor (escala, tope) se decide
  al calibrar con las reglas reales;
- la **combinación de paquetes**: se analizan varios a la vez, cada señal
  dice de qué paquete viene y cada paquete lleva su propio desglose. Está
  probada también con los dos paquetes reales juntos.

Las **métricas** del detector estadístico, cada una con su fórmula y su
fuente en [`motor/src/metricas/`](motor/src/metricas/):

- de frase: frases por cada 100 palabras, dispersión de la longitud de
  frase (coeficiente de variación) y el índice de legibilidad de
  Flesch-Szigriszt;
- de vocabulario: variedad léxica (TTR, MATTR con ventana de 50, MTLD y
  HD-D) y repetición de secuencias de cuatro palabras;
- de puntuación: comas por punto, signos por cada 1.000 palabras y
  paréntesis, comillas y punto y coma por cada 1.000 palabras;
- de estilo: nominalizaciones (palabras en -ción, -miento, -dad…) y
  pronombres anafóricos, por cada 1.000 palabras; la segunda es solo de
  contexto, porque sin etiquetado gramatical cuenta también artículos y
  determinantes («la», «este»).

Todo está probado con dos paquetes de prueba internos y con los dos paquetes
reales (abajo, [«Paquetes»](#paquetes)): cada ejemplo positivo dispara su
regla y ningún negativo. Los percentiles de los paquetes de prueba son
inventados; los de RadiografIA están medidos con textos humanos (abajo,
[«Calibración»](#calibración)).

Las piezas de apoyo que las reglas necesitarán están **medidas contra
referencias ajenas**, no dadas por buenas:

- **Silabeo**: 57 de 60 palabras silabeadas como la *Ortografía* de la RAE
  (falla en los prefijos *sub-* y en *tungsteno*).
- **Frecuencias**: las 20.000 formas más frecuentes del español
  ([`data/frecuencias/`](data/frecuencias/)).
- **Etiquetado gramatical** (adjetivos, adverbios, pronombres): medido contra
  el corpus UD Spanish-AnCora y **no llega** al umbral fijado (adjetivos
  72,5 %, pronombres 66,9 %, adverbios 91,2 %, sobre frases que no se miraron
  al ajustarlo). Queda **fuera de la v1**, y con él las reglas que lo
  necesitaban; su código se retiró. La medida entera, en
  [`docs/investigacion/pos-medida.md`](docs/investigacion/pos-medida.md).

No hay pantalla: lo que promete la entrada de este README (subrayados,
medidor, catálogo) es lo que se va a construir, en el orden de la [hoja de
ruta](#hoja-de-ruta).

## Paquetes

En [`paquetes/`](paquetes/):

- **RadiografIA 0.1.0** ([`radiografia.json`](paquetes/radiografia.json)):
  declara las seis familias y trae cinco:
  - **léxico**: once reglas. Las cuatro de más peso están medidas en
    español (Juzek, 2026): los verbos de énfasis (destacar, subrayar…),
    «importancia», «innovador» e «imborrable», «multidisciplinario» e
    «impecable». Las demás son traslados del inglés o anécdotas, con menos
    peso: fórmulas de chatbot, «Adicionalmente» al principio de la frase,
    palabras traducidas de las más señaladas en inglés, verbos corporativos
    o «no solo… sino»;
  - **canal** (informativa: se señala y no suma): negrita y encabezados de
    Markdown, viñetas con rótulo en negrita, separadores y tablas, el espacio
    estrecho U+202F y los caracteres de ancho cero. Las de emojis y flechas
    esperan fuente;
  - **puntuación y formato**: la densidad de rayas y la raya con espacios;
  - **discurso**: diez reglas. Dos son ausencias medidas en inglés, y solo
    se juzgan en textos de opinión o académicos de 300 palabras o más:
    ningún marcador de opinión («creo», «quizá») y ninguna mención de quien
    escribe («yo», «mi», «nuestro»). Otras seis suman: el cierre de
    plantilla («En conclusión» en el último párrafo), el mismo conector al
    principio de tres frases o más, el encuadre numerado («En primer
    lugar… Por último»), la importancia inflada («un papel crucial»), la
    atribución sin nombre («los expertos coinciden») y la fórmula de «retos
    y futuro». Y dos restan, porque son rasgos humanos: una referencia
    concreta a otra parte del texto («véase la tabla 2») y una anécdota en
    primera persona («recuerdo que», «mi abuela»);
  - **sintaxis**: una regla, la coletilla de gerundio al final de la frase
    («…, logrando un récord»), medida en inglés: los modelos la usan entre
    dos y cinco veces más. Solo una, porque las demás candidatas de la
    familia son métricas del texto entero, que llegan con la calibración, o
    necesitaban el etiquetado gramatical, que quedó fuera de la v1.

  Estadística está declarada y vacía. Un juez comprueba que ninguna regla va
  sin fuente, que el peso, para sumar o para restar, no pasa del que permite
  su nivel de evidencia, que un atenuante solo resta 1 o 2, que la familia
  canal no suma y que ninguna expresión regular usa `\b` ni `\w`, que en
  JavaScript no reconocen las letras con tilde ni la eñe.
- **Español correcto 0.1.0**
  ([`espanol-correcto.json`](paquetes/espanol-correcto.json)): siete avisos
  de norma de la RAE que suelen delatar un calco del inglés o una
  traducción. **No mide estilo de IA**: cuenta avisos de norma por cada
  1.000 palabras, y cada regla cita la sección de la *Ortografía* o de la
  *Nueva gramática* que la respalda. Dos familias:
  - **gramática**: la pasiva con «ser» y agente, donde el español prefiere
    la activa o la pasiva con «se» («fue redactado por el comité»), y el
    posesivo donde va el artículo («levantó su mano»);
  - **ortotipografía**: el punto o la coma dentro de las comillas de cierre,
    la mayúscula en cada palabra de un título, los meses y los días con
    mayúscula, la coma para separar millares («1,500») y el símbolo de la
    moneda delante de la cifra («$100»). El punto decimal no se avisa: la
    *Ortografía* admite los dos separadores y recomienda el punto.

  Un juez comprueba que son siete, todas de norma, con peso 1 y con su
  sección de rae.es, y que ninguna es informativa.

## Calibración

El detector estadístico nunca compara un texto con un umbral fijo: lo
compara con **textos humanos de su mismo género y su mismo tramo de
longitud**. Esos textos están medidos de antemano, y el paquete RadiografIA
trae, en `cabecera.calibracion`, sus percentiles (p1, p5, p50, p95 y p99)
para cada una de las trece métricas y para el total del propio paquete,
en seis géneros y tres tramos (100-299, 300-599 y 600 palabras o más).

Hoy RadiografIA no tiene reglas estadísticas: las celdas esperan a las que
llegarán con el punto 5.6, y el total también se recalcula entonces.

### Cómo se reproduce

Las herramientas están en
[`motor/herramientas/calibrar/`](motor/herramientas/calibrar/), y se
ejecutan a mano desde `motor/`:

1. **Cada corpus, con su descargador**: `descargar-noticia.ts`,
   `descargar-administrativo.ts`, `descargar-narrativa-clasica.ts`,
   `descargar-academico.ts` y `descargar-opinion.ts`. Cada uno lee la
   licencia en origen, respeta el `robots.txt` y la pausa de cada sitio, y
   no pasa de 30 minutos de descarga. Los textos van a `motor/corpus/`,
   que no se versiona; el manifiesto no lleva texto.
2. **`node herramientas/calibrar/calibrar.ts <género>`**: mide cada documento
   con el motor de hoy (el mismo segmentador y las mismas métricas que
   medirán tu texto) y escribe en [`data/calibracion/`](data/calibracion/)
   las celdas, las omitidas, los disparos de cada regla por tramo y las
   notas, más el manifiesto: id, huella sha256, tramo y reparto de cada
   documento, sin texto.
3. **`construir-general.ts`** y después `calibrar.ts general`, para la mezcla.
4. **`inyectar-calibracion.ts`**: vuelca las celdas de los seis ficheros en
   el paquete. Solo las celdas: las notas se quedan en `data/calibracion/`.

Las reglas son siempre las mismas:

- **Semilla** `radiografia-calibracion-2026`. Con ella, la huella sha256 de
  cada id decide la muestra y el reparto: el 80 % va a calibración, y el
  20 % a validación, que queda para medir los falsos positivos en el 5.6.
  Sin generador aleatorio: se reproduce igual.
- **Percentiles de tipo 7** de Hyndman y Fan (el de R por defecto), los
  mismos que calcula el motor.
- **Mínimo 100 documentos de calibración por celda.** Una celda que no llega
  no se rellena: se declara omitida y el motor dice «sin calibración» en ese
  género y tramo.
- **Cada fichero lleva el commit del motor** con que se midió. Si cambian el
  segmentador o el silabeo, se vuelve a medir.

### Los seis géneros

Mediana (p50) de cuatro de las catorce claves, sacada de los ficheros de
`data/calibracion/` al escribir esto:

| género | tramo | n (calibración) | frases por 100 palabras | MATTR-50 | nominalizaciones por 1.000 | total RadiografIA |
|---|---|---|---|---|---|---|
| `noticia` | 100-299 | 357 | 3,60 | 0,802 | 36,0 | 0,0 |
|  | 300-599 | 354 | 3,18 | 0,799 | 38,4 | 0,0 |
|  | 600+ | 109 | 2,80 | 0,800 | 39,3 | 2,0 |
| `administrativo` | 100-299 | 155 | 7,09 | 0,731 | 91,6 | 0,0 |
|  | 300-599 | 100 | 4,84 | 0,748 | 71,6 | 0,0 |
|  | 600+ | 110 | 4,12 | 0,739 | 87,4 | 0,7 |
| `narrativa-clasica` | 100-299 | 65 (sin celda) | — | — | — | — |
|  | 300-599 | 124 | 5,83 | 0,814 | 18,2 | 10,2 |
|  | 600+ | 895 | 5,26 | 0,820 | 20,0 | 15,5 |
| `academico` | 100-299 | 100 | 3,33 | 0,796 | 53,3 | 0,0 |
|  | 300-599 | 100 | 3,22 | 0,798 | 48,9 | 3,7 |
|  | 600+ | 100 | 3,18 | 0,795 | 53,5 | 5,3 |
| `opinion` | 100-299 | 739 | 2,66 | 0,821 | 20,8 | 0,0 |
|  | 300-599 | 1663 | 3,02 | 0,818 | 23,9 | 3,0 |
|  | 600+ | 726 | 2,95 | 0,816 | 27,8 | 3,7 |
| `general` | 100-299 | 400 | 3,47 | 0,795 | 41,5 | 0,0 |
|  | 300-599 | 500 | 3,63 | 0,799 | 34,7 | 0,0 |
|  | 600+ | 500 | 3,44 | 0,802 | 38,2 | 3,5 |

Celdas publicadas: 42 por género (14 claves × 3 tramos) en noticia,
administrativo, académico, opinión y general; en narrativa clásica, 28, con
las 14 de 100-299 omitidas. En total van al paquete 238 celdas.

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
- **`general`**, el género por defecto: por tramo, los géneros que tienen ese
  tramo calibrado y el mismo número de documentos de cada uno, elegidos por
  huella. En 100-299 entran 4 × 100; en 300-599 y en 600+, 5 × 100.

### Lo que no está

- **Corporativo o de marketing**: no hay un corpus abierto con licencia que
  lo permita. Ese género no existe y la interfaz dirá «sin calibración».
- **Narrativa clásica de 100 a 299 palabras**: quedaron 65 capítulos de
  calibración, menos de 100. No se subió el tope por libro para llenar la
  celda, porque se habría concentrado en tres libros.
- **Wikipedia**: la investigación la proponía para «general»; la mezcla
  lleva solo los cinco géneros calibrados.

### Advertencias

- **Narrativa clásica es anterior a 1946**: arrastra un sesgo de época
  (siglos XVI a XX, sobre todo XIX) y no representa la narrativa
  contemporánea. La raya de diálogo, norma en español, hace saltar
  `pf-raya-densidad` en 814 de 895 capítulos de 600+.
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
- **El total RadiografIA se recalcula en el 5.6.** Hoy no hay reglas
  estadísticas, y aun así la narrativa clásica de 600+ da una mediana de
  15,5 frente a 2,0 en noticia: es el primer dato para los pesos, junto con
  el bloque `disparos` de cada fichero.
- **Frases en prensa**: AnCora da 28,56 palabras por frase en su anotación
  manual, entre 2,8 y 3,6 frases por 100 palabras. Coincide con la
  investigación (Schaaff et al., 2023: unas 27 palabras por frase).
- **Segmentador**: el del motor no parte las frases igual que la anotación
  de AnCora en 129 de 1025 documentos (93 con más frases, 36 con menos).
  Las medianas casi coinciden: 3,57 frente a 3,52 en 100-299, 3,19 frente a
  3,16 en 300-599 y 2,85 frente a 2,88 en 600+.

Las licencias de cada corpus, citadas literalmente, están en
[`data/calibracion/LICENSE-CORPUS.md`](data/calibracion/LICENSE-CORPUS.md).

## Cómo está pensado

- **Astro estático, sin backend.** Todo corre en el navegador.
- **Seis familias de reglas**: léxico, sintaxis, puntuación y formato,
  estadística, discurso y **canal** (Markdown residual, Unicode invisible,
  emojis: artefactos de copiar desde un asistente). Canal es
  **informativa**: se señala y se explica, pero no suma al medidor. Cada
  familia sale de la investigación con fuentes de
  [`docs/investigacion/`](docs/investigacion/), hecha antes de escribir su
  primera regla.
- **Dos paquetes incluidos**: RadiografIA y **«español correcto»**, siete
  avisos de norma RAE (calcos y traducción, no estilo IA) que se combinan
  con el primero desde el desplegable.
- **Tres tipos de detector**: patrón, estructural, estadístico.
- **Ficha por regla**: id, familia, detector y sus parámetros, peso (que
  puede ser **negativo**: un atenuante humano resta), severidad, si es
  **informativa**, explicación, sugerencia, excepciones, **fuentes**,
  **origen de la lista** («inventario propio…» cuando lo es), **nivel de
  evidencia** (medido en español, medido en inglés, anecdótico, sin fuente
  o norma) y ejemplos positivos y negativos. Los ejemplos son la
  documentación y son los tests: cada positivo tiene que disparar la regla y
  cada negativo no. El esquema está en
  [`motor/esquema/`](motor/esquema/).
- **Catálogo público** con una página por regla.
- **Informe PDF** desde la propia página.
- **Las reglas se editan en Git.** No hay CMS.

## Hoja de ruta

El plan completo, con sus casillas, está en
[`PLAN-RADIOGRAFIA.md`](PLAN-RADIOGRAFIA.md). El estado, en
[`RADIOGRAFIA-ESTADO.md`](RADIOGRAFIA-ESTADO.md). Los fallos reales, en
[`docs/BITACORA.md`](docs/BITACORA.md), escritos en caliente.

## Licencia y créditos

Código y paquetes de reglas: **[Apache 2.0](LICENSE)** · © 2026
**Antonio Blánquez Cabeza** — [antonioblanquez.es](https://antonioblanquez.es)

Las dependencias de terceros van una por una, con su licencia, en
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

Las fuentes de cada regla (estudios, guías, corpus) se citan en su ficha y
en el catálogo.

### Datos de terceros

Los datos ajenos **no están bajo la Apache 2.0**: viven en [`data/`](data/),
una carpeta por conjunto, cada una con su licencia y su atribución al lado.

- [`data/frecuencias/`](data/frecuencias/): las 20.000 formas más frecuentes
  del español, de **wordfreq** (Robyn Speer), bajo **CC BY-SA 4.0**
  ([atribución](data/frecuencias/LICENSE-CC-BY-SA-4.0.md)).
- [`data/referencia/`](data/referencia/): 100 + 100 frases de **UD
  Spanish-AnCora** (Universal Dependencies) con sus etiquetas gramaticales,
  bajo **CC BY 4.0** ([atribución](data/referencia/LICENSE-CC-BY-4.0.md)).
  Sirven para medir, no viajan al navegador.
- [`data/calibracion/`](data/calibracion/): los percentiles de los seis
  géneros (arriba, [«Calibración»](#calibración)) y el manifiesto de cada corpus, **sin
  texto**. Cada uno lleva la licencia de su corpus: CC BY 4.0 (AnCora, CSIC),
  art. 13 LPI y licencia tipo del BOE, dominio público (Project Gutenberg) y
  CC BY 2.1 ES declarada por terceros (MuchoCine)
  ([licencias y atribución](data/calibracion/LICENSE-CORPUS.md)).

El detalle, en la § 2 de [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
Y hay un fichero de código ajeno copiado tal cual, el silabeador
**silabea** (MIT), con su licencia en cabecera: § 1.5 del mismo documento.
