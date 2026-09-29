# CANDIDATAS A REGLA — lista consolidada (punto 2, casilla final)

> Consolidación de las tablas de las cinco investigaciones
> (`lexico.md`, `sintaxis.md`, `puntuacion-formato.md`, `estadistica.md`,
> `discurso.md`). Cada fila remite a su ficha de origen, donde están las
> fuentes con URL. Aquí solo: patrón, familia, dónde está documentado, tipo
> de detector, qué necesita el motor, riesgo de falso positivo y la lectura
> para la v1 que propone cada investigación. **La decisión de qué entra es
> de Antonio**; la columna «v1» es la propuesta.
>
> Leyenda «v1»: **P** = entra con peso propio · **m** = entra con peso
> medio o bajo y etiqueta de origen en la ficha · **c** = solo contexto
> (se muestra, no puntúa) · **a** = aviso de estilo/traducción/canal, no
> de autoría · **✗** = fuera de la v1 · **?** = depende de una decisión
> técnica pendiente (POS, léxico de emociones).
>
> Leyenda «necesita»: conteo = tokenización y regex · lista = lista cerrada
> del español (inventario propio salvo que se diga) · frec = lista de
> frecuencias · sil = silabeador · POS = etiquetador gramatical · parse =
> análisis sintáctico.

## Recuento

| Familia | Candidatas | P | m | c/a | ? | ✗ |
|---|---|---|---|---|---|---|
| Léxico | 18 | 6 | 4 | 0 | 2 (L6, L7 → POS) | 6 |
| Sintaxis | 16 | 1 | 3 | 2 | 5 (POS/parse) | 5 |
| Puntuación y formato | 25 | 6 | 4 | 10 | 0 | 5 |
| Estadística | 16 | 0 | 5 | 5 | 1 | 5 |
| Discurso | 18 | 4 | 8 | 2 (atenuantes) | 0 | 4 |
| **Total** | **93** (85 tras fusionar duplicados) | **17** | **24** | **19** | **8** | **25** |

Solo **14 de 93** tienen medición directa en español (L2–L7, S1, S9, S10,
P1, P2, P14–P16, E13 vía ROBOT-TALK/Juzek/Gargova). El resto es traslado
del inglés, norma RAE o anécdota, y la ficha de cada regla lo dirá.

## Léxico (`lexico.md` §7)

| ID | Patrón | Doc. | Evidencia | Detector | Necesita | FP | v1 |
|---|---|---|---|---|---|---|---|
| L1 | Frases de chatbot («Espero que esto te ayude», «Como modelo de lenguaje») | EN + copia-pega documentado | Media-alta | Patrón | lista | Bajo | P |
| L2 | Verbos de énfasis (enfatizar, destacar, subrayar, realzar) | **ES** (Juzek) | Media-fuerte | Estadístico | lista | Alto | P |
| L3 | *importancia* + «es importante (destacar…)» | **ES** lema; fórmula anecd. | Media | Estructural + estadístico | lista | Medio-alto | P |
| L4 | *innovador* y afines | **ES** (Juzek) | Media | Estadístico | lista | Alto | P |
| L5 | *imborrable, multidisciplinario, impecable* | **ES** (Juzek) | Media | Patrón | lista | Medio | ✗/m |
| L6 | Adjetivación densa | **ES** (Alonso Simón) | Media (cifras ⏳) | Estadístico | POS | Medio | ? |
| L7 | Menos adverbios y pronombres | **ES** (Alonso Simón) | Media (cifras ⏳) | Estadístico | POS | Medio | ? |
| L8 | Conectores de apertura (Además, Adicionalmente, Cabe destacar) | EN cifras; ES sin | Fuerte EN | Estructural | lista | Alto | m |
| L9 | *crucial, desafíos, exploraremos*, «en este artículo exploraremos» | ES no revisado (Turrado) | Media-baja | Patrón | lista | Medio | ✗/m |
| L10 | Traslados del inglés (profundizar, intrincado, meticuloso, tapiz, encomiable, panorama) | Solo EN | Fuerte EN / hipótesis ES | Patrón | lista | Medio | m |
| L11 | Cierres «En resumen / En conclusión / En definitiva» | Anecd. | Anecdótica | Estructural | lista | Alto | ✗/m (ver D1) |
| L12 | «No solo… sino (también)» / «no es X, es Y» | EN (EQ-Bench) | Media EN | Estructural | regex | Medio-alto | m |
| L13 | Tríadas adjetivales | Anecd. | Anecdótica | Estructural | regex | Alto | ✗ |
| L14 | Hedging léxico | Sin fuente | Sin fuente | Estadístico | lista | Alto | ✗ |
| L15 | Verbos corporativos (fomentar, potenciar, aprovechar, impulsar) | Solo EN | Fuerte EN | Patrón | lista | Alto | m |
| L16 | Léxico promocional («en el corazón de», «vibrante») | Solo EN | Media | Patrón | lista | Alto | ✗/m |
| L17 | TTR/MTLD bajos | EN contradictorio | Inconsistente | Estadístico | conteo | Alto | ✗ (→ E) |
| L18 | Ausencia de fórmulas humanas («los resultados sugieren») | Solo EN | Media | Estadístico | lista | Alto | ✗ |

