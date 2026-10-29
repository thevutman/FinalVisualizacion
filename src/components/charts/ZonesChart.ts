import gsap from 'gsap';
import { CASES, ZONE_COLOR, ZONES } from '../../data/casos';
import { h } from '../../lib/dom';
import { duration, EASE_OUT } from '../../lib/motion';
import { s } from '../../lib/svg';
import type { Chart } from './types';

const ROW = 92;
const SQUARE = 70;
const GAP = 10;
const LABEL_WIDTH = 250;

/** ¿Dónde ataca el zorro? Una fila por zona, con un cuadro por caso (de más a menos). */
export function createZonesChart(): Chart {
  const rows = [...ZONES]
    .map((zone) => ({ zone, cases: CASES.filter((item) => item.zone === zone) }))
    .sort((a, b) => b.cases.length - a.cases.length);

  const squares: SVGGElement[] = [];
  const content = rows.map(({ zone, cases }, index) => {
    const y = index * ROW;
    const cells = cases.map((item, column) => {
      const x = LABEL_WIDTH + column * (SQUARE + GAP);
      const group = s('g', {}, [
        s('rect', { x, y, width: SQUARE, height: SQUARE, rx: 10, fill: ZONE_COLOR[zone] }),
        s(
          'text',
          {
            x: x + SQUARE / 2,
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
    const end = LABEL_WIDTH + cases.length * (SQUARE + GAP) + 6;
    return s('g', {}, [
      s('text', { x: 0, y: y + SQUARE / 2 + 9, class: 'fill-tinta text-[26px] font-bold' }, [zone]),
      ...cells,
      s('text', { x: end, y: y + SQUARE / 2 + 9, class: 'fill-tinta text-[24px]' }, [
        cases.length === 1 ? '1 caso' : `${cases.length} casos`,
      ]),
    ]);
  });

  const svg = s(
    'svg',
    { viewBox: `0 0 720 ${rows.length * ROW}`, class: 'size-full', 'aria-hidden': 'true' },
    content,
  );
  const summary = rows.map(({ zone, cases }) => `${zone}: ${cases.length}`).join(', ');
  const element = h(
    'div',
    { class: 'size-full min-h-0', role: 'img', 'aria-label': `Casos por zona. ${summary}.` },
    [svg],
  );

  return {
    element,
    animate() {
      gsap.fromTo(
        squares,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: duration(0.45), ease: EASE_OUT, stagger: duration(0.1) },
      );
    },
  };
}
