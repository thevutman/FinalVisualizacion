import gsap from 'gsap';
import { PHASES, SCREENS, UI_TEXT } from '../data/screens';
import { STORY } from '../data/story';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';
import { store } from '../state/store';
import type { ScreenFactory } from './types';

/** Pantalla 01 · Apertura del caso: el rol de investigador y la evidencia A. */
export const createApertura: ScreenFactory = (app) => {
  const screen = SCREENS.apertura;
  const inProgress = store.get().found.length > 0;

  const notes = h(
    'ul',
    {
      class: 'halo-mascara pointer-events-none absolute inset-0 select-none',
      'aria-label': 'Notas escondidas en el expediente',
    },
    STORY.notasOcultas.map((note, index) =>
      h(
        'li',
        {
          class: `absolute max-w-[12rem] -rotate-3 font-mono text-sm text-coral-ink ${['left-[8%] top-[18%]', 'right-[8%] top-[30%]', 'bottom-[14%] left-[38%]'][index % 3] ?? ''}`,
        },
        [note],
      ),
    ),
  );
  const lightToggle = h(
    'button',
    { type: 'button', class: 'btn-secundario', 'aria-pressed': 'false' },
    [icon('acercamiento', 'size-4'), 'Encender la linterna'],
  );

  const folder = h(
    'div',
    {
      class:
        'relative min-h-72 overflow-hidden rounded-ficha border border-linea-fuerte bg-papel-oscuro p-6 shadow-ficha sm:p-10',
    },
    [
      h('div', { class: 'halo-luz pointer-events-none absolute inset-0', 'aria-hidden': 'true' }),
      notes,
      h('div', { class: 'relative max-w-xs rounded-ficha bg-papel-claro p-6 shadow-ficha' }, [
        h('p', { class: 'etiqueta' }, ['Expediente']),
        h('p', { class: 'font-display text-portada font-extrabold leading-none' }, [STORY.caso]),
        h('p', { class: 'sello mt-4 text-coral-ink' }, ['Abierto']),
      ]),
    ],
  );

  const moveHalo = (event: PointerEvent): void => {
    const rect = folder.getBoundingClientRect();
    folder.style.setProperty('--halo-x', `${event.clientX - rect.left}px`);
    folder.style.setProperty('--halo-y', `${event.clientY - rect.top}px`);
  };

  const summary = STORY.resumenCaso
    ? h('p', { class: 'text-lead' }, [STORY.resumenCaso])
    : h(
        'p',
        {
          class:
            'rounded-ficha border-2 border-dashed border-linea-fuerte p-4 text-sm text-tinta-suave',
        },
        [
          'Resumen del Caso 08 pendiente: pega en ',
          h('code', { class: 'font-mono' }, ['src/data/story.ts']),
          ' el resumen tomado del cuento (quién desapareció, dónde y cuándo).',
        ],
      );

  const open = h('button', { type: 'button', class: 'btn-primario px-6' }, [
    inProgress ? 'Continuar el examen' : UI_TEXT.abrirEvidencia,
    icon('arrowRight', 'size-4'),
  ]);

  const evidence = h(
    'section',
    {
      'aria-labelledby': 'evidencia-titulo',
      class: 'ficha grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6',
    },
    [
      h('div', {}, [
        h('p', { class: 'etiqueta' }, [STORY.evidencia.codigo]),
        h('h2', { id: 'evidencia-titulo', class: 'text-2xl' }, [STORY.evidencia.nombre]),
        h('p', { class: 'mt-1 text-cuerpo text-tinta-suave' }, [STORY.evidencia.descripcion]),
        h('div', { class: 'mt-4 flex flex-wrap gap-3' }, [open]),
      ]),
      h('img', {
        src: `${import.meta.env.BASE_URL}img/linterna.svg`,
        alt: '',
        width: 640,
        height: 260,
        class: 'h-auto w-full max-w-xs justify-self-center',
      }),
    ],
  );

  const sections = [
    h('header', { class: 'space-y-2' }, [
      h('p', { class: 'etiqueta' }, [`Pantalla ${screen.numero} · ${PHASES[screen.fase]}`]),
      h('h1', { class: 'text-portada', tabindex: '-1' }, [STORY.rol]),
      h('p', { class: 'max-w-2xl text-lead text-tinta-suave' }, [screen.intro]),
    ]),
    h('div', { class: 'space-y-3' }, [
      folder,
      h('div', { class: 'flex flex-wrap items-center justify-between gap-3' }, [
        h('p', { class: 'text-sm text-tinta-suave' }, [
          'Pasa el cursor por el expediente: la linterna revela notas escondidas.',
        ]),
        lightToggle,
      ]),
    ]),
    h('div', { class: 'max-w-3xl space-y-4' }, [
      h('p', { class: 'text-lead' }, [STORY.contexto]),
      summary,
    ]),
    evidence,
  ];
  const element = h('div', { class: 'space-y-8' }, sections);

  const cleanups = [
    listen(folder, 'pointermove', moveHalo),
    listen(open, 'click', () => app.go('mesa')),
    listen(lightToggle, 'click', () => {
      const on = notes.classList.toggle('halo-mascara');
      lightToggle.setAttribute('aria-pressed', String(!on));
    }),
  ];

  // La ficha se despliega por partes al abrir el caso.
  gsap.from(sections, { opacity: 0, y: 16, duration: duration(0.6), ease: EASE_OUT, stagger: 0.1 });

  return {
    element,
    destroy: () => cleanups.forEach((cleanup) => cleanup()),
  };
};
