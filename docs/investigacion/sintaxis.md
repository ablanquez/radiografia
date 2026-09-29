# Investigación — Familia SINTAXIS

> Punto 2 del `PLAN-RADIOGRAFIA.md`. Investigación realizada el 29/09/2026
> con el módulo de investigación de Claude (barrido multi-fuente) y redactada
> por la conversación de estrategia. Cada afirmación lleva su fuente con URL.
> Lo no verificado se marca. Lo buscado y no encontrado va en «Huecos».
>
> Regla de esta familia: **sin fuente no hay candidata.**
>
> ⚠️ Nota de método: un primer borrador de este documento se redactó sin
> fuentes abiertas y se retiró antes de escribirlo. Este es el segundo, y el
> único válido: sale del informe con URL leídas.

## Resumen

En español solo hay **un** marcador sintáctico medido y robusto: los LLM
escriben **más oraciones por texto y más puntos** (ROBOT-TALK, UCM, 180
textos, GPT-3.5 y GPT-4). El resto de rasgos útiles tiene cifras solo en
inglés: menor dispersión de la longitud de frase, cláusulas de participio
presente (2–5×), nominalizaciones (1,5–2×), coordinación de sintagmas (1,9×)
y **menos** pasiva sin agente. Trasladables al español como hipótesis, no
como resultado.

Patrones muy citados —sujeto explícito, pasiva perifrástica, posesivo
calcado, tríadas, «no es X, es Y»— **no tienen ninguna medición en texto
LLM en español**. Proceden de estudios de traducción automática o de
observación editorial anecdótica.

Ninguna fuente publica umbrales para reglas. Hay que calibrar por género con
los textos humanos de ROBOT-TALK.

Consecuencias para el motor:
1. Ninguna señal sintáctica sirve aislada. Por pares humano–modelo, 66 rasgos
   de Biber alcanzan 93–98 %, y aun así un 9,8 % de humanos queda mal
   clasificado (Reinhart 2025).
2. La **longitud media** de frase no es señal: sale mayor en Herbold (L2) y
   menor en Muñoz-Ortiz, Zamaraeva y ROBOT-TALK. La **dispersión** sí es
   consistente (menor en LLM en todos los estudios).
3. La pasiva **no** es signo de IA: GPT-4o la usa a la mitad de la tasa
   humana en inglés.
4. Los detectores por perplejidad marcaron como IA el 61,3 % de ensayos
   humanos de no nativos. La uniformidad sintáctica penaliza al L2.

---

## 1. Longitud y variación de frase

### Muñoz-Ortiz, Gómez-Rodríguez y Vilares (Universidade da Coruña, grupo LyS) — «Contrasting Linguistic Patterns in Human and LLM-Generated News Text»
- Fuentes: https://arxiv.org/pdf/2308.09067 · *Artificial Intelligence
  Review* 57:265, 2024, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11422446/
- Corpus: 13.371 entradillas del NYT frente a seis modelos **base** (LLaMa
  7B–65B, Falcon 7B, Mistral 7B). **Solo inglés.**
- Longitud: «Human texts exhibit more scattered sentence length
  distributions»; los modelos concentran frases en 10–30 tokens.
- Dependencias: «human texts are more optimized in terms of dependency
  lengths».
- Sin umbral publicado.

### Herbold, Hautli-Janisz, Heuer, Kikteva y Trautsch — *Scientific Reports* 13:18617, 2023
- Fuente: https://pmc.ncbi.nlm.nih.gov/articles/PMC10616290/
- Corpus: 90 ensayos argumentativos de estudiantes alemanes (inglés L2)
  frente a ChatGPT-3 y ChatGPT-4.
- Palabras por frase: estudiantes 18,60 · ChatGPT-3 20,31 · ChatGPT-4 19,57.
  Frases por ensayo: 18,98 · 12,40 · 13,08.
- Cláusulas por frase: 1,81 (DT 0,57) · 2,31 (0,50) · 2,08 (0,42).
  Profundidad del árbol: 5,72 · 6,18 · 5,94, pero «Sentence complexity
  (depth) is the only category without a significant difference between
  humans and ChatGPT-3».
- «the GPT models use more nominalizations and have higher sentence
  complexity».
- Sesgo: «The students who wrote the essays are not native speakers.»

