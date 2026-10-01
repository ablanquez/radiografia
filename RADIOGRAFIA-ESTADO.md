# RADIOGRAFIA — ESTADO

**Escritor único: la conversación de estrategia.** Nadie más escribe aquí.
El ejecutor reporta descubrimientos; no toca este fichero.

---

## ESTADO ACTUAL — 1 de octubre de 2026

**⭐ PUNTOS 1-4 CERRADOS (29-30/09). PUNTO 5 EN MARCHA (01/10):** los dos
paquetes reales existen. **RadiografIA 0.1.0** tiene cinco familias
rellenas (canal 6, puntuación 2, léxico 11, discurso 10, sintaxis 1) y ya
lleva **calibración humana real**: 238 celdas de percentiles (14 claves ×
6 géneros) medidas con el motor sobre AnCora, BOE, Gutenberg, CSIC y
MuchoCine, con manifiestos reproducibles y sin texto en el repo. **Español
correcto 0.1.0** con sus siete avisos. **737 jueces: 730 en verde, 2
saltados con motivo, 5 `todo`**, `tsc` limpio. Cinco bitácoras, todas
cerradas. Falta el 5.6: reglas estadísticas en el paquete, validación FPR
≤ 5 % sobre el 20 % apartado, escala del medidor y cierre del punto 5. No
hay pantalla.

## 1 · Identidad

- **RadiografIA.** Eslogan: «A contraluz se nota todo.» Botón: «Pon tu
  texto a contraluz». Concepto de partida del icono: «documento en
  negativo».
- Analiza estilo; no demuestra autoría. La nota va en la interfaz, en el
  informe y en el README.
- Repo: https://github.com/ablanquez/radiografia (público, creado 29/09).
  Carpeta local: `F:\01_PROYECTOS\005_RADIOGRAFIA`.

## 2 · Stack (firme)

- Astro estático, sin backend. TypeScript. Reglas en JSON por paquetes,
  validadas con esquema. Nada sale del navegador.
- **Motor** (`motor/`, paquete npm propio, se prueba sin Astro): JSON
  Schema 2020-12; Ajv 8 (`Ajv2020`) en Node para jueces y para generar el
  validador standalone; `node --test` sobre `.ts` sin transpilar (type
  stripping estable en Node 24.19); `tsc --noEmit` con typescript 5.9.3 y
  las bases `@tsconfig/node24` + `node-ts`; esbuild solo en desarrollo
  para empaquetar el standalone. El navegador **no lleva Ajv**.
- Librerías del navegador (decididas con medida, 29/09): **sin
  etiquetador POS** (es-compromise no llega; ver §5); silabeo con
  `silabea` incorporado (MIT, `motor/src/terceros/`); frecuencias de
  wordfreq 3.1.1 en `data/frecuencias/` (CC BY-SA 4.0, foto hasta 2021).
  No hay librería JS/TS madura de estadística del español: el motor
  implementa las fórmulas con su fuente (`estadistica.md` §1).
- Datos con licencia CC BY-SA (listas de frecuencia) van en `/data/`
  aparte del código Apache, con atribución y ficha en NOTICES. Los corpus
  de calibración NO entran en el repo (`motor/corpus/`, ignorado): solo
  herramienta, manifiestos sin texto y percentiles (`data/calibracion/`).
- Despliegue en Hostinger compartido; el cómo, NO CONSTA hasta el
  parlamento con la doc del panel (punto 11).

## 3 · Las reglas del proyecto

Las transversales viven en `PLAN-RADIOGRAFIA.md`. Las que más pesan:
Regla Cero (doc antes que criterio), no salirse del plan, jueces en rojo
antes del verde, push = despliegue, bitácora por la skill
`escribir-bitacora`, este fichero solo lo escribe la estrategia.

## 4 · El plan

`PLAN-RADIOGRAFIA.md`, 11 puntos. Cerrados: 1, 2 y 3 (29/09), 4 (30/09).
Abierto: el 5 (5.1 canal y puntuación, 5.2 léxico, 5.3 discurso, 5.4
sintaxis + «Español correcto», 5.5 calibración hechos; queda 5.6 reglas
estadísticas, validación FPR y escala).

## 5 · Decisiones

- 29/09 — Cinco familias de reglas (léxico, sintaxis, puntuación y
  formato, estadística, discurso), cada una con investigación a fondo
  antes de escribir ninguna regla.
