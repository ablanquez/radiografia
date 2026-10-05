/**
 * Las pestañas del móvil (encargo 10.4, Tanda 2; DISEÑO §6.2 y apunte 7 de
 * Antonio), como en el modelo (BarraPestanas y ResultadoMovil): hasta 768 px
 * y con resultado, la pastilla y lo que más pesa arriba y, debajo, tres
 * paneles con una barra de pestañas fija abajo, «Texto · Reglas · Datos»:
 *   · Texto: el cuadro plegado, la vista y los botones del final;
 *   · Reglas: las familias con su ojo y el desglose de las reglas;
 *   · Datos: «Ver el detalle» abierto con las cifras, solo avisos, no miradas
 *     y los demás paquetes (Español correcto).
 * La nota de autoría (el pie de la página) se ve con Texto y con Datos.
 *
 * Los bloques son los mismos del escritorio: un solo DOM. En el móvil se
 * mueven a su panel (cada uno recuerda de dónde salió) y, al ensanchar la
 * ventana o al volver a analizar, vuelven a su sitio. Mover un nodo conserva
 * sus escuchadores y su estado (un <details> abierto, el ojo pulsado).
 * [DOC] https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild —
 *    «If the given child is a reference to an existing node in the document,
 *    appendChild() moves it from its current position to the new position».
 *
 * Y la vista cambia de sitio con el ancho (10.4, Tanda 4; decisión de Antonio
 * en la parada 3): en la tableta y en el móvil va justo detrás del medidor (la
 * pastilla y lo que más pesa), que es donde se ve, para que el orden del
 * documento sea el visual también para el lector de pantalla; en el
 * escritorio, al final de la columna del texto, debajo del cuadro plegado: la
 * columna del resultado es una sola caja con scroll propio (DISEÑO §6.1) y la
 * vista, que se ve fuera de ella, no puede ir dentro. Lo hace la misma función
 * que reparte los bloques en los paneles, con los dos cortes a la vez (1023 y
 * 768): un cambio de ancho que cruza los dos da dos avisos, y cada uno lo deja
 * todo en el sitio del ancho de ahora, lleguen en el orden que lleguen. Mover
 * un nodo le quita el foco a lo que lo tenía dentro: se le devuelve.
 * [DOC] https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html
 *    — 1.3.2: «When the sequence in which content is presented affects its
 *    meaning, a correct reading sequence can be programmatically
 *    determined».
 * [DOC] https://html.spec.whatwg.org/multipage/infrastructure.html — en los
 *    pasos de quitar un nodo: «If document's focused area is removedNode, then
 *    set document's focused area to document's viewport».
 *
 * El patrón tabs de la APG, con activación automática (como el modelo):
 * tablist, tab y tabpanel; aria-selected y aria-controls en cada pestaña y
 * aria-labelledby en cada panel; solo la elegida en el orden del tabulador; las
 * flechas izquierda y derecha pasan a la anterior y a la siguiente (dando la
 * vuelta), Inicio y Fin a la primera y a la última.
 * [DOC] https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ — «Left Arrow: moves
 *    focus to the previous tab. If focus is on the first tab, moves focus to
 *    the last tab»; «Right Arrow: Moves focus to the next tab. If focus is on
 *    the last tab element, moves focus to the first tab»; «Home (Optional):
 *    Moves focus to the first tab»; «End (Optional): Moves focus to the last
 *    tab»; con activación automática, la pestaña se elige al recibir el foco.
 */

export const PESTANAS = ['texto', 'reglas', 'datos'] as const;
export type Pestana = (typeof PESTANAS)[number];

/** Qué bloque va a cada panel, por su selector, en ese orden. */
export const REPARTO: Readonly<Record<Pestana, readonly string[]>> = {
  texto: ['#plegado', '#vista', '.acciones-resultado'],
  reglas: ['#leyenda', '#desglose-reglas'],
  datos: ['#desglose > .detalle', '#desglose-avisos', '#desglose > .otro-paquete'],
};

/** La pestaña que toca tras una tecla (las flechas dan la vuelta); null si la tecla no es de las pestañas. */
export function pestanaTrasTecla(actual: Pestana, tecla: string): Pestana | null {
  const k = PESTANAS.indexOf(actual);
  const destino: Readonly<Record<string, number>> = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: PESTANAS.length - 1 };
  if (!Object.hasOwn(destino, tecla)) return null;
  return PESTANAS[(destino[tecla]! + PESTANAS.length) % PESTANAS.length]!;
}

