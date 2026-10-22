const query = window.matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion(): boolean {
  return query.matches;
}

/** Duración en segundos para GSAP: 0 si el usuario pidió reducir el movimiento. */
export function duration(seconds: number): number {
  return prefersReducedMotion() ? 0 : seconds;
}

/** Curva de salida común a toda la experiencia (equivale a ease-salida de Tailwind). */
export const EASE_OUT = 'power3.out';
