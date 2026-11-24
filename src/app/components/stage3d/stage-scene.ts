import {
  BoxGeometry,
  BufferAttribute,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  LinearFilter,
  LinearMipmapLinearFilter,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  Object3D,
  PMREMGenerator,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  Shape,
  ShapeGeometry,
  Texture,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  StageContent,
  CardSprite,
  SCREEN_PX,
  createScreen,
  drawCards,
  drawGrain,
  drawNote,
  drawShadow,
  drawSketch,
  drawSpec,
  paintScreen,
} from './stage-textures';
import {
  BASE_T,
  HINGE_Z,
  LAPTOP_D,
  LAPTOP_W,
  LID_T,
  NOTE_RESTS,
  NOTE_SIZE,
  SCREEN_H,
  SCREEN_W,
  SCREEN_Y,
  SHEET_LONG,
  SHEET_SHORT,
  ScreenFrame,
  poseAt,
} from './stage-timeline';

/** One pixel of the screen's drawing, in the scene's units */
const PX = SCREEN_W / SCREEN_PX[0];

/** The pixel ratio is capped: past 2 the scene costs four times the fill for nothing the eye sees */
const MAX_DPR = 2;
const FOV = 26;
/** The camera's poses are composed for this aspect; a narrower stage steps the camera back */
const BASE_ASPECT = 1.16;
const ALUMINIUM = 0xd4d6d9;
const SHEET_SEGMENTS = 36;
/** The key light comes from the upper left: contact shadows fall this far down and to the right */
const SHADOW_SHIFT = 0.05;
const SHEET_SHADOW = 0.36;
const KEY_ROWS = 6;
const KEY_COLS = 14;

/** A rectangle with rounded corners, centred on the origin */
function roundedShape(w: number, h: number, r: number): Shape {
  const x = -w / 2;
  const y = -h / 2;
  const shape = new Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** A slab with rounded corners and softened edges, lying in XY with its thickness along +Z */
function slab(w: number, h: number, t: number, r: number, bevel: number): ExtrudeGeometry {
  return new ExtrudeGeometry(roundedShape(w - bevel * 2, h - bevel * 2, r), {
    depth: t - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 12,
  }).translate(0, 0, bevel);
}

/** A flat rounded panel in XY whose texture spans it once */
function panel(w: number, h: number, r: number): ShapeGeometry {
  const geometry = new ShapeGeometry(roundedShape(w, h, r), 10);
  const position = geometry.getAttribute('position');
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = position.getX(i) / w + 0.5;
    uv[i * 2 + 1] = position.getY(i) / h + 0.5;
  }
  geometry.setAttribute('uv', new BufferAttribute(uv, 2));
  return geometry;
}

/** A sheet of paper: a subdivided plane whose curl and bow are set every frame */
class Sheet {
  readonly mesh: Mesh<PlaneGeometry, MeshStandardMaterial>;
  private readonly rest: Float32Array;
  private shape = '';

  constructor(
    private readonly w: number,
    private readonly h: number,
    material: MeshStandardMaterial,
    /** Which corner lifts at rest, and how far (decimetres) */
    private readonly curlCorner: readonly [number, number],
    private readonly curlHeight: number,
  ) {
    const geometry = new PlaneGeometry(w, h, SHEET_SEGMENTS, Math.round((SHEET_SEGMENTS * h) / w));
    this.rest = Float32Array.from(geometry.getAttribute('position').array);
    this.mesh = new Mesh(geometry, material);
    this.bend(1, 0);
  }

  /** `curl` 0–1: how much of the resting curl shows; `bow` 0–1: how far the sheet bows in flight */
  bend(curl: number, bow: number): void {
    const key = `${curl.toFixed(3)}|${bow.toFixed(3)}`;
    if (key === this.shape) return;
    this.shape = key;
    const position = this.mesh.geometry.getAttribute('position');
    const [cu, cv] = this.curlCorner;
    for (let i = 0; i < position.count; i++) {
      const u = this.rest[i * 3] / (this.w / 2);
      const v = this.rest[i * 3 + 1] / (this.h / 2);
      // At rest one corner lifts off the desk and the sheet waves very slightly
      const corner = Math.max(0, (u * cu + v * cv) / 2 - 0.35);
      const resting = this.curlHeight * (corner * corner * 5 + 0.06 * (1 + Math.sin(u * 2.2 + 1) * Math.cos(v * 1.7)));
      // In flight it bows across its width like a carried page, with a little twist
      const flying = 0.46 * (u * u - 0.33) - 0.14 * u * v;
      position.setZ(i, resting * curl + flying * bow);
    }
    position.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }
}

