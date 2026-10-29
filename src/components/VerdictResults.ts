import gsap from 'gsap';
import { VERDICT, type VerdictId } from '../data/verdict';
import { h } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';

export interface VerdictResults {
  element: HTMLElement;
  show: (mine: VerdictId) => void;
}

/**
 * Barras horizontales con el resultado (simulado) de otros investigadores.
 * Horizontales para que cada etiqueta se lea completa, junto a su barra.
 */
export function createVerdictResults(): VerdictResults {
  const rows = VERDICT.opciones.map((option) => {
    const fill = h('div', { class: 'h-full origin-left rounded-r-ficha' });
    const value = h('span', { class: 'w-16 shrink-0 text-right font-mono text-xl font-medium' });
    const row = h('li', { class: 'grid gap-1' }, [
      h('span', { class: 'flex items-center gap-2 text-lg font-semibold' }, [
        icon(option.id),
        option.etiqueta,
      ]),
      h('span', { class: 'flex items-center gap-3' }, [
        h('span', { class: 'h-10 flex-1 bg-papel-oscuro', 'aria-hidden': 'true' }, [fill]),
        value,
      ]),
    ]);
    return { option, fill, value, row };
  });

  const element = h(
    'figure',
    { class: 'flex size-full flex-col justify-center gap-6 bg-papel-claro p-6 lg:p-10' },
    [
      h('figcaption', { class: 'space-y-1' }, [
        h('span', { class: 'flex flex-wrap items-center gap-3' }, [
          h('span', { class: 'font-display text-2xl font-extrabold' }, [VERDICT.tituloResultados]),
          h('span', { class: 'sello text-coral-ink' }, ['Simulado']),
        ]),
        h('span', { class: 'block text-lg text-tinta' }, [VERDICT.avisoSimulado]),
      ]),
      h(
        'ol',
        { class: 'grid gap-5' },
        rows.map(({ row }) => row),
      ),
    ],
  );

  return {
    element,
    show(mine) {
      const votes = rows.map(({ option }) => option.base + (option.id === mine ? 1 : 0));
      const total = votes.reduce((sum, count) => sum + count, 0);
      rows.forEach(({ option, fill, value, row }, index) => {
        const count = votes[index] ?? 0;
        const percent = Math.round((count / total) * 100);
        const isMine = option.id === mine;
        value.textContent = `${percent} %`;
        row.setAttribute(
          'aria-label',
          `${option.etiqueta}: ${percent} por ciento${isMine ? ', tu voto' : ''}`,
        );
        fill.classList.toggle('bg-coral-ink', isMine);
        fill.classList.toggle('bg-tinta-suave', !isMine);
        // El ancho es el dato: no se puede expresar con una clase fija.
        fill.style.width = `${percent}%`;
        gsap.fromTo(
          fill,
          { scaleX: 0 },
          { scaleX: 1, duration: duration(0.8), ease: EASE_OUT, delay: index * 0.1 },
        );
      });
    },
  };
}
