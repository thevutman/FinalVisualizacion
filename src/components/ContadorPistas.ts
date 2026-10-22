import { CLUE_IDS } from '../data/clues';
import { UI_TEXT } from '../data/screens';
import { h } from '../lib/dom';
import { TOTAL_CLUES, type CaseState } from '../state/store';

export interface ContadorPistas {
  element: HTMLElement;
  update: (state: CaseState) => void;
}

/** "Pistas: N de 5" con cinco marcas que se llenan. Los hallazgos se anuncian desde el Announcer. */
export function createContadorPistas(): ContadorPistas {
  const label = h('span', { class: 'font-mono text-sm font-medium' });
  const pips = CLUE_IDS.map(() =>
    h('span', {
      class: 'size-2.5 rounded-full border-2 border-tinta-suave transition-colors duration-corta',
      'aria-hidden': 'true',
    }),
  );
  const element = h('p', { class: 'sello gap-3 text-tinta' }, [
    label,
    h('span', { class: 'flex gap-1' }, pips),
  ]);

  return {
    element,
    update(state) {
      label.textContent = UI_TEXT.contador(state.found.length, TOTAL_CLUES);
      pips.forEach((pip, index) => {
        const filled = index < state.found.length;
        pip.classList.toggle('bg-ambar', filled);
        pip.classList.toggle('border-ambar-ink', filled);
      });
    },
  };
}
