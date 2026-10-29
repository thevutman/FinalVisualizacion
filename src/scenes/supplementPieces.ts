import { Box3, Group, type Object3D, Vector3 } from 'three';
import type { PieceName } from '../data/pieces';
import { buildPlaceholderLinterna } from './placeholderLinterna';
import { disposeObject } from './ScenePanel';

/**
 * Piezas con pista que el .glb puede no traer, y la pieza que las contiene.
 * Se toman de la linterna provisional y se encajan dentro de su contenedora.
 */
const HOSTS: Partial<Record<PieceName, PieceName>> = {
  pelo: 'portabombilla',
  muescas: 'carcasa',
  etiqueta_2019: 'carcasa',
  huellas: 'carcasa',
};

/**
 * Completa el modelo con las piezas de pista que le faltan. Cada una se lleva de la
 * caja de su contenedora provisional a la caja de la contenedora real (por eje),
 * así las muescas quedan en la pared interior y las huellas sobre la carcasa
 * aunque el modelo real tenga otras medidas.
 */
export function supplementMissingPieces(content: Object3D): void {
  const missing = (Object.entries(HOSTS) as [PieceName, PieceName][]).filter(
    ([piece, host]) => !content.getObjectByName(piece) && content.getObjectByName(host),
  );
  if (missing.length === 0) return;

  const placeholder = buildPlaceholderLinterna();
  content.updateMatrixWorld(true);
  placeholder.updateMatrixWorld(true);
  const from = new Box3();
  const to = new Box3();
  const scale = new Vector3();
  const offset = new Vector3();

  for (const [piece, host] of missing) {
    const source = placeholder.getObjectByName(piece);
    const sourceHost = placeholder.getObjectByName(host);
    const targetHost = content.getObjectByName(host);
    if (!source || !sourceHost || !targetHost) continue;
    from.setFromObject(sourceHost);
    to.setFromObject(targetHost);
    scale.copy(to.getSize(new Vector3())).divide(from.getSize(new Vector3()));
    offset.copy(to.getCenter(new Vector3())).sub(from.getCenter(new Vector3()).multiply(scale));

    const anchor = new Group();
    anchor.name = `encaje_${piece}`;
    anchor.scale.copy(scale);
    anchor.position.copy(offset);
    anchor.add(source);
    content.add(anchor);
    console.info(
      `[LinternaModel] "${piece}" no está en el .glb: se usa la versión provisional dentro de "${host}".`,
    );
  }
  disposeObject(placeholder);
}
