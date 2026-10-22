import { CLUE_IDS, type ClueId } from '../data/clues';
import { SCREEN_IDS, type ScreenId } from '../data/screens';
import { TOOL_IDS, type ToolId } from '../data/tools';
import { VERDICT_IDS, type VerdictId } from '../data/verdict';

export interface CaseState {
  screen: ScreenId;
  activeTool: ToolId | null;
  found: readonly ClueId[];
  connected: readonly ClueId[];
  caseClosed: boolean;
  verdict: VerdictId | null;
}

type Listener = (state: CaseState, previous: CaseState) => void;

const STORAGE_KEY = 'zorro-upb:caso-08:v1';

const INITIAL_STATE: CaseState = {
  screen: 'apertura',
  activeTool: null,
  found: [],
  connected: [],
  caseClosed: false,
  verdict: null,
};

function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}

function sanitizeList<T extends string>(list: readonly T[], value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return list.filter((item) => value.includes(item));
}

/** Lee el estado guardado validando cada campo: un localStorage corrupto nunca rompe la app. */
function readStoredState(): CaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const data = JSON.parse(raw) as Partial<Record<keyof CaseState, unknown>>;
    return {
      screen: isOneOf(SCREEN_IDS, data.screen) ? data.screen : INITIAL_STATE.screen,
      activeTool: isOneOf(TOOL_IDS, data.activeTool) ? data.activeTool : null,
      found: sanitizeList(CLUE_IDS, data.found),
      connected: sanitizeList(CLUE_IDS, data.connected),
      caseClosed: data.caseClosed === true,
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
    this.set({ screen, activeTool: isOneOf(TOOL_IDS, screen) ? screen : null });
  }

  /** Devuelve true si la pista es nueva. */
  addClue(id: ClueId): boolean {
    if (this.state.found.includes(id)) return false;
    this.set({ found: CLUE_IDS.filter((clue) => clue === id || this.state.found.includes(clue)) });
    return true;
  }

  toggleConnection(id: ClueId): void {
    if (!this.state.found.includes(id)) return;
    const connected = this.state.connected.includes(id)
      ? this.state.connected.filter((clue) => clue !== id)
      : CLUE_IDS.filter((clue) => clue === id || this.state.connected.includes(clue));
    this.set({ connected });
  }

  closeCase(): void {
    this.set({ caseClosed: true });
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

export function allCluesFound(state: CaseState): boolean {
  return state.found.length === TOTAL_CLUES;
}

export function allCluesConnected(state: CaseState): boolean {
  return state.connected.length === TOTAL_CLUES;
}
