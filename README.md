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

**En construcción.** Hoy (02/10/2026) existe el plan firmado, la
investigación de las familias en [`docs/investigacion/`](docs/investigacion/),
la **pantalla mínima** y el **catálogo de reglas** en [`web/`](web/) (abajo,
[«Cómo ejecutar»](#cómo-ejecutar) y [«Catálogo»](#catálogo)) y, en la carpeta
[`motor/`](motor/), el **motor completo**, probado con paquetes de prueba:

- el **esquema del paquete y de la ficha de regla** (JSON Schema 2020-12),
  con los parámetros de cada tipo de detector ya cerrados, y un
  **validador** que dice qué regla y qué campo fallan, probado con un
  paquete válido y uno roto a propósito por cada error que tiene que saber
  nombrar;
- el **texto segmentado** en párrafos, frases y palabras, con sus posiciones
  exactas sobre el original y cada párrafo marcado como prosa o no (viñetas,
  tablas y código no cuentan). Los párrafos se leen como en CommonMark: un
  salto de línea simple no parte el párrafo (abajo, [«Cómo está
  pensado»](#cómo-está-pensado));
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
  los atenuantes restan;
- la **escala del medidor**: dónde cae el total respecto a los textos
  humanos del mismo género y tramo (abajo, [«Escala»](#escala)), sin tope
  ni veredicto;
- la **combinación de paquetes**: se analizan varios a la vez, cada señal
  dice de qué paquete viene y cada paquete lleva su propio desglose. Está
  probada también con los dos paquetes reales juntos;
- la **entrada del navegador**
  ([`motor/src/navegador.ts`](motor/src/navegador.ts)): el análisis, la
  escala y el validador de paquetes, sin Ajv y sin nada de Node. El
  validador de esquema va compilado de antemano, en build. Empaquetada y sin
  minificar con esbuild ocupa unos 210 KB, y unos 570 KB con los dos
  paquetes y su calibración (medido el 02/10/2026). Un juez comprueba que
  hace lo mismo que el motor en Node. Lo que viaja de verdad al navegador, en
  el build de la web, está abajo, en [«Cómo ejecutar»](#cómo-ejecutar).

Las **métricas** del detector estadístico, cada una con su fórmula y su
fuente en [`motor/src/metricas/`](motor/src/metricas/):

- de frase: frases por cada 100 palabras, dispersión de la longitud de
  frase (coeficiente de variación) y el índice de legibilidad de
  Flesch-Szigriszt;
- de vocabulario: variedad léxica (TTR, MATTR con ventana de 50, MTLD y
  HD-D) y repetición de secuencias de cuatro palabras;
- de puntuación: comas por punto, signos por cada 1.000 palabras y
  paréntesis, comillas, punto y coma, dos puntos, barras y raya por cada
  1.000 palabras;
- de estilo: nominalizaciones (palabras en -ción, -miento, -dad…) y
  pronombres anafóricos, por cada 1.000 palabras; la segunda es solo de
  contexto, porque sin etiquetado gramatical cuenta también artículos y
  determinantes («la», «este»).

Todo está probado con dos paquetes de prueba internos y con los dos paquetes
reales (abajo, [«Paquetes»](#paquetes)): cada ejemplo positivo dispara su
regla y ningún negativo. Los percentiles de los paquetes de prueba son
inventados; los de RadiografIA están medidos con textos humanos (abajo,
[«Calibración»](#calibración)) y comprobados con otros textos humanos que
se apartaron antes de medir (abajo, [«Validación»](#validación)).

Con eso, el punto 5 del plan (el paquete RadiografIA con sus seis
familias, calibrado y validado) está hecho.

Los textos de la propia web también pasan por los dos paquetes, en un juez
([`web/jueces/textos-web.spec.ts`](web/jueces/textos-web.spec.ts)). Entran el
texto visible de la página del analizador y todas las cadenas de la interfaz,
también las del catálogo, las del cargador, las del informe y las del
lenguaje de calle: 1.409 palabras de prosa, analizadas con «general». No entra el contenido de las fichas de las reglas,
porque menciona las formas que las reglas buscan (abajo,
[«Catálogo»](#catálogo)).

- **Español correcto** no da ninguna señal.
- **RadiografIA** puntúa tres reglas, declaradas en el juez con su porqué:
  - `lex-verbos-de-enfasis`, por «subrayado», el nombre de la función, que
    está declarado en su ficha;
  - `est-frases-cortas`, porque son etiquetas sueltas, no prosa, y cada una
    cuenta como una frase;
  - `est-pocas-comas`, por lo mismo: los mensajes del cargador son frases
    sueltas y cortas, sin incisos.

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

La pantalla es la mínima: funciona, no luce. Pegas el texto, o cargas uno
de los dos ejemplos (abajo, [«Ejemplos»](#ejemplos)), eliges el género y, al
pulsar el botón, ves:

- los subrayados por familia;
- arriba, una etiqueta y una frase con cómo suena tu texto al lado de los
  textos de personas del mismo tipo; debajo, lo que más pesa y por dónde
  empezar; las cifras, plegadas (abajo, [«Cómo leer el
  resultado»](#cómo-leer-el-resultado));
- al tocar un subrayado, la regla en una frase llana, qué hacer y, plegado,
  por qué se mira, con el enlace a su ficha del catálogo;
- el desglose de cada paquete, con un enlace a la ficha de cada regla.

Y antes de analizar eliges los paquetes: los dos incluidos, con sus
casillas, y los tuyos, cargados desde el ordenador (abajo, [«Paquetes
propios»](#paquetes-propios)). Después, «Descargar informe» imprime el
resultado o lo guarda en PDF (abajo, [«Informe»](#informe)).

El punto 6 del plan está cerrado: Antonio vio el ciclo entero en Chrome el
02/10/2026. Después vino la **ampliación 6.4**, mantenimiento del paquete y
no un punto nuevo. Completó las listas de dos reglas de ausencia, D3 (sin
marcadores epistémicos) y D4 (sin automenciones), con fuente, y recalculó y
revalidó la calibración (abajo, [«Validación»](#validación)).

El **catálogo de reglas** (punto 7) está cerrado: una página por regla y un
índice con buscador y filtros (abajo, [«Catálogo»](#catálogo)), y cada regla
con su nombre, con sus tildes. Antonio lo vio en Chrome el 02/10/2026.

El **cargador de paquetes** (punto 8) está hecho desde el 02/10/2026: las
casillas de los dos incluidos, un paquete propio que se lee en el navegador
y no sale de él, la combinación con el origen de cada señal y los errores
de validación con su regla y su campo (abajo, [«Paquetes
propios»](#paquetes-propios)). Antonio lo vio en Chrome el 02/10/2026.

El **informe** (punto 9) está cerrado: la misma página, preparada para
imprimirse o guardarse en PDF desde el navegador, con la cabecera del
análisis, la puntuación, el texto con sus subrayados y la sigla de cada
familia, el desglose y la lista de señales con su explicación y su
sugerencia (abajo, [«Informe»](#informe)). Antonio abrió el PDF el
03/10/2026.

La **ampliación 9.2, lenguaje de calle**, está hecha desde el 03/10/2026:
el resultado se lee en frases llanas (una etiqueta con su frase, un resumen
de dos líneas y la frase en claro de cada regla), con las cifras plegadas y
sin las palabras del motor (abajo, [«Cómo leer el
resultado»](#cómo-leer-el-resultado)). Antonio la vio en Chrome el mismo
día y cambió el titular por la etiqueta y la frase; falta que vea ese
retoque.

Falta después, en el orden de la [hoja de ruta](#hoja-de-ruta): el diseño
(punto 10) y el despliegue (11).

## Cómo ejecutar

Hace falta Node 24.12 o posterior. En la raíz del repositorio:

```bash
npm install                    # instala los dos workspaces a la vez (motor/ y web/)
npx astro telemetry disable    # una vez: apaga la telemetría de Astro en tu máquina
cd web
npm run dev                    # http://localhost:4321/ y el catálogo en http://localhost:4321/reglas/
```

- **`predev` y `prebuild`** corren solos antes de `npm run dev` y de `npm run
  build`. Generan el validador de esquema que lleva el navegador (`npm run
  generar` del motor, a `motor/dist/`) y copian `paquetes/*.json` a
  `web/public/paquetes/`, de donde la página los pide al arrancar. Ninguna
  de las dos carpetas se versiona.
- **Después de tocar `motor/src/`**, reinicia el servidor con `npm run dev
  -- --force`. Vite pre-empaqueta el motor, porque lleva un fichero CommonJS
  (`motor/src/terceros/silabea.cjs`), y sin `--force` sigue sirviendo el de
  antes (la nota está en [`web/astro.config.mjs`](web/astro.config.mjs)).
- **La versión construida:** `npm run build` y `npm run preview`, en la
  misma dirección.
- **Las pruebas:** `npm test` en la raíz corre los jueces del motor y los de
  la web, que construyen la página y la sirven con `astro preview`.
  - Un juez arranca además `astro dev` y pide el analizador, el catálogo y
    una ficha: 200 y ningún error en su salida. Lo arranca con
    `--ignore-lock` en un puerto libre, así que no choca con un `npm run
    dev` abierto.
  - Hasta el 02/10/2026 solo se probaba lo construido, y el catálogo rompió
    `npm run dev` sin que nada se pusiera rojo.
  - Los jueces del cargador, los del informe y los del lenguaje de calle
    ([`web/jueces/navegador.spec.ts`](web/jueces/navegador.spec.ts),
    [`impresion.spec.ts`](web/jueces/impresion.spec.ts) y
    [`pantalla.spec.ts`](web/jueces/pantalla.spec.ts)) abren la página en
    **Chrome**, sin ventana, y la manejan por su protocolo de depuración. Hace falta Chrome instalado. Si no está en su ruta de
    siempre, se le da con la variable `CHROME`. Sin Chrome, esos jueces
    fallan; no se saltan.
- **Los tipos:** `npm run tipos` revisa los de los dos workspaces con `tsc`.
  No se usa `astro check`: añadiría 77 paquetes al árbol y 67 MB para
  revisar los `.astro`.
  Aquí los `.astro` llevan HTML, el import del script y, en el catálogo, la
  plantilla de cada página. La lógica va en `.ts`, que revisa `tsc`, y lo
  que pintan las plantillas lo miran los jueces sobre `dist/`.
- **El aviso de npm sobre esbuild** (`allow-scripts … esbuild`) es lo
  esperado: su `postinstall` no está aprobado y funciona sin él
  ([`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md), § 1.4).

### Prueba manual

Para pasar a mano un `.txt` por la pantalla, cópialo al portapapeles
leyéndolo como UTF-8. En PowerShell:

```powershell
Get-Content -Encoding UTF8 -Raw texto.txt | Set-Clipboard
```

- **Sin `-Encoding UTF8`, las tildes y las comillas llegan rotas.** Windows
  PowerShell 5.1, la que trae Windows, lee un fichero sin BOM con la página
  de códigos ANSI del sistema. La [doc de
  Microsoft](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding?view=powershell-5.1)
  lo dice así: «`Get-Content` […] uses the `Default` ANSI encoding».
- **Y el análisis cambia.** El 02/10/2026, el texto de
  `motor/src/combinacion-real.spec.ts` con «Noticia» dio 356 palabras de
  prosa y un total de 17,04, en vez de 325 y 47,08.
- **`-Raw`** lee el fichero de una vez, con sus saltos de línea.

### Estructura

```text
motor/      el motor: TypeScript sin compilar, sus jueces y las herramientas de calibración
web/        la web estática en Astro 7: el analizador en src/pages/index.astro con su lógica en
            src/pantalla/; el catálogo en src/pages/reglas/ con su lógica en src/catalogo/;
            las cadenas de la interfaz en src/textos.ts; los textos de ejemplo y los dos paquetes
            de prueba del cargador en public/ejemplos/
paquetes/   los dos paquetes de reglas incluidos (RadiografIA y Español correcto)
data/       los datos de terceros y la calibración, cada carpeta con su licencia
docs/       la investigación de cada familia, los textos de ejemplo y la bitácora de fallos
```

La raíz es un [workspace de npm](https://docs.npmjs.com/cli/v11/using-npm/workspaces)
con un solo `package-lock.json`. `web/` importa el motor por
`@radiografia/motor/navegador`, la entrada sin Ajv ni nada de Node.

### Lo que viaja al navegador

Nada sale del navegador. La página pide su JS y los dos paquetes incluidos,
que se validan al arrancar, y un texto de ejemplo cuando se pulsa su botón.
Un paquete propio no se pide: se lee del fichero, en el navegador (abajo,
[«Paquetes propios»](#paquetes-propios)). Medido en el build de la web el
03/10/2026, con el catálogo, el cargador, la CSP, el informe y el lenguaje
de calle:

| fichero | bytes |
|---|---|
| el JS del analizador (motor, validador, cargador, informe, lenguaje de calle y aviso MIT de Ajv; minificado por Vite) | 137.352 |
| las cadenas de la interfaz que comparten el analizador y el catálogo (un JS aparte) | 9.584 |
| `paquetes/radiografia.json` (con su calibración, los nombres y las frases en claro de las reglas) | 347.340 |
| `paquetes/espanol-correcto.json` | 21.618 |
| `index.html` (con la CSP, 507 bytes, y la hoja de impresión) | 5.565 |
| `ejemplos/antonio.txt`, al pulsar su botón | 1.777 |
| `ejemplos/ia.txt`, al pulsar su botón | 1.957 |

Los dos paquetes de prueba, `ejemplos/paquete-prueba.json` (6.900 bytes) y
`ejemplos/paquete-prueba-invalido.json` (6.904), se publican para
descargarlos y copiarlos, pero la página no los pide.

Los paquetes van aparte del JS, y no dentro, para que el JS se quede en unos
120 KB y los JSON se puedan guardar en caché por separado. Metidos en el
build, el JS habría pasado de 400 KB.

El catálogo no pide los paquetes ni el motor: es HTML hecho en build.
Además de cada página, pide el JS del buscador y el de las cadenas.

| fichero | bytes |
|---|---|
| `reglas/index.html`, el índice | 73.781 |
| el JS del buscador y los filtros | 1.131 |
| cada ficha, `reglas/<id>/index.html` | de 4.179 a 16.272 |
| las 50 fichas juntas | 358.643 |

`dist/` entero: 52 páginas HTML (el analizador, el índice y 50 fichas), 61
ficheros y 972.552 bytes. Cada página lleva la CSP.

## Ejemplos

Dos botones junto al cuadro de texto cargan dos textos sobre el mismo tema,
por qué gustan los cómics, y seleccionan el género «Opinión (críticas de
cine)». El análisis empieza al pulsar «Pon tu texto a contraluz».

- **El texto humano**
  ([`web/public/ejemplos/antonio.txt`](web/public/ejemplos/antonio.txt)) lo
  escribió Antonio, el autor del proyecto, y lo entregó el 02/10/2026. **No se
  retoca, diga lo que diga el motor**: lo que sale se documenta.
- **El texto de IA** ([`web/public/ejemplos/ia.txt`](web/public/ejemplos/ia.txt))
  lo generó Claude Opus 5.5 (`claude-opus-5-5`) el 02/10/2026.
  - Recibió una sola instrucción y nada más: «Escribe un texto de unas 330
    palabras, en español, sobre por qué te gustan los cómics, mencionando
    Spiderman, Flash, Green Lantern y Daredevil.»
  - Sin instrucciones de estilo, por la CLI de Claude Code, sin herramientas y
    con el prompt de sistema vacío.
  - Se guardó tal cual, con su título en negrita de Markdown, y no se
    regenera.

Lo que el motor dice de cada uno, regla a regla, está en
[`docs/ejemplos.md`](docs/ejemplos.md), con la procedencia completa y una
primera generación que se descartó. Un juez comprueba que sus cifras siguen
siendo las que da el motor. Su apartado «Historia» cuenta por qué cambiaron
con la ampliación 6.4: antes, el de Antonio sumaba 5 y el de IA 2.

## Cómo leer el resultado

El resultado se lee de arriba abajo: una etiqueta y una frase, dos líneas
y, si quieres, las cifras. La forma la da la barra lateral de
[Hemingway](https://hemingwayapp.com/help/docs/highlighted-issues), una frase
por subrayado («These are words like 'maybe' or 'I think' that make your
writing sound less confident»), pero sin afirmar nunca quién escribió el
texto.

**La etiqueta y la frase** dicen cómo suena tu texto al lado de textos
escritos por personas del mismo tipo (el género que eliges) y de su misma
longitud. Son la banda de la [«Escala»](#escala) traducida, no una
probabilidad, y nunca afirman autoría: el verbo es «suena a». Las escribió
Antonio el 03/10/2026, al ver la pantalla. La etiqueta es el título del
bloque de resultado y la frase va debajo, con el género en singular y su
concordancia («una crítica de cine… escrita», «un texto… escrito»). Los ocho
casos, con «Opinión (críticas de cine)»:

1. Ninguna regla suma: «Texto sin indicios de Asistente IA» y «Aquí no hay
   nada que suene a asistente (IA).» Si unas suman y otras restan hasta
   cero, va la de la banda.
2. Por debajo de la mediana: «Texto con muy pocos rasgos que indiquen que
   tiene Asistente IA» y «Tu texto suena menos a asistente (IA) que una
   crítica de cine normal escrita por una persona.»
3. Entre la mediana y el p95: «Dentro de lo normal» y «Suena como cualquier
   crítica de cine escrita por una persona. Nada raro.»
4. Por encima del p95: «Texto con bastantes rasgos de Asistente IA» y «Tu
   texto suena bastante a asistente (IA): de cada 100 críticas de cine
   escritas por personas, solo 5 suenan tanto.»
5. Por encima del p99: «Texto con muchos rasgos de Asistente IA» y «Tu
   texto suena mucho a asistente (IA): de cada 100 críticas de cine
   escritas por personas, solo 1 suena tanto.»
6. Sin textos de personas de ese género y longitud con los que comparar:
   «No podemos comparar» y «No tenemos críticas de cine de este tamaño
   escritas por personas con las que comparar. Mira el detalle.»
7. Con 100 a 299 palabras de prosa, la etiqueta y la frase de su banda y,
   debajo, «Ojo: tu texto es corto (menos de 300 palabras). Tómate el
   resultado como orientativo.»
8. Un paquete propio con escala: «Texto con pocas señales del paquete “X”»
   y «Tu texto tiene menos señales de “X” que un texto de referencia
   normal.» (por debajo de la mediana o dentro de lo normal); «…bastantes…»
   (por encima del p95) o «…muchas…» (por encima del p99), y «De cada 100
   textos de referencia de “X”, solo 5 tienen tantas señales como el tuyo.»
   (o «solo 1 tiene»); sin calibración, la 6 con «textos de referencia de
   “X”».

«De esta longitud» no va en la frase: se queda en «Ver el detalle». En un
paquete con escala, la etiqueta ocupa el sitio del nombre del paquete como
título del bloque; Español correcto, sin escala, sigue con su nombre.

Con los ejemplos y «Opinión (críticas de cine)», el texto de IA queda en
«Texto con muy pocos rasgos que indiquen que tiene Asistente IA»; el de
Antonio, en «Dentro de lo normal».

**Los «rasgos de Asistente IA»** de la etiqueta son lo que miden las reglas
de RadiografIA: fórmulas, formato pegado, puntuación, vocabulario y ritmo
que, según sus fuentes, los asistentes de chat dejan más que las personas.
Una persona puede tenerlos, y un texto de asistente puede no tenerlos. Por
eso la frase dice a qué suena tu texto, y nunca quién lo escribió ni que
sea «generado».

**El resumen**, debajo:
- «Lo que más pesa:», con las tres reglas que más suman y, entre paréntesis,
  cuántas veces aparecen o, en las que se comparan con textos de personas
  (las estadísticas), su valor y lo normal: «Pocas comas (0,38 comas por
  punto; lo normal en las críticas de cine es más de 0,49)». **La meta solo
  existe donde hay textos de personas medidos**: el resto de las reglas dice
  cuántas veces, sin meta.
- «Empieza por:», con la sugerencia de la primera.
- Español correcto, en una línea: «9 avisos de norma: …».

**«Ver el detalle»**, plegado, guarda las cifras: tu total en puntos por
cada 1.000 palabras, la mediana, el p95 y el p99 de los textos de personas
con los que se compara, y cuántos son.

**Al tocar un subrayado**, cada regla dice su nombre, su frase en claro, qué
hacer y, plegado, «¿Por qué lo miramos?»: la explicación con sus fuentes,
el nivel de evidencia, el origen de la lista y el enlace a su ficha.

**El desglose** cuenta por paquete y familia las veces y los puntos de cada
regla. Las que restan dicen «rasgo humano: resta»; las de solo aviso, que no
suman; «Lo que se nota en el conjunto» son las que miran el texto entero, y
«No miradas en este texto», las que no tocaban, con su porqué («solo se
miran en las críticas de cine y los textos académicos»).

**«Opinión (críticas de cine)».** Lo que hay calibrado en ese género son
críticas de cine de MuchoCine (abajo, [«Los seis géneros»](#los-seis-géneros)),
y el selector lo dice para no prometer otra cosa.

**Los jueces**
([`web/jueces/lectura.spec.ts`](web/jueces/lectura.spec.ts) y, en Chrome,
[`pantalla.spec.ts`](web/jueces/pantalla.spec.ts)) comprueban:
- la etiqueta de cada banda y la frase de cada banda y género, con su
  concordancia, y los casos sin indicios, sin calibración, de texto corto y
  de paquete propio;
- en Chrome, que la etiqueta es lo primero del bloque de resultado y que el
  aviso de texto corto sale con 150 palabras;
- el resumen: sus tres reglas, sus empates y sus metas, con el borde que usa
  cada regla en la celda de su género y longitud;
- que «Ver el detalle» y «¿Por qué lo miramos?» salen plegados;
- que en la pantalla no se ven las palabras del motor: ni «informativa», ni
  «atenuante», ni «tramo», ni los percentiles fuera del detalle.

## Catálogo

En `/reglas/` están todas las reglas de los dos paquetes incluidos, y cada
una tiene su página, `/reglas/<id>/`. Las de un paquete propio no: su ficha
se ve entera en el analizador (abajo, [«Paquetes
propios»](#paquetes-propios)). En local, con `npm run dev`, el índice está en
http://localhost:4321/reglas/. Desde el analizador se llega por el enlace de
la cabecera y por el nombre de cada regla, en el panel de un subrayado y en
el desglose.

- **El índice** lista las 50 reglas: nombre y, debajo, su frase en claro;
  id, paquete, familia, detector, severidad, nivel de evidencia, peso y la
  primera frase de la explicación.
  - El buscador mira el nombre, el id y la explicación entera, sin
    distinguir mayúsculas ni tildes.
  - Los filtros son tres: familia, severidad y detector. Dentro de un
    filtro vale cualquiera de las casillas marcadas; entre filtros, todos a
    la vez.
  - El recuento de reglas se anuncia a los lectores de pantalla.
  - Hoy las 50 reglas tienen severidad «baja», así que el filtro de
    severidad todavía no separa nada.
- **La ficha** enseña la regla entera y literal:
  - bajo el nombre, su frase en claro;
  - paquete, familia y detector, y cómo busca, dicho en palabras;
  - peso, severidad y nivel de evidencia;
  - explicación, sugerencia, excepciones y origen de la lista;
  - las fuentes, enlazadas, y los ejemplos tal cual.
- **El nombre** de cada regla es un campo de la ficha desde el 02/10/2026
  (`nombre`, de 3 a 80 caracteres), y los 50 nombres los firmó Antonio.
  - En el esquema es opcional, porque un paquete de terceros puede no
    traerlo. Entonces la web enseña el id sin su prefijo.
  - En RadiografIA y Español correcto lo exige un juez.
- **La frase en claro** de cada regla es un campo de la ficha desde el
  03/10/2026 (`enClaro`, de 3 a 140 caracteres): una frase llana, con un
  ejemplo cuando ayuda. Las 50 las firmó Antonio.
  - En el esquema es opcional; donde falta, no se enseña.
  - En RadiografIA y Español correcto la exige un juez: que empiece por
    mayúscula, que acabe en punto y que no diga percentil, densidad, regex,
    lema, n-grama, «IA», «generado» ni «detectado».

**Cómo se genera.** Al construir, Astro lee los dos JSON de `paquetes/` y
escribe una página por regla con `getStaticPaths`
([`web/src/pages/reglas/`](web/src/pages/reglas/)).
- Antes de escribirlas, valida los paquetes con el mismo validador que usa
  el analizador.
- El build para si un paquete no valida, o si un id está en los dos: las dos
  fichas tendrían la misma URL.
- El catálogo es HTML, sin `fetch`. Su único JS es el del buscador, que
  oculta y enseña filas.

**Las fichas no pasan por el juez de textos de la web.** Mencionan las
formas que las reglas buscan («Espero que esto te ayude», «En
conclusión»…). Analizarlas sería medir los ejemplos de las reglas, no los
textos de la web: es mención, no uso, como en este README. Sí pasan por el
juez todas las cadenas de la interfaz del catálogo (títulos, etiquetas,
botones), que están en [`web/src/textos.ts`](web/src/textos.ts).

**Los jueces del catálogo**, en
[`web/jueces/catalogo.spec.ts`](web/jueces/catalogo.spec.ts), comprueban:
- que hay una página por regla y que el índice las enlaza todas;
- que cada ficha lleva su id, su nombre, una fuente enlazada y sus ejemplos
  tal cual;
- que todo enlace interno de `dist/` llega a una página;
- que el índice lleva sus controles con sus etiquetas y la región que
  anuncia el recuento;
- con `astro preview`, que el índice y una ficha dan 200 y
  `/reglas/no-existe/`, 404;
- y, con `astro dev`
  ([`web/jueces/desarrollo.spec.ts`](web/jueces/desarrollo.spec.ts)), que el
  índice y una ficha también se sirven, sin errores.

## Informe

Tras analizar, el botón **«Descargar informe»** abre el diálogo de imprimir
del navegador. El informe es la misma página preparada para el papel, sin
librerías ni nada que se genere fuera: se imprime, o se guarda en PDF desde
ese diálogo.

**Qué incluye**, en una hoja A4 con márgenes de 2 cm:
- la cabecera: la fecha y la hora del análisis, el género, las palabras de
  prosa y el tramo, los paquetes con su versión (los propios, marcados
  «(propio)») y, de cada paquete con escala, su total y con qué textos de
  personas se compara (en pantalla van plegados en «Ver el detalle»);
- de cada paquete, la etiqueta y la frase, si tiene escala, y el resumen;
- la clave de las familias, con su sigla;
- el texto con sus subrayados y, detrás de cada uno, entre corchetes, la
  sigla de su familia: [L] léxico, [D] discurso…;
- el desglose de cada paquete;
- las señales, regla a regla: hasta cinco fragmentos de cada una, su
  explicación, su sugerencia y la dirección de su ficha del catálogo. Las de
  un paquete propio no tienen ficha, y lo dice;
- al pie, la nota: RadiografIA analiza estilo; no demuestra autoría.

No salen el cuadro de texto, los botones, el selector, el cargador, la
navegación ni el panel de un subrayado (lo sustituye la lista de señales).
Una regla no se parte entre dos páginas.

**Cómo se guarda en PDF.**
- En **Chrome** y en **Edge**, en el diálogo de imprimir, como destino,
  «Guardar como PDF».
- En **Firefox**, como destino, «Guardar como PDF».
- El fichero se llama «RadiografIA.pdf» si no le das otro nombre.

**El color no hace falta para leerlo.** Cada subrayado lleva su sigla y cada
regla dice su familia y su paquete en texto. No hay que marcar «imprimir
fondos»; se lee igual en una impresora en gris.

**Imprime el último análisis.** Si después cambias el texto o los paquetes,
vuelve a pulsar «Pon tu texto a contraluz» antes de imprimir; la cabecera
dice de qué análisis es el informe.

**Lo que no depende de la página.** El encabezado y el pie que añade el
navegador (la dirección, la fecha, el número de página) dependen de sus
ajustes: en Firefox, la casilla «Imprimir encabezados y pies de página». El
informe lleva su propia fecha en la cabecera.

**Los jueces**
([`web/jueces/impresion.spec.ts`](web/jueces/impresion.spec.ts) y la lógica
en [`informe.spec.ts`](web/jueces/informe.spec.ts)) comprueban, con Chrome:
- que en papel no salen el formulario ni la navegación ni el panel, y sí
  todo lo de arriba;
- que cada subrayado lleva su sigla y cada regla de la lista, la dirección
  de su ficha;
- que, sin análisis, el botón está desactivado, y que con un texto de menos
  de 100 palabras el informe lo dice y no pinta secciones vacías;
- que el PDF que genera Chrome es válido y A4. Con el texto de prueba de la
  combinación de los dos paquetes salen 16 páginas y unos 214 KB;
- que ni imprimir ni preparar la impresión piden nada a la red.

Que ninguna regla quede partida entre páginas lo pide la hoja
(`break-inside: avoid`) y lo comprueba el juez en cada entrada. Que se
cumple en el PDF se miró a ojo, página a página.

## Paquetes

En [`paquetes/`](paquetes/):

- **RadiografIA 0.1.0** ([`radiografia.json`](paquetes/radiografia.json)):
  trae las seis familias:
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
    familia son métricas del texto entero, que van en estadística, o
    necesitaban el etiquetado gramatical, que quedó fuera de la v1;
  - **estadística**: trece reglas que miden el texto entero y lo comparan
    con los textos humanos de su género y su longitud (abajo,
    [«Estadística»](#estadística)). Siete suman: frases cortas, pocas comas,
    poca puntuación y poca puntuación secundaria, medidas en español; ritmo
    uniforme, nominalización y repetición de secuencias, medidas en inglés.
    Seis son de contexto: cuatro de variedad léxica, la legibilidad y los
    pronombres anafóricos.

  Un juez comprueba que ninguna regla va sin fuente, que el peso, para sumar
  o para restar, no pasa del que permite su nivel de evidencia, que un
  atenuante solo resta 1 o 2, que la familia canal no suma, que cada regla
  estadística usa una métrica del motor, dice en su ficha dónde corta y no
  se limita a unos géneros, y que ninguna expresión regular usa `\b` ni
  `\w`, que en JavaScript no reconocen las letras con tilde ni la eñe.
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

## Paquetes propios

Un paquete propio es un JSON con la forma de los incluidos: una cabecera
(nombre, versión, idioma, descripción, autor, licencia y familias) y una
lista de reglas, cada una con su ficha. Se carga en el analizador y se
combina con los incluidos.

**Cómo se escribe.**
- El esquema está en [`motor/esquema/`](motor/esquema/):
  `paquete.schema.json` y `regla.schema.json`, en JSON Schema 2020-12. Con
  la línea `"$schema"` que llevan los incluidos, VS Code avisa de los
  errores mientras se escribe.
- Las fichas del catálogo (`/reglas/<id>/`) sirven de modelo: cada una
  enseña la regla entera y cómo busca, dicho en palabras.
- Hay uno de ejemplo, corto:
  [`web/public/ejemplos/paquete-prueba.json`](web/public/ejemplos/paquete-prueba.json).
  Son tres reglas en la familia «Pruebas», una de patrón («a nivel de»), una
  estructural (pregunta sin signo de apertura) y una informativa («okey» u
  OK), con la norma del *Diccionario panhispánico de dudas*. No mide estilo
  de IA: sirve para probar el cargador y para copiarlo. No trae
  calibración.
- Su gemelo,
  [`paquete-prueba-invalido.json`](web/public/ejemplos/paquete-prueba-invalido.json),
  es el mismo con un campo mal, el peso de la primera regla, para ver el
  error. Ninguno de los dos se carga solo.

**Cómo se carga.** En el analizador, en el bloque «Paquetes»:
- «Cargar un paquete propio (JSON)» y eliges el fichero. Si entra, aparece en
  la lista con su nombre, su versión y su número de reglas, y un botón
  «Quitar».
- Las casillas de RadiografIA y Español correcto ponen o quitan los
  incluidos.
- Al pulsar «Pon tu texto a contraluz» se analiza con los incluidos marcados
  y después con los propios. Si cambias los paquetes con un resultado en
  pantalla, la página te dice que vuelvas a analizar; si no queda ninguno
  activo, que marques uno.

**Qué se comprueba**, en este orden. La primera comprobación que falla
corta, y el paquete no entra:
1. Que no pase de 2 MB (2 × 1.024 × 1.024 bytes; RadiografIA, con su
   calibración, ocupa 342 KB). Un fichero más grande no se llega a leer.
2. Que sea JSON. Si no lo es, la página lo dice y, detrás, copia lo que dice
   el navegador, en su idioma.
3. Que cumpla el esquema y lo que el esquema no ve: ids repetidos, familias
   sin declarar, expresiones regulares que no compilan… Es el mismo
   validador de los incluidos, y la página enseña cada error con su regla y
   su campo: `regla "prueba-a-nivel-de" (reglas[0]) · campo "peso": tiene
   que ser número`.
4. Que no se llame como otro paquete, incluido (marcado o no) o propio: las
   señales de los dos no se distinguirían.

**Cómo se ve.**
- Cada señal dice de qué paquete viene: la leyenda nombra cada familia con
  su paquete, cada paquete tiene su bloque en el desglose y el panel de un
  subrayado dice el paquete de cada regla.
- Las familias de un paquete propio se subrayan con trazo discontinuo.
- Las reglas de un paquete propio no tienen página en el catálogo. El panel
  enseña su ficha completa, y en el desglose se despliega al pulsar su
  línea.
- El selector de género junta los géneros de la calibración de los paquetes
  activos, con «General» siempre.
- Un paquete sin escala (sin clave `_total-*` en su calibración) no tiene
  banda; si ninguno de los activos la tiene, el medidor lo dice.

**No sale del navegador**, y no es una promesa:
- El fichero se lee en la página con `File.text()` y no se sube a ningún
  sitio.
- Un juez ([`web/jueces/navegador.spec.ts`](web/jueces/navegador.spec.ts))
  abre la página en Chrome y espera a que cargue. Después carga los dos
  paquetes de prueba desde el disco, analiza tres veces, abre paneles, marca
  y desmarca casillas y quita el propio. Exige **cero peticiones de red**
  desde la carga inicial, y si hubiera alguna, la lista.
- Las páginas publicadas llevan además una política de seguridad (CSP): el
  navegador no conecta con ningún otro origen (`connect-src 'self'`) ni
  envía un formulario a otro sitio (`form-action 'self'`). Otro juez mira
  que la lleven todas. `npm run dev` va sin ella: Astro no la aplica en
  desarrollo.

**No se guarda.** Ni en el navegador ni en la dirección de la página: al
recargar, el paquete propio desaparece, y la página lo avisa. Salir de la
página, al catálogo por ejemplo, también puede perderlo.

**Lo que no se protege**, declarado:
- Una expresión regular de un paquete propio puede colgar la pestaña si es
  de las que se atascan (retroceso catastrófico): el análisis corre en la
  página, sin un proceso aparte con tiempo límite.
- El fichero se lee como UTF-8, y un BOM delante no molesta. Un JSON
  guardado en otra codificación, como latin-1, se lee con caracteres de
  sustitución que el esquema no detecta.

**Para verlo a mano en la pestaña Red de Chrome**, pega el texto en vez de
usar «Cargar ejemplo»: ese botón pide el texto de ejemplo al servidor, y esa
petición saldría en la lista.

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
  el párrafo (abajo, [«Cómo está pensado»](#cómo-está-pensado)). Los 341
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
[`motor/herramientas/calibrar/`](motor/herramientas/calibrar/), y se
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
   medirán tu texto) y escribe en [`data/calibracion/`](data/calibracion/)
   las celdas, las omitidas, los disparos de cada regla por tramo y las
   notas, más el manifiesto: id, huella sha256, tramo y reparto de cada
   documento, sin texto.
4. **`construir-general.ts`** y después `calibrar.ts general`, para la mezcla.
5. **`inyectar-calibracion.ts`**: vuelca las celdas de los seis ficheros en
   el paquete. Solo las celdas: las notas se quedan en `data/calibracion/`.
6. **`validar.ts`**: analiza con el paquete los textos de validación y
   escribe [`validacion.json`](data/calibracion/validacion.json) (abajo,
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
[`data/calibracion/LICENSE-CORPUS.md`](data/calibracion/LICENSE-CORPUS.md).

## Validación

Las reglas estadísticas se comprueban con los textos humanos que **no** se
usaron para calibrar: el 20 % de cada corpus, apartado por huella antes de
medir nada. La cifra es la **tasa de falsos positivos (FPR)**: la
proporción de esos textos en los que saltan dos o más reglas estadísticas
que puntúan. El plan pide que no pase del 5 %. La mide
[`validar.ts`](motor/herramientas/calibrar/validar.ts), que deja el
resultado, sin texto, en
[`data/calibracion/validacion.json`](data/calibracion/validacion.json).

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
[`administrativo.json`](data/calibracion/administrativo.json)).

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
([`motor/src/banda.ts`](motor/src/banda.ts)), y `analizar()` la devuelve
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

## Cómo está pensado

- **Astro estático, sin backend.** Todo corre en el navegador.
- **La CSP, lo primero de cada página.** Astro escribe el `<meta>` de la
  política al final del `<head>`, y lo que la página pusiera antes (una
  precarga de fuentes, un icono) quedaría fuera. Una integración de
  [`web/astro.config.mjs`](web/astro.config.mjs) lo recoloca al terminar el
  build, justo detrás de `<meta charset>`, sin tocar su contenido; un juez
  comprueba el sitio y que el contenido es el que emitió Astro. Si en el
  despliegue la CSP pasa a cabecera HTTP, la integración sobra.
- **Párrafos como en CommonMark.** Una línea en blanco separa dos párrafos
  y un salto de línea simple no (especificación CommonMark 0.31.2, § 4.8 y
  § 6.8). Así, un texto cortado a mano (un correo, un PDF copiado, un
  Markdown a 76 columnas como este README) se lee con sus párrafos.
  Viñetas, encabezados, tablas, código y separadores se reconocen por la
  línea. Las posiciones de cada señal siguen siendo las del texto original.
- **La excepción web**, decisión propia: un salto simple tras «.», «!»,
  «?», «…», «»» o una comilla de cierre, seguido de una línea que empieza
  por mayúscula, «¿», «¡», «—», «« o una comilla, abre párrafo. Un cuadro
  de texto web separa los párrafos con un solo salto, y sin la excepción
  los juntaría. Su **coste**, declarado: en un texto cortado a mano, si el
  corte cae justo tras un punto y antes de una mayúscula, parte un párrafo
  que no lo era.
  - Los 341 textos humanos de validación de «general», cortados a 76
    columnas: 320 (el 93,8 %) dan las mismas frases que sin cortar. Las 21
    diferencias tienen cuatro causas, listadas una a una en
    [`motor/src/texto-cortado.spec.ts`](motor/src/texto-cortado.spec.ts):
    ítems numerados, filas de tabla y rayas de AnCora que el corte parte, y
    la excepción a media frase.
  - En el corpus académico, que trae una frase por línea, la excepción
    parte el 90,6 % de los saltos entre líneas de prosa.
  - Las reglas que miran el principio o el final de un párrafo lo notan:
    el cierre de plantilla no ve «En conclusión» si el último párrafo se
    parte. Lo dice su ficha.
- **Seis familias de reglas**: léxico, sintaxis, puntuación y formato,
  estadística, discurso y **canal** (Markdown residual, Unicode invisible,
  emojis: artefactos de copiar desde un asistente). Canal es
  **informativa**: se señala y se explica, pero no suma al medidor. Cada
  familia sale de la investigación con fuentes de
  [`docs/investigacion/`](docs/investigacion/), hecha antes de escribir su
  primera regla.
- **Dos paquetes incluidos**: RadiografIA y **«español correcto»**, siete
  avisos de norma RAE (calcos y traducción, no estilo IA), cada uno con su
  casilla; y los **paquetes propios** que cargue cada uno, que se combinan
  con ellos sin salir del navegador.
- **Tres tipos de detector**: patrón, estructural, estadístico.
- **Ficha por regla**: id, nombre y frase en claro (opcionales en el
  esquema), familia,
  detector y sus parámetros, peso (que puede ser **negativo**: un atenuante
  humano resta), severidad, si es **informativa**, explicación, sugerencia,
  excepciones, **fuentes**, **origen de la lista** («inventario propio…»
  cuando lo es), **nivel de evidencia** (medido en español, medido en
  inglés, anecdótico, sin fuente o norma) y ejemplos positivos y negativos.
  Los ejemplos son la documentación y son los tests: cada positivo tiene que
  disparar la regla y cada negativo no. El esquema está en
  [`motor/esquema/`](motor/esquema/).
- **Catálogo público** con una página por regla.
  - En los ejemplos de cada ficha, el tramo que señala la regla va marcado
    con el estilo de su familia, como en el analizador. Lo calcula el motor
    antes de construir la web: `web/scripts/tramos-de-ejemplos.ts` corre en
    `predev` y `prebuild`, y su salida
    (`web/src/catalogo/tramos-de-ejemplos.json`) no se versiona.
  - **Por qué ese script importa `motor/src/` por su ruta** (`texto.ts` y
    `analisis.ts`): las funciones que necesita no están en los `exports` del
    motor. Vale porque es un script del build de la web y corre en Node. Al
    navegador no llega nada de él: la ficha no lleva JavaScript.
  - Marcan tramo 35 reglas. Las otras 15 no tienen tramo que marcar: son
    las que miran el texto entero, las de ausencia y las de género.
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
