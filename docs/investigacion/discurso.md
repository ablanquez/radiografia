# Investigación — Familia DISCURSO

> Punto 2 del `PLAN-RADIOGRAFIA.md`. Investigación realizada el 29/09/2026
> **a mano por la conversación de estrategia con búsqueda y lectura web**
> (el módulo de investigación no estuvo disponible). Menos amplia que
> léxico, sintaxis y puntuación; los huecos están declarados. Cada
> afirmación lleva su fuente con URL. Lo ya medido en otras familias se
> cita por referencia.
>
> Regla de esta familia: **sin fuente no hay candidata.**

## Resumen

El discurso es la familia donde más se nota la IA a ojo y donde menos
cifras hay. Lo medido con tamaño de efecto viene de un solo estudio
(Herbold et al. 2023, ensayos en inglés): ChatGPT-4 usa **menos marcadores
del discurso** que los humanos (d = 0,98 frente a estudiantes) y **menos
marcadores epistémicos** (d = 1,53), y estructura por párrafos en vez de
por conectores; todos sus ensayos cierran con «In conclusion, …». Un
segundo estudio (Pham 2025, artículos de lingüística) mide metadiscurso:
más **marcadores de encuadre** («en primer lugar», «este artículo…»),
menos glosas y referencias internas, **sin automenciones** y menos
marcadores de actitud. Un tercero (Muñoz-Ortiz 2024, noticias) mide
emoción: los LLM producen más alegría y menos miedo y asco. Un cuarto
(arXiv 2603.18161) mide que las ediciones de LLM sobre borradores humanos
suben la positividad un 37–54 %. Un quinto (Peters & Chin-Yee 2025) mide
**sobregeneralización**: los resúmenes de LLM contienen generalizaciones
amplias con OR 4,85 frente a los humanos.

El resto —puffery de significancia, análisis superficiales en gerundio,
atribuciones vagas («los expertos coinciden»), rangos falsos («desde X
hasta Y»), cierres de plantilla, «retos y perspectivas de futuro»— está
**documentado con ejemplos reales pero sin frecuencias** (Wikipedia
«Signs of AI writing»).

**En español no existe ninguna medición** de marcadores del discurso,
metadiscurso o estructura retórica en texto LLM. Solo la observación
cualitativa de la UCM (IberLEF 2023): «The discourse markers that appear in
generated texts are scarce and repetitive».

Consecuencia para el motor: las reglas de discurso son **estructurales**
(posición en el texto: apertura, cierre, inicio de párrafo) y de
**repertorio** (cuántos conectores distintos por cada 1.000 palabras, no
cuántos). La dirección medida es **menos y más repetitivos**, no «más
conectores»: la creencia popular de que la IA abusa de «además» y «sin
embargo» no está respaldada por Herbold; lo que está respaldado es que
usa pocos, siempre los mismos, y en posición de plantilla.

---

## 1. Marcadores del discurso y epistémicos (medido, inglés)

### Herbold, Hautli-Janisz, Heuer, Kikteva y Trautsch — *Scientific Reports* 13:18617, 2023
- Fuente: https://pmc.ncbi.nlm.nih.gov/articles/PMC10616290/
- Corpus: 90 ensayos argumentativos de estudiantes alemanes (inglés L2)
  frente a ChatGPT-3 y ChatGPT-4.
- **Marcadores del discurso** (por frase, media y DT): estudiantes 0,57
  (0,24) · ChatGPT-3 0,52 (0,19) · ChatGPT-4 0,36 (0,17). Significación:
  humanos vs GPT-3 p = 0,150 (sin diferencia); humanos vs GPT-4 p < 0,001,
  **d = 0,98**; GPT-3 vs GPT-4 d = 0,85.
- **Marcadores epistémicos**: 0,06 (0,06) · 0,02 (0,03) · 0,00 (0,00).
  d = 1,01 (vs GPT-3), **d = 1,53** (vs GPT-4).
- Citas: «while the ChatGPT models write more complex sentences and use
  more nominalizations, humans tend to use more modals and epistemic
  markers instead» · «The AI-generated essays are highly structured, which
  for instance is reflected by the identical beginnings of the concluding
  sections of all ChatGPT essays ('In conclusion, [...]')» · «instead of
  using discourse markers, the AI models provide a clear logical structure
  by separating the different arguments into paragraphs, thereby reducing
  the need for discourse markers».
