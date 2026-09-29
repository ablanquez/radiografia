# Marcadores estadísticos de texto generado por LLM sin modelo de lenguaje: evidencia, umbrales y calibración para un analizador en navegador (foco en español)

**Respuesta directa:** ninguna métrica de texto entero sin modelo (diversidad léxica, Zipf, repetición, compresión) tiene una dirección de efecto estable entre estudios. En español solo hay evidencia medida débil: TTR un 2,3–2,8 % más alto en humanos, en 180 textos de ROBOT-TALK.\[1\] Por eso el analizador debe (a) exigir **300 palabras como mínimo duro** y (b) comparar cada métrica con **percentiles humanos por género y por tramo de longitud**, no con umbrales fijos universales. Además, conviene tratar estas señales como indicios débiles y combinables, no como veredicto.

## TL;DR

- **Dirección del efecto inestable:** hay estudios que miden *menos* diversidad léxica en LLM (Reviriego 2024 con GPT-3.5; Muñoz-Ortiz 2024 con noticias; Alonso Simón 2024 en español) y otros que miden *más* (Kendro 2026, cuatro modelos ChatGPT, las seis dimensiones). La única base sin modelo con cifras de detección, el baseline de compresión PPMd de PAN 2026, obtiene ROC-AUC 0,783 pero con **FPR 0,728**: sin calibración, las reglas estadísticas etiquetan como IA a la mayoría de humanos.
- **Longitud mínima:** los detectores comerciales publican mínimos muy dispares: GPTZero 250 caracteres, Copyleaks 350 caracteres, Winston 500 caracteres, Originality 100 palabras en la web y Turnitin 300 palabras de prosa. La survey de Fraser, Dawkins y Kiritchenko (NRC Canada, JAIR 82, 2025) recoge que "approximately 120 words are sufficient" para clasificadores estadísticos y finetuned (Li et al. 2024) y que ~200 palabras bastan para detectar ChatGPT-turbo y GPT-4 (He et al. 2024), siempre con detectores *con modelo*. Propuesta: no emitir juicio por debajo de 100 palabras; entre 100 y 299, emitir un juicio de baja confianza y con pocas métricas; a partir de 300, el análisis completo.
- **Calibración:** usar percentiles (o z-scores sobre log-transformaciones) de un corpus humano de referencia **por género × tramo de longitud**, con umbrales en el percentil 95–99 humano para controlar la FPR. Las listas de frecuencia utilizables en un proyecto Apache 2.0 son de datos CC BY-SA 4.0 (wordfreq, FrequencyWords, Spanish Billion Words), que deben distribuirse como ficheros aparte con atribución.\[2\]\[3\]\[4\] SUBTLEX-ESP y CORPES XXI **no constan** como redistribuibles.

## Key Findings

### 1. Diversidad léxica (MTLD, MATTR, HD-D, vocd-D, Yule's K, Herdan C, hapax)

**Fórmulas con fuente (verificadas):**
- **Herdan C** = log V / log N (V = tipos, N = tokens). Documentado en quanteda, que cita a "Herdan, 1960, as cited in Tweedie & Baayen, 1998; sometimes referred to as LogTTR" (quanteda.io, textstat_lexdiv).\[5\]
- **Yule's K** = 10⁴ × [−1/N + Σᵢ V(i,N)·(i/N)²], donde V(i,N) es el número de tipos que aparecen i veces. Quanteda indica "Yule, 1944, as presented in Tweedie & Baayen, 1998, Eq. 16".\[5\] K mide *repetición* (a mayor K, menos riqueza).\[6\]
- **Guiraud R** = V/√N y **CTTR** = V/√(2N) (misma fuente).\[5\]
- **Densidad de hápax** (tal como la operacionaliza el único estudio español medido): "palabras con frecuencia 1/vocabulario único"; dis legómenon, igual con frecuencia 2 (Alonso Simón et al., RAEL 23, 2024, Tabla 2).\[1\]
- **MTLD:** McCarthy & Jarvis 2010. Muñoz-Ortiz et al. usan el umbral TTR por defecto "0.72 being the default that we use here following previous work"; el valor final es la media de las pasadas hacia delante y hacia atrás (arXiv 2308.09067).\[7\]
- **MATTR:** Covington & McFall 2010 (citado así en Kendro et al., arXiv 2508.00086).\[8\] Ventana deslizante típica de 50 palabras ("50 words) that slides through the text one word at a time", ACL SRW 2025, 2025.acl-srw.95).\[9\]
- **Fuente original de referencia:** Tweedie & Baayen 1998, *Computers and the Humanities* 32:323–352, DOI 10.1023/A:1001749303137.\[10\] Hallazgo MEDIDO clave: "two main families of constants, one measuring lexical richness and one measuring lexical repetition". También: "Only K is constant across all text lengths" (PDF en quantling.org).\[11\] Es decir, casi todas las «constantes» varían con N; K es la excepción en su análisis.

**Sensibilidad a la longitud:** Shaib et al. (arXiv 2403.00553) tratan la longitud del texto como un "important confounder" al evaluar la diversidad.\[12\] El trabajo PATTR (arXiv 2507.15092) mide que las métricas CR y MATTR tienden a "favor shorter responses".\[13\] Bestgen 2023 recomienda MATTR por su equilibrio entre sensibilidad y estabilidad (ICC), pero ese dato solo lo he leído en una síntesis secundaria (emergentmind.com): **NO RELEÍDO en fuente primaria en esta sesión**.\[14\] Zenker & Kyle 2021 y Koizumi 2012 provienen de la investigación previa; **no se han vuelto a abrir aquí: NO CONSTA verificación nueva**.

