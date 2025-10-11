# Day 4 Implementation Guide: AI Content Generation

**Date**: October 11, 2025  
**Feature**: User Story 4 - AI Content Generation (Priority P4)  
**Goal**: Enable editors to use AI (Gemini by default) to generate content drafts, SEO metadata, or alt text with stub fallback  
**Time Budget**: 6 hours

## Prerequisites ✅

Before starting Day 4, ensure these are complete:

- [x] Phase 1: Setup (T001-T005) - Backend structure, dependencies, TypeScript
- [x] Phase 2: Foundational (T006-T011) - Database schema, auth service, middleware
- [x] Phase 3: User Story 1 (T012-T016) - Authentication working with JWT tokens
- [x] Server running and accessible at http://localhost:3001

**Note**: User Story 4 is independent of User Stories 2 and 3. It only requires authentication.

## Task Overview

| ID | Type | File | Description | Est. Time |
|---|---|---|---|---|
| T036 | Test | `backend/tests/unit/ai.test.ts` | Unit tests for AI service | 0.5h |
| T037 | Test | `backend/tests/unit/aiProviders.test.ts` | Unit tests for AI providers | 0.5h |
| T038 | Test | `backend/tests/integration/ai.test.ts` | Integration tests for AI endpoint | 1h |
| T039 | Interface | `backend/src/utils/ai/AIProvider.ts` | AI provider interface | 0.5h |
| T040 | Implementation | `backend/src/utils/ai/StubAIProvider.ts` | Stub provider for testing | 0.5h |
| T041 | Implementation | `backend/src/utils/ai/GeminiAIProvider.ts` | Gemini AI provider | 1h |
| T042 | Service | `backend/src/services/ai.ts` | AI service with provider factory | 0.5h |
| T043 | Controller | `backend/src/controllers/ai.ts` | AI API endpoints | 0.5h |
| T044 | Routes | `backend/src/index.ts` | Wire AI routes to Express | 0.25h |
| T045 | Config | `backend/.env.sample` | Add AI env vars | 0.25h |

**Total Estimated Time**: 6 hours

---

## Task T036: Unit Tests for AI Service

**Type**: Test (Unit)  
**File**: `backend/tests/unit/ai.test.ts`  
**Status**: [ ] Not Started  
**Dependencies**: None (can start immediately)

### Objective
Create unit tests for the AI service with mocked providers.

### Implementation Details

```typescript
// backend/tests/unit/ai.test.ts
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

      expect(result).toContain('[STUB]');
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

      expect(result.title).toContain('[STUB SEO]');
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

      expect(result).toContain('[STUB ALT]');
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
```

### Acceptance Criteria
- [ ] All AI service methods tested
- [ ] Stub fallback behavior tested
- [ ] Mode routing tested
- [ ] Error handling tested
- [ ] Tests fail before implementation (RED phase)

### Verification Command
```bash
cd backend && npm test -- unit/ai.test.ts
```

---

## Task T037: Unit Tests for AI Providers

**Type**: Test (Unit)  
**File**: `backend/tests/unit/aiProviders.test.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T036 (can run in parallel)

### Objective
Test AI provider implementations (Stub and Gemini).

### Implementation Details

```typescript
// backend/tests/unit/aiProviders.test.ts
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
      // Note: This test will be mocked or skipped in CI
      // since we don't want to make real API calls in unit tests
      
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
```

### Acceptance Criteria
- [ ] Stub provider tested for all modes
- [ ] Stub provider deterministic behavior verified
- [ ] Gemini provider configuration tested
- [ ] Gemini API integration tested (mocked)
- [ ] Error handling tested
- [ ] Tests fail before implementation (RED phase)

### Verification Command
```bash
cd backend && npm test -- unit/aiProviders.test.ts
```

---

## Task T038: Integration Tests for AI Endpoint

**Type**: Test (Integration)  
**File**: `backend/tests/integration/ai.test.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T036, T037 (can run in parallel)

### Objective
Test AI API endpoint end-to-end with authentication and different modes.

### Implementation Details