### Alonso Simón, Fernández-Pampillón, Fernández Trinidad y Márquez Cruz (UCM) — *RAEL* 23, 31/01/2025 — **ESPAÑOL**
- Fuente (PDF leído): https://matrix.aesla.org.es/RAEL/article/download/666/362/2949
- Corpus: 180 textos de ROBOT-TALK (60 humanos, 60 GPT-3.5, 60 GPT-4):
  artículos de lingüística, noticias, reseñas de cine.
- Hallazgo sintáctico: «el único rasgo sintáctico relevante parece ser la
  proporción de oraciones en los textos». «los LLM utilizan más puntos que
  los humanos, lo que es congruente con el uso de más oraciones por texto».
- Orden SVO: «El uso del orden canónico SVO es mayor en GPT-3.5 que en los
  humanos, aunque con una significancia baja». En GPT-4, sin diferencia.
- Nombres, preposiciones y verbos: sin diferencias significativas o bajas.
- Limitación: publican niveles de significación (escala −3 a +3), **no
  medias ni desviaciones**. Los autores piden replicar con muestra mayor.

### Gargova, Pérez-Montero, Lloret y Moreda (Universidad de Alicante) — InDor @ LREC 2026
- Fuente: https://aclanthology.org/2026.indor-1.9.pdf
- Corpus: inglés, español y búlgaro; 160 noticias humanas por idioma y 4.320
  textos de GPT-5-mini, Gemini 2.5 Flash y Grok 4. Prompts en inglés.
- Medias agregadas de los tres idiomas (humano vs LLM): «burstiness» 219,06
  vs 116,02 · densidad léxica 0,391 vs 0,455 · MTLD 60,08 vs 81,95.
- Peso de rasgos en español: legibilidad 0,282 · ratio de subordinación
  0,133 · distancia media de dependencia 0,113 · longitud media de frase
  0,059.
- Limitación: medias no desglosadas por idioma; dirección de la
  subordinación no informada; fórmula de burstiness no especificada en lo
  leído.

### Schaaff, Schlippe y Mindner — ICNLSP 2023
- Fuente: https://arxiv.org/pdf/2312.04882
- Corpus español: 100 artículos humanos, 100 ChatGPT, 100 reformulados,
  temas educativos. Rasgos: palabras por frase (media y DT), POS por frase.
  F1 en español 98,1 % con rasgos de documento.
- Totales: ~38,0 k palabras / 1,4 k frases (humanos) vs ~26,8 k / 1,2 k
  (IA) → ~27 vs ~22 palabras por frase. **Cálculo derivado de totales
  redondeados, no cifra del artículo.**

### Zamaraeva et al. — HPSG, noticias en inglés, 2025
- Fuente: https://arxiv.org/html/2506.01407v1
- Frases humanas más largas; la variación entre autores humanos supera la
  variación humano–LLM. «an LLM appears as an “average” human author».

### «Burstiness»: definición operativa
- GPTZero la define sobre la **perplejidad**, no sobre la longitud de frase:
  «Burstiness is a measure of how much the perplexity varies over the entire
  document.» Y la retiró: «As of autumn 2023, GPTZero no longer uses
  perplexity and burstiness».
  https://support.gptzero.me/articles/9585228410-how-do-i-interpret-burstiness-or-perplexity
- Formalización: DT de la perplejidad por frase (arXiv 2310.01307, apéndice
  D): https://arxiv.org/pdf/2310.01307
- **Para un motor sin modelo**: el sustituto medible es la DT o el
  coeficiente de variación de la longitud de frase. Es adaptación
  [PROPIO], no la métrica original. Sin umbral publicado.

---

## 2. Estructura oracional (rasgos de Biber)

### Reinhart, Markey, Laudenbach, Pantusen, Yurko, Weinberg y Brown — *PNAS* 122(8), 2025 — **INGLÉS**
- Fuentes: https://arxiv.org/html/2410.16107v2 ·
  https://www.pnas.org/doi/10.1073/pnas.2422455122
- Corpus HAP-E: 8.290 textos humanos, seis géneros; el LLM continúa cada
  texto ~500 palabras. GPT-4o, GPT-4o Mini, cuatro variantes de Llama 3.
  66 rasgos de Biber (pseudobibeR).