**Cifras humano vs LLM (lo MEDIDO):**
| Estudio | Idioma / corpus | Muestra | Resultado | Dirección |
|---|---|---|---|---|
| Kendro, Maloney & Jarvis, IJAL 2026 (doi 10.1111/ijal.70115; arXiv 2508.00086) | Inglés, ensayo argumentativo | 240 humanos (L1/L2, 4 niveles educativos) vs ChatGPT-3.5, 4.0, o4-mini, 4.5 | "substantially higher levels of lexical diversity than human-generated texts for all six measures"; MATTR F = 476,585, η²p = 0,571; MATTR es el 2.º rasgo más importante del SVM (0,205)\[8\] | LLM > humano |\[15\]\[16\]
| Kendro et al., CogSci (escholarship 18n5k7c6), versión preliminar | Inglés | ChatGPT 3.5/4.0, Claude, Bard | "texts created by LLMs demonstrate less variation than human-written text" | contradice la versión de 2026 |\[17\]
| Reviriego et al., MLWA 18:100602, 2024 (arXiv 2308.07462) | Inglés (QA, TOEFL, paráfrasis) | 3 datasets | "ChatGPT-3.5 tends to use fewer distinct words… ChatGPT-4 has a similar lexical diversity… in some cases even larger" | depende del modelo |\[18\]
| Muñoz-Ortiz et al., Artif. Intell. Review 2024 (arXiv 2308.09067) | Inglés, noticias | LLaMa, Mistral, Falcon | MTLD y STTR (segmentos de 1.000 tokens, lemas): "human texts exhibit the highest lexical diversity, closely followed by LLaMa" | humano > LLM |\[7\]\[19\]
| Alonso Simón et al., RAEL 23:34–54, 2024 (doi 10.58859/rael.v23i1.666) | **Español**, ROBOT-TALK | 180 textos (60 humanos, 60 GPT-3.5, 60 GPT-4; artículos, noticias y reseñas de cine) | TTR "a favor de los humanos… (+2,3% y +2,8%)"; 17 variables significativas | humano > LLM (efecto pequeño) |\[1\]
| arXiv 2506.01407 | Inglés, noticias | varios LLM | "Human writers use roughly twice as many different lexical entries as each LLM"; el «autor colectivo LLM» supera al humano | depende de la agregación |\[20\]
| ACL SRW 2025 (homogenización en noticias 2018→2024) | Inglés | noticias reales | MTLD 214,45→254,65; MATTR 0,88011→0,88121 (cambio «negligible») | las métricas discrepan entre sí |\[9\]

**Por qué se contradice la dirección (interpretación apoyada en los datos anteriores):**
1. **Versión del modelo:** GPT-3.5 queda por debajo de los humanos y GPT-4/4.5 igual o por encima (Reviriego; Kendro 2026 encuentra que los modelos más recientes son los más divergentes).\[16\]\[18\]
2. **Grupo humano de comparación:** estudiantes L1/L2 (Kendro) frente a periodistas profesionales (Muñoz-Ortiz). El LLM supera al estudiante medio, pero no al texto editado profesionalmente.
3. **Métrica:** TTR crudo, MTLD y MATTR no concuerdan ni siquiera sobre el mismo corpus (ACL SRW 2025).\[9\]
4. **Lemas vs formas:** Muñoz-Ortiz lematiza; otros no.\[7\]
5. **Individual vs colectivo** (2506.01407).\[20\]

**Implicación para reglas:** una regla de diversidad léxica no puede tener signo fijo. Lo defendible es marcar como anómala la **distancia al rango humano del género** (demasiado alta o demasiado baja), no «baja diversidad = IA».

**En español además:** AuTexTification (IberLEF 2023; arXiv 2309.11285; Sarvazyan et al., Symanto/UPV) cubre cinco dominios ("tweets, reviews, news, legal, and how-to articles"), con 52.191 textos en español y 55.677 en inglés en la subtarea 1, generados con BLOOM-1B7/3B/7B1 y GPT-3 babbage/curie/text-davinci-003. El mejor sistema (TALN-UPF) logró un Macro-F1 de 80,91 en inglés frente a 70,77 en español, y los organizadores concluyen que "cross-domain MGT detection is easier in English than in Spanish". Una réplica de 2026 (arXiv 2603.15034) mide que la diversidad léxica es el rasgo no probabilístico más fuerte (+0,035 de importancia por permutación), pero un orden de magnitud por debajo de las probabilidades de modelo (+0,299).\[21\] Sin modelo, la señal existe pero es débil.

### 2. Distribuciones de frecuencia y ley de Zipf

