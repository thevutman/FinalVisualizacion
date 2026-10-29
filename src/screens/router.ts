import gsap from 'gsap';
import { isExamScreen, SCREEN_IDS, SCREENS, type ScreenId } from '../data/screens';
import { duration, EASE_OUT } from '../lib/motion';
import { canEnter, store } from '../state/store';
import { acercamientoStep } from './acercamiento';
import { createApertura } from './apertura';
import { corteStep } from './corte';
import { despieceStep } from './despiece';
import { createExamStage, type ExamStage } from './examStage';
import { explosionStep } from './explosion';
import { mesaStep } from './mesa';
import { createTablero } from './tablero';
import { transparenciaStep } from './transparencia';
import type { AppContext, ExamView, Screen, ScreenFactory } from './types';
import { createVeredictoScreen } from './veredicto';

const EXAM_VIEWS: Partial<Record<ScreenId, ExamView>> = {
  mesa: mesaStep,
  despiece: despieceStep,
  explosion: explosionStep,
  corte: corteStep,
  transparencia: transparenciaStep,
  acercamiento: acercamientoStep,
};

const SCREEN_FACTORIES: Partial<Record<ScreenId, ScreenFactory>> = {
  apertura: createApertura,
  tablero: createTablero,
  veredicto: createVeredictoScreen,
};

function screenFromHash(): ScreenId | null {
  const id = location.hash.replace(/^#\/?/, '');
  return (SCREEN_IDS as readonly string[]).includes(id) ? (id as ScreenId) : null;
}

/**
 * Máquina de estados de los 9 pasos (reglas en state/store: canEnter).
 * Los pasos 02–07 comparten la escena 3D, que no se recrea al cambiar de
 * herramienta y se libera al salir de la fase de examen.
 */
export class ScreenMachine {
  private current: ScreenId | null = null;
  private screen: Screen | null = null;
  private exam: ExamStage | null = null;

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
    if (!canEnter(id, store.get()) || id === this.current) return;

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
    this.swap(id);
  }

  /** Cambio inmediato de pantalla; solo se anima la entrada (nunca bloquea la navegación). */
  private swap(id: ScreenId): void {
    this.screen?.destroy();
    this.screen = null;
    this.exam?.destroy();
    this.exam = null;

    let element: HTMLElement;
    const view = EXAM_VIEWS[id];
    if (view) {
      this.exam = createExamStage(this.app);
      element = this.exam.element;
      this.outlet.replaceChildren(element);
      this.exam.show(view);
    } else {
      const factory = SCREEN_FACTORIES[id];
      if (!factory) throw new Error(`Paso sin definir: ${id}`);
      this.screen = factory(this.app);
      element = this.screen.element;
      this.outlet.replaceChildren(element);
      element.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    }
    gsap.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, duration: duration(0.45), ease: EASE_OUT, clearProps: 'opacity' },
    );
  }
}