- Hallazgo colateral: el uso de marcadores del discurso **correlaciona
  negativamente con la coherencia lógica** evaluada por profesores.
- Sesgo: población L2 escolar; modelos de 2023.

### Réplicas y extensiones
- Mizumoto et al. (?) — «Identifying ChatGPT-generated texts in EFL
  students' writing», *Research Methods in Applied Linguistics* 2024:
  https://www.sciencedirect.com/science/article/pii/S2666799124000236
  263 ensayos; «learners used more modals, epistemic markers, and discourse
  markers compared to ChatGPT»; los aprendices usan modales para
  hedging, epistémicos para opinión personal desde experiencia real, y
  marcadores para organizar.
- Adaptaciones de relatos (L2 vs ChatGPT), *Smart Learning Environments*
  2025: https://link.springer.com/article/10.1186/s40561-025-00388-z —
  «the students used more discourse markers than ChatGPT models to create
  cohesion, whereas ChatGPT maintained coherence by dividing the arguments
  into more paragraphs»; los estudiantes usan más «and, so, yet, however,
  while, when».
- Sage 2025 («ChatGPT theses»,
  https://journals.sagepub.com/doi/pdf/10.1177/20427530251331083): marca
  «fragmented argumentation flow, […] formulaic structures, and excessive
  objectivity» y falta de marcadores. Cualitativo.

---

## 2. Metadiscurso (medido, inglés académico)

### Pham, «Metadiscourse in ChatGPT-generated and human-written research articles in linguistics», *IJAL* (UPI), 2025
- Fuente: https://ijal.upi.edu/index.php/ijal/article/download/101/55/1138
  · https://vm113.upi.edu/index.php/ijal/article/view/101
- Corpus: 100 artículos humanos + 100 generados; modelo de Hyland (2005);
  AntConc.
- Hallazgos: «Transitions occur the most frequently among interactive
  markers»; «the frequent use of **frame markers** in ChatGPT texts,
  compared to a human corpus, indicates a strong reliance on formulaic
  structure»; «The sparse use of **code glosses and endophoric markers** in
  ChatGPT also suggests limited references within the text»; «the ChatGPT
  corpus **lacks self-mentions** and fewer attitude markers».
- Cifras exactas por categoría: ⏳ PENDIENTE de leer el PDF entero.
- Trasladable: los marcadores de encuadre en español («en primer lugar»,
  «a continuación», «este artículo aborda», «en este sentido»), la
  ausencia de «yo/nosotros creemos», y la escasez de reformulación («es
  decir», «en otras palabras») y de referencia interna («como se vio
  arriba»).

### Hedging y boosting en paráfrasis (cualitativo)
- «How AI tools affect discourse markers when paraphrased» (ResearchGate,
  2025): https://www.researchgate.net/publication/388999631 — ChatGPT
  «often moderates the intensity of both hedging and boosting»
  («undoubtedly confirms» → «clearly affirms»). Sin cifras.

---

## 3. Tono, emoción y positividad (medido)

- **Muñoz-Ortiz et al. 2024** (noticias, modelos base, inglés):
  https://link.springer.com/article/10.1007/s10462-024-10903-2
  «human texts demonstrate a greater inclination towards negative and
  aggressive emotions like disgust and fear» · «LLMs tend to generate
  more texts imbued with positive emotions, such as surprise and
  especially joy». Más del 50 % de textos neutrales en ambos, «with the
  LLM-generated text demonstrating a slightly higher inclination towards
  neutrality».
- **«How LLMs distort our written language»** (arXiv 2603.18161,
  https://arxiv.org/pdf/2603.18161): ediciones de LLM sobre ArgRewrite-v2
  con léxico NRC: «LLMs increase positive sentiment (37-54%) and
  trust-related language (17-53%), while also simultaneously increasing
  negative sentiment (24-38%)». «LLMs systematically reframe arguments in
  more positive, optimistic terms, even when the original human text may
  have been critical or skeptical». Menos pronunciado en claude-haiku con
  feedback experto.
- LIWC sobre diálogos (arXiv 2401.16587,
  https://arxiv.org/pdf/2401.16587): ChatGPT-3.5 «excels in categories such
  as social processes, analytical style, cognition, attentional focus, and
  positive emotional tone»; pero «no significant difference was found in
  positive or negative affect». Contradictorio con lo anterior según la
  métrica.
- Herramienta: un léxico de emociones **en español** (NRC tiene traducción
  automática; calidad NO CONSTA) sería necesario. Hueco.

---

## 4. Sobregeneralización y atribuciones vagas

- **Peters & Chin-Yee, «Generalization bias in LLM summarization of
  scientific research», *Royal Society Open Science* 2025** (DOI
  10.1098/rsos.241776): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12042776/
  4.900 resúmenes de 10 LLM (GPT-4o, 4.5, DeepSeek, Llama 3.3 70B, Claude
  3.7). «LLM summaries were nearly five times more likely to contain broad
  generalizations (odds ratio = 4.85, 95% CI [3.06, 7.70], p < 0.001)»
  frente a resúmenes humanos de NEJM Journal Watch. Mitigación:
  temperatura baja.
- **Wikipedia «Signs of AI writing»** (sección Content, vía
  https://defaanged.mataroa.blog/blog/wikipedia-how-to-spot-ai-generated-writing/
  y https://erkansaka.net/2025/09/27/wikipedia-signs-of-ai-writing-guide/):
  - *Undue emphasis on significance*: «LLM writing often puffs up the
    importance of the subject matter by adding statements about how
    arbitrary aspects of the topic represent or contribute to a broader
    topic». Palabras: «stands/serves as, is a testament, pivotal/key
    role/moment, underscores/highlights its importance, reflects broader,
    enduring/lasting legacy, setting the stage for, evolving landscape».
  - *Superficial analyses* en gerundio/participio: «…, highlighting its
    significance», «…, reflecting the importance of».
  - *Vague attributions* y exageración de corroboración: «They may present
    views from one or two sources as widely held», «mention the existence
    or opinion of multiple "reviewers" or "scholars" while only citing
    one person». Formas: «experts argue», «observers have noted», «critics
    suggest», «research shows» sin cita.
  - *False ranges*: «from X to Y» con extremos incoherentes.
  - *Rule of three* (ya en `sintaxis.md` §4, anecdótico).
  - *Conclusions*: «In conclusion / In summary / Overall»; «Despite
    challenges, [subject] continues to thrive»; especulación sobre «future
    prospects»; sección «Challenges and Future» de plantilla.
  - *Negative parallelisms* (ya en sintaxis/léxico).
  - Todo **sin frecuencias**; ejemplos reales de Wikipedia; el propio
    ensayo advierte que «Not all text featuring these indicators is
    AI-generated».

---

## 5. Estructura del texto y persona

- **Cierre de plantilla**: Herbold, «In conclusion» idéntico en todos los
  ensayos de ChatGPT (medido: 100 % de la muestra generada).
- **Estructura por párrafos en vez de por conectores**: Herbold; réplica
  en relatos 2025 (§1).
- **Ausencia de primera y segunda persona**: Reinhart 2025, 0,4× (ya en
  `sintaxis.md` §2); Pham: «lacks self-mentions».
- **Estilo informativo uniforme entre géneros**: Reinhart, «LLMs'
  grammatical style is highly consistent across genres, unlike human
  writing» (`sintaxis.md`).
- **«And» como palabra más sobreusada y ausencia de citas de expertos**:
  *The Economist* 2026 vía secundarias (`puntuacion-formato.md` §1).
- **Clichés, modismos, contracciones y grafías de pronunciación son
  humanos**: Fraser et al. 2024 (https://arxiv.org/pdf/2406.15583) citando
  a Nguyen-Son 2017: «humans are more likely to use clichés, idioms, and
  archaic language than machines». Señal por ausencia, débil.
- **Español (cualitativo)**: UCM, IberLEF 2023
  (https://ceur-ws.org/Vol-3496/autextification-paper17.pdf): «The
  discourse markers that appear in generated texts are scarce and
  repetitive».

---

## 6. Español: lo buscado y no encontrado

- Ningún estudio de marcadores del discurso o metadiscurso en texto LLM
  en español. La bibliografía de marcadores en español es abundante
  (Portolés; Martín Zorraquino; diccionario de partículas discursivas
  https://www.dpde.es no verificado), pero sobre humanos y L2, no sobre
  LLM.
- ROBOT-TALK (`sintaxis.md`) no mide discurso.
- Las listas de «en resumen», «es importante destacar», «cabe destacar»,
  «en el mundo actual» (`lexico.md` §3) son anecdóticas.
- **Inventario útil de conectores del español** para construir el
  repertorio (no como evidencia LLM): categorías del profesorado de ELE
  (introducir, añadir, oponer, causa, consecuencia, reformular, ordenar,
  resumir, concluir), p. ej. https://www.profedeele.es/actividad/marcadores-discursivos-conectores/

---

## 7. Falsos positivos

- **Redacción escolar y académica**: la estructura introducción-cuerpo-
  «en conclusión» se enseña; Herbold lo reconoce: «this corresponds to
  the general structure that is sought after for argumentative essays».
- **L2 y aprendices**: usan **más** marcadores (Herbold; Mizumoto); un
  detector de «pocos marcadores» los protege, pero uno de «marcadores
  repetitivos» puede marcarlos.
- **Prosa corporativa y de marketing**: puffery de significancia y
  positividad son su norma (Wikipedia enlaza con «marketing buzzspeak»,
  ver `lexico.md` §5).
- **Divulgación**: atribuciones vagas («los expertos») son frecuentes en
  prensa humana.
- **Textos editados con IA**: la positividad sube aunque el borrador sea
  humano (arXiv 2603.18161): la señal marca la edición, no la autoría.

---

## 8. CANDIDATAS A REGLA — familia discurso

| # | Patrón | Idioma documentado | Evidencia | Detector | Necesita | Riesgo FP |
|---|---|---|---|---|---|---|
| D1 | Cierre de plantilla: último párrafo empieza por «En conclusión / En resumen / En definitiva / Para concluir» | Inglés medido (Herbold: 100 % de ensayos GPT); español anecdótico | Media-fuerte en inglés | Estructural (último párrafo) | Regex | Alto: convención escolar y académica |
| D2 | Repertorio pobre de conectores: pocos tipos distintos por 1.000 palabras y los mismos repetidos | Inglés medido (Herbold d = 0,98 vs GPT-4); español cualitativo (UCM: «scarce and repetitive») | Media | Estadístico (tipos/ocurrencias sobre lista cerrada) | Lista de conectores del español | Medio: prosa técnica humana |
| D3 | Densidad baja de marcadores epistémicos («creo», «me parece», «quizá», «probablemente», «en mi opinión») | Inglés medido (d = 1,53) | Fuerte inglés | Estadístico | Lista cerrada | Alto: académico y periodístico informativo evitan la primera persona |
| D4 | Ausencia total de primera persona y de automenciones | Inglés (Reinhart 0,4×; Pham) | Media-fuerte | Estadístico | Regex de pronombres y desinencias | Alto: informativo, académico |
| D5 | Marcadores de encuadre en exceso y en posición inicial («En primer lugar», «A continuación», «En este sentido», «Este artículo…») | Inglés (Pham) | Media (sin cifras leídas) | Estructural (inicio de párrafo/frase) | Lista cerrada | Medio: académico |
| D6 | Escasez de reformulación y referencia interna («es decir», «en otras palabras», «como se ha visto») | Inglés (Pham) | Media | Estadístico | Lista cerrada | Medio |
| D7 | Puffery de significancia («marca un hito», «papel crucial/fundamental», «refleja una tendencia más amplia», «legado duradero», «pone de manifiesto la importancia») | Inglés (Wikipedia, ejemplos reales, sin cifras) | Anecdótica | Patrón | Lista traducida [PROPIO] | Alto: marketing, prensa institucional |
| D8 | Análisis superficial en gerundio al final de frase («…, destacando su importancia», «…, reflejando…», «…, lo que subraya…») | Inglés (Wikipedia; Reinhart participio presente 2–5×) | Media | Estructural | Regex «, + gerundio/“lo que” + verbo de significancia» | Medio |
| D9 | Atribuciones vagas («los expertos coinciden», «diversos estudios muestran», «muchos críticos») sin nombre ni cita | Inglés (Wikipedia); sobregeneralización medida (Peters & Chin-Yee OR 4,85) | Media | Patrón | Lista cerrada | Alto: divulgación y prensa |
| D10 | Rangos falsos («desde X hasta Y» con extremos no escalares) | Inglés (Wikipedia) | Anecdótica | Patrón | Regex + juicio | Medio |
| D11 | Sección/párrafo «retos y perspectivas de futuro», «a pesar de los desafíos… sigue…» | Inglés (Wikipedia) | Anecdótica | Estructural | Lista cerrada | Medio |
| D12 | Positividad y «confianza» léxica elevadas frente a la base del género | Inglés medido (Muñoz-Ortiz; 2603.18161: +37–54 %) | Media-fuerte | Estadístico | **Léxico de emociones en español** (NO CONSTA calidad) | Alto: marketing; marca edición, no autoría |
| D13 | Sobregeneralización (afirmaciones sin cuantificador ni restricción: «los X hacen Y») | Inglés medido (OR 4,85) | Fuerte en resúmenes científicos | Estructural | Requiere análisis semántico; **no viable por regex** | — |
| D14 | Ausencia de clichés, modismos y coloquialismos | Inglés (Nguyen-Son 2017 vía Fraser) | Anecdótica | Señal por ausencia | Lista | Alto |

**Lectura para el paquete v1:**
- **Con respaldo medido y viable por regex/listas**: D1 (posición),
  D2 (repertorio, dirección «pocos y repetidos», no «muchos»), D3, D4
  (con peso bajo en géneros informativos), D8.
- **Anecdótico, entra con etiqueta y peso bajo**: D5, D6, D7, D9, D11.
- **Requiere recurso externo o no viable**: D12 (léxico de emociones en
  español, decisión del punto 3-4), D13 (semántico: fuera), D10 (juicio:
  fuera), D14 (fuera).
- **Regla de interpretación**: la creencia «la IA abusa de conectores» no
  tiene respaldo; lo medido es lo contrario en densidad y la repetición en
  repertorio. La ficha de D2 debe decirlo.

---

## 9. Recomendaciones derivadas

1. Todas las listas cerradas del español (conectores, epistémicos,
   encuadre, puffery, atribuciones vagas) son **traducciones o
   inventarios [PROPIO]** hasta que exista medición en español. La ficha
   de cada regla lo declara.
2. D1 y D2 se calibran con textos humanos por género (escolar y académico
   dan D1 casi siempre).
3. Para D12 hace falta decidir si entra un léxico de emociones en español
   con licencia compatible; si no, D12 queda fuera de la v1.
4. Relanzar esta familia con el módulo de investigación cuando esté
   disponible: es la que más se beneficiaría de un barrido amplio
   (metadiscurso en español, corpus de opinión, Portolés/Martín Zorraquino
   como taxonomía de partida).

---

## 10. Huecos (buscado y no encontrado, o no buscado)

- Cualquier medición en español de marcadores del discurso, metadiscurso,
  cierres, atribuciones o emoción en texto LLM.
- Cifras por categoría de Pham 2025 (PDF no leído entero).
- Página original de Wikipedia «Signs of AI writing» (leída por
  secundarias; la página cambia a menudo).
- Frecuencias de puffery, atribuciones vagas, rangos falsos, «retos y
  futuro» en cualquier idioma.
- Léxico de emociones en español con licencia verificada (NRC traducido,
  otros).
- Estudios de coherencia medible sin modelo (cadenas léxicas, entity grid)
  aplicados a LLM: no buscados.
- Preguntas retóricas seguidas de respuesta: sin medición (ya en sintaxis).
- Herramientas por reglas de discurso (LanguageTool estilo, «humanizers»
  basados en Wikipedia como el PR de `puntuacion-formato.md` §3): no
  revisadas para español.
- Modelos: Herbold mide GPT-3/4 de 2023; Pham y Muñoz-Ortiz, modelos de
  2023–24. Caducidad alta.
