# Crónica de construcción

La sección «Estado» que tuvo el README hasta el 06/10/2026, con sus fechas.
Es un registro fechado: no se reescribe. El estado de hoy está en el
[README](../README.md#estado-y-nevera) y en
[`RADIOGRAFIA-ESTADO.md`](../RADIOGRAFIA-ESTADO.md).

Hasta el 06/10/2026 este texto estaba en el README. En el encargo 11.4 se
trasladó aquí tal cual. Solo cambiaron los enlaces y, delante de los que
ahora llevan a otro documento, «abajo» por «en».

---

## Estado

**En construcción.** Hoy (05/10/2026) existe el plan firmado, la
investigación de las familias en [`docs/investigacion/`](investigacion/),
la **pantalla**, ya con su diseño, y el **catálogo de reglas** en [`web/`](../web/) (en
[«Cómo ejecutar»](ARRANQUE-LOCAL.md#cómo-ejecutar) y [«Catálogo»](WEB.md#catálogo)) y, en la carpeta
[`motor/`](../motor/), el **motor completo**, probado con paquetes de prueba:

- el **esquema del paquete y de la ficha de regla** (JSON Schema 2020-12),
  con los parámetros de cada tipo de detector ya cerrados, y un
  **validador** que dice qué regla y qué campo fallan, probado con un
  paquete válido y uno roto a propósito por cada error que tiene que saber
  nombrar;
- el **texto segmentado** en párrafos, frases y palabras, con sus posiciones
  exactas sobre el original y cada párrafo marcado como prosa o no (viñetas,
  tablas y código no cuentan). Los párrafos se leen como en CommonMark: un
  salto de línea simple no parte el párrafo (en [«Cómo está
  pensado»](WEB.md#cómo-está-pensado));
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
  humanos del mismo género y tramo (en [«Escala»](CALIBRACION.md#escala)), sin tope
  ni veredicto;
- la **combinación de paquetes**: se analizan varios a la vez, cada señal
  dice de qué paquete viene y cada paquete lleva su propio desglose. Está
  probada también con los dos paquetes reales juntos;
- la **entrada del navegador**
  ([`motor/src/navegador.ts`](../motor/src/navegador.ts)): el análisis, la
  escala y el validador de paquetes, sin Ajv y sin nada de Node. El
  validador de esquema va compilado de antemano, en build. Empaquetada y sin
  minificar con esbuild ocupa unos 210 KB, y unos 570 KB con los dos
  paquetes y su calibración (medido el 02/10/2026). Un juez comprueba que
  hace lo mismo que el motor en Node. Lo que viaja de verdad al navegador, en
  el build de la web, está en [«Cómo ejecutar»](ARRANQUE-LOCAL.md#cómo-ejecutar).

Las **métricas** del detector estadístico, cada una con su fórmula y su
fuente en [`motor/src/metricas/`](../motor/src/metricas/):

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
reales (en [«Paquetes»](WEB.md#paquetes)): cada ejemplo positivo dispara su
regla y ningún negativo. Los percentiles de los paquetes de prueba son
inventados; los de RadiografIA están medidos con textos humanos (en
[«Calibración»](CALIBRACION.md#calibración)) y comprobados con otros textos humanos que
se apartaron antes de medir (en [«Validación»](CALIBRACION.md#validación)).

Con eso, el punto 5 del plan (el paquete RadiografIA con sus seis
familias, calibrado y validado) está hecho.

Los textos de la propia web también pasan por los dos paquetes, en un juez
([`web/jueces/textos-web.spec.ts`](../web/jueces/textos-web.spec.ts)). Entran el
texto visible de la página del analizador y todas las cadenas de la interfaz,
también las del catálogo, las del cargador, las del informe, las del
lenguaje de calle y las de la página de créditos: 2.407 palabras de prosa
(06/10/2026), analizadas con «general». Desde el 11.1, todo lo que se lee en
el analizador y en los créditos sale de `web/src/textos.ts`, salvo el
nombre, que es identidad. No entra el contenido de las fichas de las reglas,
porque menciona las formas que las reglas buscan (en
[«Catálogo»](WEB.md#catálogo)).

- **Español correcto** no da ninguna señal.
- **RadiografIA** puntúa dos reglas, declaradas en el juez con su porqué:
  - `lex-verbos-de-enfasis`, por «subrayado», el nombre de la función, que
    está declarado en su ficha;
  - `est-frases-cortas`, porque son etiquetas sueltas, no prosa, y cada una
    cuenta como una frase.

  Hasta el 11.1 puntuaba también `est-pocas-comas`, por los mensajes del
  cargador; con la prosa de la página de créditos, que lleva sus comas, dejó
  de dispararse y salió de las declaradas.

Las piezas de apoyo que las reglas necesitarán están **medidas contra
referencias ajenas**, no dadas por buenas:

- **Silabeo**: 57 de 60 palabras silabeadas como la *Ortografía* de la RAE
  (falla en los prefijos *sub-* y en *tungsteno*).
- **Frecuencias**: las 20.000 formas más frecuentes del español
  ([`data/frecuencias/`](../data/frecuencias/)).
- **Etiquetado gramatical** (adjetivos, adverbios, pronombres): medido contra
  el corpus UD Spanish-AnCora y **no llega** al umbral fijado (adjetivos
  72,5 %, pronombres 66,9 %, adverbios 91,2 %, sobre frases que no se miraron
  al ajustarlo). Queda **fuera de la v1**, y con él las reglas que lo
  necesitaban; su código se retiró. La medida entera, en
  [`docs/investigacion/pos-medida.md`](investigacion/pos-medida.md).

Pegas el texto, o cargas uno
de los dos ejemplos (en [«Ejemplos»](WEB.md#ejemplos)), eliges el género y, al
pulsar el botón, ves:

- los subrayados por familia;
- arriba, una etiqueta y una frase con cómo suena tu texto al lado de los
  textos de personas del mismo tipo; debajo, lo que más pesa y por dónde
  empezar; las cifras, plegadas (en [«Cómo leer el
  resultado»](WEB.md#cómo-leer-el-resultado));
- al tocar un subrayado, la regla en una frase llana, qué hacer y, plegado,
  por qué se mira, con el enlace a su ficha del catálogo;
- el desglose de cada paquete, con un enlace a la ficha de cada regla.

Y antes de analizar eliges los paquetes: los dos incluidos, con sus
casillas, y los tuyos, cargados desde el ordenador (en [«Paquetes
propios»](WEB.md#paquetes-propios)). Después, «Descargar informe» genera el
informe en PDF y lo descarga (en [«Informe»](WEB.md#informe)).

El punto 6 del plan está cerrado: Antonio vio el ciclo entero en Chrome el
02/10/2026. Después vino la **ampliación 6.4**, mantenimiento del paquete y
no un punto nuevo. Completó las listas de dos reglas de ausencia, D3 (sin
marcadores epistémicos) y D4 (sin automenciones), con fuente, y recalculó y
revalidó la calibración (en [«Validación»](CALIBRACION.md#validación)).

El **catálogo de reglas** (punto 7) está cerrado: una página por regla y un
índice con buscador y filtros (en [«Catálogo»](WEB.md#catálogo)), y cada regla
con su nombre, con sus tildes. Antonio lo vio en Chrome el 02/10/2026.

El **cargador de paquetes** (punto 8) está hecho desde el 02/10/2026: las
casillas de los dos incluidos, un paquete propio que se lee en el navegador
y no sale de él, la combinación con el origen de cada señal y los errores
de validación con su regla y su campo (en [«Paquetes
propios»](WEB.md#paquetes-propios)). Antonio lo vio en Chrome el 02/10/2026.

El **informe** (punto 9) está cerrado: la misma página, preparada para
imprimirse o guardarse en PDF desde el navegador, con la cabecera del
análisis, la puntuación, el texto con sus subrayados y la sigla de cada
familia, el desglose y la lista de señales con su explicación y su
sugerencia (en [«Informe»](WEB.md#informe)). Antonio abrió el PDF el
03/10/2026. Desde la **ampliación 9.3** (05/10/2026), «Descargar informe»
genera el PDF en el propio navegador y lo descarga, también en el iPhone y en
el iPad; Ctrl+P sigue sacando el papel. Antonio lo vio en los tres el mismo
día.

La **ampliación 9.2, lenguaje de calle**, está hecha desde el 03/10/2026:
el resultado se lee en frases llanas (una etiqueta con su frase, un resumen
de dos líneas y la frase en claro de cada regla), con las cifras plegadas y
sin las palabras del motor (en [«Cómo leer el
resultado»](WEB.md#cómo-leer-el-resultado)). Antonio la vio en Chrome el mismo
día y cambió el titular por la etiqueta y la frase; falta que vea ese
retoque.

El **diseño** (punto 10) está cerrado, a falta de la última mirada de
Antonio en Chrome, en el iPhone y en el iPad. La web calca el modelo de
Figma Make con los tokens del DISEÑO y las fuentes servidas desde la propia
web (en [«Diseño»](WEB.md#diseño)). Pasó por el
[acta de contraste y accesibilidad](acta-contraste-y-accesibilidad.md):
- el contraste de cada par de colores;
- el daltonismo;
- los 320 px;
- el tamaño de lo que se pulsa;
- el árbol de accesibilidad.

El **despliegue** (punto 11) empezó el 06/10/2026 por el [censo
pre-despliegue](CENSO-PRE-DESPLIEGUE.md), de solo lectura: veinte
hallazgos, que Antonio firmó uno a uno, y el 21, que salió al arreglar el
18. Los que eran para arreglar ya están arreglados, cada uno con su juez.
Entre ellos:

- los avisos MIT de silabea, del runtime de Rolldown y de la función de
  precarga de Vite, que no viajaban, van ahora dentro del JS publicado;
- la nueva página «Créditos y licencias» (`/creditos/`), con la atribución
  de cada corpus y la cita del BOE (en [«Licencia y
  créditos»](../README.md#licencia-y-créditos)).

Otros se declararon con su porqué o quedaron para la v1.1 (§ 14 del
censo).

La **publicación** (encargo 11.2) se decidió el 06/10/2026 con la
documentación del panel de Hostinger delante. `npm run publicar` deja lista
la rama `publicacion`, con `web/dist/` y su `.htaccess` (en
[«Despliegue»](DESPLIEGUE.md#despliegue)), y la web tiene ya su página para las
direcciones que no existen. Falta lo que hace Antonio:

- crear el subdominio en el panel y conectarle la rama;
- activar «Forzar HTTPS»;
- empujar `main` y `publicacion`;
- y verificarla desde fuera, con los jueces de producción y a ojo.
