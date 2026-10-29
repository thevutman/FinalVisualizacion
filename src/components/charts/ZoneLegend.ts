import { CASES, ZONE_COLOR, ZONES } from '../../data/casos';
import { h } from '../../lib/dom';

/** Leyenda de colores por zona, con el número de casos de cada una. */
export function createZoneLegend(direction: 'row' | 'column' = 'row'): HTMLElement {
  return h(
    'ul',
    {
      class: `flex gap-x-5 gap-y-2 text-lg ${direction === 'row' ? 'flex-wrap' : 'flex-col'}`,
      'aria-label': 'Colores por zona',
    },
    ZONES.map((zone) => {
      const swatch = h('span', { class: 'size-5 shrink-0 rounded', 'aria-hidden': 'true' });
      // El color es un dato de la infografía, no una clase fija.
      swatch.style.backgroundColor = ZONE_COLOR[zone];
      const count = CASES.filter((item) => item.zone === zone).length;
      return h('li', { class: 'flex items-center gap-2' }, [
        swatch,
        h('span', {}, [h('span', { class: 'font-semibold' }, [zone]), ` · ${count}`]),
      ]);
    }),
  );
}
