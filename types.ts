import { FunctionCall, Part } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Part[];
  functionCalls?: FunctionCall[];
  files?: { name: string }[];
}

export interface UploadedFile {
  name: string;
  mimeType: string;
  data: string; // base64 encoded data
}
