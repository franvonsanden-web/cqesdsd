import React, { useState, useRef } from 'react';
import TrackEditor from './components/TrackEditor';
import StemPanel from './components/StemPanel';
import TransformerBox from './components/TransformerBox';
import { Stem } from './types';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  const [masterBuffer, setMasterBuffer] = useState<AudioBuffer | null>(null);
  const [stems, setStems] = useState<Stem[]>([]);
  const [isSeparating, setIsSeparating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<AudioBuffer | null>(null);
  const [isPlayingResult, setIsPlayingResult] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Mock separation process
  const handleSeparateStems = async () => {
    if (!masterBuffer) return;
    setIsSeparating(true);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create dummy stems with different "types" for the UI
    const newStems: Stem[] = [
      { id: '1', name: 'Drums_Main_Loop_120bpm.wav', type: 'drums', color: '#3b82f6', audioBuffer: masterBuffer },
      { id: '2', name: 'Bass_Sub_Fmin.wav', type: 'bass', color: '#8b5cf6', audioBuffer: masterBuffer },
      { id: '3', name: 'Vocals_Dry_Lead.wav', type: 'vocals', color: '#ec4899', audioBuffer: masterBuffer },
      { id: '4', name: 'Atmosphere_Synth_Pad.wav', type: 'other', color: '#10b981', audioBuffer: masterBuffer },
    ];
    
    setStems(newStems);
    setIsSeparating(false);
  };

  const handlePlayResult = () => {
    if (!generatedAudio) return;
    
    if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
      setIsPlayingResult(false);
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = generatedAudio;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlayingResult(false);
    source.start();
    sourceNodeRef.current = source;
    setIsPlayingResult(true);
  };

  return (
    <div className="flex h-screen bg-[#121212] text-gray-300 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e0e0e] flex flex-col border-r border-[#222]">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
            SonicForge
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Library</h3>
            <ul className="space-y-1">
              <li className="px-2 py-2 text-white bg-[#222] rounded cursor-pointer font-medium text-sm">Sounds</li>
              <li className="px-2 py-2 hover:text-white hover:bg-[#1a1a1a] rounded cursor-pointer text-sm transition-colors">Presets</li>
              <li className="px-2 py-2 hover:text-white hover:bg-[#1a1a1a] rounded cursor-pointer text-sm transition-colors">Packs</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Collections</h3>
            <ul className="space-y-1">
              <li className="px-2 py-2 hover:text-white hover:bg-[#1a1a1a] rounded cursor-pointer text-sm transition-colors flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-pink-500"></span> Likes
              </li>
              <li className="px-2 py-2 hover:text-white hover:bg-[#1a1a1a] rounded cursor-pointer text-sm transition-colors flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500"></span> Daily Picks
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-[#222]">
           <div className="text-xs text-gray-600">
             289 credits available
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#121212]">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#222]">
           <div className="flex-1 max-w-xl">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search sounds, packs, and presets..." 
                  className="w-full bg-[#1e1e1e] border border-transparent focus:border-blue-600 rounded-full py-1.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
                <svg className="absolute right-3 top-2 text-gray-500" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
             </div>
           </div>
           <div className="flex items-center gap-4 ml-4">
              <button className="text-sm font-medium hover:text-white transition-colors">Upgrade</button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
           </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 scrollbar-hide">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Top Section: Upload & Editor */}
            <section>
              <TrackEditor 
                onAudioLoaded={setMasterBuffer}
                onSeparateStems={handleSeparateStems}
                isSeparating={isSeparating}
              />
            </section>

            {/* Split View: Stems List & Transformer */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Left Column: Stems (List View) */}
              <div className="xl:col-span-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Stems</h2>
                  <div className="flex gap-2">
                     {/* Fake Filters */}
                     <span className="px-3 py-1 bg-[#222] text-xs rounded-full cursor-pointer hover:bg-[#333]">Drums</span>
                     <span className="px-3 py-1 bg-[#222] text-xs rounded-full cursor-pointer hover:bg-[#333]">Vocals</span>
                     <span className="px-3 py-1 bg-[#222] text-xs rounded-full cursor-pointer hover:bg-[#333]">Bass</span>
                  </div>
                </div>
                
                {stems.length > 0 ? (
                   <StemPanel stems={stems} />
                ) : (
                   <div className="h-32 border border-dashed border-[#333] rounded-lg flex items-center justify-center text-gray-600 text-sm">
                      Processed stems will appear here
                   </div>
                )}
              </div>

              {/* Right Column: Transformer & Output */}
              <div className="xl:col-span-4 space-y-6">
                <TransformerBox onAudioGenerated={setGeneratedAudio} />
                
                {/* Output Mini-Player */}
                {generatedAudio && (
                  <div className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden">
                    <div className="p-3 border-b border-[#333] flex justify-between items-center bg-[#222]">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Result</span>
                      <button className="text-xs text-blue-400 hover:text-blue-300">Download</button>
                    </div>
                    <div className="h-32 relative">
                      <div className="absolute inset-0">
                        <Visualizer isPlaying={isPlayingResult} />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <button 
                          onClick={handlePlayResult}
                          className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform pointer-events-auto shadow-xl"
                        >
                           {isPlayingResult ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                           ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                           )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Player Bar (Persistent) */}
        <footer className="h-20 bg-[#0e0e0e] border-t border-[#222] flex items-center px-4 justify-between z-10">
           <div className="flex items-center gap-4 w-1/3">
              <div className="w-10 h-10 bg-[#222] rounded flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="gray" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
              <div>
                <div className="text-sm text-white font-medium">Ready to produce</div>
                <div className="text-xs text-gray-500">Select a sound to play</div>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 5 4 12 11 19 11 5"/><line x1="20" y1="5" x2="20" y2="19"/></svg></button>
              <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
              <button className="text-gray-400 hover:text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 5 20 12 13 19 13 5"/><line x1="4" y1="5" x2="4" y2="19"/></svg></button>
           </div>

           <div className="flex items-center gap-4 w-1/3 justify-end">
             <div className="flex items-center gap-2">
                <svg width="16" height="16" stroke="gray" fill="none" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
                <div className="w-24 h-1 bg-[#333] rounded-full overflow-hidden">
                   <div className="w-2/3 h-full bg-gray-400"></div>
                </div>
             </div>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default App;