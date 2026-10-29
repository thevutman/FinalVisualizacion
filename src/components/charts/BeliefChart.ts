import gsap from 'gsap';
import { BELIEF, type BeliefId } from '../../data/casos';
import { h } from '../../lib/dom';
import { duration } from '../../lib/motion';
import { s } from '../../lib/svg';
import type { Chart } from './types';

const CELL = 36;
const GAP = 6;

export interface BeliefChart extends Chart {
  /** Resalta la respuesta que coincide con el voto del usuario. */
  highlight: (id: BeliefId | null) => void;
}

/** ¿El zorro es real? 100 cuadros, uno por estudiante, agrupados por respuesta. */
export function createBeliefChart(): BeliefChart {
  const owners = BELIEF.flatMap((group) => Array.from({ length: group.v }, () => group));
  const cells = owners.map((group, index) =>
    s('rect', {
      x: (index % 10) * (CELL + GAP),
      y: Math.floor(index / 10) * (CELL + GAP),
      width: CELL,
      height: CELL,
      rx: 5,
      fill: group.color,
      'data-grupo': group.id,
    }),
  );
  const side = 10 * (CELL + GAP) - GAP;
  const svg = s(
    'svg',
    { viewBox: `0 0 ${side} ${side}`, class: 'size-full', 'aria-hidden': 'true' },
    cells,
  );

  const legend = BELIEF.map((group) => {
    const swatch = h('span', { class: 'mt-1 size-6 shrink-0 rounded', 'aria-hidden': 'true' });
    swatch.style.backgroundColor = group.color;
    const item = h(
      'li',
      {
        class:
          'flex items-start gap-3 rounded-ficha border-2 border-transparent p-2 transition-opacity',
      },
      [
        swatch,
        h('span', {}, [
          h('span', { class: 'block font-display text-4xl font-extrabold leading-none' }, [
            `${group.v} %`,
          ]),
          h('span', { class: 'block text-lg' }, [`${group.nombre} · ${group.v} de cada 100`]),
        ]),
      ],
    );
    return { group, item };
  });

  const element = h(
    'div',
    {
      class: 'grid size-full min-h-0 items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]',
      role: 'img',
      'aria-label': `Encuesta a 100 estudiantes: ${BELIEF.map((group) => `${group.v} ${group.nombre.toLowerCase()}`).join(', ')}.`,
    },
    [
      h('div', { class: 'min-h-0 md:h-full' }, [svg]),
      h('div', { class: 'space-y-2' }, [
        h(
          'ul',
          { class: 'grid gap-2' },
          legend.map(({ item }) => item),
        ),
        h('p', { class: 'text-base text-tinta-suave' }, ['Cada cuadro es 1 estudiante.']),
      ]),
    ],
  );

  let selected: BeliefId | null = null;
  /** Los grupos que no coinciden con la respuesta del usuario quedan apagados. */
  const opacityOf = (cell: SVGRectElement): number =>
    selected && cell.getAttribute('data-grupo') !== selected ? 0.25 : 1;

  return {
    element,
    animate() {
      gsap.fromTo(
        cells,
        { opacity: 0 },
        {
          opacity: (_index: number, cell: SVGRectElement) => opacityOf(cell),
          duration: duration(0.3),
          stagger: duration(0.008),
        },
      );
    },
    highlight(id) {
      selected = id;
      for (const cell of cells) gsap.set(cell, { opacity: opacityOf(cell) });
      for (const { group, item } of legend) {
        const mine = group.id === id;
        item.classList.toggle('border-coral-ink', mine);
        item.classList.toggle('bg-papel-claro', mine);
        item.classList.toggle('opacity-50', id !== null && !mine);
      }
    },
  };
}
