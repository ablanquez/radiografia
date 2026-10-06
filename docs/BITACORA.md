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

## [2026-10-06] 🔴 ABIERTA — El juez del README no encuentra el paquete de ejemplo si el README sale del checkout con CRLF

**Categoría:** finales de línea / juez que solo se probó con ficheros copiados
**Síntoma:** con `README.md` en CRLF (el checkout de esta máquina, `core.autocrlf=true`; `.gitattributes` no fija `eol` para los `.md`), el test 4 de `web/jueces/readme.spec.ts` (commit `6166bba`, encargo 11.4) cae: `/^```json\n/` no casa con «```json\r\n». Medido en el clon de trabajo con el README pasado a CRLF: «✖ 4 · el paquete de ejemplo entra como un paquete propio y sus ejemplos hacen lo que dicen; el error que cita es el de la web (1.0155ms)» y «AssertionError [ERR_ASSERTION]: el bloque JSON del paquete de ejemplo». Los tests 1 a 3 pasan.
**⭐ Qué dio verde mientras el fallo estaba vivo:** el juez entero en el clon de trabajo (`F:/_clones-005/trabajo`), con `README.md` y los documentos copiados con `cp` desde el árbol real en LF, no sacados por git. Con `URL_PRODUCCION`: «ℹ tests 5», «ℹ pass 5», «ℹ fail 0», «ℹ skipped 0». Y las quince contrapruebas, todas «ROJO» en su test, con «ficheros del clon, como en el repo real: true».
**Cómo se cazó:** ojo humano: el ejecutor, antes de lanzar la verificación en clon limpio de `6166bba`, cayó en que el clon limpio saca los `.md` en CRLF y lo probó.
**Causa raíz:** ⏳ PENDIENTE
**Arreglo aplicado:** ⏳ PENDIENTE
**Commit:** ⏳ PENDIENTE
**Ley que sale de aquí:** SIN LEY TODAVÍA
**Traza:** `web/jueces/readme.spec.ts` (test 4, el bloque `json` de «Cómo escribir un paquete propio»); `README.md`; el clon de trabajo y `scratchpad/c111/correr.sh`, que copia ficheros.

---

## [2026-10-06] ✅ CERRADA — El JS del analizador lleva código de Vite (su función de precarga) sin aviso de licencia, y el censo y el NOTICES dicen que lo que viaja está completo

