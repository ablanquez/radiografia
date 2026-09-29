# Licencia y atribución — `es-wordfreq.json`

Este fichero **no es obra de RadiografIA** y **no está bajo la Apache 2.0** del
repositorio. Es una exportación de los datos de *wordfreq* y conserva su
licencia: **Creative Commons Atribución-CompartirIgual 4.0 Internacional
(CC BY-SA 4.0)**.

- Resumen de la licencia: <https://creativecommons.org/licenses/by-sa/4.0/deed.es>
- Texto legal (canónico): <https://creativecommons.org/licenses/by-sa/4.0/legalcode>

**CompartirIgual**: quien redistribuya este fichero, o una obra derivada de él,
tiene que hacerlo bajo la misma licencia CC BY-SA 4.0 (o una compatible). Por
eso vive aquí, en `data/`, **aparte del código Apache 2.0** (decisión del
29/09, `PLAN-RADIOGRAFIA.md` punto 3).

## Obra de origen

**wordfreq**, de **Robyn Speer**, versión **3.1.1**:
<https://github.com/rspeer/wordfreq>. El código de wordfreq es Apache 2.0; sus
datos, CC BY-SA 4.0. Su `README`, sección «License», copiado tal cual:

> `wordfreq` is freely redistributable under the Apache license (see
> `LICENSE.txt`), and it includes data files that may be redistributed under a
> Creative Commons Attribution-ShareAlike 4.0 license
> (<https://creativecommons.org/licenses/by-sa/4.0/>).

La cita que pide:

> Robyn Speer. (2022). rspeer/wordfreq: v3.0 (v3.0.2). Zenodo.
> https://doi.org/10.5281/zenodo.7199437

Los datos de wordfreq están congelados: su autora dejó de actualizarlos, y
reflejan el uso de la lengua hasta 2021 (`SUNSET.md` del repositorio).

## Fuentes que wordfreq declara

Para el español, wordfreq combina **siete** fuentes (su README, «Sources and
supported languages»: fila `Spanish es 7`): **Wikipedia**, **subtítulos**,
**noticias**, **libros**, **web**, **Twitter** y **Reddit**. Las que su
sección «License» atribuye, citadas tal cual:

- **Google Books Ngrams** (<http://books.google.com/ngrams>): «Ngram Viewer
  graphs and data may be freely used for any purpose, although acknowledgement
  of Google Books Ngram Viewer as the source, and inclusion of a link to
  http://books.google.com/ngrams, would be appreciated.»
- **Wikipedia** (<http://www.wikipedia.org>), el **Leeds Internet Corpus**
  (<http://corpus.leeds.ac.uk/list.html>) y **ParaCrawl**
  (<https://paracrawl.eu>), con licencias Creative Commons.
- **OPUS OpenSubtitles 2018** (<http://opus.nlpl.eu/OpenSubtitles.php>), que
  procede del proyecto **OpenSubtitles** (<http://www.opensubtitles.org/>) y
  «may be used with attribution to OpenSubtitles».
- **NewsCrawl 2014** y **GlobalVoices** (noticias) y **OSCAR** (web), según la
  lista de dominios del README.
- Twitter: «statistics about words… it does not display or republish any
  Twitter content».

## SUBTLEX

wordfreq incluye listas **SUBTLEX** de **Marc Brysbaert et al.** con permiso de
sus autores. Del README, tal cual:

> I (Robyn Speer) have obtained permission by e-mail from Marc Brysbaert to
> distribute these wordlists in wordfreq, to be used for any purpose, not just
> for academic use, under these conditions:
>
> - Wordfreq and code derived from it must credit the SUBTLEX authors.
> - It must remain clear that SUBTLEX is freely available data.

Así se cumple aquí: **los datos SUBTLEX son obra de Marc Brysbaert et al. y
son de libre disposición** (<http://crr.ugent.be/programs-data/subtitle-frequencies>).

⚠️ Esa sección del README enumera las listas incluidas: **SUBTLEX-US, -UK,
-CH, -DE y -NL**. **SUBTLEX-ESP no aparece.** Que la lista española de wordfreq
contenga datos SUBTLEX: **NO CONSTA**; sus subtítulos en español vienen de
OpenSubtitles 2018. La atribución se deja igualmente, porque la exige wordfreq
para sus datos.

## Qué se ha cambiado

La licencia exige decirlo:

- se han tomado **solo las 20.000 formas más frecuentes del español**
  (`top_n_list('es', 20000)`, lista `best`, que para el español es `large`);
- de cada forma, su **frecuencia Zipf** (`zipf_frequency`, dos decimales);
- se ha pasado del formato interno de wordfreq (msgpack) a JSON.

Lo hace `motor/herramientas/exportar-wordfreq.py`, y se puede rehacer.

## Sin garantías ni respaldo

Se ofrece tal cual, sin garantías (CC BY-SA 4.0, § 5). Su uso aquí no implica
que la autora de wordfreq ni los de sus fuentes respalden RadiografIA.
