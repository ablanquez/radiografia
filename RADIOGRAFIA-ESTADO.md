# RADIOGRAFIA — ESTADO

**Escritor único: la conversación de estrategia.** Nadie más escribe aquí.
El ejecutor reporta descubrimientos; no toca este fichero.

---

## ESTADO ACTUAL — 7 de octubre de 2026

**⭐ PROYECTO CERRADO EL 07/10/2026: LOS 11 PUNTOS DEL PLAN, CERRADOS
(29/09-07/10). LA V1.0.0 ESTÁ EN PRODUCCIÓN:
https://radiografia.antonioblanquez.es, publicada el 06/10, verificada
desde fuera el 07/10 (308/308, sin CDN), etiquetada `v1.0.0` el 07/10 con
su Release en GitHub y `CHANGELOG.md`, y con su ficha en
antonioblanquez.es, en el perfil de GitHub y en LinkedIn (11.6, desde la
conversación AJUSTES (1)).** `npm test` raíz: motor 909 (899 verde, 5
saltados, 5 todo) + web 308 (301 verde y 7 omitidos sin `URL_PRODUCCION`;
308/308 con ella); tipos limpios. 14 bitácoras, todas cerradas.
`publicacion` = `97b6165` (de `main` `6f28a5f`), desplegada. Lo que
sobrevive al cierre, sin reloj: los cabos del § 6 (el árbol de trabajo con
EPERM, los huecos del acta) y la nevera de la v1.1, reunida en el plan.

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
  validadas con esquema. Nada sale del navegador. **Web** (`web/`, desde
  02/10): Astro 7.3.5 fijada exacta, sin integraciones, HTML + TypeScript
  del navegador; repo como npm workspaces (`motor` + `web`, lock en la
  raíz); el analizador entra al motor por `@radiografia/motor/navegador` y
  el catálogo (que se genera en build) solo por `./validacion` y
  `./validador`, para no arrastrar silabea.cjs al SSR de dev; los paquetes
  se sirven desde `public/` y se validan con el standalone al cargar.
  **Desde el 10.4 (05/10)**: fuentes autoalojadas en `web/public/fuentes/`
  (Literata y Atkinson Hyperlegible Next, OFL, subconjuntos woff2 para la
  web y WOFF v1 para el PDF); tokens de `docs/figma/tokens.json` →
  `tokens.css` por script; la única librería del navegador es **pdfmake
  0.3.11** (MIT, con pdfkit), en un trozo aparte de 1,09 MB que solo se
  carga al pulsar «Descargar informe», con el aviso de licencias dentro
  del JS y 76 piezas en el NOTICES.
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
- **Despliegue (firme desde el 06/10)**: Hostinger compartido, LiteSpeed.
  hPanel Git despliega la rama huérfana `publicacion` (solo `web/dist/` +
  `.htaccess`, generada por `npm run publicar`) en `public_html` del
  subdominio, con auto-deploy y sin build en el servidor. El `.htaccess`
  lleva la CSP por cabecera (idéntica al `<meta>`), nosniff,
  Referrer-Policy, HSTS por https, la caché por grupos y la 404. **El CDN
  de Hostinger, desactivado por completo** (reescribía los PNG y pisaba las
  cabeceras; el interruptor del panel no bastó, lo cerró Kodee el 07/10).
  El cómo, en `docs/DESPLIEGUE.md` y en el censo § 15.

## 3 · Las reglas del proyecto

Las transversales viven en `PLAN-RADIOGRAFIA.md`. Las que más pesan:
Regla Cero (doc antes que criterio), no salirse del plan, jueces en rojo
antes del verde, push = despliegue, bitácora por la skill
`escribir-bitacora`, este fichero solo lo escribe la estrategia.

## 4 · El plan

`PLAN-RADIOGRAFIA.md`, 11 puntos. Cerrados: 1, 2 y 3 (29/09), 4 (30/09),
5 (01/10), 6, 7 y 8 (02/10), 9 y 9.2 (03/10), 9.3 y 10 (05/10). Del 11:
censo, parlamento con Hostinger y README (06/10); publicado y verificado
desde fuera, release v1.0.0 y ficha en los escaparates (07/10). **Los 11,
cerrados. Nada abierto.**

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
- 01/10 — **Decisiones del 5.6**: siete reglas estadísticas puntuables y
  seis de contexto; ajustes de percentil elegidos con la calibración (80 %)
  y confirmados con la validación (20 %), nunca al revés: S1 y P15 en p95
  (medidas en español, independientes), P14/P16/S2/S5/E5 en p99. **FPR
  juzgada por género** con tramos juntos [PROPIO] y publicada por celda,
  con intervalo de Wilson al 95 %. **Criterio del plan modificado por
  Antonio**: administrativo 5,1 % (5/98; cuatro tablas del BOE pasadas a
  texto y una fórmula legal) aceptado con declaración; la muestra no
  distingue 5,1 % de 5 %; nada se excluye ni se ajusta tras ver la
  validación. **Escala del medidor**: banda respecto a los humanos del
  mismo género y tramo (`bandaHumana()`), sin tope ni veredicto. Textos
  del README pasados por los dos paquetes; los de la web, en el punto 6.
  Celdas con tasa > 25 % en una sola celda: no se declaran (criterio por
  género). «subrayado» (nombre de función del producto) se añade a los FP
  declarados de lex-verbos-de-enfasis en la pasada de textos del punto 6.
  **Severidad**: se queda «baja» en todas las reglas de la v1; la
  calibración no dio criterio para subirla y la escala del medidor es la
  banda, no la severidad.
