# Investigación — Familia ESTADÍSTICA

> Punto 2 del `PLAN-RADIOGRAFIA.md`. **Investigación manual del 29/09/2026
> fusionada con el informe del módulo de investigación del 29/09/2026**
> (`informes/estadistica-modulo.md`, 81 fuentes). Lo manual se conserva
> donde tenía fuente; lo del módulo se añade con sus URL; lo que el módulo
> contradijo está corregido y marcado. Cada afirmación lleva fuente. Lo
> ya medido en `lexico.md` §4 y `sintaxis.md` §1 se cita por referencia.
>
> Regla de esta familia: **sin fuente no hay candidata.**
>
> Esta familia fija dos decisiones del plan: el **umbral de longitud
> mínima** (§5, FIRMADO 29/09) y el **método de calibración por género**
> (§6).

## Resumen

Ninguna métrica de texto entero sin modelo (diversidad léxica, Zipf,
repetición, compresión) tiene una **dirección de efecto estable entre
estudios**. Cuatro verdades con fuente:

1. **Todas dependen de la longitud.** Solo MATTR, MTLD y HD-D son estables
   y a partir de ~50–100 tokens (Zenker & Kyle 2021; Koizumi 2012; McCarthy
   & Jarvis 2010). Tweedie & Baayen 1998: casi todas las «constantes»
   varían con N; «Only K is constant across all text lengths». Shaib 2024:
   la longitud es un «important confounder».
2. **La dirección no es fija.** Menos diversidad en LLM: Reviriego (GPT-3.5),
   Muñoz-Ortiz (noticias, MTLD y STTR: «human texts exhibit the highest
   lexical diversity»), Alonso Simón (**español**: TTR +2,3–2,8 % en
   humanos). Más diversidad en LLM: Kendro 2026 (cuatro modelos ChatGPT,
   «substantially higher levels of lexical diversity than human-generated
   texts for all six measures», MATTR η²p = 0,571). Causas: versión del
   modelo, grupo humano de comparación (estudiantes vs periodistas),
   métrica (TTR, MTLD y MATTR discrepan sobre el mismo corpus), lemas vs
   formas, individual vs colectivo.
3. **Las baselines sin modelo ordenan pero no cortan**: PPMd (compresión)
   en PAN 2026 da ROC-AUC 0,783 con **FPR 0,728**; el sistema
   léxico-lingüístico ikr3, AUC 0,814 con **FPR 1,000**. Sin calibración,
   marcan como IA a casi todos los humanos.
4. **Lo único medido en español**: TTR, densidad léxica (dependiente del
   dominio) y hápax en ROBOT-TALK (180 textos, efectos pequeños). Nada de
   rep-n, compresión, Zipf ni longitud de palabra en español.

Consecuencia para el motor: **ninguna regla de esta familia lleva umbral
absoluto tomado de la literatura inglesa**. Se calcula la métrica, se
compara con **percentiles humanos por género y por tramo de longitud**, y
se marca la **distancia al rango humano** (por arriba o por abajo), no
«baja diversidad = IA». Señales débiles y combinables; nunca veredicto.

---

## 1. Diversidad léxica: índices, fórmulas y estabilidad

