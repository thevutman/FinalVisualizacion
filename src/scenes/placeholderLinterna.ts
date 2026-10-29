import {
  BoxGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Curve,
  CylinderGeometry,
  DoubleSide,
  type BufferGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  type Object3D,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three';
import type { PieceName } from '../data/pieces';

/**
 * Linterna provisional hecha con formas básicas. Usa los mismos nombres de pieza
 * que el .glb, así que reemplazar el modelo no exige tocar el código.
 * Eje largo = X (cabeza hacia +X), arriba = Y. Todas las piezas están en su posición armada.
 */
export function buildPlaceholderLinterna(): Group {
  const root = new Group();
  root.name = 'linterna_provisional';

  root.add(
    piece('carcasa', hollowTube(0.26, 0.3, -1.1, 0.62), {
      color: '#3D4A44',
      metalness: 0.35,
      roughness: 0.5,
    }),
    piece('cabeza', lathe(HEAD_PROFILE), { color: '#34403A', metalness: 0.4, roughness: 0.45 }),
    piece('reflector', lathe(reflectorProfile()), {
      color: '#E4E4E4',
      metalness: 1,
      roughness: 0.12,
      side: DoubleSide,
    }),
    piece(
      'lente',
      alongX(new CylinderGeometry(0.405, 0.405, 0.02, 48)),
      {
        color: '#DCEBF2',
        roughness: 0.05,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      },
      1.055,
    ),
    bombilla(),
    piece(
      'portabombilla',
      alongX(new CylinderGeometry(0.085, 0.085, 0.12, 32)),
      {
        color: '#B8893A',
        metalness: 0.8,
        roughness: 0.35,
      },
      0.68,
    ),
    piece('pelo', new TubeGeometry(hairCurve(), 48, 0.006, 6), {
      color: '#C4561F',
      roughness: 0.8,
    }),
    piece(
      'base_interruptor',
      new BoxGeometry(0.24, 0.04, 0.16),
      { color: '#2B2F33', roughness: 0.6 },
      0.3,
      0.31,
    ),
    piece(
      'contacto',
      new BoxGeometry(0.18, 0.012, 0.1),
      { color: '#C27A4A', metalness: 0.9, roughness: 0.3 },
      0.3,
      0.336,
    ),
    piece(
      'resorte',
      new TubeGeometry(new BentSpring(), 160, 0.006, 6),
      {
        color: '#B9B9B9',
        metalness: 0.9,
        roughness: 0.3,
      },
      0.3,
      0.342,
    ),
    piece(
      'boton',
      new CylinderGeometry(0.065, 0.07, 0.06, 32),
      { color: '#1E2229', roughness: 0.65 },
      0.3,
      0.43,
    ),
    pilas(),
    piece(
      'tapa',
      alongX(new CylinderGeometry(0.315, 0.315, 0.15, 48)),
      {
        color: '#2E3833',
        metalness: 0.35,
        roughness: 0.55,
      },
      -1.175,
    ),
    correa(),
    etiqueta(),
    muescas(),
    huellas(),
  );
  return root;
}

const HEAD_PROFILE: readonly [number, number][] = [
  [0.27, 0.6],
  [0.305, 0.6],
  [0.43, 0.98],
  [0.43, 1.06],
  [0.395, 1.06],
  [0.39, 0.98],
  [0.27, 0.66],
  [0.27, 0.6],
];

function reflectorProfile(): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= 14; i += 1) {
    const t = i / 14;
    points.push([0.07 + 0.32 * t, 0.72 + 0.31 * t * t]);
  }
  return points;
}

function piece(
  name: PieceName,
  geometry: BufferGeometry,
  material: MeshStandardMaterialParameters,
  x = 0,
  y = 0,
): Mesh {
  const mesh = new Mesh(geometry, new MeshStandardMaterial(material));
  mesh.name = name;
  mesh.position.set(x, y, 0);
  return mesh;
}

function named<T extends Object3D>(name: PieceName, object: T): T {
  object.name = name;
  return object;
}

/** Las geometrías de revolución de three giran sobre Y; la linterna está acostada sobre X. */
function alongX(geometry: BufferGeometry): BufferGeometry {
  return geometry.rotateZ(-Math.PI / 2);
}

function lathe(profile: readonly (readonly [number, number])[]): BufferGeometry {
  return alongX(
    new LatheGeometry(
      profile.map(([r, x]) => new Vector2(r, x)),
      64,
    ),
  );
}

function hollowTube(inner: number, outer: number, from: number, to: number): BufferGeometry {
  return lathe([
    [inner, from],
    [outer, from],
    [outer, from],
    [outer, to],
    [outer, to],
    [inner, to],
    [inner, to],
    [inner, from],
  ]);
}

function bombilla(): Group {
  const glass = new MeshStandardMaterial({
    color: '#FFF3D0',
    emissive: '#F7DFB4',
    emissiveIntensity: 0.25,
    roughness: 0.1,
  });
  const bulb = new Mesh(new SphereGeometry(0.06, 32, 16), glass);
  bulb.position.x = 0.8;
  const neck = new Mesh(alongX(new CylinderGeometry(0.03, 0.03, 0.05, 20)), glass.clone());
  neck.position.x = 0.75;
  return named('bombilla', new Group().add(bulb, neck));
}

function hairCurve(): CatmullRomCurve3 {
  return new CatmullRomCurve3([
    new Vector3(0.735, 0.05, 0),
    new Vector3(0.75, 0.09, 0.04),
    new Vector3(0.775, 0.12, 0.02),
    new Vector3(0.8, 0.15, 0.06),
    new Vector3(0.83, 0.16, 0.03),
  ]);
}

