import gsap from 'gsap';
import { CAMPUS_MAP, CASES, ZONE_COLOR } from '../../data/casos';
import { h } from '../../lib/dom';
import { duration } from '../../lib/motion';
import { s } from '../../lib/svg';
import type { Chart } from './types';
import { createZoneLegend } from './ZoneLegend';

const { width, height, view } = CAMPUS_MAP;
const px = (percent: number, total: number): number => (percent / 100) * total;

/**
 * Mapa del campus con los 8 casos numerados y pintados por zona. Los parqueaderos
 * (de donde viene la tierra de las huellas) se resaltan, y el caso 8 lleva un anillo.
 */
export function createCaseMap(): Chart {
  const parking = CASES.filter((item) => item.zone === 'Parqueaderos');
  const parkingX = parking.reduce((sum, item) => sum + px(item.x, width), 0) / parking.length;
  const parkingY = parking.reduce((sum, item) => sum + px(item.y, height), 0) / parking.length;

  const markers = CASES.map((item) => {
    const x = px(item.x, width);
    const y = px(item.y, height);
    return s('g', {}, [
      item.ongoing &&
        s('circle', {
          cx: x,
          cy: y,
          r: 29,
          fill: 'none',
          stroke: '#B23A30',
          'stroke-width': 4,
          'stroke-dasharray': '8 5',
        }),
      s('circle', {
        cx: x,
        cy: y,
        r: 21,
        fill: ZONE_COLOR[item.zone],
        stroke: '#FBF8F2',
        'stroke-width': 3,
      }),
      s(
        'text',
        { x, y: y + 8, 'text-anchor': 'middle', class: 'fill-tinta text-[24px] font-bold' },
        [String(item.id)],
      ),
    ]);
  });

  const svg = s(
    'svg',
    {
      viewBox: `${view.x} ${view.y} ${view.w} ${view.h}`,
      class: 'size-full',
      'aria-hidden': 'true',
    },
    [
      s('image', {
        href: `${import.meta.env.BASE_URL}${CAMPUS_MAP.src}`,
        x: 0,
        y: 0,
        width,
        height,
      }),
      s('ellipse', {
        cx: parkingX,
        cy: parkingY,
        rx: 64,
        ry: 52,
        fill: 'rgb(232 163 60 / 0.25)',
        stroke: '#8A5300',
        'stroke-width': 3,
        'stroke-dasharray': '10 6',
      }),
      ...markers,
    ],
  );

  const element = h(
    'div',
    {
      class: 'grid size-full min-h-0 gap-4 md:grid-cols-[minmax(0,1fr)_auto]',
      role: 'img',
      'aria-label':
        'Mapa del campus con los 8 casos: 3 en parqueaderos (casos 1, 4 y 8), 2 en la biblioteca, 2 en zonas verdes y 1 en la cafetería. El caso 8 sigue abierto.',
    },
    [
      h('div', { class: 'min-h-0' }, [svg]),
      h('div', { class: 'flex flex-col justify-center gap-4' }, [
        createZoneLegend('column'),
        h(
          'p',
          {
            class:
              'max-w-[14rem] rounded-ficha border-2 border-dashed border-ambar-ink p-3 text-lg',
          },
          [h('span', { class: 'font-bold' }, ['Parqueaderos: ']), 'casos 1, 4 y 8.'],
        ),
        h(
          'p',
          {
            class:
              'max-w-[14rem] rounded-ficha border-2 border-dashed border-coral-ink p-3 text-lg',
          },
          [h('span', { class: 'font-bold' }, ['Caso 8: ']), 'sigue abierto.'],
        ),
      ]),
    ],
  );

  return {
    element,
    animate() {
      gsap.fromTo(
        markers,
        { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' },
        {
          opacity: 1,
          scale: 1,
          duration: duration(0.45),
          ease: 'back.out(2)',
          stagger: duration(0.1),
        },
      );
    },
  };
}
