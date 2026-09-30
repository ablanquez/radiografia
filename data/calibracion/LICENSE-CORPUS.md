# Licencias y atribución — `data/calibracion/`

Los ficheros de esta carpeta **no llevan texto de ningún corpus**. Son cifras derivadas de
textos humanos: los percentiles de cada métrica por género y tramo (`<genero>.json`), y el
manifiesto de cada corpus (`<genero>.manifiesto.json`), con el id y la huella sha256 de cada
documento. Las cifras las calcula `motor/herramientas/calibrar/` (Apache 2.0, como el resto
del código), pero cada una sale de una obra ajena. Aquí va, corpus por corpus, su licencia
citada literalmente, la atribución que pide y qué se hizo con ella.

Regla del proyecto (`docs/investigacion/corpus.md`): **sin licencia verificada no hay
muestra; sin licencia al menos declarada no hay cifra.**

## `noticia.json` y `noticia.manifiesto.json` — UD Spanish-AnCora r2.18

- **Obra:** UD Spanish-AnCora, treebank de Universal Dependencies, versión **r2.18**
  (etiqueta `r2.18` = commit `197cca385e0e7db1b1fe26a5772dade1b6fbbee8`).
  Repositorio: <https://github.com/UniversalDependencies/UD_Spanish-AnCora>.
- **Qué se usó:** los tres CoNLL-U (`es_ancora-ud-train.conllu`, `-dev`, `-test`), comprobados
  contra su SHA-1 de blob de Git en ese commit. De cada documento (`# newdoc id`), el texto
  de sus frases (`# text`), medido y descartado: aquí solo quedan percentiles y, por
  documento, su id y su huella sha256. Fuera el subcorpus `3LB-CAST` (Cast3LB/Lexesp, corpus
  equilibrado: no consta que sea prensa) y los documentos de menos de 100 palabras.
- **Licencia: Creative Commons Atribución 4.0 Internacional (CC BY 4.0).**
  - `LICENSE.txt` del commit (sha256 `653702c7fdee69f7d7a439c9ba4c178c26e745479f6e6d2943bed1a9b9c7bf67`), tal cual:

    > The treebank is licensed under the Creative Commons License Attribution 4.0 International.
    >
    > The complete license text is available at:
    > https://creativecommons.org/licenses/by/4.0/legalcode

  - Metadatos del `README.md` del mismo commit (sha256
    `695eeb9e89e7da50f08a9831c5e95063d124f873d8e47ded77c461790af467e2`): «License: CC BY 4.0».
  - ⚠️ La prosa de ese mismo `README.md` dice: «The GNU license is inherited from the original
    dataset, downloaded from the AnCora website.» El repositorio se contradice. Valen
    `LICENSE.txt` y los metadatos, que coinciden con `docs/investigacion/corpus.md`; el
    changelog de la v2.9 dice además «The license changed to CC BY 4.0
    (https://doi.org/10.5281/zenodo.4762030)».
- **Atribución que pide el README:** Taulé, M., M.A. Martí, M. Recasens (2008) 'Ancora:
  Multilevel Annotated Corpora for Catalan and Spanish', Proceedings of 6th International
  Conference on Language Resources and Evaluation. Marrakesh (Morocco). No se usa la
  anotación de correferencia ni la de argumentos, así que las otras dos citas del README no
  aplican.
- **Qué se cambió:** nada del texto se redistribuye. Se derivan cifras (percentiles de
  métricas de estilo por tramo de longitud).
