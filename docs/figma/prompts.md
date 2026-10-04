# RadiografIA — secuencia de prompts para Figma Make

Pasos en Figma (del DISEÑO y de la ayuda de Figma, 03/10/2026):

1. Figma → Borradores → **Make** (fichero nuevo). Nombre: «RadiografIA».
2. Antes del primer prompt: en el explorador de ficheros de Make, crea
   `guidelines.md` y pega el contenido de `docs/figma/guidelines.md`.
3. Modelo: **Claude Opus 5.5** para los prompts 1 a 6. **Gemini 3.8 Flash**
   para retoques («sube 8 px», «cambia el borde»). No mezclar dentro de
   una misma pantalla.
4. Activa **Plan mode** y envía el prompt 0. Lee el `plan.md` que devuelve;
   si se desvía del DISEÑO, corrígelo en el chat antes de aceptar.
5. Un prompt por pantalla (1 → 6), en este orden. Tras cada uno: mira el
   preview; si algo está mal, usa primero la herramienta de edición o una
   anotación sobre el elemento, y solo después un prompt corto.
6. Si tras muchos prompts se desvía: «Clear chat context» y repite el
   último prompt.
7. Al terminar cada pantalla: **Copy as design layers** a un fichero de
   Figma Design «RadiografIA — modelo», frames `escritorio/…` y
   `movil/…`. Ahí es donde Claude lee por MCP.
8. Prompt 7: `tokens.json`.

Las cadenas en «comillas» van tal cual; son el texto real de la web. Cada
pantalla se pide en tres tamaños: escritorio 1280 px, tableta 820 px
(una columna con los componentes de escritorio) y móvil 390 px; cuando un
prompt dice «Móvil:», la tableta es la versión de escritorio apilada en
una columna salvo que se diga otra cosa.

---

## Prompt 0 (Plan mode)

(El que se envió el 04/10, con los tres tamaños; está en la conversación
de estrategia. Resumen: planificar las seis pantallas en 1280/820/390,
escritorio → tableta → móvil, sin código, con las reglas de guidelines.md
que se entregan después, componentes reutilizables y nombres de capas en
español.)

## Prompt 1 — Analizador, antes de analizar (escritorio y móvil)

Tarea: la pantalla inicial del analizador. Contexto: una persona va a pegar
un texto para ver si suena a asistente (IA). Restricciones: guidelines.md.

Escritorio, dos columnas:
- Cabecera: a la izquierda el nombre «RadiografIA» y debajo, en menor,
  «A contraluz se nota todo.»; a la derecha un enlace «Catálogo de reglas».
- Columna izquierda (34em): un cuadro de texto grande (12 líneas) con
  etiqueta visible «Tu texto» y placeholder «Pega aquí tu texto: a partir
  de 100 palabras; el análisis es completo desde 300». Debajo, dos chips:
  «Texto humano» y «Texto de IA» con una línea en gris: «Ejemplos: el
  primero lo escribió Antonio; el segundo lo generó un asistente sin
  instrucciones de estilo».
- Debajo del cuadro: selector «Tipo de texto» con opciones «General,
  Académico, Administrativo, Narrativa clásica, Noticia, Opinión (críticas
  de cine)»; y un bloque plegado «Paquetes» (un details) con dos casillas
  marcadas «RadiografIA 0.1.0» y «Español correcto 0.1.0», un botón
  secundario «Cargar un paquete propio (JSON)» y la línea «Se queda en tu
  navegador: no se sube a ningún sitio. No se guarda: al recargar la
  página, desaparece.».
- Botón principal (accent, blanco): «Pon tu texto a contraluz». A su lado,
  botón secundario desactivado «Descargar informe».
- Columna derecha vacía con un texto en gris: «Aquí verás el resultado.»
- Pie: «RadiografIA analiza estilo; no demuestra autoría.»

Móvil: todo en una columna, en este orden: cabecera breve, cuadro de texto
a todo el ancho, chips, selector, botón principal a todo el ancho (48 px
de alto), «Paquetes» plegado, pie.

Estados: cuadro vacío; tras pulsar con menos de 100 palabras (bajo el
cuadro una línea «Texto insuficiente: 99 palabras que cuentan; se puntúa
desde 100»); error de carga de paquete: un aviso con icono y la palabra
«Error», texto en tinta oscura sobre un fondo rojo muy claro (el texto
≥ 4,5:1; el color no es la única señal), con «No se carga «mi-paquete.json»:
no cumple el esquema de los paquetes. Esto es lo que falla:» y debajo una
lista con una línea «regla "prueba-a-nivel-de" (reglas[0]) · campo "peso":
tiene que ser número».

