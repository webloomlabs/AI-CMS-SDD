import { AIService } from '../../src/services/ai';
import { AIProvider } from '../../src/utils/ai/AIProvider';

// Mock AI provider
const mockProvider: AIProvider = {
  generateText: jest.fn(),
  isConfigured: jest.fn(),
};

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService(mockProvider);
    jest.clearAllMocks();
  });

  describe('generateDraft', () => {
    it('should generate draft content with AI provider', async () => {
      (mockProvider.isConfigured as jest.Mock).mockReturnValue(true);
      (mockProvider.generateText as jest.Mock).mockResolvedValue(
        'AI-generated draft content about technology trends.'
      );

      const result = await aiService.generateDraft(
        'Technology trends',
        'Write an article about latest tech trends'
      );

      expect(mockProvider.generateText).toHaveBeenCalledWith(
        expect.stringContaining('Technology trends'),
        expect.objectContaining({ mode: 'draft' })
      );
      expect(result).toContain('AI-generated draft');
    });

    it('should use stub when provider not configured', async () => {
      (mockProvider.isConfigured as jest.Mock).mockReturnValue(false);

      const result = await aiService.generateDraft(
        'Test topic',
        'Test context'
      );

      expect(result).toContain('[STUB');
      expect(result).toContain('Test topic');
    });
  });

  describe('generateSEO', () => {
    it('should generate SEO metadata', async () => {
      (mockProvider.isConfigured as jest.Mock).mockReturnValue(true);
      (mockProvider.generateText as jest.Mock).mockResolvedValue(
        'SEO Title | Meta description for SEO | keywords, seo, optimization'
      );

      const result = await aiService.generateSEO('Article title', 'Article content');

      expect(mockProvider.generateText).toHaveBeenCalled();
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('keywords');
    });

    it('should return stub SEO when provider not configured', async () => {
      (mockProvider.isConfigured as jest.Mock).mockReturnValue(false);

      const result = await aiService.generateSEO('Test title', 'Test content');

      expect(result.title).toContain('[STUB');
      expect(result.description).toContain('Test title');
      expect(result.keywords).toContain('test');
    });
  });

  describe('generateAltText', () => {
    it('should generate alt text for image', async () => {
      (mockProvider.isConfigured as jest.Mock).mockReturnValue(true);
      (mockProvider.generateText as jest.Mock).mockResolvedValue(
        'A beautiful sunset over the ocean'
      );

      const result = await aiService.generateAltText('sunset.jpg', 'nature photo');

      expect(mockProvider.generateText).toHaveBeenCalled();
      expect(result).toContain('sunset');
    });

    it('should return stub alt text when provider not configured', async () => {
      (mockProvider.isConfigured as jest.Mock).mockReturnValue(false);

      const result = await aiService.generateAltText('image.jpg', 'context');

      expect(result).toContain('[STUB');
      expect(result).toContain('image.jpg');
    });
  });

  describe('generate', () => {
    it('should route to correct method based on mode', async () => {
      (mockProvider.isConfigured as jest.Mock).mockReturnValue(true);
      (mockProvider.generateText as jest.Mock).mockResolvedValue('AI response');

      await aiService.generate('draft', { topic: 'Test' });
      expect(mockProvider.generateText).toHaveBeenCalled();

      jest.clearAllMocks();

      await aiService.generate('seo', { title: 'Test', content: 'Content' });
      expect(mockProvider.generateText).toHaveBeenCalled();

      jest.clearAllMocks();

      await aiService.generate('alt_text', { filename: 'test.jpg' });
      expect(mockProvider.generateText).toHaveBeenCalled();
    });

    it('should throw error for invalid mode', async () => {
      await expect(
        aiService.generate('invalid' as any, {})
      ).rejects.toThrow('Invalid mode');
    });
  });
});
