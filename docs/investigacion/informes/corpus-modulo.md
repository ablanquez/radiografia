# Corpus abiertos de texto humano en español por género, con licencia verificada, para calibrar RADIOGRAFÍA

Hay corpus humanos, originales, anteriores a 2022 y con licencia que permite redistribuir cifras derivadas para tres géneros: académico (CSIC Spanish Corpus, CC BY 4.0, verificada en origen), administrativo/jurídico (BOE, cubierto por el art. 13 LPI y por una licencia tipo de reutilización comercial, ambos verificados) y narrativa de dominio público (con sesgo de época). Opinión/reseña solo tiene una opción razonable: MuchoCine, CC BY 2.1 según terceros, sin verificar en origen. Corporativo/marketing no tiene ninguna. Los corpus de detección de texto generado (AuTexTification, ROBOT-TALK) no sirven para calibrar: tienen licencia NC o no la declaran, y en AuTexTification los textos humanos son demasiado cortos (unos 50 palabras de media) y en parte traducidos.

## TL;DR

- **Usar ya:** CSIC Spanish Corpus (académico: 30.929 documentos, 146,8 M tokens, CC BY 4.0 en Zenodo y en la plataforma de origen), BOE (jurídico-administrativo: art. 13 LPI más la licencia tipo de 27 de junio de 2024, que permite uso comercial citando la fuente) y Project Gutenberg o Wikisource en español (narrativa de dominio público, pre-1930 en la práctica).
- **Usar con condiciones:** MuchoCine (3.872 críticas de cine de usuarios, España, hacia 2005-2008; CC BY 2.1 ES declarada por los curadores, pero la ficha de Hugging Face dice «unknown»), SciELO filtrando artículo a artículo por el campo de licencia CC BY, TDX Thesis Spanish Corpus (CC BY 4.0 del empaquetado; la licencia de las tesis subyacentes NO CONSTA) y Wikipedia ES como «general».
- **Descartar:** AuTexTification (Zenodo «Restricted»; copia en Hugging Face con CC BY-NC-SA 4.0; parte legal = MultiEURLEX, traducida), ROBOT-TALK (licencia NO CONSTA; textos recopilados desde diciembre de 2022), TASS (licencia de investigación no comercial; tuits), Amazon MARC (solo investigación no comercial; retirado), InfoLibros (CC BY-NC-SA), CENDOJ (prohíbe la descarga masiva), los componentes traducidos de spanish-corpora (Cañete) y todo lo derivado de la UE o la ONU (MultiEURLEX, DGT, Europarl, JRC-Acquis, EUBookshop, MultiUN). **Corporativo/marketing es un hueco sin cubrir.** Tampoco se ha encontrado ninguna tabla publicada de MTLD, MATTR o IFSZ por género en español.

## Key Findings

1. **El género académico es el mejor cubierto.** El CSIC Spanish Corpus reempaqueta artículos de revistas.csic.es, y esa plataforma declara literalmente: «Salvo indicación contraria, todos los contenidos de la edición electrónica se distribuyen bajo una licencia de uso y distribución "Creative Commons Reconocimiento 4.0 Internacional" (CC BY 4.0)».\[1\] La licencia está verificada en origen y en el empaquetado. El corpus se publicó en octubre de 2022, así que el texto es anterior a la oleada de ChatGPT (noviembre de 2022).\[2\] El problema es la longitud: la media calculada es de unos 4.750 tokens por documento, de modo que casi todo cae en el tramo 600+. Los tramos cortos tienen que salir de resúmenes o de fragmentos.
2. **El BOE es la fuente jurídica más limpia de Europa en términos de licencia.** El art. 13 LPI (texto verificado) excluye de la propiedad intelectual «las disposiciones legales o reglamentarias y sus correspondientes proyectos, las resoluciones de los órganos jurisdiccionales y los actos, acuerdos, deliberaciones y dictámenes de los Organismos públicos».\[3\] Además, la licencia tipo del BOE permite la reutilización «para fines comerciales y no comerciales», con cita obligatoria.\[4\] Las sentencias también están exentas por el art. 13, pero el CENDOJ limita el acceso por su aviso legal: solo «uso particular» y descarga masiva «no permitida».\[5\]
3. **La opinión/reseña se sostiene casi solo con MuchoCine.** Los demás corpus de opinión son NC (TASS, Amazon), tienen acceso restringido (AuTexTification) o no declaran licencia (ROBOT-TALK, COAR/COAH).\[6\]
4. **Los corpus «humano vs. máquina» no sirven como fuente de calibración:** los textos humanos de AuTexTification miden unos 297 caracteres de media en entrenamiento (≈50 palabras), por debajo del tramo mínimo de 100 palabras.\[7\]
5. **No existen tablas publicadas de percentiles de diversidad léxica por género en español** que yo haya podido localizar. Hay que calibrar desde cero.

## Details — fichas por corpus

### (1) ACADÉMICO

