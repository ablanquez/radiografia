# Changelog

Todo lo destacable que le pasa a RadiografIA se anota aquí.

El formato es el de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las
versiones, las de [SemVer](https://semver.org/lang/es/).

## [1.0.0] — 2026-10-07

**RadiografIA analiza un texto en español y señala, regla a regla, los rasgos que, según sus
fuentes, los asistentes de chat dejan más que las personas.** Lo compara con textos escritos
por personas, del mismo género y de la misma longitud, y dice a qué suena: **analiza estilo,
no demuestra autoría**. Es una web estática, sin backend: el análisis corre en el navegador, y
ni el texto ni los paquetes que se cargan salen de él. En producción desde el 06/10 en
<https://radiografia.antonioblanquez.es>.

### Añadido

- **El motor**, que no sabe nada de «IA»: aplica paquetes de reglas en JSON, validados al
  cargar con un esquema que dice qué regla y qué campo fallan. Tres detectores: de patrón,
  estructural y estadístico. Con menos de 100 palabras de prosa no analiza; de 100 a 299, el
  resultado es orientativo; desde 300, completo.
- **Dos paquetes incluidos, 50 reglas.** RadiografIA, 43 en seis familias —léxico, sintaxis,
  puntuación y formato, estadística, discurso y canal—, cada una investigada con fuentes antes
  de su primera regla; y Español correcto, 7 avisos de norma de la RAE. Cada regla cita sus
  fuentes y su nivel de evidencia, que en RadiografIA pone tope a su peso.
- **La calibración**: las reglas estadísticas comparan el texto con los percentiles de textos
  de personas de su género y su longitud, en 6 géneros calibrados con cinco corpus. En los
  textos apartados para validar antes de medir, dos o más saltan en el 2,1 % (35 de 1.703);
  por género, del 1,1 % de opinión al 5,1 % de administrativo, que pasa del 5 % del plan y
  Antonio aceptó con declaración el 01/10.
- **La web, 54 páginas en Astro**: el analizador, el catálogo, los créditos y la página que no
  existe. El analizador da una etiqueta con una frase en claro y el texto con sus tramos
  marcados por familia (tinte, estilo de línea y sigla); al tocar un tramo, la regla y qué
  hacer. Trae dos textos de ejemplo: uno de Antonio y otro de un asistente.
- **El catálogo**: una página por regla, con URL propia, buscador y filtros, enlazada desde
  cada subrayado.
- **El cargador**: los paquetes incluidos en casillas, para combinarlos, y un JSON propio que
  se lee en el navegador; cada señal dice de qué paquete viene.
- **El informe en PDF**, que se genera y se descarga en el navegador con pdfmake, pedido solo
  al pulsar; también en el iPhone y en el iPad.
- **El diseño**: la web calca el modelo de Figma Make, con la paleta medida en contraste
  (WCAG 2.2) y en daltonismo simulado, y las fuentes servidas desde la propia web.
- **Los jueces**: 1.217 tests, 909 del motor y 308 de la web, que la abren en Chrome por CDP;
  con `URL_PRODUCCION`, miran además la web publicada desde fuera.
- **La publicación**: la rama `publicacion`, con solo `web/dist/` y su `.htaccess`, que lleva
  la CSP también por cabecera; el CDN de Hostinger, desactivado por completo porque
  reescribía los iconos.

[1.0.0]: https://github.com/ablanquez/radiografia/releases/tag/v1.0.0
