export type MusicVariantType = "musicContinuation" | "musicToMusic" | "textToMusic" | "unconditioned";

export interface MusicElementType {
  type: "music";
  variant: MusicVariantType;
  audio_length: number;
  audio_path: string;
  prompt: string;
}

export type QueueElementType = MusicElementType;

export type QueueType = QueueElementType[];
