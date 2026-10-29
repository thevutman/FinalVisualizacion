/**
 * Datos de los 8 casos y de la encuesta, tomados de la infografía del proyecto
 * ("Sala del detective": js/data.js). Editar aquí actualiza todos los gráficos.
 */
export const ZONES = ['Parqueaderos', 'Biblioteca', 'Zonas verdes', 'Cafetería'] as const;
export type Zone = (typeof ZONES)[number];

export const ZONE_COLOR: Record<Zone, string> = {
  Parqueaderos: '#E8A33C',
  Biblioteca: '#5C86A8',
  'Zonas verdes': '#6E9467',
  Cafetería: '#C97B99',
};

export interface Case {
  id: number;
  year: number;
  zone: Zone;
  /** Posición en % sobre la imagen del campus. */
  x: number;
  y: number;
  /** Semanas que duró (solo 4 casos tienen el dato). */
  weeks: number | null;
  ongoing?: boolean;
}

export const CASES: readonly Case[] = [
  { id: 1, year: 2019, zone: 'Parqueaderos', x: 41.9, y: 81.3, weeks: 20 },
  { id: 2, year: 2021, zone: 'Biblioteca', x: 46.0, y: 22.6, weeks: 14 },
  { id: 3, year: 2022, zone: 'Zonas verdes', x: 28.8, y: 47.9, weeks: null },
  { id: 4, year: 2023, zone: 'Parqueaderos', x: 48.6, y: 77.2, weeks: 9 },
  { id: 5, year: 2024, zone: 'Cafetería', x: 62.8, y: 42.8, weeks: null },
  { id: 6, year: 2024, zone: 'Biblioteca', x: 51.4, y: 26.4, weeks: null },
  { id: 7, year: 2025, zone: 'Zonas verdes', x: 33.7, y: 43.5, weeks: null },
  { id: 8, year: 2025, zone: 'Parqueaderos', x: 44.9, y: 85.4, weeks: 1, ongoing: true },
];

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;

/** Imagen del campus (720 × 488) y el recorte donde está el campus. */
export const CAMPUS_MAP = {
  src: 'img/campus.png',
  width: 720,
  height: 488,
  view: { x: 118, y: 14, w: 494, h: 456 },
};

export type BeliefId = 'real' | 'falso' | 'noSabe';

/** Encuesta: de cada 100 estudiantes, cuántos creen que el zorro es real. */
export const BELIEF: readonly { id: BeliefId; nombre: string; v: number; color: string }[] = [
  { id: 'real', nombre: 'Cree que es real', v: 40, color: '#D8402F' },
  { id: 'falso', nombre: 'Cree que es falso', v: 25, color: '#5C86A8' },
  { id: 'noSabe', nombre: 'No sabe', v: 35, color: '#B9B294' },
];
