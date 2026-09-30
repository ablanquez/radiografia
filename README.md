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
y, en la carpeta [`motor/`](motor/):

- el **esquema del paquete y de la ficha de regla** (JSON Schema 2020-12),
  con los parámetros de cada tipo de detector ya cerrados, y un
  **validador** que dice qué regla y qué campo fallan, probado con un
  paquete válido y uno roto a propósito por cada error que tiene que saber
  nombrar;
- el **texto segmentado** en párrafos, frases y palabras, con sus posiciones
  exactas sobre el original y cada párrafo marcado como prosa o no (viñetas,
  tablas y código no cuentan);
- el **umbral de longitud**: menos de 100 palabras de prosa, texto
  insuficiente; de 100 a 299, resultado poco fiable; 300 o más, completo;
- el **detector de patrón** (formas o expresiones regulares, por palabra o
  por frase), probado con un paquete de prueba interno: cada ejemplo
  positivo dispara y ningún negativo.

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

Faltan los detectores estructural y estadístico y la puntuación (el
medidor). No hay ninguna regla real y no hay pantalla. Todo lo que se
afirma más arriba es lo que se va a construir, en el orden de la
[hoja de ruta](#hoja-de-ruta).

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
  documentación y serán los tests. El esquema está en
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
