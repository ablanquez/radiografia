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

## `narrativa-clasica.json` y `narrativa-clasica.manifiesto.json` — Project Gutenberg, dominio público

- **Obra:** capítulos de novelas y cuentos en español de Project Gutenberg
  (<https://www.gutenberg.org>): el catálogo CSV (`pg_catalog.csv`, sha256
  `52cc0ffbef2b79d8d07fdd16dada95d29952f47ce21a1557598c580ee6188bea`) y los EPUB que enlaza su
  harvest de `epub.noimages` en español. El manifiesto guarda, de cada libro usado, su número,
  título, autores, año de muerte y materias, que son datos de catálogo («The catalog data are
  granted to the public domain», <https://www.gutenberg.org/policy/robot_access.html>).
- **Qué se usó:** de cada capítulo, su texto, medido y descartado. Aquí solo quedan percentiles
  y, por capítulo, su id (`pg<libro>-<entrada>`), su huella sha256 y su etiqueta en el índice.
- **Dominio público en España**, comprobado libro a libro: todas las personas del registro del
  catálogo, con cualquier papel, murieron en 1945 o antes. Leído en origen en cada ejecución:
  - TRLPI (<https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930>, sha256
    `76e5384f3ed68e54b2319c98b50a057e6a8ffb122946e8c0b0af1179dd3492a7`), art. 26: «Los derechos
    de explotación de la obra durarán toda la vida del autor y setenta años después de su muerte
    o declaración de fallecimiento.»; art. 30: «Los plazos de protección establecidos en esta
    Ley se computarán desde el día 1 de enero del año siguiente al de la muerte o declaración de
    fallecimiento del autor […]»; disposición transitoria cuarta: «Los derechos de explotación
    de las obras creadas por autores fallecidos antes del 7 de diciembre de 1987 tendrán la
    duración prevista en la Ley de 10 de enero de 1879 sobre Propiedad Intelectual.»
  - Ley de 10 de enero de 1879 (<https://www.boe.es/buscar/doc.php?id=BOE-A-1879-40001>,
    sha256 `6440a4b04808c7a4af0efc0e42b319a7041d82a4132be7192d190c5dab84d2f4`), art. 6: «La
    propiedad intelectual corresponde a los autores durante su vida, y se trasmite a sus
    herederos testamentarios o legatarios por el término de ochenta años.»
  - En 2026: 1945 + 80 = 2025, así que la obra de quien murió en 1945 o antes está en dominio
    público desde el 1 de enero de 2026 como tarde.
- **Project Gutenberg:** su licencia, en el pie de cada EPUB (las dos cláusulas, comprobadas en
  los 243 EPUB leídos): «You may use this eBook for nearly any purpose such as creation of
  derivative works, reports, performances and research.» y, § 1.C, «[…] we do not claim a right
  to prevent you from copying, distributing, performing, displaying or creating derivative works
  based on the work as long as all references to Project Gutenberg are removed.» Aquí no se
  redistribuye texto; la cabecera y el pie de sus ediciones (su licencia y su marca) se retiran
  antes de medir, y la marca solo se nombra para citar la fuente.
- **Qué se cambió:** nada del texto se redistribuye. Se derivan cifras (percentiles de métricas
  de estilo por tramo de longitud y los disparos de las reglas). Fuera, con su motivo en el
  manifiesto: traducciones sin traductor declarado, crítica literaria, obras en diálogo y los
  capítulos que no son narración. Sesgo de época declarado en el propio fichero.

## `academico.json` y `academico.manifiesto.json` — CSIC Spanish Corpus

- **Obra:** CSIC Spanish Corpus, versión 1.0.0 (<https://doi.org/10.5281/zenodo.7313126>), del
  Barcelona Supercomputing Center dentro del Plan de Tecnologías del Lenguaje: artículos de las
  revistas científicas del CSIC (<https://revistas.csic.es>), preprocesados y sin duplicados.
  El fichero `csic_es.txt` (929.127.061 bytes) se lee por rangos de bytes, sin bajarlo entero:
  no se comprueba su huella. Página del registro (sha256
  `64d64ed7f48557f9958c05d334557cf6d0aa6d93e4cdc0ae47e3debbc4296d35`) y `README.md` del
  registro (sha256 `6c6fc5cfb1ae75edd3c82dc92049a97f0a390f876e2332f498dd99cbef6f5858`).
- **Qué se usó:** de cada documento o fragmento, su texto, medido y descartado. Aquí solo quedan
  percentiles y, por unidad, su id (`csic-<byte donde empieza el documento>`), su huella
  sha256, su tramo, si es fragmento y su señal de OCR.
- **Licencia: Creative Commons Atribución 4.0 Internacional (CC BY 4.0)**, en los dos niveles,
  leída en cada ejecución:
  - Empaquetado, en el registro de Zenodo: «We license the actual packaging of these data under
    a Attribution 4.0 International License.» «Copyright by Secretaría de Estado de
    Digitalización e Inteligencia Artificial (SEDIA) (2022)».
  - Contenidos, en origen (<https://revistas.csic.es/mas.html>, sha256
    `37c824c0cc219b03463fdfb3fa7bb5484aa0991c732ff0bf8ffc2d43effcb799`): «Los originales
    publicados en las ediciones impresa y electrónica de esta Revista son propiedad del Consejo
    Superior de Investigaciones Científicas, siendo necesario citar la procedencia en cualquier
    reproducción parcial o total. Salvo indicación contraria, todos los contenidos de la edición
    electrónica se distribuyen bajo una licencia de uso y distribución "Creative Commons
    Reconocimiento 4.0 Internacional" (CC BY 4.0).»
  - La misma página, sobre la plataforma: «Salvo autorización, no está permitida la descarga
    generalizada o sistemática de archivos para la construcción de otras bases de datos
    externas al CSIC». De la plataforma no se descarga nada: solo se leen esas dos páginas; el
    texto viene del paquete CC BY de Zenodo.
- **Atribución:** CSIC Spanish Corpus, BSC / Plan de Tecnologías del Lenguaje, SEDIA (2022),
  <https://doi.org/10.5281/zenodo.7313126>; textos de las revistas del CSIC (revistas.csic.es).
- **Qué se cambió:** nada del texto se redistribuye. Se derivan cifras (percentiles de métricas
  de estilo por tramo y disparos de las reglas). En 100-299 y 300-599, casi todo son
  fragmentos de frases completas de artículos más largos, no artículos enteros; se declara.

## `opinion.json` y `opinion.manifiesto.json` — MuchoCine (Spanish Movie Reviews)

- **Obra:** críticas de cine de usuarios de www.muchocine.net, recogidas por el grupo ITALIC-US
  (Universidad de Sevilla) en <https://github.com/ITALIC-US/Spanish-Movie-Reviews>, commit
  `4f8efab64a5366ec4fd3a241df1292ab75746464`: `README.md` (blob `ba6e456`, sha256
  `bcf021e9eb784e57b96542f0e7462d20504cfd916d7df4b982efa4a64d85ae45`), `LICENSE` (blob
  `b1ececa`) y los 3.878 XML de las críticas.
- **Qué se usó:** de cada crítica, el cuerpo (no el resumen), medido y descartado. Aquí solo
  quedan percentiles y, por crítica, su id (`mc-<número>`), su huella sha256, su tramo y su
  nota.
- **Licencia: CC BY 2.1 ES, DECLARADA POR TERCEROS.** El README de los curadores dice: «The
  content of the reviews has been extracted from the website www.muchocine.net and used under
  the terms of the Creative Commons license (http://creativecommons.org/license/by/2.1/es)».
  No se ha verificado en muchocine.net. El `LICENSE` del repositorio es MIT («Copyright (c)
  2022 ITALIC-US») y se refiere al «Software»: no licencia las críticas.
- **Atribución que pide el README:** Cruz, F. L., Troyano, J. A., Enriquez, F., & Ortega, J.
  (2008). Clasificación de documentos basada en la opinión: experimentos con un corpus de
  críticas de cine en español. Procesamiento del lenguaje natural, 41. Y las críticas, de
  www.muchocine.net.
- **Qué se cambió:** nada del texto se redistribuye ni se publica ninguna muestra
  (`corpus.md`: «solo cifras»). Se derivan cifras (percentiles de métricas de estilo por tramo
  y disparos de las reglas).
