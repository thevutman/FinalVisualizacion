import { CLUE_LIST } from '../data/clues';
import type { ScreenId } from '../data/screens';
import { TOOL_IDS, TOOLS } from '../data/tools';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import type { CaseState } from '../state/store';

export interface ToolbarProps {
  onSelect: (screen: ScreenId) => void;
}

export interface Toolbar {
  element: HTMLElement;
  update: (state: CaseState) => void;
}

/** Barra fija de herramientas: la mesa más las cinco herramientas de examen. */
export function createToolbar({ onSelect }: ToolbarProps): Toolbar {
  const items: {
    id: ScreenId;
    label: string;
    button: HTMLButtonElement;
    check: SVGElement | null;
  }[] = [];

  const add = (id: ScreenId, label: string, withCheck: boolean): HTMLLIElement => {
    const check = withCheck ? icon('check', 'size-4 text-ambar-ink') : null;
    if (check) check.classList.add('hidden');
    const button = h(
      'button',
      {
        type: 'button',
        class:
          'flex min-h-tactil w-full items-center gap-2 whitespace-nowrap rounded-ficha border border-transparent px-3 text-sm font-semibold text-tinta-suave transition-colors duration-corta ease-salida hover:bg-papel-oscuro aria-[current=page]:border-tinta aria-[current=page]:bg-tinta aria-[current=page]:text-papel-claro',
      },
      [
        icon(id === 'mesa' ? 'mesa' : (id as (typeof TOOL_IDS)[number]), 'size-4'),
        h('span', {}, [label]),
        check,
      ],
    );
    listen(button, 'click', () => onSelect(id));
    items.push({ id, label, button, check });
    return h('li', { class: 'shrink-0 snap-start' }, [button]);
  };

  const element = h(
    'nav',
    { 'aria-label': 'Herramientas de examen', class: 'border-b border-linea' },
    [
      h('ul', { class: '-mx-4 flex snap-x gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0' }, [
        add('mesa', 'Mesa', false),
        ...TOOL_IDS.map((id) => add(id, TOOLS[id].nombre, true)),
      ]),
    ],
  );

  return {
    element,
    update(state) {
      for (const { id, label, button, check } of items) {
        const active = state.screen === id;
        if (active) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
        const done = CLUE_LIST.some(
          (clue) => clue.herramienta === id && state.found.includes(clue.id),
        );
        check?.classList.toggle('hidden', !done);
        button.setAttribute('aria-label', done ? `${label} (pista encontrada)` : label);
      }
    },
  };
}
