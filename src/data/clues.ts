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
  /** Gráfico de Flourish que abre la pista (opcional). */
  dato?: ChartId;
}

export const CLUES: Record<ClueId, Clue> = {
  pelo: {
    id: 'pelo',
    numero: 1,
    herramienta: 'despiece',
    piezas: ['pelo', 'portabombilla'],
    titulo: 'Pelo de zorro',
    resumen: 'Pelo de zorro en el portabombilla',
    detalle:
      'Al retirar la bombilla aparece un pelo rojizo atrapado en el portabombilla. No es de una persona: es pelo de zorro.',
  },
  resorte: {
    id: 'resorte',
    numero: 2,
    herramienta: 'explosion',
    piezas: ['resorte'],
    titulo: 'Resorte doblado',
    resumen: 'Resorte del interruptor doblado',
    detalle:
      'El resorte del interruptor está doblado, como si alguien hubiera forzado el botón para mantener la linterna encendida.',
  },
  muescas: {
    id: 'muescas',
    numero: 3,
    herramienta: 'corte',
    piezas: ['muescas'],
    titulo: '8 muescas',
    resumen: '8 muescas, una por caso',
    detalle:
      'Rayadas en la pared interior del porta pilas hay 8 muescas. Hay una por cada caso registrado en el campus.',
    dato: 'casosPorAnio',
  },
  etiqueta: {
    id: 'etiqueta',
    numero: 4,
    herramienta: 'transparencia',
    piezas: ['etiqueta_2019'],
    titulo: 'Fecha 2019',
    resumen: 'Etiqueta con la fecha 2019',
    detalle:
      'Dentro del cuerpo hay una etiqueta doblada con una fecha: 2019, el año del primer caso.',
  },
  huellas: {
    id: 'huellas',
    numero: 5,
    herramienta: 'acercamiento',
    piezas: ['huellas'],
    titulo: 'Huellas y tierra',
    resumen: 'Huellas de mano y de pata, con tierra',
    detalle:
      'Bajo la lupa aparecen huellas de mano y de pata encimadas, con restos de tierra del parqueadero.',
    dato: 'mapaCampus',
  },
};

export const CLUE_LIST: readonly Clue[] = CLUE_IDS.map((id) => CLUES[id]);

export function clueForPiece(tool: ToolId, piece: PieceName): Clue | undefined {
  return CLUE_LIST.find((clue) => clue.herramienta === tool && clue.piezas.includes(piece));
}
