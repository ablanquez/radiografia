# Marcadores del discurso y estructura retórica en texto de LLM: reglas para un analizador de "estilo IA" en español (sin modelo de lenguaje)

La idea de que "la IA abusa de conectores" no se sostiene en general. En ensayos argumentativos, los LLM usan **igual o menos** marcadores del discurso que los humanos y muchos **menos marcadores epistémicos**. Lo que sí está medido y resulta explotable es la **estructura de plantilla**: cierres idénticos ("In conclusion", en el 100 % de los ensayos de ChatGPT de Herbold et al.),\[1\] exceso de **marcadores de encuadre**, ausencia de **automenciones** y un repertorio de conectores **escaso y repetitivo**. Para el español casi todo está sin medir: solo hay observaciones cualitativas (UCM, IberLEF 2023) y un corpus (ROBOT-TALK) que no midió los marcadores.

## TL;DR
- **Conectores**: en ensayos, GPT-4 usa **menos** marcadores del discurso que los estudiantes (media 0,36 frente a 0,57; d = 0,98) y casi ningún marcador epistémico (0,00 frente a 0,06; d = 1,53), según Herbold et al. (2023). En artículos de investigación, en cambio, Pham (2026) midió el **doble** de transiciones (43,73 frente a 21,5 por 10 000 palabras). La regla debe apuntar a la **diversidad** y la **posición** (inicio de párrafo), no a la densidad bruta.
- **Reglas estructurales con evidencia medida**: cierre de plantilla ("En conclusión / En resumen"), marcadores de encuadre en exceso (unas 2 veces más en ChatGPT), cero automenciones, más positividad y "confianza" (+37–54 % y +17–53 % con el léxico NRC, en inglés) y sobregeneralización (OR 4,85). Casi todo está medido **solo en inglés**.
- **Español y falsos positivos**: no consta ninguna medición cuantitativa de marcadores o metadiscurso en texto LLM en español. Los escritores L2 y los estudiantes **sobreusan** conectores al principio de oración, así que una regla de "muchos conectores" penalizaría justo a esos grupos. Ningún léxico de emociones en español con licencia abierta para uso comercial quedó verificado.

## Key Findings

### 1. Densidad y repertorio de marcadores del discurso: el mito de "la IA abusa de conectores"

| # | Hallazgo | Fuente (URL, año) | Corpus | Cifra | Cita literal (< 20 palabras) | Tipo |
|---|---|---|---|---|---|---|
| 1.1 | GPT-4 usa menos marcadores del discurso que los estudiantes; GPT-3.5 no difiere de ellos\[1\] | Herbold et al., Sci Rep 13:18617, https://www.nature.com/articles/s41598-023-45644-9 (2023) | 90 temas × 3 fuentes = 270 ensayos (≈200 palabras pedidas); humanos: estudiantes no nativos de Essay Forum; lista PDTB | Media DM: humanos 0,57, GPT-3 0,52, GPT-4 0,36; humanos vs GPT-4 p < 0,001, d = 0,98; humanos vs GPT-3 p = 0,150\[1\] | "ChatGPT-4 uses significantly fewer discourse markers"\[2\] | **Medido** |
| 1.2 | Los marcadores epistémicos casi desaparecen en los LLM\[1\] | Ibíd. (Tabla 3–4) | Ídem; lista de Hautli-Janisz et al. ("I think", "in my opinion") | 0,06 frente a 0,02 (GPT-3; d = 1,01) y 0,00 (GPT-4; d = 1,53)\[1\] | "humans tend to use more modals and epistemic markers instead"\[2\]\[3\] | **Medido** |
| 1.3 | Más marcadores no significa más coherencia percibida | Ibíd. | Valoraciones de 111 docentes | r = −0,14 entre valoración de lógica y marcadores\[1\] | "the use of discourse markers is negatively correlated with logical coherence"\[2\] | **Medido** (correlación débil) |
| 1.4 | Hipótesis de los autores: la IA estructura por párrafos, no por conectores\[1\]\[4\] | Ibíd. | — | — | "separating the different arguments into paragraphs, thereby reducing the need for discourse markers" | **Opinado** (interpretación) |
| 1.5 | Réplica cualitativa: la IA crea coherencia dividiendo en más párrafos | Springer, Smart Learning Env., https://link.springer.com/article/10.1186/s40561-025-00388-z (2025) | Adaptaciones de cuentos: ChatGPT frente a estudiantes no nativos | Sin cifra en el extracto leído | "the AI model created coherence by dividing the text into smaller paragraphs"\[5\] | Medido (estilométrico); cifras NO CONSTA |
| 1.6 | La síntesis de la literatura: menos marcadores y más repetitivos\[6\] | Survey arXiv 2510.05136, https://arxiv.org/pdf/2510.05136 (2025) | Revisión | — | "Discourse markers seem to be less frequent in AIGT than in HWT"\[7\] | Secundario. Atribuye "más repetitivos" a Herbold y a Simon et al. 2023, pero Herbold **no** mide repetición |
| 1.7 | En artículos de investigación, ChatGPT duplica las transiciones | Pham, IJAL 15(3), https://vm113.upi.edu/index.php/ijal/article/download/101/55 (2026) | 100 artículos humanos (729 535 palabras) frente a 100 de ChatGPT (233 561); AntConc | Transiciones: 21,5 frente a 43,73 por 10 000 palabras | "ChatGPT employs this type of discourse marker at a rate twice as high"\[8\] | **Medido** (con reservas, ver Caveats) |
| 1.8 | En resúmenes, ChatGPT usa menos transiciones | Springer, Corpus Pragmatics, https://link.springer.com/article/10.1007/s41701-025-00210-8 (2025) | 320 resúmenes de lingüística aplicada (160/160) | Sin cifra en el resumen leído | "ChatGPT was found to use fewer textual metadiscourse markers, such as transitions"\[9\] | Medido; cifras NO CONSTA |

