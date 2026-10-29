import { CLUE_LIST, clueForPiece, type Clue, type ClueId } from '../data/clues';
import type { PieceName } from '../data/pieces';
import { TOOLS, type ToolId } from '../data/tools';
import { duration } from '../lib/motion';
import { createAcercamiento } from '../tools/acercamiento';
import { createCorte } from '../tools/corte';
import { createDespiece } from '../tools/despiece';
import { createExplosion } from '../tools/explosion';
import { createTransparencia } from '../tools/transparencia';
import type { ExamTool, ToolContext } from '../tools/types';
import { Highlighter } from './Highlighter';
import { Hotspot } from './Hotspot';
import { LabelLayer } from './LabelLayer';
import { LinternaModel } from './LinternaModel';
import { Picker } from './Picker';
import { type CameraView, ScenePanel } from './ScenePanel';

export interface StageHandlers {
  /** Se tocó la pieza que guarda la pista de la herramienta activa. */
  onFound: (clue: Clue) => void;
}

const TOOL_FACTORIES: Record<ToolId, (context: ToolContext) => ExamTool> = {
  despiece: createDespiece,
  explosion: createExplosion,
  corte: createCorte,
  transparencia: createTransparencia,
  acercamiento: createAcercamiento,
};

const MESA_VIEW: CameraView = { target: [0, 0, 0], direction: [0.2, 0.45, 1], size: 3.1 };
/** Duración de la animación de cada herramienta al pulsar su botón. */
const ACTION_SECONDS = 1.4;
const NO_PIECES: ReadonlySet<PieceName> = new Set();

/**
 * La evidencia en 3D: une escena, modelo, resaltado, selección y herramientas.
 * Cada paso funciona igual: se encuadra la herramienta, el botón la ejecuta y
 * aparece un círculo sobre la pieza con la pista. Se carga de forma diferida.
 */
export class EvidenceStage {
  private readonly tools = new Map<ToolId, ExamTool>();
  private readonly highlighter: Highlighter;
  private readonly picker: Picker;
  private readonly labels: LabelLayer;
  private readonly hotspot: Hotspot;
  private readonly removeHooks: (() => void)[];
  private active: ExamTool | null = null;
  private pickable: ReadonlySet<PieceName> = NO_PIECES;
  private found: readonly ClueId[] = [];
  private revealTimer = 0;

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
    panel.controls.enableZoom = false;

    this.highlighter = new Highlighter(model, panel.invalidate);
    this.labels = new LabelLayer(overlay, panel, model);
    this.hotspot = new Hotspot(overlay, panel, model, (piece) => this.inspect(piece));
    this.removeHooks = [
      panel.addPostRender(() => {
        this.labels.update();
        this.hotspot.update();
      }),
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

  /**
   * Cambia de herramienta; null vuelve a la vista general (que se puede girar).
   * Si la pista de la herramienta ya se encontró, la deja aplicada sin animar.
   */
  setTool(id: ToolId | null): void {
    if (this.active?.id === id) return;
    this.cancelReveal();
    this.active?.deactivate();
    this.highlighter.clear();
    this.hotspot.hide();
    this.pickable = NO_PIECES;
    this.active = id ? this.tool(id) : null;
    this.panel.controls.enableRotate = id === null;
    if (this.active) this.active.activate();
    else this.panel.frame(MESA_VIEW);
    if (id && this.pendingClue() === null) this.active?.setValue(TOOLS[id].valor, 0);
    this.refreshGlow();
  }

  /** Ejecuta la herramienta activa y, al terminar, señala dónde está la pista. */
  performAction(): void {
    const tool = this.active;
    if (!tool) return;
    tool.setValue(TOOLS[tool.id].valor, ACTION_SECONDS);
    this.cancelReveal();
    this.revealTimer = window.setTimeout(
      () => {
        const clue = this.pendingClue();
        const piece = clue?.piezas.find((name) => this.model.get(name));
        if (!clue || !piece) return;
        this.pickable = new Set(clue.piezas);
        this.hotspot.show(piece);
      },
      duration(ACTION_SECONDS) * 1000,
    );
  }

  setFound(found: readonly ClueId[]): void {
    this.found = found;
    if (this.pendingClue() === null) {
      this.hotspot.hide();
      this.pickable = NO_PIECES;
    }
    this.refreshGlow();
  }

  dispose(): void {
    this.cancelReveal();
    this.active?.deactivate();
    this.active = null;
    this.picker.dispose();
    this.highlighter.dispose();
    this.removeHooks.forEach((remove) => remove());
    this.hotspot.dispose();
    this.labels.dispose();
    this.panel.dispose();
  }

  private inspect(piece: PieceName): void {
    const clue = this.active ? clueForPiece(this.active.id, piece) : undefined;
    if (clue) this.handlers.onFound(clue);
  }

  private pendingClue(): Clue | null {
    const id = this.active?.id;
    return (
      CLUE_LIST.find((clue) => clue.herramienta === id && !this.found.includes(clue.id)) ?? null
    );
  }

  private cancelReveal(): void {
    window.clearTimeout(this.revealTimer);
  }

  private tool(id: ToolId): ExamTool {
    let tool = this.tools.get(id);
    if (!tool) {
      tool = TOOL_FACTORIES[id]({ panel: this.panel, model: this.model, labels: this.labels });
      this.tools.set(id, tool);
    }
    return tool;
  }

  /** La pieza con la pista pendiente de la herramienta activa brilla. */
  private refreshGlow(): void {
    this.highlighter.setGlow(this.pendingClue()?.piezas ?? []);
  }
}
