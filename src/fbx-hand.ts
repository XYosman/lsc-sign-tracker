import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import type { Landmark } from "./camera.js";

export interface FBXHandOptions {
  modelUrl: string;
  width?: number;
  height?: number;
  background?: number;
  cameraZ?: number;
  modelScale?: number;
}

const FINGER_BONE_MAP: Record<string, string[]> = {
  thumb: ["Thumb1", "Thumb2", "Thumb3"],
  index: ["Index1", "Index2", "Index3"],
  middle: ["Middle1", "Middle2", "Middle3"],
  ring: ["Ring1", "Ring2", "Ring3"],
  pinky: ["Pinky1", "Pinky2", "Pinky3"]
};

const FINGER_LANDMARKS: Record<string, [number, number, number, number]> = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20]
};

export class FBXHandScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  model: THREE.Group | null = null;
  bones: THREE.Bone[] = [];
  boneMap: Map<string, THREE.Bone> = new Map();
  private opts: Required<FBXHandOptions>;
  private loader = new FBXLoader();
  private loaded = false;
  private onLoadedCallback: (() => void) | null = null;

  constructor(container: HTMLElement, options: FBXHandOptions) {
    this.opts = {
      modelUrl: options.modelUrl,
      width: options.width ?? container.clientWidth ?? 400,
      height: options.height ?? container.clientHeight ?? 300,
      background: options.background ?? 0x1a1a2e,
      cameraZ: options.cameraZ ?? 2,
      modelScale: options.modelScale ?? 0.01
    };

    container.style.overflow = "hidden";
    container.style.width = this.opts.width + "px";
    container.style.height = this.opts.height + "px";

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.opts.background);

    this.camera = new THREE.PerspectiveCamera(
      50,
      this.opts.width / this.opts.height,
      0.01,
      100
    );
    this.camera.position.set(0, 0, this.opts.cameraZ);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.opts.width, this.opts.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.domElement.style.display = "block";
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(2, 3, 4);
    this.scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-2, -1, -3);
    this.scene.add(dirLight2);

    this.loadModel();
  }

  onLoaded(cb: () => void): void {
    this.onLoadedCallback = cb;
    if (this.loaded) cb();
  }

  private loadModel(): void {
    this.loader.load(
      this.opts.modelUrl,
      (fbx) => {
        this.model = fbx;
        this.model.scale.setScalar(this.opts.modelScale);
        this.model.position.set(0, -1, 0);

        fbx.traverse((child) => {
          if (child instanceof THREE.Bone) {
            this.bones.push(child);
            this.boneMap.set(child.name, child);
          }
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            if (mat) mat.needsUpdate = true;
          }
        });

        this.scene.add(this.model);
        this.loaded = true;
        this.onLoadedCallback?.();
      },
      undefined,
      (err) => {
        console.error("FBX load error:", err);
      }
    );
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getBoneNames(): string[] {
    return this.bones.map(b => b.name);
  }

  updateHands(hands: Landmark[][]): void {
    if (!this.loaded || hands.length === 0) return;

    const hand = hands[0];
    if (hand.length < 21) return;

    for (const [finger, boneNames] of Object.entries(FINGER_BONE_MAP)) {
      const [j0, j1, j2, j3] = FINGER_LANDMARKS[finger];
      const points = [j0, j1, j2, j3].map(i => new THREE.Vector3(
        (hand[i].x - 0.5) * 2,
        -(hand[i].y - 0.5) * 2,
        -hand[i].z * 2
      ));

      for (let b = 0; b < boneNames.length && b < points.length - 1; b++) {
        const bone = this.boneMap.get(boneNames[b]);
        if (!bone) continue;

        const target = points[b + 1].clone().sub(points[b]).normalize();
        const parentWorld = new THREE.Quaternion();
        bone.parent?.getWorldQuaternion(parentWorld);

        const localDir = target.clone().applyQuaternion(parentWorld.invert());
        const restDir = new THREE.Vector3(0, 1, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(restDir, localDir);

        bone.quaternion.slerp(q, 0.6);
      }
    }
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.scene.clear();
  }
}
