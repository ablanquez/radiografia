# Avisos de terceros

La licencia Apache 2.0 cubre **el código y los paquetes de reglas** de RadiografIA. **No cubre
lo ajeno**, que conserva sus propias condiciones. Aquí está, una por una, con lo que sabemos y lo
que no.

> ℹ️ **Estado a 05/10/2026.** Lo ajeno es software, datos y dos fuentes tipográficas. Software (§ 1): **ocho**
> dependencias declaradas en los dos workspaces, [`motor/package.json`](motor/package.json) y
> [`web/package.json`](web/package.json) —tres de ejecución y cinco de desarrollo—, el árbol que
> arrastran, **un fichero de código ajeno incorporado** al repositorio (§ 1.5) y lo que va dentro de
> pdfmake, que viaja al navegador al pulsar «Descargar informe» (§ 1.8). Datos (§ 2):
> las carpetas de [`data/`](data/), **aparte del código Apache 2.0**, cada una con su licencia
> al lado. Fuentes (§ 2.4): Literata y Atkinson Hyperlegible Next, OFL 1.1, autoalojadas en
> [`web/public/fuentes/`](web/public/fuentes/) con su `OFL.txt` al lado.
>
> Las **fuentes de cada regla** (estudios, guías, corpus) no van aquí: se citan en la ficha de
> la regla y en el catálogo. Lo propio (logo, marca) irá en `PROCEDENCIA.md`.
>
> ⭐ **Las cifras y las tablas de este documento las vigila un juez**:
> [`motor/src/notices.spec.ts`](motor/src/notices.spec.ts) las compara con los `package.json` de
> los workspaces, el `package-lock.json` de la raíz, el código incorporado y las carpetas de
> `data/`. Si entra o sale
> una dependencia, un fichero ajeno o una carpeta de datos y nadie toca este fichero, la suite
> del motor se pone roja. Es la herencia de Desplázame, donde la cifra de la cabecera se quedó
> vieja tres veces seguidas antes de que alguien escribiera el guion que cuenta.

---

## 1 · Software

### 1.1 · Dependencias de ejecución

Las que van en `dependencies` de [`motor/package.json`](motor/package.json) y de
[`web/package.json`](web/package.json). `web` declara también `@radiografia/motor`, que es el
otro workspace y no es de terceros.

| Paquete | Versión | Licencia | Para qué |
|---|---|---|---|
| `ajv` | 8.20.0 | MIT | (motor) El validador de JSON Schema: comprueba cada paquete de reglas contra `motor/esquema/` (clase `Ajv2020`, draft 2020-12), en vivo en Node y, en build, genera el validador standalone |
| `astro` | 7.3.5 | MIT | (web) El marco de la web estática: compila `web/src/pages/` a HTML y, con Vite 8 y Rolldown, empaqueta el script de la página. Fijada exacta (encargo 6.2). Sus binarios, en § 1.4 |
| `pdfmake` | 0.3.11 | MIT | (web) Genera en el navegador el PDF de «Descargar informe» (encargo 9.3, decisión de Antonio del 05/10), con pdfkit y fontkit dentro. Fijada exacta. Lo que lleva dentro, en § 1.8 |

> **Lo que viajará al navegador — y lo que no.** `ajv` entero **no** viajará: el navegador
> llevará `motor/dist/validador.standalone.js`, la función de validación que
> `motor/src/generar-validador.ts` genera con Ajv y empaqueta con esbuild (encargo 3.2; se genera
> en build y no se versiona). Dentro de ese fichero, lo ajeno es **una función de Ajv**,
> `ajv/dist/runtime/ucs2length.js` (MIT, © Evgeny Poberezkin), y el código que Ajv genera a
> partir de nuestros esquemas. `fast-uri` **no** está dentro (comprobado el 29/09: ninguna
> aparición en el fichero empaquetado).
>
> **El aviso MIT de Ajv viaja dentro de ese fichero** (encargo 6.1). `generar-validador.ts` le pone
> en cabecera el `LICENSE` de `ajv` entero, copiado de `node_modules/ajv/LICENSE` al generar, en un
> comentario `/*! … */` (el `banner` de esbuild). Lo vigila el juez 6 de
> [`motor/src/standalone.spec.ts`](motor/src/standalone.spec.ts). La entrada del navegador,
> [`motor/src/navegador.ts`](motor/src/navegador.ts), importa el validador. **El build real de
> la web es el de Astro** (Vite 8 con Rolldown), y Vite quita los comentarios legales al
> minificar salvo que se le pida conservarlos: [`web/astro.config.mjs`](web/astro.config.mjs) se
> lo pide (`comments.legal`). Que el JS de `web/dist/` lleve el `LICENSE` de `ajv` entero lo
> vigila el juez 6 de [`web/jueces/construccion.spec.ts`](web/jueces/construccion.spec.ts)
> (docs/BITACORA.md, 2026-10-02). Empaquetar con esbuild, como hace
> [`motor/src/navegador.spec.ts`](motor/src/navegador.spec.ts), no equivale a ese build.
>
> **De `astro` no viaja nada al navegador.** Genera el HTML en build. El JS de la página es el
> motor, el validador y los ayudantes que escribe el empaquetador: en el build de la web
> (02/10/2026), el JS no lleva código de Vite ni de Astro.
>
> **`pdfmake` viaja al navegador, pero no con la página** (encargo 9.3). Su build para navegador,
> `node_modules/pdfmake/build/pdfmake.js`, va en un trozo de JS aparte que la página carga solo al
> pulsar «Descargar informe» (`web/src/pantalla/generar-pdf.ts`, con `import()`): unos 1,09 MB,
> unos 359 KB con gzip (build del 05/10/2026). Ese fichero lleva dentro, ya empaquetados por pdfmake,
> **setenta y seis piezas** de terceros: pdfkit, fontkit, los polyfills que añadió su build y el
> arranque de webpack (la lista, en § 1.8). **Su aviso viaja dentro del trozo**, como el de Ajv:
> [`web/astro.config.mjs`](web/astro.config.mjs) le pone en cabecera, como comentario legal
> `/*! … */`, el texto de la licencia de cada pieza
> ([`web/terceros/pdfmake/avisos.txt`](web/terceros/pdfmake/avisos.txt), que escribe a mano
> `web/scripts/avisos-de-pdfmake.ts`); lo vigila el juez 10 de
> [`web/jueces/construccion.spec.ts`](web/jueces/construccion.spec.ts). El build de pdfmake solo
> trae cinco de esos avisos, en una línea cada uno.
>
> ⚠️ **Aquí estuvo `es-compromise` 0.3.1** (MIT, etiquetado gramatical), del 29/09 hasta el cierre
> del encargo 3.3: se midió contra UD Spanish-AnCora, no llegó al umbral y se retiró con su capa
> y su lista de pronombres. La medida, en
> [`docs/investigacion/pos-medida.md`](docs/investigacion/pos-medida.md).