- **Sobreusados por modelos con ajuste por instrucciones:**
  - Cláusulas de participio presente: «the instruction-tuned LLMs used
    present participial clauses at 2 to 5 times the rate of human text».
    GPT-4o 5,3× (d = 1,38).
  - Nominalizaciones: 1,5–2×; GPT-4o 2,1× (d = 1,23).
  - Cláusulas «that» como sujeto: 2,6× (d = 0,77).
  - Coordinación de sintagmas: 1,9× (d = 0,81).
- **Infrausados / específicos de modelo:**
  - «GPT-4o uses the agentless passive voice at roughly half the rate as
    human texts».
  - «both GPT-4o models avoid clausal coordination, while all Llama 3
    variants use it more frequently than humans».
- Los modelos **base** de Llama se parecen a los humanos: el estilo denso y
  nominal lo introduce el ajuste por instrucciones.
- Clasificación: siete clases, 66 % de acierto; por pares humano–modelo,
  93–98 %. «only 9.8% of human texts were falsely classified as LLMs».

### Muñoz-Ortiz et al. 2024 — POS y dependencias, inglés, modelos base
- POS (%): AUX 3,81 vs 5,41–6,02 · PRON 5,32 vs 6,11–7,33 · NOUN 19,69 vs
  17,44–17,85 · ADJ 7,58 vs 6,69–6,77.
- Dependencias (%): nsubj 6,09 vs 6,89–7,21 · cop 1,26 vs 1,86–2,28 · mark
  2,65 vs 2,94–3,35 · amod 6,98 vs 5,57–5,75 · appos 1,19 vs 0,85–1,07.
- «LLM outputs use more numbers, symbols and auxiliaries (suggesting
  objective language) than human texts, as well as more pronouns».
- Contradicción aparente con Reinhart (menos nombres aquí, más nominal
  allí): miden modelos distintos (base vs instruidos). Compatibles.

### Español
- ROBOT-TALK: sin diferencias significativas en nombres, preposiciones y
  verbos. **No existe análisis multidimensional de Biber ni medición de
  nominalización, subordinación o pasiva en texto LLM en español.**

---

## 3. Inicios de frase

- **Orden SVO rígido**: única observación con fuente en español.
  - Cualitativo (UCM, IberLEF 2023, cinco lingüistas, 20 textos):
    https://ceur-ws.org/Vol-3496/autextification-paper17.pdf
    «Robotic texts present the canonical order of SVO constituents almost
    constantly». «The discourse markers that appear in generated texts are
    scarce and repetitive.»
  - Medido (ROBOT-TALK 2025): débil en GPT-3.5, nulo en GPT-4.
- Indicio indirecto en inglés: nsubj sube (Muñoz-Ortiz), compatible con más
  sujetos nominales explícitos; no mide posición inicial.
- **Hueco**: ninguna fuente mide uniformidad del arranque, repetición del
  mismo inicio, conectores o adverbios iniciales, gerundio/participio
  inicial, ni índice de diversidad de inicios. En ningún idioma.

---

## 4. Paralelismos y estructuras repetidas

- Solo evidencia anecdótica: recuento informal de un editor en la página de
  discusión de «Signs of AI writing»:
  https://en.wikipedia.org/wiki/Wikipedia_talk:Signs_of_AI_writing/Archive_4
  «Rule of three: Present in three AI-generated articles and in no
  human-written articles». «Negative parallelisms: Already seems to be
  fading away.» Muestra de unos pocos artículos; no es un estudio.
- Dato medido más cercano: coordinación de sintagmas 1,9× (Reinhart), como
  aproximación a pares «X e Y» y enumeraciones.
- **Hueco**: anáforas sintácticas, «no solo… sino también», preguntas
  retóricas + respuesta, «no es X, es Y»: sin medición en ningún idioma.

---

## 5. Español específico

- **Medido (ROBOT-TALK)**: «los textos humanos presentan un mayor uso y
  variedad de adverbios y pronombres». Va **en contra** de la hipótesis del
  sujeto pronominal explícito; como la categoría mezcla clíticos,
  relativos y demostrativos, no la refuta, pero no la apoya.
- Contraste con inglés: en noticias, los modelos base usan **más**
  pronombres que los humanos (Muñoz-Ortiz). **No trasladar la dirección.**
- **Sin medición en texto LLM en español**: sujeto explícito, clíticos,
  leísmo/laísmo, subjuntivo, perífrasis, «el mismo» pronominal, «a nivel
  de», «en base a», posesivo por artículo, adjetivo antepuesto por calco.
  Buscado en español e inglés; nada. Proceden de traducción automática (§6)
  o de guías normativas.
