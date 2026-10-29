/**
 * Piezas de la linterna. El nombre de cada pieza debe coincidir EXACTAMENTE con el
 * nombre del objeto en public/models/linterna.glb (ver README).
 */
export const PIECE_NAMES = [
  'carcasa',
  'cabeza',
  'reflector',
  'lente',
  'bombilla',
  'portabombilla',
  'pelo',
  'resorte',
  'boton',
  'contacto',
  'base_interruptor',
  'pilas',
  'tapa',
  'correa',
  'etiqueta_2019',
  'muescas',
  'huellas',
] as const;

export type PieceName = (typeof PIECE_NAMES)[number];

/** Nombre visible de cada pieza. */
export const PIECE_LABELS: Record<PieceName, string> = {
  carcasa: 'Cuerpo',
  cabeza: 'Cabeza',
  reflector: 'Reflector',
  lente: 'Lente',
  bombilla: 'Bombilla',
  portabombilla: 'Portabombilla',
  pelo: 'Pelo rojizo',
  resorte: 'Resorte',
  boton: 'Botón',
  contacto: 'Contacto',
  base_interruptor: 'Base',
  pilas: 'Porta pilas',
  tapa: 'Tapa',
  correa: 'Correa',
  etiqueta_2019: 'Etiqueta',
  muescas: 'Muescas',
  huellas: 'Huellas',
};

/** Orden y numeración de las piezas en el despiece (de la cabeza a la cola). */
export const DESPIECE_ORDER: readonly PieceName[] = [
  'lente',
  'cabeza',
  'reflector',
  'bombilla',
  'portabombilla',
  'carcasa',
  'pilas',
  'tapa',
];

/** Piezas del mecanismo del interruptor que se separan en la explosión. */
export const EXPLOSION_ORDER: readonly PieceName[] = [
  'boton',
  'resorte',
  'contacto',
  'base_interruptor',
];
