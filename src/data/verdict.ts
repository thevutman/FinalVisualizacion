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
  tituloResultados: 'Lo que votaron otros investigadores',
  avisoSimulado: 'Resultado simulado: son números de ejemplo, no votos reales.',
  opciones: [
    { id: 'existe', etiqueta: 'Sí existe', base: 128 },
    { id: 'leyenda', etiqueta: 'Es una leyenda', base: 84 },
    { id: 'falta', etiqueta: 'Faltan pruebas', base: 57 },
  ] satisfies VerdictOption[],
  compartir: {
    boton: 'Compartir el caso',
    titulo: 'Caso 08 · El zorro de la UPB',
    texto: 'Revisé la linterna del Caso 08. ¿El zorro existe?',
    copiado: 'Enlace del caso copiado.',
  },
};
