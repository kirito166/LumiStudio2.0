export type AspectRatioType = 'orig' | '3:2' | '4:3' | '1:1' | '16:9' | '9:16' | '21:9' | '5:4';

export type FitModeType = 'cover' | 'contain' | 'stretch';

export type FrameModeType = 'none' | 'dark' | 'light' | 'polaroid' | 'film_strip';

export type ProfileType = 'vibrant' | 'natural' | 'mono' | 'film' | 'cyber' | 'golden' | 'silver';

export type FlareColorType = 'warm' | 'ice' | 'neon' | 'emerald' | 'amber_gold';

export type CompositionGuideType = 'none' | 'thirds' | 'golden' | 'crosshair';

export interface StudioSettings {
  ratio: AspectRatioType;
  fitMode: FitModeType;
  frameMode: FrameModeType;
  guideMode: CompositionGuideType;
  zoom: number;       // 100 to 250%
  panX: number;       // -100 to 100
  panY: number;       // -100 to 100
  rotate: number;     // -45 to 45 degrees
  flipH: boolean;
  
  // Tone & Color
  bright: number;     // 50 to 150
  contrast: number;   // 50 to 200
  sat: number;        // 0 to 200
  temp: number;       // -100 to 100
  hue: number;        // -45 to 45
  blur: number;       // 0 to 10

  // Optics & Analog Feel
  flare: number;      // 0 to 100
  flareColor: FlareColorType;
  anamorphic: boolean; // horizontal lens streak
  vig: number;        // 0 to 100
  grain: number;      // 0 to 100
  grainSize: number;  // 1 to 3
}

export interface FlarePosition {
  x: number;
  y: number;
}

export interface SampleImage {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string; // data URI or generated procedural canvas
  defaultAspect: AspectRatioType;
}

export interface HistogramData {
  r: number[];
  g: number[];
  b: number[];
  lum: number[];
}
