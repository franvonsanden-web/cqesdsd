export interface AudioState {
  buffer: AudioBuffer | null;
  blob: Blob | null;
  name: string;
}

export interface Stem {
  id: string;
  name: string;
  type: 'drums' | 'bass' | 'vocals' | 'other';
  color: string;
  audioBuffer: AudioBuffer; // In a real app, this would be the separated buffer
}

export type MusicStyle = 'Lofi' | 'Techno' | 'Live Recorded' | 'Orchestral' | '8-Bit' | 'Jazz';

export interface TransformationState {
  isGenerating: boolean;
  resultBuffer: AudioBuffer | null;
  error: string | null;
}