/** Hélice que se tuerce hacia un lado: el resorte doblado de la pista 2. */
class BentSpring extends Curve<Vector3> {
  // Curve declara su constructor como protegido; este lo hace público.
  constructor() {
    super();
  }

  override getPoint(t: number, target = new Vector3()): Vector3 {
    const angle = t * Math.PI * 2 * 6;
    const bend = 0.045 * t * t;
    return target.set(Math.cos(angle) * 0.032 + bend, t * 0.06, Math.sin(angle) * 0.032);
  }
}

function pilas(): Group {
  const group = named('pilas', new Group());
  const wrapper = new MeshStandardMaterial({ color: '#2F5D8A', roughness: 0.4, metalness: 0.2 });
  const cap = new MeshStandardMaterial({ color: '#C9C9C9', metalness: 0.9, roughness: 0.25 });
  for (const x of [-0.83, -0.33]) {
    const body = new Mesh(alongX(new CylinderGeometry(0.18, 0.18, 0.46, 40)), wrapper.clone());
    body.position.x = x;
    const nub = new Mesh(alongX(new CylinderGeometry(0.05, 0.05, 0.03, 20)), cap.clone());
    nub.position.x = x + 0.245;
    group.add(body, nub);
  }
  wrapper.dispose();
  cap.dispose();
  return group;
}

function correa(): Mesh {
  const mesh = piece(
    'correa',
    new TorusGeometry(0.11, 0.022, 12, 40),
    {
      color: '#6B4A2E',
      roughness: 0.9,
    },
    -1.36,
  );
  mesh.rotation.x = 0.6;
  return mesh;
}

function etiqueta(): Mesh {
  const texture = canvasTexture(256, 160, (context) => {
    context.fillStyle = '#EFE6D2';
    context.fillRect(0, 0, 256, 160);
    context.strokeStyle = 'rgba(30, 34, 41, 0.25)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(128, 0);
    context.lineTo(128, 160);
    context.stroke();
    context.fillStyle = '#1E2229';
    context.font = '600 22px "IBM Plex Mono", monospace';
    context.fillText('LOTE', 22, 44);
    context.font = '800 64px Archivo, sans-serif';
    context.fillText('2019', 22, 118);
  });
  const mesh = piece(
    'etiqueta_2019',
    new BoxGeometry(0.2, 0.125, 0.004),
    { map: texture, roughness: 0.9 },
    0.24,
    -0.02,
  );
  // Pegada a la pared, delante de las pilas: se ve apenas la carcasa se vuelve transparente.
  mesh.position.z = 0.2;
  mesh.rotation.set(0.08, -0.12, 0.05);
  return mesh;
}

/** 8 rayas en la pared interior del porta pilas, del lado de atrás y arriba. */
function muescas(): Group {
  const group = named('muescas', new Group());
  const material = new MeshStandardMaterial({ color: '#2A1D1A', roughness: 0.9 });
  for (let i = 0; i < 8; i += 1) {
    const angle = 0.55 + Math.sin(i * 1.7) * 0.04;
    const radius = 0.256;
    const mark = new Mesh(new BoxGeometry(0.02, 0.08 + (i % 3) * 0.01, 0.01), material.clone());
    mark.position.set(-1.0 + i * 0.1, radius * Math.cos(angle), -radius * Math.sin(angle));
    mark.rotation.x = Math.PI / 2 - angle;
    mark.rotation.y = Math.sin(i * 2.3) * 0.12;
    group.add(mark);
  }
  material.dispose();
  return group;
}

/** Parche curvo sobre la carcasa con huellas de mano y de pata y tierra. */
function huellas(): Mesh {
  const texture = canvasTexture(512, 512, (context) => {
    context.fillStyle = 'rgba(92, 64, 38, 0.6)';
    const paw = (x: number, y: number, s: number): void => {
      context.beginPath();
      context.ellipse(x, y, 16 * s, 13 * s, 0, 0, Math.PI * 2);
      for (const [dx, dy] of [
        [-18, -20],
        [-6, -27],
        [6, -27],
        [18, -20],
      ] as const) {
        context.moveTo(x + dx * s + 5 * s, y + dy * s);
        context.ellipse(x + dx * s, y + dy * s, 5 * s, 7 * s, 0, 0, Math.PI * 2);
      }
      context.fill();
    };
    const hand = (x: number, y: number, s: number): void => {
      context.beginPath();
      context.ellipse(x, y, 26 * s, 30 * s, 0, 0, Math.PI * 2);
      for (const [dx, length] of [
        [-22, 34],
        [-8, 42],
        [6, 44],
        [20, 38],
      ] as const) {
        context.moveTo(x + dx * s + 5 * s, y - 28 * s);
        context.ellipse(
          x + dx * s,
          y - 28 * s - (length / 2) * s,
          5 * s,
          (length / 2) * s,
          0,
          0,
          Math.PI * 2,
        );
      }
      context.fill();
    };
    hand(170, 300, 1.4);
    paw(250, 220, 1.3);
    paw(330, 330, 1.2);
    paw(360, 150, 1.1);
    context.fillStyle = 'rgba(110, 78, 46, 0.55)';
    for (let i = 0; i < 160; i += 1) {
      const x = 256 + Math.sin(i * 12.9898) * 200;
      const y = 256 + Math.cos(i * 78.233) * 200;
      context.beginPath();
      context.arc(x, y, 1.5 + (i % 4), 0, Math.PI * 2);
      context.fill();
    }
  });
  const geometry = alongX(new CylinderGeometry(0.303, 0.303, 0.5, 48, 1, true, -0.9, 1.3));
  const mesh = piece(
    'huellas',
    geometry,
    {
      map: texture,
      transparent: true,
      depthWrite: false,
      roughness: 1,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    },
    -0.45,
  );
  return mesh;
}

function canvasTexture(
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D) => void,
): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) draw(context);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
