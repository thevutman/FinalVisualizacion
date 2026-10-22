import type { PieceName } from './pieces';

export const TOOL_IDS = [
  'despiece',
  'explosion',
  'corte',
  'transparencia',
  'acercamiento',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export interface ToolControl {
  /** Texto visible y accesible del slider. */
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  /** Cómo leer el valor en voz alta (aria-valuetext). */
  format: (value: number) => string;
}

export interface ToolInfo {
  id: ToolId;
  nombre: string;
  /** Piezas que el usuario puede elegir con botones (alternativa accesible al clic en 3D). */
  piezas: readonly PieceName[];
  control?: ToolControl;
}

const percent = (value: number): string => `${Math.round(value * 100)} %`;

export const TOOLS: Record<ToolId, ToolInfo> = {
  despiece: {
    id: 'despiece',
    nombre: 'Despiece',
    piezas: [
      'lente',
      'cabeza',
      'reflector',
      'bombilla',
      'portabombilla',
      'pelo',
      'carcasa',
      'pilas',
      'tapa',
    ],
  },
  explosion: {
    id: 'explosion',
    nombre: 'Explosión',
    piezas: ['boton', 'resorte', 'contacto', 'base_interruptor'],
    control: {
      label: 'Abrir / cerrar la explosión',
      min: 0,
      max: 1,
      step: 0.01,
      initial: 0,
      format: (v) => `Explosión abierta al ${percent(v)}`,
    },
  },
  corte: {
    id: 'corte',
    nombre: 'Corte',
    piezas: ['carcasa', 'pilas', 'muescas'],
    control: {
      label: 'Manija de corte',
      min: 0,
      max: 1,
      step: 0.01,
      initial: 0,
      format: (v) => `Linterna cortada al ${percent(v)}`,
    },
  },
  transparencia: {
    id: 'transparencia',
    nombre: 'Transparencia',
    piezas: ['reflector', 'bombilla', 'pilas', 'etiqueta_2019'],
    control: {
      label: 'Opacidad de la carcasa',
      min: 0.08,
      max: 1,
      step: 0.01,
      initial: 1,
      format: (v) => `Carcasa al ${percent(v)} de opacidad`,
    },
  },
  acercamiento: {
    id: 'acercamiento',
    nombre: 'Acercamiento',
    piezas: ['carcasa', 'huellas', 'tapa', 'correa'],
    control: {
      label: 'Aumento de la lupa',
      min: 1.5,
      max: 8,
      step: 0.1,
      initial: 3,
      format: (v) => `Lupa a ${v.toFixed(1)} aumentos`,
    },
  },
};
