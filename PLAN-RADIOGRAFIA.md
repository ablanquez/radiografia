# PLAN — 005 RadiografIA

Estado a 29/09/2026: **FIRMADO por Antonio el 29/09/2026**, aún sin
publicar (entra en el primer commit). Se tacha lo hecho y lo nuevo se
añade en su punto, y solo por decisión de Antonio.

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
   estadístico. Puntuación normalizada por longitud.
2. **Paquete RadiografIA v1**: reglas en cinco familias — léxico,
   sintaxis, puntuación y formato, estadística, discurso — cada una
   nacida de una **investigación a fondo con fuentes** (Regla Cero).
3. **Ficha por regla**: id, familia, detector, peso, severidad,
   explicación, sugerencia, excepciones, ejemplos positivos y negativos.
   Los ejemplos son a la vez documentación y test automático.
4. **Analizador**: pegas texto → subrayados por familia, medidor de
   estilo IA, explicación y sugerencia por señal.
5. **Catálogo público de reglas**: página por regla con URL propia,
   buscador y filtros; enlace cruzado desde cada subrayado.
6. **Cargador de paquetes**: paquetes incluidos en desplegable; cargar
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
11. **Longitud mínima**: por debajo del umbral, «texto insuficiente» en
    vez de puntuación. El umbral sale del punto 2 con fuente.
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
  la calibración crece después.

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

- [ ] Carpeta `F:\01_PROYECTOS\005_RADIOGRAFIA`, VS Code dentro
- [ ] `CLAUDE.md` en la raíz (PARTE A del taller + PARTE B con el stack:
      Astro estático, sin backend)
- [ ] `git init`, identidad `ablanquez` verificada, `.gitignore` antes del
      primer commit
- [ ] `docs/BITACORA.md` vacía · `RADIOGRAFIA-ESTADO.md` v0
- [ ] Licencia decidida con el modelo de la casa (Apache 2.0 para el
      código; lo que pida el paquete de reglas se decide con la doc)
- [ ] LICENSE y README generados partiendo de Desplázame
- [ ] `THIRD-PARTY-NOTICES.md` en cuanto entre la primera dependencia,
      con su juez (`notices.spec`)
- [ ] Remoto creado con `gh`, push de los primeros commits, verificado
      por Antonio en GitHub. **PUNTO 1 CERRADO**

## 2 — Investigación de las cinco familias

Una investigación por familia, ANTES de escribir ninguna regla. Cada una
en `docs/investigacion/<familia>.md`: qué patrones existen, con qué fuente
(papers, guías de estilo, estudios de detección, corpus públicos), qué
excepciones conocidas provocan falsos positivos, y qué candidatas a regla
salen de ahí con su tipo de detector. Sin fuente no hay candidata.

- [ ] Léxico
- [ ] Sintaxis
- [ ] Puntuación y formato
- [ ] Estadística (incluye el umbral de longitud mínima, con fuente)
- [ ] Discurso
- [ ] Lista consolidada de candidatas a regla, con familia, detector y
      fuente, VISTA por Antonio. **PUNTO 2 CERRADO**

## 3 — Esquema del paquete y de la ficha de regla

Todo lo demás cuelga de aquí. Se cierra antes de escribir el motor.

- [ ] Esquema del paquete: cabecera (nombre, versión, idioma,
      descripción, autor) + lista de reglas. Formato de esquema decidido
      con la doc ([DOC] JSON Schema)
- [ ] Esquema de la ficha: id, familia, detector, peso, severidad,
      explicación, sugerencia, excepciones, ejemplos positivos y negativos
- [ ] Validador con mensajes de qué regla y qué campo fallan, visto en
      ROJO con paquetes rotos a propósito
- [ ] Un paquete de ejemplo mínimo válido y tres inválidos como fixtures.
      **PUNTO 3 CERRADO**

## 4 — El motor

Sin interfaz. Solo funciones y jueces.

