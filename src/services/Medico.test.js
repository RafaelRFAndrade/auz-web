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

global.fetch = jest.fn();

import axios from 'axios';
import { medicoService } from './Medico';

const mockInstance = global.__mockAxiosInstance__ || axios.create();

describe('Medico Service', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', mockToken);
  });

  describe('createMedico', () => {
    test('should create medico successfully', async () => {
      const medicoData = {
        nome: 'Dr. João',
        crm: '123456',
        email: 'joao@example.com',
        telefone: '11999999999',
        documentoFederal: '12345678900'
      };
      const mockResponse = { data: { codigo: 1, ...medicoData } };

      mockInstance.post.mockResolvedValue(mockResponse);

      await expect(medicoService.createMedico(medicoData)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('getAllMedicos', () => {
    test('should fetch all medicos with pagination', async () => {
      const filtro = 'João';
      const pagina = 1;
      const itensPorPagina = 25;
      const mockResponse = { data: { items: [{ nome: 'Dr. João' }], total: 1 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(medicoService.getAllMedicos(filtro, pagina, itensPorPagina)).resolves.toEqual(mockResponse.data);
    });

    test('should use default parameters', async () => {
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(medicoService.getAllMedicos()).resolves.toEqual(mockResponse.data);
    });
  });

  describe('getMedicoById', () => {
    test('should fetch medico by id', async () => {
      const id = 1;
      const mockResponse = { data: { codigo: 1, nome: 'Dr. João' } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(medicoService.getMedicoById(id)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('updateMedico', () => {
    test('should update medico successfully', async () => {
      const id = 1;
      const medicoData = {
        nome: 'Dr. João Updated',
        crm: '123456',
        email: 'joao@example.com',
        telefone: '11999999999',
        documentoFederal: '12345678900'
      };

      mockInstance.put.mockResolvedValue({ data: {} });

      await medicoService.updateMedico(id, medicoData);
      expect(mockInstance.put).toHaveBeenCalled();
    });
  });

  describe('deleteMedico', () => {
    test('should delete medico successfully', async () => {
      const id = 1;

      mockInstance.delete.mockResolvedValue({ data: {} });

      await medicoService.deleteMedico(id);
      expect(mockInstance.delete).toHaveBeenCalled();
    });
  });

  describe('getMedicoByCpf', () => {
    test('should fetch medico by CPF', async () => {
      const cpf = '12345678900';
      const mockResponse = { data: { codigo: 1, documentoFederal: cpf } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(medicoService.getMedicoByCpf(cpf)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('uploadFotoPerfil', () => {
    test('should upload profile photo successfully', async () => {
      const codigoEntidade = 1;
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
      const mockResponse = { success: true };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      await expect(medicoService.uploadFotoPerfil(codigoEntidade, file)).resolves.toEqual(mockResponse);
    });

    test('should throw error on failed upload', async () => {
      const codigoEntidade = 1;
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request'
      });

      await expect(medicoService.uploadFotoPerfil(codigoEntidade, file)).rejects.toThrow();
    });
  });

  describe('getFotoPerfil', () => {
    test('should fetch profile photo successfully', async () => {
      const codigoOperador = 1;
      const mockBlob = new Blob(['content'], { type: 'image/jpeg' });
      const mockResponse = { data: mockBlob };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(medicoService.getFotoPerfil(codigoOperador)).resolves.toEqual(mockBlob);
    });

    test('should return null on 404', async () => {
      const codigoOperador = 1;
      const mockError = {
        response: { status: 404 }
      };

      mockInstance.get.mockRejectedValue(mockError);

      await expect(medicoService.getFotoPerfil(codigoOperador)).resolves.toBeNull();
    });
  });

  describe('getUsuariosRelacionados', () => {
    test('should fetch related users successfully', async () => {
      const codigoMedico = 1;
      const pagina = 1;
      const itensPorPagina = 4;
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(medicoService.getUsuariosRelacionados(codigoMedico, pagina, itensPorPagina)).resolves.toEqual(mockResponse.data);
    });
  });
});
