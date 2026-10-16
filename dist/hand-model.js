import * as THREE from "three";
const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17]
];
const BONE_RADIUS = 0.008;
const JOINT_RADIUS = 0.012;
export class HandModel3D {
    group;
    bones = [];
    joints = [];
    jointPositions = [];
    constructor() {
        this.group = new THREE.Group();
        this.buildModel();
    }
    buildModel() {
        const boneMaterial = new THREE.MeshPhongMaterial({ color: 0x4fc3f7, shininess: 60 });
        const jointMaterial = new THREE.MeshPhongMaterial({ color: 0x0288d1, shininess: 80 });
        for (let i = 0; i < 21; i++) {
            const joint = new THREE.Mesh(new THREE.SphereGeometry(JOINT_RADIUS, 12, 12), jointMaterial);
            this.joints.push(joint);
            this.jointPositions.push(new THREE.Vector3());
            this.group.add(joint);
        }
        for (const [start, end] of HAND_CONNECTIONS) {
            const bone = new THREE.Mesh(new THREE.CylinderGeometry(BONE_RADIUS, BONE_RADIUS, 1, 8), boneMaterial);
            this.bones.push(bone);
            this.group.add(bone);
        }
    }
    update(landmarks) {
        if (landmarks.length < 21)
            return;
        for (let i = 0; i < 21; i++) {
            const lm = landmarks[i];
            this.jointPositions[i].set(lm.x, -lm.y, -lm.z);
            this.joints[i].position.copy(this.jointPositions[i]);
        }
        for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
            const [start, end] = HAND_CONNECTIONS[i];
            const startPos = this.jointPositions[start];
            const endPos = this.jointPositions[end];
            const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
            const direction = new THREE.Vector3().subVectors(endPos, startPos);
            const length = direction.length();
            const bone = this.bones[i];
            bone.position.copy(mid);
            bone.scale.set(1, length, 1);
            bone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        }
    }
    setVisible(visible) {
        this.group.visible = visible;
    }
    setColor(color) {
        this.joints[0].material.color.setHex(color);
    }
}
export class HandScene {
    scene;
    camera;
    renderer;
    leftHand;
    rightHand;
    constructor(container) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.01, 10);
        this.camera.position.set(0, 0, 0.5);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(1, 2, 3);
        this.scene.add(dirLight);
        this.leftHand = new HandModel3D();
        this.rightHand = new HandModel3D();
        this.leftHand.setColor(0x4fc3f7);
        this.rightHand.setColor(0xff8a65);
        this.scene.add(this.leftHand.group);
        this.scene.add(this.rightHand.group);
        window.addEventListener("resize", () => this.onResize(container));
    }
    updateHands(hands) {
        if (hands.length > 0) {
            this.leftHand.update(hands[0]);
            this.leftHand.setVisible(true);
        }
        else {
            this.leftHand.setVisible(false);
        }
        if (hands.length > 1) {
            this.rightHand.update(hands[1]);
            this.rightHand.setVisible(true);
        }
        else {
            this.rightHand.setVisible(false);
        }
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    onResize(container) {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    dispose() {
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}
