import type { ToolId } from './tools';

export const SCREEN_IDS = [
  'apertura',
  'mesa',
  'despiece',
  'explosion',
  'corte',
  'transparencia',
  'acercamiento',
  'tablero',
  'veredicto',
] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];

export type PhaseId = 'apertura' | 'examen' | 'resolucion';

export const PHASES: Record<PhaseId, string> = {
  apertura: 'Fase 1 · Apertura',
  examen: 'Fase 2 · Examen de la evidencia',
  resolucion: 'Fase 3 · Resolución',
};

export interface ScreenText {
  id: ScreenId;
  numero: string;
  fase: PhaseId;
  /** Nombre corto para el indicador de progreso. */
  nombre: string;
  titulo: string;
  intro: string;
  /** Instrucción breve debajo de la escena. */
  ayuda?: string;
  /** Nota corta del panel lateral (p. ej. qué datos abre la pista). */
  nota?: string;
  herramienta?: ToolId;
}

export const SCREENS: Record<ScreenId, ScreenText> = {
  apertura: {
    id: 'apertura',
    numero: '01',
    fase: 'apertura',
    nombre: 'Apertura del caso',
    titulo: 'Expediente Caso 08',
    intro: 'Recibes tu rol de investigador y la evidencia que vas a examinar.',
  },
  mesa: {
    id: 'mesa',
    numero: '02',
    fase: 'examen',
    nombre: 'Mesa de examen',
    titulo: 'Mesa de examen',
    intro: 'Elige una herramienta para examinar la linterna.',
    ayuda: 'Gira la linterna arrastrando sobre la escena. Cada herramienta esconde una pista.',
  },
  despiece: {
    id: 'despiece',
    numero: '03',
    fase: 'examen',
    nombre: 'Despiece',
    titulo: 'Herramienta: despiece',
    intro: 'Las piezas separadas sobre un eje, numeradas y con su función.',
    ayuda: 'Toca cada pieza para leer su función. Las piezas con pista brillan.',
    herramienta: 'despiece',
  },
  explosion: {
    id: 'explosion',
    numero: '04',
    fase: 'examen',
    nombre: 'Explosión',
    titulo: 'Herramienta: explosión',
    intro: 'El mecanismo del interruptor estalla en piezas pequeñas para ver cómo encajan.',
    ayuda: 'Mueve el control para abrir el mecanismo y toca las piezas.',
    herramienta: 'explosion',
  },
  corte: {
    id: 'corte',
    numero: '05',
    fase: 'examen',
    nombre: 'Corte',
    titulo: 'Herramienta: corte',
    intro: 'El compartimento de pilas cortado a lo largo deja ver su interior.',
    ayuda: 'Corta la linterna con la manija y toca las muescas para ver los datos.',
    nota: 'Las muescas abren el gráfico de casos por año (2019 a 2025).',
    herramienta: 'corte',
  },
  transparencia: {
    id: 'transparencia',
    numero: '06',
    fase: 'examen',
    nombre: 'Transparencia',
    titulo: 'Herramienta: transparencia',
    intro: 'La carcasa se vuelve translúcida para ver el interior sin desarmar la linterna.',
    ayuda: 'Baja la opacidad hasta ver el interior y toca lo que encuentres.',
    herramienta: 'transparencia',
  },
  acercamiento: {
    id: 'acercamiento',
    numero: '07',
    fase: 'examen',
    nombre: 'Acercamiento',
    titulo: 'Herramienta: acercamiento',
    intro: 'Una lupa sobre la carcasa revela los detalles más pequeños.',
    ayuda:
      'Mueve la lupa sobre la carcasa y toca los detalles. La rueda del mouse cambia el aumento.',
    nota: 'Con teclado, elige una pieza para llevar la lupa hasta ella. Las huellas abren el mapa del campus.',
    herramienta: 'acercamiento',
  },
  tablero: {
    id: 'tablero',
    numero: '08',
    fase: 'resolucion',
    nombre: 'Tablero de pistas',
    titulo: 'Tablero de pistas',
    intro: 'Conecta las 5 pistas con el Caso 08. Dos de ellas abren los datos del caso.',
    ayuda:
      'Arrastra el alfiler de cada pista hasta el Caso 08, o púlsalo (también con teclado) para tender el hilo.',
  },
  veredicto: {
    id: 'veredicto',
    numero: '09',
    fase: 'resolucion',
    nombre: 'Veredicto',
    titulo: 'Veredicto: Caso 08',
    intro: 'Cierra el expediente con tu veredicto.',
  },
};

export const EXAM_SCREENS: readonly ScreenId[] = [
  'mesa',
  'despiece',
  'explosion',
  'corte',
  'transparencia',
  'acercamiento',
];

export function isExamScreen(id: ScreenId): boolean {
  return EXAM_SCREENS.includes(id);
}

export const UI_TEXT = {
  marca: 'El zorro de la UPB',
  progreso: 'Progreso del expediente',
  libreta: 'Libreta de pistas',
  pistaVacia: (n: number) => `Pista ${n} (vacía)`,
  contador: (n: number, total: number) => `Pistas: ${n} de ${total}`,
  conectadas: (n: number, total: number) => `Conectadas: ${n} de ${total}`,
  volverMesa: 'Volver a la mesa',
  irTablero: 'Ir al tablero',
  abrirEvidencia: 'Abrir evidencia',
  cerrarCaso: 'Cerrar el caso',
  reiniciar: 'Reiniciar el caso',
  restablecerVista: 'Restablecer vista',
  cargandoEvidencia: 'Preparando la evidencia…',
  pistaEncontrada: (n: number, titulo: string) =>
    `Pista ${n} encontrada: ${titulo}. Guardada en la libreta.`,
  todasLasPistas: 'Tienes las 5 pistas. El tablero está listo.',
  sinWebgl:
    'Tu navegador no puede mostrar la linterna en 3D. Puedes examinar la evidencia igual con esta ficha.',
} as const;
