# PLAN — 005 RadiografIA

Estado a 03/10/2026: **FIRMADO por Antonio el 29/09/2026**, publicado en
`73ef265`. **PUNTOS 1, 2 y 3 CERRADOS el 29/09; 4 el 30/09; 5 el 01/10; 6,
7 y 8 el 02/10; 9 y la ampliación 9.2 el 03/10.** Se tacha lo hecho y
lo nuevo se añade en su punto, y solo por decisión de Antonio.

Origen: BRAINSTORMING (1), 28-29/09/2026, y las decisiones de Antonio
del 29/09 al cerrar el plan. Lo que no está en «Alcance cerrado» está en
«Fuera de la v1» o no existe.

## Alcance cerrado de la v1

RadiografIA es una **web estática en Astro, sin backend**, que analiza un
texto en español y señala patrones de «estilo IA» **mediante reglas**. No
demuestra autoría: analiza estilo.

La v1 entrega, y solo entrega, esto:

1. **Motor de reglas** que no sabe nada de «IA»: aplica un **paquete de
   reglas** en JSON. Tres tipos de detector: patrón, estructural,
   estadístico. Puntuación normalizada por longitud. Una regla o familia
   puede ser **informativa** (se señala, no puntúa) y una regla puede
   tener **peso negativo** (atenuante humano). Se cuentan solo **palabras
   de prosa** (sin viñetas, tablas ni código). [decisiones del 29/09]
   Ampliación del 30/09 (5.3, con precedente en Vale): una regla puede
   exigir un **mínimo** de apariciones, señalar solo la **forma que se
   repite** N veces, señalar una **ausencia** en el texto entero (solo con
   ≥ 300 palabras de prosa) y **limitarse a ciertos géneros**, que quien
   analiza elige.
2. **Paquete RadiografIA v1**: reglas en **seis** familias — léxico,
   sintaxis, puntuación y formato, estadística, discurso y **canal**
   (informativa: Markdown residual, Unicode invisible; los emojis quedaron
   fuera el 30/09 por falta de fuente) — cada una
   nacida de una **investigación a fondo con fuentes** (Regla Cero). Más
   un **segundo paquete incluido, «español correcto»**: siete avisos de
   norma RAE (pasiva por refleja, posesivo por artículo, punto dentro de
   comillas, Title Case, meses en mayúscula, cifras a la inglesa, moneda
   antepuesta), combinable desde el desplegable; nada más en la v1.
3. **Ficha por regla**: id, familia, detector, peso, severidad,
   explicación, sugerencia, excepciones, ejemplos positivos y negativos,
   **fuente, origen de la lista** («inventario propio» cuando lo sea) y
   **nivel de evidencia** («medido en español», «medido en inglés»,
   «anecdótico», «norma» para «español correcto»; «sin fuente» solo en
   paquetes de terceros, prohibido en RadiografIA por juez), visibles en
   el catálogo y en la interfaz. Los ejemplos
   son a la vez documentación y test automático.
4. **Analizador**: pegas texto y eliges el género (los que trae la
   calibración del paquete; «general» por defecto) → subrayados por
   familia, medidor de estilo IA cuya escala es la **banda respecto a los
   textos humanos del mismo género y longitud** (decisión 01/10; sin tope
   ni veredicto de autoría), expresada desde la 9.2 (03/10) como una
   **etiqueta de estilo y una frase en claro** («Texto con bastantes
   rasgos de Asistente IA»…) con las cifras plegadas, un resumen de dos
   líneas, y por cada señal una frase llana (`enClaro`), la sugerencia y
   la explicación plegada.
5. **Catálogo público de reglas**: página por regla con URL propia,
   buscador y filtros; enlace cruzado desde cada subrayado.
6. **Cargador de paquetes**: paquetes incluidos en casillas (firmado
   02/10: para combinar hay que marcar varios); cargar
   un JSON propio desde el ordenador (se lee en el navegador, no sale de
   él); combinar paquetes distinguiendo el origen de cada señal;
   validación con esquema que dice qué regla y qué campo fallan.
7. **Informe PDF** mediante CSS de impresión + `window.print()`.
8. **Identidad**: RadiografIA · eslogan «A contraluz se nota todo.» ·
   botón «Pon tu texto a contraluz» · concepto de partida del icono:
   «documento en negativo». Diseño en Figma, llamativo pero agradable,
   que no parezca robótico.
9. **Textos de ejemplo precargados**: dos versiones del mismo tema, una
   escrita por Antonio y otra generada por IA, seleccionables en la
   portada. El texto de Antonio pasa por el motor antes de publicarse;
   si lo marca, no se retoca: se documenta como falso positivo.
10. **Nota «analiza estilo, no demuestra autoría»** visible en la
    interfaz, en el informe y en el README.
11. **Longitud mínima** — FIRMADA 29/09 con fuentes (`estadistica.md`
    §5): **< 100 palabras** «texto insuficiente», sin análisis; **100–299**
    análisis con aviso «resultado poco fiable» y estadística con peso
    reducido; **≥ 300** análisis completo.
12. **Edición de reglas vía Git**, sin CMS.
13. **Desplegado** en Hostinger (estático), repo público desde el primer
    commit, README y release v1.0.0.

## Fuera de la v1 (fase 2 — no se toca sin abrir el plan)

- **Reescritura automática del texto** (necesita modelo, API, proxy y
  coste): dicho en el brainstorming como «otro costal» y «fase futura».
- **CMS sobre Git** (Decap/Sveltia/Tina) y **editor de reglas en el
  navegador**: descartados para un único editor.
- **Catálogo público de paquetes**: «fase muy posterior, si algún día
  tuviera sentido».
- **Otros idiomas**: v1 solo español.
- **Cuentas de usuario, historial, subida de archivos** (solo pegar
  texto).
- **Corpus de calibración con cifras de acierto medidas**: la v1 publica
  con «un conjunto de reglas honesto y el motor preparado para crecer»;
  la calibración crece después. (Matiz del 29/09: la v1 SÍ calibra las
  reglas estadísticas por percentiles humanos y valida FPR ≤ 5 %, punto
  5; lo que queda fuera es publicar cifras de acierto en detección.)
- **Positividad / emoción (D12)**: ningún léxico de emociones en español
  con licencia compatible verificada (29/09). Nevera.

## Reglas que cruzan todo el plan

- **Regla Cero**: toda decisión técnica, de diseño o lingüística se
  busca primero en documentación oficial o doctrina del dominio y se
  cita; lo que la doc no cubre se declara `[PROPIO]`.
- **Regla de no salirnos del plan**: lo que no está en «Alcance cerrado»
  no entra. Si un encargo obliga a tocar algo fuera del punto en curso,
  el ejecutor **para y avisa**; se parlamenta aquí y, si entra, se
  escribe en el plan ANTES de escribirlo en código. Añadir al plan es
  decisión de Antonio; nadie más la toma.
- **Commits atómicos**, rutas escritas una a una, formato
  `tipo(ámbito): descripción`. Nunca `git add -A`. Push solo cuando
  Antonio lo diga.
- **Del punto 6 en adelante, nada está hecho hasta verse funcionar en
  Chrome** por Antonio. Antes (motor y reglas), nada está hecho hasta
  que los jueces se hayan visto en rojo antes del verde.
