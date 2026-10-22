import { createAnnouncer } from './components/Announcer';
import { createClueCard } from './components/ClueCard';
import { openChart } from './components/DataPanel';
import { createModal } from './components/Modal';
import { createProgressDots } from './components/ProgressDots';
import { CLUES } from './data/clues';
import { UI_TEXT } from './data/screens';
import { h } from './lib/dom';
import { canEnter, ScreenMachine } from './screens/router';
import type { AppContext } from './screens/types';
import { store } from './state/store';

/** Arma la estructura fija (encabezado, área principal, avisos y modal) y arranca la máquina de pantallas. */
export function startApp(root: HTMLElement): void {
  const announcer = createAnnouncer();
  const modal = createModal();
  const outlet = h('main', {
    id: 'contenido',
    class: 'mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-8',
  });

  const context: AppContext = {
    go: (id) => machine.go(id),
    announce: announcer.announce,
    openChart: (id) => openChart(modal, id),
    openClue: (id) => {
      const clue = CLUES[id];
      modal.open({
        etiqueta: UI_TEXT.libreta,
        titulo: clue.titulo,
        body: createClueCard({ clue, onOpenChart: (chart) => openChart(modal, chart) }),
      });
    },
  };
  const machine = new ScreenMachine(outlet, context);

  const progress = createProgressDots({ canEnter, onSelect: context.go });
  const header = h('header', { class: 'border-b border-linea bg-papel/90 backdrop-blur' }, [
    h(
      'div',
      {
        class:
          'mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 lg:px-8',
      },
      [
        h(
          'p',
          { class: 'flex items-center gap-2 font-display text-base font-extrabold tracking-tight' },
          [h('span', { class: 'sello !px-2 !py-0.5 text-coral-ink' }, ['08']), UI_TEXT.marca],
        ),
        progress.element,
      ],
    ),
  ]);

  root.replaceChildren(header, outlet, announcer.element, modal.element);
  store.subscribe((state) => progress.update(state));
  progress.update(store.get());
  machine.start();
}
