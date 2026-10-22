import {
  ArrowLeft,
  ArrowRight,
  ChartColumn,
  Check,
  ChevronUp,
  Expand,
  Eye,
  FolderOpen,
  Gavel,
  Layers,
  LayoutGrid,
  Lock,
  Map as MapIcon,
  NotebookPen,
  RotateCcw,
  Scissors,
  Search,
  Share2,
  Spool,
  Waypoints,
  X,
  createElement,
  type IconNode,
} from 'lucide';

const ICONS = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  chart: ChartColumn,
  check: Check,
  chevronUp: ChevronUp,
  close: X,
  despiece: Layers,
  explosion: Expand,
  corte: Scissors,
  transparencia: Eye,
  acercamiento: Search,
  folder: FolderOpen,
  gavel: Gavel,
  lock: Lock,
  map: MapIcon,
  mesa: LayoutGrid,
  notebook: NotebookPen,
  reset: RotateCcw,
  share: Share2,
  string: Spool,
  board: Waypoints,
} satisfies Record<string, IconNode>;

export type IconName = keyof typeof ICONS;

/** Icono decorativo (aria-hidden): el texto accesible lo pone el control que lo contiene. */
export function icon(name: IconName, className = 'size-5'): SVGElement {
  return createElement(ICONS[name], {
    class: `shrink-0 ${className}`,
    'aria-hidden': 'true',
    focusable: 'false',
  });
}
