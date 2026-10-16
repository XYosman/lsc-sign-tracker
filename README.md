# @lsc/sign-tracker

Paquete NPM para **Lengua de Señas Colombiana (LSC)** con rastreo de manos, rostro y cuerpo usando MediaPipe y visualización 3D con three.js.

## Instalación

```bash
npm install @lsc/sign-tracker
```

## Uso rápido

```typescript
import { LSCCamera, HandScene, LSCSignLibrary, SignPlayer, LSC_SIGNS } from "@lsc/sign-tracker";

const camera = new LSCCamera("hands+face+pose");
await camera.initialize();

const video = await camera.startCamera();
document.body.appendChild(video);

const scene = new HandScene(document.getElementById("container")!);

camera.onResult((result) => {
  scene.updateHands(result.hands);
  scene.render();
});

camera.start();
```

## Reproducir una seña

```typescript
const player = new SignPlayer();

player.onFrame((leftHand, rightHand, progress) => {
  if (leftHand) scene.updateHands([leftHand]);
  if (rightHand) scene.updateHands([rightHand]);
  scene.render();
});

player.play(LSC_SIGNS.find(s => s.id === "hola")!, true);
```

## API

### LSCCamera
- `initialize()` — carga los modelos de MediaPipe
- `startCamera()` — activa la webcam
- `onResult(callback)` — recibe landmarks de manos/cara/cuerpo
- `start()` / `stop()` — controla el loop de detección

### HandScene
- `updateHands(hands: Landmark[][])` — actualiza el modelo 3D
- `render()` — renderiza la escena

### LSCSignLibrary
- `registerSign(sign: SignData)` — registra una seña
- `matchGesture(left, right): SignMatch | null` — detecta seña actual

### SignPlayer
- `play(sign: SignData, loop?: boolean)` — reproduce animación
- `onFrame(callback)` — recibe keyframes interpolados

## Demo

Abre `examples/basic.html` en un navegador con un servidor local.

## Licencia

MIT