### 1.2 · Dependencias de desarrollo

No se distribuyen: no viajan al navegador. Se listan igualmente, una a una.

| Paquete | Versión | Licencia | Para qué |
|---|---|---|---|
| `typescript` | 5.9.3 | Apache-2.0 | (motor y web) `tsc --noEmit`: revisa los tipos. No compila nada; Node ejecuta el `.ts` borrando tipos |
| `@types/node` | 24.19.1 | MIT | (motor y web) Los tipos de Node 24 (`node:test`, `node:fs`) para que `tsc` pueda revisar |
| `@tsconfig/node24` | 24.0.5 | MIT | (motor) La base de `tsconfig` para Node 24 |
| `@tsconfig/node-ts` | 23.6.4 | MIT | (motor) La base de `tsconfig` para ejecutar TypeScript con borrado de tipos |
| `esbuild` | 0.28.2 | MIT | (motor) Empaqueta el validador standalone en un solo fichero sin dependencias (`npm run generar`). Su binario, en § 1.4 |

`@types/node` pasó de 24.19.0 a 24.19.1 el 02/10/2026, al regenerar el lock en la raíz (encargo
6.2): es un parche de tipos dentro del rango `^24.19.0` que declaran los dos workspaces.

**Mirado una a una:** el `LICENSE` de cada una de las ocho declaradas, abierto en
`node_modules/`, dice lo mismo que su campo `license`: MIT (Evgeny Poberezkin) en `ajv`; Apache
License 2.0 en `typescript`; MIT (Microsoft Corporation) en `@types/node` y en las dos bases de
`@tsconfig`; MIT (Evan Wallace) en el `LICENSE.md` de `esbuild` (29/09/2026); MIT (Fred K.
Schott) en `astro` (02/10/2026); MIT (bpampuch, 2014-2015, y liborm85, 2016-2026) en `pdfmake`
(05/10/2026).

### 1.3 · El árbol transitivo — existe, y no se lista aquí

Las ocho declaradas arrastran **trescientas once** dependencias transitivas en el lock. No se
enumeran una a una aquí: la lista que manda es [`package-lock.json`](package-lock.json), el de la
raíz, versionado precisamente para eso (desde el encargo 6.2 hay uno solo, para los dos
workspaces). Cada entrada trae su versión, su origen y su licencia. No cuentan la raíz, las
carpetas de los workspaces ni sus enlaces en `node_modules/`.

⚠️ **De esas trescientas once, en esta máquina se instalan doscientas once.** El resto son
opcionales que npm **solo instala en el sistema que les toca**:

- **91 binarios de otros sistemas**: 25 de esbuild, 14 de Rolldown, 13 de sharp y 10 de su
  libvips, 10 de lightningcss, 9 del compilador de Astro, 8 de satteri,
  `@img/sharp-webcontainers-wasm32` y `fsevents` (solo macOS). Los de Windows de 64 bits, en
  § 1.4.
- **9 piezas de WebAssembly de reserva** (`@emnapi/*`, `@napi-rs/wasm-runtime`,
  `@tybys/wasm-util` y `@img/sharp-wasm32`), para los sistemas sin binario nativo. `tslib`, que
  hasta el 9.3 era una de ellas, ahora se instala: la pide `@swc/helpers`, que llega con fontkit
  (pdfmake).

Con pdfmake (encargo 9.3) entraron en el lock veintiuna (`pdfmake` es declarada y no cuenta):
`pdfkit`, `fontkit`, `linebreak`, `xmldoc`, `restructure`, `unicode-properties` (con su copia de
`base64-js`), `unicode-trie` (con su copia de `pako`), `brotli` (con otra de `base64-js`), `dfa`,
`clone`, `png-js`, `js-md5`, `pako`, `base64-js`, `browserify-zlib`, `@noble/hashes`,
`@noble/ciphers` y `@swc/helpers`. Otras que usa (`sax`, `tslib`, `tiny-inflate`,
`fast-deep-equal`) ya estaban en el árbol.

`npm ls --all` enseña los que faltan como `UNMET OPTIONAL DEPENDENCY`, y es lo esperado.

```bash
npm ls --depth=0 --workspaces   # las declaradas, por workspace (en la raíz)
npm ls --all                    # el árbol entero
```

**El reparto de licencias del árbol transitivo, leído del `package-lock.json` de la raíz el
05/10/2026:**

| Licencia | Paquetes |
|---|---|
| MIT | 239 |
| Apache-2.0 | 17 |
| MPL-2.0 | 12 |
| LGPL-3.0-or-later | 10 |
| ISC | 8 |
| BSD-2-Clause | 8 |
| BSD-3-Clause | 4 |
| Apache-2.0 AND LGPL-3.0-or-later | 3 |
| BlueOak-1.0.0 | 3 |
| CC0-1.0 | 2 |
| Apache-2.0 AND LGPL-3.0-or-later AND MIT | 1 |
| Python-2.0 | 1 |
| 0BSD | 1 |
| (MIT AND Zlib) | 1 |
| sin campo `license` (`png-js`: su `LICENSE` es MIT) | 1 |
| **Total** | **311** |

