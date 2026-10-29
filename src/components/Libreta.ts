import gsap from 'gsap';
import { CLUE_LIST } from '../data/clues';
import { UI_TEXT } from '../data/screens';
import { h } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration } from '../lib/motion';
import { TOTAL_CLUES, type CaseState } from '../state/store';

export interface Libreta {
  element: HTMLElement;
  update: (state: CaseState) => void;
}

/** Franja inferior con las 5 pistas: cada una tiene su ícono y se llena al encontrarla. */
export function createLibreta(): Libreta {
  const count = h('span', { class: 'font-mono text-base font-medium' });
  const slots = CLUE_LIST.map((clue) => {
    const label = h('span', { class: 'hidden truncate sm:inline' });
    const status = h('span', { class: 'sr-only' });
    const badge = h(
      'span',
      {
        class: 'grid size-9 shrink-0 place-items-center rounded-full border-2',
        'aria-hidden': 'true',
      },
      [icon(clue.id, 'size-6')],
    );
    const item = h(
      'li',
      {
        class:
          'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-ficha border-2 px-2 py-1 text-base font-semibold transition-colors duration-corta sm:justify-start',
      },
      [badge, label, status],
    );
    return { clue, item, badge, label, status };
  });

  const element = h(
    'section',
    {
      'aria-label': UI_TEXT.libreta,
      class: 'flex items-center gap-4 border-t border-linea bg-papel-claro/90 px-4 py-1.5 lg:px-8',
    },
    [
      h('p', { class: 'hidden shrink-0 items-center gap-2 font-semibold lg:flex' }, [
        icon('libreta'),
        UI_TEXT.libreta,
        count,
      ]),
      h(
        'ol',
        { class: 'flex min-w-0 flex-1 gap-2' },
        slots.map(({ item }) => item),
      ),
    ],
  );

  return {
    element,
    update(state) {
      count.textContent = UI_TEXT.contador(state.found.length, TOTAL_CLUES);
      for (const { clue, item, badge, label, status } of slots) {
        const found = state.found.includes(clue.id);
        const wasFound = item.dataset.lleno === 'true';
        item.dataset.lleno = String(found);
        label.textContent = found ? clue.titulo : UI_TEXT.pistaVacia(clue.numero);
        status.textContent = found
          ? `Pista ${clue.numero}: ${clue.titulo}`
          : `Pista ${clue.numero}: sin encontrar`;
        item.classList.toggle('border-ambar', found);
        item.classList.toggle('bg-ambar-claro', found);
        item.classList.toggle('border-dashed', !found);
        item.classList.toggle('border-linea-fuerte', !found);
        item.classList.toggle('text-tinta-suave', !found);
        badge.classList.toggle('border-ambar-ink', found);
        badge.classList.toggle('bg-ambar', found);
        badge.classList.toggle('text-tinta', found);
        badge.classList.toggle('border-linea-fuerte', !found);
        if (found && !wasFound) {
          gsap.fromTo(
            item,
            { scale: 0.9 },
            { scale: 1, duration: duration(0.5), ease: 'back.out(2)' },
          );
        }
      }
    },
  };
}
