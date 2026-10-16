import type { Landmark } from "./camera";
import type { SignData } from "./signs";

type HandShape = "fist" | "open" | "point" | "pinch" | "cShape" | "flat";

function generateHandLandmarks(shape: HandShape, hand: "left" | "right"): Landmark[] {
  const landmarks: Landmark[] = [];
  const mirror = hand === "left" ? -1 : 1;

  landmarks.push({ x: 0.5, y: 0.8, z: 0 });

  const fingerConfigs: Record<HandShape, { baseY: number; curl: number }[]> = {
    fist: [
      { baseY: 0.65, curl: 0.05 },
      { baseY: 0.55, curl: 0.08 },
      { baseY: 0.5, curl: 0.1 },
      { baseY: 0.55, curl: 0.12 }
    ],
    open: [
      { baseY: 0.45, curl: 0 },
      { baseY: 0.3, curl: 0 },
      { baseY: 0.25, curl: 0 },
      { baseY: 0.35, curl: 0 }
    ],
    point: [
      { baseY: 0.65, curl: 0.05 },
      { baseY: 0.35, curl: 0 },
      { baseY: 0.55, curl: 0.1 },
      { baseY: 0.6, curl: 0.12 }
    ],
    pinch: [
      { baseY: 0.5, curl: 0.1 },
      { baseY: 0.4, curl: 0.15 },
      { baseY: 0.5, curl: 0.1 },
      { baseY: 0.55, curl: 0.12 }
    ],
    cShape: [
      { baseY: 0.5, curl: 0.15 },
      { baseY: 0.4, curl: 0.1 },
      { baseY: 0.35, curl: 0.1 },
      { baseY: 0.4, curl: 0.1 }
    ],
    flat: [
      { baseY: 0.45, curl: 0.02 },
      { baseY: 0.3, curl: 0.02 },
      { baseY: 0.25, curl: 0.02 },
      { baseY: 0.35, curl: 0.02 }
    ]
  };

  const config = fingerConfigs[shape];

  for (let f = 0; f < 5; f++) {
    const isThumb = f === 0;
    const baseX = isThumb
      ? 0.42 * mirror
      : 0.48 + (f - 1) * 0.04;
    const { baseY, curl } = config[Math.min(f, config.length - 1)];

    landmarks.push({ x: baseX, y: baseY + 0.05, z: 0 });
    landmarks.push({ x: baseX + 0.01 * mirror, y: baseY - curl * 0.3, z: -0.02 });
    landmarks.push({ x: baseX + 0.015 * mirror, y: baseY - curl * 0.6, z: -0.04 });
    landmarks.push({ x: baseX + 0.02 * mirror, y: baseY - curl, z: -0.06 });
  }

  return landmarks;
}

function createSign(
  id: string,
  name: string,
  description: string,
  category: string,
  duration: number,
  keyframes: { left: HandShape | null; right?: HandShape | null; offset?: { x: number; y: number } }[]
): SignData {
  return {
    id,
    name,
    description,
    category,
    duration,
    keyframes: keyframes.map(k => ({
      time: 0,
      leftHand: k.left ? generateHandLandmarks(k.left, "left").map(lm => ({
        x: lm.x + (k.offset?.x || 0),
        y: lm.y + (k.offset?.y || 0),
        z: lm.z
      })) : null,
      rightHand: k.right ? generateHandLandmarks(k.right, "right") : null
    }))
  };
}

