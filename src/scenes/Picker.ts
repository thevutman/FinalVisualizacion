import { type Intersection, Raycaster, Vector2 } from 'three';
import type { PieceName } from '../data/pieces';
import { listen } from '../lib/dom';
import type { LinternaModel } from './LinternaModel';
import type { ScenePanel } from './ScenePanel';

export interface PickerOptions {
  /** Piezas que se pueden elegir con la herramienta actual. */
  pickable: () => ReadonlySet<PieceName>;
  /** Descarta impactos ocultos (zona cortada, carcasa transparente…). */
  accept: (hit: Intersection) => boolean;
  onHover: (piece: PieceName | null) => void;
  onPick: (piece: PieceName) => void;
}

const CLICK_TOLERANCE_PX = 6;

/** Traduce puntero y clics sobre el canvas en piezas de la linterna. */
export class Picker {
  private readonly raycaster = new Raycaster();
  private readonly ndc = new Vector2();
  private readonly cleanups: (() => void)[] = [];
  private downAt: { x: number; y: number } | null = null;

  constructor(
    private readonly panel: ScenePanel,
    private readonly model: LinternaModel,
    private readonly options: PickerOptions,
  ) {
    const canvas = panel.canvas;
    this.cleanups.push(
      listen(canvas, 'pointermove', (event) => this.options.onHover(this.pieceAt(event))),
      listen(canvas, 'pointerleave', () => this.options.onHover(null)),
      listen(canvas, 'pointerdown', (event) => {
        this.downAt = { x: event.clientX, y: event.clientY };
      }),
      listen(canvas, 'pointerup', (event) => {
        const start = this.downAt;
        this.downAt = null;
        if (!start) return;
        const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
        if (moved > CLICK_TOLERANCE_PX) return;
        const piece = this.pieceAt(event);
        if (piece) this.options.onPick(piece);
      }),
    );
  }

  /** Primera pieza visible bajo el puntero, solo si es elegible. */
  pieceAt(event: PointerEvent): PieceName | null {
    const pickable = this.options.pickable();
    if (pickable.size === 0) return null;
    this.raycaster.setFromCamera(this.panel.toNdc(event, this.ndc), this.panel.camera);
    const hits = this.raycaster.intersectObject(this.model.root, true);
    for (const hit of hits) {
      if (!this.options.accept(hit)) continue;
      const piece = this.model.pieceOf(hit.object);
      return piece && pickable.has(piece) ? piece : null;
    }
    return null;
  }

  dispose(): void {
    this.cleanups.forEach((cleanup) => cleanup());
  }
}