## Prompt 2 — Analizador con resultado (escritorio)

Tarea: la misma pantalla tras pulsar el botón, con estos datos de
ejemplo. Restricciones: guidelines.md; el texto se subraya, no se colorea
de fondo; cada tramo subrayado es un botón accesible.

Columna izquierda: arriba el cuadro plegado a tres líneas con un enlace
«Editar el texto»; debajo la vista del texto en Literata con estos
subrayados (familia → estilo del token):
- «## Cinco Claves Para Mejorar Tu Productividad En El Trabajo» → Canal
  (dotted 1 px) y también Ortotipografía (double dashed): dos líneas
  apiladas.
- «En este artículo exploraremos» → Léxico.
- «mejorando la concentración de todo el equipo.» y «permitiendo
  centrarse en las tareas importantes.» → Sintaxis.
- «fue desarrollado» y «levantó su mano» → Gramática.
- «1,500», «$100» y el punto dentro de las comillas en «resultados.»» →
  Ortotipografía.
- «Los expertos coinciden» y «Diversos estudios demuestran» → Discurso.
- «Lunes» (dos veces) y «Marzo» → Ortotipografía.
- «Además» (tres veces) → Discurso.
- «papel fundamental» → Discurso.
- «En conclusión» → Discurso.
El texto completo te lo doy al final de este prompt.

Columna derecha (sticky), de arriba abajo:
1. Pastilla del resultado: un bloque con fondo card, y dentro, en tamaño
   de título de pantalla, «Texto con bastantes rasgos de Asistente IA»;
   debajo, en cuerpo: «Tu texto suena bastante a asistente (IA): de cada
   100 textos escritos por personas, solo 5 suenan tanto.»
2. «Lo que más pesa»: tres tarjetas, cada una con una barra lateral del
   color de su familia, la sigla en un círculo, el nombre y la cola:
   «Conector repetido» · D · «3 veces»; «Coletilla de gerundio final» · S
   · «2 veces»; «Atribución vaga» · D · «2 veces». Bajo la primera, en
   cursiva: «Empieza por: Cambia alguno de los conectores repetidos o
   quítalo: muchas veces la frase se entiende sin él.»
3. «Familias»: una fila/rejilla de tarjetas pequeñas, cada una con una
   muestra de su estilo de subrayado, el nombre, el recuento y un icono de
   ojo (botón, «Ocultar esta capa»): «Léxico (1)», «Discurso (7)»,
   «Sintaxis (2)», «Estadística (0)», «Puntuación y formato (0)»,
   «Gramática (2)», «Ortotipografía (7)». Aparte, atenuada, «Canal: solo
   avisos (1)».
4. Un details plegado «Ver el detalle» con: «Tu total: 44,08 puntos por
   cada 1.000 palabras. Comparado con 500 textos de 300 a 599 palabras
   escritos por personas: mediana 1,86 · p95 32,17 · p99 57,24. 325
   palabras que cuentan · textos de 300 a 599 palabras · tipo: General.»
   y debajo un desglose en lista: «Discurso 28,69: Atribución vaga 2 veces
   · 6,15 puntos; Cierre de plantilla 1 vez · 1 punto; Conector repetido 3
   veces · 18,46 puntos; Importancia inflada 1 vez · 3,08 puntos» (y
   después «Léxico 3,08», «Sintaxis 12,31», «Estadística 0», «Puntuación y
   formato 0»), «Solo avisos: no suman» (con las seis líneas de
   diversidad, legibilidad y pronombres, todas «dentro de lo habitual en
   los textos»), «No miradas en este texto: Sin marcadores de opinión ni
   duda y Sin primera persona: solo se miran en las críticas de cine y los
   textos académicos».
5. Bloque «Español correcto»: «9 avisos de norma: Mes o día con mayúscula
   (3) y Pasiva perifrástica con agente (1).» y un details «Ver el
   detalle».
6. Botones: «Descargar informe» (activo) y «Analizar otro texto».
7. Pie: «RadiografIA analiza estilo; no demuestra autoría.»

Estados de la pastilla (muéstralos como variantes del componente, no en
pantalla): «Texto sin indicios de Asistente IA», «Texto con muy pocos
rasgos que indiquen que tiene Asistente IA», «Dentro de lo normal»,
«Texto con muchos rasgos de Asistente IA», «No podemos comparar»; y la
variante con el aviso «Ojo: tu texto es corto (menos de 300 palabras).
Tómate el resultado como orientativo.» debajo de la frase.

