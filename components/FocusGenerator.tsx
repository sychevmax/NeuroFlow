import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useTone } from '../context/ToneContext';
import { FocusMode } from '../types';
import { Music, Activity } from 'lucide-react';

const FocusGenerator: React.FC = () => {
  const { isPlaying, isAudioReady } = useTone();
  
  const [mode, setMode] = useState<FocusMode>(FocusMode.ISOCHRONIC);
  const [parameter, setParameter] = useState<number>(0.5); // 0-1 mapped to specific controls

  // Clean references for audio nodes
  const nodes = useRef<{
    osc?: Tone.Oscillator;
    lfo?: Tone.LFO;
    synth?: Tone.PolySynth;
    pattern?: Tone.Pattern<string>;
    gain?: Tone.Gain;
    effectChain?: Tone.ToneAudioNode[];
  }>({});

  useEffect(() => {
    if (!isAudioReady) return;

    // Master gain for this component to handle fade in/out
    const masterGain = new Tone.Gain(0).toDestination();
    nodes.current.gain = masterGain;

    if (mode === FocusMode.ISOCHRONIC) {
      // === ISOCHRONIC TONES ===
      // Theory: Entrainment. Brainwaves synchronize to external pulses.
      // Beta range (12-30Hz) promotes alert concentration.
      
      // Carrier: A consistent low-mid sine wave (200Hz is pleasant/neutral)
      const osc = new Tone.Oscillator(200, "sine");
      // Boost osc slightly
      osc.volume.value = -2;
      
      // Modulator: Square wave LFO to create sharp "pulses" (on/off)
      // We map parameter (0-1) to 12Hz - 30Hz
      const freq = 12 + (parameter * 18);
      const lfo = new Tone.LFO(freq, 0, 1); // Output 0 to 1
      lfo.type = "square"; // Strict on/off for pulses

      // Create a gain node that will be modulated by the LFO
      const pulseGain = new Tone.Gain(0); 
      
      osc.connect(pulseGain);
      pulseGain.connect(masterGain);
      
      // LFO controls the GAIN of the pulseGain node (Amplitude Modulation)
      lfo.connect(pulseGain.gain);

      osc.start();
      lfo.start();

      nodes.current.osc = osc;
      nodes.current.lfo = lfo;

    } else {
      // === LYDIAN FLOW ===
      // Theory: Generative ambient music.
      // Lydian Mode (Major #4): Creates a sense of "resolve" without being boring.
      // "Floating" feeling reduces anxiety while maintaining arousal.
      
      const reverb = new Tone.Reverb({ decay: 10, wet: 0.4 }).toDestination();
      const delay = new Tone.PingPongDelay("8n.", 0.2).connect(reverb);
      masterGain.connect(delay);

      // PolySynth for texture
      const synth = new Tone.PolySynth(Tone.FMSynth, {
        envelope: { attack: 0.5, decay: 0.2, sustain: 0.8, release: 2 }
      });
      synth.volume.value = -6; // Boosted from -8
      synth.connect(masterGain);

      // C Lydian Notes: C, D, E, F#, G, A, B
      // Floating across 4th octave
      const scale = ["C4", "D4", "E4", "F#4", "G4", "A4", "B4", "C5"];
      
      // Pattern: Random Walk prevents predictability (habituation)
      const pattern = new Tone.Pattern((time, note) => {
        synth.triggerAttackRelease(note, "2n", time);
      }, scale, "randomWalk");
      
      pattern.interval = "2n"; 
      pattern.start(0);

      nodes.current.synth = synth;
      nodes.current.pattern = pattern;
      nodes.current.effectChain = [reverb, delay];
    }

    // Handle initial volume based on playing state
    if (isPlaying) {
      masterGain.gain.rampTo(1, 0.5);
    }

    return () => {
      // Cleanup all created nodes
      nodes.current.osc?.dispose();
      nodes.current.lfo?.dispose();
      nodes.current.synth?.dispose();
      nodes.current.pattern?.dispose();
      nodes.current.gain?.dispose();
      nodes.current.effectChain?.forEach(n => n.dispose());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioReady, mode]); // Re-run when Mode changes

  // Update Parameters in real-time
  useEffect(() => {
    if (mode === FocusMode.ISOCHRONIC && nodes.current.lfo) {
      // Update Pulse Frequency (12Hz - 30Hz)
      const freq = 12 + (parameter * 18);
      nodes.current.lfo.frequency.rampTo(freq, 0.1);
    } else if (mode === FocusMode.LYDIAN && nodes.current.synth) {
      // Update Synth Brightness/Modulation Index based on parameter
      // parameter 0 -> mellow, 1 -> brighter
      nodes.current.synth.set({
        modulationIndex: 1 + (parameter * 10)
      });
    }
  }, [parameter, mode]);

  // Handle Play/Pause for the internal MasterGain
  useEffect(() => {
    if (nodes.current.gain) {
      if (isPlaying) {
        nodes.current.gain.gain.rampTo(1, 0.5);
      } else {
        nodes.current.gain.gain.rampTo(0, 0.2);
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Icon Area */}
      <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 ${
        isPlaying ? 'scale-110 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'scale-100 opacity-50'
      } ${mode === FocusMode.ISOCHRONIC ? 'bg-blue-900/30' : 'bg-indigo-900/30'}`}>
        {mode === FocusMode.ISOCHRONIC ? (
          <Activity className={`w-16 h-16 text-blue-400 ${isPlaying ? 'animate-pulse' : ''}`} />
        ) : (
          <Music className={`w-16 h-16 text-indigo-400 ${isPlaying ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
        )}
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-slate-100">
          {mode === FocusMode.ISOCHRONIC ? 'Isochronic Entrainment' : 'Lydian Flow State'}
        </h2>
        <p className="text-slate-400 max-w-md">
          {mode === FocusMode.ISOCHRONIC 
            ? "Pulsed tones in the Beta range (12-30Hz) encourage alert concentration via frequency following response."
            : "Generative melodies in the Lydian mode (raised 4th) induce a 'flow state' by balancing relaxation and arousal."}
        </p>
      </div>

      {/* Controls */}
      <div className="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setMode(FocusMode.ISOCHRONIC)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === FocusMode.ISOCHRONIC 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Pulse
          </button>
          <button
            onClick={() => setMode(FocusMode.LYDIAN)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === FocusMode.LYDIAN 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            Flow
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-400 font-medium">
            <span>{mode === FocusMode.ISOCHRONIC ? '12Hz (Relaxed)' : 'Mellow'}</span>
            <span>{mode === FocusMode.ISOCHRONIC ? 'BETA FREQUENCY' : 'TIMBRE'}</span>
            <span>{mode === FocusMode.ISOCHRONIC ? '30Hz (Alert)' : 'Bright'}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={parameter}
            onChange={(e) => setParameter(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default FocusGenerator;