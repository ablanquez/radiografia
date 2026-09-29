# Licencia y atribución — `pronombres-ancora-train.json`

Este fichero **no es obra de RadiografIA** y **no está bajo la Apache 2.0** del
repositorio. Es un **recuento derivado** de un corpus ajeno y conserva su
licencia: **Creative Commons Atribución 4.0 Internacional (CC BY 4.0)**.

- Resumen de la licencia: <https://creativecommons.org/licenses/by/4.0/deed.es>
- Texto legal (canónico): <https://creativecommons.org/licenses/by/4.0/legalcode>

## Obra de origen

**UD Spanish-AnCora**, treebank del proyecto Universal Dependencies, versión
**r2.18**, fichero de ENTRENAMIENTO `es_ancora-ud-train.conllu`, en el commit
`197cca385e0e7db1b1fe26a5772dade1b6fbbee8` (etiqueta `r2.18`), descargado el
29/09/2026, sha256
`47b6fc49d6ed48a016e7fa5ad9f5c7ecf3ec21e9db005df3ea14d10f07c6deb6`:
<https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/197cca385e0e7db1b1fe26a5772dade1b6fbbee8/es_ancora-ud-train.conllu>

Licencia declarada en su `LICENSE.txt` de ese mismo commit: «The treebank is
licensed under the Creative Commons License Attribution 4.0 International»
(texto completo copiado en `data/referencia/LICENSE-CC-BY-4.0.md`).

⚠️ AnCora circula también con GPL (ELRA-W0326, Hugging Face CLiC-UB). Esto sale
**solo** de la versión de Universal Dependencies, que es CC BY 4.0.

## Autoría y cita

El corpus AnCora es obra de Mariona Taulé, M. Antònia Martí y Marta Recasens
(CLiC, Universitat de Barcelona); su conversión a Universal Dependencies la
firman Héctor Martínez Alonso y Daniel Zeman. La cita que pide el treebank:

> Taulé, M., M. A. Martí y M. Recasens (2008). «AnCora: Multilevel Annotated
> Corpora for Catalan and Spanish». *Proceedings of the 6th International
> Conference on Language Resources and Evaluation (LREC 2008)*.

## Qué se ha hecho con la obra

La licencia exige decirlo. No se copia ninguna frase del corpus: se **cuenta**,
por cada forma (en minúsculas) y en todas las palabras sintácticas del fichero
de entrenamiento, cuántas veces lleva la etiqueta UPOS `PRON` y cuántas
aparece en total. Se guardan:

- las formas que son `PRON` en al menos el **95 %** de sus apariciones, con sus
  dos cifras;
- las cifras de las doce formas que el encargo 3.3 llamaba ambiguas, para que se
  vea cuáles lo son de verdad en AnCora.

Lo hace `motor/herramientas/contar-pronombres.ts`, y se puede rehacer desde el
fichero de origen de arriba.

## Para qué se usa

Es la lista cerrada de pronombres de la capa POS de `motor/src/pos.ts` (pieza 1):
una forma de la lista se etiqueta como pronombre. **Viajaría al navegador** con
el etiquetador si el POS entra en la v1; su atribución tendría que viajar con él.

## Sin garantías ni respaldo

Se ofrece tal cual, sin garantías (CC BY 4.0, § 5). Su uso aquí no implica que
los autores ni el proyecto Universal Dependencies respalden RadiografIA.
