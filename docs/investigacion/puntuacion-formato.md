# Investigación — Familia PUNTUACIÓN Y FORMATO

> Punto 2 del `PLAN-RADIOGRAFIA.md`. Investigación realizada el 29/09/2026
> con el módulo de investigación de Claude (barrido multi-fuente) y redactada
> por la conversación de estrategia. Cada afirmación lleva su fuente con URL.
> Lo no verificado se marca. Lo buscado y no encontrado va en «Huecos».
>
> Regla de esta familia: **sin fuente no hay candidata.**
>
> ⚠️ Nota de método: antes de este documento se produjo un borrador sin
> fuentes (cifras de «Sardinha 2024» y «Pangram Labs» que no existen en la
> investigación) y se retiró. Este es el único válido: sale del informe con
> URL leídas.

## Resumen

En español solo hay **una** medición con significación estadística de la
puntuación en texto LLM: ROBOT-TALK (UCM, RAEL 23, 180 textos, GPT-3.5 y
GPT-4). Los modelos usan **más puntos** y **menos puntuación total, comas,
comillas, paréntesis, punto y coma, dos puntos, guion y barra**. Publica
niveles de significación, no densidades por 1.000 palabras.

La **raya (—)**, el marcador más citado, está medida solo en inglés,
cambia mucho por modelo y por época (GPT-4.1: 10,62 por 1.000 palabras;
GPT-5.4: 1,43; humanos: 3,23 de media, rango 0,33–17,12), y en español es
**norma** en diálogos e incisos. No sirve como regla binaria.

Los marcadores con menos falsos positivos son mecánicos: **Markdown
residual** (`**`, `#`, viñetas), **caracteres Unicode anómalos** (U+202F)
y **calcos ortotipográficos del inglés** (Title Case, «5%», «1,000», punto
dentro de las comillas). Los calcos tienen norma RAE clara pero **ninguna
medición en texto LLM en español**.

Consecuencia para el motor: esta familia es señal de **canal** (copiado de
un chat sin limpiar) y de **calco tipográfico**, no de autoría. Se activa en
conjunto, calibrada por género. Los falsos positivos vienen de periodismo y
literatura (raya), documentación técnica (Markdown), Word (comillas curvas
y raya automáticas) y prosa académica (paréntesis y comillas por citas).

---

## 1. Signos de puntuación medidos

### ROBOT-TALK — Alonso Simón, Fernández-Pampillón, Fernández Trinidad y Márquez Cruz (UCM), *RAEL* 23, 2025 — **ESPAÑOL**
- Fuente (PDF leído): https://matrix.aesla.org.es/RAEL/article/download/666/362/2949
  · DOI 10.58859/rael.v23i1.666
- Corpus: 180 textos (60 humanos, 60 GPT-3.5-Turbo, 60 GPT-4; 20 por
  dominio: artículos de lingüística, noticias, reseñas de cine). Sale de
  ROBOT-TALK: 765 textos, 398.501 tokens, jul. 2023–abr. 2024.
- Método: 21 rasgos ortográficos como proporción de signos sobre tokens
  (Sketch Engine); pruebas t o Wilcoxon y ANOVA por dominio.
- **Tabla 7, niveles de significación 0–3 (positivo = los humanos usan
  más):**
  - Puntuación total: 3 (GPT-3.5) y 2 (GPT-4).
  - Comillas, dos puntos, guion corto, paréntesis, barra, punto y coma y
    «otros» (guion, raya, marca de párrafo, +, asteriscos): 3 en ambos.
  - Coma: 3 y 2. Puntos suspensivos / «etc.»: 2 y 2.
  - **Punto: −3 y −3 (los modelos usan más).**
  - ¿ ?: 1 y 0. ¡ !, % y corchetes: 0 (sin datos suficientes).
- Citas: «los humanos utilizan, en total, más signos de puntuación que
  GPT-3.5 y GPT-4» · «los modelos usan significativamente más puntos que
  los humanos» · «los signos más informativos son las comillas, los
  paréntesis y los puntos».