- **Holtzman et al. 2020 (ICLR; arXiv 1904.09751), LEÍDO:** coeficiente de Zipf humano = **0,93**, igual al del muestreo puro (0,93). Perplejidad humana 12,38; Self-BLEU4 humano 0,31. La diferencia la producen la *decodificación* (beam o greedy aplana el vocabulario) y la repetición: "Sampling with temperatures lower than 0.9 severely increase repetition".\[22\]\[23\] Es decir, con decodificación estándar moderna (nucleus) el exponente global de Zipf **no separa** humano de LLM.
- **Findings EMNLP 2025 («Zipf's and Heaps' Laws for Tokens and LLM-generated Texts»):** "Heaps' and Zipf's laws only hold for LLM-generated texts in a narrow model-dependent" rango de temperatura.\[24\]
- **arXiv 2508.17715 (Zipf de dos regímenes, 9 datasets, Llama 2 y Qwen2.5):** los textos LLM tienen α₁ menor (cabeza) y "consistently larger α₂ values in the extended vocabulary". Es decir, cola más empinada, o menos palabras raras, "regardless of temperature". Excepción: SCIDOCS.\[25\] Es la señal más prometedora para una regla sin modelo, pero **solo está medida en inglés**.
- **arXiv 2607.17228 («Literary Non-Style»):** pendientes log-log por n-grama. Humano −1,553 / −0,830 / −0,432 / −0,201 frente a LLM −2,046 / −1,029 / −0,609 / −0,395; "For 1-grams, the curves… look very similar". La diferencia crece con n.\[26\]
- **Contraevidencia:** arXiv 2407.00322 mide discrepancias de exponente Zipf "below 0.03" entre LLM y humano.\[27\]
- **Caso extremo:** el corpus de agentes de Moltbook (arXiv 2602.10131) da un exponente de 1,70, que los autores atribuyen a plantillas y duplicación.\[28\]
- **Perfil por bandas top-1k/5k en texto LLM: NO ENCONTRADO** ningún estudio medido (ni en inglés ni en español). Hay una observación cualitativa: los autores revisados por Alonso Simón 2024 se contradicen ("las máquinas utilizan palabras muy frecuentes" frente a "tienden a usar palabras poco comunes").\[1\]
- **Densidad léxica en español (medido, RAEL 2024):** resultados dependientes del dominio. "GPT-3.5 presenta una densidad léxica mayor en comparación con los humanos" en un dominio, lo contrario que en artículos. Los humanos usan más adverbios y pronombres; GPT-3.5/4, más adjetivos.\[1\] La densidad léxica exige POS, y por tanto un etiquetador en el navegador.

### 3. Repetición y compresibilidad

- **Welleck et al. 2019 (arXiv 1908.04319), LEÍDO en tabla:** seq-rep-4 humano = **0,005–0,006** (Wikitext-103), frente a GPT-2 greedy 0,506 y MLE greedy 0,460. Tokens únicos: humano 17,7k frente a 11,8k–13,3k. Además, "At higher levels of p and k… continuations contain more unique tokens than that of humans".\[29\]\[30\] Con muestreo, el LLM puede ser *más* diverso que el humano. Conclusión: rep-n discrimina bien la degeneración greedy (modelos antiguos o locales mal configurados), pero no los chatbots comerciales con muestreo.
- **Holtzman 2020:** repetición % humana 0,28, frente a ~28,94 % con beam 16 (cifra de beam solo leída en resumen secundario, alphaxiv).\[31\]
- **Dato «solo 23 % de bigramas» — fuente primaria localizada: arXiv 2308.11767 (xFakeSci).** La frase literal es "ChatGPT contributed merely 23% of the bigram content".\[32\] El contexto es **solapamiento de redes de bigramas** con abstracts de PubMed (cáncer, depresión, Alzheimer), no «bigramas únicos por texto».\[33\] **El dato circula mal citado**: no sirve como umbral de regla.
- **M4 (arXiv 2305.14902), Tabla 9:** conteos de corpus, no normalizados. En Wikipedia, 144.523 unigramas únicos humanos frente a 45.275 de ChatGPT y 1.000.870 bigramas frente a 295.007.\[34\] Sin normalizar por tamaño **no es interpretable como tasa**.
- **Compresión (Shaib et al., arXiv 2403.00553; IJCNLP 2025 demo), LEÍDO:** CR = tamaño original / tamaño comprimido con gzip ("High CRs imply more redundancy"). "Compression ratio for part of speech sequences is the score that identifies the most differences between human and model-generated text". Evaluado "on English texts" (OpenReview).\[35\]\[36\]\[37\] Paquete Python `diversity`.\[38\] Importante: el CR de Shaib se calcula sobre **conjuntos concatenados de salidas**, no sobre un texto individual.\[37\]
- **Jiang et al. 2023 (Findings ACL, 2023.findings-acl.426), LEÍDO en resumen:** gzip + kNN con distancia NCD para *clasificación temática*, "combination of a simple compressor like gzip with a k-nearest-neighbor classifier".\[39\] No es un detector de IA. Hay una réplica crítica (Lior Sinai, blog) que no encuentra que supere a TF-IDF + LR: OPINADO/réplica informal.\[40\]
- **PAN baseline PPMd CBC (compresión, sin modelo):**
  - PAN 2024 (texto emparejado): ROC-AUC 0,795, media 0,77, frente a Binoculars 0,972 / 0,965.\[41\]
  - PAN 2025: media 0,758, frente a Binoculars 0,818.\[42\]
  - **PAN 2026 (texto único, LLM imitando autores; géneros ensayo, noticias y ficción):** ROC-AUC 0,783, media 0,814, **FPR 0,728**, FNR 0,066. Binoculars (Llama-3.1): ROC-AUC 0,764, FPR 0,125, FNR 0,414. TF-IDF SVM: ROC-AUC 0,711, FPR 0,069, FNR 0,651 (en validación, 0,996).\[43\]
  - El equipo ikr3 («lexical + linguistic LR») obtiene ROC-AUC 0,814 **con FPR 1,000**.\[43\]

  Lectura: los métodos sin modelo **ordenan** algo (AUC ~0,78–0,81), pero su punto de corte no se transfiere; o marcan a casi todos los humanos o a casi ninguno. Esto justifica la calibración humana por género de la sección 6.
- **rep-n, CR o entropía medidos EN ESPAÑOL: NO ENCONTRADO.**

