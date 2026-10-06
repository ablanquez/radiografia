# La web: el analizador, el catálogo, el informe y los paquetes

Cómo se lee el resultado, cómo son el catálogo y el informe, de dónde sale
el diseño, qué traen los dos paquetes incluidos, cómo se carga uno propio y
las decisiones de fondo. El resumen está en el [README](../README.md).

Hasta el 06/10/2026 este texto estaba en el README. En el encargo 11.4 se
trasladó aquí tal cual. Solo cambiaron los enlaces y, delante de los que
ahora llevan a otro documento, «abajo» por «en»; y «este README», por
«este documento».

---

## Ejemplos

Dos botones junto al cuadro de texto cargan dos textos sobre el mismo tema,
por qué gustan los cómics, y seleccionan el género «Opinión (críticas de
cine)». El análisis empieza al pulsar «Pon tu texto a contraluz».

- **El texto humano**
  ([`web/public/ejemplos/antonio.txt`](../web/public/ejemplos/antonio.txt)) lo
  escribió Antonio, el autor del proyecto, y lo entregó el 02/10/2026. **No se
  retoca, diga lo que diga el motor**: lo que sale se documenta.
- **El texto de IA** ([`web/public/ejemplos/ia.txt`](../web/public/ejemplos/ia.txt))
  lo generó Claude Opus 5.5 (`claude-opus-5-5`) el 02/10/2026.
  - Recibió una sola instrucción y nada más: «Escribe un texto de unas 330
    palabras, en español, sobre por qué te gustan los cómics, mencionando
    Spiderman, Flash, Green Lantern y Daredevil.»
  - Sin instrucciones de estilo, por la CLI de Claude Code, sin herramientas y
    con el prompt de sistema vacío.
  - Se guardó tal cual, con su título en negrita de Markdown, y no se
    regenera.