/**
 * The paper-to-laptop scene: builds its objects once, then `setProgress` poses them from the
 * timeline and renders a frame. Nothing animates on its own; a frame is drawn only when asked.
 */
export class StageScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, BASE_ASPECT, 0.5, 60);
  private readonly disposables: { dispose(): void }[] = [];

  private readonly sketch: Sheet;
  private readonly spec: Sheet;
  private readonly notes: Mesh[] = [];
  private readonly laptop = new Group();
  private readonly lid = new Group();
  private readonly sketchShadow: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private readonly specShadow: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private readonly noteShadows: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  private readonly laptopShadow: Mesh<PlaneGeometry, MeshBasicMaterial>;

  private readonly sketchMap: CanvasTexture;
  private readonly specMap: CanvasTexture;
  private readonly noteMaps: CanvasTexture[] = [];
  private readonly screenCanvas = createScreen();
  private readonly screenMap: CanvasTexture;
  /** The staging card and the handover panel: planes of their own just over the screen, so they glide without a redraw */
  private readonly cards: { sprite: CardSprite; map: CanvasTexture; mesh: Mesh<PlaneGeometry, MeshBasicMaterial> }[] = [];

  private content: StageContent;
  private progress = 0;
  private shownFrame = '';
  private frame = 0;
  private lost = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    content: StageContent,
  ) {
    this.content = content;
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.02;

    // A soft studio: the room's light boxes give the aluminium something to reflect
    const pmrem = new PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.03).texture;
    this.scene.environment = environment;
    this.scene.environmentIntensity = 1;
    room.dispose();
    pmrem.dispose();
    this.disposables.push(environment);

    const key = new DirectionalLight(0xfff6ec, 1.1);
    key.position.set(-3.5, 7, 4);
    this.scene.add(key);

    const grain = this.texture(drawGrain(), false);
    grain.wrapS = grain.wrapT = RepeatWrapping;
    grain.repeat.set(7, 5);

    // ─── Sheets ───────────────────────────────────────────────────────────────
    this.sketchMap = this.texture(drawSketch(content));
    this.specMap = this.texture(drawSpec(content));
    const paper = (map: Texture): MeshStandardMaterial =>
      this.keep(
        new MeshStandardMaterial({
          map,
          bumpMap: grain,
          bumpScale: 0.6,
          roughness: 0.94,
          metalness: 0,
          side: DoubleSide,
        }),
      );
    this.sketch = new Sheet(SHEET_LONG, SHEET_SHORT, paper(this.sketchMap), [1, -1], 0.13);
    this.spec = new Sheet(SHEET_SHORT, SHEET_LONG, paper(this.specMap), [1, -1], 0.11);
    this.spec.mesh.rotation.order = 'YXZ';
    this.sketch.mesh.rotation.order = 'YXZ';
    this.sketch.mesh.renderOrder = 3;
    this.scene.add(this.sketch.mesh, this.spec.mesh);
    this.disposables.push(this.sketch.mesh.geometry, this.spec.mesh.geometry);

    this.sketchShadow = this.shadow(SHEET_LONG, SHEET_SHORT, 0.07);
    this.specShadow = this.shadow(SHEET_SHORT, SHEET_LONG, 0.07);
    this.specShadow.renderOrder = 2;

    // ─── Sticky notes ─────────────────────────────────────────────────────────
    const noteGeometry = new PlaneGeometry(NOTE_SIZE, NOTE_SIZE, 10, 10);
    const notePosition = noteGeometry.getAttribute('position');
    for (let i = 0; i < notePosition.count; i++) {
      // Stuck along the top edge; the free edge curls up off the desk
      const v = notePosition.getY(i) / (NOTE_SIZE / 2);
      const u = notePosition.getX(i) / (NOTE_SIZE / 2);
      const free = Math.max(0, -v + 0.1);
      notePosition.setZ(i, 0.05 * free * free * (1 + 0.35 * u));
    }
    noteGeometry.computeVertexNormals();
    this.disposables.push(noteGeometry);
    content.notes.forEach((text, i) => {
      const map = this.texture(drawNote(text, 31 + i));
      this.noteMaps.push(map);
      const note = new Mesh(
        noteGeometry,
        this.keep(new MeshStandardMaterial({ map, bumpMap: grain, bumpScale: 0.4, roughness: 0.9, side: DoubleSide })),
      );
      note.rotation.order = 'YXZ';
      note.rotation.x = -Math.PI / 2;
      this.notes.push(note);
      const noteShadow = this.shadow(NOTE_SIZE, NOTE_SIZE, 0.1);
      noteShadow.material.opacity = 0.3;
      this.noteShadows.push(noteShadow);
      this.scene.add(note);
    });

    // ─── Laptop ───────────────────────────────────────────────────────────────
    this.screenMap = this.texture(this.screenCanvas);
    // Repainted as the story plays: without mipmaps an update is one upload, with no chain to rebuild
    this.screenMap.generateMipmaps = false;
    this.screenMap.minFilter = LinearFilter;
    this.buildLaptop();
    this.laptopShadow = this.shadow(LAPTOP_W + 0.1, LAPTOP_D + 0.3, 0.09);
    this.scene.add(this.laptop);

    canvas.addEventListener('webglcontextlost', this.onLost);
    canvas.addEventListener('webglcontextrestored', this.onRestored);
    this.pose();
    this.warm();
  }

  /** Scroll progress through the story, 0–1: poses everything and draws a frame */
  setProgress(progress: number): void {
    if (progress === this.progress) return;
    this.progress = progress;
    this.pose();
    this.request();
  }

  /** New words (another language, a new product name): the drawings are redrawn in place */
  setContent(content: StageContent): void {
    this.content = content;
    this.redraw(this.sketchMap, drawSketch(content));
    this.redraw(this.specMap, drawSpec(content));
    content.notes.forEach((text, i) => {
      const map = this.noteMaps[i];
      if (map) this.redraw(map, drawNote(text, 31 + i));
    });
    const { staging, handover } = drawCards(content);
    [staging, handover].forEach((sprite, i) => {
      const card = this.cards[i];
      if (!card) return;
      card.sprite = sprite;
      this.redraw(card.map, sprite.image);
    });
    this.shownFrame = '';
    this.pose();
    this.request();
  }

  /** The canvas's box changed: `width` and `height` in CSS pixels */
  resize(width: number, height: number): void {
    if (width < 1 || height < 1) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.pose();
    this.request();
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored);
    for (const item of this.disposables) item.dispose();
    this.renderer.dispose();
  }

  private readonly onLost = (event: Event): void => {
    event.preventDefault();
    this.lost = true;
  };

  private readonly onRestored = (): void => {
    this.lost = false;
    this.request();
  };

  private request(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (!this.lost) this.renderer.render(this.scene, this.camera);
    });
  }

  /**
   * Readies everything for the graphics card now, while only the sketch is on show: the laptop's
   * shaders and every texture. Left to their first frame in view, they stall the story just as
   * the laptop glides in and as each card first shows.
   */
  private warm(): void {
    const hidden = this.cards.filter((card) => !card.mesh.visible);
    hidden.forEach((card) => (card.mesh.visible = true));
    this.renderer.compile(this.scene, this.camera);
    hidden.forEach((card) => (card.mesh.visible = false));
    for (const item of this.disposables) {
      if (item instanceof Texture) this.renderer.initTexture(item);
    }
  }

  private keep<T extends Material>(material: T): T {
    this.disposables.push(material);
    return material;
  }

  private texture(source: HTMLCanvasElement, colour = true): CanvasTexture {
    const texture = new CanvasTexture(source);
    if (colour) texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    this.disposables.push(texture);
    return texture;
  }

  private redraw(texture: CanvasTexture, source: HTMLCanvasElement): void {
    texture.image = source;
    texture.needsUpdate = true;
  }

  /** A blurred dark card lying on the desk under an object: its contact shadow */
  private shadow(w: number, h: number, softness: number): Mesh<PlaneGeometry, MeshBasicMaterial> {
    const map = this.texture(drawShadow(w / h, softness), false);
    // The card is larger than the object by the blur's margin, so its dark core matches the outline
    const margin = 2 * (softness * 2 + 0.02);
    const geometry = new PlaneGeometry(
      w / (1 - margin * Math.min(1, h / w)),
      h / (1 - margin * Math.min(1, w / h)),
    );
    const material = this.keep(
      new MeshBasicMaterial({ map, color: 0x1a1c22, transparent: true, depthWrite: false, toneMapped: false }),
    );
    const mesh = new Mesh(geometry, material);
    mesh.rotation.order = 'YXZ';
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = 1;
    this.disposables.push(geometry);
    this.scene.add(mesh);
    return mesh;
  }

  private buildLaptop(): void {
    const aluminium = this.keep(
      new MeshPhysicalMaterial({ color: ALUMINIUM, metalness: 1, roughness: 0.36, envMapIntensity: 1.1 }),
    );
    const dark = this.keep(new MeshStandardMaterial({ color: 0x121316, roughness: 0.62 }));
    const add = (parent: Object3D, mesh: Mesh): Mesh => {
      this.disposables.push(mesh.geometry);
      parent.add(mesh);
      return mesh;
    };

    // The base: a rounded aluminium slab lying on the desk
    const base = add(this.laptop, new Mesh(slab(LAPTOP_W, LAPTOP_D, BASE_T, 0.14, 0.014), aluminium));
    base.rotation.x = -Math.PI / 2;

    const deck = BASE_T + 0.001;
    // The keyboard well, its keys and the trackpad
    const wellW = 2.74;
    const wellD = 1.02;
    const wellZ = -0.36;
    const well = add(this.laptop, new Mesh(panel(wellW, wellD, 0.05), dark));
    well.rotation.x = -Math.PI / 2;
    well.position.set(0, deck, wellZ);

    const keyMaterial = this.keep(new MeshStandardMaterial({ color: 0x1d1f23, roughness: 0.5 }));
    const keyGeometry = new BoxGeometry(1, 1, 1);
    const keys = new InstancedMesh(keyGeometry, keyMaterial, KEY_ROWS * KEY_COLS);
    const pitchX = (wellW - 0.06) / KEY_COLS;
    const rowDepths = [0.09, 0.165, 0.165, 0.165, 0.165, 0.165];
    const gap = 0.022;
    const matrix = new Matrix4();
    let count = 0;
    let z = wellZ - wellD / 2 + 0.035;
    rowDepths.forEach((depth, row) => {
      for (let col = 0; col < KEY_COLS; col++) {
        // The bottom row carries the space bar across five keys
        const space = row === KEY_ROWS - 1 && col >= 4 && col <= 8;
        if (space && col !== 4) continue;
        const span = space ? 5 : 1;
        const w = pitchX * span - gap;
        const x = -wellW / 2 + 0.03 + pitchX * (col + span / 2);
        matrix.makeScale(w, 0.012, depth - gap);
        matrix.setPosition(x, deck + 0.006, z + depth / 2);
        keys.setMatrixAt(count++, matrix);
      }
      z += depth;
    });
    keys.count = count;
    keys.instanceMatrix.needsUpdate = true;
    this.disposables.push(keyGeometry);
    this.laptop.add(keys);

    const pad = add(
      this.laptop,
      new Mesh(
        panel(1.26, 0.78, 0.05),
        this.keep(new MeshPhysicalMaterial({ color: 0xcbcdd1, metalness: 1, roughness: 0.28, envMapIntensity: 1.1 })),
      ),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, deck, 0.64);

    // The hinge: a dark barrel along the back edge
    const hinge = add(this.laptop, new Mesh(new CylinderGeometry(0.04, 0.04, LAPTOP_W * 0.8, 20), dark));
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, BASE_T - 0.005, HINGE_Z);

    // The lid, hinged at its lower edge: aluminium shell, glass face, the display in it
    this.lid.position.set(0, BASE_T + 0.004, HINGE_Z);
    const shell = add(this.lid, new Mesh(slab(LAPTOP_W, LAPTOP_D, LID_T, 0.14, 0.012), aluminium));
    shell.position.set(0, LAPTOP_D / 2, -LID_T);
    const glass = add(
      this.lid,
      new Mesh(
        panel(LAPTOP_W - 0.05, LAPTOP_D - 0.05, 0.12),
        // Unlit: glass at a glancing angle would mirror the bright studio and read as grey
        this.keep(new MeshBasicMaterial({ color: 0x0b0c0e, toneMapped: false })),
      ),
    );
    glass.position.set(0, LAPTOP_D / 2, 0.002);
    const screen = add(
      this.lid,
      new Mesh(
        panel(SCREEN_W, SCREEN_H, 0.035),
        this.keep(new MeshBasicMaterial({ map: this.screenMap, toneMapped: false })),
      ),
    );
    screen.position.set(0, SCREEN_Y, 0.004);
    const { staging, handover } = drawCards(this.content);
    [staging, handover].forEach((sprite, i) => {
      const map = this.texture(sprite.image);
      const material = this.keep(new MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }));
      const mesh = new Mesh(new PlaneGeometry(sprite.w * PX, sprite.h * PX), material);
      this.lid.add(mesh);
      mesh.position.z = 0.0045 + i * 0.0005;
      mesh.visible = false;
      this.cards.push({ sprite, map, mesh });
    });
    const lens = add(
      this.lid,
      new Mesh(new CylinderGeometry(0.014, 0.014, 0.002, 12), this.keep(new MeshStandardMaterial({ color: 0x23262c, roughness: 0.2 }))),
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, SCREEN_Y + SCREEN_H / 2 + 0.07, 0.004);
    this.laptop.add(this.lid);
  }

  /** Puts everything where the timeline says for the current progress */
  private pose(): void {
    const pose = poseAt(this.progress);

    // A stage narrower than the poses were composed for steps the camera back along its line of sight
    const back = Math.max(1, BASE_ASPECT / this.camera.aspect);
    const [tx, ty, tz] = pose.target;
    this.camera.position.set(
      tx + (pose.camera[0] - tx) * back,
      ty + (pose.camera[1] - ty) * back,
      tz + (pose.camera[2] - tz) * back,
    );
    this.camera.lookAt(tx, ty, tz);

    const { sketch } = pose;
    const sheet = this.sketch.mesh;
    sheet.position.set(...sketch.pos);
    sheet.rotation.set(sketch.pitch, sketch.yaw, 0);
    sheet.scale.set(sketch.scale[0], sketch.scale[1], 1);
    this.sketch.bend(sketch.curl, sketch.bend);
    sheet.visible = sketch.opacity > 0;
    if (sheet.material.transparent !== sketch.opacity < 1) {
      sheet.material.transparent = sketch.opacity < 1;
      sheet.material.needsUpdate = true;
    }
    sheet.material.opacity = sketch.opacity;
    // Its shadow stays on the desk, wider and fainter the higher the sheet flies
    const height = Math.max(0, sketch.pos[1]);
    const spread = 1 + height * 0.3;
    this.sketchShadow.position.set(sketch.pos[0] + SHADOW_SHIFT, 0.004, sketch.pos[2] + SHADOW_SHIFT + height * 0.25);
    this.sketchShadow.rotation.y = sketch.yaw;
    this.sketchShadow.scale.set(spread, spread * Math.max(0.35, Math.abs(Math.sin(sketch.pitch))), 1);
    this.sketchShadow.material.opacity = (SHEET_SHADOW * sketch.opacity) / (1 + height * 2.2);

    this.spec.mesh.position.set(...pose.spec.pos);
    this.spec.mesh.rotation.set(-Math.PI / 2, pose.spec.yaw, 0);
    this.specShadow.position.set(pose.spec.pos[0] + SHADOW_SHIFT, 0.02, pose.spec.pos[2] + SHADOW_SHIFT);
    this.specShadow.rotation.y = pose.spec.yaw;
    this.specShadow.material.opacity = SHEET_SHADOW;

    NOTE_RESTS.forEach((rest, i) => {
      const note = this.notes[i];
      const shadow = this.noteShadows[i];
      if (!note || !shadow) return;
      // Each note leaves a little after the one before, sliding off to the right
      const out = Math.min(1, Math.max(0, pose.notesOut * 1.3 - i * 0.15));
      const x = rest.pos[0] + out * out * 13;
      const z = rest.pos[2] - out * 0.8;
      note.position.set(x, rest.pos[1], z);
      note.rotation.y = rest.yaw + out * 0.6;
      shadow.position.set(x + SHADOW_SHIFT, 0.006, z + SHADOW_SHIFT);
      shadow.rotation.y = note.rotation.y;
    });

    this.laptop.position.set(0, 0, pose.laptopZ);
    this.lid.rotation.x = Math.PI / 2 - pose.lid;
    this.laptopShadow.position.set(0, 0.003, pose.laptopZ - 0.08);
    this.laptopShadow.material.opacity = 0.34;

    this.paint(pose.screen);
  }

  private paint(frame: ScreenFrame): void {
    [frame.staging, frame.panel].forEach((shown, i) => {
      const card = this.cards[i];
      if (!card) return;
      const { sprite, mesh } = card;
      mesh.visible = shown > 0;
      mesh.material.opacity = shown;
      // The sprite's centre on the screen, from the screen's pixels (y down) to the lid's space (y up)
      mesh.position.x = (sprite.x + sprite.w / 2 - SCREEN_PX[0] / 2) * PX;
      mesh.position.y = SCREEN_Y + (SCREEN_PX[1] / 2 - sprite.y - sprite.h / 2 - (1 - shown) * sprite.rise) * PX;
    });

    // The screen itself is redrawn only when a row arrives, gets ticked, or the toast goes
    const key = `${frame.rows}|${frame.checks}|${frame.panel > 0}`;
    if (key === this.shownFrame) return;
    this.shownFrame = key;
    paintScreen(this.screenCanvas, this.content, frame);
    this.screenMap.needsUpdate = true;
  }
}

/** Whether this browser can draw the scene at all */
export function canRender(): boolean {
  try {
    const probe = document.createElement('canvas');
    return !!(probe.getContext('webgl2') ?? probe.getContext('webgl'));
  } catch {
    return false;
  }
}
