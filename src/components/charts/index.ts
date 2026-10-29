import type { ChartId } from '../../data/charts';
import { createBeliefChart } from './BeliefChart';
import { createCaseMap } from './CaseMap';
import { createDurationChart } from './DurationChart';
import type { Chart } from './types';
import { createYearlyChart } from './YearlyChart';
import { createZonesChart } from './ZonesChart';

const FACTORIES: Record<ChartId, () => Chart> = {
  casosPorAnio: createYearlyChart,
  mapaCasos: createCaseMap,
  zonas: createZonesChart,
  duracion: createDurationChart,
  creencia: createBeliefChart,
};

export function createChart(id: ChartId): Chart {
  return FACTORIES[id]();
}

export type { Chart };
