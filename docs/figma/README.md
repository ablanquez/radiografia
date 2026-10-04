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
  el DISEÑO).
- `icono/` — `icono-a.svg` (favicon, manifiesto, apple-touch) e
  `icono-c.svg` (cabecera y portada), elegidos por Antonio; `PROCEDENCIA.md`.
- `modelo-make.zip` — el código que generó Make (React + Tailwind v4, 62
  ficheros, 76 KB), descargado el 04/10 con «Download code». **Solo
  referencia de lectura** para el calco: medidas, espaciados y CSS que
  Make decidió donde el DOM publicado no baste. No se descomprime en el
  repo, no se instala, no entra en el NOTICES (no se distribuye) y no se
  copia al Astro: el calco se escribe a mano sobre `web/` con los tokens.
- El prototipo publicado (URL en la conversación de estrategia; Figma
  Make, cuenta de Antonio) es la referencia visual: Claude Code lo mide
  por CDP y compara cada tanda del calco con él.

Desviación respecto al plan: la casilla decía «Claude lee por MCP» el
fichero de Figma Design. No hizo falta: el prototipo publicado es medible
en el DOM y el zip trae el CSS; la copia a Figma Design («Copy as design
layers») queda como opcional para el archivo del diseño.
