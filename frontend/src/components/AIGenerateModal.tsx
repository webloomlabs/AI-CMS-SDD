import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import aiService, { AIMode, SEOMetadata } from '../services/ai';

interface AIGenerateModalProps {
  isOpen: boolean;
  mode: AIMode;
  onClose: () => void;
  onGenerate: (result: string | SEOMetadata) => void;
  currentContent?: string;
}

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({
  isOpen,
  mode,
  onClose,
  onGenerate,
  currentContent = '',
}) => {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<string | SEOMetadata | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setContext(currentContent);
      setResult(null);
      setError('');
    }
  }, [isOpen, currentContent]);

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (mode) {
      case 'draft':
        return '✨ Generate Content Draft';
      case 'seo':
        return '🎯 Generate SEO Metadata';
      case 'alt_text':
        return '🖼️ Generate Alt Text';
      default:
        return 'Generate with AI';
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'draft':
        return 'Enter the topic for your content...';
      case 'seo':
        return 'Enter target keywords (optional)...';
      case 'alt_text':
        return 'Describe the image context...';
      default:
        return 'Enter your prompt...';
    }
  };

  const getContextLabel = () => {
    switch (mode) {
      case 'draft':
        return 'Additional Context (optional)';
      case 'seo':
        return 'Content to Optimize';
      case 'alt_text':
        return 'Image Context';
      default:
        return 'Context';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && mode !== 'seo') {
      setError('Please enter a prompt');
      return;
    }

    if (mode === 'seo' && !context.trim()) {
      setError('Please provide content to optimize');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let generatedResult: string | SEOMetadata;

      switch (mode) {
        case 'draft':
          generatedResult = await aiService.generateDraft(prompt, context || undefined);
          break;
        case 'seo':
          generatedResult = await aiService.generateSEO(context, prompt || undefined);
          break;
        case 'alt_text':
          generatedResult = await aiService.generateAltText(context, prompt || undefined);
          break;
        default:
          generatedResult = await aiService.generate({ prompt, mode });
      }

      setResult(generatedResult);
    } catch (err: any) {
      console.error('AI generation failed:', err);
      setError(err.response?.data?.message || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseResult = () => {
    if (result) {
      onGenerate(result);
      onClose();
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (typeof result === 'string') {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Generated Content
          </label>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
              {result}
            </pre>
          </div>
        </div>
      );
    } else {
      // SEO metadata
      return (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Generated SEO Metadata
          </label>
          <div className="space-y-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Title</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{result.title}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{result.description}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Keywords</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{result.keywords}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getModalTitle()}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Use AI to {mode === 'draft' ? 'create content' : mode === 'seo' ? 'optimize SEO' : 'generate alt text'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Input Fields */}
          {!result && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {mode === 'draft' ? 'Topic' : mode === 'seo' ? 'Target Keywords' : 'Prompt'}
                  {mode !== 'seo' && ' *'}
                </label>
                <Input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={getPlaceholder()}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {getContextLabel()}
                  {mode === 'seo' && ' *'}
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={6}
                  disabled={loading}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={mode === 'seo' ? 'Paste your content here...' : 'Add any additional context...'}
                />
              </div>
            </>
          )}

          {/* Generated Result */}
          {renderResult()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            {!result ? (
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  '✨ Generate'
                )}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResult(null)}
                >
                  Try Again
                </Button>
                <Button
                  type="button"
                  onClick={handleUseResult}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  Use This Content
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGenerateModal;
