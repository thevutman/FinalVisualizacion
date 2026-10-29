import { Vector3 } from 'three';
import { PIECE_LABELS, type PieceName } from '../data/pieces';
import { UI_TEXT } from '../data/screens';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import type { LinternaModel } from './LinternaModel';
import type { ScenePanel } from './ScenePanel';

/**
 * Círculo que late sobre la pieza que guarda la pista: dice exactamente dónde tocar.
 * Es un botón real (teclado y lector de pantalla) que sigue a la pieza en pantalla.
 */
export class Hotspot {
  private readonly button: HTMLButtonElement;
  private piece: PieceName | null = null;
  private readonly point = new Vector3();
  private readonly cleanup: () => void;

  constructor(
    container: HTMLElement,
    private readonly panel: ScenePanel,
    private readonly model: LinternaModel,
    onPress: (piece: PieceName) => void,
  ) {
    this.button = h(
      'button',
      {
        type: 'button',
        hidden: true,
        class:
          'pointer-events-auto absolute left-0 top-0 grid size-16 place-items-center rounded-full',
      },
      [
        h('span', {
          class:
            'absolute inset-0 animate-ping rounded-full bg-coral/50 motion-reduce:animate-none',
          'aria-hidden': 'true',
        }),
        h('span', {
          class: 'absolute inset-1 rounded-full border-4 border-coral-ink bg-papel-claro/30',
          'aria-hidden': 'true',
        }),
        h(
          'span',
          {
            class:
              'absolute top-full mt-2 flex items-center gap-1 whitespace-nowrap rounded-full bg-coral-ink px-3 py-1 text-base font-semibold text-papel-claro',
            'aria-hidden': 'true',
          },
          [icon('tap', 'size-5'), UI_TEXT.tocaAqui],
        ),
      ],
    );
    this.cleanup = listen(this.button, 'click', () => {
      if (this.piece) onPress(this.piece);
    });
    container.append(this.button);
  }

  show(piece: PieceName): void {
    this.piece = piece;
    this.button.hidden = false;
    this.button.setAttribute('aria-label', `Ver la pista: ${PIECE_LABELS[piece]}`);
    this.panel.invalidate();
  }

  hide(): void {
    this.piece = null;
    this.button.hidden = true;
  }

  /** Sigue a la pieza; se llama después de cada render. */
  update(): void {
    if (!this.piece) return;
    const { x, y, visible } = this.panel.toScreen(this.model.center(this.piece, this.point));
    this.button.style.visibility = visible ? 'visible' : 'hidden';
    this.button.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
  }

  dispose(): void {
    this.cleanup();
    this.button.remove();
  }
}
