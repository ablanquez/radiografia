# Los textos de ejemplo

Dos textos sobre el mismo tema, por qué gustan los cómics, que la pantalla
carga con un botón (encargo 6.3; alcance de la v1, ítem 9; decisión del
29/09). Uno lo escribió Antonio y el otro lo generó un asistente de IA sin
instrucciones de estilo. Están en `web/public/ejemplos/` y llegan a la web tal
cual.

**El texto de Antonio no se retoca, diga lo que diga el motor**: aquí se
escribe lo que sale.

Las cifras son de `analizar()` con los dos paquetes incluidos (RadiografIA
0.1.0 y Español correcto 0.1.0) y el género «opinion», el que la pantalla
selecciona al cargar un ejemplo, a 02/10/2026, después de la ampliación 6.4
de las listas de D3 y D4 (abajo, [«Historia»](#historia), con las cifras de
antes). RadiografIA analiza estilo; no demuestra autoría.

## Resumen

`web/jueces/ejemplos.spec.ts` comprueba esta tabla contra `analizar()` en cada
`npm test`: si una cifra deja de coincidir, porque cambie una regla, la
calibración o un texto, el juez falla.

| | antonio.txt | ia.txt |
|---|---|---|
| Palabras de prosa | 314 | 336 |
| Tramo | 300-599 | 300-599 |
| RadiografIA: total | 3 | 1 |
| RadiografIA: banda | entre la mediana y el p95 | por debajo de la mediana |
| Español correcto: total | 0 | 0 |
| Español correcto: banda | sin escala | sin escala |

La banda de RadiografIA compara el total con los textos humanos de opinión de
300 a 599 palabras de su calibración (n = 1.663): mediana 2 · p95 15,14 · p99
23,6. Español correcto no trae escala, y la pantalla enseña su total sin banda.

## El texto humano: `antonio.txt`

**Procedencia.** Lo escribió Antonio y lo entregó el 02/10/2026 en el encargo
6.3. Antes de entregarlo corrigió él mismo tres erratas y retiró su edad. Entra
byte a byte como lo entregó: 1.777 bytes, siete párrafos separados por una
línea en blanco, UTF-8 sin BOM, saltos `\n`, sin salto al final y con las
comillas rectas del original ("Spiderman").

**Longitud.** 314 palabras de prosa: tramo 300-599, análisis completo.

**RadiografIA: total 3, entre la mediana y el p95.**

| Regla | Familia | Peso | n | Contribución | Por qué dispara |
|---|---|---|---|---|---|
| `est-pocas-comas` | Estadística | 3 | 1 (presencia) | 3 | 0,38 comas por punto de cierre, por debajo del p1 de los humanos de opinión (p1 0,49 · mediana 2,27) |

- **Ya no dispara `disc-sin-marcadores-epistemicos`:** desde la ampliación 6.4
  su lista lleva «me pareció» y «me ha parecido», y el texto dice las dos.
- **Atenuantes:** ninguno. Los dos del paquete, `disc-referencia-interna-concreta`
  (−2) y `disc-anecdota-en-primera-persona` (−1), no disparan.
- **Subrayados que puntúan:** ninguno. La única señal es del texto entero.
- **Informativas** (se enseñan, no suman): las seis estadísticas de contexto.
  Quedan por debajo de la banda humana el MTLD, 67,07 (p5 73,55), y los
  pronombres anafóricos, 47,77 por 1.000 palabras (p5 54,36). Dentro quedan
  MATTR-50 0,79, HD-D 0,82, IFSZ 66,22 y TTR 0,55.
- **No aplicadas y sin calibración:** ninguna.
- **Español correcto:** total 0, ninguna señal.

## El texto de IA: `ia.txt`

**Procedencia.**

- **Modelo:** Claude Opus 5.5, `claude-opus-5-5`, el que reporta la salida JSON
  de la CLI en `modelUsage`. Es el mismo modelo que hace el encargo.
- **Cómo:** Claude Code 2.1.286 (el binario de la extensión de VS Code) en modo
  `-p`. Se lanzó desde una carpeta temporal fuera del repositorio, con
  `--safe-mode` (sin CLAUDE.md, skills, plugins ni hooks), sin herramientas y
  con el prompt de sistema vacío:

  ```
  claude -p --safe-mode --tools "" --model claude-opus-5-5 --no-session-persistence --system-prompt "" --output-format json "Escribe un texto de unas 330 palabras, en español, sobre por qué te gustan los cómics, mencionando Spiderman, Flash, Green Lantern y Daredevil."
  ```

- **Instrucción**, literal y sin nada más: «Escribe un texto de unas 330
  palabras, en español, sobre por qué te gustan los cómics, mencionando
  Spiderman, Flash, Green Lantern y Daredevil.»
- **Fecha:** 02/10/2026, 11:51 (UTC+2).
- **Entrada y salida:** 822 tokens de entrada y 3.582 de salida, 2.821 de ellos
  de razonamiento; `stop_reason` «end_turn».
  - La entrada es la instrucción más lo que la CLI añade aun con el prompt de
    sistema vacío y sin herramientas. Lo que añade NO CONSTA.
  - La CLI hizo además una llamada a `claude-haiku-4-5-20251001`, con 21
    tokens de salida, que no es el texto. Para qué, NO CONSTA.
- **Salida:** el campo `result` del JSON, guardado tal cual: 1.957 bytes, UTF-8
  sin BOM, saltos `\n` y sin salto al final. Trae un título en negrita de
  Markdown (`**Por qué me gustan los cómics**`), y se queda: es parte del
  estilo por defecto.
- **Generaciones:** dos. La primera se descartó (abajo). Antes de esta hubo un
  intento con la CLI instalada en el sistema (2.1.251) que no cuenta: la API lo
  rechazó sin generar nada (error 400, «does not support this model», 0 tokens
  de salida). El texto queda congelado en el repositorio y no se regenera en
  ningún build.

**Longitud.** 336 palabras de prosa: tramo 300-599, análisis completo.

**RadiografIA: total 1, por debajo de la mediana.**

| Regla | Familia | Peso | n | Contribución | Por qué dispara |
|---|---|---|---|---|---|
| `disc-cierre-de-plantilla` | Discurso | 1 | 1 (presencia) | 1 | el último párrafo empieza por «En definitiva» |

- **Ya no dispara `disc-sin-automenciones`:** desde la ampliación 6.4 cuenta
  «me» y «nos», y el texto va en primera persona con «me» («me gustan», «me
  fascinan»).
- **Atenuantes:** ninguno.
- **Subrayados:** «En definitiva» (`disc-cierre-de-plantilla`). El título lo
  subraya `canal-negrita-markdown`, que es informativa.
- **Informativas** (se enseñan, no suman):
  - `canal-negrita-markdown`: 1 señal, el título, a 2,98 por 1.000 palabras.
  - Las seis estadísticas de contexto. Fuera de la banda humana quedan IFSZ
    70,61, por encima (p95 68,52), y los pronombres anafóricos, 53,57 por
    1.000 palabras, por debajo (p5 54,36). Dentro quedan MATTR-50 0,81, MTLD
    99,56, HD-D 0,84 y TTR 0,58.
- **No aplicadas y sin calibración:** ninguna.
- **Español correcto:** total 0, ninguna señal.

## Los dos, lado a lado

Con «opinion», el de Antonio suma 3 y queda entre la mediana y el p95. El de IA
suma 1 y queda por debajo de la mediana. Ninguno de los dos llega al p95 de los
humanos de su género y longitud.

La única señal del de Antonio es del texto entero: pocas comas. La del de IA
es la fórmula de cierre. Ningún texto se ha cambiado para que la comparación
salga de otra manera. Las reglas cambiaron una vez, por dos huecos de lista
que destaparon estos ejemplos, con fuente, firma de Antonio y revalidación
(abajo, [«Historia»](#historia)).

## Historia

- **02/10/2026, encargo 6.3, antes de la ampliación.**
  - El de Antonio sumaba **5**, entre la mediana y el p95:
    `est-pocas-comas` 3 y `disc-sin-marcadores-epistemicos` 2.
  - El de IA sumaba **2**, por debajo de la mediana:
    `disc-cierre-de-plantilla` 1 y `disc-sin-automenciones` 1.
  - La banda humana de opinión de 300 a 599 palabras era mediana 3 · p95
    15,62 · p99 23,6.
- **Por qué cambió: encargo 6.4, 02/10/2026, firmado por Antonio.** Los dos
  ejemplos destaparon dos huecos de lista.
  - D3 (`disc-sin-marcadores-epistemicos`) disparaba en el texto de Antonio,
    que dice «me pareció» y «me ha parecido», porque su lista solo llevaba
    «me parece». Ahora lleva las formas de primera persona de sus verbos y
    «parecer» con «me» o «nos» (lemas de Herbold et al. 2023).
  - D4 (`disc-sin-automenciones`) disparaba en el de IA, que dice «me
    gustan», porque excluía «me» y «nos» por ambiguos con el reflexivo.
    Pero son siempre de primera persona, y Tang y John (1999) los cuentan
    entre las automenciones.
- **Después.** Se recalculó el total de opinión y académico desde la caché y
  se revalidó. La FPR no cambió en ningún género, y la decisión de
  administrativo sigue igual. La banda de opinión de 300 a 599 palabras
  quedó en mediana 2 · p95 15,14 · p99 23,6.
- **Ninguno de los dos textos se ha tocado.**

## La primera generación, descartada

- **Cómo:** la lanzó, desde la sesión del encargo, un subagente de Claude Code
  (herramienta Agent, tipo «claude», modelo «opus»), con la instrucción literal
  como único mensaje, el 02/10/2026. La hora exacta NO CONSTA; su copia se
  guardó a las 11:46. Otro subagente con la misma configuración reportó «Opus
  5.5» y «claude-opus-5-5».
- **Por qué se descartó:** no fue «la instrucción literal y nada más».
  - El subagente cargó el CLAUDE.md del proyecto, que describe RadiografIA, y
    sabía para qué era el texto. Lo dicen sus notas: «No lo he amoldado para
    que el motor de RadiografIA lo deje pasar ni para que lo marque».
  - Usó herramientas: contó las palabras con `wc -w`, buscó los cuatro nombres
    con grep y guardó una copia.
  - Su salida llevaba un preámbulo («Aquí tienes el texto. Tiene 332
    palabras…») y unas notas.
  - Antonio decidió el 02/10 una segunda generación limpia, la de arriba.
- **Lo que dio** (visto antes de decidir): 332 palabras de prosa. RadiografIA
  sumó −0,01, por debajo de la mediana: `est-frases-cortas` +3 y
  `disc-anecdota-en-primera-persona` −3,01, por «mi abuela». Español correcto
  sumó 0. Con la ampliación 6.4 da lo mismo.
- **El texto:** el cuerpo que guardó el subagente, sin el preámbulo ni las
  notas.

```text
Empecé a leer cómics por culpa de un primo que los dejaba tirados en el sofá de mi abuela. Tendría ocho o nueve años y no entendía la mitad de lo que pasaba, pero me quedaba mirando las viñetas como quien mira por una ventana. Treinta años después sigo comprándolos, y creo que por fin sé por qué.

Primero, Spiderman. Peter Parker no tiene dinero, llega tarde a todo y su tía May se preocupa demasiado por él. Le pasa lo que le pasa a cualquiera, solo que además tiene que parar a un tipo con cuatro brazos mecánicos antes de la cena. El alquiler y el fin del mundo caben en la misma página, y eso me engancha. Stan Lee y Steve Ditko vieron en 1962 que un héroe agobiado por las facturas da más juego que uno perfecto.

Flash me gusta por otra cosa: la velocidad dibujada. Meter movimiento en un dibujo quieto es dificilísimo, y los dibujantes de Flash llevan décadas inventando trucos: estelas, figuras repetidas, fondos que se estiran. Barry Allen corre tanto que puede viajar en el tiempo y, aun así, siempre llega tarde a sus citas con Iris.

Green Lantern es el más raro de los cuatro. Su arma es un anillo que convierte la voluntad en objetos de luz verde, de modo que su poder termina donde termina su imaginación. Hal Jordan puede fabricar un martillo, una jaula o un avión, y lo divertido es ver qué se le ocurre en cada aprieto. Durante años el anillo no funcionó contra nada amarillo, y a nadie le parecía absurdo.

Luego está Daredevil, que es ciego y abogado. Matt Murdock trabaja en el juzgado de día y recibe palizas en Hell's Kitchen de noche. Frank Miller lo llevó a un sitio oscuro, católico y culpable que todavía me encoge el estómago cuando lo releo.

Me gustan los cómics porque caben en una mochila y te llevan a sitios imposibles en lo que dura un trayecto de autobús.
```
