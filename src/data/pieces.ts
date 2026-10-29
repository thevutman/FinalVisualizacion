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
  carcasa: 'Cuerpo de la linterna',
  cabeza: 'Cabeza',
  reflector: 'Reflector',
  lente: 'Vidrio del frente',
  bombilla: 'Bombillo',
  portabombilla: 'Base del bombillo',
  pelo: 'Pelo de zorro',
  resorte: 'Resorte',
  boton: 'Botón para prender',
  contacto: 'Lámina de cobre',
  base_interruptor: 'Base del botón',
  pilas: 'Pilas',
  tapa: 'Tapa',
  correa: 'Correa',
  etiqueta_2019: 'Papel con la fecha',
  muescas: 'Rayas',
  huellas: 'Huellas y tierra',
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