- 01-02/10 — **Decisiones del 6.1**: párrafos según CommonMark §4.8/§6.8/
  §5.2 [DOC] con la excepción web [PROPIO] (cierre de frase + línea en
  mayúscula, ¿, ¡, raya, comilla = párrafo); regla del 1 de CommonMark;
  regla horizontal como bloque; línea sangrada tras ítem sigue en el ítem;
  Intl.Segmenter parte en \n, así que frases, palabras y DETECTORES
  trabajan sobre una copia con \r y \n como espacio (misma longitud,
  desplazamientos sobre el original). Los corpus de BOE y Gutenberg
  estaban guardados con un párrafo por línea: se regeneran desde la caché
  con línea en blanco (CSIC, una frase por línea, se deja y se declara).
  Juez de los 287/341 textos cortados: ≥ 93 % de frases coincidentes con
  causas declaradas [PROPIO]; juez de párrafos de origen del BOE contra
  tres formas declaradas (5/20 al pie de la letra). Académico 100-299 sin
  celda (99 < 100): mínimo firme, nada se ajusta; a la nevera ampliar la
  muestra por huella en la v1.1. Fichas con cifras de la revalidación del
  02/10. El standalone llega por `#validador-standalone` (imports de
  package.json; Node, TS y Vite lo documentan; esbuild lo resuelve); el
  aviso MIT de Ajv va en el banner `/*!` del standalone y en el bundle.
- 02/10 — **Decisiones del 6.2 (Astro)**: repo como npm workspaces
  (`motor`, `web`; raíz private; lock en la raíz; motor/package-lock.json
  retirado) [DOC npm]; Astro 7.3.5 exacta, montaje manual sobre la
  plantilla minimal, tsconfig estricto, sin astro check (77 entradas para
  CI), telemetría apagada en los jueces y `npx astro telemetry disable`
  en la máquina de Antonio; allowScripts de esbuild sigue sin aprobarse;
  `exports` del motor para `./navegador` (autorizado: empaquetado, no
  motor); Vite trata el motor como fuente enlazada → optimizeDeps.include
  y reiniciar dev con --force tras tocar motor/src [DOC Vite monorepos];
  **Vite quita los comentarios legales al minificar** (bitácora nº6):
  `comments.legal: true` y juez de web sobre el JS de dist/; datos por
  public/ + fetch con BASE_URL + validación con el standalone (122 KB de JS
  frente a 410 KB importando en build); subrayados en vista por tramos
  (`span role="button"`, textContent, OWASP) y no Highlight API (Baseline
  solo desde 2026-03, no sirve en textarea, clic difícil) → punto 10;
  los dos paquetes siempre activos (elegir es del punto 8; hecho en 8.1); P22 ampliada
  a la cantidad entera; panel con id humanizado (nombre real: punto 7);
  `createRequire` para localizar ajv/LICENSE con el lock elevado (dos
  líneas autorizadas en motor/src). Corrección: Desplázame es Angular, no
  Astro; sirve de referencia solo su raíz de workspaces, y versiona
  app/dist porque el panel de Hostinger no ejecuta el CLI (punto 11).
- 02/10 — **Decisiones del 6.3 (textos)**: el texto de Antonio entra byte a
  byte (él corrigió tres erratas y quitó su edad antes de entregarlo) y
  NO se retoca aunque el motor lo marque; el de IA se genera UNA vez con
  la CLI de Claude en modo limpio (`claude -p --safe-mode --tools ""
  --system-prompt ""`, claude-opus-5-5, 02/10) con la instrucción literal
  y sin estilo, y se congela; la primera generación (subagente que cargó
  el CLAUDE.md) se descartó y queda documentada. **Resultado: humano 5,
  IA 2 con «opinion»; se publica así** (superado el mismo día por la 6.4:
  3 y 1). Los botones ponen el género
  «opinion» [PROPIO] y no analizan solos. Textos de la web por los dos
  paquetes con lista declarada en un juez (subrayado; etiquetas sueltas);
  «—» → «sin dato». `.gitattributes` con eol=lf para los ejemplos.
  Jueces de web con --test-concurrency=1.