- 29/09 — Entran en la v1: textos de ejemplo propios vs IA sobre el
  mismo tema (el propio no se retoca si el motor lo marca), nota de «no
  demuestra autoría», umbral de longitud mínima con fuente, icono
  «documento en negativo» como punto de partida.
- 29/09 — Fuera de la v1: reescritura automática, CMS o editor en
  navegador, catálogo público de paquetes, otros idiomas, cuentas,
  historial, subida de archivos, corpus de calibración con cifras.
- 29/09 — `.gitignore` de la plantilla oficial de Astro (`examples/basics`)
  + `.env.local` y `.env.*.local` [PROPIO, disciplina de la casa].
- 29/09 — Licencia: Apache 2.0 para código y paquetes de reglas, un solo
  `LICENSE` (choosealicense.com/non-software: las licencias de software
  sirven para obras editadas y versionadas como fuente). Apéndice sin
  rellenar y copyright en el README, como en la casa.
- 29/09 — Nombre del repo `ablanquez/radiografia`, patrón de la casa
  (minúsculas, sin tildes); subdominio previsto
  `radiografia.antonioblanquez.es`.
- 29/09 — **Las investigaciones del punto 2 las hace la conversación de
  estrategia con el módulo de investigación**, no Claude Code; el fichero
  se escribe en `docs/investigacion/` y Antonio lo committea. Regla
  nacida de tres fallos: no se redacta nada de una familia hasta tener
  delante el informe real con citas de fuentes leídas.
- 29/09 — **Las 8 decisiones del cierre del punto 2** (detalle y motivos
  en `docs/investigacion/CANDIDATAS.md`):
  1. Umbral de longitud: < 100 palabras de prosa «texto insuficiente»;
     100–299 con aviso «poco fiable»; ≥ 300 completo.
  2. Entran el etiquetador POS y «todas las librerías que hagan falta»;
     se eligen con la doc en el punto 3.
  3. Léxico de emociones: ninguno con licencia compatible (SEL buscado a
     fondo, NO CONSTA; Antonio no pide permisos por correo para una
     demo) → D12 fuera de la v1, nevera.
  4. Cada ficha declara el origen de su lista y su nivel de evidencia.
  5. Siete pares duplicados fusionados en la familia mejor medida.
  6. Sexta familia **«canal»** (Markdown residual, Unicode invisible,
     emojis), informativa, no suma al medidor.
  7. Los siete avisos de norma RAE forman un **segundo paquete incluido,
     «español correcto»**, combinable; nada más en la v1.
  8. Estadística y discurso relanzadas con el módulo desde otras
     conversaciones y fusionadas; el «23 % de bigramas» retirado por
     mal citado.
- 29/09 — **Calibración** como criterio de cierre del punto 5: ninguna
  regla estadística con umbral absoluto; percentiles humanos por género
  × tramo; ≥ 2 métricas fuera del p1–p99 para marcar; validación con
  textos humanos apartados, FPR ≤ 5 %.
- 29/09 — Requisitos del esquema (punto 3) nacidos del punto 2: reglas
  **informativas** (no puntúan), reglas con **peso negativo** (atenuantes
  humanos), **fuente, origen de lista y nivel de evidencia** en la ficha
  y en la interfaz, y conteo solo de **palabras de prosa**.
- 29/09 — Hallazgo que rige las reglas de discurso: «la IA abusa de
  conectores» no tiene respaldo; lo medido es menos densidad (Herbold
  d = 0,98) y repertorio escaso y repetido. La ficha de D2 lo dirá.
- 29/09 — **Decisiones técnicas del punto 3** (encargos 3.1 y 3.2; cada
  una con [DOC] en la cabecera del fichero que la aplica): JSON Schema
  2020-12 + Ajv2020; `node --test` con type stripping; TS 5.9.3 [PROPIO,
  prudencia frente a la 7]; severidad `baja|media|alta` [PROPIO: son
  señales, no errores]; `"norma"` en el enum de evidencia; campo
  `parametros` libre hasta el punto 4; `nombre` visible por familia;
  `"sin fuente"` permitido por el esquema porque sirve a paquetes de
  terceros — lo que lo prohíbe en RadiografIA es un juez del punto 5;
  `$schema` opcional [DOC VS Code]; `$id` a la URL raw; `formats: {uri:
  true}` [DOC Ajv strict-mode]; standalone empaquetado con esbuild porque
  la opción `unicode` de Ajv está obsoleta [fuente de Ajv]; el juez de
  «nada por resolver» mira el metafile de esbuild, no el texto.
