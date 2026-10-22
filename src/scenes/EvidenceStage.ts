import { CLUE_LIST, clueForPiece, type Clue, type ClueId } from '../data/clues';
import type { PieceName } from '../data/pieces';
import { TOOLS, type ToolId } from '../data/tools';
import { createAcercamiento } from '../tools/acercamiento';
import { createCorte } from '../tools/corte';
import { createDespiece } from '../tools/despiece';
import { createExplosion } from '../tools/explosion';
import { createTransparencia } from '../tools/transparencia';
import type { ExamTool, ToolContext } from '../tools/types';
import { Highlighter } from './Highlighter';
import { LabelLayer } from './LabelLayer';
import { LinternaModel } from './LinternaModel';
import { Picker } from './Picker';
import { type CameraView, ScenePanel } from './ScenePanel';

export interface Inspection {
  tool: ToolId;
  piece: PieceName;
  /** La pista que revela la pieza, si ya se puede ver. */
  clue: Clue | null;
  /** Qué falta hacer para poder examinar la pieza. */
  hint: string | null;
}

export interface StageHandlers {
  onInspect: (inspection: Inspection) => void;
  onValueChange: (value: number) => void;
}

const TOOL_FACTORIES: Record<ToolId, (context: ToolContext) => ExamTool> = {
  despiece: createDespiece,
  explosion: createExplosion,
  corte: createCorte,
  transparencia: createTransparencia,
  acercamiento: createAcercamiento,
};

const MESA_VIEW: CameraView = { target: [0, 0, 0], direction: [0.2, 0.45, 1], size: 3.1 };
const NO_PIECES: ReadonlySet<PieceName> = new Set();

/**
 * La mesa de examen en 3D: une escena, modelo, resaltado, selección y herramientas.
 * Este módulo (y Three.js con él) se carga de forma diferida al entrar a la mesa.
 */
export class EvidenceStage {
  private readonly tools = new Map<ToolId, ExamTool>();
  private readonly highlighter: Highlighter;
  private readonly picker: Picker;
  private readonly labels: LabelLayer;
  private readonly removeHooks: (() => void)[];
  private active: ExamTool | null = null;
  private pickable: ReadonlySet<PieceName> = NO_PIECES;
  private found: readonly ClueId[] = [];

  private constructor(
    private readonly panel: ScenePanel,
    private readonly model: LinternaModel,
    overlay: HTMLElement,
    private readonly handlers: StageHandlers,
  ) {
    panel.add(model.root);
    const floor = model.bounds;
    panel.placeShadow(floor.min.y - 0.01, floor.max.x - floor.min.x);
    panel.frame(MESA_VIEW, false);

    this.highlighter = new Highlighter(model, panel.invalidate);
    this.labels = new LabelLayer(overlay, panel, model);
    this.removeHooks = [
      panel.addPostRender(() => this.labels.update()),
      panel.addFrameHook((delta) => this.active?.update(delta) ?? false),
    ];
    this.picker = new Picker(panel, model, {
      pickable: () => this.pickable,
      accept: (hit) => this.active?.accepts(hit) ?? true,
      onHover: (piece) => {
        this.highlighter.setHover(piece);
        panel.canvas.classList.toggle('cursor-pointer', piece !== null);
      },
      onPick: (piece) => this.inspect(piece),
    });
  }

  static async create(
    container: HTMLElement,
    overlay: HTMLElement,
    handlers: StageHandlers,
  ): Promise<EvidenceStage> {
    const panel = new ScenePanel(container);
    try {
      const model = await LinternaModel.load();
      return new EvidenceStage(panel, model, overlay, handlers);
    } catch (error) {
      panel.dispose();
      throw error;
    }
  }

  /** Cambia de herramienta; null vuelve a la vista general de la mesa. */
  setTool(id: ToolId | null): void {
    if (this.active?.id === id) return;
    this.active?.deactivate();
    this.highlighter.clear();
    this.active = id ? this.tool(id) : null;
    this.pickable = id ? new Set(TOOLS[id].piezas) : NO_PIECES;
    if (this.active) this.active.activate();
    else this.panel.frame(MESA_VIEW);
    this.refreshGlow();
  }

  setValue(value: number): void {
    this.active?.setValue(value);
  }

  /** Examina una pieza (clic en la escena o botón de la lista). */
  inspect(piece: PieceName): void {
    const tool = this.active;
    if (!tool) return;
    tool.select(piece);
    const hint = tool.blockedHint(piece);
    const clue = hint ? null : (clueForPiece(tool.id, piece) ?? null);
    this.handlers.onInspect({ tool: tool.id, piece, clue, hint });
  }

  setFound(found: readonly ClueId[]): void {
    this.found = found;
    this.refreshGlow();
  }

  resetView(): void {
    this.panel.resetView();
  }

  dispose(): void {
    this.active?.deactivate();
    this.active = null;
    this.picker.dispose();
    this.highlighter.dispose();
    this.removeHooks.forEach((remove) => remove());
    this.labels.dispose();
    this.panel.dispose();
  }

  private tool(id: ToolId): ExamTool {
    let tool = this.tools.get(id);
    if (!tool) {
      tool = TOOL_FACTORIES[id]({
        panel: this.panel,
        model: this.model,
        labels: this.labels,
        onValueChange: this.handlers.onValueChange,
      });
      this.tools.set(id, tool);
    }
    return tool;
  }

  /** Las piezas con una pista pendiente de la herramienta activa brillan. */
  private refreshGlow(): void {
    const id = this.active?.id;
    const pending = CLUE_LIST.filter(
      (clue) => clue.herramienta === id && !this.found.includes(clue.id),
    );
    this.highlighter.setGlow(pending.flatMap((clue) => clue.piezas));
  }
}
