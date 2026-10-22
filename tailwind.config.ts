import type { Config } from 'tailwindcss';

/**
 * Design tokens del expediente.
 * La paleta y las fuentes son provisionales: reemplázalas por las de la infografía
 * de la linterna y el resto del proyecto se actualiza solo.
 * Las variantes "-ink" están pensadas para texto sobre papel (contraste AA).
 */
export default {
  content: ['./index.html', './src/**/*.ts'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        tinta: {
          DEFAULT: '#1E2229',
          suave: '#4A505C',
          tenue: '#6B7180',
        },
        papel: {
          DEFAULT: '#F3EEE3',
          claro: '#FBF8F2',
          oscuro: '#E6DECD',
          escena: '#E9E2D3',
        },
        linea: {
          DEFAULT: '#CFC6B4',
          fuerte: '#A79D88',
        },
        ambar: {
          DEFAULT: '#E39B2D',
          claro: '#F7DFB4',
          ink: '#8A5300',
        },
        coral: {
          DEFAULT: '#E2574C',
          claro: '#F8D3CE',
          ink: '#B23A30',
        },
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        etiqueta: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        cuerpo: ['1rem', { lineHeight: '1.6' }],
        lead: ['1.125rem', { lineHeight: '1.65' }],
        titulo: ['clamp(1.5rem, 1.1rem + 1.6vw, 2.25rem)', { lineHeight: '1.15' }],
        portada: ['clamp(2.25rem, 1.4rem + 3.6vw, 4rem)', { lineHeight: '1.02' }],
      },
      spacing: {
        tactil: '2.75rem',
        escena: 'clamp(20rem, 58vh, 40rem)',
        'escena-movil': 'clamp(16rem, 45vh, 22rem)',
      },
      borderRadius: {
        ficha: '0.375rem',
      },
      boxShadow: {
        ficha: '0 1px 0 rgb(30 34 41 / 0.06), 0 8px 24px -12px rgb(30 34 41 / 0.25)',
        sello: 'inset 0 0 0 2px currentColor',
      },
      transitionTimingFunction: {
        salida: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        corta: '400ms',
        media: '550ms',
        larga: '700ms',
      },
      zIndex: {
        libreta: '30',
        toast: '50',
      },
    },
  },
  plugins: [],
} satisfies Config;
