import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 
import epicLogo from '../../logo.png';
import { usuarioService } from '../../services/Usuario';
import Alert from '../../components/custom/Alert'; 

const Register = () => {
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const showAlert = (type, title, message) => {
    setAlert({
      show: true,
      type,
      title,
      message
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({
      ...prev,
      show: false
    }));
  };

  const validateInputs = () => {
    let isValid = true;

    if (!name.trim()) {
      showAlert('warning', 'Aviso', 'Por favor, insira seu nome.');
      isValid = false;
    }

    if (!validateEmail(email)) {
      showAlert('warning', 'Aviso', 'Por favor, insira um email válido.');
      isValid = false;
    }

    if (password.length < 6) {
      showAlert('warning', 'Aviso', 'A senha deve ter pelo menos 6 caracteres.');
      isValid = false;
    }

    if (password !== confirmPassword) {
      showAlert('error', 'Erro', 'Senha incorreta');
      isValid = false;
    }

    return isValid;
  };

  // Validação de formulário
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!partnerName.trim()) {
      newErrors.partnerName = 'Nome do parceiro é obrigatório';
    } else if (partnerName.trim().length < 2) {
      newErrors.partnerName = 'Nome do parceiro deve ter pelo menos 2 caracteres';
    }
    
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await usuarioService.register(name, email, password, partnerName);
      console.log('Resposta da API:', response);
      
      // Se chegou até aqui sem erro, o cadastro foi bem-sucedido
      setAlert({
        show: true,
        type: 'success',
        title: 'Conta criada com sucesso!',
        message: 'Redirecionando para o login...'
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Erro no registro:', error);
      
      let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
      
      if (error.response && error.response.data) {
        if (error.response.data.mensagem) {
          errorMessage = error.response.data.mensagem;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setAlert({
        show: true,
        type: 'error',
        title: 'Erro no cadastro',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <>
      {alert.show && (
        <Alert
          show={alert.show}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={closeAlert}
          duration={7000}
        />
      )}
      <main className="login-container" role="main">
        <div className="logo-container">
          <img src={epicLogo} alt="Logo do Sistema Médico" className="logo" />
        </div>
        
        <h1>Criar Nova Conta</h1>
        
        {registerError && (
          <div className="error-message login-error" role="alert">
            {registerError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="name">Nome *</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              required
              autoComplete="name"
              minLength={2}
            />
            {errors.name && (
              <div id="name-error" className="error-message" role="alert">
                {errors.name}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="partnerName">Nome do Parceiro *</label>
            <input 
              type="text" 
              id="partnerName" 
              value={partnerName}
              onChange={(e) => {
                setPartnerName(e.target.value);
                if (errors.partnerName) {
                  setErrors(prev => ({ ...prev, partnerName: '' }));
                }
              }}
              aria-invalid={errors.partnerName ? 'true' : 'false'}
              aria-describedby={errors.partnerName ? 'partner-name-error' : undefined}
              required
              autoComplete="organization"
              minLength={2}
            />
            {errors.partnerName && (
              <div id="partner-name-error" className="error-message" role="alert">
                {errors.partnerName}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Endereço de E-mail *</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
              required
              autoComplete="email"
            />
            {errors.email && (
              <div id="email-error" className="error-message" role="alert">
                {errors.email}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Senha *</label>
            <div className="password-input">
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error password-help' : 'password-help'}
                required
                autoComplete="new-password"
                minLength={6}
              />
              <button 
                type="button" 
                className="eye-button" 
                onClick={toggleShowPassword}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            <div id="password-help" className="sr-only">
              A senha deve ter pelo menos 6 caracteres
            </div>
            {errors.password && (
              <div id="password-error" className="error-message" role="alert">
                {errors.password}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar Senha *</label>
            <input 
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }
              }}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error confirm-password-help' : 'confirm-password-help'}
              required
              autoComplete="new-password"
            />
            <div id="confirm-password-help" className="sr-only">
              Digite a mesma senha para confirmação
            </div>
            {errors.confirmPassword && (
              <div id="confirm-password-error" className="error-message" role="alert">
                {errors.confirmPassword}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
            aria-describedby="register-status"
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
          <div id="register-status" className="sr-only" aria-live="polite">
            {isLoading ? 'Processando cadastro...' : ''}
          </div>
        </form>
        
        <div className="create-account">
          <button 
            type="button"
            className="create-account-link"
            onClick={handleLogin}
            aria-label="Ir para página de login"
          >
            Já tem uma conta? Entrar
          </button>
        </div>
      </main>
    </>
  );
};

export default Register;