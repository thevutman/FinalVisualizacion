/**
 * Contenido narrativo tomado del cuento "El zorro de la UPB".
 * No se inventa texto del cuento: los campos con `null` se completan pegando el
 * texto exacto. Mientras estén vacíos, la interfaz muestra un aviso de "pendiente".
 */
export interface Story {
  caso: string;
  rol: string;
  /** Resumen del Caso 08 tomado del cuento: quién desapareció, dónde y cuándo. */
  resumenCaso: string | null;
  contexto: string;
  evidencia: { codigo: string; nombre: string; descripcion: string };
  /** Notas que el halo de la linterna revela en la apertura. */
  notasOcultas: readonly string[];
  citaFinal: { texto: string | null; fuente: string };
}

export const STORY: Story = {
  caso: 'Caso 08',
  rol: 'Eres el investigador asignado',
  resumenCaso: null,
  contexto:
    'Desde 2019 el campus de la UPB acumula ocho casos sin resolver y todos llevan al mismo rumor: el zorro. El Caso 08 es el último.',
  evidencia: {
    codigo: 'Evidencia A',
    nombre: 'La linterna',
    descripcion: 'Una linterna vieja que perteneció al papá del protagonista.',
  },
  notasOcultas: [
    '8 casos desde 2019',
    'Revisar el parqueadero',
    '¿Quién tuvo la linterna después?',
  ],
  citaFinal: {
    texto: null,
    fuente: 'El zorro de la UPB',
  },
};
