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
  apertura: 'El caso',
  examen: 'Revisar la linterna',
  resolucion: 'Resolver el caso',
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
    texto: 'Vas a revisar una linterna, reunir 5 pistas y decidir si el zorro existe.',
  },
  mesa: {
    id: 'mesa',
    fase: 'examen',
    nombre: 'La linterna',
    titulo: 'La prueba: una linterna',
    texto: 'La vas a revisar de 5 maneras. Cada una esconde una pista.',
  },
  despiece: {
    id: 'despiece',
    fase: 'examen',
    nombre: 'Separar',
    titulo: 'Separar las piezas',
    texto: 'Sacamos las piezas de la linterna, una por una, para ver qué tiene adentro.',
    buscar: 'Algo quedó atrapado donde va el bombillo. Toca el círculo que se mueve.',
    herramienta: 'despiece',
  },
  explosion: {
    id: 'explosion',
    fase: 'examen',
    nombre: 'Abrir el botón',
    titulo: 'Abrir el botón',
    texto: 'El botón para prender la linterna tiene piezas muy pequeñas. Lo abrimos para verlas.',
    buscar: 'Mira el resorte. Toca el círculo que se mueve.',
    herramienta: 'explosion',
  },
  corte: {
    id: 'corte',
    fase: 'examen',
    nombre: 'Por dentro',
    titulo: 'Mirar por dentro',
    texto: 'Partimos la linterna por la mitad para ver dónde van las pilas.',
    buscar: 'Hay rayas en la pared de adentro. Toca el círculo que se mueve.',
    herramienta: 'corte',
  },
  transparencia: {
    id: 'transparencia',
    fase: 'examen',
    nombre: 'Ver a través',
    titulo: 'Ver a través',
    texto: 'Volvemos la linterna de vidrio para ver lo que hay adentro sin abrirla.',
    buscar: 'Hay un papel escondido adentro. Toca el círculo que se mueve.',
    herramienta: 'transparencia',
  },
  acercamiento: {
    id: 'acercamiento',
    fase: 'examen',
    nombre: 'Lupa',
    titulo: 'Mirar con lupa',
    texto: 'Con la lupa vemos detalles que a simple vista no se notan.',
    buscar: 'Hay marcas sobre la linterna. Toca el círculo que se mueve.',
    herramienta: 'acercamiento',
  },
  tablero: {
    id: 'tablero',
    fase: 'resolucion',
    nombre: 'Unir pistas',
    titulo: 'Unir las pistas',
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
  empezar: 'Empezar a revisar',
  abrirExpediente: 'Abrir el caso',
  continuar: 'Continuar donde iba',
  mostrarPista: 'Mostrarme la pista',
  ayudaPista: '¿No lo encuentras? Pulsa «Mostrarme la pista».',
  tocaAqui: 'Toca aquí',
  verLinterna: 'Ver la linterna',
  girar: 'Arrastra la linterna para girarla',
  cargando: 'Preparando la linterna…',
  pistaEncontrada: (n: number, titulo: string) => `Pista ${n} encontrada: ${titulo}.`,
  unirPistas: 'Unir las pistas',
  pistasUnidas: 'Las 5 pistas quedaron unidas al Caso 08. Revisa los datos y cierra el caso.',
  cerrarCaso: 'Cerrar el caso',
  reiniciar: 'Empezar de nuevo',
  sinWebgl: 'Este equipo no puede mostrar la linterna en 3D. Puedes seguir igual con los botones.',
} as const;

/** "Paso 3 de 9 · Revisar la linterna" */
export function eyebrowFor(id: ScreenId): string {
  return `${UI_TEXT.paso(SCREEN_IDS.indexOf(id) + 1, SCREEN_IDS.length)} · ${PHASES[SCREENS[id].fase]}`;
}

/** Paso anterior y siguiente en el recorrido. */
export function neighborsOf(id: ScreenId): { previous: ScreenId | null; next: ScreenId | null } {
  const index = SCREEN_IDS.indexOf(id);
  return { previous: SCREEN_IDS[index - 1] ?? null, next: SCREEN_IDS[index + 1] ?? null };
}
