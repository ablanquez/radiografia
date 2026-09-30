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

## `administrativo.json` y `administrativo.manifiesto.json` — BOE, 2000-2021

**Basado en datos de la Agencia Estatal Boletín Oficial del Estado** (<https://www.boe.es>).

- **Obra:** disposiciones generales (sección I), resoluciones (secciones II.A, II.B y III) y
  anuncios (secciones V.A y V.B) del Boletín Oficial del Estado, publicados entre 2000 y 2021.
  Los sumarios salen de la API de datos abiertos
  (<https://www.boe.es/datosabiertos/documentos/APIsumarioBOE.pdf>) y el texto de cada
  documento, de su versión HTML (`https://www.boe.es/diario_boe/txt.php?id=…`).
- **Qué se usó:** de cada documento, el texto del cuerpo, medido y descartado. Aquí solo quedan
  percentiles y, por documento, su id, su huella sha256, su subgénero, su sección, su fecha de
  publicación y sus páginas. Ningún dato personal.
- **Art. 13 del texto refundido de la Ley de Propiedad Intelectual** (Real Decreto Legislativo
  1/1996, versión consolidada en <https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930>, leída
  en origen en cada ejecución), tal cual:

  > No son objeto de propiedad intelectual las disposiciones legales o reglamentarias y sus
  > correspondientes proyectos, las resoluciones de los órganos jurisdiccionales y los actos,
  > acuerdos, deliberaciones y dictámenes de los organismos públicos, así como las traducciones
  > oficiales de todos los textos anteriores.

- **Licencia tipo del BOE** (aviso legal, <https://www.boe.es/informacion/aviso_legal/index.php>,
  leído en origen en cada ejecución): «Las condiciones de reutilización de la información
  disponible en la sede electrónica de la Agencia Estatal Boletín Oficial del Estado son las
  siguientes, conforme a la licencia tipo aprobada por Resolución de la Agencia de fecha 27 de
  junio de 2024.» La condición tercera: «Las presentes condiciones permiten la reutilización de
  los documentos sometidos a ellas para fines comerciales y no comerciales […]». La cuarta, las
  que obligan aquí:
  - «Debe citarse la fuente de los documentos objeto de la reutilización, incluyendo en todo
    caso un enlace a la sede electrónica de la Agencia Estatal Boletín Oficial del Estado
    https://www.boe.es»; para obras derivadas, «la cita se realizará de la siguiente manera:
    "Basado en datos de la Agencia Estatal Boletín Oficial del Estado"». Va arriba, y en la
    ficha de NOTICES § 2.3.
  - «Está prohibido desnaturalizar el sentido de la información.» Las cifras son métricas de
    estilo, no del contenido.
  - «No se podrá reutilizar la información de un modo que sugiera que tiene carácter oficial.»
    y «No se podrá indicar, insinuar o sugerir que la Agencia Estatal Boletín Oficial del Estado
    participa, patrocina o apoya la reutilización desarrollada.» RadiografIA no lo sugiere.
  - «Deben conservarse, no alterarse ni suprimirse los metadatos sobre la fecha de
    actualización […]»: el manifiesto conserva la fecha de publicación de cada documento.
- **Fuera:** la sección IV (Administración de Justicia), la V.C (anuncios particulares: no los
  cubre el art. 13), el Tribunal Constitucional, los tratados y acuerdos internacionales y los
  títulos con «traducción».
- **Qué se cambió:** nada del texto se redistribuye. Se derivan cifras (percentiles de métricas
  de estilo por tramo de longitud), de una mezcla por turnos que **no** es la proporción natural
  del BOE; se declara en el propio fichero.
