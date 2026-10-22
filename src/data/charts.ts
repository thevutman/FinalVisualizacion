/**
 * Gráficos externos de Flourish. Pega aquí la URL de embed de cada visualización
 * (formato https://flo.uri.sh/visualisation/XXXXXXX/embed). Si la URL está vacía,
 * el panel muestra un aviso en lugar del iframe.
 */
export type ChartId = 'casosPorAnio' | 'mapaCampus';

export interface ChartInfo {
  titulo: string;
  descripcion: string;
  embedUrl: string;
  /** Alto del iframe en píxeles en pantallas medianas y grandes. */
  alto: number;
}

export const CHARTS: Record<ChartId, ChartInfo> = {
  casosPorAnio: {
    titulo: 'Casos por año (2019 a 2025)',
    descripcion: 'Cada muesca del porta pilas corresponde a uno de estos casos.',
    embedUrl: '',
    alto: 520,
  },
  mapaCampus: {
    titulo: 'Mapa del campus con los 8 casos',
    descripcion: 'La tierra de las huellas viene del parqueadero. Ubica los casos en el campus.',
    embedUrl: '',
    alto: 600,
  },
};