Texto completo para la vista:
## Cinco Claves Para Mejorar Tu Productividad En El Trabajo
La productividad se ha convertido en uno de los temas más relevantes del mundo laboral. En este artículo exploraremos cinco claves que pueden transformar la forma de trabajar de cualquier empresa, mejorando la concentración de todo el equipo.
El método fue desarrollado por un equipo de psicólogos de la Universidad de Stanford en 2019. Desde entonces, más de 1,500 empresas lo han adoptado, y su licencia básica cuesta $100 al año. Los expertos coinciden en que su impacto es notable.
La primera clave es planificar la semana. Cada Lunes, antes de abrir el correo, conviene dedicar diez minutos a fijar las prioridades. La próxima sesión de formación será el Lunes 3 de Marzo, y la inscripción ya está abierta.
La segunda clave es la comunicación. En la última reunión, la directora levantó su mano y pidió silencio antes de explicar el nuevo sistema. Su mensaje fue claro: «menos reuniones y más resultados.» Además, cada equipo recibió una guía práctica.
La tercera clave es desconectar. Diversos estudios demuestran que las pausas breves mejoran el rendimiento. Además, reducir las notificaciones del móvil desempeña un papel fundamental en la concentración, permitiendo centrarse en las tareas importantes.
La cuarta clave es delegar. Muchos directivos siguen revisando cada documento antes de enviarlo, aunque sus equipos están preparados para hacerlo solos. Delegar no significa desentenderse: significa confiar, dar instrucciones claras y revisar los resultados al final de la semana, no a cada paso. Además, las empresas que lo han probado dicen que las decisiones llegan antes y que los empleados se sienten más valorados.
La quinta clave es medir. Sin datos, cualquier cambio es una intuición; con ellos, es posible saber qué funciona y qué no. Una hoja de cálculo sencilla basta para anotar las horas dedicadas a cada proyecto y compararlas con los objetivos.
En conclusión, mejorar la productividad no depende de trabajar más horas, sino de trabajar mejor. Con planificación, comunicación y pausas, cualquier equipo puede alcanzar sus objetivos.

## Prompt 3 — Tarjeta de regla (escritorio) y hoja inferior (móvil)

Tarea: lo que pasa al pulsar un tramo subrayado. Restricciones:
guidelines.md (diálogo no modal en escritorio; hoja inferior modal en
móvil; foco; Escape; botones ≥ 44 px).

Escritorio: al pulsar «Además», una tarjeta anclada justo debajo del
tramo, 360 px de ancho, con: una barra superior del color de Discurso y
la sigla «D» en círculo; título «Conector repetido»; línea gris «Discurso
· RadiografIA»; frase: «El mismo conector al principio de tres frases o
más, como «Además» una y otra vez.»; «Qué hacer: Cambia alguno de los
conectores repetidos o quítalo: muchas veces la frase se entiende sin
él.»; un details plegado «¿Por qué lo miramos?» que al abrirse muestra un
párrafo de explicación (usa dos frases de relleno marcadas como tal), «Nivel
de evidencia: medido en inglés», «Origen de la lista: …», y un enlace «Ver
la ficha completa»; abajo, botones «Anterior» y «Siguiente» y una X de
cierre arriba a la derecha. El tramo activo queda con el subrayado más
grueso.

Móvil: la misma información en una hoja inferior que ocupa como mucho el
60 % de la pantalla, con un asa (botón etiquetado «Cambiar tamaño»), la X
de cierre, y «Anterior / Siguiente» a todo el ancho abajo. El tramo
activo sigue visible por encima de la hoja.

## Prompt 4 — Analizador con resultado (móvil)

Tarea: la pantalla del prompt 2 a 390 px. Orden: cabecera breve →
pastilla con etiqueta y frase → «Lo que más pesa» (tarjetas apiladas) →
barra de pestañas fija abajo con «Texto», «Reglas», «Datos» (la activa
con el color accent). Pestaña Texto: la vista del texto con subrayados.
Pestaña Reglas: las tarjetas de familias con ojo y el desglose. Pestaña
Datos: «Ver el detalle» abierto, «No miradas», «Español correcto». Los
botones «Descargar informe» y «Analizar otro texto» al final de Texto. El
pie de autoría al final de Texto y de Datos. Sin scroll horizontal.

## Prompt 5 — Catálogo de reglas (escritorio y móvil)

