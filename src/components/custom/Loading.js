import React from 'react';
import './Loading.css';

/**
 * Componente de Loading reutilizável
 * @param {Object} props - Propriedades do componente
 * @param {string} props.size - Tamanho do spinner ('small', 'medium', 'large')
 * @param {string} props.color - Cor do spinner
 * @param {string} props.text - Texto a ser exibido abaixo do spinner
 * @param {boolean} props.overlay - Se deve mostrar um overlay de fundo
 * @param {string} props.variant - Variante do loading ('spinner', 'dots', 'pulse')
 */
const Loading = ({ 
  size = 'medium', 
  color = '#007bff', 
  text = 'Carregando...', 
  overlay = false,
  variant = 'spinner'
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`loading-dots loading-${size}`} data-testid="loading-dots">
            <div className="dot" style={{ backgroundColor: color }} data-testid="loading-dot-1"></div>
            <div className="dot" style={{ backgroundColor: color }} data-testid="loading-dot-2"></div>
            <div className="dot" style={{ backgroundColor: color }} data-testid="loading-dot-3"></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`loading-pulse loading-${size}`} style={{ backgroundColor: color }} data-testid="loading-pulse">
          </div>
        );
      
      default:
        return (
          <div className={`loading-spinner loading-${size}`} data-testid="loading-spinner">
            <div className="spinner" style={{ borderTopColor: color }}></div>
          </div>
        );
    }
  };

  const content = (
    <div 
      className="loading-container"
      role="status"
      aria-live="polite"
      aria-label={text}
      data-testid="loading-container"
    >
      {renderSpinner()}
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay" data-testid="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;