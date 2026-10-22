# Caso 08 · El zorro de la UPB

Experiencia web interactiva en 3D para _Visualización y Diseño de Información_ (UPB). El usuario es el investigador del Caso 08: examina la linterna (evidencia A) con cinco herramientas de infografía técnica, reúne cinco pistas, las conecta en un tablero y entrega su veredicto.

Stack: Vite, TypeScript estricto, Three.js, GSAP, Tailwind CSS (tokens en `tailwind.config.ts`) y lucide. No usa React ni frameworks de UI.

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # typecheck + build estático en dist/
npm run preview    # sirve dist/ para probar el build
npm run lint       # ESLint
npm run format     # Prettier
```

`dist/` es estático y usa rutas relativas (`base: './'`) con navegación por hash (`#/mesa`, `#/corte`…), así que funciona tal cual en Netlify (publish directory: `dist`) y en GitHub Pages, también dentro de una subcarpeta.

## Flujo (9 pantallas, 3 fases)

| Fase           | Pantalla                                        | Archivo                                                       |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| 1 · Apertura   | 01 Apertura del caso                            | `src/screens/apertura.ts`                                     |
| 2 · Examen     | 02 Mesa de examen                               | `src/screens/mesa.ts`                                         |
|                | 03 Despiece: pelo de zorro en el portabombilla  | `src/screens/despiece.ts` + `src/tools/despiece.ts`           |
|                | 04 Explosión: resorte del interruptor doblado   | `src/screens/explosion.ts` + `src/tools/explosion.ts`         |
|                | 05 Corte: 8 muescas, abre el gráfico de casos   | `src/screens/corte.ts` + `src/tools/corte.ts`                 |
|                | 06 Transparencia: etiqueta con la fecha 2019    | `src/screens/transparencia.ts` + `src/tools/transparencia.ts` |
|                | 07 Acercamiento: huellas y tierra, abre el mapa | `src/screens/acercamiento.ts` + `src/tools/acercamiento.ts`   |
| 3 · Resolución | 08 Tablero de pistas                            | `src/screens/tablero.ts`                                      |
|                | 09 Veredicto: Caso 08                           | `src/screens/veredicto.ts`                                    |

`src/screens/router.ts` es la máquina de estados: el tablero se habilita con las 5 pistas y el veredicto cuando se cierra el caso. Las pantallas 02 a 07 comparten `examLayout.ts`, así que la escena 3D no se vuelve a crear al cambiar de herramienta. Se libera (geometrías, materiales, texturas y renderer) al salir de la fase de examen.

## Estructura

```
src/
├── main.ts, app.ts        arranque y estructura fija (encabezado, avisos, modal)
├── scenes/                ScenePanel (renderer, cámara, luces, loop bajo demanda),
│                          LinternaModel (carga el .glb y expone piezas por nombre),
│                          placeholderLinterna, EvidenceStage, Picker, Highlighter, LabelLayer
├── tools/                 una herramienta por archivo, todas con activate/deactivate/update
├── screens/               una pantalla por wireframe + router (máquina de estados)
├── components/            Toolbar, Libreta, ContadorPistas, Callout, TableroPistas,
│                          Veredicto, Modal, DataPanel, SliderControl, PieceList…
├── state/store.ts         estado global tipado con persistencia en localStorage
├── data/                  contenido editable: pistas, textos, piezas, gráficos, cuento
├── lib/                   utilidades pequeñas (DOM, iconos, movimiento reducido, WebGL)
└── styles/main.css        base de Tailwind y clases de componentes
```

## Editar el contenido (sin tocar la lógica)

Todo el texto vive en `src/data/`:

- `screens.ts`: títulos, introducciones y ayudas de cada pantalla.
- `clues.ts`: las 5 pistas (texto, herramienta y pieza que las revela).
- `pieces.ts`: nombre y función de cada pieza y el orden del despiece.
- `tools.ts`: nombre, piezas y rango del slider de cada herramienta.
- `charts.ts`: **pega aquí las URL de embed de Flourish** (`https://flo.uri.sh/visualisation/…/embed`). Mientras estén vacías, el panel muestra un aviso.
- `story.ts`: **pega aquí el resumen del Caso 08 y la cita final exacta del cuento**. Mientras sean `null`, la interfaz muestra un recuadro de "pendiente". No hay texto del cuento inventado.
- `verdict.ts`: opciones del veredicto y votos de partida del resultado simulado. La interfaz aclara que es simulado.

La paleta y las fuentes son provisionales. Para usar las de la infografía, cambia `colors` y `fontFamily` en `tailwind.config.ts` y el enlace de Google Fonts en `index.html`.

## Reemplazar el modelo 3D

1. Exporta desde Blender a `public/models/linterna.glb` (glTF binario, con compresión Draco y texturas de 2k como máximo).
2. Nombra cada objeto exactamente así:

   `carcasa`, `cabeza`, `reflector`, `lente`, `bombilla`, `portabombilla`, `pelo`, `resorte`, `boton`, `contacto`, `base_interruptor`, `pilas`, `tapa`, `correa`, `etiqueta_2019`, `muescas`, `huellas`

   `huellas` es la calcomanía de huellas y tierra sobre la carcasa (pista 5). Una pieza puede ser una malla o un grupo; una pieza anidada (por ejemplo `pelo` dentro de `portabombilla`) se reconoce igual.

3. Modela cada pieza en su posición armada, con el eje largo de la linterna en X, la cabeza hacia +X y "arriba" en +Z de Blender (+Y en glTF). El modelo se escala y se centra solo.
4. Recarga la página. Si falta una pieza, la app no se rompe: avisa por consola y su pista sigue disponible desde la lista de piezas.

Mientras no exista el archivo, se usa una linterna provisional hecha con formas básicas y con los mismos nombres.

## Accesibilidad y rendimiento

- Cada interacción 3D tiene su alternativa por teclado: lista de piezas con botones y sliders reales (`<input type="range">`). La lupa salta a la pieza elegida y el tablero se conecta pulsando el alfiler.
- Foco visible, un solo `h1` por pantalla, avisos con `role="status"`, modal sobre `<dialog>`.
- Con `prefers-reduced-motion` las animaciones duran 0 y los cambios son directos.
- Sin WebGL se muestra un dibujo estático de la linterna con la lista de pistas, y el caso se puede resolver igual.
- Three.js, el modelo y la escena se cargan de forma diferida al entrar a la mesa. Los iframes de Flourish se crean al abrir su panel. El pixel ratio se limita a 2 y la escena solo se dibuja cuando algo cambia.

Al publicar, cambia `og:image` en `index.html` por la URL absoluta del sitio: algunas redes no aceptan rutas relativas.
