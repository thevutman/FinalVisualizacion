import gsap from 'gsap';
import { CHARTS, type ChartId } from '../data/charts';
import { CLUE_LIST, type ClueId } from '../data/clues';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';
import type { CaseState } from '../state/store';

export interface TableroPistasProps {
  onToggle: (id: ClueId) => void;
  onOpenChart: (id: ChartId) => void;
}

export interface TableroPistas {
  element: HTMLElement;
  update: (state: CaseState) => void;
  destroy: () => void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const DRAG_THRESHOLD_PX = 6;

/** Posición de cada ficha en la cuadrícula del tablero (desde md). */
const PLACEMENT: Record<ClueId, string> = {
  pelo: 'md:col-start-1 md:row-start-1',
  resorte: 'md:col-start-2 md:row-start-1',
  muescas: 'md:col-start-3 md:row-start-1',
  etiqueta: 'md:col-start-1 md:row-start-3 md:translate-x-1/3',
  huellas: 'md:col-start-3 md:row-start-3 md:-translate-x-1/3',
};

/**
 * Tablero de corcho: cada pista tiene un alfiler. Se arrastra el alfiler hasta el
 * Caso 08 para tender un hilo, o se pulsa (clic, Enter o Espacio) para conectar y desconectar.
 */
export function createTableroPistas({ onToggle, onOpenChart }: TableroPistasProps): TableroPistas {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add(
    'pointer-events-none',
    'absolute',
    'inset-0',
    'z-20',
    'size-full',
    'overflow-visible',
  );
  const draft = document.createElementNS(SVG_NS, 'line');
  draft.classList.add('stroke-coral', 'hidden');
  draft.setAttribute('stroke-width', '3');
  draft.setAttribute('stroke-dasharray', '6 6');
  svg.append(draft);

  const caso = h(
    'div',
    {
      class:
        'relative z-30 col-span-2 mx-auto grid w-full max-w-56 place-items-center rounded-ficha border-4 border-double border-coral-ink bg-papel-claro px-4 py-6 text-center shadow-ficha md:col-span-1 md:col-start-2 md:row-start-2',
    },
    [
      h('p', { class: 'etiqueta' }, ['Expediente']),
      h('p', { class: 'font-display text-3xl font-extrabold text-coral-ink' }, ['Caso 08']),
    ],
  );

  const cards = CLUE_LIST.map((clue) => {
    const pin = h(
      'button',
      {
        type: 'button',
        'aria-pressed': 'false',
        class:
          'absolute -top-4 left-1/2 grid size-tactil -translate-x-1/2 touch-none place-items-center rounded-full',
      },
      [
        h('span', {
          class:
            'block size-5 rounded-full border-2 border-tinta bg-papel-claro shadow-ficha transition-colors duration-corta',
          'aria-hidden': 'true',
        }),
      ],
    );
    const body = h('div', { class: 'pt-3' }, [
      h('p', { class: 'etiqueta' }, [`Pista ${clue.numero}`]),
      h('h2', { class: 'mt-1 font-display text-lg font-extrabold leading-tight' }, [clue.titulo]),
      h('p', { class: 'mt-1 text-sm text-tinta-suave' }, [clue.resumen]),
    ]);
    if (clue.dato) {
      const chartId = clue.dato;
      const open = h(
        'button',
        { type: 'button', class: 'btn-secundario mt-2 min-h-tactil px-3 text-xs' },
        [
          icon(chartId === 'mapaCampus' ? 'map' : 'chart', 'size-4'),
          chartId === 'mapaCampus' ? 'Abrir el mapa' : 'Abrir el gráfico',
        ],
      );
      listen(open, 'click', () => onOpenChart(chartId));
      body.append(open);
    }
    const card = h(
      'article',
      {
        class: `ficha relative z-10 rotate-[-1deg] p-4 odd:rotate-[1deg] ${PLACEMENT[clue.id]}`,
      },
      [pin, body],
    );
    const string = document.createElementNS(SVG_NS, 'path');
    string.setAttribute('fill', 'none');
    string.setAttribute('stroke-width', '3');
    string.setAttribute('stroke-linecap', 'round');
    string.classList.add('stroke-coral');
    svg.append(string);
    return { clue, card, pin, string, connected: false };
  });

  const board = h(
    'div',
    {
      class:
        'relative grid select-none grid-cols-2 gap-x-3 gap-y-8 rounded-ficha border border-linea bg-papel-oscuro p-4 pt-8 md:grid-cols-3 md:grid-rows-[auto_auto_auto] md:gap-x-8 md:gap-y-10 md:p-8 md:pt-10',
    },
    [
      svg as unknown as HTMLElement,
      ...cards.slice(0, 3).map(({ card }) => card),
      caso,
      ...cards.slice(3).map(({ card }) => card),
    ],
  );

  const centerOf = (element: Element): { x: number; y: number } => {
    const boardRect = board.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - boardRect.left,
      y: rect.top + rect.height / 2 - boardRect.top,
    };
  };

