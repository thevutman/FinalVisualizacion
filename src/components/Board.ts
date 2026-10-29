import gsap from 'gsap';
import { CLUE_LIST } from '../data/clues';
import { h } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';

export interface Board {
  element: HTMLElement;
  /** Tiende los hilos desde cada pista hasta el Caso 08. */
  join: (animate: boolean) => void;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Las 5 pistas en pentágono alrededor del caso (porcentajes del área visual). */
const POSITIONS: readonly (readonly [number, number])[] = [
  [50, 15],
  [83, 39],
  [71, 80],
  [29, 80],
  [17, 39],
];

/**
 * Tablero de corcho: el Caso 08 en el centro y las 5 pistas alrededor. Los hilos
 * se dibujan en un SVG que se estira con el área, así funciona en cualquier tamaño.
 */
export function createBoard(): Board {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('absolute', 'inset-0', 'size-full');

  const strings = POSITIONS.map(([x, y]) => {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(x));
    line.setAttribute('y1', String(y));
    line.setAttribute('x2', '50');
    line.setAttribute('y2', '50');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    line.style.opacity = '0';
    line.classList.add('stroke-coral-ink');
    line.style.strokeWidth = '4px';
    svg.append(line);
    return line;
  });

  const caso = h(
    'div',
    {
      class:
        'absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-ficha border-4 border-double border-coral-ink bg-papel-claro px-5 py-3 text-center shadow-ficha',
    },
    [
      h('span', { class: 'etiqueta' }, ['Expediente']),
      h('span', { class: 'font-display text-3xl font-extrabold text-coral-ink' }, ['Caso 08']),
    ],
  );

  const cards = CLUE_LIST.map((clue, index) => {
    const [x, y] = POSITIONS[index] ?? [50, 50];
    const card = h(
      'div',
      {
        class:
          'absolute flex w-[min(30%,13rem)] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-ficha border-2 border-ambar bg-papel-claro p-2 shadow-ficha lg:gap-3 lg:p-3',
      },
      [
        h(
          'span',
          {
            class:
              'grid size-10 shrink-0 place-items-center rounded-full bg-ambar text-tinta lg:size-12',
            'aria-hidden': 'true',
          },
          [icon(clue.id, 'size-6 lg:size-7')],
        ),
        h('span', { class: 'min-w-0' }, [
          h('span', { class: 'block text-sm font-semibold text-tinta-suave' }, [
            `Pista ${clue.numero}`,
          ]),
          h('span', { class: 'block text-base font-bold leading-tight lg:text-lg' }, [clue.titulo]),
        ]),
      ],
    );
    // Posición calculada a partir de los datos del pentágono.
    card.style.left = `${x}%`;
    card.style.top = `${y}%`;
    return card;
  });

  const element = h(
    'div',
    {
      class: 'relative size-full bg-papel-oscuro',
      role: 'img',
      'aria-label': `Tablero: las 5 pistas (${CLUE_LIST.map((clue) => clue.titulo).join(', ')}) alrededor del Caso 08.`,
    },
    [svg as unknown as HTMLElement, caso, ...cards],
  );

  return {
    element,
    join(animate) {
      // Largo de cada hilo en píxeles de pantalla (el SVG se estira con el área).
      const { width, height } = svg.getBoundingClientRect();
      strings.forEach((line, index) => {
        const [x, y] = POSITIONS[index] ?? [50, 50];
        const length = Math.hypot(((x - 50) * width) / 100, ((y - 50) * height) / 100);
        gsap.fromTo(
          line,
          { opacity: 1, strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: animate ? duration(0.6) : 0,
            delay: animate ? duration(0.25) * index : 0,
            ease: EASE_OUT,
            clearProps: 'strokeDasharray,strokeDashoffset',
          },
        );
      });
      caso.classList.add('bg-coral-ink');
      caso.classList.remove('bg-papel-claro');
      caso.querySelectorAll('span').forEach((span) => span.classList.add('!text-papel-claro'));
    },
  };
}