- 29/09 — **POS fuera de la v1** (encargo 3.3). es-compromise, único
  etiquetador JS puro para español, medido contra UD Spanish-AnCora: con
  capa propia afinada en dev y medida una vez en test, ADJ 72,5 %, ADV
  91,2 %, PRON 66,9 % de cobertura frente al 85 % exigido. Retirado del
  árbol; medida en `docs/investigacion/pos-medida.md`. Transformers.js
  descartado con datos (sin modelo ONNX de español; licencias NO CONSTA).
  Reglas a la nevera: L6, L7, S10, S6, S11, E4, E16, filtrado POS de
  S4/S12. Modifica la decisión 2 del cierre del punto 2 («entran las
  librerías que hagan falta»): entran las que **miden** por encima del
  umbral; esta no.
- 29/09 — silabea incorporado sin modificar (MIT) en vez de instalado por
  npm, porque su paquete arrastra mocha/chai con vulnerabilidades. NOTICES
  §1.5 «código de terceros incorporado» con guardián por sha256.
- 29/09 — Datos de terceros viven en `data/` con su LICENSE al lado y
  ficha en NOTICES §2 con guardián; nunca mezclados con el código Apache.
- 30/09 — **Decisiones del 4.1**: segmentación con `Intl.Segmenter` [DOC
  MDN, Baseline 2024], sin librería; párrafo = línea no vacía [PROPIO];
  sin normalizar la cadena, desplazamientos sobre el original; no-prosa
  según CommonMark §5.2/§4.5 [DOC]; `parametros` por detector con Vale
  como precedente; normalización (minúsculas, tildes) solo palabra a
  palabra, nunca sobre la frase (protege los desplazamientos); flags de
  regex limitadas a i m s u, la g la pone el motor; tramos estadísticos
  100-299 / 300-599 / 600+ [PROPIO]. Hallazgos ICU («Sr.», «coche-cama»)
  no se parchean: `todo` y decisión con datos en el punto 5.
- 30/09 — **Decisiones del 4.2**: puntuación = peso × densidad por 1.000
  palabras de prosa [DOC Biber, Conrad & Reppen 1998; pseudobibeR];
  `ultimo-parrafo` por presencia [PROPIO]; sin tope, escala, signo ni
  veredicto hasta los puntos 5-6; informativas a cero y aparte;
  atenuantes restan; **bajo 100 palabras no se analiza nada** (ni
  subrayados; si el punto 6 lo quiere, se reabre allí). Combinación:
  desglose paquete → familia → regla, familias nunca mezcladas, ids
  repetidos entre paquetes permitidos. Ñ/ü: solo se quita U+0301 (RAE:
  ñ letra propia; diéresis signo distinto de la tilde). El motor pone
  las anclas; el paso 2 rechaza `^` inicial o `$` final (paridad de
  barras). Cita corregida: el capítulo de Helsinki sobre longitud de
  texto es de **Liimatta 2024**, no de Laippala (error de la estrategia).
- 30/09 — **Decisiones del 4.3**: género y tramo son entradas del
  análisis, no de la ficha (corrección del 4.1); percentiles en
  `cabecera.calibracion`, tipo 7 de Hyndman & Fan [DOC]; género «general»
  obligatorio y por defecto [PROPIO]; señal estadística por presencia; la
  regla «≥ 2 métricas fuera» va a los pesos del paquete, no al motor.
  MTLD y HD-D con fuente primaria de pago no leída: TAALED como oráculo
  declarado (sin copiar código, CC BY-NC-SA), contrastado con
  lexical_diversity; MTLD sigue los bordes de TAALED `mtldo`. IFSZ con
  206,835 (Barrio-Cantalejo) y la discrepancia de Szigriszt (207)
  citada. **Fernández-Huerta fuera**: definición de F discrepante.
  [PROPIO] en puntuación: «...» cuenta como un signo, un signo entre
  cifras no cuenta, punto seguido de comillas o paréntesis cierra frase.
