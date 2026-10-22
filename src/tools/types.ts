import type { Intersection } from 'three';
import type { PieceName } from '../data/pieces';
import type { ToolId } from '../data/tools';
import type { LabelLayer } from '../scenes/LabelLayer';
import type { LinternaModel } from '../scenes/LinternaModel';
import type { ScenePanel } from '../scenes/ScenePanel';

export interface ToolContext {
  panel: ScenePanel;
  model: LinternaModel;
  labels: LabelLayer;
  /** Avisa a la interfaz cuando la herramienta cambia su valor sola (p. ej. rueda del mouse). */
  onValueChange: (value: number) => void;
}

/** Interfaz común a las cinco herramientas de examen. */
export interface ExamTool {
  readonly id: ToolId;
  /** Encuadra la cámara y deja la linterna lista para examinar. */
  activate(): void;
  /** Devuelve la linterna a su estado armado y libera lo que creó la herramienta. */
  deactivate(): void;
  /** Un cuadro de animación; devuelve true si necesita otro cuadro. */
  update(delta: number): boolean;
  /** Valor del control deslizante de la herramienta (si tiene). */
  setValue(value: number): void;
  /** Reacciona a la elección de una pieza (clic en 3D o botón). */
  select(piece: PieceName): void;
  /** Si la pieza todavía no se puede examinar, explica qué falta hacer. */
  blockedHint(piece: PieceName): string | null;
  /** Descarta impactos del raycaster que el usuario no ve. */
  accepts(hit: Intersection): boolean;
}