export const LSC_SIGNS: SignData[] = [
  createSign(
    "hola",
    "Hola",
    "Saludo: mano abierta frente al pecho, movimiento circular",
    "saludos",
    1.5,
    [
      { left: null, right: "open", offset: { x: 0, y: -0.1 } },
      { left: null, right: "open", offset: { x: 0.05, y: -0.15 } },
      { left: null, right: "open", offset: { x: 0, y: -0.1 } },
      { left: null, right: "open", offset: { x: -0.05, y: -0.15 } }
    ]
  ),
  createSign(
    "gracias",
    "Gracias",
    "Mano plana en barbilla, se mueve hacia adelante",
    "saludos",
    1.2,
    [
      { left: null, right: "flat", offset: { x: 0, y: 0.1 } },
      { left: null, right: "flat", offset: { x: 0, y: -0.05 } }
    ]
  ),
  createSign(
    "adios",
    "Adiós",
    "Mano abierta frente al rostro, se aleja moviendo los dedos",
    "saludos",
    1.0,
    [
      { left: null, right: "open" },
      { left: null, right: "open", offset: { x: 0.1, y: 0 } },
      { left: null, right: "open", offset: { x: 0.15, y: 0 } }
    ]
  ),
  createSign(
    "si",
    "Sí",
    "Índice extendido haciendo movimiento vertical",
    "afirmación",
    0.8,
    [
      { left: null, right: "point" },
      { left: null, right: "point", offset: { x: 0, y: -0.05 } },
      { left: null, right: "point", offset: { x: 0, y: 0 } }
    ]
  ),
  createSign(
    "no",
    "No",
    "Índice y pulgar juntos, se separan rápidamente",
    "afirmación",
    0.6,
    [
      { left: null, right: "pinch" },
      { left: null, right: "point" },
      { left: null, right: "pinch" }
    ]
  ),
  createSign(
    "por-favor",
    "Por favor",
    "Mano plana en pecho, movimiento circular",
    "modales",
    1.5,
    [
      { left: null, right: "flat", offset: { x: 0, y: 0.05 } },
      { left: null, right: "flat", offset: { x: 0.03, y: 0.02 } },
      { left: null, right: "flat", offset: { x: 0, y: 0.05 } }
    ]
  ),
  createSign(
    "ayuda",
    "Ayuda",
    "Puño con pulgar arriba en palma de otra mano",
    "emergencia",
    1.0,
    [
      { left: "open", offset: { x: -0.1, y: 0 } },
      { left: "open", offset: { x: -0.1, y: 0 } },
      { left: "open", offset: { x: -0.1, y: 0 } }
    ]
  ),
  createSign(
    "abogado",
    "Abogado",
    "Letra A con ambas manos haciendo círculo",
    "profesiones",
    2.0,
    [
      { left: "fist", offset: { x: -0.05, y: 0 } },
      { left: "fist", offset: { x: 0.05, y: 0 } },
      { left: "fist", offset: { x: 0, y: 0 } }
    ]
  ),
  createSign(
    "colombia",
    "Colombia",
    "Mano forma C y describe círculo",
    "lugares",
    1.5,
    [
      { left: null, right: "cShape" },
      { left: null, right: "cShape", offset: { x: 0.05, y: 0 } },
      { left: null, right: "cShape", offset: { x: 0, y: 0 } }
    ]
  ),
  createSign(
    "casa",
    "Casa",
    "Ambas manos planas forman techo",
    "lugares",
    1.0,
    [
      { left: "flat", right: "flat", offset: { x: 0, y: 0 } },
      { left: "flat", right: "flat", offset: { x: 0, y: 0 } }
    ]
  ),
  createSign(
    "agua",
    "Agua",
    "Letra W con movimiento ondulante",
    "naturaleza",
    1.2,
    [
      { left: null, right: "open" },
      { left: null, right: "point", offset: { x: 0, y: -0.03 } },
      { left: null, right: "open", offset: { x: 0, y: 0 } }
    ]
  ),
  createSign(
    "comer",
    "Comer",
    "Mano a boca repetidamente, como llevando alimento",
    "verbos",
    1.5,
    [
      { left: null, right: "pinch", offset: { x: 0, y: 0.15 } },
      { left: null, right: "pinch", offset: { x: 0, y: 0.25 } },
      { left: null, right: "pinch", offset: { x: 0, y: 0.15 } },
      { left: null, right: "pinch", offset: { x: 0, y: 0.25 } }
    ]
  ),
  createSign(
    "beber",
    "Beber",
    "Mano forma vaso, se lleva a la boca",
    "verbos",
    1.0,
    [
      { left: null, right: "cShape", offset: { x: 0, y: 0 } },
      { left: null, right: "cShape", offset: { x: 0, y: 0.15 } }
    ]
  ),
  createSign(
    "caminar",
    "Caminar",
    "Dedos índices extendidos alternan pasos",
    "verbos",
    1.5,
    [
      { left: "point", right: "point" },
      { left: "point", right: "point", offset: { x: 0, y: -0.05 } },
      { left: "point", right: "point", offset: { x: 0, y: 0 } }
    ]
  ),
  createSign(
    "hablar",
    "Hablar",
    "Dedos frente a la boca abriéndose y cerrándose",
    "verbos",
    1.2,
    [
      { left: null, right: "open", offset: { x: 0, y: 0.1 } },
      { left: null, right: "fist", offset: { x: 0, y: 0.1 } },
      { left: null, right: "open", offset: { x: 0, y: 0.1 } },
      { left: null, right: "fist", offset: { x: 0, y: 0.1 } }
    ]
  ),
  createSign(
    "yo",
    "Yo",
    "Índice apuntando al pecho",
    "pronombres",
    0.5,
    [
      { left: null, right: "point", offset: { x: 0, y: 0.05 } }
    ]
  ),
  createSign(
    "tu",
    "Tú",
    "Índice apuntando hacia la otra persona",
    "pronombres",
    0.5,
    [
      { left: null, right: "point", offset: { x: 0.05, y: 0 } }
    ]
  ),
  createSign(
    "nosotros",
    "Nosotros",
    "Ambas manos con índice y medio extendidos",
    "pronombres",
    0.8,
    [
      { left: "point", right: "point" },
      { left: "point", right: "point", offset: { x: 0, y: -0.02 } }
    ]
  )
];