### 4. Longitud de palabra (sílabas/caracteres) y su varianza

- AuTexTification español se ha usado con "Average Word Length (AWL)" como rasgo (arXiv 2311.12373),\[44\] **sin cifras humano vs LLM extraíbles** de lo leído.
- La survey de Terčon (arXiv 2510.05136) lista "word length" entre las dimensiones estudiadas,\[45\] sin cifra para español en lo leído.
- **Cifras medidas de longitud media o varianza de palabra humano vs LLM en español: NO ENCONTRADO.**

### 5. Longitud mínima: lo publicado

**Detectores comerciales (fuente primaria salvo indicación):**
| Herramienta | Mínimo publicado | Fuente | Cita |
|---|---|---|---|
| Turnitin | 300 palabras de prosa larga (máx. 30.000) | helpcenter.turnitin.com | "Must contain between 300 and 30,000 words of long-form prose text"; soporta inglés, español, japonés y árabe |\[46\]
| GPTZero | 250 caracteres (~50 palabras) | gptzero.me, página de benchmarking | "minimum length requirement of 250 characters (approx. 50 words) specified on the GPTZero dashboard" |\[47\]
| Originality.ai | 100 palabras (web); sin mínimo en API | help.originality.ai | "accuracy is decreased for texts below 100 words" |\[48\]
| Copyleaks | 350 caracteres (extensión); 255 (plataforma web) | help.copyleaks.com; FAQ copyleaks.com | "requires a minimum of 350 characters"; su test solo usa textos >350 caracteres |\[49\]\[50\]\[51\]
| Winston AI | 500 caracteres (web); 300 caracteres (API/MCP, 600+ recomendado) | help.gowinston.ai; GitHub gowinston-ai | "Minimum 500 characters to run a scan… aim for 300 words or more" |\[52\]\[53\]

**Conflicto señalado:** una reseña de GPTZero (gptzero.me) atribuye a Winston un mínimo de 600 caracteres y a GPTZero uno de 300.\[54\] Además, la Tabla 2 de Fraser et al. (JAIR 2025) recoge Winston AI "600 chars (90-120 words)", GPTZero "250 chars (40-50 words)" y Originality AI "50 words". Prevalecen las páginas propias de cada proveedor.

**Estudios de precisión según la longitud (Fraser et al., arXiv 2406.15583, survey):**
- Li et al. 2024: "approximately 120 words are sufficient" para que clasificadores estadísticos y finetuned alcancen su potencial.\[55\]
- He et al. 2024: ~200 palabras.\[55\]
- Pasar de 256 a 64 palabras supone "a 10% drop in accuracy" con nucleus sampling.\[55\]
- Según Fraser et al. 2025, que citan a Liu et al. 2023b (ArguGPT), "RoBERTa's accuracy drops by only 2% on full essay examples, but drops by 13% on sentence length texts, compared to in-distribution performance".

**En chino (arXiv 2402.01158):** Fast-DetectGPT llega al 94,3 % por encima de 100 caracteres y RoBERTa al 83,8 % por encima de 200.\[56\]

Todo esto se refiere a detectores *con* modelo. **No existe estudio de curva precisión–longitud para métricas sin modelo en español: NO ENCONTRADO.**

### 6. Calibración por género

- **Método con fuente:** la revisión de ScienceDirect (S1546221826000482) describe MCP, que usa "a small calibration set of human-authored texts to derive multiscale quantiles… tailored to varying text lengths" para controlar la FPR.\[57\] Es el patrón recomendado aquí: cuantiles humanos por tramo de longitud.
- **Géneros con corpus comparable en español:** ROBOT-TALK tiene 765 textos y 398.501 tokens (artículos científicos de lingüística, noticias, reseñas de cine; humanos + GPT-3.5, GPT-4, Gemini y Mixtral; 2023–2024). Los resultados detallados están en OSF;\[1\] **licencia y acceso al corpus completo: NO CONSTA**.
- **PAN 2024–2026:** "contains copyrighted material and may be used only for research purposes. No redistribution allowed".\[43\] Sirve para evaluar, no para empaquetar.
- **Tablas de referencia MTLD/MATTR por género en español: NO ENCONTRADAS.** Habrá que construirlas.

### 7. Estilometría clásica

- arXiv 2508.16385: los textos ChatGPT-3.5 muestran rasgos de autoría estilométrica no humanos. Corpus: 300 textos en inglés, ensayos LOCNESS y Wikipedia. Longitud media 672 palabras sin indicar longitud y 924 al pedir 1.000.\[58\]
- PAN usa baselines de verificación de autoría: PPMd CBC, *authorship unmasking* (2024) y TF-IDF SVM (2025–2026); las cifras están en la sección 3.\[43\]\[59\]
- Burrows' Delta aplicado a detección LLM en español, McGovern 2024 («fingerprints», arXiv 2405.14057), PUCP-Metrix (arXiv 2511.17402) y esTS/pyests: **NO RELEÍDOS en esta sesión**; se mantienen solo como referencias de la investigación previa, sin cifras nuevas.

### 8. Falsos positivos

