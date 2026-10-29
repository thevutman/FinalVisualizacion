import { h } from '../lib/dom';

export interface StepFrame {
  element: HTMLElement;
  /** Área grande de la izquierda: la linterna, un gráfico o el tablero. */
  visual: HTMLElement;
  eyebrow: HTMLElement;
  title: HTMLElement;
  text: HTMLElement;
  /** Contenido propio del paso (botón de acción, ficha de pista…). */
  body: HTMLElement;
  /** Fila inferior: Atrás y el botón principal. */
  nav: HTMLElement;
}

/**
 * Estructura común de los 9 pasos: siempre cabe en la pantalla (sin scroll).
 * Visual grande a la izquierda (arriba en celular) y panel de lectura a la derecha.
 */
export function createStepFrame(titleClass = 'text-titulo'): StepFrame {
  const visual = h('div', {
    class: 'relative min-h-0 overflow-hidden rounded-ficha border border-linea bg-papel-escena',
  });
  const eyebrow = h('p', { class: 'etiqueta' });
  const title = h('h1', { class: titleClass, tabindex: '-1' });
  const text = h('p', { class: 'text-cuerpo text-tinta' });
  const body = h('div', { class: 'flex flex-1 shrink-0 flex-col gap-3 md:min-h-0 md:shrink' });
  const nav = h('div', { class: 'flex flex-wrap items-center justify-between gap-3' });
  // En celular el panel puede desplazarse por dentro (la letra grande no cabe en 100vh);
  // desde md todo cabe en pantalla sin scroll.
  const panel = h(
    'div',
    { class: 'flex min-h-0 flex-col gap-3 overflow-y-auto md:overflow-visible' },
    [h('div', { class: 'space-y-2' }, [eyebrow, title, text]), body, nav],
  );
  const element = h(
    'div',
    {
      class:
        'grid h-full min-h-0 grid-rows-[40dvh_minmax(0,1fr)] gap-4 p-4 md:grid-cols-[minmax(0,1.55fr)_minmax(20rem,1fr)] md:grid-rows-1 lg:gap-8 lg:px-8 lg:py-5',
    },
    [visual, panel],
  );
  return { element, visual, eyebrow, title, text, body, nav };
}
