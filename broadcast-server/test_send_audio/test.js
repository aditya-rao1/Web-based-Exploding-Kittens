const ws = new WebSocket("ws://localhost:8000/connect");
ws.binaryType = "arraybuffer";   // ⬅️ IMPORTANT

const audioContext = new AudioContext();
let queue = [];

ws.onmessage = async (event) => {
  queue.push(event.data);

  // decode & play when we have data
  const buffer = await event.data.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(buffer);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};
