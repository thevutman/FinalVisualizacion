import gsap from 'gsap';
import { VERDICT, type VerdictId } from '../data/verdict';
import { h, listen } from '../lib/dom';
import { duration, EASE_OUT } from '../lib/motion';
import type { CaseState } from '../state/store';

export interface VeredictoProps {
  onChoose: (id: VerdictId) => void;
}

export interface Veredicto {
  element: HTMLElement;
  update: (state: CaseState) => void;
}

/** Las tres opciones de veredicto y el resultado (simulado) de otros investigadores. */
export function createVeredicto({ onChoose }: VeredictoProps): Veredicto {
  const options = VERDICT.opciones.map((option) => {
    const button = h(
      'button',
      {
        type: 'button',
        'aria-pressed': 'false',
        class:
          'btn min-h-14 border-2 border-tinta bg-papel-claro px-6 text-base text-tinta hover:bg-papel-oscuro aria-pressed:bg-tinta aria-pressed:text-papel-claro',
      },
      [option.etiqueta],
    );
    listen(button, 'click', () => onChoose(option.id));
    return { option, button };
  });

  const bars = VERDICT.opciones.map((option) => {
    const fill = h('div', { class: 'w-full origin-bottom rounded-t-ficha bg-tinta-suave' });
    const value = h('p', { class: 'font-mono text-sm font-medium' });
    const column = h('li', { class: 'flex flex-col items-center gap-2' }, [
      value,
      h('div', { class: 'flex h-40 w-16 items-end sm:w-20', 'aria-hidden': 'true' }, [fill]),
      h('p', { class: 'text-center text-sm font-semibold' }, [option.etiqueta]),
    ]);
    return { option, fill, value, column };
  });

  const results = h('figure', { class: 'ficha hidden p-5', 'aria-live': 'polite' }, [
    h('figcaption', {}, [
      h('p', { class: 'font-semibold' }, [
        `${VERDICT.tituloResultados} `,
        h('span', { class: 'sello ml-1 !py-0.5 text-coral-ink' }, ['Simulado']),
      ]),
      h('p', { class: 'mt-1 text-sm text-tinta-suave' }, [VERDICT.avisoSimulado]),
    ]),
    h(
      'ol',
      { class: 'mt-5 flex justify-center gap-6 sm:gap-10' },
      bars.map(({ column }) => column),
    ),
  ]);

  const element = h('div', { class: 'space-y-8' }, [
    h(
      'div',
      { role: 'group', 'aria-labelledby': 'veredicto-pregunta', class: 'space-y-4 text-center' },
      [
        h('h2', { id: 'veredicto-pregunta', class: 'text-titulo' }, [VERDICT.pregunta]),
        h(
          'div',
          { class: 'flex flex-col justify-center gap-3 sm:flex-row' },
          options.map(({ button }) => button),
        ),
      ],
    ),
    results,
  ]);

  let shown: VerdictId | null = null;

  return {
    element,
    update(state) {
      options.forEach(({ option, button }) =>
        button.setAttribute('aria-pressed', String(option.id === state.verdict)),
      );
      if (!state.verdict || state.verdict === shown) return;
      shown = state.verdict;
      const votes = bars.map(({ option }) => option.base + (option.id === state.verdict ? 1 : 0));
      const total = votes.reduce((sum, count) => sum + count, 0);
      const max = Math.max(...votes);
      results.classList.remove('hidden');
      bars.forEach(({ option, fill, value }, index) => {
        const count = votes[index] ?? 0;
        const percent = Math.round((count / total) * 100);
        const mine = option.id === state.verdict;
        value.textContent = `${percent} %`;
        value.setAttribute(
          'aria-label',
          `${option.etiqueta}: ${percent} por ciento, ${count} investigadores${mine ? ', incluido tu voto' : ''}`,
        );
        fill.classList.toggle('bg-coral', mine);
        fill.classList.toggle('bg-tinta-suave', !mine);
        fill.style.height = `${(count / max) * 100}%`;
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          { scaleY: 1, duration: duration(0.7), ease: EASE_OUT, delay: index * 0.08 },
        );
      });
    },
  };
}
