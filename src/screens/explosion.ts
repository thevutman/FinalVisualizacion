import { EXPLOSION_ORDER } from '../data/pieces';
import { toolView } from './toolPanel';

/** Pantalla 04 · Explosión: el mecanismo del interruptor se abre con un slider. */
export const explosionView = toolView('explosion', {
  numbers: Object.fromEntries(EXPLOSION_ORDER.map((piece, index) => [piece, index + 1])),
});
