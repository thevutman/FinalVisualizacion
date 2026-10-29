import { CHARTS, type ChartId } from '../data/charts';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';

export interface ChartFrame {
  element: HTMLElement;
  /** Crea el iframe la primera vez que el gráfico se muestra (carga diferida). */
  load: () => void;
}

/**
 * Un gráfico de Flourish ocupando toda el área visual, con su título y la frase
 * que lo une a la pista. Sin URL todavía, muestra qué gráfico va en ese lugar.
 */
export function createChartFrame(id: ChartId): ChartFrame {
  const chart = CHARTS[id];
  const chartIcon = id === 'mapaCampus' ? 'map' : 'chart';
  const body = h('div', { class: 'relative min-h-0 flex-1' });
  const element = h(
    'figure',
    { class: 'flex size-full flex-col gap-3 bg-papel-claro p-4 lg:p-6' },
    [
      h('figcaption', { class: 'flex items-start gap-3' }, [
        icon(chartIcon, 'mt-1 size-7 text-coral-ink'),
        h('span', {}, [
          h('span', { class: 'block font-display text-2xl font-extrabold' }, [chart.titulo]),
          h('span', { class: 'block text-lg text-tinta' }, [chart.conexion]),
        ]),
      ]),
      body,
    ],
  );

  let loaded = false;
  return {
    element,
    load() {
      if (loaded) return;
      loaded = true;
      if (!chart.embedUrl) {
        body.append(
          h(
            'div',
            {
              class:
                'grid size-full place-items-center rounded-ficha border-4 border-dashed border-linea-fuerte p-6 text-center',
            },
            [
              h('p', { class: 'max-w-sm text-lg text-tinta-suave' }, [
                icon(chartIcon, 'mx-auto mb-2 size-12'),
                `Aquí va el gráfico de Flourish: ${chart.titulo}.`,
              ]),
            ],
          ),
        );
        return;
      }
      const status = h(
        'p',
        {
          class: 'absolute inset-0 grid place-items-center text-lg text-tinta-suave',
          role: 'status',
        },
        ['Cargando gráfico…'],
      );
      const frame = h('iframe', {
        src: chart.embedUrl,
        title: chart.titulo,
        class: 'relative size-full rounded-ficha bg-papel-claro',
        sandbox: 'allow-scripts allow-same-origin allow-popups',
        referrerpolicy: 'no-referrer',
      });
      listen(frame, 'load', () => status.remove(), { once: true });
      body.append(status, frame);
    },
  };
}
