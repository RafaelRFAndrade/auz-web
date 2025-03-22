import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; 
import epicLogo from '../../logo.svg';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validateInputs = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Por favor, insira seu nome.');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um email válido.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem.');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateInputs()) {
      setIsLoading(true);
      setRegisterError('');
      
      try {
        const response = await axios.post('http://localhost:8080/Usuario', {
          nome: name,
          email: email,
          senha: password,
          tipoPermissao: 0 
        });
        
        if (response.status === 200 || response.status === 201) {
          console.log('Registration successful');
          navigate('/login');
        } else {
          setRegisterError('Ocorreu um erro no cadastro. Tente novamente.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        if (error.response) {
          setRegisterError(`Erro: ${error.response.data || 'Ocorreu um erro no servidor.'}`);
        } else if (error.request) {
          setRegisterError('Servidor não respondeu. Verifique sua conexão.');
        } else {
          setRegisterError('Erro ao processar o cadastro. Tente novamente.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const handlePrivacyPolicy = (e) => {
    e.preventDefault();
    console.log('Redirecionando para política de privacidade...');
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={epicLogo} alt="ERP Logo" className="logo" />
      </div>
      
      <h1>Criar Conta</h1>
      
      {registerError && <div className="error-message login-error">{registerError}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Nome</label>
          <input 
            type="text" 
            id="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && <div className="error-message">{nameError}</div>}
        </div>
        
        <div className="input-group">
          <label htmlFor="email">Endereço de E-mail</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <div className="error-message">{emailError}</div>}
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
          {passwordError && <div className="error-message">{passwordError}</div>}
        </div>
        
        <div className="input-group">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input 
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
        </div>
        
        <button 
          type="submit" 
          className="login-button"
          disabled={!name || !email || !password || !confirmPassword || isLoading}
        >
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      
      <div className="create-account">
        <a href="#" onClick={handleLogin}>Já tem uma conta? Entrar</a>
      </div>
      
      <div className="privacy-policy">
        <a href="#" onClick={handlePrivacyPolicy}>Política de Privacidade</a>
      </div>
    </div>
  );
};

export default Register;