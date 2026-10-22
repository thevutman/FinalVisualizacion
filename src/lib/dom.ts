type Child = Node | string | false | null | undefined;

type Attrs = Record<string, string | number | boolean | undefined>;

/**
 * Crea un elemento con atributos e hijos. `class` acepta las clases de Tailwind;
 * los atributos booleanos se agregan solo si son true.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: readonly Child[] = [],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    element.setAttribute(name, value === true ? '' : String(value));
  }
  append(element, children);
  return element;
}

export function append(parent: Element, children: readonly Child[]): void {
  for (const child of children) {
    if (child === false || child === null || child === undefined) continue;
    parent.append(child);
  }
}

/** Escucha un evento y devuelve la función que lo desuscribe. */
export function listen<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | Window | Document,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions,
): () => void {
  target.addEventListener(type, handler as EventListener, options);
  return () => target.removeEventListener(type, handler as EventListener, options);
}
