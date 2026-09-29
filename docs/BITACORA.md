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
