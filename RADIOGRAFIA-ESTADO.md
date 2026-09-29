# RADIOGRAFIA — ESTADO

**Escritor único: la conversación de estrategia.** Nadie más escribe aquí.
El ejecutor reporta descubrimientos; no toca este fichero.

---

## ESTADO ACTUAL — 29 de septiembre de 2026

**⭐ PUNTOS 1 Y 2 CERRADOS (29/09).** El 1: repo público
`ablanquez/radiografia` con plan firmado, CLAUDE.md, licencia Apache 2.0,
README v0, estado y bitácora vacía. El 2: las cinco familias investigadas
con el módulo de investigación (`docs/investigacion/`: léxico, sintaxis,
puntuación-formato, estadística, discurso; dos informes brutos en
`informes/`), lista consolidada `CANDIDATAS.md` con **93 candidatas (85
tras fusionar duplicados) y solo 14 medidas en español**, y las 8
decisiones de Antonio firmadas (§5). No existe código, no existe ninguna
regla, no existe pantalla. Bitácora vacía. **Siguiente: punto 3, esquema
del paquete y de la ficha — primer encargo a Claude Code.**

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
- Librerías que entran al navegador (decisión con la doc en el punto 3):
  etiquetador POS del español, silabeador, listas de frecuencia. No hay
  librería JS/TS madura de estadística del español: el motor implementa
  las fórmulas con su fuente (`estadistica.md` §1).
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

`PLAN-RADIOGRAFIA.md`, 11 puntos. Cerrados: 1 y 2 (29/09). Abierto: el 3.

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

## 6 · Cabos abiertos

- `.gitattributes` con `*.woff2 -text` (y hermanos) ANTES de que entre la
  primera fuente autoalojada en el punto 10 — herencia de la nº40 de
  Desplazame. Propuesto el 29/09 como casilla del punto 10; Antonio aún
  no ha dicho si entra en el plan.
- Fuentes no leídas enteras que las fichas tendrán que abrir en el punto
  5: PDF de Pham 2026 (cifras por categoría), PUCP-Metrix, Berber
  Sardinha 2024, `license.txt` de SUBTLEX-ESP.
- Corpus humano para calibrar (punto 5): Spanish Billion Words (CC BY-SA)
  y AnCora (CC BY 4.0 en Zenodo/UD, GPL en ELRA/HF: usar Zenodo). ROBOT-
  TALK solo si la UCM lo cede.

## Nevera

- D12, positividad/emoción: entra si aparece un léxico en español con
  licencia compatible (SEL si Sidorov publica licencia; TRUNAJOD lo
  empaqueta bajo MIT sin que conste permiso).
- Relanzar cada familia con el módulo cuando cambien las generaciones de
  modelos: las cinco investigaciones tienen fecha de caducidad (los
  «humanizers» borran primero los rasgos más citados).
