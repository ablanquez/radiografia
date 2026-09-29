# Investigación — Familia LÉXICO

> Punto 2 del `PLAN-RADIOGRAFIA.md`. Investigación realizada el 29/09/2026
> con el módulo de investigación de Claude (barrido multi-fuente) y redactada
> por la conversación de estrategia. Cada afirmación lleva su fuente con URL.
> Lo no verificado se marca. Lo buscado y no encontrado va en «Huecos».
>
> Regla de esta familia: **sin fuente no hay candidata.**

## Resumen

La evidencia sólida con cifras sobre vocabulario «de IA» existe casi solo
para el inglés científico (PubMed, arXiv, reseñas de conferencias). Para el
español hay **un** estudio amplio con listas medidas (Juzek 2026, prensa en
34 lenguas), **un** estudio de rasgos por categoría gramatical (Alonso Simón
et al. 2025, UCM) y **un** análisis no revisado por pares (Turrado 2024).
Casi todo lo que circula como «palabras que delatan a ChatGPT en español»
es traducción del inglés o anécdota.

Consecuencia para el motor: las reglas léxicas son **señales débiles que se
acumulan** a nivel de texto (densidad por 1.000 palabras contra un umbral
por género), no veredictos por coincidencia única. La excepción son las
frases de chatbot («Espero que esto te ayude»), casi inexistentes en texto
humano editado.

Cuatro motivos de prudencia, todos con fuente:
1. Las palabras marcadoras ya subían antes de 2022 (Matsui; Juzek & Ward).
2. Varían por modelo: GPT vs Gemini, ρ = 0,46 (Juzek 2026).
3. Caen cuando se hacen públicas: *delve* baja desde abril de 2024 (Geng &
   Trotta 2025).
4. Los detectores marcaron como IA el 61,22 % de redacciones TOEFL de no
   nativos (Liang et al. 2023).

---

## 1. Estudios de corpus con cifras (inglés)

### Kobak, González-Márquez, Horvát y Lause — «Delving into ChatGPT usage in academic writing through excess vocabulary»
- Fuente: https://arxiv.org/pdf/2406.07016 (v5, julio 2025; publicado en
  *Science Advances*). Datos: https://github.com/berenslab/llm-excess-vocab
- Corpus: 15,1 M de abstracts en inglés de PubMed, 2010–2024.
- Método: «excess vocabulary»: frecuencia de documentos con la palabra en
  2024 frente a extrapolación de 2021–22; ratio r = p/q y brecha δ = p − q.
- Cifras: *delves* r = 28,0 · *underscores* r = 13,8 · *showcasing* r = 10,7.
  Entre palabras comunes: *potential* δ = 0,052 · *findings* δ = 0,041 ·
  *crucial* δ = 0,037.
- 454 palabras en exceso en 2024 (190 en el pico COVID de 2021). De las 379
  de estilo, el 66 % son verbos y el 14 % adjetivos. Cita: «the 2023–24
  excess words were not content-related nouns, but rather style-affecting
  verbs and adjectives».
- Conjunto «común» (10): *across, additionally, comprehensive, crucial,
  enhancing, exhibited, insights, notably, particularly, within*.
- Conjunto «raro» (291): *delve, intricate, meticulous, pivotal, realm,
  showcasing, underscore, interplay, leveraging, fostering, harnessing,
  unveiling, seamless, groundbreaking, transformative*…
- Cota inferior de abstracts con LLM: 13,5 %. Heterogéneo por país
  (Δ ≈ 0,05 Reino Unido; ≈ 0,20 China, Corea, Taiwán).

### Liang et al. — reseñas de conferencias de IA
- Fuente: https://arxiv.org/pdf/2403.07183 (ICML 2024).
- ICLR 2024: *commendable* ×9,8 · *meticulous* ×34,7 · *intricate* ×11,2.
  Cita: «adjectives such as “commendable”, “meticulous”, and “intricate”
  showing 9.8, 34.7, and 11.2-fold increases».
