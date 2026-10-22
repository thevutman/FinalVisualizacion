import { PHASES, SCREEN_IDS, SCREENS, UI_TEXT, type ScreenId } from '../data/screens';
import { h, listen } from '../lib/dom';
import type { CaseState } from '../state/store';

export interface ProgressDotsProps {
  canEnter: (id: ScreenId, state: CaseState) => boolean;
  onSelect: (id: ScreenId) => void;
}

export interface ProgressDots {
  element: HTMLElement;
  update: (state: CaseState) => void;
}

/** Indicador de 9 puntos, uno por pantalla. Los puntos bloqueados no se pueden elegir todavía. */
export function createProgressDots({ canEnter, onSelect }: ProgressDotsProps): ProgressDots {
  const phase = h('p', { class: 'etiqueta hidden lg:block' });
  const dots = SCREEN_IDS.map((id) => {
    const screen = SCREENS[id];
    const button = h(
      'button',
      {
        type: 'button',
        class:
          'group grid h-tactil w-full place-items-center rounded-full disabled:cursor-not-allowed sm:w-tactil',
      },
      [
        h('span', {
          class:
            'block size-3 rounded-full border-2 border-tinta-suave bg-papel-claro transition-all duration-corta ease-salida group-hover:border-tinta group-disabled:border-linea-fuerte group-disabled:bg-papel-oscuro group-data-[visto=true]:border-tinta group-data-[visto=true]:bg-tinta group-aria-[current=step]:size-4 group-aria-[current=step]:border-coral-ink group-aria-[current=step]:bg-coral',
          'aria-hidden': 'true',
        }),
      ],
    );
    listen(button, 'click', () => onSelect(id));
    return { id, screen, button };
  });

  const element = h(
    'nav',
    { 'aria-label': UI_TEXT.progreso, class: 'flex w-full items-center gap-3 sm:w-auto' },
    [
      phase,
      h(
        'ol',
        { class: 'flex w-full items-center sm:w-auto' },
        dots.map(({ button }) => h('li', { class: 'flex-1 sm:flex-none' }, [button])),
      ),
    ],
  );

  return {
    element,
    update(state) {
      const currentIndex = SCREEN_IDS.indexOf(state.screen);
      phase.textContent = PHASES[SCREENS[state.screen].fase];
      dots.forEach(({ id, screen, button }, index) => {
        const current = id === state.screen;
        const open = canEnter(id, state);
        button.disabled = !open;
        button.dataset.visto = String(index < currentIndex);
        if (current) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
        const status = current ? ' (pantalla actual)' : open ? '' : ' (bloqueada)';
        button.setAttribute('aria-label', `${screen.numero} ${screen.nombre}${status}`);
        button.title = `${screen.numero} · ${screen.nombre}`;
      });
    },
  };
}
