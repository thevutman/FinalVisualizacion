export const VERDICT_IDS = ['existe', 'leyenda', 'falta'] as const;
export type VerdictId = (typeof VERDICT_IDS)[number];

export interface VerdictOption {
  id: VerdictId;
  etiqueta: string;
  /** Votos de partida del resultado simulado. */
  base: number;
}

export const VERDICT = {
  pregunta: '¿Cuál es tu veredicto, investigador?',
  sello: 'Caso 08 · Abierto',
  tituloResultados: 'Resultado acumulado de otros investigadores',
  avisoSimulado:
    'Resultado simulado: estos números son ilustrativos y no corresponden a votos reales.',
  opciones: [
    { id: 'existe', etiqueta: 'Sí existe', base: 128 },
    { id: 'leyenda', etiqueta: 'Es una leyenda', base: 84 },
    { id: 'falta', etiqueta: 'Falta evidencia', base: 57 },
  ] satisfies VerdictOption[],
  compartir: {
    boton: 'Compartir expediente',
    titulo: 'Caso 08 · El zorro de la UPB',
    texto: 'Examiné la evidencia del Caso 08. ¿El zorro existe?',
    copiado: 'Enlace del expediente copiado.',
  },
};
