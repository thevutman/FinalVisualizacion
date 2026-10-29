const SVG_NS = 'http://www.w3.org/2000/svg';

type SvgChild = SVGElement | string | false | null | undefined;

/** Crea un elemento SVG con atributos e hijos (equivalente a h() para SVG). */
export function s<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | undefined> = {},
  children: readonly SvgChild[] = [],
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== undefined) element.setAttribute(name, String(value));
  }
  for (const child of children) {
    if (child === false || child === null || child === undefined) continue;
    element.append(child);
  }
  return element;
}