- Texto sustancialmente modificado por LLM: 10,6 % ICLR 2024 · 9,1 % NeurIPS
  2023 · 6,5 % CoRL 2023 · 16,9 % EMNLP 2023. Sin señal en reseñas de
  revistas Nature.
- Publican top-100 adjetivos (*commendable, innovative, meticulous,
  intricate, notable, versatile, noteworthy, invaluable, pivotal, potent…*)
  y top-100 adverbios (*meticulously, reportedly, lucidly, innovatively,
  aptly, methodically…*).

### Liang et al. — «Mapping the increasing use of LLMs in scientific papers»
- Fuentes: https://arxiv.org/pdf/2404.01268 ·
  https://www.nature.com/articles/s41562-025-02273-8 (Nature Human
  Behaviour, 2025).
- Hasta 17,5 % de frases modificadas en abstracts de Computación (preprint);
  hasta 22 % en la versión publicada. Palabras más preferidas por el LLM:
  *pivotal, intricate, showcasing, realm*.

### Gray — «ChatGPT “contamination”»
- Fuente: https://arxiv.org/pdf/2403.16887 (2024). Corpus: Dimensions,
  texto completo, 2019–2023.
- 2022→2023: *intricate* +117 % · *commendable* +83 % · *meticulous* +59 %.
- Artículos con uno o más de los cuatro indicadores fuertes (*intricate,
  meticulous, meticulously, commendable*): 86.988 → 159.655 (+83,5 %); con
  dos o más: 3.045 → 16.950 (+468,4 %).
- Estimación: «at least 60,000 papers (slightly over 1% of all articles)
  were LLM-assisted».

### Matsui — «Delving into PubMed records»
- Fuentes: https://www.medrxiv.org/content/10.1101/2024.05.14.24307373v1
  (preprint) · https://pmejournal.org/articles/10.5334/pme.1929 (publicado,
  2025). Datos: https://github.com/matsuikentaro1/delving_into_pubmed_records
- Preprint: 117 términos + 75 frases de control; 74 términos con Z
  modificado ≥ 3,5 en 2024. Encabezan: *delve, underscore, meticulous,
  commendable, showcase, intricate, tapestry, symphony, impressively, realm,
  cutting-edge, prowess, captivate*. Versión publicada: 135 términos, 103
  con aumento significativo.
- ⚠️ Dato clave: «The usage of potentially AI-influenced terms showed a
  noticeable increase starting in 2020». **La subida empieza antes de
  ChatGPT.**
- Frases humanas en descenso en 2024: *purpose of, to determine,
  hypothesis, results suggest*.

### Geng y Trotta — arXiv 2018–2024
- Fuente: https://arxiv.org/abs/2404.08627 (ICML 2024 workshop).
- 1 M de abstracts de arXiv. En Computación, «the fraction of LLM-style
  abstracts is estimated to be approximately 35%». Palabras: *significant,
  crucial, effectively, additionally, comprehensive, enhance, capabilities,
  valuable*. *Is/are* disminuyen.

### Geng y Trotta — «Human-LLM Coevolution»
- Fuente: https://arxiv.org/pdf/2502.09606 (2025).
- *Delve* e *intricate* **caen desde marzo–abril de 2024**, tras hacerse
  públicas; *significant* y *additionally* siguen subiendo.
- Prohibir en el prompt *realm, pivotal, intricate, showcasing* las reduce
  «although it does not completely eliminate them».