**Categoría:** licencias de terceros (empaquetado del navegador)
**Síntoma:** desde el 9.3 (el `import()` de pdfmake), Vite 8.3.2 mete en el JS del analizador su función `preload` (`node_modules/vite/dist/node/chunks/node.js`, MIT, © VoidZero Inc. and Vite contributors): `__vite__mapDeps`, `modulepreload` y el evento `vite:preloadError`. Ningún aviso de Vite viaja en `dist/`.
**⭐ Qué dio verde mientras el fallo estaba vivo:** el censo pre-despliegue (`377fcbe`), que da por completa la lista de lo que viaja. Su § 10 solo nombra Ajv, silabea, pdfmake, el trozo de Rolldown, las fuentes, los percentiles y los iconos, y su § 11.1 dice, tal cual: «Cada aviso de licencia que viaja tiene un juez que lo busca en `dist/`: Ajv, pdfmake y las fuentes. El hallazgo 1 es justo el que no lo tenía.» Y THIRD-PARTY-NOTICES § 1.1 (`4b8f9f2`, línea 65): «(02/10/2026), el JS no lleva código de Vite ni de Astro.» Medido el 06/10 sobre el `dist/` de `4b8f9f2` (scratchpad `c110/dist-a`):
```
index.astro_astro_type_script_index_0_lang.0uYdAJsu.js: modulepreload=2 relList=1 vitePreload=4 preload_error=1
generar-pdf.BMivLRrr.js: modulepreload=0 relList=0 vitePreload=0 preload_error=0
$ grep -o "vite:preloadError" …0uYdAJsu.js
vite:preloadError
```
**Cómo se cazó:** instrumento (al preparar el hallazgo 18 del censo, el trozo de Rolldown, se buscó en cada JS de `dist/` otro código del empaquetador)
**Causa raíz:** lo que viaja se miraba por las piezas que metemos nosotros (Ajv, silabea, pdfmake, las fuentes), y cada juez busca el aviso de una pieza que ya tiene nombre; el código que el empaquetador escribe por su cuenta no lo nombraba nadie. Vite mete su función de precarga en cuanto hay un `import()` dinámico, sin que ninguna dependencia nuestra la pida: `getPreloadCode` escribe `preload.toString()` como el módulo `\0vite/preload-helper.js` (`node_modules/vite/dist/node/chunks/node.js`, Vite 8.3.2, región `src/node/plugins/importAnalysisBuild.ts`). La frase del NOTICES se midió el 02/10, antes del 9.3, y nadie la volvió a medir cuando el 9.3 trajo el `import()` de pdfmake; el censo heredó la lista de piezas conocidas y la dio por completa (su § 11.1 cuenta jueces, no el código ajeno que hay en `dist/`).
**Arreglo aplicado:** `web/astro.config.mjs`: `avisoDeVite` (renderChunk), que al trozo cuyo `moduleIds` lleva `\0vite/preload-helper.js` le pone en cabecera, como comentario legal `/*!`, la parte «Vite core license» del `LICENSE.md` de vite; si esa parte no está, el build para. `web/jueces/construccion.spec.ts`, juez 15: el único trozo de `dist/` con `vite:preloadError` lleva entera esa parte. Rojo antes, en el clon de trabajo con el config de antes: «_astro\index.astro_astro_type_script_index_0_lang.D372zeZt.js no lleva entero el aviso MIT de Vite»; contrapruebas, 3 de 3 en rojo (el año del copyright esperado, el número de trozos y la licencia que se busca). `THIRD-PARTY-NOTICES.md` § 1.1 (su aviso viaja, con su juez), la obra «Vite» en la página de créditos (`web/src/textos.ts`) y el README. Después, el trozo del analizador lleva tres comentarios legales (Ajv, silabea y Vite) y pasa de 158.521 a 159.670 bytes; clon limpio de 40dd211: tipos limpios, motor 909/899, web 281/281.
**Commit:** 40dd211
**Ley que sale de aquí:** SIN LEY TODAVÍA
Al cerrar: un juez que busca el aviso de una pieza con nombre no ve el código ajeno que nadie ha nombrado; cuando cambia cómo se empaqueta (un `import()` nuevo, un CommonJS), se mira qué código ajeno hay en `dist/`, no solo qué dependencias hay.
**Traza:** `web/src/pantalla/descarga.ts` (`import()` del trozo de pdfmake); `dist/_astro/index.astro_astro_type_script_index_0_lang.*.js`; `docs/CENSO-PRE-DESPLIEGUE.md` § 10 y § 11.1; `THIRD-PARTY-NOTICES.md` § 1.1.

---

## [2026-10-05] ✅ CERRADA — En el papel, el anexo de las señales («¿Por qué lo miramos?» y las de contexto) no lleva el aire de 14 pt que le da su regla; ningún juez lo ve

