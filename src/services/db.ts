import Dexie, { type Table } from 'dexie';

export interface ModelRecord {
  id: string;
  name: string;
  format: 'gguf' | 'tflite' | 'onnx' | 'mlc' | 'webllm';
  version: string;
  sizeBytes: number;
  sha256: string;
  status: 'available' | 'downloading' | 'ready' | 'failed';
  progress?: number;
  localPath?: string;
  estimatedVramBytes?: number;
  architecture?: string;
  contextWindow?: number;
  description?: string;
  modelUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessageAt: number;
  createdAt: number;
}

class GalaxyDB extends Dexie {
  models!: Table<ModelRecord, string>;
  messages!: Table<ChatMessage, string>;
  sessions!: Table<ChatSession, string>;

  constructor() {
    super('GalaxyLLMStudio');
    this.version(1).stores({
      models: 'id, format, status, updatedAt',
      messages: 'id, chatId, timestamp',
      sessions: 'id, lastMessageAt'
    });
  }
}

export const db = new GalaxyDB();
