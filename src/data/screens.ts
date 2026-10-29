import type { ToolId } from './tools';

export const SCREEN_IDS = [
  'apertura',
  'mesa',
  'despiece',
  'explosion',
  'corte',
  'transparencia',
  'acercamiento',
  'tablero',
  'veredicto',
] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];

export type PhaseId = 'apertura' | 'examen' | 'resolucion';

export const PHASES: Record<PhaseId, string> = {
  apertura: 'Apertura',
  examen: 'Examen de la evidencia',
  resolucion: 'Resolución',
};

export interface ScreenText {
  id: ScreenId;
  fase: PhaseId;
  /** Nombre corto para la barra de pasos. */
  nombre: string;
  titulo: string;
  /** Una o dos frases cortas: qué pasa en este paso. */
  texto: string;
  /** Instrucción después de usar la herramienta: dónde tocar. */
  buscar?: string;
  herramienta?: ToolId;
}

export const SCREENS: Record<ScreenId, ScreenText> = {
  apertura: {
    id: 'apertura',
    fase: 'apertura',
    nombre: 'El caso',
    titulo: 'Eres el investigador del Caso 08',
    texto: 'Vas a examinar una evidencia, reunir 5 pistas y decidir si el zorro existe.',
  },
  mesa: {
    id: 'mesa',
    fase: 'examen',
    nombre: 'La evidencia',
    titulo: 'La evidencia: una linterna',
    texto: 'La vas a examinar con 5 herramientas. Cada una esconde una pista.',
  },
  despiece: {
    id: 'despiece',
    fase: 'examen',
    nombre: 'Despiece',
    titulo: 'Despiece',
    texto: 'Separamos la linterna pieza por pieza para ver qué tiene adentro.',
    buscar: 'Algo quedó atrapado en el portabombilla. Toca el círculo que se mueve.',
    herramienta: 'despiece',
  },
  explosion: {
    id: 'explosion',
    fase: 'examen',
    nombre: 'Explosión',
    titulo: 'Explosión',
    texto: 'El botón de encendido tiene piezas muy pequeñas. Las abrimos para ver cómo encajan.',
    buscar: 'Mira el resorte. Toca el círculo que se mueve.',
    herramienta: 'explosion',
  },
  corte: {
    id: 'corte',
    fase: 'examen',
    nombre: 'Corte',
    titulo: 'Corte',
    texto: 'Cortamos la linterna por la mitad para ver el lugar de las pilas.',
    buscar: 'Hay rayas en la pared de adentro. Toca el círculo que se mueve.',
    herramienta: 'corte',
  },
  transparencia: {
    id: 'transparencia',
    fase: 'examen',
    nombre: 'Transparencia',
    titulo: 'Transparencia',
    texto: 'Volvemos la carcasa transparente, como si fuera de vidrio.',
    buscar: 'Hay un papel escondido adentro. Toca el círculo que se mueve.',
    herramienta: 'transparencia',
  },
  acercamiento: {
    id: 'acercamiento',
    fase: 'examen',
    nombre: 'Acercamiento',
    titulo: 'Acercamiento',
    texto: 'Con la lupa vemos detalles que a simple vista no se notan.',
    buscar: 'Hay marcas sobre la carcasa. Toca el círculo que se mueve.',
    herramienta: 'acercamiento',
  },
  tablero: {
    id: 'tablero',
    fase: 'resolucion',
    nombre: 'Tablero',
    titulo: 'Tablero de pistas',
    texto: 'Ya tienes las 5 pistas. Únelas con el Caso 08 para verlas juntas.',
  },
  veredicto: {
    id: 'veredicto',
    fase: 'resolucion',
    nombre: 'Veredicto',
    titulo: 'Tu veredicto',
    texto: '¿El zorro de la UPB existe?',
  },
};

export function isExamScreen(id: ScreenId): boolean {
  return id === 'mesa' || SCREENS[id].herramienta !== undefined;
}

export const UI_TEXT = {
  marca: 'El zorro de la UPB',
  pasos: 'Pasos del caso',
  paso: (n: number, total: number) => `Paso ${n} de ${total}`,
  libreta: 'Libreta de pistas',
  contador: (n: number, total: number) => `${n} de ${total}`,
  pistaVacia: (n: number) => `Pista ${n}`,
  siguiente: 'Siguiente',
  atras: 'Atrás',
  empezar: 'Empezar el examen',
  abrirExpediente: 'Abrir el expediente',
  continuar: 'Continuar donde iba',
  mostrarPista: 'Mostrarme la pista',
  ayudaPista: '¿No lo encuentras? Pulsa «Mostrarme la pista».',
  tocaAqui: 'Toca aquí',
  verLinterna: 'Ver la linterna',
  girar: 'Arrastra la linterna para girarla',
  cargando: 'Preparando la evidencia…',
  pistaEncontrada: (n: number, titulo: string) => `Pista ${n} encontrada: ${titulo}.`,
  unirPistas: 'Unir las pistas',
  pistasUnidas: 'Las 5 pistas quedaron unidas al Caso 08. Revisa los datos y cierra el caso.',
  cerrarCaso: 'Cerrar el caso',
  reiniciar: 'Empezar de nuevo',
  sinWebgl: 'Este equipo no puede mostrar la linterna en 3D. Puedes seguir igual con los botones.',
} as const;

/** "Paso 3 de 9 · Examen de la evidencia" */
export function eyebrowFor(id: ScreenId): string {
  return `${UI_TEXT.paso(SCREEN_IDS.indexOf(id) + 1, SCREEN_IDS.length)} · ${PHASES[SCREENS[id].fase]}`;
}

/** Paso anterior y siguiente en el recorrido. */
export function neighborsOf(id: ScreenId): { previous: ScreenId | null; next: ScreenId | null } {
  const index = SCREEN_IDS.indexOf(id);
  return { previous: SCREEN_IDS[index - 1] ?? null, next: SCREEN_IDS[index + 1] ?? null };
}
