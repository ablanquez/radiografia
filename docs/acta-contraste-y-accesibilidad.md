# Acta de contraste y accesibilidad

Encargo 10.4, Tanda 5 (punto 10 del plan). Medido el 05/10/2026 con Chrome
154.0.8037.93 sin ventana, por su protocolo de depuración (CDP), sobre la web
construida (`astro preview`), en estos commits:

- `526048c`: la paleta;
- `cfc8037`: el contraste y el daltonismo;
- `e2678fb`: el árbol de accesibilidad;
- `5a05544`: el tamaño de lo que se pulsa, con el arreglo de los enlaces
  del catálogo.

Lo que aquí se cuenta lo comprueban jueces que corren con `npm test`. Las
cifras son las de su salida.

| Juez | Qué mira |
|---|---|
| [`web/jueces/contraste.spec.ts`](../web/jueces/contraste.spec.ts) | los pares de colores, todo el texto que se ve y el daltonismo |
| [`web/jueces/pulsacion.spec.ts`](../web/jueces/pulsacion.spec.ts) | el tamaño de lo que se pulsa y los 320 px que faltaban |
| [`web/jueces/arbol-accesible.spec.ts`](../web/jueces/arbol-accesible.spec.ts) | el árbol de accesibilidad |
| [`web/jueces/color.ts`](../web/jueces/color.ts) | las cuentas: contraste, Machado y CIEDE2000 |

Las fórmulas, de sus fuentes, citadas en la cabecera de `color.ts`:

- **Contraste:** la luminancia relativa y el ratio de WCAG 2.2.
- **Simulación del daltonismo:** las matrices de Machado, Oliveira y
  Fernandes (2009), con severidad 1,0.
- **Paso a CIELAB:** el código de muestra de CSS Color 4, § 19.
- **Diferencia de color:** CIEDE2000, comprobada con los 34 pares de prueba
  de Sharma, Wu y Dalal (2005). La mayor diferencia es de 4,95 · 10⁻⁵ y el
  juez admite hasta 10⁻⁴.

Cada juez se vio en rojo:

- con un fallo real, cuando lo había:
  - el daltonismo, con el verde de antes (abajo);
  - el tamaño de pulsación, con los enlaces del catálogo (abajo);
- y con contrapruebas: se cambia el valor esperado, nunca el código de la
  web, y tiene que caer justo el test que se toca:
  - 7 en el de contraste;
  - 10 en el del árbol;
  - 6 en el de pulsación.

## 1. Contraste: los pares

Cada par se lee del elemento de verdad (`getComputedStyle`). Los fondos
semitransparentes se componen sobre blanco, como dice WCAG: «If no background
color is specified, then white is assumed».

Umbrales:

- **Texto:** 4,5 (1.4.3).
- **Objetos:** 3 (1.4.11). Aquí, la línea de cada familia, que es la que la
  identifica.
- **Foco:** 3 (2.4.13).

| Par | Dónde | Colores | Ratio | Umbral |
|---|---|---|---|---|
| ink sobre bg | la vista del texto | #1a1a1a / #ffffff | 17,40 | 4,5 |
| ink sobre card | la etiqueta de la pastilla | #1a1a1a / #f5f5f5 | 15,96 | 4,5 |
| blanco sobre accent | el botón principal | #ffffff / #332288 | 12,17 | 4,5 |
| ink-2 sobre bg | el eslogan | #4a4a4a / #ffffff | 8,86 | 4,5 |
| ink-2 sobre bg | el texto de ejemplo del cuadro (placeholder) | #4a4a4a / #ffffff | 8,86 | 4,5 |
| foco sobre bg | el anillo del primer elemento al tabular | #332288 / #ffffff | 12,17 | 3 |
| botón desactivado | «Descargar informe» sin resultado | #4a4a4a / #f5f5f5 | 8,13 | 4,5 (\*) |
| aviso de error | el de un paquete propio que no entra | #1a1a1a / #fdecea | 15,22 | 4,5 |

(\*) WCAG no lo exige a un componente inactivo (excepción «Incidental» de
1.4.3), pero el DISEÑO §4 sí; el juez le pide 4,5.

La línea de cada familia sobre el fondo de la página (bg) y sobre el de las
tarjetas (card), con umbral 3; y la tinta (ink) sobre los dos tintes de cada
familia, el del 14 % (el tramo) y el del 28 % (el tramo activo), con umbral
4,5:

