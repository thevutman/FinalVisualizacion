import gsap from 'gsap';
import { Vector3 } from 'three';
import type { PieceName } from '../data/pieces';
import { duration, EASE_OUT } from '../lib/motion';
import type { ToolContext } from './types';

/**
 * Mueve una pieza a su posición armada + un desplazamiento expresado en el mundo.
 * Convierte el desplazamiento al espacio del padre, así funciona igual con la
 * linterna provisional y con cualquier escala o jerarquía del .glb.
 */
export function movePiece(
  { model, panel }: ToolContext,
  piece: PieceName,
  worldOffset: Vector3,
  seconds = 0.6,
): void {
  const object = model.get(piece);
  const rest = model.rest(piece);
  if (!object || !rest) return;
  const parent = object.parent;
  const local = parent
    ? parent.worldToLocal(worldOffset.clone()).sub(parent.worldToLocal(new Vector3()))
    : worldOffset.clone();
  const target = rest.clone().add(local);
  gsap.to(object.position, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: duration(seconds),
    ease: EASE_OUT,
    overwrite: 'auto',
    onUpdate: panel.invalidate,
  });
}

/** Devuelve piezas a su posición armada. */
export function restorePieces(
  context: ToolContext,
  pieces: readonly PieceName[],
  seconds = 0.5,
): void {
  for (const piece of pieces) movePiece(context, piece, new Vector3(), seconds);
}