## Sintaxis (`sintaxis.md` §9)

| ID | Patrón | Doc. | Evidencia | Detector | Necesita | FP | v1 |
|---|---|---|---|---|---|---|---|
| S1 | Frases por 100 palabras alta (más oraciones, más puntos) | **ES** (ROBOT-TALK) | Media | Estadístico | conteo | Medio | P |
| S2 | Baja dispersión de longitud de frase (CV) | EN; ES agregado | Fuerte EN | Estadístico | conteo | Medio-alto | m |
| S3 | Longitud media de frase | Contradictoria | Inestable | — | conteo | Alto | c |
| S4 | Gerundios adjuntos («…, logrando…») | Solo EN (2–5×) | Fuerte EN | Estructural | regex (+POS filtro) | Medio | m |
| S5 | Densidad de nominalizaciones (-ción, -miento, -dad, -ncia) | Solo EN (1,5–2×) | Fuerte EN | Estadístico | regex sufijos | Alto | m |
| S6 | Coordinación de sintagmas «X y Y» | Solo EN (1,9×) | Media-fuerte | Estructural | POS | Medio | ? |
| S7 | Tríadas | Anecd. | Anecdótica | Estructural | regex | Alto | ✗ |
| S8 | «No es X, es Y» / «no solo… sino» | Anecd. | Anecdótica | Patrón | regex | Medio-alto | ✗/m (=L12) |
| S9 | Orden SVO constante | **ES** débil | Débil | Estadístico | parse | Medio | ? |
| S10 | Pocos adverbios/pronombres, muchos adjetivos | **ES** (ROBOT-TALK) | Fuerte | Estadístico | POS | Medio | ? (=L6/L7) |
| S11 | Auxiliares y cópulas elevados | Solo EN base | Media | Estadístico | POS | Medio | ? |
| S12 | Pasiva perifrástica por refleja | TA en→es | Cualitativa | Patrón | regex (+POS) | Alto | a |
| S13 | Posesivo por artículo («levantó su mano») | TA en→es | Cualitativa | Patrón | lista | Bajo-medio | a |
| S14 | Sujeto pronominal explícito redundante | Sin fuente ES LLM | Sin fuente | Estadístico | parse | Alto | ✗ |
| S15 | «En base a», «a nivel de», «el mismo» pronominal | Norma | Sin fuente LLM | Patrón | lista | Alto | ✗/a |
| S16 | Legibilidad (FH, IFSZ) | **ES** fórmulas | Contexto | — | sil | — | c |

## Puntuación y formato (`puntuacion-formato.md` §11)

