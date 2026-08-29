import { GoogleGenAI } from '@google/genai';

delete (process.env as any).GOOGLE_CLOUD_PROJECT;
const project = 'project-a9c284f8-6bca-440a-a0c';
const location = process.env.GCP_LOCATION || 'us-central1';

let _aiInstance: GoogleGenAI | null = null;

export const ai = new Proxy({} as GoogleGenAI, {
  get(target, prop) {
    if (!_aiInstance) {
      if (process.env.GEMINI_API_KEY) {
        _aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      } else {
        _aiInstance = new GoogleGenAI({
          vertexai: true,
          project: project,
          location: location
        });
      }
    }
    return (_aiInstance as any)[prop];
  }
});

export const DEFAULT_MODEL = 'gemini-2.5-flash';
