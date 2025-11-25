// Utility to decode base64 string
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert File/Blob to Base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data url prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Utility to decode raw PCM audio data into an AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Draw waveform on canvas (Splice Style: Vertical Bars)
export function drawWaveform(
  canvas: HTMLCanvasElement, 
  buffer: AudioBuffer, 
  color: string,
  startPercent: number = 0,
  endPercent: number = 1
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const data = buffer.getChannelData(0);
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Configuration for "Bar" look
  const barWidth = 2;
  const gap = 1;
  const totalBars = Math.floor(width / (barWidth + gap));
  const step = Math.floor(data.length / totalBars);
  
  for (let i = 0; i < totalBars; i++) {
    let max = 0;
    const startIndex = i * step;
    
    // Find max amplitude in this chunk
    for (let j = 0; j < step; j++) {
      const datum = Math.abs(data[startIndex + j] || 0);
      if (datum > max) max = datum;
    }
    
    // Draw Bar
    // Splice waveforms are centered vertically
    const barHeight = Math.max(2, max * height * 0.9); 
    const x = i * (barWidth + gap);
    const y = (height - barHeight) / 2;

    const progress = i / totalBars;
    
    // Determine color based on trim state
    if (progress < startPercent || progress > endPercent) {
      ctx.fillStyle = '#3f3f46'; // Dimmed (zinc-700)
    } else {
      ctx.fillStyle = color;
    }

    ctx.fillRect(x, y, barWidth, barHeight);
  }

  // Draw Trim Handles if active
  if (startPercent > 0 || endPercent < 1) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    
    if (startPercent > 0) {
      ctx.fillRect(0, 0, width * startPercent, height);
      // Handle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width * startPercent, 0, 2, height);
    }
    
    if (endPercent < 1) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(width * endPercent, 0, width * (1 - endPercent), height);
      // Handle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width * endPercent - 2, 0, 2, height);
    }
  }
}