- 02/10 — **Decisiones del 6.4 (listas de D3 y D4)**: ampliación firmada
  tras el cierre del 6 como mantenimiento del paquete. D3: primera
  persona de creer, pensar, suponer, opinar y considerar (con «que») en
  presente, pretérito simple, imperfecto y perfecto; parecer solo con
  me/nos (el «It seems» de Herbold sin opinante no cuenta); diría(mos)
  que; en mi/nuestra opinión; a mi/nuestro juicio; formas sin tilde salvo
  «opiné» y «consideré» (subjuntivos); imperfecto ambiguo con la tercera
  persona declarado como FP. D4: entran «me» y «nos» (siempre de primera
  persona en español; fuente verificada Tang y John 1999 vía Moradi y
  Montazeri 2024; la lista propia de Hyland 2005 NO CONSTA y la tabla de
  Pham solo trae I/we/my/our: la premisa del encargo estaba mal y el
  ejecutor la corrigió); clíticos pegados al verbo fuera, declarados. Las
  listas se fijaron por fuente y sondas en la parada; la validación solo
  confirmó (FPR idéntica; administrativo intacto). docs/ejemplos.md guarda
  el 5/2 anterior como historia; la tabla se actualiza en el mismo commit
  que cambia sus cifras (regla «cada commit pasa solo»).
- 02/10 — **Decisiones del 7.1 (catálogo)**: campo `nombre` en la ficha
  (opcional en esquema, 3-80; obligatorio por juez en los dos paquetes;
  50 nombres leídos y firmados por Antonio: «Sin marcadores de opinión ni
  duda», «Sin primera persona», «Secuencias de tres palabras
  recurrentes», «Calcos léxicos del inglés», «Muchas nominalizaciones» y
  los demás como propuso el ejecutor); catálogo estático con
  getStaticPaths [DOC Astro]; el frontmatter NO importa el motor del
  navegador (silabea.cjs rompe el SSR de dev): usa `./validacion` y
  `./validador` (exports nuevos); juez de `astro dev` con --ignore-lock
  (Astro lo documenta; corrección del ejecutor a su propia afirmación de
  que no se podía arrancar un segundo dev); orden de presentación
  alfabético con localeCompare('es') en índice, filtros, leyenda,
  desglose y selector (General primero) [PROPIO, pedido por Antonio];
  severidad en escala baja → media → alta; maxLength con mensaje en
  castellano. Las fichas no pasan por el juez de textos de la web
  (mención, no uso), sí las cadenas de interfaz del catálogo (527
  palabras).
- 02/10 — **Decisiones del 8.1 (cargador)**: casillas y no desplegable;
  <input type="file" sin name + File.text() [DOC MDN; UTF-8 por
  especificación]; límite 2 MB [PROPIO]; orden tamaño → JSON.parse →
  validarPaquete → nombre repetido contra todos los conocidos (el del
  motor queda de red de seguridad); JSON roto con frase propia y el
  detalle del navegador marcado; colores estables sobre todos los
  paquetes conocidos, propios en discontinuo, paquete en texto (WCAG
  1.4.1), sin title en el tramo; reglas propias con ficha completa en el
  panel y en un <details> del desglose, sin enlace; paquete de prueba SIN
  calibración (inventar percentiles sería mentir); **juez de red** por
  CDP con tres testigos (requestWillBeSent, webSocketCreated,
  securitypolicyviolation) y marca tras 500 ms de red quieta; **CSP**
  vía security.csp de Astro (dev sin CSP por diseño; en el 11 valorar
  cabecera del servidor); sin persistencia; aviso al cambiar paquetes con
  resultado pintado; una línea autorizada en motor/src/ejemplos.spec.ts
  (el paquete de prueba entra en su lista). Trampa cazada: con el
  arranque de Chrome en before(), sin Chrome salía «fail 0» con cinco
  «cancelled» (código 1): el arranque va dentro de los tests y el script
  de clones filtra cancelled.
- 02-03/10 — **Decisiones del 9.1 (informe)**: sin librerías: @media
  print + window.print() [DOC MDN]; @page A4 2 cm (sin @page Chrome
  imprime en carta aunque se pida preferCSSPageSize: probado); sin
  beforeprint/afterprint (setEmulatedMedia no los dispara y el juez vería
  distinto que el PDF: probado); siglas de familia por tramo por CSS
  (data-siglas + ::after), reparto estable, leyenda como clave [WCAG
  1.4.1]; lista de señales por regla (5 fragmentos de 80 caracteres y «y
  N más» [PROPIO]); URL absoluta solo en la lista; cabecera con fecha y
  hora del análisis (Intl.DateTimeFormat); párrafo «No hay análisis que
  imprimir»; print-color-adjust solo donde ayuda; orphans/widows no
  Baseline (mejora declarada); juez con CDP (setEmulatedMedia print,
  printToPDF, %PDF-, páginas en la raíz de /Pages según ISO 32000-1
  §7.7.3.2, MediaBox A4, red 0, CSP 0); el texto de combinacion-real
  copiado a web/jueces/apoyo.ts con guarda; nombre del PDF por <title>.
  README con etiquetas oficiales de Chrome, Firefox (printUI.ftl es-ES) y
  Edge (Microsoft Learn; página de ayuda oficial NO CONSTA).