- La bitácora `docs/BITACORA.md` la escribe la skill `escribir-bitacora`
  cuando aparece un fallo real, antes de arreglarlo. Nadie la escribe a
  mano.
- `RADIOGRAFIA-ESTADO.md` lo escribe solo la conversación de estrategia;
  el ejecutor reporta por hallazgo.
- Repo **público desde el primer commit**: nada entra sin licencia
  clara y sin revisar qué se sube.
- Todo encargo que CREA algo nuevo relee lo que el README afirma sobre
  su ausencia, antes de cerrar (ley nº1 de la bitácora de Desplázame).
- Cada prompt al ejecutor lleva los 7 puntos de la estructura de la
  casa, sin excepción.
- **Jueces en rojo antes del verde y contraprueba en cada casilla**: un
  verde a la primera es sospechoso del juez, no mérito del código.
- **Push = acto de despliegue**: tandas completas y verdes, nunca a
  medias. Por tanda corre lo proporcional; la batería entera es el peaje
  del push (régimen del 22/09).
- `THIRD-PARTY-NOTICES.md` nace con la primera dependencia npm y se
  mantiene con juez: directas miradas una a una, transitivas apuntadas
  al lock, y una prueba que caza cuando la cabecera envejece.
- Todo lo ajeno se declara: las **fuentes de cada regla** viven en su
  ficha y en el catálogo; lo propio (logo, marca) en `PROCEDENCIA.md`,
  nunca en el NOTICES.

## 1 — Cimientos

- [x] Carpeta `F:\01_PROYECTOS\005_RADIOGRAFIA` creada, VS Code dentro (29/09)
- [x] `CLAUDE.md` en la raíz: PARTE A copiada literal de Desplázame, PARTE B
      escrita solo desde el plan firmado (29/09)
- [x] `git init`, identidad `ablanquez` + correo noreply verificados y `gh`
      con sesión antes del primer commit
- [x] `.gitignore` antes del primer commit: la plantilla oficial
      `withastro/astro/examples/basics` [DOC] + `.env.local` y
      `.env.*.local` [PROPIO, disciplina de la casa]
- [x] `docs/BITACORA.md` creada vacía con la cabecera de la casa ·
      `RADIOGRAFIA-ESTADO.md` v0 colocado
- [x] Primer commit `73ef265` (plan, CLAUDE.md, estado, bitácora)
- [x] Licencia DECIDIDA con la doc (choosealicense.com/non-software [DOC]):
      **Apache 2.0 para código Y paquetes de reglas**, un solo `LICENSE`.
      El de Desplázame revisado entero: 202 líneas, idéntico al canónico
      (`diff` vacío), apéndice sin rellenar como en la casa; copiado con
      sha256 idéntico
- [x] README v0 partiendo del de Desplázame, recortado a lo que hoy es
      cierto (sección «Estado»: no hay código, reglas ni pantalla).
      Copyright en el README, como en la casa. Commit `efcaaac`
- [x] Remoto `ablanquez/radiografia` (público) creado con
      `gh repo create --source --push` [DOC]; `origin/main` en `efcaaac`
- [x] Verificado por Antonio en GitHub con sus ojos: 2 commits, README
      renderizado, licencia Apache-2.0 detectada (29/09).
      **PUNTO 1 CERRADO**

## 2 — Investigación de las cinco familias

Una investigación por familia, ANTES de escribir ninguna regla. Cada una
en `docs/investigacion/<familia>.md`: qué patrones existen, con qué fuente
(papers, guías de estilo, estudios de detección, corpus públicos), qué
excepciones conocidas provocan falsos positivos, y qué candidatas a regla
salen de ahí con su tipo de detector. Sin fuente no hay candidata.

- [x] Léxico (módulo de investigación; `lexico.md`, 18 candidatas; `57de2bb`)
- [x] Sintaxis (módulo; `sintaxis.md`, 16; `9c07b01`)
- [x] Puntuación y formato (módulo; `puntuacion-formato.md`, 25; `7893d31`)
- [x] Estadística: primero a mano (el módulo dejó de funcionar en esta
      conversación), después relanzada con el módulo desde otra
      conversación y fusionada (`estadistica.md`, 16; informe bruto en
      `informes/`; el «23 % de bigramas» retirado por mal citado; umbral
      de longitud con fuente; `f39314f` + `de6ffe3`)
- [x] Discurso: ídem (`discurso.md`, 18; hallazgo: «la IA abusa de
      conectores» no tiene respaldo, usa menos y repetidos; atenuantes
      humanos; `dfe2c6b`)
- [x] Lista consolidada `CANDIDATAS.md`: 93 candidatas (85 tras fusionar
      duplicados), **solo 14 medidas en español**; VISTA por Antonio y con
      sus 8 decisiones firmadas el 29/09: umbral 100/300 · POS y librerías
      que hagan falta · D12 fuera por falta de léxico con licencia ·
      listas propias declaradas · 7 pares fusionados · familia «canal»
      informativa · paquete «español correcto» aparte · calibración por
      percentiles como cierre del punto 5. **PUNTO 2 CERRADO**

Lección del punto 2 (a la báscula de la casa): tres veces se fabricaron
borradores sin fuentes antes de tener el informe, y una vez se descartó
un informe real por confundirlo con ellos. La marca del informe real es
que llega con citas de fuentes leídas; no se redacta nada antes.

## 3 — Esquema del paquete y de la ficha de regla

Todo lo demás cuelga de aquí. Se cierra antes de escribir el motor.

- [x] Esquema del paquete: cabecera (nombre, versión semver, idioma BCP 47,
      descripción, autor, licencia SPDX, familias con id/nombre/informativa)
      + reglas[]; `$schema` opcional en la raíz ([DOC] VS Code); `$id` a la
      URL raw del repo. **JSON Schema 2020-12 con Ajv2020** [DOC]. Encargos
      3.1 y 3.2, 29/09 (`10b22e7`, `38cbb34`)
- [x] Esquema de la ficha: id kebab, familia, detector (patrón | estructural
      | estadístico), **parametros** (libre hasta el punto 4), peso (puede
      ser negativo), severidad baja/media/alta [PROPIO], informativa,
      explicación, sugerencia, excepciones, fuente[], origenLista | null,
      nivelEvidencia (medido en español | medido en inglés | anecdótico |
      sin fuente | norma), ejemplos positivos/negativos ≥ 1; `if/then`:
      con evidencia hay fuente. `additionalProperties: false`
- [x] Validador (`motor/src/validar.ts`, Ajv 8.20 + `formats: {uri: true}`)
      con errores legibles «regla · campo · motivo», y cuatro comprobaciones
      posteriores al esquema (ids únicos, familia declarada, familias
      únicas, regla informativa en familia informativa). Visto en ROJO con
      cada fixture roto antes del verde; contraprueba en los specs
- [x] Fixtures: 1 válido (una regla RadiografIA con peso negativo y una
      «español correcto» informativa) + **11 inválidos**, cada uno a un
      solo diff del válido; 21 jueces con `node --test` sobre .ts (type
      stripping estable en Node 24.19 [DOC]); `tsc --noEmit` limpio
