import gsap from 'gsap';
import { CASES, YEARS, ZONE_COLOR } from '../../data/casos';
import { h } from '../../lib/dom';
import { duration, EASE_OUT } from '../../lib/motion';
import { s } from '../../lib/svg';
import type { Chart } from './types';
import { createZoneLegend } from './ZoneLegend';

const WIDTH = 760;
const BASE = 330;
const COLUMN = WIDTH / YEARS.length;
const SQUARE = 70;
const GAP = 10;

/**
 * Casos por año: cada caso es un cuadro (como cada raya de la linterna), apilado
 * en su año y pintado con el color de su zona. El caso 8 lleva borde: sigue abierto.
 */
export function createYearlyChart(): Chart {
  const squares: SVGGElement[] = [];
  const columns = YEARS.map((year, index) => {
    const x = index * COLUMN + COLUMN / 2;
    const cases = CASES.filter((item) => item.year === year);
    const stack = cases.map((item, level) => {
      const y = BASE - (level + 1) * (SQUARE + GAP);
      const group = s('g', {}, [
        s('rect', {
          x: x - SQUARE / 2,
          y,
          width: SQUARE,
          height: SQUARE,
          rx: 10,
          fill: ZONE_COLOR[item.zone],
          stroke: item.ongoing ? '#B23A30' : 'none',
          'stroke-width': item.ongoing ? 5 : 0,
          'stroke-dasharray': item.ongoing ? '10 6' : undefined,
        }),
        s(
          'text',
          {
            x,
            y: y + SQUARE / 2 + 9,
            'text-anchor': 'middle',
            class: 'fill-tinta text-[26px] font-bold',
          },
          [String(item.id)],
        ),
      ]);
      squares.push(group);
      return group;
    });
    const top = BASE - cases.length * (SQUARE + GAP) - 12;
    return s('g', {}, [
      ...stack,
      s(
        'text',
        {
          x,
          y: cases.length ? top : BASE - 14,
          'text-anchor': 'middle',
          class: 'fill-tinta text-[20px]',
        },
        [cases.length === 0 ? 'ninguno' : cases.length === 1 ? '1 caso' : `${cases.length} casos`],
      ),
      s(
        'text',
        { x, y: BASE + 36, 'text-anchor': 'middle', class: 'fill-tinta text-[24px] font-bold' },
        [String(year)],
      ),
    ]);
  });

  // Recorte vertical: desde la etiqueta de la columna más alta hasta los años.
  const tallest = Math.max(
    ...YEARS.map((year) => CASES.filter((item) => item.year === year).length),
  );
  const top = BASE - tallest * (SQUARE + GAP) - 40;
  const svg = s(
    'svg',
    { viewBox: `0 ${top} ${WIDTH} ${BASE + 50 - top}`, class: 'size-full', 'aria-hidden': 'true' },
    [
      s('line', { x1: 0, x2: WIDTH, y1: BASE, y2: BASE, class: 'stroke-tinta', 'stroke-width': 2 }),
      ...columns,
    ],
  );
  const ongoingNote = h('p', { class: 'flex items-center gap-2 text-lg' }, [
    h('span', {
      class: 'size-5 shrink-0 rounded border-[3px] border-dashed border-coral-ink',
      'aria-hidden': 'true',
    }),
    h('span', {}, [
      h('span', { class: 'font-semibold' }, ['Borde punteado: ']),
      'el caso 8 sigue abierto.',
    ]),
  ]);

  const summary = YEARS.map(
    (year) => `${year}: ${CASES.filter((item) => item.year === year).length}`,
  ).join(', ');
  const element = h(
    'div',
    {
      class: 'flex size-full min-h-0 flex-col justify-center gap-3',
      role: 'img',
      'aria-label': `Casos por año. ${summary}.`,
    },
    [createZoneLegend(), ongoingNote, h('div', { class: 'min-h-0 flex-1' }, [svg])],
  );

  return {
    element,
    animate() {
      gsap.fromTo(
        squares,
        { opacity: 0, y: -40 },
        { opacity: 1, y: 0, duration: duration(0.5), ease: EASE_OUT, stagger: duration(0.12) },
      );
    },
  };
}