- 03/10 — **Decisiones de la 9.2 (lenguaje de calle)**: referente
  Hemingway (ayuda leída: una frase por subrayado; «Grade 6. Good.» NO
  CONSTA en fuente propia), contraejemplo GPTZero (afirma autoría);
  titular sustituido por etiqueta + frase con los textos de Antonio, verbo
  «suena a», «de cada 100 … solo 5/1», concordancia por género gramatical
  de la palabra del género; «de esta longitud» al detalle; aviso de texto
  corto; caso 8 para paquetes propios con escala; «Opinión (críticas de
  cine)» como nombre visible (honestidad con MuchoCine); `enClaro`
  opcional en esquema (3-140), obligatorio por juez en los dos paquetes,
  50 frases leídas y firmadas (una corregida: Juzek compara con humanos,
  no con prensa); resumen compacto de dos líneas, meta solo en
  estadísticas (percentil que usa la regla, unidad por métrica [PROPIO]);
  las metas para reglas de patrón exigirían tasas humanas por regla en el
  paquete (no entra; nevera); ids solo dentro de «¿Por qué lo miramos?» y
  en el catálogo; «Ver el detalle» plegado en pantalla y sus cifras en la
  cabecera del informe.
- 03/10 — **Decisiones del 10 (arranque)**: prospección en Chrome de
  Hemingway (referente de forma), GPTZero, LanguageTool, QuillBot y Lorca;
  Copyleaks/Grammarly/Readable fuera (piden cuenta). DISEÑO firmado como
  punto de partida (se ajusta en Figma y se reescribe antes del calco):
  pastilla del resultado, tarjetas por regla y por familia con ojo,
  subrayado fino con estilo de línea y sigla, paleta de 8 (Okabe-Ito +
  Tol muted, todas ≥ 3,4:1 sobre blanco, recalculadas; pendiente
  simulador de daltonismo), Literata + Atkinson Hyperlegible Next (OFL,
  autoalojadas), 60-66 cpl / 18 px / 1,5, tarjeta anclada en escritorio y
  hoja inferior en móvil, pestañas Texto/Reglas/Datos en móvil, informe
  por secciones, icono en tres variantes. Figma Make: Claude Opus 5.5 para
  construir, Gemini 3.8 Flash para retocar (doctrina de Figma: modelo por
  tarea; guidelines.md leído en cada prompt; plan mode; escritorio antes
  que móvil; copiar como capas; nada de código de Make al repo).
- 05/10 — **Decisión de Antonio sobre el informe (al ver el calco)**: el
  diálogo de imprimir no sirve en iPhone ni iPad y «no quiero imprimir,
  quiero guardar en PDF». Por tanto: (1) el botón «Descargar informe»
  genera y descarga el PDF en el navegador con pdfmake cargado al pulsar,
  con las fuentes incrustadas (subconjuntos WOFF v1), calcado al marco
  «Informe · A4» del modelo (nueva casilla 9.3; sustituye al «CSS +
  window.print()» del 29/09 en el alcance); (2) imprimir no se bloquea:
  sin resultado sale una página con el icono (c) y «RadiografIA»
  centrados y el mensaje «No hay análisis que imprimir…», con resultado
  solo el informe, y ese papel tiene que ser el del marco A4 (la tanda 4
  del calco se quedó en la estructura: sin márgenes, sin «n / N», clave
  con «Abc» en vez de muestra de línea, menos aire; se rehace como tanda
  4 bis con juez de fidelidad del papel); (3) Ctrl+P no se intercepta.
- 04-05/10 — **Decisiones del calco (10.4)**: tokens.json ampliado con lo
  que Make tenía en @theme (aviso de error, sombra, columna 34em, 360 px,
  toque 44, sigla en círculo, impresión en pt); fuentes de google/fonts
  sin RFN, subsetting con fontTools (Literata 955 → 44 KB), Atkinson
  variable, eje óptico 12-20; CSP movida detrás de <meta charset> por una
  integración de build; icono (c) a 56/48 px; `span role="button"` para
  el tramo (Chrome fuerza `<button>` a inline-block: tres arreglos fallidos
  hasta medirlo en el DOM); columna de resultado con scroll propio; orden
  del documento = visual en tableta y móvil (la vista se mueve); familias
  por paquete y alfabéticas; ojo con aria-pressed; Anterior/Siguiente;
  paquetes propios en gris discontinuo (cambio sobre el 8.1); medidas del
  prototipo por CDP en medidas-modelo.json con juez de fidelidad
  (±1 px); el papel calcado al marco A4 (márgenes, «n / N» por @page,
  clave con muestra de línea, saltos antes de 4, 5 y 6, hoja «sin
  resultado» centrada; «Márgenes: Ninguno» en Chrome anula @page); el
  PDF con pdfmake 0.3.11 + pdfkit, WOFF v1 (fontkit no lee WOFF2), chunk
  de 1,09 MB cargado al pulsar, aviso de licencias dentro del JS, 76
  piezas en el NOTICES, pageBreakBefore en vez de unbreakable (issue
  207), tinte y línea de la primera familia en solapes; Literata 600 por
  document.fonts.load al pintar el resultado (declarada en el juez de
  red); Puntuación y formato a #009988 por el simulador; enlaces del
  catálogo a 44 px en móvil; `--test-timeout` y cancelación limpia de
  CDP si Chrome cae. Bitácoras 7-12: hoja estrecha tras abrir en
  escritorio, dos cuelgues del arnés, el PDF perdía su final al imprimir
  desde escritorio, la sección 5 partida, el anexo sin aire.
