import gsap from 'gsap';
import { isExamScreen, SCREEN_IDS, SCREENS, type ScreenId } from '../data/screens';
import { duration, EASE_OUT } from '../lib/motion';
import { allCluesFound, type CaseState, store } from '../state/store';
import { acercamientoView } from './acercamiento';
import { createApertura } from './apertura';
import { corteView } from './corte';
import { despieceView } from './despiece';
import { createExamLayout, type ExamLayout } from './examLayout';
import { explosionView } from './explosion';
import { mesaView } from './mesa';
import { createTablero } from './tablero';
import type { AppContext, ExamView, Screen, ScreenFactory } from './types';
import { transparenciaView } from './transparencia';
import { createVeredictoScreen } from './veredicto';

const EXAM_VIEWS: Partial<Record<ScreenId, ExamView>> = {
  mesa: mesaView,
  despiece: despieceView,
  explosion: explosionView,
  corte: corteView,
  transparencia: transparenciaView,
  acercamiento: acercamientoView,
};

const SCREEN_FACTORIES: Partial<Record<ScreenId, ScreenFactory>> = {
  apertura: createApertura,
  tablero: createTablero,
  veredicto: createVeredictoScreen,
};

/** Reglas de la máquina de estados: el tablero pide las 5 pistas y el veredicto, el caso cerrado. */
export function canEnter(id: ScreenId, state: CaseState): boolean {
  if (id === 'tablero') return allCluesFound(state);
  if (id === 'veredicto') return state.caseClosed;
  return true;
}

function screenFromHash(): ScreenId | null {
  const id = location.hash.replace(/^#\/?/, '');
  return (SCREEN_IDS as readonly string[]).includes(id) ? (id as ScreenId) : null;
}

/**
 * Máquina de estados simple de las 9 pantallas. Las pantallas 02–07 comparten
 * la mesa de examen (la escena 3D no se recrea al cambiar de herramienta); al
 * salir de la fase de examen la escena se libera.
 */
export class ScreenMachine {
  private current: ScreenId | null = null;
  private screen: Screen | null = null;
  private exam: ExamLayout | null = null;
  private busy = false;
  private queued: ScreenId | null = null;

  constructor(
    private readonly outlet: HTMLElement,
    private readonly app: AppContext,
  ) {
    window.addEventListener('popstate', () => {
      const id = screenFromHash();
      if (id) this.go(id, false);
    });
  }

  start(): void {
    const state = store.get();
    const requested = screenFromHash() ?? state.screen;
    this.go(canEnter(requested, state) ? requested : 'apertura', false);
  }

  go(id: ScreenId, pushHistory = true): void {
    if (!canEnter(id, store.get())) return;
    if (this.busy) {
      this.queued = id;
      return;
    }
    if (id === this.current) return;

    const previous = this.current;
    this.current = id;
    store.setScreen(id);
    document.title = `${SCREENS[id].titulo} · El zorro de la UPB`;
    const hash = `#/${id}`;
    if (location.hash !== hash) {
      if (pushHistory) history.pushState(null, '', hash);
      else history.replaceState(null, '', hash);
    }

    const view = EXAM_VIEWS[id];
    if (view && this.exam && previous && isExamScreen(previous)) {
      this.exam.show(view);
      return;
    }
    void this.swap(id);
  }

  private async swap(id: ScreenId): Promise<void> {
    this.busy = true;
    const outgoing = this.outlet.firstElementChild;
    if (outgoing) {
      await gsap.to(outgoing, { opacity: 0, y: -8, duration: duration(0.3), ease: EASE_OUT });
    }
    this.screen?.destroy();
    this.screen = null;
    this.exam?.destroy();
    this.exam = null;

    let element: HTMLElement;
    const view = EXAM_VIEWS[id];
    if (view) {
      this.exam = createExamLayout(this.app);
      element = this.exam.element;
      this.outlet.replaceChildren(element);
      this.exam.show(view);
    } else {
      const factory = SCREEN_FACTORIES[id];
      if (!factory) throw new Error(`Pantalla sin definir: ${id}`);
      this.screen = factory(this.app);
      element = this.screen.element;
      this.outlet.replaceChildren(element);
      element.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0 });
    await gsap.fromTo(
      element,
      { opacity: 0, y: 12 },
      // clearProps: un transform residual rompería los elementos fixed (libreta en celular).
      {
        opacity: 1,
        y: 0,
        duration: duration(0.55),
        ease: EASE_OUT,
        clearProps: 'transform,opacity',
      },
    );

    this.busy = false;
    const queued = this.queued;
    this.queued = null;
    if (queued) this.go(queued);
  }
}
