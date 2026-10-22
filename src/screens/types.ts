import type { AnnouncerTone } from '../components/Announcer';
import type { ChartId } from '../data/charts';
import type { ClueId } from '../data/clues';
import type { PieceName } from '../data/pieces';
import type { ScreenId } from '../data/screens';
import type { ToolId } from '../data/tools';
import type { Inspection } from '../scenes/EvidenceStage';

/** Servicios compartidos que la app entrega a cada pantalla. */
export interface AppContext {
  go: (id: ScreenId) => void;
  announce: (message: string, tone?: AnnouncerTone) => void;
  openChart: (id: ChartId) => void;
  openClue: (id: ClueId) => void;
}

/** Pantallas fuera de la mesa de examen (01, 08 y 09). */
export interface Screen {
  element: HTMLElement;
  destroy: () => void;
}

export type ScreenFactory = (app: AppContext) => Screen;

/** Lo que la mesa de examen le ofrece al panel lateral de cada pantalla 02–07. */
export interface ExamPanelContext {
  app: AppContext;
  inspect: (piece: PieceName) => void;
  setValue: (value: number) => void;
  /** Piezas de la herramienta que todavía guardan una pista. */
  pendingPieces: () => readonly PieceName[];
}

export interface ExamPanel {
  element: HTMLElement;
  onInspect?: (inspection: Inspection) => void;
  onValueChange?: (value: number) => void;
  onStateChange?: () => void;
  destroy?: () => void;
}

/** Pantallas 02–07: comparten escena, barra de herramientas y libreta; cambian el panel. */
export interface ExamView {
  screen: ScreenId;
  tool: ToolId | null;
  createPanel: (context: ExamPanelContext) => ExamPanel;
}
