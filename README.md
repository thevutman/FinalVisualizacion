# Caso 08 · El zorro de la UPB

Experiencia web interactiva en 3D para _Visualización y Diseño de Información_ (UPB). El usuario es el investigador del Caso 08: examina la linterna (evidencia A) con cinco herramientas de infografía técnica, reúne cinco pistas, las une en un tablero y entrega su veredicto.

Está pensada para que cualquier persona la recorra sin ayuda, incluidas personas mayores: un recorrido guiado de 9 pasos, una sola acción por paso, letra grande (mínimo 18 px), botones de 56 px y todo en una pantalla (100vh, sin scroll en portátil y escritorio).

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

Cada paso de herramienta (03 a 07) sigue la misma secuencia, definida en `src/screens/toolStep.ts`:

1. Un botón ejecuta la herramienta (separar, abrir, cortar, volver transparente, usar la lupa).
2. Aparece un círculo que late con "Toca aquí" sobre la pieza que guarda la pista. Si en 8 segundos no se toca, se resalta el botón "Mostrarme la pista": nadie se queda trabado.
3. La pista se guarda en la libreta y se activa "Siguiente". Las pistas 3 y 5 muestran su gráfico en grande.

`src/screens/router.ts` cambia de paso; las reglas están en `canEnter` (`src/state/store.ts`): se puede volver a cualquier paso visitado y avanzar cuando el actual está completo. Los pasos 02 a 07 comparten `examStage.ts`, así que la escena 3D no se vuelve a crear al cambiar de herramienta. Se libera (geometrías, materiales, texturas y renderer) al salir de la fase de examen.

## Estructura

```
src/
├── main.ts, app.ts        arranque y estructura fija en 100dvh (pasos, paso actual, libreta)
├── scenes/                ScenePanel (renderer, cámara, luces, loop bajo demanda),
│                          LinternaModel (carga el .glb y expone piezas por nombre),
│                          placeholderLinterna, EvidenceStage, Picker, Highlighter,
│                          LabelLayer (rótulos numerados), Hotspot (círculo "Toca aquí")
├── tools/                 una herramienta por archivo, todas con activate/deactivate/update
├── screens/               un archivo por paso + toolStep, examStage y router
├── components/            StepFrame (estructura de cada paso), Stepper, Libreta, ClueCard,
│                          ChartFrame, ViewSwitch, Board, VerdictResults, Button, Announcer
├── state/store.ts         estado global tipado con persistencia en localStorage
├── data/                  contenido editable: pistas, textos, piezas, gráficos, cuento
├── lib/                   utilidades pequeñas (DOM, iconos, movimiento reducido, WebGL)
└── styles/main.css        base de Tailwind y clases de componentes
```

## Editar el contenido (sin tocar la lógica)

Todo el texto vive en `src/data/`:

- `screens.ts`: título, texto e instrucción de cada paso y los textos de la interfaz.
- `clues.ts`: las 5 pistas (texto, herramienta y pieza que las revela).
- `pieces.ts`: nombre y función de cada pieza y el orden del despiece.
- `tools.ts`: nombre, explicación sencilla y texto del botón de cada herramienta.
- `charts.ts`: **pega aquí las URL de embed de Flourish** (`https://flo.uri.sh/visualisation/…/embed`). Cada gráfico tiene título, nombre corto y la frase que lo une a su pista. Mientras la URL esté vacía, su lugar muestra un recuadro que dice qué gráfico va ahí.
- `story.ts`: **pega aquí la cita final exacta del cuento** (aparece en el veredicto). Mientras sea `null`, no se muestra. No hay texto del cuento inventado.
- `verdict.ts`: opciones del veredicto y votos de partida del resultado simulado. La interfaz aclara que es simulado.

La paleta y las fuentes son provisionales. Para usar las de la infografía, cambia `colors` y `fontFamily` en `tailwind.config.ts` y el enlace de Google Fonts en `index.html`.

## Reemplazar el modelo 3D

1. Exporta desde Blender a `public/models/linterna.glb` (glTF binario, con compresión Draco y texturas de 2k como máximo).
2. Nombra cada objeto exactamente así:

   `carcasa`, `cabeza`, `reflector`, `lente`, `bombilla`, `portabombilla`, `pelo`, `resorte`, `boton`, `contacto`, `base_interruptor`, `pilas`, `tapa`, `correa`, `etiqueta_2019`, `muescas`, `huellas`

   `huellas` es la calcomanía de huellas y tierra sobre la carcasa (pista 5). Una pieza puede ser una malla o un grupo; una pieza anidada (por ejemplo `pelo` dentro de `portabombilla`) se reconoce igual.

3. Modela cada pieza en su posición armada, con el eje largo de la linterna en X, la cabeza hacia +X y "arriba" en +Z de Blender (+Y en glTF). El modelo se escala y se centra solo.
4. Recarga la página. Si falta una pieza, la app no se rompe: avisa por consola y su pista sigue disponible con "Mostrarme la pista".

Mientras no exista el archivo, se usa una linterna provisional hecha con formas básicas y con los mismos nombres.

## Accesibilidad y rendimiento

- Nada depende de arrastrar ni del mouse: cada acción es un botón real, y el círculo "Toca aquí" también es un botón, accesible con teclado y lector de pantalla.
- Íconos siempre acompañados de texto, contraste alto, foco visible, un solo `h1` por paso y avisos con `role="status"`.
- En celular la linterna queda arriba y el panel se desplaza por dentro (con letra grande no cabe todo en 100vh); la página en sí no hace scroll.
- Con `prefers-reduced-motion` las animaciones duran 0 y los cambios son directos.
- Sin WebGL se muestra un dibujo estático de la linterna y el caso se resuelve igual con "Mostrarme la pista".
- Three.js, el modelo y la escena se cargan de forma diferida al entrar a la mesa. Cada iframe de Flourish se crea la primera vez que se muestra su gráfico. El pixel ratio se limita a 2 y la escena solo se dibuja cuando algo cambia.

Al publicar, cambia `og:image` en `index.html` por la URL absoluta del sitio: algunas redes no aceptan rutas relativas.
