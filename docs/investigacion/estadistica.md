# Investigación — Familia ESTADÍSTICA

> Punto 2 del `PLAN-RADIOGRAFIA.md`. Investigación realizada el 29/09/2026
> **a mano por la conversación de estrategia con búsqueda y lectura web**
> (el módulo de investigación no estuvo disponible). Menos amplia que las
> tres anteriores; los huecos son más y están declarados. Cada afirmación
> lleva su fuente con URL. Lo ya medido en `lexico.md` (§4, diversidad) y
> `sintaxis.md` (§1, longitud de frase) se cita por referencia, no se
> repite.
>
> Regla de esta familia: **sin fuente no hay candidata.**
>
> Esta familia fija dos decisiones del plan: el **umbral de longitud
> mínima** (§5) y el **método de calibración por género** (§6).

## Resumen

Las métricas de texto entero sin modelo (diversidad léxica, repetición,
compresibilidad, perfil de frecuencias) tienen tres verdades incómodas con
fuente:

1. **Todas dependen de la longitud.** Solo MATTR, MTLD y HD-D son estables,
   y a partir de ~50–100 tokens (Zenker & Kyle 2021; Koizumi 2012; McCarthy
   & Jarvis 2010). El TTR bruto no se usa.
2. **La dirección del efecto humano/LLM no es fija** (ya visto en
   `lexico.md` §4): depende de modelo, temperatura y del grupo humano de
   comparación. En español, Gargova 2026 mide MTLD 60,08 humano vs 81,95
   LLM y densidad léxica 0,391 vs 0,455 (agregado de tres idiomas; ver
   `sintaxis.md` §1).
3. **Las baselines estadísticas puras rinden por debajo de las neuronales
   pero no son azar**: en PAN 2024, la compresión PPMd da 0,544 de media
   (Binoculars 0,741); en PAN 2025, 0,758 (Binoculars 0,818; TF-IDF SVM
   0,978 en validación). Un SVM sobre n-gramas TF-IDF **sí** compite.

Consecuencia para el motor: esta familia da el **contexto de calibración**
(género, longitud) y unas pocas señales de peso medio (repetición de
n-gramas, ratio de compresión, MTLD/MATTR contra base del género). Nunca
veredicto.

**Propuesta de umbral de longitud mínima (§5)**: menos de 100 palabras →
«texto insuficiente», sin análisis; 100–299 → análisis con aviso «resultado
poco fiable»; ≥ 300 → análisis completo. Con fuentes en §5. **Decisión de
Antonio.**

---

## 1. Diversidad léxica: índices, fórmulas y estabilidad

