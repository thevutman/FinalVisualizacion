import { DESPIECE_ORDER } from '../data/pieces';
import { toolView } from './toolPanel';

/** Pantalla 03 · Despiece: piezas separadas sobre el eje, numeradas como en la escena. */
export const despieceView = toolView('despiece', {
  numbers: Object.fromEntries(DESPIECE_ORDER.map((piece, index) => [piece, index + 1])),
});
