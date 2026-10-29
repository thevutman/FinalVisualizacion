import type { ChartId } from './charts';
import type { PieceName } from './pieces';
import type { ToolId } from './tools';

export const CLUE_IDS = ['pelo', 'resorte', 'muescas', 'etiqueta', 'huellas'] as const;
export type ClueId = (typeof CLUE_IDS)[number];

export interface Clue {
  id: ClueId;
  numero: number;
  herramienta: ToolId;
  /** Piezas que, al tocarlas con la herramienta correcta, revelan la pista. */
  piezas: readonly PieceName[];
  /** Nombre corto para la libreta. */
  titulo: string;
  /** Frase de la pista tal como aparece en la ficha. */
  resumen: string;
  detalle: string;
  /** Gráfico que abre la pista (opcional). */
  dato?: ChartId;
}

export const CLUES: Record<ClueId, Clue> = {
  pelo: {
    id: 'pelo',
    numero: 1,
    herramienta: 'despiece',
    piezas: ['pelo', 'portabombilla'],
    titulo: 'Pelo de zorro',
    resumen: 'Pelo de zorro donde va el bombillo',
    detalle:
      'Al sacar el bombillo aparece un pelo rojizo atrapado. No es de una persona: es pelo de zorro.',
  },
  resorte: {
    id: 'resorte',
    numero: 2,
    herramienta: 'explosion',
    piezas: ['resorte'],
    titulo: 'Resorte doblado',
    resumen: 'El resorte del botón está doblado',
    detalle: 'Alguien forzó el botón para dejar la linterna prendida, y el resorte quedó doblado.',
  },
  muescas: {
    id: 'muescas',
    numero: 3,
    herramienta: 'corte',
    piezas: ['muescas'],
    titulo: '8 rayas',
    resumen: '8 rayas, una por caso',
    detalle:
      'Por dentro, donde van las pilas, hay 8 rayas hechas a mano. Hay una por cada caso del campus.',
    dato: 'casosPorAnio',
  },
  etiqueta: {
    id: 'etiqueta',
    numero: 4,
    herramienta: 'transparencia',
    piezas: ['etiqueta_2019'],
    titulo: 'Fecha 2019',
    resumen: 'Un papel con la fecha 2019',
    detalle:
      'Dentro de la linterna hay un papel doblado con una fecha: 2019, el año del primer caso.',
  },
  huellas: {
    id: 'huellas',
    numero: 5,
    herramienta: 'acercamiento',
    piezas: ['huellas'],
    titulo: 'Huellas y tierra',
    resumen: 'Huellas de mano y de pata, con tierra',
    detalle:
      'Con la lupa aparecen huellas de mano y de pata, una encima de otra, con tierra del parqueadero.',
    dato: 'mapaCasos',
  },
};

export const CLUE_LIST: readonly Clue[] = CLUE_IDS.map((id) => CLUES[id]);

export function clueForPiece(tool: ToolId, piece: PieceName): Clue | undefined {
  return CLUE_LIST.find((clue) => clue.herramienta === tool && clue.piezas.includes(piece));
}
