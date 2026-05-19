export const playVoice = async (text: string, voice: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir' = 'Zephyr') => {
  try {
    const response = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) throw new Error('TTS request failed');

    const { audio } = await response.json();
    if (audio) {
      const audioBlob = b64toBlob(audio, 'audio/pcm');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Since it's raw PCM at 24000Hz (from Gemini TTS docs), we might need an AudioContext
      // However, usually returned base64 for TTS in browser is playable if it's in a package like WAV.
      // The skill says "sample rate 24000" for raw audio.
      // Wait, let's look at the skill again. 
      // "Return this base64 audio to the client for playback (sample rate 24000)"
      
      await playRawPCM(audio);
    }
  } catch (error) {
    console.error('Voice Service Error:', error);
  }
};

const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};

const playRawPCM = async (base64Audio: string) => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint16Array(len / 2);
  
  // Gemini TTS returns 16-bit PCM (little endian)
  const view = new DataView(new ArrayBuffer(len));
  for (let i = 0; i < len; i++) {
    view.setUint8(i, binaryString.charCodeAt(i));
  }
  
  const audioBuffer = audioCtx.createBuffer(1, len / 2, 24000);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < len / 2; i++) {
    // 16-bit signed PCM to float
    channelData[i] = view.getInt16(i * 2, true) / 32768.0;
  }
  
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
};
