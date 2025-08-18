import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import usuarioService from '../../services/Usuario';

// Mock do serviço de usuário
jest.mock('../../services/Usuario');

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

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
    expect(screen.getByText(/já tem uma conta/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email format', async () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for short password', async () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });
  });

  test('successful registration redirects to login', async () => {
    usuarioService.register.mockResolvedValue({ data: { message: 'User created' } });

    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(usuarioService.register).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'test@example.com',
        senha: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('failed registration shows error message', async () => {
    usuarioService.register.mockRejectedValue(new Error('Registration failed'));

    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/erro ao criar conta/i)).toBeInTheDocument();
    });
  });

  test('toggles password visibility', () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const passwordInput = screen.getByLabelText(/senha/i);
    const toggleButton = screen.getByLabelText(/mostrar senha/i);

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  test('navigates to login when clicking "Já tem uma conta? Entrar"', () => {
    render(
      <RegisterWrapper>
        <Register />
      </RegisterWrapper>
    );

    const loginButton = screen.getByRole('button', { name: /já tem uma conta\? entrar/i });
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

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /criar conta/i });

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/criando conta/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});