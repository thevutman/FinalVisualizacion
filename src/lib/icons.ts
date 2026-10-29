import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChartColumn,
  Check,
  CircleQuestionMark,
  Expand,
  Eye,
  Flashlight,
  FolderOpen,
  Gavel,
  Layers,
  Lightbulb,
  Map as MapIcon,
  MousePointerClick,
  NotebookPen,
  PawPrint,
  RotateCcw,
  Scissors,
  Search,
  Share2,
  Tag,
  Waypoints,
  createElement,
  type IconNode,
} from 'lucide';

/**
 * Íconos propios de las pistas sin equivalente en lucide, dibujados con la misma
 * grilla (24 × 24) y el mismo trazo para que la familia se vea coherente.
 */
const HAIR: IconNode = [
  ['path', { d: 'M4 20c3-1 4-5 7-7s5-6 9-9' }],
  ['path', { d: 'M8 21c2-2 3-4 6-5s4-3 6-4' }],
];
const SPRING: IconNode = [
  ['path', { d: 'M7 3h10' }],
  ['path', { d: 'M7 21h10' }],
  ['path', { d: 'M12 3 7 6l10 3-10 3 10 3-10 3 5 3' }],
];
const TALLY: IconNode = [
  ['path', { d: 'M6 4v16' }],
  ['path', { d: 'M10 4v16' }],
  ['path', { d: 'M14 4v16' }],
  ['path', { d: 'M18 4v16' }],
  ['path', { d: 'M3 17 21 7' }],
];

const ICONS = {
  // Navegación y acciones
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  check: Check,
  share: Share2,
  reset: RotateCcw,
  tap: MousePointerClick,
  hint: Lightbulb,
  chart: ChartColumn,
  map: MapIcon,
  linterna: Flashlight,
  // Pasos
  apertura: FolderOpen,
  mesa: Flashlight,
  despiece: Layers,
  explosion: Expand,
  corte: Scissors,
  transparencia: Eye,
  acercamiento: Search,
  tablero: Waypoints,
  veredicto: Gavel,
  libreta: NotebookPen,
  // Pistas
  pelo: HAIR,
  resorte: SPRING,
  muescas: TALLY,
  etiqueta: Tag,
  huellas: PawPrint,
  // Veredictos
  existe: PawPrint,
  leyenda: BookOpen,
  falta: CircleQuestionMark,
} satisfies Record<string, IconNode>;

export type IconName = keyof typeof ICONS;

/** Ícono decorativo (aria-hidden): el texto accesible lo pone el control que lo contiene. */
export function icon(name: IconName, className = 'size-6'): SVGElement {
  return createElement(ICONS[name], {
    class: `shrink-0 ${className}`,
    'aria-hidden': 'true',
    focusable: 'false',
  });
}
