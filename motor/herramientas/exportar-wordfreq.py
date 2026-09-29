"""
Exporta la lista de frecuencias del español de wordfreq a JSON (encargo 3.3).

Se ejecuta a mano, una vez, en un entorno virtual FUERA del repositorio
(wordfreq no es dependencia del proyecto; su salida sí se versiona, en
data/frecuencias/, con su licencia al lado):

    python -m venv <fuera-del-repo>/venv-wordfreq
    <fuera-del-repo>/venv-wordfreq/Scripts/python -m pip install wordfreq
    <fuera-del-repo>/venv-wordfreq/Scripts/python herramientas/exportar-wordfreq.py <salida.json>

[DOC] wordfreq (README, «Usage»; https://github.com/rspeer/wordfreq):
   - top_n_list(lang, n, wordlist='best') → las n formas más frecuentes, de
     mayor a menor frecuencia.
   - zipf_frequency(word, lang, wordlist='best') → frecuencia en la escala
     Zipf de Brysbaert: log10 de la frecuencia por mil millones de palabras
     (un 7 es «una vez cada mil palabras»); redondeada a dos decimales.
   Para «es», 'best' es la lista 'large' (datos: large_es.msgpack.gz).
[DOC] Licencia de los datos: CC BY-SA 4.0 (README, «License»); ver
   data/frecuencias/LICENSE-CC-BY-SA-4.0.md.
"""
import json
import sys
from importlib.metadata import version

from wordfreq import top_n_list, zipf_frequency

IDIOMA = "es"
CUANTAS = 20000


def main(salida: str) -> None:
    formas = top_n_list(IDIOMA, CUANTAS, wordlist="best")
    if len(formas) != CUANTAS:
        raise SystemExit(f"top_n_list dio {len(formas)} formas y se pedían {CUANTAS}")
    pares = [[f, zipf_frequency(f, IDIOMA, wordlist="best")] for f in formas]
    datos = {
        "fuente": {
            "biblioteca": "wordfreq",
            "version": version("wordfreq"),
            "autora": "Robyn Speer",
            "url": "https://github.com/rspeer/wordfreq",
            "idioma": IDIOMA,
            "lista": "best (para «es», la lista 'large')",
            "extraido": f"top_n_list('{IDIOMA}', {CUANTAS}) y, por forma, zipf_frequency(forma, '{IDIOMA}'); en el orden de top_n_list, de mayor a menor frecuencia",
            "escala": "Zipf: log10 de la frecuencia por mil millones de palabras, dos decimales",
            "licencia": "CC BY-SA 4.0 (LICENSE-CC-BY-SA-4.0.md, al lado de este fichero)",
        },
        "formas": pares,
    }
    with open(salida, "w", encoding="utf-8", newline="\n") as f:
        json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print(f"{len(pares)} formas → {salida}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("uso: exportar-wordfreq.py <salida.json>")
    main(sys.argv[1])
