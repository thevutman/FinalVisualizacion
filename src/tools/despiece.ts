import { Vector3 } from 'three';
import { DESPIECE_ORDER, type PieceName } from '../data/pieces';
import { movePiece, restorePieces } from './movement';
import type { ExamTool, ToolContext } from './types';

/** Separación de cada pieza a lo largo del eje de la linterna (+X = hacia la cabeza). */
const AXIS_OFFSETS: Partial<Record<PieceName, number>> = {
  lente: 1.75,
  cabeza: 1.35,
  reflector: 0.55,
  bombilla: 0.2,
  portabombilla: 0.05,
  pelo: 0.05,
  pilas: -1.2,
  tapa: -1.6,
  correa: -1.6,
};

const MOVED = Object.keys(AXIS_OFFSETS) as PieceName[];

export function createDespiece(context: ToolContext): ExamTool {
  return {
    id: 'despiece',
    activate() {
      context.panel.frame({ target: [0, 0, 0], direction: [0, 0.4, 1], size: 6.2 });
      context.labels.show(
        DESPIECE_ORDER.filter((piece) => context.model.get(piece)).map((piece, index) => ({
          piece,
          text: String(index + 1),
        })),
      );
    },
    deactivate() {
      context.labels.clear();
      restorePieces(context, MOVED);
    },
    update: () => false,
    setValue(value, seconds) {
      for (const piece of MOVED) {
        movePiece(context, piece, new Vector3((AXIS_OFFSETS[piece] ?? 0) * value, 0, 0), seconds);
      }
    },
    accepts: () => true,
  };
}
