import { PIECES, type PieceName } from '../data/pieces';
import { h, listen } from '../lib/dom';

export interface PieceListProps {
  pieces: readonly PieceName[];
  /** Número visible de cada pieza (coincide con los rótulos de la escena). */
  numbers?: Partial<Record<PieceName, number>>;
  onSelect: (piece: PieceName) => void;
}

export interface PieceList {
  element: HTMLElement;
  setSelected: (piece: PieceName | null) => void;
  /** Marca las piezas que todavía guardan una pista (equivalente al brillo en 3D). */
  setGlowing: (pieces: readonly PieceName[]) => void;
}

/** Alternativa accesible a tocar piezas en 3D: un botón por pieza. */
export function createPieceList({ pieces, numbers = {}, onSelect }: PieceListProps): PieceList {
  const buttons = pieces.map((piece) => {
    const number = numbers[piece];
    const glow = h('span', {
      class: 'ml-auto hidden size-2.5 rounded-full bg-ambar ring-2 ring-ambar-claro',
      'aria-hidden': 'true',
    });
    const hint = h('span', { class: 'sr-only' });
    const button = h(
      'button',
      {
        type: 'button',
        'aria-pressed': 'false',
        class:
          'flex min-h-tactil w-full items-center gap-2 rounded-ficha border border-linea bg-papel-claro px-3 text-left text-sm font-medium transition-colors duration-corta hover:bg-papel-oscuro aria-pressed:border-tinta aria-pressed:bg-tinta aria-pressed:text-papel-claro',
      },
      [
        number !== undefined &&
          h('span', { class: 'font-mono text-xs', 'aria-hidden': 'true' }, [String(number)]),
        PIECES[piece].nombre,
        hint,
        glow,
      ],
    );
    listen(button, 'click', () => onSelect(piece));
    return { piece, button, glow, hint };
  });

  const element = h('div', { class: 'ficha p-4' }, [
    h('p', { class: 'etiqueta', id: 'piezas-titulo' }, ['Piezas para examinar']),
    h(
      'ul',
      {
        class: 'mt-2 grid grid-cols-2 gap-2',
        'aria-labelledby': 'piezas-titulo',
      },
      buttons.map(({ button }) => h('li', {}, [button])),
    ),
  ]);

  return {
    element,
    setSelected(selected) {
      buttons.forEach(({ piece, button }) =>
        button.setAttribute('aria-pressed', String(piece === selected)),
      );
    },
    setGlowing(glowing) {
      buttons.forEach(({ piece, glow, hint }) => {
        const on = glowing.includes(piece);
        glow.classList.toggle('hidden', !on);
        hint.textContent = on ? ' (brilla: puede guardar una pista)' : '';
      });
    },
  };
}