- [x] Validador **standalone** para el navegador (decisión con doc: Ajv
      en el navegador exige `unsafe-eval` en la CSP; Ajv genera la función
      en build, empaquetada con esbuild porque la opción `unicode` está
      obsoleta): `npm run generar` → `motor/dist/validador.standalone.js`,
      65.023 bytes, sin nada por resolver (juez sobre el metafile de
      esbuild) y equivalente al vivo sobre los 12 fixtures
- [x] `THIRD-PARTY-NOTICES.md` con guardián (`notices.spec.ts`): ajv;
      typescript 5.9.3, @types/node 24, bases de tsconfig, esbuild +
      @esbuild/win32-x64; 31 transitivas. README releido (seis familias,
      dos paquetes, ficha completa, «Estado» sin afirmaciones caducadas)
- [x] Bitácora nº1 (29/09): el resumen de `node --test` dijo `fail 0` con
      un juez roto por leer ficheros dentro del `describe`. El guardián de
      Desplázame tiene el mismo agujero (a su cierre)
- [x] Decisión con la doc de las **librerías** que entran al navegador
      (encargo 3.3, 29/09), todas MEDIDAS contra referencias ajenas:
      · **POS**: es-compromise (único etiquetador JS puro para español) medido
        contra UD Spanish-AnCora (CC BY 4.0): PRON 33 % de cobertura; con
        una capa propia (listas cerradas + reglas de contexto con cita
        NGLE) afinada en dev y medida UNA vez en test: ADJ 72,5 %, ADV
        91,2 %, PRON 66,9 % → **no llega al 85 %; POS FUERA DE LA v1**,
        retirado del árbol (401 KB). Medida completa en
        `docs/investigacion/pos-medida.md`. A la nevera: L6, L7, S10, S6,
        S11, E4, E16 y el filtrado POS de S4/S12. Transformers.js: sin
        modelo ONNX de español; descartado con datos.
      · **Silabeo**: silabea (MIT) medido contra 60 palabras de la
        Ortografía RAE: 57/60 (fallan prefijos sub- y tungs-, como `todo`).
        Su paquete npm arrastraba mocha/chai con 6 vulnerabilidades →
        **incorporado sin modificar** en `motor/src/terceros/silabea.cjs`
        con su MIT y guardián por sha256 (NOTICES §1.5).
      · **Frecuencias**: wordfreq 3.1.1 exportado a `data/frecuencias/`
        (20.000 formas, Zipf; datos CC BY-SA 4.0 con LICENSE aparte y
        NOTICES §2 con guardián). Foto hasta 2021: anterior a la oleada
        LLM. SUBTLEX-ESP dentro: NO CONSTA.
      · `data/referencia/`: 100 frases dev + 100 test de AnCora UD (CC BY
        4.0) conservadas para la v1.1.
      · Sin léxico de emociones (D12 fuera). `npm audit`: 0.
- [x] Validador con mensajes de qué regla y qué campo fallan, visto en
      ROJO con paquetes rotos a propósito → HECHO arriba (3.1/3.2)
- [x] Fixtures → HECHO arriba (2 válidos + 11 inválidos). Las dos zonas
      sin juez del 3.2 cubiertas en 3.3 («sin fuente» aceptado; `npm run
      generar` como proceso hijo). Bitácora nº2 (29/09): `grep -c $'\r'`
      dentro de `$( )` en Git Bash cuenta líneas, no CR.
      Suite final: **91 jueces, 88 en verde, 3 `todo`**, `tsc` limpio, 6
      dependencias declaradas y 31 transitivas.
      **PUNTO 3 CERRADO (29/09)**

## 4 — El motor

Sin interfaz. Solo funciones y jueces.

- [x] Carga y valida un paquete → punto 3; `parametros` cerrados por
      detector con `if/then` (4.1, 29-30/09): patrón (formas y/o regex,
      ámbito palabra/frase, normalizar), estructural (posición + regex),
      estadístico (métrica, dirección, percentil; corregido en 4.3: género y
      tramo son entradas del análisis); Vale como
      precedente [DOC]; regex que compilan y formas sin espacio en ámbito
      palabra comprobadas en el paso 2
- [x] Texto segmentado (`texto.ts`, 4.1): párrafos = líneas no vacías,
      frases y palabras con `Intl.Segmenter` locale «es» [DOC MDN,
      Baseline 2024], desplazamientos exactos sobre el original (sin
      normalizar; CRLF probado), prosa/no-prosa según CommonMark (§5.2 y
      §4.5) [DOC]. Hallazgos ICU como `todo`: «Sr.» parte la frase;
      «coche-cama» son dos palabras
- [x] Detector de patrón (`detector-patron.ts`, 4.1): formas y/o regex por
      palabra o por frase; normalización solo palabra a palabra (protege
      los desplazamientos); solo prosa. Paquete interno de prueba y juez
      de ejemplos (positivos ≥ 1 señal, negativos 0) que reutilizará el
      punto 5. Hallazgo: `tildes:true` quitaba también ñ y ü → se corrige
      al abrir el 4.2
- [x] Detector estructural (`detector-estructural.ts`, 4.2, 30/09): seis
      posiciones (inicio/fin de frase, inicio/fin de párrafo, último
      párrafo, cualquiera) sobre frase o párrafo sin blancos finales, con
      desplazamientos exactos; `minimo` de ocurrencias; el ancla la pone el
      motor y el paso 2 rechaza la escrita por el autor. Ñ y ü protegidas
      (solo se quita U+0301, Ortografía RAE 2010); «ámbito frase exige
      regex» en el paso 2
- [x] Detector estadístico (`detector-estadistico.ts`, 4.3, 30/09): texto
      entero contra **percentiles humanos por género × tramo**, nunca
      umbral absoluto. Corrección del 4.1: género y tramo salen de la
      ficha (son entradas del análisis); la regla lleva métrica, dirección
      y percentil (p95/p99); los percentiles viven en
      `cabecera.calibracion` (métrica → género → tramo → p1/p5/p50/p95/p99
      + n, corpus, fecha, método). Percentil **tipo 7 de Hyndman & Fan
      1996** [DOC], el de R y NumPy. Registro de **11 métricas** con fórmula
      citada y jueces a mano: frases-por-100-palabras, cv-longitud-frase,
      ratio-comas-puntos, puntuacion-por-1000,
      parentesis-comillas-puntoycoma-por-1000, ttr, mattr-50 (Covington &
      McFall 2010, leído), mtld (TAALED `mtldo` como oráculo declarado;
      McCarthy & Jarvis 2010 de pago, no leído; tres bordes distintos de
      lexical_diversity documentados), hdd-42 (escala TTR, las dos
      implementaciones coinciden), seq-rep-4 (Welleck 2019 ec. 10, leído),
      ifsz (Barrio-Cantalejo 2008; Szigriszt 1993 da 207 y 62,3).
      Fernández-Huerta FUERA: definición de F discrepante entre fuentes y
      original inaccesible. Señal de texto por presencia; «sin
      calibración» declarado; género de entrada, «general» por defecto
