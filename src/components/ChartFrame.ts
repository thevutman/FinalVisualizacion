import { CHARTS, type ChartId } from '../data/charts';
import { h } from '../lib/dom';
import { icon } from '../lib/icons';
import { createChart, type Chart } from './charts';

export interface ChartFrame {
  element: HTMLElement;
  /** Crea el gráfico la primera vez y anima sus datos cada vez que se muestra. */
  show: () => void;
}

/** Un gráfico ocupando toda el área visual, con su título y la frase que lo une a la historia. */
export function createChartFrame(id: ChartId): ChartFrame {
  const info = CHARTS[id];
  const body = h('div', { class: 'min-h-0 flex-1' });
  const element = h(
    'figure',
    { class: 'flex size-full flex-col gap-4 bg-papel-claro p-4 lg:p-6' },
    [
      h('figcaption', { class: 'flex items-start gap-3' }, [
        icon(info.icono, 'mt-1 size-7 text-coral-ink'),
        h('span', {}, [
          h('span', { class: 'block font-display text-2xl font-extrabold' }, [info.titulo]),
          h('span', { class: 'block text-lg text-tinta' }, [info.conexion]),
        ]),
      ]),
      body,
    ],
  );

  let chart: Chart | null = null;
  return {
    element,
    show() {
      if (!chart) {
        chart = createChart(id);
        body.append(chart.element);
      }
      chart.animate();
    },
  };
}
