import api from './api';

export type AIMode = 'draft' | 'seo' | 'alt_text';

export interface GenerateRequest {
  prompt: string;
  mode: AIMode;
}

export interface GenerateResponse {
  result: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
}

/**
 * AI service for content generation
 */
class AIService {
  /**
   * Generate content using AI
   */
  async generate(request: GenerateRequest): Promise<string> {
    const response = await api.post<GenerateResponse>('/ai/generate', request);
    return response.data.result;
  }

  /**
   * Generate content draft
   */
  async generateDraft(topic: string, context?: string): Promise<string> {
    const prompt = context 
      ? `Topic: ${topic}\n\nContext: ${context}`
      : `Topic: ${topic}`;
    
    return this.generate({
      prompt,
      mode: 'draft',
    });
  }

  /**
   * Generate SEO metadata
   */
  async generateSEO(content: string, targetKeywords?: string): Promise<SEOMetadata> {
    const prompt = targetKeywords
      ? `Content: ${content}\n\nTarget Keywords: ${targetKeywords}`
      : `Content: ${content}`;
    
    const result = await this.generate({
      prompt,
      mode: 'seo',
    });

    // Parse the SEO result (expected format: "Title: ...\nDescription: ...\nKeywords: ...")
    const lines = result.split('\n').filter(line => line.trim());
    const seo: SEOMetadata = {
      title: '',
      description: '',
      keywords: '',
    };

    lines.forEach(line => {
      if (line.toLowerCase().startsWith('title:')) {
        seo.title = line.substring(line.indexOf(':') + 1).trim();
      } else if (line.toLowerCase().startsWith('description:')) {
        seo.description = line.substring(line.indexOf(':') + 1).trim();
      } else if (line.toLowerCase().startsWith('keywords:')) {
        seo.keywords = line.substring(line.indexOf(':') + 1).trim();
      }
    });

    return seo;
  }

  /**
   * Generate alt text for an image
   */
  async generateAltText(context: string, fileName?: string): Promise<string> {
    const prompt = fileName
      ? `Image file: ${fileName}\n\nContext: ${context}`
      : `Context: ${context}`;
    
    return this.generate({
      prompt,
      mode: 'alt_text',
    });
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;