- 30/09 — **Decisiones del punto 5 (antes del primer encargo)**: orden de
  tandas puntuación+canal → léxico → discurso → sintaxis → «español
  correcto» → estadística con calibración. Pesos iniciales por nivel de
  evidencia [PROPIO, sin doctrina; la calibración es el juez]: medido en
  español 3, medido en inglés 2, anecdótico 1, norma 0 (paquete aparte),
  informativa 0, atenuante −1/−2. Listas cerradas: las escribe Claude Code
  con `origenLista`; **Antonio lee las de peso 3 y las de peso negativo**;
  el resto va en el reporte. **Géneros de la v1** (`corpus.md`): general,
  noticia, academico, administrativo, narrativa-clasica, opinion (solo
  cifras); corporativo sin calibración; la interfaz lista los géneros
  desde la calibración del paquete. Comillas curvas entran en los
  conjuntos de signos; P15 pasa a incluir dos puntos y barras (métrica
  renombrada en su tanda); abreviaturas ante el segmentador solo si la
  calibración lo justifica.
- 30/09 — **Decisiones del 5.2 (léxico)**: en JavaScript `\b` y `\w` son
  ASCII [DOC MDN] → ninguna regex del paquete los usa (límites con
  `(?<!\p{L})`/`(?!\p{L})`, letras con `\p{L}`, bandera u), con juez. Cada
  forma de lista contrastada con su Zipf en wordfreq; Zipf ≥ 4,5 [PROPIO]
  se declara como riesgo de FP en la ficha. L3 partida en dos reglas (lema
  medido, peso 3; fórmula anecdótica, peso 1). L8 y L12 a peso 1 con
  justificación (traslado sin medir; EQ-Bench mide otra construcción).
  Fuente corregida: Juzek 2026 (34 lenguas), no «Juzek et al. 2024»;
  ROBOT-TALK no mide esos lemas. **Versión del paquete: 0.1.0 hasta cerrar
  el punto 5; 1.0.0 en la release del punto 11.** Severidad «baja» en todas
  hasta que la calibración dé criterio.
- 30/09 — **Decisiones del 5.3 (discurso)**: el punto 4 se amplía con
  cuatro capacidades (mínimo en patrón, mínimo por coincidencia,
  ausencia, géneros), parlamentadas y con precedente en Vale
  (`occurrence`, `repetition`) [DOC docs.vale.sh]; escritas en el plan.
  Las ausencias (D3, D4) solo en `opinion`/`academico` y tramo completo;
  «general» nunca activa una regla con `generos`, y el paso 2 lo rechaza
  en la lista. D4 a peso 1: el español es lengua de sujeto tácito (NGLE
  §33.4a) y la medida de Pham (I, we, my, our) no se traslada sin POS.
  D6 atenuante −2 solo con objetivo numerado o en primera persona; D14
  −1 sin modismos (lista inabarcable). Fuera: D10, D12, D13, D17
  (histórico según Wikipedia), D18 (= D3). D3 y D4 no se exigen
  combinadas en el motor: pesos y calibración.
- 30/09 — **Decisiones del 5.4 (sintaxis + Español correcto)**: 5.4 y 5.5
  fundidas porque sintaxis quedaba en una regla. En «Español correcto»
  todas las reglas peso 1 y nivel «norma» [PROPIO]: mide avisos de norma
  por 1.000 palabras, no estilo IA. **El punto decimal no se avisa**: la
  Ortografía 2010 (cap. VIII §2.2.1.2.1) recomienda el punto; solo se avisa
  la coma de millares (§2.2.1.1). Cada regla cita su sección de la RAE,
  leída vía web.archive.org. S13 mantiene «lavó/frotó» como [PROPIO] aunque
  la NGLE §14.7g no lo respalde. La tanda 5.6 pasa a llamarse 5.5.
