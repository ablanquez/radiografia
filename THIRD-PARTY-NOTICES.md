# Avisos de terceros

La licencia Apache 2.0 cubre **el código y los paquetes de reglas** de RadiografIA. **No cubre
lo ajeno**, que conserva sus propias condiciones. Aquí está, una por una, con lo que sabemos y lo
que no.

> ℹ️ **Estado a 29/09/2026.** Hoy lo ajeno es solo software: **cinco** dependencias declaradas
> en [`motor/package.json`](motor/package.json) —una de ejecución y cuatro de desarrollo— y el
> árbol que arrastran. No hay todavía datos de terceros: cuando entren las listas de frecuencia
> (CC BY-SA 4.0, en `/data/`, aparte del código), tendrán aquí su sección.
>
> Las **fuentes de cada regla** (estudios, guías, corpus) no van aquí: se citan en la ficha de
> la regla y en el catálogo. Lo propio (logo, marca) irá en `PROCEDENCIA.md`.
>
> ⭐ **Las cifras y las tablas de este documento las vigila un juez**:
> [`motor/src/notices.spec.ts`](motor/src/notices.spec.ts) las compara con `motor/package.json`
> y `motor/package-lock.json`. Si entra o sale una dependencia y nadie toca este fichero, la
> suite del motor se pone roja. Es la herencia de Desplázame, donde la cifra de la cabecera se
> quedó vieja tres veces seguidas antes de que alguien escribiera el guion que cuenta.

---

## 1 · Software

### 1.1 · Dependencias de ejecución

Las que van en `dependencies` de [`motor/package.json`](motor/package.json).

| Paquete | Versión | Licencia | Para qué |
|---|---|---|---|
| `ajv` | 8.20.0 | MIT | El validador de JSON Schema: comprueba cada paquete de reglas contra `motor/esquema/` (clase `Ajv2020`, draft 2020-12) |

> **Lo que esta tabla NO dice:** si `ajv` acabará dentro del JavaScript que descarga el
> navegador y cómo. Hoy no hay *build* ni interfaz (llegan en el punto 6): **NO CONSTA**. Cuando
> viaje al navegador, sus avisos de licencia tendrán que viajar con él (MIT, y BSD-3-Clause de
> `fast-uri`, § 1.4).

### 1.2 · Dependencias de desarrollo

No se distribuyen: no viajan al navegador. Se listan igualmente, una a una.

| Paquete | Versión | Licencia | Para qué |
|---|---|---|---|
| `typescript` | 5.9.3 | Apache-2.0 | `tsc --noEmit`: revisa los tipos. No compila nada; Node ejecuta el `.ts` borrando tipos |
| `@types/node` | 24.19.0 | MIT | Los tipos de Node 24 (`node:test`, `node:fs`) para que `tsc` pueda revisar |
| `@tsconfig/node24` | 24.0.5 | MIT | La base de `tsconfig` para Node 24 |
| `@tsconfig/node-ts` | 23.6.4 | MIT | La base de `tsconfig` para ejecutar TypeScript con borrado de tipos |

**Mirado una a una (29/09/2026):** el `LICENSE` de cada una de las cinco declaradas, abierto en
`motor/node_modules/`, dice lo mismo que su campo `license`: MIT (Evgeny Poberezkin) en `ajv`;
Apache License 2.0 en `typescript`; MIT (Microsoft Corporation) en `@types/node` y en las dos
bases de `@tsconfig`.

### 1.3 · El árbol transitivo — existe, y no se lista aquí

Las cinco declaradas arrastran **cinco** dependencias transitivas. No se enumeran una a una
aquí: la lista que manda es [`motor/package-lock.json`](motor/package-lock.json), versionado
precisamente para eso. Cada entrada trae su versión, su origen y su licencia.

```bash
cd motor
npm ls --depth=0   # las declaradas
npm ls --all       # el árbol entero
```

**El reparto de licencias del árbol transitivo, leído del `package-lock.json` el 29/09/2026:**

| Licencia | Paquetes |
|---|---|
| MIT | 4 |
| BSD-3-Clause | 1 |
| **Total** | **5** |

### 1.4 · La que no es MIT

| Paquete | Licencia | Qué tiene de distinto |
|---|---|---|
| `fast-uri` 3.1.8 (la trae `ajv`) | **BSD-3-Clause** | Permisiva. Pide conservar su aviso de copyright y su lista de condiciones al redistribuir, también en binario: cuenta cuando `ajv` viaje al navegador (§ 1.1). Y prohíbe usar el nombre de sus autores para promocionar lo derivado |

### 1.5 · Resumen de compatibilidad

**Las cinco declaradas son MIT o Apache-2.0**: permisivas, sin copyleft, compatibles con la
Apache 2.0 de este proyecto sin condición añadida. En el árbol transitivo, cuatro son MIT y una
BSD-3-Clause (§ 1.4). Nada bloquea.

> **Y lo que este documento no garantiza:** el reparto de § 1.3 sale del campo `license` que
> cada paquete declara en el `package-lock.json`. **Las cinco declaradas sí se han abierto una a
> una.** De las transitivas se miró la primera línea de cada `LICENSE` el 29/09 y coincide con su
> campo; el texto entero de cada una **NO CONSTA** como leído.
