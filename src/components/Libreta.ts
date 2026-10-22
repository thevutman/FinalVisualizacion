import gsap from 'gsap';
import { CLUE_LIST, type ClueId } from '../data/clues';
import { UI_TEXT } from '../data/screens';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';
import { TOTAL_CLUES, type CaseState } from '../state/store';

export interface LibretaProps {
  onOpenClue: (id: ClueId) => void;
}

export interface Libreta {
  element: HTMLElement;
  update: (state: CaseState) => void;
}

/**
 * Libreta de pistas, siempre visible. En celular es un panel inferior plegable;
 * desde md es una fila fija debajo de la escena.
 */
export function createLibreta({ onOpenClue }: LibretaProps): Libreta {
  const count = h('span', { class: 'font-mono text-sm text-tinta-suave' });
  const toggle = h(
    'button',
    {
      type: 'button',
      class: 'flex min-h-tactil w-full items-center justify-between gap-3 md:hidden',
      'aria-expanded': 'false',
      'aria-controls': 'libreta-lista',
    },
    [
      h('span', { class: 'flex items-center gap-2 font-semibold' }, [
        icon('notebook'),
        UI_TEXT.libreta,
      ]),
      h('span', { class: 'flex items-center gap-2' }, [
        count,
        icon(
          'chevronUp',
          'size-5 transition-transform duration-corta group-data-[open=true]:rotate-180',
        ),
      ]),
    ],
  );
  const heading = h(
    'h2',
    { class: 'hidden items-center gap-2 font-sans text-sm font-semibold tracking-normal md:flex' },
    [icon('notebook', 'size-4'), UI_TEXT.libreta],
  );
  const slots = CLUE_LIST.map((clue) => {
    const slot = h('button', {
      type: 'button',
      class:
        'flex min-h-tactil w-full items-center gap-2 rounded-ficha border-2 border-dashed border-linea-fuerte px-3 py-2 text-left text-sm text-tinta-tenue disabled:cursor-default data-[lleno=true]:border-solid data-[lleno=true]:border-ambar data-[lleno=true]:bg-ambar-claro/70 data-[lleno=true]:font-semibold data-[lleno=true]:text-tinta',
    });
    listen(slot, 'click', () => onOpenClue(clue.id));
    return { clue, slot };
  });
  const list = h(
    'ul',
    {
      id: 'libreta-lista',
      class:
        'mt-2 hidden gap-2 group-data-[open=true]:grid sm:grid-cols-2 md:mt-3 md:grid md:grid-cols-5',
    },
    slots.map(({ slot }) => h('li', {}, [slot])),
  );
  const element = h(
    'section',
    {
      'aria-label': UI_TEXT.libreta,
      class:
        'group fixed inset-x-0 bottom-0 z-libreta border-t border-linea bg-papel-claro/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 shadow-ficha backdrop-blur md:static md:z-auto md:rounded-ficha md:border md:bg-papel-claro md:p-4 md:shadow-none',
      'data-open': 'false',
    },
    [toggle, heading, list],
  );

  listen(toggle, 'click', () => {
    const open = element.dataset.open !== 'true';
    element.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  return {
    element,
    update(state) {
      count.textContent = `${state.found.length} de ${TOTAL_CLUES}`;
      for (const { clue, slot } of slots) {
        const found = state.found.includes(clue.id);
        const wasFound = slot.dataset.lleno === 'true';
        slot.dataset.lleno = String(found);
        slot.disabled = !found;
        slot.replaceChildren(
          h('span', { class: 'font-mono text-xs', 'aria-hidden': 'true' }, [String(clue.numero)]),
          found ? clue.titulo : UI_TEXT.pistaVacia(clue.numero),
        );
        slot.setAttribute(
          'aria-label',
          found
            ? `Pista ${clue.numero}: ${clue.titulo}. Ver ficha`
            : UI_TEXT.pistaVacia(clue.numero),
        );
        if (found && !wasFound) {
          gsap.fromTo(slot, { scale: 0.92 }, { scale: 1, duration: duration(0.5), ease: EASE_OUT });
        }
      }
    },
  };
}
