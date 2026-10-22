import {
  CircleGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three';
import { TOOLS } from '../data/tools';
import { listen } from '../lib/dom';
import { disposeObject } from '../scenes/ScenePanel';
import type { ExamTool, ToolContext } from './types';

const LENS_RESOLUTION = 512;
const control = TOOLS.acercamiento.control;
const MIN_ZOOM = control?.min ?? 1.5;
const MAX_ZOOM = control?.max ?? 8;

/** Recursos de la lupa: existen solo mientras la herramienta está activa. */
interface Lens {
  target: WebGLRenderTarget;
  camera: PerspectiveCamera;
  overlay: Scene;
  overlayCamera: OrthographicCamera;
  disc: Group;
  cleanups: (() => void)[];
}

/**
 * Lupa: la escena se dibuja una segunda vez con una cámara de campo estrecho que
 * apunta a lo que está bajo el puntero, y el resultado se pinta en un disco encima.
 */
export function createAcercamiento(context: ToolContext): ExamTool {
  const { panel, model } = context;
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const center = new Vector2();
  let zoom = control?.initial ?? 3;
  let lens: Lens | null = null;

  const radius = (): number => {
    const { width, height } = panel.size;
    return MathUtils.clamp(Math.min(width, height) * 0.22, 64, 150);
  };

  const moveTo = (x: number, y: number): void => {
    center.set(x, y);
    panel.invalidate();
  };

  const render = (): void => {
    if (!lens) return;
    const { renderer, camera, scene } = panel;
    const { width, height } = panel.size;
    const r = radius();

    ndc.set((center.x / width) * 2 - 1, -(center.y / height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    lens.camera.position.copy(camera.position);
    lens.camera.up.copy(camera.up);
    lens.camera.lookAt(camera.position.clone().add(raycaster.ray.direction));
    const halfHeight = Math.tan(MathUtils.degToRad(camera.fov) / 2) * ((2 * r) / zoom / height);
    lens.camera.fov = MathUtils.radToDeg(2 * Math.atan(halfHeight));
    lens.camera.updateProjectionMatrix();

    renderer.setRenderTarget(lens.target);
    renderer.clear();
    renderer.render(scene, lens.camera);
    renderer.setRenderTarget(null);

    Object.assign(lens.overlayCamera, { left: 0, right: width, top: height, bottom: 0 });
    lens.overlayCamera.updateProjectionMatrix();
    lens.disc.position.set(center.x, height - center.y, 0);
    lens.disc.scale.setScalar(r);
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.render(lens.overlay, lens.overlayCamera);
    renderer.autoClear = autoClear;
  };

  const createLens = (): Lens => {
    const target = new WebGLRenderTarget(LENS_RESOLUTION, LENS_RESOLUTION);
    target.texture.colorSpace = SRGBColorSpace;
    const overlayCamera = new OrthographicCamera(0, 1, 1, 0, -1, 1);
    const disc = new Group().add(
      new Mesh(
        new CircleGeometry(1, 64),
        new MeshBasicMaterial({ color: '#E9E2D3', toneMapped: false }),
      ),
      new Mesh(
        new CircleGeometry(1, 64),
        new MeshBasicMaterial({ map: target.texture, transparent: true }),
      ),
      new Mesh(
        new RingGeometry(0.97, 1.05, 64),
        new MeshBasicMaterial({ color: '#1E2229', toneMapped: false }),
      ),
    );
    const overlay = new Scene().add(disc);
    const canvas = panel.canvas;
    const cleanups = [
      panel.addPostRender(render),
      listen(canvas, 'pointermove', (event) => {
        const rect = canvas.getBoundingClientRect();
        moveTo(event.clientX - rect.left, event.clientY - rect.top);
      }),
      listen(
        canvas,
        'wheel',
        (event) => {
          event.preventDefault();
          zoom = MathUtils.clamp(zoom - event.deltaY * 0.004, MIN_ZOOM, MAX_ZOOM);
          context.onValueChange(zoom);
          panel.invalidate();
        },
        { passive: false },
      ),
    ];
    return {
      target,
      camera: new PerspectiveCamera(10, 1, 0.05, 60),
      overlay,
      overlayCamera,
      disc,
      cleanups,
    };
  };

  const focusPiece = (piece: Parameters<ExamTool['select']>[0]): void => {
    const { x, y } = panel.toScreen(model.center(piece, new Vector3()));
    moveTo(x, y);
  };

  return {
    id: 'acercamiento',
    activate() {
      const target = model.center('huellas');
      panel.frame({ target: [target.x, target.y, target.z], direction: [0, 0.3, 1], size: 2.2 });
      panel.controls.enableZoom = false;
      lens = createLens();
      const { width, height } = panel.size;
      moveTo(width / 2, height / 2);
    },
    deactivate() {
      panel.controls.enableZoom = true;
      if (!lens) return;
      lens.cleanups.forEach((cleanup) => cleanup());
      disposeObject(lens.overlay);
      lens.target.dispose();
      lens = null;
    },
    update: () => false,
    setValue(value) {
      zoom = value;
      panel.invalidate();
    },
    select: focusPiece,
    blockedHint: () => null,
    accepts: () => true,
  };
}