- **Umbral de fábrica:** la FPR 0,728 de PPMd en PAN 2026 y la FPR 1,000 del sistema léxico-lingüístico ikr3 son la evidencia medida más fuerte de que las reglas estadísticas con umbral fijo disparan falsos positivos.\[43\]
- **Tipos de texto:** Winston declara como no aptos "Boilerplate legal text", tablas y datos estructurados, y advierte de que "translation alone can significantly alter AI detection scores".\[52\] Turnitin excluye listas, viñetas, código, poesía y respuestas de menos de 300 palabras (según una guía institucional de Arcadia que reproduce su documentación).\[60\]
- **Textos no nativos:** en Kendro 2026 la diversidad humana no difería entre L1 y L2, lo que es un dato tranquilizador para la diversidad léxica concreta.\[16\] Para los detectores comerciales sí hay una fuente medida: Liang et al. 2023 (resumido en Fraser et al. 2025) probaron siete detectores, entre ellos GPTZero y ZeroGPT, y hallaron que "TOEFL essays written by Chinese English learners have a false positive rate close to 60%", frente a una precisión casi perfecta en ensayos de 8.º grado de EE. UU. Se trata de detectores con modelo en inglés, no de métricas sin modelo en español.

### 9. Herramientas JS/TS (licencias verificadas por subagente)

| Paquete | Licencia | Español | Nota |
|---|---|---|---|
| text-readability (clearnote01) | ISC (npm) / MIT (repo) | NO CONSTA si incluye Fernández-Huerta o Szigriszt | port de textstat centrado en inglés\[61\]\[62\] |
| stopwords-es / stopwords-iso | MIT | sí | "free to use this collection any way you like"; fuentes subyacentes NO CONSTA\[63\]\[64\] |
| silabea | MIT | sí (silabeador) | fork de silabajs; sin publicaciones desde hace ~8 años\[65\]\[66\]\[67\] |
| compromise | MIT | núcleo solo inglés\[68\] | — |
| es-compromise | MIT | sí, POS por reglas | "work-in-progress"\[68\]\[69\] |
| natural | MIT | `PorterStemmerEs` | incluye licencia WordNet y un stemmer alemán BSD de 4 cláusulas; empaquetado en navegador no verificado\[70\]\[71\]\[72\] |
| lexical-diversity (npm), syllable-es, hyphenopoly | NO CONSTA (no verificados) | — | — |

## Tabla de candidatas a regla

| Métrica | Idioma documentado | Evidencia | Dirección | Necesita en navegador | Long. mín. propuesta | Riesgo FP |
|---|---|---|---|---|---|---|
| MATTR (ventana 50) | EN (Kendro, η²p 0,571); ES solo TTR | fuerte en EN, contradictoria | bidireccional (distancia al rango humano) | conteo + tokenizador | 100 palabras (≥2 ventanas); fiable ≥300 | medio |
| MTLD (0,72) | EN | contradictoria (ACL SRW) | bidireccional | conteo | 300 | medio |
| TTR crudo | **ES** (+2,3–2,8 % humano) | débil | humano > LLM | conteo | solo con longitud fija por tramos | alto (depende de N) |
| Yule's K | fórmula (T&B 1998); sin cifra humano vs LLM | teórica | NO CONSTA | conteo del espectro de frecuencias | 300 | medio |
| Herdan C | fórmula; sin cifra LLM | teórica | NO CONSTA | conteo | 300 | alto (varía con N) |
| Hápax/vocabulario | ES (variable en RAEL 2024) | débil | NO CONSTA por separado | conteo | 300 | medio |
| Zipf α₂ (cola) | EN (2508.17715) | moderada, consistente | LLM cola más empinada | conteo + ajuste log-log | NO CONSTA (propuesta: ≥1.000 tokens) | alto en textos cortos |
| Pendiente Zipf de n-gramas (n≥2) | EN (2607.17228, literario) | un estudio | LLM más empinada | conteo de n-gramas | NO CONSTA | medio |
| seq-rep-4 / rep-n | EN (Welleck; humano 0,005) | fuerte solo para greedy | LLM > humano (degeneración) | conteo de n-gramas | 300 | bajo para loops, alto para textos técnicos o de listas |
| Ratio de compresión gzip (texto) | EN, a nivel de conjunto | moderada | LLM más compresible | CompressionStream / pako | 300 + baseline por longitud | alto (plantillas, textos legales) |
| CR de secuencias POS | EN (mejor discriminador en Shaib) | moderada | LLM > humano | etiquetador POS (es-compromise) | 300 | medio |
| Densidad léxica | ES (RAEL, según dominio) | débil, depende del dominio | variable | POS o lista de palabras función | 300 | alto |
| Longitud de palabra (media/varianza) | NO CONSTA | ninguna medida | NO CONSTA | silabeador (silabea) | — | desconocido |

## Propuesta de umbral de longitud mínima

1. **< 100 palabras: no emitir veredicto.** Base: Originality ("accuracy is decreased for texts below 100 words");\[48\] Fraser (−10 % de acierto de 256 a 64 palabras, incluso con modelos);\[55\] con MATTR de ventana 50 no hay ni dos ventanas.
2. **100–299 palabras: modo de baja confianza.** Solo MATTR y rep-n, comparados con percentiles humanos del mismo tramo de longitud y con aviso visible. Base: ~120 palabras (Li et al. 2024) y ~200 (He et al. 2024) bastan para detectores *con* modelo.\[55\] Las reglas sin modelo son más débiles (PPMd AUC 0,78 frente a 0,99 de los mejores), así que en este tramo no deben dar una puntuación alta.
3. **≥ 300 palabras: análisis completo.** Base: Turnitin (300 palabras de prosa, soporte para español) y Winston ("aim for 300 words or more").\[46\]\[52\]
4. **Zipf por texto: ≥ 1.000 tokens.** Es una PROPUESTA PROPIA sin fuente; no hay estudio que fije ese mínimo. Por debajo, no se calcula.