  const stringPath = (from: { x: number; y: number }, to: { x: number; y: number }): string => {
    const sag = Math.min(40, Math.hypot(to.x - from.x, to.y - from.y) * 0.12);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 + sag;
    return `M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`;
  };

  const redraw = (): void => {
    const target = centerOf(caso);
    for (const { pin, string, connected } of cards) {
      string.setAttribute('d', stringPath(centerOf(pin), target));
      string.classList.toggle('hidden', !connected);
    }
  };

  const isOverCaso = (x: number, y: number): boolean => {
    const rect = caso.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  const cleanups: (() => void)[] = [];
  for (const entry of cards) {
    let start: { x: number; y: number } | null = null;
    let dragged = false;
    cleanups.push(
      listen(entry.pin, 'pointerdown', (event) => {
        start = { x: event.clientX, y: event.clientY };
        dragged = false;
        entry.pin.setPointerCapture(event.pointerId);
      }),
      listen(entry.pin, 'pointermove', (event) => {
        if (!start) return;
        if (
          !dragged &&
          Math.hypot(event.clientX - start.x, event.clientY - start.y) < DRAG_THRESHOLD_PX
        )
          return;
        dragged = true;
        const from = centerOf(entry.pin);
        const boardRect = board.getBoundingClientRect();
        draft.setAttribute('x1', String(from.x));
        draft.setAttribute('y1', String(from.y));
        draft.setAttribute('x2', String(event.clientX - boardRect.left));
        draft.setAttribute('y2', String(event.clientY - boardRect.top));
        draft.classList.remove('hidden');
        caso.classList.toggle('ring-4', isOverCaso(event.clientX, event.clientY));
      }),
      listen(entry.pin, 'pointerup', (event) => {
        draft.classList.add('hidden');
        caso.classList.remove('ring-4');
        if (dragged && isOverCaso(event.clientX, event.clientY) && !entry.connected)
          onToggle(entry.clue.id);
        start = null;
      }),
      listen(entry.pin, 'click', (event) => {
        // Tras un arrastre el navegador también dispara click: se ignora.
        if (dragged) {
          dragged = false;
          event.preventDefault();
          return;
        }
        onToggle(entry.clue.id);
      }),
    );
  }

  const resizeObserver = new ResizeObserver(redraw);
  resizeObserver.observe(board);

  const counter = h('p', { class: 'sello text-tinta' });
  const dataCards = (Object.keys(CHARTS) as ChartId[]).map((id) => {
    const button = h(
      'button',
      {
        type: 'button',
        class:
          'ficha flex min-h-tactil w-full items-center gap-3 p-4 text-left transition-colors hover:bg-papel-oscuro',
      },
      [
        icon(id === 'mapaCampus' ? 'map' : 'chart', 'size-6 text-coral-ink'),
        h('span', {}, [
          h('span', { class: 'block font-semibold' }, [CHARTS[id].titulo]),
          h('span', { class: 'block text-sm text-tinta-suave' }, [CHARTS[id].descripcion]),
        ]),
      ],
    );
    listen(button, 'click', () => onOpenChart(id));
    return button;
  });

  const element = h('div', { class: 'space-y-6' }, [
    counter,
    board,
    h('div', { class: 'grid gap-3 md:grid-cols-2' }, dataCards),
  ]);

  return {
    element,
    update(state) {
      counter.textContent = `Conectadas: ${state.connected.length} de ${cards.length}`;
      for (const entry of cards) {
        const connected = state.connected.includes(entry.clue.id);
        const changed = connected !== entry.connected;
        entry.connected = connected;
        entry.pin.setAttribute('aria-pressed', String(connected));
        entry.pin.setAttribute(
          'aria-label',
          connected
            ? `Pista ${entry.clue.numero} conectada con el Caso 08. Pulsa para desconectar`
            : `Conectar la pista ${entry.clue.numero} con el Caso 08`,
        );
        entry.pin.firstElementChild?.classList.toggle('bg-coral', connected);
        entry.pin.firstElementChild?.classList.toggle('border-coral-ink', connected);
        entry.pin.firstElementChild?.classList.toggle('bg-papel-claro', !connected);
        entry.pin.firstElementChild?.classList.toggle('border-tinta', !connected);
        if (changed && connected) {
          redraw();
          const length = entry.string.getTotalLength();
          gsap.fromTo(
            entry.string,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: duration(0.6),
              ease: EASE_OUT,
              clearProps: 'strokeDasharray,strokeDashoffset',
            },
          );
        }
      }
      redraw();
    },
    destroy() {
      resizeObserver.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    },
  };
}
