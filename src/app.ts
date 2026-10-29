import { createAnnouncer } from './components/Announcer';
import { createLibreta } from './components/Libreta';
import { createStepper } from './components/Stepper';
import { UI_TEXT } from './data/screens';
import { h } from './lib/dom';
import { ScreenMachine } from './screens/router';
import type { AppContext } from './screens/types';
import { store, type CaseState } from './state/store';

/** Pasos en los que la libreta no aporta: la portada y el veredicto. */
const WITHOUT_LIBRETA = new Set(['apertura', 'veredicto']);

/**
 * Estructura fija a pantalla completa (100dvh, sin scroll): encabezado con los
 * pasos, el paso actual y la libreta de pistas abajo.
 */
export function startApp(root: HTMLElement): void {
  const announcer = createAnnouncer();
  const outlet = h('main', { id: 'contenido', class: 'min-h-0 flex-1' });

  const context: AppContext = {
    go: (id) => machine.go(id),
    announce: announcer.announce,
  };
  const machine = new ScreenMachine(outlet, context);

  const stepper = createStepper({ onSelect: context.go });
  const libreta = createLibreta();
  const header = h(
    'header',
    {
      class:
        'flex items-center justify-between gap-4 border-b border-linea bg-papel/90 px-4 py-1.5 lg:px-8',
    },
    [
      h('p', { class: 'flex shrink-0 items-center gap-2 font-display text-xl font-extrabold' }, [
        h('span', { class: 'sello !px-2 !py-0.5 text-coral-ink' }, ['08']),
        h('span', { class: 'hidden sm:inline' }, [UI_TEXT.marca]),
      ]),
      stepper.element,
    ],
  );

  root.className = 'flex h-dvh flex-col overflow-hidden';
  root.replaceChildren(header, outlet, libreta.element, announcer.element);

  const update = (state: CaseState): void => {
    stepper.update(state);
    libreta.update(state);
    libreta.element.hidden = WITHOUT_LIBRETA.has(state.screen);
  };
  store.subscribe(update);
  update(store.get());
  machine.start();
}