- [x] Puntuación (`puntuar.ts`, 4.2): puntos por 1.000 palabras de prosa
      [DOC Biber, Conrad & Reppen 1998 cap. 6; pseudobibeR] con desglose
      paquete → familia → regla; `ultimo-parrafo` puntúa por PRESENCIA, no
      por densidad [PROPIO: una señal binaria no se normaliza]; informativas
      a cero y aparte; atenuantes restan; sin tope, escala ni veredicto (se
      deciden en 5 y 6); bajo 100 palabras no se analiza; entre 100 y 299,
      marca «poco fiable»
- [x] Longitud mínima 100/300 sobre **palabras de prosa** (sin viñetas,
      tablas ni código): «texto insuficiente» bajo 100, aviso entre 100 y
      299, con juez en ambos lados de cada borde → **HECHO** en 4.1
      (`umbral.ts`, jueces 99/100, 299/300, 400 con 350 en viñetas)
- [x] Combinación de varios paquetes con origen en cada señal
      (`analizar.ts`, 4.2): desglose por paquete, familias nunca mezcladas,
      ids de regla repetidos entre paquetes permitidos y distinguibles;
      dos paquetes con el mismo `cabecera.nombre` se rechazan (4.3)
- [x] Jueces alimentados por los ejemplos de las fichas
      (`ejemplos.spec.ts`): cada positivo dispara, cada negativo no; cubre
      patrón y estructural sobre el paquete interno (10 reglas) y el
      secundario. Suite 4.3: **297 jueces, 292 en verde, 5 `todo`**.
      **PUNTO 4 CERRADO (30/09)**
- [x] **Ampliación del 30/09 (encargo 5.3, parlamentada y escrita aquí
      antes que en código)**: cuatro capacidades con precedente en Vale
      [DOC docs.vale.sh/checks/occurrence y /repetition]: `minimo` también
      en patrón; `minimoPorCoincidencia` (solo señala la forma que se
      repite N veces; agrupa por texto en minúsculas sin bordes [PROPIO:
      Vale `repetition` es la repetición seguida]); `ausencia` (una señal de
      texto entero cuando hay menos coincidencias que `minimo`; puntúa por
      presencia; no se juzga en tramo «poco-fiable» [PROPIO sobre Vale
      `occurrence` min]); `generos` a nivel de regla (solo se evalúa en
      esos géneros; «general» nunca la activa y el paso 2 lo rechaza en la
      lista). `noAplicadas` con motivo (género primero, tramo después).
      `ejemplos.spec.ts` salta las reglas con ausencia/generos;
      `ejemplos-ausencia.spec.ts` las juzga con `analizar()` y género.
      Standalone 168 KB, equivalente sobre 37 fixtures

## 5 — Paquete RadiografIA v1

Una tanda por familia, cada regla con su ficha completa y sus ejemplos.
Fuente citada en cada ficha (sale del punto 2 y de `CANDIDATAS.md`).

- [x] Léxico (5.2, 30/09): 11 reglas. Peso 3 (medidas en español, Juzek
      2026 arXiv 2605.25358, listas aprobadas por Antonio): verbos de
      énfasis (destac/subray/enfatiz/realz), importancia, innovador,
      imborrable/multidisciplinario/impecable. Peso 2 (inglés): traslados
      del inglés, verbos corporativos. Peso 1 (anecdótico o traslado sin
      medir): frases de chatbot, «es importante + verbo», conector de
      apertura (solo Adicionalmente / Cabe destacar / Cabe señalar; «la
      densidad de conectores no es señal»), trigramas de Turrado, «no
      solo… sino». Fuera: L6/L7 (POS), L11 (D1), L13, L14, L16, L17, L18.
      Cada forma con su Zipf (wordfreq); ninguna regex con `\b` ni `\w`
      (ASCII en JS; límites con `(?<!\p{L})` y bandera u), con juez. Texto
      de asistente: 11/11 disparan (176,85); prensa humana AnCora: 3 (2,25).
      Solapes énfasis + «es importante destacar» / «Cabe destacar» →
      calibración
- [x] Sintaxis (5.4, 30/09): una sola regla en RadiografIA,
      `sint-gerundio-adjunto-final` (S4, absorbe D8): estructural fin-frase,
      peso 2 (Reinhart 2025, inglés); la NGLE §27.4g solo censura el
      gerundio de posterioridad temporal y admite el causal/consecutivo
      (la coletilla típica), así que la evidencia queda en la medida
      inglesa; exclusión de falsos gerundios (cuando, mando, Fernando…)
      [PROPIO]; el DPD «gerundio» no tiene captura legible. El resto de la
      familia: S1, S2, S3, S16 son métricas y S5 lo es desde 5.5
      (`nominalizaciones-por-1000`); S6, S9, S10, S11 sin
      POS; S7, S14 fuera; S8 = lex-no-solo-sino; S12, S13, S15 norma
- [x] Puntuación y formato (5.1, 30/09): en RadiografIA v1 solo P11
      (densidad de rayas U+2014, peso 1 justificado, medido en inglés) y
      P12 (raya o semirraya espaciada, peso 1, anecdótico); P14-P16 son
      estadísticas (reglas en 5.6; métricas hechas en 5.5); P10 y P18-P22 a «español correcto»; P7 fuera
      (exige métrica). P13 (exclusión de diálogos) NO en el motor: en las
      excepciones de las fichas; la calibración dirá. Doble puntuación
      P11+P12 en una raya espaciada: para la calibración
- [x] Estadística (5.6, 01/10): 13 reglas `est-` contra los percentiles
      humanos de género × tramo. Puntúan 7: frases cortas (S1, mayor,
      p95, peso 3), poca puntuación secundaria (P15, menor, p95, 3), y en
      **p99** tras la validación: pocas comas (P14, 3; depende de S1), poca
      puntuación (P16, 3; contiene a P15), ritmo uniforme (S2, 2),
      nominalización (S5, 2), repetición de secuencias (E5, 1 justificado:
      Welleck mide greedy). Contexto informativas (peso 0, «ambas»): MATTR,
      MTLD, HD-D, IFSZ, TTR, pronombres anafóricos. Ninguna con `generos`.
      Ejemplos como textos ≥ 300 palabras; `ejemplos-estadisticos.spec.ts`
      con el paquete real. Fichas con el corte, el porqué del p99 y los
      falsos positivos de formato (tablas pasadas a texto, párrafos
      numerados, títulos sin punto)
- [x] Discurso (5.3, 30/09): 10 reglas, prefijo `disc-`. Ninguna medida en
      español. Peso 2: marcador repetido (D2, `minimoPorCoincidencia: 3`,
      ocho conectores con procedencia PDTB; NO se puntúa la cantidad de
      conectores sino la repetición) y **ausencia de epistémicos** (D3,
      solo `opinion`/`academico` y tramo completo; Herbold d = 1,53; en sus
      datos 30/90 humanos L2 también tienen cero). Peso 1 justificado:
      cierre de plantilla (D1, 166/180 = 92 % en ChatGPT, 53/90 en
      estudiantes), ausencia de automenciones (D4, sujeto tácito NGLE
      §33.4a), encuadre ordinal (D5, `minimo: 2`), puffery (D7), atribución
      vaga (D9), retos y futuro (D11). **Atenuantes**: referencia interna
      concreta (D6, −2, solo con objetivo numerado o en 1.ª persona) y
      anécdota en primera persona (D14, −1); listas leídas por Antonio.
      Fuera con motivo: D10, D12, D13, D17 (histórico), D18 (= D3). D16 es
      métrica de contexto desde 5.5 (`pronombres-anaforicos-por-1000`);
      D15 NO se implementa (exige lematizador). Fuentes primarias leídas: código de replicación de Herbold
      (Zenodo), Pham, Wikipedia Signs entera. Texto de opinión de asistente:
      7 reglas, 38,68; reescrito con yo/epistémicos/anécdota: 19,78;
      AnCora «noticia»: 0 de discurso