⚠️ **Dos licencias que no son permisivas, y por qué no obligan aquí.** Las dos llegan con
`astro` y son **herramientas de build: no se distribuyen ni viajan al navegador** (el JS de la
página no lleva código suyo, § 1.1):

- **LGPL-3.0-or-later — `sharp`** (Apache-2.0), dependencia opcional de `astro` para tratar
  imágenes. Sus binarios llevan libvips y sus bibliotecas: los diez `@img/sharp-libvips-*` (LGPL),
  los `@img/sharp-win32-*` (Apache-2.0 AND LGPL) y `@img/sharp-wasm32`. Aquí solo se instala
  `@img/sharp-win32-x64` (§ 1.4). La web no trata imágenes.
- **MPL-2.0 — `lightningcss`**, de Vite, que analiza y minifica el CSS, y sus once binarios. Aquí
  se instalan `lightningcss` y `lightningcss-win32-x64-msvc` (§ 1.4).

### 1.4 · Los binarios nativos

Seis herramientas del árbol son programas nativos: el paquete npm es un envoltorio y el binario
llega en un paquete aparte, según el sistema. En esta máquina (Windows de 64 bits) se instalan
seis, todos de **herramientas de build: no se distribuyen ni viajan al navegador**.

| Paquete | Versión | Licencia | Qué es | Texto de la licencia en el paquete |
|---|---|---|---|---|
| `@esbuild/win32-x64` | 0.28.2 | MIT | `esbuild.exe`, el de `esbuild` (§ 1.2) | **NO CONSTA** |
| `@rolldown/binding-win32-x64-msvc` | 1.2.12 | MIT | El empaquetador de Vite 8 (`rolldown-binding.win32-x64-msvc.node`) | **NO CONSTA** |
| `@astrojs/compiler-binding-win32-x64-msvc` | 0.5.1 | MIT | El compilador de los `.astro` (`@astrojs/compiler-rs`) | **NO CONSTA** |
| `@bruits/satteri-win32-x64-msvc` | 0.10.5 | MIT | El procesador de Markdown de Astro (`@astrojs/markdown-satteri`) | **NO CONSTA** |
| `lightningcss-win32-x64-msvc` | 1.33.0 | MPL-2.0 | El analizador y minificador de CSS de Vite (`lightningcss`) | `LICENSE` (MPL 2.0) |
| `@img/sharp-win32-x64` | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | `sharp` para Windows, con `lib/libvips-42.dll` | `LICENSE` (Apache 2.0); el de la LGPL, **NO CONSTA** |

- **Cuatro no traen fichero de licencia.** Solo llevan `README.md`, el binario y `package.json`,
  donde declaran `"license": "MIT"` y el repositorio de su herramienta (`evanw/esbuild`,
  `rolldown/rolldown`, `withastro/compiler-rs`, `bruits/satteri`). El de esbuild remite al
  `LICENSE.md` MIT de § 1.2. El texto de la licencia dentro de cada paquete: **NO CONSTA**.
- **`@img/sharp-win32-x64`** trae el `LICENSE` de Apache 2.0 de sharp. Su `README.md` lista las
  bibliotecas que van dentro de `libvips-42.dll` y su licencia, varias LGPLv3 (fribidi, glib,
  libexif, libheif, librsvg…). El texto de la LGPL-3.0 dentro del paquete: **NO CONSTA**.
- **npm 11 no ejecutó el `postinstall` de `esbuild`** (`node install.js`): lo bloquea hasta que
  alguien lo apruebe (`npm warn allow-scripts … esbuild@0.28.2 (postinstall: node install.js)`).
  No se ha aprobado (decisión de Antonio, 3.2; confirmada en la parada 1 del 6.2: la plantilla
  `minimal` de Astro lo aprueba con `"allowScripts"`, y aquí no se copia). `esbuild` funciona sin
  él: `npm run generar`, los jueces del standalone, `astro dev` y `astro build` lo ejecutan.

### 1.5 · Código de terceros incorporado

Código ajeno **copiado al repositorio**, no instalado por npm. Va sin modificar, con su aviso de
licencia íntegro en cabecera. Las huellas se calculan sobre el texto con finales de línea LF
(git los reescribe al sacar el fichero en Windows) y las vigila `motor/src/notices.spec.ts`:
que el fichero existe, que empieza por su aviso, que su sha256 es el de esta tabla y que, quitada
la cabecera, el resto es el original.

| Fichero | Obra | Titular | Licencia | sha256 del fichero | sha256 del original |
|---|---|---|---|---|---|
| `motor/src/terceros/silabea.cjs` | silabea 1.0.0, `index.js` (commit `72251f7`, igual al del paquete npm) | Nicolás Cofré Méndez (silabajs) y Javier Arce (silabea) | MIT | `f7d2c68f157d9fec2e52a991a22b3e711d538f2fc2e8cac9e1c98c932ef7f3bc` | `64fc02c009a903917ad6264ab5fe06f41fbd49dea44f398ac2014183b84fe28c` |

- **Por qué copiado:** el paquete npm declara `mocha` y `chai` como dependencias de ejecución,
  sin usarlas (su `index.js` no hace ningún `require`), y arrastraban **6 vulnerabilidades, 3
  críticas** (`npm audit`, 29/09). Decisión de Antonio en la parada del 3.3. Desde entonces,
  `npm audit`: 0.
- **Es `.cjs`, no `.js`:** el original es CommonJS (`module.exports = silabaJS`) y `motor/` es
  `"type": "module"`; con `.js` no cargaría sin tocar el código.
- **Medido: 57 de 60** palabras silabeadas como la RAE (`motor/src/silabas.spec.ts`, fixture
  `motor/fixtures/referencia/silabas-referencia.json`). Falla en los prefijos `sub-`
  (`subrayar`, `sublunar`) y en `tungsteno`.
