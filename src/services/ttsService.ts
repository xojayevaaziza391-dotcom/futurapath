import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const speakText = async (text: string, language: string = 'English') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this text in ${language}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioBlob = base64ToBlob(base64Audio, 'audio/pcm');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Since it's raw PCM at 24000Hz, we need to handle it correctly.
      // However, for simplicity in a web app, if the model returns a playable format (like WAV/MP3) 
      // we can use the Audio object. The guidelines say "decode and play audio with sample rate 24000".
      // Let's use the Web Audio API for PCM playback.
      playPcm(base64Audio, 24000);
    }
  } catch (error) {
    console.error('TTS Error:', error);
  }
};

const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

const playPcm = (base64Data: string, sampleRate: number) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // PCM 16-bit is 2 bytes per sample
  const buffer = new Int16Array(bytes.buffer);
  const float32Buffer = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    float32Buffer[i] = buffer[i] / 32768;
  }

  const audioBuffer = audioContext.createBuffer(1, float32Buffer.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Buffer);

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};
