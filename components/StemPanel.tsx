import React, { useEffect, useRef } from 'react';
import { Stem } from '../types';
import { drawWaveform } from '../services/audioUtils';

interface StemPanelProps {
  stems: Stem[];
}

const StemRow: React.FC<{ stem: Stem }> = ({ stem }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    const transferData = JSON.stringify({
        id: stem.id,
        name: stem.name,
        type: stem.type,
        color: stem.color
    });
    e.dataTransfer.setData('application/json', transferData);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Visual drag feedback
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
      const el = e.currentTarget as HTMLElement;
      el.style.opacity = '1';
  }

  useEffect(() => {
    if (canvasRef.current && stem.audioBuffer) {
      // Draw simplified waveform for list view
      drawWaveform(canvasRef.current, stem.audioBuffer, stem.color, 0, 1);
    }
  }, [stem]);

  // Generate fake metadata based on stem type for the "Splice" look
  const bpm = 120 + Math.floor(Math.random() * 10);
  const key = ['Am', 'C', 'F#', 'Gm'][Math.floor(Math.random() * 4)];
  const duration = stem.audioBuffer.duration.toFixed(1);

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="group flex items-center h-16 border-b border-[#222] hover:bg-[#1f1f1f] transition-colors cursor-grab active:cursor-grabbing px-2"
    >
      {/* Checkbox */}
      <div className="w-8 flex justify-center">
         <div className="w-4 h-4 border border-gray-600 rounded flex items-center justify-center group-hover:border-gray-400">
         </div>
      </div>
      
      {/* Icon */}
      <div className="w-10 flex justify-center text-gray-500 group-hover:text-white">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
      </div>

      {/* Name & Waveform Combined Area */}
      <div className="flex-1 grid grid-cols-12 gap-4 items-center px-4">
        {/* Name */}
        <div className="col-span-4 min-w-0">
          <div className="text-sm font-medium text-gray-200 truncate">{stem.name}</div>
          <div className="flex gap-2 mt-1">
             <span 
                className="text-[10px] px-1.5 py-0.5 rounded bg-opacity-20 uppercase font-bold tracking-wider"
                style={{ backgroundColor: `${stem.color}33`, color: stem.color }}
             >
                {stem.type}
             </span>
             <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider border border-[#333] px-1.5 py-0.5 rounded">Loop</span>
          </div>
        </div>

        {/* Waveform */}
        <div className="col-span-6 h-10 flex items-center">
           <canvas 
             ref={canvasRef} 
             width={300} 
             height={40} 
             className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
           />
        </div>
        
        {/* Metadata */}
        <div className="col-span-2 flex justify-end gap-4 text-xs font-mono text-gray-500">
           <span>{duration}s</span>
           <span className="text-gray-400">{key}</span>
           <span>{bpm}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-12 flex justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-gray-400 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>
    </div>
  );
};

const StemPanel: React.FC<StemPanelProps> = ({ stems }) => {
  return (
    <div className="bg-[#161616] border border-[#222] rounded-lg overflow-hidden">
       {/* Table Header */}
       <div className="flex items-center h-10 bg-[#1a1a1a] border-b border-[#222] px-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
         <div className="w-8"></div>
         <div className="w-10 text-center">Play</div>
         <div className="flex-1 grid grid-cols-12 gap-4 px-4">
           <div className="col-span-4">Filename</div>
           <div className="col-span-6">Waveform</div>
           <div className="col-span-2 text-right">Info</div>
         </div>
         <div className="w-12"></div>
       </div>
       
       {/* List */}
       <div className="divide-y divide-[#222]">
          {stems.map((stem) => (
             <StemRow key={stem.id} stem={stem} />
          ))}
       </div>
    </div>
  );
};

export default StemPanel;