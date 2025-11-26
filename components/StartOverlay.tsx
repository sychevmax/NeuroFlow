import React from 'react';
import { useTone } from '../context/ToneContext';
import { Play } from 'lucide-react';

export const StartOverlay: React.FC = () => {
  const { isAudioReady, initializeAudio } = useTone();

  if (isAudioReady) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm transition-opacity duration-500">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
          NeuroFlow
        </h1>
        <p className="text-slate-300 mb-8 text-lg">
          Cognitive audio synthesis for deep work and regulation.
        </p>
        <button
          onClick={initializeAudio}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900"
        >
          <Play className="w-6 h-6 mr-2 fill-current" />
          Enter Focus State
          <div className="absolute inset-0 rounded-full ring-4 ring-white/20 group-hover:ring-white/30 animate-pulse"></div>
        </button>
        <p className="mt-6 text-sm text-slate-500">
          Click to initialize the audio engine. <br/>
          Headphones recommended.
        </p>
      </div>
    </div>
  );
};