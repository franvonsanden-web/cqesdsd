import { GoogleGenAI, Modality } from "@google/genai";
import { decodeBase64, decodeAudioData, blobToBase64 } from "./audioUtils";

const API_KEY = process.env.API_KEY || '';

// Initialize client
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Transforms an audio stem based on selected styles using Gemini.
 * Uses the audio input capabilities of the model.
 */
export const transformAudioContent = async (
  audioBuffer: AudioBuffer,
  styles: string[],
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  if (!API_KEY) throw new Error("API Key is missing");

  try {
    // 1. Convert AudioBuffer back to a Blob/Base64 for upload
    // In a real scenario, we might use the original Blob. 
    // Here we assume we have a way to get the data, or we just resample the buffer.
    // For this demo, we'll create a WAV or simple buffer representation.
    // simplified: We will re-encode the buffer to a simple mono WAV/PCM format for sending.
    
    const wavBlob = await audioBufferToWavBlob(audioBuffer);
    const base64Audio = await blobToBase64(wavBlob);

    const prompt = `Transform this audio track. 
    Apply the following styles/effects strictly: ${styles.join(', ')}. 
    Maintain the original rhythm but change the instrumentation and texture.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "audio/wav",
                data: base64Audio
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: [Modality.AUDIO],
      },
    });

    const responseBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!responseBase64) {
      throw new Error("No audio data received from Gemini.");
    }

    const rawBytes = decodeBase64(responseBase64);
    // Decode PCM data (typically 24kHz from this model)
    const resultBuffer = await decodeAudioData(rawBytes, audioContext, 24000, 1);
    
    return resultBuffer;
  } catch (error) {
    console.error("Error transforming audio:", error);
    throw error;
  }
};

// Helper: Quick WAV encoder for the buffer (simplified for demo)
async function audioBufferToWavBlob(buffer: AudioBuffer): Promise<Blob> {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this demo)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for(i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while(pos < buffer.length) {
    for(i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
      view.setInt16(44 + offset, sample, true);          // write 16-bit sample
      offset += 2;
    }
    pos++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}
