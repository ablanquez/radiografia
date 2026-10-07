# Censo pre-despliegue — RadiografIA

> **Qué es:** el censo del punto 11, primera casilla. Contiene el bloque A
> (código) del método de auditoría de la casa y lo que el despliegue estático
> necesita del bloque E (clon limpio, build reproducible, qué viaja al servidor).
>
> **Fecha:** 06/10/2026. **Commit auditado:** `4b8f9f2`, el de la v1 subida
> (puntos 1-10 cerrados).
>
> **Solo lectura.** No se ha tocado ni una línea de código; la única escritura
> es este fichero. Es un **registro histórico**: se lee con su fecha delante,
> y si el código cambia después se escribe otro.
>
> **Parada 2 (06/10/2026).** Antonio firmó los veinte hallazgos. Qué se hizo
> con cada uno (arreglado en qué commit, declarado o a la nevera), el
> hallazgo 21, que salió al arreglar y se arregló con la misma firma que el
> 18, y `dist/` antes y después: § 14. El resto se queda como se escribió
> sobre `4b8f9f2`.
>
> **Publicación (11.2, 06/10/2026).** La variante elegida para el servidor,
> frente a las del § 9, y lo medido desde fuera en producción el 06/10 y el
> 07/10/2026: § 15.
>
> **De dónde sale el checklist.** El encargo remite a la sección «BLOQUE A ·
> CÓDIGO — el checklist» de `GUIA-BUENAS-PRACTICAS.md`. Ese fichero no está
> en disco: **NO CONSTA**.
> - La guía que hay en `F:\01_PROYECTOS\GUIABUENASPRACTICAS.md` es la
>   versión 2.0 (12/07/2026) y no tiene bloques.
> - El texto de los bloques A y E sale del marco de auditoría de Desplázame
>   (`004_DESPLAZAME/docs/auditoriafinal/00-MARCO-AUDITORIA-DE-CIERRE.md`,
>   § 4, «LOS SEIS CHECKLISTS (de la guía, completos)»), que se declara
>   traslado de esa guía.
> - La forma sigue el censo de Desplázame (`004_DESPLAZAME/docs/CENSO-PRE-DESPLIEGUE.md`)
>   y el § 5 de ese marco (cómo se entrega un bloque).
>
> **Veredictos:** **cumple**, **hallazgo** (numerado, con su fila en la tabla
> del § 12) o **NO CONSTA** (con el porqué).

---

## 0 · Cobertura declarada

| | |
|---|---|
| Ficheros versionados en el repositorio | 365 |
| Código ejecutable versionado (`.ts`, `.mjs`, `.astro`, `.cts`, `.cjs` y `.d.ts` de `motor/` y `web/`) | 211 |
| De ellos, clasificados por el grafo de módulos (§ 1) | 207 |
| Fuera del grafo, mirados a mano | 4: `motor/src/terceros/silabea.cjs` (producción: lo importa el silabeo), `motor/src/validador-standalone.d.ts` (los tipos del `exports` del motor), `web/src/env.d.ts` (convención de Astro) y `web/src/pdfmake.d.ts` (la declaración del módulo de pdfmake) |
| Exports de `motor/src`, `web/src` y `web/scripts` (fuera de los `.spec.ts`) clasificados en sus clases | **471**, todos |
| Hojas de estilo de `web/src/estilos` barridas, clase a clase e id a id | 12, todas las versionadas (`tokens.css` se genera y no se versiona) |
| Tokens de `docs/figma/tokens.json` cruzados con su uso | 112, todos |
| Propiedades de los dos esquemas JSON cruzadas con el código | 58, todas |
| Ficheros de `dist/` inventariados (build de `4b8f9f2` en clon limpio) | 85, todos |

**Lo que NO se ha mirado, y por qué:**

- **Los tests por dentro** (`*.spec.ts` y `web/jueces/`). Son del bloque C. Aquí solo cuentan como consumidores de los exports.
  - knip ve 8 exports de `web/jueces` sin uso (`rutaDeChrome`, `AL_PINTAR_UN_RESULTADO`, `luminancia`, `MATRICES_DE_MACHADO`, `nombresDe`, `px`, `pesoPintado`, `TramoDelPdf`). Se anotan aquí y no se juzgan.
- **Los textos y el HTML de cara al usuario como tales.** Son del bloque B. Solo se miran como copia a mano (§ 3).
- **La documentación.** Es del bloque D. Lo que este censo ha visto de paso (comentarios rancios, cifras viejas) va marcado «para el bloque D».
- **El interior de las herramientas de calibración** (`motor/herramientas/`, 50 ficheros). Se ha mirado:
  - su cabecera;
  - su forma de arrancar;
  - sus fechas (§ 6);
  - sus binarios externos.

  Su lógica no. No viaja a ningún sitio.
- **La lógica de `motor/src`**, más allá de lo que piden las casillas. Sigue vedado, y sus hallazgos se reportan sin proponer tocarlo salvo autorización.
- **«Incertidumbre en el tipo, no con opcionales que siempre están»** (§ 4): no se ha barrido campo a campo. **NO CONSTA**.
- **El build en otro sistema** (Linux, otra versión de Node): no se ha probado. Lo reproducible (§ 9.1) vale en esta máquina, con Node 24.19.0.

**Los límites del método, dichos:**

- **El clasificador** usa `findReferences` del servicio de lenguaje de TypeScript, no búsqueda de palabras. Así que no cuenta de más por un comentario.
- **Los `.astro`** no los lee tsc: se cuentan por sus `import`.
- **Los barridos de CSS y de tokens** buscan texto. Pueden contar un uso de más (un nombre citado en un comentario de `.ts`), nunca de menos. Lo que sale «sin uso» lo está.
- **Cada barrido que dio cero** tiene su contraprueba: se sembró un caso y se vio que lo cazaba (§ 1).

---

## 1 · Los instrumentos

| Instrumento | Qué hace | Contraprueba |
|---|---|---|
| **knip 6.39.0** por `npx` (la invocación de su guía), sin instalarlo: ningún `package.json` cambia | Exports, ficheros y dependencias sin uso, y paquetes usados sin declarar, con los workspaces de serie | Cruzado a mano, caso por caso (abajo) |
| **Clasificador propio** (scratchpad, no va al repo) | El grafo de módulos (`ts.preProcessFile` y `ts.resolveModuleName`; los `.astro`, por sus `import`) y, para cada export, sus referencias de verdad con `LanguageService.findReferences` en el programa del motor y en el de la web | Coincide con knip en los 13 exports de valor huérfanos menos uno (`generarCodigoAjv`, que knip no cuenta porque su fichero es un punto de entrada de `npm run generar`) |
| **tsc 5.9.3** con `--allowUnreachableCode false --noUnusedLocals --noUnusedParameters --noFallthroughCasesInSwitch`, en los dos workspaces (`motor` y `web`, que incluye `jueces/`, `scripts/` y `astro.config.mjs`) | Código inalcanzable y locales, parámetros e imports sin usar | Un fichero sembrado con un local sin usar y una línea tras `return` dio TS6133 y TS7027; borrado después |
| **Barridos propios** de tokens, esquemas, clases CSS, literales de los `.astro`, `??`, `catch`, `as`, `!`, fechas y DOM | Lo que dice cada sección, con la expresión usada | El de CSS, con una clase y un id sembrados en memoria: los dio los dos |
| **Dos builds en clon limpio** del mismo commit, en rutas distintas | La reproducibilidad de `dist/` (§ 9.1) | Un byte añadido a una copia de `dist/`: la comparación lo dio |

**Lo que knip da por muerto y no lo está**, abierto fichero a fichero:

- **Las 31 herramientas de `motor/herramientas/`, sus 19 specs y 3 scripts de `web/scripts/`** (`avisos-de-pdfmake.ts`, `iconos.ts` y `medir-modelo.ts`): se ejecutan a mano y lo dice su cabecera, con su comando. Las specs las corre el `npm test` del motor por su glob (`"herramientas/**/*.spec.ts"`), que knip no lee.
- **`web/jueces/chrome-cae.prueba.ts`**: lo lanza `chrome.spec.ts` en un proceso aparte (`spawn(process.execPath, ['--test', …, 'jueces/chrome-cae.prueba.ts'])`).

---

## 2 · Bloque A(a) — el código muerto, en cinco formas

### 2.1 · Las cuatro clases de cada export

Clase de un export, por quién lo nombra fuera de su fichero:

- **producción:** un fichero que alcanzan las páginas `.astro`;
- **build:** los scripts del `prebuild`, `astro.config.mjs` o el generador del validador;
- **herramienta:** lo que se ejecuta a mano;
- **solo tests;**
- **huérfano:** nadie fuera de su fichero.

| | total | producción | build | herramienta | solo tests | **huérfano** |
|---|---:|---:|---:|---:|---:|---:|
| `motor/src` | 135 | 93 | 5 | 14 | 6 | **17** (3 valores, 14 tipos) |
| `web/src` | 331 | 276 | 0 | 0 | 16 | **39** (10 valores, 29 tipos) |
| `web/scripts` | 5 | 0 | 3 | 0 | 1 | **1** (un tipo) |
| **total** | **471** | **369** | **8** | **14** | **23** | **57** |

**Lectura de la tabla:**

- **Los huérfanos no son código muerto.** Los 57 se usan dentro de su propio fichero (cada uno tiene uso propio, de 1 a 11 veces). Lo que sobra es la palabra `export`: **se exporta por costumbre**. Es el mismo patrón que encontró Desplázame.
- **Los 44 tipos huérfanos** son, casi todos, tipos de la firma de una función exportada, que conviene poder nombrar.
- **Los 13 valores** (abajo) son constantes y funciones de detalle interno.
- **Los «solo tests» son superficie de prueba**, una decisión legítima, no código muerto. Son 23, entre ellos `PESTANAS` y `pestanaTrasTecla`, `ordenDeLasSenales`, `vecinas` y `colocar`, y `LIMITE_EN_BYTES`.
- **`analizar` de `motor/src/analizar.ts` sale «herramienta»**, y es así: es la entrada de Node (con Ajv en vivo) que usan la calibración y los jueces. El navegador entra por `navegador.ts`.

**Los 13 exports de valor huérfanos**, comprobados a mano uno a uno (`git grep -w`, sin los `.md`). Todos se usan dentro de su fichero:

| Fichero:línea | Export | Uso dentro |
|---|---|---|
| `motor/src/generar-validador.ts:92` | `generarCodigoAjv` | 1 |
| `motor/src/recuento.ts:30` | `formaDeCoincidencia` | 1 |
| `motor/src/recuento.ts:40` | `porCoincidencia` | 1 |
| `web/src/pantalla/generar-pdf.ts:30` | `NOMBRE_DEL_PDF` | 1 |
| `web/src/pantalla/informe-pdf.ts:97` | `interlineado` | 8 |
| `web/src/pantalla/informe-pdf.ts:197` | `muestraDeLaClave` | 1 |
| `web/src/pantalla/informe.ts:36` | `FRAGMENTOS_POR_REGLA` | 1 |
| `web/src/pantalla/informe.ts:37` | `LARGO_DEL_FRAGMENTO` | 1 |
| `web/src/pantalla/modelo-informe.ts:58` | `resultadoEnDatos` | 1 |
| `web/src/pantalla/modelo-informe.ts:95` | `textoEnDatos` | 1 |
| `web/src/pantalla/modelo-informe.ts:204` | `desgloseEnDatos` | 1 |
| `web/src/pantalla/pintar.ts:172` | `fichaCompleta` | 3 |
| `web/src/pantalla/propios.ts:40` | `LIMITE_EN_MB` | 2 |

→ **Hallazgo 10.**

### 2.2 · «Declarado y nunca cableado»

- **Tipos por adelantado sin consumidor: ninguno.** Todo tipo exportado tiene al menos un uso, aunque sea en su fichero. **Cumple.**
- **Tokens que nadie consume (3 de 112).** Ninguno tiene `var(--…)` en `web/src` ni se lee por su ruta en el TS:
  - **`espacio.rejilla` y `espacio.paso`** son informativos: «Rejilla base (guidelines.md)» y «Unidad de espaciado de Tailwind». → **Hallazgo 9.**
  - **`radio.tramo`** («Tinte de los tramos subrayados», 2 px) está declarado para algo que `familias.css` escribe a mano (§ 3). → **Hallazgo 9.**
  - **`subrayado.ortotipografia.estilo`** sí se usa: lo lee el PDF por variable (`tokens.subrayado[t]`, `informe-pdf.ts:155`, `case 'double-dashed'`). No es hallazgo.
- **Propiedades de los esquemas que el código no nombra (8 de 58).**
  - **`tildes`** se lee por desestructuración (`detector-patron.ts:95`). Cumple.
  - **`600+`** es un tramo que se calcula. Cumple.
  - **`$schema`** es convención JSON Schema. Cumple.
  - **`corpus` y `metodo`** son la procedencia de cada celda de calibración: viajan en el JSON y nadie los enseña (§ 10).
  - **`autor`, `licencia` e `idioma`**, de la cabecera del paquete, están en el tipo `Cabecera` (`motor/src/paquete.ts:48-51`) y ninguna pantalla los enseña. Con un paquete propio, quien lo carga no ve su licencia. → **Hallazgo 20**, decisión de producto.
- **Clases e ids de CSS sin uso: 0** en 12 hojas (con contraprueba). **Cumple.**
- **Opciones ignoradas:** ninguna vista en `astro.config.mjs`, los `package.json` ni los tsconfig.

### 2.3 · Inalcanzable

**Cumple.** tsc con `--allowUnreachableCode false` no da ningún TS7027 en los dos workspaces. La contraprueba del § 1 lo caza.

### 2.4 · Ficheros huérfanos

