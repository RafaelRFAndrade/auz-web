import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Alert from './Alert';

describe('Alert Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders alert when show is true', () => {
    render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('does not render when show is false', () => {
    const { container } = render(
      <Alert
        show={false}
        type="info"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders with different types', () => {
    const { rerender } = render(
      <Alert
        show={true}
        type="error"
        message="Error message"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    const alertElement = screen.getByText('Error message').closest('.alert');
    expect(alertElement).toHaveClass('alert-error');

    rerender(
      <Alert
        show={true}
        type="success"
        message="Success message"
        onClose={mockOnClose}
      />
    );
    const successAlert = screen.getByText('Success message').closest('.alert');
    expect(successAlert).toHaveClass('alert-success');

    rerender(
      <Alert
        show={true}
        type="warning"
        message="Warning message"
        onClose={mockOnClose}
      />
    );
    const warningAlert = screen.getByText('Warning message').closest('.alert');
    expect(warningAlert).toHaveClass('alert-warning');
  });

  test('renders with title', () => {
    render(
      <Alert
        show={true}
        type="info"
        title="Alert Title"
        message="Alert message"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('closes automatically after duration', async () => {
    render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={1000}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test('does not close automatically when duration is 0', () => {
    render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={0}
      />
    );

    jest.advanceTimersByTime(10000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('does not close automatically when duration is negative', () => {
    render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={-1000}
      />
    );

    jest.advanceTimersByTime(10000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('renders progress bar when duration > 0', () => {
    const { container } = render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={5000}
      />
    );

    const progressTrack = container.querySelector('.alert-progress-track');
    expect(progressTrack).toBeInTheDocument();
    expect(progressTrack).toHaveClass('alert-progress-info');
    expect(progressTrack).toHaveStyle({ animationDuration: '5000ms' });
  });

  test('does not render progress bar when duration is 0', () => {
    const { container } = render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={0}
      />
    );

    const progressTrack = container.querySelector('.alert-progress-track');
    expect(progressTrack).not.toBeInTheDocument();
  });

  test('clears timer when component unmounts', () => {
    const { unmount } = render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={1000}
      />
    );

    unmount();

    jest.advanceTimersByTime(1000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('resets timer when show prop changes', () => {
    const { rerender } = render(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={1000}
      />
    );

    jest.advanceTimersByTime(500);

    rerender(
      <Alert
        show={false}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={1000}
      />
    );

    rerender(
      <Alert
        show={true}
        type="info"
        message="Test message"
        onClose={mockOnClose}
        duration={1000}
      />
    );

    jest.advanceTimersByTime(500);

    expect(mockOnClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('renders correct icon for error type', () => {
    const { container } = render(
      <Alert
        show={true}
        type="error"
        message="Error message"
        onClose={mockOnClose}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('stroke', '#d32f2f');
  });

  test('renders correct icon for success type', () => {
    const { container } = render(
      <Alert
        show={true}
        type="success"
        message="Success message"
        onClose={mockOnClose}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('stroke', '#388e3c');
  });

  test('renders correct icon for warning type', () => {
    const { container } = render(
      <Alert
        show={true}
        type="warning"
        message="Warning message"
        onClose={mockOnClose}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('stroke', '#f57c00');
  });

  test('renders correct icon for info type', () => {
    const { container } = render(
      <Alert
        show={true}
        type="info"
        message="Info message"
        onClose={mockOnClose}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg.querySelector('circle')).toBeInTheDocument();
  });

  test('renders default info type when type is not provided', () => {
    render(
      <Alert
        show={true}
        message="Default message"
        onClose={mockOnClose}
      />
    );

    const alertElement = screen.getByText('Default message').closest('.alert');
    expect(alertElement).toHaveClass('alert-info');
  });
});
