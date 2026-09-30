# RADIOGRAFIA — ESTADO

**Escritor único: la conversación de estrategia.** Nadie más escribe aquí.
El ejecutor reporta descubrimientos; no toca este fichero.

---

## ESTADO ACTUAL — 30 de septiembre de 2026

**⭐ PUNTOS 1-4 CERRADOS (29-30/09). PUNTO 5 EN MARCHA (30/09):** existe el
paquete real `paquetes/radiografia.json` 0.1.0 con las seis familias
declaradas y dos rellenas: **canal** (6 reglas informativas: Markdown
residual, U+202F, invisibles) y **puntuación y formato** (P11 densidad de
rayas, P12 raya espaciada), cada regla con fuente URL, nivel de evidencia
y ejemplos que son jueces. **354 jueces: 349 en verde, 5 `todo`**, `tsc`
limpio. Faltan léxico, discurso, sintaxis, «español correcto», estadística
y calibración. No hay pantalla.

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
  aparte del código Apache, con atribución y ficha en NOTICES.
- Despliegue en Hostinger compartido; el cómo, NO CONSTA hasta el
  parlamento con la doc del panel (punto 11).

## 3 · Las reglas del proyecto

Las transversales viven en `PLAN-RADIOGRAFIA.md`. Las que más pesan:
Regla Cero (doc antes que criterio), no salirse del plan, jueces en rojo
antes del verde, push = despliegue, bitácora por la skill
`escribir-bitacora`, este fichero solo lo escribe la estrategia.

## 4 · El plan

`PLAN-RADIOGRAFIA.md`, 11 puntos. Cerrados: 1, 2 y 3 (29/09), 4 (30/09).
Abierto: el 5 (5.1 hecho: canal y puntuación).

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

## 6 · Cabos abiertos

- Del 5.1 (30/09): **P24 (emojis y flechas) sin fuente en la
  investigación** → fuera hasta que aparezca una; cautelas técnicas si
  entra: `\p{Emoji_Presentation}` excluye © ® ™ pero también ⚠️ y ✔️
  (texto + U+FE0F); un emoji inicial dispararía viñeta y prosa a la vez.
  P5 señala U+202F también entre cifras → en 5.2 pasar a
  `(?<!\d)\u202F(?!\d)`. JS trata U+202F y U+FEFF como `\s`: si caen en el
  borde de frase o párrafo el motor los recorta (BOM inicial no cuenta).
  P11+P12 puntuan dos veces una raya espaciada y P11 desde la primera raya
  → calibración 5.6. P3 no cubre listas numeradas con negrita. Sin cita
  de Microsoft para la autocorrección de «--» (no estaba en la
  investigación; no se afirmó). `ejemplos-estadisticos.spec.ts` aún no
  incluye el paquete real (5.6). VS Code marcará `sobreNoProsa` como
  desconocida hasta el push.
- Para el punto 5 (del 4.3): «…» (U+2026) no parte la frase y «...» sí
  (ICU; afecta a métricas de frase e IFSZ); comillas curvas “ ” fuera de
  los conjuntos de signos (decidir si entran en P15/P16); P15 sigue el
  nombre y deja fuera dos puntos y barras; silabea cuenta una cifra como
  una sílaba (IFSZ); Zenker & Kyle 2021 cerrado, el «≥ 50» viene de la doc
  de TAALED.
- Para el punto 5: `tildes:true` junta «pasó/paso» y «está/esta»; las
  listas de formas deben tenerlo en cuenta (usar `tildes:false` donde la
  tilde distinga).
- Para el punto 5: abreviaturas («Sr.») parten la frase y los compuestos
  con guión cuentan dos palabras; decidir con datos si hace falta una
  lista de abreviaturas antes del segmentador.
- Para el punto 6 (de los encargos 3.1/3.2): `validar.ts` compila Ajv al
  importarse → separar formateador y comprobaciones posteriores en un
  módulo sin Ajv; el navegador usa `validador.standalone.js` (65 KB, sobre
  todo los esquemas con `$comment`: valorar quitarlos en build); el aviso
  MIT de `ucs2length` viaja con él. Ya anotado en la casilla del punto 6.
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
- Corpus humano para calibrar (punto 5): decidido el 30/09 en
  `docs/investigacion/corpus.md` (CSIC, BOE, Gutenberg, MuchoCine,
  AnCora, Wikipedia ES). ROBOT-TALK solo si la UCM lo cede.

## Nevera

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
