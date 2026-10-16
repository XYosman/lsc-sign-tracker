import type { Landmark } from "./camera";
export interface SignData {
    id: string;
    name: string;
    description: string;
    category: string;
    keyframes: SignKeyframe[];
    duration: number;
}
export interface SignKeyframe {
    time: number;
    leftHand: Landmark[] | null;
    rightHand: Landmark[] | null;
}
export interface SignMatch {
    sign: SignData;
    confidence: number;
}
export declare class LSCSignLibrary {
    private signs;
    registerSign(sign: SignData): void;
    getSign(id: string): SignData | undefined;
    getAllSigns(): SignData[];
    getCategories(): string[];
    matchGesture(leftHand: Landmark[] | null, rightHand: Landmark[] | null): SignMatch | null;
}
export declare class SignPlayer {
    private sign;
    private startTime;
    private playing;
    private loop;
    private onFrameCallback;
    onFrame(callback: (left: Landmark[] | null, right: Landmark[] | null, progress: number) => void): void;
    play(sign: SignData, loop?: boolean): void;
    stop(): void;
    update(): void;
    private interpolateHands;
}
