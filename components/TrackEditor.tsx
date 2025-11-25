import React, { useRef, useEffect, useState } from 'react';
import { drawWaveform } from '../services/audioUtils';

interface TrackEditorProps {
  onAudioLoaded: (buffer: AudioBuffer) => void;
  onSeparateStems: () => void;
  isSeparating: boolean;
}

const TrackEditor: React.FC<TrackEditorProps> = ({ onAudioLoaded, onSeparateStems, isSeparating }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [trimRange, setTrimRange] = useState<{ start: number; end: number }>({ start: 0, end: 1 });
  const [fileName, setFileName] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (audioBuffer && canvasRef.current) {
      // Use blue/white Splice-ish color
      drawWaveform(canvasRef.current, audioBuffer, '#e5e7eb', trimRange.start, trimRange.end);
    }
  }, [audioBuffer, trimRange]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
    setAudioBuffer(buffer);
    onAudioLoaded(buffer); 
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const val = parseFloat(e.target.value);
    setTrimRange(prev => {
      if (type === 'start' && val < prev.end) return { ...prev, start: val };
      if (type === 'end' && val > prev.start) return { ...prev, end: val };
      return prev;
    });
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#1a1a1a] to-[#161616] border border-[#333] rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
             <h2 className="text-2xl font-bold text-white mb-1">Source Audio</h2>
             <p className="text-gray-500 text-sm">Upload a master track to begin processing.</p>
          </div>
          
          <div className="flex gap-3">
             <input 
               type="file" 
               accept="audio/*" 
               onChange={handleFileUpload} 
               ref={fileInputRef}
               className="hidden"
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
             >
               {fileName ? 'Replace File' : 'Upload File'}
             </button>
             {audioBuffer && (
               <button 
                 onClick={onSeparateStems}
                 disabled={isSeparating}
                 className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                 {isSeparating ? 'Processing...' : 'Separate Stems'}
               </button>
             )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative w-full h-40 bg-[#0e0e0e] rounded-lg border border-[#222] overflow-hidden mb-4 group">
          {!audioBuffer ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 cursor-pointer hover:bg-[#111] transition-colors"
             >
               <svg className="mb-2" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
               <span className="text-sm font-medium">Click to upload audio</span>
             </div>
          ) : (
            <>
              <canvas 
                ref={canvasRef} 
                width={1000} 
                height={160} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-xs font-mono text-gray-500 bg-black/50 px-2 rounded">
                 {fileName}
              </div>
            </>
          )}
        </div>

        {/* Trimmers */}
        {audioBuffer && (
          <div className="grid grid-cols-2 gap-8 px-1">
             <div className="flex flex-col gap-1">
               <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Start Point</label>
               <input 
                 type="range" 
                 min="0" 
                 max="1" 
                 step="0.001" 
                 value={trimRange.start} 
                 onChange={(e) => handleRangeChange(e, 'start')}
                 className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-sm"
               />
             </div>
             <div className="flex flex-col gap-1">
               <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-right">End Point</label>
               <input 
                 type="range" 
                 min="0" 
                 max="1" 
                 step="0.001" 
                 value={trimRange.end} 
                 onChange={(e) => handleRangeChange(e, 'end')}
                 className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-sm"
               />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackEditor;