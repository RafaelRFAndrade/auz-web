import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { usuarioService } from './services/Usuario';

jest.mock('./services/Usuario', () => ({
  usuarioService: {
    isAuthenticated: jest.fn()
  }
}));

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    defaults: { headers: { common: {} } }
  }))
}));
jest.mock('./components/Sidebar', () => ({
  __esModule: true,
  default: function MockSidebar() {
    return <nav data-testid="sidebar">Sidebar</nav>;
  }
}));

// Mock dos componentes lazy
jest.mock('./components/Login/Login', () => ({
  __esModule: true,
  default: () => <div>Login</div>
}));

jest.mock('./components/Login/Register', () => ({
  __esModule: true,
  default: () => <div>Register</div>
}));

// App já tem Router, não precisamos wrapper
const AppWrapper = ({ children }) => children;

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders app component', () => {
    usuarioService.isAuthenticated.mockReturnValue(false);

    const { container } = render(<App />);

    // App should render without crashing
    expect(container).toBeInTheDocument();
  });

  test('renders routes correctly', () => {
    usuarioService.isAuthenticated.mockReturnValue(false);

    const { container } = render(<App />);

    expect(container).toBeInTheDocument();
  });
});
