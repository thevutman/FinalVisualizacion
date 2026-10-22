import { CHARTS, type ChartId } from '../data/charts';
import type { Clue } from '../data/clues';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';

export interface ClueCardProps {
  clue: Clue;
  onOpenChart: (id: ChartId) => void;
  /** Nivel del encabezado según dónde se use la ficha. */
  headingLevel?: 'h2' | 'h3';
}

/** Ficha de pista: número, frase, detalle y, si corresponde, el enlace a sus datos. */
export function createClueCard({
  clue,
  onOpenChart,
  headingLevel = 'h3',
}: ClueCardProps): HTMLElement {
  const card = h('div', { class: 'rounded-ficha border-l-4 border-ambar bg-ambar-claro/60 p-4' }, [
    h('p', { class: 'etiqueta !text-ambar-ink' }, [`Pista ${clue.numero} de 5`]),
    h(headingLevel, { class: 'mt-1 font-display text-lg font-extrabold leading-snug' }, [
      clue.resumen,
    ]),
    h('p', { class: 'mt-2 text-sm leading-relaxed text-tinta-suave' }, [clue.detalle]),
  ]);

  if (clue.dato) {
    const chartId = clue.dato;
    const button = h('button', { type: 'button', class: 'btn-secundario mt-3' }, [
      icon(chartId === 'mapaCampus' ? 'map' : 'chart', 'size-4'),
      `Abrir ${CHARTS[chartId].titulo.toLowerCase()}`,
    ]);
    listen(button, 'click', () => onOpenChart(chartId));
    card.append(button);
  }
  return card;
}
