import { StubAIProvider } from '../../src/utils/ai/StubAIProvider';
import { GeminiAIProvider } from '../../src/utils/ai/GeminiAIProvider';

describe('StubAIProvider', () => {
  let provider: StubAIProvider;

  beforeEach(() => {
    provider = new StubAIProvider();
  });

  describe('isConfigured', () => {
    it('should always return true for stub', () => {
      expect(provider.isConfigured()).toBe(true);
    });
  });

  describe('generateText', () => {
    it('should generate deterministic stub response for draft', async () => {
      const result = await provider.generateText(
        'Generate draft about AI',
        { mode: 'draft' }
      );

      expect(result).toContain('[STUB DRAFT]');
      expect(result).toContain('AI');
    });

    it('should generate stub response for SEO', async () => {
      const result = await provider.generateText(
        'Generate SEO for article',
        { mode: 'seo' }
      );

      expect(result).toContain('[STUB SEO]');
    });

    it('should generate stub response for alt text', async () => {
      const result = await provider.generateText(
        'Generate alt text for image.jpg',
        { mode: 'alt_text' }
      );

      expect(result).toContain('[STUB ALT]');
      expect(result).toContain('image.jpg');
    });

    it('should be deterministic for same input', async () => {
      const result1 = await provider.generateText('Test', { mode: 'draft' });
      const result2 = await provider.generateText('Test', { mode: 'draft' });

      expect(result1).toBe(result2);
    });
  });
});

describe('GeminiAIProvider', () => {
  let provider: GeminiAIProvider;
  const mockApiKey = 'test-api-key-123';

  beforeEach(() => {
    provider = new GeminiAIProvider(mockApiKey);
  });

  describe('isConfigured', () => {
    it('should return true when API key is provided', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('should return false when API key is empty', () => {
      const emptyProvider = new GeminiAIProvider('');
      expect(emptyProvider.isConfigured()).toBe(false);
    });

    it('should return false when API key is undefined', () => {
      const undefinedProvider = new GeminiAIProvider(undefined as any);
      expect(undefinedProvider.isConfigured()).toBe(false);
    });
  });

  describe('generateText', () => {
    it('should construct correct API request', async () => {
      // Mock the API call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: 'Generated content from Gemini'
              }]
            }
          }]
        })
      });

      const result = await provider.generateText(
        'Write about AI',
        { mode: 'draft' }
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toBe('Generated content from Gemini');
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(
        provider.generateText('Test prompt', { mode: 'draft' })
      ).rejects.toThrow('Gemini API error');
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        provider.generateText('Test prompt', { mode: 'draft' })
      ).rejects.toThrow('Network error');
    });
  });
});
