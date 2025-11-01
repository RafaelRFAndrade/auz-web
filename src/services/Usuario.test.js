jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(() => ({ eject: jest.fn() })),
        eject: jest.fn()
      },
      response: {
        use: jest.fn(() => ({ eject: jest.fn() })),
        eject: jest.fn()
      }
    },
    defaults: {
      headers: { common: {} }
    }
  };
  
  global.__mockAxiosInstance__ = instance;
  
  return {
    create: jest.fn(() => instance),
    default: { create: jest.fn(() => instance) }
  };
});

// Mock window.location
delete window.location;
window.location = { pathname: '/test', href: '/test' };

import axios from 'axios';
import { usuarioService } from './Usuario';

const mockInstance = global.__mockAxiosInstance__ || axios.create();

describe('Usuario Service', () => {
  const mockToken = 'mock-token';
  const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.mock';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    delete mockInstance.defaults.headers.common['Authorization'];
  });

  describe('login', () => {
    test('should login successfully and store token', async () => {
      const email = 'test@example.com';
      const senha = 'password123';
      const mockResponse = { data: { token: mockToken } };

      mockInstance.post.mockResolvedValue(mockResponse);

      const result = await usuarioService.login(email, senha);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('authToken')).toBe(mockToken);
    });

    test('should throw error on failed login', async () => {
      const email = 'test@example.com';
      const senha = 'wrongpassword';
      const mockError = new Error('Invalid credentials');

      mockInstance.post.mockRejectedValue(mockError);

      await expect(usuarioService.login(email, senha)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    test('should remove token from localStorage', () => {
      localStorage.setItem('authToken', mockToken);

      usuarioService.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('register', () => {
    test('should register successfully', async () => {
      const nome = 'John Doe';
      const email = 'john@example.com';
      const senha = 'password123';
      const nomeParceiro = 'Partner Name';
      const tipoPermissao = 0;
      const mockResponse = { data: { success: true } };

      mockInstance.post.mockResolvedValue(mockResponse);

      await expect(usuarioService.register(nome, email, senha, nomeParceiro, tipoPermissao)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('isAuthenticated', () => {
    test('should return false when no token', () => {
      localStorage.clear();
      expect(usuarioService.isAuthenticated()).toBe(false);
    });

    test('should return true when valid token exists', () => {
      localStorage.setItem('authToken', mockJWT);
      expect(usuarioService.isAuthenticated()).toBe(true);
    });

    test('should return false when token is expired', () => {
      // Token with exp in the past
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImV4cCI6MTAwMDAwMDAwMH0.mock';
      localStorage.setItem('authToken', expiredToken);

      expect(usuarioService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('getUserId', () => {
    test('should return user id from token', () => {
      localStorage.setItem('authToken', mockJWT);
      expect(usuarioService.getUserId()).toBe(1);
    });

    test('should return null when no token', () => {
      localStorage.clear();
      expect(usuarioService.getUserId()).toBeNull();
    });
  });

  describe('getTokenInfo', () => {
    test('should return token info', () => {
      localStorage.setItem('authToken', mockJWT);

      const tokenInfo = usuarioService.getTokenInfo();
      expect(tokenInfo).toBeTruthy();
      expect(tokenInfo.userId).toBe(1);
      expect(tokenInfo.email).toBe('test@example.com');
    });

    test('should return null when no token', () => {
      localStorage.clear();
      expect(usuarioService.getTokenInfo()).toBeNull();
    });
  });

  describe('obterUsuariosPorParceiro', () => {
    test('should fetch users by partner with pagination', async () => {
      const pagina = 1;
      const itens = 25;
      const filtro = 'test';
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(usuarioService.obterUsuariosPorParceiro(pagina, itens, filtro)).resolves.toEqual(mockResponse.data);
    });

    test('should use default parameters', async () => {
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(usuarioService.obterUsuariosPorParceiro()).resolves.toEqual(mockResponse.data);
    });
  });

  describe('cadastrarUsuarioPorParceiro', () => {
    test('should create user by partner successfully', async () => {
      const nome = 'John Doe';
      const email = 'john@example.com';
      const senha = 'password123';
      const tipoPermissao = 0;
      const mockResponse = { data: { success: true } };

      mockInstance.post.mockResolvedValue(mockResponse);

      await expect(usuarioService.cadastrarUsuarioPorParceiro(nome, email, senha, tipoPermissao)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('atualizarUsuario', () => {
    test('should update user successfully', async () => {
      const codigo = 1;
      const situacao = true;
      const nome = 'John Updated';
      const email = 'john@example.com';
      const senha = 'newpassword';
      const tipoPermissao = 1;
      const mockResponse = { data: { success: true } };

      mockInstance.patch.mockResolvedValue(mockResponse);

      await expect(usuarioService.atualizarUsuario(codigo, situacao, nome, email, senha, tipoPermissao)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('isTokenExpiringSoon', () => {
    test('should return true when token is expiring soon', () => {
      // Token expiring in 3 minutes (180 seconds)
      const futureTime = Math.floor(Date.now() / 1000) + 180;
      const base64Payload = Buffer.from(JSON.stringify({ userId: 1, exp: futureTime })).toString('base64');
      const expiringToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.mock`;
      localStorage.setItem('authToken', expiringToken);

      expect(usuarioService.isTokenExpiringSoon(5)).toBe(true);
    });

    test('should return false when token is not expiring soon', () => {
      localStorage.setItem('authToken', mockJWT);
      expect(usuarioService.isTokenExpiringSoon(5)).toBe(false);
    });
  });
});
