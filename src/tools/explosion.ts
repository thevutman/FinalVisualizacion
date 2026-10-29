import { Vector3 } from 'three';
import { EXPLOSION_ORDER, type PieceName } from '../data/pieces';
import { movePiece, restorePieces } from './movement';
import type { ExamTool, ToolContext } from './types';

/** Dirección en que sale cada pieza del interruptor con la explosión abierta al 100 %. */
const DIRECTIONS: Partial<Record<PieceName, Vector3>> = {
  boton: new Vector3(-0.14, 0.36, 0.07),
  resorte: new Vector3(0.16, 0.22, 0.18),
  contacto: new Vector3(-0.16, 0.14, 0.18),
  base_interruptor: new Vector3(0.18, 0.08, -0.05),
};

export function createExplosion(context: ToolContext): ExamTool {
  return {
    id: 'explosion',
    activate() {
      const center = context.model.center('base_interruptor');
      context.panel.frame({
        target: [center.x, center.y + 0.18, center.z],
        direction: [0.35, 0.4, 1],
        size: 1.25,
      });
      context.labels.show(
        EXPLOSION_ORDER.filter((piece) => context.model.get(piece)).map((piece, index) => ({
          piece,
          text: String(index + 1),
        })),
      );
    },
    deactivate() {
      context.labels.clear();
      restorePieces(context, EXPLOSION_ORDER);
    },
    update: () => false,
    setValue(value, seconds) {
      for (const piece of EXPLOSION_ORDER) {
        const direction = DIRECTIONS[piece];
        if (direction) movePiece(context, piece, direction.clone().multiplyScalar(value), seconds);
      }
    },
    accepts: () => true,
  };
}
