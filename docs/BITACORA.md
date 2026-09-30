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

## [2026-09-30] 🔁 REABIERTA — Los capítulos de EPUB dejaban entrar anuncios, glosarios y preliminares con los jueces en verde

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
⏳ PENDIENTE
**Arreglo aplicado:** ~~`epub.ts`: los romanos de una sola letra solo valen si son I, V o X, y se aceptan los numerales entre guiones (`NUMERADA`); nueva regla `FINAL`, que deja fuera todo desde la primera entrada «obras del mismo autor», «catálogo»…; `PARATEXTO` añade aclaración, prefacio, notes, vocabulary, abbreviations y exercises. Fixture y jueces ampliados (anuncios finales, «D. ARMANDO…», «M. Bergeret…», «-I-»), en rojo antes del verde, con contraprueba de 5 de 5. Comprobado después en los tres libros del síntoma: `esDivisionNumerada('D. ARMANDO PALACIO VALDÉS') → false`; pg29831, «OBRAS DEL MISMO AUTOR», «PSICOLOGÍA ALEMANA…» y «CALDERÓN DE LA BARCA» → final; pg32364, «ACLARACIÓN» → paratexto; pg29731, «ABBREVIATIONS» → paratexto.~~
⏳ PENDIENTE
**Commit:** ~~27157be~~ ⏳ PENDIENTE
**Ley que sale de aquí:** un fixture sintético solo juzga lo que su autor imaginó: antes de calibrar, se leen a mano documentos reales de cada tramo.
**Traza:** `motor/herramientas/calibrar/epub.ts` (`esDivisionNumerada`, `esParatexto`, `capitulosDeEpub`); `motor/herramientas/calibrar/epub.spec.ts`; `motor/herramientas/calibrar/fixtures/prueba.epub`.
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