**Categoría:** jueces web / impresión
**Síntoma:** web/src/estilos/informe.css da `.anexo-informe { margin-top: 14pt; }` y, en Chrome con la impresión emulada y combinacion-real analizado, a 1280 y a 390: «margin-top de .anexo-informe en impresión: 0px» (scratchpad c108/reglas-muertas.mjs; la única declaración de impresión que no gana en ningún elemento sin querer). En el PDF del papel (printToPDF desde 1280), de «(«USD 100»).» a «¿Por qué lo miramos?» hay 20 px de línea base a línea base; en el de «Descargar informe», 37,62. Por eso la página 8 empieza distinta: el papel por «Pasiva perifrástica con agente:», el PDF por «Coletilla de gerundio final:» (las otras 10, por lo mismo; scratchpad c108/comparar-paginas.mjs).
**⭐ Qué dio verde mientras el fallo estaba vivo:** la verificación en clon limpio de db4e79a (web 242/242, salida en scratchpad c108/web-db4e79a.txt):
`✔ 3 · desde 1280: cada pieza del marco en su línea del PDF, con su letra y el aire de la línea de antes (601.392ms)` y `✔ 3 · desde 390: …` (papel.spec, 8 de 8);
`✔ 5 · el PDF, página a página, desde 1280 y desde 390: el número de cada página, la 4, la 5 y la 6 empiezan página, ninguna señal se parte y el final está, con la nota acompañada (1380.5707ms)` (impresion.spec, 6 de 6);
`✔ 4 · el PDF, página a página: A4, «n / N», las siete secciones con salto antes de la 4, la 5 y la 6, la etiqueta y la frase, ninguna señal partida y la nota al final, acompañada (1.0666ms)` y `✔ 5 · su texto es el del papel, carácter a carácter sin los blancos y sin los números de página (2.4467ms)` (informe-pdf.spec, 11 de 11).
**Cómo se cazó:** instrumento (al comparar, para la parada 4 ter, la primera línea de cada página del PDF descargado con la del papel)
**Causa raíz:** la regla de reinicio del papel (desde a18bac8), `:is(#cabecera-informe, …, #senales-informe, …) :is(div, section, article, p, …) { margin: 0; … }`, tiene especificidad 1,0,1 y le gana a toda regla sin id; su comentario ya dice que lo de cada sección que va detrás lleva el id. En la regla del aire de 14 pt, `#senales-informe > .entrada-informe + .entrada-informe` lo llevaba y `.anexo-informe` (0,1,0) no, así que el `div.anexo-informe` se quedaba con margin 0. Ningún juez lo podía ver: el test 3 de papel.spec solo compara las piezas del marco, y el marco no tiene anexo; impresion.spec 5 e informe-pdf.spec 4 miran secciones, saltos y señales enteras, no el aire; e informe-pdf.spec 5 admite a propósito otros cortes de línea y de página (el eje óptico de Literata), así que la página 8 distinta pasaba por uno de ellos. Nada comprobaba que una declaración de la hoja de impresión se aplicara de verdad.
**Arreglo aplicado:** web/src/estilos/informe.css, la regla del aire de 14 pt: `.anexo-informe` → `#senales-informe > .anexo-informe`. web/jueces/papel.spec.ts, test 7 (PISADAS): con la impresión emulada, desde 1280 y desde 390 con resultado y desde 1280 sin él, cada declaración de dentro de un `@media print` gana en algún elemento al que se aplica. web/jueces/informe-pdf.spec.ts, test 12 (aireEnLaSeccion6): el aire de «¿Por qué lo miramos?» y de «Lo que se nota en el conjunto» en la sección 6, en el PDF como en el papel, ±1 px. Rojo antes, en el clon de trabajo con la hoja de antes: papel 7, «'.anexo-informe { margin-top: 14pt }'»; PDF 12, «'desde 1280, «¿Por qué lo miramos?», antes: 37.62 en el PDF y 20.00 en el papel'» (y desde 390). Contrapruebas, 4 de 4 en rojo. Después: en el papel, 38,00 antes de «¿Por qué lo miramos?» (en el PDF, 37,62); las 11 páginas del PDF empiezan por la misma línea que las del papel, desde 1280 y desde 390; clon limpio de 8f0b158: tipos limpios, motor 909/899, web 244/244.
**Commit:** 8f0b158 (la hoja y los dos jueces); 4451984 (el README, la lista de jueces)
**Ley que sale de aquí:** SIN LEY TODAVÍA
Al cerrar: una regla de la hoja que nada comprueba que se aplique puede estar muerta sin que se note; lo que la hoja declara, un juez mira que gane, y lo que el marco no mide, se compara entre el PDF y el papel.
**Traza:** web/src/estilos/informe.css (`.anexo-informe`, junto a `#senales-informe > .entrada-informe + .entrada-informe`; la regla de reinicio del papel, `:is(…, #senales-informe, …) :is(div, …) { margin: 0 }`), web/src/pantalla/pintar.ts (el `div.anexo-informe`), web/src/pantalla/informe-pdf.ts (el anexo, a 14 pt); desde a18bac8 (Tanda 4 bis, entra la regla de reinicio con id); en 77f72eb, NO CONSTA (no medido).

## [2026-10-05] ✅ CERRADA — En el papel, la sección 5 («Desglose») arranca al pie de una página y se parte; el juez de fidelidad del papel no lo ve