- [ ] Carga y valida un paquete
- [ ] Detector de patrón (lista de frases / regex)
- [ ] Detector estructural (frase y párrafo)
- [ ] Detector estadístico (texto entero contra umbral)
- [ ] Puntuación: normalizada por longitud, con acumulación por familia
- [ ] Longitud mínima: «texto insuficiente» por debajo del umbral, con
      juez en ambos lados del borde
- [ ] Combinación de varios paquetes con origen en cada señal
- [ ] Jueces alimentados por los ejemplos de las fichas: cada ejemplo
      positivo dispara, cada negativo no. Vistos en rojo antes del verde.
      **PUNTO 4 CERRADO**

## 5 — Paquete RadiografIA v1

Una tanda por familia, cada regla con su ficha completa y sus ejemplos.
Fuente citada en cada ficha (sale del punto 2).

- [ ] Léxico
- [ ] Sintaxis
- [ ] Puntuación y formato
- [ ] Estadística
- [ ] Discurso
- [ ] El paquete pasa el validador y todos sus ejemplos pasan los jueces
- [ ] El eslogan y los textos de la propia web pasan por el motor: si los
      marca, se cambian (dicho en el brainstorming). **PUNTO 5 CERRADO**

## 6 — La pantalla mínima (aquí ya existe la demo)

Astro, sin diseño todavía: funciona, no luce.

- [ ] Proyecto Astro creado, 200 comprobado con contraprueba, visto en
      Chrome
- [ ] Área de texto + botón «Pon tu texto a contraluz»
- [ ] Subrayados por familia sobre el texto
- [ ] Medidor global con desglose por familia
- [ ] Al tocar un subrayado: explicación y sugerencia de la regla
- [ ] Nota «analiza estilo, no demuestra autoría» junto al medidor
- [ ] Textos de ejemplo precargados (el de Antonio, pasado por el motor
      y con el resultado documentado)
- [ ] **CICLO ENTERO VISTO POR ANTONIO EN CHROME. PUNTO 6 CERRADO**

## 7 — Catálogo de reglas

- [ ] Página `/reglas` generada del JSON al compilar: buscador y filtros
      por familia, severidad y detector
- [ ] Ficha por regla con URL propia (`/reglas/<id>`)
- [ ] Enlace cruzado desde cada subrayado del analizador a su ficha
- [ ] Visto en Chrome. **PUNTO 7 CERRADO**

## 8 — Cargador de paquetes

- [ ] Desplegable con los paquetes incluidos
- [ ] Cargar JSON propio desde el ordenador; nada sale del navegador
      (comprobado: cero peticiones al cargar y analizar)
- [ ] Error de validación legible: regla y campo
- [ ] Combinar paquetes; el subrayado distingue de qué paquete viene
- [ ] Visto en Chrome. **PUNTO 8 CERRADO**

## 9 — Informe PDF

- [ ] Hoja `@media print`: puntuación, desglose, texto con subrayados,
      lista de señales con explicación y sugerencia, fecha, y la nota
      «analiza estilo, no demuestra autoría»
- [ ] Botón «Descargar informe» → `window.print()`
- [ ] PDF generado y abierto por Antonio. **PUNTO 9 CERRADO**

## 10 — Estética (DISEÑO → Figma Make → calco)

Como el punto 15 de Desplázame. Identidad ya fijada: nombre, eslogan,
botón. Nada se dibuja sin documento rector.

- [ ] `DISEÑO-RADIOGRAFIA.md`: investigación con doctrina (accesibilidad,
      legibilidad de texto largo, impresión), el concepto del icono
      «documento en negativo» con sus variantes, y resumen ejecutivo con
      las decisiones VALIDADAS por Antonio antes de abrir Figma
- [ ] Fuentes **autoalojadas** y con subsetting (Múnich 2022, RGPD): la
      serif editorial y la sans se eligen sabiendo esto
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