**Ficha A1 — CSIC Spanish Corpus (BSC / Plan TL)**
- URL: https://zenodo.org/records/7313126 (hay otra versión con la misma descripción en https://zenodo.org/records/7258207). \[2\]\[8\]\[9\] Fuente original: https://revistas.csic.es/mas.html
- Licencia: **verificada** en los dos niveles. En Zenodo: «We license the actual packaging of these data under a Attribution 4.0 International License» y el campo «License: cc-by-4.0». En origen (Revistas CSIC): «Salvo indicación contraria, todos los contenidos de la edición electrónica se distribuyen bajo una licencia de uso y distribución "Creative Commons Reconocimiento 4.0 Internacional" (CC BY 4.0)».\[1\]\[2\] Hay una condición: la versión inglesa de la plataforma dice «Unless permission is granted, widespread or systematic downloading of files from the Editorial Platform Revistas CSIC to other external databases is not permitted».\[10\] Esa restricción afecta a quien raspe la plataforma, no a quien reutilice el paquete CC BY de Zenodo, pero conviene citarla en la documentación.
- Original o traducido: original en español (el corpus se filtró por lengua). Pueden quedar algunos artículos traducidos; NO CONSTA un marcador.
- Fecha: publicado el 27 de octubre de 2022, así que todos los textos son anteriores a esa fecha.\[2\] NO CONSTA la fecha por documento.
- Tamaño: 30.929 documentos; 146.795.650 tokens; 4.395.368 frases.\[2\]
- Tramos (estimado): media ≈ 4.746 tokens por documento, unas 4.000 palabras si se aplica un factor de 0,85 palabras por token (factor estimado). Casi todo es 600+. Documentos enteros en 100-299 o 300-599: muy pocos (NO CONSTA; hay que medirlos).
- Procedencia y registro: España; artículo científico de revistas CSIC de humanidades, ciencias sociales y ciencias.
- Formato: texto plano, un documento por línea («Documents are separated by single new lines»).\[2\] Se pierden los párrafos, lo que afecta a las métricas por párrafo pero no a MATTR, MTLD ni a la longitud de frase.
- **Veredicto: SIRVE.** Es la mejor fuente académica para 600+. Para los tramos cortos, trocear por ventanas de frases completas y documentarlo como «fragmento académico», no como «documento».

**Ficha A2 — SciELO (red y SciELO España)**
- URL: https://www.scielo.org/es/sobre-el-scielo/declaracion-de-accesso-abierto/ ; https://scielo.isciii.es
- Licencia: **verificada como política, no por artículo**. Texto literal: «La licencia CC-BY es adoptada por los Criterios SciELO de indexación como el estándar de asignación de AA desde 2015. Las revistas indexadas antes de 2015 pueden mantener su licencia original…».\[11\] En SciELO España, un artículo de 2020 publicado en la propia plataforma dice: «el 63% de las revistas de la colección española han adoptado una Licencia CC, siendo la de tipo BY-NC-ND […] la más utilizada».\[12\]\[13\] La política de preservación de SciELO afirma «CC-BY para todos los objetos», lo que choca con lo anterior.\[14\] Prevalece la licencia declarada en cada artículo.
- Original o traducido: hay mucho texto multilingüe (es/pt/en). Las versiones paralelas pueden ser traducciones. Los corpus paralelos derivados de SciELO (bigbio/scielo, community-datasets/scielo con licencia «unknown», el corpus biomédico de Neves et al.) son **traducciones alineadas y quedan descartados**.\[15\]\[16\]
- Fecha: por artículo, así que es filtrable.
- Tamaño: la red supera los 700.000 artículos (blog SciELO, 2019). SciELO España tiene 60 revistas y más de 40.000 artículos (2020).\[13\]\[17\] Qué parte es CC BY: NO CONSTA.
- Tramos: los resúmenes rondan 150-300 palabras (estimado) y caen en 100-299. Los textos completos van a 600+.
- Procedencia: América Latina y España.
- Formato: HTML/XML por artículo con metadatos de licencia. No hay un volcado único verificado.
- **Veredicto: SIRVE CON CONDICIONES.** Filtrar por licencia CC BY o CC BY-SA en los metadatos de cada artículo, quedarse solo con artículos cuya lengua original sea el español (descartar los que tengan versión en otra lengua publicada antes) y anteriores a 2022. Es la mejor fuente académica para 100-299 (resúmenes) y para variedad americana.

**Ficha A3 — TDX Thesis Spanish Corpus (BSC)**
- URL: https://zenodo.org/records/7313149 \[9\]
- Licencia: **verificada solo la del empaquetado**: «We license the actual packaging of these data under a Attribution 4.0 International License».\[18\] La licencia de las tesis originales de tdx.cat NO CONSTA en esta investigación. Suele variar por tesis (supuesta, no verificada).
- Original: tesis de universidades catalanas en castellano, filtradas por lengua.\[18\]
- Fecha: publicado en 2022, así que los textos son anteriores.
- Tamaño: 9.790 documentos; 248.676.517 tokens; 8.156.059 frases.\[18\]
- Tramos (estimado): ≈25.400 tokens por documento. Todo es 600+.
- Procedencia: España (Cataluña); registro de tesis doctoral.
- **Veredicto: SIRVE CON CONDICIONES.** Vale para cifras derivadas. No redistribuir muestras sin comprobar la licencia de cada tesis. Además, está sesgado hacia un único subgénero.