- Empaquetado para navegador sin minificar: **16.215 bytes** (esbuild, 29/09, antes de copiarlo).
- **Su aviso viaja en el JS del analizador** (11.1, hallazgo 1 del censo pre-despliegue). La
  cabecera es un comentario `/*`, que el minificado de Vite quita: hasta el 06/10, el código de
  silabea viajaba sin su aviso. Al empaquetar, [`web/astro.config.mjs`](web/astro.config.mjs)
  (`avisoDeSilabea`) la convierte en comentario legal `/*!`, sin tocar el fichero, y
  `comments.legal` la conserva. Lo vigila el juez 11 de
  [`web/jueces/construccion.spec.ts`](web/jueces/construccion.spec.ts).

### 1.6 · Las que no son MIT

| Paquete | Licencia | Qué tiene de distinto |
|---|---|---|
| `fast-uri` 3.1.8 (la trae `ajv`) | **BSD-3-Clause** | Permisiva. Pide conservar su aviso de copyright y su lista de condiciones al redistribuir, también en binario. Y prohíbe usar el nombre de sus autores para promocionar lo derivado. Hoy no se redistribuye: no está dentro del validador empaquetado (§ 1.1) |
| `sax` (dentro de pdfmake, § 1.8) | **BlueOak-1.0.0** | Permisiva (Blue Oak Model License 1.0.0). Pide que quien la reciba tenga el texto de la licencia o su dirección. Va dentro del trozo de pdfmake con su texto entero |
| `@swc/helpers` (dentro de pdfmake, § 1.8) | **Apache-2.0** | Permisiva, con concesión de patentes. Pide dar la licencia y un fichero NOTICE si lo trae: no lo trae. Va dentro del trozo de pdfmake con su texto entero |
| `pako` (dentro de pdfmake, § 1.8) | **(MIT AND Zlib)** | Las dos permisivas. La Zlib pide no tergiversar el origen y marcar las versiones modificadas. Va con su texto entero |
| `ieee754` (dentro de pdfmake, § 1.8) | **BSD-3-Clause** | Como `fast-uri`: conservar el aviso y las condiciones al redistribuir, y no usar el nombre de sus autores. Va con su texto entero |
| `inherits` (dentro de pdfmake, § 1.8) | **ISC** | Permisiva, equivalente a la MIT. Va con su texto entero |
| `tslib` (dentro de pdfmake, § 1.8) | **0BSD** | Permisiva, sin condición de aviso. Va con su texto entero |
| `qr.js` (copiado en pdfmake, `src/qrEnc.js`) | **Dominio público; CC0 donde no se reconozca** | Sin condiciones. Va con su cabecera |
| `png-js` (dentro de pdfmake, § 1.8) | **sin campo `license`**; su `LICENSE`, MIT | El campo falta en su `package.json`; su fichero dice «MIT License Copyright (c) 2017 Devon Govett». Va con su texto entero |

### 1.7 · Resumen de compatibilidad

**Las ocho declaradas son MIT o Apache-2.0**, y el código incorporado, MIT: permisivas, sin
copyleft, compatibles con la Apache 2.0 de este proyecto sin condición añadida. Lo que va dentro
de pdfmake (§ 1.8) es MIT salvo lo de § 1.6: BlueOak, Apache-2.0, Zlib, BSD-3-Clause, ISC, 0BSD
y dominio público, todas permisivas, y todas viajan con su texto. El árbol entero, en § 1.3.
Nada bloquea.

> **Y lo que este documento no garantiza:** el reparto de § 1.3 sale del campo `license` que
> cada paquete declara en el `package-lock.json`. **Las ocho declaradas sí se han abierto una a
> una.** De las transitivas instaladas se miró la primera línea de cada `LICENSE` el 29/09 y
> coincide con su campo; `@esbuild/win32-x64` no trae `LICENSE` (§ 1.4); de los veinticinco
> binarios de esbuild que no se instalan aquí solo consta lo que dice el lock. El texto entero de
> cada una **NO CONSTA** como leído.


### 1.8 · Lo que va dentro del trozo de pdfmake

El PDF de «Descargar informe» (encargo 9.3) lo genera en el navegador `pdfmake` (§ 1.1) con
`node_modules/pdfmake/build/pdfmake.js`, su build para navegador, que ya lleva dentro, empaquetado
por webpack, todo lo que necesita. Va en un trozo de JS aparte, que se carga al pulsar el botón.
Qué piezas lleva sale del mapa de fuentes de ese fichero (`build/pdfmake.js.map`): **setenta y
seis**, una fila por pieza. Las escribe `web/scripts/avisos-de-pdfmake.ts` en
[`web/terceros/pdfmake/paquetes.json`](web/terceros/pdfmake/paquetes.json), con el texto de la
licencia de cada una en [`web/terceros/pdfmake/avisos.txt`](web/terceros/pdfmake/avisos.txt), que
viaja entero en cabecera del trozo (§ 1.1). Que esta tabla, `paquetes.json`, `avisos.txt` y el
trozo de `dist/` digan lo mismo lo vigila el juez 10 de
[`web/jueces/construccion.spec.ts`](web/jueces/construccion.spec.ts).

- **La versión que va de verdad dentro NO CONSTA.** pdfmake no publica su lockfile: ni el paquete
  lo trae ni su repositorio en la etiqueta 0.3.11 (`raw.githubusercontent.com/bpampuch/pdfmake/0.3.11/package-lock.json`:
  404, el 05/10/2026). La versión de la tabla es la del árbol que instala RadiografIA, si la pieza
  está en él, o la última publicada en npm el 05/10/2026, si no (los polyfills que añadió el build
  de pdfmake); el texto de la licencia es el de esa versión.
- **Tres no traen texto de licencia**: `brotli`, `dfa` y `fontkit`, las tres de Devon Govett.
  Su `package.json` dice MIT, y ni el paquete ni su repositorio traen el fichero (comprobado el
  05/10/2026: 404 en `LICENSE`, `LICENSE.md` y `license`). En `avisos.txt` va eso, con su autor.
  El de `base64-js` 0.0.8, que el paquete tampoco trae, sale de su repositorio.
