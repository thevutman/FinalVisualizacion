import gsap from 'gsap';
import { createButton } from '../components/Button';
import { createStepFrame } from '../components/StepFrame';
import { eyebrowFor, neighborsOf, SCREEN_IDS, SCREENS, UI_TEXT } from '../data/screens';
import { STORY } from '../data/story';
import { h } from '../lib/dom';
import { icon, type IconName } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';
import { store } from '../state/store';
import type { ScreenFactory } from './types';

/** Los 3 momentos del recorrido, como infografía de entrada. */
const HOW_IT_WORKS: readonly { icon: IconName; titulo: string; texto: string }[] = [
  { icon: 'acercamiento', titulo: 'Revisa', texto: 'la linterna de 5 maneras' },
  { icon: 'libreta', titulo: 'Reúne', texto: 'las 5 pistas en tu libreta' },
  { icon: 'veredicto', titulo: 'Decide', texto: 'si el zorro existe' },
];

/** Paso 01 · Apertura del caso: el rol de investigador y la evidencia A. */
export const createApertura: ScreenFactory = (app) => {
  const screen = SCREENS.apertura;
  const { next } = neighborsOf('apertura');
  const frame = createStepFrame('text-portada');
  frame.eyebrow.textContent = eyebrowFor('apertura');
  frame.title.textContent = screen.titulo;
  frame.text.textContent = screen.texto;

  const steps = HOW_IT_WORKS.map((step, index) =>
    h('li', { class: 'flex flex-1 flex-col items-center gap-2 text-center' }, [
      h(
        'span',
        {
          class:
            'grid size-16 place-items-center rounded-full bg-tinta text-papel-claro lg:size-20',
          'aria-hidden': 'true',
        },
        [icon(step.icon, 'size-8 lg:size-10')],
      ),
      h('span', { class: 'text-xl font-bold' }, [`${index + 1}. ${step.titulo}`]),
      h('span', { class: 'text-lg leading-tight text-tinta' }, [step.texto]),
    ]),
  );

  frame.visual.append(
    h('div', { class: 'flex size-full flex-col justify-center gap-6 p-6 lg:gap-10 lg:p-10' }, [
      h('div', { class: 'flex flex-wrap items-center justify-center gap-6' }, [
        h('div', { class: 'rotate-[-2deg] rounded-ficha bg-papel-claro p-5 shadow-ficha' }, [
          h('p', { class: 'etiqueta' }, ['Expediente']),
          h('p', { class: 'font-display text-5xl font-extrabold leading-none' }, [STORY.caso]),
          h('p', { class: 'sello mt-3 text-coral-ink' }, ['Abierto']),
        ]),
        h('img', {
          src: `${import.meta.env.BASE_URL}img/linterna.svg`,
          alt: 'Dibujo de la linterna, la prueba del caso.',
          width: 640,
          height: 260,
          class: 'h-auto w-full max-w-sm',
        }),
      ]),
      h('section', { 'aria-labelledby': 'como-funciona' }, [
        h('h2', { id: 'como-funciona', class: 'mb-4 text-center text-2xl' }, ['Cómo funciona']),
        h('ol', { class: 'flex items-start gap-4' }, steps),
      ]),
    ]),
  );

  frame.body.append(
    h('p', { class: 'text-cuerpo text-tinta' }, [STORY.contexto]),
    h(
      'div',
      { class: 'flex items-center gap-3 rounded-ficha border-2 border-tinta bg-papel-claro p-3' },
      [
        icon('linterna', 'size-8 text-coral-ink'),
        h('p', { class: 'text-lg leading-snug' }, [
          h('span', { class: 'font-bold' }, [`${STORY.evidencia.codigo}: `]),
          STORY.evidencia.descripcion,
        ]),
      ],
    ),
  );

  // Si ya hay avance guardado: seguir donde iba, o empezar de nuevo.
  const renderNav = (): void => {
    const reached = SCREEN_IDS[store.get().reached];
    const inProgress = reached !== undefined && reached !== 'apertura';
    frame.nav.replaceChildren();
    if (inProgress) {
      frame.nav.append(
        createButton({
          label: UI_TEXT.reiniciar,
          icon: 'reset',
          variant: 'secundario',
          onClick: () => {
            store.reset();
            renderNav();
          },
        }),
        createButton({
          label: UI_TEXT.continuar,
          iconAfter: 'arrowRight',
          onClick: () => app.go(reached),
        }),
      );
    } else if (next) {
      frame.nav.append(
        createButton({
          label: UI_TEXT.abrirExpediente,
          iconAfter: 'arrowRight',
          onClick: () => app.go(next),
        }),
      );
    }
  };
  renderNav();

  gsap.from(steps, {
    opacity: 0,
    y: 12,
    duration: duration(0.6),
    ease: EASE_OUT,
    stagger: 0.15,
    delay: 0.2,
  });

  return { element: frame.element, destroy: () => undefined };
};