Lo que el motor dice de cada uno, regla a regla, está en
[`docs/ejemplos.md`](ejemplos.md), con la procedencia completa y una
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
longitud. Son la banda de la [«Escala»](CALIBRACION.md#escala) traducida, no una
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
críticas de cine de MuchoCine (en [«Los seis géneros»](CALIBRACION.md#los-seis-géneros)),
y el selector lo dice para no prometer otra cosa.

**Los jueces**
([`web/jueces/lectura.spec.ts`](../web/jueces/lectura.spec.ts) y, en Chrome,
[`pantalla.spec.ts`](../web/jueces/pantalla.spec.ts)) comprueban:
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
([`web/src/pages/reglas/`](../web/src/pages/reglas/)).
- Antes de escribirlas, valida los paquetes con el mismo validador que usa
  el analizador.
- El build para si un paquete no valida, o si un id está en los dos: las dos
  fichas tendrían la misma URL.
- El catálogo es HTML, sin `fetch`. Su único JS es el del buscador, que
  oculta y enseña filas.

**Las fichas no pasan por el juez de textos de la web.** Mencionan las
formas que las reglas buscan («Espero que esto te ayude», «En
conclusión»…). Analizarlas sería medir los ejemplos de las reglas, no los
textos de la web: es mención, no uso, como en este documento. Sí pasan por el
juez todas las cadenas de la interfaz del catálogo (títulos, etiquetas,
botones), que están en [`web/src/textos.ts`](../web/src/textos.ts).

**Los jueces del catálogo**, en
[`web/jueces/catalogo.spec.ts`](../web/jueces/catalogo.spec.ts), comprueban:
- que hay una página por regla y que el índice las enlaza todas;
- que cada ficha lleva su id, su nombre, una fuente enlazada y sus ejemplos
  tal cual;
- que todo enlace interno de `dist/` llega a una página;
- que el índice lleva sus controles con sus etiquetas y la región que
  anuncia el recuento;
- con `astro preview`, que el índice y una ficha dan 200 y
  `/reglas/no-existe/`, 404;
- y, con `astro dev`
  ([`web/jueces/desarrollo.spec.ts`](../web/jueces/desarrollo.spec.ts)), que el
  índice y una ficha también se sirven, sin errores.

## Informe

Tras analizar, el botón **«Descargar informe»** genera el informe en PDF en
el navegador y lo descarga como «RadiografIA.pdf», sin pasar por el diálogo
de imprimir (decisión del 05/10/2026: ese diálogo no sirve en el iPhone ni en
el iPad). Funciona igual en el ordenador, la tableta y el móvil, y nada sale
del navegador: el PDF lo hace [pdfmake](https://pdfmake.github.io/) en la
propia página, con el último análisis pintado, y se descarga desde la
memoria del navegador.

**En el iPhone y en el iPad** el PDF se abre en el visor del sistema, y desde
ahí se guarda o se comparte (con el botón de compartir, por ejemplo «Guardar
en Archivos»). Es lo esperado: lo vio Antonio así en los dos el 05/10.

**Qué incluye**, en A4 con márgenes de 20 mm arriba y abajo y 18 a los lados,
calcado al marco «Informe · A4» del modelo:
1. la cabecera: la fecha y la hora del análisis, las palabras de prosa, el
   tramo y el género, los paquetes con su versión (los propios, marcados
   «(propio)») y, de cada paquete con escala, su total y con qué textos de
   personas se compara;
2. el resultado: la etiqueta y la frase, lo que más pesa, por dónde empezar
   y una línea de cada uno de los otros paquetes;
3. la clave de las familias: la muestra de la línea de cada una, en tinta, y
   «[sigla] familia (paquete)»;
4. el texto, con sus subrayados y, detrás de cada uno, entre corchetes, la
   sigla de su familia;
5. el desglose de cada paquete;
6. las señales, regla a regla: su frase en claro, hasta cinco fragmentos,
   «Qué hacer» y la dirección de su ficha del catálogo (las de un paquete
   propio no tienen ficha, y lo dice); al final, en letra más pequeña, por qué
   se mira cada una y las reglas de contexto;
7. la nota: RadiografIA analiza estilo; no demuestra autoría.

La 4, la 5 y la 6 empiezan página. Una señal no se parte entre dos páginas
y la nota no queda sola. Cada página lleva su número, «n / N», abajo a la
derecha. Las fuentes son las de la web, Literata y Atkinson Hyperlegible
Next, incrustadas.

**Lo que se carga al pulsar**, la primera vez en cada visita, del mismo
sitio: el trozo de JS de pdfmake (unos 1,09 MB; unos 363 KB comprimido con
gzip, medido el 06/10/2026) y las cinco caras del PDF (162.720 bytes, en WOFF). La página no
engorda por ello: sin pulsar, no se pide. Con el texto de prueba de la
combinación de los dos paquetes salen 11 páginas y unos 165 KB, del clic a
la descarga en algo más de un segundo la primera vez y en algo menos las
siguientes; depende del ordenador (en el de desarrollo, en Chrome headless, el
05/10/2026: de 1,26 a 1,39 s la primera vez y de 0,82 a 1,06 s las siguientes,
en tres tandas de tres). Mientras se prepara, el botón dice «Preparando el
informe…».

**Cuando no hay PDF.** Con menos de 100 palabras no hay informe que
descargar, y el botón lo dice debajo. Si algo falla al prepararlo (por
ejemplo, no llega una fuente), lo dice también, con el motivo.

**En qué se distingue del papel.** pdfmake dibuja los subrayados a su
manera: la línea discontinua y la punteada salen con el grosor de la familia
(se le pide el doble, porque recorta la mitad) y los puntos, como rayitas;
la doble discontinua de Ortotipografía, que pdfmake no tiene, va discontinua
y fina, y la sigla [O] la distingue; el tinte de un tramo ocupa la altura de
la línea; y un tramo con varias familias lleva la línea de la primera (las
siglas dicen todas). Las letras de Literata son las de su tamaño óptico de
12, el de por defecto (en papel, el navegador lo ajusta al cuerpo). El texto
es el mismo que el del papel.

**El papel.** Ctrl+P o el menú Imprimir del navegador sacan el mismo
informe en papel, con la hoja de impresión de la página; no se bloquean. Sin
análisis, sale una sola hoja con el icono, el nombre y el aviso de que no
hay nada que imprimir.
- **Márgenes: «Predeterminado».** En el diálogo de imprimir de Chrome, deja
  «Márgenes» en «Predeterminado»: el informe trae los suyos y el número de
  cada página. Con «Ninguno», Chrome quita los márgenes de la página y, con
  ellos, el número, que va en el margen: la hoja pone entonces los márgenes
  por dentro, pero el número no sale (visto en Chrome 154 el 05/10).
- **El color no hace falta para leerlo.** Cada subrayado lleva su sigla. No
  hay que marcar «imprimir fondos»; se lee igual en una impresora en gris.
- **Lo que no depende de la página.** El encabezado y el pie que añade el
  navegador (la dirección, la fecha, el título) dependen de sus ajustes: en
  Firefox, la casilla «Imprimir encabezados y pies de página». En Chrome no
  salen: el informe ocupa los márgenes con su número (visto en Chrome 154).
  En Safari no sale el número de página (no tiene cajas de margen).

**Imprime o descarga el último análisis.** Si después cambias el texto o los
paquetes, vuelve a pulsar «Pon tu texto a contraluz»; la cabecera dice de qué
análisis es el informe.

**Los jueces**, con Chrome:
- [`web/jueces/informe-pdf.spec.ts`](../web/jueces/informe-pdf.spec.ts), el
  PDF que se descarga de verdad: A4, «n / N» en cada página, las siete
  secciones en orden con los saltos del papel, ninguna señal partida (con el
  texto de prueba y con los dos ejemplos), el mismo texto que el papel, el
  calco al marco del modelo (±1 px), nuestras fuentes incrustadas y las
  mismas caras que el papel, lo mismo que el papel con un paquete propio, el
  aire de lo que el marco no mide (el final de la sección 6) como en el papel,
  que con menos de 100 palabras no hay PDF, que Ctrl+P no se toca y que no se
  pide nada fuera del propio sitio;
- [`web/jueces/papel.spec.ts`](../web/jueces/papel.spec.ts) e
  [`impresion.spec.ts`](../web/jueces/impresion.spec.ts), el papel: el calco al
  marco, la hoja sin análisis, que cada regla de la hoja de impresión se
  aplique de verdad (que ninguna quede pisada por otra), lo que sale y lo que
  no, y que imprimir no pide nada a la red;
- el juez 10 de [`construccion.spec.ts`](../web/jueces/construccion.spec.ts),
  que el trozo de pdfmake lleva dentro el aviso de licencia de cada pieza que
  empaqueta (THIRD-PARTY-NOTICES § 1.8).

## Diseño

El aspecto de la web (punto 10 del plan) sale de cuatro sitios, por este
orden de mando.

1. **El DISEÑO**, [`DISEÑO-RADIOGRAFIA.md`](../DISEÑO-RADIOGRAFIA.md). Manda.
   Fija:
   - la paleta de las familias, con sus estilos de línea y sus siglas;
   - la tipografía;
   - cómo es cada pantalla en el ordenador, la tableta y el móvil;
   - el informe;
   - las reglas de accesibilidad.

   Cuando el modelo dice otra cosa, gana el DISEÑO.
2. **El modelo.** Es un prototipo hecho en Figma Make a partir del DISEÑO.
   Su material está en [`docs/figma/`](figma/): las guías que leyó Make,
   los prompts y su código, solo como referencia de lectura.
   - **Cómo se calca.** El prototipo publicado se midió por CDP: fuente,
     tamaño, interlineado, colores, bordes, rellenos y cajas de 169 piezas,
     en sus tres tamaños y en el marco del informe A4. Las medidas están en
     [`docs/figma/medidas-modelo.json`](figma/medidas-modelo.json). La
     web se escribió a mano sobre Astro, sin copiar el código de Make, y el
     juez de fidelidad
     ([`web/jueces/fidelidad.spec.ts`](../web/jueces/fidelidad.spec.ts)) la
     compara pieza a pieza: ±1 px en las longitudes; el color, la letra y el
     texto, iguales.
   - **Lo que no viene del modelo.** Algunas piezas salen del DISEÑO y no
     del modelo: el icono de la cabecera, la separación de los párrafos, la
     columna del resultado con scroll propio, el sitio del anillo de foco al
     desplazar, la hoja de imprimir sin resultado y el salto antes del
     desglose. En las medidas llevan su
     apartado del DISEÑO y una nota que dice por qué.
3. **Los tokens.** Están en
   [`docs/figma/tokens.json`](figma/tokens.json), en el formato del
   Design Tokens Community Group (2025.10): colores, tipografías, tamaños,
   espacios, radios, foco, medidas y el informe.
   - **De dónde sale el CSS.** `web/src/estilos/tokens.css` se genera de ese
     JSON antes de cada `npm run dev` y `npm run build` (con
     [`web/scripts/tokens-a-css.ts`](../web/scripts/tokens-a-css.ts)) y no se
     versiona.
   - **Ningún color suelto.** Un juez comprueba que en `web/src` no hay
     ningún color fuera de los tokens
     ([`web/jueces/tokens.spec.ts`](../web/jueces/tokens.spec.ts)). El PDF lee
     el mismo JSON.
   - **El único cambio en los colores de las familias.** Puntuación y formato pasó de
     #009E73 a #009988 el 05/10/2026, porque el simulador de daltonismo la
     confundía con Ortotipografía (abajo, en el acta).
4. **Las fuentes.** Literata es la del texto analizado y la lectura;
   Atkinson Hyperlegible Next, la de la interfaz. Las dos son de licencia
   OFL 1.1.
   - **Dónde están.** Se sirven desde la propia web
     ([`web/public/fuentes/`](../web/public/fuentes/)), recortadas a los
     caracteres que se usan y fijadas en los pesos que hacen falta.
   - **Por qué desde la propia web.** Así nada sale del navegador: ni la
     dirección de quien la visita va a los servidores de Google Fonts (el
     LG München I lo condenó el 20/01/2022, 3 O 17493/20), ni la página
     depende de otro sitio. Recortadas pesan menos.
   - **Dónde está el detalle.** Origen, versiones, huellas y comandos, en
     [`docs/figma/fuentes.md`](figma/fuentes.md); la atribución, en
     [`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md) § 2.4.

Los iconos son los que eligió Antonio
([`docs/figma/icono/`](figma/icono/)): el de la pestaña del navegador y
el de la cabecera.

**La accesibilidad** está medida en el
[acta de contraste y accesibilidad](acta-contraste-y-accesibilidad.md).
Recoge:

- el contraste de cada par de colores y de todo el texto que se ve;
- el daltonismo simulado;
- los 320 px;
- el tamaño de lo que se pulsa;
- el árbol de accesibilidad;
- lo que queda sin medir, como un lector de pantalla de verdad.

## Paquetes

En [`paquetes/`](../paquetes/):

- **RadiografIA 0.1.0** ([`radiografia.json`](../paquetes/radiografia.json)):
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
    con los textos humanos de su género y su longitud (en
    [«Estadística»](CALIBRACION.md#estadística)). Siete suman: frases cortas, pocas comas,
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
  ([`espanol-correcto.json`](../paquetes/espanol-correcto.json)): siete avisos
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
- El esquema está en [`motor/esquema/`](../motor/esquema/):
  `paquete.schema.json` y `regla.schema.json`, en JSON Schema 2020-12. Con
  la línea `"$schema"` que llevan los incluidos, VS Code avisa de los
  errores mientras se escribe.
- Las fichas del catálogo (`/reglas/<id>/`) sirven de modelo: cada una
  enseña la regla entera y cómo busca, dicho en palabras.
- Hay uno de ejemplo, corto:
  [`web/public/ejemplos/paquete-prueba.json`](../web/public/ejemplos/paquete-prueba.json).
  Son tres reglas en la familia «Pruebas», una de patrón («a nivel de»), una
  estructural (pregunta sin signo de apertura) y una informativa («okey» u
  OK), con la norma del *Diccionario panhispánico de dudas*. No mide estilo
  de IA: sirve para probar el cargador y para copiarlo. No trae
  calibración.
- Su gemelo,
  [`paquete-prueba-invalido.json`](../web/public/ejemplos/paquete-prueba-invalido.json),
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
   calibración, ocupa 347.340 bytes, medido el 06/10/2026). Un fichero más
   grande no se llega a leer.
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
- Las familias de un paquete propio se subrayan en gris (ink-2, con su
  tinte al 14 %) y con trazo discontinuo, también sus reglas informativas
  (DISEÑO §4; desde el 10.4, porque en el 8.1 las informativas iban
  punteadas).
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
- Un juez ([`web/jueces/navegador.spec.ts`](../web/jueces/navegador.spec.ts))
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

## Cómo está pensado

- **Astro estático, sin backend.** Todo corre en el navegador.
- **La CSP, lo primero de cada página.** Astro escribe el `<meta>` de la
  política al final del `<head>`, y lo que la página pusiera antes (una
  precarga de fuentes, un icono) quedaría fuera. Una integración de
  [`web/astro.config.mjs`](../web/astro.config.mjs) lo recoloca al terminar el
  build, justo detrás de `<meta charset>`, sin tocar su contenido; un juez
  comprueba el sitio y que el contenido es el que emitió Astro. Desde la
  publicación (11.2), la CSP va también por cabecera, idéntica, en el
  `.htaccess`; el `<meta>` se queda, y la integración con él.
- **Párrafos como en CommonMark.** Una línea en blanco separa dos párrafos
  y un salto de línea simple no (especificación CommonMark 0.31.2, § 4.8 y
  § 6.8). Así, un texto cortado a mano (un correo, un PDF copiado, un
  Markdown a 76 columnas como este documento) se lee con sus párrafos.
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
    [`motor/src/texto-cortado.spec.ts`](../motor/src/texto-cortado.spec.ts):
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
  [`docs/investigacion/`](investigacion/), hecha antes de escribir su
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
  [`motor/esquema/`](../motor/esquema/).
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
