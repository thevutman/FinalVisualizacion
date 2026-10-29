import { h } from '../lib/dom';

export interface Announcer {
  element: HTMLElement;
  announce: (message: string) => void;
}

/** Región invisible que lee en voz alta los hallazgos (lectores de pantalla). */
export function createAnnouncer(): Announcer {
  const element = h('p', { role: 'status', 'aria-live': 'polite', class: 'sr-only' });
  return {
    element,
    announce(message) {
      // Vaciar primero garantiza que un mensaje repetido se vuelva a anunciar.
      element.textContent = '';
      requestAnimationFrame(() => {
        element.textContent = message;
      });
    },
  };
}
