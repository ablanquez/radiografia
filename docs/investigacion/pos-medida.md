# Etiquetado gramatical (POS) — medida y retirada

**Fecha:** 29/09/2026 · **Encargo:** 3.3 (punto 3 del plan, decisión de librerías)
**Capa congelada en `f09a00e`** (retirada del árbol en este cierre; queda en el historial),
**medida UNA vez sobre `es_ancora-ud-test`**.

**Resultado: no llega al umbral. El POS queda fuera de la v1.**

---

## 1. Qué se midió y contra qué

- **Etiquetador:** [es-compromise](https://github.com/nlp-compromise/es-compromise) 0.3.1
  (MIT; «un etiquetador pequeño, básico y basado en reglas», *work-in-progress*), el único POS
  del español en JavaScript para navegador, **más una capa propia** de tres piezas (§ 3).
- **Referencia de oro:** [UD Spanish-AnCora](https://github.com/UniversalDependencies/UD_Spanish-AnCora)
  r2.18 (commit `197cca3`, CC BY 4.0), etiquetas UPOS, en
  [`data/referencia/`](../../data/referencia/):
  - **DESARROLLO**: las 100 primeras frases de `es_ancora-ud-dev.conllu` (2.735 palabras
    evaluadas). Sobre él se ajustó la capa.
  - **PRUEBA**: las 100 primeras frases de `es_ancora-ud-test.conllu` (2.708 palabras
    evaluadas). No se miró hasta congelar la capa; se midió una sola vez.
- **Conjunto reducido:** ADJ · ADV · PRON · VERB · NOUN · OTRO. De la referencia: AUX cuenta
  como VERB; PROPN como NOUN; DET **no** es PRON (va a OTRO); PUNCT no se evalúa. De
  es-compromise, por orden: Pronoun → PRON, Verb → VERB, Adjective → ADJ, Adverb → ADV, Noun →
  NOUN, el resto OTRO.
- **Alineación:** por posición en el texto; los tokens multipalabra de UD («al», «dárselo») se
  comparan palabra a palabra con los términos implícitos o separados del etiquetador.
- **Medidas por categoría C:** cobertura = aciertos en C / palabras de la referencia que son C;
  precisión = aciertos en C / palabras a las que el etiquetador dio C.

## 2. Umbral exigido

Sobre **PRUEBA**, sin tocarlo:

- cobertura **≥ 85 %** en **ADJ**, **ADV** y **PRON**, cada una por separado;
- precisión de **PRON ≥ 85 %** (que la lista no infle la cobertura).

Son las tres categorías de L6/L7/S10, las medidas en español (ROBOT-TALK).

## 3. La capa, con sus fuentes

es-compromise solo, en desarrollo, daba ADJ 65,6 %, ADV 68,1 %, PRON 33,1 % de cobertura.
Encima, tres piezas; cada regla mira el propio término o la etiqueta de su vecino inmediato,
nada más.

**(1) PRON de lista cerrada.** Las formas que en el fichero de **entrenamiento** de AnCora
(`es_ancora-ud-train.conllu`, sha256 `47b6fc49…`) son PRON en **≥ 95 %** de sus apariciones:
**52 formas**, sacadas del recuento, no escritas a mano.

> se · lo · le · me · nos · quien · les · él · ellos · yo · ello · nadie · cómo · ella ·
> nosotros · te · éste · cual · quienes · ellas · mí · ésta · cuales · quién · usted · alguien ·
> cuál · ninguno · éstos · aquello · tú · éstas · os · ti · ustedes · cuáles · ésa · conmigo ·
> consigo · ése · contigo · cuántos · ésas · ésos · tuya · adónde · cuántas · ná · quiénes ·
> tó · tuyo · tuyos

El encargo llamaba ambiguas a doce formas; el recuento en entrenamiento dice cuáles lo son:

| Forma | PRON / apariciones | % | |
|---|---|---|---|
| se | 5.145 / 5.145 | 100 | a la lista |
| lo | 1.686 / 1.686 | 100 | a la lista |
| me | 381 / 381 | 100 | a la lista |
| nos | 315 / 315 | 100 | a la lista |
| te | 70 / 70 | 100 | a la lista |
| os | 8 / 8 | 100 | a la lista |
| le | 841 / 851 | 98,8 | a la lista |
| les | 236 / 247 | 95,5 | a la lista |
| **que** | 6.859 / 13.207 | 51,9 | ambigua: regla de contexto |
| **las** | 93 / 4.350 | 2,1 | ambigua: regla de contexto |
| **la** | 265 / 16.739 | 1,6 | ambigua: regla de contexto |
| **los** | 99 / 7.036 | 1,4 | ambigua: regla de contexto |

Y quedan **por debajo** del 95 %, así que fuera de la lista: **eso** 177/189 (93,7 %),
**esto** 97/105 (92,4 %), **algo** 112/134 (83,6 %), **nada** 146/183 (79,8 %).

**(2) PRON por contexto.**

- **Enclíticos.** Un verbo (para es-compromise) del que, quitando uno a tres pronombres átonos
  del final, queda un infinitivo (-ar, -er, -ir) o un gerundio (-ndo), o que es-compromise marca
  como imperativo, se separa en verbo + PRON, como lo segmenta UD («celebrarlos» → VERB + PRON;
  «dándoselo» → VERB + PRON + PRON). NGLE
  [§ 16.7c](https://www.rae.es/gram%C3%A1tica/sintaxis/sintaxis-de-los-pronombres-%C3%A1tonos-pronombres-procl%C3%ADticos-y-encl%C3%ADticos):
  «los enclíticos siguen —sin separación gráfica— al infinitivo (*decirlo*), al gerundio
  (*diciéndolo*), al imperativo (*dilo, decilo*)»; § 16.11 (secuencias de pronombres átonos).
- **Proclíticos ambiguos.** «la», «los», «las» son PRON si el término siguiente es verbo para
  es-compromise. NGLE § 16.7c: «los pronombres proclíticos preceden a las formas personales de
  los verbos».
- **«que».** PRON si el término anterior es nombre o pronombre (relativo con antecedente). NGLE
  § 22.4 (los relativos *quien, que* y *cual*) y
  [§ 44.8](https://www.rae.es/gram%C3%A1tica/sintaxis/el-antecedente-de-las-relativas) (el
  antecedente de las relativas). No se aplicó la excepción «no tras *lo*» que traía el encargo:
  en entrenamiento, el «que» de «lo que» es PRON **643 veces de 647**, y la NGLE lo trata como
  relativo (§ 22.4; § 44.7, relativas sin antecedente expreso).

**(3) ADV.** «no», «nunca», «jamás», «tampoco» y las formas terminadas en **-mente con al menos
una letra delante** (para que «mente» no cuente). NGLE
[§ 48.1d](https://www.rae.es/gram%C3%A1tica/sintaxis/introducci%C3%B3n-conceptos-fundamentales):
«El adverbio de negación más característico es *no*. Son también adverbios negativos *nunca,
jamás, tampoco* y *nada*»; § 7.14 «La derivación adverbial. Propiedades morfológicas de los
adverbios en *-mente*».

## 4. Las cifras

### DESARROLLO (se ajustó aquí; no decide)

| Categoría | Oro | Aciertos | Dadas | Cobertura | Precisión |
|---|---|---|---|---|---|
| ADJ | 270 | 177 | 226 | 65,6 % | 78,3 % |
| ADV | 144 | 131 | 151 | 91,0 % | 86,8 % |
| PRON | 175 | 123 | 133 | 70,3 % | 92,5 % |
| VERB | 380 | 369 | 468 | 97,1 % | 78,8 % |
| NOUN | 686 | 573 | 664 | 83,5 % | 86,3 % |
| global | 2.735 | 2.417 | — | 88,4 % | — |

### PRUEBA (congelada antes de mirarla; decide)

| Categoría | Oro | Aciertos | Dadas | Cobertura | Precisión | Umbral |
|---|---|---|---|---|---|---|
| **ADJ** | 244 | 177 | 235 | **72,5 %** | 75,3 % | ✖ cobertura < 85 % |
| **ADV** | 136 | 124 | 129 | **91,2 %** | 96,1 % | ✔ |
| **PRON** | 178 | 119 | 130 | **66,9 %** | **91,5 %** | ✖ cobertura < 85 % · ✔ precisión |
| VERB | 315 | 306 | 387 | 97,1 % | 79,1 % | |
| NOUN | 734 | 607 | 673 | 82,7 % | 90,2 % | |
| global | 2.708 | 2.400 | — | 88,6 % | — | |

Siete tokens de la referencia de prueba no tuvieron término del etiquetador en su posición
(uno en desarrollo).

### Los diez fallos más frecuentes en PRUEBA

| Palabra | Referencia | Dada | Veces |
|---|---|---|---|
| que | PRON | OTRO | 31 |
| algunos | PRON | OTRO | 4 |
| bajo | OTRO | ADJ | 4 |
| entonces | ADV | OTRO | 4 |
| eso | PRON | NOUN | 4 |
| todo | PRON | OTRO | 4 |
| directivo | NOUN | ADJ | 3 |
| es | NOUN | VERB | 3 |
| misma | OTRO | ADJ | 3 |
| mismo | OTRO | ADJ | 3 |

## 5. Tamaño en el navegador

`pos.ts` + es-compromise + la lista de pronombres, empaquetado con esbuild para navegador sin
minificar: **401.600 bytes** (es-compromise solo: 390.993).

## 6. Alternativas miradas y descartadas

**Transformers.js (ONNX).** Consultada la API de Hugging Face el 29/09/2026: **ningún modelo POS
del español en ONNX ni etiquetado para Transformers.js** (el que proponía un buscador,
`Xenova/EsperBERTo-small-pos`, es de esperanto). Los que hay son PyTorch y habría que
convertirlos:

| Modelo | Tamaño | Licencia | Etiquetas |
|---|---|---|---|
| `dccuchile/albert-tiny-spanish-finetuned-pos` | 21,0 MB | NO CONSTA (sin ficha) | 18 sin nombre (`LABEL_0…17`); datos de entrenamiento NO CONSTA |
| `mrm8488/bert-spanish-cased-finetuned-pos` | 440 MB | NO CONSTA en su ficha | 60, EAGLES (CoNLL-2002), no UPOS |
| `bertin-project/bertin-base-pos-conll2002-es` | 496 MB | CC BY 4.0 | 60, EAGLES (CoNLL-2002), no UPOS |

Tiempo de carga: NO CONSTA (no se instaló Transformers.js). compromise y wink-nlp son solo
inglés; Stanford es Java/GPL.

## 7. Reglas que pasan a la nevera por depender de POS

**L6**, **L7**, **S10** (adjetivación, adverbios y pronombres; medidas en español, ROBOT-TALK),
**S6** (coordinación de sintagmas), **S11** (auxiliares y cópulas), **E4** (densidad léxica),
**E16** (CR de secuencias POS), y el **filtrado por POS de S4 y S12** (gerundios adjuntos,
pasiva perifrástica), que quedan sin él.

## 8. Lo que faltó

Solo el dato.

- **«que» tras determinante.** En entrenamiento, el «que» que sigue a un determinante es PRON
  **810 veces de 810** («el que» 380/380, «la que» 312/312, «los que» 216/216, «las que»
  114/114). La regla no se aplicó: el encargo decía «solo» tras nombre o pronombre. En prueba,
  «que» dado como OTRO siendo PRON es el primer fallo: 31 veces.
- **Adjetivos dados como otra cosa**, en desarrollo: **34 dados como verbo** —28 de ellos
  participios (26 en *-ado/-ido* y 2 irregulares: *puesto*, *resuelto*); los otros 6: *militar*
  ×3, *juntas*, *garante*, *propicio*— y **57 dados como sustantivo** (19 con forma de
  participio). Ninguna pieza de la capa tocaba los adjetivos.

## 9. Advertencia

La referencia es AnCora. Un modelo **entrenado con AnCora** tendría ventaja injusta en esta
misma medida: habría visto ese corpus (y quizá sus ficheros de desarrollo y prueba) al
entrenarse. es-compromise no está en ese caso.