- [x] Canal (informativa) (5.1, 30/09): 6 reglas (negrita y encabezado
      Markdown, viñeta con negrita inicial, separador o tabla, U+202F,
      invisibles U+200B/2060/FEFF), todas peso 0 e informativas, con fuente
      de `puntuacion-formato.md`. **P24 (emojis y flechas) FUERA hasta que
      haya fuente**: la investigación no trae URL. Motor: campo
      `sobreNoProsa` (mira viñetas, encabezados y tablas; el código nunca).
      Nace `paquetes/radiografia.json` 0.1.0 con las seis familias
      declaradas y `radiografia.spec.ts` (siete condiciones: valida, sin
      «sin fuente», URL https, familias, canal informativa, ids con
      prefijo, peso ≤ máximo por evidencia con justificación)
- [x] Paquete «**Español correcto**» 0.1.0 (5.4, 30/09):
      `paquetes/espanol-correcto.json`, siete avisos de norma, familias
      `gramatica` (pasiva perifrástica con agente determinado, NGLE
      §41.11; posesivo por artículo con partes del cuerpo, NGLE §14.7) y
      `ortotipografia` (punto dentro de comillas, Ortografía §3.4.8.3a;
      mayúscula en cada palabra de título, §4.2.4.8; meses y días en
      mayúscula, §4.2.4.10.1; coma de millares a la inglesa, cap. VIII
      §2.2.1.1; moneda antepuesta, §4.4g). Todas peso 1 y nivel «norma»
      [PROPIO: el paquete mide avisos por 1.000 palabras, no estilo IA].
      **El punto decimal NO se avisa**: la Ortografía lo recomienda
      (§2.2.1.2.1). Secciones leídas vía web.archive.org (rae.es da 403).
      Juez propio y juez de combinación con los dos paquetes reales:
      orígenes separados. AnCora: 0 disparos (muestra sin material; la
      comprobación del 5 % queda para la calibración)
- [x] **Calibración — percentiles** (5.5, 30/09-01/10): herramienta
      reproducible `motor/herramientas/calibrar/` (semilla fija, reparto
      80/20 por huella sha256, cliente de red que respeta robots.txt según
      RFC 9309, manifiestos sin texto con hash por documento); corpus en
      `motor/corpus/` fuera del repo; percentiles tipo 7 en
      `data/calibracion/<genero>.json` solo en celdas con n ≥ 100, e
      inyectados en `paquetes/radiografia.json`: **14 claves × 6 géneros =
      238 celdas** (224 tras la recalibración del 6.1: académico 100-299 sin
      celda). Géneros y corpus: noticia (AnCora, 1.025 docs, 3LB-CAST
      fuera), administrativo (BOE, 463, turnos con tope 60 % por
      subgénero), narrativa-clasica (Gutenberg, 1.377 capítulos de 237
      libros, dominio público comprobado en el TRLPI; **100-299 omitida**,
      65 < 100), academico (CSIC por rangos de bytes, 361; OCR declarado),
      opinion (MuchoCine, 3.870, solo cifras), general (mezcla
      estratificada por tramo de los géneros que lo tienen; Wikipedia
      FUERA de la v1). Verificación del segmentador: 896/1.025 documentos
      de AnCora con el mismo número de frases que la anotación manual.
      Bloque `disparos` por fichero (aceptado 01/10). Tres bitácoras
      (EPUB). La expectativa «4-6 frases por 100» del encargo no tenía
      fuente: la investigación da ~3,7 y AnCora 3,5
- [x] **Calibración — validación** (5.6, 01/10): `_total-radiografia`
      recalculado con el paquete completo y reinyectado; ajustes elegidos
      con el 80 % (calibración) y confirmados con el 20 % apartado, nunca
      al revés. **FPR por género (tramos juntos; [PROPIO]: con 18-32
      documentos por celda hacen falta dos para pasar del 5 %)**, con
      intervalo de Wilson al 95 % (NIST §7.2.4.1; Wilson 1927): general
      3,1 % (1,7-5,9), noticia 2,4 % (1,0-5,6), **administrativo 5,1 %
      (2,2-11,4)**, narrativa 2,9 % (1,5-5,7), académico 3,3 % (0,9-11,2),
      opinión 1,1 % (0,5-2,1); conjunto 37/1.667 = 2,2 %. **Criterio
      modificado por Antonio el 01/10**: administrativo (5 de 98: cuatro
      tablas del BOE pasadas a texto y una fórmula legal repetida) se
      acepta con declaración en README, validacion.json y la ficha del
      género; la muestra no distingue 5,1 % de 5 %. Solo opinión queda
      entera por debajo del 5 %; el README lo dice. Límite del método: una
      sola validación, misma muestra. **Escala** (decisión 01/10):
      `bandaHumana()` devuelve la banda del total respecto a los humanos
      del género y tramo (mediana, p95, p99); sin tope ni veredicto
- [x] El paquete pasa el validador y todos sus ejemplos pasan los jueces
      (839 jueces, 832 en verde, 2 saltados con motivo, 5 `todo`; 01/10)
- [x] El eslogan y los textos de la propia web pasan por el motor: si los
      marca, se cambian (dicho en el brainstorming). **Decisión 01/10:
      TRASLADADA al punto 6** (casilla propia allí): los textos del README
      ya pasaron (solo `est-frases-cortas` por el corte de línea a 76
      columnas, declarado; una frase cambiada); el eslogan tiene 5 palabras
      (bajo el umbral) y los textos de la web no existen hasta el punto 6.
      **PUNTO 5 CERRADO (01/10)**

## 6 — La pantalla mínima (aquí ya existe la demo)

Astro, sin diseño todavía: funciona, no luce.

- [x] Proyecto Astro creado, 200 comprobado con contraprueba, visto en
      Chrome (6.2, 02/10: Astro 7.3.5 exacta en `web/`, workspaces raíz
      `motor` + `web` con lock en la raíz, montaje manual sobre la
      plantilla minimal, tsconfig estricto, `lang="es"`; `exports` del motor
      para `navegador.ts`; optimizeDeps.include y comments.legal en
      astro.config con su doc; sin astro check; telemetría apagada en
      jueces; allowScripts de esbuild sin aprobar; 200 en / y 404 en
      /no-existe vistos por Antonio). **Hecha en 6.1 (02/10) la parte de motor**:
      `validar.ts` y `analizar.ts` partidos en un núcleo sin Ajv
      (`validacion.ts`, `analisis.ts`); `navegador.ts` como entrada para
      Astro (analizar, bandaHumana, validarPaquete con el standalone por
      `#validador-standalone`); el aviso MIT de Ajv viaja en la cabecera
      del standalone (`/*!`, banner de esbuild) y en el bundle; juez con el
      metafile: 0 ficheros de ajv y 0 `node:*` en el bundle (antes 83);
      bundle sin minificar 210 KB sin datos (73 % es el standalone), 572 KB
      con los dos paquetes y su calibración; 116 KB minificado sin datos.
      Pendiente del 6.2: la creación del proyecto Astro y el 200 en Chrome
