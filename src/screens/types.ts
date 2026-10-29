import type { StepFrame } from '../components/StepFrame';
import type { ChartId } from '../data/charts';
import type { Clue } from '../data/clues';
import type { ScreenId } from '../data/screens';
import type { ToolId } from '../data/tools';
import type { CaseState } from '../state/store';

/** Servicios compartidos que la app entrega a cada pantalla. */
export interface AppContext {
  go: (id: ScreenId) => void;
  announce: (message: string) => void;
}

/** Pantallas con estructura propia (01, 08 y 09). */
export interface Screen {
  element: HTMLElement;
  destroy: () => void;
}

export type ScreenFactory = (app: AppContext) => Screen;

/** Qué se ve en el área visual de la mesa de examen. */
export type ExamVisual = 'linterna' | ChartId;

/** Lo que la mesa de examen ofrece al panel de cada paso 02–07. */
export interface ExamPanelContext {
  app: AppContext;
  frame: StepFrame;
  /** Ejecuta la herramienta en la escena 3D (si está disponible). */
  act: () => void;
  /** Registra una pista como encontrada (botón "Mostrarme la pista"). */
  reveal: (clue: Clue) => void;
  showVisual: (visual: ExamVisual) => void;
}

export interface ExamPanel {
  onState: (state: CaseState) => void;
  destroy: () => void;
}

/** Pasos 02–07: comparten la escena 3D; cada uno arma su panel. */
export interface ExamView {
  screen: ScreenId;
  tool: ToolId | null;
  mount: (context: ExamPanelContext) => ExamPanel;
}
