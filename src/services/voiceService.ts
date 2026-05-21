export const playVoice = async (text: string, voice: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir' = 'Zephyr') => {
  try {
    const response = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
      throw new Error(`TTS server HTTP error ${response.status}`);
    }

    const { audio, message } = await response.json();
    if (audio) {
      await playRawPCM(audio);
    } else {
      console.warn('Gemini TTS returned no audio, using Web Speech API fallback:', message || 'No message provided');
      playWebSpeechFallback(text);
    }
  } catch (error) {
    console.warn('Gemini TTS failed, falling back to Web Speech API:', error);
    playWebSpeechFallback(text);
  }
};

const playWebSpeechFallback = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      // Cancel any ongoing speaking to avoid overlapping delays
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      
      // Select standard English voices if available for a clean presentation
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(v => v.lang.startsWith('en') && (
          v.name.toLowerCase().includes('google') || 
          v.name.toLowerCase().includes('natural') || 
          v.name.toLowerCase().includes('premium')
        )) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Web Speech Fallback failed:', e);
    }
  } else {
    console.warn('Web Speech Synthesis is not supported in this browser.');
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
