import React from 'react';
import { useTone } from '../context/ToneContext';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const ControlBar: React.FC = () => {
  const { isPlaying, togglePlay, volume, setVolume, isAudioReady } = useTone();

  if (!isAudioReady) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-4 pb-6 sm:pb-4 z-40">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>

        {/* Volume Control */}
        <div className="flex items-center flex-1 gap-3">
          <button 
            onClick={() => setVolume(volume <= -60 ? -10 : -Infinity)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {volume <= -60 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <input
            type="range"
            min="-60"
            max="0"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-slate-300 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
};

export default ControlBar;