import gsap from 'gsap';
import { h } from '../lib/dom';
import { duration, EASE_OUT } from '../lib/motion';

export type AnnouncerTone = 'info' | 'pista';

export interface Announcer {
  element: HTMLElement;
  announce: (message: string, tone?: AnnouncerTone) => void;
}

const VISIBLE_MS = 3600;

/** Aviso flotante que además se lee en voz alta (role="status"). */
export function createAnnouncer(): Announcer {
  const text = h('p', { class: 'text-sm font-medium' });
  const element = h(
    'div',
    {
      role: 'status',
      'aria-live': 'polite',
      class:
        'pointer-events-none fixed inset-x-4 top-4 z-toast mx-auto max-w-md md:bottom-6 md:left-auto md:right-6 md:top-auto md:mx-0 rounded-ficha border-l-4 px-4 py-3 opacity-0 shadow-ficha',
    },
    [text],
  );
  let timer = 0;

  return {
    element,
    announce(message, tone = 'info') {
      window.clearTimeout(timer);
      text.textContent = message;
      element.classList.toggle('bg-ambar-claro', tone === 'pista');
      element.classList.toggle('border-ambar-ink', tone === 'pista');
      element.classList.toggle('bg-tinta', tone === 'info');
      element.classList.toggle('text-papel-claro', tone === 'info');
      element.classList.toggle('border-coral', tone === 'info');
      gsap.fromTo(
        element,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: duration(0.4), ease: EASE_OUT },
      );
      timer = window.setTimeout(() => {
        gsap.to(element, { opacity: 0, duration: duration(0.4), ease: EASE_OUT });
      }, VISIBLE_MS);
    },
  };
}
