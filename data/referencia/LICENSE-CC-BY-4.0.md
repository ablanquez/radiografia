# Licencia y atribución — `ancora-ud-dev-100.json` y `ancora-ud-test-100.json`

Estos ficheros **no son obra de RadiografIA** y **no están bajo la Apache 2.0** del
repositorio. Son extractos de un corpus ajeno y conservan su licencia:
**Creative Commons Atribución 4.0 Internacional (CC BY 4.0)**.

- Resumen de la licencia: <https://creativecommons.org/licenses/by/4.0/deed.es>
- Texto legal (canónico): <https://creativecommons.org/licenses/by/4.0/legalcode>

## Obra de origen

**UD Spanish-AnCora**, treebank del proyecto Universal Dependencies, versión
**r2.18**.

- Repositorio: <https://github.com/UniversalDependencies/UD_Spanish-AnCora>
- Ficheros de origen, los dos en el commit `197cca385e0e7db1b1fe26a5772dade1b6fbbee8`
  (etiqueta `r2.18`), descargados el 29/09/2026:
  - `es_ancora-ud-dev.conllu` (DESARROLLO) → `ancora-ud-dev-100.json`, sha256
    `1a132068062edf2654fb45b41cd4c59ba7e5c18e7c5f642ed5a9cc351fd9f0fe`:
    <https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/197cca385e0e7db1b1fe26a5772dade1b6fbbee8/es_ancora-ud-dev.conllu>
  - `es_ancora-ud-test.conllu` (PRUEBA) → `ancora-ud-test-100.json`, sha256
    `679f1c05ca654aa26801c80319df45f8f97606718fb534b91755b48f3e67fa6f`:
    <https://raw.githubusercontent.com/UniversalDependencies/UD_Spanish-AnCora/197cca385e0e7db1b1fe26a5772dade1b6fbbee8/es_ancora-ud-test.conllu>
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

La licencia exige decirlo. De los ficheros originales:

- se han tomado **solo las 100 primeras frases** de cada fichero, en su orden;
- de cada frase, **solo** el texto (`# text`), el identificador (`# sent_id`) y,
  por token, su forma y las etiquetas **UPOS** de sus palabras sintácticas;
- se ha **añadido** la posición de cada token en el texto (`inicio`);
- se han **omitido** lemas, XPOS, rasgos, dependencias y nodos vacíos;
- se ha pasado de CoNLL-U a JSON.

Lo hace `motor/herramientas/extraer-ancora.ts`, y se puede rehacer desde los
ficheros de origen de arriba.

## Para qué se usa

Como **referencia de oro** para medir el etiquetador morfosintáctico que
llevaría el navegador: el de DESARROLLO para ajustarlo, el de PRUEBA para
medirlo una sola vez con todo congelado (encargo 3.3). El etiquetador medido
(es-compromise con una capa propia) no llegó al umbral y se retiró; la medida,
en `docs/investigacion/pos-medida.md`. Los dos ficheros se conservan para
volver a medir en la v1.1. No viajan al navegador ni se usan para analizar
textos.

## Sin garantías ni respaldo

Se ofrecen tal cual, sin garantías (CC BY 4.0, § 5). Su uso aquí no implica que
los autores ni el proyecto Universal Dependencies respalden RadiografIA.
