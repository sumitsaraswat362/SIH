import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { ai, DEFAULT_MODEL } from './vertex-client';

const client = new DocumentProcessorServiceClient();
const PROJECT_ID = 'project-a9c284f8-6bca-440a-a0c';
const LOCATION = 'us';

let cachedProcessorName: string | null = null;

export async function processDocument(fileBuffer: Buffer, mimeType: string): Promise<{text: string, entities: Array<{type: string, value: string, confidence: number}>}> {
  try {
    if (!cachedProcessorName) {
      const parent = `projects/${PROJECT_ID}/locations/${LOCATION}`;
      const [processors] = await client.listProcessors({ parent });
      
      let processor = processors.find(p => p.type === 'OCR_PROCESSOR');
      
      if (!processor) {
        const [operation] = await client.createProcessor({
          parent,
          processor: {
            displayName: 'RealDocumentProcessor',
            type: 'OCR_PROCESSOR',
          }
        });
        const [response] = await (operation as any).promise ? await (operation as any).promise() : [operation];
        processor = response;
      }
      
      if (!processor || !processor.name) {
         throw new Error("Failed to find or create processor");
      }
      
      cachedProcessorName = processor.name;
    }

    const request = {
      name: cachedProcessorName,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    const text = document?.text || '';
    const entities = (document?.entities || []).map(e => ({
      type: e.type || 'UNKNOWN',
      value: e.mentionText || '',
      confidence: e.confidence || 0,
    }));

    return { text, entities };
  } catch (error) {
    console.error("Document AI failed, falling back to Gemini Vision:", error);
    
    const result = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            data: fileBuffer.toString('base64'),
                            mimeType: mimeType
                        }
                    },
                    {
                        text: "Extract all text from this document and identify key entities (like names, dates, amounts)."
                    }
                ]
            }
        ]
    });
    
    return {
        text: result.text || '',
        entities: []
    };
  }
}
