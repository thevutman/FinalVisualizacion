export const TOOL_IDS = [
  'despiece',
  'explosion',
  'corte',
  'transparencia',
  'acercamiento',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

/**
 * Las 5 maneras de revisar la linterna. Los ids internos conservan el término de la
 * infografía técnica (despiece, explosión, corte…); en pantalla solo se usan
 * palabras del día a día, pensadas para personas no técnicas.
 */
export interface ToolInfo {
  id: ToolId;
  /** Nombre que ve el usuario. */
  nombre: string;
  /** Para qué sirve, en pocas palabras. */
  explicacion: string;
  /** Texto del botón que ejecuta la herramienta. */
  accion: string;
  /** Valor (0 a 1) al que la acción lleva la herramienta. */
  valor: number;
}

export const TOOLS: Record<ToolId, ToolInfo> = {
  despiece: {
    id: 'despiece',
    nombre: 'Separar las piezas',
    explicacion: 'para ver qué tiene adentro',
    accion: 'Separar las piezas',
    valor: 1,
  },
  explosion: {
    id: 'explosion',
    nombre: 'Abrir el botón',
    explicacion: 'para ver sus piezas pequeñas',
    accion: 'Abrir el botón',
    valor: 1,
  },
  corte: {
    id: 'corte',
    nombre: 'Mirar por dentro',
    explicacion: 'como si la partiéramos a la mitad',
    accion: 'Partir por la mitad',
    valor: 0.85,
  },
  transparencia: {
    id: 'transparencia',
    nombre: 'Ver a través',
    explicacion: 'como si fuera de vidrio',
    accion: 'Volverla de vidrio',
    valor: 0.15,
  },
  acercamiento: {
    id: 'acercamiento',
    nombre: 'Mirar con lupa',
    explicacion: 'para ver detalles pequeños',
    accion: 'Usar la lupa',
    valor: 1,
  },
};
