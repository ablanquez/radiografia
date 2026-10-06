# Despliegue y lo que viaja al navegador

Qué pide la web al navegador, con sus tamaños, y cómo se publica en
Hostinger. El resumen está en el
[README](../README.md#cómo-ejecutarlo-y-probarlo). Lo medido en producción
está en el [censo pre-despliegue](CENSO-PRE-DESPLIEGUE.md), § 15.

Hasta el 06/10/2026 este texto estaba en el README. En el encargo 11.4 se
trasladó aquí tal cual. Solo cambiaron los enlaces; delante de los que
ahora llevan a otro documento, «abajo» por «en»; «ni este README», por «ni
el README»; y «Lo que viaja al navegador», que era un apartado de «Cómo
ejecutar», es aquí una sección.

---

## Lo que viaja al navegador

Nada sale del navegador. Lo que la web pide es suyo, del mismo sitio:

- **al cargar**: su HTML, su JS y su CSS, las fuentes y los dos paquetes
  incluidos, que se validan al arrancar;
- **al pulsar un ejemplo**: el texto de ese ejemplo;
- **al pintar un resultado**: la negrita del papel, una vez por visita
  (en [«Informe»](WEB.md#informe));
- **al pulsar «Descargar informe»**, la primera vez: el trozo de JS de
  pdfmake y las cinco caras del PDF.

Un paquete propio no se pide: se lee del fichero, en el navegador (en
[«Paquetes propios»](WEB.md#paquetes-propios)).

Medido el 06/10/2026 en Chrome sobre el build (`astro preview`), petición por
petición. La columna «con gzip» es cada fichero comprimido con el gzip de
Node a su nivel por defecto; lo que comprima el servidor de verdad se verá
en el despliegue (punto 11). Las fuentes ya van comprimidas.

**El analizador, al cargar:** 15 peticiones.

| fichero | bytes | con gzip |
|---|---|---|
| `index.html` (con la CSP y la hoja de impresión) | 6.573 | 2.423 |
| el JS del analizador (motor, validador, cargador, resultado, papel y la función de precarga de Vite, con los avisos MIT de Ajv, de silabea y de Vite; minificado por Vite) | 159.670 | 36.973 |
| las cadenas de la interfaz, que comparte con el catálogo (un JS aparte) | 10.531 | 4.314 |
| el runtime de Rolldown, el empaquetador de Vite, con su aviso MIT (un JS aparte, que también pide el trozo de pdfmake) | 1.898 | 1.156 |
| el CSS del analizador (con el del papel) | 20.843 | 4.331 |
| el CSS común: tokens, fuentes, cabecera, pie y familias | 13.174 | 2.986 |
| Literata 400 (woff2) | 43.696 | — |
| Literata 400 itálica (woff2) | 44.212 | — |
| Atkinson Hyperlegible Next, de 400 a 700 (woff2) | 25.920 | — |
| `paquetes/radiografia.json` (con su calibración, los nombres y las frases en claro de las reglas) | 347.340 | 76.863 |
| `paquetes/espanol-correcto.json` | 21.618 | 6.049 |
| el icono de la cabecera, los dos del navegador y el manifiesto | 3.637 | 3.127 |
| **en total** | **699.112** | **252.050** |

**Después, solo si hace falta:**

| cuándo | fichero | bytes | con gzip |
|---|---|---|---|
| al pulsar «Texto humano» | `ejemplos/antonio.txt` | 1.777 | — |
| al pulsar «Texto de IA» | `ejemplos/ia.txt` | 1.957 | — |
| al pintar un resultado | Literata 600, la negrita del papel (woff2) | 46.424 | — |
| al pulsar «Descargar informe» | el trozo de JS de pdfmake, con la definición del informe | 1.093.403 | 362.615 |
| al pulsar «Descargar informe» | las cinco caras del PDF (WOFF): Literata 400, 400 itálica y 600, y Atkinson 400 y 700 | 162.720 | — |

Los dos paquetes de prueba, `ejemplos/paquete-prueba.json` (6.900 bytes) y
`ejemplos/paquete-prueba-invalido.json` (6.904), se publican para
descargarlos y copiarlos, pero la página no los pide.

Los paquetes van aparte del JS, y no dentro, para que el JS se quede en unos
160 KB y los JSON se puedan guardar en caché por separado. Metidos en el
build, el JS habría pasado de 400 KB (medido el 03/10/2026).

**El catálogo, la página de créditos y la que no existe** no piden los
paquetes ni el motor: son HTML hecho en build. Piden el CSS común, las tres
fuentes y los iconos, como el analizador (el índice, además, las cadenas:
las fichas, los créditos y la que no existe no llevan JS), y lo suyo:

| fichero | bytes | con gzip |
|---|---|---|
| `reglas/index.html`, el índice | 74.773 | 15.803 |
| el CSS del catálogo, de las fichas, de los créditos y de la que no existe | 9.047 | 1.763 |
| el JS del buscador y los filtros | 3.652 | 1.568 |
| **en total, el índice** (12 peticiones) | **228.642** | **143.389** |
| cada ficha, `reglas/<id>/index.html` (sin JS) | de 6.379 a 18.346 | |
| **en total, una ficha** (10 peticiones; la de «Conector repetido») | **149.068** | **125.153** |
| las 50 fichas juntas | 480.270 | |
| `creditos/index.html`, la página de créditos (sin JS) | 15.084 | 3.764 |
| **en total, la página de créditos** (10 peticiones) | **154.770** | **125.468** |
| `404.html`, la página que no existe (sin JS) | 1.938 | 1.020 |
| **en total, la que no existe** (10 peticiones, en `/no-existe/`) | **141.624** | **122.724** |

`dist/` entero: 54 páginas HTML (el analizador, el índice, 50 fichas, los
créditos y la que no existe), 87 ficheros y 2.626.823 bytes. Casi la mitad (1.256.123) es el trozo de pdfmake
y las fuentes del PDF, que solo se piden al descargar. Cada página lleva la
CSP.

## Despliegue

La web se publica en **radiografia.antonioblanquez.es**, en el hosting
compartido de Hostinger, que sirve con LiteSpeed. Lo decidió Antonio el
06/10/2026 con la documentación del panel delante (encargo 11.2). El panel
despliega una rama de GitHub en el directorio del subdominio y no ejecuta
ningún build: según [su documentación](https://docs.hostinger.com/websites/git),
«Does **not** run a build step — the files committed to the repo are the files
served».

### Cómo se publica

En la raíz del repositorio, con el árbol limpio y `main` empujado:

```bash
npm run publicar
```

[`web/scripts/publicar.ts`](../web/scripts/publicar.ts) hace, por orden:

1. **Comprueba el punto de partida:** el árbol limpio, la rama `main`, y
   `main` igual a `origin/main` después de traerlo. Así, el commit que se
   publica existe en GitHub.
2. **Prueba ese commit en un clon temporal**, fuera del repositorio:
   `npm ci`, los tipos, los jueces del motor y los de la web, con Chrome.
   No toca el árbol de trabajo.
3. **Construye dos veces**, cada una desde un `dist/` vacío, y compara las
   dos fichero a fichero: tienen que salir iguales.
4. **Escribe el `.htaccess`** en `dist/` desde
   [`web/publicacion/.htaccess.plantilla`](../web/publicacion/.htaccess.plantilla),
   con la CSP del `<meta>` de las páginas. Para si:
   - las páginas no llevan todas la misma CSP;
   - algún fichero no cae en un grupo de caché, o cae en dos;
   - un JS o un CSS no lleva la huella de su contenido en el nombre.
5. **Pone en la rama `publicacion`** el contenido exacto de `dist/`, en un
   git worktree aparte, y lo comprueba byte a byte
   ([`web/publicacion/publicacion.ts`](../web/publicacion/publicacion.ts)).
6. **Imprime lo que va a subir:** cada fichero con sus bytes y su sha256,
   por grupo de caché, con sus cabeceras, y la orden para empujar,
   `git push origin publicacion`. El push lo da Antonio.

Si algo falla, para, dice dónde y deja el clon temporal para mirarlo. Tarda
lo que la suite y dos builds. El juez del script
([`web/jueces/publicacion.spec.ts`](../web/jueces/publicacion.spec.ts)) lo
prueba con un `dist/` de prueba y un repositorio temporal: la rama lleva
esos ficheros y ninguno más, y el `.htaccess`, la CSP del `<meta>`.

### Qué rama ve Hostinger

La rama `publicacion`. Es huérfana: no comparte historia con `main`. En su
raíz lleva el contenido de `web/dist/` y el `.htaccess`, y nada más. Cada
publicación es un commit encima del anterior, con el hash de `main` del que
sale y la fecha.

Los ficheros van byte a byte como salen del build, también los finales de
línea: el script le da a git `core.autocrlf=false`, porque con el `true` de
esta máquina git cambiaría los de un fichero de texto que llegara en CRLF.
Ya no llega ninguno. [`.gitattributes`](../.gitattributes) fija `eol=lf` a todo
lo de texto que se publica, y desde el 11.2 también a los dos paquetes y a
las licencias de las fuentes, que el checkout de Windows dejaba en CRLF. Así,
`dist/` sale con los mismos bytes en cualquier máquina. Lo vigila el juez 8
de [`web/jueces/publicacion.spec.ts`](../web/jueces/publicacion.spec.ts).

### El `.htaccess`

| ficheros | Cache-Control |
|---|---|
| el JS y el CSS, en `_astro/`, con la huella de su contenido en el nombre | `public, max-age=31536000, immutable` |
| las fuentes: woff2 de la web y woff del PDF, sin huella en el nombre | `public, max-age=604800` (una semana) |
| el HTML, los paquetes y los ejemplos (JSON y txt), el manifiesto, los iconos, el favicon y las licencias de las fuentes | `no-cache`: se guardan, pero se revalidan cada vez |

En todas las respuestas, también en la de la página que no existe:

- `Content-Security-Policy`, la misma del `<meta>` de cada página. El
  `<meta>` se queda. Con las dos políticas, el navegador aplica las dos, y
  por eso tienen que ser idénticas: salen de la misma fuente.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- Por https, `Strict-Transport-Security: max-age=31536000` (un año, sin
  `includeSubDomains` ni `preload`).

Además:

- `ErrorDocument 404 /404.html`: la página que no existe, con el código 404.
- Todo lo que empieza por `/.git` da 404.
- Los tipos de `.woff2`, `.woff`, `.webmanifest` y `.svg`, y el del JS:
  `text/javascript`, el que pide la
  [RFC 9239](https://www.rfc-editor.org/rfc/rfc9239). El servidor lo daba
  como `application/x-javascript`, que la RFC da por obsoleto.
- Ninguna regla de reescritura: cada ruta es una carpeta con su
  `index.html`. La redirección de http a https la hace el panel, con
  «Forzar HTTPS».

El porqué de cada línea, con su cita (LiteSpeed, Apache, MDN, Hostinger),
está en la plantilla.

### Cómo se verifica desde fuera

Después de publicar, en `web/`, con el mismo commit de `main`:

```bash
URL_PRODUCCION=https://radiografia.antonioblanquez.es npm test
```

(En PowerShell: `$env:URL_PRODUCCION = 'https://radiografia.antonioblanquez.es'; npm test`.)

Con la variable, los jueces de producción
([`web/jueces/produccion.spec.ts`](../web/jueces/produccion.spec.ts))
comprueban:

- que cada fichero de `dist/` responde 200, con su contenido, las
  cabeceras de su grupo y su tipo (el del JS, `text/javascript`);
- que cada página lleva la CSP por cabecera igual a su `<meta>`;
- que `/no-existe/` da 404 con la página que no existe;
- que `/.git` y `/.htaccess` no se sirven;
- que http redirige a https;
- y, en Chrome, el recorrido entero (analizar, descargar el PDF, el catálogo,
  una ficha, los créditos y la que no existe): nada fuera del origen, ni una
  violación de la CSP, ni un error en la consola.

Además, los demás jueces de Chrome piden las páginas al sitio publicado en
vez de a `astro preview`: la red, la CSP, los 320 px, el tamaño de lo que
se pulsa y la fidelidad al modelo. Sin la variable, los de producción se
omiten con un aviso.

Y, a ojo, Antonio en el PC, el iPhone y el iPad, con datos móviles.

Lo que la documentación oficial de LiteSpeed no dice directiva a directiva
(que rellene `env=HTTPS`, `RedirectMatch`, `AddType`) no consta: lo
deciden esos jueces. Si una directiva no la entiende, no da error; no hace
nada.

### Qué no se sube

Solo `dist/` y el `.htaccess`. No se suben:

- `docs/`, `data/` ni `motor/`;
- `paquetes/`, que va copiado en `dist/paquetes/`;
- `web/src`, `web/jueces`, `web/scripts` ni `web/terceros`;
- `node_modules/`, la historia de `main` ni los `package*.json`;
- `CLAUDE.md`, el PLAN, el ESTADO, el DISEÑO ni el README;
- ni mapas de fuente: el script para si `dist/` los lleva.

El inventario y por qué, en el
[censo pre-despliegue](CENSO-PRE-DESPLIEGUE.md) (§ 9.5 y § 15).
