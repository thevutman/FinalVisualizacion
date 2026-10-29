import type { BeliefId } from './casos';

export const VERDICT_IDS = ['existe', 'leyenda', 'falta'] as const;
export type VerdictId = (typeof VERDICT_IDS)[number];

export interface VerdictOption {
  id: VerdictId;
  etiqueta: string;
  /** Respuesta de la encuesta que equivale a este veredicto. */
  creencia: BeliefId;
}

export const VERDICT = {
  pregunta: '¿Cuál es tu veredicto, investigador?',
  sello: 'Caso 08 · Abierto',
  comparacion: (etiqueta: string) =>
    `Tu respuesta: «${etiqueta}». Mira qué respondieron los estudiantes.`,
  opciones: [
    { id: 'existe', etiqueta: 'Sí existe', creencia: 'real' },
    { id: 'leyenda', etiqueta: 'Es una leyenda', creencia: 'falso' },
    { id: 'falta', etiqueta: 'Faltan pruebas', creencia: 'noSabe' },
  ] satisfies VerdictOption[],
  compartir: {
    boton: 'Compartir el caso',
    titulo: 'Caso 08 · El zorro de la UPB',
    texto: 'Revisé la linterna del Caso 08. ¿El zorro existe?',
    copiado: 'Enlace del caso copiado.',
  },
};
