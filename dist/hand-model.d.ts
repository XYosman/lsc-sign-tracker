import * as THREE from "three";
import type { Landmark } from "./camera.js";
export declare class HandModel3D {
    group: THREE.Group;
    private bones;
    private joints;
    private jointPositions;
    constructor();
    private buildModel;
    update(landmarks: Landmark[]): void;
    setVisible(visible: boolean): void;
    setColor(color: number): void;
}
export declare class HandScene {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    leftHand: HandModel3D;
    rightHand: HandModel3D;
    constructor(container: HTMLElement);
    updateHands(hands: Landmark[][]): void;
    render(): void;
    private onResize;
    dispose(): void;
}
