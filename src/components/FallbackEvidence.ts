import { CLUE_LIST, type Clue } from '../data/clues';
import { UI_TEXT } from '../data/screens';
import { TOOLS, type ToolId } from '../data/tools';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import type { CaseState } from '../state/store';

export interface FallbackEvidenceProps {
  onExamine: (clue: Clue) => void;
}

export interface FallbackEvidence {
  element: HTMLElement;
  update: (state: CaseState, tool: ToolId | null) => void;
}

/**
 * Versión sin WebGL: imagen estática de la linterna y la lista de pistas,
 * cada una con su botón de examen. El caso se puede resolver igual.
 */
export function createFallbackEvidence({ onExamine }: FallbackEvidenceProps): FallbackEvidence {
  const items = CLUE_LIST.map((clue) => {
    const button = h(
      'button',
      { type: 'button', class: 'btn-secundario w-full justify-start text-left sm:w-auto' },
      [
        icon(clue.herramienta, 'size-4'),
        `Examinar con ${TOOLS[clue.herramienta].nombre.toLowerCase()}`,
      ],
    );
    const status = h('p', { class: 'text-sm text-tinta-suave' });
    listen(button, 'click', () => onExamine(clue));
    const item = h(
      'li',
      {
        class:
          'flex flex-col gap-2 rounded-ficha border border-linea p-3 sm:flex-row sm:items-center sm:justify-between',
      },
      [h('div', {}, [h('p', { class: 'etiqueta' }, [`Pista ${clue.numero}`]), status]), button],
    );
    return { clue, item, status };
  });

  const element = h('div', { class: 'grid gap-4 p-4 md:p-6' }, [
    h('figure', { class: 'grid place-items-center' }, [
      h('img', {
        src: `${import.meta.env.BASE_URL}img/linterna.svg`,
        alt: 'Dibujo técnico de la linterna: cabeza con reflector y lente, cuerpo con interruptor y tapa con correa.',
        width: 640,
        height: 260,
        class: 'h-auto w-full max-w-md',
      }),
      h('figcaption', { class: 'mt-2 text-center text-sm text-tinta-suave' }, [UI_TEXT.sinWebgl]),
    ]),
    h(
      'ul',
      { class: 'grid content-start gap-2' },
      items.map(({ item }) => item),
    ),
  ]);

  return {
    element,
    update(state, tool) {
      for (const { clue, item, status } of items) {
        const found = state.found.includes(clue.id);
        status.textContent = found ? clue.resumen : 'Sin examinar';
        item.classList.toggle('border-ambar', found || clue.herramienta === tool);
        item.classList.toggle('bg-ambar-claro/50', found);
      }
    },
  };
}