**Ningún fichero de código huérfano.**

- **Los 207 ficheros del grafo:**
  - 64 de producción (33 de `web/src`, 31 de `motor/src`);
  - 8 de build;
  - 37 de herramienta;
  - 98 de tests.
- **Las herramientas** las ejecuta una persona y lo dicen. Son herramienta viva y evidencia conservada (las que regeneran `data/` y las medidas del modelo), no basura.
- **Dos ficheros de `web/jueces`** (`apoyo.ts` y `chrome.ts`) salen «herramienta» porque los importan `iconos.ts` y `medir-modelo.ts` para abrir Chrome. Es lo esperado.

Ficheros de datos que nada de producción lee, mirados uno a uno:

| Fichero | Quién lo lee | Veredicto |
|---|---|---|
| `data/frecuencias/es-wordfreq.json` (CC BY-SA 4.0) | solo `motor/src/frecuencias.spec.ts` | Ninguna regla de la v1 lo usa. Dato conservado para la v1.1, como dice el README («piezas de apoyo que las reglas necesitarán»). El NOTICES § 2.2 dice todavía «se usará desde el punto 4» y «viajará al navegador cuando la usen las reglas» → **hallazgo 17** (para el bloque D) |
| `data/referencia/ancora-ud-*.json` | sus jueces | Conservado para la v1.1, declarado en el NOTICES § 2.1. Cumple |
| `docs/figma/modelo-make.zip` | nadie (referencia de lectura) | Declarado en `docs/figma/README.md` como «no se distribuye». Pero está versionado y el repositorio es público → **hallazgo 6** |
| `web/terceros/pdfmake/paquetes.json` | el juez 10 de `construccion.spec.ts` | La tabla del NOTICES § 1.8, vigilada. Cumple |

### 2.5 · Dependencias

| Clase | Hallazgo |
|---|---|
| **Declarada y no usada** | **Ninguna**, con knip y con el cruce de los imports reales. `motor`: `ajv` (`validar.ts` y `generar-validador.ts`), `esbuild` (`generar-validador.ts`), `typescript` (script `tipos`), `@types/node` (los `node:*`), las dos bases de `@tsconfig` (el `extends`). `web`: `@radiografia/motor`, `astro`, `pdfmake`, `@types/node` y `typescript`. **Cumple.** |
| **Usada sin declarar** | **`vite`**: `/** @type {import('vite').Plugin} */` en `web/astro.config.mjs:119`, un fichero que revisa tsc (`// @ts-check`). Llega de rebote, como dependencia de `astro`. Solo es un tipo, pero si `astro` cambia de Vite o npm deja de subirlo a la raíz de `node_modules`, `npm run tipos` falla sin que nadie haya tocado nada → **hallazgo 12** |
| **Binarios externos** | **`git`**, en tres herramientas de calibración (`calibrar.ts:44`, `descargar-opinion.ts:66` y `validar.ts:52`), que apuntan el commit de lo medido. **Python con `wordfreq`** (`exportar-wordfreq.py`) y **con TAALED y lexical_diversity** (`oraculo-ld.py`), fuera del repo y declarados en su cabecera, con el comando. **Chrome** para los jueces y para `iconos.ts` y `medir-modelo.ts`, declarado en el README. **fontTools**, fuera del repo, declarado en el NOTICES § 2.4. Cumple |
| **El lock** | Uno solo, en la raíz, con los dos workspaces: 319 entradas instalables, que son 311 transitivas más las 8 declaradas. Cuadra con el NOTICES (§ 10) |

### 2.6 · Convenciones del framework, descartadas antes de llamar muerto a nada

- **Las páginas de `web/src/pages/`** las carga Astro por su ruta, y `getStaticPaths` por convención.
- **`web/src/env.d.ts` y `.astro/types.d.ts`** son tipos del framework.
- **`web/public/`** se copia tal cual a `dist/`.
- **`astro.config.mjs`** lo carga Astro.
- **Los `extends` de los tsconfig** usan las bases de `@tsconfig` y `astro/tsconfigs/strict`.
- **El `exports` y el `imports` de `motor/package.json`** (`#validador-standalone`) se resuelven por Node y Vite.

Ninguna de estas piezas se ha contado como muerta.

### 2.7 · Cabos deliberados, reportados como decisión y no como descuido

- `data/referencia/` y `data/frecuencias/`, conservados para la v1.1 (POS y frecuencias).
- Las herramientas de calibración y el oráculo de MTLD y HD-D.
- `modelo-make.zip` como referencia de lectura (con el matiz del hallazgo 6).
- `document.fonts.load(…).catch(() => [])` (§ 5), decisión de Antonio del 05/10.

---

## 3 · Bloque A(b) — la copia a mano (fuente única)

| Valor | Constante canónica | Copias retecleadas | Qué las ata | Veredicto |
|---|---|---|---|---|
| **Colores** | `docs/figma/tokens.json` → `tokens.css`; el PDF lee el mismo JSON | `site.webmanifest`: `theme_color` `#332288` y `background_color` | `tokens.spec.ts` (4: ningún hex, `rgb()`, `hsl()` ni nombre de color en `web/src`); `iconos.spec.ts` (2: `theme_color` igual al token `accent`) | **Cumple**: la única copia está vigilada |
| **Umbrales 100 / 300** (y 600) | `motor/src/umbral.ts:17-18` (`MINIMO`, `COMPLETO`; el 600, literal en la línea 37 y en el tipo `TramoDeCalibracion` de `paquete.ts:21`) | **9 cadenas de `web/src/textos.ts`** (líneas 85, 93, 98, 161, 162, 224, 305, 325, 371) y **3 mensajes del motor** (`banda.ts:55`, `detector-estadistico.ts:73`, `validacion.ts:228`) | **Nada**: ningún juez ni fichero de `web/` importa `MINIMO` ni `COMPLETO`, y `navegador.ts` no los exporta | **Hallazgo 7** |
| *(no es copia)* | — | el `MINIMO = 100` de `descargar-academico.ts:72`, `descargar-administrativo.ts:59` y `descargar-narrativa-clasica.ts:66` | — | Mismo número con **otro sentido** (100 unidades de calibración por tramo). No es defecto |
| **Versión 0.1.0** | la cabecera de cada paquete | ninguna en el código (solo en `motor/fixtures/`, que son datos de prueba, y en `medidas-modelo.json`, que es texto medido) | `arbol-accesible.spec.ts` construye el nombre esperado con la versión del paquete | **Cumple** |
| **La URL del catálogo** | `urlDelCatalogo` y `urlDeRegla` (`web/src/catalogo/catalogo.ts:29-30`), 14 usos | ninguna; la carpeta `src/pages/reglas/` es la ruta por convención de Astro | los jueces del catálogo y de las fichas piden `reglas/<id>/` | **Cumple** |
| **Textos de la interfaz** | `web/src/textos.ts` (regla del 10.4: «textos solo en textos.ts») | **7 textos distintos escritos a mano en `web/src/pages/index.astro`, en 9 sitios** (líneas 138, 140, 143, 155, 163, 169, 174, 179 y 185): «Tu texto» (×3, una como `aria-label`), «Cargando los paquetes de reglas…», la procedencia de los ejemplos, «Pon tu texto a contraluz», «Paquetes», «Cargar un paquete propio (JSON)» y «Se queda en tu navegador…». Además, el nombre «RadiografIA» en el `<title>` y en la cabecera, que es identidad. **«Pon tu texto a contraluz»** va además dentro de dos cadenas de `textos.ts` (`PAQUETES_CAMBIADOS` y `SIN_INFORME`) | la copia de `index.astro`, `construccion.spec.ts:68` (`BOTON`, retecleado en el juez); las dos de `textos.ts`, nada | **Hallazgo 8** |
| **Nombres de familia y siglas** | los nombres, en los paquetes; las siglas las deriva `repartirSiglas` (`informe.ts:40`) del nombre; los tokens, `TOKENS_DE_FAMILIA` y `TOKEN_DE_FAMILIA` (`familias.ts:21-25`) | las 8 reglas `.fam-*` de `familias.css` | `familias.spec.ts` (1: cada familia, su token; 3: las siglas, las del DISEÑO §4); `contraste.spec.ts` (2: el color de cada `.fam-*`) | **Cumple** |
| **Medidas 44 / 48** | `medida.toque` y `medida.toque-movil` de los tokens | ninguna en `web/src` (todas por `var()`; el 48 del icono móvil, por `var(--espacio-48)`) | `pulsacion.spec.ts`, `base.spec.ts` (3) | **Cumple** |
| **Márgenes del informe, 20 / 18 mm** | `impresion.margen` de los tokens; el PDF los lee (`informe-pdf.ts:130`) | `margin: 20mm 18mm` a mano en `@page` (`web/src/estilos/informe.css:124`) | el juez de fidelidad del papel compara la página con el marco medido (±1 px) | **Copia vigilada.** Que `var()` funcione dentro de `@page`: NO CONSTA (no se ha probado). No es defecto mientras el juez la ate |
| **Radio del tramo, 2 px** | `radio.tramo` (2 px) | `border-radius: 2px` a mano en `familias.css:148` (la capa y la muestra) y `:169` (el tramo) | el juez de fidelidad compara el radio del tramo con el modelo | **Hallazgo 9**: el token existe para esto y no se usa |
| **El icono de la cabecera, 56 px** | el DISEÑO §8 (no hay token) | `.icono-marca { width: 56px; height: 56px }` y `width="56" height="56"` en el HTML | el juez de fidelidad (pieza del DISEÑO con su nota) | Copia vigilada. Cumple |
| **Scripts de npm** | — | `predev` y `prebuild` son **la misma cadena**, copiada (`web/package.json:9` y `:11`); `engines` `">=24.12.0"` en los tres `package.json` | nada | **Hallazgo 19** |

---

## 4 · Bloque A(c) — tipos que no mienten

