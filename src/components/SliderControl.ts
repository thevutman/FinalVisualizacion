import type { ToolControl } from '../data/tools';
import { h, listen } from '../lib/dom';

export interface SliderControlProps {
  id: string;
  control: ToolControl;
  onInput: (value: number) => void;
}

export interface SliderControl {
  element: HTMLElement;
  /** Sincroniza el slider cuando el valor cambia desde la escena (p. ej. rueda del mouse). */
  setValue: (value: number) => void;
}

/** Slider real (<input type="range">) con etiqueta visible y valor legible por lector de pantalla. */
export function createSliderControl({ id, control, onInput }: SliderControlProps): SliderControl {
  const input = h('input', {
    id,
    type: 'range',
    min: control.min,
    max: control.max,
    step: control.step,
    value: control.initial,
    class: 'slider',
  });
  const output = h('output', { for: id, class: 'font-mono text-sm text-tinta-suave' });

  const setValue = (value: number): void => {
    input.value = String(value);
    const text = control.format(value);
    input.setAttribute('aria-valuetext', text);
    output.textContent = text;
  };

  listen(input, 'input', () => {
    const value = Number(input.value);
    setValue(value);
    onInput(value);
  });
  setValue(control.initial);

  const element = h('div', { class: 'ficha p-4' }, [
    h('label', { for: id, class: 'block font-semibold' }, [control.label]),
    input,
    output,
  ]);
  return { element, setValue };
}
