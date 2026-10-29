import type { Intersection } from 'three';
import type { ToolId } from '../data/tools';
import type { LabelLayer } from '../scenes/LabelLayer';
import type { LinternaModel } from '../scenes/LinternaModel';
import type { ScenePanel } from '../scenes/ScenePanel';

export interface ToolContext {
  panel: ScenePanel;
  model: LinternaModel;
  labels: LabelLayer;
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
  /** Lleva la herramienta a un valor entre 0 (sin aplicar) y 1, animando durante `seconds`. */
  setValue(value: number, seconds: number): void;
  /** Descarta impactos del raycaster que el usuario no ve. */
  accepts(hit: Intersection): boolean;
}
