export type MusicVariantType = "musicContinuation" | "musicToMusic" | "textToMusic" | "unconditioned";
export type AudioGenModelType = "large" | "medium" | "melody" | "small";

export interface MusicElementType {
  type: "music";
  variant: MusicVariantType;
  audio_length: number;
  audio_path: string;
  prompt: string;
  model: AudioGenModelType;
}

export type ImageVariantType = "img2img" | "inpainting" | "txt2img";

export interface ImageElementType {
  type: "image";
  variant: ImageVariantType;
  model: string;
  prompt: string;
  negative_prompt: string;
  steps: number;
}

export interface ImageXLElementType {
  type: "imagexl";
  variant: ImageVariantType;
  model: string;
  prompt: string;
  negative_prompt: string;
  steps: number;
}

export type QueueElementType = ImageElementType | ImageXLElementType | MusicElementType;

export type QueueType = QueueElementType[];
