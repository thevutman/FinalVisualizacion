import gsap from 'gsap';
import { createButton } from '../components/Button';
import { createStepFrame } from '../components/StepFrame';
import { createVerdictResults } from '../components/VerdictResults';
import { CLUE_LIST } from '../data/clues';
import { eyebrowFor, neighborsOf, SCREENS, UI_TEXT } from '../data/screens';
import { STORY } from '../data/story';
import { VERDICT, type VerdictId } from '../data/verdict';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';
import { store } from '../state/store';
import type { ScreenFactory } from './types';

/** Paso 09 · Veredicto: la cita final, el sello del caso y la decisión del investigador. */
export const createVeredictoScreen: ScreenFactory = (app) => {
  const screen = SCREENS.veredicto;
  const { previous } = neighborsOf('veredicto');
  const frame = createStepFrame();
  frame.eyebrow.textContent = eyebrowFor('veredicto');
  frame.title.textContent = screen.titulo;
  frame.text.textContent = VERDICT.pregunta;

  // Antes de votar: el sello del caso, la cita del cuento y las 5 pistas reunidas.
  const cover = h(
    'div',
    { class: 'absolute inset-0 flex flex-col items-center justify-center gap-6 p-6 text-center' },
    [
      STORY.citaFinal.texto &&
        h('blockquote', { class: 'max-w-xl' }, [
          h('p', { class: 'font-display text-3xl font-extrabold leading-snug' }, [
            `“${STORY.citaFinal.texto}”`,
          ]),
          h('footer', { class: 'mt-2 text-lg' }, [`— ${STORY.citaFinal.fuente}`]),
        ]),
      h('p', { class: 'sello -rotate-2 px-6 py-3 text-2xl text-coral-ink' }, [VERDICT.sello]),
      h(
        'ul',
        { class: 'flex flex-wrap justify-center gap-3', 'aria-label': 'Las 5 pistas reunidas' },
        CLUE_LIST.map((clue) =>
          h(
            'li',
            {
              class:
                'flex items-center gap-2 rounded-full bg-ambar-claro px-3 py-1.5 text-lg font-semibold',
            },
            [icon(clue.id), clue.titulo],
          ),
        ),
      ),
    ],
  );
  const results = createVerdictResults();
  const resultsLayer = h('div', { class: 'absolute inset-0', hidden: true }, [results.element]);
  frame.visual.append(cover, resultsLayer);

  const options = VERDICT.opciones.map((option) => {
    const button = h(
      'button',
      {
        type: 'button',
        'aria-pressed': 'false',
        class:
          'btn w-full justify-start border-2 border-tinta bg-papel-claro text-xl text-tinta hover:bg-papel-oscuro aria-pressed:bg-coral-ink aria-pressed:text-papel-claro aria-pressed:border-coral-ink',
      },
      [icon(option.id, 'size-7'), option.etiqueta],
    );
    listen(button, 'click', () => store.setVerdict(option.id));
    return { option, button };
  });

  const share = createButton({
    label: VERDICT.compartir.boton,
    icon: 'share',
    variant: 'secundario',
    onClick: () => void shareCase(),
  });
  const restart = createButton({
    label: UI_TEXT.reiniciar,
    icon: 'reset',
    variant: 'secundario',
    onClick: () => {
      store.reset();
      app.go('apertura');
    },
  });
  const after = h('div', { class: 'flex flex-wrap gap-2', hidden: true }, [share, restart]);

  frame.body.append(
    h(
      'div',
      { role: 'group', 'aria-label': VERDICT.pregunta, class: 'grid gap-2' },
      options.map(({ button }) => button),
    ),
    after,
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
      share.lastChild?.replaceWith(copiado);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      app.announce(`Copia este enlace: ${url}`);
    }
  };

  let shown: VerdictId | null = null;
  const update = (): void => {
    const { verdict } = store.get();
    options.forEach(({ option, button }) =>
      button.setAttribute('aria-pressed', String(option.id === verdict)),
    );
    if (!verdict || verdict === shown) return;
    shown = verdict;
    cover.hidden = true;
    resultsLayer.hidden = false;
    after.hidden = false;
    results.show(verdict);
    gsap.fromTo(
      resultsLayer,
      { opacity: 0 },
      { opacity: 1, duration: duration(0.5), ease: EASE_OUT },
    );
  };

  const unsubscribe = store.subscribe(update);
  update();

  return { element: frame.element, destroy: unsubscribe };
};