### Fórmulas con fuente
- **MTLD, vocd-D, HD-D**: McCarthy & Jarvis, *Behavior Research Methods*
  42(2):381–392, 2010, DOI 10.3758/BRM.42.2.381. MTLD = «the mean length of
  sequential word strings in a text that maintain a given TTR value»,
  factor 0,72 («0.72 being the default that we use here following
  previous work», Muñoz-Ortiz, https://arxiv.org/pdf/2308.09067); valor
  final = media de las pasadas adelante y atrás. HD-D: probabilidad de
  cada tipo en una muestra de **42 tokens**; Bestgen 2023 recomienda
  mantener 42 (https://arxiv.org/pdf/2307.04626). Los autores aconsejan
  usar MTLD, vocd-D/HD-D y Maas juntos.
- **MATTR**: Covington & McFall 2010 (citado en Kendro,
  https://arxiv.org/pdf/2508.00086); ventana deslizante típica de 50
  palabras que avanza de una en una (ACL SRW 2025, 2025.acl-srw.95).
- **Herdan C** = log V / log N (quanteda `textstat_lexdiv`, citando
  «Herdan, 1960, as cited in Tweedie & Baayen, 1998; sometimes referred to
  as LogTTR»). **Yule's K** = 10⁴ × [−1/N + Σᵢ V(i,N)·(i/N)²] («Yule, 1944,
  as presented in Tweedie & Baayen, 1998, Eq. 16»); K mide repetición.
  **Guiraud R** = V/√N; **CTTR** = V/√(2N). Fuente: quanteda.io.
- **Tweedie & Baayen 1998**, *Computers and the Humanities* 32:323–352, DOI
  10.1023/A:1001749303137: «two main families of constants, one measuring
  lexical richness and one measuring lexical repetition»; «Only K is
  constant across all text lengths».
- **Hápax** (operacionalización del único estudio español): «palabras con
  frecuencia 1/vocabulario único»; dis legómena, frecuencia 2 (Alonso
  Simón et al., RAEL 23, Tabla 2).

### Estabilidad frente a la longitud
- **Zenker & Kyle 2021**, *Assessing Writing* 47:100505,
  https://www.sciencedirect.com/science/article/abs/pii/S1075293520300660
  4.542 ensayos L2: «MATTR and two versions of MTLD are highly stable
  indices for analyzing short texts»; «MATTR performs particularly well».
  HD-D: r = 0,064 con longitud. TAALED (https://github.com/LCR-ADS-Lab/TAALED):
  «Use with confidence: MATTR (50), MTLD-Original (50)»; «MTLD values
  stabilized at roughly 100 tokens».
- **Koizumi 2012**, http://www.vli-journal.org/issues/01.1/issue01.1.10.pdf:
  «MTLD is least affected by text length, but […] should be used with
  texts of at least 100 tokens».
- **Bestgen 2023** (arXiv 2307.04626): HD-D el menos afectado; para
  estimación local, MATTR y MTLD.
- **Shaib et al. 2024** (arXiv 2403.00553): longitud como «important
  confounder». **PATTR** (arXiv 2507.15092): CR y MATTR «favor shorter
  responses».

### Humano vs LLM (medido)
| Estudio | Idioma / corpus | Resultado | Dirección |
|---|---|---|---|
| Kendro, Maloney & Jarvis, *IJAL* 2026 (doi 10.1111/ijal.70115; arXiv 2508.00086) | EN, ensayo; 240 humanos L1/L2 vs ChatGPT 3.5, 4, o4-mini, 4.5 | «substantially higher levels of lexical diversity than human-generated texts for all six measures»; MATTR F = 476,585, η²p = 0,571; los modelos nuevos divergen más | LLM > humano |
| Kendro et al., CogSci (escholarship 18n5k7c6), preliminar | EN; ChatGPT 3.5/4, Claude, Bard | «texts created by LLMs demonstrate less variation than human-written text» | contradice la versión 2026 |
| Reviriego et al., *MLWA* 18:100602, 2024 (arXiv 2308.07462) | EN, 3 datasets | GPT-3.5 «fewer distinct words»; GPT-4 «similar… in some cases even larger» | depende del modelo |
| Muñoz-Ortiz et al., *AI Review* 2024 (arXiv 2308.09067) | EN, noticias, modelos base | MTLD y STTR (segmentos de 1.000 tokens, lemas): «human texts exhibit the highest lexical diversity, closely followed by LLaMa» | humano > LLM |
| **Alonso Simón et al., RAEL 23, 2025** (doi 10.58859/rael.v23i1.666) | **ES**, ROBOT-TALK, 180 textos | TTR «a favor de los humanos… (+2,3% y +2,8%)»; densidad léxica dependiente del dominio; hápax como variable | humano > LLM (efecto pequeño) |
| arXiv 2506.01407 | EN, noticias | «Human writers use roughly twice as many different lexical entries as each LLM»; el «autor colectivo LLM» supera al humano | depende de la agregación |
| ACL SRW 2025 (homogeneización 2018→2024) | EN, noticias | MTLD 214,45→254,65; MATTR 0,88011→0,88121 (cambio «negligible») | las métricas discrepan entre sí |
| Gargova et al. 2026 (`sintaxis.md` §1) | ES/EN/BG agregado | MTLD 60,08 vs 81,95; densidad léxica 0,391 vs 0,455 | LLM > humano |

- Réplica 2026 sobre AuTexTification (arXiv 2603.15034): la diversidad
  léxica es el rasgo **no probabilístico más fuerte** (+0,035 de
  importancia por permutación), un orden de magnitud por debajo de las
  probabilidades de modelo (+0,299). Sin modelo, la señal existe pero es
  débil. AuTexTification (arXiv 2309.11285): 52.191 textos ES; mejor
  sistema 70,77 macro-F1 en español vs 80,91 en inglés; «cross-domain MGT
  detection is easier in English than in Spanish».
- Lo demás humano vs LLM: `lexico.md` §4.

---

## 2. Distribuciones de frecuencia y ley de Zipf

- **Holtzman et al. 2020** (ICLR; arXiv 1904.09751): coeficiente de Zipf
  humano = **0,93**, igual al del muestreo puro (0,93). La diferencia la
  producen la decodificación (beam/greedy aplanan el vocabulario) y la
  repetición: «Sampling with temperatures lower than 0.9 severely increase
  repetition». → Con decodificación moderna el exponente global **no
  separa** humano de LLM.
- **Findings EMNLP 2025** («Zipf's and Heaps' laws for tokens and
  LLM-generated texts»): «Heaps' and Zipf's laws only hold for
  LLM-generated texts in a narrow model-dependent» rango de temperatura.
- **arXiv 2508.17715** (Zipf de dos regímenes, 9 datasets, Llama 2 y
  Qwen2.5): los LLM tienen α₁ menor (cabeza) y «consistently larger α₂
  values in the extended vocabulary» (cola más empinada, menos palabras
  raras) «regardless of temperature»; excepción SCIDOCS. **Señal más
  prometedora sin modelo; solo medida en inglés.**
- **arXiv 2607.17228** («Literary Non-Style»): pendientes log-log por
  n-grama, humano −1,553 / −0,830 / −0,432 / −0,201 vs LLM −2,046 /
  −1,029 / −0,609 / −0,395; «For 1-grams, the curves… look very
  similar». La diferencia crece con n.
- Contraevidencia: arXiv 2407.00322, discrepancias de exponente «below
  0.03». Caso extremo: corpus de agentes Moltbook (arXiv 2602.10131),
  exponente 1,70 por plantillas y duplicación.
- **Perfil por bandas top-1k/5k en texto LLM: NO ENCONTRADO** en ningún
  idioma. Los autores revisados por Alonso Simón se contradicen («las
  máquinas utilizan palabras muy frecuentes» vs «tienden a usar palabras
  poco comunes»).
- **Densidad léxica en español (medido, RAEL)**: dependiente del dominio;
  «GPT-3.5 presenta una densidad léxica mayor en comparación con los
  humanos» en un dominio y lo contrario en artículos. Exige POS.

### Listas de frecuencia del español (licencias)
| Lista | Fuente | Licencia | Uso en proyecto Apache 2.0 |
|---|---|---|---|
| **wordfreq** (Speer): ES con Wikipedia, OpenSubtitles 2018 + SUBTLEX, NewsCrawl, GlobalVoices, Google Books, OSCAR, Twitter, Reddit; snapshot hasta 2021 (SUNSET.md, sept. 2024) | https://github.com/rspeer/wordfreq | Código Apache 2.0; **datos CC BY-SA 4.0** («may be redistributed under a Creative Commons Attribution-ShareAlike 4.0 license»); SUBTLEX con permiso de Brysbaert («credit the SUBTLEX authors») | Sí: **fichero de datos aparte** con atribución y BY-SA; exportar a JSON |
| **FrequencyWords** (Hermit Dave, OpenSubtitles) | https://github.com/hermitdave/FrequencyWords | «MIT License for code. CC-by-sa-4.0 for content.» | Sí, datos aparte con BY-SA |
| **SUBTLEX-ESP** (Cuetos et al. 2011) | https://osf.io/xp6sz/ | OSF: «Other» + `license.txt` **no leído** | ⚠️ No redistribuir hasta leerlo; vía segura: wordfreq |
| **CORPES XXI / CREA** (RAE) | https://www.rae.es/banco-de-datos/corpes-xxi | Sin licencia propia; el aviso legal de la RAE (https://www.rae.es/aviso-legal) prohíbe la «reproducción ni total ni parcial» | No redistribuir sin permiso escrito; solo consulta |
| **Corpus del Español** (Davies) | https://www.corpusdata.org/spanish.asp | De pago | No |

---

## 3. Repetición y compresibilidad

- **Welleck et al. 2019** (arXiv 1908.04319), leído en tabla: seq-rep-4
  humano = **0,005–0,006** (Wikitext-103) vs GPT-2 greedy 0,506 y MLE
  greedy 0,460. Tokens únicos: humano 17,7k vs 11,8k–13,3k. Pero «At higher
  levels of p and k… continuations contain more unique tokens than that
  of humans». → rep-n discrimina la **degeneración greedy** (modelos
  antiguos o locales mal configurados), **no los chatbots comerciales con
  muestreo**.
- **Holtzman 2020**: repetición humana 0,28 % vs ~28,94 % con beam 16
  (cifra de beam solo en resumen secundario, alphaxiv).
- ⚠️ **CORRECCIÓN del manual**: el «23 % de bigramas únicos» que citaba
  del survey 2310.14724 procede de **xFakeSci (arXiv 2308.11767)**, cuya
  frase literal es «ChatGPT contributed merely 23% of the bigram
  content»: **solapamiento de redes de bigramas con abstracts de
  PubMed**, no unicidad por texto. Dato mal citado en circulación; **no
  sirve como umbral**.
- **M4** (arXiv 2305.14902, Tabla 9): conteos de corpus sin normalizar
  (144.523 unigramas únicos humanos vs 45.275 ChatGPT en Wikipedia); no
  interpretable como tasa.
- **Shaib et al. 2024** (arXiv 2403.00553; IJCNLP 2025 demo, paquete
  Python `diversity`): CR = tamaño original / comprimido con gzip («High
  CRs imply more redundancy»); «Compression ratio for part of speech
  sequences is the score that identifies the most differences between
  human and model-generated text»; evaluado «on English texts».
  **Importante**: el CR de Shaib se calcula sobre **conjuntos concatenados
  de salidas**, no sobre un texto individual. Combinación suficiente: CR +
  self-repetition de n ≥ 4 + Self-BLEU; todas correlacionan con longitud.
- **Shaib «Syntactic templates»** (arXiv 2407.00211): CR-POS sobre la
  secuencia de etiquetas; requiere POS.
- **OpenTuringBench** (arXiv 2504.11369): definiciones operativas de
  ratio de compresión, diversidad de n-gramas y self-repetition.
- **Jiang et al. 2023** (Findings ACL, 2023.findings-acl.426): gzip + kNN
  con NCD para **clasificación temática**; no es detector de IA. Réplica
  informal crítica (Lior Sinai): no supera TF-IDF + LR.
- **PAN, baseline PPMd CBC (compresión, sin modelo)**:
  - PAN 2024 (texto emparejado): ROC-AUC 0,795, media 0,77; Binoculars
    0,972 / 0,965 (https://ceur-ws.org/Vol-3740/paper-243.pdf).
  - PAN 2025: media 0,758; Binoculars 0,818; TF-IDF SVM 0,978 en
    validación (https://pan.webis.de/clef25/pan25-web/generated-content-analysis.html).
  - **PAN 2026** (texto único, LLM imitando autores; ensayo, noticias,
    ficción): PPMd ROC-AUC 0,783, media 0,814, **FPR 0,728**, FNR 0,066.
    Binoculars (Llama-3.1): AUC 0,764, FPR 0,125, FNR 0,414. TF-IDF SVM:
    AUC 0,711, FPR 0,069, FNR 0,651. Equipo ikr3 («lexical + linguistic
    LR»): AUC 0,814 con **FPR 1,000**.
    https://pan.webis.de/clef26/pan26-web/generated-content-analysis.html
  - Lectura: sin modelo se **ordena** (AUC 0,78–0,81) pero el punto de
    corte no se transfiere. Justifica la calibración de §6.
- **ZipPy** (https://github.com/thinkst/zippy): compresión sembrada con
  corpus de IA; necesita semilla.
- **rep-n, CR o entropía medidos en español: NO ENCONTRADO.**

---

## 4. Longitud de palabra y de frase

- Frase: `sintaxis.md` §1.
- Palabra: AuTexTification usó «Average Word Length» como rasgo (arXiv
  2311.12373) sin cifras extraíbles; la survey de Terčon (arXiv
  2510.05136) lista «word length» sin cifra para español. **Cifras humano
  vs LLM en español: NO ENCONTRADO.**

---

## 5. Umbral de longitud mínima — fuentes y decisión

### Métricas
- MATTR y MTLD: mínimo 50 tokens con confianza (TAALED / Zenker & Kyle);
  MTLD estabiliza ~100 (TAALED; Koizumi). HD-D: 42 por definición. TTR
  bruto: inestable siempre.

### Detectores comerciales (fuente primaria salvo indicación)
| Herramienta | Mínimo publicado | Fuente |
|---|---|---|
| Turnitin | 300 palabras de prosa larga (máx. 30.000); subido de 150 «based on our data and testing»; «all or nothing» bajo unos cientos; soporta inglés, español, japonés y árabe | https://guides.turnitin.com/hc/en-us/articles/28477544839821 · https://helpcenter.turnitin.com/hc/en-us/articles/46468418712461 |
| GPTZero | 250 caracteres (~50 palabras) | https://gptzero.me/news/gptzero-ai-detection-benchmarking-the-industry-standard-in-accuracy-transparency-and-fairness/ |
| Originality.ai | 100 palabras (web); sin mínimo en API: «accuracy is decreased for texts below 100 words» | https://help.originality.ai/en/article/minimum-word-counts-for-scans-1lyfqtb/ |
| Copyleaks | 350 caracteres (extensión); 255 (web) | https://help.copyleaks.com/s/article/WhatistheminimumcharactercountneededforacheckwiththeAIDetector681cd27608aae |
| Winston AI | 500 caracteres (web); 300 (API); «aim for 300 words or more» | https://help.gowinston.ai/understanding-winston-ai/what-types-of-content-can-i-scan-with-winston-ai |

Conflicto: la Tabla 2 de Fraser et al. (JAIR 2025) y una reseña de GPTZero
dan otras cifras (Winston 600, GPTZero 300). Prevalecen las páginas de
cada proveedor.

### Estudios de detección vs longitud
- **Fraser, Dawkins & Kiritchenko** (arXiv 2406.15583; JAIR 82, 2025):
  Li et al. 2024, «approximately 120 words are sufficient» para
  clasificadores estadísticos y finetuned; He et al. 2024, ~200 palabras
  para ChatGPT-turbo y GPT-4; de 256 a 64 palabras, «a 10% drop in
  accuracy» con nucleus; ArguGPT: RoBERTa cae 2 % en ensayos completos y
  13 % a nivel de frase. Todo con detectores **con** modelo.
- **arXiv 2603.23146**: FN media 177 palabras vs 243 en aciertos; **FP
  media 221 vs 421**; modas 14 y 34; «detectors should apply minimum
  text-length thresholds».
- **M4**: F1 cae de 1.000 a 125 caracteres. **EnsemJudge** (chino):
  ganancia marginal por encima de ~500 caracteres. **arXiv 2608.26694**:
  bajo 500 caracteres, «FPR rises by more than an order of magnitude».
- AuTexTification (20–100 tokens): ~70 macro-F1 en español.
- **Curva precisión–longitud para métricas sin modelo en español: NO
  ENCONTRADO.**

### Decisión — FIRMADA por Antonio el 29/09/2026
| Palabras | Comportamiento | Fuentes |
|---|---|---|
| < 100 | «Texto insuficiente»: no se analiza | Originality (< 100 pierde precisión); Fraser (−10 % de 256 a 64); Koizumi/TAALED (MTLD ≥ 100; MATTR-50 sin dos ventanas); 2603.23146 (FP en textos cortos) |
| 100–299 | Análisis con aviso «resultado poco fiable»; estadística con peso reducido: solo MATTR y rep-n contra percentiles del mismo tramo | Li et al. ~120 y He et al. ~200 bastan para detectores con modelo; sin modelo son más débiles (PPMd AUC 0,78 vs 0,99) |
| ≥ 300 | Análisis completo | Turnitin 300 (con soporte de español); Winston «300 words or more»; todas las métricas estables |

Se cuentan **palabras de prosa**: excluir viñetas, tablas y código antes
de medir, como hace Turnitin (guía de Arcadia reproduciendo su doc:
https://helpdesk.arcadia.edu/hc/en-us/articles/46219290783117). Zipf por
texto solo con ≥ 1.000 tokens: **propuesta sin fuente** del módulo; no se
calcula por debajo.

---

## 6. Calibración por género y corpus de referencia

### Método (con fuente)
- La revisión de ScienceDirect (S1546221826000482) describe **MCP**: «a
  small calibration set of human-authored texts to derive multiscale
  quantiles… tailored to varying text lengths» para controlar la FPR.
  Es el patrón: **cuantiles humanos por género × tramo de longitud**.
- Propuesta del módulo (marcada por él como opinión razonada, no medida):
  estratificar por género (noticias, académico, opinión/reseña, narrativa)
  y por tramos (100–199, 200–299, 300–599, 600+); guardar percentiles
  1/5/50/95/99 por celda; marcar cuando **≥ 2 métricas independientes
  caen fuera del p1–p99 humano**; validar con textos humanos apartados
  con objetivo **FPR ≤ 5 %** (PAN 2026 da 0,73 sin calibrar). Shaib obliga
  a normalizar por longitud.
- **Tablas de referencia MTLD/MATTR por género en español: NO
  ENCONTRADAS.** Habrá que construirlas.

### Corpus abiertos en español (licencias)
| Corpus | Contenido | Licencia | Uso |
|---|---|---|---|
| **Spanish Billion Words** (Cardellino 2016) | ~1.500 M palabras: Wikipedia, Wikisource, Wikibooks, AnCora, SenSem, Europarl, OPUS, Tibidabo, IULA | **CC BY-SA 4.0** (https://crscardellino.github.io/SBWCE/); derechos de origen no depurados por el autor | Base humana pre-2022; sin etiqueta de género por documento |
| **AnCora-ES** | 500.000 palabras, periodístico | **CC BY 4.0** en Zenodo (10.5281/zenodo.4762030) y UD_Spanish-AnCora **vs GPL** en ELRA-W0326 y HF CLiC-UB: conflicto | Usar la versión Zenodo/UD (CC BY) |
| **OSCAR** | Common Crawl filtrado | Empaquetado CC0; texto sin derechos de los autores; acceso con formulario; excepción TDM (Francia) | Con cautela legal |
| **Wikipedia ES** | Enciclopédico | CC BY-SA | Un solo género |
| **CORPES XXI** | 455 M formas, todos los géneros | Aviso legal RAE: sin reproducción | Referencia manual, no corpus |
| **ROBOT-TALK** (humanos) | 765 textos, 398.501 tokens, 3 géneros, 2023–24 | **NO CONSTA**; pedir acceso a la UCM | Validar, no calibrar |
| **PAN 2024–2026** | Ensayo, noticias, ficción (EN) | «contains copyrighted material… No redistribution allowed» | Solo evaluación local |
| spanish-corpora (Cañete), CC-News, AuTexTification | — | NO VERIFICADO | Verificar antes de usar |

---

## 7. Estilometría clásica trasladable

- **PAN 2024** (https://ceur-ws.org/Vol-3740/paper-225.pdf): 43 sistemas;
  PPMd CBC 0,544; Authorship Unmasking 0,651; Binoculars 0,741; 12
  sistemas baten la mejor baseline.
- **PAN 2025**: TF-IDF SVM (top-1000 1–4-gramas) 0,978 en validación;
  Binoculars 0,877; PPMd 0,786; «7 beat the strongest baseline».
- **PAN 2026**: ver §3 (PPMd FPR 0,728; ikr3 FPR 1,000).
- **arXiv 2508.16385**: ChatGPT-3.5 muestra rasgos de autoría
  estilométrica no humanos (300 textos EN, LOCNESS y Wikipedia).
- **McGovern et al. 2024** (arXiv 2405.14057): GradientBoost con
  n-gramas de caracteres, palabras y POS compite con redes profundas
  (Outfox 0,877/0,936/0,920). No releído por el módulo.
- **PUCP-Metrix** (arXiv 2511.17402): 182 métricas para español, evaluado
  en detección de texto generado; licencia NO CONSTA. **Leer entero en el
  punto 3.** **esTS/pyests**: silabeo por reglas, legibilidad, diversidad
  (TTR, MATTR, MSTTR, MTLD, HD-D, Simpson, Yule, entropía, Zipf, Heaps),
  morfología con spaCy. Ambos Python; referencias de implementación.

---

## 8. Falsos positivos

- **Umbral de fábrica**: PPMd FPR 0,728 y ikr3 FPR 1,000 (PAN 2026).
- **Textos cortos**: 2603.23146 (FP media 221, moda 34); 2608.26694 (FPR
  ×10 bajo 500 caracteres). Resuelto por §5.
- **Vocabulario restringido / técnico**: 2603.23146: «constrained
  vocabularies can resemble AI-generated patterns». Winston declara no
  aptos «Boilerplate legal text», tablas y datos estructurados; Turnitin
  excluye listas, viñetas, código, poesía.
- **Traducción**: Winston: «translation alone can significantly alter AI
  detection scores».
- **No nativos**: en Kendro 2026 la diversidad humana **no difería entre
  L1 y L2** (tranquilizador para diversidad léxica). Para detectores con
  modelo: Liang 2023, ~60 % de FP en ensayos TOEFL (`lexico.md` §5).
- **Longitud como confusor**: Shaib 2024; Fraser 2024 (detector sesgado
  por longitud si el corpus no la controla).

---

## 9. Herramientas (inventario con licencia; no decisión)

| Paquete | Licencia | Español | Nota |
|---|---|---|---|
| **silabea** (fork de silabajs) | MIT | Silabeador por reglas, tónica, hiatos, diptongos | https://github.com/javierarce/silabea — sin publicaciones desde hace ~8 años |
| **stopwords-es / stopwords-iso** | MIT | Sí | «free to use this collection any way you like»; fuentes subyacentes NO CONSTA |
| **es-compromise** | MIT | POS por reglas | «work-in-progress» (https://github.com/nlp-compromise/es-compromise); compromise núcleo solo inglés |
| **natural** | MIT | `PorterStemmerEs` | incluye licencia WordNet y un stemmer alemán BSD-4; empaquetado en navegador no verificado |
| **text-readability** (clearnote01) | ISC (npm) / MIT (repo) | NO CONSTA si trae Fernández-Huerta o Szigriszt | port de textstat centrado en inglés |
| lexical-diversity (npm), syllable-es, hyphenopoly | NO CONSTA | — | no verificados |
| **wordfreq**, **FrequencyWords** | Apache 2.0 / MIT código; **CC BY-SA 4.0 datos** | Sí | exportar listas a `/data/*.json` con licencia y atribución aparte |
| TAALED, lexical-diversity (Python), textstat, esTS, PUCP-Metrix | NO CONSTA | Referencias de fórmulas | Python |
| **CompressionStream** (API nativa del navegador) | — | — | gzip/deflate sin librería |

Hallazgo para el punto 3-4: **no hay librería JS/TS madura de estadística
del español**; el motor implementa las fórmulas (§1) con sus fuentes y toma
de fuera solo silabeo (silabea), POS (es-compromise, con reservas) y
listas de frecuencia (datos BY-SA aparte del código Apache).

---

## 10. CANDIDATAS A REGLA — familia estadística

| # | Métrica | Idioma documentado | Evidencia | Dirección | Necesita | Mín. palabras | Riesgo FP |
|---|---|---|---|---|---|---|---|
| E1 | MATTR (ventana 50) contra percentiles del género × tramo | EN (Kendro η²p 0,571; Zenker & Kyle); ES solo agregado | Fuerte en estabilidad; dirección contradictoria | **Bidireccional** (distancia al rango humano) | conteo | 100 (≥ 2 ventanas); fiable ≥ 300 | Medio |
| E2 | MTLD (0,72) contra percentiles | EN | Contradictoria (ACL SRW) | Bidireccional | conteo | 300 | Medio |
| E3 | HD-D (42) | EN | Fuerte en estabilidad | Bidireccional | conteo + combinatoria | 50 | Medio |
| E4 | Densidad léxica (contenido/total) | **ES** (RAEL, dependiente del dominio); agregado (Gargova) | Débil, depende del dominio | Variable | POS o lista de palabras función | 300 | Alto |
| E5 | Repetición de n-gramas (rep-3/4, diversidad de n-gramas) | EN (Welleck: seq-rep-4 humano 0,005; solo greedy) — **el «23 %» retirado** | Fuerte solo para degeneración greedy | LLM ↑ (degeneración) | conteo | 300 | Bajo para bucles; alto en técnico y listas |
| E6 | Self-repetition n ≥ 4 entre frases | EN (Shaib 2024) | Media | LLM ↑ | conteo | 200 | Medio |
| E7 | Ratio de compresión gzip (texto individual) | EN a nivel de conjunto (Shaib); PAN PPMd FPR 0,728 | Moderada; correlaciona con longitud | LLM más comprimible | `CompressionStream` | 300 + base por longitud | **Alto** |
| E8 | Perfil de bandas de frecuencia | Sin fuente LLM | Sin fuente | — | frec | 300 | Alto |
| E9 | Ratio de palabras función | Anecd. | Anecdótica | ↕ | lista | 100 | Medio |
| E10 | Exponente de Zipf global | EN (Holtzman 0,93 = muestreo; 2407.00322 < 0,03) | **No separa** con decodificación moderna | — | conteo | 1.000 (sin fuente) | Alto |
| E11 | Yule's K / Herdan C / hápax | Fórmulas (Tweedie & Baayen; quanteda); hápax variable en RAEL | Teórica; K constante con N | NO CONSTA | conteo del espectro de frecuencias | 300 | Medio (K) / alto (C) |
| E12 | Índices de legibilidad (FH, IFSZ) | **ES** fórmulas | Contexto | — | sil | 100 | No es señal |
| **E13** | TTR crudo por tramos de longitud fija | **ES** (RAEL: +2,3–2,8 % humano) | Débil | Humano > LLM | conteo | solo con longitud fija por tramo | Alto (depende de N) |
| **E14** | Zipf α₂ (cola del vocabulario extendido) | EN (arXiv 2508.17715, 9 datasets) | Moderada, consistente, «regardless of temperature» | LLM cola más empinada | conteo + ajuste log-log | NO CONSTA (≥ 1.000 propuesto) | Alto en textos cortos |
| **E15** | Pendiente Zipf de n-gramas (n ≥ 2) | EN (arXiv 2607.17228, literario) | Un estudio | LLM más empinada | conteo de n-gramas | NO CONSTA | Medio |
| **E16** | CR de secuencias POS | EN (Shaib: mejor discriminador) | Moderada | LLM ↑ | POS (es-compromise) | 300 | Medio |

**Lectura para el paquete v1:**
- **Contexto, no señal** (se muestran con su percentil, no puntúan salvo
  desviación extrema calibrada): E1, E2, E3, E12, E13.
- **Señal de peso medio, calibrada por género × tramo, bidireccional
  donde toque**: E4 (con POS), E5, E6, E16 (con POS).
- **Peso bajo o desactivada hasta validar FPR ≤ 5 %**: E7, E14, E15.
- **Fuera de la v1**: E8, E9, E10, E11 (sin cifra humano vs LLM).
- Regla general: **ninguna con umbral absoluto**; todas contra percentiles
  humanos (§6); marcar cuando ≥ 2 métricas independientes caen fuera del
  rango.

---

## 11. Hallazgos que afectan a decisiones firmadas

- **Umbral 100/300**: el módulo llega a la misma propuesta por vías
  independientes. Añade «contar solo prosa» (excluir viñetas, tablas,
  código): requisito para el esquema/motor del punto 3-4.
- **Decisión 2 (POS)**: refuerza; E4, E16 y la densidad léxica española lo
  necesitan. es-compromise (MIT) es candidata, marcada «work-in-progress».
- **Nueva regla de diseño para el punto 3-4** (propuesta del módulo,
  opinión razonada): calibración por percentiles p1–p99 humanos por
  género × tramo; ≥ 2 métricas fuera para marcar; validación con FPR ≤ 5 %.
  No cambia ninguna decisión firmada; se lleva al plan como criterio de
  cierre del punto 5 (paquete v1).
- **Licencias**: las listas de frecuencia son CC BY-SA 4.0 → van como
  ficheros de datos aparte del código Apache 2.0, con atribución. Afecta
  al NOTICES y a la estructura del repo (`/data/`).

---

## 12. Huecos (buscado y no encontrado)

- rep-n, ratio de compresión, entropía y exponente de Zipf medidos en
  español humano vs LLM.
- Perfil de bandas top-1k/5k en texto LLM (cualquier idioma).
- Longitud de palabra y su varianza humano vs LLM en español.
- Tablas de referencia MTLD/MATTR por género en español.
- Curva precisión–longitud para métricas sin modelo.
- Contenido de `license.txt` de SUBTLEX-ESP; condiciones de CORPES XXI;
  licencias de ROBOT-TALK, AuTexTification, PUCP-Metrix, esTS, TAALED.
- Licencias de lexical-diversity (npm), syllable-es, hyphenopoly; si
  text-readability trae fórmulas del español.
- Fuente primaria del «≥ 1.000 tokens para Zipf»: no existe.
- Relectura primaria por el módulo de Zenker & Kyle, Koizumi, Bestgen,
  McGovern, PUCP-Metrix, esTS, OpenTuringBench, EnsemJudge, 2603.23146 y
  2608.26694: NO CONSTA (se mantienen de la pasada manual).
- Caducidad: evidencia inglesa con modelos 2023–2025; los modelos nuevos
  cambian la dirección (Kendro 2026); los mínimos comerciales son
  declaraciones de producto.
