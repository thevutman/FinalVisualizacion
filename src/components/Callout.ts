import gsap from 'gsap';
import type { ChartId } from '../data/charts';
import type { Clue } from '../data/clues';
import { PIECES, type PieceName } from '../data/pieces';
import { h } from '../lib/dom';
import { duration, EASE_OUT } from '../lib/motion';
import { createClueCard } from './ClueCard';

export interface CalloutProps {
  onOpenChart: (id: ChartId) => void;
}

export interface CalloutContent {
  piece: PieceName;
  clue: Clue | null;
  hint: string | null;
}

export interface Callout {
  element: HTMLElement;
  show: (content: CalloutContent) => void;
  clear: () => void;
}

/** Ficha de la pieza elegida: nombre, función y la pista si la guarda. Se anuncia al lector de pantalla. */
export function createCallout({ onOpenChart }: CalloutProps): Callout {
  const empty = h('p', { class: 'text-sm text-tinta-tenue' }, [
    'Elige una pieza para leer su ficha.',
  ]);
  const element = h('div', { class: 'ficha p-4', 'aria-live': 'polite' }, [empty]);

  return {
    element,
    show({ piece, clue, hint }) {
      const info = PIECES[piece];
      const content = h('div', {}, [
        h('p', { class: 'etiqueta' }, ['Pieza']),
        h('h2', { class: 'text-xl' }, [info.nombre]),
        h('p', { class: 'mt-1 text-sm leading-relaxed text-tinta-suave' }, [info.funcion]),
        hint &&
          h(
            'p',
            {
              class:
                'mt-3 rounded-ficha border-l-4 border-coral bg-coral-claro/60 p-3 text-sm text-tinta',
            },
            [hint],
          ),
        clue && h('div', { class: 'mt-3' }, [createClueCard({ clue, onOpenChart })]),
      ]);
      element.replaceChildren(content);
      gsap.fromTo(
        content,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: duration(0.4), ease: EASE_OUT },
      );
    },
    clear() {
      element.replaceChildren(empty);
    },
  };
}
