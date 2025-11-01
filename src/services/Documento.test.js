jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
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
import { documentoService } from './Documento';

const mockInstance = global.__mockAxiosInstance__ || axios.create();

describe('Documento Service', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', mockToken);
  });

  describe('buscarDocumentos', () => {
    test('should fetch documents with pagination', async () => {
      const codigoEntidade = 1;
      const pagina = 1;
      const itensPorPagina = 5;
      const mockResponse = { data: { items: [{ codigo: 1 }], total: 1 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(documentoService.buscarDocumentos(codigoEntidade, pagina, itensPorPagina)).resolves.toEqual(mockResponse.data);
    });

    test('should use default pagination values', async () => {
      const codigoEntidade = 1;
      const mockResponse = { data: { items: [], total: 0 } };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(documentoService.buscarDocumentos(codigoEntidade)).resolves.toEqual(mockResponse.data);
    });
  });

  describe('downloadDocumento', () => {
    test('should download documento successfully', async () => {
      const codigoDocumento = 1;
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      const mockResponse = { data: mockBlob };

      mockInstance.get.mockResolvedValue(mockResponse);

      await expect(documentoService.downloadDocumento(codigoDocumento)).resolves.toEqual(mockResponse);
    });

    test('should throw error on failed download', async () => {
      const codigoDocumento = 1;
      const mockError = new Error('Download failed');

      mockInstance.get.mockRejectedValue(mockError);

      await expect(documentoService.downloadDocumento(codigoDocumento)).rejects.toThrow('Download failed');
    });
  });

  describe('uploadDocumento', () => {
    test('should upload documento successfully', async () => {
      const codigoEntidade = 1;
      const arquivo = new File(['content'], 'documento.pdf', { type: 'application/pdf' });
      const mockResponse = { data: { codigo: 1, nome: 'documento.pdf' } };

      mockInstance.post.mockResolvedValue(mockResponse);

      await expect(documentoService.uploadDocumento(codigoEntidade, arquivo)).resolves.toEqual(mockResponse.data);
    });

    test('should throw error on failed upload', async () => {
      const codigoEntidade = 1;
      const arquivo = new File(['content'], 'documento.pdf', { type: 'application/pdf' });
      const mockError = new Error('Upload failed');

      mockInstance.post.mockRejectedValue(mockError);

      await expect(documentoService.uploadDocumento(codigoEntidade, arquivo)).rejects.toThrow('Upload failed');
    });
  });
});
