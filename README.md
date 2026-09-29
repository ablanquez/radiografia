<div align="center">

# RadiografIA

**A contraluz se nota todo.**

[![Licencia](https://img.shields.io/badge/licencia-Apache%202.0-64748B)](LICENSE)
[![Estado](https://img.shields.io/badge/estado-en%20construcci%C3%B3n-F59E0B)](#hoja-de-ruta)

</div>

> Pegas un texto en español, pulsas **«Pon tu texto a contraluz»** y ves
> qué patrones de *estilo IA* hay en él: subrayados por familia, un medidor
> con su desglose y, en cada señal, la regla que la disparó, por qué y qué
> harías tú.
>
> ⚠️ **Analiza estilo. No demuestra autoría.** Un texto lleno de señales
> puede ser de una persona; uno limpio puede ser de una máquina. La
> herramienta señala rasgos, no firma sentencias.

---

## Qué es

Un analizador de textos **por reglas**, no por modelo. No hay red neuronal
detrás ni llamada a ninguna API: cada señal la produce una regla escrita a
mano, con su explicación, su sugerencia y sus ejemplos, y se puede leer una
por una en el catálogo.

El motor **no sabe nada de «IA»**. Aplica un **paquete de reglas** en JSON.
RadiografIA es el primer paquete; el segundo puede ser la guía de estilo de
tu empresa. Se cargan paquetes propios desde el ordenador, se combinan, y
**nada sale del navegador**: ni el texto ni las reglas.

## Estado

**En construcción.** Hoy (29/09/2026) existe el plan firmado, la
configuración del repositorio y este README. No hay código, no hay
ninguna regla y no hay pantalla. Todo lo que se afirma más arriba es lo
que se va a construir, en el orden de la [hoja de ruta](#hoja-de-ruta).

## Cómo está pensado

- **Astro estático, sin backend.** Todo corre en el navegador.
- **Cinco familias de reglas**: léxico, sintaxis, puntuación y formato,
  estadística, discurso. Cada familia nace de una investigación con fuentes
  antes de escribir su primera regla.
- **Tres tipos de detector**: patrón, estructural, estadístico.
- **Ficha por regla**: id, familia, detector, peso, severidad, explicación,
  sugerencia, excepciones, ejemplos positivos y negativos. Los ejemplos son
  la documentación y son los tests.
- **Catálogo público** con una página por regla.
- **Informe PDF** desde la propia página.
- **Las reglas se editan en Git.** No hay CMS.

## Hoja de ruta

El plan completo, con sus casillas, está en
[`PLAN-RADIOGRAFIA.md`](PLAN-RADIOGRAFIA.md). El estado, en
[`RADIOGRAFIA-ESTADO.md`](RADIOGRAFIA-ESTADO.md). Los fallos reales, en
[`docs/BITACORA.md`](docs/BITACORA.md), escritos en caliente.

## Licencia y créditos

Código y paquetes de reglas: **[Apache 2.0](LICENSE)** · © 2026
**Antonio Blánquez Cabeza** — [antonioblanquez.es](https://antonioblanquez.es)

Cuando entre la primera dependencia de terceros, sus condiciones irán una
por una en `THIRD-PARTY-NOTICES.md`. Hoy no hay ninguna.

Las fuentes de cada regla (estudios, guías, corpus) se citan en su ficha y
en el catálogo.
