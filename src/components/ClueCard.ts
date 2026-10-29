import type { Clue } from '../data/clues';
import { h } from '../lib/dom';
import { icon } from '../lib/icons';
import { TOTAL_CLUES } from '../state/store';

/** Ficha de una pista encontrada: ícono, número, frase y detalle. */
export function createClueCard(clue: Clue): HTMLElement {
  return h('div', { class: 'flex gap-4 rounded-ficha border-2 border-ambar bg-ambar-claro p-4' }, [
    h(
      'span',
      {
        class: 'grid size-14 shrink-0 place-items-center rounded-full bg-ambar text-tinta',
        'aria-hidden': 'true',
      },
      [icon(clue.id, 'size-8')],
    ),
    h('div', { class: 'min-w-0 space-y-1' }, [
      h('p', { class: 'etiqueta text-ambar-ink' }, [`Pista ${clue.numero} de ${TOTAL_CLUES}`]),
      h('h2', { class: 'text-2xl leading-tight' }, [clue.resumen]),
      h('p', { class: 'text-lg leading-snug text-tinta' }, [clue.detalle]),
    ]),
  ]);
}
