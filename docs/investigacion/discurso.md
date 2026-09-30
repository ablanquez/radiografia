# Investigación — Familia DISCURSO

> Punto 2 del `PLAN-RADIOGRAFIA.md`. **Investigación manual del 29/09/2026
> fusionada con el informe del módulo de investigación del 29/09/2026**
> (`informes/discurso-modulo.md`, 84 fuentes). Lo manual se conserva donde
> tenía fuente; lo del módulo se añade con sus URL; lo contradicho está
> corregido y marcado. Lo ya medido en otras familias se cita por
> referencia.
>
> Regla de esta familia: **sin fuente no hay candidata.**

## Resumen

**«La IA abusa de conectores» no se sostiene como regla general.** Lo
medido:

- En **ensayos** (Herbold et al. 2023, 270 textos), GPT-4 usa **menos**
  marcadores del discurso que los estudiantes (0,36 vs 0,57 por frase;
  d = 0,98) y casi **ningún marcador epistémico** (0,00 vs 0,06; d = 1,53).
  Todos los ensayos de ChatGPT cerraban con «In conclusion» (100 % de
  180). GPT-3.5 no difería de los humanos en marcadores.
- En **artículos de investigación** (Pham 2026), ChatGPT **duplica** las
  transiciones (43,73 vs 21,5 por 10.000 palabras) y todo el metadiscurso
  interactivo por igual; en **ensayos argumentativos** (Jiang & Hyland
  2025), ChatGPT usa **menos** metadiscurso total (41,1 vs 79,1 por
  1.000); en **resúmenes** (Corpus Pragmatics 2025), menos transiciones y
  más marcadores de encuadre.
- **Consistente en todos los géneros**: automenciones ≈ 0 (Pham: 0,00 vs
  2,14), menos actitud y compromiso, marcadores de encuadre por encima.
- **Tono**: la edición con LLM sube la positividad (+37–54 %) y la
  «confianza» (+17–53 %) y neutraliza la postura (≈70 % más ensayos
  neutrales en un ECA, Abdulhai et al. 2026).
- **Sobregeneralización**: OR 4,85 (Peters & Chin-Yee 2025); DeepSeek,
  GPT-4o y Llama 3.3 sobregeneralizan en el 26–73 % de los casos «even
  when explicitly prompted for accuracy».

Lo demás (puffery, análisis en gerundio, atribuciones vagas, rangos
falsos, «retos y futuro», tríadas) es **anecdótico** (Wikipedia, recuentos
informales de 3 vs 1), y la propia Wikipedia ya clasifica los resúmenes de
sección como indicio **histórico**.

**En español no consta ninguna medición** de marcadores del discurso ni
de metadiscurso en texto LLM. Solo la observación cualitativa de la UCM
(IberLEF 2023, 5 lingüistas, 20 textos): marcadores «scarce and
repetitive», más repetición de palabras y secuencias, más modismos en los
humanos.

**Consecuencias para el motor:**
1. La densidad bruta de conectores **no es señal**: cambia de signo por
   género. Se mide **diversidad** (tipos/ocurrencias), **repetición** del
   mismo marcador y **posición** (inicio de párrafo).
2. **Más peso a las ausencias que a las presencias**: los efectos grandes
   medidos son ausencias (epistémicos d = 1,53; automenciones 0).
3. **Atenuantes humanos que restan**: modismos, coloquialismos, anécdota
   en primera persona, referencias internas concretas («véase la Tabla
   2»). Reducen falsos positivos más que cualquier umbral. **Requisito
   nuevo para el esquema del punto 3: una regla puede tener peso
   negativo.**
4. **Ningún léxico de emociones en español con licencia compatible
   verificada** → D12 fuera de la v1 salvo hallazgo nuevo.
5. Todas las listas son inventario propio (DPDE: «only online», licencia
   NO CONSTA; Portolés y Martín Zorraquino sirven como taxonomía, no como
   datos).

---

## 1. Marcadores del discurso y epistémicos (medido, inglés)

