import { Vector3 } from 'three';
import { EXPLOSION_ORDER, type PieceName } from '../data/pieces';
import { movePiece, restorePieces } from './movement';
import type { ExamTool, ToolContext } from './types';

/** Dirección en que sale cada pieza del interruptor con la explosión abierta al 100 %. */
const DIRECTIONS: Partial<Record<PieceName, Vector3>> = {
  boton: new Vector3(-0.28, 0.7, 0.14),
  resorte: new Vector3(0.32, 0.42, 0.36),
  contacto: new Vector3(-0.32, 0.28, 0.36),
  base_interruptor: new Vector3(0.36, 0.18, -0.1),
};

export function createExplosion(context: ToolContext): ExamTool {
  return {
    id: 'explosion',
    activate() {
      const center = context.model.center('base_interruptor');
      context.panel.frame({
        target: [center.x, center.y + 0.35, center.z],
        direction: [0.35, 0.4, 1],
        size: 2.3,
      });
      context.labels.show(
        EXPLOSION_ORDER.map((piece, index) => ({ piece, text: String(index + 1) })),
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