- [x] **Segmentación de párrafos según CommonMark** (6.1, 01-02/10):
      sustituye la decisión [PROPIO] del 4.1 «párrafo = cada línea»):
      salto de línea simple = *soft line break* = espacio; línea en blanco
      = párrafo; continuación perezosa de viñetas [DOC CommonMark §6.8,
      §5.2; RFC 3676 «embarrassing line wrap»: las líneas se unen en el
      párrafo lógico]. Excepción [PROPIO] para texto copiado de la web (un
      solo salto entre párrafos): salto tras signo de cierre de frase
      seguido de línea que empieza en mayúscula = párrafo. Jueces con los
      287 textos de validación de «general» cortados a 76 columnas (hoy
      `est-frases-cortas` pasa del 4,2 % al 43,2 % y la FPR del 3,1 % al
      8,0 %); desplazamientos exactos sobre el original; recalibración
      reproducible después (0-2 documentos afectados por género) y
      validación repetida. **Añadido 01/10 tras la parada 1 del 6.1**: los
      corpus de BOE y Gutenberg estaban guardados con un párrafo por línea
      (como texto pegado); los descargadores los reescriben desde la caché
      con línea en blanco entre párrafos antes de recalibrar (CSIC, una
      frase por línea, se deja y se declara); y los detectores leen la
      copia de trabajo con el salto como espacio (misma longitud,
      desplazamientos sobre el original), porque 20 regex con espacio
      literal no casarían en texto cortado. Umbral del juez de los 287
      textos: ≥ 93 % de frases coincidentes con causas declaradas [PROPIO].
      **HECHO (02/10)**: 320/341 textos cortados con las mismas frases (4
      causas: ítems y tablas cortados, «- -» en AnCora, excepción a mitad
      de frase); con el motor nuevo, el texto cortado a 76 columnas ya da
      la misma FPR que sin cortar (2,9 %) y est-frases-cortas 4,4 % frente
      a 4,1 %. Recalibración desde la caché con los corpus de BOE y
      Gutenberg regenerados con línea en blanco (20/20 y 5/20 al pie de la
      letra, formas del BOE declaradas): ninguna FPR sube (conjunto 35 de
      1.703 = 2,1 %); administrativo con los mismos cinco ids;
      **académico 100-299 queda SIN CELDA (99 < 100)**, general recompuesto
      (100-299 con noticia, administrativo y opinión × 155; 600+ con 5 ×
      101); 224 celdas. AnCora manual: 896/1.025 se mantiene
- [x] Área de texto + selector de género (listado desde
      `cabecera.calibracion`, «general» por defecto; decisión 30/09) +
      botón «Pon tu texto a contraluz» (6.2, 02/10; paquetes por fetch
      desde public/ con BASE_URL y validados con el standalone al arrancar;
      análisis al pulsar; textarea editable después)
- [x] Subrayados por familia sobre el texto (6.2: vista por tramos debajo
      del textarea, `span role="button"` con clic/Enter/Espacio, un
      subrayado por familia, canal aparte, todo por textContent; la
      Highlight API queda para el punto 10)
- [x] Medidor global con desglose por familia: la **banda humana**
      (`bandaHumana()`), con «sin señales» cuando el total es 0 (en cinco
      celdas la mediana es 0 y un texto limpio caería «entre la mediana y
      el p95»; desde la 9.2 ese caso dice «Texto sin indicios de Asistente
      IA»), y «sin calibración» cuando no hay celda (6.2: además
      palabras de prosa, tramo y género; «texto insuficiente» y «poco
      fiable»; desglose paquete → familia → regla, señales de texto,
      informativas, noAplicadas; Español correcto aparte sin banda)
- [x] Al tocar un subrayado: explicación y sugerencia de la regla (6.2:
      panel con id humanizado, explicación, sugerencia, evidencia, origen
      de la lista y paquete, literales de la ficha; **se pinta debajo, no
      junto al tramo: dónde y cómo es del punto 10**)
- [x] Nota «analiza estilo, no demuestra autoría» junto al medidor (6.2)
- [x] Textos de ejemplo precargados (6.3, 02/10): `web/public/ejemplos/
      antonio.txt` (314 palabras de prosa, byte a byte, con tres erratas
      corregidas por él y sin su edad) y `ia.txt` (336 palabras; generado
      UNA vez con la CLI de Claude en modo limpio —claude-opus-5-5,
      02/10 11:51, sin instrucciones de estilo—; la primera generación se
      descartó porque el subagente cargó el CLAUDE.md del proyecto, y
      está documentada como descartada). Dos botones que cargan el texto
      y ponen el género «opinion» sin analizar solos. **Resultado con
      «opinion»: el humano puntua 5 (entre mediana y p95: pocas comas,
      sin epistémicos) y el de IA 2 (por debajo de la mediana: cierre de
      plantilla, sin automenciones)** — cifras del 02/10 antes de la 6.4;
      tras ella, 3 y 1 —; no se retoca nada; documentado en
      `docs/ejemplos.md` con un juez que lo compara con analizar() en cada
      npm test
- [x] Los textos de la web pasan por los dos paquetes (6.3): 334 palabras
      de prosa de la interfaz, con «general»; Español correcto 0; en
      RadiografIA quedan declaradas en el juez `textos-web.spec.ts`
      lex-verbos-de-enfasis («subrayado», nombre de la función: FP
      declarado en su ficha) y est-frases-cortas (etiquetas sueltas, no
      prosa); el «—» del panel pasó a «sin dato» para no declarar
      pf-raya-densidad. README con prueba manual (`-Encoding UTF8`),
      ejemplos y estado
- [x] **CICLO ENTERO VISTO POR ANTONIO EN CHROME (02/10, los cuatro textos
      del 6.2 y los dos ejemplos del 6.3). PUNTO 6 CERRADO (02/10)**
- [x] **6.4 — Ampliación de las listas de D3 y D4 (firmada por Antonio el
      02/10 tras el cierre; HECHA el 02/10; mantenimiento del paquete, no
      reabre el punto)**: los ejemplos destaparon dos huecos de lista: D3 (sin
      marcadores epistémicos) no tiene las conjugaciones de «parecer» ni
      otras formas obvias de sus verbos, y por eso dispara en el texto de
      Antonio aunque los tiene; D4 (sin automenciones) excluyó «me» y
      «nos» como «ambiguos», pero en español son siempre de primera
      persona (fuente verificada el 02/10: Tang y John 1999 vía Moradi y
      Montazeri 2024 incluyen me/us entre los pronombres de primera
      persona; la lista propia de Hyland 2005 NO CONSTA, y la tabla de
      Pham solo trae I/we/my/our), y por
      eso dispara en el texto de IA aunque dice «me gustan». Se amplían
      las dos listas con fuente (Herbold para D3; Tang y John 1999 vía
      Moradi y Montazeri 2024 para D4) y sondas,
      Antonio firma las formas en una parada, se recalcula
      `_total-radiografia` desde la caché y se revalida la FPR (son
      ausencias: añadir formas solo las hace disparar menos); se
      actualizan fichas, docs/ejemplos.md (su juez lo exige) y README.
      **Resultado**: D3 con primera persona de creer/pensar/suponer/
      opinar/considerar(que) en cuatro tiempos, parecer con me/nos,
      diría(mos) que, en mi/nuestra opinión, a mi/nuestro juicio (lemas de
      Herbold, celda 15 de su notebook; conjugación [PROPIO]); D4 con
      «me» y «nos» (Tang y John 1999 vía Moradi y Montazeri 2024). Tasas en
      humanos apartados: D3 académico 67,4 → 58,1 %, opinión 36,9 → 32,5 %;
      D4 académico 53,5 → 39,5 %. FPR idéntica (no son estadísticas);
      administrativo con los mismos cinco ids; `_total` recalculado en
      opinión y académico (mediana de opinión 300-599: 3 → 2). **Ejemplos:
      humano 3 (entre mediana y p95), IA 1 (por debajo)**; el 5/2 anterior
      queda en docs/ejemplos.md como historia

