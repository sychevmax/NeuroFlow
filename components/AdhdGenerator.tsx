import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useTone } from '../context/ToneContext';
import { NoiseColor } from '../types';
import { Zap, Activity } from 'lucide-react';

const AdhdGenerator: React.FC = () => {
  const { isPlaying, isAudioReady } = useTone();
  
  // UI State
  const [color, setColor] = useState<NoiseColor>(NoiseColor.BROWN);
  // Intensity maps to filter cutoff frequency
  const [intensity, setIntensity] = useState<number>(0.5); // 0 to 1

  // Audio Nodes Refs
  const noiseNode = useRef<Tone.Noise | null>(null);
  const filterNode = useRef<Tone.Filter | null>(null);
  const gainNode = useRef<Tone.Gain | null>(null);

  // Setup Audio Graph
  useEffect(() => {
    if (!isAudioReady) return;

    // 1. Create Nodes
    // We use a gain node to control overall output of this generator
    const gain = new Tone.Gain(0).toDestination();
    const filter = new Tone.Filter();
    
    // Logic: Initialize based on current state
    if (color === NoiseColor.BROWN) {
      // Brown Noise: 1/f^2 spectral density. Deep, rumbling. 
      // Good for grounding hyperactivity (Stochastic Resonance).
      const noise = new Tone.Noise("brown");
      
      // Filter Logic: Lowpass to control the "rumble" vs "hiss"
      filter.type = "lowpass";
      filter.frequency.value = 200 + (intensity * 1800); // 200Hz to 2000Hz
      filter.Q.value = 1;

      noise.connect(filter);
      filter.connect(gain);
      noise.start(); // Noise sources need to be started, but we gate via Gain
      noiseNode.current = noise;
    } else {
      // Green Noise: Mid-range focused. 
      // Theoretically the "background of nature".
      // Implementation: White noise filtered around 500Hz.
      const noise = new Tone.Noise("white"); // Base for sculpting
      
      // Filter Logic: Bandpass centered at 500Hz
      // Q=0.7 is a wide enough bandwidth to sound natural, not resonant/whistling
      filter.type = "bandpass";
      filter.frequency.value = 500; 
      filter.Q.value = 0.7; 
      
      // We adjust the gain up significantly for Green because bandpass cuts a lot of energy
      noise.volume.value = 12; // Boosted from 8 to 12

      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      noiseNode.current = noise;
    }

    filterNode.current = filter;
    gainNode.current = gain;

    // Fade in if playing
    if (isPlaying) {
      gain.gain.rampTo(0.8, 0.5);
    } else {
      gain.gain.value = 0;
    }

    // Cleanup
    return () => {
      gain.dispose();
      filter.dispose();
      noiseNode.current?.dispose();
    };
  // We deliberately re-create the graph when color changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioReady, color]); 

  // Handle Play/Pause changes without destroying graph
  useEffect(() => {
    if (!gainNode.current) return;
    if (isPlaying) {
      gainNode.current.gain.rampTo(0.8, 0.1);
    } else {
      gainNode.current.gain.rampTo(0, 0.1);
    }
  }, [isPlaying]);

  // Handle Intensity/Slider changes
  useEffect(() => {
    if (!filterNode.current) return;
    
    if (color === NoiseColor.BROWN) {
      // Brown noise intensity = letting more high freq through (clarity)
      // Range: 100Hz (deep rumble) -> 1500Hz (noisy waterfall)
      const freq = 100 + (intensity * 1400);
      filterNode.current.frequency.rampTo(freq, 0.1);
    } else {
      // Green noise intensity = widening the band (lowering Q) or shifting center?
      // Let's make it shift center slightly to let user find "sweet spot"
      // Range: 300Hz - 700Hz (around the 500Hz ideal)
      const freq = 300 + (intensity * 400);
      filterNode.current.frequency.rampTo(freq, 0.1);
    }
  }, [intensity, color]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Visualizer / Icon Area */}
      <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 ${
        isPlaying ? 'scale-110 shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'scale-100 opacity-50'
      } ${color === NoiseColor.BROWN ? 'bg-amber-900/30' : 'bg-emerald-900/30'}`}>
        {color === NoiseColor.BROWN ? (
          <Activity className={`w-16 h-16 text-amber-500 ${isPlaying ? 'animate-pulse' : ''}`} />
        ) : (
          <Zap className={`w-16 h-16 text-emerald-500 ${isPlaying ? 'animate-pulse' : ''}`} />
        )}
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-slate-100">
          {color === NoiseColor.BROWN ? 'Stochastic Resonance' : 'Nature Masking'}
        </h2>
        <p className="text-slate-400 max-w-md">
          {color === NoiseColor.BROWN 
            ? "Broadband 'Brown' noise boosts dopamine via stochastic resonance. Good for grounding hyperactivity."
            : "Mid-range 'Green' noise (500Hz) masks speech frequencies to reduce social distractibility."}
        </p>
      </div>

      {/* Controls */}
      <div className="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
        {/* Toggle */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setColor(NoiseColor.BROWN)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              color === NoiseColor.BROWN 
                ? 'bg-amber-700 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Brown Noise
          </button>
          <button
            onClick={() => setColor(NoiseColor.GREEN)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              color === NoiseColor.GREEN 
                ? 'bg-emerald-700 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Green Noise
          </button>
        </div>

        {/* Slider */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-400 font-medium">
            <span>{color === NoiseColor.BROWN ? 'Deep Rumble' : 'Lower Focus'}</span>
            <span>INTENSITY</span>
            <span>{color === NoiseColor.BROWN ? 'Bright Waterfall' : 'Higher Focus'}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default AdhdGenerator;