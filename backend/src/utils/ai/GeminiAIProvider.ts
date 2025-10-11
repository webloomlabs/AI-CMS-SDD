import { AIProvider, GenerateOptions } from './AIProvider';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string = 'gemini-pro';
  private readonly baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async generateText(prompt: string, options: GenerateOptions): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const enhancedPrompt = this.buildPrompt(prompt, options.mode);
    
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: enhancedPrompt
        }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 1024,
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as GeminiResponse;
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  private buildPrompt(basePrompt: string, mode: string): string {
    switch (mode) {
      case 'draft':
        return `You are a professional content writer. Generate a well-structured article draft based on the following request:

${basePrompt}

Provide a complete article with:
- Engaging introduction
- Well-organized main content with sections
- Clear conclusion
- Professional tone

Keep it concise and informative (300-500 words).`;

      case 'seo':
        return `You are an SEO specialist. Generate SEO metadata for the following content:

${basePrompt}

Provide the response in this exact format:
SEO Title (60 characters max) | Meta Description (155 characters max) | Keywords (comma-separated, 5-10 keywords)

Example: Best TypeScript Practices 2024 | Learn essential TypeScript best practices for modern development | typescript, best practices, javascript, programming, development`;

      case 'alt_text':
        return `You are an accessibility specialist. Generate descriptive alt text for an image based on this information:

${basePrompt}

Provide a concise, descriptive alt text (125 characters max) that would help visually impaired users understand the image content.`;

      default:
        return basePrompt;
    }
  }
}
