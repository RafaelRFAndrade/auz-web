import React, { useEffect } from 'react';
import './Alert.css';

/**
 * isso é aq é maximo q teras de documentação >_<
 * @param {Object} props - Propriedades do componente
 * @param {string} props.type - Tipo do alerta ('error', 'success', 'warning', 'info')
 * @param {string} props.title - Título do alerta
 * @param {string} props.message - Mensagem do alerta
 * @param {boolean} props.show - Estado que controla a visibilidade do alerta
 * @param {function} props.onClose - Função para fechar o alerta
 * @param {number} props.duration - Duração em milissegundos até o alerta fechar automaticamente (0 para não fechar)
 */
const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  show, 
  onClose, 
  duration = 7000 
}) => {
  // Fecha o alerta automaticamente após o tempo definido
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  // Definindo ícones baseados no tipo do alerta
  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2">
            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        );
      case 'success':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#388e3c" strokeWidth="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0288d1" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="8"></line>
          </svg>
        );
    }
  };

  return (
    <div className="alert-container">
      <div className={`alert alert-${type}`}>
        <div className="alert-icon">
          {getIcon()}
        </div>
        <div className="alert-content">
          {title && <h4>{title}</h4>}
          <p>{message}</p>
        </div>
        <button className="alert-close" onClick={onClose}>
          &times;
        </button>
      </div>
      {duration > 0 && (
        <div className="alert-progress">
          <div 
            className={`alert-progress-track alert-progress-${type}`} 
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

export default Alert;