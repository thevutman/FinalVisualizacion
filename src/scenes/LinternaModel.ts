import { Box3, Group, type Material, Mesh, type Object3D, Vector3 } from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PIECE_NAMES, type PieceName } from '../data/pieces';
import { buildPlaceholderLinterna } from './placeholderLinterna';

const MODEL_URL = `${import.meta.env.BASE_URL}models/linterna.glb`;
/** Largo al que se normaliza cualquier modelo, para que encuadres y desplazamientos sirvan igual. */
export const MODEL_LENGTH = 2.6;

const PIECE_SET: ReadonlySet<string> = new Set(PIECE_NAMES);

/**
 * La evidencia A: carga public/models/linterna.glb (o la linterna provisional si no existe)
 * y expone cada pieza por su nombre, con su posición armada guardada como referencia.
 */
export class LinternaModel {
  readonly root = new Group();
  private readonly pieces = new Map<PieceName, Object3D>();
  private readonly restPositions = new Map<PieceName, Vector3>();

  private constructor(content: Object3D) {
    this.root.name = 'evidencia_a';
    this.root.add(content);
    this.normalize(content);
    this.registerPieces(content);
  }

  static async load(): Promise<LinternaModel> {
    // La etiqueta provisional se dibuja con las fuentes del proyecto.
    await document.fonts.ready;
    const content = (await loadGlb()) ?? buildPlaceholderLinterna();
    isolateMaterials(content);
    return new LinternaModel(content);
  }

  get(name: PieceName): Object3D | undefined {
    return this.pieces.get(name);
  }

  /** Posición armada (local) de la pieza. */
  rest(name: PieceName): Vector3 | undefined {
    return this.restPositions.get(name);
  }

  /** Todas las mallas de una pieza (una pieza puede ser un grupo). */
  meshes(name: PieceName): Mesh[] {
    const result: Mesh[] = [];
    this.pieces.get(name)?.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const mesh = object as Mesh;
      if (pieceOf(mesh) === name) result.push(mesh);
    });
    return result;
  }

  /** Materiales de una pieza (clonados por malla, se pueden modificar sin afectar a otras). */
  materials(name: PieceName): Material[] {
    return this.meshes(name).flatMap((mesh) => toArray(mesh.material));
  }

  /** Centro de la pieza en coordenadas del mundo. */
  center(name: PieceName, target = new Vector3()): Vector3 {
    const object = this.pieces.get(name);
    if (!object) return target.set(0, 0, 0);
    return new Box3().setFromObject(object).getCenter(target);
  }

  /** La pieza a la que pertenece una malla tocada por el raycaster. */
  pieceOf(object: Object3D): PieceName | undefined {
    return pieceOf(object);
  }

  get bounds(): Box3 {
    return new Box3().setFromObject(this.root);
  }

  private normalize(content: Object3D): void {
    const box = new Box3().setFromObject(content);
    const size = box.getSize(new Vector3());
    const scale = size.x > 0 ? MODEL_LENGTH / size.x : 1;
    content.scale.multiplyScalar(scale);
    const center = new Box3().setFromObject(content).getCenter(new Vector3());
    content.position.sub(center);
  }

  private registerPieces(content: Object3D): void {
    for (const name of PIECE_NAMES) {
      const object = content.getObjectByName(name);
      if (!object) {
        console.warn(
          `[LinternaModel] Falta la pieza "${name}" en el modelo. Su pista sigue disponible desde los botones.`,
        );
        continue;
      }
      this.pieces.set(name, object);
      this.restPositions.set(name, object.position.clone());
    }
    // Cada malla recuerda su pieza más cercana: así una pieza anidada (pelo dentro
    // del portabombilla) no se confunde con su contenedor.
    content.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      let current: Object3D | null = object;
      while (current && !PIECE_SET.has(current.name)) current = current.parent;
      if (current) object.userData.piece = current.name;
    });
  }
}

function pieceOf(object: Object3D): PieceName | undefined {
  const piece: unknown = object.userData.piece;
  return typeof piece === 'string' && PIECE_SET.has(piece) ? (piece as PieceName) : undefined;
}

async function loadGlb(): Promise<Object3D | null> {
  // three empaqueta el decodificador Draco; Vite lo copia a dist/ con hash.
  const draco = new DRACOLoader();
  const loader = new GLTFLoader().setDRACOLoader(draco);
  try {
    const gltf = await loader.loadAsync(MODEL_URL);
    return gltf.scene;
  } catch {
    console.info(
      '[LinternaModel] No se encontró models/linterna.glb: se usa la linterna provisional.',
    );
    return null;
  } finally {
    draco.dispose();
  }
}

/** Clona los materiales por malla para que cada herramienta los cambie sin efectos cruzados. */
function isolateMaterials(content: Object3D): void {
  content.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const mesh = object as Mesh;
    const original = mesh.material;
    mesh.material = Array.isArray(original)
      ? original.map((material) => material.clone())
      : original.clone();
    toArray(original).forEach((material) => material.dispose());
  });
}

export function toArray(material: Material | Material[]): Material[] {
  return Array.isArray(material) ? material : [material];
}
