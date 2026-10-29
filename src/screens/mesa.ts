import { createButton } from '../components/Button';
import { neighborsOf, UI_TEXT } from '../data/screens';
import { TOOL_IDS, TOOLS } from '../data/tools';
import { h } from '../lib/dom';
import { icon } from '../lib/icons';
import type { ExamView } from './types';

/**
 * Paso 02 · Mesa de examen: la linterna completa (se puede girar) y la leyenda
 * de las 5 herramientas que vienen, en el orden en que se usan.
 */
export const mesaStep: ExamView = {
  screen: 'mesa',
  tool: null,
  mount({ app, frame }) {
    const { previous, next } = neighborsOf('mesa');
    frame.body.append(
      h(
        'ol',
        { class: 'grid gap-1.5', 'aria-label': 'Las 5 herramientas, en orden' },
        TOOL_IDS.map((tool, index) =>
          h('li', { class: 'flex items-center gap-3 rounded-ficha bg-papel-claro px-3 py-1' }, [
            h(
              'span',
              {
                class:
                  'grid size-9 shrink-0 place-items-center rounded-full bg-tinta text-papel-claro',
                'aria-hidden': 'true',
              },
              [icon(tool)],
            ),
            h('span', { class: 'text-lg leading-tight' }, [
              h('span', { class: 'font-bold' }, [`${index + 1}. ${TOOLS[tool].nombre}: `]),
              TOOLS[tool].explicacion.toLowerCase(),
            ]),
          ]),
        ),
      ),
    );
    if (previous) {
      frame.nav.append(
        createButton({
          label: UI_TEXT.atras,
          icon: 'arrowLeft',
          variant: 'secundario',
          onClick: () => app.go(previous),
        }),
      );
    }
    if (next) {
      frame.nav.append(
        createButton({
          label: UI_TEXT.empezar,
          iconAfter: 'arrowRight',
          onClick: () => app.go(next),
        }),
      );
    }
    return { onState: () => undefined, destroy: () => undefined };
  },
};
