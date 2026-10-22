import gsap from 'gsap';
import { h, listen } from '../lib/dom';
import { icon } from '../lib/icons';
import { duration, EASE_OUT } from '../lib/motion';

export interface ModalContent {
  etiqueta: string;
  titulo: string;
  body: HTMLElement;
  /** Ancho máximo: los gráficos necesitan más espacio que una ficha. */
  ancho?: 'ficha' | 'grafico';
}

export interface Modal {
  element: HTMLDialogElement;
  open: (content: ModalContent) => void;
  close: () => void;
}

/**
 * Panel modal sobre <dialog>: el navegador se encarga de atrapar el foco,
 * cerrar con Escape y devolver el foco al control que lo abrió.
 */
export function createModal(): Modal {
  const etiqueta = h('p', { class: 'etiqueta' });
  const titulo = h('h2', { id: 'modal-titulo', class: 'text-titulo' });
  const body = h('div', { class: 'mt-4' });
  const closeButton = h(
    'button',
    { type: 'button', class: 'btn-icono -mr-2 -mt-2', 'aria-label': 'Cerrar' },
    [icon('close')],
  );
  const panel = h('div', { class: 'ficha relative w-full p-5 sm:p-7' }, [
    h('div', { class: 'flex items-start justify-between gap-4' }, [
      h('div', {}, [etiqueta, titulo]),
      closeButton,
    ]),
    body,
  ]);
  const element = h(
    'dialog',
    {
      'aria-labelledby': 'modal-titulo',
      class:
        'm-auto w-[min(100%-2rem,42rem)] bg-transparent p-0 text-tinta backdrop:bg-tinta/60 backdrop:backdrop-blur-[2px]',
    },
    [panel],
  );

  const close = (): void => {
    if (!element.open) return;
    gsap.to(panel, {
      opacity: 0,
      y: 12,
      duration: duration(0.25),
      ease: EASE_OUT,
      onComplete: () => element.close(),
    });
  };

  listen(closeButton, 'click', close);
  // Clic en el fondo oscuro cierra el panel.
  listen(element, 'click', (event) => {
    if (event.target === element) close();
  });
  listen(element, 'close', () => body.replaceChildren());

  return {
    element,
    close,
    open(content) {
      etiqueta.textContent = content.etiqueta;
      titulo.textContent = content.titulo;
      body.replaceChildren(content.body);
      element.classList.toggle('w-[min(100%-2rem,56rem)]', content.ancho === 'grafico');
      element.classList.toggle('w-[min(100%-2rem,42rem)]', content.ancho !== 'grafico');
      if (!element.open) element.showModal();
      gsap.fromTo(
        panel,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: duration(0.45), ease: EASE_OUT },
      );
    },
  };
}