### Juzek y Ward — «Why does ChatGPT “delve” so much?»
- Fuente: https://arxiv.org/pdf/2412.11385 (COLING 2025).
- 21 «focal words». *Delves* pasa de 0,21 a 14,38 por millón; *delve* de
  0,58 a 8,50. Casi todas «were already increasing in usage in the years
  leading up to the release of ChatGPT». Causa apuntada: RLHF. Trabajo
  posterior (https://arxiv.org/html/2508.01930v1): 28 de 32 palabras
  señaladas aparecen más en Llama Instruct que en Llama Base.

### Reinhart et al. — «Do LLMs write like humans?»
- Fuente: https://www.pnas.org/doi/10.1073/pnas.2422455122 (PNAS, 2025).
- GPT-4o usa *camaraderie, palpable, tapestry, intricate* «at more than 100
  times the rate of humans». Sobre el género: «humans refrain from using
  these words in certain genres».

### Antislop — Paech et al.
- Fuente: https://arxiv.org/pdf/2510.15061 (ICLR 2026). Código:
  https://github.com/sam-paech/antislop-sampler
- Huellas de sobrerrepresentación de palabras y trigramas frente a base
  humana en escritura creativa; patrones «over 1000× more frequently».
  Huellas específicas por modelo (*flickered* aparece en el 98,5 % de los
  modelos probados). Solo inglés y solo ficción.

---

## 2. Colocaciones y muletillas (inglés, salvo indicación)

- **Wikipedia EN, «Signs of AI writing»** —
  https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
  Ensayo editorial con ejemplos reales, **sin frecuencias**. «Words to
  watch»: *Additionally* (inicio de frase), *align with, boasts, bolstered,
  crucial, delve, emphasizing*; *serves as / stands as / marks*; «it's
  important/critical/crucial to note»; cierres «In summary, In conclusion,
  Overall». Lenguaje promocional: *vibrant, rich, profound, showcasing,
  exemplifies, commitment to, nestled, in the heart of, groundbreaking,
  renowned*. Frases conversacionales: «I hope this helps», «Certainly!».
  Evidencia: media.
- **EQ-Bench Slop Score** — https://eqbench.com/slop-score.html
  Ponderación: 60 % palabras sobrerrepresentadas, 25 % patrones
  «not X, but Y», 15 % trigramas. Única fuente que mide el binomio como
  familia propia; solo inglés, origen ficción.
- **Conectores de estructura** (*additionally, notably, particularly*):
  base cuantitativa en Kobak (conjunto «común») y en Juzek 2026 (top-1 en
  prensa inglesa: *additionally*, LPR 6,74). En español, sin medición.
- **Fórmulas humanas en descenso** (Matsui): la ausencia de *to determine,
  results suggest* es señal débil por ausencia.
- **Hedging léxico** («es posible que», «en cierto modo»): **ninguna
  medición específica encontrada** en ningún idioma. Juzek 2026 cita
  literatura que describe el registro de asistente como «characterised by
  hedging, positivity, and recurrent lexical choices», sin cifras propias.
- **Verbos corporativos**: *leveraging, leverages, fostering, fosters,
  empowers, unlocking* están en la lista de 291 de Kobak (inglés). *Navigate*
  no aparece. Juzek 2026, top-10 prensa inglesa: *revolutionize, revitalize,
  streamline, personalize*.

---

## 3. Español: lo medido directamente

### Juzek — «AI-Associated Lexical Shifts Across 34 Languages» (la fuente más fuerte)
- Fuente: https://arxiv.org/pdf/2605.25358 (mayo 2026). Explorador:
  aiwordexplorer.com (no verificado).
- Corpus: WMT News Crawl, 34 lenguas incluido español. Compara
  continuaciones de GPT-4.1-mini con la mitad humana real de 100.000 frases
  por lengua; razón de prevalencia logarítmica (LPR) por lema y categoría.
- Top-10 de contenido sobreusado en español: *testigos* (LPR 5,68),
  *organizaciones* (5,51), *imborrable* (4,92), *estudios* (4,78),
  *analistas* (4,42), *equipos* (4,29), *multidisciplinario* (4,04),
  *reinserción* (4,01), *empresas* (3,97), *intensificación* (3,85). Ninguna
  aparece en la continuación humana.
  ⚠️ Varias sin lematizar (plurales), artefacto que el autor reconoce; y
  muchas son de contenido, dependientes del género periodístico: **no son
  buenas reglas generales**.
- **Conceptos transversales en el top-200 español** (lo que sí sirve):
  - Verbos de énfasis: *enfatizar, destacar, subrayar, realzar* — el
    concepto está sobreusado en 24 de 34 lenguas.
  - *importancia* (20 de 34 lenguas).
  - *innovador* (18 de 34 lenguas).
  - En el seguimiento longitudinal: *realzar* e *impecable*.
- Diacronía (todas las lenguas): top-20 sobreusados suben +15,1 % entre
  2020–21 y 2023–24 frente a −4,5 % de la base. La cifra española solo está
  en la Figura 2, no en texto.
- Robustez: entre prompts, ρ = 0,90–0,95. **Entre modelos: GPT vs Gemini
  ρ = 0,46; GPT vs Haiku ρ = 0,85.** El autor advierte: «Lexical signals for
  AI detection can be unstable» y que el trabajo «is not intended for AI
  detection».

### Alonso Simón, Fernández-Pampillón, Fernández Trinidad y Márquez Cruz (UCM) — «¿Tienen GPT-3.5 y GPT-4 un estilo de escritura diferente del estilo humano?»
- Fuentes: https://matrix.aesla.org.es/RAEL/article/view/666 (RAEL 23(1),
  2025) · PDF en Docta UCM:
  https://docta.ucm.es/rest/api/core/bitstreams/35114b65-3dbe-4613-b4d7-caa8bc2ba299/content
