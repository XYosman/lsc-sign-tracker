export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
}
export interface TrackingResult {
    hands: Landmark[][];
    face: Landmark[] | null;
    pose: Landmark[] | null;
    timestamp: number;
}
export type TrackingMode = "hands" | "hands+face" | "hands+face+pose";
export declare class LSCCamera {
    private handLandmarker;
    private faceLandmarker;
    private poseLandmarker;
    private video;
    private stream;
    private mode;
    private running;
    private onResultCallback;
    private rafId;
    private lastVideoTime;
    constructor(mode?: TrackingMode);
    initialize(): Promise<void>;
    startCamera(constraints?: MediaStreamConstraints): Promise<HTMLVideoElement>;
    onResult(callback: (result: TrackingResult) => void): void;
    start(): void;
    stop(): void;
    dispose(): void;
    private detectLoop;
    private detect;
}