**Qué significa.** La dirección cambia según el **género**. En ensayos (Herbold) y resúmenes (Corpus Pragmatics 2025), el LLM usa menos transiciones. En artículos largos generados en bloque (Pham), usa más. Una regla de densidad bruta de conectores **no es fiable** para distinguir. Lo que se repite en todos los estudios es: (a) pocos marcadores epistémicos o de opinión personal; (b) arquitectura por párrafos; (c) un repertorio escaso y fijo. **Mizumoto 2024** (Research Methods in Applied Linguistics): solo localicé trabajos de Mizumoto sobre corrección de errores (RMAL 3(2) 100116) y huellas lingüísticas en EFL (Applied Corpus Linguistics 4, 100106: más diversidad léxica, complejidad y nominalización).\[10\]\[11\] **NO CONSTA** que midan marcadores del discurso. HUECO.

### 2. Metadiscurso (Hyland 2005) por categoría

**Pham (2026)**, lectura del PDF completo, https://vm113.upi.edu/index.php/ijal/article/download/101/55. Corpus: 100 artículos de *ESP* y *JEAP* (2020–2024) frente a 100 generados por ChatGPT con un prompt de contexto ("You are a researcher in linguistics…", 5000 palabras pedidas, 1000–2000 obtenidas). Frecuencias por 10 000 palabras; acuerdo entre anotadores del 96 %.\[8\]

| Categoría (Hyland) | Humano /10k | ChatGPT /10k | Razón | Lectura para reglas |
|---|---|---|---|---|
| Transiciones | 21,5 | 43,73 | ×2,0 | "However, Therefore, In addition, As a result, Furthermore" |
| Evidenciales | 16,7 | 34,50 | ×2,1 | La autora señala citas "inaccurate and fictitious" |
| Marcadores de encuadre | 14,0 | 26,67 | ×1,9 | "First… Second…", "In conclusion" |
| Glosas de código | 13,6 | 26,20 | ×1,9 | "for instance, such as" |
| Endofóricos | 8,3 | 17,26 | ×2,1 | Pero "see Table 5, see Figure 1" son "rarely found" en ChatGPT |
| Hedges | 20,55 | 34,29 | ×1,7 | 68,52 % del metadiscurso interaccional de ChatGPT |
| Boosters | 8,99 | 9,55 | ×1,1 | Casi igual |
| Marcadores de compromiso | 3,15 | 3,85 | ×1,2 | Casi igual |
| Marcadores de actitud | 2,81 | 2,35 | ×0,8 | Menos en ChatGPT |
| **Automenciones** | **2,14** | **0,00** | **0** | "complete absence of self-mentions"\[8\] |

Observación crítica: las **proporciones internas** son casi idénticas entre corpus (transiciones 28,95 % frente a 29,47 %; encuadre 18,91 % frente a 17,98 %). Todo el metadiscurso interactivo se duplica en bloque, lo que apunta a un efecto de **longitud o compresión del texto** más que a un sobreuso selectivo. Además, 74,1 por 10 000 palabras (= 7,4 por 1000) es un orden de magnitud inferior a lo que registra Jiang & Hyland, lo que sugiere una lista de búsqueda restringida. Pham reconoce que el resultado de las automenciones "should be interpreted with caution" porque depende del prompt.\[8\]

**Otros estudios con Hyland:**
- **Jiang & Hyland (2025, English for Specific Purposes 79)**, https://www.sciencedirect.com/science/article/abs/pii/S0889490625000134. Ensayos argumentativos. Metadiscurso total: ChatGPT **41,1 por 1000 palabras** frente a estudiantes **79,1 por 1000**.\[12\] Cita: "averaging 41.1 occurrences per 1,000 words". **Medido.**
- **Jiang & Hyland (Written Communication 2025)**, https://journals.sagepub.com/doi/10.1177/07410883251328311. 145 ensayos por grupo. Cita: "fewer engagement markers, particularly questions and personal asides".\[13\] **Medido.**\[14\]
- **Cifras secundarias de la serie Jiang & Hyland** (resumidas en Language Teaching, Cambridge), https://www.cambridge.org/core/journals/language-teaching/article/efl-teachers-and-feedback-fatigue-ai-to-the-rescue/03AF36DEF9189D2725013F6C50BA8ED3. Postura (stance): 37,55 frente a 12,26 por 1000 palabras. Compromiso (engagement): 16,99 frente a 5,40 por 1000 palabras (estudiantes británicos frente a ChatGPT).\[15\]
- **Resúmenes (Corpus Pragmatics 2025)**, https://link.springer.com/article/10.1007/s41701-025-00210-8. ChatGPT "overused sentential frame markers, attitude markers, and verbs used to hedge and boost".\[9\] **Medido**, cifras NO CONSTA.
- **Zhang & Zhang (Applied Linguistics 2025)**, https://academic.oup.com/applij/advance-article/doi/10.1093/applin/amaf032/8156998. En resúmenes, "metadiscourse markers are much more prevalent in ChatGPT-generated abstracts", con función de introducción orientada al texto.\[16\] Cifras NO CONSTA.

**Síntesis.** El único resultado **consistente en todos los géneros** es: **automenciones ≈ 0** y **menos actitud y compromiso**. Los marcadores de encuadre salen **por encima** en ChatGPT en los tres estudios académicos que los desglosan. Hedges y transiciones cambian de signo según el género.

### 3. Estructura: aperturas, cierres, resúmenes, "retos y futuro"