- 17 variables difieren significativamente entre humanos y GPT-3.5/4 en
  español, agrupadas en rasgos léxicos, puntuación y sintaxis.
- Léxico (según fragmentos del PDF **no verificados íntegros**): GPT exhibe
  «más adjetivos y adjetivos únicos»; los humanos, «mayor uso y variedad de
  adverbios y pronombres».
- Corpus ROBOT-TALK: 765 textos, mitad humanos; artículos científicos,
  noticias, reseñas (https://journals.uco.es/alfinge/article/view/18687).
- ⏳ PENDIENTE: medias, valores p, lista completa de variables. Hay que
  leer el PDF entero antes de escribir la regla de adjetivación.

### Turrado (consultor SEO) — hilo en X, julio 2024
- Recogido en elEconomista:
  https://www.eleconomista.es/tecnologia/noticias/12925132/07/24/de-crucial-a-esencial-estas-son-las-palabras-que-revelan-que-un-texto-esta-escrito-con-ia.html
- Cifras: *crucial* 6.413× más en IA que en humano; *desafíos* y
  *exploraremos* ~2.000×. Trigramas: «este artículo exploraremos»,
  «consideraciones éticas», «comenzando a desempeñar». Muestra: 360 M de
  tokens generados (Llama3, Gemma, GPT-3.5/4/4o).
- Por qué pesa poco: no revisado, corpus humano no descrito, sin
  normalización explicada; ratios tan extremos sugieren desajuste de
  géneros. Evidencia media-baja.

### Listas anecdóticas en medios (sin cifras)
- Applesfera: «Además», «Sin embargo», «Indudablemente»; «Innovador»,
  «Robusto», «Vital» —
  https://www.applesfera.com/curiosidades/te-han-pillado-palabras-frases-que-hacen-evidente-que-utilizaste-chatgpt-lugar-pensar-a-apple
- elEconomista/blogs: «en resumen», «en conclusión», «en el contexto
  actual».
- Bilateria: «es importante (recordar/saber/tener en cuenta)» —
  https://educacion.bilateria.org/como-detectar-textos-escritos-por-chatgpt
- PageOn: «integral», «vital», «fundamental», «explorar», «ahondar» —
  https://www.pageon.ai/es/blog/the-most-overused-chatgpt-words
- La Nación: ChatGPT-3.5 cita de sí mismo «intrincado, detallado, elogiable
  y cuidadoso» — autoinforme del modelo, no medición —
  https://www.lanacion.com.ar/tecnologia/el-exceso-de-palabras-como-encomiable-y-meticuloso-sugiere-el-uso-de-chatgpt-en-miles-de-estudios-nid27042024/
- ADSLZone: traduce listas inglesas y admite que «este análisis se ha
  llevado a cabo en inglés» —
  https://www.adslzone.net/noticias/ia/palabras-mas-usadas-chatgpt/

### Instituciones (buscado)
- **Wikipedia ES**: no hay equivalente a «Signs of AI writing». Existe
  «Wikipedia:Redacción de artículos con modelos de lenguaje grandes»
  (aprobada 49–3), que prohíbe crear artículos desde cero con LLM y añade
  el criterio de borrado G12. Sin lista de palabras.
- **FundéuRAE**: ninguna nota sobre palabras sobreusadas por IA.
- **CREA / CORPES XXI / Enclave RAE**: ningún análisis publicado de cambio
  de frecuencias atribuible a LLM.
- **IberAuTexTification (IberLEF 2024)**: dataset de 168.128 unidades en
  seis lenguas y siete dominios; 21 equipos, 68 runs; ganaron modelos
  transformer. **Ninguna lista léxica publicada** a partir de él.
  https://ceur-ws.org/Vol-3756/IberAuTexTification2024_paper4.pdf

---

## 4. Diversidad léxica (alimenta la familia ESTADÍSTICA)

La dirección del efecto **no es consistente**: depende del modelo, la
temperatura y, sobre todo, del grupo humano de comparación.
- Reviriego et al., «Playing with words» (Machine Learning with
  Applications 18, 2024; UPM): GPT-3.5 «tends to use fewer distinct words
  and lower lexical richness than humans». Que GPT-4 «cierra la brecha y a
  veces la supera» lo dice un resumen del *Stanford Daily* («The great
  smoothing», 8/03/2026; periódico estudiantil, no revisión académica), no
  el artículo.
  https://www.researchgate.net/publication/373141924_Playing_with_Words_Comparing_the_Vocabulary_and_Lexical_Richness_of_ChatGPT_and_Humans
- Martínez et al. (ACM TIST, 2024): la diversidad varía con la temperatura.
- Kendro et al. (Int. J. Applied Linguistics, 2026;
  https://arxiv.org/pdf/2508.00086): los modelos «do not produce human-like
  texts in relation to lexical diversity»; en su tarea ChatGPT dio **más**
  diversidad que humanos; los modelos nuevos se alejan más.
- Fredrick y Craven (Frontiers in Education, 2025): frente a estudiantes de
  L2, ChatGPT TTR 0,69 vs 0,61; MTLD 118 vs 66,56. Más diversidad que los
  aprendices.
- Liang et al. (Patterns, 2023): los no nativos, con léxico limitado, dan
  baja perplejidad y son confundidos con IA.
- **Implicación**: TTR/MTLD bajos **no** indican IA de forma fiable. Usar
  solo como variable de contexto, normalizada por longitud (MTLD o MATTR,
  no TTR bruto).
- Longitud media de palabra y proporción de palabras raras/frecuentes:
  **ningún estudio en español con cifras**. Hipótesis [PROPIO], no
  resultado: el exceso se concentra en léxico de frecuencia baja-media
  (conjunto «raro» de Kobak).

---

## 5. Falsos positivos documentados

- **No nativos**: siete detectores clasificaron como IA de media el
  61,22 % de 91 redacciones TOEFL humanas; 19,78 % por unanimidad; 97,80 %
  por al menos uno. Con nativos de 8.º grado, precisión casi perfecta.
  https://www.cell.com/patterns/fulltext/S2666-3899(23)00130-7
- **Vocabulario «de IA» anterior a 2022**: *noteworthy* ya era exceso en
  PubMed en 2017–18 (Kobak, suplemento); Matsui fecha la subida en 2020;
  Juzek & Ward: casi todas las focal words ya subían.
- **Dependencia del género**: *tapestry* o *palpable* son normales en
  ficción y anómalas en prensa/academia (Reinhart). Wikipedia enlaza sus
  «words to watch» con su guía de «marketing buzzspeak»: la redacción
  promocional humana comparte ese léxico.
- **Heterogeneidad disciplinar**: Liang no detecta señal en reseñas de
  Nature pero sí en conferencias de IA. El umbral va por dominio.
- **Autocorrección**: tras difusión pública, *delve* e *intricate* bajan
  (Geng & Trotta 2025). Las listas caducan.
- **Turnitin** (cifras del fabricante,
  https://www.turnitin.com/blog/ai-writing-detection-update-from-turnitins-chief-product-officer):
  < 1 % falsos positivos a nivel documento solo para documentos con > 20 %
  de IA; a nivel de frase «Our sentence-level false positive rate is ~4%»;
  el 54 % de frases falsamente marcadas están junto a frases de IA real.

---

## 6. Detectores y listas por heurística léxica

- Wikipedia EN «Signs of AI writing» (listas con referencia por palabra;
  aviso de que no son prueba).
- Listas descargables: Kobak (github.com/berenslab/llm-excess-vocab), Liang
  (top-100 adjetivos/adverbios), Matsui (repositorio con Z), Juzek 2026
  (pipeline para 34 lenguas).
- Antislop / slop-forensics / EQ-Bench: listas por ratio contra base humana,
  regex para «not X but Y»; origen ficción inglesa.
- Guías editoriales o universitarias que **prohíban palabras concretas**:
  **ninguna fuente primaria encontrada**. Las políticas regulan el uso o la
  declaración de LLM, no el vocabulario.

---

## 7. CANDIDATAS A REGLA — familia léxico

| # | Patrón | Idioma documentado | Evidencia | Detector | Riesgo FP |
|---|---|---|---|---|---|
| L1 | Frases de chatbot: «¡Claro!», «Espero que esto te ayude», «Como modelo de lenguaje», «Certainly, here is…» | Inglés (Wikipedia; Gray/El País: copia-pega documentado) | Media-alta, casi inequívoca | Patrón | **Bajo**: rara en texto humano editado |
| L2 | Verbos de énfasis: *enfatizar, destacar, subrayar, realzar* | **Español** (Juzek 2026, 24/34 lenguas) | Media-fuerte (LPR; sin % español en texto) | Estadístico (densidad/1.000 vs base del género) | Alto: *destacar/subrayar* son léxico periodístico normal |
| L3 | *importancia* + fórmula «es importante (destacar/tener en cuenta/recordar)» | **Español**: lema medido (Juzek); fórmula solo en blogs; inglés: Wikipedia | Media (lema) / anecdótica (fórmula) | Estructural (regex inicio de frase) + estadístico | Medio-alto: fórmula didáctica humana |
| L4 | *innovador* y afines (*revolucionario, vanguardista*) | **Español** (Juzek 2026, 18/34) | Media | Estadístico | Alto: marketing y prensa económica |
| L5 | *imborrable, multidisciplinario, impecable* | **Español** (Juzek 2026, LPR alto, cH = 0) | Media | Patrón, peso bajo | Medio: dependientes de género; lista GPT-céntrica |
| L6 | Adjetivación densa (más adjetivos y más distintos) | **Español** (Alonso Simón 2025) | Media; cifras ⏳ PENDIENTE de leer el PDF | Estadístico (ratio ADJ/tokens, requiere POS) | Medio: crítica, reseñas, marketing |
| L7 | Menos adverbios y pronombres | **Español** (Alonso Simón 2025) | Media; cifras ⏳ PENDIENTE | Estadístico (requiere POS) | Medio: técnico humano también |
| L8 | Conectores de apertura: *Además, Adicionalmente, Cabe destacar* (*additionally, notably, particularly*) | Inglés con cifras (Kobak; Juzek EN LPR 6,74); español sin medición | Fuerte inglés / sin fuente español | Estructural (inicio de frase) + densidad | Alto: conectores normativos del español académico |
| L9 | *crucial, desafíos, exploraremos*; «en este artículo exploraremos», «consideraciones éticas» | Español (Turrado, no revisado); *crucial* medido en inglés | Media-baja | Patrón / estructural | Medio: *crucial* es común; método opaco |
| L10 | Traslados del inglés: *profundizar/ahondar* (delve), *intrincado, meticuloso, tapiz, encomiable, sin precedentes, panorama* (landscape) | Solo inglés (Kobak, Liang, Matsui) | Fuerte en inglés / **hipótesis** en español | Patrón, densidad | Medio: *profundizar* es muy común en español humano; *delve* ya en declive |
| L11 | Cierres «En resumen», «En conclusión», «En definitiva» | Inglés: Wikipedia (sin cifras); español: anécdota | Anecdótica | Estructural (último párrafo) | Alto: convención escolar y académica |
| L12 | «No solo… sino (también)» / «no es X, es Y» | Inglés: EQ-Bench (25 % del score), Wikipedia; español sin fuente | Media inglés / sin fuente español | Estructural (regex) | Medio-alto: construcción normativa |
| L13 | Tríadas adjetivales | Inglés: Wikipedia («rule of three»), sin cifras | Anecdótica | Estructural | Alto: recurso retórico clásico |
| L14 | Hedging («es posible que», «en cierto modo», «puede variar») | Sin medición en ningún idioma | Sin fuente con cifras | Estadístico | Alto: registro académico prudente |
| L15 | Verbos corporativos: *fomentar, potenciar, aprovechar, impulsar* (foster, leverage, empower, unlock, harness) | Solo inglés (lista Kobak) | Fuerte inglés | Patrón | Alto: corporativo y ONG humano |
| L16 | Léxico promocional: «en el corazón de», «rico», «vibrante», «sirve como testimonio» | Solo inglés (Wikipedia) | Media (casos, sin cifras) | Patrón | Alto: turismo y marketing |
| L17 | TTR/MTLD bajos | Inglés, resultados contradictorios | Media, dirección inconsistente | Estadístico | Alto: penaliza a no nativos |
| L18 | Ausencia de fórmulas humanas («para determinar», «los resultados sugieren») | Solo inglés (Matsui) | Media | Estadístico | Alto: señal por ausencia |

**Lectura de la tabla para el punto 5 (paquete v1):**
- Entran con peso propio: L1 (única de riesgo bajo), L2, L3, L4, L6, L7
  (lo medido en español).
- Entran con peso bajo y etiqueta «traslado del inglés» visible en la ficha:
  L8, L10, L12, L15.
- Entran solo si la ficha declara «evidencia anecdótica» y peso mínimo, o
  se dejan fuera de la v1: L5, L9, L11, L13, L16, L18.
- No entran en léxico: L14 (sin fuente) y L17 (va a estadística como
  contexto, no como señal).
- L6 y L7 requieren etiquetado gramatical (POS) en el navegador: **decisión
  técnica pendiente para el punto 3-4**, con la doc de la librería que se
  elija.

---

## 8. Recomendaciones de arquitectura derivadas (para los puntos 3-5)

1. Puntuación agregada por **densidad** (ocurrencias por 1.000 palabras),
   con umbrales calibrados sobre un corpus humano del mismo género anterior
   a 2022. Nunca disparo por una sola palabra, salvo L1.
2. Prioridad español: lo medido (L2, L3, L4, L6, L7). Lo trasladado del
   inglés, como hipótesis con peso bajo hasta validarlo con corpus propio.
3. Validación mínima antes de subir pesos: textos de varios modelos (GPT,
   Gemini, Claude, Llama; su léxico diverge) contra humano, por log-odds o
   LPR con suavizado, al estilo de Juzek.
4. Mantenimiento: revisar listas cada 6–12 meses. Las palabras señaladas
   públicamente decaen; las comunes (*significant, additionally*) suben.
5. Salvaguardas en pantalla: mostrar evidencia («5 marcadores por 1.000; la
   base del género es 1,8»), no veredicto. Rebajar peso en académico,
   corporativo, traducido y no nativo.

---

## 9. Huecos (buscado y no encontrado)

- Ningún estudio de exceso de vocabulario en literatura científica en
  español (SciELO, Dialnet, Redalyc).
- Ningún análisis de la RAE (CREA, CORPES, Enclave) ni de FundéuRAE sobre
  léxico de IA.
- Ninguna página de Wikipedia en español con señales léxicas.
- Ninguna medición en español de hedging, «no solo… sino», tríadas ni
  cierres «en resumen».
- Ninguna lista léxica derivada de IberAuTexTification.
- Ninguna guía editorial o universitaria que prohíba palabras concretas.
- No verificados íntegros: el PDF de Alonso Simón et al. (cifras) y el
  explorador aiwordexplorer.com.
