import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { usuarioService } from '../../services/Usuario';

// Mock do serviço de usuário
jest.mock('../../services/Usuario', () => ({
  usuarioService: {
    register: jest.fn()
  }
}));

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const RegisterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usuarioService.register.mockClear();
  });

  test('renders register form correctly', () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    expect(screen.getByLabelText(/nome \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endereço de e-mail/i)).toBeInTheDocument();
    // Pode haver múltiplos campos de senha, verificar que pelo menos um existe
    const senhaLabels = screen.getAllByLabelText(/senha \*/i);
    expect(senhaLabels.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
    expect(screen.getByText(/já tem uma conta/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/nome do parceiro é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
      // Pode haver múltiplas mensagens de senha (senha e confirmação), verificar que pelo menos uma existe
      const senhaMessages = screen.queryAllByText(/senha é obrigatória/i);
      expect(senhaMessages.length).toBeGreaterThan(0);
    });
  });

  test('shows validation error for invalid email format', async () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome \*/i);
    const partnerNameInput = screen.getByLabelText(/nome do parceiro \*/i);
    const emailInput = screen.getByLabelText(/endereço de e-mail/i);
    const passwordInputs = screen.getAllByLabelText(/senha \*/i);
    const passwordInput = passwordInputs[0]; // Primeiro campo de senha
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(partnerNameInput, { target: { value: 'Parceiro Test' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for short password', async () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome \*/i);
    const partnerNameInput = screen.getByLabelText(/nome do parceiro \*/i);
    const emailInput = screen.getByLabelText(/endereço de e-mail/i);
    const passwordInputs = screen.getAllByLabelText(/senha \*/i);
    const passwordInput = passwordInputs[0]; // Primeiro campo de senha
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(partnerNameInput, { target: { value: 'Parceiro Test' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Pode haver múltiplas mensagens de senha, então vamos verificar apenas que pelo menos uma existe
      const senhaMessages = screen.queryAllByText(/senha deve ter pelo menos 6 caracteres/i);
      expect(senhaMessages.length).toBeGreaterThan(0);
    });
  });

  test('successful registration redirects to login', async () => {
    usuarioService.register.mockResolvedValue({ message: 'User created' });

    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome \*/i);
    const emailInput = screen.getByLabelText(/endereço de e-mail/i);
    const passwordInputs = screen.getAllByLabelText(/senha \*/i);
    const passwordInput = passwordInputs[0]; // Primeiro campo de senha
    const partnerNameInput = screen.getByLabelText(/nome do parceiro \*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha \*/i);
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(partnerNameInput, { target: { value: 'Parceiro Test' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usuarioService.register).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });

  test('failed registration shows error message', async () => {
    usuarioService.register.mockRejectedValue(new Error('Registration failed'));

    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome \*/i);
    const partnerNameInput = screen.getByLabelText(/nome do parceiro \*/i);
    const emailInput = screen.getByLabelText(/endereço de e-mail/i);
    const passwordInputs = screen.getAllByLabelText(/senha \*/i);
    const passwordInput = passwordInputs[0]; // Primeiro campo de senha
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha \*/i);
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(partnerNameInput, { target: { value: 'Parceiro Test' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // O erro pode estar no título ou na mensagem do Alert
      const errorTitle = screen.queryByText(/erro no cadastro/i);
      const errorMessage = screen.queryByText(/ocorreu um erro/i);
      const alertContainer = document.querySelector('.alert-container');
      
      expect(errorTitle || errorMessage || alertContainer).toBeTruthy();
    }, { timeout: 3000 });
  });

  test('toggles password visibility', () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const passwordInputs = screen.getAllByLabelText(/senha \*/i);
    const passwordInput = passwordInputs[0]; // Primeiro campo de senha
    const toggleButton = screen.getByLabelText(/mostrar senha/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('navigates to login when clicking "Já tem uma conta? Entrar"', () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const loginButton = screen.getByText(/já tem uma conta\? entrar/i);
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows loading state during registration', async () => {
    usuarioService.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome \*/i);
    const emailInput = screen.getByLabelText(/endereço de e-mail/i);
    const passwordInputs = screen.getAllByLabelText(/senha \*/i);
    const passwordInput = passwordInputs[0]; // Primeiro campo de senha
    const partnerNameInput = screen.getByLabelText(/nome do parceiro \*/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha \*/i);
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(partnerNameInput, { target: { value: 'Parceiro Test' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/cadastrando/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});