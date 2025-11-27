export interface PresetData {
  genre?: string;
  camera?: string;
  lens?: string;
  focal?: number;
  aperture?: string;
  shutter?: string;
  iso?: string;
  lighting?: string;
  composition?: string;
  film?: string;
  wb?: string;
  grain?: string;
  lensChar?: string;
  productSubgenre?: string;
  lightingSetups?: string[];
  vibe?: string;
}

export interface Preset {
  id: string;
  title: string;
  desc: string;
  category: string;
  data: PresetData;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "21:9";

export interface FormState {
  scene: string;
  location: string;
  datetime: string;
  genre: string;
  composition: string;
  productSubgenre: string;
  camera: string;
  lens: string;
  lockCamera: boolean;
  lockLens: boolean;
  lockLighting: boolean;
  focal: number;
  aperture: string;
  shutter: string;
  iso: string;
  film: string;
  wb: string;
  grain: string;
  lensChar: string;
  lighting: string;
  activeLightingSetups: Set<string>;
  activeAR: AspectRatio;
  photographerStyle: string;
  vibe: string;
}

export interface OutputState {
  main: string;
  cine: string;
  grit: string;
  prod: string;
}

export type ModelType = 'midjourney' | 'flux' | 'dalle';
