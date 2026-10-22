import gsap from 'gsap';
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  DirectionalLight,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Texture,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { duration, EASE_OUT } from '../lib/motion';

export type Vec3 = readonly [number, number, number];

/** Encuadre de cámara: qué mirar, desde qué dirección y qué ancho debe caber en pantalla. */
export interface CameraView {
  target: Vec3;
  direction: Vec3;
  size: number;
}

/** Se ejecuta en cada cuadro; devuelve true si necesita otro cuadro (animación en curso). */
export type FrameHook = (delta: number) => boolean;

const MAX_PIXEL_RATIO = 2;
const FOV = 35;

/**
 * Panel 3D: renderer, cámara, luces, controles orbitales y un loop que solo
 * dibuja cuando algo cambia (invalidate). Todo lo que se agrega a la escena
 * se libera en dispose().
 */
export class ScenePanel {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(FOV, 1, 0.05, 60);
  readonly renderer: WebGLRenderer;
  readonly controls: OrbitControls;
  readonly canvas: HTMLCanvasElement;

  private readonly frameHooks = new Set<FrameHook>();
  private readonly postRenders = new Set<() => void>();
  private readonly resizeObserver: ResizeObserver;
  private readonly environment: Texture;
  private readonly shadow: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private frameRequest = 0;
  private lastFrame = 0;
  private currentView: CameraView | null = null;

  constructor(private readonly container: HTMLElement) {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.localClippingEnabled = true;
    this.canvas = this.renderer.domElement;
    this.canvas.classList.add('block', 'size-full', 'touch-none');
    container.append(this.canvas);

    const pmrem = new PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    this.scene.environment = this.environment;
    this.scene.environmentIntensity = 0.55;

    this.addLights();
    this.shadow = this.createContactShadow();
    this.scene.add(this.shadow);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.dampingFactor = 0.08;
    this.controls.addEventListener('change', this.invalidate);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  /** Pide un cuadro nuevo. Varias llamadas en el mismo frame generan un solo render. */
  readonly invalidate = (): void => {
    if (this.frameRequest) return;
    this.frameRequest = requestAnimationFrame(this.renderFrame);
  };

  addFrameHook(hook: FrameHook): () => void {
    this.frameHooks.add(hook);
    this.invalidate();
    return () => this.frameHooks.delete(hook);
  }

  /** Dibujo o trabajo extra después de la escena principal (rótulos, lupa). */
  addPostRender(callback: () => void): () => void {
    this.postRenders.add(callback);
    this.invalidate();
    return () => {
      this.postRenders.delete(callback);
      this.invalidate();
    };
  }

  /** Lleva la cámara a un encuadre. El ancho `size` siempre cabe, también en vertical. */
  frame(view: CameraView, animate = true): void {
    this.currentView = view;
    const target = new Vector3(...view.target);
    const position = new Vector3(...view.direction)
      .normalize()
      .multiplyScalar(this.fitDistance(view.size))
      .add(target);

    this.controls.minDistance = this.fitDistance(view.size) * 0.35;
    this.controls.maxDistance = this.fitDistance(view.size) * 2.2;

    const time = animate ? duration(0.7) : 0;
    gsap.to(this.camera.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: time,
      ease: EASE_OUT,
      overwrite: 'auto',
      onUpdate: this.invalidate,
    });
    gsap.to(this.controls.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: time,
      ease: EASE_OUT,
      overwrite: 'auto',
      onUpdate: this.invalidate,
    });
  }

  resetView(): void {
    if (this.currentView) this.frame(this.currentView);
  }

  /** Coloca la sombra de contacto justo debajo del objeto. */
  placeShadow(floorY: number, width: number): void {
    this.shadow.position.y = floorY;
    this.shadow.scale.set(width * 1.25, width * 0.5, 1);
    this.invalidate();
  }

  /** Convierte un evento de puntero en coordenadas normalizadas (-1 a 1). */
  toNdc(event: PointerEvent | MouseEvent, out = new Vector2()): Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    return out.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
  }

  /** Proyecta un punto del mundo a píxeles dentro del panel. */
  toScreen(world: Vector3): { x: number; y: number; visible: boolean } {
    const projected = world.clone().project(this.camera);
    const { clientWidth, clientHeight } = this.container;
    return {
      x: ((projected.x + 1) / 2) * clientWidth,
      y: ((1 - projected.y) / 2) * clientHeight,
      visible: projected.z < 1,
    };
  }

  get size(): { width: number; height: number } {
    return { width: this.container.clientWidth, height: this.container.clientHeight };
  }

  add(...objects: Object3D[]): void {
    this.scene.add(...objects);
    this.invalidate();
  }

  dispose(): void {
    cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
    this.resizeObserver.disconnect();
    this.controls.removeEventListener('change', this.invalidate);
    this.controls.dispose();
    gsap.killTweensOf([this.camera.position, this.controls.target]);
    disposeObject(this.scene);
    this.environment.dispose();
    this.frameHooks.clear();
    this.postRenders.clear();
    this.renderer.dispose();
    this.canvas.remove();
  }

  private readonly renderFrame = (now: number): void => {
    this.frameRequest = 0;
    const delta = this.lastFrame ? Math.min((now - this.lastFrame) / 1000, 0.1) : 0;
    this.lastFrame = now;

    let keepGoing = this.controls.update();
    for (const hook of this.frameHooks) keepGoing = hook(delta) || keepGoing;

    this.renderer.render(this.scene, this.camera);
    this.postRenders.forEach((callback) => callback());

    if (keepGoing) this.invalidate();
    else this.lastFrame = 0;
  };

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.container;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.invalidate();
  }

  private fitDistance(size: number): number {
    const vertical = MathUtils.degToRad(this.camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * this.camera.aspect);
    const byWidth = size / 2 / Math.tan(horizontal / 2);
    const byHeight = (size * 0.45) / 2 / Math.tan(vertical / 2);
    return Math.max(byWidth, byHeight) * 1.08;
  }

  private addLights(): void {
    const hemisphere = new HemisphereLight(0xfff4e2, 0x6f6758, 1.4);
    const key = new DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    const rim = new DirectionalLight(0xf7dfb4, 1.1);
    rim.position.set(-4, 2, -3);
    this.scene.add(hemisphere, key, rim);
  }

  private createContactShadow(): Mesh<PlaneGeometry, MeshBasicMaterial> {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(30, 34, 41, 0.35)');
      gradient.addColorStop(1, 'rgba(30, 34, 41, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
    }
    const material = new MeshBasicMaterial({
      map: new CanvasTexture(canvas),
      transparent: true,
      depthWrite: false,
    });
    const mesh = new Mesh(new PlaneGeometry(1, 1), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = -1;
    return mesh;
  }
}

/** Libera geometrías, materiales y texturas de un árbol de objetos. */
export function disposeObject(root: Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const mesh = object as Mesh;
    mesh.geometry.dispose();
    const materials: unknown[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!(material && typeof material === 'object' && 'dispose' in material)) continue;
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && 'isTexture' in value)
          (value as Texture).dispose();
      }
      (material as { dispose: () => void }).dispose();
    }
  });
}
