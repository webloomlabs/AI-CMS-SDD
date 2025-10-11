import { AIProvider } from '../utils/ai/AIProvider';
import { StubAIProvider } from '../utils/ai/StubAIProvider';
import { GeminiAIProvider } from '../utils/ai/GeminiAIProvider';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
}

export class AIService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || AIService.createDefaultProvider();
  }

  static createDefaultProvider(): AIProvider {
    const aiProvider = process.env.AI_PROVIDER || 'gemini';
    
    switch (aiProvider.toLowerCase()) {
      case 'gemini':
        const geminiKey = process.env.GEMINI_API_KEY || '';
        const geminiProvider = new GeminiAIProvider(geminiKey);
        
        // Fall back to stub if not configured
        if (!geminiProvider.isConfigured()) {
          console.warn('GEMINI_API_KEY not set, using stub provider');
          return new StubAIProvider();
        }
        return geminiProvider;
      
      case 'stub':
        return new StubAIProvider();
      
      default:
        console.warn(`Unknown AI_PROVIDER: ${aiProvider}, using stub`);
        return new StubAIProvider();
    }
  }

  async generateDraft(topic: string, context?: string): Promise<string> {
    // Fall back to stub if provider not configured
    if (!this.provider.isConfigured()) {
      const stubProvider = new StubAIProvider();
      const prompt = context 
        ? `Topic: ${topic}\n\nContext: ${context}`
        : `Topic: ${topic}`;
      return stubProvider.generateText(prompt, { mode: 'draft' });
    }

    const prompt = context 
      ? `Topic: ${topic}\n\nContext: ${context}`
      : `Topic: ${topic}`;
    
    return this.provider.generateText(prompt, { mode: 'draft' });
  }

  async generateSEO(title: string, content: string): Promise<SEOMetadata> {
    // Fall back to stub if provider not configured
    if (!this.provider.isConfigured()) {
      const stubProvider = new StubAIProvider();
      const prompt = `Title: ${title}\n\nContent: ${content}`;
      const response = await stubProvider.generateText(prompt, { mode: 'seo' });
      
      // Parse stub response
      const parts = response.split('|').map(p => p.trim());
      
      if (parts.length >= 3) {
        return {
          title: parts[0],
          description: parts[1],
          keywords: parts[2],
        };
      }
      
      return {
        title: response.substring(0, 60),
        description: response.substring(0, 155),
        keywords: this.extractKeywords(content),
      };
    }

    const prompt = `Title: ${title}\n\nContent: ${content}`;
    
    const response = await this.provider.generateText(prompt, { mode: 'seo' });
    
    // Parse the response format: Title | Description | Keywords
    const parts = response.split('|').map(p => p.trim());
    
    if (parts.length >= 3) {
      return {
        title: parts[0],
        description: parts[1],
        keywords: parts[2],
      };
    }
    
    // Fallback parsing if format doesn't match
    return {
      title: title,
      description: response.substring(0, 155),
      keywords: this.extractKeywords(content),
    };
  }

  async generateAltText(filename: string, context?: string): Promise<string> {
    // Fall back to stub if provider not configured
    if (!this.provider.isConfigured()) {
      const stubProvider = new StubAIProvider();
      const prompt = context
        ? `Image filename: ${filename}\n\nContext: ${context}`
        : `Image filename: ${filename}`;
      return stubProvider.generateText(prompt, { mode: 'alt_text' });
    }

    const prompt = context
      ? `Image filename: ${filename}\n\nContext: ${context}`
      : `Image filename: ${filename}`;
    
    return this.provider.generateText(prompt, { mode: 'alt_text' });
  }

  async generate(mode: 'draft' | 'seo' | 'alt_text', params: any): Promise<any> {
    switch (mode) {
      case 'draft':
        return this.generateDraft(params.topic || params.prompt, params.context);
      
      case 'seo':
        return this.generateSEO(params.title, params.content || params.context);
      
      case 'alt_text':
        return this.generateAltText(params.filename, params.context);
      
      default:
        throw new Error(`Invalid mode: ${mode}`);
    }
  }

  private extractKeywords(content: string): string {
    // Simple keyword extraction: most common words
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4);
    
    const frequency = new Map<string, number>();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });
    
    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    return sorted.join(', ');
  }
}
