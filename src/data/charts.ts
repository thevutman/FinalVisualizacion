/**
 * Gráficos de Flourish. Pega la URL de embed de cada visualización
 * (https://flo.uri.sh/visualisation/XXXXXXX/embed). Mientras la URL esté vacía,
 * su lugar en pantalla muestra un recuadro que indica qué gráfico va ahí.
 */
export type ChartId = 'casosPorAnio' | 'mapaCampus';

export interface ChartInfo {
  titulo: string;
  /** Nombre corto para los botones. */
  etiqueta: string;
  /** Frase que une el gráfico con la pista que lo abre. */
  conexion: string;
  embedUrl: string;
}

export const CHARTS: Record<ChartId, ChartInfo> = {
  casosPorAnio: {
    titulo: 'Casos por año, 2019 a 2025',
    etiqueta: 'Casos por año',
    conexion: 'Cada raya de la linterna es un caso: 8 en total.',
    embedUrl: '',
  },
  mapaCampus: {
    titulo: 'Mapa del campus con los 8 casos',
    etiqueta: 'Mapa del campus',
    conexion: 'La tierra de las huellas viene del parqueadero.',
    embedUrl: '',
  },
};

export const CHART_IDS = Object.keys(CHARTS) as ChartId[];
