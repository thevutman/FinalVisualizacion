import { CLUE_IDS, CLUES, type ClueId } from '../data/clues';
import { SCREEN_IDS, SCREENS, type ScreenId } from '../data/screens';
import { VERDICT_IDS, type VerdictId } from '../data/verdict';

export interface CaseState {
  screen: ScreenId;
  /** Índice del paso más avanzado al que llegó el usuario. */
  reached: number;
  found: readonly ClueId[];
  /** Las pistas ya se unieron en el tablero. */
  joined: boolean;
  verdict: VerdictId | null;
}

type Listener = (state: CaseState, previous: CaseState) => void;

const STORAGE_KEY = 'zorro-upb:caso-08:v2';

const INITIAL_STATE: CaseState = {
  screen: 'apertura',
  reached: 0,
  found: [],
  joined: false,
  verdict: null,
};

function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}

/** Lee el estado guardado validando cada campo: un localStorage corrupto nunca rompe la app. */
function readStoredState(): CaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const data = JSON.parse(raw) as Partial<Record<keyof CaseState, unknown>>;
    const stored: unknown[] = Array.isArray(data.found) ? data.found : [];
    const found = CLUE_IDS.filter((id) => stored.includes(id));
    return {
      screen: isOneOf(SCREEN_IDS, data.screen) ? data.screen : INITIAL_STATE.screen,
      reached:
        typeof data.reached === 'number'
          ? Math.min(Math.max(0, data.reached), SCREEN_IDS.length - 1)
          : 0,
      found,
      joined: data.joined === true,
      verdict: isOneOf(VERDICT_IDS, data.verdict) ? data.verdict : null,
    };
  } catch {
    return INITIAL_STATE;
  }
}

function writeStoredState(state: CaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Modo privado o almacenamiento bloqueado: el caso sigue funcionando sin persistencia.
  }
}

class CaseStore {
  private state: CaseState = readStoredState();
  private readonly listeners = new Set<Listener>();

  get(): CaseState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private set(patch: Partial<CaseState>): void {
    const previous = this.state;
    this.state = { ...previous, ...patch };
    writeStoredState(this.state);
    this.listeners.forEach((listener) => listener(this.state, previous));
  }

  setScreen(screen: ScreenId): void {
    if (screen === this.state.screen) return;
    this.set({ screen, reached: Math.max(this.state.reached, SCREEN_IDS.indexOf(screen)) });
  }

  /** Devuelve true si la pista es nueva. */
  addClue(id: ClueId): boolean {
    if (this.state.found.includes(id)) return false;
    this.set({ found: CLUE_IDS.filter((clue) => clue === id || this.state.found.includes(clue)) });
    return true;
  }

  joinClues(): void {
    this.set({ joined: true });
  }

  setVerdict(verdict: VerdictId): void {
    this.set({ verdict });
  }

  reset(): void {
    this.set({ ...INITIAL_STATE });
  }
}

export const store = new CaseStore();

export const TOTAL_CLUES = CLUE_IDS.length;

/** ¿Ya se cumplió lo que pide el paso para poder seguir? */
export function isStepComplete(id: ScreenId, state: CaseState): boolean {
  const tool = SCREENS[id].herramienta;
  if (tool) {
    const clue = CLUE_IDS.map((clueId) => CLUES[clueId]).find((item) => item.herramienta === tool);
    return clue ? state.found.includes(clue.id) : true;
  }
  if (id === 'tablero') return state.joined;
  return true;
}

/** Se puede ir a un paso ya visitado, o al siguiente si el actual está completo. */
export function canEnter(id: ScreenId, state: CaseState): boolean {
  const index = SCREEN_IDS.indexOf(id);
  if (index <= state.reached) return true;
  const last = SCREEN_IDS[state.reached];
  return index === state.reached + 1 && last !== undefined && isStepComplete(last, state);
}
