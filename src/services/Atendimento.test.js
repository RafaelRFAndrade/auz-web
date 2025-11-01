jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
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

import axios from 'axios';
import { atendimentoService } from './Atendimento';

const mockInstance = global.__mockAxiosInstance__ || axios.create();

describe('Atendimento Service', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', mockToken);
  });

  describe('getAtendimentos', () => {
    test('should fetch atendimentos with pagination and filter', async () => {
      const pagina = 1;
      const itensPorPagina = 25;
      const filtro = 'consulta';
      const mockResponse = { data: { items: [{ codigo: 1 }], total: 1 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(atendimentoService.getAtendimentos(pagina, itensPorPagina, filtro)).resolves.toEqual(mockResponse.data);
    });

    test('should use default parameters', async () => {
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(atendimentoService.getAtendimentos()).resolves.toEqual(mockResponse.data);
    });
  });

  describe('createAtendimento', () => {
    test('should create atendimento successfully', async () => {
      const atendimentoData = {
        codigoPaciente: 1,
        codigoMedico: 1,
        dataAtendimento: '2024-01-01'
      };
      const mockResponse = { data: { codigo: 1, ...atendimentoData } };

      mockInstance.post.mockResolvedValue(mockResponse);

      await expect(atendimentoService.createAtendimento(atendimentoData)).resolves.toEqual(mockResponse.data);
    });

    test('should throw error on failed creation', async () => {
      const atendimentoData = { codigoPaciente: 1 };
      const mockError = new Error('Validation error');

      mockInstance.post.mockRejectedValue(mockError);

      await expect(atendimentoService.createAtendimento(atendimentoData)).rejects.toThrow('Validation error');
    });
  });

  describe('getAtendimentoById', () => {
    test('should fetch atendimento by id', async () => {
      const id = 1;
      const mockResponse = { data: { codigo: 1, descricao: 'Consulta' } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(atendimentoService.getAtendimentoById(id)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('getAtendimentoDetails', () => {
    test('should fetch atendimento details with codigo', async () => {
      const codigo = 1;
      const mockResponse = { data: { codigo: 1, agendamentos: [], documentos: [] } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(atendimentoService.getAtendimentoDetails(codigo)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('updateAtendimento', () => {
    test('should update atendimento successfully', async () => {
      const id = 1;
      const atendimentoData = { descricao: 'Consulta atualizada' };
      const mockResponse = { data: { success: true } };

      mockInstance.put.mockResolvedValue(mockResponse);

      await expect(atendimentoService.updateAtendimento(id, atendimentoData)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('deleteAtendimento', () => {
    test('should delete atendimento successfully', async () => {
      const id = 1;
      const mockResponse = { data: { success: true } };

      mockInstance.delete.mockResolvedValue(mockResponse);

      await expect(atendimentoService.deleteAtendimento(id)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('downloadDocumento', () => {
    test('should download documento successfully', async () => {
      const codigoDocumento = 1;
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      const mockResponse = { data: mockBlob };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(atendimentoService.downloadDocumento(codigoDocumento)).resolves.toEqual(mockResponse);
    });
  });
});