- **`any`: cero** en `motor/src`, `web/src`, `web/scripts` y `astro.config.mjs`. **Cumple.**
- **Supresiones (`@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `eslint-disable`): cero.** **Cumple.**
- **Datos de terceros validados en runtime antes de cada `as`.** Las cinco aserciones sobre datos que no son nuestros tienen la validación del esquema justo delante:

  | Dónde | El dato | La guarda |
  |---|---|---|
  | `web/src/pantalla/cargar.ts:57` | el paquete pedido por `fetch` | `validar(dato)` en la línea 52; si no valida, no entra |
  | `web/src/pantalla/propios.ts:78` | el JSON del usuario | 2 MB como mucho, `JSON.parse` en `try` y `validar(dato)` en la 76 |
  | `web/src/catalogo/paquetes.ts:64` | los paquetes, en build | `validarPaquete` en la 62; si no valida, el build para |
  | `motor/src/validacion.ts:146` | el paquete, en el paso 2 | el paso 1 (esquema) acaba de dar verde; lo dice el comentario |
  | `motor/src/analisis.ts:164` | un `unknown` | encadenado opcional, sin suponer nada |

  **Cumple.**
- **Aserciones sobre dato propio**, de las 45 `as` (sin contar `as const`) y los 46 `!` (accesos por índice con `noUncheckedIndexedAccess`). La mayoría van tras `Object.hasOwn` o dentro de un bucle acotado. Las que se apoyan en un invariante sin guarda, con su mitigación:
  - **`web/scripts/tramos-de-ejemplos.ts:44`:** `JSON.parse(…) as Paquete` sin validar. Mitigación: lo que lee son los paquetes del propio repositorio, y el build del catálogo los valida justo después y para si no pasan.
  - **`web/src/pantalla/tarjeta.ts:92-93`** (`renglones[0]!`): supone que el tramo tiene al menos un rectángulo. Mitigación: la tarjeta se abre al pulsar un tramo visible, y «Anterior» y «Siguiente» se saltan los que no lo son.
  - **`web/src/pantalla/pintar.ts:794` y `modelo-informe.ts:209`** (`paquetes[resultado.paquetes.indexOf(r)]!`): suponen que el motor devuelve un resultado por paquete y en su orden. Mitigación: es el contrato de `analizar`, y lo prueban los jueces del motor.
  - **`motor/src/banda.ts:58`** (`calibracion!`): `clave` solo existe si existe la calibración, pero el tipo no lo dice.
  - **Los tokens leídos con `as`** (`informe-pdf.ts:109` y `:155`, `iconos.ts:67`): dato propio, vigilado por `tokens.spec.ts`.
- **Errores tratados como `Error` sin comprobarlo:** `(fallo as Error).message` en 5 `catch` (`motor/src/validacion.ts:350`, `cargar.ts:59`, `ejemplos.ts:40`, `pantalla.ts:266` y `propios.ts:74`). `descarga.ts` lo hace bien (`fallo instanceof Error ? … : String(fallo)`). → **Hallazgo 14.**
- **Incertidumbre en el tipo frente a opcionales que siempre están:** **NO CONSTA** (no se ha barrido).

---

## 5 · Bloque A(d) — fallo cerrado

| Qué | Dónde | Veredicto |
|---|---|---|
| **El cargador de paquetes** | `cargar.ts:62`: si falla uno solo, devuelve `paquetes: null` y la página dice `SIN_PAQUETES` con los motivos | **Cumple**: todo o nada, sin un «ok» agregado con algo caído |
| **El paquete propio** | `propios.ts`: tamaño, `JSON.parse`, esquema y nombre; cada fallo, un rechazo con su motivo | **Cumple.** Un matiz: si `fichero.text()` falla al leer, el aviso dice que no es JSON (el `try` envuelve las dos cosas) |
| **Los ejemplos** | `ejemplos.ts:39`: el fallo, en la línea de estado | **Cumple** |
| **La generación del PDF** | `descarga.ts:54`: el motivo en su línea de estado y el botón vuelve a ser el que era (`finally`); `generar-pdf.ts:55`: si fallan las fuentes, vacía la caché y **relanza** | **Cumple** |
| **`document.fonts.load`** | `pantalla.ts:217`: `.catch(() => [])` | **Traga el error a propósito**: sin la negrita, el análisis se pinta igual. Decisión de Antonio del 05/10 (9.3, punto 8), declarada en el juez de red. No es defecto |
| **El análisis** | `pantalla.ts:265`: el fallo, en la caja de problemas | **Cumple** |
| **La regex de un paquete que no compila** | `validacion.ts:349`: un error de validación con su regla y su campo | **Cumple** |
| **Promesas flotantes** | los cuatro manejadores `async` (`descarga.ts:40`, `pantalla.ts:347`, `:384` y `:398`) cubren lo que esperan con su `try` o con funciones que no lanzan | **Cumple** |
| **`?? 0` y `?? ''` de contadores** (`(cuenta.get(x) ?? 0) + 1`) | motor y web | Vacío de verdad. **Cumple** |
| **Valores por defecto de parámetros opcionales del esquema** (`minimo ?? 1`, `flags ?? ''`, `sobreNoProsa ?? false`, `formas ?? []`) | `motor/src/detector-*.ts` | Por defecto documentado en el esquema. **Cumple** |
| **20 búsquedas en el índice con `?? ''`** (`siglaDeFamilia.get(…) ?? ''`, `claseDeFamilia.get(…) ?? ''`, `nombresDeFamilia.get(…) ?? ''`, `regla(id)?.familia ?? ''`…) | `pintar.ts`, `modelo-informe.ts`, `lectura.ts`, `informe.ts` y las dos páginas de reglas | **Fallo enmascarado latente**: si una familia no estuviera en el índice, saldría una sigla o una clase vacía en silencio. Mitigación: el índice se hace de los mismos paquetes que se analizan, y `familias.spec.ts` y el juez de fidelidad miran las siglas y las clases pintadas → **hallazgo 13** |

---

## 6 · Bloque A(e) — fechas y zonas

- **El producto: un solo sitio.** La fecha y la hora del análisis, en la cabecera del informe y del PDF, salen de `Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' })` sobre `new Date()`, en la zona del navegador (`pantalla.ts:153` y `:222`), y viajan como texto. No hay aritmética de días, así que los bordes (medianoche, cambio de hora, fin de año, bisiesto) no tienen nada que romper. **Cumple.**
- **Las herramientas: la fecha UTC como «hoy».** `new Date().toISOString().slice(0, 10)`, lo que la guía prohíbe, en 10 sitios:
  - `motor/herramientas/calibrar/`: `calibrar.ts:50`, `construir-general.ts:98`, `descargar-academico.ts:326`, `descargar-administrativo.ts:355`, `descargar-narrativa-clasica.ts:358`, `descargar-noticia.ts:220`, `descargar-opinion.ts:169`, `regenerar-textos.ts:82` y `validar.ts:80`;
  - `web/scripts/medir-modelo.ts:391`.

  En Madrid, entre las 00:00 y las 02:00 en verano (hasta la 01:00 en invierno), escriben el día anterior en ficheros que se versionan: los manifiestos y las celdas de `data/calibracion/` (de ahí, la `fecha` de cada celda de `radiografia.json`) y `docs/figma/medidas-modelo.json`. → **Hallazgo 11.**
- **`boe.ts:172`** (`fechasDelPeriodo`) hace la aritmética en UTC de principio a fin (`T00:00:00Z`). **Cumple.**
- **Los instantes con hora** (`toISOString()` entero, `Date.now()` en los registros de descarga) son marcas de tiempo, no días civiles. **Cumple.**

---

## 7 · Bloque A(f) — seguridad estructural

**Cada inserción en el DOM, inventariada.**

- En `web/src`, `web/scripts` y `astro.config.mjs` hay **cero** `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `createContextualFragment`, `DOMParser`, `eval`, `new Function` y `set:html`.
- Todo entra por `textContent`, `createElement` (el ayudante `el()` de `pintar.ts`) y `append` de texto.
- Las plantillas `.astro` escapan cada `{…}`.

**Cumple.**

**Cada `href` que sale de un dato:**

| Dónde | De dónde sale |
|---|---|
| `pintar.ts:160`, `:507`; `reglas/index.astro:156` | `urlDeRegla(base, id)`; el id, del paquete validado |
| `pintar.ts:198`; `reglas/[id].astro:145` | la URL de una fuente del paquete, que el esquema limita a `^https?://\S+$` (`regla.schema.json`, `fuente.url`): no cabe un `javascript:`. Validado en la frontera |
| `pintar.ts:663` | la dirección de la ficha, de `urlDeRegla` |
| `Recursos.astro`, `Cabecera.astro` | constantes y `BASE_URL` |

**Cumple.**

**Las entradas:**

| Entrada | Frontera | Veredicto |
|---|---|---|
| **El texto pegado** | `textarea` sin `maxlength`; va al motor y se pinta con `textContent` | **Sin tope.** Cuánto texto aguanta la pestaña antes de colgarse: **NO CONSTA** (no se ha medido) → **hallazgo 15**, decisión de producto |
| **El JSON de un paquete propio** | 2 MB, `JSON.parse`, esquema (el validador standalone), regex que compila y nombre que no choca | **Cumple.** La regex con retroceso catastrófico, que puede colgar la pestaña, está declarada en la nevera del ESTADO y en el README |
| **El buscador del catálogo** | texto normalizado y comparado; **ninguna `RegExp`** en `web/src` | **Cumple** |
| **El hash de la ruta** | no se lee: cero usos de `location.hash`, `location.search` y `URLSearchParams` | **No aplica** |

**El resto de la casilla:**

- **Secretos: cero.** Se buscaron claves de API, contraseñas, `Bearer` y cadenas largas con forma de token (`git grep`). **Cumple.**
- **Nada de Node en el bundle del navegador.** Lo vigilan dos jueces: `motor/src/navegador.spec.ts` (empaqueta la entrada del navegador con esbuild y exige cero módulos de Node) y `construccion.spec.ts` (ni «node:», ni «new Ajv», ni «addKeyword» en `dist/`). **Cumple.**
- **La CSP:** en el § 9.4, con lo que admite y lo que no.

---

## 8 · Bloque A(g) — estructura y rendimiento

**Lo que llega al cliente sin deber**, medido sobre `dist/` y con gzip (Node, nivel por defecto):

| Qué | Cuánto | Veredicto |
|---|---|---|
| **Campos de los paquetes incluidos que el analizador no enseña**: `ejemplos`, `excepciones`, `fuente` y `origenLista`. En el navegador solo los usa `fichaCompleta`, la ficha de una regla **propia**; las incluidas tienen su página en el catálogo | `radiografia.json`: 352.239 bytes, 76.955 con gzip; **sin esos cuatro campos, 124.089 bytes y 23.425 con gzip**, unos **53 KB menos con gzip**, el **21 %** de los 250 KB con gzip que pide el analizador al cargar | **Hallazgo 3**, decisión de producto: el navegador valida los paquetes con el esquema, que exige esos campos |
| **La sangría del JSON** | 352.239 frente a 291.980 bytes compacto, pero con gzip solo 2.542 bytes menos | No compensa por sí sola. Declarar |
| **`tokens.json` entero dentro del trozo de pdfmake** | 8.043 bytes de descripciones dentro del JS, en 1,09 MB; solo al descargar | **Hallazgo 16** (declarar) |
| **Los `$comment` del validador standalone en el JS del analizador** (el cabo del 6.2) | 4 apariciones, 1.772 bytes; **189 bytes con gzip** | **Hallazgo 16** (declarar: no compensa) |

**Imports que arrastran librerías:**

- **pdfmake** entra con `import()` al pulsar «Descargar informe», en su trozo aparte.
- **El catálogo**, que se genera en build, entra al motor solo por `./validacion` y `./validador`, para no arrastrar `silabea.cjs`.
- **El analizador** lleva el motor con el silabeo, que necesita la legibilidad.

**Cumple.**

**Trabajo repetido al pintar:**

- **El índice** se rehace al cambiar los paquetes, no al pintar.
- **Las fuentes del PDF** se piden una vez por visita (`prepararFuentes`, con su caché que se vacía si falla).
- **El ojo** reviste los tramos en una pasada.

No se ha visto trabajo repetido por render. No hay red ni base de datos, así que no hay N+1. **Cumple.**

**Dónde agrupar sería peor (el contrapeso).** Los ficheros grandes son cohesivos:

- `pintar.ts` (808 líneas): cada función pinta un bloque del resultado.
- `informe-pdf.ts` (532): la definición del PDF.
- `informe.css` (600): la hoja de impresión, sección a sección.
- `validacion.ts` (436): el paso 2 de la validación.

Partirlos por tamaño repartiría una sola responsabilidad entre ficheros. **Se dejan.**

---

## 9 · Para el despliegue (del bloque E)

La variante que se eligió en el 11.2, con lo que cambia frente a estas: § 15.

**Ejecutado, simulado y no simulado:**

- **Ejecutado:** dos clones limpios de `4b8f9f2`, cada uno con `npm ci` y `npm run build` en `web/` (`prebuild` más `astro build`), y la comparación de `dist/` byte a byte.
- **Simulado:** nada.
- **No simulado:** el servidor de Hostinger (el cómo lo decide la parada con la doc del panel: **NO CONSTA**) y el build en otro sistema.

### 9.1 · El build, reproducible

- **Dos builds iguales.** Dos clones en rutas distintas (`F:\_clones-005\repro-a` y `repro-b`) dan el **mismo `dist/` byte a byte**: 85 ficheros con la misma huella sha256 cada uno.
- **El build no ensucia el árbol:** `git status` queda vacío en los dos (lo que genera el `prebuild` está en `.gitignore`).
- **La contraprueba:** un byte añadido a una copia de `dist/` sale en la comparación.
- **El mapa del build:**
  1. `npm ci` instala los dos workspaces desde el lock de la raíz.
  2. `prebuild` lanza, por este orden:
     - `npm run generar` del motor, que escribe `motor/dist/validador.standalone.js` con Ajv y esbuild;
     - `copiar-paquetes.ts`, que copia `paquetes/*.json` a `web/public/paquetes/`;
     - `tokens-a-css.ts`, que escribe `web/src/estilos/tokens.css`;
     - `tramos-de-ejemplos.ts`, que escribe `web/src/catalogo/tramos-de-ejemplos.json` con el motor.
  3. `astro build` empaqueta, con el validador ya escrito, los paquetes en `public/`, los tokens y los tramos.
  4. La integración `cspPrimero` recoloca el `<meta>` de la CSP en cada página.

  El orden cubre cada dependencia: lo que lee `astro build` lo escribe antes el `prebuild`.
- **Cumple.**

### 9.2 · Lo que viaja al servidor: el inventario de `dist/`

| Grupo | Ficheros | Bytes | Clase de caché recomendada |
|---|---:|---:|---|
| JS y CSS con huella en el nombre (`_astro/`) | 8 | 1.305.798 | **larga e inmutable** |
| Fuentes de la web (woff2) | 4 | 160.252 | **media** (sin huella en el nombre: hallazgo 5) |
| Fuentes del PDF (woff) | 5 | 162.720 | **media** (ídem) |
| Licencias de las fuentes (`OFL.txt`) | 2 | 9.006 | revalidar |
| Paquetes incluidos (JSON) | 2 | 374.215 | **revalidar siempre** (cambian sin cambiar de nombre) |
| Ejemplos y paquetes de prueba | 4 | 17.538 | revalidar siempre |
| HTML: el analizador | 1 | 6.496 | **revalidar siempre** |
| HTML: el catálogo | 1 | 74.694 | revalidar siempre |
| HTML: las 50 fichas | 50 | 476.320 | revalidar siempre |
| Iconos y manifiesto | 8 | 17.679 | iconos, media; `site.webmanifest`, revalidar |
| **Total** | **85** | **2.604.718** | |

- **El inventario entero**, fichero a fichero con su huella, está en el anexo A.
- **Las rutas son absolutas desde la raíz** (`/_astro/…`, `/fuentes/…`). Funcionan publicadas en la raíz de `radiografia.antonioblanquez.es`, no en una subcarpeta (no hay `base` en `astro.config.mjs`).

### 9.3 · Las cabeceras de caché, en dos variantes

**Las clases**, con su cabecera:

- `_astro/*` (huella de 8 caracteres en el nombre): `Cache-Control: public, max-age=31536000, immutable`. Un año, y nunca cambia: si cambia el contenido, cambia el nombre.
- HTML, paquetes JSON, ejemplos y `site.webmanifest`: `Cache-Control: no-cache`. Se guardan, pero se revalidan cada vez con `ETag` o `Last-Modified`, que el servidor manda para un fichero estático.
- Fuentes e iconos: `Cache-Control: public, max-age=604800`, una semana. **No llevan huella en el nombre**: con caché larga, un cambio de fuente tardaría hasta un año en llegar a quien ya la tenga → hallazgo 5.

**Variante A — `.htaccess` (Apache o LiteSpeed con `.htaccess` permitido; si el plan de Hostinger lo permite: NO CONSTA hasta la doc del panel).** Iría en `web/public/.htaccess`, que Astro copia a la raíz de `dist/`:

```apache
# Tipos que no todos los servidores traen.
<IfModule mod_mime.c>
  AddType font/woff2 .woff2
  AddType font/woff .woff
  AddType application/manifest+json .webmanifest
</IfModule>

<IfModule mod_headers.c>
  # Con huella en el nombre (nombre.XXXXXXXX.js|css, solo en _astro/): un año, inmutable.
  <FilesMatch "\.[A-Za-z0-9_-]{8}\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # Sin huella y que cambian sin cambiar de nombre: guardar, pero revalidar siempre.
  <FilesMatch "\.(html|json|txt|webmanifest)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  # Fuentes e iconos, sin huella: una semana.
  <FilesMatch "\.(woff2?|png|ico|svg)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
</IfModule>
```

Los ficheros de `dist/` y sus clases (anexo A): los 8 de `_astro/` casan con la primera regla; ningún otro nombre de `dist/` tiene esa forma.

**Variante B — sin `.htaccess`.** El HTML no puede poner la caché de otros ficheros: `<meta http-equiv="Cache-Control">` no lo respetan los navegadores para la caché HTTP. Lo único que queda en manos del build:

- **Que el nombre cambie cuando cambia el contenido.** Ya lo hacen los 8 de `_astro/`. Las fuentes, los paquetes y los iconos no.
- **El resto queda a la caché por defecto del servidor:** NO CONSTA hasta la doc del panel. Con una caché larga por defecto, un paquete o una ficha nuevos tardarían en llegar.

### 9.4 · La CSP: el `<meta>` de hoy y su equivalente por cabecera

**La de hoy.** Las 52 páginas llevan **la misma política**, en un `<meta>` justo detrás de `<meta charset>` (lo pone ahí la integración `cspPrimero` del 10.4):

```
connect-src 'self'; form-action 'self';
script-src 'self' 'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw=' 'sha256-QzWFZi+FLIx23tnm9SBU4aEgx4x8DsuASP07mfqol/c=' 'sha256-0chmwFk0zaA528yFfGV7J9ppIpdfTPPULncDF3WG7Zs=' 'sha256-eIXWvAmxkr251LJZkjniEK5LcPF3NkapbJepohwYRIc=' 'sha256-Q2BPg90ZMplYY+FSdApNErhpWafg2hcRRbndmvxuL/Q=';
style-src 'self' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=';
```

- **Qué impide:**
  - pedir nada a otro origen (`connect-src`): el guardia de «nada sale del navegador», que prueba el juez de red;
  - enviar un formulario fuera (`form-action`);
  - ejecutar scripts o cargar hojas de estilo que no sean del propio sitio o de los hashes de Astro.
- **El hash de `style-src`** es el SHA-256 de la cadena vacía.
- **Qué no restringe,** porque no lleva `default-src`:
  - imágenes, fuentes, medios y marcos de cualquier origen;
  - `object-src`;
  - `base-uri`;
  - `frame-ancestors`, que en un `<meta>` no se puede poner.

  Hoy no hay ninguna vía para inyectar marcado (§ 7), así que no muerde. Pero es lo que una cabecera podría cerrar.

**Equivalente por cabecera.** Variante A (`.htaccess`), lista para la parada:

```apache
<IfModule mod_headers.c>
  <FilesMatch "\.html$">
    Header set Content-Security-Policy "connect-src 'self'; form-action 'self'; script-src 'self' 'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw=' 'sha256-QzWFZi+FLIx23tnm9SBU4aEgx4x8DsuASP07mfqol/c=' 'sha256-0chmwFk0zaA528yFfGV7J9ppIpdfTPPULncDF3WG7Zs=' 'sha256-eIXWvAmxkr251LJZkjniEK5LcPF3NkapbJepohwYRIc=' 'sha256-Q2BPg90ZMplYY+FSdApNErhpWafg2hcRRbndmvxuL/Q='; style-src 'self' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='"
  </FilesMatch>
</IfModule>
```

- **Los hashes son del build de `4b8f9f2`.** Cambian si cambia un script o un estilo en línea, así que un `.htaccess` escrito a mano se quedaría viejo sin avisar. Si se va a cabecera, habría que:
  - escribirlo en build, desde el `<meta>` que genera Astro (como hoy hace `cspPrimero` con su huella);
  - y atarlo con un juez que compare la cabecera con el `<meta>`.
- **El `<meta>` puede quedarse:** con los dos, el navegador aplica las dos políticas (la intersección).
- **Lo que solo se puede poner por cabecera** (`frame-ancestors 'none'`) **y lo que cerraría más** (`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`) es ampliar la política: decisión aparte, no se escribe aquí por iniciativa propia.

→ **Hallazgo 4.**

### 9.5 · Lo que NO debe subirse

**Al servidor va el contenido de `web/dist/`, y nada más.** El repositorio lleva, y no debe publicarse en la web:

- **`docs/`:** la investigación, el DISEÑO de Figma, `modelo-make.zip`, las medidas del modelo, la bitácora y las actas. Los PDF de prueba de `docs/informes/` ni siquiera se versionan.
- **`data/`:** la calibración con sus manifiestos, la lista de wordfreq (CC BY-SA 4.0) y la referencia de AnCora.
- **`motor/`:** el código, las herramientas, los fixtures, los corpus de `motor/corpus/` (no se versionan) y el validador generado, que ya va dentro del JS.
- **`paquetes/`:** se publican copiados en `dist/paquetes/`.
- **`web/src`, `web/jueces`, `web/scripts` y `web/terceros`:** sus avisos ya van dentro del JS de pdfmake.
- **El resto:** `node_modules/`, `.git/`, los `package*.json`, `CLAUDE.md`, el PLAN, el ESTADO, el DISEÑO y el README.

Si el despliegue de Hostinger fuera un `git pull` de la raíz del repositorio en la carpeta pública, todo eso quedaría en la web. El cabo del ESTADO §6 recuerda que el panel no ejecuta el CLI (Desplázame versiona su `dist`). Cómo llega `dist/`, sin el resto: lo decide la parada de Hostinger.

---

## 10 · NOTICES, licencias y procedencia

**El árbol del lock contra el NOTICES.** **Cumple.**

- El guardián (`motor/src/notices.spec.ts`) da **11 de 11** a `4b8f9f2`.
- Mi recuento independiente del lock cuadra: 319 entradas instalables, 311 transitivas más las 8 declaradas, con el reparto de licencias de su § 1.3.
  - **MIT 246:** las 239 del NOTICES más las 7 declaradas que son MIT.
  - **Apache-2.0 18:** las 17 más `typescript`.

**Lo que viaja al navegador, con su licencia y dónde va su aviso:**

| Qué | Licencia | Dónde va su aviso | Veredicto |
|---|---|---|---|
| La función de Ajv dentro del validador | MIT | en cabecera del JS del analizador, como comentario legal `/*!` | Cumple; lo vigila el juez 6 de `construccion.spec.ts` |
| **silabea**, incorporado en `motor/src/terceros/silabea.cjs` y empaquetado en el JS del analizador | **MIT**, que pide «The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software» | **en ninguna parte del JS publicado.** Su cabecera es `/*`, no `/*!`, y Vite la quita al minificar. En el build de `4b8f9f2`, el JS lleva su código (`silabaHiato` 5 veces, `getSilabas` 2) y **0** apariciones de «Cofré» y de «Javier Arce». El único «Permission is hereby granted» es el de Ajv | **Hallazgo 1** |
| Las 76 piezas del trozo de pdfmake | MIT y las de su § 1.6 | en cabecera del trozo, como comentario legal (`web/terceros/pdfmake/avisos.txt`) | Cumple; lo vigila el juez 10 de `construccion.spec.ts` |
| El trozo de interoperabilidad de Rolldown (`_astro/rolldown-runtime.*.js`, 589 bytes: los ayudantes de CommonJS que escribe el empaquetador) | Rolldown es MIT; que su salida necesite aviso: **NO CONSTA** | ninguno | Declarado. El NOTICES § 1.1 dice que «el JS no lleva código de Vite ni de Astro» (02/10), antes de que existiera este trozo → hallazgo 17 |
| Las fuentes, woff2 y woff | OFL 1.1 | `OFL.txt` al lado de cada familia, que viaja a `dist/fuentes/`; copyright, licencia y URL en la tabla `name` de cada fichero | Cumple; lo vigila `fuentes.spec.ts` |
| **Los percentiles de calibración**, dentro de `radiografia.json` (`cabecera.calibracion`, 65.348 bytes) | la de cada corpus: CC BY 4.0 (AnCora, CSIC), la licencia tipo del BOE (que pide la cita «Basado en datos de la Agencia Estatal Boletín Oficial del Estado»), dominio público (Gutenberg) y CC BY 2.1 ES (MuchoCine) | cada celda lleva el nombre de su corpus y la ruta de su manifiesto, pero **ni la licencia ni la cita del BOE**. Ninguna página publicada las enseña. El NOTICES § 2.3 lo dejó «NO CONSTA hasta el punto 6» y nadie lo cerró | **Hallazgo 2** |
| Los iconos | Apache-2.0 (propios) | `PROCEDENCIA.md` | Cumple |

**Herramientas fuera del repo, declaradas:**

- fontTools 4.66.1 (MIT), en el NOTICES § 2.4;
- wordfreq, en la cabecera de `exportar-wordfreq.py` y en el § 2.2;
- TAALED y lexical_diversity, en la cabecera de `oraculo-ld.py`: TAALED es CC BY-NC-SA y no se incorpora.

**Cumple.**

**`PROCEDENCIA.md` del icono:** las huellas de los siete derivados están en su tabla. Las de `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` e `icon-512-maskable.png`, más los dos SVG, coinciden byte a byte con `web/public/` (sha256 calculado hoy), y las vigila `iconos.spec.ts` (4). El encargo las daba por pendientes desde la Tanda 1: ya no lo están. **Cumple.**

**Prosa vieja del NOTICES**, que el guardián no mira (cuenta cifras, no frases) → **hallazgo 17**, para el bloque D:

- **§ 1.1:**
  - «unos 359 KB con gzip» (el README dice 363 desde el 05/10);
  - «el JS no lleva código de Vite ni de Astro».
- **§ 2.2:** wordfreq «se usará desde el punto 4» y «viajará al navegador cuando la usen las reglas».
- **§ 2.3:** «Cómo se enseña la atribución en la interfaz, NO CONSTA hasta el punto 6».

---

## 11 · Meta

### 11.1 · Lo que está bien y por qué merece repetirse

- **Cero `any`, cero supresiones y cero inserciones de HTML.** El texto pegado, que es la entrada principal, entra siempre por `textContent`. Y lo demuestra el barrido, no la memoria.
- **Cada `as` sobre un dato ajeno lleva la validación del esquema justo delante.** El patrón es `unknown`, luego validar, luego `as`. Es exactamente lo que pide la casilla.
- **El cargador falla entero o no falla.** No hay un «ok» agregado que pueda salir con algo caído.
- **El build es reproducible byte a byte**, y lo que genera no ensucia el árbol. Cada derivado tiene su fuente versionada y su línea en `.gitignore` con el porqué.
- **Una sola fuente de color, con juez que la cierra.** Ni un hex fuera de `tokens.css`, y el PDF lee el mismo JSON.
- **Cada aviso de licencia que viaja tiene un juez que lo busca en `dist/`:** Ajv, pdfmake y las fuentes. El hallazgo 1 es justo el que no lo tenía.
- **El NOTICES no puede envejecer en sus cifras:** el guardián compara cada número con el lock. Le falta la prosa (hallazgo 17).
- **Nada de Node en el navegador, vigilado dos veces:** con esbuild, en el motor, y sobre el `dist/` de verdad.
- **La CSP en cada página, con su huella comparada por un juez.**
- **pdfmake se carga solo al pulsar**, con su aviso dentro del trozo.

### 11.2 · Para el checklist maestro (en genérico)

- **Comprobar que el aviso de cada pieza de terceros sobrevive al minificado.** Se busca en el JS publicado el nombre del titular, no en el fuente. Un comentario `/*` se pierde; uno `/*!` se queda.
- **Medir con gzip antes de proponer compactar.** Aquí, quitar la sangría de un JSON de 352 KB ahorraba 2,5 KB; quitar los campos que nadie enseña, 53.
- **La reproducibilidad, con dos clones en rutas distintas** (si se cuela una ruta absoluta en la salida, cambia la huella) y una contraprueba por mutación.
- **Cada barrido que da cero, con un caso sembrado.**
- **Separar «exportado sin uso» de «muerto».** Un export huérfano que su fichero usa es costumbre, no basura.
- **Los datos derivados que viajan también llevan su cita.** Unos percentiles de un corpus con licencia viajan dentro de un JSON, y la cita que pide su licencia no se ve.
- **Si la fuente del checklist no está en disco, se dice:** NO CONSTA, y de dónde sale el texto que se usa.

---

## 12 · La tabla de hallazgos

Cómo quedó cada uno tras la parada 2, en el § 14.1.

**Leyenda:**

- **Gravedad:** 🔴 rompe o miente; 🟠 deuda real; 🔵 cosmético.
- **Coste:** trivial, acotado o tanda propia.
- **«Toca»:** si el arreglo tocaría `motor/src` (vedado salvo autorización expresa) o `paquetes/`.
- **«Decisión»:** decisión de producto; el auditor no la toma.

| Nº | Grav. | Qué | Dónde | Arreglo propuesto (opciones) | Coste | Toca | Decisión |
|---|---|---|---|---|---|---|---|
| 1 | 🔴 | **El aviso MIT de silabea no viaja en el JS publicado.** Su código sí, y su licencia exige el aviso en «all copies or substantial portions» | `motor/src/terceros/silabea.cjs` (cabecera `/*`); `dist/_astro/index.astro_*.js` | (a) Un plugin de Vite que antepone el aviso de silabea como comentario legal `/*!` al empaquetar ese módulo, como `avisosDePdfmake`, y un juez en `construccion.spec.ts` que busque «Nicolás Cofré Méndez» y «Javier Arce» en `dist/`. Rojo antes del verde. (b) Cambiar la cabecera a `/*!`: toca `motor/src` y cambia la huella de su fila del NOTICES § 1.5. (c) Publicar un fichero de avisos en `dist/` enlazado desde la página | acotado | (a) no; (b) **motor/src** | no: es cumplir la licencia. La vía, a elegir |
| 2 | 🟠 | **La atribución de los corpus de calibración no se ve en la web**, y los percentiles viajan en `radiografia.json`. La cita que exige el BOE («Basado en datos de la Agencia Estatal Boletín Oficial del Estado») no aparece en ninguna página publicada. El NOTICES § 2.3 lo dejó «NO CONSTA hasta el punto 6» | `paquetes/radiografia.json` (`cabecera.calibracion`); `dist/` | (a) Un texto en la interfaz, desde `textos.ts`: en «Ver el detalle», en el pie o en una página de créditos. (b) La cita en la cabecera del paquete: toca `paquetes/`. (c) Un fichero de avisos en `dist/`, como en el 1c | acotado | (b) **paquetes** | **sí**: dónde y cómo se enseña |
| 3 | 🟠 | **53 KB con gzip (el 21 % de la carga inicial del analizador) de campos que el analizador no enseña:** `ejemplos`, `excepciones`, `fuente` y `origenLista` de los paquetes incluidos | `dist/paquetes/radiografia.json` | (a) Declararlo. (b) Servir al navegador una copia recortada, validada entera en build, y no validar los incluidos en el navegador: cambia la decisión «se validan al cargar». (c) Un esquema de paquete «de navegador»: toca el esquema y el contrato de los paquetes propios | (b) tanda propia; (c) tanda propia | (c) motor | **sí** |
| 4 | 🟠 | **La CSP por cabecera y las cabeceras de caché no existen todavía.** Las dos variantes están preparadas en § 9.3 y § 9.4 | `web/public/` (un `.htaccess`, si se elige) | En la parada de Hostinger, según la doc del panel. Si la CSP va a cabecera, el `.htaccess` se escribe en build desde el `<meta>` y lo ata un juez; entonces `cspPrimero` sobra o se queda como respaldo | acotado | no | **sí** (parada de Hostinger) |
| 5 | 🟠 | **Las fuentes no llevan huella en el nombre**: no se pueden cachear largas sin riesgo de servir una vieja tras un cambio | `web/public/fuentes/`; `Recursos.astro`; `fuentes.css`; `generar-pdf.ts` | (a) Caché media (una semana) con revalidación: sin código. (b) Nombres versionados: toca las precargas, los `@font-face`, las rutas del PDF, el NOTICES § 2.4 y los jueces de fuentes | (a) trivial; (b) acotado | no | **sí** |
| 6 | 🟠 | **`modelo-make.zip` versionado en un repositorio público**, cuando `docs/figma/README.md` dice que «no se distribuye» y por eso no entra en el NOTICES. La licencia de lo que genera Figma Make: NO CONSTA | `docs/figma/modelo-make.zip` | (a) Sacarlo del repositorio y dejarlo en local (sigue en el historial de git). (b) Declararlo en el README de figma y en el NOTICES con lo que digan las condiciones de Figma | trivial | no | **sí** |
| 7 | 🔵 | **Los umbrales 100 y 300, retecleados** en 9 cadenas de `textos.ts` y 3 mensajes del motor, **sin nada que los ate** a `umbral.ts` | § 3 | (a) Un juez en `web/jueces` que importe `MINIMO` y `COMPLETO` (ruta relativa al motor, sin tocarlo) y exija cada número en sus cadenas. (b) Construir las cadenas con las constantes: `navegador.ts` tendría que exportarlas (**motor/src**). Los 3 mensajes del motor, solo con autorización | (a) acotado | (b) **motor/src** | no |
| 8 | 🔵 | **7 textos de interfaz escritos a mano en `index.astro`** (9 sitios), fuera de `textos.ts`. «Pon tu texto a contraluz» va 3 veces y solo una está atada | § 3 | Pasarlos a `textos.ts` **sin reescribirlos** (son de identidad) y que `index.astro` los importe; un juez que ate las copias | acotado | no | no |
| 9 | 🔵 | **`border-radius: 2px` a mano dos veces**, habiendo `--radio-tramo`; y dos tokens informativos (`espacio.rejilla`, `espacio.paso`) que nada consume | `familias.css:148`, `:169`; `tokens.json` | `var(--radio-tramo)` en los dos sitios (lo que se ve no cambia, y el juez de fidelidad lo confirma); los dos tokens, declararlos informativos en su `$description` o quitarlos (el juez de tokens cuenta 112) | trivial | no | no |
| 10 | 🔵 | **57 exports sin consumidor fuera de su fichero** (13 valores, 44 tipos): se exporta por costumbre | § 2.1 | Quitar la palabra `export` de los 13 valores (3 son de **motor/src**: `recuento.ts` ×2 y `generar-validador.ts`), o declarar la costumbre. Los tipos de una firma pública pueden quedarse | trivial | 3 de **motor/src** | no |
| 11 | 🔵 | **La fecha UTC como «hoy»** en 9 herramientas de calibración y en `medir-modelo.ts` | § 6 | Una función de fecha civil local (con `Intl`), en un solo sitio para las herramientas y otro para `web/scripts`. No toca `motor/src` (las herramientas están fuera de `src`) | acotado | no | no |
| 12 | 🔵 | **`vite` usado sin declarar** (un tipo en JSDoc) | `web/astro.config.mjs:119` | Tipar el plugin con lo que exporta `astro`, o declarar `vite` en las `devDependencies` de `web` fijado a la versión que trae `astro` (y su fila en el NOTICES) | trivial | no | no |
| 13 | 🔵 | **20 búsquedas `?? ''` en el índice que enmascararían un fallo** (sigla, clase o familia vacías en silencio) | § 5 | Un accesor del índice que lance si falta la clave, o declararlo (hoy lo mitigan el invariante y los jueces de familias y de fidelidad) | acotado | no | no |
| 14 | 🔵 | **`(fallo as Error).message` en 5 `catch`**, sin comprobar que es un `Error` | § 4 | `fallo instanceof Error ? fallo.message : String(fallo)`, como `descarga.ts`; uno es de **motor/src** (`validacion.ts:350`) | trivial | 1 de **motor/src** | no |
| 15 | 🔵 | **El texto pegado no tiene tope**: cuánto aguanta la pestaña, NO CONSTA | `index.astro` (`textarea`) | Medirlo y (a) declararlo en el README o (b) poner un tope con su aviso en `textos.ts` | acotado | no | **sí** |
| 16 | 🔵 | **`tokens.json` entero en el trozo de pdfmake** (8 KB de descripciones) y **los `$comment` del validador** (189 bytes con gzip) | § 8 | Declararlos: el ahorro no paga el código | — | — | no |
| 17 | 🔵 | **Prosa y cifras viejas** (para el bloque D) | NOTICES § 1.1, § 2.2 y § 2.3; README («Lo que viaja al navegador»: 2.604.629 bytes y 7.302 del CSS del catálogo, medidos antes de `5a05544`; hoy, 2.604.718 y 7.391); `astro.config.mjs:11` («Sin integraciones», con una integración en la línea 131); ESTADO §2, «sin integraciones» (para el estado) | Ponerlos al día en la tanda de documentación | trivial | no | no |
| 18 | 🔵 | **El trozo de Rolldown sin aviso** (`rolldown-runtime.*.js`, 589 bytes): si la salida de un empaquetador necesita aviso, NO CONSTA | `dist/_astro/` | Declararlo en el NOTICES § 1.1 (y quitar «el JS no lleva código de Vite»), o meterlo en el fichero de avisos del 1c si se elige | trivial | no | no |
| 19 | 🔵 | **`predev` y `prebuild`, la misma cadena copiada**; `engines` en tres sitios | `web/package.json:9` y `:11` | `"predev": "npm run prebuild"`. Los `engines` en cada workspace son convención de npm: declararlos | trivial | no | no |
| 20 | 🔵 | **El autor, la licencia y el idioma de un paquete no se enseñan**: quien carga un paquete propio no ve su licencia | `motor/src/paquete.ts:48-51`; la interfaz | Enseñarlos en la línea del paquete propio y en su ficha completa, o declararlo | acotado | no | **sí** |

**Reportado por completitud (NO es defecto):**

- **Las copias vigiladas:**
  - el color del manifiesto (lo ata `iconos.spec.ts`);
  - los márgenes de `@page` (los ata el juez de fidelidad del papel);
  - el icono de 56 px (pieza del DISEÑO con su nota).
- **Las herramientas a mano y `chrome-cae.prueba.ts`**, que knip da por muertas.
- **El `MINIMO = 100` de los descargadores**, que es otro número con la misma cifra.
- **`document.fonts.load(…).catch(() => [])`**, decisión del 05/10.
- **Los «solo tests»**, que son superficie de prueba.

---

## 13 · Recomendación de orden

1. **Primero, antes de publicar:** el **1** (licencia de silabea) por la vía (a), que no toca `motor/src`, y el **2** (la cita del BOE y la atribución de los corpus), en cuanto Antonio diga dónde. Son las dos cosas que harían que la web publicada incumpla una licencia.
2. **En la parada de Hostinger:** el **4** y el **5** (cabeceras, CSP y caché de las fuentes), con la doc del panel delante; y el **6** (`modelo-make.zip`), antes de que el repositorio se enseñe como portafolio.
3. **Una tanda corta de limpieza**, cada uno con su juez:
   - el **9**, que no cambia nada visible y lo confirma la fidelidad;
   - el **12** y el **19**, triviales;
   - el **14** y el **13**, en `web/`;
   - el **7**, el juez de los umbrales, sin tocar el motor;
   - el **8**, los textos de `index.astro`.
4. **A la nevera (v1.1), si Antonio quiere:** el **3** (recortar los paquetes), el **15** (tope del texto), el **20** (metadatos del paquete) y el **11** (fechas de las herramientas, que solo escriben datos de calibración).
5. **Declarar y no tocar:** el **10** en `motor/src` (sin autorización), el **16** y el **18**.

**Qué NO tocar:**

- **`motor/src`**, salvo autorización expresa para el 1b, el 7b, el 10 o el 14.
- **Los textos de identidad de `index.astro`:** se mueven, no se reescriben.
- **Los ficheros grandes y cohesivos del § 8.**

---

## 14 · La parada 2 (06/10/2026): lo firmado y lo hecho

Antonio firmó los veinte hallazgos el 06/10 y, ese mismo día, después, el 21 (§ 14.4). Este apartado dice qué se hizo con cada uno: commits atómicos en `main`, cada uno verificado en un clon limpio (tipos, motor, build y jueces de la web en Chrome) y sin push. El resto del censo se queda como se escribió sobre `4b8f9f2`.

### 14.1 · El estado de cada hallazgo

| Nº | Firma | Estado | Commit | Su juez |
|---|---|---|---|---|
| 1 | arreglar, vía (a) | **arreglado**: la cabecera de `silabea.cjs` pasa a comentario legal al empaquetar (`avisoDeSilabea`, `astro.config.mjs`), sin tocar `motor/src` | `ead3506` | `construccion.spec.ts` (11), rojo antes del verde |
| 2 | arreglar | **arreglado**: la página «Créditos y licencias», `/creditos/`, enlazada desde el pie de cada página y, en «Ver el detalle», debajo de la comparación con los textos de personas | `634792b`, `1e30eaf` | `construccion.spec.ts` (12), `textos-web.spec.ts`, `creditos-pantalla.spec.ts`, `pulsacion.spec.ts`, `arbol-accesible.spec.ts` (7), `cabecera.spec.ts`, `fidelidad.spec.ts` y `pantalla.spec.ts` (6) |
| 3 | declarar, y a la nevera | **declarado** (§ 14.2) y **nevera** (§ 14.3) | — | — |
| 4 | parada de Hostinger | **preparado, sin tocar**: las dos variantes de caché y CSP del § 9.3 y el § 9.4 | — | — |
| 5 | parada de Hostinger | **preparado, sin tocar**: por defecto, caché de una semana para las fuentes, sin código (§ 9.3, variante A). Si en esa parada se decide larga, los nombres se versionan en esa tanda | — | — |
| 6 | quitar del repositorio | **arreglado**: fuera del índice e ignorado; la copia local se queda en `docs/figma/` para el calco; sigue en la historia de git | `62101bd` | `repositorio.spec.ts` |
| 7 | juez | **arreglado**: un juez ata las nueve cadenas de `textos.ts` a `MINIMO` y `COMPLETO` de `motor/src/umbral.ts` (leídos de su fichero) y el 600 a lo que hace `tramoDeCalibracion`, sin tocar el motor. Dio verde a la primera, porque ataba valores ya correctos: cuatro contrapruebas en rojo. Los tres mensajes del motor, declarados (§ 14.2) | `9aeaf6f` | `umbrales.spec.ts` |
| 8 | arreglar | **arreglado**: los siete textos, a `textos.ts` tal cual; en el HTML solo queda el nombre, que es identidad; `PAQUETES_CAMBIADOS` y `SIN_INFORME` citan el botón desde su constante | `2b8b99f` | `textos-web.spec.ts`, `construccion.spec.ts` (2 y 8) |
| 9 | arreglar | **arreglado**: los dos radios del tramo, a `var(--radio-tramo)`; `espacio.rejilla` y `espacio.paso`, fuera de `tokens.json` (informativos, sin destino: los 8 y 4 px en uso son `espacio.8` y `espacio.4`), con su nota en el README de figma; 110 tokens | `533446b` | `tokens.spec.ts` (5) |
| 10 | declarar | **declarado** (§ 14.2) | — | — |
| 11 | nevera | **nevera** (§ 14.3) | — | — |
| 12 | arreglar | **arreglado**: `vite` 8.3.2 en las `devDependencies` de `web`, la versión que ya instalaba `astro`; el lock solo cambia en esa línea (`npm ci` lo acepta); el NOTICES, al día (el guardián dio rojo con el NOTICES viejo y 11/11 con el nuevo) | `8f2aa78` | `paquete.spec.ts` (1) y el guardián del NOTICES |
| 13 | declarar | **declarado** (§ 14.2) | — | — |
| 14 | arreglar los 4 de `web/`; declarar el del motor | **arreglado** en `web/`: una sola guarda, `motivoDelFallo` (`web/src/pantalla/fallo.ts`), en los cuatro catch y en el de `descarga.ts`; **declarado** el del motor (§ 14.2) | `603837d` | `fallos.spec.ts` |
| 15 | nevera | **nevera** (§ 14.3) | — | — |
| 16 | declarar | **declarado** (§ 14.2); el cabo del 6.2 se cierra como declarado | — | — |
| 17 | arreglar | **arreglado**: el NOTICES § 1.1 (en presente, y el trozo de pdfmake medido hoy: unos 363 KB con gzip, no 359), § 2.2 (wordfreq no viaja) y § 2.3 (en `634792b`); el comentario de `astro.config.mjs` (una integración); el README, al día en `e3fdd23` (los tamaños, en el § 14.5) | `8a1d7d8` (y `634792b`, `e3fdd23`) | `construccion.spec.ts` (14): el tamaño del trozo de pdfmake que dicen el NOTICES y el README, atado a `dist/` |
| 18 | según lo que lleve su runtime | **arreglado**: su runtime es código de Rolldown (MIT), no generado del nuestro (va tal cual dentro del empaquetador: «export var __create = Object.create; …»). Su `LICENSE` va en cabecera de su trozo (`avisoDeRolldown`, por el módulo `\0rolldown/runtime.js`), con una línea en el NOTICES § 1.1 y otra en la página de créditos | `6c8f2fd` | `construccion.spec.ts` (13) |
| 19 | arreglar | **arreglado**: `predev` y `prebuild` llaman a `npm run preparar`, la cadena definida una vez; los `engines` de cada `package.json` son convención de npm y se quedan | `3f9feeb` | `paquete.spec.ts` (2) |
| 20 | nevera | **nevera** (§ 14.3) | — | — |
| 21 | el mismo trato que el 18 (nuevo, § 14.4) | **arreglado**: la función de precarga de Vite es código de Vite (MIT) tal cual. La parte MIT de su `LICENSE.md` («Vite core license») va en cabecera del trozo que la lleva (`avisoDeVite`, por el módulo `\0vite/preload-helper.js`), con una línea en el NOTICES § 1.1 y otra en la página de créditos; la entrada de la bitácora, cerrada | `40dd211` (y `79ff94d`, la bitácora) | `construccion.spec.ts` (15), rojo antes del verde |

### 14.2 · Lo declarado, con su porqué

- **3 · Los 53 KB con gzip de campos que el analizador no enseña** (`ejemplos`, `excepciones`, `fuente` y `origenLista` de los paquetes incluidos). Los paquetes se validan enteros al cargar, con el mismo esquema que un paquete propio: servir uno «ligero» cambiaría el contrato (o se deja de validar lo incluido, o hace falta un esquema de navegador). Se queda así en la v1, y la decisión va a la nevera.
- **7 · Los tres mensajes del motor que repiten 100 y 300** (`banda.ts:55`, `detector-estadistico.ts:73`, `validacion.ts:228`). Son de `motor/src` y se quedan como están. Las nueve cadenas de la web sí quedan atadas (`umbrales.spec.ts`).
- **10 · Los 57 exports sin consumidor fuera de su fichero** (13 valores y 44 tipos). Se usan dentro de su fichero: lo que sobra es la palabra `export`, y quitarla no cambia lo que hace la web. Los tres de `motor/src` (`recuento.ts` ×2 y `generar-validador.ts`) no se tocan.
- **13 · Las 20 búsquedas `?? ''` en el índice.** El invariante: el índice se hace con los mismos paquetes que se analizan, así que cada familia, sigla y clase que se busca está. Lo vigilan `familias.spec.ts` (cada familia con su token y sus siglas, las del DISEÑO), `contraste.spec.ts` (el color de cada `.fam-*`) y el juez de fidelidad (las siglas y las clases pintadas). Si el invariante se rompiera, saldría una sigla o una clase vacía, y esos jueces la verían en Chrome.
- **14 · El catch de `motor/src/validacion.ts:350`.** Es del motor y se queda como está. Solo envuelve `new RegExp(regex, flags)` con la expresión y las banderas de una regla, que el esquema ya ha dado por cadenas: lo que lanza si no compilan es un `SyntaxError` (ECMA-262, RegExpInitialize), que es un `Error`.
- **16 · `tokens.json` entero dentro del trozo de pdfmake (8 KB de descripciones, solo al descargar) y los `$comment` del validador standalone (189 bytes con gzip).** El ahorro no paga el código que haría falta. El cabo del 6.2 sobre los `$comment` queda cerrado como declarado.

### 14.3 · La nevera (v1.1)

- **3** · Un paquete «de navegador» más ligero para los incluidos, sin cambiar el contrato de los propios (§ 14.2).
- **11** · La fecha civil local, en vez de la UTC, en las nueve herramientas de calibración y en `web/scripts/medir-modelo.ts`.
- **15** · El tope del texto pegado: medir cuánto aguanta la pestaña y poner un tope con su mensaje en `textos.ts`.
- **20** · El autor, la licencia y el idioma de un paquete, en pantalla (la línea del paquete propio y su ficha completa).

### 14.4 · Hallazgo 21, nuevo: la función de precarga de Vite viajaba sin aviso

**Qué es.** Desde el 9.3, el JS del analizador lleva la función `preload` del núcleo de Vite 8.3.2 (MIT, © VoidZero Inc. and Vite contributors; `node_modules/vite/dist/node/chunks/node.js`). Vite la mete al empaquetar el `import()` del trozo de pdfmake (`web/src/pantalla/descarga.ts`): `__vite__mapDeps`, la precarga con `<link rel="modulepreload">` y el evento `vite:preloadError`. Su aviso no viaja.

**Lo que guardó silencio.** El § 10 y el § 11.1 de este censo dieron por completa la lista de lo que viaja. El NOTICES § 1.1 decía que «el JS no lleva código de Vite ni de Astro». Entrada en la bitácora, abierta antes de arreglar nada (`e04c83b`). Se vio al preparar el 18, buscando en cada JS de `dist/` otro código del empaquetador.

**Firma (06/10):** el mismo trato que el 18. **Hecho en `40dd211`**, sin tocar `motor/src` ni `paquetes/`:

- `avisoDeVite`, en `web/astro.config.mjs`, pone en cabecera del trozo cuyo `moduleIds` lleva `\0vite/preload-helper.js` (el módulo con el que Vite escribe la función; visto en un build en ese trozo y en ningún otro) la parte «Vite core license» del `LICENSE.md` de vite, como comentario legal. Detrás de esa parte van las licencias de lo que Vite lleva empaquetado, y la función no lleva nada de eso. Si la parte no está, el build para;
- el juez 15 de `construccion.spec.ts`: el único trozo con `vite:preloadError` lleva entera esa parte. Rojo antes del verde («…index.astro_astro_type_script_index_0_lang.D372zeZt.js no lleva entero el aviso MIT de Vite») y tres contrapruebas en rojo;
- el NOTICES § 1.1 (su aviso viaja), la obra «Vite» en la página de créditos y el README;
- la entrada de la bitácora, cerrada en `79ff94d`, con la causa: lo que viaja se miraba por las piezas con nombre, y el código que el empaquetador escribe por su cuenta no lo nombraba nadie.

Clon limpio de `40dd211`: tipos limpios, motor 909/899, web 281/281.

### 14.5 · `dist/` antes y después

Los tres, construidos en clon con `npm run build`: el de después, en `8a1d7d8`, con todos los arreglos de código de los veinte; y el último, con el del 21, en el clon de trabajo con los ficheros de `40dd211` byte a byte (el mismo `dist/` en dos builds). Lo que viaja en cada página, medido en Chrome, en `docs/DESPLIEGUE.md` («Lo que viaja al navegador»; hasta el 11.4, en el README).

| | antes (`4b8f9f2`) | después (`8a1d7d8`) | con el 21 (`40dd211`) |
|---|---:|---:|---:|
| ficheros | 85 | 86 | 86 |
| páginas HTML | 52 | 53 | 53 |
| bytes | 2.604.718 | 2.627.894 (+23.176) | 2.629.658 (+1.764) |
| el analizador al cargar: 15 peticiones, bytes | 699.354 | 703.220 | 704.369 |
| ídem, con gzip | 249.866 | 252.083 | 252.159 |

Lo que cambia, y por qué hallazgo:

- **`creditos/index.html`, nuevo**: 14.469 bytes (2).
- **Cada una de las otras 52 páginas, 79 bytes más**: el enlace a los créditos en el pie (2).
- **El JS del analizador, de 156.330 a 158.521 bytes**: casi todo, el aviso MIT de silabea (1), 1.927 bytes; el resto, la línea de los créditos en «Ver el detalle» (2) y la guarda de los fallos (14).
- **El runtime de Rolldown, de 589 a 1.898 bytes**: su `LICENSE` (18).
- **El CSS del catálogo** (antes `pintar.*.css`, 7.391 bytes; ahora `Catalogo.*.css`, 8.377) lleva también los estilos de la página de créditos (2). **El CSS común** (`hoja.*.css`) pasa de 12.981 a 13.174: el pie con su enlace (2).
- **Las cadenas** (`textos.*.js`), de 10.435 a 10.531 bytes: las nuevas que usa el JS (2 y 8).
- **El trozo de pdfmake, de 1.093.577 a 1.093.403 bytes**: lleva `tokens.json` dentro (16), ahora sin los dos tokens (9).
- **Con el 21**: el JS del analizador, de 158.521 a 159.670 bytes (el aviso MIT de Vite), y `creditos/index.html`, de 14.469 a 15.084 (la obra «Vite»): entre los dos, los 1.764 bytes de más de `dist/`.

---

## 15 · La publicación (11.2, 06/10/2026): la variante elegida

Antonio firmó el 06/10, con la documentación del panel de Hostinger delante, la **variante A** del § 9.3 y la CSP por cabecera del § 9.4, con los cambios de abajo. Lo hace `npm run publicar`, y lo cuenta `docs/DESPLIEGUE.md` en «Despliegue» (hasta el 11.4, el README). Commits: `13674a2` (la página que no existe), `c667183` (la publicación) y `4ac5838` (los jueces de producción).

**Cómo llega `dist/` al servidor (§ 9.5).** Por una rama huérfana, `publicacion`, que lleva en su raíz el contenido de `web/dist/` y el `.htaccess`, y nada más. El panel la despliega con su app de GitHub en el directorio del subdominio, sin build. Nada del resto del repositorio llega al servidor.

**El `.htaccess`.** No va en `web/public/`, como proponía el § 9.3. Lo escribe `npm run publicar` en `dist/`, desde `web/publicacion/.htaccess.plantilla`, con la CSP del `<meta>` de las páginas.

**Lo que cambia frente a los § 9.3 y 9.4:**

- **Caché (hallazgo 5).** Los tres grupos del § 9.3, con una diferencia: los iconos y el favicon pasan de una semana a `no-cache` (firma de Antonio). Las fuentes, una semana, sin huella en el nombre. El script para si un fichero no cae en un grupo y en uno solo, o si un JS o un CSS no lleva la huella en el nombre.
- **CSP (hallazgo 4).** Por cabecera además del `<meta>`, idéntica, en todas las respuestas (`Header always set`), no solo en las `.html`. El script para si las páginas no llevan todas la misma: hoy, las 54 llevan una. Un juez de producción compara la cabecera con el `<meta>` de cada página. La política no se amplía: `frame-ancestors`, `default-src` y lo demás del § 9.4 siguen siendo decisión aparte.
- **Nuevo:**
  - `X-Content-Type-Options: nosniff`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - HSTS de un año, solo por https (`env=HTTPS`), sin `includeSubDomains` ni `preload`;
  - `ErrorDocument 404 /404.html`, con la página que no existe (`web/src/pages/404.astro`, textos de Antonio);
  - todo lo que empieza por `/.git` da 404;
  - el tipo de `.svg`, junto a los tres del § 9.3; y, desde la medida del 06/10, el de `.js`, `text/javascript` (abajo).
- **Sin reescritura.** Cada ruta es una carpeta con su `index.html`. La redirección de http a https la hace el panel («Forzar HTTPS»).
- **`mod_expires`, no.** La caché la pone `Cache-Control`, con `mod_headers`.

**Lo que no constaba, medido desde fuera el 06/10.** Con los jueces de producción (`web/jueces/produccion.spec.ts`, con `URL_PRODUCCION=https://radiografia.antonioblanquez.es`), sobre la publicación `d3ae331` (de `main` `1e19715`). Antonio la publicó desde hPanel Git en `public_html`, con el SSL activo y la redirección a https. La web llega a través del CDN de Hostinger (`server: hcdn`).

- **`FilesMatch` y `Header set Cache-Control`: CONSTA.** Cada grupo lleva el suyo: el JS y el CSS, `public, max-age=31536000, immutable`; las fuentes, `public, max-age=604800`; lo demás, `no-cache`.
- **`Header always set`: CONSTA.** La CSP, `nosniff` y `Referrer-Policy` van en todas las respuestas, también en el 404, salvo en los PNG (abajo). La CSP por cabecera es idéntica al `<meta>` en las 53 páginas y en la 404.
- **`ErrorDocument 404`: CONSTA.** `/no-existe/` y `/reglas/no-existe/x/` dan 404 con `dist/404.html`.
- **`env=HTTPS`: CONSTA** que HSTS (`max-age=31536000`) va en las respuestas por https. Por http no se puede ver: el panel redirige antes, con un 301 sin HSTS.
- **`AddType`: CONSTA el resultado** (`font/woff2`, `font/woff`, `application/manifest+json`, `image/svg+xml`; y `application/json` en los JSON). Si lo pone nuestra línea o el servidor no se distingue sin quitarla. En el de `.js`, sí: lo pone nuestra línea (abajo, la publicación `995674f`).
- **`RedirectMatch`: NO CONSTA.** Hostinger da 403 a todo lo que cuelga de `/.git/`, exista o no, y a `/.htaccess`, antes del `.htaccess` y sin sus cabeceras. Ninguna otra dirección distingue la regla de un simple «no existe». Si el despliegue deja una carpeta `.git`: sigue sin constar, y no se sirve.
- **Cabeceras que pone el servidor:** un `Expires` de una semana en el CSS, el JS, las fuentes, el SVG y el favicon. Donde va `max-age` manda `Cache-Control`; en los `no-cache`, la revalidación. Y la compresión: Brotli.
- **http a https: CONSTA.** `/`, `/reglas/` y `/creditos/` dan 301 a la misma dirección por https.

**Lo que falla en producción** (el juez 1 de producción, 25 discrepancias en 87 ficheros; los otros 302 jueces de la suite, en verde contra producción), **y lo que decidió Antonio el 06/10:**

1. **El CDN reescribe los cuatro PNG** (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png` y `apple-touch-icon.png`). En la rama son los nuestros (`icon-192.png`, 2.423 bytes). Desde el CDN:
   - a quien no pide WebP le da otro PNG, del mismo tamaño en píxeles, con los fragmentos `eXIf` y `pHYs` añadidos (2.665 bytes);
   - a Chrome le da **WebP** en la misma dirección (`content-type: image/webp`, 1.502 bytes);
   - en los dos casos, sin la CSP, `nosniff`, `Referrer-Policy` ni HSTS, y con `access-control-allow-origin: *`.

   Los píxeles que miran los jueces del icono en Chrome cuadran; los bytes y las huellas de `PROCEDENCIA.md`, no.

   **Decisión:** Antonio desactivó el CDN automático del subdominio en hPanel (Rendimiento → CDN → «Desactivar el CDN automático»; estado «Inactivo»). Según la documentación del panel, tarda hasta 24-48 h en propagarse. El juez no cambia: sigue exigiendo en los cuatro PNG los bytes de `PROCEDENCIA.md` y nuestras cabeceras.

   **Medido el 06/10 a las 15:39 (+02:00), antes de tocar nada: el CDN sigue en medio.** Todas las respuestas llevan `server: hcdn` y `x-hcdn-cache-status`, y los cuatro PNG siguen reescritos (`icon-192.png`: 2.665 bytes, o WebP de 1.502 a Chrome, frente a los 2.423 de la rama).
2. **El JS sale como `application/x-javascript`** (los cinco de `_astro/`). Es un tipo JavaScript para el navegador, y `nosniff` no lo bloquea (WHATWG MIME Sniffing, § 4.6, «JavaScript MIME type»), y la web funciona. Pero la RFC 9239 lo da por obsoleto: «current implementations should use text/javascript». El juez esperaba `text/javascript` o `application/javascript`.

   **Decisión:** `AddType text/javascript .js` en la plantilla, con la cita de la RFC 9239. Su § 2: «The most widely supported media type in use is text/javascript; all others are considered historical and obsolete aliases of text/javascript». Su § 6 pone `application/javascript` y `application/x-javascript` entre los obsoletos.
   - El juez de producción exige ahora `text/javascript` y ningún otro.
   - El de la plantilla (test 3 de `web/jueces/publicacion.spec.ts`) exige la línea.
   - Contra la publicación `d3ae331`, el de producción da rojo en los cinco JS («application/x-javascript»). El verde, al medir la próxima publicación.

Lo demás, contra producción y en verde:

- la red sin nada fuera del origen;
- ni violaciones de la CSP ni errores en la consola;
- el PDF descargado (`RadiografIA.pdf`, `%PDF-`);
- los 320 px, el tamaño de lo que se pulsa y el árbol de accesibilidad;
- la fidelidad al modelo, con el mismo `medidas-modelo.json`.

**La publicación `995674f` (de `main` `41c359f`, con el `AddType` de `.js`), medida desde fuera el 06/10 entre las 16:07 y las 16:16 (+02:00).** La suite en modo producción: 302 de 303. El único rojo es el juez 1 de producción, con 25 discrepancias, todas del CDN. **PARA:** se vuelve a medir cuando el CDN haya soltado el sitio (la documentación del panel dice 24-48 h). El juez no cambia.

- **El CDN sigue en medio.** `server: hcdn` en todo: los 87 ficheros, las tres redirecciones, la que no existe y las rutas con punto. `x-hcdn-cache-status`, por grupo:
  - el HTML, los JSON, los txt y el manifiesto: `DYNAMIC`;
  - el JS y el CSS: `MISS`, también en las variantes que el CDN guarda con `Age` (abajo);
  - las fuentes: `HIT` (8 de 9, pedidas con `br, gzip`) o `MISS`;
  - los SVG, el favicon y los PNG: `MISS`.
- **`AddType` de `.js`: CONSTA que lo pone nuestra línea.** Cada respuesta que el CDN trae del origen (`MISS`, sin `Age`, con el `Last-Modified` del despliegue nuevo, 14:02:57 GMT) llega como `text/javascript`. Antes, el servidor daba `application/x-javascript`.
- **El CDN guarda el JS viejo, una variante por `Accept-Encoding`** (`Vary: Accept-Encoding`). Las que tenía guardadas siguen con `application/x-javascript`, con un `Age` de 1.910 a 3.769 s y el `Last-Modified` de la publicación anterior (13:10:54 GMT).
  - La petición del juez, el `fetch` de Node con sus cabeceras por defecto, cae en ellas: los cinco JS, en rojo.
  - Con `gzip, deflate` o `identity`, los cinco salen ya como `text/javascript`.
  - Con `br`, que es lo que pide Chrome, solo `generar-pdf`.

  Llevan `max-age=31536000, immutable`. Cuánto los guarda el CDN NO CONSTA.
- **Los cuatro PNG, como antes.** Otro PNG (`icon-192.png`: 2.665 bytes frente a 2.423) o WebP a Chrome, sin la CSP, `nosniff`, `Referrer-Policy` ni HSTS.
- **Lo demás, en verde contra producción:**
  - las cabeceras de cada grupo y los demás tipos;
  - la CSP por cabecera, igual al `<meta>` en las 53 páginas y en la 404;
  - http a https (301) en `/`, `/reglas/` y `/creditos/`;
  - `/no-existe/` y `/reglas/no-existe/x/`, en 404 con la nuestra;
  - `/.git/HEAD`, `/.git/config`, `/.git` y `/.htaccess`, en 403;
  - la red sin nada fuera del origen, y ni violaciones de la CSP ni errores en la consola;
  - el PDF descargado;
  - los 320 px, el tamaño de lo que se pulsa, el árbol de accesibilidad y la fidelidad al modelo.

**La misma publicación `995674f`, medida desde fuera el 07/10, con el CDN de Hostinger desactivado por completo.** La suite en modo producción (`npm test` en `web/` con `URL_PRODUCCION`, desde `main` `efcc230`, que sobre `41c359f` solo cambia documentos (el README, `docs/`, el PLAN y el DISEÑO), jueces y comentarios de `web/src`: nada que viaje en `dist/`): **308 tests, 308 pasan, 0 fallan y 0 omitidos.** El juez 1 de producción, en verde: los 87 ficheros, con el contenido del `dist/` de `efcc230` byte a byte y las cabeceras de su grupo. **El PARA queda cerrado.** El juez no cambió.

- **Lo que pasó, con su hora (+02:00):**
  - 10:16, 19 h después de desactivar el CDN automático en hPanel: todo seguía con `server: hcdn`. `/icon-192.png`, 2.665 bytes y sin CSP; `/_astro/textos.BiHG9_Y9.js`, `application/x-javascript`, `HIT`, `Age` 68.375.
  - 10:22: Antonio pulsó «Vaciar caché», que está en la página principal del sitio en hPanel, no en la sección CDN. Medido a las 10:24: el JS pasa a `text/javascript` (`HIT`, `Age` 24: la copia vieja, purgada); el PNG sigue reescrito (2.665 bytes, `server: hcdn`, sin CSP).
  - 10:26: Kodee, el asistente de Hostinger, consultado por Antonio, dijo tal cual: «La configuración aún muestra optimización de imágenes activada y el CDN no está en modo de bypass». Aplicó «la desactivación completa» y confirmó que el CDN «ya no está habilitado para este subdominio».
  - 10:27, medido a mano desde Chrome (`fetch` con `cache: 'no-store'`): `/`, `/icon-192.png` y `/_astro/textos.BiHG9_Y9.js`, con `server: LiteSpeed` y sin `x-hcdn-cache-status` ni `age`.
- **Fichero a fichero, de 10:33 a 10:41:** los 87 de la rama `publicacion` responden con `server: LiteSpeed`, sin `x-hcdn-cache-status`, con el cuerpo de la rama y con la CSP, `nosniff`, `Referrer-Policy` y HSTS.
- **Los cuatro PNG vuelven a ser los nuestros**, byte a byte y con las huellas de `docs/figma/icono/PROCEDENCIA.md`: `icon-192.png`, 2.423 bytes; `icon-512.png`, 6.546; `icon-512-maskable.png`, 2.260; `apple-touch-icon.png`, 950. También con el `Accept` de Chrome: ni otro PNG ni WebP. Llevan `no-cache`, la CSP, `nosniff`, `Referrer-Policy` y HSTS.
- **Los cinco JS**, `text/javascript`, con `public, max-age=31536000, immutable`.
- **La causa**, en los términos de Kodee: el interruptor del panel (Rendimiento → CDN) dejó el CDN sin modo de bypass y con la optimización de imágenes activada. Lo que la documentación del panel daba por una propagación de 24-48 h no era propagación.

**El build.**

- El de `87c80b4` en un clon limpio es idéntico, fichero a fichero, al del clon de trabajo: 86 ficheros.
- Con la página que no existe: 87 ficheros, 54 páginas, 2.632.266 bytes; y con `eol=lf` (abajo), 2.626.823: los dos paquetes y las dos licencias, sin sus CR.
- `npm run publicar` construye dos veces y para si los dos `dist/` no son iguales.

**Los finales de línea.** El checkout de Windows deja en CRLF cuatro ficheros de texto de `dist/`: los dos paquetes y los dos `OFL.txt`. Git, con `core.autocrlf=true` (el de esta máquina), los pasaría a LF al guardarlos en la rama. El script da a git `core.autocrlf=false` y compara el árbol del commit con `dist/`, byte a byte. En el repositorio están en LF; `.gitattributes` les deja el final de línea a la máquina, al revés que a los ejemplos, los SVG y el manifiesto (`eol=lf`). Desde otro sistema saldrían con LF: el mismo contenido, otros bytes. **Firmado por Antonio el 06/10 y hecho:** `.gitattributes` les fija `eol=lf` (`paquetes/*.json` y `web/public/fuentes/*/OFL.txt`), y ya salen en LF de cualquier checkout. `git add --renormalize` no cambia nada: en el repositorio ya estaban así. Lo vigila el juez 8 de `web/jueces/publicacion.spec.ts`: desde un checkout con `core.autocrlf=true`, ningún fichero de texto de `paquetes/` ni de `web/public/` sale con CRLF. En `dist/`, solo los 13 binarios llevan el byte CR. El script sigue dando a git `core.autocrlf=false`.

---

## Anexo A · El inventario de `dist/` (build de `4b8f9f2` en clon limpio, idéntico en dos builds)

| fichero | bytes | sha256 |
|---|---:|---|
| `_astro/generar-pdf.BMivLRrr.js` | 1.093.577 | `069e3687e3ff602a762c6a873a4015cd846a0a815002cf5617c84110540b29a2` |
| `_astro/hoja.aoaSVgaj.css` | 12.981 | `3c47e74ca31c9164d9f45c71e48a9408696d7cdfed17c170f917c3744ca5d90d` |
| `_astro/index.BZwHIJMw.css` | 20.843 | `5a3217530765e1df0b3606eb327050561b6e207c6e667f491dbb24b6e891335a` |
| `_astro/index.astro_astro_type_script_index_0_lang.0uYdAJsu.js` | 156.330 | `31ed6a71c491ddcf868225c8b8b36daae2a53c37d9fd343283d916aa3166793b` |
| `_astro/index.astro_astro_type_script_index_0_lang.BIekkZLe.js` | 3.652 | `4bb552b6365e07b61b71a5f42cc172228e37b7d7f9ee062314db166725803e0e` |
| `_astro/pintar.oaO0CzOP.css` | 7.391 | `8ad8af7baf8cb93dee155f06285c0f5be138180cfa23034542263d002eb05c41` |
| `_astro/rolldown-runtime.CbXtAM7H.js` | 589 | `bbf7c5086ae414dc3f33777e3eebf16ea8631325b8bb4690d25091c03567f31a` |
| `_astro/textos.C_9vtFF3.js` | 10.435 | `9fab1fd59e195f9a5c28a31065feb4a8336e15b02dd97df971bf15c158dfa6ae` |
| `apple-touch-icon.png` | 950 | `9fa8713d3bc20c57d6fc17dad9ded495d7839f4e2e517d28e0c0127db520ad09` |
| `ejemplos/antonio.txt` | 1.777 | `6077907c352370a96e880efe2796754996df9572e2a1ccdfab09274bba6061c8` |
| `ejemplos/ia.txt` | 1.957 | `72fa548a01dbe643152916b8a9b4e15addb8e43a5601f5450a507881c3cce235` |
| `ejemplos/paquete-prueba-invalido.json` | 6.904 | `154f1d574c08429920bd39c9e7c9f340b742f394f6ef90d0f959a892804277ba` |
| `ejemplos/paquete-prueba.json` | 6.900 | `34b7b73a2e98bd62d2cd3a08bbdd8a0399f9127a737e9e781e9fa1fd689a4d07` |
| `favicon.ico` | 4.286 | `898034f7e1c7fdbc0a48c48e0e71827347440761cc6b432c90ec6fe831a1d535` |
| `fuentes/atkinson-hyperlegible-next/OFL.txt` | 4.524 | `b5b7a8bc1e0e92be9b64abd8abd92659488733aa5be8d982bc872c36dac73f08` |
| `fuentes/atkinson-hyperlegible-next/atkinson-hyperlegible-next-400.woff` | 19.948 | `b7733690f3a941340ddc8ab8cf83b25eb8274931d85dc0cfbdaeb0776a05ea28` |
| `fuentes/atkinson-hyperlegible-next/atkinson-hyperlegible-next-700.woff` | 20.772 | `560aeebc3f10a9e7568836dd4dc212a7d4afc1a68c9f162f832dd912285eda0e` |
| `fuentes/atkinson-hyperlegible-next/atkinson-hyperlegible-next.woff2` | 25.920 | `61b142d8dce2ed4a961902890097797dd410ee3bb5eb5c773327b61fb8842e23` |
| `fuentes/literata/OFL.txt` | 4.482 | `5b52638039d9f63fe82bab2ccea1cf0312d275c49e6f1cf7e36361c256b4ce92` |
| `fuentes/literata/literata-400-italica.woff` | 39.980 | `7f51b815b68e63350bf4683195f63705611a85fea14bce1d1d1d94be09d12657` |
| `fuentes/literata/literata-400-italica.woff2` | 44.212 | `07c13facde53915a4b94ecc0cbe514d31aa14aa8cc1cb824d15fcaa7d140575d` |
| `fuentes/literata/literata-400.woff` | 38.944 | `e91ebeefec4205c46336496e618cedacc30d424699f73be6d86b7f2aa1bcc5b3` |
| `fuentes/literata/literata-400.woff2` | 43.696 | `247ae9904f2b541c7c2f2b3cbb9fec3ec4ff1f38bbad256e799f3775a85e96fe` |
| `fuentes/literata/literata-600.woff` | 43.076 | `6b6315c245ef4850b1a350bebd19749e1010451acc87f01f1aca98bb09f37161` |
| `fuentes/literata/literata-600.woff2` | 46.424 | `b4b5b88df63606d3f22622109b6ba1596ad14449d8f93e821dd4dda8d5965858` |
| `icon-192.png` | 2.423 | `019801ea8a377efeb47d8eccc2e281a262dfcdecbd5890dbfea1bbadb43196ad` |
| `icon-512-maskable.png` | 2.260 | `da72c20a52cc8397a58d98583cd11c83ea842ff85df9d8fa76c9b110743a0513` |
| `icon-512.png` | 6.546 | `4aee61da624c43d3347c8e15e95dc0e10f375450e968ea3d734901067d7d2110` |
| `icon.svg` | 349 | `20c2580b9ccbde1d6b0c1bb2453632e2aacbcac2d2b6af61e8a45bd6eac9e89c` |
| `icono-c.svg` | 344 | `42bfa7d0d05c5b03637e906c69ede99c72fd3d91aec46c5037c82c6282a7dc35` |
| `index.html` | 6.496 | `2775f5db9200ae3c43fbea1955d845b5eeb5e9c7e998ba1a6e68c6f0609010de` |
| `paquetes/espanol-correcto.json` | 21.976 | `7e01033feade86aec80428c1bb9c0188f67564a3bb69b2d5a27f40e11658d74f` |
| `paquetes/radiografia.json` | 352.239 | `4eed6d71433f3c634fc43d400ad581af912a7c2049564ac6d54618c1b1a9de85` |
| `reglas/canal-encabezado-markdown/index.html` | 6.709 | `62c3f0b8af25b12f39a753d5ed959830c9d8ca5f64111d26111b6a58c684e4b2` |
| `reglas/canal-espacio-estrecho-u202f/index.html` | 6.549 | `f54334704cf3de4a8a89025fa175061f4bc27953cf79e3ae1407cd04b5e07354` |
| `reglas/canal-invisibles-unicode/index.html` | 6.985 | `0e6dbccaf2487312046e6b763f10c87b711bbacdecc8ee9475eb5a5e2e8ea0cd` |
| `reglas/canal-negrita-markdown/index.html` | 7.474 | `6ce76a15632cce64dfc06065ff884ca1409cbf99e5a9c40b793456e7debf1e56` |
| `reglas/canal-separador-o-tabla/index.html` | 6.829 | `cac4bac35f698c4c7a7fae6368d8436e36e306c8e9d1b23867645232a0fba43c` |
| `reglas/canal-vineta-con-negrita-inicial/index.html` | 6.492 | `664b0a81dda9b118576cae82770d91290d683fcd984be21ede8245c2d33cb004` |
| `reglas/disc-anecdota-en-primera-persona/index.html` | 7.595 | `29921df126f09af98382016a62bb6bf7b89ca1b70fefc18f161b99ef66266d7d` |
| `reglas/disc-atribucion-vaga/index.html` | 7.311 | `b638f5ce25f3e9180bc616f041e0f74c479f7e0293c88dec4d2f67679847e9a0` |
| `reglas/disc-cierre-de-plantilla/index.html` | 9.140 | `956cd56297b4146bd33978592b48ab8a216c81f8728374a1afc5a4dc7b1a9c95` |
| `reglas/disc-encuadre-ordinal/index.html` | 7.921 | `18e4a426589995f23d316ac3831ae3751c215533774921c9e16f3005711f59a8` |
| `reglas/disc-marcador-repetido/index.html` | 9.303 | `3ec59c31ea5fc891af7a1eec40d7607a35f61c3cf529224dd5e9ecd999044b82` |
| `reglas/disc-puffery-de-significancia/index.html` | 6.670 | `b7537faecba649a502607627efa04b682d7d1be42a70db382a352e7a280ad7ad` |
| `reglas/disc-referencia-interna-concreta/index.html` | 7.432 | `f3b175b121b6db5191a2894ec7635cff70db02baac585cb1408ee0e8d5fef5dc` |
| `reglas/disc-retos-y-futuro/index.html` | 6.656 | `17b59545f84705db921a1465078c9a1bd87534811ff53ccdf7701fcda887ad7c` |
| `reglas/disc-sin-automenciones/index.html` | 17.717 | `29831914b094e0306927d65f7b946a951de8c1ca3dc127c77f2e50b0b49e7863` |
| `reglas/disc-sin-marcadores-epistemicos/index.html` | 18.267 | `f7d228dedac1efdf83ed9c92e063c9131afa44b7f63e366540de880b2dedc728` |
| `reglas/est-diversidad-hdd/index.html` | 12.525 | `69388eb0c645b3a43ed80ea9e44a37fa87f3713e0e46635dae8f56f7e0834554` |
| `reglas/est-diversidad-mattr/index.html` | 11.611 | `eccf385a43cb159b311a23f4903d5b3d8d38843cc85d0ca09118f1c3ba15daaa` |
| `reglas/est-diversidad-mtld/index.html` | 12.348 | `a536b81321daa9779fa1ac808e2f64b305a5d53a1cc2b3ae2089b35309ca93e8` |
| `reglas/est-frases-cortas/index.html` | 15.593 | `7904bd945737e2bc6ef20a6c2cc17e37f8caffe2bfec2a6c652f8e820a8b9a03` |
| `reglas/est-legibilidad-ifsz/index.html` | 11.147 | `96c7dc9689219afe3a78293d2c71054e27182bda4b34113f8a8c49765584b871` |
| `reglas/est-nominalizacion/index.html` | 16.128 | `1ed268ad3f75ca933af2dacc9ede4788ed4d185f68d366f57b4e5535b5bf9677` |
| `reglas/est-poca-puntuacion-secundaria/index.html` | 15.788 | `67cc4f25285276b624ea41a7f80081d4a5846399f0ee326638a2fe30f74abbf5` |
| `reglas/est-poca-puntuacion/index.html` | 16.740 | `4dd8cc72ab7c24c155c9ca8717758bf797e74ce49dac050791385dd241c8f4d9` |
| `reglas/est-pocas-comas/index.html` | 15.355 | `5ec590ddb9e51eb14f8076a9371f311519ff4ecbffc6ed74c1a5e68c24e315e3` |
| `reglas/est-pronombres-anaforicos/index.html` | 9.932 | `3f6c751a9452a507f6279c38389f833e5e695bb4ed8e7cc8ab8c29126276a862` |
| `reglas/est-repeticion-de-secuencias/index.html` | 15.208 | `bbfc51a909126b9e2e1b134bc79f9add92d9138c6aec2e30748d50ea1ec1be6c` |
| `reglas/est-ritmo-uniforme/index.html` | 16.819 | `efe47813177ec78c40f7dcee987ec315da36ea30a916510d14245f766091d39b` |
| `reglas/est-ttr/index.html` | 11.577 | `fe911412721ab9c72503a5e9c96a76fdc8f359d57bdfb0e8b9aa886a7a6867d5` |
| `reglas/gram-pasiva-perifrastica/index.html` | 7.830 | `bbfa85b52c9debb7a07dcb3950f695dbc732c5cce0b2149c96fb67cd6ba2a350` |
| `reglas/gram-posesivo-por-articulo/index.html` | 7.993 | `7786263b5d7b8887f121a13492a35dd701fbcabbba9891cf972c1bbeee793c05` |
| `reglas/index.html` | 74.694 | `02c39abfea7a94a9630bb20fb3906b2b5dd7e0c5fb8792fe73c254e3d12695d3` |
| `reglas/lex-conector-de-apertura/index.html` | 7.733 | `ff0553323ed31f4914f338df65246dc0cf002cb133c16e3cfa3fcb0d7bbb82eb` |
| `reglas/lex-es-importante-mas-verbo/index.html` | 6.348 | `d51a305085775e586286e06e964937ea12e3d7772e5a97a2d078af9821d8742f` |
| `reglas/lex-frases-de-chatbot/index.html` | 6.428 | `f31be885a2aac90bd0aa80b136e2c723688fefa5017e3b9f28fbf27d13025ecf` |
| `reglas/lex-imborrable-multidisciplinario-impecable/index.html` | 6.942 | `3814e09b95e99154ceb7938a8e965785c911c84d36479b782af9437e2716b51d` |
| `reglas/lex-importancia/index.html` | 6.708 | `67261e3f06d6abe57a3d5d85f963c4f36df3e1f4b5c64834392fb4d7919bb0ea` |
| `reglas/lex-innovador/index.html` | 6.300 | `5c13d983f93095a3b9581cc7f5989fba09829d0660a0310d26d4203a96be331c` |
| `reglas/lex-no-solo-sino/index.html` | 6.598 | `8b989796e6e643e6f4e0eebdc01d5cc6a0895802ce8ea00cc83aff5c4c09029a` |
| `reglas/lex-traslados-del-ingles/index.html` | 8.646 | `15477062b1392700b00b86ea7b8c112c34f10dd929bd1b71dfb9f4865e8f911b` |
| `reglas/lex-trigramas-sobreusados/index.html` | 6.379 | `cdaa8939b335a016a1169b15b79bcaeddc4f2d8042e507a96987e8c9ccf6ee4a` |
| `reglas/lex-verbos-corporativos/index.html` | 8.271 | `f7183b67ad5afdc0888aacb316780ae98fe0e6fa2a7da323cd45c9adb59a6e19` |
| `reglas/lex-verbos-de-enfasis/index.html` | 7.970 | `6806d4fdc35005ee95b77db31e962df84af85f9dac664377d16fcc77cd335462` |
| `reglas/orto-cifras-a-la-inglesa/index.html` | 7.599 | `77aa310d59ebc3365aa5b612f87443d35f5506dafab41472e28a207b8bd9d07b` |
| `reglas/orto-mayuscula-en-cada-palabra-de-titulo/index.html` | 7.680 | `054128275e6bd427007493bb0eab635a647b515ba41aa50de9108ec098838de4` |
| `reglas/orto-mes-o-dia-con-mayuscula/index.html` | 6.969 | `cb356c82b2f936ff2496f3494689e9f217196f5b6a0c99583d9aeb433fc6eb45` |
| `reglas/orto-moneda-antepuesta/index.html` | 6.588 | `2105325c4224e950277b898d35bc0dd36032081a85ccd10f0340c69c1180f59d` |
| `reglas/orto-punto-dentro-de-comillas/index.html` | 6.323 | `73c50c0fffd1912c04ce638821fbf0bc573fea33304cb32c945bd7660a249429` |
| `reglas/pf-raya-densidad/index.html` | 9.296 | `ca38b620c578a9abcc94589254882729c614821d4121d42424e39f8e327bf5e4` |
| `reglas/pf-raya-espaciada/index.html` | 7.984 | `cdae32ae4c100d96ef1665624daff6e711b6d6e324112d435373a03b7399c10f` |
| `reglas/sint-gerundio-adjunto-final/index.html` | 9.914 | `96a0e732358a8670625dd5262c96709d6929294a93de940a74fa3d18291a862a` |
| `site.webmanifest` | 521 | `94e5f6076ec168078f0f984936645527322e0796e16f29cb282f901f8eb5fcda` |