| Familia | Color | Línea sobre bg | Línea sobre card | ink sobre el 14 % | ink sobre el 28 % |
|---|---|---|---|---|---|
| Léxico | #0072b2 | 5,19 | 4,76 | 14,26 | 11,63 |
| Discurso | #882255 | 8,73 | 8,00 | 13,63 | 10,47 |
| Sintaxis | #d55e00 | 3,87 | 3,55 | 14,58 | 12,20 |
| Estadística | #332288 | 12,17 | 11,17 | 13,37 | 10,01 |
| Puntuación y formato | #009988 | 3,55 | 3,26 | 14,78 | 12,41 |
| Canal | #117733 | 5,66 | 5,19 | 14,26 | 11,50 |
| Gramática | #aa4499 | 5,26 | 4,82 | 14,33 | 11,63 |
| Ortotipografía | #cc6677 | 3,66 | 3,36 | 14,89 | 12,56 |

Los 40 pares pasan su umbral. Los más justos son las líneas de Puntuación y
formato (3,26) y de Ortotipografía (3,36) sobre card. Por eso esos dos
colores se usan solo como línea y nunca como texto (DISEÑO §4).

## 2. Todo el texto que se ve

El juez recorre cada elemento con texto que se ve, sin excepción: 941
elementos en ocho estados. Ninguno baja de 4,5.

| Estado | Elementos con texto |
|---|---|
| el analizador sin resultado, a 1280 | 13 |
| con resultado, a 1280 | 86 |
| con la tarjeta de una regla abierta, a 1280 | 95 |
| con la hoja abierta, a 390 | 75 |
| el catálogo, a 1280 | 284 |
| el catálogo, a 390 | 258 |
| una ficha, a 1280 | 65 |
| una ficha, a 390 | 65 |

No se miran:

- las imágenes de fondo: la única que hay es la doble línea de
  Ortotipografía, que va debajo del texto;
- el texto que solo es para el lector de pantalla, de 1 × 1 px.

## 3. Daltonismo

**Método.**

- **Qué se compara:** los ocho colores de familia, con la visión normal y
  simulados para la protanopía, la deuteranopía y la tritanopía. La
  severidad es 1,0: dicromacia, el caso más fuerte.
- **Cómo se simula:** con Machado (2009), sobre RGB lineal.
- **Cómo se mide:** la distancia CIEDE2000 entre cada par.
- **Cuándo falla:** el juez falla si un par baja de 5.

**Por qué RGB lineal.** Ni la página ni el artículo de Machado dicen si sus
matrices van sobre RGB lineal o con gamma: NO CONSTA. Pero su modelo proyecta
las «spectral power distributions» de los primarios (§ 4.1), que es luz,
lineal. Chrome hace lo mismo en DevTools («Rendering → Emulate vision
deficiencies»): aplica las mismas matrices en un `feColorMatrix`, que por
defecto trabaja en `linearRGB`. Puedes ver lo mismo que el juez en tu propio
Chrome.

**El cambio de Puntuación y formato** (decisión de Antonio del 05/10, DISEÑO
§4, `526048c`):

- **Antes.** Era #009E73, de Okabe-Ito. En deuteranopía se veía #8a8676 y
  Ortotipografía #948d75: 4,02 de CIEDE2000, por debajo de 5. El juez lo dio
  en rojo.
