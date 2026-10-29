import gsap from 'gsap';
import type { Material } from 'three';
import type { PieceName } from '../data/pieces';
import { duration, EASE_OUT } from '../lib/motion';
import type { ExamTool, ToolContext } from './types';

/** Piezas que forman la carcasa exterior y se vuelven translúcidas. */
const SHELL: readonly PieceName[] = ['carcasa', 'cabeza', 'tapa', 'huellas'];

/** Por debajo de esta opacidad el puntero "atraviesa" la carcasa. */
const SEE_THROUGH = 0.6;

interface MaterialState {
  transparent: boolean;
  opacity: number;
  depthWrite: boolean;
}

export function createTransparencia(context: ToolContext): ExamTool {
  const { model, panel } = context;
  const opacity = { value: 1 };
  const original = new Map<Material, MaterialState>();

  const shellMaterials = (): Material[] => SHELL.flatMap((piece) => model.materials(piece));

  const apply = (): void => {
    const solid = opacity.value >= 0.99;
    for (const material of shellMaterials()) {
      const base = original.get(material);
      if (!base) continue;
      const transparent = base.transparent || !solid;
      if (material.transparent !== transparent) material.needsUpdate = true;
      material.transparent = transparent;
      material.opacity = base.opacity * opacity.value;
      material.depthWrite = solid && base.depthWrite;
    }
    panel.invalidate();
  };

  return {
    id: 'transparencia',
    activate() {
      for (const material of shellMaterials()) {
        original.set(material, {
          transparent: material.transparent,
          opacity: material.opacity,
          depthWrite: material.depthWrite,
        });
      }
      panel.frame({ target: [0, 0, 0], direction: [0.05, 0.35, 1], size: 3 });
    },
    deactivate() {
      gsap.killTweensOf(opacity);
      opacity.value = 1;
      for (const [material, state] of original) {
        material.transparent = state.transparent;
        material.opacity = state.opacity;
        material.depthWrite = state.depthWrite;
        material.needsUpdate = true;
      }
      original.clear();
      panel.invalidate();
    },
    update: () => false,
    setValue(value, seconds) {
      gsap.to(opacity, {
        value,
        duration: duration(seconds),
        ease: EASE_OUT,
        overwrite: 'auto',
        onUpdate: apply,
      });
    },
    accepts(hit) {
      const piece = model.pieceOf(hit.object);
      return !(piece && SHELL.includes(piece) && opacity.value <= SEE_THROUGH);
    },
  };
}
