type Path = string;

export type TMusicVariant = "unconditioned" | "textToMusic" | "musicToMusic" | "musicContinuation";

export interface TMusicElement {
  type: 'music';
  variant: TMusicVariant;
  audio_length: number;
  audio_path: Path;
  prompt: string;
}

export type TQueueElement = TMusicElement;

export type TQueue = TQueueElement[];
