export type MusicVariantType = "musicContinuation" | "musicToMusic" | "textToMusic" | "unconditioned";

export interface MusicElementType {
  type: "music";
  variant: MusicVariantType;
  audio_length: number;
  audio_path: string;
  prompt: string;
}

export type ImageVariantType = "txt2img";

export interface ImageElementType {
  type: "image";
  variant: ImageVariantType;
  model: string;
  prompt: string;
  steps: number;
}

export type QueueElementType = ImageElementType | MusicElementType;

export type QueueType = QueueElementType[];
