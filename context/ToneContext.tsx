import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { ToneContextType } from '../types';

const ToneContext = createContext<ToneContextType | undefined>(undefined);

export const ToneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [volume, setVolumeState] = useState(-10); // dB

  // Ref to track if we've already set up the initial volume listener
  const isSetupRef = useRef(false);

  const initializeAudio = async () => {
    if (isAudioReady) return;
    try {
      await Tone.start();
      Tone.Destination.volume.value = volume;
      
      // Auto-start transport on initialization for immediate feedback
      // This is critical: without starting Transport, generators relying on isPlaying/Transport state will stay silent.
      Tone.Transport.start();
      setIsPlaying(true);
      
      setIsAudioReady(true);
      console.log('Audio Context Started');
    } catch (e) {
      console.error('Failed to start audio context', e);
    }
  };

  const togglePlay = () => {
    if (!isAudioReady) return;
    
    if (Tone.Transport.state === 'started') {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (isAudioReady) {
      // Ramp to volume to prevent clicks
      Tone.Destination.volume.rampTo(val, 0.1);
    }
  };

  // Sync React state with Tone Transport state (in case of external stops)
  useEffect(() => {
    // Removed incorrect Limiter chaining that caused feedback loop/silence.
    // Tone.js handles output limiting reasonably well by default, 
    // and Tone.Destination is the final node, not a bus to be chained FROM.

    const checkState = () => {
      // Sync local state with actual Transport state
      setIsPlaying(Tone.Transport.state === 'started');
    };
    
    // Check periodically
    const interval = setInterval(checkState, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <ToneContext.Provider value={{ 
      isPlaying, 
      togglePlay, 
      initializeAudio, 
      isAudioReady, 
      volume, 
      setVolume 
    }}>
      {children}
    </ToneContext.Provider>
  );
};

export const useTone = () => {
  const context = useContext(ToneContext);
  if (context === undefined) {
    throw new Error('useTone must be used within a ToneProvider');
  }
  return context;
};