# CLAUDE.md — 005 RadiografIA

## PARTE A — Método (igual en todos los proyectos)

### Antes de arreglar

- Antes de tocar el código que falla, busca qué instrumento lo cubría: el
  test, el contador, la vista, el guardián. Ábrelo y míralo.
- Si algo daba verde con el fallo vivo, eso es el hallazgo — más que el fallo.
- Si nada lo cubría, dilo: una zona sin vigilar también es un dato.

### Verde

- Un verde no se deduce: se ejecuta y se mira. Si no se puede ejecutar, di
  cómo lo comprobaste.
- Verde a la primera es sospecha, no celebración. Haz la contraprueba sobre
  la prueba (cambia el valor esperado y mira que falle); nunca rompas el
  código real para ver el rojo.

### Cuando falta un dato

- `NO CONSTA`. No se infiere, no se rellena con lo probable.

### Al terminar

- Commits atómicos con las rutas escritas una a una.
- Lo que descubras que cambie el estado del proyecto se reporta, no se
  escribe: el documento de estado lo lleva otra conversación.

### Idioma

- Español: código, commits y bitácora.

## PARTE B — Este proyecto

### Qué es

Web estática que analiza un texto en español y señala patrones de «estilo
IA» mediante reglas. Se pega un texto, se pulsa «Pon tu texto a contraluz»
y se ven los subrayados por familia, un medidor con desglose y, en cada
subrayado, la explicación y la sugerencia de la regla. Analiza estilo; no
demuestra autoría.

El motor no sabe nada de «IA»: aplica un **paquete de reglas** en JSON.
RadiografIA es el primer paquete. Alrededor del motor: catálogo público de
reglas con URL por regla, cargador de paquetes (incluidos, propios y
combinados) e informe PDF por CSS de impresión.

El alcance exacto, punto a punto, está en `PLAN-RADIOGRAFIA.md`. Ese
documento manda.

### Stack

- **Astro estático**, sin backend ni API. Todo corre en el navegador.
- **TypeScript** de punta a punta.
- **Reglas en JSON**: un paquete = cabecera (nombre, versión, idioma,
  descripción, autor) + lista de reglas. Cada regla es una ficha con id,
  familia, detector, peso, severidad, explicación, sugerencia, excepciones
  y ejemplos positivos y negativos. Los ejemplos son los tests.
- **Validación con esquema** al cargar un paquete; el error dice qué regla
  y qué campo fallan.
- **Nada sale del navegador**: ni el texto ni los paquetes que se cargan.
- **Despliegue:** Hostinger, hosting compartido para estático. El cómo se
  parlamenta con la doc del panel cuando llegue el punto 11.

### Lo que NO se toca

- **Ninguna llamada de red** durante el análisis ni al cargar paquetes.
  Si una tarea parece necesitarla, para y avisa.
- **Los textos de ejemplo escritos por Antonio**: no se retocan para que
  el motor los deje pasar. Si el motor los marca, se documenta.
- **La identidad**: nombre RadiografIA, eslogan «A contraluz se nota
  todo.», botón «Pon tu texto a contraluz». No se reescriben.

### Lo que ya se decidió y no se rediscute

- **Las reglas son el proyecto; la interfaz solo las enseña.** Ninguna
  regla se escribe sin la investigación de su familia (punto 2 del plan)
  y sin fuente citada en la ficha.
- **El orden del plan es firme**: investigación → esquema → motor →
  paquete → pantalla → catálogo → cargador → informe → estética →
  despliegue. La estética va al final; primero que funcione.
- **Se ve en Chrome desde el punto 6.** Antes de eso, nada está hecho
  hasta que los jueces se hayan visto en rojo antes del verde.
- **Alcance corto.** Lo que no está en el plan no entra por iniciativa
  propia: se dice y se espera respuesta. Fuera de la v1: reescritura
  automática, CMS o editor de reglas en navegador, catálogo público de
  paquetes, otros idiomas, cuentas, historial, subida de archivos.
- **Edición de reglas vía Git.** El JSON se edita en el repositorio.
- **Bitácora y estado empiezan en cero.** La bitácora la escribe la skill
  `escribir-bitacora` al descubrir un fallo real, antes de arreglarlo.