- 30/09-01/10 — **Decisiones del 5.5 (calibración)**: corpus fuera del
  repo (`motor/corpus/`), al repo solo herramienta, manifiestos sin texto
  y percentiles; reparto 80/20 por huella sha256 con semilla fija antes de
  medir; celda solo con n ≥ 100 [PROPIO: el esquema exige p1 y p99];
  Wikipedia FUERA de `general` en la v1 (desviación de corpus.md, nevera);
  `general` = mezcla estratificada por tramo de los géneros que lo
  tienen, mínimo común, declarados; `_total-radiografia` calibrado como
  clave `_total-*` (se recalcula en 5.6) para que el medidor sea
  «percentil respecto a humanos del género» [PROPIO]; BOE por turnos con
  tope 60 % por subgénero y presupuesto de 30 min (no 3 h); 3LB-CAST
  fuera de noticia (Taulé 2008: Lexesp equilibrado); narrativa: filtros
  contra traducciones sin traductor [PROPIO], exclusiones manuales por
  autor e id declaradas, 100-299 omitida sin subir el tope de 5 capítulos
  por libro; académico: separador real (\n\n), OCR medido y declarado sin
  filtrar, descarga por rangos HTTP (RFC 9110 §14); bloque `disparos`
  aceptado como salida de la herramienta. **Versión del paquete sigue en
  0.1.0.** Corrección de la estrategia: la expectativa «4-6 frases por
  100» no tenía fuente (~3,7 según sintaxis.md; AnCora anota 28,56
  palabras por frase).

## 6 · Cabos abiertos

- Del 5.5 (01/10), para 5.6 y después: residuo de coma flotante en
  `puntuar.ts` (−1,1·10⁻¹⁶ donde debe salir 0; `sinMenosCero` solo quita
  el −0) → arreglar en 5.6; `general.json` registra el motor 430075b
  (src idéntico al de su constructor); el manifiesto de noticia solo
  cuenta su última ejecución (desde caché); los registros de descarga
  sobrestiman el tiempo de red (incluyen medir); dos peticiones a la API
  de Zenodo en el encargo 5.3 (código de Herbold) hechas sin leer su
  robots.txt → incidencia declarada aquí; totales negativos en humanos
  por diseño (atenuantes). `corpus.md` corregido el 01/10: CSIC no es «un
  documento por línea» (una frase por línea, documentos por línea en
  blanco); MuchoCine son 3.878 críticas, no 3.872.
- Del 5.4 (30/09): `puntuacion-formato.md` P20 decía que el punto decimal
  era calco; la Ortografía lo recomienda → corregido el 30/09. P22
  subraya solo el símbolo y la primera cifra («$1»): ampliar la regex a la
  cantidad entera en el punto 6. Falsos positivos declarados: nombres en
  -ando («Nando») en S4; «Conocí a Mayo»; «Ministerio de Asuntos
  Exteriores y Cooperación». La comprobación del 5 % de FP en AnCora es
  débil (100 frases sin material): se hace en la calibración con corpus.
- **Para la validación y la escala (5.6), el primero**: la escala pesa las
  ausencias mucho menos que las densidades (una ausencia = su peso una
  vez, 2 puntos; «Además» ×3 en 346 palabras = 17,34), y `discurso.md`
  §12 pide «más peso a las ausencias que a las presencias». Decidir escala
  o factor de presencia con los datos de `_total-radiografia`. También:
  una regla estadística con `generos` no tendría juez
  (`ejemplos-estadisticos.spec.ts` analiza con «general»); D6 resta en
  cualquier género aunque Pham es académico (declarado).
- `discurso.md` corregido el 30/09 con las fuentes primarias: «In
  conclusion» en 166/180 (92 %), no 100 %; 53/90 estudiantes también
  cierran con fórmula; los epistémicos de Herbold son 14 regex de su código
  (sin «maybe»; «perhaps» y «probably» son modales); 30/90 humanos con
  cero epistémicos. NGLE leída vía web.archive.org (rae.es da 403).
- Del 5.2 (30/09), para la calibración: solapes que suman dos veces
  («es importante destacar» en énfasis y en fórmula; «Cabe destacar» en
  énfasis y en conector). Límites declarados: «destacarlo» con enclítico
  no se señala; «no se trata solo de X, sino» tampoco; L15 no coge
  «optimice». L15 sigue cogiendo «potencia» (nombre), declarado.
