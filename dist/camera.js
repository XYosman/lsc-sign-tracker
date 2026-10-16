import { FilesetResolver, HandLandmarker, FaceLandmarker, PoseLandmarker } from "@mediapipe/tasks-vision";
export class LSCCamera {
    handLandmarker = null;
    faceLandmarker = null;
    poseLandmarker = null;
    video = null;
    stream = null;
    mode;
    running = false;
    onResultCallback = null;
    rafId = null;
    lastVideoTime = -1;
    constructor(mode = "hands+face+pose") {
        this.mode = mode;
    }
    async initialize() {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });
        if (this.mode === "hands+face" || this.mode === "hands+face+pose") {
            this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                outputFaceBlendshapes: false,
                outputFacialTransformationMatrixes: false
            });
        }
        if (this.mode === "hands+face+pose") {
            this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 1
            });
        }
    }
    async startCamera(constraints) {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints || { video: { width: 640, height: 480, facingMode: "user" }, audio: false });
        this.video = document.createElement("video");
        this.video.srcObject = this.stream;
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.video.muted = true;
        await this.video.play();
        return this.video;
    }
    onResult(callback) {
        this.onResultCallback = callback;
    }
    start() {
        if (!this.video || !this.handLandmarker) {
            throw new Error("Camera not initialized. Call initialize() and startCamera() first.");
        }
        this.running = true;
        this.detectLoop();
    }
    stop() {
        this.running = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
    dispose() {
        this.stop();
        this.stream?.getTracks().forEach(t => t.stop());
        this.handLandmarker?.close();
        this.faceLandmarker?.close();
        this.poseLandmarker?.close();
    }
    detectLoop = () => {
        if (!this.running || !this.video)
            return;
        if (this.video.readyState >= 2 && this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            this.detect();
        }
        this.rafId = requestAnimationFrame(this.detectLoop);
    };
    detect() {
        if (!this.video || !this.handLandmarker)
            return;
        const now = performance.now();
        const handResult = this.handLandmarker.detectForVideo(this.video, now);
        let faceLandmarks = null;
        if (this.faceLandmarker) {
            const faceResult = this.faceLandmarker.detectForVideo(this.video, now);
            if (faceResult.faceLandmarks.length > 0) {
                faceLandmarks = faceResult.faceLandmarks[0].map(lm => ({ x: lm.x, y: lm.y, z: lm.z }));
            }
        }
        let poseLandmarks = null;
        if (this.poseLandmarker) {
            const poseResult = this.poseLandmarker.detectForVideo(this.video, now);
            if (poseResult.landmarks.length > 0) {
                poseLandmarks = poseResult.landmarks[0].map(lm => ({ x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility }));
            }
        }
        const hands = handResult.landmarks.map(hand => hand.map(lm => ({ x: lm.x, y: lm.y, z: lm.z })));
        const result = {
            hands,
            face: faceLandmarks,
            pose: poseLandmarks,
            timestamp: now
        };
        this.onResultCallback?.(result);
    }
}
