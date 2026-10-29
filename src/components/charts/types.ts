/** Un gráfico listo para insertar: su elemento y la animación de entrada. */
export interface Chart {
  element: HTMLElement;
  /** Anima la aparición de los datos (se llama cada vez que el gráfico se muestra). */
  animate: () => void;
}
