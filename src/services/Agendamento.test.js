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

import axios from 'axios';
import { agendamentoService } from './Agendamento';

const mockInstance = global.__mockAxiosInstance__ || axios.create();

describe('Agendamento Service', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', mockToken);
  });

  describe('createAgendamento', () => {
    test('should create agendamento successfully', async () => {
      const agendamentoData = {
        codigoAtendimento: 1,
        dataAgendamento: '2024-01-01',
        horaAgendamento: '10:00'
      };
      const mockResponse = { data: { codigo: 1, ...agendamentoData } };

      mockInstance.post.mockResolvedValue(mockResponse);

      await expect(agendamentoService.createAgendamento(agendamentoData)).resolves.toEqual(mockResponse.data);
    });

    test('should throw error on failed creation', async () => {
      const agendamentoData = { codigoAtendimento: 1 };
      const mockError = new Error('Network error');

      mockInstance.post.mockRejectedValue(mockError);

      await expect(agendamentoService.createAgendamento(agendamentoData)).rejects.toThrow('Network error');
    });
  });

  describe('getAllAgendamentos', () => {
    test('should fetch all agendamentos successfully', async () => {
      const mockResponse = { data: [{ codigo: 1 }, { codigo: 2 }] };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(agendamentoService.getAllAgendamentos()).resolves.toEqual(mockResponse.data);
    });
  });

  describe('getAgendamentosByMonth', () => {
    test('should fetch agendamentos by month and year', async () => {
      const mes = 1;
      const ano = 2024;
      const mockResponse = { data: [{ codigo: 1 }] };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(agendamentoService.getAgendamentosByMonth(mes, ano)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('getDetalhes', () => {
    test('should fetch agendamento details by codigo', async () => {
      const codigoAgendamento = 1;
      const mockResponse = { data: { codigo: 1, detalhes: 'test' } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(agendamentoService.getDetalhes(codigoAgendamento)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('atualizar', () => {
    test('should update agendamento successfully', async () => {
      const dadosAgendamento = { codigo: 1, dataAgendamento: '2024-01-02' };
      const mockResponse = { data: { success: true } };

      mockInstance.patch.mockResolvedValue(mockResponse);

      await expect(agendamentoService.atualizar(dadosAgendamento)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('getHome', () => {
    test('should fetch home agendamentos with pagination', async () => {
      const pagina = 1;
      const itensPorPagina = 5;
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(agendamentoService.getHome(pagina, itensPorPagina)).resolves.toEqual(mockResponse.data);
    });

    test('should use default pagination values', async () => {
      const mockResponse = { data: { items: [] } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(agendamentoService.getHome()).resolves.toEqual(mockResponse.data);
    });
  });
});
