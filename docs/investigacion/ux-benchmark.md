# Prospección de usabilidad — analizadores de texto comparables

> Punto 10 del `PLAN-RADIOGRAFIA.md`, paso previo al `DISEÑO-RADIOGRAFIA.md`.
> Hecha el 03/10/2026 desde Chrome con la extensión de Claude, a ancho de
> escritorio (1384 px) y al mínimo que Chrome permite en Windows (500 px;
> el móvil real es más estrecho). Sin capturas: las pantallas tienen
> derechos; aquí van notas. Lo que no se vio dice NO CONSTA.
>
> Checklist aplicada a cada una: dónde están el cuadro y el botón; dónde y
> cómo aparece el veredicto; cómo se marcan los tramos y qué pasa al tocar;
> cómo se organiza el detalle; cómo enseñan cifras y metas; texto corto;
> informe o exportación; móvil; qué copiamos, qué no y por qué.

## 1 · Hemingway Editor (hemingwayapp.com) — referente de forma

**Escritorio.** Editor central con el texto (sin cuadro aparte: se pega y se
analiza al vuelo). Los tramos se marcan con **fondo de color** por
categoría (amarillo: frase difícil; rojo: muy difícil; morado: palabra con
alternativa; azul: debilitador; verde: pasiva). Barra lateral derecha,
estrecha, con: **«Readability · Grade 8 · Good.»** (una cifra y una palabra
de veredicto), «Words: 185», y debajo **una tarjeta por categoría**, del
mismo color que su subrayado, con el recuento y la meta en una frase («1 of
13 sentences is very hard to read», «2 weakeners»); cada tarjeta lleva un
**ojo** para ocultar esa capa de subrayados. Al pulsar un tramo sale una
**tarjetita bajo la palabra**: título («Word with simpler synonym»), una
frase en cursiva («Use simpler alternatives or remove.») y un botón.

**Móvil (500 px).** La barra lateral desaparece. Arriba, dos botones:
«Fix Issues» y «Formatting». Abajo a la derecha, un botón **«Stats»** que
abre una **hoja inferior** con el Grade, las palabras y las mismas tarjetas
por categoría. La tarjetita del tramo también sale como **hoja inferior**.
El texto ocupa todo el ancho.

**Texto corto / informe.** El veredicto sale aunque el texto sea corto
(NO CONSTA un aviso). Exportación en la versión de pago; NO CONSTA informe.

**Copiamos**: veredicto de una línea arriba; una tarjeta por familia con su
color, su recuento y su meta; ojo para ocultar una capa; tarjetita al
tocar con título + una frase + acción; en móvil, hoja inferior para las
estadísticas y para la tarjeta. **No copiamos**: análisis al teclear (el
nuestro va al pulsar, por diseño y por coste), colores de fondo que tapan
el texto (nuestro subrayado respeta la lectura), «Good» como juicio sin
referencia (el nuestro compara con humanos).

## 2 · GPTZero (gptzero.me / app.gptzero.me) — detector, contraejemplo de honestidad

**Escritorio.** En la portada, el cuadro de texto con botones «Upload files»
y «Upload from Google Drive» y, debajo, **ejemplos precargados como chips**:
ChatGPT · Claude · Human · AI + Human · Polished by AI · Paraphrased by AI
(el mismo recurso que nuestros dos botones de ejemplo). Contador
«1154/10.000 characters». El botón «Scan» abre la app en otra pestaña:
**dos columnas**, texto a la izquierda, resultado a la derecha. Resultado:
un **sello redondo** con la palabra «human», y una sola frase: «We are
highly confident this text is entirely human», con icono de información;
debajo «Chance this entire text is… AI 0 % · Mixed 0 % · Human 100 %» como
tres chips; **«See sentence highlighting»** plegado (pide registro);
«Ways to improve this draft» (venta); Share y Export; pie «1153
characters · 187 words».

**Móvil.** NO CONSTA (la pestaña se abrió en una ventana que no se pudo
estrechar).

**Copiamos**: el sello + frase única arriba del todo; los ejemplos como
chips; el subrayado por frases **plegado por defecto** (ellos lo cobran;
nosotros lo damos, pero la idea de no abrumar es buena). **No copiamos**:
«highly confident … human/AI» (afirma autoría; el plan lo prohíbe) ni los
porcentajes de probabilidad; nada detrás de registro.

## 3 · LanguageTool (languagetool.org/es) — corrector, el mejor móvil visto

**Escritorio.** Dos columnas: texto a la izquierda con **subrayado de
color por categoría** (rojo ortografía, amarillo gramática, azul estilo),
y a la derecha una **lista de tarjetas** «palabra – categoría» («aquí –
Palabra incorrecta», «subrayaran – Falta una tilde»). Al pulsar una
tarjeta se despliega: pregunta («¿Quería decir «aquí»?»), botón azul con
la corrección e «Ignorar en este texto». El único resumen es un **globo
rojo con el número** (11). Pie con «Caracteres 480/2000 · Palabras 72».
Botón «Texto ejemplo» para cargar una muestra. Sin veredicto: es un
corrector, cuenta avisos (como nuestro Español correcto).

**Móvil (500 px).** Pantalla partida: el texto arriba, a todo el ancho,
con los subrayados; abajo una **hoja con UNA tarjeta a la vez** y flechas
← → para pasar a la siguiente, X para cerrar; tocar un subrayado lleva a
su tarjeta. Barra inferior fija «Corregir (11) · Parafrasear». «Dejar de
editar» arriba.