## 7 — Catálogo de reglas

- [x] **Campo `nombre` en la ficha (firmado por Antonio el 02/10 al lanzar
      el 7.1; HECHO 02/10)**: opcional en el esquema (3-80 caracteres),
      obligatorio por juez en RadiografIA y Español correcto (mayúscula
      inicial, sin id, sin punto final, sin repetidos); los 50 nombres
      leídos y firmados por Antonio con seis cambios; donde falte, se
      humaniza el id. maxLength con mensaje en castellano (hallazgo)
- [x] Página `/reglas` generada del JSON al compilar: buscador y filtros
      por familia, severidad y detector (7.1, 02/10: getStaticPaths e
      import de los JSON en el frontmatter; buscador por nombre, id y
      explicación; recuento en aria-live; «Quitar filtros»; orden
      alfabético con localeCompare('es'): paquete → familia → nombre;
      severidad baja → media → alta; hoy las 50 son «baja»)
- [x] Ficha por regla con URL propia (`/reglas/<id>`) (7.1: 50 páginas con
      todo el contenido literal de la ficha; ids únicos entre paquetes
      comprobados en build)
- [x] Enlace cruzado desde cada subrayado del analizador a su ficha (7.1:
      panel, desglose y cabecera enlazan; BASE_URL). **Hallazgo y arreglo**:
      el frontmatter del catálogo importaba el motor del navegador y en
      `astro dev` (SSR) silabea.cjs daba «module is not defined»; build y
      preview no lo veían → el catálogo solo importa `./validacion` y
      `./validador` (exports nuevos del motor) y hay juez de `astro dev`
      (la zona sin vigilar); selector de género con General primero y el
      resto alfabético
- [x] Visto en Chrome por Antonio (02/10). **PUNTO 7 CERRADO (02/10)**

## 8 — Cargador de paquetes

- [x] **Decisión firmada 02/10 (cabo del 7)**: las reglas de un paquete
      propio no tienen ficha en `/reglas`; el panel del analizador muestra
      su ficha completa dentro del propio panel y sin enlace; las de los
      paquetes incluidos siguen enlazando a su página (8.1: y en el
      desglose un <details> con la ficha completa, para las señales de
      texto entero que no tienen tramo)
- [x] Casillas (no desplegable: para combinar hay que marcar varios;
      firmado 02/10) con los paquetes incluidos (RadiografIA y «español
      correcto») (8.1: desmarcar quita el paquete al reanalizar, con aviso
      «Los paquetes han cambiado…»; sin ningún paquete activo, el botón se
      desactiva; sin `_total-*` activo, sin banda y se dice)
- [x] Cargar JSON propio desde el ordenador; nada sale del navegador
      (comprobado: cero peticiones al cargar y analizar) (8.1: <input
      type="file" accept="application/json,.json"> sin name, File.text()
      [DOC MDN], límite 2 MB [PROPIO], orden tamaño → JSON → validador →
      nombre repetido contra todos los conocidos; sin persistencia;
      **juez de red con Chrome headless por CDP**: 5 peticiones en la
      carga inicial y 0 después de cargar, analizar, abrir paneles y
      marcar/desmarcar; **CSP** `connect-src 'self'; form-action 'self'`
      en la página publicada vía security.csp de Astro [DOC], con juez;
      dev sin CSP por diseño de Astro)
- [x] Error de validación legible: regla y campo (8.1: lista con los
      mensajes del validador tal cual; JSON roto con frase en castellano y
      el detalle del navegador marcado)
- [x] Combinar paquetes; el subrayado distingue de qué paquete viene
      (8.1: clave paquete+familia; colores estables repartidos sobre todos
      los conocidos; propios en subrayado discontinuo; nombre del paquete
      en texto en leyenda, panel y desglose [WCAG 1.4.1]; selector de
      género = unión de los activos, General primero)
- [x] Visto en Chrome por Antonio (02/10: casillas, carga del paquete de
      prueba, tres bloques, ficha sin enlace, inválido con su error, Red
      vacía, desaparece al recargar). **PUNTO 8 CERRADO (02/10)**

## 9 — Informe PDF

- [x] Hoja `@media print`: puntuación, desglose, texto con subrayados,
      lista de señales con explicación y sugerencia, fecha, y la nota
      «analiza estilo, no demuestra autoría» (9.1, 02-03/10: en el
      <style is:global> de index.astro; @page A4 2 cm; break-inside: avoid
      por regla, señal y medidor; cabecera del informe con fecha y hora
      del análisis, género, palabras, tramo y paquetes con versión;
      **siglas de familia por tramo** (data-siglas + ::after, reparto
      estable; la leyenda hace de clave) para no depender del color [WCAG
      1.4.1]; lista de señales por regla con hasta 5 fragmentos, explicación,
      sugerencia y URL absoluta de la ficha; párrafo «No hay análisis que
      imprimir» para Ctrl+P sin resultado; sin beforeprint/afterprint
      (setEmulatedMedia no los dispara: el juez y el PDF verían cosas
      distintas); orphans/widows como mejora no Baseline)
- [x] Botón «Descargar informe» → `window.print()` (9.1: desactivado
      hasta que hay resultado; imprime el último análisis pintado, con su
      fecha en la cabecera)
- [x] PDF generado y abierto por Antonio (03/10: cabecera, banda, texto con
      siglas y clave, señales regla a regla, nota al pie, sin botones ni
      textarea, ninguna regla cortada). Juez con CDP: Page.printToPDF con
      preferCSSPageSize da A4 (sin @page, Chrome imprime en carta), %PDF-,
      páginas contadas en la raíz del árbol /Pages [ISO 32000-1 §7.7.3.2],
      red 0 y CSP 0 al imprimir. **PUNTO 9 CERRADO (03/10)**