```typescript
// backend/tests/integration/ai.test.ts
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('AI API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get JWT token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/ai/generate', () => {
    it('should generate draft content', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft',
          prompt: 'Write an article about TypeScript best practices',
          context: 'TypeScript development guide'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
      expect(typeof res.body.result).toBe('string');
      expect(res.body.result.length).toBeGreaterThan(0);
    });

    it('should generate SEO metadata', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'seo',
          prompt: 'Generate SEO for article about TypeScript',
          context: 'TypeScript is a typed superset of JavaScript'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
      expect(typeof res.body.result).toBe('string');
    });

    it('should generate alt text', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'alt_text',
          prompt: 'Generate alt text for code-screenshot.png',
          context: 'Screenshot of TypeScript code'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
      expect(typeof res.body.result).toBe('string');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .send({
          mode: 'draft',
          prompt: 'Test prompt'
        });

      expect(res.status).toBe(401);
    });

    it('should validate mode parameter', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'invalid_mode',
          prompt: 'Test prompt'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should require prompt parameter', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft'
          // Missing prompt
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should work with stub provider when no API key', async () => {
      // This test assumes AI_PROVIDER=stub or GEMINI_API_KEY not set
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft',
          prompt: 'Test with stub',
          context: 'Testing stub fallback'
        });

      expect(res.status).toBe(200);
      expect(res.body.result).toContain('[STUB');
    });

    it('should handle long prompts', async () => {
      const longPrompt = 'Write about '.repeat(100) + 'AI';
      
      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft',
          prompt: longPrompt
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
    });

    it('should return result within acceptable time', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .post('/api/v1/ai/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mode: 'draft',
          prompt: 'Quick test'
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(res.status).toBe(200);
      // Should respond within 10 seconds (per success criteria)
      expect(duration).toBeLessThan(10000);
    });
  });
});
```

### Acceptance Criteria
- [ ] All three modes tested (draft, seo, alt_text)
- [ ] Authentication tested
- [ ] Input validation tested
- [ ] Stub fallback tested
- [ ] Performance requirement verified (<10s)
- [ ] Tests fail before implementation (RED phase)

### Verification Command
```bash
cd backend && npm test -- integration/ai.test.ts
```

---

## Task T039: AI Provider Interface

**Type**: Interface  
**File**: `backend/src/utils/ai/AIProvider.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T036-T038 (tests must fail first)

### Objective
Create an AI provider interface to support multiple AI backends (Gemini, OpenAI, Anthropic, Stub).

### Implementation Details

```typescript
// backend/src/utils/ai/AIProvider.ts
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
```

### Acceptance Criteria
- [ ] Interface defines all required methods
- [ ] TypeScript types properly defined
- [ ] Documentation comments included
- [ ] Support for different generation modes

### Verification Command
```bash
cd backend && npm run build
```

---

## Task T040: Stub AI Provider Implementation

**Type**: Implementation  
**File**: `backend/src/utils/ai/StubAIProvider.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T039 (interface must exist)

### Objective
Implement a deterministic stub provider for testing and offline development.

### Implementation Details

```typescript
// backend/src/utils/ai/StubAIProvider.ts
import { AIProvider, GenerateOptions } from './AIProvider';

export class StubAIProvider implements AIProvider {
  isConfigured(): boolean {
    // Stub is always configured
    return true;
  }

  async generateText(prompt: string, options: GenerateOptions): Promise<string> {
    // Deterministic responses for testing
    const mode = options.mode;

    switch (mode) {
      case 'draft':
        return this.generateDraftStub(prompt);
      
      case 'seo':
        return this.generateSEOStub(prompt);
      
      case 'alt_text':
        return this.generateAltTextStub(prompt);
      
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  }

  private generateDraftStub(prompt: string): string {
    // Extract topic from prompt for deterministic response
    const topic = this.extractTopic(prompt);
    
    return `[STUB DRAFT]

This is a stub-generated article about ${topic}.

## Introduction

This content is generated by the stub AI provider for testing purposes. In production, this would be replaced by actual AI-generated content from providers like Google Gemini.

## Main Content

The stub provider generates deterministic responses based on the input prompt. This ensures consistent behavior during testing and development.

## Conclusion

Replace AI_PROVIDER with 'gemini' and set GEMINI_API_KEY to use real AI generation.

---
Word count: ~100 words
Generated by: StubAIProvider`;
  }

  private generateSEOStub(prompt: string): string {
    const topic = this.extractTopic(prompt);
    
    return `[STUB SEO] ${topic} - Comprehensive Guide | Meta description for ${topic} article, generated by stub provider | ${topic}, guide, tutorial, best practices`;
  }

  private generateAltTextStub(prompt: string): string {
    // Extract filename if present
    const filenameMatch = prompt.match(/([a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp))/i);
    const filename = filenameMatch ? filenameMatch[1] : 'image';
    
    return `[STUB ALT] Image file: ${filename}. Stub-generated alt text for accessibility testing.`;
  }

  private extractTopic(prompt: string): string {
    // Simple extraction: look for "about X" or use first few words
    const aboutMatch = prompt.match(/about\s+([^.]+)/i);
    if (aboutMatch) {
      return aboutMatch[1].trim();
    }
    
    // Fallback: use first 3-5 words
    const words = prompt.split(/\s+/).slice(0, 5);
    return words.join(' ');
  }
}
```

