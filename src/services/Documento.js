import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const documentoClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

documentoClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Evita setar Content-Type em GET
    if (config.method.toLowerCase() === 'get') {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta para tratamento global de erros
documentoClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Token inválido ou expirado
          localStorage.removeItem('authToken');
          delete documentoClient.defaults.headers.common['Authorization'];
          
          // Redireciona para login se não estiver já na página de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          console.error('Acesso negado:', response.data?.message || 'Sem permissão para acessar este recurso');
          break;
          
        case 404:
          console.error('Recurso não encontrado:', response.data?.message || 'Endpoint não encontrado');
          break;
          
        case 422:
          console.error('Dados inválidos:', response.data?.message || 'Verifique os dados enviados');
          break;
          
        case 500:
          console.error('Erro interno do servidor:', response.data?.message || 'Tente novamente mais tarde');
          break;
          
        default:
          console.error(`Erro ${response.status}:`, response.data?.message || 'Erro desconhecido');
      }
    } else if (error.request) {
      // Erro de rede
      console.error('Erro de conexão:', 'Verifique sua conexão com a internet');
    } else {
      console.error('Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const documentoService = {
  async buscarDocumentos(codigoEntidade, pagina = 1, itensPorPagina = 5) {
    try {
      const response = await documentoClient.get('/Documento', {
        params: {
          CodigoEntidade: codigoEntidade,
          Pagina: pagina,
          ItensPorPagina: itensPorPagina
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      throw error;
    }
  },

  async downloadDocumento(codigoDocumento) {
    try {
      const response = await documentoClient.get(`/Documento/${codigoDocumento}/download`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Erro ao fazer download do documento:', error);
      throw error;
    }
  },

  async uploadDocumento(codigoEntidade, arquivo) {
    try {
      const formData = new FormData();
      formData.append('File', arquivo);
      formData.append('CodigoEntidade', codigoEntidade);

      const response = await documentoClient.post('/Agendamento/Documento', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      throw error;
    }
  }
};