| Patrón | Evidencia | Tipo |
|---|---|---|
| Cierre "In conclusion" | Herbold: "identical beginnings of the concluding sections of all ChatGPT essays ('In conclusion, [...]')". Aperturas "very similar starting with a general statement" (https://www.nature.com/articles/s41598-023-45644-9) \[1\] | **Medido** (100 % de 180 ensayos de ChatGPT, prompt mínimo de 2023) |
| Encuadre "First/Second/In conclusion" | Pham: 26,67 frente a 14,0 por 10 000 palabras\[8\] | **Medido** |
| Resúmenes de sección ("In summary, In conclusion, Overall") | Wikipedia:Signs of AI writing (subagente, desde extractos de buscador) | **Anecdótico**. La copia actual lo clasifica como "Historical indicators": el propio proyecto lo considera un indicio en desuso\[17\]\[18\] |
| Sección "retos y futuro" | Wikipedia: "typically begins with a sentence like 'Despite its [positive/promotional words], [article subject] faces challenges...'".\[19\] Además: "This sign is about the rigid formula, not simply the mention of challenges"\[20\] | **Anecdótico** |
| Regla de tres | Wikipedia: "LLMs overuse the rule of three". Página de discusión (Archive 4): "Present in three AI-generated articles and in no human-written articles"\[21\]\[22\]\[23\] | **Recuento informal**, muestra no declarada (≤ unos pocos artículos) |
| Paralelismo negativo ("no solo… sino") | Wikipedia, secciones "Not just X, but also Y" / "Not X, but Y"\[17\] | **Anecdótico** |
| Párrafo por idea / uniformidad de párrafos | Herbold (hipótesis) y Springer 2025 (s40561-025-00388-z) | Hipótesis + medición estilométrica sin cifra leída |

**Página de Wikipedia y discusión.** No pude obtener la página original directamente: el dominio figuraba como "cache-only" para mi herramienta. El subagente trabajó con extractos de buscador de la URL exacta (https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing). Los avisos de la propia página: "Not all text featuring these indicators is AI-generated" y "This page is not a Wikipedia policy".\[17\]\[23\] En la página de discusión (https://en.wikipedia.org/wiki/Wikipedia_talk:Signs_of_AI_writing/Archive_4), el hilo "Updated data on AI vs human text" da recuentos por señal: vaguedad en las atribuciones, 3 artículos IA frente a 1 humano; "Outlines of challenges", 1 frente a 0;\[21\] énfasis indebido en la notabilidad, 2 frente a 1. El experimento léxico asociado compara "~2,000,000 tokens of AI and human text each".\[21\] Las **críticas** sobre falsos positivos, en Archive 5: "The rule of 3, em-dashes, negative parallelisms—these are all things that professional writing contain a lot of", y "writing by people who went through English colonial-descended education often gets mistaken for LLMs".\[24\] **En español**: no se encontró página equivalente en es.wikipedia. Existe el criterio de borrado rápido "G12. Páginas generadas por LLM sin revisión humana" (https://es.wikipedia.org/wiki/Wikipedia:Criterios_para_el_borrado_r%C3%A1pido). \[25\]

### 4. Tono y emoción

| Hallazgo | Fuente | Corpus | Cifra | Cita | Tipo |
|---|---|---|---|---|---|
| Los humanos expresan más emociones negativas (miedo, asco) y menos alegría\[26\] | Muñoz-Ortiz, Gómez-Rodríguez y Vilares, AI Review 57:265, https://arxiv.org/abs/2308.09067 (2024) | Noticias NYT en inglés frente a 6 LLM (3 familias, 4 tamaños)\[26\] | Sin cifra en el resumen | "Humans tend to exhibit stronger negative emotions (such as fear and disgust) and less joy" | **Medido** |
| La edición con LLM aumenta la positividad y la "confianza" | Abdulhai et al., arXiv 2603.18161, https://arxiv.org/pdf/2603.18161v1 (2026) | ArgRewrite-v2 (86 ensayos de 2021) editados por gpt-5-mini, gemini-2.5-flash y claude-haiku; NRC Emotion Lexicon + LIWC\[27\] | Positivo +37–54 %; *trust* +17–53 % (vía extracto del PDF en ResearchGate); "roughly doubling" del sentimiento positivo y negativo\[27\]\[28\] | "roughly doubling the use of both positive and negative sentiment" | **Medido** (inglés) |
| Neutralización de la postura | Ídem, ECA (ensayo controlado aleatorizado) N = 100 | "¿El dinero da la felicidad?" | ≈70 % más ensayos neutrales con uso intenso de LLM\[27\] | "a nearly 70% increase in essays that remained neutral" | **Medido** |
| LIWC arXiv 2401.16587 | — | — | — | — | **NO CONSTA** (no leído). HUECO |

**Léxicos de emociones en español: licencias verificadas**
- **NRC Emotion Lexicon (EmoLex)**, https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm. "can be used freely for non-commercial research and educational purposes". Uso comercial: licencia de pago ("perpetual commercial licence for a nominal one-time fee", https://nrc.canada.ca/en/research-development/products-services/technical-advisory-services/sentiment-emotion-lexicons). \[29\]\[30\] La versión en español es una **traducción automática** (actualizada en agosto de 2022, 108 idiomas). Un estudio en PMC indica que su rendimiento es peor que el de iSOL y SEL por haberse generado con Google Translate (https://pmc.ncbi.nlm.nih.gov/articles/PMC9194861/). \[29\]\[31\]
- **NRC Emotion Lexicon, versión revisada (francés, ELRA)**: CC-BY-NC-4.0 (https://catalog.elra.info/en-us/repository/browse/ELRA-L0130/). \[32\] No es español.
- **SEL (Sidorov et al. 2012)**: 2036 palabras con Factor de Probabilidad de Uso Afectivo (PFA) para las seis emociones de Ekman.\[33\]\[34\] **Licencia: NO CONSTA.** HUECO.
- **SAL, adaptación de NRC Affect Intensity al español** (unas 5000 palabras, 4 emociones):\[35\] licencia **NO CONSTA**.
- **LiLaH, traducción manual de NRC** (CLiPS, Amberes; https://medialibrary.uantwerpen.be/files/9512/01782d5d-b7fe-4e6f-be23-6deecb0c948b.pdf): para español remite a SEL.\[36\] Licencia **NO CONSTA**.

**Consecuencia práctica.** Para un Astro estático público y posiblemente comercial, **ningún léxico de emociones en español tiene una licencia verificada que lo permita**. EmoLex solo vale para una herramienta no comercial y educativa, y su traducción automática tiene poca calidad.

### 5. Sobregeneralización, atribuciones vagas, rangos falsos, "análisis superficial" en gerundio

- **Peters & Chin-Yee (R. Soc. Open Sci. 12:241776, 2025)**, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12042776/. 10 LLM (GPT-3.5 Turbo, GPT-4 Turbo, LLaMA 2 70B, Claude 2, ChatGPT-4o, ChatGPT-4.5, LLaMA 3.3 70B, Claude 3.5 Sonnet, Claude 3.7 Sonnet y DeepSeek), 4900 resúmenes de artículos de Science, Nature, NEJM y Lancet, comparados con *NEJM Journal Watch*. Cita: "nearly five times more likely to contain broad generalizations (odds ratio = 4.85, 95% CI [3.06, 7.70]". Según la misma fuente primaria, DeepSeek, ChatGPT-4o y LLaMA 3.3 70B sobregeneralizaron en el 26–73 % de los casos (el 73 % corresponde a LLaMA 3.3 70B), "even when explicitly prompted for accuracy". **Medido**, en inglés. Mecanismo detectable por reglas: paso de cuantificado o en pasado a **genérico en presente**.\[37\]
- **Atribuciones vagas ("Experts argue", "Industry reports", "Observers have cited")**: Wikipedia. Recuento informal de 3 artículos IA frente a 1 humano.\[21\]\[23\] **Anecdótico.**
- **Análisis superficial con gerundio final ("highlighting…", "underscoring…", "reflecting…")**: Wikipedia, "often done by attaching a present participle ('-ing') phrase".\[38\] **Anecdótico** en Wikipedia, pero **medido** para el inglés en Reinhart et al. (PNAS 2025), que hallan más cláusulas de participio presente en los LLM ajustados por instrucciones\[39\] (https://www.pnas.org/doi/10.1073/pnas.2422455122; la survey arXiv 2510.05136 lo resume: "more present participial clauses").\[7\] **En español: NO CONSTA.**
- **Rangos falsos ("from X to Y")**: solo anecdótico (Wikipedia, vía paráfrasis secundaria).\[40\] Sin cifras.
- **Puffery de significancia ("stands as a testament", "pivotal role")**: solo anecdótico (Wikipedia).\[23\]

### 6. Persona y voz

- **Automenciones = 0 en ChatGPT** frente a 2,14 por 10 000 palabras en humanos (Pham 2026).\[8\] **Medido.**
- **La edición con LLM elimina la primera persona, los coloquialismos y las anécdotas**: Abdulhai et al. 2026. Citas: "removal of first-person, experience-based argumentation toward impersonal language" y "LLM edits will often remove human colloquialisms, anecdotes, or examples".\[27\] **Medido** (pronombres) + **cualitativo** (anécdotas).
- **Más expresiones idiomáticas en los humanos**, en español: UCM, IberLEF 2023 (https://ceur-ws.org/Vol-3496/autextification-paper17.pdf). Cita: "There are more frequent idiomatic expressions in texts written by humans". **Cualitativo** (5 lingüistas, 20 textos).\[41\]
- **Reinhart et al. (PNAS 2025)**: rasgos de Biber; los modelos ajustados por instrucciones escriben con un estilo "informationally dense, noun-heavy" y la brecha es mayor que en los modelos base.\[42\]\[43\] **Medido.**
- **Fraser et al. (arXiv 2406.15583 / JAIR 2025)**: survey de factores de detectabilidad. Solo leí el resumen; **NO CONSTA** ninguna cifra sobre la voz.
- **Nguyen-Son 2017**: **NO CONSTA** (no localizado). HUECO.
- **Berber Sardinha 2024** (citado en RAEL): la fuente primaria es "AI-generated vs human-authored texts: A multidimensional comparison", Applied Corpus Linguistics 4(1):100083 (doi:10.1016/j.acorp.2023.100083), que aplica los rasgos de Biber a ChatGPT (GPT-3.5) en conversación, texto académico, ensayos y noticias; una revisión de ACM (doi:10.1145/3806206) lo resume así: "Across all registers ChatGPT included less references (source-related and context-dependent)". No leí el artículo primario, así que las cifras "1,4 veces menos probabilidades de emplear referencias dependientes del contexto" y "aproximadamente la mitad" de los rasgos de implicación en conversación siguen **sin verificar**.

### 7. Coherencia y cohesión sin modelo de lenguaje

- **Solapamiento léxico entre oraciones adyacentes (Coh-Metrix: noun/argument/stem/content-word overlap)**. Existen estudios LLM frente a humanos, como el de ensayos discursivos (https://files.eric.ed.gov/fulltext/EJ1413432.pdf) y ChatGPT frente a Grok.\[44\]\[45\] En los extractos leídos **no constan** ni la dirección ni las cifras. HUECO.
- **Repetición léxica**: UCM (español, cualitativo). Cita: "Generated texts show a greater repetition of words and sequences than human texts". Los humanos usan sinónimos y "pronominal substitution".\[41\] Esto sugiere medir el **solapamiento de lemas entre oraciones adyacentes** y la **ratio de pronombres anafóricos**. Requiere lematización, factible con listas o reglas en el navegador.
- **Entity grid (Barzilay & Lapata)**: descrito como rasgo de evaluación de escritura (https://arxiv.org/pdf/1612.00729). \[46\] **NO CONSTA** su aplicación con cifras a texto LLM. Además requiere roles sintácticos (sujeto/objeto), es decir, un parser. Poco viable sin modelo.
- **Referencia interna**: Pham mide endofóricos ×2, pero "see Table/Figure" ausentes en ChatGPT. Cita: "phrases such as 'see Table 5, see Figure 1' are rarely found in ChatGPT corpus".\[8\] Referencias internas **concretas** (numeradas) cuentan como indicio humano, pero solo en textos académicos.

### 8. Español

- **UCM (Alonso Simón et al.), IberLEF 2023 AuTexTification**, https://ceur-ws.org/Vol-3496/autextification-paper17.pdf. Dataset: 52 191 textos en español (legal, WikiHow, tuits, reseñas, noticias), generados por BLOOM y GPT-3. Encuesta con 5 lingüistas sobre 20 textos. Cita: "The discourse markers that appear in generated texts are scarce and repetitive". Otros rasgos: orden SVO canónico "almost constantly" y menos comparativos y superlativos. Sistema: macro-F1 del 70,6 % (2.º en español).\[41\] **Cualitativo**: los marcadores **no** se midieron como variable aislada, solo mediante n-gramas.
- **ROBOT-TALK (Alonso Simón et al., RAEL 23, 2024/2025)**, https://matrix.aesla.org.es/RAEL/article/download/666/362/2949. 765 textos en español (artículos de lingüística, noticias, reseñas de cine; mitad humanos, mitad GPT-3.5, GPT-4, Gemini y Mixtral); muestra de 180. **17 variables** significativas, pero solo **léxicas, de puntuación y de orden SVO**. Los marcadores discursivos figuran entre los rasgos "potencialmente discriminativos" del trabajo previo, pero **no se midieron**. Licencia del artículo: CC BY-NC 4.0.\[47\]
- **Blog educativo en español (bilateria.org)**, anecdótico: "suele concluir con frases como «En resumen,» o «En conclusión,»" y "Uso frecuente de la frase «Es importante»" (https://educacion.bilateria.org/como-detectar-textos-escritos-por-chatgpt). \[48\] Sin datos.
- **Inventarios de marcadores del español**:
  - **DPDE**, Briz, Pons Bordería y Portolés (2008–), https://www.dpde.es/. Acceso libre en línea. Según el inventario TextLink: "not distributed; only online" (http://textlink.ii.metu.edu.tr/diccionario-de-part%C3%ADculas-discursivas-del-espa%C3%B1ol). \[49\]\[50\] **Licencia de reutilización o volcado: NO CONSTA.**
  - **Portolés (1998, *Marcadores del discurso*, Ariel)** y **Martín Zorraquino & Portolés (1999, GDLE)**: obras con copyright editorial. Sirven para la **taxonomía** (estructuradores, conectores, reformuladores, operadores argumentativos, marcadores conversacionales), no como datos reutilizables. Licencia NO CONSTA.
  - **Recomendación**: construir una lista cerrada **propia** (unas decenas de formas frecuentes de uso común; las palabras funcionales sueltas no son protegibles), organizada según la taxonomía de Martín Zorraquino y Portolés y citada como referencia. No copiar definiciones ni entradas del DPDE.

### 9. Falsos positivos

- **L2**: una síntesis de la literatura sobre escritura EFL (TESL-EJ, https://tesl-ej.org/wordpress/issues/volume26/ej101/ej101a3/) resume que los L2 "use logical connectors more frequently than native speaker student writers" para "impose surface logicality" (Crewe 1990) y con más tendencia a la posición inicial de oración.\[51\] Matiz: con estudiantes coreanos, la hipótesis de sobreuso global de Granger & Tyson "is invalid" en conjunto, aunque *moreover/furthermore* y los conectores cronológicos (unas 4 veces más) se sobreusan (https://koreascience.or.kr/article/JAKO201402755361881.page). \[52\] **Las reglas de "conector inicial" y "encuadre First/Second" chocan de lleno con la escritura L2.**
- **Escritura escolar**: "In conclusion" y "En primer lugar… Por último" son la plantilla que se enseña. Herbold advierte que la estructura rígida "corresponds to the general structure that is sought after for argumentative essays".\[1\] Para el bachillerato español, Vázquez Veiga (2026; 1263 textos; https://boletinfilologia.uchile.cl/index.php/BDF/article/view/84771) describe un "dominio limitado" de los marcadores.\[53\] Cifras NO CONSTA.
- **Redacción profesional o corporativa**: en la discusión de Wikipedia, "The rule of 3, em-dashes, negative parallelisms—these are all things that professional writing contain a lot of" (anecdótico).\[24\]
- **Textos editados con IA**: Abdulhai et al. muestran que incluso "minimal edits" desplazan el texto semánticamente.\[27\] Un texto humano pulido con un LLM heredará positividad y pérdida de primera persona. Frontera indecidible por reglas.
- **Divulgación**: NO CONSTA evidencia específica. HUECO.

### 10. Herramientas por reglas

- **LanguageTool (español)**: según la página de idiomas admitidos de LanguageTool (dev.languagetool.org/languages; "Rules in LanguageTool 6.6, Date: 2025-03-27"), el español tiene 1644 reglas XML y 23 Java frente a 6074 XML y 54 Java en inglés, aunque la propia página advierte que es "a very rough indication of how well a language is supported". **NO CONSTA** que existan hoy reglas de estilo sobre marcadores discursivos o plantillas de IA en español. HUECO.
- **"Humanizers" derivados de Wikipedia**: p. ej., humanizeai.com convierte la lista en un prompt de doce patrones (https://humanizeai.com/blog/wikipedias-signs-of-ai-writing-list-plus-a-prompt-you-can-turn-into-a-skill/). \[54\] Es contenido **comercial y de marketing**, sin validación. Implicación: los rasgos de la lista de Wikipedia son los **primeros que se borran** en un texto "humanizado", así que su valor de detección es cada vez menor.

## Tabla de reglas candidatas

| Patrón (español propuesto) | Idioma documentado | Evidencia | Detector | Necesita | Riesgo de FP |
|---|---|---|---|---|---|
| Último párrafo que empieza por "En conclusión / En resumen / En definitiva / En síntesis / Para concluir" | EN (Herbold: 100 %); ES anecdótico | Medida (EN) | Estructural + patrón | Regex anclada al inicio del último párrafo | **Alto** en redacción escolar y L2 |
| Resumen interno en cada sección ("En resumen," a mitad del texto, ≥ 2 veces) | EN (Wikipedia) | Anecdótica, marcada como "histórica" | Estructural | Regex + segmentación en secciones | Medio |
| Secuencia de encuadre completa ("En primer lugar… En segundo lugar… Por último") | EN (Pham ×1,9; resúmenes 2025) | Medida (académico) | Patrón | Lista cerrada | **Alto** (L2, escolar) |
| Diversidad de marcadores baja: tipos / ocurrencias < umbral, o un mismo marcador repetido ≥ 3 veces | ES (UCM, cualitativo "scarce and repetitive") | Cualitativa | Estadístico | Lista cerrada (taxonomía de Portolés) | Medio (L2 también repite) |
| Marcadores epistémicos ausentes ("creo", "en mi opinión", "me parece", "quizá", "a lo mejor") en texto argumentativo > 300 palabras | EN (Herbold d = 1,01–1,53) | **Medida, efecto grande** | Estadístico (ausencia) | Lista cerrada | Medio (textos técnicos o impersonales) |
| Automenciones = 0 (yo/nosotros/mi/nuestro en función autorial) en texto de opinión o académico | EN (Pham 0,00 frente a 2,14) | Medida | Estadístico | Lista cerrada + regla de persona verbal (-mos) | Alto (géneros impersonales, prompt personalizable) |
| Párrafos uniformes (baja desviación de longitud) y una idea por párrafo con pocos conectores intrapárrafo | EN (Herbold, hipótesis; Springer 2025) | Hipótesis + parcial | Estructural / estadístico | Segmentación | Medio |
| Sección o párrafo "retos y futuro": "A pesar de [su/sus]… enfrenta desafíos" + cierre optimista ("el futuro de… es prometedor") | EN (Wikipedia) | Anecdótica | Patrón | Regex | Bajo-medio (divulgación, informes) |
| Atribuciones vagas: "los expertos (coinciden/señalan)", "diversos estudios", "según informes del sector", "algunos críticos" sin nombre propio ni cifra cercana | EN (Wikipedia; recuento 3 frente a 1) | Anecdótica | Patrón | Regex + ventana sin nombre propio | Medio (periodismo) |
| Genéricos en presente que resumen hallazgos ("X mejora Y") tras marcadores de síntesis | EN (Peters & Chin-Yee, OR 4,85) | Medida (resúmenes científicos) | Patrón débil | POS (tiempo verbal) + lista | Alto; difícil sin análisis sintáctico |
| Gerundio evaluativo final: ", destacando / subrayando / reflejando / consolidando / garantizando…" | EN (Wikipedia; Reinhart: participios) | Anecdótica en ES; medida en EN (participios) | Patrón | Regex sobre coma + gerundio de una lista cerrada de verbos evaluativos | Medio (el gerundio es frecuente en español) |
| Regla de tres: tríadas "A, B y C" de adjetivos o sustantivos abstractos, ≥ N por 1000 palabras | EN (Wikipedia; recuento 3 frente a 0) | Recuento informal | Patrón / estadístico | Regex + lista de abstractos o POS | **Alto** (retórica humana clásica) |
| Paralelismo negativo "no solo… sino (también)", "no se trata de X, sino de Y" | EN (Wikipedia) | Anecdótica | Patrón | Regex | Medio-alto |
| Rango falso "desde X hasta Y" con términos no escalares | EN (Wikipedia) | Anecdótica | Patrón | Regex + lista de abstractos | Medio |
| Puffery de significancia: "desempeña un papel crucial", "es un testimonio de", "marca un hito" | EN (Wikipedia) | Anecdótica | Patrón | Lista cerrada | Medio (prensa, marketing) |
| Positividad o "confianza" alta frente a negatividad baja | EN (Abdulhai +37–54 %; Muñoz-Ortiz) | Medida (EN) | Estadístico | **Léxico de emociones en español: sin licencia abierta verificada** | Alto (corporativo, divulgación) |
| Coloquialismos, modismos y anécdota en 1.ª persona como **indicio humano** (resta puntuación) | ES (UCM, idioms); EN (Abdulhai) | Cualitativa / medida | Patrón | Lista cerrada de modismos | Bajo como atenuante |
| Referencia interna concreta ("véase la Tabla 2", "como dije arriba") como indicio humano | EN (Pham) | Medida (académico) | Patrón | Regex | Bajo como atenuante |
| Baja variación de sinónimos o anáforas: alto solapamiento de lemas entre oraciones adyacentes | ES (UCM, cualitativo) | Cualitativa | Estadístico | Lematizador ligero o stemming | Medio (textos técnicos) |

## Recommendations

1. **No implementes "muchos conectores = IA".** Usa **diversidad** (tipos/ocurrencias), **repetición del mismo marcador** y **posición** (inicio de párrafo) sobre una lista cerrada propia. La densidad bruta cambia de dirección según el género (Herbold frente a Pham).
2. **Da más peso a las ausencias que a las presencias.** Los efectos más grandes medidos son **ausencias**: marcadores epistémicos (d = 1,53) y automenciones (0). Aplícalas solo a textos de opinión o argumentativos de más de 300 palabras y exígelas combinadas; ninguna basta sola.
3. **Pondera "En conclusión" en el último párrafo, pero dale poco peso.** En 2023 aparecía en el 100 % de los ensayos de ChatGPT, pero coincide con la plantilla escolar. Combínalo con otros indicios (retos y futuro, resúmenes internos, encuadre completo).
4. **Aplica atenuantes humanos**: modismos, coloquialismos, anécdota en 1.ª persona y referencias internas concretas deben **restar** puntuación. Reducen los falsos positivos más que cualquier umbral.
5. **Muestra el nivel de evidencia de cada regla en la interfaz** ("medido en inglés", "anecdótico", "sin datos en español") y evita cualquier veredicto binario. Coherente con la propia página de Wikipedia: "Not all text featuring these indicators is AI-generated".\[23\]
6. **Deja fuera la emoción** mientras no haya un léxico en español con licencia compatible, o úsala solo si la herramienta es no comercial y educativa, con EmoLex, y avisando de que la traducción es automática.
7. **Calibra en español antes de publicar umbrales.** Pide a los autores de ROBOT-TALK (UCM) acceso al corpus, o genera un corpus pequeño propio por género. Todos los umbrales de la tabla son hipótesis sin validar para el español.

## Caveats

- **Wikipedia**: no pude leer la página original. Mi herramienta devolvió "cache-only" y las citas proceden de extractos de buscador recogidos por el subagente, así que el texto vivo puede haber cambiado. El tamaño de muestra del hilo "Updated data" **no consta**.
- **Pham (2026)**: los artículos de ChatGPT son de 1000–2000 palabras frente a artículos completos humanos.\[8\] La duplicación homogénea de todas las categorías interactivas sugiere un efecto de densidad o longitud. Además, las densidades son muy inferiores a las de Jiang & Hyland (7,4 frente a 79,1 por 1000 palabras), lo que indica listas de búsqueda distintas: no son comparables entre estudios.
- **Herbold (2023)**: humanos no nativos, ensayos cortos, versiones de ChatGPT de marzo de 2023. La Tabla 4 rotula por error dos columnas como "ChatGPT-3 vs. ChatGPT-4";\[1\] el texto confirma que la central es humano frente a GPT-4. Las unidades de la Tabla 3 no se explicitan en la tabla.
- **Abdulhai et al. (2026)**: preprint sin revisión por pares. Las cifras +37–54 % y +17–53 % las tomé de un extracto del PDF reproducido en ResearchGate, no de la tabla leída directamente.
- **Obsolescencia**: todos los patrones de plantilla dependen del modelo, de la versión y del prompt. Wikipedia ya clasifica los resúmenes de sección como indicio "histórico",\[17\]\[18\] y los "humanizers" eliminan explícitamente estos rasgos.
- **Fuentes**: las URL van en línea en cada hallazgo, en lugar de en una lista final aparte.

## HUECOS explícitos

- **ESPAÑOL (crítico)**: NO CONSTA ninguna medición cuantitativa de densidad o repertorio de marcadores del discurso, ni de metadiscurso según Hyland, en texto LLM en español. El único dato es la observación cualitativa de la UCM (5 lingüistas, 20 textos). ROBOT-TALK no midió los marcadores.
- NO CONSTA en español: cierres "En conclusión", secciones "retos y futuro", tríadas, gerundio evaluativo final, atribuciones vagas, sobregeneralización ni emoción en texto LLM.
- NO CONSTA la licencia de reutilización de SEL, SAL, LiLaH-ES ni DPDE. No hay ningún léxico de emociones en español con licencia abierta para uso comercial verificada.
- NO CONSTA Mizumoto 2024 (RMAL) con marcadores del discurso; tampoco se localizaron LIWC arXiv 2401.16587 ni Nguyen-Son 2017.
- NO CONSTAN cifras de solapamiento léxico entre oraciones adyacentes ni de entity grid en texto LLM frente a humano (Coh-Metrix EJ1413432 no leído con cifras).
- NO CONSTA evidencia sobre falsos positivos en divulgación ni en textos corporativos en español; tampoco reglas de estilo actuales de LanguageTool para español sobre marcadores.
- NO CONSTAN cifras de uniformidad de longitud de párrafos en texto LLM.

## Fuentes

1. <https://nature.com/articles/s41598-023-45644-9.pdf>
2. [1 Vol.:(0123456789) Scientific Reports](https://www.researchgate.net/journal/Scientific-Reports-2045-2322/publication/375088209_A_large-scale_comparison_of_human-written_versus_ChatGPT-generated_essays/links/654080263cc79d48c5bc6ef4/A-large-scale-comparison-of-human-written-versus-ChatGPT-generated-essays.pdf)
3. [A large-scale comparison of human-written versus ChatGPT-generated essays](https://www.nature.com/articles/s41598-023-45644-9)
4. [A Comparison of Human‐Written Versus AI‐Generated Text in Discussions at Educational Settings: Investigating Features for ChatGPT, Gemini and BingAI - Yildiz Durak - 2025 - European Journal of Education - Wiley Online Library](https://onlinelibrary.wiley.com/doi/full/10.1111/ejed.70014)
5. [A linguistic comparison between ChatGPT-generated and nonnative student-generated short story adaptations: a stylometric approach](https://link.springer.com/article/10.1186/s40561-025-00388-z)
6. [(PDF) Linguistic Characteristics of AI-Generated Text: A Survey](https://www.researchgate.net/publication/396291341_Linguistic_Characteristics_of_AI-Generated_Text_A_Survey)
7. [Linguistic Characteristics of AI-Generated Text: A Survey](https://arxiv.org/pdf/2510.05136)
8. <https://vm113.upi.edu/index.php/ijal/article/download/101/55>
9. [A Genre-Based Comparison of Chat-GPT-Generated Abstracts Versus Human-Authored Abstracts: Focus on Applied Linguistics Research Articles](https://link.springer.com/article/10.1007/s41701-025-00210-8)
10. [Atsushi Mizumoto - Testing the viability of ChatGPT as a companion in L2 writing accuracy assessment - Papers - researchmap](https://researchmap.jp/mizumot/published_papers/46603243?lang=en)
11. [Mizumoto Lablog](https://mizumot.com/lablog/archives/2114)
12. [Rhetorical distinctions: Comparing metadiscourse in essays by ChatGPT and students - ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0889490625000134)
13. [Does ChatGPT Write Like a Student? Engagement Markers in Argumentative Essays - Feng (Kevin) Jiang, Ken Hyland, 2025](https://journals.sagepub.com/doi/10.1177/07410883251328311)
14. [LLM writing styles](https://www.refsmmat.com/notebooks/llm-style.html)
15. [EFL teachers and feedback fatigue: AI to the rescue?](https://www.cambridge.org/core/journals/language-teaching/article/efl-teachers-and-feedback-fatigue-ai-to-the-rescue/03AF36DEF9189D2725013F6C50BA8ED3)
16. [Reflexivity in human-written and ChatGPT-generated English research article abstracts: A comparison of metadiscourse](https://academic.oup.com/applij/advance-article/doi/10.1093/applin/amaf032/8156998?searchresult=1)
17. [Wikipedia:Signs of AI writing - Wikiwand](https://www.wikiwand.com/en/Wikipedia:Signs_of_AI_writing)
18. [Signs of AI writing: the tells, and why they are not proof](https://isitslop.io/signs-of-ai-writing/)
19. [Wikipedia: Signs of AI Writing - A Guide to Detection Techniques - Studocu](https://www.studocu.com/row/document/virtual-university-of-pakistan/edu-403-art-craft-and-calligraphy/wikipedia-signs-of-ai-writing-a-guide-to-detection-techniques/154772126)
20. [Wikipedia:Signs of AI writing](https://en-wikipedia-org.translate.goog/wiki/Wikipedia:Signs_of_AI_writing?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc)
21. [Wikipedia talk:Signs of AI writing/Archive 4](https://en.wikipedia.org/wiki/Wikipedia_talk:Signs_of_AI_writing/Archive_4)
22. [18 Dead-Giveaway Signs You Used AI to Write That (According to Wikipedia)](https://www.onlinewritingclub.com/p/18-signs-you-used-ai-to-write-that)
23. [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
24. [Wikipedia talk:Signs of AI writing/Archive 5](https://en.wikipedia.org/wiki/Wikipedia_talk:Signs_of_AI_writing/Archive_5)
25. [Wikipedia:Criterios para el borrado rápido](https://es.wikipedia.org/wiki/Wikipedia:Criterios_para_el_borrado_r%C3%A1pido)
26. [Contrasting Linguistic Patterns in Human and LLM-Generated News Text](https://arxiv.org/abs/2308.09067)
27. [How LLMs Distort Our Written Language](https://arxiv.org/pdf/2603.18161v1)
28. [(PDF) How LLMs Distort Our Written Language](https://www.researchgate.net/publication/402859557_How_LLMs_Distort_Our_Written_Language)
29. [NRC Word-Emotion Association Lexicon](https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm)
30. [Sentiment and emotion lexicons - National Research Council Canada](https://nrc.canada.ca/en/research-development/products-services/technical-advisory-services/sentiment-emotion-lexicons)
31. [Spanish Emotion Recognition Method Based on Cross-Cultural Perspective - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9194861/)
32. [NRC Emotion Lexicon - Revised version](https://catalog.elra.info/en-us/repository/browse/ELRA-L0130/)
33. [(PDF) Emotion Classification in Spanish: Exploring the Hard Classes](https://www.researchgate.net/publication/355519920_Emotion_Classification_in_Spanish_Exploring_the_Hard_Classes)
34. [Semantic orientation for polarity classification in Spanish reviews - ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0957417413004752)
35. [(PDF) Lexicon Adaptation for Spanish Emotion Mining](https://www.researchgate.net/publication/328137771_Lexicon_Adaptation_for_Spanish_Emotion_Mining)
36. [CLiPS Technical Report 9 COMPUTATIONAL LINGUISTICS, PSYCHOLINGUISTICS AND](https://medialibrary.uantwerpen.be/files/9512/01782d5d-b7fe-4e6f-be23-6deecb0c948b.pdf)
37. [Generalization bias in large language model summarization of scientific research](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12042776/)
38. [agent-toolkit/skills/writing-clearly-and-concisely/signs-of-ai-writing.md at main · softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit/blob/main/skills/writing-clearly-and-concisely/signs-of-ai-writing.md)
39. [New study identifies differences between human and AI-generated text](https://techxplore.com/news/2025-02-differences-human-ai-generated-text.html)
40. [Signs of AI Writing - Evaluating Information Sources - ETBI Digital Library at Education and Training Boards Ireland, ETBI](https://library.etbi.ie/sources2/aisigns)
41. <https://ceur-ws.org/Vol-3496/autextification-paper17.pdf>
42. [Do LLMs write like humans? Variation in grammatical and rhetorical styles - New Jersey Institute of Technology](https://researchwith.njit.edu/en/publications/do-llms-write-like-humans-variation-in-grammatical-and-rhetorical/)
43. [Do LLMs write like humans? Variation in grammatical and rhetorical styles](https://www.pnas.org/doi/10.1073/pnas.2422455122)
44. [(PDF) Journal of Pragmatics and Discourse Analysis Cohesion and Coherence in AI-generated Narrative Texts: ChatGPT vs Grok](https://www.researchgate.net/publication/404394992_Journal_of_Pragmatics_and_Discourse_Analysis_Cohesion_and_Coherence_in_AI-generated_Narrative_Texts_ChatGPT_vs_Grok)
45. [Student-Written Versus ChatGPT-Generated Discursive ...](https://files.eric.ed.gov/fulltext/EJ1413432.pdf)
46. [Automated assessment of non-native learner essays: Investigating the role of linguistic features](https://arxiv.org/pdf/1612.00729)
47. <https://matrix.aesla.org.es/RAEL/article/download/666/362/2949>
48. [Cómo detectar textos escritos por ChatGPT](https://educacion.bilateria.org/como-detectar-textos-escritos-por-chatgpt)
49. [Diccionario de partículas discursivas del español](http://textlink.ii.metu.edu.tr/diccionario-de-part%C3%ADculas-discursivas-del-espa%C3%B1ol)
50. [Diccionario de Partículas Discursivas del Español](https://www.dpde.es/)
51. [Adversative Connectors Use in EFL and Native Students’ Writing: A Contrastive Analysis](https://tesl-ej.org/wordpress/issues/volume26/ej101/ej101a3/)
52. [A Corpus-Based Study on Korean EFL Learners' Use of English Logical Connectors -International Journal of Contents](https://koreascience.or.kr/article/JAKO201402755361881.page)
53. [Análisis del uso de los marcadores del discurso en comentarios críticos de estudiantes preuniversitarios](https://boletinfilologia.uchile.cl/index.php/BDF/article/view/84771)
54. [Wikipedia's Signs of AI Writing: The Full List + Prompt To Use](https://humanizeai.com/blog/wikipedias-signs-of-ai-writing-list-plus-a-prompt-you-can-turn-into-a-skill/)