- **Ahora.** Pasa a #009988, de la paleta *vibrant* de Paul Tol (figura 3
  de [sus notas](https://sronpersonalpages.nl/~pault/)), con sus dos tintes
  recalculados (#dbf1ee y #b8e2de).
- **Contraste.** El nuevo tiene más que el viejo: 3,55 sobre bg y 3,26 sobre
  card, frente a 3,42 y 3,14.

**La paleta de ahora, sobre RGB lineal.** Ningún par baja de 5. El más bajo
está en 6,01: Sintaxis y Canal en la protanopía. Con la visión normal,
ninguno baja de 10. Los que bajan de 10, y lo que los distingue, que nunca es
solo el color (1.4.1):

| Tipo | Par | CIEDE2000 | Lo que los distingue |
|---|---|---|---|
| protanopía | Sintaxis y Canal | 6,01 | discontinua de 2 px [S] frente a punteada de 1 px [C] |
| protanopía | Léxico y Gramática | 7,05 | continua de 2 px [L] frente a ondulada de 2 px [G] |
| protanopía | Puntuación y formato y Ortotipografía | 8,57 | punteada de 3 px [P] frente a doble discontinua de 1 px [O] |
| deuteranopía | Léxico y Gramática | 9,87 | continua de 2 px [L] frente a ondulada de 2 px [G] |
| tritanopía | Sintaxis y Ortotipografía | 6,73 | discontinua de 2 px [S] frente a doble discontinua de 1 px [O] |
| tritanopía | Léxico y Canal | 9,80 | continua de 2 px [L] frente a punteada de 1 px [C] |

**Lo que distingue a las familias, además del color:**

- **En pantalla:** el estilo de la línea, y la sigla voladita detrás de
  cada tramo.
- **En la tarjeta de una regla:** el nombre de la familia escrito.
- **En el papel y en el PDF:** la sigla entre corchetes.

**Con gamma.** Las mismas matrices aplicadas sobre los valores con gamma, sin
linealizar, dan otras distancias. El más bajo es 6,17 (Puntuación y formato y
Gramática, en deuteranopía), así que tampoco ahí baja ninguno de 6. Por debajo
de 10 quedan:

- **protanopía:**
  - Léxico y Gramática, 7,18;
  - Discurso y Estadística, 8,91;
  - Sintaxis y Canal, 7,46;
  - Puntuación y formato y Ortotipografía, 7,27;
- **deuteranopía:**
  - Léxico y Gramática, 7,87;
  - Puntuación y formato y Gramática, 6,17;
- **tritanopía:** Léxico y Canal, 9,97.

Con el verde de antes y con gamma, el par de Puntuación y formato y
Ortotipografía ni siquiera bajaba de 10, cuando sobre RGB lineal quedaba en
4,02. Por eso el método importa: el juez sigue a Chrome.

## 4. 320 px sin scroll horizontal (1.4.10)

| Juez | Qué mira a 320 |
|---|---|
| `resultado.spec.ts` (9) | el analizador, antes y después de analizar |
| `pestanas.spec.ts` (5) | el resultado en pestañas |
| `catalogo-pantalla.spec.ts` (6) | el catálogo |
| `ficha-pantalla.spec.ts` (6) | una ficha |
| `ficha-pantalla.spec.ts` (8) | las 50 fichas, una por una |
| `pulsacion.spec.ts` (3), nuevo | lo que ninguno miraba: el resultado en cada una de sus tres pestañas, con la hoja abierta, y el catálogo con la hoja de filtros |

Ninguno desborda.

## 5. Tamaño de lo que se pulsa

**Qué se mide.** El tamaño de cada objetivo, por CDP, en cada estado de las
tres páginas. Objetivo es todo lo que se puede pulsar y se ve:

- enlaces y botones;
- campos y desplegables;
- los resúmenes de lo plegado;
- lo que lleva role button, tab o checkbox;
- y lo que entra en el tabulador.

**Las casillas.** La caja de una casilla es la de su etiqueta, porque
pulsarla la marca. Lo mismo con el campo de fichero, que no se ve: su caja es
la de su etiqueta.

**Mínimos:**

- **En el móvil** (390, como móvil): 44 × 44. Es el criterio 2.5.5 de WCAG y
  la medida «toque» del DISEÑO.
- **En escritorio** (1280): 24 × 24, el criterio 2.5.8.

**Exentos**, contados aparte:

- los tramos del texto (el encargo);
- los enlaces del desglose. Cada uno lleva su cifra detrás en el mismo
  renglón («Conector repetido: 3 veces · 18,46 puntos»), así que les toca la
  excepción «Inline» de 2.5.8 y 2.5.5. Miden 20 px de alto: hay 22 con «Ver
  el detalle» abierto, 6 en la pestaña Reglas y 9 en la de Datos.

**En el móvil**:

| Estado | Medidos | El menor | Exentos |
|---|---|---|---|
| el analizador sin resultado, con «Paquetes» abierto | 10 | 44 | — |
| con resultado, pestaña Texto | 8 | 44 | 20 tramos |
| con resultado, pestaña Reglas | 13 | 44 | 6 enlaces en una frase |
| con resultado, pestaña Datos | 7 | 44 | 9 enlaces en una frase |
| con la hoja abierta | 5 | 44 | — |
| el catálogo | 53 | 44 (26 antes del arreglo, abajo) | — |
| el catálogo, con la hoja de filtros | 18 | 44 | — |
| una ficha | 7 | 44 | — |

**En escritorio**:

| Estado | Medidos | El menor | Exentos |
|---|---|---|---|
| el analizador sin resultado, con «Paquetes» abierto | 10 | 44 | — |
| con resultado, con «Ver el detalle» abierto | 14 | 44 | 20 tramos y 22 enlaces en una frase |
| con la tarjeta abierta | 18 | 44 | 20 tramos |
| el catálogo | 67 | 26 | — |
| una ficha | 7 | 44 | — |

**Lo que no llegaba: el nombre de cada regla en el catálogo, en el móvil.**

- **Qué pasaba.** Es un enlace dentro de su título y medía 26 px de alto
  cuando cabe en una línea. A 390 eran 30 de los 50. Los que ocupan dos
  líneas o más ya pasaban de 44. El juez nuevo lo dio en rojo.
- **En escritorio** pasan, porque 26 ya llega a 24.
- **Por qué no se vio antes.** Ningún juez lo miraba: el 3 de `base.spec.ts`
  mira solo los botones. No es caso de bitácora (nada dio verde con el fallo
  vivo): es una zona que no vigilaba nadie.
- **El arreglo** (`5a05544`). En el móvil, el enlace mide 44 de alto como
  mínimo, como los demás enlaces de la interfaz (las fuentes de la ficha):
  `inline-flex` con `min-height: var(--medida-toque)`. Un nombre de una
  línea queda centrado en esos 44 y su tarjeta crece 18 px. En escritorio no
  cambia nada. Antonio lo mira en el iPhone en la parada 5.

## 6. Árbol de accesibilidad

Es lo que Chrome entrega a los lectores de pantalla. El juez lo lee con
`Accessibility.getFullAXTree` y ata cada nodo a su elemento por su
`backendDOMNodeId`.

| Qué | Lo que da el árbol |
|---|---|
| los tramos (20 en el texto de prueba) | `button`, enfocable, con el nombre de sus reglas y sin desplegar |
| la tarjeta de una regla (1280) | `dialog` con el nombre de su título, no modal; el tramo que la abrió, desplegado |
| la hoja de una regla (390) | `dialog` con el nombre de su título, modal |
| la hoja de filtros del catálogo (390) | `dialog` «Filtros», modal |
| las pestañas (390) | ver abajo |
| las casillas de los paquetes | `checkbox` con el nombre de su etiqueta («RadiografIA 0.1.0», «Español correcto 0.1.0»), marcadas |
| las casillas de los filtros del catálogo (14) | `checkbox` con el nombre de su etiqueta (sin la muestra «Abc», que va oculta al lector), sin marcar |
| «Descargar informe» | ver abajo |

**Las pestañas.**

- Un `tablist` «Secciones del resultado».
- Tres `tab` (Texto, Reglas y Datos) y una sola elegida.
- La elegida controla su `tabpanel`, que lleva su nombre.
- Chrome no expone la relación hacia un panel oculto, así que el juez la
  mira con cada pestaña elegida.

**«Descargar informe».**

- **Sin resultado:** el botón del formulario, desactivado.
- **Con un texto insuficiente:** activo, y al pulsarlo dice que no hay
  informe.
- **Con un análisis:** el formulario se pliega y su botón queda fuera del
  árbol. El del final está activo.
- **Mientras se prepara:** el juez retiene con `Fetch` el trozo de pdfmake.
  Mientras tanto, el botón sale desactivado y con el nombre «Preparando el
  informe…».
- **Al terminar:** vuelve a ser el que era.

## 7. Huecos declarados

Lo que no se ha medido aquí, dicho para que nadie lo dé por hecho:

- **Un lector de pantalla de verdad.** El árbol de accesibilidad dice qué
  recibe el lector, no cómo lo lee. Falta probarlo:
  - con NVDA en Windows (Antonio, si quiere);
  - con VoiceOver en el iPhone y en el iPad.
- **Personas con daltonismo.** Lo de aquí es una simulación, con la
  severidad más fuerte. Las anomalías parciales quedan entre la visión
  normal y esa.
- **El PDF descargado.** No se ha medido su accesibilidad: si va etiquetado
  y en qué orden lo lee un lector.
- **El zoom.** No se ha medido el texto al 200 % (1.4.4) ni el espaciado de
  texto (1.4.12). Los 320 px sí, que equivalen al 400 % de 1280.
- **El modo de alto contraste de Windows** (`forced-colors`).
- **Los estados al pasar el ratón.** El juez mide el texto en reposo.
- **La tableta.** El tamaño de pulsación entre 769 y 1023 px no se ha medido
  (el encargo pide móvil y escritorio).

Lo que sí miden otros jueces:

- el orden del foco con el tabulador (`orden-del-foco.spec.ts`);
- el orden del documento (`orden-del-documento.spec.ts`);
- el foco atrapado en las hojas (`hoja.spec.ts` y
  `catalogo-pantalla.spec.ts`).