### Fuentes originales
- **MTLD, vocd-D, HD-D**: McCarthy & Jarvis, *Behavior Research Methods*
  42(2):381–392, 2010, DOI 10.3758/BRM.42.2.381.
  https://www.mendeley.com/catalogue/5e75898b-ba01-36ae-9b96-b465302e2845/
  MTLD = «the mean length of sequential word strings in a text that
  maintain a given TTR value» (factor 0,72; algunas implementaciones usan
  0,720 o 0,732). HD-D: para cada tipo, probabilidad de aparecer en una
  muestra de **42 tokens**; suma de probabilidades (McCarthy & Jarvis 2007;
  Bestgen 2023 recomienda mantener 42:
  https://arxiv.org/pdf/2307.04626).
  Conclusión de los autores: usar MTLD, vocd-D (o HD-D) y Maas juntos, no
  un solo índice.
- **MATTR**: Covington & McFall 2010, ventana móvil (típicamente 50
  tokens). Referencia vía TAALED: https://github.com/LCR-ADS-Lab/TAALED
- **Yule's K, Herdan C, hapax**: **no buscados en esta pasada** (hueco).
  esTS (Python, §9) los implementa «por las fórmulas publicadas».

### Estabilidad frente a la longitud
- **Zenker & Kyle 2021**, *Assessing Writing* 47:100505,
  https://www.sciencedirect.com/science/article/abs/pii/S1075293520300660
  4.542 ensayos L2. «MATTR and two versions of MTLD are highly stable
  indices for analyzing short texts». «MATTR performs particularly well,
  maintaining a high degree of stability across all text lengths». HD-D:
  correlación con longitud r = 0,064 (negligible). MTLD-MA-Wrap y Maas
  inestables en las longitudes más cortas.
- **TAALED** (herramienta de Kyle), tabla de recomendación:
  «Use with confidence: MATTR (50), MTLD-Original (50)» — mínimo 50
  tokens; «MTLD values stabilized at roughly 100 tokens».
- **Koizumi 2012**, *Vocabulary Learning and Instruction* 1(1):
  http://www.vli-journal.org/issues/01.1/issue01.1.10.pdf
  Textos de 50–200 tokens: «MTLD is least affected by text length, but
  that even this measure of LD should be used with texts of at least 100
  tokens».
- **Bestgen 2023** («The twofold length problem», arXiv 2307.04626): HD-D
  es el menos afectado globalmente, seguido de MATTR y MTLD; para
  estimación local, MATTR y MTLD.
- **Treffers-Daller (Reading)**: recorta a 200 tokens para comparar; MTLD
  validado por McCarthy & Jarvis en 200–666 palabras.
  https://centaur.reading.ac.uk/54410/3/Backtobasics_accepted.pdf

### Humano vs LLM
- Ya en `lexico.md` §4 (Reviriego 2024; Martínez 2024; Kendro 2026;
  Fredrick & Craven 2025; Liang 2023). No se repite.
- Español: Gargova et al. 2026 (`sintaxis.md` §1): MTLD 60,08 vs 81,95;
  densidad léxica 0,391 vs 0,455; agregado de tres idiomas.
- **Nada nuevo medido en español en esta pasada** (hueco).

---

## 2. Distribuciones de frecuencia y listas del español

### Listas abiertas (inventario con licencia)
| Lista | Fuente | Licencia | Uso en proyecto Apache 2.0 |
|---|---|---|---|
| **wordfreq** (Speer) — español, 7 fuentes (Wikipedia, subtítulos, noticias, libros, web, Twitter, Reddit), snapshot ~2021 | https://github.com/rspeer/wordfreq | Código Apache 2.0; **datos CC BY-SA 4.0**; SUBTLEX incluido con permiso de Brysbaert («credit the SUBTLEX authors», «freely available data») | Sí, con atribución y ShareAlike sobre los datos derivados. Es Python: habría que **exportar** la lista a JSON |
| **FrequencyWords** (Hermit Dave, OpenSubtitles 2016/2018) — `es_50k.txt`, formato `palabra frecuencia` | https://github.com/hermitdave/FrequencyWords | Código MIT; **contenido CC BY-SA 4.0** | Sí, con atribución a OpenSubtitles y ShareAlike |
| **SUBTLEX-ESP** (Cuetos, Glez-Nosti, Barbón & Brysbaert 2011), 41 M palabras de subtítulos 1990–2009 | https://osf.io/xp6sz/ · https://eric.ed.gov/?id=EJ954706 | En OSF figura «Other» con un `license.txt` (**no leído**); el artículo en ResearchGate es CC BY-NC-ND | ⚠️ NO CONSTA sin leer el license.txt; la vía segura es wordfreq |
| **CREA / CORPES XXI** (RAE) | https://www.rae.es/banco-de-datos/corpes-xxi — CORPES 1.5 (junio 2026): ~420.000 documentos, 455 M formas | Consulta en línea; **descarga masiva no ofrecida**; condiciones de uso no consultadas | No como base descargable; sí como referencia manual |
| **Corpus del Español** (Davies, Web/Dialects, 2.000 M palabras, 21 países) | https://www.corpusdata.org/spanish.asp | **De pago** («when you purchase the data») | No |

### Perfil de bandas, Zipf, densidad léxica
- Densidad léxica humano vs LLM: solo el dato agregado de Gargova
  (`sintaxis.md`). Perfil de bandas (top-1.000 / top-5.000 / fuera): **no
  encontrado ningún estudio LLM que lo mida** (hueco). Exponente de Zipf en
  LLM vs humano: **no buscado** (hueco).

---

## 3. Repetición y compresibilidad

- **Survey de detección** (Wu et al., arXiv 2310.14724):
  https://arxiv.org/pdf/2310.14724 — cita un método de 2021 basado en
  n-gramas de orden alto repetidos, y un hallazgo: «only 23% of bigrams in
  texts generated by ChatGPT are unique»; su algoritmo identificó 98 de 100
  artículos académicos escritos por LLM. (El survey no da la fuente
  primaria en el fragmento leído; ⏳ PENDIENTE de localizarla.)
- **Shaib et al., «Standardizing the measurement of text diversity»**,
  arXiv 2403.00553: https://arxiv.org/html/2403.00553v2
  «compression ratio—a measure of document compression relative to
  original size—is a fast, easy to compute score that is sufficient to
  capture the information in all token/type ratio related alternatives».
  ⚠️ «compression ratios (and all scores considered) are moderately to
  strongly correlated with text length». Combinación suficiente: ratio de
  compresión + self-repetition de n-gramas largos (n ≥ 4) + Self-BLEU.
- **Shaib et al., «Syntactic templates»**, arXiv 2407.00211:
  https://arxiv.org/pdf/2407.00211 — CR-POS: ratio de compresión gzip sobre
  la secuencia de etiquetas POS; «Higher compression ratios imply more
  redundancy». Requiere POS.
- **OpenTuringBench** (arXiv 2504.11369): https://arxiv.org/pdf/2504.11369
  Usa como estadísticos: ratio de compresión, diversidad de n-gramas
  (únicos/total para n = 1..k), self-repetition (n-gramas de una frase que
  reaparecen en las demás). Definiciones operativas reutilizables.
- **rep-n en texto humano** (vía arXiv 2504.12608, citando a Welleck et
  al.): rep-2, rep-3, rep-4 humanos = 3,92, 0,88, 0,28. Cifras de
  referencia para inglés; en español, **nada** (hueco).
- **ZipPy** (Thinkst): https://github.com/thinkst/zippy — detección por
  ratio de compresión (LZMA/zlib/Brotli) con diccionario sembrado con
  texto de IA. Necesita un corpus semilla; no es una regla sin datos.
- **Holtzman 2020, Jiang 2023 (compresores)**: **no leídos** (hueco).

---

## 4. Longitud de palabra y de frase

- Longitud de frase y su dispersión: ya en `sintaxis.md` §1 (Muñoz-Ortiz,
  Herbold, ROBOT-TALK, Gargova, Zamaraeva). Sin cifras nuevas aquí.
- Longitud de palabra en sílabas y caracteres humano vs LLM: **no
  encontrado** (hueco). Solo indirectamente vía índices de legibilidad
  (`sintaxis.md` §8).

---

## 5. Umbral de longitud mínima — fuentes y propuesta

### Lo que dicen las métricas
- MATTR y MTLD: mínimo **50 tokens** con confianza (TAALED / Zenker & Kyle
  2021); MTLD estabiliza «at roughly 100 tokens»; Koizumi 2012: «at least
  100 tokens». McCarthy & Jarvis validaron en 100–2.000 tokens (Koizumi:
  «previous studies on D and MTLD examined the impact of length of texts
  of 100 tokens or more»).
- HD-D: muestra de 42 tokens por definición; estable en Zenker & Kyle.
- TTR bruto: inestable siempre; no se usa.

### Lo que dicen los detectores
- **Turnitin** (FAQ oficial):
  https://guides.turnitin.com/hc/en-us/articles/28477544839821-Turnitin-s-AI-writing-detection-capabilities-FAQ
  «Increased the minimum word count from 150 to 300 words» — «Based on our
  data and testing». Máximo 30.000. Solo prosa larga: no listas, tablas,
  código ni respuestas cortas. Advertencia (vía theairankings.com, citando
  la FAQ): en documentos de unos cientos de palabras la predicción es
  «mostly all or nothing».
- **GPTZero**: el texto pegado «must have more than 250 characters»
  (TechRepublic, secundaria:
  https://www.techrepublic.com/article/how-to-use-gptzero-check-ai-generated-text/).
  Fuente primaria no localizada.
- Originality, Copyleaks, Winston: **no buscados** (hueco).

### Lo que dicen los estudios de detección vs longitud
- **arXiv 2603.23146** («Why AI-generated text detection fails»,
  https://arxiv.org/html/2603.23146v2): falsos negativos con media de 177
  palabras frente a 243 en aciertos; **falsos positivos con media de 221
  palabras frente a 421 en verdaderos negativos**; modas de 14 y 34
  palabras. «detectors should apply minimum text-length thresholds».
- **Fraser et al. 2024** (arXiv 2406.15583, https://arxiv.org/pdf/2406.15583):
  los métodos estadísticos y estilísticos «require on the order of at
  least 100 words for accurate classification».
- **M4** (arXiv 2305.14902): F1 cae al bajar de 1.000 a 125 caracteres.
- **EnsemJudge** (arXiv 2603.27949, chino): la ganancia por longitud se
  vuelve marginal por encima de ~500 caracteres.
- **arXiv 2608.26694**: con documentos < 500 caracteres, «FPR rises by
  more than an order of magnitude».
- AuTexTification 2023, textos de 20–100 tokens: ~70 macro-F1 en español
  (`sintaxis.md` §5).

### Propuesta (para decisión de Antonio)
| Palabras | Comportamiento | Fuente que lo sostiene |
|---|---|---|
| < 100 | «Texto insuficiente»: no se analiza | Fraser (≥ ~100 palabras); Koizumi (MTLD ≥ 100 tokens); 2603.23146 (FP concentrados en textos cortos) |
| 100–299 | Se analiza con aviso «resultado poco fiable»; familia estadística con peso reducido o desactivada | Turnitin subió de 150 a 300 «based on data»; «all or nothing» bajo unos cientos |
| ≥ 300 | Análisis completo | Turnitin 300; TAALED/Zenker & Kyle (todas las métricas estables) |

[PROPIO] la partición en tres tramos; cada frontera tiene fuente. Contar
**palabras**, no tokens de subword, porque las fuentes de diversidad
léxica hablan de tokens-palabra.

---

## 6. Calibración por género y corpus de referencia

### Corpus abiertos en español (inventario con licencia)
| Corpus | Contenido | Licencia | Sirve como base humana pre-2022 |
|---|---|---|---|
| **Spanish Billion Words** (Cardellino 2016) | ~1.500 M palabras: Wikipedia ES, Wikisource, Wikibooks, AnCora, SenSem, Europarl, OPUS, Tibidabo, IULA | **CC BY-SA 4.0** (https://crscardellino.github.io/SBWCE/ · https://huggingface.co/datasets/crscardellino/spanish_billion_words) | Sí: fechado 2016, mezcla enciclopédico + parlamentario + técnico; **sin etiqueta de género por documento** |
| **spanish-corpora** (Cañete, 3.000 M) | Compilación en Zenodo | Repo MIT; licencias de cada subcorpus NO CONSTA | Solo tras revisar cada fuente |
| **OSCAR** (Common Crawl 2018) | Web filtrada por idioma | Empaquetado CC0; el texto es Common Crawl sin derechos de los autores de OSCAR; acceso con formulario; excepción TDM en Francia (https://huggingface.co/datasets/oscar-corpus/oscar) | Con cautela legal; género = «web» sin etiqueta |
| **Wikipedia ES** (dumps) | Enciclopédico | CC BY-SA (parte de SBWC) | Sí, un solo género |
| **AnCora-ES** | 500.000 palabras, periodístico | NO CONSTA en esta pasada | Género prensa, pequeño |
| **CORPES XXI** | 455 M formas, todos los géneros y países, hasta 2026 | Consulta en línea, sin descarga | Como referencia manual de frecuencias, no como corpus de calibración |
| **ROBOT-TALK** (humanos) | 3 géneros, 2023–25 | NO CONSTA (`sintaxis.md` §5) | Solo si la UCM lo cede; mejor para **validar** que para calibrar |
| **Corpus del Español** (Davies) | 2.000 M, 21 países | De pago | No |

### Método
- Ningún trabajo encontrado que publique **tablas de referencia de
  MTLD/MATTR por género en español** (hueco).
- Método [PROPIO, sobre fuentes]: por género, calcular la distribución de
  cada métrica en muestras humanas de ≥ 300 palabras; umbral = percentil
  (p95 o p05 según dirección) o z-score contra media y DT del género;
  publicar la tabla en el catálogo con fecha y corpus. Shaib 2024 obliga a
  **normalizar por longitud** o a comparar solo textos de longitud
  parecida, porque compresión y diversidad correlacionan con longitud.

---

## 7. Estilometría clásica trasladable

- **PAN 2024, Voight-Kampff** (Bevendorff et al.,
  https://ceur-ws.org/Vol-3740/paper-225.pdf ·
  https://pan.webis.de/clef24/pan24-web/generated-content-analysis.html):
  43 sistemas (30 participantes + 13 baselines). Baselines sin modelo:
  **PPMd Compression-based Cosine** (Sculley & Brodley 2006; Halvani 2017)
  media 0,544; **Authorship Unmasking** 0,651 (en otra tabla). Binoculars
  (Falcon 7B) 0,741. «Twelve of the systems beat the best baseline».
- **PAN 2025** (https://pan.webis.de/clef25/pan25-web/generated-content-analysis.html):
  baselines en validación: **TF-IDF SVM** (top-1000 1–4-gramas) mean
  0,978; Binoculars 0,877; PPMd 0,786 (ROC-AUC). En test: Binoculars 0,818,
  PPMd 0,758; «7 beat the strongest baseline (TF-IDF SVM)». El overview
  llama a la compresión «a more conservative lower baseline».
- **PAN 2026** (https://pan.webis.de/clef26/pan26-web/generated-content-analysis.html):
  PPMd mean 0,814 pero **FPR 0,728**; Binoculars mean 0,738, FPR 0,125.
  → La compresión detecta con muchísimos falsos positivos.
- **McGovern et al., «Your LLMs are leaving fingerprints»** (arXiv
  2405.14057, https://arxiv.org/pdf/2405.14057): un GradientBoost con
  n-gramas de caracteres, palabras y POS compite con redes profundas en
  cinco datasets (Outfox: 0,877 humano, 0,936 ChatGPT, 0,920 Claude).
- **PUCP-Metrix** (Villegas & Sobrevilla, PUCP, arXiv 2511.17402,
  https://arxiv.org/html/2511.17402v2): **182 métricas lingüísticas para
  español** (diversidad, complejidad, cohesión, legibilidad), evaluado en
  detección de texto generado «showing competitive performance compared to
  an existing repository and strong neural baselines». Python; licencia
  NO CONSTA. **Es la referencia española más cercana a este proyecto** y
  hay que leerlo entero en el punto 3 (⏳ PENDIENTE).
- IberAuTexTification 2024 baselines superficiales: `sintaxis.md` §5.

---

## 8. Falsos positivos

- **Textos cortos**: 2603.23146 (FP media 221 palabras; moda 34);
  2608.26694 (FPR ×10 bajo 500 caracteres). Resuelto por el umbral de §5.
- **Vocabulario restringido / técnico**: 2603.23146: «false positives in
  technical and domain-specific texts reveal that constrained vocabularies
  can resemble AI-generated patterns».
- **No nativos**: Liang 2023 (`lexico.md` §5): léxico limitado → baja
  perplejidad/diversidad → marcado como IA.
- **Compresión**: PAN 2026, FPR 0,728 de la baseline PPMd.
- **Longitud como confusor**: Shaib 2024, todas las métricas de diversidad
  correlacionan con longitud; Fraser 2024: si el corpus de entrenamiento
  no controla longitud, el detector «tends to misclassify longer
  human-written text as AIGT».
- Recetas, jurídico, listas: sin fuente específica (hueco); cubierto por
  «vocabulario restringido».

---

## 9. Herramientas (inventario, no decisión)

| Herramienta | Qué hace | Lenguaje | Licencia | Estado |
|---|---|---|---|---|
| **silabea** (fork de silabajs, Cofré/Arce) | Silabeo del español por reglas, tónica, hiatos, diptongos | JS (npm `@javier/silabea`) | MIT | https://npmjs.com/package/silabea — sirve para Fernández-Huerta/IFSZ en navegador |
| **TAALED** (Kyle) | MATTR, MTLD (varias), HD-D, con recomendaciones de mínimo | Python | NO CONSTA | Referencia de implementación |
| **lexical-diversity** (Python, jennafrens) | TTR, root, log, Maas, MSTTR, MATTR, HD-D, MTLD | Python | NO CONSTA | Referencia de fórmulas |
| **textstat** | Fernández-Huerta, Szigriszt-Pazos, Gutiérrez de Polini, Crawford para español | Python | NO CONSTA | Referencia de fórmulas |
| **esTS / pyests** | Estadística completa del español: silabeo por reglas, legibilidad (FH, IFSZ+INFLESZ, µ, SOL, LIX, RIX), diversidad (TTR, MATTR, MSTTR, MTLD, HD-D, Simpson, Yule, entropía, Zipf, Heaps), morfología con spaCy | Python | NO CONSTA | https://pypi.org/project/pyests/ — la referencia más completa en español; **portar fórmulas a TS** |
| **PUCP-Metrix** | 182 métricas español | Python | NO CONSTA | Ver §7 |
| **wordfreq** | Frecuencias español | Python | Apache 2.0 + CC BY-SA datos | Exportar lista a JSON |
| **ZipPy** | Compresión sembrada | Python | NO CONSTA | Concepto reutilizable |
| text-readability (JS), lexical-diversity (npm), stopwords-es, compromise (¿es?), natural | — | JS | — | **No verificados en esta pasada** (hueco) |

Hallazgo para el punto 3-4: **no existe una librería JS/TS madura de
estadística del español**; todo lo bueno está en Python (esTS,
PUCP-Metrix, TAALED). El motor tendrá que **implementar las fórmulas** (con
sus fuentes) y usar solo silabeo (silabea, MIT) y listas de frecuencia
exportadas (wordfreq/FrequencyWords, CC BY-SA con atribución).

---

## 10. CANDIDATAS A REGLA — familia estadística

| # | Métrica | Idioma documentado | Evidencia | Dirección LLM | Necesita | Mín. palabras | Riesgo FP |
|---|---|---|---|---|---|---|---|
| E1 | MATTR (ventana 50) contra base del género | Inglés (Zenker & Kyle; TAALED); español solo agregado (Gargova) | Fuerte en estabilidad; dirección inconsistente | **Inconsistente** (ver lexico §4) | Conteo | 50 (100 recomendado) | Alto: no nativos, técnico |
| E2 | MTLD contra base del género | Idem | Idem | Inconsistente | Conteo | 100 | Alto |
| E3 | HD-D (42) | Inglés | Fuerte en estabilidad | Inconsistente | Conteo + combinatoria | 50 | Alto |
| E4 | Densidad léxica (contenido/total) | Español agregado (Gargova 0,391 vs 0,455) | Media | LLM mayor | Lista de palabras función | 100 | Medio: académico denso |
| E5 | Repetición de n-gramas (rep-3, rep-4; diversidad de n-gramas) | Inglés (survey 2310.14724: 23 % bigramas únicos; OpenTuringBench) | Media | LLM mayor | Conteo | 100 | Medio: recetas, jurídico, instrucciones |
| E6 | Self-repetition de n-gramas ≥ 4 entre frases | Inglés (Shaib 2024) | Media | LLM mayor | Conteo | 200 | Medio |
| E7 | Ratio de compresión (deflate/gzip en navegador) | Inglés (Shaib 2024; PAN: PPMd 0,544–0,814 con FPR 0,728) | Media; correlaciona con longitud | LLM mayor (más comprimible) | Conteo (API `CompressionStream`, sin librería) | 300 y normalizar por longitud | **Alto** (PAN 2026 FPR 0,728) |
| E8 | Perfil de bandas de frecuencia (top-1k / top-5k / fuera) | Sin fuente LLM | Sin fuente | — | Lista de frecuencias (wordfreq/FrequencyWords) | 300 | Alto |
| E9 | Ratio de palabras función | Sin fuente LLM directa (Muñoz-Ortiz PRON/AUX en sintaxis) | Anecdótica | Inconsistente | Lista cerrada | 100 | Medio |
| E10 | Exponente de Zipf | Sin fuente en esta pasada | Sin fuente | — | Conteo | 500+ | Alto |
| E11 | Yule's K / Herdan / hapax | Sin fuente LLM | Sin fuente | — | Conteo | 200 | Alto |
| E12 | Índices de legibilidad (FH, IFSZ) | Español (fórmulas validadas; no como detector) — `sintaxis.md` §8 | Contexto | — | Silabeador | 100 | No es señal |

**Lectura para el paquete v1:**
- **Contexto, no señal**: E1, E2, E3, E12. Se muestran («MATTR 0,71; base
  del género 0,68 ± 0,04») y sirven para explicar, no puntúan salvo
  desviación extrema calibrada.
- **Señal de peso medio, con calibración por género**: E4, E5, E6.
- **Señal de peso bajo o desactivada hasta validar**: E7 (FPR
  documentado), E9.
- **Fuera de la v1** (sin fuente): E8, E10, E11.
- Todo condicionado al umbral de §5.

---

## 11. Huecos (buscado y no encontrado, o no buscado en esta pasada)

- Fórmulas y fuentes originales de Yule's K, Herdan C, hapax ratio.
- Exponente de Zipf humano vs LLM.
- Perfil de bandas de frecuencia en texto LLM.
- rep-n y compresión **en español**: ninguna cifra.
- Fuente primaria del «23 % de bigramas únicos» citado por el survey.
- Holtzman 2020; Jiang et al. 2023 (compresores): no leídos.
- Mínimos publicados de Originality, Copyleaks, Winston; fuente primaria
  del mínimo de GPTZero.
- Tablas de referencia MTLD/MATTR por género en español.
- Licencias: SUBTLEX-ESP (license.txt no leído), AnCora, spanish-corpora
  por subcorpus, PUCP-Metrix, esTS, TAALED, textstat.
- Condiciones de uso de CORPES XXI.
- Librerías JS: text-readability, lexical-diversity (npm), stopwords-es,
  compromise/natural para español: no verificadas.
- Longitud de palabra humano vs LLM en español.
- Nada nuevo medido en español para diversidad léxica más allá de lo ya
  citado en léxico y sintaxis.
- **Caducidad y método**: esta pasada es manual y más estrecha que las
  tres anteriores; conviene relanzar la investigación con el módulo cuando
  vuelva a estar disponible y fusionar lo que aporte.
