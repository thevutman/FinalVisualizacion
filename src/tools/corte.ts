import gsap from 'gsap';
import {
  BackSide,
  DoubleSide,
  type Material,
  Mesh,
  MeshBasicMaterial,
  Plane,
  PlaneGeometry,
  Vector3,
} from 'three';
import type { PieceName } from '../data/pieces';
import { duration, EASE_OUT } from '../lib/motion';
import type { ExamTool, ToolContext } from './types';
/** Piezas que el plano corta. Las pilas y las muescas quedan enteras a la vista. */
const CLIPPED: readonly PieceName[] = [
  'carcasa',
  'cabeza',
  'tapa',
  'huellas',
  'boton',
  'resorte',
  'contacto',
  'base_interruptor',
  'etiqueta_2019',
];

/** Cara de corte: coral claro, para que las piezas de adentro resalten sobre ella. */
const SECTION_COLOR = '#F2C4BC';
const KNIFE_COLOR = '#E2574C';

/**
 * Corte longitudinal: dos planos de recorte en intersección quitan la mitad frontal
 * (z > 0) desde la manija hacia la cabeza. Las caras traseras se pintan con un color
 * plano de sección (la "tapa"), así el corte se ve macizo y no hueco.
 */
export function createCorte(context: ToolContext): ExamTool {
  const { model, panel } = context;
  const frontPlane = new Plane(new Vector3(0, 0, -1), 0);
  const handlePlane = new Plane(new Vector3(-1, 0, 0), 0);
  const planes = [frontPlane, handlePlane];
  const progress = { value: 0 };
  let caps: Mesh[] = [];
  let knife: Mesh<PlaneGeometry, MeshBasicMaterial> | null = null;
  let capMaterial: MeshBasicMaterial | null = null;
  let range = { min: 0, max: 0 };

  const clippedMaterials = (): Material[] => CLIPPED.flatMap((piece) => model.materials(piece));

  const applyHandle = (): void => {
    const x = range.max - progress.value * (range.max - range.min);
    handlePlane.constant = x;
    if (knife) {
      knife.position.x = x;
      knife.visible = progress.value > 0.001 && progress.value < 0.999;
    }
    panel.invalidate();
  };

  const isClipped = (point: Vector3): boolean => point.z > 0 && point.x > handlePlane.constant;

  return {
    id: 'corte',
    activate() {
      const bounds = model.bounds;
      range = { min: bounds.min.x - 0.01, max: bounds.max.x + 0.01 };
      const size = bounds.getSize(new Vector3());
      knife = createKnife();
      knife.scale.set(size.z * 1.5, size.y * 1.5, 1);
      knife.position.set(range.max, bounds.getCenter(new Vector3()).y, 0);
      panel.add(knife);
      const sectionMaterial = new MeshBasicMaterial({
        color: SECTION_COLOR,
        side: BackSide,
        clippingPlanes: planes,
        clipIntersection: true,
      });
      capMaterial = sectionMaterial;

      for (const material of clippedMaterials()) {
        material.clippingPlanes = planes;
        material.clipIntersection = true;
        material.needsUpdate = true;
      }
      caps = CLIPPED.flatMap((piece) => model.meshes(piece)).map((mesh) => {
        const cap = new Mesh(mesh.geometry, sectionMaterial);
        cap.raycast = () => undefined;
        mesh.add(cap);
        return cap;
      });

      const center = model.center('pilas');
      panel.frame({
        target: [center.x, center.y, center.z],
        direction: [0.15, 0.18, 1],
        size: 2.6,
      });
      applyHandle();
    },
    deactivate() {
      gsap.killTweensOf(progress);
      progress.value = 0;
      for (const material of clippedMaterials()) {
        material.clippingPlanes = null;
        material.needsUpdate = true;
      }
      caps.forEach((cap) => cap.removeFromParent());
      caps = [];
      capMaterial?.dispose();
      capMaterial = null;
      if (knife) {
        knife.removeFromParent();
        knife.geometry.dispose();
        knife.material.dispose();
        knife = null;
      }
      panel.invalidate();
    },
    update: () => false,
    setValue(value, seconds) {
      gsap.to(progress, {
        value,
        duration: duration(seconds),
        ease: EASE_OUT,
        overwrite: 'auto',
        onUpdate: applyHandle,
      });
    },
    accepts(hit) {
      const piece = model.pieceOf(hit.object);
      return !(piece && CLIPPED.includes(piece) && isClipped(hit.point));
    },
  };
}

/** Plano translúcido que marca dónde pasa la cuchilla. */
function createKnife(): Mesh<PlaneGeometry, MeshBasicMaterial> {
  const knife = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({
      color: KNIFE_COLOR,
      transparent: true,
      opacity: 0.14,
      side: DoubleSide,
      depthWrite: false,
    }),
  );
  knife.rotation.y = Math.PI / 2;
  knife.raycast = () => undefined;
  return knife;
}
