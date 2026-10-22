import gsap from 'gsap';
import { createCallout } from '../components/Callout';
import { createContadorPistas } from '../components/ContadorPistas';
import { createFallbackEvidence } from '../components/FallbackEvidence';
import { createLibreta } from '../components/Libreta';
import { createToolbar } from '../components/Toolbar';
import { CLUE_LIST, clueForPiece, type Clue } from '../data/clues';
import type { PieceName } from '../data/pieces';
import { PHASES, SCREENS, UI_TEXT } from '../data/screens';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';
import { isWebGLAvailable } from '../lib/webgl';
import type { EvidenceStage, Inspection } from '../scenes/EvidenceStage';
import { allCluesFound, store } from '../state/store';
import type { AppContext, ExamPanel, ExamView } from './types';

export interface ExamLayout {
  element: HTMLElement;
  show: (view: ExamView) => void;
  destroy: () => void;
}

/**
 * Estructura común de las pantallas 02–07 según los wireframes: barra de herramientas
 * arriba, escena 3D al centro, panel de controles, ayuda y libreta de pistas abajo.
 * La escena se crea una vez y se reutiliza al cambiar de herramienta.
 */
export function createExamLayout(app: AppContext): ExamLayout {
  let view: ExamView | null = null;
  let panel: ExamPanel | null = null;
  let stage: EvidenceStage | null = null;
  let destroyed = false;
  let fallbackActive = false;
  /** Último valor del slider, para aplicarlo si la escena termina de cargar después. */
  let panelValue: number | null = null;

  const toolbar = createToolbar({ onSelect: app.go });
  const counter = createContadorPistas();
  const callout = createCallout({ onOpenChart: app.openChart });
  const libreta = createLibreta({ onOpenClue: app.openClue });

  const eyebrow = h('p', { class: 'etiqueta' });
  const title = h('h1', { class: 'text-titulo', tabindex: '-1' });
  const intro = h('p', { class: 'mt-1 max-w-2xl text-cuerpo text-tinta-suave' });
  const help = h('p', { class: 'text-sm text-tinta-suave' });
  const toBoard = h('button', { type: 'button', class: 'btn-pista hidden' }, [
    UI_TEXT.irTablero,
    icon('arrowRight', 'size-4'),
  ]);
  listen(toBoard, 'click', () => app.go('tablero'));

  const sceneHost = h('div', { class: 'absolute inset-0' });
  const overlay = h('div', { class: 'pointer-events-none absolute inset-0' });
  const loading = h('div', { class: 'absolute inset-0 grid place-items-center', role: 'status' }, [
    h('p', { class: 'flex items-center gap-3 text-sm text-tinta-suave' }, [
      h('span', {
        class: 'size-5 animate-spin rounded-full border-2 border-linea-fuerte border-t-coral-ink',
        'aria-hidden': 'true',
      }),
      UI_TEXT.cargandoEvidencia,
    ]),
  ]);
  const resetView = h(
    'button',
    {
      type: 'button',
      class: 'btn-icono absolute right-2 top-2 bg-papel-claro/80',
      'aria-label': UI_TEXT.restablecerVista,
      title: UI_TEXT.restablecerVista,
    },
    [icon('reset')],
  );
  listen(resetView, 'click', () => stage?.resetView());
  const stageFrame = h(
    'div',
    {
      class:
        'relative h-escena-movil overflow-hidden md:h-escena rounded-ficha border border-linea bg-papel-escena',
      role: 'region',
      'aria-label':
        'Escena 3D de la evidencia A: la linterna. Arrastra para girarla; usa la lista de piezas para examinarla con teclado.',
    },
    [sceneHost, overlay, loading],
  );
  const aside = h('div', { class: 'grid content-start gap-3' });

  const element = h('div', { class: 'space-y-4 pb-28 md:pb-0' }, [
    toolbar.element,
    h('div', { class: 'flex flex-wrap items-end justify-between gap-4' }, [
      h('div', {}, [eyebrow, title, intro]),
      h('div', { class: 'flex flex-wrap items-center gap-3' }, [counter.element, toBoard]),
    ]),
    h('div', { class: 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]' }, [
      h('div', { class: 'space-y-2' }, [stageFrame, help]),
      h('div', { class: 'grid content-start gap-3' }, [aside, callout.element]),
    ]),
    libreta.element,
  ]);

  const pendingPieces = (): readonly PieceName[] => {
    const found = store.get().found;
    return CLUE_LIST.filter(
      (clue) => clue.herramienta === view?.tool && !found.includes(clue.id),
    ).flatMap((clue) => clue.piezas);
  };

  /** Resultado de examinar una pieza: ficha, pista nueva y, si corresponde, sus datos. */
  const handleInspection = (inspection: Inspection): void => {
    callout.show(inspection);
    panel?.onInspect?.(inspection);
    if (inspection.clue) reveal(inspection.clue);
  };

  const reveal = (clue: Clue): void => {
    if (store.addClue(clue.id)) {
      app.announce(
        allCluesFound(store.get())
          ? `${UI_TEXT.pistaEncontrada(clue.numero, clue.titulo)} ${UI_TEXT.todasLasPistas}`
          : UI_TEXT.pistaEncontrada(clue.numero, clue.titulo),
        'pista',
      );
    }
    if (clue.dato) app.openChart(clue.dato);
  };

  /** Sin escena 3D (sin WebGL) los botones de piezas revelan la pista directamente. */
  const inspectPiece = (current: ExamView, piece: PieceName): void => {
    if (stage) {
      stage.inspect(piece);
      return;
    }
    if (!fallbackActive || !current.tool) return;
    handleInspection({
      tool: current.tool,
      piece,
      clue: clueForPiece(current.tool, piece) ?? null,
      hint: null,
    });
  };

  const fallback = createFallbackEvidence({
    onExamine: (clue) => {
      callout.show({ piece: clue.piezas[0] ?? 'carcasa', clue, hint: null });
      reveal(clue);
    },
  });

  const mountStage = async (): Promise<void> => {
    if (!isWebGLAvailable()) {
      useFallback();
      return;
    }
    try {
      const { EvidenceStage } = await import('../scenes/EvidenceStage');
      const created = await EvidenceStage.create(sceneHost, overlay, {
        onInspect: handleInspection,
        onValueChange: (value) => panel?.onValueChange?.(value),
      });
      if (destroyed) {
        created.dispose();
        return;
      }
      stage = created;
      stage.setFound(store.get().found);
      stage.setTool(view?.tool ?? null);
      // El panel ya pudo fijar el valor inicial antes de que existiera la escena.
      const initial = view?.tool ? panelValue : null;
      if (initial !== null) stage.setValue(initial);
      loading.remove();
      stageFrame.append(resetView);
      gsap.from(sceneHost, { opacity: 0, duration: duration(0.6), ease: EASE_OUT });
    } catch (error) {
      console.error('[ExamLayout] No se pudo preparar la escena 3D.', error);
      useFallback();
    }
  };

  const useFallback = (): void => {
    fallbackActive = true;
    stageFrame.classList.remove('h-escena-movil', 'md:h-escena');
    stageFrame.replaceChildren(fallback.element);
    stageFrame.removeAttribute('role');
    fallback.update(store.get(), view?.tool ?? null);
  };

  const unsubscribe = store.subscribe((state) => {
    toolbar.update(state);
    counter.update(state);
    libreta.update(state);
    fallback.update(state, view?.tool ?? null);
    stage?.setFound(state.found);
    panel?.onStateChange?.();
    toBoard.classList.toggle('hidden', !allCluesFound(state));
  });

  const refresh = (): void => {
    const state = store.get();
    toolbar.update(state);
    counter.update(state);
    libreta.update(state);
    toBoard.classList.toggle('hidden', !allCluesFound(state));
  };

  void mountStage();

  return {
    element,
    show(next) {
      const screen = SCREENS[next.screen];
      view = next;
      panel?.destroy?.();
      panelValue = null;
      panel = next.createPanel({
        app,
        inspect: (piece) => inspectPiece(next, piece),
        setValue: (value) => {
          panelValue = value;
          stage?.setValue(value);
        },
        pendingPieces,
      });
      stage?.setTool(next.tool);
      if (panelValue !== null) stage?.setValue(panelValue);
      fallback.update(store.get(), next.tool);

      eyebrow.textContent = `Pantalla ${screen.numero} · ${PHASES[screen.fase]}`;
      title.textContent = screen.titulo;
      intro.textContent = screen.intro;
      help.textContent = screen.ayuda ?? '';
      aside.replaceChildren(panel.element);
      callout.clear();
      refresh();
      gsap.fromTo(
        [title, intro, aside],
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: duration(0.45), ease: EASE_OUT, stagger: 0.05 },
      );
      title.focus({ preventScroll: true });
    },
    destroy() {
      destroyed = true;
      unsubscribe();
      panel?.destroy?.();
      stage?.dispose();
      stage = null;
    },
  };
}