| ID | Patrón | Doc. | Evidencia | Detector | Necesita | FP | v1 |
|---|---|---|---|---|---|---|---|
| P1 | Negrita Markdown literal `**` | EN | Media | Patrón | regex | Bajo/alto en técnico | P (a: «artefacto de copia») |
| P2 | Encabezado `^#` | EN | Media | Patrón | regex | Bajo/alto en técnico | P (a) |
| P3 | «**Título:** texto» / negrita inicial de viñeta | EN anecd. | Anecdótica | Estructural | regex | Medio | P (a) |
| P4 | `---`, tablas `\|` | EN | Anecdótica | Patrón | regex | Medio | P (a) |
| P5 | U+202F fuera de francés/cifras | EN (Rumi, OpenAI) | Anecd. reproducible | Patrón | regex | Bajo | P (a) |
| P6 | U+200B, U+2060, U+FEFF | Sin fuente LLM | Anecdótica | Patrón | regex | Medio | P (a) |
| P7 | Mezcla de comillas curvas y rectas | EN | Anecdótica | Estadístico | conteo | Medio | m |
| P8 | Comillas curvas solas | EN | Desaconsejada | — | — | Alto | ✗ |
| P9 | Ausencia de « » | Norma | Sin LLM | — | — | Alto | ✗ |
| P10 | Punto dentro de comillas de cierre | Norma | Sin LLM | Patrón | regex | Medio | a |
| P11 | Densidad de rayas por 1.000 | EN (Freeburg; Economist) | Fuerte EN, inestable | Estadístico | conteo | Alto ES | m (solo densidad muy alta, fuera de diálogos) |
| P12 | Raya espaciada enfática | Inferencia | Sin fuente | Patrón | regex | Medio | m |
| P13 | Raya de diálogo `^—` | Norma | — | Exclusión | regex | — | (exclusión de P11) |
| P14 | Ratio comas/puntos bajo | **ES** (ROBOT-TALK) | Fuerte signif. | Estadístico | conteo | Medio-alto | m (calibrar por género) |
| P15 | Pocos paréntesis, comillas, punto y coma, dos puntos | **ES** (ROBOT-TALK) | Fuerte signif. | Estadístico | conteo | Medio | m |
| P16 | Puntuación total baja | **ES** + EN | Media-fuerte | Estadístico | conteo | Medio | m |
| P17 | Omisión de ¿ ¡ | ES sin diferencia | Negativa | — | — | Alto | ✗ |
| P18 | Title Case en encabezados | Norma | Sin LLM | Patrón | regex + excepciones | Medio | a |
| P19 | Mayúscula en meses/días | Norma | Sin LLM | Patrón | regex | Medio | a |
| P20 | Cifras a la inglesa (1,000; 3.14) | Norma | Sin LLM | Patrón | regex + región | Alto en América | a |
| P21 | «5%» sin espacio | Norma | Sin LLM | Patrón | regex | Alto | ✗ |
| P22 | «$100» antepuesto | Norma | Sin LLM | Patrón | regex | Medio-alto | a |
| P23 | Guion en intervalos por semirraya | EN anecd. | Anecdótica | Patrón | regex | Alto | ✗ |
| P24 | Emojis, ✅ ❌ → | Anecd. | Anecdótica | Patrón | lista Unicode | Medio | m (a) |
| P25 | Párrafos en bloque, frases uniformes | EN secundaria | Media | Estadístico | conteo | Medio | c (=S2) |

## Estadística (`estadistica.md` §10)