Contar solo **prosa**: excluir viñetas, tablas y código antes de medir, igual que hace Turnitin.

## Inventario de corpus y listas (licencias)

| Recurso | Licencia exacta | Uso en proyecto Apache 2.0 |
|---|---|---|
| wordfreq (código) | Apache-2.0 | compatible\[73\]\[74\] |
| wordfreq (datos; fuentes ES: Wikipedia, OpenSubtitles 2018 + SUBTLEX, NewsCrawl, GlobalVoices, Google Books, OSCAR, Twitter, Reddit) | CC BY-SA 4.0 ("may be redistributed under a Creative Commons Attribution-ShareAlike 4.0 license") | fichero de datos aparte con atribución; según SUNSET.md (sept. 2024), "The wordfreq data is a snapshot of language that could be found in various online sources up through 2021"; inclusión de SUBTLEX-ESP NO CONSTA |
| hermitdave/FrequencyWords | código MIT; contenido CC BY-SA 4.0 ("MIT License for code. CC-by-sa-4.0 for content.") | datos aparte, con BY-SA\[3\] |
| Spanish Billion Words (Cardellino) | CC BY-SA 4.0 | datos aparte; derechos de origen no depurados por el autor\[4\]\[75\] |
| AnCora-ES | CC BY 4.0 (Zenodo 10.5281/zenodo.4762030; UD_Spanish-AnCora) **vs** GPL (ELRA-W0326, HF CLiC-UB) | usar la versión Zenodo/UD con CC BY; conflicto señalado\[76\]\[77\]\[78\]\[79\] |
| SUBTLEX-ESP | OSF xp6sz: licencia «Other» + license.txt **contenido NO CONSTA** | no redistribuir hasta leer license.txt\[80\] |
| CORPES XXI (RAE) | sin licencia propia; el aviso legal de la RAE prohíbe la "reproducción ni total ni parcial" | no redistribuir sin permiso escrito\[81\] |
| PAN 2024–2026 | solo investigación, "No redistribution allowed" | solo evaluación local |\[43\]
| ROBOT-TALK | NO CONSTA | pedir acceso a los autores (UCM) |
| AuTexTification, OSCAR, Wikipedia ES, CC-News, PUCP-Metrix, esTS, TAALED, textstat | NO VERIFICADO en esta sesión | verificar antes de usar |

## Recommendations

1. **Implementar** MATTR, MTLD, Yule's K, rep-2/3/4, ratio gzip (CompressionStream nativo) y hápax/vocabulario como features, **pero decidir sobre la distancia a percentiles humanos**, nunca con umbrales absolutos tomados de la literatura inglesa.
2. **Construir la calibración** con Spanish Billion Words (CC BY-SA) y AnCora (CC BY 4.0), estratificando por género (noticias, académico, opinión/reseña, narrativa) y por tramos de longitud (100–199, 200–299, 300–599, 600+). Guardar los percentiles 1/5/50/95/99 por celda. Marcar cuando ≥2 métricas independientes caen fuera del p1–p99 humano.
3. **Validar la FPR** con textos humanos españoles no usados en la calibración. El objetivo es FPR ≤ 5 %, dado que el ejemplo de PAN 2026 muestra FPR de 0,73 sin calibrar.
4. **Distribuir las listas BY-SA** como `/data/*.json` con su licencia y atribución separadas del código Apache.
5. **No usar** la cifra del «23 % de bigramas» ni perfiles de bandas de frecuencia como reglas: no hay evidencia medida válida.

## Huecos (buscado y no encontrado)

- rep-n, ratio de compresión, entropía y exponente de Zipf **medidos en español** humano vs LLM.
- Perfil de bandas top-1k/5k en texto LLM (cualquier idioma).
- Longitud de palabra (sílabas o caracteres) y su varianza humano vs LLM en español.
- Tablas de referencia MTLD/MATTR por género en español.
- Curva precisión–longitud para métricas sin modelo.
- Contenido de license.txt de SUBTLEX-ESP; condiciones de uso de CORPES XXI; licencias de ROBOT-TALK y AuTexTification.
- Licencias de lexical-diversity (npm), syllable-es e hyphenopoly; soporte de fórmulas de legibilidad en español en text-readability.
- Relectura primaria en esta sesión de Zenker & Kyle 2021, Koizumi 2012, Bestgen 2023, McGovern 2024, PUCP-Metrix, esTS, OpenTuringBench, EnsemJudge, arXiv 2603.23146 y 2608.26694: NO CONSTA.

## Caveats

- La mayor parte de la evidencia está medida en inglés y con modelos de 2023–2025; los modelos más recientes cambian la dirección del efecto (Kendro 2026).\[16\]
- El único estudio español medido (RAEL 2024) usa 180 textos y Sketch Engine, con efectos pequeños;\[1\] sus resultados no se pueden extrapolar a otros géneros.
- Los mínimos comerciales son declaraciones de producto, no estudios, y varios proveedores publican cifras distintas según el canal (web, API, extensión).
- Las propuestas de tramos y percentiles de este documento son OPINIÓN razonada a partir de la evidencia citada, no resultados medidos.

## Fuentes

