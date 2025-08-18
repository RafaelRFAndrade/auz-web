import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading Component', () => {
  test('renders with default props', () => {
    render(<Loading />);
    
    const loadingContainer = screen.getByTestId('loading-container');
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveClass('loading-container');
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading-spinner', 'medium');
  });

  test('renders with custom text', () => {
    const customText = 'Carregando dados...';
    render(<Loading text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  test('renders with different sizes', () => {
    const { rerender } = render(<Loading size="small" />);
    let spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('small');

    rerender(<Loading size="large" />);
    spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('large');
  });

  test('renders with custom color', () => {
    render(<Loading color="#ff0000" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveStyle('border-top-color: #ff0000');
  });

  test('renders with overlay', () => {
    render(<Loading overlay={true} />);
    
    const overlay = screen.getByTestId('loading-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('loading-overlay');
  });

  test('renders dots variant', () => {
    render(<Loading variant="dots" />);
    
    const dotsContainer = screen.getByTestId('loading-dots');
    expect(dotsContainer).toBeInTheDocument();
    expect(dotsContainer).toHaveClass('loading-dots');
    
    const dots = screen.getAllByTestId(/loading-dot-/);
    expect(dots).toHaveLength(3);
  });

  test('renders pulse variant', () => {
    render(<Loading variant="pulse" />);
    
    const pulse = screen.getByTestId('loading-pulse');
    expect(pulse).toBeInTheDocument();
    expect(pulse).toHaveClass('loading-pulse');
  });

  test('applies custom color to dots variant', () => {
    render(<Loading variant="dots" color="#00ff00" />);
    
    const dots = screen.getAllByTestId(/loading-dot-/);
    dots.forEach(dot => {
      expect(dot).toHaveStyle('background-color: #00ff00');
    });
  });

  test('applies custom color to pulse variant', () => {
    render(<Loading variant="pulse" color="#0000ff" />);
    
    const pulse = screen.getByTestId('loading-pulse');
    expect(pulse).toHaveStyle('background-color: #0000ff');
  });

  test('renders with all props combined', () => {
    render(
      <Loading 
        text="Processando..." 
        size="large" 
        color="#purple" 
        overlay={true} 
        variant="dots" 
      />
    );
    
    expect(screen.getByText('Processando...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('loading-dots')).toHaveClass('large');
    
    const dots = screen.getAllByTestId(/loading-dot-/);
    dots.forEach(dot => {
      expect(dot).toHaveStyle('background-color: #purple');
    });
  });

  test('has proper accessibility attributes', () => {
    render(<Loading text="Carregando..." />);
    
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveAttribute('role', 'status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-label', 'Carregando...');
  });

  test('spinner has proper accessibility attributes', () => {
    render(<Loading />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute('role', 'progressbar');
    expect(spinner).toHaveAttribute('aria-label', 'Carregando');
  });

  test('dots variant has proper accessibility attributes', () => {
    render(<Loading variant="dots" text="Aguarde..." />);
    
    const dotsContainer = screen.getByTestId('loading-dots');
    expect(dotsContainer).toHaveAttribute('role', 'progressbar');
    expect(dotsContainer).toHaveAttribute('aria-label', 'Aguarde...');
  });

  test('pulse variant has proper accessibility attributes', () => {
    render(<Loading variant="pulse" text="Processando..." />);
    
    const pulse = screen.getByTestId('loading-pulse');
    expect(pulse).toHaveAttribute('role', 'progressbar');
    expect(pulse).toHaveAttribute('aria-label', 'Processando...');
  });
});