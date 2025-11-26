export enum GeneratorType {
  ADHD = 'ADHD',
  NEUROTYPICAL = 'NEUROTYPICAL'
}

export enum NoiseColor {
  BROWN = 'brown',
  GREEN = 'green' // Custom implementation
}

export enum FocusMode {
  ISOCHRONIC = 'isochronic',
  LYDIAN = 'lydian'
}

export interface ToneContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  initializeAudio: () => Promise<void>;
  isAudioReady: boolean;
  volume: number;
  setVolume: (val: number) => void;
}