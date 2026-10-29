import gsap from 'gsap';
import { CASES, ZONE_COLOR } from '../../data/casos';
import { h } from '../../lib/dom';
import { duration, EASE_OUT } from '../../lib/motion';
import { s } from '../../lib/svg';
import type { Chart } from './types';

const ROW = 88;
const BAR = 56;
const LABEL_WIDTH = 220;
const MAX_BAR = 380;

/** Semanas que duró cada caso (solo hay dato para 4). Barras horizontales, de 2019 a hoy. */
export function createDurationChart(): Chart {
  const measured = CASES.filter((item) => item.weeks !== null);
  const longest = Math.max(...measured.map((item) => item.weeks ?? 0));

  const bars: SVGRectElement[] = [];
  const rows = measured.map((item, index) => {
    const y = index * ROW;
    const weeks = item.weeks ?? 0;
    const length = Math.max(10, (weeks / longest) * MAX_BAR);
    const bar = s('rect', {
      x: LABEL_WIDTH,
      y,
      width: length,
      height: BAR,
      rx: 8,
      fill: ZONE_COLOR[item.zone],
      stroke: item.ongoing ? '#B23A30' : 'none',
      'stroke-width': item.ongoing ? 4 : 0,
      'stroke-dasharray': item.ongoing ? '8 5' : undefined,
    });
    bars.push(bar);
    const value = `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}${item.ongoing ? ' · sigue abierto' : ''}`;
    return s('g', {}, [
      s('text', { x: 0, y: y + BAR / 2 + 9, class: 'fill-tinta text-[26px] font-bold' }, [
        `Caso ${item.id}`,
      ]),
      s('text', { x: 112, y: y + BAR / 2 + 9, class: 'fill-tinta text-[22px]' }, [
        `(${item.year})`,
      ]),
      bar,
      s(
        'text',
        { x: LABEL_WIDTH + length + 12, y: y + BAR / 2 + 9, class: 'fill-tinta text-[24px]' },
        [value],
      ),
    ]);
  });

  const svg = s(
    'svg',
    { viewBox: `0 0 860 ${measured.length * ROW}`, class: 'size-full', 'aria-hidden': 'true' },
    rows,
  );
  const summary = measured.map((item) => `caso ${item.id}: ${item.weeks} semanas`).join(', ');
  const element = h(
    'div',
    {
      class: 'size-full min-h-0',
      role: 'img',
      'aria-label': `Tiempo que duró cada caso. ${summary}. El caso 8 sigue abierto.`,
    },
    [svg],
  );

  return {
    element,
    animate() {
      gsap.fromTo(
        bars,
        { scaleX: 0, transformOrigin: '0% 50%' },
        { scaleX: 1, duration: duration(0.7), ease: EASE_OUT, stagger: duration(0.15) },
      );
    },
  };
}