1. [¿Tienen GPT-3.5 y GPT-4 un estilo de escritura diferente ...](https://matrix.aesla.org.es/RAEL/article/download/666/362/2949)
2. [GitHub - rspeer/wordfreq: Access a database of word frequencies, in various natural languages. · GitHub](https://github.com/rspeer/wordfreq)
3. [GitHub - hermitdave/FrequencyWords: Repository for Frequency Word List Generator and processed files · GitHub](https://github.com/hermitdave/FrequencyWords)
4. [Spanish Billion Word Corpus and Embeddings](https://crscardellino.github.io/SBWCE/)
5. [Calculate lexical diversity — textstat\_lexdiv • quanteda](https://quanteda.io/reference/textstat_lexdiv.html)
6. [(PDF) Investigating Lexical Progression through Lexical Diversity Metrics in a Corpus of French L3](https://www.researchgate.net/publication/333723678_Investigating_Lexical_Progression_through_Lexical_Diversity_Metrics_in_a_Corpus_of_French_L3)
7. [Contrasting Linguistic Patterns in Human and LLM-Generated News Text](https://arxiv.org/pdf/2308.09067)
8. [Title Do LLMs produce texts with “human-like” lexical diversity?](https://arxiv.org/pdf/2508.00086)
9. [Testing English News Articles for Lexical Homogenization ...](https://aclanthology.org/2025.acl-srw.95.pdf)
10. [How Variable May a Constant be? Measures of Lexical Richness in Perspective](https://link.springer.com/article/10.1023/A:1001749303137)
11. [How Variable May a Constant be? Measures of Lexical ...](https://quantling.org/~hbaayen/publications/TweedieBaayen1998.pdf)
12. [Standardizing the Measurement of Text Diversity](https://aclanthology.org/2025.ijcnlp-demo.5.pdf)
13. [A Penalty Goes a Long Way: Measuring Lexical Diversity in Synthetic Texts Under Prompt-Influenced Length Variations](https://arxiv.org/html/2507.15092v1)
14. [Lexical Diversity Measures](https://www.emergentmind.com/topics/lexical-diversity-measures)
15. [(PDF) Do LLMs produce texts with "human-like" lexical diversity?](https://www.researchgate.net/publication/394263012_Do_LLMs_produce_texts_with_human-like_lexical_diversity)
16. [Do Large Language Models Produce Texts With “Human‐Like” Lexical Diversity? Evidence From Four ChatGPT Models - Kendro - 2026 - International Journal of Applied Linguistics - Wiley Online Library](https://onlinelibrary.wiley.com/doi/10.1111/ijal.70115)
17. [Lexical diversity in human- and LLM-generated text](https://escholarship.org/uc/item/18n5k7c6)
18. [Playing with words: Comparing the vocabulary and lexical diversity of ChatGPT and humans - ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2666827024000781)
19. [Contrasting Linguistic Patterns in Human and LLM-Generated News Text](https://link.springer.com/article/10.1007/s10462-024-10903-2)
20. [Comparing LLM-generated and human-authored news text using formal syntactic theory](https://arxiv.org/pdf/2506.01407)
21. [Interpretable Predictability-Based AI Text Detection: A Replication Study](https://arxiv.org/html/2603.15034)
22. [THE CURIOUS CASE OF NEURAL TEXT DeGENERATION](https://scispace.com/pdf/the-curious-case-of-neural-text-degeneration-2xplgl0dw1.pdf)
23. [(PDF) The Curious Case of Neural Text Degeneration](https://www.academia.edu/85403019/The_Curious_Case_of_Neural_Text_Degeneration)
24. [Zipf's and Heaps' Laws for Tokens and LLM-generated Texts](https://aclanthology.org/2025.findings-emnlp.837.pdf)
25. [How Do LLM-Generated Texts Impact Term-Based Retrieval Models?](https://arxiv.org/pdf/2508.17715)
26. [Literary Non-Style in LLM-Generated Text](https://arxiv.org/pdf/2607.17228)
27. [LLM-Generated Natural Language Meets Scaling Laws: New Explorations and Data Augmentation Methods](https://arxiv.org/pdf/2407.00322)
28. [The Anatomy of the Moltbook Social Graph](https://arxiv.org/pdf/2602.10131)
29. [Neural Text Generation with Unlikelihood Training](https://www.alphaxiv.org/abs/1908.04319)
30. [Neural Text Generation with Unlikelihood Training](https://arxiv.org/pdf/1908.04319)
31. [The Curious Case of Neural Text Degeneration](https://www.alphaxiv.org/abs/1904.09751)
32. [arxiv.org](https://arxiv.org/pdf/2308.11767v1)
33. <https://arxiv.org/abs/2308.11767>
34. [M4: Multi-generator, Multi-domain, and Multi-lingual Black-Box Machine-Generated Text Detection](https://arxiv.org/pdf/2305.14902)
35. [Standardizing the Measurement of Text Diversity: A Tool and Comparative Analysis](https://openreview.net/forum?id=jvRCirB0Oq)
36. [Standardizing the Measurement of Text Diversity: A Tool and Comparative Analysis](https://arxiv.org/html/2403.00553v2)
37. [Standardizing the Measurement of Text Diversity: A Tool and a Comparative Analysis of Scores](https://arxiv.org/pdf/2403.00553)
38. [Standardizing the Measurement of Text Diversity: A Tool and Comparative Analysis - ACL Anthology](https://aclanthology.org/2025.ijcnlp-demo.5/)
39. [“Low-Resource” Text Classification: A Parameter-Free Classification Method with Compressors - ACL Anthology](https://aclanthology.org/2023.findings-acl.426/)
40. [Implementing the GZip-kNN Classification paper - Lior Sinai](https://liorsinai.github.io/machine-learning/2023/08/13/gzip-knn.html)
41. [Generative AI Authorship Verification Of Tri-Sentence ...](https://ceur-ws.org/Vol-3740/paper-243.pdf)
42. [Overview of PAN 2025: Voight-Kampff Generative AI Detection,](https://evazangerle.at/publication/bevendorff-clef-2025/bevendorff-clef-2025.pdf)
43. [PAN at CLEF 2026 - Voight-Kampff Generative AI Detection](https://pan.webis.de/clef26/pan26-web/generated-content-analysis.html)
44. [Beyond Turing: A Comparative Analysis of Approaches for Detecting Machine-Generated Text](https://arxiv.org/pdf/2311.12373)
45. [Linguistic Characteristics of AI-Generated Text: A Survey Luka Terčon](https://arxiv.org/pdf/2510.05136)
46. [Why can't I see the AI writing detection report?](https://helpcenter.turnitin.com/hc/en-us/articles/46468418712461-Why-can-t-I-see-the-AI-writing-detection-report)
47. [GPTZero AI Detection Benchmarking: The Industry Standard in Accuracy, Transparency and Fairness](https://gptzero.me/news/gptzero-ai-detection-benchmarking-the-industry-standard-in-accuracy-transparency-and-fairness/)
48. [Minimum Word Counts For Scans](https://help.originality.ai/en/article/minimum-word-counts-for-scans-1lyfqtb/)
49. [What is the minimum character count needed for a check with the AI Detector?](https://help.copyleaks.com/s/article/WhatistheminimumcharactercountneededforacheckwiththeAIDetector681cd27608aae)
50. [AI Detector - Free AI Checker for ChatGPT, GPT-5, Gemini & More](https://copyleaks.com/ai-content-detector)
51. [Copyleaks AI Detector Testing Methodology](https://copyleaks.com/ai-detector/testing-methodology)
52. [What types of content can I scan with Winston AI? — Winston AI Help Center](https://help.gowinston.ai/understanding-winston-ai/what-types-of-content-can-i-scan-with-winston-ai)
53. [GitHub - gowinston-ai/winston-ai-mcp-server: Winston AI MCP Server · GitHub](https://github.com/gowinston-ai/winston-ai-mcp-server)
54. [Winston AI Content Detector Review for 2025](https://gptzero.me/news/winston-ai-review/)
55. [Detecting AI-Generated Text: Factors Influencing Detectability with Current Methods](https://arxiv.org/pdf/2406.15583)
56. [LLM-Detector: Improving AI-Generated Chinese Text Detection with Open-Source LLM Instruction Tuning](https://arxiv.org/pdf/2402.01158)
57. [AI-Generated Text Detection: A Comprehensive Review of Active and Passive Approaches - ScienceDirect](https://www.sciencedirect.com/org/science/article/pii/S1546221826000482)
58. [ChatGPT-generated texts show authorship traits that identify them as non-human](https://arxiv.org/pdf/2508.16385)
59. [Voight-Kampff Generative AI Authorship Verification 2024 - PAN](https://pan.webis.de/clef24/pan24-web/generated-content-analysis.html)
60. [Turnitin AI Writing Detection](https://helpdesk.arcadia.edu/hc/en-us/articles/46219290783117-Turnitin-AI-Writing-Detection)
61. [text-readability - npm](https://www.npmjs.com/package/text-readability)
62. [GitHub - clearnote01/readability: npm package to calculate readability statistics of a text object - paragraphs, sentences, articles.](https://github.com/clearnote01/readability)
63. [stopwords-es - npm](https://www.npmjs.com/package/stopwords-es)
64. [GitHub - stopwords-iso/stopwords-iso: All languages stopwords collection · GitHub](https://github.com/stopwords-iso/stopwords-iso)
65. [syllables - npm search](https://www.npmjs.com/search?q=syllables)
66. [GitHub - javierarce/silabea: Node package that split Spanish words into syllables. · GitHub](https://github.com/javierarce/silabea)
67. [silabea 1.0.0 on npm - Libraries.io - security & maintenance data for open source software](https://libraries.io/npm/silabea)
68. [compromise - npm](https://www.npmjs.com/package/compromise)
69. [GitHub - nlp-compromise/es-compromise: modesto procesamiento del lenguaje natural · GitHub](https://github.com/nlp-compromise/es-compromise)
70. [natural - npm](https://www.npmjs.com/package/natural)
71. [natural CDN by jsDelivr - A CDN for npm and GitHub](https://www.jsdelivr.com/package/npm/natural)
72. [GitHub - NaturalNode/natural: general natural language facilities for node · GitHub](https://github.com/NaturalNode/natural)
73. [wordfreq (rspeer/wordfreq)](https://context7.com/rspeer/wordfreq)
74. [wordfreq · PyPI](https://pypi.org/project/wordfreq/)
75. [crscardellino/spanish\_billion\_words · Datasets at Hugging Face](https://huggingface.co/datasets/crscardellino/spanish_billion_words)
76. [CLiC-UB/AnCora-ES · Datasets at Hugging Face](https://huggingface.co/datasets/CLiC-UB/AnCora-ES)
77. [GitHub - UniversalDependencies/UD\_Spanish-AnCora: Spanish data from the AnCora corpus. · GitHub](https://github.com/UniversalDependencies/UD_Spanish-AnCora)
78. [UD\_Spanish-AnCora](https://universaldependencies.org/treebanks/es_ancora/index.html)
79. [AnCora Spanish 2.0.0](https://catalog.elra.info/en-us/repository/browse/ELRA-W0326/)
80. [OSF](https://osf.io/xp6sz/)
81. [Aviso legal](https://www.rae.es/aviso-legal)