- **Lo que no viene de un paquete**: el código de pdfmake (MIT), con dos piezas ajenas copiadas en
  él, svg-to-pdfkit (MIT, con su `LICENSE` en `src/3rd-party/`) y qr.js (en su cabecera:
  dominio público y, donde no se reconozca, CC0); y el arranque de webpack (MIT).
- **`@parcel/node-resolver-core`** es un fichero vacío (`lib/_empty.js`, «"use strict";») que
  linebreak lleva en su build.

| Pieza | Versión | Licencia | De dónde, la versión | El texto |
|---|---|---|---|---|
| `pdfmake` | 0.3.11 | MIT | la de pdfmake | `LICENSE` |
| `@noble/ciphers` | 1.3.0 | MIT | la del árbol instalado | `LICENSE` |
| `@noble/hashes` | 1.8.0 | MIT | la del árbol instalado | `LICENSE` |
| `@parcel/node-resolver-core` | 3.7.4 | MIT | la última de npm (05/10) | `LICENSE` |
| `@swc/helpers` | 0.5.23 | Apache-2.0 | la del árbol instalado | `LICENSE` |
| `assert` | 2.1.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `available-typed-arrays` | 1.0.7 | MIT | la última de npm (05/10) | `LICENSE` |
| `base64-js` | 0.0.8 | MIT | la del árbol instalado | el LICENSE de su repositorio (el paquete no lo trae) |
| `brotli` | 1.3.3 | MIT | la del árbol instalado | sin texto de licencia (véase abajo) |
| `browserify-zlib` | 0.2.0 | MIT | la del árbol instalado | `LICENSE` |
| `buffer` | 6.0.3 | MIT | la última de npm (05/10) | `LICENSE` |
| `call-bind` | 1.0.9 | MIT | la última de npm (05/10) | `LICENSE` |
| `call-bind-apply-helpers` | 1.0.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `call-bound` | 1.0.4 | MIT | la última de npm (05/10) | `LICENSE` |
| `clone` | 2.1.2 | MIT | la del árbol instalado | `LICENSE` |
| `core-js` | 3.50.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `define-data-property` | 1.1.4 | MIT | la última de npm (05/10) | `LICENSE` |
| `define-properties` | 1.2.1 | MIT | la última de npm (05/10) | `LICENSE` |
| `dfa` | 1.2.0 | MIT | la del árbol instalado | sin texto de licencia (véase abajo) |
| `dunder-proto` | 1.0.1 | MIT | la última de npm (05/10) | `LICENSE` |
| `es-define-property` | 1.0.1 | MIT | la última de npm (05/10) | `LICENSE` |
| `es-errors` | 1.3.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `es-object-atoms` | 1.1.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `events` | 3.3.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `expose-loader` | 5.0.1 | MIT | la última de npm (05/10) | `LICENSE` |
| `fast-deep-equal` | 3.1.3 | MIT | la del árbol instalado | `LICENSE` |
| `file-saver` | 2.0.5 | MIT | la última de npm (05/10) | `LICENSE.md` |
| `fontkit` | 2.0.4 | MIT | la del árbol instalado | sin texto de licencia (véase abajo) |
| `for-each` | 0.3.5 | MIT | la última de npm (05/10) | `LICENSE` |
| `function-bind` | 1.1.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `generator-function` | 2.0.1 | MIT | la última de npm (05/10) | `LICENSE.md` |
| `get-intrinsic` | 1.3.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `get-proto` | 1.0.1 | MIT | la última de npm (05/10) | `LICENSE` |
| `gopd` | 1.2.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `has-property-descriptors` | 1.0.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `has-symbols` | 1.1.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `has-tostringtag` | 1.0.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `hasown` | 2.0.4 | MIT | la última de npm (05/10) | `LICENSE` |
| `ieee754` | 1.2.1 | BSD-3-Clause | la última de npm (05/10) | `LICENSE` |
| `inherits` | 2.0.4 | ISC | la última de npm (05/10) | `LICENSE` |
| `is-arguments` | 1.2.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `is-callable` | 1.2.7 | MIT | la última de npm (05/10) | `LICENSE` |
| `is-generator-function` | 1.1.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `is-nan` | 1.3.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `is-regex` | 1.2.1 | MIT | la última de npm (05/10) | `LICENSE` |
| `is-typed-array` | 1.1.15 | MIT | la última de npm (05/10) | `LICENSE` |
| `js-md5` | 0.8.3 | MIT | la del árbol instalado | `LICENSE.txt` |
| `linebreak` | 1.1.0 | MIT | la del árbol instalado | `LICENSE` |
| `math-intrinsics` | 1.1.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `object-is` | 1.1.6 | MIT | la última de npm (05/10) | `LICENSE` |
| `object-keys` | 1.1.1 | MIT | la última de npm (05/10) | `LICENSE` |
| `object.assign` | 4.1.7 | MIT | la última de npm (05/10) | `LICENSE` |
| `pako` | 1.0.11 | (MIT AND Zlib) | la del árbol instalado | `LICENSE` |
| `pdfkit` | 0.19.1 | MIT | la del árbol instalado | `LICENSE` |
| `png-js` | 1.1.0 | NO CONSTA en package.json; LICENSE: MIT License | la del árbol instalado | `LICENSE` |
| `possible-typed-array-names` | 1.1.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `process` | 0.11.10 | MIT | la última de npm (05/10) | `LICENSE` |
| `readable-stream` | 4.7.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `restructure` | 3.0.2 | MIT | la del árbol instalado | `LICENSE` |
| `safe-buffer` | 5.2.1 | MIT | la última de npm (05/10) | `LICENSE` |
| `safe-regex-test` | 1.1.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `sax` | 1.6.1 | BlueOak-1.0.0 | la del árbol instalado | `LICENSE.md` |
| `set-function-length` | 1.2.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `stream-browserify` | 3.0.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `string_decoder` | 1.3.0 | MIT | la última de npm (05/10) | `LICENSE` |
| `tiny-inflate` | 1.0.3 | MIT | la del árbol instalado | `LICENSE` |
| `tslib` | 2.8.1 | 0BSD | la del árbol instalado | `LICENSE.txt` |
| `unicode-properties` | 1.4.1 | MIT | la del árbol instalado | `LICENSE` |
| `unicode-trie` | 2.0.0 | MIT | la del árbol instalado | `LICENSE` |
| `util` | 0.12.5 | MIT | la última de npm (05/10) | `LICENSE` |
| `util-deprecate` | 1.0.2 | MIT | la última de npm (05/10) | `LICENSE` |
| `which-typed-array` | 1.1.24 | MIT | la última de npm (05/10) | `LICENSE` |
| `xmldoc` | 2.0.3 | MIT | la del árbol instalado | `LICENSE` |
| `svg-to-pdfkit (copiado en pdfmake, src/3rd-party)` | 0.3.11 | MIT | la de pdfmake | `src/3rd-party/svg-to-pdfkit/LICENSE` |
| `qr.js (copiado en pdfmake, src/qrEnc.js)` | 0.3.11 | dominio público; CC0 donde no se reconozca | la de pdfmake | `src/qrEnc.js (cabecera)` |
| `webpack (su arranque: webpack/bootstrap y webpack/runtime)` | 5.111.1 | MIT | la última de npm (05/10) | `LICENSE` |

