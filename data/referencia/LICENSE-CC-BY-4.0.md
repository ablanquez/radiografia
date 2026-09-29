# Licencia y atribución — `ancora-ud-dev-100.json`

Este fichero **no es obra de RadiografIA** y **no está bajo la Apache 2.0** del
repositorio. Es un extracto de un corpus ajeno y conserva su licencia:
**Creative Commons Atribución 4.0 Internacional (CC BY 4.0)**.

- Resumen de la licencia: <https://creativecommons.org/licenses/by/4.0/deed.es>
- Texto legal (canónico): <https://creativecommons.org/licenses/by/4.0/legalcode>

## Obra de origen

**UD Spanish-AnCora**, treebank del proyecto Universal Dependencies, versión
**r2.18**.

- Repositorio: <https://github.com/UniversalDependencies/UD_Spanish-AnCora>
- Fichero de origen: `es_ancora-ud-dev.conllu`, en el commit
  `197cca385e0e7db1b1fe26a5772dade1b6fbbee8` (etiqueta `r2.18`):
  <https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/197cca385e0e7db1b1fe26a5772dade1b6fbbee8/es_ancora-ud-dev.conllu>
- sha256 del fichero descargado el 29/09/2026:
  `1a132068062edf2654fb45b41cd4c59ba7e5c18e7c5f642ed5a9cc351fd9f0fe`
- Licencia declarada en su `LICENSE.txt` de ese mismo commit, copiada tal cual:

  > The treebank is licensed under the Creative Commons License Attribution 4.0
  > International.
  >
  > The complete license text is available at:
  > https://creativecommons.org/licenses/by/4.0/legalcode

  Y en los metadatos de su `README.md`: «License: CC BY 4.0».

⚠️ **AnCora también circula con otras licencias** (GPL en ELRA-W0326 y en
Hugging Face CLiC-UB; ver `docs/investigacion/estadistica.md` § 6). Lo que hay
aquí sale **solo** de la versión de Universal Dependencies, que es CC BY 4.0.

## Autoría y cita

El corpus AnCora es obra de Mariona Taulé, M. Antònia Martí y Marta Recasens
(CLiC, Universitat de Barcelona). Su conversión a Universal Dependencies la
firman, según el `README.md` del treebank, Héctor Martínez Alonso y Daniel
Zeman. La cita que pide el treebank:

> Taulé, M., M. A. Martí y M. Recasens (2008). «AnCora: Multilevel Annotated
> Corpora for Catalan and Spanish». *Proceedings of the 6th International
> Conference on Language Resources and Evaluation (LREC 2008)*.

## Qué se ha cambiado

La licencia exige decirlo. Del fichero original:

- se han tomado **solo las 100 primeras frases**, en su orden;
- de cada frase, **solo** el texto (`# text`), el identificador (`# sent_id`) y,
  por token, su forma y las etiquetas **UPOS** de sus palabras sintácticas;
- se ha **añadido** la posición de cada token en el texto (`inicio`);
- se han **omitido** lemas, XPOS, rasgos, dependencias y nodos vacíos;
- se ha pasado de CoNLL-U a JSON.

Lo hace `motor/herramientas/extraer-ancora.ts`, y se puede rehacer desde el
fichero de origen de arriba.

## Para qué se usa

Como **referencia de oro** para medir el etiquetador morfosintáctico que
llevaría el navegador (`motor/src/pos.spec.ts`). No viaja al navegador ni se
usa para analizar textos.

## Sin garantías ni respaldo

Se ofrece tal cual, sin garantías (CC BY 4.0, § 5). Su uso aquí no implica que
los autores ni el proyecto Universal Dependencies respalden RadiografIA.
