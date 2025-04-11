import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import epicLogo from '../../logo.png'; 
import { usuarioService } from '../../services/Usuario';
import Alert from '../../components/custom/Alert'; 

const ForgotPasswordModal = ({ onClose, isVisible }) => {

  const getWhatsAppLink = () => {
    const phoneNumber = '5547988059867'; 
    const message = `Olá, esqueci minha senha. Poderia me ajudar a recupera-lá?`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  if (!isVisible) return null;

  return (
    <div className="forgot-password-overlay">
      <div className="login-container forgot-password-container">
        <button className="close-button" onClick={onClose}>×</button>
        <h1>Recuperação de Senha</h1>
        <a 
          href={getWhatsAppLink()} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="whatsapp-button"
          style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            margin: "0 auto", 
            width: "100%", 
            maxWidth: "280px" 
          }}
        >
          <div className="whatsapp-icon-wrapper">
            <svg className="whatsapp-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12c0 2.4.7 4.7 2 6.6l-1.3 4.7c-.2.7.5 1.4 1.2 1.2l4.7-1.3c1.9 1.3 4.2 2 6.6 2 6.6 0 12-5.4 12-12S18.6 0 12 0zm6 15.5c-.3.8-1.4 1.5-2.3 1.7-.6.1-1.4.2-4.1-.9-3.5-1.4-5.7-4.7-5.9-5-.2-.2-1.2-1.7-1.2-3.2 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4.8-.4h.7c.2 0 .5 0 .8.6.3.7 1 2.3 1.1 2.4.1.2.1.4 0 .6-.1.2-.2.4-.3.5-.2.1-.3.3-.4.5-.2.2-.4.4-.2.7.2.3.9 1.3 2 2.1 1.4 1 2.5 1.4 2.9 1.5.3.1.7.1.9-.1.2-.2.5-.5.8-.9.2-.3.5-.3.8-.2s2 1 2.4 1.2c.3.2.5.3.6.5.1.3.1.7-.2 1.2z"/>
            </svg>
          </div>
          <span>Contatar via WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const validateInputs = () => {
    let isValid = true;

    if (!validateEmail(email)) {
      showAlert('warning', 'Aviso', 'Por favor, insira um email válido.');
      isValid = false;
    } 

    if (password.length < 6) {
      showAlert('warning', 'Aviso', 'Senha precisa de pelo menos 6 caracteres.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateInputs()) {
      setIsLoading(true);
      
      try {
        await usuarioService.login(email, password);
        console.log('Login successful');
        showAlert('success', 'Sucesso', 'Login efetuado com sucesso!');
        await sleep(2000);

        navigate('/home');
      } catch (error) {
        console.error('Login error:', error);
        showAlert(
          'error',
          'Erro ao logar',
          error.response?.data?.mensagem || 'Ocorreu um erro na requisição.'
        );
        
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
  };

  return (
    <>
      <div className="login-container">
        <div className="logo-container">
          <img src={epicLogo} alt="ERP Logo" className="logo" />
        </div>
        
        <h1>Login</h1>
                
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Endereço de E-mail</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <div className="password-input">
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="eye-button" 
                onClick={toggleShowPassword}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg className="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            <a href="#" className="forgot-password" onClick={handleForgotPassword}>
              Esqueceu sua senha?
            </a>
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={!email || !password || isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="create-account">
          <a href="#" onClick={handleCreateAccount}>Criar Conta</a>
        </div>
      </div>

      <ForgotPasswordModal 
        isVisible={showForgotPassword}
        onClose={closeForgotPassword}
      />

      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
        duration={7000} // 7 segundos
      />
    </>
  );
};

export default Login;