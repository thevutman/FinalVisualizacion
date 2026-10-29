import { h, listen } from '../lib/dom';
import { icon, type IconName } from '../lib/icons';

export interface ViewOption<T extends string> {
  id: T;
  label: string;
  icon: IconName;
}

export interface ViewSwitch<T extends string> {
  element: HTMLElement;
  set: (id: T) => void;
}

/** Botones grandes para elegir qué se ve en el área visual (linterna, gráfico, mapa…). */
export function createViewSwitch<T extends string>(
  label: string,
  options: readonly ViewOption<T>[],
  onChange: (id: T) => void,
): ViewSwitch<T> {
  const buttons = options.map((option) => {
    const button = h(
      'button',
      {
        type: 'button',
        'aria-pressed': 'false',
        class:
          'btn flex-1 whitespace-nowrap border-2 border-tinta bg-papel-claro px-3 text-tinta hover:bg-papel-oscuro aria-pressed:bg-tinta aria-pressed:text-papel-claro',
      },
      [icon(option.icon), option.label],
    );
    return { option, button };
  });

  const set = (id: T): void => {
    buttons.forEach(({ option, button }) =>
      button.setAttribute('aria-pressed', String(option.id === id)),
    );
  };

  for (const { option, button } of buttons) {
    listen(button, 'click', () => {
      set(option.id);
      onChange(option.id);
    });
  }

  const element = h(
    'div',
    { role: 'group', 'aria-label': label, class: 'flex flex-wrap gap-2' },
    buttons.map(({ button }) => button),
  );
  return { element, set };
}
