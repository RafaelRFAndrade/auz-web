jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
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

import axios from 'axios';
import { operacionalService } from './Operacional';

const mockInstance = global.__mockAxiosInstance__ || axios.create();

describe('Operacional Service', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', mockToken);
  });

  describe('obterRelacionamentos', () => {
    test('should fetch relationships with pagination', async () => {
      const pagina = 1;
      const itensPorPagina = 10;
      const mockResponse = { data: { items: [{ codigo: 1 }], total: 1 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(operacionalService.obterRelacionamentos(pagina, itensPorPagina)).resolves.toEqual(mockResponse.data);
    });

    test('should use default pagination values', async () => {
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(operacionalService.obterRelacionamentos()).resolves.toEqual(mockResponse.data);
    });
  });

  describe('obterAgendamentosOperacionais', () => {
    test('should fetch operational appointments', async () => {
      const codigoMedicoUsuarioOperacional = 1;
      const pagina = 1;
      const itensPorPagina = 5;
      const mockResponse = { data: { items: [{ codigo: 1 }], total: 1 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(
        operacionalService.obterAgendamentosOperacionais(codigoMedicoUsuarioOperacional, pagina, itensPorPagina)
      ).resolves.toEqual(mockResponse.data);
    });

    test('should use default pagination values', async () => {
      const codigoMedicoUsuarioOperacional = 1;
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(operacionalService.obterAgendamentosOperacionais(codigoMedicoUsuarioOperacional)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('obterPacientesOperacionais', () => {
    test('should fetch operational patients', async () => {
      const codigoMedicoUsuarioOperacional = 1;
      const pagina = 1;
      const itensPorPagina = 10;
      const mockResponse = { data: { items: [{ codigo: 1 }], total: 1 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(
        operacionalService.obterPacientesOperacionais(codigoMedicoUsuarioOperacional, pagina, itensPorPagina)
      ).resolves.toEqual(mockResponse.data);
    });

    test('should use default pagination values', async () => {
      const codigoMedicoUsuarioOperacional = 1;
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(operacionalService.obterPacientesOperacionais(codigoMedicoUsuarioOperacional)).resolves.toEqual(mockResponse.data);
    });

    test('should throw error on failed request', async () => {
      const codigoMedicoUsuarioOperacional = 1;
      const mockError = new Error('Network error');

      mockInstance.get.mockRejectedValue(mockError);

      await expect(operacionalService.obterPacientesOperacionais(codigoMedicoUsuarioOperacional)).rejects.toThrow('Network error');
    });
  });
});