**Ficha A4 — Corpus of Spanish PhD dissertations on medicine and related health topics**
- URL: https://zenodo.org/records/5148850
- Licencia: **verificada en los metadatos del registro** (CC BY 4.0, legalcode).\[19\] La de los textos subyacentes NO CONSTA.
- Tamaño: un .rar de 175,1 MB. Documentos y palabras: NO CONSTA. Fecha: 2021 (anterior a 2022).\[19\]
- **Veredicto: SIRVE CON CONDICIONES.** Solo como complemento biomédico, y hay que medirlo antes de usarlo.

**Ficha A5 — proxectonos/corpus_dominio_cientifico**
- URL: https://huggingface.co/datasets/proxectonos/corpus_dominio_cientifico
- Licencia: «Licencia del corpus derivado: Creative Commons Attribution 4.0 International (CC BY 4.0)».\[20\] Verificada en la ficha; la de las fuentes, NO CONSTA.
- Contenido: gallego y castellano mezclados, con textos universitarios, tesis y también Wikipedia y OCR. Tamaño: etiqueta 10K<n<100K.\[20\] Palabras: NO CONSTA.
- **Veredicto: SIRVE CON CONDICIONES.** Hay que filtrar la lengua y quitar Wikipedia, porque si no contamina el género «académico».

**CORPES XXI:** tal como indica el encargo, el aviso legal de la RAE no permite la reproducción. **No sirve** como fuente redistribuible. No lo he vuelto a verificar en esta sesión.

### (2) OPINIÓN Y RESEÑA