### Acceptance Criteria
- [ ] Implements AIProvider interface
- [ ] Deterministic responses for same input
- [ ] All three modes supported
- [ ] Always configured (no API key needed)
- [ ] Unit tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- unit/aiProviders.test.ts
```

---

## Task T041: Gemini AI Provider Implementation

**Type**: Implementation  
**File**: `backend/src/utils/ai/GeminiAIProvider.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T039 (interface must exist)

### Objective
Implement Google Gemini AI provider for real AI generation.

### Implementation Details

```typescript
// backend/src/utils/ai/GeminiAIProvider.ts
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

      const data: GeminiResponse = await response.json();
      
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
```

### Acceptance Criteria
- [ ] Implements AIProvider interface
- [ ] Gemini API integration working
- [ ] API key validation working
- [ ] Prompt enhancement for each mode
- [ ] Error handling for API failures
- [ ] Unit tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- unit/aiProviders.test.ts
```

---

## Task T042: AI Service Implementation

**Type**: Service  
**File**: `backend/src/services/ai.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T039, T040, T041 (providers must exist)

### Objective
Implement AI service with provider factory and mode-specific methods.

### Implementation Details

```typescript
// backend/src/services/ai.ts
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
    const prompt = context 
      ? `Topic: ${topic}\n\nContext: ${context}`
      : `Topic: ${topic}`;
    
    return this.provider.generateText(prompt, { mode: 'draft' });
  }

  async generateSEO(title: string, content: string): Promise<SEOMetadata> {
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
```

### Acceptance Criteria
- [ ] Provider factory working
- [ ] Graceful fallback to stub
- [ ] All three generation modes working
- [ ] SEO metadata parsing working
- [ ] Unit tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- unit/ai.test.ts
```

---

## Task T043: AI Controller Implementation

**Type**: Controller  
**File**: `backend/src/controllers/ai.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T042 (service must exist)

### Objective
Implement Express controller for AI generate endpoint.

### Implementation Details

```typescript
// backend/src/controllers/ai.ts
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AIService } from '../services/ai';

const aiService = new AIService();

// Validation rules
export const generateValidation = [
  body('mode')
    .isIn(['draft', 'seo', 'alt_text'])
    .withMessage('Mode must be one of: draft, seo, alt_text'),
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isString()
    .withMessage('Prompt must be a string'),
  body('context')
    .optional()
    .isString()
    .withMessage('Context must be a string'),
];

// Controllers
export const generate = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { mode, prompt, context } = req.body;

    let result: any;

    switch (mode) {
      case 'draft':
        result = await aiService.generateDraft(prompt, context);
        break;

      case 'seo':
        // For SEO, prompt should be title and context should be content
        result = await aiService.generateSEO(prompt, context || '');
        break;

      case 'alt_text':
        result = await aiService.generateAltText(prompt, context);
        break;

      default:
        res.status(400).json({ error: 'Invalid mode' });
        return;
    }

    // Normalize response format
    res.json({
      result: typeof result === 'string' ? result : JSON.stringify(result),
      mode,
      provider: process.env.AI_PROVIDER || 'gemini'
    });
  } catch (error: any) {
    console.error('AI generate error:', error);
    
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'development'
      ? error.message
      : 'Failed to generate content';
    
    res.status(500).json({ error: message });
  }
};
```

### Acceptance Criteria
- [ ] Generate endpoint implemented
- [ ] Input validation working
- [ ] All three modes supported
- [ ] Error handling with proper status codes
- [ ] Integration tests pass (GREEN phase)

### Verification Command
```bash
cd backend && npm test -- integration/ai.test.ts
```

---

## Task T044: Wire AI Routes to Express

**Type**: Routes  
**File**: `backend/src/index.ts`  
**Status**: [ ] Not Started  
**Dependencies**: T043 (controller must exist)

### Objective
Add AI routes to Express app with authentication.

### Implementation Details

```typescript
// Add to backend/src/index.ts after media routes

import {
  generate,
  generateValidation,
} from './controllers/ai';

// AI routes - require authentication
app.post(
  '/api/v1/ai/generate',
  authenticateToken,
  generateValidation,
  generate
);
```

### Acceptance Criteria
- [ ] AI routes wired to Express
- [ ] Authentication middleware applied
- [ ] Validation middleware applied
- [ ] Route accessible via HTTP

### Verification Command
```bash
cd backend && npm run dev
# Then test with curl or integration tests
```

---

## Task T045: Update Environment Variables

**Type**: Config  
**File**: `backend/.env.sample`  
**Status**: [ ] Not Started  
**Dependencies**: None

### Objective
Add AI-related environment variables to .env.sample and .env.