- [x] **9.2 — Lenguaje de calle (firmado por Antonio el 03/10 tras probar
      la demo: «le falta lenguaje de calle»; HECHA el 03/10 como primera
      prueba; texto y presentación, sin tocar motor ni reglas)**. Referente: la barra lateral de
      Hemingway (titular de una línea, recuentos con meta, ánimo cuando
      está bien, una frase por subrayado, detalle aparte), con la
      honestidad de la calibración: la meta es lo que hacen los textos
      humanos del mismo tipo, nunca una afirmación de autoría (GPTZero es
      el contraejemplo). Cuatro piezas: (1) titular del medidor en claro,
      cifras plegadas en «Ver el detalle»; (2) resumen con recuentos y meta
      de las tres reglas que más pesan y «Empieza por: [sugerencia]»;
      (3) campo `enClaro` en la ficha (una frase llana con ejemplo, 50
      líneas que lee y firma Antonio), primero en el panel, explicación
      larga plegada en «¿Por qué lo miramos?»; (4) vocabulario del motor
      fuera de la pantalla (informativa, atenuante, noAplicadas, tramo,
      p95) en textos.ts. Primera prueba: se retoca después con el ojo de
      Antonio. **Resultado**: el titular se sustituyó por ETIQUETA + FRASE
      con los textos literales de Antonio («Texto sin indicios de Asistente
      IA», «Texto con muy pocos rasgos que indiquen que tiene Asistente
      IA», «Dentro de lo normal», «Texto con bastantes rasgos de Asistente
      IA», «Texto con muchos rasgos de Asistente IA», «No podemos
      comparar»; frases con «suena a» y «de cada 100 … solo 5/1»; aviso de
      texto corto; caso de paquete propio con escala); el género `opinion`
      se muestra como «Opinión (críticas de cine)» por honestidad con el
      corpus; `enClaro` en las 50 reglas (esquema 3-140, juez); resumen de
      dos líneas con meta solo en estadísticas (percentil de la regla y
      unidad por métrica); panel nombre → enClaro → «Qué hacer» → «¿Por qué
      lo miramos?» plegado; etiquetas de pantalla sin vocabulario del motor
      (juez de Chrome lo vigila); catálogo e informe con la frase en
      claro. Visto por Antonio con los tres textos (03/10). Pendiente para
      el DISEÑO: dónde y cómo destaca la etiqueta; pestañas

## 10 — Estética (DISEÑO → Figma Make → calco)

Como el punto 15 de Desplázame. Identidad ya fijada: nombre, eslogan,
botón. Nada se dibuja sin documento rector.

**Apuntes de Antonio recogidos durante los puntos 6 y 7, para el DISEÑO**
(02/10): (1) los filtros del catálogo en **columnas**, no en cascada
(familia, detector, severidad); (2) el panel de la regla en el analizador,
junto al tramo (tooltip/popover) y no debajo de la vista; (3) la CSS
Custom Highlight API como mejora de los subrayados (Baseline 2026-03);
(4) `.gitattributes` para fuentes autoalojadas antes de la primera;
(5) contraste: sobre blanco, los colores de familia #e69f00 (2,25:1) y
#56b4e9 (2,31:1) no llegan al 3:1 de WCAG 1.4.11 para objetos gráficos; los
demás dan de 3,06 a 5,19. La paleta del DISEÑO debe resolverlo; (6) el
informe impreso es largo (10-16 páginas A4 sin estilo): las seis reglas de
contexto de Estadística con sus explicaciones, huecos por break-inside y
la nota sola en la última página; su maqueta es del DISEÑO; (7) **la
estructura de la pantalla de resultado**: resultado fijo arriba (etiqueta,
frase, lo que más pesa, empieza por) y debajo pestañas Texto subrayado /
Reglas / Datos; acordeón solo dentro de una pestaña; en el informe,
secciones numeradas con salto de página antes de las largas (Antonio,
03/10); (8) la etiqueta del resultado debe destacar a la vista (tamaño,
posición) y el panel de regla, junto al tramo; (9) **móvil como
requisito** (Antonio, 03/10): cada pantalla con maqueta móvil y escritorio;
tramos tocables con tamaño de pulsación suficiente (WCAG 2.5.8); panel de
regla como hoja inferior en móvil; pestañas en vez de columnas; cargador y
selector apilados; filtros del catálogo plegados; frames móvil y escritorio
en Figma; calco visto en Chrome a 390 px y en el móvil real de Antonio;
juez sin scroll horizontal a 360 px. **Antes del DISEÑO: prospección en
Chrome** (03/10) de analizadores comparables (Hemingway, GPTZero,
Copyleaks, Grammarly, LanguageTool, Readable, y una española si la hay) con
checklist fija, en escritorio y a 390 px, sin capturas (derechos), en
`docs/investigacion/ux-benchmark.md`.

- [x] `DISEÑO-RADIOGRAFIA.md`: investigación con doctrina (accesibilidad,
      legibilidad de texto largo, impresión), el concepto del icono
      «documento en negativo» con sus variantes, y resumen ejecutivo con
      las decisiones VALIDADAS por Antonio antes de abrir Figma (03/10:
      informe del módulo en `docs/investigacion/informes/diseno-modulo.md`;
      prospección `ux-benchmark.md`; DISEÑO en la raíz firmado como punto
      de partida: Hemingway como molde, pastilla del resultado, tarjetas
      por regla y por familia con ojo, subrayado fino con estilo de línea y
      sigla, paleta de 8 ≥ 3,4:1 recalculada, Literata + Atkinson
      Hyperlegible Next autoalojadas, 60-66 cpl, tarjeta anclada /
      hoja inferior, informe por secciones, tres variantes de icono; lo que
      no guste se ajusta en Figma y se reescribe aquí antes del calco)
- [x] Fuentes **autoalojadas** y con subsetting (Múnich 2022, RGPD): la
      serif editorial y la sans se eligen sabiendo esto (03/10: Literata y
      Atkinson Hyperlegible Next, OFL 1.1; el autoalojado y el subsetting se
      hacen en el calco)
- [ ] Brief a Figma Make escrito desde el DISEÑO (layout, hex, fuentes,
      estados honestos, restricciones al modelo). Antonio modela; Claude
      lee por MCP
- [ ] Salida del modelo = especificación + tokens DTCG, no código.
      Componentes con estados: ficha, subrayado por familia, medidor,
      informe, cargador; vista de impresión incluida
- [ ] Modelo VISTO y cerrado por Antonio
- [ ] Logo: candidatos SVG, Antonio elige, `PROCEDENCIA.md`, favicon
      cableado
- [ ] Calco por tandas al Astro existente, cada una vista en Chrome
- [ ] Contraste AA verificado con acta. **PUNTO 10 CERRADO**

## 11 — Despliegue y cierre

- [ ] **Censo pre-despliegue** (`docs/CENSO-PRE-DESPLIEGUE.md`, bloque A
      de la guía): dependencias muertas fuera, huérfanos podados,
      cabeceras de caché, notices al día
- [ ] **Parlamento con la doc del panel de Hostinger** antes de tocar
      nada: hosting compartido para estático; si hay auto-deploy desde
      GitHub para estático o se sube el `dist` NO CONSTA hoy — se resuelve
      con la doc y los precedentes de la casa, no de memoria
- [ ] Publicado en el subdominio que Antonio decida; verificado desde
      fuera con el ojo delante
- [ ] README final: qué hace, qué no demuestra, cómo escribir un paquete
      propio, enlace al catálogo
- [ ] Release v1.0.0 y reposo
- [ ] Ficha del proyecto en el portafolio y en LinkedIn. **PUNTO 11
      CERRADO — v1 EN PRODUCCIÓN**
