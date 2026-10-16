import * as THREE from "three";
import type { Landmark } from "./camera.js";
export declare const HAND_CONNECTIONS: [number, number][];
export interface HandSceneOptions {
    width?: number;
    height?: number;
    background?: number;
    cameraZ?: number;
    clip?: boolean;
}
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
    private container;
    private opts;
    constructor(container: HTMLElement, options?: HandSceneOptions);
    updateHands(hands: Landmark[][]): void;
    render(): void;
    private onResize;
    dispose(): void;
}
export interface HandOverlayOptions {
    lineWidth?: number;
    jointColor?: string;
    boneColor?: string;
    jointRadius?: number;
}
export declare class HandOverlay {
    private canvas;
    private ctx;
    private opts;
    constructor(video: HTMLVideoElement, options?: HandOverlayOptions);
    draw(hands: Landmark[][]): void;
    setVisible(visible: boolean): void;
    dispose(): void;
}
