# Bitácora de fallos

> El registro crudo de los fallos reales, escrito EN CALIENTE.
> No es un changelog ni una guía. Cuenta EL CASO: qué pasó, qué dio verde
> mientras pasaba, y cómo se cazó.
>
> Campo estrella (⭐): se captura al DESCUBRIR el fallo, antes de
> arreglarlo. Es el dato perecedero.
>
> Una entrada por fallo. No se fusionan.
> `NO CONSTA` = lo busqué y no está. `⏳ PENDIENTE` = aún no ha ocurrido.
>
> Orden cronológico inverso: lo más reciente, arriba.

---

## [2026-10-04] 🔴 ABIERTA — La hoja inferior del móvil sale estrecha si la tarjeta se abrió antes en escritorio

**Categoría:** interfaz del analizador (calco 10.4, Tanda 2)
**Síntoma:** abierta la tarjeta de regla a 1280 y cerrada, al estrechar la ventana a 390 y tocar un tramo, la hoja inferior mide 229 px de ancho en vez de los 390 de la pantalla (el asa, 229; «Siguiente», 197 en vez de 358). Commiteado en `76ef465` (web(hoja)), vivo en `51aadab`.
**⭐ Qué dio verde mientras el fallo estaba vivo:** `web/jueces/hoja.spec.ts`, cuyo juez 1 exige la hoja «abajo y a todo el ancho». Dio verde en los clones limpios de `76ef465` y `51aadab` (suite web: «ℹ tests 165 · ℹ pass 165 · ℹ fail 0» y «ℹ tests 172 · ℹ pass 172 · ℹ fail 0»). Ejecutado otra vez con el fallo vivo (`tarjeta.ts` igual que en HEAD), antes de tocar nada:
`$ node --test --test-concurrency=1 --test-timeout=120000 jueces/hoja.spec.ts`
`✔ 1 · tocar un tramo abre la hoja: modal, con nombre y el foco en el título, abajo, a todo el ancho y como mucho al 60 %; lo demás, inerte (5231.7985ms)` … `ℹ tests 6` `ℹ pass 6` `ℹ fail 0`
**Cómo se cazó:** test (el juez de fidelidad ampliado, `fidelidad.spec.ts`, juez 7, sin commitear: «'movil.hoja · ancho: web 229.109375, modelo 390', 'movil.hoja.asa · ancho: web 229.109375, modelo 390', 'movil.hoja.siguiente · ancho: web 197.109375, modelo 358'»)
**Causa raíz:** ⏳ PENDIENTE
**Arreglo aplicado:** ⏳ PENDIENTE
**Commit:** ⏳ PENDIENTE
**Ley que sale de aquí:** SIN LEY TODAVÍA
**Traza:** `web/src/pantalla/tarjeta.ts` (crearTarjeta: recolocar, abrirHoja); `web/src/estilos/tarjeta.css` (`.tarjeta-regla.hoja`); `web/jueces/hoja.spec.ts` (juez 1).

## [2026-10-02] ✅ CERRADA — El aviso MIT de Ajv no viaja en el build de Astro: Vite 8 tira los comentarios legales al minificar

