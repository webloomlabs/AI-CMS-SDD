import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIGenerateModal from '../components/AIGenerateModal';
import aiService from '../services/ai';

// Mock the AI service
jest.mock('../services/ai');

describe('AIGenerateModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(
      <AIGenerateModal
        isOpen={true}
        mode="draft"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );

    expect(screen.getByText(/Generate Content Draft/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AIGenerateModal
        isOpen={false}
        mode="draft"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <AIGenerateModal
        isOpen={true}
        mode="draft"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );

    const closeButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows different titles for different modes', () => {
    const { rerender } = render(
      <AIGenerateModal
        isOpen={true}
        mode="draft"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );
    expect(screen.getByText(/Generate Content Draft/i)).toBeInTheDocument();

    rerender(
      <AIGenerateModal
        isOpen={true}
        mode="seo"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );
    expect(screen.getByText(/Generate SEO Metadata/i)).toBeInTheDocument();

    rerender(
      <AIGenerateModal
        isOpen={true}
        mode="alt_text"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );
    expect(screen.getByText(/Generate Alt Text/i)).toBeInTheDocument();
  });

  it('generates draft content successfully', async () => {
    const mockGenerateDraft = jest.spyOn(aiService, 'generateDraft').mockResolvedValue('Generated draft content');

    render(
      <AIGenerateModal
        isOpen={true}
        mode="draft"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );

    // Enter topic
    const topicInput = screen.getByPlaceholderText(/Enter the topic/i);
    fireEvent.change(topicInput, { target: { value: 'AI-powered CMS' } });

    // Click generate
    const generateButton = screen.getByText(/✨ Generate/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateDraft).toHaveBeenCalledWith('AI-powered CMS', '');
    });

    // Check if result is displayed
    await waitFor(() => {
      expect(screen.getByText('Generated draft content')).toBeInTheDocument();
    });
  });

  it('generates SEO metadata successfully', async () => {
    const mockGenerateSEO = jest.spyOn(aiService, 'generateSEO').mockResolvedValue({
      title: 'SEO Title',
      description: 'SEO Description',
      keywords: 'seo, keywords, test',
    });

    render(
      <AIGenerateModal
        isOpen={true}
        mode="seo"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
        currentContent="Sample content to optimize"
      />
    );

    // Click generate (content is pre-filled from currentContent prop)
    const generateButton = screen.getByText(/✨ Generate/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateSEO).toHaveBeenCalledWith('Sample content to optimize', '');
    });

    // Check if SEO result is displayed
    await waitFor(() => {
      expect(screen.getByText('SEO Title')).toBeInTheDocument();
      expect(screen.getByText('SEO Description')).toBeInTheDocument();
      expect(screen.getByText('seo, keywords, test')).toBeInTheDocument();
    });
  });

  it('handles generation error gracefully', async () => {
    const mockGenerateDraft = jest.spyOn(aiService, 'generateDraft').mockRejectedValue({
      response: { data: { message: 'API error' } },
    });

    render(
      <AIGenerateModal
        isOpen={true}
        mode="draft"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );

    // Enter topic
    const topicInput = screen.getByPlaceholderText(/Enter the topic/i);
    fireEvent.change(topicInput, { target: { value: 'Test topic' } });

    // Click generate
    const generateButton = screen.getByText(/✨ Generate/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it('calls onGenerate with result when "Use This Content" is clicked', async () => {
    const mockGenerateDraft = jest.spyOn(aiService, 'generateDraft').mockResolvedValue('Generated content');

    render(
      <AIGenerateModal
        isOpen={true}
        mode="draft"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );

    // Generate content
    const topicInput = screen.getByPlaceholderText(/Enter the topic/i);
    fireEvent.change(topicInput, { target: { value: 'Test' } });
    
    const generateButton = screen.getByText(/✨ Generate/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated content')).toBeInTheDocument();
    });

    // Click "Use This Content"
    const useButton = screen.getByText(/Use This Content/i);
    fireEvent.click(useButton);

    expect(mockOnGenerate).toHaveBeenCalledWith('Generated content');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows regeneration with "Try Again" button', async () => {
    const mockGenerateDraft = jest.spyOn(aiService, 'generateDraft').mockResolvedValue('Generated content');

    render(
      <AIGenerateModal
        isOpen={true}
        mode="draft"
        onClose={mockOnClose}
        onGenerate={mockOnGenerate}
      />
    );

    // Generate content
    const topicInput = screen.getByPlaceholderText(/Enter the topic/i);
    fireEvent.change(topicInput, { target: { value: 'Test' } });
    
    const generateButton = screen.getByText(/✨ Generate/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated content')).toBeInTheDocument();
    });

    // Click "Try Again"
    const tryAgainButton = screen.getByText(/Try Again/i);
    fireEvent.click(tryAgainButton);

    // Should show form again
    expect(screen.getByPlaceholderText(/Enter the topic/i)).toBeInTheDocument();
    expect(screen.queryByText('Generated content')).not.toBeInTheDocument();
  });
});