- **Recursos de datos**:
  - ROBOT-TALK: humanos + Gemini, Claude, GPT-3.5-Turbo, GPT-4, Mixtral,
    DeepSeek (dic. 2022–jun. 2025): https://www.ucm.es/robottalk/corpus-robot-talk
  - IberAuTexTification 2024: «about 168,000 texts across six languages»:
    https://panorama.upv.es/es/ipublic/item/10259588
  - ⚠️ AuTexTification 2023: la UCM advierte de que «no se ha comprobado la
    autoría humana de los textos etiquetados como humanos»; textos de 20–100
    tokens, generados con BLOOM y GPT-3 (no GPT-3.5/4). Demasiado cortos
    para estadísticos por texto. Mejor sistema en español: ~70 macro-F1.
  - En IberLEF 2023, el sistema de la UCM (n-gramas de caracteres, palabras
    y POS + puntuación) quedó 2.º en español con macro-F1 70,6 %.

---

## 6. Marcadores de traducción automática trasladables

- Martín de Santa Olalla y Rico, *Hermēneus* 27, 2025 —
  https://revistas.uva.es/index.php/hermeneus/en/article/download/8363/7380
  La TA neuronal en→es (Unbabel, 50 oraciones) «prefiere la pasiva a la
  pasiva refleja o el posesivo frente al artículo definido».
- Martín de Santa Olalla, *ELUA* 44, 2025 (proyecto ROBOT-TALK) —
  https://rua.ua.es/server/api/core/bitstreams/babfad0e-fafa-417e-a375-026780804ef8/content
  Norma: «la pasiva refleja es más genuinamente española que la pasiva».
  «los estudiantes dan una nota de 3,4 sobre 5 a las oraciones que hemos
  considerado no idiomáticas» → los humanos toleran bien estos calcos; el
  detector debe ser conservador.
- Piñero y García, *Babel* 48(3), 2002 — expansión de la pasiva analítica
  por presión del inglés; tipológico, sin tasas en el resumen consultado.
  https://www.researchgate.net/publication/248905702
- Sujeto pronominal en traducción desde inglés (esloveno, pro-drop),
  *Languages in Contrast* 18(2), 2017 —
  https://www.jbe-platform.com/content/journals/10.1075/lic.16007.pis
  «pronominal subjects are more frequent in translations from English».
  Mejor evidencia indirecta para la hipótesis; **no es español ni LLM**.
- Wintner, tutorial «translationese», COLING 2016 —
  https://coling2016.anlp.jp/doc/tutorial/slides/T5/Coling2016.pdf
  Texto traducido al inglés: «T has about 1.15 times more passive verbs».
- ROBOT-TALK-TRAD (UCM, 2025): traducciones paralelas en→es humanas, DeepL,
  GPT-4 y DeepSeek. Sin resultados publicados.
  https://www.ucm.es/robottalk/corpus-robot-talk-trad

---

## 7. Falsos positivos