---

## 2 · Datos de terceros

Viven en [`data/`](data/), **aparte del código Apache 2.0**: una carpeta por conjunto, y en cada
una su `LICENSE-*.md` con la atribución que exige su licencia, el enlace canónico y qué se
cambió. Aquí va la ficha de cada carpeta; el detalle está en su `LICENSE-*.md`. Ni una carpeta
sin ficha ni una ficha sin carpeta: lo vigila `motor/src/notices.spec.ts`. Las fuentes (§ 2.4)
no viven en `data/` porque las sirve la web: su tabla la vigila `web/jueces/fuentes.spec.ts`.

### 2.1 · `data/referencia/` — UD Spanish-AnCora, 100 + 100 frases

| Fichero | Obra | Titular | Licencia | Para qué |
|---|---|---|---|---|
| `ancora-ud-dev-100.json` | UD Spanish-AnCora r2.18, `es_ancora-ud-dev.conllu` (commit `197cca3`), las 100 primeras frases con sus UPOS | Taulé, Martí y Recasens (AnCora, CLiC-UB); conversión a UD de Martínez Alonso y Zeman | **CC BY 4.0** | Referencia de oro de DESARROLLO: con ella se ajustó el etiquetador POS |
| `ancora-ud-test-100.json` | Ídem, `es_ancora-ud-test.conllu`, las 100 primeras frases | Ídem | **CC BY 4.0** | Referencia de oro de PRUEBA: con ella se midió una sola vez, con todo congelado. No llegó al umbral y el POS quedó fuera de la v1 (`docs/investigacion/pos-medida.md`); los dos ficheros se conservan para la v1.1 |

- Licencia comprobada en el `LICENSE.txt` del treebank en ese mismo commit, copiado en
  [`data/referencia/LICENSE-CC-BY-4.0.md`](data/referencia/LICENSE-CC-BY-4.0.md), donde está
  también la cita que pide y lo que se cambió.
- ⚠️ AnCora circula también con GPL (ELRA-W0326, Hugging Face CLiC-UB). Lo de aquí sale **solo**
  de la versión de Universal Dependencies, que es CC BY 4.0.
- **No viaja al navegador**: es un dato de prueba.

### 2.2 · `data/frecuencias/` — wordfreq, español, 20.000 formas

| Fichero | Obra | Titular | Licencia | Para qué |
|---|---|---|---|---|
| `es-wordfreq.json` | wordfreq 3.1.1, lista `best` (= `large`) del español: las 20.000 formas más frecuentes con su frecuencia Zipf | Robyn Speer; datos de Wikipedia, OpenSubtitles 2018, NewsCrawl, GlobalVoices, Google Books Ngrams, OSCAR, Twitter y Reddit | **CC BY-SA 4.0** | Lista de frecuencias para las reglas estadísticas (se usará desde el punto 4) |

- Atribución completa —a la autora, a cada fuente que wordfreq declara y la nota SUBTLEX que
  exige— en [`data/frecuencias/LICENSE-CC-BY-SA-4.0.md`](data/frecuencias/LICENSE-CC-BY-SA-4.0.md).
- ⚠️ **CompartirIgual**: quien la redistribuya, o redistribuya una obra derivada, lo hace bajo
  CC BY-SA 4.0. Por eso vive aparte del código Apache 2.0.
- ⚠️ SUBTLEX-ESP **no** figura entre las listas SUBTLEX que el README de wordfreq dice incluir
  (US, UK, CH, DE, NL): que la lista española lleve datos SUBTLEX, **NO CONSTA**.
- Los datos de wordfreq son una foto «up through 2021» (`SUNSET.md` del repositorio): anteriores
  a la oleada de texto generado.
- **Viajará al navegador** cuando la usen las reglas: su atribución CC BY-SA tendrá que viajar
  con ella. Cómo, **NO CONSTA** hasta que exista el build (punto 6).

### 2.3 · `data/calibracion/` — percentiles de textos humanos, por género

Aquí hay **cifras derivadas**, no textos: por género, los percentiles de cada métrica en
textos humanos (`<genero>.json`) y el manifiesto de su corpus (`<genero>.manifiesto.json`),
con qué se descargó, de dónde, con qué licencia y con qué filtros, y cada documento por su id
y su huella sha256. **Ni una frase de los textos**: la herramienta lo comprueba antes de
escribir (`motor/herramientas/calibrar/manifiesto.ts`). Los textos se descargan en
`motor/corpus/`, que no se versiona. La atribución que pide cada corpus está en
[`data/calibracion/LICENSE-CORPUS.md`](data/calibracion/LICENSE-CORPUS.md).

