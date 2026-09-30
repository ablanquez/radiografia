"""
El ORÁCULO de MTLD y HD-D (encargo 4.3): ejecuta las dos implementaciones de
referencia sobre las mismas palabras que ve el motor, para los jueces de
oráculo de src/metricas/mtld.spec.ts y hdd-42.spec.ts. Se ejecuta a mano,
fuera del repositorio las implementaciones (NO se incorporan: TAALED es
CC BY-NC-SA 4.0, y ninguna es dependencia del motor):

    curl -o <dir>/ld.py https://raw.githubusercontent.com/LCR-ADS-Lab/TAALED/27b19e1cda26e6f4d869d36afea6874f08825618/taaled/ld.py
    curl -o <dir>/lexical_diversity.py https://raw.githubusercontent.com/jennafrens/lexical_diversity/d78d45f4e63b4a5bcc51c9a095a3229569fb3f66/lexical_diversity.py
    node herramientas/oraculo-ld.ts > <entradas.json>
    python herramientas/oraculo-ld.py <dir>/ld.py <dir>/lexical_diversity.py <entradas.json>

De TAALED (ld.py, commit 27b19e1) se ejecuta SOLO la clase `lexdiv`, tal cual,
sin su __init__: el módulo carga al importarse un fichero de datos
(real_words5.pickle) que estos cálculos no usan.
  · MTLD: MTLD-Original, `mtldo` en TAALED (ld.py:230-233: MTLDER de ida y de
    vuelta con mn=10 y ttrval=.720, MTLD_O de cada pasada y la media).
  · HD-D: HDD(text, 42) (ld.py:147-183).
De lexical_diversity (commit d78d45f): mtld() y hdd(), que exigen >= 50
palabras (lexical_diversity.py:47, 84).
"""
import importlib.util
import json
import math
import operator
import statistics as stat
import sys
from collections import Counter


def cargar_taaled(ruta):
    fuente = open(ruta, encoding="utf-8").read()
    inicio = fuente.index("class lexdiv():")
    fin = fuente.index("\tdef __init__(self, text = None, window_length = 50")
    espacio = {"math": math, "operator": operator, "stat": stat, "Counter": Counter}
    exec(fuente[inicio:fin], espacio)
    return espacio["lexdiv"]()


def cargar_modulo(ruta):
    spec = importlib.util.spec_from_file_location("lexical_diversity", ruta)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def main():
    taaled = cargar_taaled(sys.argv[1])
    ld = cargar_modulo(sys.argv[2])
    entradas = json.load(open(sys.argv[3], encoding="utf-8"))
    for nombre, palabras in entradas.items():
        ida = taaled.MTLDER(palabras, 10, 0.720)
        vuelta = taaled.MTLDER(list(reversed(palabras)), 10, 0.720)
        mtldo = stat.mean([taaled.MTLD_O(ida[1], ida[2]), taaled.MTLD_O(vuelta[1], vuelta[2])])
        linea = f"{nombre}: {len(palabras)} palabras · TAALED mtldo {mtldo!r} · TAALED HDD {taaled.HDD(palabras, 42)!r}"
        if len(palabras) >= 50:
            linea += f" · lexical_diversity mtld {ld.mtld(palabras)!r} · hdd {ld.hdd(palabras)!r}"
        print(linea)


if __name__ == "__main__":
    main()
