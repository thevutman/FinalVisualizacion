import { CLUE_LIST } from '../data/clues';
import { SCREENS } from '../data/screens';
import { TOOL_IDS, TOOLS } from '../data/tools';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { store } from '../state/store';
import type { ExamView } from './types';

/** Pantalla 02 · Mesa de examen: la linterna completa y la elección de herramienta. */
export const mesaView: ExamView = {
  screen: 'mesa',
  tool: null,
  createPanel({ app }) {
    const cards = TOOL_IDS.map((tool) => {
      const clue = CLUE_LIST.find((item) => item.herramienta === tool);
      const status = h('span', { class: 'text-xs text-tinta-suave' });
      const button = h(
        'button',
        {
          type: 'button',
          class:
            'ficha flex min-h-tactil w-full items-start gap-3 p-3 text-left transition-colors hover:bg-papel-oscuro',
        },
        [
          icon(tool, 'mt-0.5 size-5 text-coral-ink'),
          h('span', { class: 'grid gap-0.5' }, [
            h('span', { class: 'font-semibold' }, [TOOLS[tool].nombre]),
            h('span', { class: 'text-sm text-tinta-suave' }, [SCREENS[tool].intro]),
            status,
          ]),
        ],
      );
      listen(button, 'click', () => app.go(tool));
      const update = (): void => {
        const found = clue ? store.get().found.includes(clue.id) : false;
        status.textContent = found ? `Pista ${clue?.numero ?? ''} encontrada` : 'Sin examinar';
        status.classList.toggle('text-ambar-ink', found);
        status.classList.toggle('font-semibold', found);
      };
      update();
      return { element: h('li', {}, [button]), update };
    });

    return {
      element: h('div', { class: 'grid gap-3' }, [
        h('p', { class: 'etiqueta', id: 'mesa-herramientas' }, ['Herramientas de examen']),
        h(
          'ul',
          {
            class: 'grid gap-2 sm:grid-cols-2 lg:grid-cols-1',
            'aria-labelledby': 'mesa-herramientas',
          },
          cards.map(({ element }) => element),
        ),
      ]),
      onStateChange: () => cards.forEach(({ update }) => update()),
    };
  },
};