| ID | Métrica | Doc. | Evidencia | Dirección | Necesita | Mín. | FP | v1 |
|---|---|---|---|---|---|---|---|---|
| E1 | MATTR (50) vs base del género | EN; ES agregado | Fuerte estabilidad; dirección inconsistente | ↕ | conteo | 50–100 | Alto | c |
| E2 | MTLD vs base | Idem | Idem | ↕ | conteo | 100 | Alto | c |
| E3 | HD-D (42) | EN | Fuerte estabilidad | ↕ | conteo | 50 | Alto | c |
| E4 | Densidad léxica | ES agregado (Gargova) | Media | LLM ↑ | lista función | 100 | Medio | m |
| E5 | Repetición de n-gramas (rep-3/4) | EN (Welleck: seq-rep-4 humano 0,005; solo degeneración greedy) — el «23 %» retirado, dato mal citado | Fuerte solo para greedy | LLM ↑ | conteo | 300 | Bajo en bucles / alto en técnico | m |
| E6 | Self-repetition n ≥ 4 entre frases | EN | Media | LLM ↑ | conteo | 200 | Medio | m |
| E7 | Ratio de compresión | EN (PAN: FPR 0,728) | Media; correlación con longitud | LLM ↑ | conteo (`CompressionStream`) | 300 | **Alto** | ✗/m |
| E8 | Perfil de bandas de frecuencia | Sin fuente LLM | Sin fuente | — | frec | 300 | Alto | ✗ |
| E9 | Ratio de palabras función | Anecd. | Anecdótica | ↕ | lista | 100 | Medio | ✗/m |
| E10 | Exponente de Zipf global | EN (Holtzman: humano 0,93 = muestreo) | No separa con decodificación moderna | — | conteo | 1.000 (sin fuente) | Alto | ✗ |
| E11 | Yule's K / Herdan / hapax | Fórmulas (Tweedie & Baayen; quanteda); hápax variable en RAEL | Teórica; K constante con N | NO CONSTA | conteo | 300 | Medio (K) / alto (C) | ✗ |
| E12 | Índices de legibilidad | **ES** fórmulas | Contexto | — | sil | 100 | — | c (=S16) |
| E13 | TTR crudo por tramos de longitud fija | **ES** (RAEL: +2,3–2,8 % humano) | Débil | Humano > LLM | conteo | tramo fijo | Alto | c |
| E14 | Zipf α₂ (cola del vocabulario) | EN (2508.17715, 9 datasets) | Moderada, consistente | LLM cola más empinada | conteo + log-log | NO CONSTA | Alto en cortos | m (validar FPR) |
| E15 | Pendiente Zipf de n-gramas (n ≥ 2) | EN (2607.17228, literario) | Un estudio | LLM más empinada | conteo | NO CONSTA | Medio | m (validar FPR) |
| E16 | CR de secuencias POS | EN (Shaib: mejor discriminador) | Moderada | LLM ↑ | POS | 300 | Medio | ? (POS) |

**Umbral de longitud mínima** (`estadistica.md` §5): < 100 palabras
«texto insuficiente»; 100–299 análisis con aviso «poco fiable»; ≥ 300
completo. **FIRMADO 29/09.** Se cuentan palabras de prosa (sin viñetas,
tablas ni código).

**Calibración** (`estadistica.md` §6): ninguna regla estadística con
umbral absoluto; percentiles humanos por género × tramo de longitud;
marcar con ≥ 2 métricas fuera del p1–p99; validar FPR ≤ 5 %.

## Discurso (`discurso.md` §8)

