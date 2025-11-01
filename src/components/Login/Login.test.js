import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { usuarioService } from '../../services/Usuario';

// Mock do serviço de usuário
jest.mock('../../services/Usuario', () => ({
  usuarioService: {
    login: jest.fn(),
    isAuthenticated: jest.fn(() => false)
  }
}));

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const LoginWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usuarioService.login.mockClear();
    usuarioService.isAuthenticated.mockReturnValue(false);
  });

  test('renders login form correctly', () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    expect(screen.getByLabelText(/endereço de e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
    expect(screen.getByText(/criar conta/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email format', async () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByLabelText(/endereço de e-mail/i);
    const passwordInput = screen.getByLabelText(/senha \*/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  test('successful login redirects to home', async () => {
    usuarioService.login.mockResolvedValue({ token: 'fake-token' });

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByLabelText(/endereço de e-mail/i);
    const passwordInput = screen.getByLabelText(/senha \*/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usuarioService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    }, { timeout: 3000 });
  });

  test('failed login shows error message', async () => {
    usuarioService.login.mockRejectedValue(new Error('Login failed'));

    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const emailInput = screen.getByLabelText(/endereço de e-mail/i);
    const passwordInput = screen.getByLabelText(/senha \*/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // O erro pode estar no título ou na mensagem do Alert
      const errorTitle = screen.queryByText(/erro ao logar/i);
      const errorMessage = screen.queryByText(/ocorreu um erro/i);
      const alertContainer = document.querySelector('.alert-container');
      
      expect(errorTitle || errorMessage || alertContainer).toBeTruthy();
    }, { timeout: 3000 });
  });

  test('toggles password visibility', () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const passwordInput = screen.getByLabelText(/senha \*/i);
    const toggleButton = screen.getByLabelText(/mostrar senha/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('opens and closes forgot password modal', () => {
    render(
      <LoginWrapper>
        <Login />
      </LoginWrapper>
    );

    const forgotPasswordLink = screen.getByText(/esqueceu sua senha/i);
    fireEvent.click(forgotPasswordLink);

    expect(screen.getByText(/recuperação de senha/i)).toBeInTheDocument();
    expect(screen.getByText(/entre em contato conosco/i)).toBeInTheDocument();

    const closeButton = screen.getByLabelText(/fechar modal de recuperação de senha/i);
    fireEvent.click(closeButton);

    expect(screen.queryByText(/recuperação de senha/i)).not.toBeInTheDocument();
  });
});