**Copiamos**: subrayado fino de color (no fondo); tarjeta que se despliega
en el sitio; en móvil, **una tarjeta a la vez con flechas**, que es la
solución al problema de muchos avisos en poco espacio; el botón de texto
de ejemplo; el contador de palabras visible. **No copiamos**: el globo con
número como único resumen (no dice nada por sí solo).

## 4 · QuillBot AI Detector (quillbot.com/ai-content-detector) — detector, móvil

**Móvil (500 px).** Cuadro con el placeholder «add at least 40 words…» (el
**mínimo se dice antes de analizar**: lo nuestro, 100, debería decirse
igual). Botones «Paste text» y «Upload doc»; contador «182 Words»; botón
«Detect AI». El resultado abre un editor y una **hoja inferior con
asa**: en grande «**50 %** of text is likely AI», y al lado tres categorías
con punto de color y porcentaje (AI-generated · Human-written & AI-refined
· Human-written); «Download report»; pulgares de opinión; versión del
modelo; y al pie un aviso: «Never rely on AI detection alone to make
decisions that could impact someone's career or academic standing».

**Escritorio.** NO CONSTA.

**Copiamos**: el mínimo de palabras dicho en el placeholder; la hoja
inferior con asa; el **aviso de responsabilidad al pie** (nuestra nota de
autoría cumple ese papel y puede ir igual de visible); la versión del
modelo junto al resultado (nosotros, la versión del paquete). **No
copiamos**: el porcentaje de «likely AI».

## 5 · Lorca Editor (lorcaeditor.com) — el único en español

Exige correo para entrar; solo se vio su **imagen promocional** del
editor: texto central con **subrayados de color** (naranja frases largas,
lila adverbios, verde ortografía), una columna central de tarjetas de
sugerencia y una columna derecha con «Legibilidad: Puntuación 75» más
longitud de frase y de palabra, y «Estadísticas: lectura, palabras,
frases». Es Hemingway en español. Nada más CONSTA.

## 6 · No vistas

Copyleaks, Grammarly y Readable piden cuenta antes de enseñar nada; no se
abrió cuenta (sin datos de Antonio en terceros). Quedan fuera.

## 7 · Tabla comparativa

| | veredicto | tramos | al tocar | detalle | cifras/metas | móvil |
|---|---|---|---|---|---|---|
| Hemingway | «Grade 8. Good.» arriba a la derecha | fondo de color por categoría | tarjetita bajo la palabra | tarjetas por categoría con ojo | recuento + meta por tarjeta | hoja inferior «Stats»; tarjeta como hoja |
| GPTZero | sello + frase única | plegado, de pago | NO CONSTA | chips de % | % de probabilidad | NO CONSTA |
| LanguageTool | número de avisos | subrayado fino por categoría | tarjeta se despliega | lista de tarjetas | contador | una tarjeta a la vez con flechas |
| QuillBot | «50 % likely AI» en grande | NO CONSTA | NO CONSTA | hoja inferior | % por categoría | hoja con asa |
| Lorca | «Puntuación 75» | subrayado de color | NO CONSTA | columna de tarjetas | legibilidad y estadísticas | NO CONSTA |

## 8 · Conclusiones para el DISEÑO

1. **El veredicto va arriba, solo, en una línea, y se ve desde el primer
   píxel** (todas lo hacen). El nuestro ya es etiqueta + frase (9.2); le
   falta el tamaño y el sitio. Un **sello o pastilla** con la etiqueta, como
   el de GPTZero, hace de ancla visual sin pretender ser un porcentaje.
2. **Resumen por categorías, con color, recuento y meta**, como las tarjetas
   de Hemingway: nuestro «Lo que más pesa» puede ser tres tarjetas, una por
   regla, con el color de su familia; y la leyenda de familias puede ser
   esa misma fila de tarjetas con el **ojo para ocultar una capa** de
   subrayados (resuelve el apunte 7 sin pestañas en escritorio).
3. **Subrayado fino, no fondo**, para que el texto siga leyéndose
   (LanguageTool); el color de fondo de Hemingway tapa, y nuestras familias
   son ocho.
4. **Al tocar: tarjeta en el sitio** (escritorio) con nombre, frase en
   claro, «Qué hacer» y «¿Por qué?» plegado; en **móvil, hoja inferior con
   una tarjeta a la vez y flechas** (LanguageTool) o con asa (QuillBot).
   Confirma el apunte 2 (panel junto al tramo) y el 9 (móvil).
5. **Pestañas en móvil, columnas en escritorio**: en escritorio las tres
   mejores usan dos columnas (texto | detalle); en móvil todas apilan y
   sacan el detalle en hojas. Las pestañas Texto / Reglas / Datos del
   apunte 7 encajan en móvil; en escritorio, columna derecha con las
   tarjetas y el desglose plegado.
6. **Decir el mínimo antes** («add at least 40 words»): nuestro placeholder
   debe decir «a partir de 100 palabras; completo desde 300».
7. **Ejemplos como chips** (GPTZero) y botón «Texto ejemplo» (LanguageTool):
   lo nuestro ya existe; en el diseño, como chips junto al cuadro.
8. **El aviso de responsabilidad al pie, visible** (QuillBot): nuestra nota
   «analiza estilo; no demuestra autoría» va en el mismo sitio y con el
   mismo peso.
9. **Lo que nadie hace y nosotros sí**: comparar con textos humanos del
   mismo género y decir «de cada 100 … solo 5». Es el diferencial honesto
   y debe estar en la frase del veredicto, no escondido en el detalle.
10. **Lo que no copiamos**: porcentajes de «IA», «confident», análisis al
    teclear, nada detrás de registro, colores de fondo que tapan el texto.
