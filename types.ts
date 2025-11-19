export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface DesignStyle {
  id: string;
  name: string;
  promptFragment: string;
  imagePlaceholder: string;
}

export interface ImageState {
  original: string | null; // Base64 string
  generated: string | null; // Base64 string
  mimeType: string;
}

export enum AppMode {
  UPLOAD = 'UPLOAD',
  DESIGN = 'DESIGN'
}