import { createButton } from '../components/Button';
import { createClueCard } from '../components/ClueCard';
import { createViewSwitch } from '../components/ViewSwitch';
import { CHARTS } from '../data/charts';
import { CLUE_LIST, type Clue } from '../data/clues';
import { neighborsOf, SCREENS, UI_TEXT } from '../data/screens';
import { TOOLS, type ToolId } from '../data/tools';
import { h } from '../lib/dom';
import { icon } from '../lib/icons';
import type { ExamView, ExamVisual } from './types';

type Phase = 'inicio' | 'buscar' | 'hallada';

/** Segundos sin encontrar la pista antes de sugerir el botón de ayuda. */
const HINT_AFTER_SECONDS = 8;
/** Pausa entre encontrar una pista con datos y mostrar su gráfico. */
const CHART_DELAY_SECONDS = 1.2;

/**
 * Pasos 03–07, todos con la misma secuencia y un solo botón principal a la vez:
 * 1) usar la herramienta, 2) tocar el círculo (o "Mostrarme la pista"),
 * 3) leer la pista y seguir.
 */
export function toolStep(tool: ToolId): ExamView {
  const info = TOOLS[tool];
  const clue = CLUE_LIST.find((item) => item.herramienta === tool) as Clue;
  const { previous, next } = neighborsOf(tool);

  return {
    screen: tool,
    tool,
    mount({ app, frame, act, reveal, showVisual }) {
      let phase: Phase | null = null;
      let timers: number[] = [];

      const clearTimers = (): void => {
        timers.forEach((timer) => window.clearTimeout(timer));
        timers = [];
      };

      const back = previous
        ? createButton({
            label: UI_TEXT.atras,
            icon: 'arrowLeft',
            variant: 'secundario',
            onClick: () => app.go(previous),
          })
        : null;

      const render = (nextPhase: Phase, justFound: boolean): void => {
        phase = nextPhase;
        clearTimers();
        frame.body.replaceChildren();
        frame.nav.replaceChildren(...(back ? [back] : []));

        // Subtítulo con el ícono de la herramienta: qué hace, en palabras simples.
        // Con la pista ya encontrada se omite para dejar espacio a la ficha.
        if (nextPhase !== 'hallada') {
          frame.body.append(
            h('p', { class: 'flex items-center gap-2 text-xl font-semibold text-coral-ink' }, [
              icon(tool, 'size-7'),
              info.explicacion,
            ]),
          );
        }

        if (nextPhase === 'inicio') {
          const action = createButton({
            label: info.accion,
            icon: tool,
            onClick: () => {
              act();
              render('buscar', false);
            },
          });
          action.classList.add('w-full', 'text-xl');
          frame.body.append(action);
          action.focus({ preventScroll: true });
          return;
        }

        if (nextPhase === 'buscar') {
          const hint = h(
            'p',
            { class: 'flex items-start gap-2 text-lg text-tinta', hidden: true },
            [icon('hint', 'mt-0.5 size-6 text-ambar-ink'), UI_TEXT.ayudaPista],
          );
          const showClue = createButton({
            label: UI_TEXT.mostrarPista,
            icon: 'hint',
            variant: 'secundario',
            onClick: () => reveal(clue),
          });
          frame.body.append(
            h(
              'p',
              {
                class:
                  'flex items-start gap-3 rounded-ficha border-2 border-coral-ink bg-papel-claro p-4 text-xl font-semibold',
              },
              [icon('tap', 'mt-0.5 size-7 text-coral-ink'), SCREENS[tool].buscar ?? ''],
            ),
            hint,
            showClue,
          );
          timers.push(
            window.setTimeout(() => {
              hint.hidden = false;
              showClue.classList.replace('btn-secundario', 'btn-primario');
            }, HINT_AFTER_SECONDS * 1000),
          );
          return;
        }

        frame.body.append(createClueCard(clue));
        if (clue.dato) {
          const chartId = clue.dato;
          const views = createViewSwitch<ExamVisual>(
            'Qué ver',
            [
              { id: 'linterna', label: UI_TEXT.verLinterna, icon: 'linterna' },
              {
                id: chartId,
                label: CHARTS[chartId].etiqueta,
                icon: chartId === 'mapaCampus' ? 'map' : 'chart',
              },
            ],
            showVisual,
          );
          views.set('linterna');
          frame.body.append(views.element);
          if (justFound) {
            // La pista abre sus datos: la muesca se convierte en casos, la tierra en el mapa.
            timers.push(
              window.setTimeout(() => {
                views.set(chartId);
                showVisual(chartId);
              }, CHART_DELAY_SECONDS * 1000),
            );
          }
        }
        if (next) {
          const forward = createButton({
            label: `${UI_TEXT.siguiente}: ${SCREENS[next].nombre}`,
            iconAfter: 'arrowRight',
            onClick: () => app.go(next),
          });
          frame.nav.append(forward);
          if (justFound) forward.focus({ preventScroll: true });
        }
      };

      return {
        onState(state) {
          const found = state.found.includes(clue.id);
          if (found && phase !== 'hallada') render('hallada', phase !== null);
          else if (!found && phase === null) render('inicio', false);
        },
        destroy: clearTimers,
      };
    },
  };
}
