# Arrancarlo en local

Cómo se instala, se arranca y se prueba en tu máquina, con el porqué de
cada paso, y cómo está organizado el repositorio. El resumen está en el
[README](../README.md#cómo-ejecutarlo-y-probarlo).

Hasta el 06/10/2026 este texto estaba en el README. En el encargo 11.4 se
trasladó aquí tal cual. Solo cambiaron los enlaces y, delante de los que
ahora llevan a otro documento, «abajo» por «en».

---

## Cómo ejecutar

Hace falta Node 24.12 o posterior. En la raíz del repositorio:

```bash
npm install                    # instala los dos workspaces a la vez (motor/ y web/)
npx astro telemetry disable    # una vez: apaga la telemetría de Astro en tu máquina
cd web
npm run dev                    # http://localhost:4321/ y el catálogo en http://localhost:4321/reglas/
```

- **`predev` y `prebuild`** corren solos antes de `npm run dev` y de `npm run
  build`, y los dos llaman a `npm run preparar`, que se define una sola vez
  en [`web/package.json`](../web/package.json). Genera el validador de esquema
  que lleva el navegador (`npm run generar` del motor, a `motor/dist/`),
  copia `paquetes/*.json` a `web/public/paquetes/` (de donde la página los
  pide al arrancar), escribe `web/src/estilos/tokens.css` desde los tokens de
  diseño y calcula los tramos de los ejemplos de cada ficha. Nada de lo que
  escribe se versiona (`.gitignore` dice cada cosa).
- **Después de tocar `motor/src/`**, reinicia el servidor con `npm run dev
  -- --force`. Vite pre-empaqueta el motor, porque lleva un fichero CommonJS
  (`motor/src/terceros/silabea.cjs`), y sin `--force` sigue sirviendo el de
  antes (la nota está en [`web/astro.config.mjs`](../web/astro.config.mjs)).
- **La versión construida:** `npm run build` y `npm run preview`, en la
  misma dirección.
- **Las pruebas:** `npm test` en la raíz corre los jueces del motor y los de
  la web, que construyen la página y la sirven con `astro preview`.
  - Un juez arranca además `astro dev` y pide el analizador, el catálogo y
    una ficha: 200 y ningún error en su salida. Lo arranca con
    `--ignore-lock` en un puerto libre, así que no choca con un `npm run
    dev` abierto.
  - Hasta el 02/10/2026 solo se probaba lo construido, y el catálogo rompió
    `npm run dev` sin que nada se pusiera rojo.
  - Los jueces del cargador, los del informe y los del lenguaje de calle
    ([`web/jueces/navegador.spec.ts`](../web/jueces/navegador.spec.ts),
    [`impresion.spec.ts`](../web/jueces/impresion.spec.ts) y
    [`pantalla.spec.ts`](../web/jueces/pantalla.spec.ts)) abren la página en
    **Chrome**, sin ventana, y la manejan por su protocolo de depuración. Hace falta Chrome instalado. Si no está en su ruta de
    siempre, se le da con la variable `CHROME`. Sin Chrome, esos jueces
    fallan; no se saltan.
- **Los jueces de producción** se omiten, con un aviso, mientras no se les
  da la dirección publicada (en [«Despliegue»](DESPLIEGUE.md#despliegue)).
- **Los tipos:** `npm run tipos` revisa los de los dos workspaces con `tsc`.
  No se usa `astro check`: añadiría 77 paquetes al árbol y 67 MB para
  revisar los `.astro`.
  Aquí los `.astro` llevan HTML, el import del script y, en el catálogo, la
  plantilla de cada página. La lógica va en `.ts`, que revisa `tsc`, y lo
  que pintan las plantillas lo miran los jueces sobre `dist/`.
- **El aviso de npm sobre esbuild** (`allow-scripts … esbuild`) es lo
  esperado: su `postinstall` no está aprobado y funciona sin él
  ([`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md), § 1.4).

### Prueba manual

Para pasar a mano un `.txt` por la pantalla, cópialo al portapapeles
leyéndolo como UTF-8. En PowerShell:

```powershell
Get-Content -Encoding UTF8 -Raw texto.txt | Set-Clipboard
```

- **Sin `-Encoding UTF8`, las tildes y las comillas llegan rotas.** Windows
  PowerShell 5.1, la que trae Windows, lee un fichero sin BOM con la página
  de códigos ANSI del sistema. La [doc de
  Microsoft](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_character_encoding?view=powershell-5.1)
  lo dice así: «`Get-Content` […] uses the `Default` ANSI encoding».
- **Y el análisis cambia.** El 02/10/2026, el texto de
  `motor/src/combinacion-real.spec.ts` con «Noticia» dio 356 palabras de
  prosa y un total de 17,04, en vez de 325 y 47,08.
- **`-Raw`** lee el fichero de una vez, con sus saltos de línea.

### Estructura

```text
motor/      el motor: TypeScript sin compilar, sus jueces y las herramientas de calibración
web/        la web estática en Astro 7: el analizador en src/pages/index.astro con su lógica en
            src/pantalla/; el catálogo en src/pages/reglas/ con su lógica en src/catalogo/;
            los créditos en src/pages/creditos.astro y la página que no existe en
            src/pages/404.astro; las cadenas de la interfaz en src/textos.ts; los textos
            de ejemplo y los dos paquetes de prueba del cargador en public/ejemplos/; la
            publicación (la plantilla del .htaccess y la rama) en publicacion/ y
            scripts/publicar.ts
paquetes/   los dos paquetes de reglas incluidos (RadiografIA y Español correcto)
data/       los datos de terceros y la calibración, cada carpeta con su licencia
docs/       la investigación de cada familia, los textos de ejemplo y la bitácora de fallos
```

La raíz es un [workspace de npm](https://docs.npmjs.com/cli/v11/using-npm/workspaces)
con un solo `package-lock.json`. `web/` importa el motor por
`@radiografia/motor/navegador`, la entrada sin Ajv ni nada de Node.
