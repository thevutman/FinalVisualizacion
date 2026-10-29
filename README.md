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

| Fase           | Pantalla                                         | Archivo                                                       |
| -------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| 1 · Apertura   | 01 Apertura del caso                             | `src/screens/apertura.ts`                                     |
| 2 · Examen     | 02 La prueba: una linterna (mesa de examen)      | `src/screens/mesa.ts`                                         |
|                | 03 Separar las piezas (despiece): pelo de zorro  | `src/screens/despiece.ts` + `src/tools/despiece.ts`           |
|                | 04 Abrir el botón (explosión): resorte doblado   | `src/screens/explosion.ts` + `src/tools/explosion.ts`         |
|                | 05 Mirar por dentro (corte): 8 rayas + gráfico   | `src/screens/corte.ts` + `src/tools/corte.ts`                 |
|                | 06 Ver a través (transparencia): fecha 2019      | `src/screens/transparencia.ts` + `src/tools/transparencia.ts` |
|                | 07 Mirar con lupa (acercamiento): huellas + mapa | `src/screens/acercamiento.ts` + `src/tools/acercamiento.ts`   |
| 3 · Resolución | 08 Unir las pistas (tablero)                     | `src/screens/tablero.ts`                                      |
|                | 09 Veredicto: Caso 08                            | `src/screens/veredicto.ts`                                    |

En pantalla no se usan términos técnicos: cada herramienta se nombra con lo que hace ("Separar las piezas", "Mirar por dentro"…), definido en `src/data/tools.ts`. Entre paréntesis queda el nombre interno del código.

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
- `casos.ts`: los datos de los gráficos, tomados de la infografía del proyecto ("Sala del detective"): los 8 casos con año, zona, posición en el mapa y semanas, y la encuesta de 100 estudiantes.
- `charts.ts`: título, nombre corto y frase de cada gráfico.
- `story.ts`: **pega aquí la cita final exacta del cuento** (aparece en el veredicto). Mientras sea `null`, no se muestra. No hay texto del cuento inventado.
- `verdict.ts`: opciones del veredicto y a qué respuesta de la encuesta equivale cada una.

La paleta y las fuentes son provisionales. Para usar las de la infografía, cambia `colors` y `fontFamily` en `tailwind.config.ts` y el enlace de Google Fonts en `index.html`.

## Los gráficos

Son 5 de los 8 gráficos de la infografía del proyecto, rehechos en SVG dentro de la app (`src/components/charts/`) para que quepan en pantalla, tengan letra grande y se animen al aparecer. Cada uno tiene su texto para lector de pantalla.

| Dónde aparece                                    | Gráfico                                                                      | Archivo                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------ |
| Paso 5 · Mirar por dentro (8 rayas)              | Casos por año: un cuadro por caso, del color de su zona                      | `YearlyChart.ts`                           |
| Paso 7 · Mirar con lupa (tierra del parqueadero) | Los 8 casos en el mapa del campus                                            | `CaseMap.ts` (usa `public/img/campus.png`) |
| Paso 8 · Unir las pistas                         | ¿Dónde ataca el zorro? y ¿Cuánto duró cada caso?                             | `ZonesChart.ts`, `DurationChart.ts`        |
| Paso 9 · Veredicto                               | ¿El zorro es real? (100 estudiantes), con la respuesta del usuario resaltada | `BeliefChart.ts`                           |

## El modelo 3D

`public/models/linterna.glb` (2,4 MB) se arma a partir de las 12 piezas de `modelos/piezas/` con un script. Cada pieza original pesaba entre 22 y 107 MB; las de `modelos/piezas/` ya están optimizadas (polígonos simplificados y texturas WebP de 512 o 1024 px).

### Ajustar el montaje

`modelos/montaje.json` define, para cada pieza, su archivo, sus giros (`[eje, grados]`, en orden), su escala y la posición de su centro. El eje largo de la linterna es X (la cabeza hacia +X) y "arriba" es Y. Después de editarlo:

```bash
npm run modelo
```

El script une las piezas, le pone a cada una su nombre exacto y comprime el resultado con Draco. Las dos pilas salen de la misma pieza (`pila.glb`) dentro del grupo `pilas`.

### Agregar o cambiar una pieza

1. Optimiza el archivo original (ajusta `--simplify-ratio` para quedar entre 5 y 40 mil triángulos):

   ```bash
   npx gltf-transform optimize original.glb modelos/piezas/pieza.glb --compress false --texture-compress webp --texture-size 1024 --simplify-ratio 0.02 --simplify-error 0.01
   ```

2. Agrégala a `modelos/montaje.json` con uno de estos nombres y ejecuta `npm run modelo`:

   `carcasa`, `cabeza`, `reflector`, `lente`, `bombilla`, `portabombilla`, `pelo`, `resorte`, `boton`, `contacto`, `base_interruptor`, `pilas`, `tapa`, `correa`, `etiqueta_2019`, `muescas`, `huellas`

### Piezas que el modelo no trae

`pelo`, `muescas`, `etiqueta_2019` y `huellas` (las piezas de las pistas 1, 3, 4 y 5) todavía no están modeladas. La app las toma de la linterna provisional y las encaja sola dentro de la pieza que las contiene (`portabombilla` o `carcasa`), ajustadas a su tamaño. Si algún día se modelan, basta con agregarlas al montaje: la versión provisional deja de usarse.

Si `linterna.glb` no existe, se usa entera la linterna provisional hecha con formas básicas. Si falta cualquier otra pieza, la app no se rompe: avisa por consola.

## Accesibilidad y rendimiento

- Nada depende de arrastrar ni del mouse: cada acción es un botón real, y el círculo "Toca aquí" también es un botón, accesible con teclado y lector de pantalla.
- Íconos siempre acompañados de texto, contraste alto, foco visible, un solo `h1` por paso y avisos con `role="status"`.
- En celular la linterna queda arriba y el panel se desplaza por dentro (con letra grande no cabe todo en 100vh); la página en sí no hace scroll.
- Con `prefers-reduced-motion` las animaciones duran 0 y los cambios son directos.
- Sin WebGL se muestra un dibujo estático de la linterna y el caso se resuelve igual con "Mostrarme la pista".
- Three.js, el modelo y la escena se cargan de forma diferida al entrar a la mesa. Cada gráfico se dibuja la primera vez que se muestra. El pixel ratio se limita a 2 y la escena solo se dibuja cuando algo cambia.

Al publicar, cambia `og:image` en `index.html` por la URL absoluta del sitio: algunas redes no aceptan rutas relativas.