Tarea: la página «Catálogo de reglas». Escritorio: título y una línea
«Todas las reglas de los dos paquetes incluidos. Cada una tiene su propia
página, con su explicación, sus fuentes y sus ejemplos.»; buscador a todo
el ancho con etiqueta «Buscar por nombre, id o explicación»; debajo los
filtros en TRES COLUMNAS con título cada una: «Familia» (casillas: Canal,
Discurso, Estadística, Léxico, Puntuación y formato, Sintaxis, Gramática,
Ortotipografía), «Detector» (estadístico, estructural, patrón), «Severidad»
(baja, media, alta); un botón «Quitar filtros» y el recuento «50 reglas».
Lista en tarjetas: cada una con la muestra de subrayado de su familia, el
nombre como enlace, la frase en claro, y una línea gris «id · paquete ·
detector · evidencia». Muestra seis tarjetas de ejemplo: «Conector
repetido / El mismo conector al principio de tres frases o más, como
«Además» una y otra vez. / disc-marcador-repetido · RadiografIA ·
estructural · medido en inglés», «Frases cortas / Muchas frases para tan
pocas palabras, comparado con textos de personas del mismo tipo y
longitud. / est-frases-cortas · RadiografIA · estadístico · medido en
español», «Coletilla de gerundio final / Frases que acaban en una coletilla
con gerundio tras una coma, como «…, logrando un récord». /
sint-gerundio-adjunto-final · RadiografIA · patrón · medido en inglés»,
«Calcos léxicos del inglés / Palabras que suenan a traducción del inglés,
como «profundizar», «intrincado» o «meticuloso». / lex-traslados-del-ingles
· RadiografIA · patrón · anecdótico», «Mes o día con mayúscula / Meses y días
de la semana con mayúscula dentro de la frase, como «el Lunes 3 de Marzo».
/ orto-mes-o-dia-con-mayuscula · Español correcto · patrón · norma»,
«Negrita de Markdown / Asteriscos dobles como **así**, pegados tal cual: el
formato del chat sin convertir. Solo avisa. / canal-negrita-markdown ·
RadiografIA · patrón · medido en inglés».
Móvil: buscador; un botón «Filtros» que abre una hoja inferior con las
tres listas apiladas; tarjetas a todo el ancho.

## Prompt 6 — Ficha de regla e informe

Tarea A: la página de una regla, columna única de 34em. Cabecera con la
pastilla de familia (color + sigla «D») y el nombre «Conector repetido»;
frase en claro; «Qué hacer»; «Explicación» (párrafo de relleno marcado);
«Excepciones»; «Nivel de evidencia: medido en inglés»; «Origen de la
lista»; «Fuentes» como lista de enlaces; «Ejemplos»: dos bloques, uno
«Positivo» con el tramo subrayado con el estilo de Discurso y otro
«Negativo»; abajo, «Probar en el analizador» (botón principal) y «Volver
al catálogo» (enlace). Móvil: igual, apilado.

Tarea B: la vista de impresión del resultado del prompt 2, como página A4
en pantalla (para que la veamos): secciones numeradas «1 Informe de
RadiografIA» (fecha y hora «Análisis del 3 de octubre de 2026 a las
20:44», tipo, palabras, paquetes y las cifras del detalle), «2 Resultado»
(etiqueta, frase, lo que más pesa, empieza por), «3 Clave de familias»
(sigla + estilo de línea + nombre, en tinta), «4 Texto» (con subrayados y
la sigla entre corchetes tras cada tramo: «Además [D]»), «5 Desglose», «6
Las señales, regla a regla» (por regla: nombre, frase en claro, fragmentos
entre comillas, sugerencia, URL de la ficha), «7 Nota» con «RadiografIA
analiza estilo; no demuestra autoría.». Literata 11 pt, sin botones ni
navegación, sin color imprescindible.

## Prompt 7 — Tokens

Genera `tokens.json` en el formato Design Tokens Community Group 2025.10
con todos los tokens de guidelines.md: neutros, los ocho colores de
familia (color como objeto con colorSpace "srgb" y components), estilos
de subrayado (grosor como dimension con value y unit), tipografías
(fontFamily y tamaños como dimension), espaciado y radios. Añade
$description con el ratio de contraste de cada color sobre blanco.

## Prompt 8 — Logo (opcional, después de todo lo demás)

Dibuja tres variantes SVG planas del icono «documento en negativo»: (a)
hoja clara con esquina doblada sobre un cuadrado oscuro #1A1A1A, con tres
líneas de texto oscuras y la central subrayada en #332288; (b) hoja oscura
con tres líneas claras y la central subrayada en #CC6677; (c) la silueta
de la hoja recortada en un círculo #332288. Legibles a 16 px. Muéstralas a
16, 32 y 180 px.
