import gsap from 'gsap';
import { createBoard } from '../components/Board';
import { createButton } from '../components/Button';
import { createChartFrame } from '../components/ChartFrame';
import { createStepFrame } from '../components/StepFrame';
import { createViewSwitch } from '../components/ViewSwitch';
import { CHART_IDS, CHARTS, type ChartId } from '../data/charts';
import { eyebrowFor, neighborsOf, SCREENS, UI_TEXT } from '../data/screens';
import { h } from '../lib/dom';
import { duration, EASE_OUT } from '../lib/motion';
import { store } from '../state/store';
import type { ScreenFactory } from './types';

type BoardVisual = 'tablero' | ChartId;

/**
 * Paso 08 · Tablero de pistas: un botón une las 5 pistas con el Caso 08 y
 * después se pueden ver los dos gráficos del caso en grande.
 */
export const createTablero: ScreenFactory = (app) => {
  const screen = SCREENS.tablero;
  const { previous, next } = neighborsOf('tablero');
  const frame = createStepFrame();
  frame.eyebrow.textContent = eyebrowFor('tablero');
  frame.title.textContent = screen.titulo;
  frame.text.textContent = screen.texto;

  const board = createBoard();
  const boardLayer = h('div', { class: 'absolute inset-0' }, [board.element]);
  const charts = CHART_IDS.map((id) => {
    const chart = createChartFrame(id);
    return {
      id,
      chart,
      layer: h('div', { class: 'absolute inset-0', hidden: true }, [chart.element]),
    };
  });
  frame.visual.append(boardLayer, ...charts.map(({ layer }) => layer));

  const showVisual = (visual: BoardVisual): void => {
    boardLayer.hidden = visual !== 'tablero';
    for (const { id, chart, layer } of charts) {
      layer.hidden = id !== visual;
      if (id === visual) chart.load();
    }
    const shown = visual === 'tablero' ? boardLayer : charts.find(({ id }) => id === visual)?.layer;
    if (shown)
      gsap.fromTo(shown, { opacity: 0 }, { opacity: 1, duration: duration(0.5), ease: EASE_OUT });
  };

  const back = previous
    ? createButton({
        label: UI_TEXT.atras,
        icon: 'arrowLeft',
        variant: 'secundario',
        onClick: () => app.go(previous),
      })
    : null;

  const renderJoined = (animate: boolean): void => {
    board.join(animate);
    const views = createViewSwitch<BoardVisual>(
      'Qué ver',
      [
        { id: 'tablero', label: 'Tablero', icon: 'tablero' },
        ...CHART_IDS.map((id) => ({
          id,
          label: CHARTS[id].etiqueta,
          icon: id === 'mapaCampus' ? ('map' as const) : ('chart' as const),
        })),
      ],
      showVisual,
    );
    views.set('tablero');
    frame.body.replaceChildren(
      h('p', { class: 'text-xl font-semibold' }, [UI_TEXT.pistasUnidas]),
      views.element,
    );
    frame.nav.replaceChildren(...(back ? [back] : []));
    if (next) {
      const close = createButton({
        label: UI_TEXT.cerrarCaso,
        iconAfter: 'arrowRight',
        onClick: () => app.go(next),
      });
      frame.nav.append(close);
      if (animate) close.focus({ preventScroll: true });
    }
  };

  if (store.get().joined) {
    renderJoined(false);
  } else {
    const join = createButton({
      label: UI_TEXT.unirPistas,
      icon: 'tablero',
      onClick: () => {
        store.joinClues();
        renderJoined(true);
        app.announce(UI_TEXT.pistasUnidas);
      },
    });
    join.classList.add('w-full', 'text-xl');
    frame.body.append(join);
    frame.nav.append(...(back ? [back] : []));
  }

  return { element: frame.element, destroy: () => undefined };
};
