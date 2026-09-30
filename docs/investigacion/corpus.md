# Investigación — CORPUS de calibración por género

> Punto 5 del `PLAN-RADIOGRAFIA.md` (calibración). Investigación con el
> módulo el 30/09/2026 (`informes/corpus-modulo.md`, 71 fuentes), redactada
> por la conversación de estrategia. Cada licencia con su cita literal en el
> informe bruto; aquí, el veredicto y la decisión. Lo no verificado se dice.
>
> Regla: **sin licencia verificada no hay muestra; sin licencia al menos
> declarada no hay cifra.**

## Resumen

Hay corpus humanos, originales, anteriores a 2022 y con licencia que
permite publicar cifras derivadas para **académico** (CSIC Spanish Corpus,
CC BY 4.0 verificada en Zenodo y en origen), **administrativo/jurídico**
(BOE: art. 13 LPI + licencia tipo de 27/06/2024, uso comercial con cita) y
**narrativa clásica** (Project Gutenberg / Wikisource, dominio público, con
sesgo de época). **Opinión** solo con MuchoCine (CC BY 2.1 declarada por los
curadores, no verificada en origen). **Corporativo/marketing**: ningún
corpus. Los corpus de detección (AuTexTification, ROBOT-TALK) **no sirven
para calibrar**: NC o sin licencia, textos de ~50 palabras y parte
traducida. **No existe ninguna tabla publicada** de MTLD, MATTR o IFSZ por
género en español: se calibra desde cero.

## Veredicto por género y decisión para la v1 (30/09/2026)

| Género (clave) | Corpus | Licencia | Estado | Entra en v1 |
|---|---|---|---|---|
| `noticia` | UD Spanish-AnCora (ya en `data/referencia/`) | CC BY 4.0, verificada | Cubierto | **Sí** |
| `academico` | CSIC Spanish Corpus (30.929 docs, 146,8 M tokens, ~4.750 tokens/doc → casi todo 600+); resúmenes de SciELO filtrados por licencia CC BY por artículo para 100-299 | CC BY 4.0 verificada en Zenodo y en revistas.csic.es; SciELO por artículo | Cubierto (tramos cortos por fragmentos o resúmenes, documentado) | **Sí** |
| `administrativo` | BOE (disposiciones, resoluciones, anuncios; excluir tratados y traducciones oficiales); separar subgéneros | Art. 13 LPI (verificado) + licencia tipo BOE 2024 (comercial, con cita «Basado en datos de la Agencia Estatal Boletín Oficial del Estado») | Cubierto | **Sí** |
| `narrativa-clasica` | Project Gutenberg ES filtrado por autor hispanohablante en dominio público en la UE (LPI: 80 años si murió antes del 7/12/1987; 70 después); Wikisource ES | Dominio público; Gutenberg exige quitar su cabecera y su marca | Cubierto con **sesgo de época** (pre-1930): frases largas, léxico arcaizante; se etiqueta «clásica» | **Sí**, con la advertencia en la ficha de calibración |
| `opinion` | MuchoCine (3.872 críticas de cine de usuarios, España, ~2005-08, ~230 palabras) | CC BY 2.1 ES declarada por ITALIC-US; ficha de HF «unknown»; no verificada en muchocine.net | Débil | **Sí, solo cifras**, sin muestras, con la licencia marcada «declarada por terceros» |
| `corporativo` | — | — | **Hueco** | No: la interfaz muestra «sin calibración» |
| `general` | **Mezcla estratificada y declarada** de los anteriores + Wikipedia ES (CC BY-SA 4.0, volcado anterior a 2022), mismo número de documentos por género y por tramo, receta publicada | Herencia de cada parte | Construible | **Sí** (obligatorio por defecto) |

## Descartes (con motivo)

- **AuTexTification / IberAuTexTification**: Zenodo «Restricted»; copia HF
  CC BY-NC-SA 4.0; humanos ~297 caracteres de media; parte legal es
  MultiEURLEX (traducción). Cifras humanas que no cuadran entre fuentes
  (24.707 vs 26.996).
- **ROBOT-TALK**: licencia NO CONSTA; 514/505/765 humanos según fuente;
  recopilado desde diciembre de 2022. Solo validación externa si la UCM
  lo cede por escrito.
- **TASS** (NC, tuits), **Amazon MARC** (solo investigación, retirado),
  **InfoLibros** (CC BY-NC-SA), **CENDOJ** (prohíbe descarga masiva; el
  Reglamento 3/2010 anulado por el TS en 2011; condiciones actuales NO
  CONSTAN), **CORPES XXI** (aviso legal RAE), **Biblioteca Virtual
  Cervantes** (solo extracción no sustancial).
- **Todo lo traducido**: MultiEURLEX, DGT, Europarl, JRC-Acquis,
  EUBookshop, MultiUN, DOGC; los corpus paralelos derivados de SciELO;
  la mayor parte de spanish-corpora (Cañete). El «translationese» sesga
  justo las métricas que calibramos (`sintaxis.md` §6).
- **OSCAR / CEREAL**: «we do not hold the copyright of the content text»;
  conflicto interno CC0/CC BY. Solo cifras agregadas, no muestras.

## Condiciones que van a la ficha de cada calibración

Por género: fuente y URL; licencia literal y si está verificada o es
declarada; original/traducido; fecha de los textos; método de troceado por
tramos («fragmento», no «documento», cuando se trocea); sesgo de época o
región (BOE, CSIC, MuchoCine y TDX son de España; SciELO y CEREAL
permiten estratificar América); n por celda; método de percentil
(Hyndman & Fan tipo 7).

## Huecos

- Corporativo/marketing: sin corpus abierto; búsqueda específica no
  exhaustiva (el módulo lo declara).
- Opinión contemporánea (columnas, blogs): ninguna colección CC BY.
- Narrativa contemporánea: no existe con licencia abierta.
- Variedad americana: solo SciELO y CEREAL.
- Tablas de referencia de métricas por género: no las hay.
- Licencias supuestas o no verificadas en origen: MuchoCine, Wikisource,
  tesis subyacentes de TDX, Spanish Legal Domain Corpora.
- Tamaños en tokens del BSC; conversión a palabras (~0,85) estimada.
- datos.gob.es y CC-News ES: no leídos.

## Para la tanda de calibración (5.6)

1. Orden: `noticia` (ya en repo) → `administrativo` (BOE) →
   `narrativa-clasica` (Gutenberg) → `academico` (CSIC + SciELO) →
   `opinion` (MuchoCine, solo cifras) → `general` (mezcla declarada).
2. Cada corpus se descarga con una herramienta en `motor/herramientas/`
   que deja escrito qué se bajó, cuándo, con qué filtro y con qué
   licencia; las muestras solo se guardan en `data/` si la licencia
   verificada lo permite (BOE, dominio público, CSIC); de lo demás, solo
   las cifras.
3. Percentiles tipo 7 por género × tramo, n por celda; validación FPR
   ≤ 5 % con textos apartados del mismo corpus.
4. La interfaz lista los géneros desde `cabecera.calibracion`;
   `corporativo` no existe y se muestra «sin calibración».
