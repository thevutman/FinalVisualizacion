import type { IconName } from '../lib/icons';

/**
 * Los 5 gráficos del recorrido (de la infografía del proyecto), con el texto que
 * los une a la historia. Los datos están en data/casos.ts.
 */
export type ChartId = 'casosPorAnio' | 'mapaCasos' | 'zonas' | 'duracion' | 'creencia';

export interface ChartInfo {
  titulo: string;
  /** Nombre corto para los botones. */
  etiqueta: string;
  /** Frase que une el gráfico con la pista o el paso que lo muestra. */
  conexion: string;
  icono: IconName;
}

export const CHARTS: Record<ChartId, ChartInfo> = {
  casosPorAnio: {
    titulo: 'Una leyenda que crece con los años',
    etiqueta: 'Casos por año',
    conexion: 'Cada raya de la linterna es un caso: 8 en total, de 2019 a 2025.',
    icono: 'chart',
  },
  mapaCasos: {
    titulo: 'Los 8 casos en el campus',
    etiqueta: 'Mapa del campus',
    conexion: 'La tierra de las huellas viene del parqueadero: ahí ocurrieron 3 de los 8 casos.',
    icono: 'map',
  },
  zonas: {
    titulo: '¿Dónde ataca el zorro?',
    etiqueta: 'Dónde ataca',
    conexion: 'Los parqueaderos son el lugar con más casos.',
    icono: 'map',
  },
  duracion: {
    titulo: '¿Cuánto tiempo duró cada caso?',
    etiqueta: 'Cuánto duró',
    conexion: 'Cada caso duró menos que el anterior. El caso 8 sigue abierto.',
    icono: 'chart',
  },
  creencia: {
    titulo: '¿El zorro de la UPB es real?',
    etiqueta: 'Qué creen',
    conexion: 'Así respondieron 100 estudiantes en la encuesta del proyecto.',
    icono: 'chart',
  },
};
