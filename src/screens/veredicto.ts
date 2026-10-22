import { createVeredicto } from '../components/Veredicto';
import { PHASES, SCREENS, UI_TEXT } from '../data/screens';
import { STORY } from '../data/story';
import { VERDICT } from '../data/verdict';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { store } from '../state/store';
import type { ScreenFactory } from './types';

/** Pantalla 09 · Veredicto: la cita final del cuento, el sello y la decisión del investigador. */
export const createVeredictoScreen: ScreenFactory = (app) => {
  const screen = SCREENS.veredicto;
  const verdict = createVeredicto({ onChoose: (id) => store.setVerdict(id) });

  const quote = STORY.citaFinal.texto
    ? h('blockquote', { class: 'mx-auto max-w-2xl text-center' }, [
        h('p', { class: 'font-display text-2xl font-extrabold leading-snug sm:text-3xl' }, [
          `“${STORY.citaFinal.texto}”`,
        ]),
        h('footer', { class: 'mt-3 text-sm text-tinta-suave' }, [`— ${STORY.citaFinal.fuente}`]),
      ])
    : h(
        'p',
        {
          class:
            'mx-auto max-w-2xl rounded-ficha border-2 border-dashed border-linea-fuerte p-4 text-center text-sm text-tinta-suave',
        },
        [
          'Cita final del cuento pendiente: pégala tal cual en ',
          h('code', { class: 'font-mono' }, ['src/data/story.ts']),
          ' (citaFinal.texto).',
        ],
      );

  const share = h('button', { type: 'button', class: 'btn-primario px-6' }, [
    icon('share', 'size-4'),
    VERDICT.compartir.boton,
  ]);
  const back = h('button', { type: 'button', class: 'btn-secundario' }, [
    icon('arrowLeft', 'size-4'),
    'Volver al tablero',
  ]);
  const reset = h('button', { type: 'button', class: 'btn-secundario' }, [
    icon('reset', 'size-4'),
    UI_TEXT.reiniciar,
  ]);

  const element = h('div', { class: 'space-y-10' }, [
    h('header', { class: 'space-y-1 text-center' }, [
      h('p', { class: 'etiqueta' }, [`Pantalla ${screen.numero} · ${PHASES[screen.fase]}`]),
      h('h1', { class: 'text-titulo', tabindex: '-1' }, [screen.titulo]),
    ]),
    quote,
    h('p', { class: 'text-center' }, [
      h('span', { class: 'sello -rotate-2 px-5 py-2 text-base text-coral-ink' }, [VERDICT.sello]),
    ]),
    verdict.element,
    h('div', { class: 'flex flex-wrap justify-center gap-3' }, [share, back, reset]),
  ]);

  const shareCase = async (): Promise<void> => {
    const url = `${location.origin}${location.pathname}`;
    const { titulo, texto, copiado } = VERDICT.compartir;
    try {
      if (navigator.share) {
        await navigator.share({ title: titulo, text: texto, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      app.announce(copiado);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      app.announce(`Copia este enlace: ${url}`);
    }
  };

  const cleanups = [
    store.subscribe((state) => verdict.update(state)),
    listen(share, 'click', () => void shareCase()),
    listen(back, 'click', () => app.go('tablero')),
    listen(reset, 'click', () => {
      if (!window.confirm('¿Reiniciar el caso? Se borrarán las pistas y el veredicto guardados.'))
        return;
      store.reset();
      app.go('apertura');
    }),
  ];
  verdict.update(store.get());

  return {
    element,
    destroy: () => cleanups.forEach((cleanup) => cleanup()),
  };
};