- 06/10 — **Decisiones del censo pre-despliegue (11.1)**: 21 hallazgos
  firmados uno a uno; 13 arreglados (avisos MIT de silabea, Rolldown y
  Vite dentro del JS; página `/creditos/` con la atribución de los corpus
  y la cita del BOE; zip del modelo fuera del índice; umbrales y textos
  atados por juez; vite declarado; guarda única de los catch; tokens sin
  destino fuera), 4 declarados (paquetes enteros al navegador, mensajes
  del motor, exports sin consumidor externo, tokens.json dentro del
  chunk), 3 a la nevera (fecha civil, tope del texto, autor/licencia/
  idioma en pantalla; el paquete «ligero», declarado y en la nevera) y 1
  nuevo, el 21 (la precarga de Vite sin aviso; bitácora 13). Detalle en
  `docs/CENSO-PRE-DESPLIEGUE.md` § 14.
- 06/10 — **Decisiones del parlamento con Hostinger (11.2)**: rama
  huérfana `publicacion` con `web/dist/` + `.htaccess`, generada por
  `npm run publicar` (exige `main` = `origin/main`, clon temporal con la
  suite, doble build idéntico, CSP del `<meta>` a la cabecera, worktree
  aparte; el push lo da Antonio); variante A de caché (JS y CSS un año
  immutable, fuentes una semana, lo demás no-cache); HSTS un año solo por
  https, sin includeSubDomains; `ErrorDocument 404 /404.html` con página
  propia (textos de Antonio); `/.git` a 404; `AddType text/javascript .js`
  (RFC 9239; LiteSpeed daba `application/x-javascript`); `.gitattributes`
  con `eol=lf` para los paquetes y las OFL. Web creada en hPanel con
  «Crear un sitio web → PHP/HTML → vacío», como Linaje (no el panel
  «Subdominios»); app de GitHub con repos seleccionados y sin permiso de
  escritura. Jueces de producción (`produccion.spec.ts`, con
  `URL_PRODUCCION`) y de la publicación (`publicacion.spec.ts`).
- 06/10 — **Publicación**: `995674f` (de `main` `41c359f`), vista por
  Antonio en PC, iPhone e iPad con datos móviles. Producción 302/303: el
  CDN de Hostinger reescribía los cuatro PNG (otro PNG, o WebP a Chrome,
  sin la CSP ni las demás cabeceras) y servía el JS cacheado con el tipo
  viejo. Decisión: CDN desactivado en el panel; el juez no cambia; se
  remide cuando suelte el sitio.
- 06/10 — **README final (11.4)**: portada con la forma de Linaje,
  ZetaBus y Desplázame (logo, cinco capturas de producción, «Qué hace»,
  «Qué no demuestra», «Cómo está hecho», «Cómo ejecutarlo y probarlo»,
  «Cómo escribir un paquete propio», «Reglas y evidencia», «Accesibilidad
  y diseño», «Estado y nevera», «Licencia y créditos»); el detalle movido
  tal cual a `docs/WEB.md`, `CALIBRACION.md`, `ARRANQUE-LOCAL.md`,
  `DESPLIEGUE.md` y `CRONICA-DE-CONSTRUCCION.md`; juez del README
  (`readme.spec.ts`: secciones, enlaces y anclas, cifras, el paquete de
  ejemplo y, con la variable, las URL públicas). Bitácora 14: el juez leía
  el README en CRLF.
- 07/10 — **El CDN**: 19 h después de desactivarlo todo seguía con
  `server: hcdn`. «Vaciar caché» (en la página principal del sitio en
  hPanel, no en la sección CDN) solo purgó el JS viejo. Kodee: el
  interruptor había dejado el CDN «sin modo de bypass y con la
  optimización de imágenes activada»; aplicó la desactivación completa y
  en un minuto todo salió `server: LiteSpeed`. Producción 308/308 (la
  cifra subió de 303 con los cinco tests del juez del README). **Doctrina
  que sale**: «Desactivar el CDN automático» en hPanel no basta; hay que
  pedir la desactivación completa (bypass e imágenes) y mirar `server`
  desde fuera.
