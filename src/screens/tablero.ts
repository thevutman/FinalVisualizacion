import { createTableroPistas } from '../components/TableroPistas';
import { PHASES, SCREENS, UI_TEXT } from '../data/screens';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { allCluesConnected, store } from '../state/store';
import type { ScreenFactory } from './types';

/** Pantalla 08 · Tablero de pistas: conectar las 5 pistas con el Caso 08 y abrir los datos. */
export const createTablero: ScreenFactory = (app) => {
  const screen = SCREENS.tablero;
  const board = createTableroPistas({
    onToggle: (id) => store.toggleConnection(id),
    onOpenChart: app.openChart,
  });
  const close = h('button', { type: 'button', class: 'btn-primario px-6' }, [
    UI_TEXT.cerrarCaso,
    icon('arrowRight', 'size-4'),
  ]);
  const back = h('button', { type: 'button', class: 'btn-secundario' }, [
    icon('arrowLeft', 'size-4'),
    UI_TEXT.volverMesa,
  ]);

  const element = h('div', { class: 'space-y-6' }, [
    h('header', { class: 'flex flex-wrap items-end justify-between gap-4' }, [
      h('div', { class: 'space-y-1' }, [
        h('p', { class: 'etiqueta' }, [`Pantalla ${screen.numero} · ${PHASES[screen.fase]}`]),
        h('h1', { class: 'text-titulo', tabindex: '-1' }, [screen.titulo]),
        h('p', { class: 'max-w-2xl text-cuerpo text-tinta-suave' }, [screen.intro]),
        h('p', { class: 'text-sm text-tinta-suave' }, [screen.ayuda ?? '']),
      ]),
      h('div', { class: 'flex flex-wrap gap-3' }, [back, close]),
    ]),
    board.element,
  ]);

  const update = (): void => {
    const state = store.get();
    board.update(state);
    close.disabled = !allCluesConnected(state);
    close.setAttribute('aria-describedby', 'tablero-requisito');
  };
  element.append(
    h('p', { id: 'tablero-requisito', class: 'sr-only' }, [
      'Se habilita cuando las 5 pistas están conectadas.',
    ]),
  );

  const cleanups = [
    store.subscribe(update),
    listen(close, 'click', () => {
      store.closeCase();
      app.go('veredicto');
    }),
    listen(back, 'click', () => app.go('mesa')),
  ];
  update();
  // Los hilos se vuelven a trazar cuando el tablero ya tiene medidas en el documento.
  requestAnimationFrame(update);

  return {
    element,
    destroy() {
      cleanups.forEach((cleanup) => cleanup());
      board.destroy();
    },
  };
};
