export const TOOL_IDS = [
  'despiece',
  'explosion',
  'corte',
  'transparencia',
  'acercamiento',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export interface ToolInfo {
  id: ToolId;
  /** Nombre técnico de la herramienta (vocabulario de la infografía). */
  nombre: string;
  /** Qué hace, en palabras sencillas. */
  explicacion: string;
  /** Texto del botón que ejecuta la herramienta. */
  accion: string;
  /** Valor (0 a 1) al que la acción lleva la herramienta. */
  valor: number;
}

export const TOOLS: Record<ToolId, ToolInfo> = {
  despiece: {
    id: 'despiece',
    nombre: 'Despiece',
    explicacion: 'Separar las piezas',
    accion: 'Separar las piezas',
    valor: 1,
  },
  explosion: {
    id: 'explosion',
    nombre: 'Explosión',
    explicacion: 'Abrir el interruptor',
    accion: 'Abrir el interruptor',
    valor: 1,
  },
  corte: {
    id: 'corte',
    nombre: 'Corte',
    explicacion: 'Ver por dentro',
    accion: 'Cortar la linterna',
    valor: 0.85,
  },
  transparencia: {
    id: 'transparencia',
    nombre: 'Transparencia',
    explicacion: 'Ver a través de la carcasa',
    accion: 'Volver transparente',
    valor: 0.15,
  },
  acercamiento: {
    id: 'acercamiento',
    nombre: 'Acercamiento',
    explicacion: 'Mirar con lupa',
    accion: 'Usar la lupa',
    valor: 1,
  },
};