| Fichero | Corpus | Titular | Licencia | Estado de la licencia |
|---|---|---|---|---|
| `noticia.json` | UD Spanish-AnCora r2.18 (commit `197cca3`), sin el subcorpus Cast3LB: 1.025 documentos de la agencia EFE y de El Periódico (año 2000) | Taulé, Martí y Recasens (AnCora, CLiC-UB); conversión a UD de Martínez Alonso y Zeman | **CC BY 4.0** | Verificada en el repositorio: `LICENSE.txt` y los metadatos del README dicen CC BY 4.0; la prosa del mismo README dice «The GNU license is inherited from the original dataset». Las dos citas, en `LICENSE-CORPUS.md` |
| `administrativo.json` | BOE de 2000 a 2021: 463 disposiciones generales, resoluciones y anuncios (API de sumarios de datos abiertos y texto de `txt.php`), por turnos y con ningún subgénero por encima del 60 % de su tramo | Agencia Estatal Boletín Oficial del Estado | **Art. 13 LPI y licencia tipo del BOE de 27/06/2024** | Verificada en origen: el aviso legal y el art. 13 del TRLPI consolidado, leídos en cada ejecución. Cita obligatoria: «Basado en datos de la Agencia Estatal Boletín Oficial del Estado» |
| `narrativa-clasica.json` | Project Gutenberg: 1.377 capítulos de 237 libros de narrativa en español (EPUB del harvest), de autores muertos en 1945 o antes; como mucho 5 capítulos por libro y tramo; fuera traducciones, crítica, obras en diálogo y, a mano, lo que no es narración | Los autores de cada libro (en el manifiesto); ediciones digitales de Project Gutenberg | **Dominio público en España** | Verificada libro a libro: todas las personas del registro del catálogo murieron en 1945 o antes (TRLPI, arts. 26 y 30 y DT 4.ª; Ley de 10 de enero de 1879, art. 6, ochenta años), leído en origen. De Project Gutenberg no se redistribuye nada: su texto y su marca se retiran según su licencia, comprobada en cada EPUB |
| `academico.json` | CSIC Spanish Corpus (Zenodo 7313126, v1.0.0), leído por rangos de bytes: 361 unidades de 101 trozos, artículos de revistas.csic.es enteros y, en 100-299 y 300-599, fragmentos de frases completas | BSC / Plan de Tecnologías del Lenguaje (SEDIA, 2022), sobre artículos de las revistas del CSIC | **CC BY 4.0** | Verificada en el empaquetado (página del registro en Zenodo) y en origen (revistas.csic.es: «Salvo indicación contraria, todos los contenidos de la edición electrónica se distribuyen bajo una licencia […] CC BY 4.0»; citar la procedencia), leídas en cada ejecución |
| `opinion.json` | MuchoCine: 3.870 críticas de cine de usuarios (hacia 2005-2008), repositorio ITALIC-US/Spanish-Movie-Reviews en el commit `4f8efab`; solo el cuerpo de cada crítica | Usuarios de www.muchocine.net; recogidas por Cruz, Troyano, Enríquez y Ortega (2008) | **CC BY 2.1 ES** | **Declarada por terceros**: la declaran los curadores en su README; no verificada en muchocine.net. El LICENSE del repositorio (MIT) es del software, no de las críticas. Solo cifras, sin muestras |
| `general.json` | Mezcla estratificada de los cinco anteriores: por tramo, los géneros con ese tramo calibrado y el mismo número de documentos de cada uno (100-299: 4 × 100; 300-599 y 600+: 5 × 100), elegidos por huella | Los de cada corpus de origen | **La de cada corpus de origen** | Heredada: cada documento conserva la licencia de su corpus, citada en su fila; los de opinión, CC BY 2.1 ES declarada por terceros (solo cifras) |

- `validacion.json` no es de un género ni lleva manifiesto: es la validación de RadiografIA
  (encargo 5.6) sobre los documentos **apartados** (reparto «validacion») de los seis ficheros de
  la tabla, cada uno analizado con su género. Lleva los ids de esos documentos, ya publicados en
  sus manifiestos, y cifras: en cuántos disparan dos o más reglas estadísticas, la tasa de
  disparo de cada regla y los percentiles del total. Ni una frase de los textos. Licencia: la de
  cada corpus de origen, como `general.json`; atribución en `LICENSE-CORPUS.md`.
- Una fila por fichero de calibración y un fichero por fila, con la licencia que dice el propio
  fichero: lo vigila `motor/src/notices.spec.ts`.
- **Viajará al navegador**: los percentiles entran en la cabecera del paquete
  (`cabecera.calibracion`), cada celda con el nombre de su corpus. Cómo se enseña la atribución
  en la interfaz, **NO CONSTA** hasta el punto 6.

### 2.4 · `web/public/fuentes/` — Literata y Atkinson Hyperlegible Next (OFL 1.1)

Las dos fuentes de la web, autoalojadas (encargo 10.4; DISEÑO § 5): Literata para el texto
analizado y los textos largos, Atkinson Hyperlegible Next para la interfaz. Salen del
repositorio de Google Fonts en el commit `9710da1e` (30/09/2026), recortadas a latin + latin-ext.
Cada familia lleva al lado su `OFL.txt`, copia del original, y viaja con ella a `dist/`. La ficha
completa (origen, versiones, comandos, cifras de la decisión) está en
[`docs/figma/fuentes.md`](docs/figma/fuentes.md).

