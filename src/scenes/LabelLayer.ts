import { Vector3 } from 'three';
import type { PieceName } from '../data/pieces';
import { h } from '../lib/dom';
import type { LinternaModel } from './LinternaModel';
import type { ScenePanel } from './ScenePanel';

interface Label {
  piece: PieceName;
  element: HTMLElement;
}

/**
 * Rótulos numerados que siguen a las piezas en pantalla (estilo infografía técnica).
 * Son decorativos (aria-hidden): la lista de botones de piezas da la alternativa accesible.
 */
export class LabelLayer {
  private readonly layer: HTMLElement;
  private labels: Label[] = [];
  private readonly point = new Vector3();

  constructor(
    container: HTMLElement,
    private readonly panel: ScenePanel,
    private readonly model: LinternaModel,
  ) {
    this.layer = h('div', {
      class: 'pointer-events-none absolute inset-0 overflow-hidden',
      'aria-hidden': 'true',
    });
    container.append(this.layer);
  }

  show(entries: readonly { piece: PieceName; text: string }[]): void {
    this.clear();
    this.labels = entries
      .filter(({ piece }) => this.model.get(piece))
      .map(({ piece, text }) => {
        const element = h(
          'span',
          {
            class:
              'absolute left-0 top-0 grid size-7 place-items-center rounded-full border-2 border-tinta bg-papel-claro font-mono text-xs font-medium text-tinta shadow-ficha',
          },
          [text],
        );
        this.layer.append(element);
        return { piece, element };
      });
    this.panel.invalidate();
  }

  /** Reposiciona los rótulos; se llama después de cada render. */
  update(): void {
    for (const { piece, element } of this.labels) {
      const { x, y, visible } = this.panel.toScreen(this.model.center(piece, this.point));
      element.hidden = !visible;
      element.style.transform = `translate(${x.toFixed(1)}px, ${(y - 34).toFixed(1)}px) translate(-50%, -50%)`;
    }
  }

  clear(): void {
    this.labels.forEach(({ element }) => element.remove());
    this.labels = [];
  }

  dispose(): void {
    this.clear();
    this.layer.remove();
  }
}
