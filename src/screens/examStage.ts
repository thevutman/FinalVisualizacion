import gsap from 'gsap';
import { createChartFrame } from '../components/ChartFrame';
import { createStepFrame } from '../components/StepFrame';
import { CLUE_LIST, type Clue } from '../data/clues';
import { UI_TEXT, eyebrowFor, SCREENS } from '../data/screens';
import { h } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';
import { isWebGLAvailable } from '../lib/webgl';
import type { EvidenceStage } from '../scenes/EvidenceStage';
import { store } from '../state/store';
import type { AppContext, ExamPanel, ExamView, ExamVisual } from './types';

export interface ExamStage {
  element: HTMLElement;
  show: (view: ExamView) => void;
  destroy: () => void;
}

/**
 * Pasos 02–07: la escena 3D se crea una sola vez y se reutiliza al pasar de una
 * herramienta a otra. El área visual alterna entre la linterna y los gráficos.
 */
export function createExamStage(app: AppContext): ExamStage {
  const frame = createStepFrame();
  let view: ExamView | null = null;
  let panel: ExamPanel | null = null;
  let stage: EvidenceStage | null = null;
  let destroyed = false;

  const sceneHost = h('div', { class: 'absolute inset-0' });
  const overlay = h('div', { class: 'pointer-events-none absolute inset-0' });
  const loading = h('div', { class: 'absolute inset-0 grid place-items-center', role: 'status' }, [
    h('p', { class: 'flex items-center gap-3 text-lg' }, [
      h('span', {
        class:
          'size-6 animate-spin rounded-full border-4 border-linea-fuerte border-t-coral-ink motion-reduce:animate-none',
        'aria-hidden': 'true',
      }),
      UI_TEXT.cargando,
    ]),
  ]);
  const rotateHint = h(
    'p',
    {
      class:
        'pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-papel-claro/90 px-4 py-2 text-lg font-semibold',
    },
    [icon('tap'), UI_TEXT.girar],
  );
  const linterna = h(
    'div',
    {
      class: 'absolute inset-0',
      role: 'region',
      'aria-label': 'La linterna en 3D.',
    },
    [sceneHost, overlay, loading, rotateHint],
  );
  // Los gráficos que abren las pistas de la linterna (rayas y huellas).
  const chartIds = CLUE_LIST.flatMap((clue) => (clue.dato ? [clue.dato] : []));
  const charts = chartIds.map((id) => {
    const chart = createChartFrame(id);
    const layer = h('div', { class: 'absolute inset-0', hidden: true }, [chart.element]);
    return { id, chart, layer };
  });
  frame.visual.append(linterna, ...charts.map(({ layer }) => layer));

  const showVisual = (visual: ExamVisual): void => {
    const target = visual === 'linterna' ? linterna : charts.find(({ id }) => id === visual)?.layer;
    if (!target?.hidden) return;
    for (const { id, chart, layer } of charts) {
      layer.hidden = id !== visual;
      if (id === visual) chart.show();
    }
    linterna.hidden = visual !== 'linterna';
    if (target)
      gsap.fromTo(target, { opacity: 0 }, { opacity: 1, duration: duration(0.5), ease: EASE_OUT });
  };

  const reveal = (clue: Clue): void => {
    if (store.addClue(clue.id)) app.announce(UI_TEXT.pistaEncontrada(clue.numero, clue.titulo));
  };

  const useFallback = (): void => {
    linterna.replaceChildren(
      h('figure', { class: 'grid size-full place-items-center gap-4 p-6 text-center' }, [
        h('img', {
          src: `${import.meta.env.BASE_URL}img/linterna.svg`,
          alt: 'Dibujo de la linterna: el frente con el vidrio, el cuerpo con el botón y la tapa con la correa.',
          width: 640,
          height: 260,
          class: 'h-auto w-full max-w-xl',
        }),
        h('figcaption', { class: 'max-w-md text-lg' }, [UI_TEXT.sinWebgl]),
      ]),
    );
  };

  const mountStage = async (): Promise<void> => {
    if (!isWebGLAvailable()) {
      useFallback();
      return;
    }
    try {
      const { EvidenceStage } = await import('../scenes/EvidenceStage');
      const created = await EvidenceStage.create(sceneHost, overlay, { onFound: reveal });
      if (destroyed) {
        created.dispose();
        return;
      }
      stage = created;
      stage.setFound(store.get().found);
      stage.setTool(view?.tool ?? null);
      loading.remove();
      gsap.from(sceneHost, { opacity: 0, duration: duration(0.6), ease: EASE_OUT });
    } catch (error) {
      console.error('[ExamStage] No se pudo preparar la escena 3D.', error);
      useFallback();
    }
  };

  const unsubscribe = store.subscribe((state) => {
    stage?.setFound(state.found);
    panel?.onState(state);
  });
  void mountStage();

  return {
    element: frame.element,
    show(next) {
      view = next;
      panel?.destroy();
      frame.body.replaceChildren();
      frame.nav.replaceChildren();
      const screen = SCREENS[next.screen];
      frame.eyebrow.textContent = eyebrowFor(next.screen);
      frame.title.textContent = screen.titulo;
      frame.text.textContent = screen.texto;
      rotateHint.hidden = next.tool !== null;
      showVisual('linterna');
      stage?.setTool(next.tool);
      panel = next.mount({
        app,
        frame,
        act: () => stage?.performAction(),
        reveal,
        showVisual,
      });
      panel.onState(store.get());
      gsap.fromTo(
        [frame.title, frame.text, frame.body, frame.nav],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: duration(0.45), ease: EASE_OUT, stagger: 0.05 },
      );
      frame.title.focus({ preventScroll: true });
    },
    destroy() {
      destroyed = true;
      unsubscribe();
      panel?.destroy();
      stage?.dispose();
      stage = null;
    },
  };
}
