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

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [2, 6, 10, 14, 18];

function fingerExtended(hand: Landmark[], fingerIdx: number): boolean {
  const tip = hand[FINGER_TIPS[fingerIdx]];
  const pip = hand[FINGER_PIPS[fingerIdx]];
  const wrist = hand[0];
  const tipDist = Math.sqrt((tip.x - wrist.x) ** 2 + (tip.y - wrist.y) ** 2 + (tip.z - wrist.z) ** 2);
  const pipDist = Math.sqrt((pip.x - wrist.x) ** 2 + (pip.y - wrist.y) ** 2 + (pip.z - wrist.z) ** 2);
  return tipDist > pipDist;
}

function getHandShape(hand: Landmark[]): string {
  const extended = [0, 1, 2, 3, 4].filter(i => fingerExtended(hand, i));
  return extended.join(",");
}

function compareHandShapes(shape1: string, shape2: string): number {
  if (shape1 === shape2) return 1.0;
  const set1 = new Set(shape1.split(",").map(Number));
  const set2 = new Set(shape2.split(",").map(Number));
  let intersection = 0;
  set1.forEach(v => { if (set2.has(v)) intersection++; });
  const union = new Set([...set1, ...set2]).size;
  return union > 0 ? intersection / union : 0;
}

export class LSCSignLibrary {
  private signs: SignData[] = [];

  registerSign(sign: SignData): void {
    this.signs.push(sign);
  }

  getSign(id: string): SignData | undefined {
    return this.signs.find(s => s.id === id);
  }

  getAllSigns(): SignData[] {
    return [...this.signs];
  }

  getCategories(): string[] {
    return [...new Set(this.signs.map(s => s.category))];
  }

  matchGesture(leftHand: Landmark[] | null, rightHand: Landmark[] | null): SignMatch | null {
    if (this.signs.length === 0) return null;

    let bestMatch: SignMatch | null = null;
    let bestScore = 0;

    for (const sign of this.signs) {
      const refFrame = sign.keyframes[0];
      let score = 0;
      let count = 0;

      if (leftHand && refFrame.leftHand) {
        score += compareHandShapes(getHandShape(leftHand), getHandShape(refFrame.leftHand));
        count++;
      }
      if (rightHand && refFrame.rightHand) {
        score += compareHandShapes(getHandShape(rightHand), getHandShape(refFrame.rightHand));
        count++;
      }

      const avgScore = count > 0 ? score / count : 0;
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestMatch = { sign, confidence: avgScore };
      }
    }

    return bestScore > 0.5 ? bestMatch : null;
  }
}

export class SignPlayer {
  private sign: SignData | null = null;
  private startTime = 0;
  private playing = false;
  private loop = false;
  private onFrameCallback: ((left: Landmark[] | null, right: Landmark[] | null, progress: number) => void) | null = null;

  onFrame(callback: (left: Landmark[] | null, right: Landmark[] | null, progress: number) => void): void {
    this.onFrameCallback = callback;
  }

  play(sign: SignData, loop = false): void {
    this.sign = sign;
    this.loop = loop;
    this.startTime = performance.now();
    this.playing = true;
  }

  stop(): void {
    this.playing = false;
    this.sign = null;
  }

  update(): void {
    if (!this.playing || !this.sign) return;

    const elapsed = (performance.now() - this.startTime) / 1000;
    let progress = elapsed / this.sign.duration;

    if (progress >= 1) {
      if (this.loop) {
        this.startTime = performance.now();
        progress = 0;
      } else {
        this.playing = false;
        this.onFrameCallback?.(null, null, 1);
        return;
      }
    }

    const keyframes = this.sign.keyframes;
    const frameProgress = progress * (keyframes.length - 1);
    const frameIdx = Math.floor(frameProgress);
    const nextFrameIdx = Math.min(frameIdx + 1, keyframes.length - 1);
    const t = frameProgress - frameIdx;

    const frameA = keyframes[frameIdx];
    const frameB = keyframes[nextFrameIdx];

    const left = this.interpolateHands(frameA.leftHand, frameB.leftHand, t);
    const right = this.interpolateHands(frameA.rightHand, frameB.rightHand, t);

    this.onFrameCallback?.(left, right, progress);
  }

  private interpolateHands(a: Landmark[] | null, b: Landmark[] | null, t: number): Landmark[] | null {
    if (!a || !b || a.length !== b.length) return a || b;
    return a.map((lm, i) => ({
      x: lm.x + (b[i].x - lm.x) * t,
      y: lm.y + (b[i].y - lm.y) * t,
      z: lm.z + (b[i].z - lm.z) * t
    }));
  }
}
