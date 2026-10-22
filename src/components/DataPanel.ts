import { CHARTS, type ChartId } from '../data/charts';
import { h, listen } from '../lib/dom';
import type { Modal } from './Modal';

/**
 * Abre un gráfico de Flourish en el panel modal. El iframe se crea recién al abrir
 * (carga diferida) y se destruye al cerrar.
 */
export function openChart(modal: Modal, id: ChartId): void {
  const chart = CHARTS[id];
  const body = h('div', { class: 'space-y-3' }, [
    h('p', { class: 'text-cuerpo text-tinta-suave' }, [chart.descripcion]),
  ]);

  if (!chart.embedUrl) {
    body.append(
      h(
        'div',
        {
          class:
            'grid min-h-48 place-items-center rounded-ficha border-2 border-dashed border-linea-fuerte p-6 text-center',
        },
        [
          h('p', { class: 'max-w-sm text-sm text-tinta-suave' }, [
            'Gráfico pendiente: pega la URL de embed de Flourish en ',
            h('code', { class: 'font-mono' }, ['src/data/charts.ts']),
            '.',
          ]),
        ],
      ),
    );
  } else {
    const status = h(
      'p',
      {
        class: 'absolute inset-0 grid place-items-center text-sm text-tinta-suave',
        role: 'status',
      },
      ['Cargando gráfico…'],
    );
    const frame = h('iframe', {
      src: chart.embedUrl,
      title: chart.titulo,
      loading: 'lazy',
      class: 'relative block w-full rounded-ficha bg-papel-claro',
      height: chart.alto,
      sandbox: 'allow-scripts allow-same-origin allow-popups',
      referrerpolicy: 'no-referrer',
    });
    frame.classList.add('h-[70vh]', 'md:h-auto');
    listen(frame, 'load', () => status.remove(), { once: true });
    body.append(h('div', { class: 'relative' }, [status, frame]));
  }

  modal.open({ etiqueta: 'Datos del caso', titulo: chart.titulo, body, ancho: 'grafico' });
}