### Herbold, Hautli-Janisz, Heuer, Kikteva y Trautsch — *Scientific Reports* 13:18617, 2023
- Fuentes: https://www.nature.com/articles/s41598-023-45644-9 ·
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10616290/
- Corpus: 90 temas × 3 fuentes = 270 ensayos (~200 palabras pedidas);
  humanos = estudiantes no nativos de Essay Forum; lista PDTB de
  marcadores; 111 docentes valoran.
- **Marcadores del discurso** (por frase): humanos 0,57 · GPT-3 0,52 ·
  GPT-4 0,36. Humanos vs GPT-3 p = 0,150 (sin diferencia); humanos vs
  GPT-4 p < 0,001, **d = 0,98**. «ChatGPT-4 uses significantly fewer
  discourse markers».
- **Marcadores epistémicos** («I think», «in my opinion»): 0,06 · 0,02
  (d = 1,01) · 0,00 (**d = 1,53**). «humans tend to use more modals and
  epistemic markers instead».
- **Coherencia vs marcadores**: r = −0,14 («the use of discourse markers
  is negatively correlated with logical coherence»).
- **Cierre**: «identical beginnings of the concluding sections of all
  ChatGPT essays ('In conclusion, [...]')» según el artículo; **los datos
  de replicación (Zenodo 10.5281/zenodo.8343644, leídos el 30/09 en el
  encargo 5.3) dan 166 de 180 (92 %)**, y 53 de 90 estudiantes (59 %)
  abren el último párrafo con una fórmula de cierre; aperturas
  «very similar starting with a general statement».
- **Corrección del 30/09 (fuentes primarias)**: los marcadores
  epistémicos de Herbold son 14 regex de su código de replicación («I
  think/believe/guess/assume», «it is believed», «in my opinion», «I would
  say», «it seems», «it is clear»…); «maybe» no aparece, y «perhaps» y
  «probably» están en `modals.csv` (la variable de los modales, no la de
  d = 1,53). En sus propios datos, **30 de 90 ensayos humanos (L2) tienen
  cero epistémicos** frente a 73/90 (GPT-3) y 90/90 (GPT-4): la ausencia
  sola dispara en un tercio de esos humanos.
- Hipótesis de los autores (opinión): «separating the different arguments
  into paragraphs, thereby reducing the need for discourse markers».
- Sesgos: humanos L2, ensayos cortos, modelos de marzo de 2023; la Tabla 4
  rotula mal dos columnas.

