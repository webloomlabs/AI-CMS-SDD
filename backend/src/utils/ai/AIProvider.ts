export interface GenerateOptions {
  mode: 'draft' | 'seo' | 'alt_text';
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  /**
   * Check if the provider is properly configured
   * @returns true if the provider has required credentials
   */
  isConfigured(): boolean;

  /**
   * Generate text using the AI provider
   * @param prompt The prompt to send to the AI
   * @param options Generation options including mode
   * @returns Generated text
   */
  generateText(prompt: string, options: GenerateOptions): Promise<string>;
}
