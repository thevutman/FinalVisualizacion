import { createPieceList } from '../components/PieceList';
import { createSliderControl } from '../components/SliderControl';
import type { PieceName } from '../data/pieces';
import { SCREENS } from '../data/screens';
import { TOOLS, type ToolId } from '../data/tools';
import { h } from '../lib/dom';
import type { ExamPanel, ExamPanelContext, ExamView } from './types';

export interface ToolViewOptions {
  /** Numeración de piezas que coincide con los rótulos 3D. */
  numbers?: Partial<Record<PieceName, number>>;
}

/** Panel lateral común a las herramientas: slider (si lo hay) y lista de piezas. */
export function toolView(tool: ToolId, options: ToolViewOptions = {}): ExamView {
  return {
    screen: tool,
    tool,
    createPanel(context: ExamPanelContext): ExamPanel {
      const info = TOOLS[tool];
      const nota = SCREENS[tool].nota;
      const slider = info.control
        ? createSliderControl({
            id: `control-${tool}`,
            control: info.control,
            onInput: context.setValue,
          })
        : null;
      const pieces = createPieceList({
        pieces: info.piezas,
        numbers: options.numbers ?? {},
        onSelect: context.inspect,
      });
      pieces.setGlowing(context.pendingPieces());
      if (info.control) context.setValue(info.control.initial);

      const element = h('div', { class: 'grid gap-3' }, [
        slider?.element,
        pieces.element,
        nota && h('p', { class: 'text-sm text-tinta-suave' }, [nota]),
      ]);

      return {
        element,
        onInspect: ({ piece }) => pieces.setSelected(piece),
        onValueChange: (value) => slider?.setValue(value),
        onStateChange: () => pieces.setGlowing(context.pendingPieces()),
      };
    },
  };
}
