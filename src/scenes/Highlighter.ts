import {
  BackSide,
  Box3,
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import type { PieceName } from '../data/pieces';
import type { LinternaModel } from './LinternaModel';

const GLOW = new Color('#E39B2D');
const OUTLINE = new Color('#E2574C');
const GLOW_INTENSITY = 0.45;
/** Bajo el puntero: un toque sutil en piezas comunes, más fuerte si la pieza guarda pista. */
const HOVER_INTENSITY = 0.15;
const HOVER_GLOW_INTENSITY = 0.8;

interface EmissiveBase {
  color: Color;
  intensity: number;
}

/**
 * Resaltado de piezas: brillo ámbar para las piezas que guardan una pista y
 * contorno coral (técnica de casco invertido) para la pieza bajo el puntero.
 */
export class Highlighter {
  private readonly outlineMaterial = new MeshBasicMaterial({ color: OUTLINE, side: BackSide });
  private readonly bases = new WeakMap<MeshStandardMaterial, EmissiveBase>();
  private glowing = new Set<PieceName>();
  private hovered: PieceName | null = null;
  private outlines: Mesh[] = [];

  constructor(
    private readonly model: LinternaModel,
    private readonly invalidate: () => void,
  ) {}

  setGlow(pieces: Iterable<PieceName>): void {
    const next = new Set(pieces);
    for (const piece of this.glowing) if (!next.has(piece)) this.paint(piece);
    this.glowing = next;
    for (const piece of next) this.paint(piece);
    this.invalidate();
  }

  setHover(piece: PieceName | null): void {
    if (piece === this.hovered) return;
    const previous = this.hovered;
    this.hovered = piece;
    if (previous) this.paint(previous);
    this.clearOutlines();
    if (piece) {
      this.paint(piece);
      this.addOutlines(piece);
    }
    this.invalidate();
  }

  clear(): void {
    this.setHover(null);
    this.setGlow([]);
  }

  dispose(): void {
    this.clear();
    this.outlineMaterial.dispose();
  }

  private paint(piece: PieceName): void {
    const glowing = this.glowing.has(piece);
    const hovered = piece === this.hovered;
    const intensity = hovered
      ? glowing
        ? HOVER_GLOW_INTENSITY
        : HOVER_INTENSITY
      : glowing
        ? GLOW_INTENSITY
        : null;
    for (const material of this.model.materials(piece)) {
      if (!(material instanceof MeshStandardMaterial)) continue;
      let base = this.bases.get(material);
      if (!base) {
        base = { color: material.emissive.clone(), intensity: material.emissiveIntensity };
        this.bases.set(material, base);
      }
      if (intensity === null) {
        material.emissive.copy(base.color);
        material.emissiveIntensity = base.intensity;
      } else {
        material.emissive.copy(GLOW);
        material.emissiveIntensity = intensity;
      }
    }
  }

  private addOutlines(piece: PieceName): void {
    for (const mesh of this.model.meshes(piece)) {
      if (isFlat(mesh)) continue;
      const outline = new Mesh(mesh.geometry, this.outlineMaterial);
      outline.scale.setScalar(1.06);
      outline.raycast = () => undefined;
      mesh.add(outline);
      this.outlines.push(outline);
    }
  }

  private clearOutlines(): void {
    for (const outline of this.outlines) outline.removeFromParent();
    this.outlines = [];
  }
}

/** Una malla plana (etiqueta, parche de huellas) no admite contorno de casco invertido. */
function isFlat(mesh: Mesh): boolean {
  mesh.geometry.computeBoundingBox();
  const size = (mesh.geometry.boundingBox ?? new Box3()).getSize(new Vector3());
  const dims = [size.x, size.y, size.z].sort((a, b) => a - b);
  return (dims[0] ?? 0) < (dims[2] ?? 0) * 0.05;
}
