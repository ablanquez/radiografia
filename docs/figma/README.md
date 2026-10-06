# docs/figma — el modelo de RadiografIA en Figma Make

Material del punto 10 (estética). Nada de aquí se ejecuta ni se despliega:
la web real es `web/` (Astro). Esto es la fuente del calco (10.4).

- `guidelines.md` — las guías que Figma Make lee en cada prompt. Escritas
  desde `DISEÑO-RADIOGRAFIA.md`; dos reglas cambiaron el 04/10 al ver el
  modelo (3: fondo suave tipo rotulador + línea; 5: el tramo es
  `<span role="button">`, porque `<button>` no fluye con el texto).
- `prompts.md` — pasos en Figma y los nueve prompts (0 plan, 1-6
  pantallas, 7 tokens, 8 icono) tal como se lanzaron el 04/10 con Claude
  Opus 5.5; los retoques con Gemini 3.8 Flash están en la conversación de
  estrategia.
- `tokens.json` — tokens en formato Design Tokens Community Group
  2025.10, exportados por Make y validados el 04/10 (31 colores bien
  formados, sin hex sueltos; contrastes recalculados y coincidentes con
  el DISEÑO). **Ampliado el 04/10** (10.4, Tanda 1, aprobado por Antonio)
  con lo que el modelo tenía en `@theme` o en sus componentes y no en el
  JSON: los colores `sobre-acento`, `aviso-error`, `velo`, `ink-2-40` e
  `ink-2-50`; `radio.redondo`; `tipografia.interletrado.marca`; los grupos
  `medida` (columnas, 44 y 48 px), `sigla-tarjeta`, `sombra` e
  `impresion`. DTCG 2025.10 solo admite `px` y `rem` en `dimension`
  (§8.2.1): las medidas en em, pt y mm van como `number` con su unidad en
  `$extensions` (`com.github.ablanquez.radiografia`, §5.2.3). El
  `$type: "string"` del estilo de línea de cada familia, que venía de
  Make, no es un tipo de la especificación; se deja como estaba.
  **Cambio del 05/10** (10.4, Tanda 5, DISEÑO §4): Puntuación y formato
  pasa de `#009e73` a `#009988` (paleta vibrant de Paul Tol), con sus dos
  tintes recalculados, porque en deuteranopía quedaba a 4,02 de CIEDE2000
  de Ortotipografía (Machado 2009, el juez de contraste); viene del DISEÑO,
  no del prototipo, y `guidelines.md`, lo que leyó Make, sigue con el de
  entonces.
- `medidas-modelo.json` — las medidas del prototipo publicado (fuente,
  tamaño, interlineado, colores calculados, bordes, radios, rellenos y
  cajas de cada pieza, en sus tres tamaños), tomadas por CDP con
  `web/scripts/medir-modelo.ts`. Las lee `web/jueces/fidelidad.spec.ts`
  (±1 px; ±0,01 en proporciones); los jueces no salen a Internet. Se
  regenera a mano cuando cambia el modelo o entran piezas en el calco.
  Las piezas con `origen` no son del prototipo sino del DISEÑO, que manda
  (el icono (c) de la cabecera, 56/48 px, §8; desde la Tanda 3, la
  separación de los párrafos de la vista, una línea en blanco de 27 px,
  §5, decidida por Antonio en la parada 2: el modelo la tenía en 16; desde la
  Tanda 4, la caja de la columna del resultado con scroll propio, 383 px
  con el carril de la barra, §6.1, y el margen de scroll del anillo de
  foco, 4 px, §7, aceptados por Antonio en la parada 3; desde la Tanda 4
  bis, la hoja de imprimir sin resultado, §6.5, decisión de Antonio del
  05/10, y el salto de página antes de la sección 5, §6.5, al cerrar la
  parada 4 bis: en el marco, la 5 empieza página porque su paginador no
  parte bloques, no por un salto): el script las escribe con su apartado y
  su nota. Desde la Tanda
  2, las del analizador (formulario, resultado, tramos, tarjeta de regla,
  pestañas y hoja), y también el estilo, el grosor, el color y el
  desplazamiento de la línea, la alineación, el borde izquierdo y el alto
  máximo; desde la Tanda 3, también el catálogo (sus tres tamaños, sin
  resultados y la hoja de filtros del móvil) y la ficha; desde la Tanda 4
  bis, el marco «Informe / A4» (la página, sus márgenes, el número de
  página y las líneas de cada sección, con su página, su caja y la línea
  base de su primera y su última línea), que lee el juez de fidelidad del
  papel: 169 piezas.
- `fuentes.md` y `subconjunto-unicode.txt` — la ficha de las fuentes
  autoalojadas (origen, versiones, huellas, Reserved Font Name, comandos y
  cifras de la decisión) y la lista de caracteres del recorte (10.4,
  Tanda 1).
- `icono/` — `icono-a.svg` (favicon, manifiesto, apple-touch) e
  `icono-c.svg` (cabecera y portada), elegidos por Antonio; `PROCEDENCIA.md`.
- `modelo-make.zip` — el código que generó Make (React + Tailwind v4, 62
  ficheros, 76 KB), descargado el 04/10 con «Download code». **Solo
  referencia de lectura** para el calco: medidas, espaciados y CSS que
  Make decidió donde el DOM publicado no baste. No se descomprime en el
  repo, no se instala, no entra en el NOTICES (no se distribuye) y no se
  copia al Astro: el calco se escribe a mano sobre `web/` con los tokens.
  **Vive solo en local**, en esta carpeta: desde el 06/10 (11.1, hallazgo 6
  del censo pre-despliegue, firmado por Antonio) no se versiona y
  `.gitignore` lo ignora. Las condiciones de lo que genera Figma Make NO
  CONSTAN y el repositorio es público. Del 04/10 al 06/10 estuvo
  versionado y sigue en la historia de git; se asume. Lo vigila
  `web/jueces/repositorio.spec.ts`.
- El prototipo publicado (URL en la conversación de estrategia; Figma
  Make, cuenta de Antonio) es la referencia visual: Claude Code lo mide
  por CDP y compara cada tanda del calco con él.

Desviación respecto al plan: la casilla decía «Claude lee por MCP» el
fichero de Figma Design. No hizo falta: el prototipo publicado es medible
en el DOM y el zip trae el CSS; la copia a Figma Design («Copy as design
layers») queda como opcional para el archivo del diseño.
