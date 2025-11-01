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
  
  // Store globally so tests can access
  global.__mockAxiosInstance__ = instance;
  
  return {
    create: jest.fn(() => instance),
    default: { create: jest.fn(() => instance) }
  };
});

import axios from 'axios';
import { pacienteService } from './Paciente';

// Access the mock instance
const mockInstance = global.__mockAxiosInstance__ || axios.create();

describe('Paciente Service', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', mockToken);
  });

  describe('createPaciente', () => {
    test('should create paciente successfully', async () => {
      const pacienteData = {
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '11999999999',
        documentoFederal: '12345678900'
      };
      const mockResponse = { data: { codigo: 1, ...pacienteData } };

      mockInstance.post.mockResolvedValue(mockResponse);

      await expect(pacienteService.createPaciente(pacienteData)).resolves.toEqual(mockResponse.data);
      expect(mockInstance.post).toHaveBeenCalledWith('/Paciente', {
        nome: pacienteData.nome,
        email: pacienteData.email,
        telefone: pacienteData.telefone,
        documentoFederal: pacienteData.documentoFederal
      });
    });

    test('should throw error on failed creation', async () => {
      const pacienteData = { nome: 'João' };
      const mockError = new Error('Validation error');

      mockInstance.post.mockRejectedValue(mockError);

      await expect(pacienteService.createPaciente(pacienteData)).rejects.toThrow('Validation error');
    });
  });

  describe('getAllPacientes', () => {
    test('should fetch all pacientes with filters', async () => {
      const filtro = 'João';
      const pagina = 0;
      const itensPorPagina = 100;
      const mockResponse = { data: { items: [{ nome: 'João Silva' }], total: 1 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(pacienteService.getAllPacientes(filtro, pagina, itensPorPagina)).resolves.toEqual(mockResponse.data);
      expect(mockInstance.get).toHaveBeenCalledWith('/Paciente/Listar', {
        params: {
          filtro: filtro,
          pagina: pagina,
          itensPorPagina: itensPorPagina
        }
      });
    });

    test('should use default parameters', async () => {
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(pacienteService.getAllPacientes()).resolves.toEqual(mockResponse.data);
    });
  });

  describe('getPacienteById', () => {
    test('should fetch paciente by id', async () => {
      const codigoPaciente = 1;
      const mockResponse = { data: { codigo: 1, nome: 'João Silva' } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(pacienteService.getPacienteById(codigoPaciente)).resolves.toEqual(mockResponse.data);
      expect(mockInstance.get).toHaveBeenCalledWith(`/Paciente/${codigoPaciente}`);
    });
  });

  describe('updatePaciente', () => {
    test('should update paciente successfully', async () => {
      const pacienteData = {
        codigoPaciente: 1,
        nome: 'João Silva Updated',
        email: 'joao@example.com',
        telefone: '11999999999',
        documentoFederal: '12345678900'
      };

      mockInstance.put.mockResolvedValue({ data: {} });

      await pacienteService.updatePaciente(pacienteData);
      
      expect(mockInstance.put).toHaveBeenCalledWith('/Paciente', {
        codigoPaciente: pacienteData.codigoPaciente,
        nome: pacienteData.nome,
        email: pacienteData.email,
        telefone: pacienteData.telefone,
        documentoFederal: pacienteData.documentoFederal
      });
    });
  });

  describe('updatePacienteDetalhado', () => {
    test('should update paciente with detailed data', async () => {
      const pacienteData = {
        codigo: 1,
        nome: 'João Silva',
        estadoCivil: 'S',
        altura: '1.75',
        peso: '70.5',
        dataNascimento: '1990-01-01'
      };
      const mockResponse = { data: { success: true } };

      mockInstance.put.mockResolvedValue(mockResponse);

      await expect(pacienteService.updatePacienteDetalhado(pacienteData)).resolves.toEqual(mockResponse.data);
    });

    test('should map estado civil correctly', async () => {
      const pacienteData = {
        codigo: 1,
        nome: 'João Silva',
        estadoCivil: 'C'
      };
      const mockResponse = { data: { success: true } };

      mockInstance.put.mockResolvedValue(mockResponse);

      await pacienteService.updatePacienteDetalhado(pacienteData);

      expect(mockInstance.put).toHaveBeenCalledWith(
        '/Paciente/Detalhado',
        expect.objectContaining({
          estadoCivil: 1 // Casado
        })
      );
    });
  });

  describe('getPacienteByCpf', () => {
    test('should fetch paciente by CPF', async () => {
      const cpf = '12345678900';
      const mockResponse = { data: { codigo: 1, documentoFederal: cpf } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(pacienteService.getPacienteByCpf(cpf)).resolves.toEqual(mockResponse.data);
      expect(mockInstance.get).toHaveBeenCalledWith(`/Paciente/BuscarPorCpf/${cpf}`);
    });
  });

  describe('buscarDocumentosPaciente', () => {
    test('should fetch patient documents', async () => {
      const documento = '12345678900';
      const mockResponse = { data: [{ codigo: 1, nome: 'documento.pdf' }] };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(pacienteService.buscarDocumentosPaciente(documento)).resolves.toEqual(mockResponse.data);
      expect(mockInstance.get).toHaveBeenCalledWith(`/Paciente/BuscarDocumentos/${documento}`);
    });
  });
});
