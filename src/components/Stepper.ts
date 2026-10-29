import { SCREEN_IDS, SCREENS, UI_TEXT, type ScreenId } from '../data/screens';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { canEnter, type CaseState } from '../state/store';

export interface StepperProps {
  onSelect: (id: ScreenId) => void;
}

export interface Stepper {
  element: HTMLElement;
  update: (state: CaseState) => void;
}

/**
 * Barra de los 9 pasos con un ícono por paso: hechos (oscuros), actual (coral)
 * y pendientes (vacíos). En celular se reduce a "Paso N de 9" con una barra.
 */
export function createStepper({ onSelect }: StepperProps): Stepper {
  const steps = SCREEN_IDS.map((id, index) => {
    const button = h(
      'button',
      {
        type: 'button',
        class:
          'relative grid size-11 place-items-center rounded-full border-2 transition-colors duration-corta disabled:cursor-not-allowed',
      },
      [icon(id, 'size-6')],
    );
    listen(button, 'click', () => onSelect(id));
    const item = h('li', { class: 'flex items-center' }, [
      index > 0 && h('span', { class: 'h-0.5 w-3 bg-linea-fuerte xl:w-5', 'aria-hidden': 'true' }),
      button,
    ]);
    return { id, index, button, item };
  });

  const compactLabel = h('p', { class: 'text-etiqueta font-semibold' });
  const compactBar = h('div', {
    class: 'h-full rounded-full bg-coral-ink transition-all duration-corta',
  });

  const element = h('nav', { 'aria-label': UI_TEXT.pasos, class: 'min-w-0' }, [
    h(
      'ol',
      { class: 'hidden items-center md:flex' },
      steps.map(({ item }) => item),
    ),
    h('div', { class: 'md:hidden' }, [
      compactLabel,
      h('div', { class: 'mt-1 h-2 w-40 rounded-full bg-papel-oscuro', 'aria-hidden': 'true' }, [
        compactBar,
      ]),
    ]),
  ]);

  return {
    element,
    update(state) {
      const current = SCREEN_IDS.indexOf(state.screen);
      for (const { id, index, button } of steps) {
        const isCurrent = index === current;
        const done = index < current || (index <= state.reached && !isCurrent);
        const open = canEnter(id, state);
        button.disabled = !open;
        button.classList.toggle('border-coral-ink', isCurrent);
        button.classList.toggle('bg-coral-ink', isCurrent);
        button.classList.toggle('text-papel-claro', isCurrent || done);
        button.classList.toggle('bg-tinta', done);
        button.classList.toggle('border-tinta', done);
        button.classList.toggle('border-linea-fuerte', !isCurrent && !done);
        button.classList.toggle('text-tinta-suave', !isCurrent && !done);
        button.classList.toggle('bg-papel-claro', !isCurrent && !done);
        if (isCurrent) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
        const status = isCurrent ? ', paso actual' : open ? '' : ', todavía no disponible';
        button.setAttribute('aria-label', `Paso ${index + 1}: ${SCREENS[id].nombre}${status}`);
        button.title = `Paso ${index + 1}: ${SCREENS[id].nombre}`;
      }
      compactLabel.textContent = `${UI_TEXT.paso(current + 1, SCREEN_IDS.length)} · ${SCREENS[state.screen].nombre}`;
      compactBar.style.width = `${((current + 1) / SCREEN_IDS.length) * 100}%`;
    },
  };
}
