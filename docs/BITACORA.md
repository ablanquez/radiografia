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

## [2026-09-29] 🔴 ABIERTA — `grep -c $'\r'` dentro de `"$( )"` cuenta todas las líneas, no los CR

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
**Causa raíz:** ⏳ PENDIENTE
**Arreglo aplicado:** ⏳ PENDIENTE
**Commit:** ⏳ PENDIENTE
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
