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

export interface PieceInfo {
  nombre: string;
  funcion: string;
}

export const PIECES: Record<PieceName, PieceInfo> = {
  carcasa: {
    nombre: 'Cuerpo',
    funcion: 'Tubo que sirve de mango, protege el circuito y guarda las pilas.',
  },
  cabeza: {
    nombre: 'Cabeza',
    funcion: 'Sostiene el reflector y la lente al frente de la linterna.',
  },
  reflector: {
    nombre: 'Reflector',
    funcion: 'Superficie espejada que concentra la luz de la bombilla en un haz.',
  },
  lente: {
    nombre: 'Lente',
    funcion: 'Cristal frontal que protege la bombilla y deja salir la luz.',
  },
  bombilla: {
    nombre: 'Bombilla',
    funcion: 'Convierte la corriente de las pilas en luz.',
  },
  portabombilla: {
    nombre: 'Portabombilla',
    funcion: 'Sujeta la bombilla y la conecta con el circuito.',
  },
  pelo: {
    nombre: 'Pelo rojizo',
    funcion: 'Un pelo atrapado entre el portabombilla y la bombilla.',
  },
  resorte: {
    nombre: 'Resorte',
    funcion: 'Devuelve el botón a su lugar después de cada pulsación.',
  },
  boton: {
    nombre: 'Botón',
    funcion: 'Abre y cierra el circuito cuando se presiona.',
  },
  contacto: {
    nombre: 'Contacto',
    funcion: 'Lámina de cobre que une el botón con el circuito.',
  },
  base_interruptor: {
    nombre: 'Base',
    funcion: 'Soporte donde encaja todo el mecanismo del interruptor.',
  },
  pilas: {
    nombre: 'Porta pilas',
    funcion: 'Dos pilas AA en serie: la fuente de energía de la linterna.',
  },
  tapa: {
    nombre: 'Tapa',
    funcion: 'Cierra el compartimento de pilas por detrás.',
  },
  correa: {
    nombre: 'Correa',
    funcion: 'Lazo para colgar la linterna de la muñeca.',
  },
  etiqueta_2019: {
    nombre: 'Etiqueta',
    funcion: 'Un papel doblado dentro del cuerpo, escondido detrás de la carcasa.',
  },
  muescas: {
    nombre: 'Muescas',
    funcion: 'Rayas hechas a mano en la pared interior del compartimento de pilas.',
  },
  huellas: {
    nombre: 'Huellas',
    funcion: 'Marcas pequeñas sobre la carcasa, casi invisibles a simple vista.',
  },
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