/** Lo que hacen las pestañas: devolver cada bloque a su sitio (antes de pintar otro análisis) y repartirlos si toca. */
export interface Pestanas {
  /** Antes de pintar o de quitar el resultado: cada bloque, a su sitio del escritorio, y sin pestañas. */
  devolver: () => void;
  /** Con el resultado pintado: la vista, en el sitio del ancho; y si es el móvil, cada bloque a su panel, en la pestaña Texto. */
  alPintar: () => void;
}

/** Una sola por página: la barra con sus tres pestañas y los tres paneles (index.astro). */
export function crearPestanas(barra: HTMLElement): Pestanas {
  const movil = matchMedia('(max-width: 768px)');
  const unaColumna = matchMedia('(max-width: 1023px)');
  const vista = document.getElementById('vista')!;
  const medidor = document.getElementById('medidor')!;
  const columnaDelTexto = document.getElementById('columna-texto')!;
  const boton = (p: Pestana): HTMLButtonElement => document.getElementById(`pestana-${p}`) as HTMLButtonElement;
  const panel = (p: Pestana): HTMLElement => document.getElementById(`panel-${p}`)!;
  /** De dónde salió cada bloque movido, para devolverlo; y si «Ver el detalle» estaba abierto. */
  const sitios: { bloque: Element; padre: Node; siguiente: Node | null }[] = [];
  let detalleAbierto: boolean | null = null;
  let hayResultado = false;
  const elegir = (p: Pestana, enfocar: boolean): void => {
    for (const q of PESTANAS) {
      const elegida = q === p;
      boton(q).setAttribute('aria-selected', String(elegida));
      boton(q).tabIndex = elegida ? 0 : -1;
      panel(q).hidden = !elegida;
    }
    document.body.dataset['pestana'] = p;
    if (enfocar) boton(p).focus();
  };
  const repartir = (): void => {
    if (sitios.length > 0) return;
    for (const p of PESTANAS) {
      for (const selector of REPARTO[p]) {
        for (const bloque of document.querySelectorAll(selector)) {
          sitios.push({ bloque, padre: bloque.parentNode!, siguiente: bloque.nextSibling });
          panel(p).append(bloque);
        }
      }
    }
    // En Datos, «Ver el detalle» va abierto (como el modelo): solo lleva las cifras.
    const detalle = panel('datos').querySelector<HTMLDetailsElement>(':scope > .detalle');
    if (detalle !== null) {
      detalleAbierto = detalle.open;
      detalle.open = true;
    }
    barra.hidden = false;
    document.body.classList.add('con-pestanas');
    elegir('texto', false);
  };
  const devolver = (): void => {
    const detalle = panel('datos').querySelector<HTMLDetailsElement>(':scope > .detalle');
    if (detalle !== null && detalleAbierto !== null) detalle.open = detalleAbierto;
    detalleAbierto = null;
    for (const { bloque, padre, siguiente } of sitios.reverse()) padre.insertBefore(bloque, siguiente);
    sitios.length = 0;
    barra.hidden = true;
    for (const p of PESTANAS) panel(p).hidden = true;
    document.body.classList.remove('con-pestanas');
    delete document.body.dataset['pestana'];
  };
  barra.addEventListener('click', (e) => {
    const p = PESTANAS.find((q) => boton(q).contains(e.target as Node));
    if (p !== undefined) elegir(p, false);
  });
  barra.addEventListener('keydown', (e) => {
    const actual = PESTANAS.find((q) => boton(q).getAttribute('aria-selected') === 'true') ?? 'texto';
    const destino = pestanaTrasTecla(actual, e.key);
    if (destino === null) return;
    e.preventDefault();
    elegir(destino, true);
  });
  /** La vista, en el sitio del ancho: detrás del medidor en una columna; al final de la columna del texto en el escritorio. */
  const colocarLaVista = (): void => {
    if (unaColumna.matches) {
      if (medidor.nextElementSibling !== vista) medidor.after(vista);
    } else if (columnaDelTexto.lastElementChild !== vista) columnaDelTexto.append(vista);
  };
  /** Con resultado, cada bloque en el sitio del ancho de ahora; y el foco, donde estaba. */
  const ajustar = (): void => {
    if (!hayResultado) return;
    const foco = document.activeElement;
    devolver();
    colocarLaVista();
    if (movil.matches) repartir();
    if (foco instanceof HTMLElement && foco !== document.activeElement && foco.isConnected) foco.focus({ preventScroll: true });
  };
  movil.addEventListener('change', ajustar);
  unaColumna.addEventListener('change', ajustar);
  return {
    devolver: () => {
      hayResultado = false;
      devolver();
    },
    alPintar: () => {
      hayResultado = true;
      ajustar();
    },
  };
}
