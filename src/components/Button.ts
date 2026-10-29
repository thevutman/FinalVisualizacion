import { h, listen } from '../lib/dom';
import { icon, type IconName } from '../lib/icons';

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primario' | 'secundario';
  /** Ícono antes del texto. */
  icon?: IconName;
  /** Ícono después del texto (flechas de avance). */
  iconAfter?: IconName;
}

/** Botón con texto siempre visible y, si aplica, un ícono que lo acompaña. */
export function createButton({
  label,
  onClick,
  variant = 'primario',
  icon: before,
  iconAfter,
}: ButtonProps): HTMLButtonElement {
  const button = h('button', { type: 'button', class: `btn-${variant}` }, [
    before && icon(before),
    label,
    iconAfter && icon(iconAfter),
  ]);
  listen(button, 'click', onClick);
  return button;
}