### Réplicas y síntesis
- *Smart Learning Environments* 2025
  (https://link.springer.com/article/10.1186/s40561-025-00388-z): «the AI
  model created coherence by dividing the text into smaller paragraphs»;
  cifras NO CONSTA.
- Mizumoto, *Applied Corpus Linguistics* 4:100106, 2024
  (https://www.sciencedirect.com/science/article/pii/S2666799124000236):
  el fragmento leído en la pasada manual decía «learners used more modals,
  epistemic markers, and discourse markers compared to ChatGPT»; el módulo
  no pudo confirmarlo (NO CONSTA por su parte). Se mantiene con esa
  reserva.
- Survey Terčon (arXiv 2510.05136): «Discourse markers seem to be less
  frequent in AIGT than in HWT»; atribuye «más repetitivos» a Herbold,
  que **no** mide repetición.

---

## 2. Metadiscurso (Hyland 2005), por categoría — inglés

### Pham — *IJAL* 15(3), 2026 (PDF leído por el módulo)
- Fuente: https://vm113.upi.edu/index.php/ijal/article/download/101/55
- Corpus: 100 artículos de *ESP* y *JEAP* (2020–24; 729.535 palabras) vs
  100 de ChatGPT (233.561; 5.000 pedidas, 1.000–2.000 obtenidas); AntConc;
  acuerdo entre anotadores 96 %. Frecuencias por 10.000 palabras.

| Categoría | Humano | ChatGPT | Razón |
|---|---|---|---|
| Transiciones | 21,5 | 43,73 | ×2,0 |
| Evidenciales | 16,7 | 34,50 | ×2,1 (citas «inaccurate and fictitious») |
| Marcadores de encuadre | 14,0 | 26,67 | ×1,9 |
| Glosas de código | 13,6 | 26,20 | ×1,9 |
| Endofóricos | 8,3 | 17,26 | ×2,1 (pero «see Table 5, see Figure 1» «rarely found» en ChatGPT) |
| Hedges | 20,55 | 34,29 | ×1,7 |
| Boosters | 8,99 | 9,55 | ×1,1 |
| Compromiso | 3,15 | 3,85 | ×1,2 |
| Actitud | 2,81 | 2,35 | ×0,8 |
| **Automenciones** | **2,14** | **0,00** | **0** («complete absence of self-mentions») |

- ⚠️ Observación crítica del módulo: las proporciones internas son casi
  idénticas (transiciones 28,95 % vs 29,47 %); **todo el metadiscurso
  interactivo se duplica en bloque**, lo que apunta a efecto de longitud
  o compresión, no a sobreuso selectivo. Densidades un orden de magnitud
  menores que en Jiang & Hyland → listas de búsqueda distintas, no
  comparables entre estudios. Pham: automenciones «should be interpreted
  with caution» (dependen del prompt).
- ⚠️ Corrección del manual: Pham es 2026 (IJAL 15(3)), no 2025.

### Jiang & Hyland (2025)
- *English for Specific Purposes* 79
  (https://www.sciencedirect.com/science/article/abs/pii/S0889490625000134):
  ensayos argumentativos; metadiscurso total ChatGPT **41,1 por 1.000**
  vs estudiantes **79,1**. «averaging 41.1 occurrences per 1,000 words».
- *Written Communication* 2025
  (https://journals.sagepub.com/doi/10.1177/07410883251328311): 145 ensayos
  por grupo; «fewer engagement markers, particularly questions and
  personal asides».
- Cifras secundarias (Cambridge, *Language Teaching*): postura 37,55 vs
  12,26 por 1.000; compromiso 16,99 vs 5,40 (estudiantes británicos vs
  ChatGPT).

### Otros géneros
- Resúmenes, *Corpus Pragmatics* 2025
  (https://link.springer.com/article/10.1007/s41701-025-00210-8): 320
  resúmenes; ChatGPT «use fewer textual metadiscourse markers, such as
  transitions» y «overused sentential frame markers, attitude markers,
  and verbs used to hedge and boost». Cifras NO CONSTA.
- Zhang & Zhang, *Applied Linguistics* 2025
  (https://academic.oup.com/applij/advance-article/doi/10.1093/applin/amaf032/8156998):
  en resúmenes «metadiscourse markers are much more prevalent in
  ChatGPT-generated abstracts». Cifras NO CONSTA.
- Hedging en paráfrasis (ResearchGate 388999631): ChatGPT «often
  moderates the intensity of both hedging and boosting». Cualitativo.

**Síntesis**: lo único consistente en todos los géneros es automenciones
≈ 0 y menos actitud/compromiso; el encuadre sale por encima en los tres
estudios académicos; hedges y transiciones cambian de signo según el
género.

---

## 3. Estructura: aperturas, cierres, resúmenes, «retos y futuro»

| Patrón | Evidencia | Tipo |
|---|---|---|
| Cierre «In conclusion» | Herbold: 100 % de 180 ensayos ChatGPT (prompt mínimo de 2023) | **Medido** |
| Encuadre «First/Second/In conclusion» | Pham 26,67 vs 14,0 /10k | **Medido** |
| Resúmenes de sección («In summary», «Overall») | Wikipedia «Signs of AI writing»; la copia actual lo clasifica como **«Historical indicators»**: indicio en desuso | Anecdótico, histórico |
| Sección «retos y futuro» | Wikipedia: «Despite its [positive/promotional words], [article subject] faces challenges…»; «This sign is about the rigid formula, not simply the mention of challenges» | Anecdótico |
| Regla de tres | Wikipedia; talk Archive 4: «Present in three AI-generated articles and in no human-written articles» | Recuento informal, muestra no declarada |
| Paralelismo negativo («no solo… sino») | Wikipedia | Anecdótico |
| Párrafo por idea / uniformidad de párrafos | Herbold (hipótesis); Springer 2025 sin cifra | Hipótesis |

- Wikipedia (https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing):
  el módulo no pudo leer la página original («cache-only»); trabajó con
  extractos de buscador. Avisos de la página: «Not all text featuring
  these indicators is AI-generated», «This page is not a Wikipedia
  policy». Talk Archive 4, hilo «Updated data on AI vs human text»:
  atribuciones vagas 3 IA vs 1 humano; «Outlines of challenges» 1 vs 0;
  notabilidad 2 vs 1; el experimento léxico asociado compara «~2,000,000
  tokens of AI and human text each». **Archive 5, críticas de FP**: «The
  rule of 3, em-dashes, negative parallelisms—these are all things that
  professional writing contain a lot of»; «writing by people who went
  through English colonial-descended education often gets mistaken for
  LLMs».
- Español: sin página equivalente; existe el criterio de borrado G12
  (https://es.wikipedia.org/wiki/Wikipedia:Criterios_para_el_borrado_r%C3%A1pido).

---

## 4. Tono y emoción (medido, inglés)

- **Muñoz-Ortiz et al. 2024** (https://arxiv.org/abs/2308.09067): «Humans
  tend to exhibit stronger negative emotions (such as fear and disgust)
  and less joy»; > 50 % neutrales en ambos; LLM algo más neutral.
- **Abdulhai et al. 2026**, «How LLMs distort our written language» (arXiv
  2603.18161, https://arxiv.org/pdf/2603.18161v1): ArgRewrite-v2 (86
  ensayos de 2021) editados por gpt-5-mini, gemini-2.5-flash y
  claude-haiku; NRC + LIWC. Positivo **+37–54 %**, *trust* **+17–53 %**
  (cifras tomadas de un extracto del PDF en ResearchGate, no de la tabla);
  «roughly doubling the use of both positive and negative sentiment».
  **ECA N = 100** («¿El dinero da la felicidad?»): «a nearly 70% increase
  in essays that remained neutral». También: «removal of first-person,
  experience-based argumentation toward impersonal language»; «LLM edits
  will often remove human colloquialisms, anecdotes, or examples»; incluso
  «minimal edits» desplazan el texto. **Preprint sin revisión.**
- LIWC arXiv 2401.16587: leído en la pasada manual (ChatGPT-3.5 «positive
  emotional tone» pero «no significant difference was found in positive or
  negative affect»); el módulo no lo localizó.

### Léxicos de emociones en español — licencias
- **NRC EmoLex** (https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm):
  «can be used freely for non-commercial research and educational
  purposes»; uso comercial con licencia de pago («perpetual commercial
  licence for a nominal one-time fee»,
  https://nrc.canada.ca/en/research-development/products-services/technical-advisory-services/sentiment-emotion-lexicons).
  La versión española es **traducción automática** (Google Translate,
  108 idiomas, 2022); rinde peor que iSOL y SEL
  (https://pmc.ncbi.nlm.nih.gov/articles/PMC9194861/).
- **SEL** (Sidorov et al. 2012, 2.036 palabras, 6 emociones de Ekman):
  licencia **NO CONSTA**. **SAL** (NRC Affect Intensity al español, ~5.000
  palabras): NO CONSTA. **LiLaH** (CLiPS): remite a SEL; NO CONSTA. NRC
  revisado en ELRA: CC BY-NC 4.0, y es francés.
- **Consecuencia**: para un Astro público y posiblemente comercial,
  **ningún léxico de emociones en español tiene licencia verificada que
  lo permita**. D12 fuera de la v1 salvo hallazgo nuevo (afecta a la
  decisión 3 de `CANDIDATAS.md`).

---

## 5. Sobregeneralización, atribuciones vagas, rangos, gerundio

- **Peters & Chin-Yee**, *R. Soc. Open Sci.* 12:241776, 2025
  (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12042776/): 10 LLM
  (GPT-3.5 Turbo, GPT-4 Turbo, Llama 2 70B, Claude 2, GPT-4o, GPT-4.5,
  Llama 3.3 70B, Claude 3.5 y 3.7 Sonnet, DeepSeek), 4.900 resúmenes de
  *Science*, *Nature*, *NEJM* y *Lancet* vs *NEJM Journal Watch*. «nearly
  five times more likely to contain broad generalizations (odds ratio =
  4.85, 95% CI [3.06, 7.70]». DeepSeek, GPT-4o y Llama 3.3 70B
  sobregeneralizan en el **26–73 %** «even when explicitly prompted for
  accuracy». Mecanismo detectable por reglas: paso de cuantificado o en
  pasado a **genérico en presente** (requiere POS de tiempo verbal).
- Atribuciones vagas («Experts argue», «Industry reports»): Wikipedia,
  recuento informal 3 vs 1. Anecdótico.
- Análisis superficial con gerundio final: Wikipedia («often done by
  attaching a present participle ('-ing') phrase»); medido en inglés vía
  Reinhart (participio presente 2–5×, `sintaxis.md` §2). En español: NO
  CONSTA. → **fusionado en S4** (`CANDIDATAS.md`, decisión 5).
- Rangos falsos y puffery de significancia: solo anecdótico (Wikipedia).

---

## 6. Persona y voz

- **Automenciones = 0** en ChatGPT vs 2,14 /10k humano (Pham). Medido.
- **La edición con LLM elimina primera persona, coloquialismos y
  anécdotas** (Abdulhai 2026). Medido (pronombres) + cualitativo
  (anécdotas).
- **Más expresiones idiomáticas en humanos** (español): UCM IberLEF 2023
  (https://ceur-ws.org/Vol-3496/autextification-paper17.pdf): «There are
  more frequent idiomatic expressions in texts written by humans».
  Cualitativo.
- Reinhart 2025: estilo «informationally dense, noun-heavy»; menos 1.ª y
  2.ª persona (0,4×, `sintaxis.md`).
- **Berber Sardinha 2024**, *Applied Corpus Linguistics* 4(1):100083 (doi
  10.1016/j.acorp.2023.100083): aplica Biber a ChatGPT (GPT-3.5) en
  conversación, académico, ensayo y noticias; una revisión de ACM (doi
  10.1145/3806206) lo resume: «Across all registers ChatGPT included less
  references (source-related and context-dependent)». **No leído el
  primario; cifras sin verificar.** (Nota: un borrador retirado el 29/09
  citaba «Sardinha 2024» con cifras inventadas; el artículo existe pero
  con otro contenido.)
- Nguyen-Son 2017 (clichés, contracciones): citado vía Fraser 2024 en la
  pasada manual; el módulo no lo localizó.

---

## 7. Coherencia y cohesión sin modelo

- **Repetición léxica** (UCM, español, cualitativo): «Generated texts show
  a greater repetition of words and sequences than human texts»; los
  humanos usan sinónimos y «pronominal substitution». → Medir
  **solapamiento de lemas entre oraciones adyacentes** y **ratio de
  pronombres anafóricos**. Requiere lematización ligera (reglas o listas).
- Coh-Metrix (noun/argument/stem overlap): existen estudios LLM vs humano
  (EJ1413432; ChatGPT vs Grok) sin dirección ni cifras en lo leído. HUECO.
- Entity grid (Barzilay & Lapata): sin aplicación con cifras a LLM;
  requiere parser. Poco viable.
- **Referencia interna concreta** («véase la Tabla 2»): Pham, «rarely
  found in ChatGPT corpus» → **indicio humano** en textos académicos.

---

## 8. Español: lo medido y lo que no

- UCM, IberLEF 2023 (52.191 textos ES; encuesta a 5 lingüistas sobre 20
  textos): marcadores «scarce and repetitive»; SVO «almost constantly»;
  menos comparativos y superlativos; más modismos en humanos; más
  repetición de palabras y secuencias. **Cualitativo**; los marcadores no
  se midieron como variable (solo n-gramas).
- ROBOT-TALK (RAEL 23): 17 variables significativas, **solo léxicas, de
  puntuación y de orden SVO**; los marcadores discursivos figuran como
  «potencialmente discriminativos» pero **no se midieron**. Artículo CC
  BY-NC 4.0.
- Blog bilateria.org: «suele concluir con frases como «En resumen,» o «En
  conclusión,»», «uso frecuente de la frase «Es importante»». Anecdótico.
- Vázquez Veiga 2026 (bachillerato español, 1.263 textos,
  https://boletinfilologia.uchile.cl/index.php/BDF/article/view/84771):
  «dominio limitado» de los marcadores en humanos; cifras NO CONSTA.
- **Inventarios**: DPDE (Briz, Pons, Portolés; https://www.dpde.es/):
  acceso libre en línea, «not distributed; only online»; licencia de
  reutilización **NO CONSTA**. Portolés 1998 y Martín Zorraquino &
  Portolés 1999 (GDLE): copyright editorial; sirven como **taxonomía**
  (estructuradores, conectores, reformuladores, operadores
  argumentativos, marcadores conversacionales), no como datos. →
  Construir lista cerrada **propia** de formas frecuentes (no
  protegibles), organizada por esa taxonomía y citada; no copiar entradas
  del DPDE.

---

## 9. Falsos positivos

- **L2**: TESL-EJ (https://tesl-ej.org/wordpress/issues/volume26/ej101/ej101a3/):
  los L2 «use logical connectors more frequently than native speaker
  student writers» para «impose surface logicality» (Crewe 1990), con
  tendencia a posición inicial. Estudio con coreanos
  (https://koreascience.or.kr/article/JAKO201402755361881.page): el
  sobreuso global «is invalid», pero *moreover/furthermore* y conectores
  cronológicos ~4× sobreusados. **Las reglas de conector inicial y
  encuadre chocan de lleno con la escritura L2.**
- **Escolar**: «In conclusion» y «En primer lugar… Por último» son la
  plantilla que se enseña; Herbold: «corresponds to the general structure
  that is sought after for argumentative essays».
- **Profesional/corporativa**: Wikipedia Archive 5 (tríadas, rayas,
  paralelismos «are all things that professional writing contain a lot
  of»). Anecdótico.
- **Editados con IA**: Abdulhai: incluso «minimal edits» desplazan el
  texto; un texto humano pulido con LLM hereda positividad y pierde
  primera persona. Frontera indecidible por reglas.
- **Divulgación y corporativo en español**: NO CONSTA.

---

## 10. Herramientas por reglas

- **LanguageTool español**: 1.644 reglas XML y 23 Java (v6.6, 27/03/2025)
  frente a 6.074/54 en inglés; **no consta** ninguna sobre marcadores
  discursivos ni plantillas de IA.
- **Humanizers derivados de Wikipedia** (p. ej. humanizeai.com,
  https://humanizeai.com/blog/wikipedias-signs-of-ai-writing-list-plus-a-prompt-you-can-turn-into-a-skill/):
  comerciales, sin validación. Implicación: los rasgos de la lista de
  Wikipedia son **los primeros que se borran** en un texto «humanizado»;
  su valor de detección decae.

---

## 11. CANDIDATAS A REGLA — familia discurso

| # | Patrón | Doc. | Evidencia | Detector | Necesita | FP |
|---|---|---|---|---|---|---|
| D1 | Último párrafo que empieza por «En conclusión / En resumen / En definitiva / En síntesis / Para concluir» | EN medido (Herbold 100 % de 180); ES anecdótico | Media-fuerte EN | Estructural + patrón | regex anclada al último párrafo | **Alto**: escolar y L2 |
| D2 | **Diversidad** de marcadores baja: tipos/ocurrencias bajo umbral, o el mismo marcador ≥ 3 veces | EN medido (Herbold d = 0,98: menos, no más); ES cualitativo (UCM) | Media | Estadístico | lista cerrada propia (taxonomía Portolés) | Medio (L2 también repite) |
| D3 | Ausencia de marcadores epistémicos («creo», «en mi opinión», «me parece», «quizá», «a lo mejor») en argumentativo > 300 palabras | EN medido (d = 1,01–1,53) | **Fuerte** (ausencia) | Estadístico (ausencia) | lista cerrada | Medio: técnico e impersonal |
| D4 | Automenciones = 0 (yo/nosotros/mi/nuestro en función autorial; -mos) en opinión o académico | EN medido (Pham 0,00 vs 2,14; Jiang & Hyland) | **Fuerte** (ausencia) | Estadístico | lista + persona verbal | Alto: géneros impersonales, prompt |
| D5 | Secuencia de encuadre completa («En primer lugar… En segundo lugar… Por último») y encuadre en posición inicial | EN medido (Pham ×1,9; Corpus Pragmatics 2025) | Media (académico) | Patrón | lista cerrada | **Alto**: L2, escolar |
| D6 | Referencia interna **concreta** («véase la Tabla 2», «como dije arriba») → **atenuante humano** (resta) | EN medido (Pham: «rarely found» en ChatGPT) | Media (académico) | Patrón | regex | Bajo como atenuante |
| D7 | Puffery de significancia («papel crucial», «marca un hito», «es un testimonio de») | EN anecd. (Wikipedia) | Anecdótica | Patrón | lista propia | Medio: prensa, marketing |
| D8 | → fusionado en **S4** (gerundio evaluativo final) | — | — | — | — | — |
| D9 | Atribuciones vagas («los expertos coinciden», «diversos estudios», «según informes del sector») sin nombre propio ni cifra cerca | EN anecd. (Wikipedia 3 vs 1) | Anecdótica | Patrón | regex + ventana sin nombre propio | Medio: periodismo |
| D10 | Rango falso («desde X hasta Y» no escalar) | EN anecd. | Anecdótica | Patrón | regex + lista de abstractos | Medio |
| D11 | «Retos y futuro»: «A pesar de… enfrenta desafíos» + cierre optimista | EN anecd. (Wikipedia, 1 vs 0) | Anecdótica | Patrón | regex | Bajo-medio |
| D12 | Positividad y «confianza» altas | EN medido (Abdulhai +37–54 %; Muñoz-Ortiz) | Media-fuerte EN | Estadístico | **léxico de emociones ES: sin licencia compatible verificada** | Alto |
| D13 | Sobregeneralización: genérico en presente tras marcador de síntesis | EN medido (OR 4,85; 26–73 %) | Fuerte (resúmenes científicos) | Patrón débil | POS (tiempo verbal) + lista | Alto; difícil sin sintaxis |
| D14 | Coloquialismos, modismos y anécdota en 1.ª persona → **atenuante humano** (resta) | ES cualitativo (UCM modismos); EN medido (Abdulhai) | Cualitativa / medida | Patrón | lista cerrada de modismos | Bajo como atenuante |
| **D15** | Solapamiento alto de lemas entre oraciones adyacentes (baja sustitución por sinónimos/anáfora) | ES cualitativo (UCM: «greater repetition of words and sequences») | Cualitativa | Estadístico | lematizador ligero o stemming | Medio: técnico |
| **D16** | Ratio de pronombres anafóricos baja | ES cualitativo (UCM: «pronominal substitution» humana) | Cualitativa | Estadístico | lista de pronombres | Medio |
| **D17** | Resumen interno en cada sección («En resumen,» a mitad, ≥ 2 veces) | EN (Wikipedia, marcado **histórico**) | Anecdótica, en desuso | Estructural | regex + segmentación | Medio |
| **D18** | Neutralización de postura (sin opinión marcada en texto argumentativo) | EN medido (ECA, ≈70 % más neutrales) | Media | Estadístico | lista de epistémicos + actitud | Alto: informativo |

**Lectura para el paquete v1:**
- **Peso propio (medido, ausencias)**: D3, D4. Solo en textos de opinión o
  argumentativos > 300 palabras; exigirlas combinadas.
- **Peso propio, calibrado por género**: D1 (poco peso: coincide con la
  plantilla escolar), D2 (diversidad y repetición, nunca densidad).
- **Peso medio, etiqueta de origen**: D5, D9, D15, D16, D18.
- **Anecdótico, peso bajo y etiqueta**: D7, D10, D11, D17.
- **Atenuantes humanos (peso negativo)**: D6, D14. **Requisito nuevo del
  esquema (punto 3): reglas con peso negativo.**
- **Fuera de la v1**: D12 (sin léxico con licencia), D13 (semántico).
- **Regla de interpretación en la ficha de D2**: «la IA abusa de
  conectores» no tiene respaldo; lo medido es menos densidad (ensayos) o
  más por efecto de longitud (artículos), y repertorio escaso.

---

## 12. Recomendaciones derivadas (del módulo, con fuente)

1. No implementar «muchos conectores = IA»: diversidad, repetición y
   posición sobre lista cerrada propia.
2. Más peso a las ausencias (d = 1,53; automenciones 0) que a las
   presencias; solo en opinión/argumentativo > 300 palabras; combinadas.
3. «En conclusión» en el último párrafo, poco peso; combinar con «retos y
   futuro», resúmenes internos, encuadre completo.
4. Atenuantes humanos que restan: reducen FP más que cualquier umbral.
5. Mostrar en la interfaz el nivel de evidencia de cada regla («medido
   en inglés», «anecdótico», «sin datos en español»); sin veredicto
   binario (coherente con Wikipedia: «Not all text featuring these
   indicators is AI-generated»).
6. Emoción fuera mientras no haya léxico en español con licencia
   compatible.
7. Calibrar en español antes de publicar umbrales: pedir ROBOT-TALK a la
   UCM o construir corpus propio por género. Todos los umbrales son
   hipótesis sin validar para el español.

---

## 13. Hallazgos que afectan a decisiones firmadas

- **Decisión 3 (léxico de emociones)**: ningún léxico en español con
  licencia compatible verificada (EmoLex solo no comercial y traducción
  automática de baja calidad; SEL/SAL/LiLaH NO CONSTA). → D12 queda
  **fuera de la v1** salvo que en el punto 3-4 aparezca uno; Antonio
  confirma.
- **Decisión 4 (listas propias)**: reforzada; DPDE «only online», licencia
  NO CONSTA; Portolés/Martín Zorraquino solo como taxonomía.
- **Requisito nuevo para el esquema del punto 3**: reglas con **peso
  negativo** (atenuantes humanos: D6, D14) y nivel de evidencia visible
  en la ficha y en la interfaz.
- **Decisión 5 (fusiones)**: D8→S4 confirmada.
- **Caducidad**: Wikipedia ya marca los resúmenes de sección como
  históricos y los humanizers borran primero estos rasgos; el paquete
  discurso debe llevar fecha y revisión con cada generación de modelos.

---

## 14. Huecos (buscado y no encontrado)

- **Español (crítico)**: ninguna medición cuantitativa de densidad o
  repertorio de marcadores, metadiscurso (Hyland), cierres, «retos y
  futuro», tríadas, gerundio evaluativo, atribuciones vagas,
  sobregeneralización ni emoción en texto LLM. ROBOT-TALK no midió
  marcadores.
- Licencias de SEL, SAL, LiLaH-ES y DPDE.
- Mizumoto 2024 (RMAL) con marcadores: NO CONSTA por el módulo; LIWC
  2401.16587 y Nguyen-Son 2017 no localizados por él (citados en la
  pasada manual).
- Cifras de solapamiento léxico entre oraciones adyacentes y de entity
  grid en LLM vs humano (Coh-Metrix EJ1413432 no leído con cifras).
- FP en divulgación y corporativo en español; reglas de estilo actuales de
  LanguageTool para español sobre marcadores.
- Cifras de uniformidad de longitud de párrafo en LLM.
- Página original de Wikipedia (leída por extractos; cambia a menudo).
- Berber Sardinha 2024 primario: no leído.
- Abdulhai 2026: cifras tomadas de un extracto, preprint.
- Modelos: Herbold mide marzo 2023; Pham, Jiang & Hyland 2025–26; Abdulhai
  gpt-5-mini/gemini-2.5/claude-haiku. Caducidad alta.