| ID | Patrón | Doc. | Evidencia | Detector | Necesita | FP | v1 |
|---|---|---|---|---|---|---|---|
| D1 | Último párrafo que empieza por «En conclusión / En resumen / En definitiva / Para concluir» | EN medido (Herbold 100 % de 180) | Media-fuerte | Estructural + patrón | regex al último párrafo | Alto: escolar, L2 | P (poco peso; calibrar por género) |
| D2 | **Diversidad** de marcadores baja (tipos/ocurrencias; mismo marcador ≥ 3 veces) — la IA usa MENOS y repetidos, no más | EN medido (d = 0,98); ES cualitativo (UCM) | Media | Estadístico | lista propia (taxonomía Portolés) | Medio: L2 repite | P |
| D3 | Ausencia de marcadores epistémicos («creo», «en mi opinión», «quizá») en argumentativo > 300 palabras | EN medido (d = 1,01–1,53) | **Fuerte** (ausencia) | Estadístico | lista | Medio: impersonal | P (solo opinión/argumentativo, combinada) |
| D4 | Automenciones = 0 (yo/nosotros, -mos) en opinión o académico | EN medido (Pham 0,00 vs 2,14; Jiang & Hyland) | **Fuerte** (ausencia) | Estadístico | lista + persona verbal | Alto: impersonal | P (idem) |
| D5 | Secuencia de encuadre completa («En primer lugar… Por último») y encuadre inicial | EN medido (Pham ×1,9; Corpus Pragmatics) | Media | Patrón | lista | **Alto**: L2, escolar | m |
| D6 | Referencia interna concreta («véase la Tabla 2») → **atenuante humano** (resta) | EN medido (Pham) | Media | Patrón | regex | Bajo | **peso negativo** |
| D7 | Puffery de significancia («papel crucial», «marca un hito») | EN anecd. | Anecdótica | Patrón | lista propia | Medio | m |
| D8 | → fusionado en S4 (gerundio evaluativo final) | — | — | — | — | — | (S4) |
| D9 | Atribuciones vagas («los expertos coinciden», «diversos estudios») sin nombre ni cifra cerca | EN anecd. (3 vs 1) | Anecdótica | Patrón | regex + ventana | Medio: periodismo | m |
| D10 | Rangos falsos | EN anecd. | Anecdótica | Patrón | regex + lista | Medio | ✗ |
| D11 | «Retos y futuro»: «a pesar de… enfrenta desafíos» + cierre optimista | EN anecd. (1 vs 0) | Anecdótica | Patrón | regex | Bajo-medio | m |
| D12 | Positividad y «confianza» altas | EN medido (Abdulhai +37–54 %; Muñoz-Ortiz) | Media-fuerte | Estadístico | **léxico ES sin licencia compatible verificada** | Alto | ✗ (salvo léxico nuevo) |
| D13 | Sobregeneralización (genérico en presente tras síntesis) | EN medido (OR 4,85; 26–73 %) | Fuerte | Patrón débil | POS tiempo + lista | Alto | ✗ |
| D14 | Coloquialismos, modismos, anécdota en 1.ª persona → **atenuante humano** (resta) | ES cualitativo (UCM); EN medido (Abdulhai) | Cualitativa/medida | Patrón | lista de modismos | Bajo | **peso negativo** |
| D15 | Solapamiento alto de lemas entre oraciones adyacentes | ES cualitativo (UCM) | Cualitativa | Estadístico | lematizador ligero | Medio: técnico | m |
| D16 | Ratio de pronombres anafóricos baja | ES cualitativo (UCM) | Cualitativa | Estadístico | lista | Medio | m |
| D17 | Resumen interno en cada sección («En resumen,» ≥ 2 veces a mitad) | EN (Wikipedia, **histórico**) | Anecdótica, en desuso | Estructural | regex + segmentación | Medio | m (peso mínimo) |
| D18 | Neutralización de postura en argumentativo | EN medido (ECA ≈70 % más neutrales) | Media | Estadístico | lista epistémicos + actitud | Alto: informativo | m |

## Decisiones que esta lista deja abiertas (para Antonio)

1. **Umbral de longitud mínima** — **FIRMADO 29/09**: < 100 palabras
   «texto insuficiente»; 100–299 análisis con aviso «poco fiable»; ≥ 300
   completo. Se cuentan palabras.
2. **Etiquetador POS en el navegador** — **FIRMADO 29/09 (intención a)**:
   entran L6/L7/S10, S6, S11 y el filtrado de S4/S12; la librería se elige
   con la doc en el punto 3-4 (tamaño, licencia, calidad; ficha en
   NOTICES; medir coste de carga).
3. **Léxico de emociones en español** para D12 — **FIRMADO 29/09
   (intención a)**: entra si existe con licencia compatible; se decide con
   la doc en el punto 3-4.
4. **Listas cerradas propias** — **FIRMADO 29/09**: cada ficha declara el
   origen de su lista («inventario propio a partir de X, sin medición en
   español») y el catálogo lo muestra. No es norma del sector; es
   disciplina de la casa (NOTICES/PROCEDENCIA).