**Ficha O1 — MuchoCine (Cruz Mata et al., Universidad de Sevilla)**
- URL: https://huggingface.co/datasets/us-lsi/muchocine ; https://github.com/ITALIC-US/Spanish-Movie-Reviews
- Licencia: **supuesta / en conflicto**. El README del grupo ITALIC-US dice: «The content of the reviews has been extracted from the website www.muchocine.net and used under the terms of the Creative Commons license (http://creativecommons.org/license/by/2.1/es)». \[21\] Un commit antiguo de la ficha de Hugging Face declaraba «CC-BY-2.1», pero la ficha actual dice «License: unknown».\[22\]\[23\] No he verificado la licencia en muchocine.net.
- Original: sí, críticas escritas por usuarios en español.
- Fecha: el corpus se presentó en 2008 (Procesamiento del Lenguaje Natural, n.º 41) y la web existe «desde 2005».\[21\]\[24\] Los textos son, por tanto, de hacia 2005-2008 (inferido).
- Tamaño: 3.872 críticas largas, cada una con su resumen corto y una nota de 1 a 5.\[23\] Palabras: NO CONSTA.
- Tramos (estimado): el ejemplo publicado ronda las 230 palabras. Previsiblemente hay documentos en los tres tramos, con predominio de 100-599 (estimado; hay que medirlo).
- Procedencia: España; registro semiformal de aficionado.
- Formato: XML por crítica en el original. En Hugging Face se carga con un script (el visor está desactivado).\[21\]\[23\]
- **Veredicto: SIRVE CON CONDICIONES.** Es la mejor opción de opinión. Redistribuir cifras derivadas con atribución a muchocine.net y Cruz et al. (2008). Para muestras, verificar antes la licencia en la web.

**Ficha O2 — TASS / InterTASS (SEPLN)**
- URL: http://tass.sepln.org/tass_data/download.php
- Licencia: **verificada**, «TASS Dataset Research/Non Commercial License Agreement»: «The Dataset is the sole property of the Licensor and is protected by copyright».\[6\]
- Tamaño: InterTASS 1.008 + 506 + 1.899 tuits; hay otros subconjuntos.\[25\]\[26\] Tramos: todo por debajo de 100 palabras.
- **Veredicto: NO SIRVE** (es NC y son tuits).

**Ficha O3 — Multilingual Amazon Reviews Corpus (MARC)**
- URL: https://registry.opendata.aws/amazon-reviews-ml/ ; https://huggingface.co/datasets/defunct-datasets/amazon_reviews_multi
- Licencia: **verificada**: «a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Reviews Corpus for purposes of academic research». Amazon ya no lo aloja («Deprecated»).\[27\]\[28\]
- Fechas: 2015-2019. Tamaño: 200.000 / 5.000 / 5.000 por lengua (entrenamiento / desarrollo / prueba).\[28\]\[29\] Reseñas mayoritariamente cortas.
- **Veredicto: NO SIRVE.**

**Ficha O4 — ROBOT-TALK (UCM)**
- URL: https://www.ucm.es/robottalk/corpus-robot-talk
- Licencia: **NO CONSTA** en la página del corpus. Solo aparecen el aviso legal genérico de la UCM y un enlace a una «Muestra del corpus».\[30\]
- Humanos: 514 textos según la página en español (155 artículos científicos de lingüística, 185 noticias de RTVE y EFE, 174 reseñas de Filmaffinity). La página en inglés da 505 (152 / 182 / 171).\[30\]\[31\] El encargo mencionaba 765. **Las tres cifras no cuadran.**
- Fecha: «recopilados entre diciembre 2022 y junio 2025».\[30\] Es la fecha de recopilación; la de redacción de los textos humanos NO CONSTA. Las reseñas de Filmaffinity tienen derechos de sus autores y de la plataforma.
- **Veredicto: NO SIRVE** para redistribuir. Como mucho, sirve como validación externa si los autores lo ceden por escrito.

**Ficha O5 — AuTexTification (IberLEF 2023) e IberAuTexTification (2024)**
- URL: https://zenodo.org/records/7692961 (entrenamiento), https://zenodo.org/records/7846000 (prueba), https://zenodo.org/records/7956207 (completo), https://zenodo.org/records/10853560 y https://zenodo.org/records/11034382 (2024); copia en https://huggingface.co/datasets/symanto/autextification2023
- Licencia: **verificada**. Los cinco registros de Zenodo figuran como «Restricted», sin campo de licencia visible, y exigen una solicitud («Let us know what you want to use the dataset for…»). Los de 2024 además van con contraseña.\[32\]\[33\]\[34\]\[35\]\[36\] La copia de Hugging Face declara **CC-BY-NC-SA-4.0**.\[37\] Un portal de terceros (ODESIA, UNED) atribuye CC BY 4.0 a IberAuTexTification: es una licencia supuesta, no verificada, y la ficha contiene errores aparentes.\[38\]
- Parte humana en español (2023, artículo de presentación): legal = **MultiEURLEX (traducción de la UE)**; noticias = MLSUM y XLSum; reseñas = COAR y COAH (SINAI, Jaén); tuits = XLM-Tweets y TSD; how-to = WikiLingua.\[39\] Humanos en español: 24.707 según el artículo y 26.996 según la ficha de Hugging Face.\[37\]\[39\] **Las dos fuentes no coinciden.** Los textos humanos son la «continuación» recortada a la longitud de la generación.\[39\]
- Longitud: 297,12 caracteres de media en entrenamiento y 357,36 en prueba (equipo GPLSI), es decir, unas 50-60 palabras (estimado).\[7\] No llega al tramo 100-299.
- Cómo separar la parte humana: por la etiqueta «human» / «generated».
- **Veredicto: NO SIRVE** (NC o restringido, demasiado corto y con una parte traducida).

### (3) ADMINISTRATIVO / JURÍDICO

**Ficha J1 — BOE (Agencia Estatal Boletín Oficial del Estado)**
- URL: https://www.boe.es/informacion/aviso_legal/ ; art. 13 en https://www.boe.es/buscar/doc.php?id=BOE-A-1987-25628 (Ley 22/1987) y en el TRLPI consolidado (https://www.cultura.gob.es/en/dam/jcr:13e69add-7119-41c5-aeaa-e0d289316ef9/trlpropiedad-intelectual.pdf)
- Exención legal: **verificada**. El art. 13 dice: «No son objeto de propiedad intelectual las disposiciones legales o reglamentarias y sus correspondientes proyectos, las resoluciones de los órganos jurisdiccionales y los actos, acuerdos, deliberaciones y dictámenes de los Organismos públicos, así como las traducciones oficiales de todos los textos anteriores».\[3\] Ese texto lo he leído en la Ley 22/1987; el TRLPI 1/1996 mantiene el art. 13 con el mismo arranque en la versión consolidada.
- Licencia tipo del BOE: **verificada** («conforme a la licencia tipo aprobada por Resolución de la Agencia de fecha 27 de junio de 2024»). Permite la reutilización «para fines comerciales y no comerciales» e incluye «La copia, reproducción, distribución y difusión pública» y «La modificación, adaptación, extracción…».\[4\] Condiciones: citar «Basado en datos de la Agencia Estatal Boletín Oficial del Estado» con enlace a https://www.boe.es, no desnaturalizar el sentido, no sugerir carácter oficial, indicar que la legislación consolidada es «de carácter meramente informativo», respetar el RGPD y conservar los metadatos de fecha.\[4\] **Excepción:** la Biblioteca Jurídica Digital del BOE va con «CC BY NC ND 4.0» y no sirve.\[4\]
- datos.gob.es: no he leído su aviso legal en esta sesión. La licencia tipo de la AGE que aplican otros organismos (por ejemplo la OEPM) tiene la misma redacción: «permiten la reutilización […] para fines comerciales y no comerciales».\[40\] Es una similitud supuesta para datos.gob.es.
- Original: sí, con dos cautelas. Hay que excluir los tratados y acuerdos internacionales (suelen ser traducciones) y las «traducciones oficiales».
- Fecha: la fecha de publicación consta en cada disposición, así que el filtro anterior a 2022 es trivial.
- Tamaño: según Gutiérrez-Fandiño et al. (2021), «Legislación BOE» ocupa 3,6 GB y 578,7 M tokens.\[41\]\[42\]
- Tramos: hay de todas las longitudes; los anuncios y resoluciones breves van a 100-299. Distribución: NO CONSTA (estimado: abundan los tres tramos).
- Procedencia: España; registro normativo-administrativo.
- **Veredicto: SIRVE.** Es la mejor opción jurídico-administrativa. Separar subgéneros (disposiciones generales, resoluciones, anuncios) porque tienen perfiles muy distintos.

**Ficha J2 — Spanish Legal Domain Corpora (BSC, Gutiérrez-Fandiño et al., 2021)**
- URL: https://github.com/PlanTL-GOB-ES/lm-legal-es (el repositorio es Apache-2.0 como código); corpus en zenodo.org/record/5495529, que no he podido abrir.\[43\]
- Licencia del registro de Zenodo: **NO CONSTA (no verificada)**. El artículo dice «we publish all publishable corpora we gathered».\[42\]\[44\]
- Contenido: Legislación BOE (578,685 M tokens), Abogacía del Estado BOE (6,123 M), Consejo de Estado: Dictámenes (135,348 M), entre otros.\[42\] En el artículo aparece una fila incoherente: «Procesos Penales 0.625 GB, 0.119 M tokens».\[44\]
- **Veredicto: SIRVE CON CONDICIONES.** Los textos del BOE y del Consejo de Estado están cubiertos por el art. 13. Hay que verificar la licencia del paquete o, mejor, regenerarlo desde el BOE.

**Ficha J3 — CENDOJ (sentencias)**
- URL: https://www.poderjudicial.es/cgpj/es/Temas/Centro-de-Documentacion-Judicial--CENDOJ-/Jurisprudencia/
- Situación: las sentencias no generan propiedad intelectual (art. 13), pero el aviso legal del buscador, citado en https://www.hayderecho.com/2022/07/07/del-limitado-acceso-a-las-resoluciones-judiciales/, dice que se consultan «siempre que lo haga para su uso particular» y que la descarga masiva «no está permitida».\[5\] El Reglamento 3/2010 sobre reutilización de sentencias (BOE-A-2010-17860) exigía precio público para la reutilización con licencia. Lo anuló la Sentencia del Pleno de la Sala Tercera del Tribunal Supremo de 28 de octubre de 2011 (rec. 42/2011, ponente Vicente Conde Martín de Hijas), a raíz de un recurso de la Federación de Gremios de Editores de España. Según la reseña de laboral-social.com (CEF), el Tribunal lo «ha declarado nulo y sin efecto» porque el CGPJ no tenía competencia para dictarlo. **Condiciones actuales de reutilización: NO CONSTAN de forma verificable.**
- **Veredicto: NO SIRVE** para construir un corpus masivo. Alternativa: las sentencias del Tribunal Constitucional publicadas en el propio BOE, que quedan bajo la licencia tipo del BOE (supuesto razonable; comprobar la sección).

**DESCARTADOS por traducción:** MultiEURLEX, DGT, Europarl, JRC-Acquis, EUBookshop, MultiUN/UN y la parte española del DOGC (diario bilingüe catalán-castellano en el que buena parte del castellano es traducción). Todos están en spanish-corpora (Cañete) o en AuTexTification.\[45\] La traducción deja rasgos propios (normalización, calcos) que sesgarían los percentiles.

### (4) NARRATIVA

**Ficha N1 — Project Gutenberg (español)**
- URL: https://www.gutenberg.org/policy/license.html ; https://www.gutenberg.org/policy/terms_of_use.html
- Licencia: **verificada**. «If you strip the Project Gutenberg license and all references to Project Gutenberg from the text, you are left with a text unrestricted by U.S. copyright law». Advertencia literal: «Some content may be copyrighted, or otherwise restricted, for use in other countries».\[46\]\[47\] El criterio es el dominio público en EE. UU., no en España.\[47\] Para un proyecto con datos en la UE hay que filtrar por fecha de muerte del autor según la LPI. La disposición transitoria cuarta del TRLPI (RDL 1/1996), según la BNE, establece: «Los derechos de explotación de las obras creadas por autores fallecidos antes del 7 de diciembre de 1987 tendrán la duración prevista en la Ley de 10 de enero de 1879», que fija 80 años en su art. 6. Para el resto rige el art. 26, «setenta años después de su muerte», y el art. 30 cuenta el plazo desde el 1 de enero del año siguiente a la muerte.
- Original o traducido: el catálogo en español incluye traducciones de clásicos. Hay que filtrar por autor hispanohablante.
- Fecha: casi todo anterior a 1930.
- Tramos: son obras enteras; hay que trocear en capítulos o ventanas para los tres tramos.
- **Veredicto: SIRVE CON CONDICIONES** (quitar el encabezado de la marca, excluir traducciones y documentar el sesgo de época).

**Ficha N2 — Wikisource en español**
- Licencia: texto en dominio público; la maquetación y las notas van con CC BY-SA según la práctica de Wikimedia. **Supuesta, no leída en esta sesión.**
- **Veredicto: SIRVE CON CONDICIONES** (mismo filtro de traducciones y de época que Gutenberg).

**Ficha N3 — Biblioteca Virtual Miguel de Cervantes**
- URL: https://www.cervantesvirtual.com/marco-legal/
- Condiciones: **verificadas**. «corresponden a las INSTITUCIONES y/o a la UNIVERSIDAD DE ALICANTE los derechos exclusivos conexos de reproducción, distribución y comunicación pública sobre las ediciones digitales realizadas por las mismas de obras de dominio público», y el usuario «podrá extraer y/o reutilizar partes no sustanciales del contenido de dicha base de datos».\[48\]
- **Veredicto: SIRVE CON CONDICIONES** solo para cifras derivadas de una extracción no sustancial. **No sirve** para redistribuir muestras ni para una extracción masiva.

**Ficha N4 — InfoLibros Corpus (BSC)**
- URL: https://zenodo.org/record/7254400
- Licencia: **verificada**, «Attribution-NonCommercial-ShareAlike 4.0 International». 14.206 documentos, 218.914.366 tokens.\[49\]
- **Veredicto: NO SIRVE** (NC; además mezcla traducciones y no ficción).

**Narrativa contemporánea con licencia abierta:** no he encontrado ninguna colección de narrativa contemporánea con CC BY, CC BY-SA o CC0 en los catálogos consultados (el catálogo somosnlp/corpus-es y los registros del BSC en Zenodo). **Sesgo de época:** la narrativa de dominio público (siglos XIX y primer tercio del XX) tiene frases más largas, más subordinación y un léxico arcaizante. Los percentiles de longitud de frase y de legibilidad IFSZ saldrán desplazados respecto a la narrativa actual. Hay que etiquetar el género como «narrativa clásica».

### (5) CORPORATIVO / MARKETING

No he encontrado ningún corpus abierto de notas de prensa, memorias anuales o texto web comercial en español con licencia verificada. Los catálogos revisados (somosnlp/corpus-es, los corpus del BSC en Zenodo, el Hugging Face del Plan TL) no contienen ninguno. No he hecho una búsqueda específica exhaustiva por falta de presupuesto. Recortar texto comercial de OSCAR o CEREAL no resuelve la licencia, porque en ambos «we do not hold the copyright of the content text».\[50\] **Hueco.**

### (6) GENERAL / MEZCLA

**Ficha G1 — Wikipedia ES:** según los Términos de Uso de la Wikimedia Foundation (sección 7), el texto va bajo «Creative Commons Attribution-ShareAlike 4.0 International License ("CC BY-SA 4.0")». Lo cito a partir del fragmento del resultado de búsqueda, porque la página no se pudo abrir. Creative Commons (29/06/2023) aclara: «Older edits will remain under BY-SA 3.0». Es texto original en su mayoría, pero hay artículos traducidos de la Wikipedia inglesa sin marca fiable. La fecha se puede filtrar usando un volcado anterior a 2022. Tramos: hay artículos de todas las longitudes. **SIRVE CON CONDICIONES** como «enciclopédico», no como «general».

**Ficha G2 — Spanish Billion Words (conocido):** la página del autor (crscardellino.github.io/SBWCE) indica la licencia «Creative Commons Attribution-ShareAlike 4.0 International License». Entre sus fuentes están JRC-Acquis, United Nations y Europarl (vía OPUS), los libros alineados de Farkas, News Commentary y volcados de Wikipedia, Wikisource y Wikibooks del 2015-09-01. Con eso quedan comprobados la licencia y la parte traducida. No tiene etiqueta de género por documento. **SIRVE CON CONDICIONES**, solo para la parte monolingüe.

**Ficha G3 — spanish-corpora (Cañete, 2019):** https://github.com/josecannete/spanish-corpora. El repositorio tiene licencia MIT, que es la del código y el empaquetado; **la del texto NO CONSTA**.\[45\] Fuentes literales: Wikis, ParaCrawl, EUBookshop, MultiUN, OpenSubtitles, DGT, DOGC, ECB, EMEA, Europarl, GlobalVoices, JRC, TED y UN.\[45\] **NO SIRVE** en conjunto, porque casi todo es texto paralelo o traducido. Solo la parte de Wikis (volcado del 20 de abril de 2019) sería aprovechable, y ya está cubierta por G1.\[45\]

**Ficha G4 — OSCAR / CEREAL:** CEREAL (https://zenodo.org/records/11387864) añade el país de origen por documento (24 países) a textos de OSCAR. Dice «we provide our annotations with CC0 license, but we do not hold the copyright of the content text», mientras que el campo de licencia del registro dice CC BY 4.0, un **conflicto interno**.\[50\] **SIRVE CON CONDICIONES** solo para cifras derivadas agregadas y para la estratificación España/América. No sirve para muestras.

**CC-News ES y esTenTen:** NO VERIFICADOS en esta sesión (esTenTen es de pago según el encargo). **Recomendación para un «general» honesto:** no usar un corpus web mezclado. Construir el percentil «general» como una **mezcla estratificada y declarada** de los géneros verificados (académico CSIC y SciELO CC BY, BOE, MuchoCine, narrativa de dominio público, Wikipedia ES y prensa AnCora), con el mismo número de documentos por género y por tramo, y publicar la receta.

### Tablas publicadas de métricas por género en español

**NO ENCONTRADAS.** Lo más cercano son las estadísticas de longitud de los participantes de AuTexTification (textos humanos: 297,12 caracteres de media en entrenamiento y 357,36 en prueba), que no sirven para estos tramos.\[7\] No he localizado tablas de MTLD, MATTR, HD-D ni IFSZ por género. Hay que calibrar desde cero.

## Tabla final por género

| Género | Mejor opción | Segunda opción | Estado |
|---|---|---|---|
| Académico | CSIC Spanish Corpus (CC BY 4.0, verificada) | SciELO filtrado por CC BY por artículo | Cubierto (tramos cortos por fragmentos o resúmenes) |
| Opinión/reseña | MuchoCine (CC BY 2.1 ES, supuesta) | — (TASS, Amazon y AuTexTification no sirven) | Débil |
| Administrativo/jurídico | BOE (art. 13 LPI + licencia tipo 2024) | Spanish Legal Domain Corpora (licencia NO CONSTA; regenerar desde el BOE) | Cubierto |
| Narrativa | Project Gutenberg ES filtrado (autores hispanos en dominio público en la UE) | Wikisource ES | Cubierto con sesgo de época |
| Corporativo/marketing | — | — | **HUECO** |
| General | Mezcla estratificada de los anteriores + Wikipedia ES | CEREAL (solo cifras) | Construible |

## HUECOS

- **Corporativo/marketing:** no hay ningún corpus abierto. El texto comercial tiene siempre derechos de la empresa y ningún catálogo revisado lo recoge con licencia libre.
- **Opinión contemporánea (columnas, editoriales, blogs):** no he encontrado ninguna colección CC BY. La prensa tiene derechos de editor y los corpus de reseñas son NC o no declaran licencia. MuchoCine cubre solo la crítica de aficionado de hacia 2005-2008 en España.
- **Narrativa contemporánea:** no existe con licencia abierta verificada.
- **Variedad americana:** solo SciELO y CEREAL permiten estratificar. BOE, CSIC, MuchoCine y TDX son de España.
- **Tramos cortos en académico y narrativa:** solo se pueden cubrir troceando, lo que altera la naturaleza de «documento».
- **Tablas de referencia de métricas:** no las hay.

## Recommendations

1. Calibrar primero **académico (CSIC)**, **jurídico (BOE)** y **narrativa clásica (Gutenberg filtrado)**, que tienen licencia verificada. Publicar solo cifras derivadas y, como muestras, únicamente textos del BOE y de dominio público.
2. Para **opinión**, usar MuchoCine para las cifras, marcando la licencia como «declarada por terceros», y escribir a muchocine.net o a los autores del corpus para confirmar la CC BY 2.1 antes de publicar muestras.
3. Para **SciELO**, montar un filtro por metadato de licencia (solo CC BY o CC BY-SA), por lengua original y por fecha anterior a 2022. Usar los resúmenes para el tramo 100-299.
4. Marcar **corporativo** como «sin calibración» en la interfaz en lugar de calibrarlo con texto de licencia dudosa.
5. Documentar en los ficheros de datos, por género: la fuente, la licencia literal, si está verificada o es supuesta, el método de troceado por tramos y el sesgo de época o región.

## Caveats

- Los tamaños están en tokens del BSC, no en palabras. La conversión a palabras (≈0,85) es una estimación mía. Las distribuciones por tramo son estimaciones hasta que se midan.
- Varias licencias son **supuestas** (Wikisource, MuchoCine) o **no constan** (ROBOT-TALK, TDX subyacente, Spanish Legal Domain Corpora, CENDOJ actual). Las de Wikipedia ES (CC BY-SA 4.0, Términos de Uso de Wikimedia) y SBW (CC BY-SA 4.0, página del autor) están ahora documentadas con fuente. Antes de publicar muestras, verificarlas en origen.
- Hay cifras en conflicto: ROBOT-TALK (514, 505 o 765 humanos), AuTexTification (24.707 o 26.996 humanos en español), la licencia de CEREAL (CC0 o CC BY)\[50\] y la de SciELO (CC BY como estándar frente a BY-NC-ND mayoritaria en España en 2020).\[11\]\[13\]\[30\]\[31\]\[37\]\[39\]
- Esto no es asesoramiento jurídico. El art. 13 LPI y la licencia tipo del BOE están verificados, pero la aplicabilidad a sentencias descargadas del CENDOJ depende de sus condiciones de acceso, no de la propiedad intelectual.

## Fuentes

1. [Revistas CSIC: revistas electrónicas del Consejo Superior de Investigaciones Científicas (CSIC)](https://revistas.csic.es/mas.html)
2. [CSIC Spanish Corpus](https://zenodo.org/records/7313126)
3. [BOE-A-1987-25628 Ley 22/1987, de 11 de noviembre, de Propiedad Intelectual.](https://www.boe.es/buscar/doc.php?id=BOE-A-1987-25628)
4. <https://www.boe.es/informacion/aviso_legal/>
5. [Del limitado acceso a las resoluciones judiciales - HayDerecho](https://www.hayderecho.com/2022/07/07/del-limitado-acceso-a-las-resoluciones-judiciales/)
6. [TASS @SEPLN Downloads](http://www.sepln.org/workshops/tass/tass_data/download.php)
7. [Team GPLSI at AuTexTification Shared Task: Determining the Authorship of a Text](https://ceur-ws.org/Vol-3496/autextification-paper13.pdf)
8. [CSIC Spanish Corpus](https://zenodo.org/records/7258207)
9. [corpus-es/datasets.csv at main · somosnlp/corpus-es](https://github.com/somosnlp/corpus-es/blob/main/datasets.csv)
10. [Revistas CSIC: Online Journals of Spanish National Research Council (CSIC)](https://revistas.csic.es/mas_en.html)
11. [Declaración de Acceso Abierto](https://www.scielo.org/es/sobre-el-scielo/declaracion-de-accesso-abierto/)
12. [El modelo SciELO en España: un proyecto pionero de acceso abierto](https://scielo.isciii.es/scielo.php?script=sci_arttext&pid=S2530-51152020000300153)
13. [(PDF) El modelo SciELO en España: un proyecto pionero de acceso abierto](https://www.researchgate.net/publication/343324458_El_modelo_SciELO_en_Espana_un_proyecto_pionero_de_acceso_abierto)
14. [Política de Preservación Digital del Programa SciELO](https://scielo.org/es/sobre-el-scielo/preservacion-digital/)
15. [community-datasets/scielo · Datasets at Hugging Face](https://huggingface.co/datasets/community-datasets/scielo)
16. [GitHub - biomedical-translation-corpora/scielo: Scientific publications from the Scielo database · GitHub](https://github.com/biomedical-translation-corpora/scielo)
17. [El modelo SciELO de publicación como política pública de acceso abierto](https://blog.scielo.org/es/2019/12/18/el-modelo-scielo-de-publicacion-como-politica-publica-de-acceso-abierto/)
18. [TDX Thesis Spanish Corpus](https://zenodo.org/records/7313149)
19. [Corpus of Spanish PhD dissertations on medicine and related health topics](https://zenodo.org/records/5148850)
20. [proxectonos/corpus\_dominio\_cientifico · Datasets at Hugging Face](https://huggingface.co/datasets/proxectonos/corpus_dominio_cientifico)
21. [Spanish-Movie-Reviews/README.md at main · ITALIC-US/Spanish-Movie-Reviews](https://github.com/ITALIC-US/Spanish-Movie-Reviews/blob/main/README.md)
22. [Update files from the datasets library (from 1.18.0) · us-lsi/muchocine at 8c5a016](https://huggingface.co/datasets/us-lsi/muchocine/commit/8c5a016315fdc840d6c68e2bdbf923a554481351)
23. [us-lsi/muchocine · Datasets at Hugging Face](https://huggingface.co/datasets/us-lsi/muchocine)
24. [MuchoCine - Opiniones y Críticas de Cine desde 2005](https://muchocine.net/)
25. [TASS-2017: Workshop on Semantic Analysis at SEPLN](http://tass.sepln.org/2017/)
26. [Sentiment Analysis at Tweet level - TASS - SEPLN](http://tass.sepln.org/2018/task-1/)
27. [amazon\_reviews\_multi.py · mteb/amazon\_reviews\_multi at 3e61e853dbcbff40430208119e64c657268c9238](https://huggingface.co/datasets/mteb/amazon_reviews_multi/blame/3e61e853dbcbff40430208119e64c657268c9238/amazon_reviews_multi.py)
28. [The Multilingual Amazon Reviews Corpus - Registry of Open Data on AWS](https://registry.opendata.aws/amazon-reviews-ml/)
29. [The Multilingual Amazon Reviews Corpus - ACL Anthology](https://aclanthology.org/2020.emnlp-main.369/)
30. [Corpus ROBOT-TALK | Proyecto ROBOT-TALK](https://www.ucm.es/robottalk/corpus-robot-talk)
31. [Corpus ROBOT-TALK (english)](https://www.ucm.es/robottalk/corpus-robot-talk-english)
32. [AuTexTification test set](https://zenodo.org/records/7846000)
33. [Published March 2, 2023 | Version 1.0.0](https://zenodo.org/records/7692961)
34. [Published May 22, 2023 | Version v1](https://zenodo.org/records/7956207)
35. [Published April 22, 2024 | Version 1.0.0](https://zenodo.org/doi/10.5281/zenodo.11034382)
36. [Published March 22, 2024 | Version 1.0.0](https://zenodo.org/records/10853560)
37. [symanto/autextification2023 · Datasets at Hugging Face](https://huggingface.co/datasets/symanto/autextification2023)
38. [IberAuTexTification - Portal ODESIA - UNED](https://portal.odesia.uned.es/en/dataset/iberautextification-2024)
39. <https://arxiv.org/pdf/2309.11285>
40. [Aviso legal](https://sede.oepm.gob.es/eSede/datos/es/aviso-legal/)
41. [spanish legalese language model and corpora](https://arxiv.org/pdf/2110.12201)
42. [\[2110.12201\] Spanish Legalese Language Model and Corpora](https://ar5iv.labs.arxiv.org/html/2110.12201)
43. [GitHub - PlanTL-GOB-ES/lm-legal-es: Language Models for the legal domain in Spanish done @ BSC-TEMU within the "Plan de las Tecnologías del Lenguaje" (Plan-TL). · GitHub](https://github.com/PlanTL-GOB-ES/lm-legal-es)
44. [(PDF) Spanish Legalese Language Model and Corpora](https://www.researchgate.net/publication/355583355_Spanish_Legalese_Language_Model_and_Corpora)
45. [GitHub - josecannete/spanish-corpora: Unannotated Spanish 3 Billion Words Corpora · GitHub](https://github.com/josecannete/spanish-corpora)
46. [License](https://www.gutenberg.org/policy/license.html)
47. [Terms of Use](https://www.gutenberg.org/policy/terms_of_use.html)
48. [Marco legal](https://www.cervantesvirtual.com/marco-legal/)
49. [zenodo.org](https://zenodo.org/record/7254400)
50. [CEREAL I, el Corpus del Español REAL](https://zenodo.org/records/11387864)
