// Arma public/models/linterna.glb a partir de las piezas sueltas de modelos/piezas,
// con el giro, la escala y la posición de cada una definidos en modelos/montaje.json.
// Cada pieza queda como un nodo con su nombre exacto (el que espera LinternaModel)
// y el resultado se comprime con Draco.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, draco, mergeDocuments, prune, unpartition } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(resolve(root, 'modelos/montaje.json'), 'utf8'));
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.encoder': await draco3d.createEncoderModule() });

/** Cuaternión [x, y, z, w] de una lista de giros [eje, grados], aplicados en orden. */
function quaternion(turns) {
  let q = [0, 0, 0, 1];
  for (const [axis, degrees] of turns) {
    const half = (degrees * Math.PI) / 360;
    const s = Math.sin(half);
    const r = [axis === 'x' ? s : 0, axis === 'y' ? s : 0, axis === 'z' ? s : 0, Math.cos(half)];
    // q = r * q: el giro nuevo se aplica después de los anteriores.
    q = [
      r[3] * q[0] + r[0] * q[3] + r[1] * q[2] - r[2] * q[1],
      r[3] * q[1] - r[0] * q[2] + r[1] * q[3] + r[2] * q[0],
      r[3] * q[2] + r[0] * q[1] - r[1] * q[0] + r[2] * q[3],
      r[3] * q[3] - r[0] * q[0] - r[1] * q[1] - r[2] * q[2],
    ];
  }
  return q;
}

const document = new Document();
const scene = document.createScene('linterna');

/** Copia una pieza al documento final y devuelve un nodo con su transformación. */
async function placePiece(entry, name) {
  const source = await io.read(resolve(root, 'modelos/piezas', entry.archivo));
  const map = mergeDocuments(document, source);
  const node = document
    .createNode(name)
    .setRotation(quaternion(entry.giros ?? []))
    .setScale([entry.escala, entry.escala, entry.escala])
    .setTranslation(entry.posicion);
  for (const sourceScene of source.getRoot().listScenes()) {
    const copied = map.get(sourceScene);
    for (const child of copied.listChildren()) node.addChild(child);
    copied.dispose();
  }
  return node;
}

for (const piece of config.piezas) {
  if (piece.grupo) {
    const group = document.createNode(piece.nombre);
    for (const [index, entry] of piece.grupo.entries()) {
      group.addChild(await placePiece(entry, `${piece.nombre}_${index + 1}`));
    }
    scene.addChild(group);
  } else {
    scene.addChild(await placePiece(piece, piece.nombre));
  }
}
document.getRoot().setDefaultScene(scene);

await document.transform(unpartition(), dedup(), prune(), draco({ method: 'edgebreaker' }));

const output = resolve(root, config.salida);
await io.write(output, document);
console.info(`[montar-linterna] ${config.piezas.length} piezas → ${config.salida}`);