- 07/10 — **Release v1.0.0 (11.5)**: los dos paquetes a 1.0.0 (decisión
  del 30/09), raíz y lock a 1.0.0, workspaces privados en 0.0.0 (como
  Desplázame); `CHANGELOG.md` en Keep a Changelog con la entrada 1.0.0
  firmada por Antonio (12:08) y la Release de GitHub con ese cuerpo
  («RadiografIA 1.0.0», sin pre-release); etiqueta anotada `v1.0.0` sobre
  `6f28a5f`, el commit de `main` del que salió la publicación `97b6165`;
  republicada y remedida antes de etiquetar (308/308 a las 15:15). El juez
  2 de fichas se puso rojo al subir la versión (la huella de cada ficha
  lleva «Paquete» con su versión): referencia retomada en commit propio
  (`3fcbff2`, que registra el hash del build), sin reescribir el de las
  versiones, que queda en rojo en la historia a propósito; la versión
  también vivía en esas huellas y el censo § 3 no lo decía (añadido con
  fecha). Las cinco capturas del README, retomadas de la 1.0.0 en
  producción: solo cambia `ficha.png`; las otras cuatro salieron byte a
  byte iguales. Sin bitácora: ningún verde falso.
- 07/10 — **Ficha en los escaparates (11.6), desde la conversación AJUSTES
  (1)**: en antonioblanquez.es, tarjeta de RadiografIA la primera de
  cuatro (criterio: recencia), con el icono (c) servido desde el repo, la
  frase sacada del README («Pon tu texto a contraluz: señala los rasgos de
  estilo que los asistentes de IA dejan más que las personas. 50 reglas
  con sus fuentes, 6 géneros calibrados; nada sale del navegador») y los
  enlaces «En vivo» y «Código»; rejilla a 2 × 2; subtítulo y meta a
  «cuatro productos en producción». En GitHub: README del perfil con la
  misma tarjeta y su bitácora, About del repo con esa frase, website y
  topics (astro, deteccion, estilo, ia, spanish, typescript). LinkedIn,
  por Antonio. **PUNTO 11 CERRADO. PROYECTO CERRADO.**

## 6 · Cabos abiertos