| Fichero | Cara | Original | Titular | Licencia | Qué se cambió | sha256 del fichero |
|---|---|---|---|---|---|---|
| `atkinson-hyperlegible-next.woff2` | Atkinson Hyperlegible Next, variable 400-700 | `AtkinsonHyperlegibleNext[wght].ttf`, versión 2.001, sha256 `5a455d1cfa099b601ab70751bb9673e8fe1854dc4500c80e1a220d0d75e31745` | The Atkinson Hyperlegible Next Project Authors | **OFL-1.1** | peso acotado de 200-800 a 400-700; recorte; WOFF2 | `61b142d8dce2ed4a961902890097797dd410ee3bb5eb5c773327b61fb8842e23` |
| `literata-400.woff2` | Literata 400 | `Literata[opsz,wght].ttf`, versión 3.103, sha256 `b41138c9373112f32abb589cc22e8674b06ed4048b0c513be922bdd26f274440` | The Literata Project Authors | **OFL-1.1** | peso fijado en 400; eje óptico acotado de 7-72 a 12-20; recorte; WOFF2 | `247ae9904f2b541c7c2f2b3cbb9fec3ec4ff1f38bbad256e799f3775a85e96fe` |
| `literata-400-italica.woff2` | Literata 400 itálica | `Literata-Italic[opsz,wght].ttf`, versión 3.103, sha256 `d483dfaeba9cbf4ce71d32a52ee65df82f7e35b15fff8d1011cdb242d1fcd465` | The Literata Project Authors | **OFL-1.1** | peso fijado en 400; eje óptico acotado de 7-72 a 12-20; recorte; WOFF2 | `07c13facde53915a4b94ecc0cbe514d31aa14aa8cc1cb824d15fcaa7d140575d` |
| `literata-600.woff2` | Literata 600 | `Literata[opsz,wght].ttf`, versión 3.103, sha256 `b41138c9373112f32abb589cc22e8674b06ed4048b0c513be922bdd26f274440` | The Literata Project Authors | **OFL-1.1** | peso fijado en 600; eje óptico acotado de 7-72 a 12-20; recorte; WOFF2 | `b4b5b88df63606d3f22622109b6ba1596ad14449d8f93e821dd4dda8d5965858` |
| `atkinson-hyperlegible-next-400.woff` | Atkinson Hyperlegible Next 400, para el PDF | `atkinson-hyperlegible-next.woff2` (arriba) | The Atkinson Hyperlegible Next Project Authors | **OFL-1.1** | peso fijado en 400; WOFF 1.0 | `b7733690f3a941340ddc8ab8cf83b25eb8274931d85dc0cfbdaeb0776a05ea28` |
| `atkinson-hyperlegible-next-700.woff` | Atkinson Hyperlegible Next 700, para el PDF | `atkinson-hyperlegible-next.woff2` (arriba) | The Atkinson Hyperlegible Next Project Authors | **OFL-1.1** | peso fijado en 700; WOFF 1.0 | `560aeebc3f10a9e7568836dd4dc212a7d4afc1a68c9f162f832dd912285eda0e` |
| `literata-400.woff` | Literata 400, para el PDF | `literata-400.woff2` (arriba) | The Literata Project Authors | **OFL-1.1** | eje óptico fijado en 12, el de por defecto; WOFF 1.0 | `e91ebeefec4205c46336496e618cedacc30d424699f73be6d86b7f2aa1bcc5b3` |
| `literata-400-italica.woff` | Literata 400 itálica, para el PDF | `literata-400-italica.woff2` (arriba) | The Literata Project Authors | **OFL-1.1** | eje óptico fijado en 12, el de por defecto; WOFF 1.0 | `7f51b815b68e63350bf4683195f63705611a85fea14bce1d1d1d94be09d12657` |
| `literata-600.woff` | Literata 600, para el PDF | `literata-600.woff2` (arriba) | The Literata Project Authors | **OFL-1.1** | eje óptico fijado en 12, el de por defecto; WOFF 1.0 | `6b6315c245ef4850b1a350bebd19749e1010451acc87f01f1aca98bb09f37161` |

- **Licencia**: SIL Open Font License 1.1, con su texto entero en
  [`web/public/fuentes/literata/OFL.txt`](web/public/fuentes/literata/OFL.txt) y
  [`web/public/fuentes/atkinson-hyperlegible-next/OFL.txt`](web/public/fuentes/atkinson-hyperlegible-next/OFL.txt).
  Copyright: «Copyright 2017 The Literata Project Authors (https://github.com/googlefonts/literata)»
  y «Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors
  (https://github.com/googlefonts/atkinson-hyperlegible-next)».
- **Reserved Font Name: ninguna de las dos lo declara** (su línea de copyright no lleva la
  cláusula). El recorte es una versión modificada (OFL-FAQ 2.6) y, sin RFN, puede conservar el
  nombre (FAQ 5.6): las familias no se renombran.
- **Metadatos**: cada woff2 y cada woff conserva en su tabla `name` el copyright (0), la licencia
  (13) y su URL (14), como pide la FAQ 2.4.
- **Las caras del PDF** (encargo 9.3, decisión de Antonio del 05/10): el botón «Descargar informe»
  genera el PDF en el navegador con pdfmake, que incrusta las fuentes con pdfkit y fontkit. Son
  las cinco `.woff` de la tabla, WOFF 1.0 sacados de los woff2 de la web, con el mismo recorte;
  estáticas, porque pdfmake no aplica los ejes de una variable (Atkinson, en 400 y en 700;
  Literata, con su eje óptico fijado en el de por defecto, 12, que es el que pintaría igualmente).
  **No en WOFF2: fontkit no los incrusta.** Es su issue
  [#201](https://github.com/foliojs/fontkit/issues/201), abierto: «Subset of woff2 ttf fonts with
  transformed glyf/loca table does not work»; en pdfmake, el
  [#2734](https://github.com/bpampuch/pdfmake/issues/2734), cerrado como de terceros: «It needs to
  be fixed in fontkit». Medido el 05/10 con pdfmake 0.3.11 y los WOFF2 de Literata y Atkinson de
  Fontsource: «RangeError: Offset is outside the bounds of the DataView». La ficha, en
  [`docs/figma/fuentes.md`](docs/figma/fuentes.md).
- **Herramienta**: fontTools 4.66.1 (MIT), fuera del repositorio; no es dependencia del proyecto.
- **Viaja al navegador**: sí. Atkinson y Literata 400 se precargan; la itálica, cuando algo la
  pide, y la 600, al pintar un resultado (la negrita del papel). Las cinco del PDF, solo al
  pulsar «Descargar informe».
- Una fila por fichero (woff2 y woff) y un fichero por fila, con su huella: lo vigila
  `web/jueces/fuentes.spec.ts`.
