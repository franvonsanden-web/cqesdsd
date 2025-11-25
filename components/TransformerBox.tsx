import React, { useState, useRef } from 'react';
import { Stem, MusicStyle } from '../types';
import { transformAudioContent } from '../services/geminiService';

interface TransformerBoxProps {
  onAudioGenerated: (buffer: AudioBuffer) => void;
}

const STYLES: MusicStyle[] = ['Lofi', 'Techno', 'Live Recorded', 'Orchestral', '8-Bit', 'Jazz'];

const TransformerBox: React.FC<TransformerBoxProps> = ({ onAudioGenerated }) => {
  const [droppedStem, setDroppedStem] = useState<Stem | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<MusicStyle[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-900/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-900/10');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-900/10');
    
    try {
      const stemData = e.dataTransfer.getData('application/json');
      if (stemData) {
        const stem = JSON.parse(stemData) as Stem;
        setDroppedStem(stem);
        setError(null);
      }
    } catch (err) {
      console.error("Drop failed", err);
    }
  };

  const toggleStyle = (style: MusicStyle) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style) 
        : [...prev, style]
    );
  };

  const handleTransform = async () => {
    if (!droppedStem) return;

    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
    }

    setIsProcessing(true);
    setError(null);

    try {
       // Using a dummy buffer for demo purposes since we can't transfer Buffer via drag/drop JSON
       let buffer = audioContextRef.current.createBuffer(1, 24000, 24000); 
       
       const result = await transformAudioContent(buffer, selectedStyles, audioContextRef.current);
       onAudioGenerated(result);
    } catch (e) {
      setError("Transformation failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#161616] border border-[#222] rounded-lg p-5 flex flex-col h-full">
       <div className="mb-4">
         <h2 className="text-lg font-bold text-white">Create</h2>
         <p className="text-xs text-gray-500">Transform stems into new styles</p>
       </div>

       {/* Drop Zone */}
       <div 
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
         className={`relative flex-grow border border-dashed rounded-lg transition-all flex flex-col items-center justify-center p-6 mb-4 min-h-[200px] ${
           droppedStem 
             ? 'border-blue-500 bg-[#1e293b]' 
             : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
         }`}
       >
         {droppedStem ? (
            <div className="text-center animate-fade-in">
               <div className="w-12 h-12 mx-auto bg-[#333] rounded-full flex items-center justify-center mb-2 border border-[#444] text-xl">
                 🎶
               </div>
               <p className="font-medium text-white text-sm">{droppedStem.name}</p>
               <span 
                 className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                 style={{ backgroundColor: `${droppedStem.color}33`, color: droppedStem.color }}
               >
                 {droppedStem.type}
               </span>
               <button 
                 onClick={(e) => { e.stopPropagation(); setDroppedStem(null); }}
                 className="absolute top-2 right-2 text-gray-500 hover:text-white"
               >
                 <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
               </button>
            </div>
         ) : (
           <div className="text-center text-gray-500 pointer-events-none">
             <div className="mb-2 mx-auto w-10 h-10 border border-gray-700 rounded-md flex items-center justify-center border-dashed">
                <svg width="20" height="20" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeWidth="2"/></svg>
             </div>
             <p className="text-sm">Drag stem here</p>
           </div>
         )}
       </div>

       {/* Style Selection */}
       <div className="space-y-3">
         <div className="flex flex-wrap gap-2">
           {STYLES.map(style => (
             <button 
               key={style}
               onClick={() => toggleStyle(style)}
               className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                 selectedStyles.includes(style)
                   ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                   : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500 hover:text-white'
               }`}
             >
               {style}
             </button>
           ))}
         </div>

         {error && <p className="text-red-500 text-xs">{error}</p>}

         <button
           onClick={handleTransform}
           disabled={!droppedStem || selectedStyles.length === 0 || isProcessing}
           className={`w-full py-3 rounded font-bold text-sm transition-all flex items-center justify-center gap-2 ${
             !droppedStem || selectedStyles.length === 0 || isProcessing
               ? 'bg-[#222] text-gray-600 cursor-not-allowed'
               : 'bg-white text-black hover:bg-gray-200'
           }`}
         >
           {isProcessing ? (
             <>
               <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
               Processing...
             </>
           ) : 'Generate'}
         </button>
       </div>
    </div>
  );
};

export default TransformerBox;