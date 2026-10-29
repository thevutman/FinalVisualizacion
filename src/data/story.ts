/**
 * Contenido narrativo tomado del cuento "El zorro de la UPB".
 * No se inventa texto del cuento: los campos con `null` se completan pegando el
 * texto exacto. Mientras esté vacío, no se muestra.
 */
export interface Story {
  caso: string;
  contexto: string;
  evidencia: { codigo: string; nombre: string; descripcion: string };
  citaFinal: { texto: string | null; fuente: string };
}

export const STORY: Story = {
  caso: 'Caso 08',
  contexto:
    'Desde 2019 el campus de la UPB acumula ocho casos sin resolver y todos llevan al mismo rumor: el zorro. El Caso 08 es el último.',
  evidencia: {
    codigo: 'Evidencia A',
    nombre: 'La linterna',
    descripcion: 'Una linterna vieja que perteneció al papá del protagonista.',
  },
  citaFinal: {
    texto: null,
    fuente: 'El zorro de la UPB',
  },
};