**Categoría:** jueces web / impresión
**Síntoma:** en el PDF de Antonio (docs/informes/Informe002.pdf, Chrome con «Predeterminado»), «5. Desglose» en la página 2 con línea base en 768 y el resto en la 3. En el PDF del juez (combinacion-real, Page.printToPDF desde 1280 y desde 390): «p2 y 872: «5. Desglose», tras «objetivos.» (y 831)»; la página 2 acaba en «Importancia inflada: 1 vez · 3,08 puntos» (y 1041), la 3 empieza por «Estadística: 0» y la 4 lleva una sola línea («Símbolo de moneda antepuesto: 1 vez · 3,», y 92) antes de «6. Las señales…» en la 5. En el marco «Informe / A4» medido, informe.s5.titulo está arriba de su página: `{"pagina":3,"arriba":75.58,"base":92.58}` (el paginador del modelo, Informe.tsx `paginar`, no parte bloques, y la sección 5 entera es uno).
**⭐ Qué dio verde mientras el fallo estaba vivo:** web/jueces/papel.spec.ts, el juez de fidelidad del papel, ejecutado en el clon de trabajo de HEAD e7bf911 (la web, igual que 7425712) antes de tocar nada, salida en scratchpad c108/papel-head.txt:
`✔ 2 · desde 1280: A4, el número de cada página como el del marco, nada fuera del área, y la primera línea de las páginas 1, 4 y 6 donde en el marco (636.0119ms)`
`✔ 3 · desde 1280: cada pieza del marco en su línea del PDF, con su letra y el aire de la línea de antes (609.2691ms)`
`✔ 2 · desde 390: …` y `✔ 3 · desde 390: …` iguales; `ℹ tests 8` `ℹ pass 8` `ℹ fail 0`. La pieza del juez: ``{ clave: 'informe.s5.titulo', linea: (x) => x === `5. ${textos.DESGLOSE}` }`` (sin «antes»). En la verificación en clon limpio de 7425712, web 229/229.
**Cómo se cazó:** usuario (Antonio, al imprimir con «Predeterminado» en la parada 4 bis)
**Causa raíz:** la hoja forzaba el salto antes de la 4 y de la 6 (lo que decía el DISEÑO §6.5 hasta e7bf911) y la 5 seguía al texto donde cayera; Chrome la partía donde se acababa la página. El marco la tiene arriba de la página 3 porque su paginador mueve bloques enteros, no por un salto, y medidas-modelo.json lo guardaba (pagina 3, arriba 75,58), pero el juez no lo comparaba: el test 2 copió la lista de saltos del DISEÑO (la 1, la 4 y la 6) y el test 3 midió informe.s5.titulo sin «antes», porque en el marco no hay línea de antes en su página; así, la página de la 5 no la miraba nadie. Era una pieza medida y sin comparar.
**Arreglo aplicado:** web/src/estilos/informe.css: `#desglose { break-before: page; }`, fuera de la lista del margen de 14 pt (tras un salto forzado el margen se conserva); web/jueces/papel.spec.ts, test 2, y web/jueces/impresion.spec.ts, test 5: la 4, la 5 y la 6 empiezan página; docs/figma/medidas-modelo.json, la pieza informe.s5.salto (DISEÑO §6.5, con la nota de que en el marco la 5 empieza página por su paginador y no por un salto; web/scripts/medir-modelo.ts) y su sitio en la lista de fidelidad.spec.ts. Rojo antes, en el clon de trabajo con la hoja de antes: papel 2 desde 1280 y desde 390, «'«5. Desglose» no empieza ninguna página'»; impresión 5, «desde 1280: «5. Desglose» en la página 2, que empieza por «4. Texto»». Contrapruebas, 5 de 5 en rojo. Después, «p3 y 93: «5. Desglose», empieza la página» desde los dos anchos, 11 páginas; clon limpio de 800b3b5: web 229/229.
**Commit:** c7bd23e (la pieza del DISEÑO) y 800b3b5 (la hoja y los jueces)
**Ley que sale de aquí:** SIN LEY TODAVÍA
Al cerrar: una pieza medida que ningún test compara es una pieza sin juez; lo que el fichero de medidas guarda, el juez lo compara o dice por qué no.
**Traza:** web/jueces/papel.spec.ts (test 2: las páginas que empiezan por un título; PIEZAS, informe.s5.titulo), web/src/estilos/informe.css (#desglose), docs/figma/medidas-modelo.json (informe.s5.titulo); desde a18bac8 (Tanda 4 bis).

## [2026-10-05] ✅ CERRADA — Impreso desde el escritorio, el PDF del informe pierde su final y la nota de autoría

**Categoría:** jueces web / impresión
**Síntoma:** con combinacion-real impreso desde 1280 (Page.printToPDF), el PDF de 46e5962 acaba en «Mes o día con mayúscula», sin «Símbolo de moneda antepuesto» ni «RadiografIA analiza estilo; no demuestra autoría.». En fb0ec23, 76ef465 y 51aadab acaba con la nota (13 páginas cada uno, clon limpio). Desde 390 sale entero. En el árbol de la Tanda 4, el pie nuevo dice «10 / 11» en la última página de un PDF de 10.
**⭐ Qué dio verde mientras el fallo estaba vivo:** jueces/impresion.spec.ts, en la verificación en clon limpio de 46e5962 (web 217/217):
```
  ✔ 1 · bajo media print: ni el formulario ni la navegación ni el panel; el informe entero, con siglas, clave, lista y pie (920.0268ms)
  ✔ 2 · Page.printToPDF: un PDF que empieza por %PDF-, de 2 a 20 páginas, en A4 (654.6862ms)
  ℹ PDF: 553183 bytes, 13 páginas, MediaBox 594.95996 × 841.91998
```
Y el final de ese PDF (clon de 46e5962, PyMuPDF): `Sugerencia: Escríbelo con minúscula: «el lunes 3 de marzo».` como última línea; en fb0ec23, `RadiografIA analiza estilo; no demuestra autoría.`
**Cómo se cazó:** ojo humano (las páginas del PDF de la Tanda 4 pasadas a imagen para compararlas con el modelo: «10 / 11» en la última)
**Causa raíz:** al imprimir, Chrome evalúa las media queries con el ancho del papel (el de un móvil) y avisa a los oyentes de matchMedia cuando ya ha contado las páginas: lo que cambia entonces en el documento sale en un PDF con las páginas de antes. Visto con un oyente de prueba que mete 120 párrafos al pasar a (max-width: 768px): impreso desde 1280, PDF de 1 página que llega al párrafo 26 (con los 120 en el DOM); desde 390, sin cambio de ancho, 5 páginas y los 120. Y con Page.printToPDF el aviso de 768 llega con `matchMedia('print').matches` ya en verdadero, y el de vuelta, con los dos en falso. Las pestañas (pantalla/pestanas.ts) movían bloques a sus paneles al imprimir desde 51aadab, y el PDF salía entero (51aadab y fb0ec23, vistos); desde 46e5962, con el corte de 1023 que mueve también la vista, salía cortado. Por qué ese cambio cruzaba una página y el anterior no: NO CONSTA (no se midió el alto de antes y de después). Los jueces mentían porque el 1 emula la impresión (setEmulatedMedia no cambia el ancho y no hay aviso: mira el DOM sin mover) y el 2 cuenta páginas y mira la MediaBox, pero no lee lo que hay en ellas.
**Arreglo aplicado:** web/src/pantalla/pestanas.ts: `const impresion = matchMedia('print')` y `if (!hayResultado || impresion.matches) return;` al principio de ajustar (al volver del papel, el aviso de vuelta lo deja todo en el sitio del ancho); web/src/pantalla/tarjeta.ts: el oyente del ancho del móvil no cierra la tarjeta al imprimir ni al volver (`if (impresion.matches || movil.matches === eraMovil) return;`); web/jueces/pdf.ts (nuevo): el texto de cada página de un PDF de Chrome, sin dependencias; web/jueces/impresion.spec.ts, test 5: desde 1280 y desde 390, el PDF acaba con la nota (rojo en clon contra 6462ed7: «desde 1280: 13 páginas; la última acaba en «Sugerencia: Escríbelo con minúscula: «el lunes 3 de marzo».»»). Verificado en clon limpio de 69a5a80 (web 220/220): «desde 1280: 13 páginas; la última acaba en «RadiografIA analiza estilo; no demuestra autoría.»» y «desde 390: 14 páginas; …» igual; contraprueba (otra nota esperada) en rojo. Sin tocar: la hoja de filtros del catálogo (web/src/catalogo/hoja-filtros.ts) mueve el recuento con el mismo aviso de ancho; reportado, no arreglado (no es el informe).
**Commit:** 69a5a80
**Ley que sale de aquí:** SIN LEY TODAVÍA
Al cerrar: nada en la página cambia el documento por un cambio de ancho mientras `matchMedia('print')` es verdadero, porque Chrome ya ha contado las páginas; y un juez de un PDF lee el texto de sus páginas, no solo las cuenta.
**Traza:** web/src/pantalla/pestanas.ts (ajustar, con matchMedia de 768 y de 1023; 46e5962), web/jueces/impresion.spec.ts (tests 1 y 2), Page.printToPDF desde 1280.

## [2026-10-05] ✅ CERRADA — Un fichero de jueces que termina sus tests no sale si su `astro preview` se queda vivo

**Categoría:** arnés de los jueces (Chrome por CDP)
**Síntoma:** el 04/10 y otra vez el 05/10, el rojo de `catalogo-pantalla.spec.ts` contra `53e5051` en clon imprime sus diez tests y la línea de su suite, y el proceso del fichero no sale: siguen vivos `node --test`, su hijo y el `astro preview` del clon, sin ningún Chrome del arnés. Matado solo el preview, el fichero sale solo y `node --test` sigue con el siguiente. Queda el perfil temporal de Chrome de esa ejecución (`radiografia-chrome-aVyXyH`, 07:10:10). Ver también la entrada de abajo: es otro cuelgue con otra causa.
**⭐ Qué dio verde mientras el fallo estaba vivo:** nada dio verde: `node --test` guardó silencio tras la suite. El 05/10 (clon de `53e5051`, juez de `ac88047`, `--test-timeout=90000`), lo último que imprimió hasta matar el preview fue:
```
  ✔ 10 · ninguna petición de red después de la carga y ninguna violación de la CSP (0.9998ms)
✖ el índice del catálogo en Chrome, sobre astro preview (96931.3933ms)
```
con vivos, 20 s después, `node --test --test-concurrency=1 --test-timeout=90000 jueces…` (13696), su hijo (16732) y `F:\_clones-005\rojo2-53e5051\node_modules\astro\bin\astro.mjs preview` (9092). Al matar el 9092, el resumen final dijo, entre sus errores: `Error: EPERM, Permission denied: \\?\C:\Users\ORDENA~1\AppData\Local\Temp\radiografia-chrome-aVyXyH`. En pequeño (scratchpad, un test que deja vivo un hijo con tuberías, `node --test --test-timeout=2000`): `✔ deja un hijo vivo (11.0864ms)` · `ℹ pass 1` · `ℹ fail 0` y el proceso no salió: `real 0m20.105s`, cortado por `timeout` (salida 124).
**Cómo se cazó:** instrumento (la verificación del rojo en clon, que no terminaba) y ojo humano (la lista de procesos y el perfil que quedó)
**Causa raíz:** el `cerrar()` de `abrirConTestigos` cerraba el preview después de `await abierta.cerrar()`, y este lanzaba cuando `rmSync` no podía borrar el perfil temporal de Chrome (EPERM): Windows lo retenía, por hijos de Chrome que sobreviven a `chrome.kill()` (que solo mata el proceso del navegador) y a veces sin ningún proceso de Chrome vivo (quién lo retenía: NO CONSTA; «acceso denegado» minutos después, con control total sobre los ficheros). El `after` fallaba antes de `preview.cerrar()`, y el preview vivo, con sus tuberías abiertas, no dejaba salir al proceso del fichero; `--test-timeout` no lo corta, porque los tests ya habían acabado. `rmSync` con `maxRetries` no ayudaba: daba EPERM en el acto.
**Arreglo aplicado:** `web/jueces/chrome.ts`: el preview se cierra en un `finally`, en `cerrar()` y en el camino de error (l. 203 y 211); `cerrarChrome` mata en Windows el árbol entero con `taskkill /pid … /T /F`, como Puppeteer (l. 269); Chrome arranca con `--disable-crash-reporter` (l. 244); el perfil se reintenta borrar hasta 5 s sin bloquear (`BORRAR_PERFIL`, l. 113) y, si aún no se suelta, se avisa con `process.emitWarning` y no se lanza (l. 290); `barrerPerfilesViejos` borra al abrir los de más de una hora (l. 222). Verificado: el mismo rojo en un clon de `53e5051` termina (3 min, `ℹ pass 1 · ℹ fail 9`, salida 1) con el aviso `Warning: no se pudo borrar el perfil temporal de Chrome (…radiografia-chrome-GD1WZA) en 5040 ms y 47 intentos (EPERM): se queda en el temporal` y sin procesos huérfanos; clon limpio de `0d06923`: web `ℹ tests 200 · ℹ pass 200 · ℹ fail 0`.
**Commit:** `0d06923`
**Ley que sale de aquí:** SIN LEY TODAVÍA
Al cerrar: lo que cierra recursos los cierra todos aunque falle uno; un hijo que se queda vivo es un proceso que no sale.
**Traza:** `web/jueces/chrome.ts`, `abrirConTestigos` (`cerrar`) y `abrirChrome` (`cerrarChrome`, `rmSync` del perfil); `web/jueces/apoyo.ts`, `abrirPreview`.

---

## [2026-10-05] ✅ CERRADA — Si Chrome cae a media prueba, la orden CDP en vuelo no termina nunca y `node --test` se queda colgado sin decir nada

**Categoría:** arnés de los jueces (Chrome por CDP)
**Síntoma:** el 04/10, verificando `50ffc75` en clon, los jueces web pasaron diez minutos en su primer fichero sin imprimir nada, con el `astro preview` del clon vivo y ningún `chrome.exe`; hubo que matar el árbol. El 05/10, con Chrome tumbado con `Browser.crash` y una orden en vuelo, la orden no contesta.
**⭐ Qué dio verde mientras el fallo estaba vivo:** nada dio verde: `npm test` de web (sin `--test-timeout`) guardó silencio. En el clon de `50ffc75` la salida se quedó en `> @radiografia/web@0.0.0 test`, y a las `Sun Oct  4 20:50:47 2026` seguían vivos `node  --test --test-concurrency=1 "jueces/**/*.spec.ts"` (desde `20:40:05`), su hijo y `F:\_clones-005\50ffc75\node_modules\astro\bin\astro.mjs preview` (desde `20:40:09`), sin ningún `chrome.exe`. El 05/10, el juez nuevo contra el arnés sin tocar:
```
$ node --test --test-concurrency=1 jueces/chrome.spec.ts
✖ 1 · Chrome cae a media prueba: la prueba falla con el motivo y node --test termina, sin --test-timeout (30081.8622ms)
  AssertionError [ERR_ASSERTION]: node --test sigue colgado a los 30 s de que Chrome cayera; lo que imprimió:
✖ 2 · tras la caída: la orden en vuelo, una nueva y hasta() fallan con el motivo, enseguida; cerrar() termina (11159.1975ms)
  AssertionError [ERR_ASSERTION]: la orden en vuelo: colgada
```
**Cómo se cazó:** instrumento (la verificación en clon, que no terminaba) y ojo humano (la lista de procesos)
**Causa raíz:** `cdp()` guardaba en `pendientes` cómo resolver cada orden y solo lo hacía al llegar su respuesta por el WebSocket; nada miraba si el proceso de Chrome salía ni si el WebSocket se cerraba, así que una orden en vuelo cuando Chrome caía no se resolvía ni se rechazaba nunca, y el test esperaba para siempre: el script de test de web no llevaba `--test-timeout` (por defecto, `Infinity`). `hasta()` además tomaba cualquier fallo de la expresión por un «todavía no» y seguía hasta su límite.
**Arreglo aplicado:** `web/jueces/chrome.ts`: `caer()` (l. 248) rechaza cada orden pendiente con el motivo, y la llaman la salida del proceso de Chrome (`chrome.once('exit')`, l. 255), el cierre o el fallo del WebSocket (l. 314) y el cierre de la pestaña; `cdp()` rechaza en el acto si ya cayó (l. 332); `hasta()` relanza el fallo si Chrome cayó (l. 357). `web/package.json`: `--test-timeout=60000` (l. 15), con sus cifras en la cabecera de `chrome.ts`. Juez nuevo `jueces/chrome.spec.ts` (con `chrome-cae.prueba.ts`): verde tres veces seguidas tras el arreglo (`✔ 1` en 5,9 s, `✔ 2` en 0,8 s), cinco contrapruebas en rojo; clon limpio de `0d06923`: web `ℹ tests 200 · ℹ pass 200 · ℹ fail 0`.
**Commit:** `0d06923`
**Ley que sale de aquí:** SIN LEY TODAVÍA
Al cerrar: un juez que espera a otro proceso tiene que fallar si ese proceso muere; y la suite lleva un límite por test, para lo que no se haya previsto.
**Traza:** `web/jueces/chrome.ts`, `abrirChrome` (`cdp`, `pendientes`, `hasta`); `web/package.json`, script `test`.

---

## [2026-10-04] ✅ CERRADA — La hoja inferior del móvil sale estrecha si la tarjeta se abrió antes en escritorio

**Categoría:** interfaz del analizador (calco 10.4, Tanda 2)
**Síntoma:** abierta la tarjeta de regla a 1280 y cerrada, al estrechar la ventana a 390 y tocar un tramo, la hoja inferior mide 229 px de ancho en vez de los 390 de la pantalla (el asa, 229; «Siguiente», 197 en vez de 358). Commiteado en `76ef465` (web(hoja)), vivo en `51aadab`.
**⭐ Qué dio verde mientras el fallo estaba vivo:** `web/jueces/hoja.spec.ts`, cuyo juez 1 exige la hoja «abajo y a todo el ancho». Dio verde en los clones limpios de `76ef465` y `51aadab` (suite web: «ℹ tests 165 · ℹ pass 165 · ℹ fail 0» y «ℹ tests 172 · ℹ pass 172 · ℹ fail 0»). Ejecutado otra vez con el fallo vivo (`tarjeta.ts` igual que en HEAD), antes de tocar nada:
`$ node --test --test-concurrency=1 --test-timeout=120000 jueces/hoja.spec.ts`
`✔ 1 · tocar un tramo abre la hoja: modal, con nombre y el foco en el título, abajo, a todo el ancho y como mucho al 60 %; lo demás, inerte (5231.7985ms)` … `ℹ tests 6` `ℹ pass 6` `ℹ fail 0`
**Cómo se cazó:** test (el juez de fidelidad ampliado, `fidelidad.spec.ts`, juez 7, sin commitear: «'movil.hoja · ancho: web 229.109375, modelo 390', 'movil.hoja.asa · ancho: web 229.109375, modelo 390', 'movil.hoja.siguiente · ancho: web 197.109375, modelo 358'»)
**Causa raíz:** la tarjeta tiene dos modos con el mismo elemento: anclada (recolocar le pone `style.top` y `style.left` en línea) y hoja (`.tarjeta-regla.hoja { left: 0; right: 0; bottom: 0 }`). Al abrirla como hoja, el estilo en línea que dejó el modo anclado le ganaba a la clase: 161 px a la izquierda y el top de la página. El juez de la hoja mentía porque su sesión arranca a 390 y abre la hoja sin haber anclado nunca la tarjeta: el estado que causa el fallo no existía en su recorrido.
**Arreglo aplicado:** `web/src/pantalla/tarjeta.ts`, abrirHoja (líneas 179-180): quita `top` y `left` en línea antes de ponerse la clase hoja. `web/jueces/hoja.spec.ts`, juez 7 (línea 167): abre la tarjeta a 1280, la cierra, pasa a 390 y exige la hoja abajo y a todo el ancho; rojo con el fallo vivo («[862, 161, 229]» frente a «[844, 0, 390]»), verde con el arreglo, contraprueba en rojo. Verificado en clon limpio de `477d879` (suite web: «ℹ tests 173 · ℹ pass 173 · ℹ fail 0»).
**Commit:** `477d879`
**Ley que sale de aquí:** SIN LEY TODAVÍA
Al cerrar: un componente con dos modos se juzga también pasando de uno a otro con el estado que deja el primero, no solo arrancando en cada uno.
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