- Del 5.1 (30/09): **P24 (emojis y flechas) sin fuente en la
  investigación** → fuera hasta que aparezca una; cautelas técnicas si
  entra: `\p{Emoji_Presentation}` excluye © ® ™ pero también ⚠️ y ✔️
  (texto + U+FE0F); un emoji inicial dispararía viñeta y prosa a la vez.
  JS trata U+202F y U+FEFF como `\s`: si caen en el
  borde de frase o párrafo el motor los recorta (BOM inicial no cuenta).
  P11+P12 puntuan dos veces una raya espaciada y P11 desde la primera raya
  → validación 5.6 (en narrativa 600+ dispara en 814/895). P3 no cubre
  listas numeradas con negrita. Sin cita
  de Microsoft para la autocorrección de «--» (no estaba en la
  investigación; no se afirmó). `ejemplos-estadisticos.spec.ts` aún no
  incluye el paquete real (5.6). P5 ajustado en 5.2 (no cuenta entre
  cifras).
- Del 4.3, lo que sigue abierto tras el 5.5: «…» (U+2026) no parte la
  frase y «...» sí (ICU; afecta a métricas de frase e IFSZ); silabea
  cuenta una cifra como una sílaba (IFSZ); Zenker & Kyle 2021 cerrado, el
  «≥ 50» viene de la doc de TAALED. Hechos en 5.5: comillas curvas en los
  conjuntos de signos; P15 renombrada `puntuacion-secundaria-por-1000` con
  dos puntos y barras.
- Para las tandas de reglas: `tildes:true` junta «pasó/paso» y
  «está/esta»; en 5.2 se usó `tildes:false`; mantenerlo salvo
  justificación.
- Para el punto 5: abreviaturas («Sr.») parten la frase y los compuestos
  con guión cuentan dos palabras; decidir con datos si hace falta una
  lista de abreviaturas antes del segmentador.
- Para el punto 6 (de los encargos 3.1/3.2): `validar.ts` compila Ajv al
  importarse → separar formateador y comprobaciones posteriores en un
  módulo sin Ajv; el navegador usa `validador.standalone.js` (159 KB tras
  cerrar `parametros` y `calibracion`; sobre todo los esquemas con
  `$comment`: valorar quitarlos en build); el aviso MIT de `ucs2length`
  viaja con él. Ya anotado en la casilla del punto 6.
- El guardián del NOTICES de **Desplázame** lee ficheros dentro del
  `describe` y tiene el mismo agujero de la bitácora nº1 (resumen `fail 0`
  con juez roto). Llevar a su cierre.
- `postinstall` de esbuild no aprobado (funciona sin él; npm 11 lo
  bloquea por defecto). `@esbuild/win32-x64` sin fichero LICENSE: NO
  CONSTA en su ficha.
- `estadistica.md` §2 decía que wordfreq incluye SUBTLEX-ESP: el README de
  wordfreq no lo lista (solo US, UK, CH, DE, NL). Corregido a NO CONSTA el
  29/09.
- `.gitattributes` con `*.woff2 -text` (y hermanos) ANTES de que entre la
  primera fuente autoalojada en el punto 10 — herencia de la nº40 de
  Desplazame. Propuesto el 29/09 como casilla del punto 10; Antonio aún
  no ha dicho si entra en el plan.
- Fuentes no leídas enteras que las fichas tendrán que abrir en el punto
  5: PDF de Pham 2026 (cifras por categoría), PUCP-Metrix, Berber
  Sardinha 2024, `license.txt` de SUBTLEX-ESP.

## Nevera

- **Wikipedia ES en `general`** y **narrativa-clasica 100-299**: fuera de
  la v1 (volcado pre-2022 de gigas; 65 capítulos < 100). Calibración por
  **subgénero del BOE** y filtro de OCR en académico: el manifiesto ya
  guarda el dato.
- **Géneros v1.1**: opinión contemporánea (columnas, blogs), narrativa
  contemporánea, corporativo/marketing y variedad americana: sin corpus
  abierto con licencia (30/09).
- **POS y sus reglas** (L6, L7, S10, S6, S11, E4, E16; filtrado de S4/S12):
  v1.1. Dos vías que la medida dejó a la vista sin probar: «que» tras
  determinante (810/810 PRON en AnCora train) y participios como ADJ.
  Referencias dev/test conservadas en `data/referencia/`.
- D12, positividad/emoción: entra si aparece un léxico en español con
  licencia compatible (SEL si Sidorov publica licencia; TRUNAJOD lo
  empaqueta bajo MIT sin que conste permiso).
- Relanzar cada familia con el módulo cuando cambien las generaciones de
  modelos: las cinco investigaciones tienen fecha de caducidad (los
  «humanizers» borran primero los rasgos más citados).