- **No nativos** (Liang et al., *Patterns* 2023,
  https://arxiv.org/pdf/2304.02819): siete detectores por perplejidad,
  «average false-positive rate: 61.3%» con 91 ensayos TOEFL; «89 of the 91
  TOEFL essays (97.80%) are flagged as AI-generated by at least one
  detector». El español L2, con sintaxis simple y repetitiva, es grupo de
  riesgo para cualquier regla de uniformidad.
- **Prosa científica en español** (Barrio-Cantalejo et al., 2008,
  https://scielo.isciii.es/pdf/asisna/v31n2/original2.pdf): revistas
  científicas IFSZ medio 37,9 vs 60 en quiosco. «Entre 0 y 50 están sólo
  las revistas científicas.» Una regla que penalice baja legibilidad marca
  la prosa académica humana.
- **Registro académico/administrativo**: el estilo que el LLM sobreusa
  (Reinhart) es el de la prosa informativa densa. 9,8 % de humanos mal
  clasificados incluso con 66 rasgos.
- **Traducción humana**: pasivas (Wintner) y sujetos pronominales
  (esloveno) suben también en traducción humana. Los calcos de §6 no
  separan LLM de traductor humano.
- **Hueco**: sin medición de FP en prosa jurídica o administrativa española.

---

## 8. Herramientas por reglas y fórmulas

**Fórmulas** (S = sílabas, P = palabras, F = frases):
- **Fernández-Huerta (1959)**: L = 206,84 − 0,60·(sílabas/100 palabras)
  − 1,02·(palabras/frase).
  https://olgacarreras.blogspot.com/2016/10/medicion-de-la-readability-o.html
  ⚠️ Transcripciones erróneas en circulación: «286,84» (revista UCM) y
  «102 × F» (Elsevier). Usar 206,84 y 1,02.
- **Szigriszt-Pazos / IFSZ**: 206,835 − 62,3·(S/P) − (P/F).
  https://www.screamingfrog.co.uk/blog/readability-of-spanish-texts-alternative-metrics-to-flesch/
  Un blog SEO da 62,5; se toma 62,3 por coincidir en varias fuentes.
- **Escala INFLESZ** (Barrio-Cantalejo 2008): Muy Difícil < 40 · Algo
  Difícil 40–55 · Normal 55–65 · Bastante Fácil 65–80 · Muy Fácil > 80.
- Miden solo longitud de palabra y de frase. **No detectan IA** y penalizan
  el registro científico. Solo contexto.

**LanguageTool**:
- Reglas XML (grammar.xml por idioma) + reglas Java. Desde 6.0, reglas
  propias en `grammar_custom.xml`: https://dev.languagetool.org/tips-and-tricks.html
- Editor de reglas: https://community.languagetool.org/ruleEditor/expert
- **Hueco**: no verificado el contenido de las reglas de estilo del español
  (frases largas, pasiva, «a nivel de») ni sus umbrales.

**Hemingway para español**: ninguna herramienta con umbrales publicados.

---

## 9. CANDIDATAS A REGLA — familia sintaxis

| # | Patrón | Idioma documentado | Evidencia | Detector | Necesita POS/parsing | Riesgo FP |
|---|---|---|---|---|---|---|
| S1 | Frases por 100 palabras alta (más oraciones, más puntos) | **Español** (ROBOT-TALK) | Media (significación sin tamaño de efecto) | Estadístico | No (regex fin de frase) | Medio: prensa y L2 escriben corto |
| S2 | Baja dispersión de longitud de frase (DT o CV bajos; exceso en 10–30 tokens) | Inglés (Muñoz-Ortiz); agregado con español (Gargova) | Fuerte inglés / media español | Estadístico | No | Medio-alto: prosa técnica homogénea, L2 |
| S3 | Longitud media de frase | Contradictoria (Herbold ↑; Muñoz-Ortiz, Zamaraeva, ROBOT-TALK ↓) | Dirección inestable | **No usar sola** | No | Alto |
| S4 | Cláusulas de gerundio adjuntas («…, logrando…», «…, destacando…») | Solo inglés (participio presente 2–5×, Reinhart) | Fuerte inglés / sin fuente español | Estructural (frase) | Regex «, + -ando/-iendo»; POS para filtrar perífrasis | Medio: gerundio frecuente en español humano |
| S5 | Densidad de nominalizaciones (-ción, -miento, -dad, -ncia / 100 palabras) | Solo inglés (1,5–2× Reinhart; Herbold) | Fuerte inglés | Estadístico | Regex de sufijos (con FP léxicos) | Alto: académico, administrativo, jurídico |
| S6 | Coordinación de sintagmas «X y Y», enumeraciones | Solo inglés (1,9×) | Media-fuerte | Estructural | POS recomendable | Medio |
| S7 | Tríadas («A, B y C») | Sin cifras (anecdótica, Wikipedia) | Anecdótica | Patrón/estructural | Regex aproximada; POS para igualar categorías | Alto: retórica clásica |
| S8 | «No es X, es Y» / «no solo… sino (también)» | Sin cifras (Wikipedia: «fading») | Anecdótica | Patrón | No (regex) | Medio-alto |
| S9 | Orden SVO constante, poca anteposición | **Español** (débil GPT-3.5, nulo GPT-4) | Débil | Estadístico | Sí (parsing) | Medio |
| S10 | Pocos adverbios y pronombres, muchos adjetivos | **Español** (ROBOT-TALK) | Fuerte (muy significativo) | Estadístico | Sí (POS) | Medio: depende del género |
| S11 | Auxiliares y cópulas elevados | Solo inglés (modelos base) | Media | Estadístico | Sí (POS) | Medio |
| S12 | Pasiva perifrástica «fue/ha sido + participio» en lugar de «se» | Solo TA en→es; en inglés GPT-4o usa **menos** pasiva | Cualitativa | Patrón | Regex «ser + participio»; POS para filtrar atributivos | Alto: jurídico, administrativo |
| S13 | Posesivo por artículo («levantó su mano») | Solo TA en→es | Cualitativa | Patrón (lista partes del cuerpo/prendas + posesivo) | No | Bajo-medio |
| S14 | Sujeto pronominal explícito redundante | Sin fuente en español LLM; indirecta (esloveno); ROBOT-TALK va en contra | Sin fuente | Estadístico | Sí (parsing o morfología verbal) | Alto: variedades caribeñas, oralidad |
| S15 | «En base a», «a nivel de», «el mismo» pronominal | Sin fuente para LLM (norma) | Sin fuente | Patrón | No | Alto: muy frecuentes en prosa humana |
| S16 | Legibilidad baja (IFSZ < 40) | Español (escala validada; nula como detector) | Contexto | **No es señal de IA** | No (silabeador por reglas) | Alto: científica media 37,9 |

**Sin gramática, con regex y conteo en el navegador:** S1, S2, S3 (solo
contexto), S4 (aproximado), S5, S7 (aproximado), S8, S12 (aproximado), S13,
S15, S16.
**Con POS:** S4 (filtrado), S6, S10, S11, S12 (filtrado).
**Con parsing:** S9, S14.

**Lectura para el paquete v1:**
- Peso propio, respaldo en español, sin gramática: **S1**.
- Peso medio, traslado del inglés etiquetado como tal en la ficha: S2, S4,
  S5 (bajar peso en académico/administrativo).
- Solo si entra un etiquetador POS (decisión técnica del punto 3-4): S10
  (fuerte en español), S6.
- Aviso de estilo o de traducción, nunca de autoría: S12, S13.
- Fuera de la v1 o con peso mínimo y etiqueta «anecdótica»: S7, S8, S9,
  S11, S14, S15.
- Contexto para calibrar, no señal: S3, S16.

---

## 10. Recomendaciones derivadas (para los puntos 3-5)

1. Núcleo sintáctico = reglas **estadísticas por texto**: frases por 100
   palabras; CV de longitud de frase; densidad de gerundios adjuntos;
   densidad de nominalizaciones. Solo el primero tiene respaldo español.
2. Umbrales: ninguna fuente los publica. Calibrar con los textos humanos de
   ROBOT-TALK por género; en noticias GPT-4 casi no se distingue del humano.
3. Agregación: nunca por un solo rasgo.
4. Pasiva: no penalizarla como signo de IA.
5. Rebajar peso de uniformidad y nominalización en académico, jurídico,
   administrativo y L2.
6. Longitud mínima: cientos de palabras antes de calcular estadísticos
   (AuTexTification con 20–100 tokens: ~70 macro-F1 en español). Esto
   alimenta el umbral decidido en el plan (alcance, punto 11).

---

## 11. Huecos (buscado y no encontrado)

- En español: sujeto explícito, pasiva perifrástica vs refleja, gerundio,
  posesivo, subjuntivo, clíticos, leísmo y perífrasis en texto LLM.
- Análisis multidimensional de Biber del español LLM.
- Cifras separadas para español en Muñoz-Ortiz (el artículo es de inglés).
- Cifras completas (medias, DT) de ROBOT-TALK: publican solo significación.
- Tesis universitarias con mediciones.
- Diversidad de inicios de frase en cualquier idioma.
- Frecuencia medida de tríadas y «no es X, es Y».
- Contenido de las reglas de estilo de LanguageTool para español.
- Herramienta tipo Hemingway en español con umbrales.
- Falsos positivos en prosa jurídica o administrativa española.
- «Kendro et al.» resultó ser diversidad léxica solo en inglés: fuera de
  sintaxis.
- Ningún trabajo del grupo LyS de A Coruña sobre español.
- Modelos: la evidencia española es de GPT-3.5/4 (2023–24); la inglesa de
  GPT-4o, Llama 3 y modelos base. Los modelos actuales pueden haber
  corregido tríadas y paralelismos (un editor de Wikipedia ya lo observa).