- Del 10.4: el árbol de trabajo tiene `node_modules` ilegible (EPERM en
  node_modules/astro tras el apagón del 04/10; ni borrar ni renombrar como
  administrador; `chkdsk F: /f` pendiente de programar): Claude Code
  trabaja en `F:\_clones-005\trabajo`; `F:\_clones-005\` y
  `F:\_basura-005\` se borran cuando el árbol esté sano. VS Code marca
  `web/tsconfig.json` por esa causa, no por el repo. Huecos del acta:
  lector de pantalla real (NVDA / VoiceOver), accesibilidad del PDF
  descargado, zoom 200 % y espaciado de texto, forced-colors, estados
  hover, pulsación en tableta (los cuatro primeros, en la nevera del
  plan). guidelines.md de Make conserva el verde antiguo de Puntuación (es
  lo que leyó Make). El tokens.json dentro del chunk de pdfmake: declarado
  en el censo (16). La CSP por cabecera: HECHA en el 11.2, idéntica al
  `<meta>`, que se queda (la integración `cspPrimero` sigue haciendo falta
  para él).
- Del 11 (07/10): el commit `96655a6` (versiones a 1.0.0) está en rojo en
  la historia a propósito (juez 2 de fichas; el JSON de huellas lleva el
  hash del build, por eso no se reescribió). La redirección http → https
  la hace el panel; la plantilla, DESPLIEGUE y el juez la citan por la doc
  de Hostinger («Forzar HTTPS»), pero en el hPanel de Antonio ese
  interruptor no aparece y la redirección vino activa con el SSL (medido:
  301 en `/`, `/reglas/` y `/creditos/`). La página 1 del PDF cambia con
  la versión (98.718 → 98.751 bytes); ninguna captura la mira.
  `docs/ejemplos.md` sigue diciendo «RadiografIA 0.1.0 … a 02/10/2026»
  como registro fechado, y su tabla la vigila un juez en verde.
- De la 9.2: motor/src cambió también en validar.spec.ts y
  standalone.spec.ts (recuento exacto de fixtures, 42 → 44): inevitable;
  las reglas propias sin `enClaro` no la enseñan (el paquete de prueba no
  la trae); «No se puede medir» depende de que el motivo del motor empiece
  por «no calculable» (declarado en lectura.ts); errata «1 puntos» cazada a
  ojo y con juez.
- Del 9.1: el corte de reglas entre páginas no lo ve un juez (sin
  rasterizar); lo vieron Antonio y PyMuPDF en el scratchpad. Un cuelgue
  de 400 s del juez de impresión al solaparlo con la verificación de
  clones: NO CONSTA la causa; no se solapan baterías. «subrayado» dispara
  ahora dos veces en los textos de la web (la clave de siglas también lo
  dice): declarado.
- Del 8.1: npm test necesita Chrome (o CHROME); sin él falla, no se
  salta. El juez de ejemplos del motor lee un fichero de web/
  (acoplamiento declarado). El `<meta>` de la CSP va detrás de `<meta
  charset>` desde el 10.4 (integración `cspPrimero`), y desde el 11.2 la
  misma política va también por cabecera. Nombre repetido con dos
  mensajes según el otro sea incluido o propio.
- Del 7.1: zona sin juez: ningún juez comprueba que cada palabra clave
  de los esquemas tenga mensaje en castellano (maxLength se coló; maxItems
  caería igual); las plantillas .astro no las revisa tsc (sin astro
  check): lo que pintan lo miran los jueces sobre dist/. El cabo del
  enlace del panel para reglas de paquetes propios quedó RESUELTO en 8.1
  (ficha completa sin enlace). Comentario de motor/src/validador-standalone.d.ts
  corto (solo habla de `imports`; ahora también lo usa `./validador`).
  Las 50 reglas son «baja»: el filtro de severidad no separa nada hoy.
- Del 6.4: zona sin juez: las tasas que citan las fichas no se comparan
  con validacion.json (se pusieron al día a mano); el aviso de académico
  «43 documentos cambian» compara con el manifiesto del descargador, que
  no se versiona.
- Del 6.3, método: los subagentes de Claude Code cargan el CLAUDE.md del
  proyecto → cualquier texto de IA futuro se genera con la CLI en modo
  limpio; la CLI del sistema (2.1.251) no admite Opus 5.5, la de VS Code
  (2.1.286) sí. Zonas sin juez: la tabla de tamaños del README y la cifra
  de palabras de los textos de la web. Disco C: al 98 % tras 46 clones de
  verificación (borrados; ahora se borra cada clon al terminar).
- Para el punto 7 (catálogo): RESUELTO en 7.1 con el campo `nombre`
  (los nombres humanizados sin tilde quedan solo como reserva para
  paquetes de terceros).
- Para el punto 10 (diseño): los apuntes están escritos en el propio
  punto 10 del plan (filtros en columnas, panel junto al tramo, Highlight
  API, `.gitattributes` para fuentes).
- Para el punto 11: RESUELTO en el 11.2 (el panel no ejecuta el CLI → la
  rama `publicacion` lleva `web/dist/`).
- Para quien repita la prueba manual: leer un .txt desde PowerShell con
  `Get-Content -Encoding UTF8 -Raw` antes de `Set-Clipboard`; sin ello las
  tildes y las comillas llegan rotas y el análisis cambia (02/10: 356
  palabras y 17,04 en vez de 325 y 47,08). Anotado en el README (6.3).
- Del 6.2: al navegador viajan 122 KB de JS (con el standalone y el
  aviso MIT) y 357 KB de JSON; los `$comment` del standalone (189 bytes
  con gzip) se quedan: declarado en el censo (hallazgo 16). Con \r\n la copia de trabajo lleva dos espacios
  donde el salto y una regex con un espacio literal no casa ahí; el
  textarea normaliza a \n, así que no aparece en la pantalla (declarado).
- Del 6.1: la excepción web parte el párrafo en texto cortado cuando una
  línea acaba en punto; afecta a D1 (declarado en su ficha), no a las
  frases. El CSIC pierde el 90,6 % de sus saltos (correcto: una frase por
  línea). Las tasas > 25 % por género están en nueve fichas con fecha
  02/10.
- **Del 5.6 (01/10), HECHO en 6.1 (02/10)**: el motor trataba cada línea
  como párrafo; con la segmentación CommonMark el texto cortado a 76
  columnas da la misma FPR que sin cortar (2,9 %). Doctrina: CommonMark y
  RFC 3676. Detalle en la casilla del plan.
- Para el punto 6: P22 subraya solo «$1» (ampliar regex). La sección
  «Paquetes» del README dispara 44,3 en RadiografIA por MENCIONAR las
  formas que busca: el motor no distingue mención de uso (declarado).
- Del 5.5 (01/10): residuo de coma flotante en `puntuar.ts` → ARREGLADO
  en 5.6 (redondeo a 6 decimales); `general.json` registra el motor 430075b
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
- Escala ausencias/densidades (del 5.3): RESUELTO en 5.6 por la escala
  relativa (banda respecto a humanos del género): una ausencia vale su
  peso una vez y las densidades lo suyo, pero el medidor compara con la
  distribución humana real, no con una cifra absoluta. Pesos de las otras
  familias sin tocar en la v1. Sigue abierto: una regla estadística con
  `generos` no tendría juez (hoy ninguna lo lleva); D6 resta en cualquier
  género (declarado).
- `discurso.md` corregido el 30/09 con las fuentes primarias: «In
  conclusion» en 166/180 (92 %), no 100 %; 53/90 estudiantes también
  cierran con fórmula; los epistémicos de Herbold son 14 regex de su código
  (sin «maybe»; «perhaps» y «probably» son modales); 30/90 humanos con
  cero epistémicos. NGLE leída vía web.archive.org (rae.es da 403).
- Del 5.2 (30/09), declarados y sin cambio en la v1: solapes que suman dos
  veces («es importante destacar» en énfasis y en fórmula; «Cabe
  destacar» en énfasis y en conector). Límites declarados: «destacarlo»
  con enclítico no se señala; «no se trata solo de X, sino» tampoco; L15
  no coge «optimice» y sigue cogiendo «potencia» (nombre).
- Del 5.1 (30/09): **P24 (emojis y flechas) sin fuente en la
  investigación** → fuera hasta que aparezca una; cautelas técnicas si
  entra: `\p{Emoji_Presentation}` excluye © ® ™ pero también ⚠️ y ✔️
  (texto + U+FE0F); un emoji inicial dispararía viñeta y prosa a la vez.
  JS trata U+202F y U+FEFF como `\s`: si caen en el
  borde de frase o párrafo el motor los recorta (BOM inicial no cuenta).
  P11+P12 puntuan dos veces una raya espaciada y P11 desde la primera
  raya: medido en la validación (narrativa 600+: 813/895), declarado en
  las fichas, pesos sin tocar en la v1. P3 no cubre
  listas numeradas con negrita. Sin cita
  de Microsoft para la autocorrección de «--» (no estaba en la
  investigación; no se afirmó). P5 ajustado en 5.2 (no cuenta entre
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
- Sigue abierto (como `todo`): abreviaturas («Sr.») parten la frase y los
  compuestos con guión cuentan dos palabras; la calibración no justificó
  una lista de abreviaturas (S1 no dispara por eso en humanos).
- Del 3.1/3.2 para el punto 6: HECHO en 6.1 y 6.2 (núcleo sin Ajv,
  standalone en el navegador, aviso MIT dentro y vigilado en el build de
  Astro). Lo del `$comment` del standalone está en el cabo del 6.2.
- El guardián del NOTICES de **Desplázame** lee ficheros dentro del
  `describe` y tiene el mismo agujero de la bitácora nº1 (resumen `fail 0`
  con juez roto). Llevar a su cierre.
- `postinstall` de esbuild no aprobado (funciona sin él; npm 11 lo
  bloquea por defecto). `@esbuild/win32-x64` sin fichero LICENSE: NO
  CONSTA en su ficha.
- `estadistica.md` §2 decía que wordfreq incluye SUBTLEX-ESP: el README de
  wordfreq no lo lista (solo US, UK, CH, DE, NL). Corregido a NO CONSTA el
  29/09.
- `.gitattributes`: HECHO en el 10.4 y el 11.2 (`binary` para woff2, png e
  ico; `eol=lf` para SVG, manifiesto, ejemplos, paquetes y OFL).
- Fuentes no leídas enteras (pendientes para la v1.1 o cuando una ficha
  lo exija): PDF de Pham 2026 (cifras por categoría; leído en 5.3), PUCP-
  Metrix, Berber Sardinha 2024, `license.txt` de SUBTLEX-ESP.

## Nevera

- **Metas humanas para reglas de patrón** (v1.1): el resumen solo da
  «lo normal en X es…» para las estadísticas; para conectores, puffery,
  etc. haría falta llevar al paquete las tasas por regla en humanos
  (género × tramo), que hoy viven en `disparos` de data/calibracion/.
- **Paquetes propios, protecciones que no tiene la v1**: una regex con
  retroceso catastrófico puede colgar la pestaña (sin Worker con tiempo
  límite); un JSON que no sea UTF-8 se lee con caracteres de sustitución
  y el esquema no lo detecta. Declarados en el README.
- **D3, lemas de Herbold aún sin traducir** (v1.1): know, conclude, I am
  sure, it is clear, it is believed («se cree»); celda 15 de su notebook
  de replicación.
- **Académico 100-299**: 99 documentos de calibración (< 100). Primera
  tarea de la v1.1: ampliar la muestra del CSIC por huella con la misma
  semilla hasta ≥ 120 por tramo y recalibrar (tamaño de muestra, no ajuste
  sobre validación).
- **Tablas del BOE pasadas a texto como no-prosa** (v1.1): los cinco ids
  aceptados en la validación de administrativo (BOE-B-2010-33306,
  BOE-B-2012-3733, BOE-A-2012-3750, BOE-B-2010-33269, BOE-A-2012-7964)
  son los casos de prueba.
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
- **Del punto 11 (06-07/10)**: nada nuevo aquí; la nevera de la v1.1 está
  reunida en el plan («Fuera de la v1»: lo del censo y lo del acta).
