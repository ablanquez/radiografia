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
  dice de qué paquete viene y cada paquete lleva su propio desglose.

Las **métricas** del detector estadístico, cada una con su fórmula y su
fuente en [`motor/src/metricas/`](motor/src/metricas/):

- de frase: frases por cada 100 palabras, dispersión de la longitud de
  frase (coeficiente de variación) y el índice de legibilidad de
  Flesch-Szigriszt;
- de vocabulario: variedad léxica (TTR, MATTR con ventana de 50, MTLD y
  HD-D) y repetición de secuencias de cuatro palabras;
- de puntuación: comas por punto, signos por cada 1.000 palabras y
  paréntesis, comillas y punto y coma por cada 1.000 palabras.

Todo está probado con dos paquetes de prueba internos y con el paquete real
(abajo, [«Paquetes»](#paquetes)): cada ejemplo positivo dispara su regla y
ningún negativo. Los percentiles de los paquetes de prueba son inventados:
los de verdad se miden con textos humanos al escribir las reglas
estadísticas.

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
  declara las seis familias y trae cuatro:
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
    primera persona («recuerdo que», «mi abuela»).

  Sintaxis y estadística están declaradas y vacías. Un juez comprueba que
  ninguna regla va sin fuente, que el peso no pasa del que permite su nivel
  de evidencia, que un atenuante solo resta 1 o 2, que la familia canal no
  suma y que ninguna expresión regular usa `\b` ni `\w`, que en JavaScript no
  reconocen las letras con tilde ni la eñe.
- **«español correcto»**: pendiente.

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

El detalle, en la § 2 de [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
Y hay un fichero de código ajeno copiado tal cual, el silabeador
**silabea** (MIT), con su licencia en cabecera: § 1.5 del mismo documento.
