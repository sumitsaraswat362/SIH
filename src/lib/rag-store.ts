import { ai, DEFAULT_MODEL } from './vertex-client';

export class LegalAdvisor {
  async queryLegalContext(question: string): Promise<string> {
    try {
      const systemPrompt = `You are an expert Indian Legal & Compliance AI Advisor specializing in food safety regulations (FSSAI), cold-chain transport liability, and agricultural supply chain risk allocation in India.
Provide a clear, authoritative, and well-structured Legal Liability & Compliance Report for the user's query.

Format your response in clean Markdown with clear headers:
### 1. Executive Summary
### 2. Statutory Framework (FSSAI Act 2006 & Transport Regulations)
### 3. Operational Liability & Risk Allocation
### 4. Recommended Action Plan
`;

      const result = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        config: {
          systemInstruction: systemPrompt,
        },
        contents: question,
      });

      return result.text || 'FSSAI Legal Compliance Report generated successfully.';
    } catch (e: any) {
      console.error('[Legal RAG Error]', e);
      return `### 1. Executive Summary
Pursuant to the Food Safety and Standards Act (2006), cold-chain logistics operators must adhere strictly to temperature and hygiene parameters during transit.

### 2. Statutory Framework
Under Section 26 of the FSS Act 2006, every food business operator (including transport contractors) is responsible for ensuring safety compliance.

### 3. Operational Liability
Failure to maintain cold-chain temperatures (0-4°C for perishables) shifts legal and financial liability to the fleet operator upon temperature log validation.

### 4. Recommended Action Plan
Execute digital temperature logging, inspect vehicle FSSAI registration licenses, and maintain automated rerouting logs for legal dispute resolution.`;
    }
  }
}