5. **Duplicados FUSIONADOS** — **FIRMADO 29/09**: una regla por par, en la
   familia donde está mejor medida; la otra desaparece: L11→**D1**
   (cierres; Herbold 100 % medido) · S8→**L12** («no solo… sino»;
   EQ-Bench) · L6/L7→**S10** (adjetivación y adverbios; mismo estudio
   ROBOT-TALK, PDF leído en sintaxis) · P25→**S2** (uniformidad;
   Muñoz-Ortiz) · D8→**S4** (gerundio final; Reinhart 2–5× — la lista de
   verbos de significancia de D8 queda como submatiz de S4) · S16→**E12**
   (legibilidad, contexto) · L17→**E1/E2** (diversidad). Quedan **78
   candidatas** únicas.
6. **Familia «canal»** — **FIRMADO 29/09**: P1–P6 y P24 pasan a una sexta
   familia, «canal», con color propio en la interfaz y texto «artefacto de
   copia desde un asistente»; **no suma al medidor**. Requisito para el
   esquema del punto 3: una regla o familia puede declararse
   **informativa** (se señala y explica, no puntúa); el mismo mecanismo
   sirve para las de contexto (E1–E3, E12) y los avisos de norma.
7. **Avisos de norma RAE** — **FIRMADO 29/09**: S12, S13, P10, P18–P20 y
   P22 salen de RadiografIA y forman un **segundo paquete incluido,
   «español correcto»**, combinable desde el desplegable (alcance del
   plan, punto 6). Motivo: no señalan IA sino calco o traducción (fuentes
   de TA y norma RAE); dos paquetes reales demuestran el motor genérico;
   coste casi nulo. **Límite**: solo esas siete reglas; nada nuevo en la
   v1.
8. **Relanzar con el módulo** — **HECHO para estadística el 29/09**
   (informe en `informes/estadistica-modulo.md`, 81 fuentes; fusionado en
   `estadistica.md`, E13–E16 añadidas, el «23 % de bigramas» retirado por
   mal citado). **HECHO para discurso el 29/09** (informe en
   `informes/discurso-modulo.md`, 84 fuentes; fusionado en `discurso.md`,
   D15–D18 añadidas, D6 y D14 convertidas en atenuantes).

## Hallazgos del módulo que afectan a decisiones firmadas (29/09)

- **Umbral 100/300**: confirmado por vía independiente. Añade «contar solo
  prosa» (sin viñetas, tablas ni código) → requisito del motor, punto 3-4.
- **Decisión 2 (POS)**: reforzada; E4, E16 y la densidad léxica española
  lo necesitan. Candidata: es-compromise (MIT, «work-in-progress»).
- **Calibración por percentiles** (género × tramo; ≥ 2 métricas fuera;
  FPR ≤ 5 %): propuesta razonada del módulo, no medida. No cambia
  ninguna decisión; **va al plan como criterio de cierre del punto 5**
  (paquete v1). Pendiente de que Antonio lo firme al cerrar el punto 2.
- **Licencias**: listas de frecuencia CC BY-SA 4.0 → ficheros de datos
  aparte del código Apache 2.0, con atribución; afecta a NOTICES y a la
  estructura del repo (`/data/`).
- **Decisión 3 (léxico de emociones)** — del informe de discurso: ningún
  léxico en español con licencia compatible verificada (EmoLex solo no
  comercial y traducción automática; SEL/SAL/LiLaH NO CONSTA). → **D12
  fuera de la v1** salvo hallazgo en el punto 3-4. Pendiente de que
  Antonio lo confirme.
- **Requisito nuevo para el esquema (punto 3)**: reglas con **peso
  negativo** (atenuantes humanos D6, D14) y **nivel de evidencia** visible
  en ficha e interfaz («medido en inglés», «anecdótico», «sin datos en
  español»).
- **Decisión 4** reforzada: DPDE «only online», licencia NO CONSTA;
  Portolés/Martín Zorraquino solo como taxonomía.