### Implementation Details

Update `backend/.env.sample`:
```bash
# AI Provider Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

Update `backend/.env` with actual values:
```bash
# AI Provider Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=
```

### Acceptance Criteria
- [ ] Environment variables documented
- [ ] .env.sample updated
- [ ] .env updated with actual values
- [ ] Default to gemini provider

### Verification Command
```bash
cat backend/.env.sample
```

---

## Execution Order

Follow this exact sequence for Day 4:

1. **RED Phase** (Write failing tests):
   - T036: Unit tests for AI service
   - T037: Unit tests for AI providers
   - T038: Integration tests for AI endpoint
   - Run tests → Should FAIL ❌

2. **GREEN Phase** (Make tests pass):
   - T039: Create AI provider interface
   - T040: Implement StubAIProvider
   - T041: Implement GeminiAIProvider
   - T042: Implement AI service
   - T043: Implement AI controller
   - Run tests → Should PASS ✅

3. **Integration Phase**:
   - T044: Wire routes to Express
   - T045: Update .env.sample
   - Test manually with Gemini API

4. **Validation Phase**:
   - Run all tests: `npm test`
   - Test with stub provider
   - Test with Gemini provider (if API key available)
   - Verify graceful fallback

---

## Testing Checklist

After completing all tasks, verify these scenarios:

### Draft Generation
- [ ] Can generate draft with stub provider
- [ ] Can generate draft with Gemini (if configured)
- [ ] Stub response is deterministic
- [ ] Gemini response is relevant to prompt
- [ ] Returns within 10 seconds

### SEO Generation
- [ ] Can generate SEO metadata
- [ ] Response includes title, description, keywords
- [ ] Title under 60 characters
- [ ] Description under 155 characters
- [ ] Keywords are relevant

### Alt Text Generation
- [ ] Can generate alt text for images
- [ ] Alt text is descriptive
- [ ] Alt text under 125 characters
- [ ] References filename when appropriate

### Provider Switching
- [ ] Can use stub provider
- [ ] Can use Gemini provider
- [ ] Graceful fallback when API key missing
- [ ] Error handling for API failures

### Security
- [ ] Cannot generate without authentication
- [ ] API key not exposed in responses
- [ ] Input validation prevents injection

---

## Manual Testing Commands

```bash
# Start the server
cd backend && npm run dev

# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Generate draft
curl -X POST http://localhost:3001/api/v1/ai/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "draft",
    "prompt": "Write an article about TypeScript best practices",
    "context": "For beginner developers"
  }'

# Generate SEO
curl -X POST http://localhost:3001/api/v1/ai/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "seo",
    "prompt": "TypeScript Best Practices",
    "context": "This article covers essential TypeScript patterns and conventions for writing maintainable code."
  }'

# Generate alt text
curl -X POST http://localhost:3001/api/v1/ai/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "alt_text",
    "prompt": "typescript-code-example.png",
    "context": "Screenshot showing TypeScript interface definition"
  }'
```

---

## Success Criteria

Day 4 is complete when:

- [ ] All 10 tasks (T036-T045) marked complete
- [ ] All tests passing (`npm test`)
- [ ] Server runs without errors (`npm run dev`)
- [ ] Can generate draft content
- [ ] Can generate SEO metadata
- [ ] Can generate alt text
- [ ] Stub provider working
- [ ] Gemini provider working (when configured)
- [ ] Graceful fallback to stub
- [ ] Authentication enforced
- [ ] Input validation working
- [ ] Response times under 10 seconds
- [ ] Manual testing successful

---

## Troubleshooting

### Tests Failing
- Ensure mocks are properly configured
- Check provider initialization
- Verify interface implementations match

### Gemini API Errors
- Verify GEMINI_API_KEY is set correctly
- Check API key has proper permissions
- Verify network connectivity
- Check API quota/rate limits

### Stub Fallback Not Working
- Check AI_PROVIDER environment variable
- Verify StubAIProvider implementation
- Check provider factory logic

### TypeScript Errors
- Run `npm run build` to check compilation
- Ensure all types are properly imported
- Check interface implementations

---

## Next Steps

After Day 4 completion, proceed to:
- **Day 5**: Frontend Setup & Login
- **Day 6**: Admin Dashboard UI
- **Day 7**: Deployment & Polish

---

## Gemini API Setup

To use Google Gemini:

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to `.env`:
   ```bash
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_key_here
   ```

Alternative providers can be added by:
1. Implementing the AIProvider interface
2. Adding to the provider factory in AIService
3. Documenting in .env.sample

---

**Estimated Total Time**: 6 hours  
**Complexity**: Medium  
**Dependencies**: Only requires authentication (Day 1)