**Categoría:** licencias de terceros (empaquetado del navegador)
**Síntoma:** en un proyecto Astro 7.3.5 de prueba (scratchpad, encargo 6.2, parada 1), con el motor del repo tal cual importado por `@radiografia/motor/navegador`, `astro build` (Vite 8.3.2, Rolldown 1.2.12, minificador Oxc) deja un único JS sin el aviso: ni el copyright ni el texto de la licencia. THIRD-PARTY-NOTICES § 1.1 (`10c8da7`) y el plan dicen que el aviso viaja en el bundle.
**⭐ Qué dio verde mientras el fallo estaba vivo:** el juez 3 de `motor/src/navegador.spec.ts` (`5c0b6a9`), que empaqueta con esbuild. Ejecutado el 02/10, antes de tocar nada:
```
$ node --test --test-name-pattern="aviso MIT" src/navegador.spec.ts
✔ 3 · el bundle, sin minificar y minificado, lleva entero el aviso MIT de Ajv (370.0611ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
```
Y el build de prueba, el mismo día:
`dist/_astro/index.astro_astro_type_script_index_0_lang.CjrtYGur.js: 113291 bytes · «Evgeny Poberezkin»: 0 · «Permission is hereby granted»: 0`
**Cómo se cazó:** instrumento (al buscar el banner en el JS del build de prueba de la parada 1 del 6.2)
**Causa raíz:** el juez juzgaba un sustituto del empaquetador, no lo que se publica. esbuild conserva los comentarios legales por defecto («These comments are preserved in output files by default», esbuild.github.io/api/#legal-comments); Vite 8, el de Astro, minifica el cliente con Oxc y, al minificar, fija `comments.legal = !options.minify`: los quita. Cuando el juez se escribió (6.1) aún no existía el build de Astro, y su cabecera daba por hecho que esbuild era «como el build».
**Arreglo aplicado:** `web/astro.config.mjs`: `vite.build.rolldownOptions.output.comments.legal: true`, con sus citas (Vite build-options y Rolldown OutputOptions.comments). Juez 6 de `web/jueces/construccion.spec.ts` sobre el JS de `web/dist/`: el que lleva el validador lleva entero el LICENSE de ajv. Rojo sin `comments.legal` («_astro\index.astro_astro_type_script_index_0_lang._adyIPuq.js no lleva el LICENSE de ajv entero»), verde con él, contraprueba 2/2. La cabecera, el juez 3 y el describe de `motor/src/navegador.spec.ts` y THIRD-PARTY-NOTICES § 1.1 dicen ahora que el build real es el de Astro y que lo vigila el juez de web.
**Commit:** `cb35b3e` (comments.legal en astro.config.mjs), `22ecf31` (juez 6 de web), `9bbc998` (los textos).
**Ley que sale de aquí:** SIN LEY TODAVÍA
Al cerrar (2026-10-02): un juez de lo que llega al usuario se pasa sobre el artefacto que se publica (`dist/`), no sobre un empaquetado que se le parece.
**Traza:** `motor/src/navegador.spec.ts` (juez 3, `empaquetar` con esbuild); `motor/src/generar-validador.ts` (banner `/*!`); `node_modules/vite/dist/node/chunks/node.js:34428` (`comments: { legal: !options.minify, … }`); THIRD-PARTY-NOTICES.md § 1.1.

## [2026-09-30] ✅ CERRADA — El filtro «fiction» de Gutenberg deja pasar la crítica literaria («Spanish fiction -- History and criticism»)

**Categoría:** herramienta de calibración (extracción de corpus)
**Síntoma:** los tres tomos de «Orígenes de la novela» de Menéndez Pelayo (pg70058, pg71733, pg76459) están en la muestra de narrativa-clasica: el tomo I es el estudio crítico («Reseña de la novela en la antigüedad clásica, griega y latina…»); el II y el III, la antología de textos que lo acompaña (diálogos lucianescos, coloquios, comedias en diálogo). En el catálogo hay 947 líneas con «History and criticism». Visto al releer las etiquetas de 600+, antes de hacer commit de los datos de narrativa.
**⭐ Qué dio verde mientras el fallo estaba vivo:** los jueces de `gutenberg.ts` en HEAD (`0b33a73`), y con el mismo código el filtro sobre el catálogo en caché:
```
$ node --test herramientas/calibrar/gutenberg.spec.ts
✔ leerCsv (RFC 4180) (1.6776ms)
✔ persona: nombre, año de muerte y papel (1.2909ms)
✔ librosDelCatalogo y filtrarLibro (0.7356ms)
✔ lenguasPropias y el filtro por autor (0.2542ms)
✔ enlacesDeHarvest (0.378ms)
ℹ tests 17
ℹ pass 17
ℹ fail 0
filtrarLibro(pg70058 «Orígenes de la novela,  Tomo I», Subjects «Spanish fiction -- History and criticism») → {"dentro":true}
filtrarLibro(pg71733 «Orígenes de la novela, Tomo II», Subjects «Spanish fiction -- History and criticism») → {"dentro":true}
filtrarLibro(pg76459 «Orígenes de la novela, Tomo II», Subjects «Spanish fiction -- History and criticism») → {"dentro":true}
```
**Cómo se cazó:** ojo humano (relectura de la muestra de 300-599 y 600+ a la parada de narrativa)
**Causa raíz:** `filtrarLibro` buscaba «fiction» como subcadena en todo el campo Subjects, y en los encabezamientos de materia «fiction» aparece también como TEMA de un libro de crítica («Spanish fiction -- History and criticism»), no solo como su forma. Los jueces tenían filas inventadas con «fiction» siempre como forma («Spanish fiction», «Satire -- Fiction»): ninguna con una subdivisión de crítica, así que no había caso que los contradijera.
**Arreglo aplicado:** `motor/herramientas/calibrar/gutenberg.ts`, `esFiccion()`: un libro es ficción si algún encabezamiento suyo con «fiction» no lleva «-- History and criticism» (la única subdivisión de crítica en los encabezamientos con «fiction» de los libros en español del catálogo, contadas todas). Juez nuevo (fila 11 fuera, fila 12 dentro), en rojo antes del verde; contraprueba 3 de 3. Comprobado en el catálogo real: `filtrarLibro(pg70058…)`, `(pg71733…)` y `(pg76459…)` → `{"fuera":"crítica: «fiction» solo con «History and criticism»"}`, y salen exactamente esos tres (descarga del 30/09: «crítica…»: 3).
**Commit:** 5b8a8f0
**Ley que sale de aquí:** SIN LEY TODAVÍA
Y al cerrar: un filtro por palabra clave se juzga con todas las formas en que esa palabra aparece en el dato real, no con las que imaginó quien escribió el juez.
**Traza:** `motor/herramientas/calibrar/gutenberg.ts` (`filtrarLibro`); `motor/herramientas/calibrar/gutenberg.spec.ts`. Misma relectura que la reapertura de «Los capítulos de EPUB dejaban entrar…».

---

## [2026-09-30] ✅ CERRADA — El texto alternativo de las imágenes del EPUB «noimages» entra en los capítulos con los jueces en verde

**Categoría:** herramienta de calibración (extracción de corpus)
**Síntoma:** en los EPUB «epub.noimages» de Gutenberg cada imagen es un `<span id="img_…">` con su texto alternativo, y ese texto queda dentro del capítulo: «Pie» y «Cabecera» como líneas sueltas en los capítulos de pg14995 («Los hombres de pro»); el nombre de la capitular pegado a la primera palabra en pg75382 («letra-a-iloPENAS» por «APENAS»). Hay 2.801 spans así en 157 de los 243 libros de la muestra. Visto al releer la muestra de 300-599 y 600+, antes de hacer commit de los datos de narrativa.
**⭐ Qué dio verde mientras el fallo estaba vivo:** los jueces de `epub.ts` en HEAD (`0b33a73`), y con el mismo código los capítulos extraídos de la caché:
```
$ node --test herramientas/calibrar/epub.spec.ts
✔ capitulosDeEpub (6.2473ms)
✔ esDivisionNumerada (0.4778ms)
✔ esParatexto (0.406ms)
ℹ tests 8
ℹ pass 8
ℹ fail 0
pg14995-013 dentro: línea 65: «Pie» · línea 66: «Cabecera»
pg75382-013 dentro: línea 1: «letra-a-iloPENAS un asomo de razón ilumi»
```
Y la revisión a mano declarada en el manifiesto («los 127 capítulos de 100-299 de la primera descarga completa, uno a uno») no lo señaló.
**Cómo se cazó:** ojo humano (relectura de la muestra a la parada de narrativa)
**Causa raíz:** `epub.ts` no sabía que Ebookmaker, en los EPUB «noimages», cambia cada `<img>` por un `<span id="img_…">` con su texto alternativo, y `html.ts` quita etiquetas pero conserva su contenido: el texto alternativo quedaba como texto del libro. El fixture, hecho a imagen de pg12457, no tenía ninguna imagen, y la revisión a mano leía el arranque de los capítulos; «Pie» y «Cabecera» van en medio, entre párrafos.
**Arreglo aplicado:** `motor/herramientas/calibrar/epub.ts`, `sinImagenes()`, antes de `lineasDeHtml`: fuera el texto alternativo, los pies (`class="caption"`) y el pie que lo repite justo detrás (pg15115); se queda la letra de una capitular salvo que detrás vaya ya la palabra entera («A» + «Aunque»). Un primer intento quitaba el `div` entero de la figura y se llevaba narración (pg42440): descartado antes del commit. Fixture y jueces en rojo antes del verde; contraprueba 8 de 8. Comprobado sobre la muestra que sale, no sobre los casos: en los 7.878 capítulos de los 243 libros, las líneas de texto de imagen («Cabecera», «Pie», «decoración», «flor», «barra», «letra-…», «ilop…») pasan de 493 a 0; `pg14995-013` ya no tiene «Pie» ni «Cabecera». Límites declarados en el manifiesto: «PENAS» (pg75382), «CCAPÍTULO» (pg62359) y la letra sola de una capitular en su propio bloque (31 líneas en 11 libros).
**Commit:** 2f2cdea
**Ley que sale de aquí:** SIN LEY TODAVÍA
Y al cerrar: la relectura de un documento extraído cubre el documento entero, no su arranque; lo que se cuela vive en medio y al final.
**Traza:** `motor/herramientas/calibrar/epub.ts` (`capitulosDeEpub`); `motor/herramientas/calibrar/html.ts` (`limpiarHtml`, `lineasDeHtml`).

---

## [2026-09-30] ✅ CERRADA — Los capítulos de EPUB dejaban entrar anuncios, glosarios y preliminares con los jueces en verde

**Categoría:** herramienta de calibración (extracción de corpus)
**Síntoma:** en el piloto de narrativa-clasica (40 EPUB de Gutenberg), entre los documentos del tramo 100-299 estaban el catálogo de anuncios del editor de pg29831 («OBRAS DEL MISMO AUTOR», «PSICOLOGÍA ALEMANA… 3,50 pesetas») y la «ACLARACIÓN» de pg32364; en 600+, un glosario inglés «ABBREVIATIONS» de 14.831 palabras (pg29731). Ningún dato publicado: se vio antes de calibrar.
**⭐ Qué dio verde mientras el fallo estaba vivo:** los jueces de `epub.ts` en el commit `4f5c0e9`, ejecutados en un clon limpio de ese commit, y en el mismo clon el fallo:
```
$ node --test herramientas/calibrar/epub.spec.ts
✔ capitulosDeEpub (4.9125ms)
✔ esDivisionNumerada (0.321ms)
✔ esParatexto (0.339ms)
ℹ tests 8
ℹ pass 8
ℹ fail 0
esDivisionNumerada('D. ARMANDO PALACIO VALDÉS') → true
pg29831 capítulos dentro: OBRAS DEL MISMO AUTOR · PSICOLOGÍA ALEMANA CONTEMPORÁN · CALDERÓN DE LA BARCA
```
**Cómo se cazó:** ojo humano (revisión a mano de los capítulos de 100-299 del piloto)
**Causa raíz:** ~~el EPUB de prueba (`fixtures/prueba.epub`) solo tenía la estructura que se había visto en pg12457: ni abreviaturas con punto en el índice, ni anuncios del editor al final, ni paratextos en inglés. `NUMERADA` aceptaba cualquier letra romana suelta con punto («D.»), y ninguna regla miraba lo que va detrás del último capítulo. Los jueces pasaban porque no había caso que los contradijera.~~
~~Los jueces se escribieron contra un EPUB sintético hecho a imagen de un solo libro (pg12457), y las reglas de `epub.ts` (qué es paratexto, qué es división numerada, dónde empieza el libro) son listas de etiquetas: cada libro real con una etiqueta no prevista las burlaba sin que ningún juez lo supiera. **Por qué no aguantó el primer cierre:** se comprobó solo en los tres libros del síntoma, no releyendo la muestra resultante; con 240 libros salieron etiquetas nuevas del mismo tipo (portadas con el título, «TASA», «TABLA», letras espaciadas, años, escenas, plurales).~~
Las reglas de `epub.ts` deciden por la ETIQUETA de cada entrada del índice, una a una, y lo que no es narración llega también de formas que ninguna etiqueta delata: secciones anidadas en un prólogo que se llaman «I», «II»; prólogos con otro nombre («BREVE NOTICIA», «ANTES DE EMPEZAR»); teatro con título propio («EL RETABLO DE LAS MARAVILLAS», «JORNADA SEGUNDA»); ensayos dentro de libros de ficción; libros enteros en diálogo o de crítica (esto, del filtro del catálogo: entrada aparte); y, dentro del último capítulo, lo que va detrás de «FIN» (catálogo del editor, crítica, erratas), que no tiene entrada en el índice. Los jueces solo conocían lo que se había visto. **Por qué no aguantó el segundo cierre:** su relectura cubrió una parte de la muestra (100-299 entero y los capítulos SIN numerar de 300-599) y solo el arranque de cada capítulo; 600+, la mayor celda publicada, y los finales no se leyeron, y el informe dio por buena la parte leída.
**Arreglo aplicado:** ~~`epub.ts`: los romanos de una sola letra solo valen si son I, V o X, y se aceptan los numerales entre guiones (`NUMERADA`); nueva regla `FINAL`, que deja fuera todo desde la primera entrada «obras del mismo autor», «catálogo»…; `PARATEXTO` añade aclaración, prefacio, notes, vocabulary, abbreviations y exercises. Fixture y jueces ampliados (anuncios finales, «D. ARMANDO…», «M. Bergeret…», «-I-»), en rojo antes del verde, con contraprueba de 5 de 5. Comprobado después en los tres libros del síntoma: `esDivisionNumerada('D. ARMANDO PALACIO VALDÉS') → false`; pg29831, «OBRAS DEL MISMO AUTOR», «PSICOLOGÍA ALEMANA…» y «CALDERÓN DE LA BARCA» → final; pg32364, «ACLARACIÓN» → paratexto; pg29731, «ABBREVIATIONS» → paratexto.~~
~~Lo de `27157be` y, además: `08bf5f9`, portada (la etiqueta empieza por el `dc:title` del OPF), tasa, privilegio, aprobación, tabla, codificación y ediciones como paratexto, letras espaciadas juntas antes de mirar, teatro («ESCENA», «SCENA», «ACTO»), los arábigos de cuatro cifras no son capítulo; `2d65c97`, plurales explícitos (advertencias, dedicatorias, aclaraciones) y proemio, obras citadas, significado de; `ef04f80`, en el descargador, un capítulo idéntico a uno ya tomado no entra dos veces. Comprobado, esta vez releyendo la muestra: los 104 capítulos de 100-299 y los 31 sin numerar de 300-599, uno a uno, y los casos de la reapertura con el código de `ef04f80`: `esDivisionNumerada('1872') → false | esParatexto('TASA') → true | esParatexto('D E D I C A T O R I A') → true | esParatexto('ADVERTENCIAS') → true`; pg62691 «El criticón» → portada; pg2000 «TASA» → paratexto; pg49756 «ESCENA…» → teatro. Quedan dentro, declarados en el manifiesto, 13 capítulos de 100-299 y 3-4 de 300-599 que no son narración y ninguna regla general separa.~~
Lo anterior y, además: `754510b`, lo que el índice anida en un prólogo (prefacio, introducción, proemio, advertencia, «al lector») es prólogo, 23 secciones en 6 libros; `aef73fc`, `recortarFinal()`: dentro del capítulo, desde una marca de fin sola en su línea o desde una línea corta que abre el catálogo del editor, todo fuera (145 capítulos recortados en los 243 libros, 10.890 palabras); `83ec559`, las listas a mano con su motivo por decisión de Antonio (2 autores, 2 obras en diálogo, 21 capítulos, después del tope y sin sustituir; si una ya no está en la muestra, PARA, y paró dos veces: `pg42440-002` era texto de una imagen y `pg39613-039` pasó a idéntico); la crítica, en «El filtro "fiction"…» (`5b8a8f0`). Fixture y jueces en rojo antes del verde; contraprueba 3 de 3 y 5 de 5. Comprobado releyendo la muestra que se publica, entera: las etiquetas de todos los capítulos de 300-599 y 600+ (1.349 en la muestra de entonces) y el arranque de los sospechosos, el arranque del primer capítulo de cada uno de los 237 libros, los 8 capítulos que entraron al cambiar la extracción (todos narración), los finales de 300-599 y 600+ con marcas de contraportada (81 marcados, quedan solo fechas de redacción y algún título de sección) y cada corte de más de 250 palabras (justo antes queda el final de la narración). Con el código de `c825201`, en esa muestra: 0 líneas de texto de imagen, 0 catálogos detrás de «FIN»; `pg39444-035` acaba en «Los que le rodeaban creían que el terror le hacía desvariar.»
**Commit:** ~~27157be~~ 27157be, 08bf5f9, 2d65c97, ef04f80, 754510b, aef73fc, 83ec559, 0657408, c825201
**Ley que sale de aquí:** un fixture sintético solo juzga lo que su autor imaginó: antes de calibrar, se leen a mano documentos reales de cada tramo.
Y al cerrar otra vez: un arreglo se comprueba sobre la muestra que sale, no sobre los casos que lo dispararon.
Y al cerrar por tercera vez: la relectura cubre TODA la muestra que se publica, y de cada documento el principio y el final; una relectura por partes deja pasar lo que vive en la parte sin leer, y el informe no dice más de lo que se leyó.
**Traza:** `motor/herramientas/calibrar/epub.ts` (`esDivisionNumerada`, `esParatexto`, `capitulosDeEpub`, `recortarFinal`); `motor/herramientas/calibrar/epub.spec.ts`; `motor/herramientas/calibrar/fixtures/prueba.epub`.
**Nota:** el arreglo ya había comenzado al abrir esta entrada.
**Nota [2026-09-30] — reabierta:** con la descarga completa (240 EPUB), la revisión a mano de los 127 capítulos de 100-299 encontró unos 30 que no eran narración: portadas cuyo índice repite el título («El criticón»: «Logotipo del editor / BIBLIOTECA RENACIMIENTO…»), la «TASA» del Quijote, «TABLA», «D E D I C A T O R I A», «Codificación», un año tomado por capítulo («1872»), escenas de teatro y capítulos duplicados entre dos libros. En un clon limpio de `27157be`:
```
$ node --test herramientas/calibrar/epub.spec.ts
✔ capitulosDeEpub (5.2029ms)
✔ esDivisionNumerada (0.4562ms)
✔ esParatexto (0.3557ms)
ℹ tests 8
ℹ pass 8
ℹ fail 0
esDivisionNumerada('1872') → true | esParatexto('TASA') → false | esParatexto('D E D I C A T O R I A') → false
pg62691 dentro: El criticón
pg2000 dentro: TASA
pg49756 dentro: ESCENA PRIMERA · ESCENA II · ESCENA III
```
El arreglo nuevo empezó antes de esta nota (código cambiado, sin commit).
**Nota [2026-09-30] — reabierta otra vez:** a la parada de narrativa, releyendo las etiquetas de los capítulos de 300-599 y 600+ (los de las celdas publicadas) y el arranque de los sospechosos, siguen dentro capítulos que no son narración: teatro de Cervantes (pg15115, el entremés «EL RETABLO DE LAS MARAVILLAS» y «JORNADA SEGUNDA» de La Numancia), prólogos con título propio (pg55448 «BREVE NOTICIA», pg38814 «ANTES DE EMPEZAR»; en pg55916 el prólogo de Unamuno va numerado «I», «II»), obras en diálogo sin narrador (La Celestina, pg1619; La Lozana andaluza, pg50291), secciones de ensayo dentro de libros de ficción (la cosmogonía de Lugones en pg65689; el tratado de cocotología en pg49149). El cierre anterior solo releyó 100-299 y los capítulos SIN numerar de 300-599: 600+ y los numerados no se leyeron. En HEAD (`0b33a73`):
```
$ node --test herramientas/calibrar/epub.spec.ts
✔ capitulosDeEpub (6.2473ms)
✔ esDivisionNumerada (0.4778ms)
✔ esParatexto (0.406ms)
ℹ tests 8
ℹ pass 8
ℹ fail 0
pg15115 dentro: EL RETABLO DE LAS MARAVILLAS · JORNADA SEGUNDA
pg55448 dentro: BREVE NOTICIA
pg38814 dentro: ANTES DE EMPEZAR
pg1619 dentro: "EL AUCTOR
pg49149 dentro: ETIMOLOGÍA
pg65689 dentro: EL ORIGEN DEL UNIVERSO
```
Y el informe de la parada decía «13 en 100-299 y 3 o 4 en 300-599», sin haber leído 600+. Nada publicado: los datos de narrativa no tienen commit.
**Nota [2026-09-30] — sigue abierta, más de lo mismo dentro del capítulo:** con los arreglos de `754510b` y las listas de `83ec559`, el final de los capítulos trae lo que la regla `FINAL` solo miraba en el índice: detrás de «FIN» o de un párrafo «OBRAS DE…» van el catálogo del editor, opiniones de la crítica, tablas de erratas del transcriptor y fechas. La relectura miró arranques, no finales. En `83ec559`:
```
$ node --test herramientas/calibrar/epub.spec.ts
✔ capitulosDeEpub (7.752ms)
✔ esDivisionNumerada (0.4737ms)
✔ esParatexto (0.4172ms)
ℹ tests 9
ℹ pass 9
ℹ fail 0
pg39444-035 dentro: línea 70 «OBRAS DE A. PALACIO VALDES» y detrás 4218 palabras («Y»…)
pg25074-025 dentro: línea 39 «FIN» y detrás 865 palabras («CALPE»…)
pg45834-018 dentro: línea 186 «FIN DEL TOMO SEXTO» y detrás 185 palabras («| Los errores corregidos por el transcri»…)
```
Nada publicado todavía.

---

## [2026-09-29] ✅ CERRADA — `grep -c $'\r'` dentro de `"$( )"` cuenta todas las líneas, no los CR

**Categoría:** instrumento de medida
**Síntoma:** en el encargo 3.3 se afirmó a Antonio que `silabea/index.js` «viene con finales de línea CRLF», y se escribió en la cabecera de `motor/src/terceros/silabea.cjs` (sin commit). El fichero es LF puro.
**⭐ Qué dio verde mientras el fallo estaba vivo:** la cuenta de CR con grep, en la forma usada (Git Bash, GNU grep 3.0), frente a los bytes reales:
```
$ echo "CR en index.js npm: $(grep -c $'\r' node_modules/silabea/index.js)"
CR en index.js npm: 720
$ node … (bytes 0x0D y 0x0A)
node → CR: 0 LF: 720
```
La misma forma fue la prueba de «suite verde sobre un clon CRLF» en el cierre del 3.1: `CRLF en clon: 85 líneas con CR en valido.json`, con `valido.json` de 85 líneas. Suelto, `grep -c $'\r'` sí da `0` sobre el fichero LF.
**Cómo se cazó:** instrumento — el sha256 del «original normalizado a LF» salió idéntico al del original sin normalizar, imposible si tuviera CR; se contaron los bytes con node.
**Causa raíz:** dentro de una sustitución de comando entre comillas dobles, en este Git Bash (GNU bash 5.2.37, msys; GNU grep 3.0), `grep -c $'\r'` recibe un patrón que casa con todas las líneas: reproducido sobre un fichero LF de dos líneas, `echo "x$(grep -c $'\r' f)x"` da `x2x`, y suelto da `0`. En qué se convierte exactamente el patrón: **NO CONSTA** (`od` no lo dejó ver y no se investigó más: se cambió de instrumento). Nadie había visto funcionar ese escape antes de usarlo como prueba.
**Arreglo aplicado:** los CR se cuentan con node, byte a byte (0x0D). La cabecera de `motor/src/terceros/silabea.cjs` dice ahora «el código de debajo es su index.js byte a byte (LF, como el original)» en vez de «de CRLF a LF»; el guardián de § 1.5 (`motor/src/notices.spec.ts`, juez 8) normaliza a LF antes de calcular huellas, porque el checkout con `core.autocrlf=true` sí mete CR (medido con node: 86/86). La afirmación hecha a Antonio se corrige en el reporte del 3.3.
**Commit:** `9e81141`
**Ley que sale de aquí:** los bytes de un fichero se cuentan leyendo bytes (node, `od`), no con un patrón de shell cuyo escape no se ha visto funcionar; y una cifra igual al número de líneas es sospechosa por sí sola.
**Traza:** comandos de verificación del ejecutor (cierre del 3.1 y encargo 3.3); `motor/src/terceros/silabea.cjs` (cabecera). Re-medido con node el clon del 3.1 (`clon3`): `valido.json` CR 86 / LF 86 con `core.autocrlf=true` — aquella afirmación era cierta, pero no estaba medida.

## [2026-09-29] ✅ CERRADA — Un juez que revienta en el `describe` no cuenta como fallo en el resumen de `node --test`

**Categoría:** instrumento de prueba
**Síntoma:** `motor/src/notices.spec.ts` lee `THIRD-PARTY-NOTICES.md` en el cuerpo del `describe`, fuera de todo `test`. Con el NOTICES aún sin escribir, `readFileSync` lanza `ENOENT` y la suite sale marcada `✖`, pero ninguno de sus cuatro jueces llega a registrarse.
**⭐ Qué dio verde mientras el fallo estaba vivo:** el resumen de `node --test` (Node v24.19.0). Ejecutado sin NOTICES:
```
✖ el THIRD-PARTY-NOTICES no puede envejecer solo (0.38ms)
ℹ tests 7
ℹ suites 2
ℹ pass 7
ℹ fail 0
npm test exit=1
```
`ℹ fail 0` es la línea que el ejecutor filtraba con `grep -E "^ℹ (tests|pass|fail)"` para dar por buena la restauración tras la contraprueba del validador. Solo el código de salida (`1`) y la línea `✖` decían la verdad.
**Cómo se cazó:** test — escribiendo el guardián en rojo antes que el NOTICES y leyendo la salida entera, no el resumen.
**Causa raíz:** los contadores `ℹ tests / pass / fail` de `node --test` cuentan jueces registrados, no suites. La excepción saltó en el cuerpo del `describe` antes de que se registrara ningún `test`: la suite quedó `✖` y el proceso salió con 1, pero no había ningún juez que sumar a `fail`. Es lo que se observó en Node v24.19.0. Que la doc de `node:test` lo describa así NO CONSTA: no se ha leído esa parte.
**Arreglo aplicado:** `motor/src/notices.spec.ts` líneas 84-103: las lecturas pasan a `leerTodo()`, memorizada en `leer()`, y cada uno de los cuatro jueces la llama dentro de su `test`. Verificado sin NOTICES: `ℹ tests 11 · ℹ pass 7 · ℹ fail 4`, los cuatro con `ENOENT`, `exit=1`. Con el NOTICES escrito: `ℹ pass 11 · ℹ fail 0`, `exit=0`, también sobre un clon limpio. El arreglo se hizo antes del primer commit del fichero: el estado roto no llegó al repositorio.
**Commit:** `f524535`
**Ley que sale de aquí:** un verde de `node --test` es el código de salida y la lista de `✔/✖`, no el contador `ℹ fail`; y lo que un juez lee se lee dentro del `test`, para que su fallo cuente.
**Traza:** `motor/src/notices.spec.ts` (lectura en el `describe`); patrón heredado de `004_DESPLAZAME/motor/src/notices.spec.ts`, que hace lo mismo — reportado, no tocado.
