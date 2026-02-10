import { WebSocket, WebSocketServer } from 'ws';

function isIndexPointing(landmarks) {
  const palm = landmarks[9];

  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const distIndex = distance(indexTip, palm);
  const distMiddle = distance(middleTip, palm);
  const distRing = distance(ringTip, palm);
  const distPinky = distance(pinkyTip, palm);

  return (
    distIndex > 0.12 && // indicador longe
    distMiddle < 0.09 &&
    distRing < 0.09 &&
    distPinky < 0.09
  );
}

function mapHandToJoints(landmarks) {
  const palm = landmarks[9];
  const wrist = landmarks[0];
  const middle = landmarks[12];

  const x = palm.x;
  const y = palm.y;
  const z = palm.z;

  // base gira conforme X
  const j1 = (x - 0.5) * 180;

  // sobe/desce conforme Y
  const j2 = (0.5 - y) * 120;

  // profundidade
  const j3 = z * 150;

  // inclinação da mão (vetor wrist -> middle)
  const dx = middle.x - wrist.x;
  const dy = middle.y - wrist.y;

  const j4 = dy * 180;
  const j5 = dx * 180;
  const j6 = 0;

  return { j1, j2, j3, j4, j5, j6 };
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function isFistClosed(landmarks) {
  const palm = landmarks[9];

  const tips = [
    landmarks[4], // thumb
    landmarks[8], // index
    landmarks[12], // middle
    landmarks[16], // ring
    landmarks[20], // pinky
  ];

  // se todas as pontas estiverem perto da palma
  return tips.every((tip) => distance(tip, palm) < 0.09);
}

const wss = new WebSocketServer({ port: 8080 });
const robotWss = new WebSocket('ws://localhost:9001');

robotWss.on('open', () => {
  console.log('🟢 Conectado ao microserviço Python do robô');
});

robotWss.on('error', (err) => {
  console.error('Erro conexão Python:', err.message);
});

wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  ws.on('message', (msg) => {
    const landmarks = JSON.parse(msg);

    if (isFistClosed(landmarks)) {
      console.log('para o robo');

      if (robotWss.readyState === WebSocket.OPEN) {
        robotWss.send(JSON.stringify({ action: 'stop' }));
      }
      return;
    }

    const joints = mapHandToJoints(landmarks);

    if (isIndexPointing(landmarks)) {
      if (robotWss.readyState === WebSocket.OPEN) {
        console.log(joints);
        robotWss.send(
          JSON.stringify({
            ...joints,
            action: 'move',
          }),
        );
      }
    }
  });
});