- Por dominio: en **noticias** las diferencias son «sensiblemente menores»;
  para GPT-4 solo distinguen comillas, paréntesis y puntos.
- Lo que **no** da: densidades absolutas (posiblemente en OSF,
  https://osf.io/3ahb7/, no revisado); no separa « » de “ ” ni la raya del
  guion (la raya va en «otros»).

### AuTexTification (IberLEF 2023) — Alonso Simón et al.
- Fuente: https://ceur-ws.org/Vol-3496/autextification-paper17.pdf
- Cualitativo (5 lingüistas, 20 textos): «humans use more commas and
  comparatively fewer periods».
- Medido: un clasificador con **solo n-gramas de puntuación** da macro-F1
  47,08 en español (azar). Añadida a caracteres y palabras: 68,64 → 69,85.
- Conclusión: la puntuación sola no discrimina en textos cortos (52–63
  palabras) de modelos antiguos (BLOOM, GPT-3). Solo complementa.

### Réplica 2026 sobre AuTexTification — Skurla, Macko y Simko
- Fuente: https://arxiv.org/html/2603.15034
- 26 rasgos estilométricos (proporción de puntuación, comas, ! y ?): su
  aporte «falls within seed variance once predictability-based
  probabilities are included». F1 en español 0,502 → 0,527.

### Muñoz-Ortiz, Gómez-Rodríguez y Vilares (A Coruña), *AI Review* 57:265, 2024 — **INGLÉS, modelos base**
- Fuente: https://arxiv.org/pdf/2308.09067
- 13.371 entradillas del NYT frente a Mistral 7B, Falcon 7B, LLaMa 7B–65B.
- PUNCT (% de tokens): humanos 11,88; modelos 10,77 (LLaMa 7B) – 12,14
  (Falcon 7B). SYM: 0,09 vs 0,17–0,19. NUM: 1,77 vs 1,95–2,05.
- «Humans also use punctuation symbols more often (except when compared to
  Falcon)». Misma dirección que ROBOT-TALK, diferencia pequeña.

### Seguimientos (inglés)
- Gude et al. (A Coruña, CITIC), arXiv 2605.06030, 2026: «the 2025 models
  are much less diverse in their usage of punctuation».
  https://arxiv.org/html/2605.06030v1
- Zamaraeva et al., arXiv 2506.01407, 2025: los elementos frecuentes
  exclusivos de LLM «contain entries belonging to numeric and punctuation
  types». https://arxiv.org/html/2506.01407v1

### Reinhart et al. (PNAS 2025): sin cifras de puntuación
- https://www.pnas.org/doi/10.1073/pnas.2422455122 — 66 rasgos de Biber,
  ninguno de puntuación. Contexto, no fuente de reglas.

### *The Economist* («How to spot AI writing», 30/07/2026) — **leído en secundarias**
- OnTimeBrief (15/08/2026):
  https://ontimebrief.com/en/2026/08/15/economist-study-ai-writing-no-longer-betrayed-by-em-dashes/
  Corpus: reescrituras de artículos por ChatGPT, Claude, Gemini y Grok +
  control (CNN, NYT, WaPo, novelas 1950–2022); 55.940 frases, 1,2 M
  palabras. Los modelos usan «fewer commas and semicolons than humans and
  hardly any parentheses».
- Cita del original (vía Daring Fireball / BizNews): «A better way to spot
  AI-generated writing would be to look for texts without much
  punctuation at all».
- Fast Company:
  https://www.fastcompany.com/91584243/how-to-identify-ai-generated-writing-viral-report-has-surprising-new-clues-economist
  «AI-generated writing tends to feature long sentences with little
  variety in length, leading to blocky paragraphs».
- ⚠️ No leído el original (de pago); sin cifras por modelo.

### Herbold et al. 2023: **no revisado** en esta familia.

---

## 2. Raya (—), semirraya (–) y guion (-)

### Freeburg — «The Last Fingerprint: How Markdown Training Shapes LLM Prose», arXiv 2603.27006, marzo 2026 — **INGLÉS**
- Fuente: https://arxiv.org/html/2603.27006v1
- Ensayos ~1.000 palabras, 10 temas, 12 modelos, ~240.000 palabras. Cuenta
  solo U+2014.

| Modelo | Rayas / 1.000 palabras (sin restricción) | Pidiendo prosa sin Markdown |
|---|---|---|
| GPT-4.1 | 10,62 | 9,10 |
| Claude Opus 4.6 | 9,09 | 0,19 |
| Claude Sonnet 4 | 8,29 | 1,31 |
| Claude Haiku 3.5 | 7,51 | 0,18 |
| DeepSeek V3 | 6,95 | 5,41 |
| GPT-4o Mini | 4,16 | 4,23 |
| GPT-4o | 4,12 | 2,68 |
| Gemini 2.5 Pro | 3,53 | 0,00 |
| GPT-5.4 | 1,43 | 0,29 |
| Gemini 2.5 Flash | 1,28 | 1,48 |
| Llama 3.1 8B / 3.3 70B | 0,00 | 0,00 |
| **Humanos** (8 ensayos, 57.232 palabras) | **3,23** (mediana 3,83; rango 0,33–17,12) | — |

- Prohibiendo la raya explícitamente: GPT-4.1 conserva 3,86; DeepSeek V3,
  1,57. En textos de 5.000 palabras GPT-4.1 llega a 14,03.
- Cita: «Em dash frequency in human prose ranges from 0.33 to 17.12 per
  1,000 words».
- ⚠️ Preprint sin revisión por pares; base humana de 8 ensayos; solo
  inglés. Pedir «sin Markdown» elimina encabezados, viñetas y negritas en
  los 12 modelos, **pero no la raya**: sobrevive donde el Markdown ya se
  limpió.

### Cambio de época
- *The Economist* (30/07/2026, vía Daring Fireball 11/08/2026): «Today only
  Claude uses more em-dashes than human writers, with ChatGPT using
  markedly fewer than any other writer in our study». Coincide con GPT-5.4
  = 1,43.
- **Una regla calibrada con GPT-4o/4.1 (2024–25) caduca con los modelos de
  2026.**
- Anecdótico: experimento de blog, 10 historias por modelo: 0 rayas en
  GPT-3.5, 14 en GPT-4.1, 16 en GPT-4o (Sukhareva,
  https://substack.com/home/post/p-165661070). Sin rigor estadístico.

### Anuncio de OpenAI
- TechCrunch, 14/11/2025:
  https://www.techcrunch.com/2025/11/14/openai-says-its-fixed-chatgpts-em-dash-problem/
  Altman en X: si se pide en instrucciones personalizadas que no use
  rayas, «it finally does what it's supposed to do». **No es reducción por
  defecto**: OpenAI precisó en Threads que solo mejora el control.
- Cobertura en español (Hipertextual,
  https://hipertextual.com/inteligencia-artificial/openai-elimina-senal-que-delataba-chatgpt/;
  El Comercio): anécdota sin mediciones.
- No verificado: Freeburg cita un post de Altman de 2024 sobre ajuste de la
  raya por preferencia de usuarios. Sin fuente primaria.

### Espacios alrededor de la raya
- Wikipedia EN «Signs of AI writing»: «AI-generated em dashes are usually
  surrounded by spaces, contrary to common typographic guidelines».
  https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing (solo
  fragmento indexado; la página no se pudo descargar).
- Contradato (notas de prensa del Congreso de EE. UU.,
  https://arxiv.org/pdf/2608.05889): 67,2 % de U+2014 sin espacios, 29,5 %
  con, 3,3 % mixtas. AP pide espacios, Chicago no. **El espaciado depende
  del libro de estilo, no de la autoría.**

### Artefactos de codificación
- Estudio de 44 años de CHI (https://arxiv.org/pdf/2609.23090): la serie de
  U+2014 salta según cómo se escaneó cada volumen. Contando juntos raya,
  semirraya, doble guion y guion con espacios, la puntuación con rayas es
  estable: 0,68–1,41 por 1.000 tokens. Cita: «Neither series tracks
  writing. Both track which volume was scanned and how it was scanned».
- **Consecuencia: normalizar la familia de rayas (U+2014, U+2013, «--»,
  « - ») antes de contar.**

### Semirraya y guion
- Wikipedia (vía MakeUseOf,
  https://www.makeuseof.com/wikipedia-best-ai-writing-detection-guide/): la
  IA «skips en dashes entirely, using hyphens for ranges». Sin cifras.
- ROBOT-TALK: guion corto, los **humanos** usan más (significación 3).

### Norma RAE
- «El signo conocido como "em dash" equivale en la ortografía del español a
  la raya» (RAE en X, https://x.com/RAEinforma/status/2031288434682134706).
- Incisos: «Se encierran entre rayas los incisos»; la de cierre no se
  suprime aunque siga un punto (Ortografía básica,
  https://www.rae.es/ortograf%C3%ADa-b%C3%A1sica/uso-de-los-signos-ortogr%C3%A1ficos/signos-de-puntuaci%C3%B3n/la-raya).
  Aíslan más que las comas y menos que los paréntesis (DPD,
  https://www.rae.es/dpd/raya).
- Diálogos: «No debe dejarse espacio de separación entre la raya y el
  comienzo del enunciado». Listas con raya: sí espacio.
  https://www.rae.es/buen-uso-espa%C3%B1ol/la-raya-i-usos-como-signo-simple
- Implicación [PROPIO, no medido]: en español humano la raya pegada al
  inciso es lo correcto; la forma inglesa espaciada o de pausa enfática
  («palabra — palabra») es más específica que la mera presencia.

---

## 3. Comillas, apóstrofos y espacios

### Qué produce cada modelo (observación editorial, sin cifras)
- Wikipedia EN: los chatbots mezclan comillas curvas y rectas en una misma
  respuesta y usan apóstrofo curvo (’). «Curly quotes alone do not prove
  LLM use» (Word las convierte). «Gemini and Claude models typically do not
  use curly quotes». MakeUseOf: ChatGPT y DeepSeek suelen usar curvas.
- Un «humanizer» de código abierto cambió su regla para marcar la
  **mezcla**, no la tipografía curva: «Claude and Gemini rarely emit curly
  quotes; smart-quote tools and typesetting do»
  (https://github.com/hanamizuki/solopreneur/pull/195).

### Copiar y pegar (anecdótico, proveedores de herramientas)
- El botón «Copiar» de ChatGPT pone en el portapapeles el Markdown crudo
  con asteriscos literales (byteplus.com,
  https://www.byteplus.com/en/topic/559200; llm2doc,
  https://llm2doc.app/guides/paste-chatgpt-into-word — dice lo mismo de
  Claude y Gemini). Seleccionar el texto renderizado lleva HTML con
  formato. Google Docs tiene «Paste from Markdown».
- **Consecuencia**: el mismo texto de IA llega con `**` literales, sin
  Markdown, o con formato real, según el método de copia. El Markdown
  residual indica sobre todo que se pegó sin revisar.
- depost.ai (https://depost.ai/blog/chatgpt-watermark): en 8 respuestas
  copiadas de ChatGPT, sin caracteres ocultos pero con «Markdown, em
  dashes, and curly quotes». Anécdota.

### Norma RAE
- «En los textos impresos, se recomienda utilizar en primera instancia las
  comillas angulares» (« », luego “ ”, luego ‘ ’).
  https://www.rae.es/ortograf%C3%ADa-b%C3%A1sica/uso-de-los-signos-ortogr%C3%A1ficos/signos-de-puntuaci%C3%B3n/las-comillas
  · https://www.rae.es/espanol-al-dia/cuando-se-usa-cada-tipo-de-comillas
  La RAE reconoce que las angulares «no figuran como primera opción en los
  teclados».
- Punto, coma, punto y coma y dos puntos van **después** de las comillas de
  cierre (DPD, https://www.rae.es/dpd/comillas). El punto **dentro** («…”.»
  vs «….”») es calco del inglés detectable por regex. Sin medición en LLM.
- Sin espacio entre cierre de comillas/paréntesis y el signo siguiente
  (Libro de estilo,
  https://www.rae.es/libro-estilo-lengua-espa%C3%B1ola/puntuaci%C3%B3n).
- **Sin medición en LLM**: espacio antes de signo, doble espacio tras
  punto, U+00A0.

---

## 4. Markdown residual

- Wikipedia EN, sección «Use of Markdown»: asteriscos o guiones bajos para
  negrita/cursiva, «hash symbols (#) instead of equals signs (=) for
  section headings», separadores «---». Viñetas excesivas y negritas en
  casi todas las líneas (MakeUseOf). Sin cifras.
- **Medido (Freeburg 2026)**: sin instrucción, rasgos Markdown por 1.000
  palabras: GPT-4.1 6,27 · Claude Sonnet 4 6,15 · GPT-4o Mini 6,03 · GPT-4o
  5,38 · **GPT-5.4 0,00**. Pidiendo prosa: todos a 0 salvo Claude Haiku 3.5
  (0,9). **Muy específico cuando aparece; su ausencia no dice nada.**
- Stack Overflow: política del 5/12/2022 «ChatGPT is banned» (The Register,
  https://www.theregister.com/2022/12/05/stack_overflow_bans_chatgpt/;
  primaria https://meta.stackoverflow.com/questions/421831, no leída
  directamente). Trata de **exactitud**, no de formato.
- Revistas científicas y Reddit: sin políticas con criterios de formato ni
  cifras (hueco).

---

## 5. Estructura visual del párrafo

- ROBOT-TALK (medido, español): más oraciones por texto en GPT-3.5 y GPT-4,
  congruente con el exceso de puntos.
- *The Economist* (2026, vía Fast Company): frases largas y poco variadas,
  párrafos «rarely broken by short statements».
- **Contradicción**: ROBOT-TALK (GPT-3.5/4, español) mide más oraciones →
  más cortas; *The Economist* (modelos de 2026, inglés) describe frases
  largas. Época, idioma o género. **Longitud de frase no transferible sin
  calibrar** (ya dicho en sintaxis).
- Proporción de texto en listas, plantilla «encabezado + lista + cierre»,
  párrafo final de resumen: **sin mediciones**. Solo Wikipedia, cualitativo.

---

## 6. Mayúsculas

- RAE: en títulos de obras «solo empieza con mayúscula la primera palabra»
  (*El disputado voto del señor Cayo*; UCM siguiendo la RAE,
  https://www.ucm.es/ediciones-complutense/aspectos-ortotipograficos). En
  subdivisiones de documento, «solo se escribe con mayúscula inicial la
  primera palabra»
  (https://www.rae.es/ortograf%C3%ADa/denominaciones-relacionadas-con-la-actividad-intelectual-o-cultural-del-hombre).
  Días, meses y estaciones en minúscula (DPD,
  https://www.rae.es/dpd/may%C3%BAsculas).
- **Excepción que genera FP**: asignaturas (*Química Orgánica*),
  instituciones y organismos (*Ministerio de Asuntos Sociales*) llevan
  mayúscula en todas sus palabras significativas.
- **Medición en LLM en español: ninguna.** Title Case en encabezados es
  plausible como calco (uso masivo de encabezados Markdown), no
  documentado con cifras.

---

## 7. Números, cifras y unidades

- FundéuRAE/RAE: miles con espacio, no punto ni coma; en cifras de cuatro
  dígitos «es frecuente y válido omitir el espacio»
  (https://www.infobae.com/espana/2023/06/05/fundeurae-miles-y-millones-claves-de-escritura/).
  % separado con espacio («20 %»); vale también para $, € y °C
  (https://www.infobae.com/america/agencias/2025/04/04/fundeurae-el-simbolo-se-escribe-separado-de-la-cifra-a-la-que-acompana/).
- **FP masivo**: «50%» sin espacio es la forma más común en prensa y
  publicidad humanas; el punto de miles sigue vivo en América y en textos
  jurídicos
  (https://algomasquetraducir.com/como-escribir-numeros-en-espanol-correctamente-y-sin-errores/).
- Señal más específica: coma de miles inglesa («1,000» = mil) y punto
  decimal («3.14») en prosa de España. En México y otros países el punto
  decimal es normativo → **configuración regional**.
- Medido solo en inglés (Muñoz-Ortiz): más NUM y SYM en LLM base. **En
  español, ninguna medición del formato de cifras.**

---

## 8. Emojis y caracteres especiales

- **U+202F (espacio estrecho de no separación)**:
  - Rumi, 20/04/2025: o3 y o4-mini insertaban U+202F en respuestas largas
    (https://www.rumidocs.com/newsroom/new-chatgpt-models-seem-to-leave-watermarks-on-text).
    OpenAI, 22/04/2025: no es marca de agua sino «a quirk of large‑scale
    reinforcement learning».
  - Foro de OpenAI: GPT-5 sin razonamiento inserta U+202F «instead of the
    standard U+0020 space» en tablas, encabezados y prosa
    (https://community.openai.com/t/gpt-5-non-reasoning-outputs-u-202f-narrow-no-break-space-instead-of-normal-spaces-breaks-text-rendering-on-macos-apps/1362321).
  - Anecdótico, reproducible, **intermitente por versión**.
  - **FP**: U+202F es tipografía correcta en francés antes de ; : ! ? y
    dentro de cifras (Wikipedia, «Non-breaking space»); la RAE recomienda
    espacio fino en miles, que un maquetador puede escribir con U+202F o
    U+2009.
- Herramientas por reglas: TextPurify (https://textpurify.com/) y
  getgpt.app (https://getgpt.app/watermark) eliminan U+200B, U+202F,
  U+FEFF, U+2003… y normalizan comillas y rayas. Comerciales; sus
  afirmaciones sobre «marcas de agua» no verificadas.
- **Emojis, → ✅ ❌**: sin mediciones por modelo. ROBOT-TALK no los estudia.

---

## 9. Falsos positivos

- **Raya**: inglés humano 0,33–17,12 por 1.000 (rango ×50, Freeburg).
  slopdetector.org (proveedor): 3,7–10 por 1.000 en prosa literaria,
  *Huckleberry Finn* 10,13 (https://slopdetector.org/blog/em-dash-ai-tell-data).
  proofreaderpro.ai: 0,3 (ciencias), 1,1 (humanidades), 3,8 (IA) — sin
  metodología verificable, **no usar como umbral**. En español, toda la
  narrativa con diálogos usa raya por norma.
- **Comillas curvas y apóstrofo tipográfico**: Word y maquetación.
- **Markdown**: nativo en GitHub, Stack Overflow, Reddit, documentación.
- **Puntuación escasa y muchos puntos**: en noticias ROBOT-TALK no
  distingue bien a GPT-4; el estilo periodístico de frase corta dará FP.
- **Académicos**: los humanos usan **más** paréntesis y comillas
  (ROBOT-TALK). Pocos paréntesis = indicio débil; muchos no indican nada.
- Tasas de FP de detectores por modelo: **no buscadas** (presupuesto).

---

## 10. Herramientas por reglas existentes

- Limpiadores de Unicode (TextPurify, getgpt.app, distribb.io): lista fija
  de puntos de código; normalizan U+202F, ancho cero, comillas, rayas.
- Convertidores de Markdown (llm2doc, MDHero): documentan los residuos
  típicos: `**`, `#`, `|`, `---`, «\n» escapados.
- «Humanizer» derivado de Wikipedia (PR citado en §3): dejó de marcar
  comillas curvas coherentes y pasó a marcar la mezcla; deja de penalizar
  semirrayas en intervalos. **Buen modelo de reducción de FP.**
- **LanguageTool (reglas españolas)**: no consultado (hueco).

---

## 11. CANDIDATAS A REGLA — familia puntuación y formato

| # | Patrón | Idioma documentado | Evidencia | Detector | Regex basta | Riesgo FP (motivo) |
|---|---|---|---|---|---|---|
| P1 | Negrita Markdown literal `**texto**` / `__texto__` | Inglés (Wikipedia; Freeburg) | Media | Patrón | Sí | Bajo en prosa editorial; alto en desarrolladores, foros, notas MD |
| P2 | Encabezado `^#{1,6} ` | Inglés | Media | Patrón | Sí | Bajo en prosa; alto en documentación |
| P3 | «**Título:** texto» / negrita en primer sintagma de cada viñeta | Inglés (Wikipedia, cualitativo) | Anecdótica | Estructural (por viñeta) | Sí, recuento por lista | Medio: presentaciones, apuntes |
| P4 | `---` / `***` en línea propia; tablas con `\|` | Inglés | Anecdótica | Patrón | Sí | Medio: Markdown humano |
| P5 | U+202F fuera de contexto francés o de cifras | Inglés (Rumi; foro OpenAI) | Anecdótica reproducible, intermitente | Patrón | Sí | Bajo en español corriente; alto en francés o maquetado |
| P6 | U+200B, U+2060, U+FEFF en mitad del texto | Sin fuente LLM | Anecdótica (herramientas) | Patrón | Sí | Medio: editores web, PDF, BOM |
| P7 | Mezcla de comillas curvas y rectas en un texto | Inglés (Wikipedia) | Anecdótica | Estadístico simple | Sí | Medio: textos editados en varias herramientas |
| P8 | Comillas curvas “ ” o apóstrofo ’ solos | Inglés | Anecdótica; Wikipedia la desaconseja | **No recomendada** | Sí | Alto: Word, Docs, maquetación |
| P9 | Ausencia de « » en texto español formal | Norma RAE; sin LLM | Sin fuente LLM | **No recomendada** | Sí | Alto: casi nadie teclea « » |
| P10 | Punto o coma **dentro** de comillas de cierre (`[.,][”"]`) | Norma RAE; sin LLM | Sin fuente LLM | Patrón | Sí | Medio: traducciones, descuido humano |
| P11 | Densidad de rayas por 1.000 palabras sobre umbral | Inglés (Freeburg; Economist) | Fuerte con cifras en inglés; **inestable por versión** | Estadístico | Sí | Alto en español: diálogos e incisos normativos. Umbral ≥ 17/1.000 (máx. humano medido) y excluyendo diálogos |
| P12 | Raya espaciada enfática («palabra — palabra») | Inferencia propia sobre RAE; sin medición | Sin fuente | Patrón | Sí | Medio: estilo AP, traducciones |
| P13 | Raya de diálogo (`^—`) | Norma RAE | — | **Lista de exclusión** | Sí | Ninguno: se usa para desactivar P11 |
| P14 | Ratio comas/puntos bajo (más puntos, menos comas) | **Español** (ROBOT-TALK; AuTexTification) | Fuerte en significación, sin umbrales absolutos | Estadístico | Sí | Medio-alto: periodístico de frase corta; en noticias apenas discrimina |
| P15 | Pocos paréntesis, comillas, punto y coma, dos puntos, barras | **Español** (ROBOT-TALK, nivel 3) | Fuerte en significación, sin cifras absolutas | Estadístico | Sí | Medio: textos breves; no vale en noticias |
| P16 | Puntuación total baja por token | **Español** (ROBOT-TALK); inglés (Muñoz-Ortiz; Economist) | Media-fuerte | Estadístico | Sí | Medio: efecto pequeño en inglés |
| P17 | Omisión de ¿ ¡ | Español (ROBOT-TALK: sin diferencia) | Negativa | **No recomendada** | Sí | Alto: los LLM no muestran diferencia |
| P18 | Title Case en títulos/encabezados | Norma RAE; sin LLM | Sin fuente LLM | Patrón (≥ 3 palabras capitalizadas en encabezado) | Sí, con excepciones | Medio: nombres propios, instituciones, asignaturas, títulos en inglés |
| P19 | Mayúscula en meses/días fuera de inicio de frase | Norma RAE; sin LLM | Sin fuente LLM | Patrón | Sí | Medio: festividades, traducciones |
| P20 | Coma de miles («1,000») o punto decimal («3.14») en prosa de España | Norma FundéuRAE; sin LLM | Sin fuente LLM | Patrón + configuración regional | Sí | Alto en México/Centroamérica; bajo en España |
| P21 | «5%» sin espacio | Norma FundéuRAE; sin LLM | Sin fuente LLM | Patrón | Sí | Alto: mayoritario en prensa y publicidad |
| P22 | Moneda antepuesta sin espacio («$100», «€50») | Norma FundéuRAE; sin LLM | Sin fuente LLM | Patrón | Sí | Medio-alto: en América «$» antepuesto es normal |
| P23 | Guion (-) en intervalos numéricos en vez de semirraya | Inglés (Wikipedia, cualitativo) | Anecdótica | Patrón | Sí | Alto: casi todos los humanos usan guion |
| P24 | Emojis como viñeta, ✅ ❌ →, en texto formal | Sin cifras | Anecdótica | Patrón (lista Unicode) | Sí | Medio: redes y marketing |
| P25 | Frases largas y uniformes, párrafos en bloque | Inglés (Economist, secundaria) | Media, sin cifras | Estadístico | No (segmentación) | Medio; contradice ROBOT-TALK |

**Lectura para el paquete v1:**
- **Primer nivel (patrón, alta precisión)**: P1, P2, P3, P4, P5, P6.
  Informar como «artefacto de copia desde chat», no como «IA». Desactivar
  en documentación técnica.
- **Rasgo estadístico en español (respaldo ROBOT-TALK)**: P14, P15, P16.
  Calibrar umbrales con corpus propio y por género; en noticias, bajar el
  peso.
- **Raya**: P11 solo como aviso por densidad muy alta fuera de diálogos
  (P13 como exclusión), más P12. Nunca binaria. Recalibrar con cada
  generación de modelos.
- **Calcos ortotipográficos como avisos de norma RAE, no de IA**: P10,
  P18, P19, P20, P22.
- **Mezcla de comillas**: P7, peso bajo.
- **Descartar como indicio de IA**: P8, P9, P17, P21, P23.
- **Contexto**: P25 (ya cubierto en sintaxis como CV de longitud).

**Normalización previa obligatoria**: familia de rayas (U+2014, U+2013,
«--», « - ») a una sola clase antes de contar (estudio CHI).

---

## 12. Huecos (buscado y no encontrado)

- Raya en LLM en español: ninguna frecuencia medida (ROBOT-TALK la mete en
  «otros»).
- « » frente a “ ” en LLM en español: sin datos.
- Formato de cifras (miles, %, moneda, fechas, horas) en LLM en español:
  ninguna medición.
- Markdown, Title Case, mayúsculas de calco en LLM en español: ninguna
  cifra.
- Densidades absolutas de ROBOT-TALK: no en el artículo (¿OSF?).
- Capítulo de Alonso Simón, Jiménez-Bravo y Márquez Cruz sobre estilo
  cuantitativo con ROBOT-TALK (citado en *Alfinge* 37, 2025): no en abierto.
- Réplica independiente de ROBOT-TALK: no encontrada.
- Herbold et al. 2023: no revisado en esta familia.
- Reglas de LanguageTool para español: no consultadas.
- Políticas de revistas y Reddit con criterios de formato: no encontradas.
- Emojis y flechas por modelo: sin medición.
- Longitud/uniformidad de párrafo, proporción de listas, plantilla
  encabezado+lista+cierre: sin cifras.
- Tasas de FP de detectores por modelo: no buscadas.
- Portapapeles de Claude y Gemini: solo afirmaciones de proveedores.
- **Caducidad**: Freeburg es preprint con base humana de 8 ensayos;
  *The Economist* solo por secundarias; ROBOT-TALK mide GPT-3.5/4 de
  2023-24; Wikipedia cambia a menudo y se citó por fragmento indexado.
  Todo umbral de esta familia debe tener fecha y revisarse con cada gran
  lanzamiento de modelos.
