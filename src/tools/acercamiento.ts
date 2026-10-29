import gsap from 'gsap';
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
import { duration, EASE_OUT } from '../lib/motion';
import { disposeObject } from '../scenes/ScenePanel';
import type { ExamTool, ToolContext } from './types';

const LENS_RESOLUTION = 512;
const ZOOM = 3.2;

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
 * apunta al centro de la lupa, y el resultado se pinta en un disco encima.
 * La acción hace aparecer la lupa y la lleva sola hasta las huellas.
 */
export function createAcercamiento(context: ToolContext): ExamTool {
  const { panel, model } = context;
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const center = new Vector2();
  const start = new Vector2();
  const prints = new Vector3();
  /** Avance de la lupa desde el costado hasta las huellas (0 a 1). */
  const glide = { progress: 0 };
  let lens: Lens | null = null;

  const radius = (): number => {
    const { width, height } = panel.size;
    return MathUtils.clamp(Math.min(width, height) * 0.22, 64, 150);
  };

  const render = (): void => {
    if (!lens) return;
    const { renderer, camera, scene } = panel;
    const { width, height } = panel.size;
    const r = radius();

    // El destino se recalcula en cada cuadro: la lupa sigue a las huellas aunque la cámara se mueva.
    const { x, y } = panel.toScreen(model.center('huellas', prints));
    center.set(start.x + (x - start.x) * glide.progress, start.y + (y - start.y) * glide.progress);
    ndc.set((center.x / width) * 2 - 1, -(center.y / height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    lens.camera.position.copy(camera.position);
    lens.camera.up.copy(camera.up);
    lens.camera.lookAt(camera.position.clone().add(raycaster.ray.direction));
    const halfHeight = Math.tan(MathUtils.degToRad(camera.fov) / 2) * ((2 * r) / ZOOM / height);
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
    const cleanups = [panel.addPostRender(render)];
    return {
      target,
      camera: new PerspectiveCamera(10, 1, 0.05, 60),
      overlay,
      overlayCamera,
      disc,
      cleanups,
    };
  };

  return {
    id: 'acercamiento',
    activate() {
      const target = model.center('huellas');
      panel.frame({ target: [target.x, target.y, target.z], direction: [0, 0.3, 1], size: 2.2 });
    },
    deactivate() {
      gsap.killTweensOf(glide);
      glide.progress = 0;
      if (!lens) return;
      lens.cleanups.forEach((cleanup) => cleanup());
      disposeObject(lens.overlay);
      lens.target.dispose();
      lens = null;
    },
    update: () => false,
    setValue(value, seconds) {
      if (value <= 0 || lens) return;
      lens = createLens();
      const { width, height } = panel.size;
      // La lupa entra desde un costado y se detiene sobre las huellas.
      start.set(width * 0.2, height * 0.5);
      gsap.to(glide, {
        progress: 1,
        duration: duration(seconds),
        ease: EASE_OUT,
        onUpdate: panel.invalidate,
      });
      panel.invalidate();
    },
    accepts: () => true,
  };
}
